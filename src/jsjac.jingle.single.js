/**
 * @fileoverview JSJaC Jingle library - Single (one-to-one) call lib
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/**
 * JSJSAC JINGLE METHODS
 */

/**
 * Creates a new XMPP Jingle session.
 * @class Somewhat abstract base class for XMPP Jingle sessions. Contains all
 * of the code in common for all Jingle sessions
 * @constructor
 * @param {Object} args Jingle session arguments.
 */
function JSJaCJingleSingle(args) {
  var self = this;

  /**
   * Initiates a new Jingle session.
   */
  self.initiate = function() {
    self.get_debug().log('[JSJaCJingle] initiate', 4);

    try {
      // Locked?
      if(self.get_lock()) {
        self.get_debug().log('[JSJaCJingle] initiate > Cannot initiate, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { self.initiate(); })) {
        self.get_debug().log('[JSJaCJingle] initiate > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(self.get_status() != JSJAC_JINGLE_STATUS_INACTIVE) {
        self.get_debug().log('[JSJaCJingle] initiate > Cannot initiate, resource not inactive (status: ' + self.get_status() + ').', 0);
        return;
      }

      self.get_debug().log('[JSJaCJingle] initiate > New Jingle session with media: ' + self.get_media(), 2);

      // Common vars
      var i, cur_name;

      // Trigger init pending custom callback
      (self._get_session_initiate_pending())(self);

      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_INITIATING);

      // Set session values
      self._set_sid(self.util_generate_sid());
      self._set_initiator(self.util_connection_jid());
      self._set_responder(self.get_to());

      for(i in self.get_media_all()) {
        cur_name = self._util_name_generate(
          self.get_media_all()[i]
        );

        self._set_name(cur_name);

        self._set_senders(
          cur_name,
          JSJAC_JINGLE_SENDERS_BOTH.jingle
        );

        self._set_creator(
          cur_name,
          JSJAC_JINGLE_CREATOR_INITIATOR
        );
      }

      // Register session to common router
      JSJaCJingle_add(self.get_sid(), self);

      // Initialize WebRTC
      self._peer_get_user_media(function() {
        self._peer_connection_create(function() {
          self.get_debug().log('[JSJaCJingle] initiate > Ready to begin Jingle negotiation.', 2);

          self.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_INITIATE });
        });
      });
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] initiate > ' + e, 1);
    }
  };

  /**
   * Accepts the Jingle session.
   */
  self.accept = function() {
    self.get_debug().log('[JSJaCJingle] accept', 4);

    try {
      // Locked?
      if(self.get_lock()) {
        self.get_debug().log('[JSJaCJingle] accept > Cannot accept, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { self.accept(); })) {
        self.get_debug().log('[JSJaCJingle] accept > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(self.get_status() != JSJAC_JINGLE_STATUS_INITIATED) {
        self.get_debug().log('[JSJaCJingle] accept > Cannot accept, resource not initiated (status: ' + self.get_status() + ').', 0);
        return;
      }

      self.get_debug().log('[JSJaCJingle] accept > New Jingle session with media: ' + self.get_media(), 2);

      // Trigger accept pending custom callback
      (self._get_session_accept_pending())(self);

      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_ACCEPTING);

      // Initialize WebRTC
      self._peer_get_user_media(function() {
        self._peer_connection_create(function() {
          self.get_debug().log('[JSJaCJingle] accept > Ready to complete Jingle negotiation.', 2);

          // Process accept actions
          self.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_ACCEPT });
        });
      });
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] accept > ' + e, 1);
    }
  };

  /**
   * Sends a Jingle session info.
   */
  self.info = function(name, args) {
    self.get_debug().log('[JSJaCJingle] info', 4);

    try {
      // Locked?
      if(self.get_lock()) {
        self.get_debug().log('[JSJaCJingle] info > Cannot accept, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { self.info(name, args); })) {
        self.get_debug().log('[JSJaCJingle] info > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(!(self.get_status() == JSJAC_JINGLE_STATUS_INITIATED || self.get_status() == JSJAC_JINGLE_STATUS_ACCEPTING || self.get_status() == JSJAC_JINGLE_STATUS_ACCEPTED)) {
        self.get_debug().log('[JSJaCJingle] info > Cannot send info, resource not active (status: ' + self.get_status() + ').', 0);
        return;
      }

      // Assert
      if(typeof args !== 'object') args = {};

      // Build final args parameter
      args.action = JSJAC_JINGLE_ACTION_SESSION_INFO;
      if(name) args.info = name;

      self.send(JSJAC_JINGLE_STANZA_TYPE_SET, args);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] info > ' + e, 1);
    }
  };

  /**
   * Terminates the Jingle session.
   */
  self.terminate = function(reason) {
    self.get_debug().log('[JSJaCJingle] terminate', 4);

    try {
      // Locked?
      if(self.get_lock()) {
        self.get_debug().log('[JSJaCJingle] terminate > Cannot terminate, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { self.terminate(reason); })) {
        self.get_debug().log('[JSJaCJingle] terminate > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(self.get_status() == JSJAC_JINGLE_STATUS_TERMINATED) {
        self.get_debug().log('[JSJaCJingle] terminate > Cannot terminate, resource already terminated (status: ' + self.get_status() + ').', 0);
        return;
      }

      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_TERMINATING);

      // Trigger terminate pending custom callback
      (self._get_session_terminate_pending())(self);

      // Process terminate actions
      self.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_TERMINATE, reason: reason });
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] terminate > ' + e, 1);
    }
  };

  /**
   * Sends a given Jingle stanza packet
   */
  self.send = function(type, args) {
    self.get_debug().log('[JSJaCJingle] send', 4);

    try {
      // Locked?
      if(self.get_lock()) {
        self.get_debug().log('[JSJaCJingle] send > Cannot send, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { self.send(type, args); })) {
        self.get_debug().log('[JSJaCJingle] send > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Assert
      if(typeof args !== 'object') args = {};

      // Build stanza
      var stanza = new JSJaCIQ();
      stanza.setTo(self.get_to());

      if(type) stanza.setType(type);

      if(!args.id) args.id = self._get_id_new();
      stanza.setID(args.id);

      if(type == JSJAC_JINGLE_STANZA_TYPE_SET) {
        if(!(args.action && args.action in JSJAC_JINGLE_ACTIONS)) {
          self.get_debug().log('[JSJaCJingle] send > Stanza action unknown: ' + (args.action || 'undefined'), 1);
          return;
        }

        self._set_sent_id(args.id);

        // Submit to registered handler
        switch(args.action) {
          case JSJAC_JINGLE_ACTION_CONTENT_ACCEPT:
            self.send_content_accept(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_ADD:
            self.send_content_add(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_MODIFY:
            self.send_content_modify(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_REJECT:
            self.send_content_reject(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_REMOVE:
            self.send_content_remove(stanza); break;

          case JSJAC_JINGLE_ACTION_DESCRIPTION_INFO:
            self.send_description_info(stanza); break;

          case JSJAC_JINGLE_ACTION_SECURITY_INFO:
            self.send_security_info(stanza); break;

          case JSJAC_JINGLE_ACTION_SESSION_ACCEPT:
            self.send_session_accept(stanza, args); break;

          case JSJAC_JINGLE_ACTION_SESSION_INFO:
            self.send_session_info(stanza, args); break;

          case JSJAC_JINGLE_ACTION_SESSION_INITIATE:
            self.send_session_initiate(stanza, args); break;

          case JSJAC_JINGLE_ACTION_SESSION_TERMINATE:
            self.send_session_terminate(stanza, args); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT:
            self.send_transport_accept(stanza); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_INFO:
            self.send_transport_info(stanza, args); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_REJECT:
            self.send_transport_reject(stanza); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE:
            self.send_transport_replace(stanza); break;

          default:
            self.get_debug().log('[JSJaCJingle] send > Unexpected error.', 1);

            return false;
        }
      } else if(type != JSJAC_JINGLE_STANZA_TYPE_RESULT) {
        self.get_debug().log('[JSJaCJingle] send > Stanza type must either be set or result.', 1);

        return false;
      }

      JSJAC_JINGLE_STORE_CONNECTION.send(stanza);

      if(self.get_net_trace())  self.get_debug().log('[JSJaCJingle] Outgoing packet sent' + '\n\n' + stanza.xml());

      return true;
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send > ' + e, 1);
    }

    return false;
  };

  /**
   * Handles a given Jingle stanza response
   */
  self.handle = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle', 4);

    try {
      if(self.get_net_trace())  self.get_debug().log('[JSJaCJingle] Incoming packet received' + '\n\n' + stanza.xml());

      // Locked?
      if(self.get_lock()) {
        self.get_debug().log('[JSJaCJingle] handle > Cannot handle, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { self.handle(stanza); })) {
        self.get_debug().log('[JSJaCJingle] handle > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      var id   = stanza.getID();
      var type = stanza.getType();

      if(id && type == JSJAC_JINGLE_STANZA_TYPE_RESULT)  self._set_received_id(id);

      // Submit to custom handler
      if(typeof self._get_handlers(type, id) == 'function') {
        self.get_debug().log('[JSJaCJingle] handle > Submitted to custom handler.', 2);

        (self._get_handlers(type, id))(stanza);
        self.unregister_handler(type, id);

        return;
      }

      var jingle = self.util_stanza_jingle(stanza);

      // Don't handle non-Jingle stanzas there...
      if(!jingle) return;

      var action = self.util_stanza_get_attribute(jingle, 'action');

      // Don't handle action-less Jingle stanzas there...
      if(!action) return;

      // Submit to registered handler
      switch(action) {
        case JSJAC_JINGLE_ACTION_CONTENT_ACCEPT:
          self.handle_content_accept(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_ADD:
          self.handle_content_add(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_MODIFY:
          self.handle_content_modify(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_REJECT:
          self.handle_content_reject(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_REMOVE:
          self.handle_content_remove(stanza); break;

        case JSJAC_JINGLE_ACTION_DESCRIPTION_INFO:
          self.handle_description_info(stanza); break;

        case JSJAC_JINGLE_ACTION_SECURITY_INFO:
          self.handle_security_info(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_ACCEPT:
          self.handle_session_accept(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_INFO:
          self.handle_session_info(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_INITIATE:
          self.handle_session_initiate(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_TERMINATE:
          self.handle_session_terminate(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT:
          self.handle_transport_accept(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_INFO:
          self.handle_transport_info(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_REJECT:
          self.handle_transport_reject(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE:
          self.handle_transport_replace(stanza); break;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle > ' + e, 1);
    }
  };

  /**
   * Mutes a Jingle session (local)
   */
  self.mute = function(name) {
    self.get_debug().log('[JSJaCJingle] mute', 4);

    try {
      // Locked?
      if(self.get_lock()) {
        self.get_debug().log('[JSJaCJingle] mute > Cannot mute, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { self.mute(name); })) {
        self.get_debug().log('[JSJaCJingle] mute > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Already muted?
      if(self.get_mute(name)) {
        self.get_debug().log('[JSJaCJingle] mute > Resource already muted.', 0);
        return;
      }

      self._peer_sound(false);
      self._set_mute(name, true);

      self.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_INFO, info: JSJAC_JINGLE_SESSION_INFO_MUTE, name: name });
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] mute > ' + e, 1);
    }
  };

  /**
   * Unmutes a Jingle session (local)
   */
  self.unmute = function(name) {
    self.get_debug().log('[JSJaCJingle] unmute', 4);

    try {
      // Locked?
      if(self.get_lock()) {
        self.get_debug().log('[JSJaCJingle] unmute > Cannot unmute, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { self.unmute(name); })) {
        self.get_debug().log('[JSJaCJingle] unmute > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Already unmute?
      if(!self.get_mute(name)) {
        self.get_debug().log('[JSJaCJingle] unmute > Resource already unmuted.', 0);
        return;
      }

      self._peer_sound(true);
      self._set_mute(name, false);

      self.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_INFO, info: JSJAC_JINGLE_SESSION_INFO_UNMUTE, name: name });
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] unmute > ' + e, 1);
    }
  };

  /**
   * Toggles media type in a Jingle session
   */
  self.media = function(media) {
    /* DEV: don't expect this to work as of now! */

    self.get_debug().log('[JSJaCJingle] media', 4);

    try {
      // Locked?
      if(self.get_lock()) {
        self.get_debug().log('[JSJaCJingle] media > Cannot change media, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      if(JSJaCJingle_defer(function() { self.media(media); })) {
        self.get_debug().log('[JSJaCJingle] media > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Toggle media?
      if(!media)
        media = (self.get_media() == JSJAC_JINGLE_MEDIA_VIDEO) ? JSJAC_JINGLE_MEDIA_AUDIO : JSJAC_JINGLE_MEDIA_VIDEO;

      // Media unknown?
      if(!(media in JSJAC_JINGLE_MEDIAS)) {
        self.get_debug().log('[JSJaCJingle] media > No media provided or media unsupported (media: ' + media + ').', 0);
        return;
      }

      // Already using provided media?
      if(self.get_media() == media) {
        self.get_debug().log('[JSJaCJingle] media > Resource already using this media (media: ' + media + ').', 0);
        return;
      }

      // Switch locked for now? (another one is being processed)
      if(self.get_media_busy()) {
        self.get_debug().log('[JSJaCJingle] media > Resource already busy switching media (busy: ' + self.get_media() + ', media: ' + media + ').', 0);
        return;
      }

      self.get_debug().log('[JSJaCJingle] media > Changing media to: ' + media + '...', 2);

      // Store new media
      self._set_media(media);
      self._set_media_busy(true);

      // Toggle video mode (add/remove)
      if(media == JSJAC_JINGLE_MEDIA_VIDEO) {
        // TODO: the flow is something like that...
        /*self._peer_get_user_media(function() {
          self._peer_connection_create(function() {
            self.get_debug().log('[JSJaCJingle] media > Ready to change media (to: ' + media + ').', 2);

            // 'content-add' >> video
            // TODO: restart video stream configuration

            // WARNING: only change get user media, DO NOT TOUCH THE STREAM THING (don't stop active stream as it's flowing!!)

            self.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_CONTENT_ADD, name: JSJAC_JINGLE_MEDIA_VIDEO });
          })
        });*/
      } else {
        // TODO: the flow is something like that...
        /*self._peer_get_user_media(function() {
          self._peer_connection_create(function() {
            self.get_debug().log('[JSJaCJingle] media > Ready to change media (to: ' + media + ').', 2);

            // 'content-remove' >> video
            // TODO: remove video stream configuration

            // WARNING: only change get user media, DO NOT TOUCH THE STREAM THING (don't stop active stream as it's flowing!!)
            //          here, only stop the video stream, do not touch the audio stream

            self.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_CONTENT_REMOVE, name: JSJAC_JINGLE_MEDIA_VIDEO });
          })
        });*/
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] media > ' + e, 1);
    }
  };

  /**
   * Registers a given handler on a given Jingle stanza
   */
  self.register_handler = function(type, id, fn) {
    self.get_debug().log('[JSJaCJingle] register_handler', 4);

    try {
      type = type || JSJAC_JINGLE_STANZA_TYPE_ALL;

      if(typeof fn !== 'function') {
        self.get_debug().log('[JSJaCJingle] register_handler > fn parameter not passed or not a function!', 1);
        return false;
      }

      if(id) {
        self._set_handlers(type, id, fn);

        self.get_debug().log('[JSJaCJingle] register_handler > Registered handler for id: ' + id + ' and type: ' + type, 3);
        return true;
      } else {
        self.get_debug().log('[JSJaCJingle] register_handler > Could not register handler (no ID).', 1);
        return false;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] register_handler > ' + e, 1);
    }

    return false;
  };

  /**
   * Unregisters the given handler on a given Jingle stanza
   */
  self.unregister_handler = function(type, id) {
    self.get_debug().log('[JSJaCJingle] unregister_handler', 4);

    try {
      type = type || JSJAC_JINGLE_STANZA_TYPE_ALL;

      if(type in self._handlers && id in self._handlers[type]) {
        delete self._handlers[type][id];

        self.get_debug().log('[JSJaCJingle] unregister_handler > Unregistered handler for id: ' + id + ' and type: ' + type, 3);
        return true;
      } else {
        self.get_debug().log('[JSJaCJingle] unregister_handler > Could not unregister handler with id: ' + id + ' and type: ' + type + ' (not found).', 2);
        return false;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] unregister_handler > ' + e, 1);
    }

    return false;
  };

  /**
   * Registers a view element
   */
  self.register_view = function(type, view) {
    self.get_debug().log('[JSJaCJingle] register_view', 4);

    try {
      // Get view functions
      var fn = self._util_map_register_view(type);

      if(fn.type == type) {
        var i;

        // Check view is not already registered
        for(i in (fn.view.get)()) {
          if((fn.view.get)()[i] == view) {
            self.get_debug().log('[JSJaCJingle] register_view > Could not register view of type: ' + type + ' (already registered).', 2);
            return true;
          }
        }

        // Proceeds registration
        (fn.view.set)(view);

        self._util_peer_stream_attach(
          [view],
          (fn.stream.get)(),
          fn.mute
        );

        self.get_debug().log('[JSJaCJingle] register_view > Registered view of type: ' + type, 3);

        return true;
      } else {
        self.get_debug().log('[JSJaCJingle] register_view > Could not register view of type: ' + type + ' (type unknown).', 1);
        return false;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] register_view > ' + e, 1);
    }

    return false;
  };

  /**
   * Unregisters a view element
   */
  self.unregister_view = function(type, view) {
    self.get_debug().log('[JSJaCJingle] unregister_view', 4);

    try {
      // Get view functions
      var fn = self._util_map_unregister_view(type);

      if(fn.type == type) {
        var i;

        // Check view is registered
        for(i in (fn.view.get)()) {
          if((fn.view.get)()[i] == view) {
            // Proceeds un-registration
            self._util_peer_stream_detach(
              [view]
            );

            self.util_array_remove_value(
              (fn.view.get)(),
              view
            );

            self.get_debug().log('[JSJaCJingle] unregister_view > Unregistered view of type: ' + type, 3);
            return true;
          }
        }

        self.get_debug().log('[JSJaCJingle] unregister_view > Could not unregister view of type: ' + type + ' (not found).', 2);
        return true;
      } else {
        self.get_debug().log('[JSJaCJingle] unregister_view > Could not unregister view of type: ' + type + ' (type unknown).', 1);
        return false;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] unregister_view > ' + e, 1);
    }

    return false;
  };


  /**
   * JSJSAC JINGLE SENDERS
   */

  /**
   * Sends the Jingle content accept
   */
  self.send_content_accept = function(stanza) {
    self.get_debug().log('[JSJaCJingle] send_content_accept', 4);

    try {
      // TODO: remove from remote 'content-add' queue
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      self.get_debug().log('[JSJaCJingle] send_content_accept > Feature not implemented!', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_content_accept > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle content add
   */
  self.send_content_add = function(stanza) {
    self.get_debug().log('[JSJaCJingle] send_content_add', 4);

    try {
      // TODO: push to local 'content-add' queue

      // Not implemented for now
      self.get_debug().log('[JSJaCJingle] send_content_add > Feature not implemented!', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_content_add > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle content modify
   */
  self.send_content_modify = function(stanza) {
    self.get_debug().log('[JSJaCJingle] send_content_modify', 4);

    try {
      // TODO: push to local 'content-modify' queue

      // Not implemented for now
      self.get_debug().log('[JSJaCJingle] send_content_modify > Feature not implemented!', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_content_modify > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle content reject
   */
  self.send_content_reject = function(stanza) {
    self.get_debug().log('[JSJaCJingle] send_content_reject', 4);

    try {
      // TODO: remove from remote 'content-add' queue

      // Not implemented for now
      self.get_debug().log('[JSJaCJingle] send_content_reject > Feature not implemented!', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_content_reject > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle content remove
   */
  self.send_content_remove = function(stanza) {
    self.get_debug().log('[JSJaCJingle] send_content_remove', 4);

    try {
      // TODO: add to local 'content-remove' queue

      // Not implemented for now
      self.get_debug().log('[JSJaCJingle] send_content_remove > Feature not implemented!', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_content_remove > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle description info
   */
  self.send_description_info = function(stanza) {
    self.get_debug().log('[JSJaCJingle] send_description_info', 4);

    try {
      // Not implemented for now
      self.get_debug().log('[JSJaCJingle] send_description_info > Feature not implemented!', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_description_info > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle security info
   */
  self.send_security_info = function(stanza) {
    self.get_debug().log('[JSJaCJingle] send_security_info', 4);

    try {
      // Not implemented for now
      self.get_debug().log('[JSJaCJingle] send_security_info > Feature not implemented!', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_security_info > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle session accept
   */
  self.send_session_accept = function(stanza, args) {
    self.get_debug().log('[JSJaCJingle] send_session_accept', 4);

    try {
      if(self.get_status() != JSJAC_JINGLE_STATUS_ACCEPTING) {
        self.get_debug().log('[JSJaCJingle] send_session_accept > Cannot send accept stanza, resource not accepting (status: ' + self.get_status() + ').', 0);
        self.send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      if(!args) {
          self.get_debug().log('[JSJaCJingle] send_session_accept > Argument not provided.', 1);
          return;
      }

      // Build Jingle stanza
      var jingle = self._util_stanza_generate_jingle(stanza, {
        'action'    : JSJAC_JINGLE_ACTION_SESSION_ACCEPT,
        'responder' : self.get_responder()
      });

      self._util_stanza_generate_content_local(stanza, jingle);
      self._util_stanza_generate_group_local(stanza, jingle);

      // Schedule success
      self.register_handler(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, function(stanza) {
        (self._get_session_accept_success())(self, stanza);
        self.handle_session_accept_success(stanza);
      });

      // Schedule error timeout
      self.util_stanza_timeout(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, {
        external:   self._get_session_accept_error(),
        internal:   self.handle_session_accept_error
      });

      self.get_debug().log('[JSJaCJingle] send_session_accept > Sent.', 4);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_session_accept > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle session info
   */
  self.send_session_info = function(stanza, args) {
    self.get_debug().log('[JSJaCJingle] send_session_info', 4);

    try {
      if(!args) {
        self.get_debug().log('[JSJaCJingle] send_session_info > Argument not provided.', 1);
        return;
      }

      // Filter info
      args.info = args.info || JSJAC_JINGLE_SESSION_INFO_ACTIVE;

      // Build Jingle stanza
      var jingle = self._util_stanza_generate_jingle(stanza, {
        'action'    : JSJAC_JINGLE_ACTION_SESSION_INFO,
        'initiator' : self.get_initiator()
      });

      self._util_stanza_generate_session_info(stanza, jingle, args);

      // Schedule success
      self.register_handler(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, function(stanza) {
        (self._get_session_info_success())(self, stanza);
        self.handle_session_info_success(stanza);
      });

      // Schedule error timeout
      self.util_stanza_timeout(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, {
        external:   self._get_session_info_error(),
        internal:   self.handle_session_info_error
      });

      self.get_debug().log('[JSJaCJingle] send_session_info > Sent (name: ' + args.info + ').', 2);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_session_info > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle session initiate
   */
  self.send_session_initiate = function(stanza, args) {
    self.get_debug().log('[JSJaCJingle] send_session_initiate', 4);

    try {
      if(self.get_status() != JSJAC_JINGLE_STATUS_INITIATING) {
        self.get_debug().log('[JSJaCJingle] send_session_initiate > Cannot send initiate stanza, resource not initiating (status: ' + self.get_status() + ').', 0);
        return;
      }

      if(!args) {
        self.get_debug().log('[JSJaCJingle] send_session_initiate > Argument not provided.', 1);
        return;
      }

      // Build Jingle stanza
      var jingle = self._util_stanza_generate_jingle(stanza, {
        'action'    : JSJAC_JINGLE_ACTION_SESSION_INITIATE,
        'initiator' : self.get_initiator()
      });

      self._util_stanza_generate_content_local(stanza, jingle);
      self._util_stanza_generate_group_local(stanza, jingle);

      // Schedule success
      self.register_handler(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, function(stanza) {
        (self._get_session_initiate_success())(self, stanza);
        self.handle_session_initiate_success(stanza);
      });

      // Schedule error timeout
      self.util_stanza_timeout(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, {
        external:   self._get_session_initiate_error(),
        internal:   self.handle_session_initiate_error
      });

      self.get_debug().log('[JSJaCJingle] send_session_initiate > Sent.', 2);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_session_initiate > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle session terminate
   */
  self.send_session_terminate = function(stanza, args) {
    self.get_debug().log('[JSJaCJingle] send_session_terminate', 4);

    try {
      if(self.get_status() != JSJAC_JINGLE_STATUS_TERMINATING) {
        self.get_debug().log('[JSJaCJingle] send_session_terminate > Cannot send terminate stanza, resource not terminating (status: ' + self.get_status() + ').', 0);
        return;
      }

      if(!args) {
        self.get_debug().log('[JSJaCJingle] send_session_terminate > Argument not provided.', 1);
        return;
      }

      // Filter reason
      args.reason = args.reason || JSJAC_JINGLE_REASON_SUCCESS;

      // Store terminate reason
      self._set_reason(args.reason);

      // Build terminate stanza
      var jingle = self._util_stanza_generate_jingle(stanza, {
        'action': JSJAC_JINGLE_ACTION_SESSION_TERMINATE
      });

      var jingle_reason = jingle.appendChild(stanza.buildNode('reason', {'xmlns': NS_JINGLE}));
      jingle_reason.appendChild(stanza.buildNode(args.reason, {'xmlns': NS_JINGLE}));

      // Schedule success
      self.register_handler(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, function(stanza) {
        (self._get_session_terminate_success())(self, stanza);
        self.handle_session_terminate_success(stanza);
      });

      // Schedule error timeout
      self.util_stanza_timeout(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, {
        external:   self._get_session_terminate_error(),
        internal:   self.handle_session_terminate_error
      });

      self.get_debug().log('[JSJaCJingle] send_session_terminate > Sent (reason: ' + args.reason + ').', 2);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_session_terminate > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle transport accept
   */
  self.send_transport_accept = function(stanza) {
    self.get_debug().log('[JSJaCJingle] send_transport_accept', 4);

    try {
      // Not implemented for now
      self.get_debug().log('[JSJaCJingle] send_transport_accept > Feature not implemented!', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_transport_accept > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle transport info
   */
  self.send_transport_info = function(stanza, args) {
    self.get_debug().log('[JSJaCJingle] send_transport_info', 4);

    try {
      if(self.get_status() != JSJAC_JINGLE_STATUS_INITIATED && self.get_status() != JSJAC_JINGLE_STATUS_ACCEPTING && self.get_status() != JSJAC_JINGLE_STATUS_ACCEPTED) {
        self.get_debug().log('[JSJaCJingle] send_transport_info > Cannot send transport info, resource not initiated, nor accepting, nor accepted (status: ' + self.get_status() + ').', 0);
        return;
      }

      if(!args) {
        self.get_debug().log('[JSJaCJingle] send_transport_info > Argument not provided.', 1);
        return;
      }

      if(self.util_object_length(self._get_candidates_queue_local()) === 0) {
        self.get_debug().log('[JSJaCJingle] send_transport_info > No local candidate in queue.', 1);
        return;
      }

      // Build Jingle stanza
      var jingle = self._util_stanza_generate_jingle(stanza, {
        'action'    : JSJAC_JINGLE_ACTION_TRANSPORT_INFO,
        'initiator' : self.get_initiator()
      });

      // Build queue content
      var cur_name;
      var content_queue_local = {};

      for(cur_name in self.get_name()) {
        content_queue_local[cur_name] = self._util_generate_content(
            self.get_creator(cur_name),
            cur_name,
            self.get_senders(cur_name),
            self._get_payloads_local(cur_name),
            self._get_candidates_queue_local(cur_name)
        );
      }

      self._util_stanza_generate_content_local(stanza, jingle, content_queue_local);
      self._util_stanza_generate_group_local(stanza, jingle);

      // Schedule success
      self.register_handler(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, function(stanza) {
        self.handle_transport_info_success(stanza);
      });

      // Schedule error timeout
      self.util_stanza_timeout(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, {
        internal: self.handle_transport_info_error
      });

      self.get_debug().log('[JSJaCJingle] send_transport_info > Sent.', 2);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_transport_info > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle transport reject
   */
  self.send_transport_reject = function(stanza) {
    self.get_debug().log('[JSJaCJingle] send_transport_reject', 4);

    try {
      // Not implemented for now
      self.get_debug().log('[JSJaCJingle] send_transport_reject > Feature not implemented!', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_transport_reject > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle transport replace
   */
  self.send_transport_replace = function(stanza) {
    self.get_debug().log('[JSJaCJingle] send_transport_replace', 4);

    try {
      // Not implemented for now
      self.get_debug().log('[JSJaCJingle] send_transport_replace > Feature not implemented!', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_transport_replace > ' + e, 1);
    }
  };

  /**
   * Sends the Jingle transport replace
   */
  self.send_error = function(stanza, error) {
    self.get_debug().log('[JSJaCJingle] send_error', 4);

    try {
      // Assert
      if(!('type' in error)) {
        self.get_debug().log('[JSJaCJingle] send_error > Type unknown.', 1);
        return;
      }

      if('jingle' in error && !(error.jingle in JSJAC_JINGLE_ERRORS)) {
        self.get_debug().log('[JSJaCJingle] send_error > Jingle condition unknown (' + error.jingle + ').', 1);
        return;
      }

      if('xmpp' in error && !(error.xmpp in XMPP_ERRORS)) {
        self.get_debug().log('[JSJaCJingle] send_error > XMPP condition unknown (' + error.xmpp + ').', 1);
        return;
      }

      var stanza_error = new JSJaCIQ();

      stanza_error.setType('error');
      stanza_error.setID(stanza.getID());
      stanza_error.setTo(self.get_to());

      var error_node = stanza_error.getNode().appendChild(stanza_error.buildNode('error', {'xmlns': NS_CLIENT, 'type': error.type}));

      if('xmpp'   in error) error_node.appendChild(stanza_error.buildNode(error.xmpp,   { 'xmlns': NS_STANZAS       }));
      if('jingle' in error) error_node.appendChild(stanza_error.buildNode(error.jingle, { 'xmlns': NS_JINGLE_ERRORS }));

      JSJAC_JINGLE_STORE_CONNECTION.send(stanza_error);

      self.get_debug().log('[JSJaCJingle] send_error > Sent: ' + (error.jingle || error.xmpp), 2);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] send_error > ' + e, 1);
    }
  };



  /**
   * JSJSAC JINGLE HANDLERS
   */

  /**
   * Handles the Jingle content accept
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_content_accept = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_content_accept', 4);

    try {
      // TODO: start to flow accepted stream
      // TODO: remove accepted content from local 'content-add' queue
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_content_accept > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle content add
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_content_add = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_content_add', 4);

    try {
      // TODO: request the user to start this content (need a custom handler)
      //       on accept: send content-accept
      // TODO: push to remote 'content-add' queue
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_content_add > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle content modify
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_content_modify = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_content_modify', 4);

    try {
      // TODO: change 'senders' value (direction of the stream)
      //       if(send:from_me): notify the user that media is requested
      //       if(unacceptable): terminate the session
      //       if(accepted):     change local/remote SDP
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_content_modify > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle content reject
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_content_reject = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_content_reject', 4);

    try {
      // TODO: remove rejected content from local 'content-add' queue

      // Not implemented for now
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_content_reject > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle content remove
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_content_remove = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_content_remove', 4);

    try {
      // TODO: stop flowing removed stream
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_content_remove > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle description info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_description_info = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_description_info', 4);

    try {
      // Not implemented for now
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_description_info > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle security info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_security_info = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_security_info', 4);

    try {
      // Not implemented for now
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_security_info > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session accept
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_accept = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_accept', 4);

    try {
      // Security preconditions
      if(!self.util_stanza_safe(stanza)) {
        self.get_debug().log('[JSJaCJingle] handle_session_accept > Dropped unsafe stanza.', 0);

        self.send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
        return;
      }

      // Can now safely dispatch the stanza
      switch(stanza.getType()) {
        case JSJAC_JINGLE_STANZA_TYPE_RESULT:
          (self._get_session_accept_success())(self, stanza);
          self.handle_session_accept_success(stanza);

          break;

        case 'error':
          (self._get_session_accept_error())(self, stanza);
          self.handle_session_accept_error(stanza);

          break;

        case JSJAC_JINGLE_STANZA_TYPE_SET:
          // External handler must be set before internal one here...
          (self._get_session_accept_request())(self, stanza);
          self.handle_session_accept_request(stanza);

          break;

        default:
          self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_accept > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session accept success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_accept_success = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_accept_success', 4);

    try {
      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_ACCEPTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_accept_success > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session accept error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_accept_error = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_accept_error', 4);

    try {
      // Terminate the session (timeout)
      self.terminate(JSJAC_JINGLE_REASON_TIMEOUT);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_accept_error > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session accept request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_accept_request = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_accept_request', 4);

    try {
      // Slot unavailable?
      if(self.get_status() != JSJAC_JINGLE_STATUS_INITIATED) {
        self.get_debug().log('[JSJaCJingle] handle_session_accept_request > Cannot handle, resource already accepted (status: ' + self.get_status() + ').', 0);
        self.send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      // Common vars
      var i, cur_candidate_obj;

      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_ACCEPTING);

      var rd_sid = self.util_stanza_sid(stanza);

      // Request is valid?
      if(rd_sid && self.is_initiator() && self._util_stanza_parse_content(stanza)) {
        // Handle additional data (optional)
        self._util_stanza_parse_group(stanza);

        // Generate and store content data
        self._util_build_content_remote();

        // Trigger accept success callback
        (self._get_session_accept_success())(self, stanza);
        self.handle_session_accept_success(stanza);

        var sdp_remote = self._util_sdp_generate(
          WEBRTC_SDP_TYPE_ANSWER,
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

        // ICE candidates
        for(i in sdp_remote.candidates) {
          cur_candidate_obj = sdp_remote.candidates[i];

          self._get_peer_connection().addIceCandidate(
            new WEBRTC_ICE_CANDIDATE({
              sdpMLineIndex : cur_candidate_obj.id,
              candidate     : cur_candidate_obj.candidate
            })
          );
        }

        // Empty the unapplied candidates queue
        self._set_candidates_queue_remote(null);

        // Success reply
        self.send(JSJAC_JINGLE_STANZA_TYPE_RESULT, { id: stanza.getID() });
      } else {
        // Trigger accept error callback
        (self._get_session_accept_error())(self, stanza);
        self.handle_session_accept_error(stanza);

        // Send error reply
        self.send_error(stanza, XMPP_ERROR_BAD_REQUEST);

        self.get_debug().log('[JSJaCJingle] handle_session_accept_request > Error.', 1);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_accept_request > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_info = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_info', 4);

    try {
      // Security preconditions
      if(!self.util_stanza_safe(stanza)) {
        self.get_debug().log('[JSJaCJingle] handle_session_info > Dropped unsafe stanza.', 0);

        self.send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
        return;
      }

      // Can now safely dispatch the stanza
      switch(stanza.getType()) {
        case JSJAC_JINGLE_STANZA_TYPE_RESULT:
          (self._get_session_info_success())(self, stanza);
          self.handle_session_info_success(stanza);

          break;

        case 'error':
          (self._get_session_info_error())(self, stanza);
          self.handle_session_info_error(stanza);

          break;

        case JSJAC_JINGLE_STANZA_TYPE_SET:
          (self._get_session_info_request())(self, stanza);
          self.handle_session_info_request(stanza);

          break;

        default:
          self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_info > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session info success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_info_success = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_info_success', 4);
  };

  /**
   * Handles the Jingle session info error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_info_error = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_info_error', 4);
  };

  /**
   * Handles the Jingle session info request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_info_request = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_info_request', 4);

    try {
      // Parse stanza
      var info_name = self.util_stanza_session_info(stanza);
      var info_result = false;

      switch(info_name) {
        case JSJAC_JINGLE_SESSION_INFO_ACTIVE:
        case JSJAC_JINGLE_SESSION_INFO_RINGING:
        case JSJAC_JINGLE_SESSION_INFO_MUTE:
        case JSJAC_JINGLE_SESSION_INFO_UNMUTE:
          info_result = true; break;
      }

      if(info_result) {
        self.get_debug().log('[JSJaCJingle] handle_session_info_request > (name: ' + (info_name || 'undefined') + ').', 3);

        // Process info actions
        self.send(JSJAC_JINGLE_STANZA_TYPE_RESULT, { id: stanza.getID() });

        // Trigger info success custom callback
        (self._get_session_info_success())(self, stanza);
        self.handle_session_info_success(stanza);
      } else {
        self.get_debug().log('[JSJaCJingle] handle_session_info_request > Error (name: ' + (info_name || 'undefined') + ').', 1);

        // Send error reply
        self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);

        // Trigger info error custom callback
        (self._get_session_info_error())(self, stanza);
        self.handle_session_info_error(stanza);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_info_request > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session initiate
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_initiate = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_initiate', 4);

    try {
      switch(stanza.getType()) {
        case JSJAC_JINGLE_STANZA_TYPE_RESULT:
          (self._get_session_initiate_success())(self, stanza);
          self.handle_session_initiate_success(stanza);

          break;

        case 'error':
          (self._get_session_initiate_error())(self, stanza);
          self.handle_session_initiate_error(stanza);

          break;

        case JSJAC_JINGLE_STANZA_TYPE_SET:
          (self._get_session_initiate_request())(self, stanza);
          self.handle_session_initiate_request(stanza);

          break;

        default:
          self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_initiate > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session initiate success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_initiate_success = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_initiate_success', 4);

    try {
      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_INITIATED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_initiate_success > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session initiate error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_initiate_error = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_initiate_error', 4);

    try {
      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_INACTIVE);

      // Stop WebRTC
      self._peer_stop();

      // Lock session (cannot be used later)
      self._set_lock(true);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_initiate_error > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session initiate request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_initiate_request = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_initiate_request', 4);

    try {
      // Slot unavailable?
      if(self.get_status() != JSJAC_JINGLE_STATUS_INACTIVE) {
        self.get_debug().log('[JSJaCJingle] handle_session_initiate_request > Cannot handle, resource already initiated (status: ' + self.get_status() + ').', 0);
        self.send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_INITIATING);

      // Common vars
      var rd_from = self.util_stanza_from(stanza);
      var rd_sid  = self.util_stanza_sid(stanza);

      // Request is valid?
      if(rd_sid && self._util_stanza_parse_content(stanza)) {
        // Handle additional data (optional)
        self._util_stanza_parse_group(stanza);

        // Set session values
        self._set_sid(rd_sid);
        self._set_to(rd_from);
        self._set_initiator(rd_from);
        self._set_responder(self.util_connection_jid());

        // Register session to common router
        JSJaCJingle_add(rd_sid, self);

        // Generate and store content data
        self._util_build_content_remote();

        // Video or audio-only session?
        if(JSJAC_JINGLE_MEDIA_VIDEO in self._get_content_remote()) {
          self._set_media(JSJAC_JINGLE_MEDIA_VIDEO);
        } else if(JSJAC_JINGLE_MEDIA_AUDIO in self._get_content_remote()) {
          self._set_media(JSJAC_JINGLE_MEDIA_AUDIO);
        } else {
          // Session initiation not done
          (self._get_session_initiate_error())(self, stanza);
          self.handle_session_initiate_error(stanza);

          // Error (no media is supported)
          self.terminate(JSJAC_JINGLE_REASON_UNSUPPORTED_APPLICATIONS);

          self.get_debug().log('[JSJaCJingle] handle_session_initiate_request > Error (unsupported media).', 1);
          return;
        }

        // Session initiate done
        (self._get_session_initiate_success())(self, stanza);
        self.handle_session_initiate_success(stanza);

        self.send(JSJAC_JINGLE_STANZA_TYPE_RESULT, { id: stanza.getID() });
      } else {
        // Session initiation not done
        (self._get_session_initiate_error())(self, stanza);
        self.handle_session_initiate_error(stanza);

        // Send error reply
        self.send_error(stanza, XMPP_ERROR_BAD_REQUEST);

        self.get_debug().log('[JSJaCJingle] handle_session_initiate_request > Error (bad request).', 1);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_initiate_request > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session terminate
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_terminate = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_terminate', 4);

    try {
      var type = stanza.getType();

      // Security preconditions
      if(!self.util_stanza_safe(stanza)) {
        self.get_debug().log('[JSJaCJingle] handle_session_terminate > Dropped unsafe stanza.', 0);

        self.send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
        return;
      }

      // Can now safely dispatch the stanza
      switch(stanza.getType()) {
        case JSJAC_JINGLE_STANZA_TYPE_RESULT:
          (self._get_session_terminate_success())(self, stanza);
          self.handle_session_terminate_success(stanza);

          break;

        case 'error':
          (self._get_session_terminate_error())(self, stanza);
          self.handle_session_terminate_error(stanza);

          break;

        case JSJAC_JINGLE_STANZA_TYPE_SET:
          (self._get_session_terminate_request())(self, stanza);
          self.handle_session_terminate_request(stanza);

          break;

        default:
          self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_terminate > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session terminate success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_terminate_success = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_terminate_success', 4);

    try {
      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_TERMINATED);

      // Stop WebRTC
      self._peer_stop();
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_terminate_success > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session terminate error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_terminate_error = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_terminate_error', 4);

    try {
      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_TERMINATED);

      // Stop WebRTC
      self._peer_stop();

      // Lock session (cannot be used later)
      self._set_lock(true);

      self.get_debug().log('[JSJaCJingle] handle_session_terminate_error > Forced session termination locally.', 0);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_terminate_error > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle session terminate request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_terminate_request = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_terminate_request', 4);

    try {
      // Slot unavailable?
      if(self.get_status() == JSJAC_JINGLE_STATUS_INACTIVE || self.get_status() == JSJAC_JINGLE_STATUS_TERMINATED) {
        self.get_debug().log('[JSJaCJingle] handle_session_terminate_request > Cannot handle, resource not active (status: ' + self.get_status() + ').', 0);
        self.send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_TERMINATING);

      // Store termination reason
      self._set_reason(self.util_stanza_terminate_reason(stanza));

      // Trigger terminate success callbacks
      (self._get_session_terminate_success())(self, stanza);
      self.handle_session_terminate_success(stanza);

      // Process terminate actions
      self.send(JSJAC_JINGLE_STANZA_TYPE_RESULT, { id: stanza.getID() });

      self.get_debug().log('[JSJaCJingle] handle_session_terminate_request > (reason: ' + self.get_reason() + ').', 3);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_session_terminate_request > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle transport accept
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_transport_accept = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_transport_accept', 4);

    try {
      // Not implemented for now
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_content_accept > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle transport info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_transport_info = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_transport_info', 4);

    try {
      // Slot unavailable?
      if(self.get_status() != JSJAC_JINGLE_STATUS_INITIATED && self.get_status() != JSJAC_JINGLE_STATUS_ACCEPTING && self.get_status() != JSJAC_JINGLE_STATUS_ACCEPTED) {
        self.get_debug().log('[JSJaCJingle] handle_transport_info > Cannot handle, resource not initiated, nor accepting, nor accepted (status: ' + self.get_status() + ').', 0);
        self.send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      // Common vars
      var i, cur_candidate_obj;

      // Parse the incoming transport
      var rd_sid = self.util_stanza_sid(stanza);

      // Request is valid?
      if(rd_sid && self._util_stanza_parse_content(stanza)) {
        // Handle additional data (optional)
        // Still unsure if it is relevant to parse groups there... (are they allowed in such stanza?)
        //self._util_stanza_parse_group(stanza);

        // Re-generate and store new content data
        self._util_build_content_remote();

        var sdp_candidates_remote = self._util_sdp_generate_candidates(
          self._get_candidates_queue_remote()
        );

        // ICE candidates
        for(i in sdp_candidates_remote) {
          cur_candidate_obj = sdp_candidates_remote[i];

          self._get_peer_connection().addIceCandidate(
            new WEBRTC_ICE_CANDIDATE({
              sdpMLineIndex : cur_candidate_obj.id,
              candidate     : cur_candidate_obj.candidate
            })
          );
        }

        // Empty the unapplied candidates queue
        self._set_candidates_queue_remote(null);

        // Success reply
        self.send(JSJAC_JINGLE_STANZA_TYPE_RESULT, { id: stanza.getID() });
      } else {
        // Send error reply
        self.send_error(stanza, XMPP_ERROR_BAD_REQUEST);

        self.get_debug().log('[JSJaCJingle] handle_transport_info > Error.', 1);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_transport_info > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle transport info success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_transport_info_success = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_transport_info_success', 4);
  };

  /**
   * Handles the Jingle transport info error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_transport_info_error = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_transport_info_error', 4);
  };

  /**
   * Handles the Jingle transport reject
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_transport_reject = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_transport_reject', 4);

    try {
      // Not implemented for now
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_transport_reject > ' + e, 1);
    }
  };

  /**
   * Handles the Jingle transport replace
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_transport_replace = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_transport_replace', 4);

    try {
      // Not implemented for now
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] handle_transport_replace > ' + e, 1);
    }
  };



  /**
   * JSJSAC JINGLE SHORTCUTS
   */

  /**
   * Am I responder?
   * @return Receiver state
   * @type boolean
   */
  self.is_responder = function() {
    return self.util_negotiation_status() == JSJAC_JINGLE_SENDERS_RESPONDER.jingle;
  };

  /**
   * Am I initiator?
   * @return Initiator state
   * @type boolean
   */
  self.is_initiator = function() {
    return self.util_negotiation_status() == JSJAC_JINGLE_SENDERS_INITIATOR.jingle;
  };
}
