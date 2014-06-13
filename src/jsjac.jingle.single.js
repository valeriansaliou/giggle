/**
 * @fileoverview JSJaC Jingle library - Single (one-to-one) call lib
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/single */


/**
 * Creates a new XMPP Jingle session.
 * @class
 * @classdesc  Creates a new XMPP Jingle session.
 * @augments   __JSJaCJingleBase
 * @requires   lib:nicolas-van/ring.js
 * @requires   lib:sstrigler/JSJaC
 * @requires   module:jsjac-jingle/main
 * @requires   module:jsjac-jingle/base
 * @see        {@link http://xmpp.org/extensions/xep-0166.html|XEP-0166: Jingle}
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://stefan-strigler.de/jsjac-1.3.4/doc/|JSJaC Documentation}
 * @param      {Object}    [args]                            - Jingle session arguments.
 * @property   {*}         [args.*]                          - Herits of JSJaCJingle() baseclass prototype.
 * @property   {Function}  [args.session_initiate_pending]   - The initiate pending custom handler.
 * @property   {Function}  [args.session_initiate_success]   - The initiate success custom handler.
 * @property   {Function}  [args.session_initiate_error]     - The initiate error custom handler.
 * @property   {Function}  [args.session_initiate_request]   - The initiate request custom handler.
 * @property   {Function}  [args.session_accept_pending]     - The accept pending custom handler.
 * @property   {Function}  [args.session_accept_success]     - The accept success custom handler.
 * @property   {Function}  [args.session_accept_error]       - The accept error custom handler.
 * @property   {Function}  [args.session_accept_request]     - The accept request custom handler.
 * @property   {Function}  [args.session_info_success]       - The info success custom handler.
 * @property   {Function}  [args.session_info_error]         - The info error custom handler.
 * @property   {Function}  [args.session_info_request]       - The info request custom handler.
 * @property   {Function}  [args.session_terminate_pending]  - The terminate pending custom handler.
 * @property   {Function}  [args.session_terminate_success]  - The terminate success custom handler.
 * @property   {Function}  [args.session_terminate_error]    - The terminate error custom handler.
 * @property   {Function}  [args.session_terminate_request]  - The terminate request custom handler.
 * @property   {DOM}       [args.remote_view]                - The path to the remote stream view element.
 */
