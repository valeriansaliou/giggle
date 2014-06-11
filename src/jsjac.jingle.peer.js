/**
 * @fileoverview JSJaC Jingle library - Peer API lib
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


var JSJaCJinglePeer = ring.create({
  /**
   * Constructor
   */
  constructor: function(parent) {
    this.parent = parent;
  },

  /**
   * @private
   */
  connection_create: function(sdp_message_callback) {
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
        new WEBRTC_PEER_CONNECTION(
          ice_config,
          WEBRTC_CONFIGURATION.peer_connection.constraints
        )
      );

      // Event: onicecandidate
      var _this = this;

      this.parent.get_peer_connection().onicecandidate = function(e) {
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
              _this.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_TRANSPORT_INFO, candidates: candidates_queue_local });
          }

          // Empty the unsent candidates queue
          _this.parent.set_candidates_queue_local(null);
        }
      };

      // Event: oniceconnectionstatechange
      this.parent.get_peer_connection().oniceconnectionstatechange = function(e) {
        _this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > oniceconnectionstatechange', 2);

        // Connection errors?
        switch(this.iceConnectionState) {
          case 'disconnected':
            _this.timeout(this.iceConnectionState, {
              timer  : JSJAC_JINGLE_PEER_TIMEOUT_DISCONNECT,
              reason : JSJAC_JINGLE_REASON_CONNECTIVITY_ERROR
            });
            break;

          case 'checking':
            _this.timeout(this.iceConnectionState); break;
        }

        _this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > oniceconnectionstatechange > (state: ' + this.iceConnectionState + ').', 2);
      };

      // Event: onaddstream
      this.parent.get_peer_connection().onaddstream = function(e) {
        if (!e) return;

        _this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > onaddstream', 2);

        // Attach remote stream to DOM view
        _this.parent.set_remote_stream(e.stream);
      };

      // Event: onremovestream
      this.parent.get_peer_connection().onremovestream = function(e) {
        _this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > onremovestream', 2);

        // Detach remote stream from DOM view
        _this.parent.set_remote_stream(null);
      };

      // Add local stream
      this.parent.get_peer_connection().addStream(this.parent.get_local_stream()); 

      // Create offer
      this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > Getting local description...', 2);

      if(this.parent.is_initiator()) {
        // Local description
        this.parent.get_peer_connection().createOffer(
          this.got_description.bind(this),
          this.fail_description.bind(this),
          WEBRTC_CONFIGURATION.create_offer
        );

        // Then, wait for responder to send back its remote description
      } else {
        // Apply SDP data
        sdp_remote = this.parent.sdp.generate(
          WEBRTC_SDP_TYPE_OFFER,
          this.parent.get_group_remote(),
          this.parent.get_payloads_remote(),
          this.parent.get_candidates_queue_remote()
        );

        if(this.parent.get_sdp_trace())  this.parent.get_debug().log('[JSJaCJingle:peer] SDP (remote)' + '\n\n' + sdp_remote.description.sdp, 4);

        // Remote description
        this.parent.get_peer_connection().setRemoteDescription(
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
        this.parent.get_peer_connection().createAnswer(
          this.got_description.bind(this),
          this.fail_description.bind(this),
          WEBRTC_CONFIGURATION.create_answer
        );

        // ICE candidates
        var c;
        var cur_candidate_obj;

        for(c in sdp_remote.candidates) {
          cur_candidate_obj = sdp_remote.candidates[c];

          this.parent.get_peer_connection().addIceCandidate(
            new WEBRTC_ICE_CANDIDATE({
              sdpMLineIndex : cur_candidate_obj.id,
              candidate     : cur_candidate_obj.candidate
            })
          );
        }

        // Empty the unapplied candidates queue
        this.parent.set_candidates_queue_remote(null);
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:peer] connection_create > ' + e, 1);
    }
  },

  /**
   * @private
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
   * @private
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
   * @private
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
   * @private
   */
  got_description: function(sdp_local) {
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

      this.parent.get_peer_connection().setLocalDescription(
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
   * @private
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
   * @private
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
   */
  timeout: function(state, args) {
    try {
      // Assert
      if(typeof args !== 'object') args = {};

      var t_sid = this.parent.get_sid();

      var _this = this;

      setTimeout(function() {
        // State did not change?
        if(_this.parent.get_sid() == t_sid && _this.parent.get_peer_connection().iceConnectionState == state) {
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
   * @private
   */
  stop: function() {
    this.parent.get_debug().log('[JSJaCJingle:peer] stop', 4);

    // Detach media streams from DOM view
    this.parent.set_local_stream(null);
    this.parent.set_remote_stream(null);

    // Close the media stream
    if(this.parent.get_peer_connection())
      this.parent.get_peer_connection().close();

    // Remove this session from router
    JSJaCJingle.remove(this.parent.get_sid());
  },

  /**
   * @private
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
      this.parent.get_debug().log('[JSJaCJingle:peer] _peer_stream_attach > ' + e, 1);
    }
  },

  /**
   * @private
   */
  stream_detach: function(element) {
    try {
      var i;

      for(i in element) {
        element[i].pause();
        element[i].src = '';
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:peer] _peer_stream_detach > ' + e, 1);
    }
  },
});
