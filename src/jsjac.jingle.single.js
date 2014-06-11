/**
 * @fileoverview JSJaC Jingle library - Single (one-to-one) call lib
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/**
 * Creates a new XMPP Jingle session.
 * @class Creates a new XMPP Jingle session.
 * @constructor
 * @param {Object} args Jingle session arguments.
 */
var JSJaCJingleSingle = ring.create([__JSJaCJingleBase], {
  /**
   * Constructor
   */
  constructor: function(args) {
    this.$super(args);
  },


  /**
   * Initiates a new Jingle session.
   */
  initiate: function() {
    this.get_debug().log('[JSJaCJingle:single] initiate', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:single] initiate > Cannot initiate, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      var _this = this;

      if(JSJaCJingle.defer(function() { _this.initiate(); })) {
        this.get_debug().log('[JSJaCJingle:single] initiate > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(this.get_status() != JSJAC_JINGLE_STATUS_INACTIVE) {
        this.get_debug().log('[JSJaCJingle:single] initiate > Cannot initiate, resource not inactive (status: ' + this.get_status() + ').', 0);
        return;
      }

      this.get_debug().log('[JSJaCJingle:single] initiate > New Jingle Single session with media: ' + this.get_media(), 2);

      // Common vars
      var i, cur_name;

      // Trigger init pending custom callback
      (this.get_session_initiate_pending())(this);

      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_INITIATING);

      // Set session values
      this.set_sid(this.utils.generate_sid());
      this.set_initiator(this.utils.connection_jid());
      this.set_responder(this.get_to());

      for(i in this.get_media_all()) {
        cur_name = this.utils.name_generate(
          this.get_media_all()[i]
        );

        this.set_name(cur_name);

        this.set_senders(
          cur_name,
          JSJAC_JINGLE_SENDERS_BOTH.jingle
        );

        this.set_creator(
          cur_name,
          JSJAC_JINGLE_CREATOR_INITIATOR
        );
      }

      // Register session to common router
      JSJaCJingle.add(this.get_sid(), this);

      // Initialize WebRTC
      this.peer.get_user_media(function() {
        _this.peer.connection_create(function() {
          _this.get_debug().log('[JSJaCJingle:single] initiate > Ready to begin Jingle negotiation.', 2);

          _this.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_INITIATE });
        });
      });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] initiate > ' + e, 1);
    }
  },

  /**
   * Accepts the Jingle session.
   */
  accept: function() {
    this.get_debug().log('[JSJaCJingle:single] accept', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:single] accept > Cannot accept, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      var _this = this;

      if(JSJaCJingle.defer(function() { _this.accept(); })) {
        this.get_debug().log('[JSJaCJingle:single] accept > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(this.get_status() != JSJAC_JINGLE_STATUS_INITIATED) {
        this.get_debug().log('[JSJaCJingle:single] accept > Cannot accept, resource not initiated (status: ' + this.get_status() + ').', 0);
        return;
      }

      this.get_debug().log('[JSJaCJingle:single] accept > New Jingle session with media: ' + this.get_media(), 2);

      // Trigger accept pending custom callback
      (this.get_session_accept_pending())(this);

      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_ACCEPTING);

      // Initialize WebRTC
      this.peer.get_user_media(function() {
        _this.peer.connection_create(function() {
          _this.get_debug().log('[JSJaCJingle:single] accept > Ready to complete Jingle negotiation.', 2);

          // Process accept actions
          _this.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_ACCEPT });
        });
      });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] accept > ' + e, 1);
    }
  },

  /**
   * Sends a Jingle session info.
   */
  info: function(name, args) {
    this.get_debug().log('[JSJaCJingle:single] info', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:single] info > Cannot accept, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      var _this = this;

      if(JSJaCJingle.defer(function() { _this.info(name, args); })) {
        this.get_debug().log('[JSJaCJingle:single] info > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(!(this.get_status() == JSJAC_JINGLE_STATUS_INITIATED || this.get_status() == JSJAC_JINGLE_STATUS_ACCEPTING || this.get_status() == JSJAC_JINGLE_STATUS_ACCEPTED)) {
        this.get_debug().log('[JSJaCJingle:single] info > Cannot send info, resource not active (status: ' + this.get_status() + ').', 0);
        return;
      }

      // Assert
      if(typeof args !== 'object') args = {};

      // Build final args parameter
      args.action = JSJAC_JINGLE_ACTION_SESSION_INFO;
      if(name) args.info = name;

      this.send(JSJAC_JINGLE_STANZA_TYPE_SET, args);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] info > ' + e, 1);
    }
  },

  /**
   * Terminates the Jingle session.
   */
  terminate: function(reason) {
    this.get_debug().log('[JSJaCJingle:single] terminate', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:single] terminate > Cannot terminate, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      var _this = this;

      if(JSJaCJingle.defer(function() { _this.terminate(reason); })) {
        this.get_debug().log('[JSJaCJingle:single] terminate > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(this.get_status() == JSJAC_JINGLE_STATUS_TERMINATED) {
        this.get_debug().log('[JSJaCJingle:single] terminate > Cannot terminate, resource already terminated (status: ' + this.get_status() + ').', 0);
        return;
      }

      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_TERMINATING);

      // Trigger terminate pending custom callback
      (this.get_session_terminate_pending())(this);

      // Process terminate actions
      this.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_TERMINATE, reason: reason });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] terminate > ' + e, 1);
    }
  },

  /**
   * Sends a given Jingle stanza packet
   */
  send: function(type, args) {
    this.get_debug().log('[JSJaCJingle:single] send', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:single] send > Cannot send, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      var _this = this;

      if(JSJaCJingle.defer(function() { _this.send(type, args); })) {
        this.get_debug().log('[JSJaCJingle:single] send > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Assert
      if(typeof args !== 'object') args = {};

      // Build stanza
      var stanza = new JSJaCIQ();
      stanza.setTo(this.get_to());

      if(type) stanza.setType(type);

      if(!args.id) args.id = this.get_id_new();
      stanza.setID(args.id);

      if(type == JSJAC_JINGLE_STANZA_TYPE_SET) {
        if(!(args.action && args.action in JSJAC_JINGLE_ACTIONS)) {
          this.get_debug().log('[JSJaCJingle:single] send > Stanza action unknown: ' + (args.action || 'undefined'), 1);
          return;
        }

        this.set_sent_id(args.id);

        // Submit to registered handler
        switch(args.action) {
          case JSJAC_JINGLE_ACTION_CONTENT_ACCEPT:
            this.send_content_accept(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_ADD:
            this.send_content_add(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_MODIFY:
            this.send_content_modify(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_REJECT:
            this.send_content_reject(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_REMOVE:
            this.send_content_remove(stanza); break;

          case JSJAC_JINGLE_ACTION_DESCRIPTION_INFO:
            this.send_description_info(stanza); break;

          case JSJAC_JINGLE_ACTION_SECURITY_INFO:
            this.send_security_info(stanza); break;

          case JSJAC_JINGLE_ACTION_SESSION_ACCEPT:
            this.send_session_accept(stanza, args); break;

          case JSJAC_JINGLE_ACTION_SESSION_INFO:
            this.send_session_info(stanza, args); break;

          case JSJAC_JINGLE_ACTION_SESSION_INITIATE:
            this.send_session_initiate(stanza, args); break;

          case JSJAC_JINGLE_ACTION_SESSION_TERMINATE:
            this.send_session_terminate(stanza, args); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT:
            this.send_transport_accept(stanza); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_INFO:
            this.send_transport_info(stanza, args); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_REJECT:
            this.send_transport_reject(stanza); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE:
            this.send_transport_replace(stanza); break;

          default:
            this.get_debug().log('[JSJaCJingle:single] send > Unexpected error.', 1);

            return false;
        }
      } else if(type != JSJAC_JINGLE_STANZA_TYPE_RESULT) {
        this.get_debug().log('[JSJaCJingle:single] send > Stanza type must either be set or result.', 1);

        return false;
      }

      JSJAC_JINGLE_STORE_CONNECTION.send(stanza);

      if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:single] Outgoing packet sent' + '\n\n' + stanza.xml());

      return true;
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send > ' + e, 1);
    }

    return false;
  },

  /**
   * Handles a given Jingle stanza response
   */
  handle: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle', 4);

    try {
      if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:single] Incoming packet received' + '\n\n' + stanza.xml());

      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:single] handle > Cannot handle, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      var _this = this;

      if(JSJaCJingle.defer(function() { _this.handle(stanza); })) {
        this.get_debug().log('[JSJaCJingle:single] handle > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      var id   = stanza.getID();
      var type = stanza.getType();

      if(id && type == JSJAC_JINGLE_STANZA_TYPE_RESULT)  this.set_received_id(id);

      // Submit to custom handler
      if(typeof this.get_handlers(type, id) == 'function') {
        this.get_debug().log('[JSJaCJingle:single] handle > Submitted to custom handler.', 2);

        (this.get_handlers(type, id))(stanza);
        this.unregister_handler(type, id);

        return;
      }

      var jingle = this.utils.stanza_jingle(stanza);

      // Don't handle non-Jingle stanzas there...
      if(!jingle) return;

      var action = this.utils.stanza_get_attribute(jingle, 'action');

      // Don't handle action-less Jingle stanzas there...
      if(!action) return;

      // Submit to registered handler
      switch(action) {
        case JSJAC_JINGLE_ACTION_CONTENT_ACCEPT:
          this.handle_content_accept(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_ADD:
          this.handle_content_add(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_MODIFY:
          this.handle_content_modify(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_REJECT:
          this.handle_content_reject(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_REMOVE:
          this.handle_content_remove(stanza); break;

        case JSJAC_JINGLE_ACTION_DESCRIPTION_INFO:
          this.handle_description_info(stanza); break;

        case JSJAC_JINGLE_ACTION_SECURITY_INFO:
          this.handle_security_info(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_ACCEPT:
          this.handle_session_accept(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_INFO:
          this.handle_session_info(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_INITIATE:
          this.handle_session_initiate(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_TERMINATE:
          this.handle_session_terminate(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT:
          this.handle_transport_accept(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_INFO:
          this.handle_transport_info(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_REJECT:
          this.handle_transport_reject(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE:
          this.handle_transport_replace(stanza); break;
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle > ' + e, 1);
    }
  },

  /**
   * Mutes a Jingle session (local)
   */
  mute: function(name) {
    this.get_debug().log('[JSJaCJingle:single] mute', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:single] mute > Cannot mute, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      var _this = this;

      if(JSJaCJingle.defer(function() { _this.mute(name); })) {
        this.get_debug().log('[JSJaCJingle:single] mute > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Already muted?
      if(this.get_mute(name)) {
        this.get_debug().log('[JSJaCJingle:single] mute > Resource already muted.', 0);
        return;
      }

      this.peer.sound(false);
      this.set_mute(name, true);

      this.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_INFO, info: JSJAC_JINGLE_SESSION_INFO_MUTE, name: name });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] mute > ' + e, 1);
    }
  },

  /**
   * Unmutes a Jingle session (local)
   */
  unmute: function(name) {
    this.get_debug().log('[JSJaCJingle:single] unmute', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:single] unmute > Cannot unmute, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      var _this = this;

      if(JSJaCJingle.defer(function() { _this.unmute(name); })) {
        this.get_debug().log('[JSJaCJingle:single] unmute > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Already unmute?
      if(!this.get_mute(name)) {
        this.get_debug().log('[JSJaCJingle:single] unmute > Resource already unmuted.', 0);
        return;
      }

      this.peer.sound(true);
      this.set_mute(name, false);

      this.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_INFO, info: JSJAC_JINGLE_SESSION_INFO_UNMUTE, name: name });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] unmute > ' + e, 1);
    }
  },

  /**
   * Toggles media type in a Jingle session
   */
  media: function(media) {
    /* DEV: don't expect this to work as of now! */

    this.get_debug().log('[JSJaCJingle:single] media', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:single] media > Cannot change media, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      var _this = this;

      if(JSJaCJingle.defer(function() { _this.media(media); })) {
        this.get_debug().log('[JSJaCJingle:single] media > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Toggle media?
      if(!media)
        media = (this.get_media() == JSJAC_JINGLE_MEDIA_VIDEO) ? JSJAC_JINGLE_MEDIA_AUDIO : JSJAC_JINGLE_MEDIA_VIDEO;

      // Media unknown?
      if(!(media in JSJAC_JINGLE_MEDIAS)) {
        this.get_debug().log('[JSJaCJingle:single] media > No media provided or media unsupported (media: ' + media + ').', 0);
        return;
      }

      // Already using provided media?
      if(this.get_media() == media) {
        this.get_debug().log('[JSJaCJingle:single] media > Resource already using this media (media: ' + media + ').', 0);
        return;
      }

      // Switch locked for now? (another one is being processed)
      if(this.get_media_busy()) {
        this.get_debug().log('[JSJaCJingle:single] media > Resource already busy switching media (busy: ' + this.get_media() + ', media: ' + media + ').', 0);
        return;
      }

      this.get_debug().log('[JSJaCJingle:single] media > Changing media to: ' + media + '...', 2);

      // Store new media
      this.set_media(media);
      this.set_media_busy(true);

      // Toggle video mode (add/remove)
      if(media == JSJAC_JINGLE_MEDIA_VIDEO) {
        // TODO: the flow is something like that...
        /*this.peer.get_user_media(function() {
          this.peer.connection_create(function() {
            this.get_debug().log('[JSJaCJingle:single] media > Ready to change media (to: ' + media + ').', 2);

            // 'content-add' >> video
            // TODO: restart video stream configuration

            // WARNING: only change get user media, DO NOT TOUCH THE STREAM THING (don't stop active stream as it's flowing!!)

            this.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_CONTENT_ADD, name: JSJAC_JINGLE_MEDIA_VIDEO });
          })
        });*/
      } else {
        // TODO: the flow is something like that...
        /*this.peer.get_user_media(function() {
          this.peer.connection_create(function() {
            this.get_debug().log('[JSJaCJingle:single] media > Ready to change media (to: ' + media + ').', 2);

            // 'content-remove' >> video
            // TODO: remove video stream configuration

            // WARNING: only change get user media, DO NOT TOUCH THE STREAM THING (don't stop active stream as it's flowing!!)
            //          here, only stop the video stream, do not touch the audio stream

            this.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_CONTENT_REMOVE, name: JSJAC_JINGLE_MEDIA_VIDEO });
          })
        });*/
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] media > ' + e, 1);
    }
  },

  /**
   * Registers a given handler on a given Jingle stanza
   */
  register_handler: function(type, id, fn) {
    this.get_debug().log('[JSJaCJingle:single] register_handler', 4);

    try {
      type = type || JSJAC_JINGLE_STANZA_TYPE_ALL;

      if(typeof fn !== 'function') {
        this.get_debug().log('[JSJaCJingle:single] register_handler > fn parameter not passed or not a function!', 1);
        return false;
      }

      if(id) {
        this.set_handlers(type, id, fn);

        this.get_debug().log('[JSJaCJingle:single] register_handler > Registered handler for id: ' + id + ' and type: ' + type, 3);
        return true;
      } else {
        this.get_debug().log('[JSJaCJingle:single] register_handler > Could not register handler (no ID).', 1);
        return false;
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] register_handler > ' + e, 1);
    }

    return false;
  },

  /**
   * Unregisters the given handler on a given Jingle stanza
   */
  unregister_handler: function(type, id) {
    this.get_debug().log('[JSJaCJingle:single] unregister_handler', 4);

    try {
      type = type || JSJAC_JINGLE_STANZA_TYPE_ALL;

      if(type in this._handlers && id in this._handlers[type]) {
        delete this._handlers[type][id];

        this.get_debug().log('[JSJaCJingle:single] unregister_handler > Unregistered handler for id: ' + id + ' and type: ' + type, 3);
        return true;
      } else {
        this.get_debug().log('[JSJaCJingle:single] unregister_handler > Could not unregister handler with id: ' + id + ' and type: ' + type + ' (not found).', 2);
        return false;
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] unregister_handler > ' + e, 1);
    }

    return false;
  },

  /**
   * Registers a view element
   */
  register_view: function(type, view) {
    this.get_debug().log('[JSJaCJingle:single] register_view', 4);

    try {
      // Get view functions
      var fn = this.utils.map_register_view(type);

      if(fn.type == type) {
        var i;

        // Check view is not already registered
        for(i in (fn.view.get)()) {
          if((fn.view.get)()[i] == view) {
            this.get_debug().log('[JSJaCJingle:single] register_view > Could not register view of type: ' + type + ' (already registered).', 2);
            return true;
          }
        }

        // Proceeds registration
        (fn.view.set)(view);

        this.utils.peer_stream_attach(
          [view],
          (fn.stream.get)(),
          fn.mute
        );

        this.get_debug().log('[JSJaCJingle:single] register_view > Registered view of type: ' + type, 3);

        return true;
      } else {
        this.get_debug().log('[JSJaCJingle:single] register_view > Could not register view of type: ' + type + ' (type unknown).', 1);
        return false;
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] register_view > ' + e, 1);
    }

    return false;
  },

  /**
   * Unregisters a view element
   */
  unregister_view: function(type, view) {
    this.get_debug().log('[JSJaCJingle:single] unregister_view', 4);

    try {
      // Get view functions
      var fn = this.utils.map_unregister_view(type);

      if(fn.type == type) {
        var i;

        // Check view is registered
        for(i in (fn.view.get)()) {
          if((fn.view.get)()[i] == view) {
            // Proceeds un-registration
            this.utils.peer_stream_detach(
              [view]
            );

            this.utils.array_remove_value(
              (fn.view.get)(),
              view
            );

            this.get_debug().log('[JSJaCJingle:single] unregister_view > Unregistered view of type: ' + type, 3);
            return true;
          }
        }

        this.get_debug().log('[JSJaCJingle:single] unregister_view > Could not unregister view of type: ' + type + ' (not found).', 2);
        return true;
      } else {
        this.get_debug().log('[JSJaCJingle:single] unregister_view > Could not unregister view of type: ' + type + ' (type unknown).', 1);
        return false;
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] unregister_view > ' + e, 1);
    }

    return false;
  },


  /**
   * JSJSAC JINGLE SENDERS
   */

  /**
   * Sends the Jingle content accept
   */
  send_content_accept: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] send_content_accept', 4);

    try {
      // TODO: remove from remote 'content-add' queue
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] send_content_accept > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_content_accept > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle content add
   */
  send_content_add: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] send_content_add', 4);

    try {
      // TODO: push to local 'content-add' queue

      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] send_content_add > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_content_add > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle content modify
   */
  send_content_modify: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] send_content_modify', 4);

    try {
      // TODO: push to local 'content-modify' queue

      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] send_content_modify > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_content_modify > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle content reject
   */
  send_content_reject: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] send_content_reject', 4);

    try {
      // TODO: remove from remote 'content-add' queue

      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] send_content_reject > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_content_reject > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle content remove
   */
  send_content_remove: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] send_content_remove', 4);

    try {
      // TODO: add to local 'content-remove' queue

      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] send_content_remove > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_content_remove > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle description info
   */
  send_description_info: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] send_description_info', 4);

    try {
      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] send_description_info > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_description_info > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle security info
   */
  send_security_info: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] send_security_info', 4);

    try {
      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] send_security_info > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_security_info > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle session accept
   */
  send_session_accept: function(stanza, args) {
    this.get_debug().log('[JSJaCJingle:single] send_session_accept', 4);

    try {
      if(this.get_status() != JSJAC_JINGLE_STATUS_ACCEPTING) {
        this.get_debug().log('[JSJaCJingle:single] send_session_accept > Cannot send accept stanza, resource not accepting (status: ' + this.get_status() + ').', 0);
        this.send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      if(!args) {
          this.get_debug().log('[JSJaCJingle:single] send_session_accept > Argument not provided.', 1);
          return;
      }

      // Build Jingle stanza
      var jingle = this.utils.stanza_generate_jingle(stanza, {
        'action'    : JSJAC_JINGLE_ACTION_SESSION_ACCEPT,
        'responder' : this.get_responder()
      });

      this.utils.stanza_generate_content_local(stanza, jingle);
      this.utils.stanza_generate_group_local(stanza, jingle);

      // Schedule success
      var _this = this;

      this.register_handler(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, function(stanza) {
        (_this.get_session_accept_success())(_this, stanza);
        _this.handle_session_accept_success(stanza);
      });

      // Schedule error timeout
      this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, {
        external:   this.get_session_accept_error(),
        internal:   this.handle_session_accept_error
      });

      this.get_debug().log('[JSJaCJingle:single] send_session_accept > Sent.', 4);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_session_accept > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle session info
   */
  send_session_info: function(stanza, args) {
    this.get_debug().log('[JSJaCJingle:single] send_session_info', 4);

    try {
      if(!args) {
        this.get_debug().log('[JSJaCJingle:single] send_session_info > Argument not provided.', 1);
        return;
      }

      // Filter info
      args.info = args.info || JSJAC_JINGLE_SESSION_INFO_ACTIVE;

      // Build Jingle stanza
      var jingle = this.utils.stanza_generate_jingle(stanza, {
        'action'    : JSJAC_JINGLE_ACTION_SESSION_INFO,
        'initiator' : this.get_initiator()
      });

      this.utils.stanza_generate_session_info(stanza, jingle, args);

      // Schedule success
      var _this = this;

      this.register_handler(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, function(stanza) {
        (_this.get_session_info_success())(this, stanza);
        _this.handle_session_info_success(stanza);
      });

      // Schedule error timeout
      this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, {
        external:   this.get_session_info_error(),
        internal:   this.handle_session_info_error
      });

      this.get_debug().log('[JSJaCJingle:single] send_session_info > Sent (name: ' + args.info + ').', 2);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_session_info > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle session initiate
   */
  send_session_initiate: function(stanza, args) {
    this.get_debug().log('[JSJaCJingle:single] send_session_initiate', 4);

    try {
      if(this.get_status() != JSJAC_JINGLE_STATUS_INITIATING) {
        this.get_debug().log('[JSJaCJingle:single] send_session_initiate > Cannot send initiate stanza, resource not initiating (status: ' + this.get_status() + ').', 0);
        return;
      }

      if(!args) {
        this.get_debug().log('[JSJaCJingle:single] send_session_initiate > Argument not provided.', 1);
        return;
      }

      // Build Jingle stanza
      var jingle = this.utils.stanza_generate_jingle(stanza, {
        'action'    : JSJAC_JINGLE_ACTION_SESSION_INITIATE,
        'initiator' : this.get_initiator()
      });

      this.utils.stanza_generate_content_local(stanza, jingle);
      this.utils.stanza_generate_group_local(stanza, jingle);

      // Schedule success
      var _this = this;
      
      this.register_handler(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, function(stanza) {
        (_this.get_session_initiate_success())(_this, stanza);
        _this.handle_session_initiate_success(stanza);
      });

      // Schedule error timeout
      this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, {
        external:   this.get_session_initiate_error(),
        internal:   this.handle_session_initiate_error
      });

      this.get_debug().log('[JSJaCJingle:single] send_session_initiate > Sent.', 2);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_session_initiate > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle session terminate
   */
  send_session_terminate: function(stanza, args) {
    this.get_debug().log('[JSJaCJingle:single] send_session_terminate', 4);

    try {
      if(this.get_status() != JSJAC_JINGLE_STATUS_TERMINATING) {
        this.get_debug().log('[JSJaCJingle:single] send_session_terminate > Cannot send terminate stanza, resource not terminating (status: ' + this.get_status() + ').', 0);
        return;
      }

      if(!args) {
        this.get_debug().log('[JSJaCJingle:single] send_session_terminate > Argument not provided.', 1);
        return;
      }

      // Filter reason
      args.reason = args.reason || JSJAC_JINGLE_REASON_SUCCESS;

      // Store terminate reason
      this.set_reason(args.reason);

      // Build terminate stanza
      var jingle = this.utils.stanza_generate_jingle(stanza, {
        'action': JSJAC_JINGLE_ACTION_SESSION_TERMINATE
      });

      var jingle_reason = jingle.appendChild(stanza.buildNode('reason', {'xmlns': NS_JINGLE}));
      jingle_reason.appendChild(stanza.buildNode(args.reason, {'xmlns': NS_JINGLE}));

      // Schedule success
      var _this = this;
      
      this.register_handler(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, function(stanza) {
        (_this.get_session_terminate_success())(_this, stanza);
        _this.handle_session_terminate_success(stanza);
      });

      // Schedule error timeout
      this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, {
        external:   this.get_session_terminate_error(),
        internal:   this.handle_session_terminate_error
      });

      this.get_debug().log('[JSJaCJingle:single] send_session_terminate > Sent (reason: ' + args.reason + ').', 2);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_session_terminate > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle transport accept
   */
  send_transport_accept: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] send_transport_accept', 4);

    try {
      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] send_transport_accept > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_transport_accept > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle transport info
   */
  send_transport_info: function(stanza, args) {
    this.get_debug().log('[JSJaCJingle:single] send_transport_info', 4);

    try {
      if(this.get_status() != JSJAC_JINGLE_STATUS_INITIATED && this.get_status() != JSJAC_JINGLE_STATUS_ACCEPTING && this.get_status() != JSJAC_JINGLE_STATUS_ACCEPTED) {
        this.get_debug().log('[JSJaCJingle:single] send_transport_info > Cannot send transport info, resource not initiated, nor accepting, nor accepted (status: ' + this.get_status() + ').', 0);
        return;
      }

      if(!args) {
        this.get_debug().log('[JSJaCJingle:single] send_transport_info > Argument not provided.', 1);
        return;
      }

      if(this.utils.object_length(this.get_candidates_queue_local()) === 0) {
        this.get_debug().log('[JSJaCJingle:single] send_transport_info > No local candidate in queue.', 1);
        return;
      }

      // Build Jingle stanza
      var jingle = this.utils.stanza_generate_jingle(stanza, {
        'action'    : JSJAC_JINGLE_ACTION_TRANSPORT_INFO,
        'initiator' : this.get_initiator()
      });

      // Build queue content
      var cur_name;
      var content_queue_local = {};

      for(cur_name in this.get_name()) {
        content_queue_local[cur_name] = this.utils.generate_content(
            this.get_creator(cur_name),
            cur_name,
            this.get_senders(cur_name),
            this.get_payloads_local(cur_name),
            this.get_candidates_queue_local(cur_name)
        );
      }

      this.utils.stanza_generate_content_local(stanza, jingle, content_queue_local);
      this.utils.stanza_generate_group_local(stanza, jingle);

      // Schedule success
      var _this = this;
      
      this.register_handler(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, function(stanza) {
        _this.handle_transport_info_success(stanza);
      });

      // Schedule error timeout
      this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_TYPE_RESULT, args.id, {
        internal: this.handle_transport_info_error
      });

      this.get_debug().log('[JSJaCJingle:single] send_transport_info > Sent.', 2);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_transport_info > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle transport reject
   */
  send_transport_reject: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] send_transport_reject', 4);

    try {
      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] send_transport_reject > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_transport_reject > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle transport replace
   */
  send_transport_replace: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] send_transport_replace', 4);

    try {
      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] send_transport_replace > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_transport_replace > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle transport replace
   */
  send_error: function(stanza, error) {
    this.get_debug().log('[JSJaCJingle:single] send_error', 4);

    try {
      // Assert
      if(!('type' in error)) {
        this.get_debug().log('[JSJaCJingle:single] send_error > Type unknown.', 1);
        return;
      }

      if('jingle' in error && !(error.jingle in JSJAC_JINGLE_ERRORS)) {
        this.get_debug().log('[JSJaCJingle:single] send_error > Jingle condition unknown (' + error.jingle + ').', 1);
        return;
      }

      if('xmpp' in error && !(error.xmpp in XMPP_ERRORS)) {
        this.get_debug().log('[JSJaCJingle:single] send_error > XMPP condition unknown (' + error.xmpp + ').', 1);
        return;
      }

      var stanza_error = new JSJaCIQ();

      stanza_error.setType('error');
      stanza_error.setID(stanza.getID());
      stanza_error.setTo(this.get_to());

      var error_node = stanza_error.getNode().appendChild(stanza_error.buildNode('error', {'xmlns': NS_CLIENT, 'type': error.type}));

      if('xmpp'   in error) error_node.appendChild(stanza_error.buildNode(error.xmpp,   { 'xmlns': NS_STANZAS       }));
      if('jingle' in error) error_node.appendChild(stanza_error.buildNode(error.jingle, { 'xmlns': NS_JINGLE_ERRORS }));

      JSJAC_JINGLE_STORE_CONNECTION.send(stanza_error);

      this.get_debug().log('[JSJaCJingle:single] send_error > Sent: ' + (error.jingle || error.xmpp), 2);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send_error > ' + e, 1);
    }
  },



  /**
   * JSJSAC JINGLE HANDLERS
   */

  /**
   * Handles the Jingle content accept
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_content_accept: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_content_accept', 4);

    try {
      // TODO: start to flow accepted stream
      // TODO: remove accepted content from local 'content-add' queue
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_content_accept > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle content add
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_content_add: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_content_add', 4);

    try {
      // TODO: request the user to start this content (need a custom handler)
      //       on accept: send content-accept
      // TODO: push to remote 'content-add' queue
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_content_add > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle content modify
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_content_modify: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_content_modify', 4);

    try {
      // TODO: change 'senders' value (direction of the stream)
      //       if(send:from_me): notify the user that media is requested
      //       if(unacceptable): terminate the session
      //       if(accepted):     change local/remote SDP
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_content_modify > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle content reject
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_content_reject: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_content_reject', 4);

    try {
      // TODO: remove rejected content from local 'content-add' queue

      // Not implemented for now
      this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_content_reject > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle content remove
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_content_remove: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_content_remove', 4);

    try {
      // TODO: stop flowing removed stream
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_content_remove > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle description info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_description_info: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_description_info', 4);

    try {
      // Not implemented for now
      this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_description_info > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle security info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_security_info: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_security_info', 4);

    try {
      // Not implemented for now
      this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_security_info > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session accept
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_accept: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_accept', 4);

    try {
      // Security preconditions
      if(!this.utils.stanza_safe(stanza)) {
        this.get_debug().log('[JSJaCJingle:single] handle_session_accept > Dropped unsafe stanza.', 0);

        this.send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
        return;
      }

      // Can now safely dispatch the stanza
      switch(stanza.getType()) {
        case JSJAC_JINGLE_STANZA_TYPE_RESULT:
          (this.get_session_accept_success())(this, stanza);
          this.handle_session_accept_success(stanza);

          break;

        case 'error':
          (this.get_session_accept_error())(this, stanza);
          this.handle_session_accept_error(stanza);

          break;

        case JSJAC_JINGLE_STANZA_TYPE_SET:
          // External handler must be set before internal one here...
          (this.get_session_accept_request())(this, stanza);
          this.handle_session_accept_request(stanza);

          break;

        default:
          this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_accept > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session accept success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_accept_success: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_accept_success', 4);

    try {
      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_ACCEPTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_accept_success > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session accept error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_accept_error: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_accept_error', 4);

    try {
      // Terminate the session (timeout)
      this.terminate(JSJAC_JINGLE_REASON_TIMEOUT);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_accept_error > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session accept request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_accept_request: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_accept_request', 4);

    try {
      // Slot unavailable?
      if(this.get_status() != JSJAC_JINGLE_STATUS_INITIATED) {
        this.get_debug().log('[JSJaCJingle:single] handle_session_accept_request > Cannot handle, resource already accepted (status: ' + this.get_status() + ').', 0);
        this.send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      // Common vars
      var i, cur_candidate_obj;

      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_ACCEPTING);

      var rd_sid = this.utils.stanza_sid(stanza);

      // Request is valid?
      if(rd_sid && this.is_initiator() && this.utils.stanza_parse_content(stanza)) {
        // Handle additional data (optional)
        this.utils.stanza_parse_group(stanza);

        // Generate and store content data
        this.utils.build_content_remote();

        // Trigger accept success callback
        (this.get_session_accept_success())(this, stanza);
        this.handle_session_accept_success(stanza);

        var sdp_remote = this.sdp.generate(
          WEBRTC_SDP_TYPE_ANSWER,
          this.get_group_remote(),
          this.get_payloads_remote(),
          this.get_candidates_queue_remote()
        );

        if(this.get_sdp_trace())  this.get_debug().log('[JSJaCJingle:single] SDP (remote)' + '\n\n' + sdp_remote.description.sdp, 4);

        // Remote description
        var _this = this;
        
        this.get_peer_connection().setRemoteDescription(
          (new WEBRTC_SESSION_DESCRIPTION(sdp_remote.description)),

          function() {
            // Success (descriptions are compatible)
          },

          function(e) {
            if(_this.get_sdp_trace())  _this.get_debug().log('[JSJaCJingle:single] SDP (remote:error)' + '\n\n' + (e.message || e.name || 'Unknown error'), 4);

            // Error (descriptions are incompatible)
            _this.terminate(JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS);
          }
        );

        // ICE candidates
        for(i in sdp_remote.candidates) {
          cur_candidate_obj = sdp_remote.candidates[i];

          this.get_peer_connection().addIceCandidate(
            new WEBRTC_ICE_CANDIDATE({
              sdpMLineIndex : cur_candidate_obj.id,
              candidate     : cur_candidate_obj.candidate
            })
          );
        }

        // Empty the unapplied candidates queue
        this.set_candidates_queue_remote(null);

        // Success reply
        this.send(JSJAC_JINGLE_STANZA_TYPE_RESULT, { id: stanza.getID() });
      } else {
        // Trigger accept error callback
        (this.get_session_accept_error())(this, stanza);
        this.handle_session_accept_error(stanza);

        // Send error reply
        this.send_error(stanza, XMPP_ERROR_BAD_REQUEST);

        this.get_debug().log('[JSJaCJingle:single] handle_session_accept_request > Error.', 1);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_accept_request > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_info: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_info', 4);

    try {
      // Security preconditions
      if(!this.utils.stanza_safe(stanza)) {
        this.get_debug().log('[JSJaCJingle:single] handle_session_info > Dropped unsafe stanza.', 0);

        this.send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
        return;
      }

      // Can now safely dispatch the stanza
      switch(stanza.getType()) {
        case JSJAC_JINGLE_STANZA_TYPE_RESULT:
          (this.get_session_info_success())(this, stanza);
          this.handle_session_info_success(stanza);

          break;

        case 'error':
          (this.get_session_info_error())(this, stanza);
          this.handle_session_info_error(stanza);

          break;

        case JSJAC_JINGLE_STANZA_TYPE_SET:
          (this.get_session_info_request())(this, stanza);
          this.handle_session_info_request(stanza);

          break;

        default:
          this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_info > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session info success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_info_success: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_info_success', 4);
  },

  /**
   * Handles the Jingle session info error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_info_error: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_info_error', 4);
  },

  /**
   * Handles the Jingle session info request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_info_request: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_info_request', 4);

    try {
      // Parse stanza
      var info_name = this.utils.stanza_session_info(stanza);
      var info_result = false;

      switch(info_name) {
        case JSJAC_JINGLE_SESSION_INFO_ACTIVE:
        case JSJAC_JINGLE_SESSION_INFO_RINGING:
        case JSJAC_JINGLE_SESSION_INFO_MUTE:
        case JSJAC_JINGLE_SESSION_INFO_UNMUTE:
          info_result = true; break;
      }

      if(info_result) {
        this.get_debug().log('[JSJaCJingle:single] handle_session_info_request > (name: ' + (info_name || 'undefined') + ').', 3);

        // Process info actions
        this.send(JSJAC_JINGLE_STANZA_TYPE_RESULT, { id: stanza.getID() });

        // Trigger info success custom callback
        (this.get_session_info_success())(this, stanza);
        this.handle_session_info_success(stanza);
      } else {
        this.get_debug().log('[JSJaCJingle:single] handle_session_info_request > Error (name: ' + (info_name || 'undefined') + ').', 1);

        // Send error reply
        this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);

        // Trigger info error custom callback
        (this.get_session_info_error())(this, stanza);
        this.handle_session_info_error(stanza);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_info_request > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session initiate
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_initiate: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_initiate', 4);

    try {
      switch(stanza.getType()) {
        case JSJAC_JINGLE_STANZA_TYPE_RESULT:
          (this.get_session_initiate_success())(this, stanza);
          this.handle_session_initiate_success(stanza);

          break;

        case 'error':
          (this.get_session_initiate_error())(this, stanza);
          this.handle_session_initiate_error(stanza);

          break;

        case JSJAC_JINGLE_STANZA_TYPE_SET:
          (this.get_session_initiate_request())(this, stanza);
          this.handle_session_initiate_request(stanza);

          break;

        default:
          this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_initiate > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session initiate success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_initiate_success: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_initiate_success', 4);

    try {
      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_INITIATED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_initiate_success > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session initiate error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_initiate_error: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_initiate_error', 4);

    try {
      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_INACTIVE);

      // Stop WebRTC
      this.peer.stop();

      // Lock session (cannot be used later)
      this.set_lock(true);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_initiate_error > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session initiate request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_initiate_request: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_initiate_request', 4);

    try {
      // Slot unavailable?
      if(this.get_status() != JSJAC_JINGLE_STATUS_INACTIVE) {
        this.get_debug().log('[JSJaCJingle:single] handle_session_initiate_request > Cannot handle, resource already initiated (status: ' + this.get_status() + ').', 0);
        this.send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_INITIATING);

      // Common vars
      var rd_from = this.utils.stanza_from(stanza);
      var rd_sid  = this.utils.stanza_sid(stanza);

      // Request is valid?
      if(rd_sid && this.utils.stanza_parse_content(stanza)) {
        // Handle additional data (optional)
        this.utils.stanza_parse_group(stanza);

        // Set session values
        this.set_sid(rd_sid);
        this.set_to(rd_from);
        this.set_initiator(rd_from);
        this.set_responder(this.utils.connection_jid());

        // Register session to common router
        JSJaCJingle.add(rd_sid, this);

        // Generate and store content data
        this.utils.build_content_remote();

        // Video or audio-only session?
        if(JSJAC_JINGLE_MEDIA_VIDEO in this.get_content_remote()) {
          this.set_media(JSJAC_JINGLE_MEDIA_VIDEO);
        } else if(JSJAC_JINGLE_MEDIA_AUDIO in this.get_content_remote()) {
          this.set_media(JSJAC_JINGLE_MEDIA_AUDIO);
        } else {
          // Session initiation not done
          (this.get_session_initiate_error())(this, stanza);
          this.handle_session_initiate_error(stanza);

          // Error (no media is supported)
          this.terminate(JSJAC_JINGLE_REASON_UNSUPPORTED_APPLICATIONS);

          this.get_debug().log('[JSJaCJingle:single] handle_session_initiate_request > Error (unsupported media).', 1);
          return;
        }

        // Session initiate done
        (this.get_session_initiate_success())(this, stanza);
        this.handle_session_initiate_success(stanza);

        this.send(JSJAC_JINGLE_STANZA_TYPE_RESULT, { id: stanza.getID() });
      } else {
        // Session initiation not done
        (this.get_session_initiate_error())(this, stanza);
        this.handle_session_initiate_error(stanza);

        // Send error reply
        this.send_error(stanza, XMPP_ERROR_BAD_REQUEST);

        this.get_debug().log('[JSJaCJingle:single] handle_session_initiate_request > Error (bad request).', 1);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_initiate_request > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session terminate
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_terminate: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_terminate', 4);

    try {
      var type = stanza.getType();

      // Security preconditions
      if(!this.utils.stanza_safe(stanza)) {
        this.get_debug().log('[JSJaCJingle:single] handle_session_terminate > Dropped unsafe stanza.', 0);

        this.send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
        return;
      }

      // Can now safely dispatch the stanza
      switch(stanza.getType()) {
        case JSJAC_JINGLE_STANZA_TYPE_RESULT:
          (this.get_session_terminate_success())(this, stanza);
          this.handle_session_terminate_success(stanza);

          break;

        case 'error':
          (this.get_session_terminate_error())(this, stanza);
          this.handle_session_terminate_error(stanza);

          break;

        case JSJAC_JINGLE_STANZA_TYPE_SET:
          (this.get_session_terminate_request())(this, stanza);
          this.handle_session_terminate_request(stanza);

          break;

        default:
          this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_terminate > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session terminate success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_terminate_success: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_terminate_success', 4);

    try {
      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_TERMINATED);

      // Stop WebRTC
      this.peer.stop();
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_terminate_success > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session terminate error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_terminate_error: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_terminate_error', 4);

    try {
      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_TERMINATED);

      // Stop WebRTC
      this.peer.stop();

      // Lock session (cannot be used later)
      this.set_lock(true);

      this.get_debug().log('[JSJaCJingle:single] handle_session_terminate_error > Forced session termination locally.', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_terminate_error > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session terminate request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_session_terminate_request: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_session_terminate_request', 4);

    try {
      // Slot unavailable?
      if(this.get_status() == JSJAC_JINGLE_STATUS_INACTIVE || this.get_status() == JSJAC_JINGLE_STATUS_TERMINATED) {
        this.get_debug().log('[JSJaCJingle:single] handle_session_terminate_request > Cannot handle, resource not active (status: ' + this.get_status() + ').', 0);
        this.send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_TERMINATING);

      // Store termination reason
      this.set_reason(this.utils.stanza_terminate_reason(stanza));

      // Trigger terminate success callbacks
      (this.get_session_terminate_success())(this, stanza);
      this.handle_session_terminate_success(stanza);

      // Process terminate actions
      this.send(JSJAC_JINGLE_STANZA_TYPE_RESULT, { id: stanza.getID() });

      this.get_debug().log('[JSJaCJingle:single] handle_session_terminate_request > (reason: ' + this.get_reason() + ').', 3);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_session_terminate_request > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle transport accept
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_transport_accept: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_transport_accept', 4);

    try {
      // Not implemented for now
      this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_content_accept > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle transport info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_transport_info: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_transport_info', 4);

    try {
      // Slot unavailable?
      if(this.get_status() != JSJAC_JINGLE_STATUS_INITIATED && this.get_status() != JSJAC_JINGLE_STATUS_ACCEPTING && this.get_status() != JSJAC_JINGLE_STATUS_ACCEPTED) {
        this.get_debug().log('[JSJaCJingle:single] handle_transport_info > Cannot handle, resource not initiated, nor accepting, nor accepted (status: ' + this.get_status() + ').', 0);
        this.send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      // Common vars
      var i, cur_candidate_obj;

      // Parse the incoming transport
      var rd_sid = this.utils.stanza_sid(stanza);

      // Request is valid?
      if(rd_sid && this.utils.stanza_parse_content(stanza)) {
        // Handle additional data (optional)
        // Still unsure if it is relevant to parse groups there... (are they allowed in such stanza?)
        //this.utils.stanza_parse_group(stanza);

        // Re-generate and store new content data
        this.utils.build_content_remote();

        var sdp_candidates_remote = this.utils.sdp_generate_candidates(
          this.get_candidates_queue_remote()
        );

        // ICE candidates
        for(i in sdp_candidates_remote) {
          cur_candidate_obj = sdp_candidates_remote[i];

          this.get_peer_connection().addIceCandidate(
            new WEBRTC_ICE_CANDIDATE({
              sdpMLineIndex : cur_candidate_obj.id,
              candidate     : cur_candidate_obj.candidate
            })
          );
        }

        // Empty the unapplied candidates queue
        this.set_candidates_queue_remote(null);

        // Success reply
        this.send(JSJAC_JINGLE_STANZA_TYPE_RESULT, { id: stanza.getID() });
      } else {
        // Send error reply
        this.send_error(stanza, XMPP_ERROR_BAD_REQUEST);

        this.get_debug().log('[JSJaCJingle:single] handle_transport_info > Error.', 1);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_transport_info > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle transport info success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_transport_info_success: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_transport_info_success', 4);
  },

  /**
   * Handles the Jingle transport info error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_transport_info_error: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_transport_info_error', 4);
  },

  /**
   * Handles the Jingle transport reject
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_transport_reject: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_transport_reject', 4);

    try {
      // Not implemented for now
      this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_transport_reject > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle transport replace
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  handle_transport_replace: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle_transport_replace', 4);

    try {
      // Not implemented for now
      this.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle_transport_replace > ' + e, 1);
    }
  },
});
