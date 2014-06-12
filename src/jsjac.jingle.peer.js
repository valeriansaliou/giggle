/**
 * @fileoverview JSJaC Jingle library - Peer API lib
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/**
 * Peer helpers class
 * @class Peer helpers class
 * @constructor
 * @param {object} parent Parent class.
 */
var JSJaCJinglePeer = ring.create({
  /**
   * Constructor
   */
  constructor: function(parent) {
    this.parent = parent;
  },

  /**
   * Creates a new peer connection
   * @public
   */
  connection_create: function(username, sdp_message_callback) {
    this.parent.get_debug().log('[JSJaCJingle:peer] connection_create', 4);

    try {
      // Log STUN servers in use
      var i;
      var ice_config = this.parent.utils.config_ice();

      if(typeof ice_config.iceServers == 'object') {
        for(i = 0; i < (ice_config.iceServers).length; i++)
          this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > Using ICE server at: ' + ice_config.iceServers[i].url + ' (' + (i + 1) + ').', 2);
      } else {
        this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > No ICE server configured. Network may not work properly.', 0);
      }

      // Create the RTCPeerConnection object
      this.parent.set_peer_connection(
        username,

        new WEBRTC_PEER_CONNECTION(
          ice_config,
          WEBRTC_CONFIGURATION.peer_connection.constraints
        )
      );

      // Event: onicecandidate
      var _this = this;

      this.parent.get_peer_connection(username).onicecandidate = function(e) {
        if(e.candidate) {
          _this.parent.sdp.parse_candidate_store({
            media     : (isNaN(e.candidate.sdpMid) ? e.candidate.sdpMid : _this.parent.utils.media_generate(parseInt(e.candidate.sdpMid, 10))),
            candidate : e.candidate.candidate
          });
        } else {
          // Build or re-build content (local)
          _this.parent.utils.build_content_local();

          // In which action stanza should candidates be sent?
          if((_this.parent.is_initiator() && _this.parent.get_status() == JSJAC_JINGLE_STATUS_INITIATING)  ||
             (_this.parent.is_responder() && _this.parent.get_status() == JSJAC_JINGLE_STATUS_ACCEPTING)) {
            _this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > onicecandidate > Got initial candidates.', 2);

            // Execute what's next (initiate/accept session)
            sdp_message_callback();
          } else {
            _this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > onicecandidate > Got more candidates (on the go).', 2);

            // Send unsent candidates
            var candidates_queue_local = _this.parent.get_candidates_queue_local();

            if(_this.parent.utils.object_length(candidates_queue_local) > 0)
              _this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_TRANSPORT_INFO, candidates: candidates_queue_local });
          }

          // Empty the unsent candidates queue
          _this.parent.set_candidates_queue_local(null);
        }
      };

      // Event: oniceconnectionstatechange
      this.parent.get_peer_connection(username).oniceconnectionstatechange = function(e) {
        _this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > oniceconnectionstatechange', 2);

        // Connection errors?
        switch(this.iceConnectionState) {
          case 'disconnected':
            _this.timeout(username, this.iceConnectionState, {
              timer  : JSJAC_JINGLE_PEER_TIMEOUT_DISCONNECT,
              reason : JSJAC_JINGLE_REASON_CONNECTIVITY_ERROR
            });
            break;

          case 'checking':
            _this.timeout(username, this.iceConnectionState); break;
        }

        _this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > oniceconnectionstatechange > (state: ' + this.iceConnectionState + ').', 2);
      };

      // Event: onaddstream
      this.parent.get_peer_connection(username).onaddstream = function(e) {
        if (!e) return;

        _this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > onaddstream', 2);

        // Attach remote stream to DOM view
        _this.parent.set_remote_stream(username, e.stream);
      };

      // Event: onremovestream
      this.parent.get_peer_connection(username).onremovestream = function(e) {
        _this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > onremovestream', 2);

        // Detach remote stream from DOM view
        _this.parent.set_remote_stream(username, null);
      };

      // Add local stream
      this.parent.get_peer_connection(username).addStream(this.parent.get_local_stream()); 

      // Create offer
      this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > Getting local description...', 2);

      if(this.parent.is_initiator()) {
        // Local description
        this.parent.get_peer_connection(username).createOffer(
          function(sdp_local) {
            this.got_description(username, sdp_local);
          }.bind(this),

          this.fail_description.bind(this),
          WEBRTC_CONFIGURATION.create_offer
        );

        // Then, wait for responder to send back its remote description
      } else {
        // Apply SDP data
        sdp_remote = this.parent.sdp.generate(
          WEBRTC_SDP_TYPE_OFFER,
          this.parent.get_group_remote(username),
          this.parent.get_payloads_remote(username),
          this.parent.get_candidates_queue_remote(username)
        );

        if(this.parent.get_sdp_trace())  this.parent.get_debug().log('[JSJaCJingle:peer] SDP (remote)' + '\n\n' + sdp_remote.description.sdp, 4);

        // Remote description
        this.parent.get_peer_connection(username).setRemoteDescription(
          (new WEBRTC_SESSION_DESCRIPTION(sdp_remote.description)),

          function() {
            // Success (descriptions are compatible)
          },

          function(e) {
            if(_this.parent.get_sdp_trace())  _this.parent.get_debug().log('[JSJaCJingle:peer] SDP (remote:error)' + '\n\n' + (e.message || e.name || 'Unknown error'), 4);

            // Error (descriptions are incompatible)
            _this.parent.terminate(JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS);
          }
        );

        // Local description
        this.parent.get_peer_connection(username).createAnswer(
          function(sdp_local) {
            this.got_description(username, sdp_local);
          }.bind(this),
          
          this.fail_description.bind(this),
          WEBRTC_CONFIGURATION.create_answer
        );

        // ICE candidates
        var c;
        var cur_candidate_obj;

        for(c in sdp_remote.candidates) {
          cur_candidate_obj = sdp_remote.candidates[c];

          this.parent.get_peer_connection(username).addIceCandidate(
            new WEBRTC_ICE_CANDIDATE({
              sdpMLineIndex : cur_candidate_obj.id,
              candidate     : cur_candidate_obj.candidate
            })
          );
        }

        // Empty the unapplied candidates queue
        this.parent.set_candidates_queue_remote(username, null);
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > ' + e, 1);
    }
  },

  /**
   * Requests the user media (audio/video)
   * @public
   */
  get_user_media: function(callback) {
    this.parent.get_debug().log('[JSJaCJingle:peer] get_user_media', 4);

    try {
      this.parent.get_debug().log('[JSJaCJingle:peer] get_user_media > Getting user media...', 2);

      (WEBRTC_GET_MEDIA.bind(navigator))(
        this.parent.utils.generate_constraints(),
        this.got_user_media_success.bind(this, callback),
        this.got_user_media_error.bind(this)
      );
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:peer] get_user_media > ' + e, 1);
    }
  },

  /**
   * Triggers the media obtained success event
   * @public
   */
  got_user_media_success: function(callback, stream) {
    this.parent.get_debug().log('[JSJaCJingle:peer] got_user_media_success', 4);

    try {
      this.parent.get_debug().log('[JSJaCJingle:peer] got_user_media_success > Got user media.', 2);

      this.parent.set_local_stream(stream);

      if(callback && typeof callback == 'function') {
        if((this.parent.get_media() == JSJAC_JINGLE_MEDIA_VIDEO) && this.parent.get_local_view().length) {
          this.parent.get_debug().log('[JSJaCJingle:peer] got_user_media_success > Waiting for local video to be loaded...', 2);

          var _this = this;

          var fn_loaded = function() {
            _this.parent.get_debug().log('[JSJaCJingle:peer] got_user_media_success > Local video loaded.', 2);

            this.removeEventListener('loadeddata', fn_loaded, false);
            callback();
          };

          _this.parent.get_local_view()[0].addEventListener('loadeddata', fn_loaded, false);
        } else {
          callback();
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:peer] got_user_media_success > ' + e, 1);
    }
  },

  /**
   * Triggers the media not obtained error event
   * @public
   */
  got_user_media_error: function(error) {
    this.parent.get_debug().log('[JSJaCJingle:peer] got_user_media_error', 4);

    try {
      (this.parent.get_session_initiate_error())(this);

      // Not needed in case we are the responder (breaks termination)
      if(this.parent.is_initiator()) this.parent.handle_session_initiate_error();

      // Not needed in case we are the initiator (no packet sent, ever)
      if(this.parent.is_responder()) this.parent.terminate(JSJAC_JINGLE_REASON_MEDIA_ERROR);

      this.parent.get_debug().log('[JSJaCJingle:peer] got_user_media_error > Failed (' + (error.PERMISSION_DENIED ? 'permission denied' : 'unknown' ) + ').', 1);
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:peer] got_user_media_error > ' + e, 1);
    }
  },

  /**
   * Triggers the SDP description retrieval success event
   * @public
   */
  got_description: function(username, sdp_local) {
    this.parent.get_debug().log('[JSJaCJingle:peer] got_description', 4);

    try {
      this.parent.get_debug().log('[JSJaCJingle:peer] got_description > Got local description.', 2);

      if(this.parent.get_sdp_trace())  this.parent.get_debug().log('[JSJaCJingle:peer] SDP (local:raw)' + '\n\n' + sdp_local.sdp, 4);

      // Convert SDP raw data to an object
      var cur_name;
      var payload_parsed = this.parent.sdp.parse_payload(sdp_local.sdp);
      this.parent.sdp.resolution_payload(payload_parsed);

      for(cur_name in payload_parsed) {
        this.parent.set_payloads_local(
          cur_name,
          payload_parsed[cur_name]
        );
      }

      var cur_semantics;
      var group_parsed = this.parent.sdp.parse_group(sdp_local.sdp);

      for(cur_semantics in group_parsed) {
        this.parent.set_group_local(
          cur_semantics,
          group_parsed[cur_semantics]
        );
      }

      // Filter our local description (remove unused medias)
      var sdp_local_desc = this.parent.sdp.generate_description(
        sdp_local.type,
        this.parent.get_group_local(),
        this.parent.get_payloads_local(),

        this.parent.sdp.generate_candidates(
          this.parent.get_candidates_local()
        )
      );

      if(this.parent.get_sdp_trace())  this.parent.get_debug().log('[JSJaCJingle:peer] SDP (local:gen)' + '\n\n' + sdp_local_desc.sdp, 4);

      var _this = this;

      this.parent.get_peer_connection(username).setLocalDescription(
        (new WEBRTC_SESSION_DESCRIPTION(sdp_local_desc)),

        function() {
          // Success (descriptions are compatible)
        },

        function(e) {
          if(_this.parent.get_sdp_trace())  _this.parent.get_debug().log('[JSJaCJingle:peer] SDP (local:error)' + '\n\n' + (e.message || e.name || 'Unknown error'), 4);

          // Error (descriptions are incompatible)
        }
      );

      this.parent.get_debug().log('[JSJaCJingle:peer] got_description > Waiting for local candidates...', 2);
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:peer] got_description > ' + e, 1);
    }
  },

  /**
   * Triggers the SDP description not retrieved error event
   * @public
   */
  fail_description: function() {
    this.parent.get_debug().log('[JSJaCJingle:peer] fail_description', 4);

    try {
      this.parent.get_debug().log('[JSJaCJingle:peer] fail_description > Could not get local description!', 1);
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:peer] fail_description > ' + e, 1);
    }
  },

  /**
   * Enables/disables the local stream sound
   * @public
   */
  sound: function(enable) {
    this.parent.get_debug().log('[JSJaCJingle:peer] sound', 4);

    try {
      this.parent.get_debug().log('[JSJaCJingle:peer] sound > Enable: ' + enable + ' (current: ' + this.parent.get_mute(JSJAC_JINGLE_MEDIA_AUDIO) + ').', 2);

      var i;
      var audio_tracks = this.parent.get_local_stream().getAudioTracks();

      for(i = 0; i < audio_tracks.length; i++)
        audio_tracks[i].enabled = enable;
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:peer] sound > ' + e, 1);
    }
  },

  /**
   * Set a timeout limit to peer connection
   * @public
   */
  timeout: function(username, state, args) {
    try {
      // Assert
      if(typeof args !== 'object') args = {};

      var t_sid = this.parent.get_sid();

      var _this = this;

      setTimeout(function() {
        // State did not change?
        if(_this.parent.get_sid() == t_sid && _this.parent.get_peer_connection(_this.parent.get_to()).iceConnectionState == state) {
          _this.parent.get_debug().log('[JSJaCJingle:peer] stanza_timeout > Peer timeout.', 2);

          // Error (transports are incompatible)
          _this.parent.terminate(args.reason || JSJAC_JINGLE_REASON_FAILED_TRANSPORT);
        }
      }, ((args.timer || JSJAC_JINGLE_PEER_TIMEOUT_DEFAULT) * 1000));
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:peer] timeout > ' + e, 1);
    }
  },

  /**
   * Stops ongoing peer connections
   * @public
   */
  stop: function(username) {
    this.parent.get_debug().log('[JSJaCJingle:peer] stop', 4);

    // Detach media streams from DOM view
    this.parent.set_local_stream(null);

    // Stop selected remote stream, or all streams?
    var cur_username, remote_list = [];

    if(username) {
        remote_list.push(username);
    } else {
        for(cur_username in this.parent.get_peer_connection())
            remote_list.push(cur_username);
    }

    for(cur_username in remote_list) {
        this.parent.set_remote_stream(cur_username, null);

        // Close the media stream
        if(this.parent.get_peer_connection(cur_username))
          this.parent.get_peer_connection(cur_username).close();
    }

    // Remove this session from router
    JSJaCJingle.remove(JSJAC_JINGLE_SESSION_SINGLE, this.parent.get_sid());
  },

  /**
   * Attaches given stream to given DOM element
   * @public
   */
  stream_attach: function(element, stream, mute) {
    try {
      var i;
      var stream_src = stream ? URL.createObjectURL(stream) : '';

      for(i in element) {
        element[i].src = stream_src;

        if(navigator.mozGetUserMedia)
          element[i].play();
        else
          element[i].autoplay = true;

        if(typeof mute == 'boolean') element[i].muted = mute;
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:peer] stream_attach > ' + e, 1);
    }
  },

  /**
   * Detaches stream from given DOM element
   * @public
   */
  stream_detach: function(element) {
    try {
      var i;

      for(i in element) {
        element[i].pause();
        element[i].src = '';
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:peer] stream_detach > ' + e, 1);
    }
  },
});
