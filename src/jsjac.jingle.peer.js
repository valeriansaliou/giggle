/**
 * @fileoverview JSJaC Jingle library - Peer API lib
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/**
 * JSJSAC JINGLE PEER API
 */

function JSJaCJinglePeer() {
  var self = this;


  /**
   * @private
   */
  self._peer_connection_create = function(sdp_message_callback) {
    self.get_debug().log('[JSJaCJingle] _peer_connection_create', 4);

    try {
      // Log STUN servers in use
      var i;
      var ice_config = self._util_config_ice();

      if(typeof ice_config.iceServers == 'object') {
        for(i = 0; i < (ice_config.iceServers).length; i++)
          self.get_debug().log('[JSJaCJingle] _peer_connection_create > Using ICE server at: ' + ice_config.iceServers[i].url + ' (' + (i + 1) + ').', 2);
      } else {
        self.get_debug().log('[JSJaCJingle] _peer_connection_create > No ICE server configured. Network may not work properly.', 0);
      }

      // Create the RTCPeerConnection object
      self._set_peer_connection(
        new WEBRTC_PEER_CONNECTION(
          ice_config,
          WEBRTC_CONFIGURATION.peer_connection.constraints
        )
      );

      // Event: onicecandidate
      self._get_peer_connection().onicecandidate = function(e) {
        if(e.candidate) {
          self._util_sdp_parse_candidate_store({
            media     : (isNaN(e.candidate.sdpMid) ? e.candidate.sdpMid : self._util_media_generate(parseInt(e.candidate.sdpMid, 10))),
            candidate : e.candidate.candidate
          });
        } else {
          // Build or re-build content (local)
          self._util_build_content_local();

          // In which action stanza should candidates be sent?
          if((self.is_initiator() && self.get_status() == JSJAC_JINGLE_STATUS_INITIATING)  ||
             (self.is_responder() && self.get_status() == JSJAC_JINGLE_STATUS_ACCEPTING)) {
            self.get_debug().log('[JSJaCJingle] _peer_connection_create > onicecandidate > Got initial candidates.', 2);

            // Execute what's next (initiate/accept session)
            sdp_message_callback();
          } else {
            self.get_debug().log('[JSJaCJingle] _peer_connection_create > onicecandidate > Got more candidates (on the go).', 2);

            // Send unsent candidates
            var candidates_queue_local = self._get_candidates_queue_local();

            if(self.util_object_length(candidates_queue_local) > 0)
              self.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_TRANSPORT_INFO, candidates: candidates_queue_local });
          }

          // Empty the unsent candidates queue
          self._set_candidates_queue_local(null);
        }
      };

      // Event: oniceconnectionstatechange
      self._get_peer_connection().oniceconnectionstatechange = function(e) {
        self.get_debug().log('[JSJaCJingle] _peer_connection_create > oniceconnectionstatechange', 2);

        // Connection errors?
        switch(this.iceConnectionState) {
          case 'disconnected':
            self._peer_timeout(this.iceConnectionState, {
              timer  : JSJAC_JINGLE_PEER_TIMEOUT_DISCONNECT,
              reason : JSJAC_JINGLE_REASON_CONNECTIVITY_ERROR
            });
            break;

          case 'checking':
            self._peer_timeout(this.iceConnectionState); break;
        }

        self.get_debug().log('[JSJaCJingle] _peer_connection_create > oniceconnectionstatechange > (state: ' + this.iceConnectionState + ').', 2);
      };

      // Event: onaddstream
      self._get_peer_connection().onaddstream = function(e) {
        if (!e) return;

        self.get_debug().log('[JSJaCJingle] _peer_connection_create > onaddstream', 2);

        // Attach remote stream to DOM view
        self._set_remote_stream(e.stream);
      };

      // Event: onremovestream
      self._get_peer_connection().onremovestream = function(e) {
        self.get_debug().log('[JSJaCJingle] _peer_connection_create > onremovestream', 2);

        // Detach remote stream from DOM view
        self._set_remote_stream(null);
      };

      // Add local stream
      self._get_peer_connection().addStream(self._get_local_stream()); 

      // Create offer
      self.get_debug().log('[JSJaCJingle] _peer_connection_create > Getting local description...', 2);

      if(self.is_initiator()) {
        // Local description
        self._get_peer_connection().createOffer(self._peer_got_description, self._peer_fail_description, WEBRTC_CONFIGURATION.create_offer);

        // Then, wait for responder to send back its remote description
      } else {
        // Apply SDP data
        sdp_remote = self._util_sdp_generate(
          WEBRTC_SDP_TYPE_OFFER,
          self._get_group_remote(),
          self._get_payloads_remote(),
          self._get_candidates_queue_remote()
        );

        if(self.get_sdp_trace())  self.get_debug().log('[JSJaCJingle] SDP (remote)' + '\n\n' + sdp_remote.description.sdp, 4);

        // Remote description
        self._get_peer_connection().setRemoteDescription(
          (new WEBRTC_SESSION_DESCRIPTION(sdp_remote.description)),

          function() {
            // Success (descriptions are compatible)
          },

          function(e) {
            if(self.get_sdp_trace())  self.get_debug().log('[JSJaCJingle] SDP (remote:error)' + '\n\n' + (e.message || e.name || 'Unknown error'), 4);

            // Error (descriptions are incompatible)
            self.terminate(JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS);
          }
        );

        // Local description
        self._get_peer_connection().createAnswer(self._peer_got_description, self._peer_fail_description, WEBRTC_CONFIGURATION.create_answer);

        // ICE candidates
        var c;
        var cur_candidate_obj;

        for(c in sdp_remote.candidates) {
          cur_candidate_obj = sdp_remote.candidates[c];

          self._get_peer_connection().addIceCandidate(
            new WEBRTC_ICE_CANDIDATE({
              sdpMLineIndex : cur_candidate_obj.id,
              candidate     : cur_candidate_obj.candidate
            })
          );
        }

        // Empty the unapplied candidates queue
        self._set_candidates_queue_remote(null);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_connection_create > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._peer_get_user_media = function(callback) {
    self.get_debug().log('[JSJaCJingle] _peer_get_user_media', 4);

    try {
      self.get_debug().log('[JSJaCJingle] _peer_get_user_media > Getting user media...', 2);

      (WEBRTC_GET_MEDIA.bind(navigator))(
        self.util_generate_constraints(),
        self._peer_got_user_media_success.bind(this, callback),
        self._peer_got_user_media_error.bind(this)
      );
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_get_user_media > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._peer_got_user_media_success = function(callback, stream) {
    self.get_debug().log('[JSJaCJingle] _peer_got_user_media_success', 4);

    try {
      self.get_debug().log('[JSJaCJingle] _peer_got_user_media_success > Got user media.', 2);

      self._set_local_stream(stream);

      if(callback && typeof callback == 'function') {
        if((self.get_media() == JSJAC_JINGLE_MEDIA_VIDEO) && self.get_local_view().length) {
          self.get_debug().log('[JSJaCJingle] _peer_got_user_media_success > Waiting for local video to be loaded...', 2);

          var fn_loaded = function() {
            self.get_debug().log('[JSJaCJingle] _peer_got_user_media_success > Local video loaded.', 2);

            this.removeEventListener('loadeddata', fn_loaded, false);
            callback();
          };

          self.get_local_view()[0].addEventListener('loadeddata', fn_loaded, false);
        } else {
          callback();
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_got_user_media_success > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._peer_got_user_media_error = function(error) {
    self.get_debug().log('[JSJaCJingle] _peer_got_user_media_error', 4);

    try {
      (self._get_session_initiate_error())(self);

      // Not needed in case we are the responder (breaks termination)
      if(self.is_initiator()) self.handle_session_initiate_error();

      // Not needed in case we are the initiator (no packet sent, ever)
      if(self.is_responder()) self.terminate(JSJAC_JINGLE_REASON_MEDIA_ERROR);

      self.get_debug().log('[JSJaCJingle] _peer_got_user_media_error > Failed (' + (error.PERMISSION_DENIED ? 'permission denied' : 'unknown' ) + ').', 1);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_got_user_media_error > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._peer_got_description = function(sdp_local) {
    self.get_debug().log('[JSJaCJingle] _peer_got_description', 4);

    try {
      self.get_debug().log('[JSJaCJingle] _peer_got_description > Got local description.', 2);

      if(self.get_sdp_trace())  self.get_debug().log('[JSJaCJingle] SDP (local:raw)' + '\n\n' + sdp_local.sdp, 4);

      // Convert SDP raw data to an object
      var cur_name;
      var payload_parsed = self._util_sdp_parse_payload(sdp_local.sdp);
      self._util_sdp_resolution_payload(payload_parsed);

      for(cur_name in payload_parsed) {
        self._set_payloads_local(
          cur_name,
          payload_parsed[cur_name]
        );
      }

      var cur_semantics;
      var group_parsed = self._util_sdp_parse_group(sdp_local.sdp);

      for(cur_semantics in group_parsed) {
        self._set_group_local(
          cur_semantics,
          group_parsed[cur_semantics]
        );
      }

      // Filter our local description (remove unused medias)
      var sdp_local_desc = self._util_sdp_generate_description(
        sdp_local.type,
        self._get_group_local(),
        self._get_payloads_local(),

        self._util_sdp_generate_candidates(
          self._get_candidates_local()
        )
      );

      if(self.get_sdp_trace())  self.get_debug().log('[JSJaCJingle] SDP (local:gen)' + '\n\n' + sdp_local_desc.sdp, 4);

      self._get_peer_connection().setLocalDescription(
        (new WEBRTC_SESSION_DESCRIPTION(sdp_local_desc)),

        function() {
          // Success (descriptions are compatible)
        },

        function(e) {
          if(self.get_sdp_trace())  self.get_debug().log('[JSJaCJingle] SDP (local:error)' + '\n\n' + (e.message || e.name || 'Unknown error'), 4);

          // Error (descriptions are incompatible)
        }
      );

      self.get_debug().log('[JSJaCJingle] _peer_got_description > Waiting for local candidates...', 2);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_got_description > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._peer_fail_description = function() {
    self.get_debug().log('[JSJaCJingle] _peer_fail_description', 4);

    try {
      self.get_debug().log('[JSJaCJingle] _peer_fail_description > Could not get local description!', 1);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_fail_description > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._peer_sound = function(enable) {
    self.get_debug().log('[JSJaCJingle] _peer_sound', 4);

    try {
      self.get_debug().log('[JSJaCJingle] _peer_sound > Enable: ' + enable + ' (current: ' + self.get_mute(JSJAC_JINGLE_MEDIA_AUDIO) + ').', 2);

      var i;
      var audio_tracks = self._get_local_stream().getAudioTracks();

      for(i = 0; i < audio_tracks.length; i++)
        audio_tracks[i].enabled = enable;
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_sound > ' + e, 1);
    }
  };

  /**
   * Set a timeout limit to peer connection
   */
  self._peer_timeout = function(state, args) {
    try {
      // Assert
      if(typeof args !== 'object') args = {};

      var t_sid = self.get_sid();
   
      setTimeout(function() {
        // State did not change?
        if(self.get_sid() == t_sid && self._get_peer_connection().iceConnectionState == state) {
          self.get_debug().log('[JSJaCJingle] util_stanza_timeout > Peer timeout.', 2);

          // Error (transports are incompatible)
          self.terminate(args.reason || JSJAC_JINGLE_REASON_FAILED_TRANSPORT);
        }
      }, ((args.timer || JSJAC_JINGLE_PEER_TIMEOUT_DEFAULT) * 1000));
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_timeout > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._peer_stop = function() {
    self.get_debug().log('[JSJaCJingle] _peer_stop', 4);

    // Detach media streams from DOM view
    self._set_local_stream(null);
    self._set_remote_stream(null);

    // Close the media stream
    if(self._get_peer_connection())
      self._get_peer_connection().close();

    // Remove this session from router
    JSJaCJingle_remove(self.get_sid());
  };
}