var JSJaCJingleSingle = ring.create([__JSJaCJingleBase], {
  /**
   * Constructor
   */
  constructor: function(args) {
    this.$super(args);

    if(args && args.session_initiate_pending)
      /**
       * @type {Function}
       * @default
       * @private
       */
      this._session_initiate_pending = args.session_initiate_pending;

    if(args && args.session_initiate_success)
      /**
       * @type {Function}
       * @default
       * @private
       */
      this._session_initiate_success = args.session_initiate_success;

    if(args && args.session_initiate_error)
      /**
       * @type {Function}
       * @default
       * @private
       */
      this._session_initiate_error = args.session_initiate_error;

    if(args && args.session_initiate_request)
      /**
       * @type {Function}
       * @default
       * @private
       */
      this._session_initiate_request = args.session_initiate_request;

    if(args && args.session_accept_pending)
      /**
       * @type {Function}
       * @default
       * @private
       */
      this._session_accept_pending = args.session_accept_pending;

    if(args && args.session_accept_success)
      /**
       * @type {Function}
       * @default
       * @private
       */
      this._session_accept_success = args.session_accept_success;

    if(args && args.session_accept_error)
      /**
       * @type {Function}
       * @default
       * @private
       */
      this._session_accept_error = args.session_accept_error;

    if(args && args.session_accept_request)
      /**
       * @type {Function}
       * @default
       * @private
       */
      this._session_accept_request = args.session_accept_request;

    if(args && args.session_info_success)
      /**
       * @type {Function}
       * @default
       * @private
       */
      this._session_info_success = args.session_info_success;

    if(args && args.session_info_error)
      /**
       * @type {Function}
       * @default
       * @private
       */
      this._session_info_error = args.session_info_error;

    if(args && args.session_info_request)
      /**
       * @type {Function}
       * @default
       * @private
       */
      this._session_info_request = args.session_info_request;

    if(args && args.session_terminate_pending)
      /**
       * @type {Function}
       * @default
       * @private
       */
      this._session_terminate_pending = args.session_terminate_pending;

    if(args && args.session_terminate_success)
      /**
       * @type {Function}
       * @default
       * @private
       */
      this._session_terminate_success = args.session_terminate_success;

    if(args && args.session_terminate_error)
      /**
       * @type {Function}
       * @default
       * @private
       */
      this._session_terminate_error = args.session_terminate_error;

    if(args && args.session_terminate_request)
      /**
       * @type {Function}
       * @default
       * @private
       */
      this._session_terminate_request = args.session_terminate_request;

    if(args && args.remote_view)
      /**
       * @type {Object}
       * @default
       * @private
       */
      this._remote_view = {};

      if(this.get_to())
        this._remote_view[this.get_to()] = [args.remote_view];

    /**
     * @constant
     * @type {String}
     * @default
     * @private
     */
    this._status = JSJAC_JINGLE_STATUS_INACTIVE;

    /**
     * @constant
     * @type {String}
     * @default
     * @private
     */
    this._reason = JSJAC_JINGLE_REASON_CANCEL;

    /**
     * @constant
     * @type {String}
     * @default
     * @private
     */
    this._namespace = NS_JINGLE;
  },


  /**
   * Initiates a new Jingle session.
   * @public
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

      if(JSJaCJingle._defer(function() { _this.initiate(); })) {
        this.get_debug().log('[JSJaCJingle:single] initiate > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(this.get_status() !== JSJAC_JINGLE_STATUS_INACTIVE) {
        this.get_debug().log('[JSJaCJingle:single] initiate > Cannot initiate, resource not inactive (status: ' + this.get_status() + ').', 0);
        return;
      }

      this.get_debug().log('[JSJaCJingle:single] initiate > New Jingle Single session with media: ' + this.get_media(), 2);

      // Common vars
      var i, cur_name;

      // Trigger init pending custom callback
      /* @function */
      (this.get_session_initiate_pending())(this);

      // Change session status
      this._set_status(JSJAC_JINGLE_STATUS_INITIATING);

      // Set session values
      this._set_sid(this.utils.generate_sid());
      this._set_initiator(this.utils.connection_jid());
      this._set_responder(this.get_to());

      for(i in this.get_media_all()) {
        cur_name = this.utils.name_generate(
          this.get_media_all()[i]
        );

        this._set_name(cur_name);

        this._set_senders(
          cur_name,
          JSJAC_JINGLE_SENDERS_BOTH.jingle
        );

        this._set_creator(
          cur_name,
          JSJAC_JINGLE_CREATOR_INITIATOR
        );
      }

      // Register session to common router
      JSJaCJingle._add(JSJAC_JINGLE_SESSION_SINGLE, this.get_sid(), this);

      // Initialize WebRTC
      this._peer_get_user_media(function() {
        _this._peer_connection_create(
          _this.get_to(),

          function() {
            _this.get_debug().log('[JSJaCJingle:single] initiate > Ready to begin Jingle negotiation.', 2);

            _this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_INITIATE });
          }
        );
      });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] initiate > ' + e, 1);
    }
  },

  /**
   * Accepts the Jingle session.
   * @public
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

      if(JSJaCJingle._defer(function() { _this.accept(); })) {
        this.get_debug().log('[JSJaCJingle:single] accept > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(this.get_status() !== JSJAC_JINGLE_STATUS_INITIATED) {
        this.get_debug().log('[JSJaCJingle:single] accept > Cannot accept, resource not initiated (status: ' + this.get_status() + ').', 0);
        return;
      }

      this.get_debug().log('[JSJaCJingle:single] accept > New Jingle session with media: ' + this.get_media(), 2);

      // Trigger accept pending custom callback
      /* @function */
      (this.get_session_accept_pending())(this);

      // Change session status
      this._set_status(JSJAC_JINGLE_STATUS_ACCEPTING);

      // Initialize WebRTC
      this._peer_get_user_media(function() {
        _this._peer_connection_create(
          _this.get_to(),

          function() {
            _this.get_debug().log('[JSJaCJingle:single] accept > Ready to complete Jingle negotiation.', 2);

            // Process accept actions
            _this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_ACCEPT });
          }
        );
      });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] accept > ' + e, 1);
    }
  },

  /**
   * Sends a Jingle session info.
   * @public
   * @param {String} name
   * @param {Object} [args]
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

      if(JSJaCJingle._defer(function() { _this.info(name, args); })) {
        this.get_debug().log('[JSJaCJingle:single] info > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(!(this.get_status() === JSJAC_JINGLE_STATUS_INITIATED  ||
           this.get_status() === JSJAC_JINGLE_STATUS_ACCEPTING  ||
           this.get_status() === JSJAC_JINGLE_STATUS_ACCEPTED)) {
        this.get_debug().log('[JSJaCJingle:single] info > Cannot send info, resource not active (status: ' + this.get_status() + ').', 0);
        return;
      }

      // Assert
      if(typeof args !== 'object') args = {};

      // Build final args parameter
      args.action = JSJAC_JINGLE_ACTION_SESSION_INFO;
      if(name) args.info = name;

      this.send(JSJAC_JINGLE_IQ_TYPE_SET, args);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] info > ' + e, 1);
    }
  },

  /**
   * Terminates the Jingle session.
   * @public
   * @param {String} reason
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

      if(JSJaCJingle._defer(function() { _this.terminate(reason); })) {
        this.get_debug().log('[JSJaCJingle:single] terminate > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(this.get_status() === JSJAC_JINGLE_STATUS_TERMINATED) {
        this.get_debug().log('[JSJaCJingle:single] terminate > Cannot terminate, resource already terminated (status: ' + this.get_status() + ').', 0);
        return;
      }

      // Change session status
      this._set_status(JSJAC_JINGLE_STATUS_TERMINATING);

      // Trigger terminate pending custom callback
      /* @function */
      (this.get_session_terminate_pending())(this);

      // Process terminate actions
      this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_TERMINATE, reason: reason });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] terminate > ' + e, 1);
    }
  },

  /**
   * Sends a given Jingle stanza packet
   * @public
   * @param {String} type
   * @param {Object} [args]
   * @returns {Boolean} Success
   */
  send: function(type, args) {
    this.get_debug().log('[JSJaCJingle:single] send', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:single] send > Cannot send, resource locked. Please open another session or check WebRTC support.', 0);
        return false;
      }

      // Defer?
      var _this = this;

      if(JSJaCJingle._defer(function() { _this.send(type, args); })) {
        this.get_debug().log('[JSJaCJingle:single] send > Deferred (waiting for the library components to be initiated).', 0);
        return false;
      }

      // Assert
      if(typeof args !== 'object') args = {};

      // Build stanza
      var stanza = new JSJaCIQ();
      stanza.setTo(this.get_to());

      if(type) stanza.setType(type);

      if(!args.id) args.id = this.get_id_new();
      stanza.setID(args.id);

      if(type == JSJAC_JINGLE_IQ_TYPE_SET) {
        if(!(args.action && args.action in JSJAC_JINGLE_ACTIONS)) {
          this.get_debug().log('[JSJaCJingle:single] send > Stanza action unknown: ' + (args.action || 'undefined'), 1);
          return false;
        }

        // Submit to registered handler
        switch(args.action) {
          case JSJAC_JINGLE_ACTION_CONTENT_ACCEPT:
            this._send_content_accept(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_ADD:
            this._send_content_add(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_MODIFY:
            this._send_content_modify(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_REJECT:
            this._send_content_reject(stanza); break;

          case JSJAC_JINGLE_ACTION_CONTENT_REMOVE:
            this._send_content_remove(stanza); break;

          case JSJAC_JINGLE_ACTION_DESCRIPTION_INFO:
            this._send_description_info(stanza); break;

          case JSJAC_JINGLE_ACTION_SECURITY_INFO:
            this._send_security_info(stanza); break;

          case JSJAC_JINGLE_ACTION_SESSION_ACCEPT:
            this._send_session_accept(stanza, args); break;

          case JSJAC_JINGLE_ACTION_SESSION_INFO:
            this._send_session_info(stanza, args); break;

          case JSJAC_JINGLE_ACTION_SESSION_INITIATE:
            this._send_session_initiate(stanza, args); break;

          case JSJAC_JINGLE_ACTION_SESSION_TERMINATE:
            this._send_session_terminate(stanza, args); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT:
            this._send_transport_accept(stanza); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_INFO:
            this._send_transport_info(stanza, args); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_REJECT:
            this._send_transport_reject(stanza); break;

          case JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE:
            this._send_transport_replace(stanza); break;

          default:
            this.get_debug().log('[JSJaCJingle:single] send > Unexpected error.', 1);

            return false;
        }
      } else if(type != JSJAC_JINGLE_IQ_TYPE_RESULT) {
        this.get_debug().log('[JSJaCJingle:single] send > Stanza type must either be set or result.', 1);

        return false;
      }

      this._set_sent_id(args.id);

      JSJAC_JINGLE_STORE_CONNECTION.send(stanza);

      if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:single] send > Outgoing packet sent' + '\n\n' + stanza.xml());

      return true;
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] send > ' + e, 1);
    }

    return false;
  },

  /**
   * Handles a given Jingle stanza response
   * @private
   * @param {JSJaCPacket} stanza
   */
  handle: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] handle', 4);

    try {
      if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:single] handle > Incoming packet received' + '\n\n' + stanza.xml());

      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:single] handle > Cannot handle, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      var _this = this;

      if(JSJaCJingle._defer(function() { _this.handle(stanza); })) {
        this.get_debug().log('[JSJaCJingle:single] handle > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      var id   = stanza.getID();
      var type = stanza.getType();

      if(id && type == JSJAC_JINGLE_IQ_TYPE_RESULT)  this._set_received_id(id);

      // Submit to custom handler
      if(typeof this.get_handlers(type, id) == 'function') {
        this.get_debug().log('[JSJaCJingle:single] handle > Submitted to custom handler.', 2);

        /* @function */
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
          this._handle_content_accept(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_ADD:
          this._handle_content_add(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_MODIFY:
          this._handle_content_modify(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_REJECT:
          this._handle_content_reject(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_REMOVE:
          this._handle_content_remove(stanza); break;

        case JSJAC_JINGLE_ACTION_DESCRIPTION_INFO:
          this._handle_description_info(stanza); break;

        case JSJAC_JINGLE_ACTION_SECURITY_INFO:
          this._handle_security_info(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_ACCEPT:
          this._handle_session_accept(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_INFO:
          this._handle_session_info(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_INITIATE:
          this._handle_session_initiate(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_TERMINATE:
          this._handle_session_terminate(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT:
          this._handle_transport_accept(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_INFO:
          this._handle_transport_info(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_REJECT:
          this._handle_transport_reject(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE:
          this._handle_transport_replace(stanza); break;
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] handle > ' + e, 1);
    }
  },

  /**
   * Mutes a Jingle session (local)
   * @public
   * @param {String} name
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

      if(JSJaCJingle._defer(function() { _this.mute(name); })) {
        this.get_debug().log('[JSJaCJingle:single] mute > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Already muted?
      if(this.get_mute(name)) {
        this.get_debug().log('[JSJaCJingle:single] mute > Resource already muted.', 0);
        return;
      }

      this._peer_sound(false);
      this._set_mute(name, true);

      this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_INFO, info: JSJAC_JINGLE_SESSION_INFO_MUTE, name: name });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] mute > ' + e, 1);
    }
  },

  /**
   * Unmutes a Jingle session (local)
   * @public
   * @param {String} name
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

      if(JSJaCJingle._defer(function() { _this.unmute(name); })) {
        this.get_debug().log('[JSJaCJingle:single] unmute > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Already unmute?
      if(!this.get_mute(name)) {
        this.get_debug().log('[JSJaCJingle:single] unmute > Resource already unmuted.', 0);
        return;
      }

      this._peer_sound(true);
      this._set_mute(name, false);

      this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_INFO, info: JSJAC_JINGLE_SESSION_INFO_UNMUTE, name: name });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] unmute > ' + e, 1);
    }
  },

  /**
   * Toggles media type in a Jingle session
   * @public
   * @param {String} [media]
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

      if(JSJaCJingle._defer(function() { _this.media(media); })) {
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
      this._set_media(media);
      this._set_media_busy(true);

      // Toggle video mode (add/remove)
      if(media == JSJAC_JINGLE_MEDIA_VIDEO) {
        // TODO: the flow is something like that...
        /*this._peer_get_user_media(function() {
          this._peer_connection_create(
            this.get_to(),

            function() {
              this.get_debug().log('[JSJaCJingle:single] media > Ready to change media (to: ' + media + ').', 2);

              // 'content-add' >> video
              // TODO: restart video stream configuration

              // WARNING: only change get user media, DO NOT TOUCH THE STREAM THING (don't stop active stream as it's flowing!!)

              this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_CONTENT_ADD, name: JSJAC_JINGLE_MEDIA_VIDEO });
            }
          )
        });*/
      } else {
        // TODO: the flow is something like that...
        /*this._peer_get_user_media(function() {
          this._peer_connection_create(
            this.get_to(),

            function() {
              this.get_debug().log('[JSJaCJingle:single] media > Ready to change media (to: ' + media + ').', 2);

              // 'content-remove' >> video
              // TODO: remove video stream configuration

              // WARNING: only change get user media, DO NOT TOUCH THE STREAM THING (don't stop active stream as it's flowing!!)
              //          here, only stop the video stream, do not touch the audio stream

              this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_CONTENT_REMOVE, name: JSJAC_JINGLE_MEDIA_VIDEO });
            }
          )
        });*/
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] media > ' + e, 1);
    }
  },


  /**
   * JSJSAC JINGLE SENDERS
   */

  /**
   * Sends the Jingle content accept
   * @private
   * @param {JSJaCPacket} stanza
   */
  _send_content_accept: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _send_content_accept', 4);

    try {
      // TODO: remove from remote 'content-add' queue
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] _send_content_accept > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _send_content_accept > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle content add
   * @private
   * @param {JSJaCPacket} stanza
   */
  _send_content_add: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _send_content_add', 4);

    try {
      // TODO: push to local 'content-add' queue

      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] _send_content_add > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _send_content_add > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle content modify
   * @private
   * @param {JSJaCPacket} stanza
   */
  _send_content_modify: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _send_content_modify', 4);

    try {
      // TODO: push to local 'content-modify' queue

      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] _send_content_modify > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _send_content_modify > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle content reject
   * @private
   * @param {JSJaCPacket} stanza
   */
  _send_content_reject: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _send_content_reject', 4);

    try {
      // TODO: remove from remote 'content-add' queue

      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] _send_content_reject > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _send_content_reject > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle content remove
   * @private
   * @param {JSJaCPacket} stanza
   */
  _send_content_remove: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _send_content_remove', 4);

    try {
      // TODO: add to local 'content-remove' queue

      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] _send_content_remove > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _send_content_remove > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle description info
   * @private
   * @param {JSJaCPacket} stanza
   */
  _send_description_info: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _send_description_info', 4);

    try {
      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] _send_description_info > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _send_description_info > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle security info
   * @private
   * @param {JSJaCPacket} stanza
   */
  _send_security_info: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _send_security_info', 4);

    try {
      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] _send_security_info > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _send_security_info > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle session accept
   * @private
   * @param {JSJaCPacket} stanza
   * @param {Object} args
   */
  _send_session_accept: function(stanza, args) {
    this.get_debug().log('[JSJaCJingle:single] _send_session_accept', 4);

    try {
      if(this.get_status() !== JSJAC_JINGLE_STATUS_ACCEPTING) {
        this.get_debug().log('[JSJaCJingle:single] _send_session_accept > Cannot send accept stanza, resource not accepting (status: ' + this.get_status() + ').', 0);
        this._send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      if(!args) {
        this.get_debug().log('[JSJaCJingle:single] _send_session_accept > Argument not provided.', 1);
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

      this.register_handler(JSJAC_JINGLE_IQ_TYPE_RESULT, args.id, function(stanza) {
        /* @function */
        (_this.get_session_accept_success())(_this, stanza);
        _this._handle_session_accept_success(stanza);
      });

      // Schedule error timeout
      this.utils.stanza_timeout(JSJAC_JINGLE_IQ_TYPE_RESULT, args.id, {
        /* @function */
        external:   this.get_session_accept_error().bind(this),
        internal:   this._handle_session_accept_error.bind(this)
      });

      this.get_debug().log('[JSJaCJingle:single] _send_session_accept > Sent.', 4);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _send_session_accept > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle session info
   * @private
   * @param {JSJaCPacket} stanza
   * @param {Object} args
   */
  _send_session_info: function(stanza, args) {
    this.get_debug().log('[JSJaCJingle:single] _send_session_info', 4);

    try {
      if(!args) {
        this.get_debug().log('[JSJaCJingle:single] _send_session_info > Argument not provided.', 1);
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

      this.register_handler(JSJAC_JINGLE_IQ_TYPE_RESULT, args.id, function(stanza) {
        /* @function */
        (_this.get_session_info_success())(this, stanza);
        _this._handle_session_info_success(stanza);
      });

      // Schedule error timeout
      this.utils.stanza_timeout(JSJAC_JINGLE_IQ_TYPE_RESULT, args.id, {
        /* @function */
        external:   this.get_session_info_error().bind(this),
        internal:   this._handle_session_info_error.bind(this)
      });

      this.get_debug().log('[JSJaCJingle:single] _send_session_info > Sent (name: ' + args.info + ').', 2);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _send_session_info > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle session initiate
   * @private
   * @param {JSJaCPacket} stanza
   * @param {Object} args
   */
  _send_session_initiate: function(stanza, args) {
    this.get_debug().log('[JSJaCJingle:single] _send_session_initiate', 4);

    try {
      if(this.get_status() !== JSJAC_JINGLE_STATUS_INITIATING) {
        this.get_debug().log('[JSJaCJingle:single] _send_session_initiate > Cannot send initiate stanza, resource not initiating (status: ' + this.get_status() + ').', 0);
        return;
      }

      if(!args) {
        this.get_debug().log('[JSJaCJingle:single] _send_session_initiate > Argument not provided.', 1);
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
      
      this.register_handler(JSJAC_JINGLE_IQ_TYPE_RESULT, args.id, function(stanza) {
        /* @function */
        (_this.get_session_initiate_success())(_this, stanza);
        _this._handle_session_initiate_success(stanza);
      });

      // Schedule error timeout
      this.utils.stanza_timeout(JSJAC_JINGLE_IQ_TYPE_RESULT, args.id, {
        /* @function */
        external:   this.get_session_initiate_error().bind(this),
        internal:   this._handle_session_initiate_error.bind(this)
      });

      this.get_debug().log('[JSJaCJingle:single] _send_session_initiate > Sent.', 2);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _send_session_initiate > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle session terminate
   * @private
   * @param {JSJaCPacket} stanza
   * @param {Object} args
   */
  _send_session_terminate: function(stanza, args) {
    this.get_debug().log('[JSJaCJingle:single] _send_session_terminate', 4);

    try {
      if(this.get_status() !== JSJAC_JINGLE_STATUS_TERMINATING) {
        this.get_debug().log('[JSJaCJingle:single] _send_session_terminate > Cannot send terminate stanza, resource not terminating (status: ' + this.get_status() + ').', 0);
        return;
      }

      if(!args) {
        this.get_debug().log('[JSJaCJingle:single] _send_session_terminate > Argument not provided.', 1);
        return;
      }

      // Filter reason
      args.reason = args.reason || JSJAC_JINGLE_REASON_SUCCESS;

      // Store terminate reason
      this._set_reason(args.reason);

      // Build terminate stanza
      var jingle = this.utils.stanza_generate_jingle(stanza, {
        'action': JSJAC_JINGLE_ACTION_SESSION_TERMINATE
      });

      var jingle_reason = jingle.appendChild(stanza.buildNode('reason', {'xmlns': this.get_namespace()}));
      jingle_reason.appendChild(stanza.buildNode(args.reason, {'xmlns': this.get_namespace()}));

      // Schedule success
      var _this = this;
      
      this.register_handler(JSJAC_JINGLE_IQ_TYPE_RESULT, args.id, function(stanza) {
        /* @function */
        (_this.get_session_terminate_success())(_this, stanza);
        _this._handle_session_terminate_success(stanza);
      });

      // Schedule error timeout
      this.utils.stanza_timeout(JSJAC_JINGLE_IQ_TYPE_RESULT, args.id, {
        /* @function */
        external:   this.get_session_terminate_error().bind(this),
        internal:   this._handle_session_terminate_error.bind(this)
      });

      this.get_debug().log('[JSJaCJingle:single] _send_session_terminate > Sent (reason: ' + args.reason + ').', 2);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _send_session_terminate > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle transport accept
   * @private
   * @param {JSJaCPacket} stanza
   */
  _send_transport_accept: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _send_transport_accept', 4);

    try {
      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] _send_transport_accept > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _send_transport_accept > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle transport info
   * @private
   * @param {JSJaCPacket} stanza
   * @param {Object} args
   */
  _send_transport_info: function(stanza, args) {
    this.get_debug().log('[JSJaCJingle:single] _send_transport_info', 4);

    try {
      if(this.get_status() !== JSJAC_JINGLE_STATUS_INITIATED  &&
         this.get_status() !== JSJAC_JINGLE_STATUS_ACCEPTING  &&
         this.get_status() !== JSJAC_JINGLE_STATUS_ACCEPTED) {
        this.get_debug().log('[JSJaCJingle:single] _send_transport_info > Cannot send transport info, resource not initiated, nor accepting, nor accepted (status: ' + this.get_status() + ').', 0);
        return;
      }

      if(!args) {
        this.get_debug().log('[JSJaCJingle:single] _send_transport_info > Argument not provided.', 1);
        return;
      }

      if(this.utils.object_length(this.get_candidates_queue_local()) === 0) {
        this.get_debug().log('[JSJaCJingle:single] _send_transport_info > No local candidate in queue.', 1);
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
      
      this.register_handler(JSJAC_JINGLE_IQ_TYPE_RESULT, args.id, function(stanza) {
        _this._handle_transport_info_success(stanza);
      });

      // Schedule error timeout
      this.utils.stanza_timeout(JSJAC_JINGLE_IQ_TYPE_RESULT, args.id, {
        internal: this._handle_transport_info_error.bind(this)
      });

      this.get_debug().log('[JSJaCJingle:single] _send_transport_info > Sent.', 2);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _send_transport_info > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle transport reject
   * @private
   * @param {JSJaCPacket} stanza
   */
  _send_transport_reject: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _send_transport_reject', 4);

    try {
      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] _send_transport_reject > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _send_transport_reject > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle transport replace
   * @private
   * @param {JSJaCPacket} stanza
   */
  _send_transport_replace: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _send_transport_replace', 4);

    try {
      // Not implemented for now
      this.get_debug().log('[JSJaCJingle:single] _send_transport_replace > Feature not implemented!', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _send_transport_replace > ' + e, 1);
    }
  },

  /**
   * Sends the Jingle transport replace
   * @private
   * @param {JSJaCPacket} stanza
   * @param {Object} error
   */
  _send_error: function(stanza, error) {
    this.get_debug().log('[JSJaCJingle:single] _send_error', 4);

    try {
      // Assert
      if(!('type' in error)) {
        this.get_debug().log('[JSJaCJingle:single] _send_error > Type unknown.', 1);
        return;
      }

      if('jingle' in error && !(error.jingle in JSJAC_JINGLE_ERRORS)) {
        this.get_debug().log('[JSJaCJingle:single] _send_error > Jingle condition unknown (' + error.jingle + ').', 1);
        return;
      }

      if('xmpp' in error && !(error.xmpp in XMPP_ERRORS)) {
        this.get_debug().log('[JSJaCJingle:single] _send_error > XMPP condition unknown (' + error.xmpp + ').', 1);
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

      this.get_debug().log('[JSJaCJingle:single] _send_error > Sent: ' + (error.jingle || error.xmpp), 2);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _send_error > ' + e, 1);
    }
  },



  /**
   * JSJSAC JINGLE HANDLERS
   */

  /**
   * Handles the Jingle content accept
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_content_accept: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_content_accept', 4);

    try {
      // TODO: start to flow accepted stream
      // TODO: remove accepted content from local 'content-add' queue
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_content_accept > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle content add
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_content_add: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_content_add', 4);

    try {
      // TODO: request the user to start this content (need a custom handler)
      //       on accept: send content-accept
      // TODO: push to remote 'content-add' queue
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_content_add > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle content modify
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_content_modify: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_content_modify', 4);

    try {
      // TODO: change 'senders' value (direction of the stream)
      //       if(send:from_me): notify the user that media is requested
      //       if(unacceptable): terminate the session
      //       if(accepted):     change local/remote SDP
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_content_modify > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle content reject
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_content_reject: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_content_reject', 4);

    try {
      // TODO: remove rejected content from local 'content-add' queue

      // Not implemented for now
      this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_content_reject > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle content remove
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_content_remove: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_content_remove', 4);

    try {
      // TODO: stop flowing removed stream
      // TODO: reprocess content_local/content_remote

      // Not implemented for now
      this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_content_remove > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle description info
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_description_info: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_description_info', 4);

    try {
      // Not implemented for now
      this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_description_info > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle security info
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_security_info: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_security_info', 4);

    try {
      // Not implemented for now
      this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_security_info > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session accept
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_session_accept: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_session_accept', 4);

    try {
      // Security preconditions
      if(!this.utils.stanza_safe(stanza)) {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_accept > Dropped unsafe stanza.', 0);

        this._send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
        return;
      }

      // Can now safely dispatch the stanza
      switch(stanza.getType()) {
        case JSJAC_JINGLE_IQ_TYPE_RESULT:
          /* @function */
          (this.get_session_accept_success())(this, stanza);
          this._handle_session_accept_success(stanza);

          break;

        case 'error':
          /* @function */
          (this.get_session_accept_error())(this, stanza);
          this._handle_session_accept_error(stanza);

          break;

        case JSJAC_JINGLE_IQ_TYPE_SET:
          // External handler must be set before internal one here...
          /* @function */
          (this.get_session_accept_request())(this, stanza);
          this._handle_session_accept_request(stanza);

          break;

        default:
          this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_accept > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session accept success
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_session_accept_success: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_session_accept_success', 4);

    try {
      // Change session status
      this._set_status(JSJAC_JINGLE_STATUS_ACCEPTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_accept_success > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session accept error
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_session_accept_error: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_session_accept_error', 4);

    try {
      // Terminate the session (timeout)
      this.terminate(JSJAC_JINGLE_REASON_TIMEOUT);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_accept_error > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session accept request
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_session_accept_request: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_session_accept_request', 4);

    try {
      // Slot unavailable?
      if(this.get_status() !== JSJAC_JINGLE_STATUS_INITIATED) {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_accept_request > Cannot handle, resource already accepted (status: ' + this.get_status() + ').', 0);
        this._send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      // Common vars
      var i, cur_candidate_obj;

      // Change session status
      this._set_status(JSJAC_JINGLE_STATUS_ACCEPTING);

      var rd_sid = this.utils.stanza_sid(stanza);

      // Request is valid?
      if(rd_sid && this.is_initiator() && this.utils.stanza_parse_content(this.get_to(), stanza)) {
        // Handle additional data (optional)
        this.utils.stanza_parse_group(this.get_to(), stanza);

        // Generate and store content data
        this.utils.build_content_remote(this.get_to());

        // Trigger accept success callback
        /* @function */
        (this.get_session_accept_success())(this, stanza);
        this._handle_session_accept_success(stanza);

        var sdp_remote = this.sdp._generate(
          WEBRTC_SDP_TYPE_ANSWER,
          this.get_group_remote(this.get_to()),
          this.get_payloads_remote(this.get_to()),
          this.get_candidates_queue_remote(this.get_to())
        );

        if(this.get_sdp_trace())  this.get_debug().log('[JSJaCJingle:single] SDP (remote)' + '\n\n' + sdp_remote.description.sdp, 4);

        // Remote description
        var _this = this;
        
        this.get_peer_connection(this.get_to()).setRemoteDescription(
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

          this.get_peer_connection(this.get_to()).addIceCandidate(
            new WEBRTC_ICE_CANDIDATE({
              sdpMLineIndex : cur_candidate_obj.id,
              candidate     : cur_candidate_obj.candidate
            })
          );
        }

        // Empty the unapplied candidates queue
        this._set_candidates_queue_remote(this.get_to(), null);

        // Success reply
        this.send(JSJAC_JINGLE_IQ_TYPE_RESULT, { id: stanza.getID() });
      } else {
        // Trigger accept error callback
        /* @function */
        (this.get_session_accept_error())(this, stanza);
        this._handle_session_accept_error(stanza);

        // Send error reply
        this._send_error(stanza, XMPP_ERROR_BAD_REQUEST);

        this.get_debug().log('[JSJaCJingle:single] _handle_session_accept_request > Error.', 1);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_accept_request > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session info
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_session_info: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_session_info', 4);

    try {
      // Security preconditions
      if(!this.utils.stanza_safe(stanza)) {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_info > Dropped unsafe stanza.', 0);

        this._send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
        return;
      }

      // Can now safely dispatch the stanza
      switch(stanza.getType()) {
        case JSJAC_JINGLE_IQ_TYPE_RESULT:
          /* @function */
          (this.get_session_info_success())(this, stanza);
          this._handle_session_info_success(stanza);

          break;

        case 'error':
          /* @function */
          (this.get_session_info_error())(this, stanza);
          this._handle_session_info_error(stanza);

          break;

        case JSJAC_JINGLE_IQ_TYPE_SET:
          /* @function */
          (this.get_session_info_request())(this, stanza);
          this._handle_session_info_request(stanza);

          break;

        default:
          this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_info > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session info success
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_session_info_success: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_session_info_success', 4);
  },

  /**
   * Handles the Jingle session info error
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_session_info_error: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_session_info_error', 4);
  },

  /**
   * Handles the Jingle session info request
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_session_info_request: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_session_info_request', 4);

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
        this.get_debug().log('[JSJaCJingle:single] _handle_session_info_request > (name: ' + (info_name || 'undefined') + ').', 3);

        // Process info actions
        this.send(JSJAC_JINGLE_IQ_TYPE_RESULT, { id: stanza.getID() });

        // Trigger info success custom callback
        /* @function */
        (this.get_session_info_success())(this, stanza);
        this._handle_session_info_success(stanza);
      } else {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_info_request > Error (name: ' + (info_name || 'undefined') + ').', 1);

        // Send error reply
        this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);

        // Trigger info error custom callback
        /* @function */
        (this.get_session_info_error())(this, stanza);
        this._handle_session_info_error(stanza);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_info_request > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session initiate
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_session_initiate: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate', 4);

    try {
      switch(stanza.getType()) {
        case JSJAC_JINGLE_IQ_TYPE_RESULT:
          /* @function */
          (this.get_session_initiate_success())(this, stanza);
          this._handle_session_initiate_success(stanza);

          break;

        case 'error':
          /* @function */
          (this.get_session_initiate_error())(this, stanza);
          this._handle_session_initiate_error(stanza);

          break;

        case JSJAC_JINGLE_IQ_TYPE_SET:
          /* @function */
          (this.get_session_initiate_request())(this, stanza);
          this._handle_session_initiate_request(stanza);

          break;

        default:
          this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session initiate success
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_session_initiate_success: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate_success', 4);

    try {
      // Change session status
      this._set_status(JSJAC_JINGLE_STATUS_INITIATED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate_success > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session initiate error
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_session_initiate_error: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate_error', 4);

    try {
      // Change session status
      this._set_status(JSJAC_JINGLE_STATUS_INACTIVE);

      // Stop WebRTC
      this._peer_stop();

      // Lock session (cannot be used later)
      this._set_lock(true);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate_error > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session initiate request
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_session_initiate_request: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate_request', 4);

    try {
      // Slot unavailable?
      if(this.get_status() !== JSJAC_JINGLE_STATUS_INACTIVE) {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate_request > Cannot handle, resource already initiated (status: ' + this.get_status() + ').', 0);
        this._send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      // Change session status
      this._set_status(JSJAC_JINGLE_STATUS_INITIATING);

      // Common vars
      var rd_from = this.utils.stanza_from(stanza);
      var rd_sid  = this.utils.stanza_sid(stanza);

      // Request is valid?
      if(rd_sid && this.utils.stanza_parse_content(this.get_to(), stanza)) {
        // Handle additional data (optional)
        this.utils.stanza_parse_group(this.get_to(), stanza);

        // Set session values
        this._set_sid(rd_sid);
        this._set_to(rd_from);
        this._set_initiator(rd_from);
        this._set_responder(this.utils.connection_jid());

        // Register session to common router
        JSJaCJingle._add(JSJAC_JINGLE_SESSION_SINGLE, rd_sid, this);

        // Generate and store content data
        this.utils.build_content_remote(this.get_to());

        // Video or audio-only session?
        if(JSJAC_JINGLE_MEDIA_VIDEO in this.get_content_remote(this.get_to())) {
          this._set_media(JSJAC_JINGLE_MEDIA_VIDEO);
        } else if(JSJAC_JINGLE_MEDIA_AUDIO in this.get_content_remote(this.get_to())) {
          this._set_media(JSJAC_JINGLE_MEDIA_AUDIO);
        } else {
          // Session initiation not done
          /* @function */
          (this.get_session_initiate_error())(this, stanza);
          this._handle_session_initiate_error(stanza);

          // Error (no media is supported)
          this.terminate(JSJAC_JINGLE_REASON_UNSUPPORTED_APPLICATIONS);

          this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate_request > Error (unsupported media).', 1);
          return;
        }

        // Session initiate done
          /* @function */
        (this.get_session_initiate_success())(this, stanza);
        this._handle_session_initiate_success(stanza);

        this.send(JSJAC_JINGLE_IQ_TYPE_RESULT, { id: stanza.getID() });
      } else {
        // Session initiation not done
          /* @function */
        (this.get_session_initiate_error())(this, stanza);
        this._handle_session_initiate_error(stanza);

        // Send error reply
        this._send_error(stanza, XMPP_ERROR_BAD_REQUEST);

        this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate_request > Error (bad request).', 1);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_initiate_request > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session terminate
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_session_terminate: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate', 4);

    try {
      var type = stanza.getType();

      // Security preconditions
      if(!this.utils.stanza_safe(stanza)) {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate > Dropped unsafe stanza.', 0);

        this._send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
        return;
      }

      // Can now safely dispatch the stanza
      switch(stanza.getType()) {
        case JSJAC_JINGLE_IQ_TYPE_RESULT:
          /* @function */
          (this.get_session_terminate_success())(this, stanza);
          this._handle_session_terminate_success(stanza);

          break;

        case 'error':
          /* @function */
          (this.get_session_terminate_error())(this, stanza);
          this._handle_session_terminate_error(stanza);

          break;

        case JSJAC_JINGLE_IQ_TYPE_SET:
          /* @function */
          (this.get_session_terminate_request())(this, stanza);
          this._handle_session_terminate_request(stanza);

          break;

        default:
          this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session terminate success
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_session_terminate_success: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate_success', 4);

    try {
      // Change session status
      this._set_status(JSJAC_JINGLE_STATUS_TERMINATED);

      // Stop WebRTC
      this._peer_stop();
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate_success > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session terminate error
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_session_terminate_error: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate_error', 4);

    try {
      // Change session status
      this._set_status(JSJAC_JINGLE_STATUS_TERMINATED);

      // Stop WebRTC
      this._peer_stop();

      // Lock session (cannot be used later)
      this._set_lock(true);

      this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate_error > Forced session termination locally.', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate_error > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session terminate request
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_session_terminate_request: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate_request', 4);

    try {
      // Slot unavailable?
      if(this.get_status() === JSJAC_JINGLE_STATUS_INACTIVE  ||
         this.get_status() === JSJAC_JINGLE_STATUS_TERMINATED) {
        this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate_request > Cannot handle, resource not active (status: ' + this.get_status() + ').', 0);
        this._send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      // Change session status
      this._set_status(JSJAC_JINGLE_STATUS_TERMINATING);

      // Store termination reason
      this._set_reason(this.utils.stanza_terminate_reason(stanza));

      // Trigger terminate success callbacks
      /* @function */
      (this.get_session_terminate_success())(this, stanza);
      this._handle_session_terminate_success(stanza);

      // Process terminate actions
      this.send(JSJAC_JINGLE_IQ_TYPE_RESULT, { id: stanza.getID() });

      this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate_request > (reason: ' + this.get_reason() + ').', 3);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_session_terminate_request > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle transport accept
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_transport_accept: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_transport_accept', 4);

    try {
      // Not implemented for now
      this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_content_accept > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle transport info
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_transport_info: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_transport_info', 4);

    try {
      // Slot unavailable?
      if(this.get_status() !== JSJAC_JINGLE_STATUS_INITIATED  &&
         this.get_status() !== JSJAC_JINGLE_STATUS_ACCEPTING  &&
         this.get_status() !== JSJAC_JINGLE_STATUS_ACCEPTED) {
        this.get_debug().log('[JSJaCJingle:single] _handle_transport_info > Cannot handle, resource not initiated, nor accepting, nor accepted (status: ' + this.get_status() + ').', 0);
        this._send_error(stanza, JSJAC_JINGLE_ERROR_OUT_OF_ORDER);
        return;
      }

      // Common vars
      var i, cur_candidate_obj;

      // Parse the incoming transport
      var rd_sid = this.utils.stanza_sid(stanza);

      // Request is valid?
      if(rd_sid && this.utils.stanza_parse_content(this.get_to(), stanza)) {
        // Handle additional data (optional)
        // Still unsure if it is relevant to parse groups there... (are they allowed in such stanza?)
        //this.utils.stanza_parse_group(this.get_to(), stanza);

        // Re-generate and store new content data
        this.utils.build_content_remote(this.get_to());

        var sdp_candidates_remote = this.utils.sdp_generate_candidates(
          this.get_candidates_queue_remote(this.get_to())
        );

        // ICE candidates
        for(i in sdp_candidates_remote) {
          cur_candidate_obj = sdp_candidates_remote[i];

          this.get_peer_connection(this.get_to()).addIceCandidate(
            new WEBRTC_ICE_CANDIDATE({
              sdpMLineIndex : cur_candidate_obj.id,
              candidate     : cur_candidate_obj.candidate
            })
          );
        }

        // Empty the unapplied candidates queue
        this._set_candidates_queue_remote(this.get_to(), null);

        // Success reply
        this.send(JSJAC_JINGLE_IQ_TYPE_RESULT, { id: stanza.getID() });
      } else {
        // Send error reply
        this._send_error(stanza, XMPP_ERROR_BAD_REQUEST);

        this.get_debug().log('[JSJaCJingle:single] _handle_transport_info > Error.', 1);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_transport_info > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle transport info success
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_transport_info_success: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_transport_info_success', 4);
  },

  /**
   * Handles the Jingle transport info error
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_transport_info_error: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_transport_info_error', 4);
  },

  /**
   * Handles the Jingle transport reject
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_transport_reject: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_transport_reject', 4);

    try {
      // Not implemented for now
      this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_transport_reject > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle transport replace
   * @private
   * @callback
   * @param {JSJaCPacket} stanza
   */
  _handle_transport_replace: function(stanza) {
    this.get_debug().log('[JSJaCJingle:single] _handle_transport_replace', 4);

    try {
      // Not implemented for now
      this._send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _handle_transport_replace > ' + e, 1);
    }
  },



  /**
   * JSJSAC JINGLE PEER TOOLS
   */

  /**
   * Generates peer connection callback for 'onicecandidate'
   * @private
   * @callback
   * @param {JSJaCJingleSingle} _this
   * @param {Function} sdp_message_callback
   * @param {Object} data
   */
  _peer_connection_callback_onicecandidate: function(_this, sdp_message_callback, data) {
    _this.get_debug().log('[JSJaCJingle:single] _peer_connection_callback_onicecandidate', 4);

    try {
      if(data.candidate) {
        _this.sdp._parse_candidate_store({
          media     : (isNaN(data.candidate.sdpMid) ? data.candidate.sdpMid
                                                    : _this.utils.media_generate(parseInt(data.candidate.sdpMid, 10))),
          candidate : data.candidate.candidate
        });
      } else {
        // Build or re-build content (local)
        _this.utils.build_content_local();

        // In which action stanza should candidates be sent?
        if((_this.is_initiator() && _this.get_status() === JSJAC_JINGLE_STATUS_INITIATING)  ||
           (_this.is_responder() && _this.get_status() === JSJAC_JINGLE_STATUS_ACCEPTING)) {
          _this.get_debug().log('[JSJaCJingle:single] _peer_connection_callback_onicecandidate > Got initial candidates.', 2);

          // Execute what's next (initiate/accept session)
          sdp_message_callback();
        } else {
          _this.get_debug().log('[JSJaCJingle:single] _peer_connection_callback_onicecandidate > Got more candidates (on the go).', 2);

          // Send unsent candidates
          var candidates_queue_local = _this.get_candidates_queue_local();

          if(_this.utils.object_length(candidates_queue_local) > 0)
            _this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_TRANSPORT_INFO, candidates: candidates_queue_local });
        }

        // Empty the unsent candidates queue
        _this._set_candidates_queue_local(null);
      }
    } catch(e) {
      _this.get_debug().log('[JSJaCJingle:single] _peer_connection_callback_onicecandidate > ' + e, 1);
    }
  },

  /**
   * Creates peer connection offer
   * @private
   * @param {String} username
   */
  _peer_connection_create_offer: function(username) {
    this.get_debug().log('[JSJaCJingle:single] _peer_connection_create_offer', 4);

    try {
      // Create offer
      this.get_debug().log('[JSJaCJingle:single] _peer_connection_create_offer > Getting local description...', 2);

      if(this.is_initiator()) {
        // Local description
        this.get_peer_connection(username).createOffer(
          function(sdp_local) {
            this._peer_got_description(username, sdp_local);
          }.bind(this),

          this._peer_fail_description.bind(this),
          WEBRTC_CONFIGURATION.create_offer
        );

        // Then, wait for responder to send back its remote description
      } else {
        // Apply SDP data
        sdp_remote = this.sdp._generate(
          WEBRTC_SDP_TYPE_OFFER,
          this.get_group_remote(username),
          this.get_payloads_remote(username),
          this.get_candidates_queue_remote(username)
        );

        if(this.get_sdp_trace())  this.get_debug().log('[JSJaCJingle:single] _peer_connection_create_offer > SDP (remote)' + '\n\n' + sdp_remote.description.sdp, 4);

        // Remote description
        this.get_peer_connection(username).setRemoteDescription(
          (new WEBRTC_SESSION_DESCRIPTION(sdp_remote.description)),

          function() {
            // Success (descriptions are compatible)
          },

          function(e) {
            if(_this.get_sdp_trace())  _this.get_debug().log('[JSJaCJingle:single] _peer_connection_create_offer > SDP (remote:error)' + '\n\n' + (e.message || e.name || 'Unknown error'), 4);

            // Error (descriptions are incompatible)
            _this.terminate(JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS);
          }
        );

        // Local description
        this.get_peer_connection(username).createAnswer(
          function(sdp_local) {
            this._peer_got_description(username, sdp_local);
          }.bind(this),
          
          this._peer_fail_description.bind(this),
          WEBRTC_CONFIGURATION.create_answer
        );

        // ICE candidates
        var c;
        var cur_candidate_obj;

        for(c in sdp_remote.candidates) {
          cur_candidate_obj = sdp_remote.candidates[c];

          this.get_peer_connection(username).addIceCandidate(
            new WEBRTC_ICE_CANDIDATE({
              sdpMLineIndex : cur_candidate_obj.id,
              candidate     : cur_candidate_obj.candidate
            })
          );
        }

        // Empty the unapplied candidates queue
        this._set_candidates_queue_remote(username, null);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _peer_connection_create_offer > ' + e, 1);
    }
  },

  /**
   * Triggers the media not obtained error event
   * @private
   * @param {Object} error
   */
  _peer_got_user_media_error: function(error) {
    this.get_debug().log('[JSJaCJingle:single] _peer_got_user_media_error', 4);

    try {
      /* @function */
      (this.get_session_initiate_error())(this);

      // Not needed in case we are the responder (breaks termination)
      if(this.is_initiator()) this._handle_session_initiate_error();

      // Not needed in case we are the initiator (no packet sent, ever)
      if(this.is_responder()) this.terminate(JSJAC_JINGLE_REASON_MEDIA_ERROR);

      this.get_debug().log('[JSJaCJingle:single] _peer_got_user_media_error > Failed (' + (error.PERMISSION_DENIED ? 'permission denied' : 'unknown' ) + ').', 1);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _peer_got_user_media_error > ' + e, 1);
    }
  },

  /**
   * Set a timeout limit to peer connection
   * @private
   * @param {String} username
   * @param {String} state
   * @param {Object} [args]
   */
  _peer_timeout: function(username, state, args) {
    try {
      // Assert
      if(typeof args !== 'object') args = {};

      var t_sid = this.get_sid();

      var _this = this;

      setTimeout(function() {
        // State did not change?
        if(_this.get_sid() == t_sid && _this.get_peer_connection(username).iceConnectionState == state) {
          _this.get_debug().log('[JSJaCJingle:single] _peer_timeout > Peer timeout.', 2);

          // Error (transports are incompatible)
          _this.terminate(args.reason || JSJAC_JINGLE_REASON_FAILED_TRANSPORT);
        }
      }, ((args.timer || JSJAC_JINGLE_PEER_TIMEOUT_DEFAULT) * 1000));
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] _peer_timeout > ' + e, 1);
    }
  },

  /**
   * Stops ongoing peer connections
   * @private
   */
  _peer_stop: function() {
    this.get_debug().log('[JSJaCJingle:base] _peer_stop', 4);

    // Detach media streams from DOM view
    this._set_local_stream(null);

    // Stop selected remote stream, or all streams?
    var cur_username;

    for(cur_username in this.get_peer_connection()) {
        this._set_remote_stream(cur_username, null);

        // Close the media stream
        if(this.get_peer_connection(cur_username))
          this.get_peer_connection(cur_username).close();
    }

    // Remove this session from router
    JSJaCJingle._remove(JSJAC_JINGLE_SESSION_SINGLE, this.get_sid());
  },



  /**
   * JSJSAC JINGLE GETTERS
   */

  /**
   * Gets the session initiate pending callback function
   * @public
   * @callback
   * @returns {Function} Callback function
   */
  get_session_initiate_pending: function() {
    if(typeof this._session_initiate_pending == 'function')
      return this._session_initiate_pending;

    return function() {};
  },

  /**
   * Gets the session initiate success callback function
   * @public
   * @callback
   * @returns {Function} Callback function
   */
  get_session_initiate_success: function() {
    if(typeof this._session_initiate_success == 'function')
      return this._session_initiate_success;

    return function(stanza) {};
  },

  /**
   * Gets the session initiate error callback function
   * @public
   * @callback
   * @returns {Function} Callback function
   */
  get_session_initiate_error: function() {
    if(typeof this._session_initiate_error == 'function')
      return this._session_initiate_error;

    return function(stanza) {};
  },

  /**
   * Gets the session initiate request callback function
   * @public
   * @callback
   * @returns {Function} Callback function
   */
  get_session_initiate_request: function() {
    if(typeof this._session_initiate_request == 'function')
      return this._session_initiate_request;

    return function(stanza) {};
  },

  /**
   * Gets the session accept pending callback function
   * @public
   * @callback
   * @returns {Function} Callback function
   */
  get_session_accept_pending: function() {
    if(typeof this._session_accept_pending == 'function')
      return this._session_accept_pending;

    return function() {};
  },

  /**
   * Gets the session accept success callback function
   * @public
   * @callback
   * @returns {Function} Callback function
   */
  get_session_accept_success: function() {
    if(typeof this._session_accept_success == 'function')
      return this._session_accept_success;

    return function(stanza) {};
  },

  /**
   * Gets the session accept error callback function
   * @public
   * @callback
   * @returns {Function} Callback function
   */
  get_session_accept_error: function() {
    if(typeof this._session_accept_error == 'function')
      return this._session_accept_error;

    return function(stanza) {};
  },

  /**
   * Gets the session accept request callback function
   * @public
   * @callback
   * @returns {Function} Callback function
   */
  get_session_accept_request: function() {
    if(typeof this._session_accept_request == 'function')
      return this._session_accept_request;

    return function(stanza) {};
  },

  /**
   * Gets the session info success callback function
   * @public
   * @callback
   * @returns {Function} Callback function
   */
  get_session_info_success: function() {
    if(typeof this._session_info_success == 'function')
      return this._session_info_success;

    return function(stanza) {};
  },

  /**
   * Gets the session info error callback function
   * @public
   * @callback
   * @returns {Function} Callback function
   */
  get_session_info_error: function() {
    if(typeof this._session_info_error == 'function')
      return this._session_info_error;

    return function(stanza) {};
  },

  /**
   * Gets the session info request callback function
   * @public
   * @callback
   * @returns {Function} Callback function
   */
  get_session_info_request: function() {
    if(typeof this._session_info_request == 'function')
      return this._session_info_request;

    return function(stanza) {};
  },

  /**
   * Gets the session terminate pending callback function
   * @public
   * @callback
   * @returns {Function} Callback function
   */
  get_session_terminate_pending: function() {
    if(typeof this._session_terminate_pending == 'function')
      return this._session_terminate_pending;

    return function() {};
  },

  /**
   * Gets the session terminate success callback function
   * @public
   * @callback
   * @returns {Function} Callback function
   */
  get_session_terminate_success: function() {
    if(typeof this._session_terminate_success == 'function')
      return this._session_terminate_success;

    return function(stanza) {};
  },

  /**
   * Gets the session terminate error callback function
   * @public
   * @callback
   * @returns {Function} Callback function
   */
  get_session_terminate_error: function() {
    if(typeof this._session_terminate_error == 'function')
      return this._session_terminate_error;

    return function(stanza) {};
  },

  /**
   * Gets the session terminate request callback function
   * @public
   * @callback
   * @returns {Function} Callback function
   */
  get_session_terminate_request: function() {
    if(typeof this._session_terminate_request == 'function')
      return this._session_terminate_request;

    return function(stanza) {};
  },

  /**
   * Gets the prepended ID
   * @public
   * @returns {String} Prepended ID value
   */
  get_id_pre: function() {
    return JSJAC_JINGLE_STANZA_ID_PRE + '_' + (this.get_sid() || '0') + '_';
  },

  /**
   * Gets the reason value
   * @public
   * @returns {String} Reason value
   */
  get_reason: function() {
    return this._reason;
  },



  /**
   * JSJSAC JINGLE SETTERS
   */

  /**
   * Sets the session initiate pending callback function
   * @private
   * @param {Function} session_initiate_pending
   */
  _set_session_initiate_pending: function(session_initiate_pending) {
    this._session_initiate_pending = session_initiate_pending;
  },

  /**
   * Sets the session initiate success callback function
   * @private
   * @param {Function} initiate_success
   */
  _set_initiate_success: function(initiate_success) {
    this._session_initiate_success = initiate_success;
  },

  /**
   * Sets the session initiate error callback function
   * @private
   * @param {Function} initiate_error
   */
  _set_initiate_error: function(initiate_error) {
    this._session_initiate_error = initiate_error;
  },

  /**
   * Sets the session initiate request callback function
   * @private
   * @param {Function} initiate_request
   */
  _set_initiate_request: function(initiate_request) {
    this._session_initiate_request = initiate_request;
  },

  /**
   * Sets the session accept pending callback function
   * @private
   * @param {Function} accept_pending
   */
  _set_accept_pending: function(accept_pending) {
    this._session_accept_pending = accept_pending;
  },

  /**
   * Sets the session accept success callback function
   * @private
   * @param {Function} accept_success
   */
  _set_accept_success: function(accept_success) {
    this._session_accept_success = accept_success;
  },

  /**
   * Sets the session accept error callback function
   * @private
   * @param {Function} accept_error
   */
  _set_accept_error: function(accept_error) {
    this._session_accept_error = accept_error;
  },

  /**
   * Sets the session accept request callback function
   * @private
   * @param {Function} accept_request
   */
  _set_accept_request: function(accept_request) {
    this._session_accept_request = accept_request;
  },

  /**
   * Sets the session info success callback function
   * @private
   * @param {Function} info_success
   */
  _set_info_success: function(info_success) {
    this._session_info_success = info_success;
  },

  /**
   * Sets the session info error callback function
   * @private
   * @param {Function} info_error
   */
  _set_info_error: function(info_error) {
    this._session_info_error = info_error;
  },

  /**
   * Sets the session info request callback function
   * @private
   * @param {Function} info_request
   */
  _set_info_request: function(info_request) {
    this._session_info_request = info_request;
  },

  /**
   * Sets the session terminate pending callback function
   * @private
   * @param {Function} terminate_pending
   */
  _set_terminate_pending: function(terminate_pending) {
    this._session_terminate_pending = terminate_pending;
  },

  /**
   * Sets the session terminate success callback function
   * @private
   * @param {Function} terminate_success
   */
  _set_terminate_success: function(terminate_success) {
    this._session_terminate_success = terminate_success;
  },

  /**
   * Sets the session terminate error callback function
   * @private
   * @param {Function} terminate_error
   */
  _set_terminate_error: function(terminate_error) {
    this._session_terminate_error = terminate_error;
  },

  /**
   * Sets the session terminate request callback function
   * @private
   * @param {Function} terminate_request
   */
  _set_terminate_request: function(terminate_request) {
    this._session_terminate_request = terminate_request;
  },

  /**
   * Sets the termination reason
   * @private
   * @param {String} reason
   */
  _set_reason: function(reason) {
    this._reason = reason || JSJAC_JINGLE_REASON_CANCEL;
  },

  /**
   * Sets the remote stream
   * @private
   * @param {String} username
   * @param {DOM} [remote_stream]
   */
  _set_remote_stream: function(username, remote_stream) {
    try {
      if(!remote_stream && this._remote_stream[username]) {
        this._peer_stream_detach(
          this.get_remote_view(username)
        );
      }

      if(remote_stream) {
        this._remote_stream[username] = remote_stream;

        this._peer_stream_attach(
          this.get_remote_view(username),
          this.get_remote_stream(username),
          false
        );
      } else {
        if(username in this._remote_stream)  delete this._remote_stream[username];

        this._peer_stream_detach(
          this.get_remote_view(username)
        );
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:base] _set_remote_stream > ' + e, 1);
    }
  },

});
