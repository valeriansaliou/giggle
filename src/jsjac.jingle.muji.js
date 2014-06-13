/**
 * @fileoverview JSJaC Jingle library - Multi-user call lib
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/**
 * Creates a new XMPP Jingle Muji session.
 * @class Creates a new XMPP Jingle Muji session.
 * @constructor
 * @param {Object} args Muji session arguments.
 * @param {*} args.* Herits of JSJaCJingle() prototype
 * @param {string} args.username The username when joining room.
 * @param {function} args.room_message_in The incoming message custom handler.
 * @param {function} args.room_message_out The outgoing message custom handler.
 * @param {function} args.room_presence_in The incoming presence custom handler.
 * @param {function} args.room_presence_out The outgoing presence custom handler.
 * @param {function} args.session_prepare_pending The session prepare pending custom handler.
 * @param {function} args.session_prepare_success The session prepare success custom handler.
 * @param {function} args.session_prepare_error The session prepare error custom handler.
 * @param {function} args.session_initiate_pending The session initiate pending custom handler.
 * @param {function} args.session_initiate_success The session initiate success custom handler.
 * @param {function} args.session_initiate_error The session initiate error custom handler.
 * @param {function} args.session_leave_pending The session leave pending custom handler.
 * @param {function} args.session_leave_success The session leave success custom handler.
 * @param {function} args.session_leave_error The session leave error custom handler.
 * @param {function} args.participant_prepare The participant prepare custom handler.
 * @param {function} args.participant_initiate The participant initiate custom handler.
 * @param {function} args.participant_leave The participant leave custom handler.
 * @param {function} args.add_remote_view The remote view media add (audio/video) custom handler.
 * @param {function} args.remove_remote_view The remote view media removal (audio/video) custom handler.
 */
var JSJaCJingleMuji = ring.create([__JSJaCJingleBase], {
  /**
   * Constructor
   */
  constructor: function(args) {
    this.$super(args);

    /**
     * @private
     */
    self._participants = {};

    if(args && args.room_message_in)
      /**
       * @private
       */
      this._room_message_in = args.room_message_in;

    if(args && args.room_message_out)
      /**
       * @private
       */
      this._room_message_out = args.room_message_out;

    if(args && args.room_presence_in)
      /**
       * @private
       */
      this._room_presence_in = args.room_presence_in;

    if(args && args.room_presence_out)
      /**
       * @private
       */
      this._room_presence_out = args.room_presence_out;

    if(args && args.session_prepare_pending)
      /**
       * @private
       */
      this._session_prepare_pending = args.session_prepare_pending;

    if(args && args.session_prepare_success)
      /**
       * @private
       */
      this._session_prepare_success = args.session_prepare_success;

    if(args && args.session_prepare_error)
      /**
       * @private
       */
      this._session_prepare_error = args.session_prepare_error;

    if(args && args.session_initiate_pending)
      /**
       * @private
       */
      this._session_initiate_pending = args.session_initiate_pending;

    if(args && args.session_initiate_success)
      /**
       * @private
       */
      this._session_initiate_success = args.session_initiate_success;

    if(args && args.session_initiate_error)
      /**
       * @private
       */
      this._session_initiate_error = args.session_initiate_error;

    if(args && args.session_leave_pending)
      /**
       * @private
       */
      this._session_leave_pending = args.session_leave_pending;

    if(args && args.session_leave_success)
      /**
       * @private
       */
      this._session_leave_success = args.session_leave_success;

    if(args && args.session_leave_error)
      /**
       * @private
       */
      this._session_leave_error = args.session_leave_error;

    if(args && args.participant_prepare)
      /**
       * @private
       */
      this._participant_prepare = args.participant_prepare;

    if(args && args.participant_initiate)
      /**
       * @private
       */
      this._participant_initiate = args.participant_initiate;

    if(args && args.participant_leave)
      /**
       * @private
       */
      this._participant_leave = args.participant_leave;

    if(args && args.add_remote_view)
      /**
       * @private
       */
      this._add_remote_view = args.add_remote_view;

    if(args && args.remove_remote_view)
      /**
       * @private
       */
      this._remove_remote_view = args.remove_remote_view;

    if(args && args.username) {
      /**
       * @private
       */
      this._username = args.username;
    } else {
      /**
       * @private
       */
      this._username = this.utils.connection_username();
    }

    /**
     * @private
     */
    this._status = JSJAC_JINGLE_MUJI_STATUS_INACTIVE;

    /**
     * @private
     */
    this._participants = {};
  },


  /**
   * Initiates a new Muji session.
   * @public
   */
  join: function() {
    this.get_debug().log('[JSJaCJingle:muji] join', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:muji] join > Cannot join, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      var _this = this;

      if(JSJaCJingle.defer(function() { _this.join(); })) {
        this.get_debug().log('[JSJaCJingle:muji] join > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(this.get_status() != JSJAC_JINGLE_STATUS_INACTIVE) {
        this.get_debug().log('[JSJaCJingle:muji] join > Cannot join, resource not inactive (status: ' + this.get_status() + ').', 0);
        return;
      }

      this.get_debug().log('[JSJaCJingle:muji] join > New Jingle Muji session with media: ' + this.get_media(), 2);

      // Common vars
      var i, cur_name;

      // Trigger init pending custom callback
      (this.get_session_initiate_pending())(this);

      // Change session status
      this.set_status(JSJAC_JINGLE_MUJI_STATUS_PREPARING);

      // Set session values
      this.set_sid(
        this.utils.generate_hash_md5(this.get_to())
      );

      for(i in this.get_media_all()) {
        cur_name = this.utils.name_generate(
          this.get_media_all()[i]
        );

        this.set_name(cur_name);
      }

      // Register session to common router
      JSJaCJingle.add(JSJAC_JINGLE_SESSION_MUJI, this.get_to(), this);

      // Send initial join presence
      this.send_presence({ action: JSJAC_JINGLE_MUJI_ACTION_PREPARE });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] join > ' + e, 1);
    }
  },


  /**
   * Leaves current Muji session.
   * @public
   */
  leave: function() {
    this.get_debug().log('[JSJaCJingle:muji] leave', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:muji] leave > Cannot leave, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      var _this = this;

      if(JSJaCJingle.defer(function() { _this.leave(); })) {
        this.get_debug().log('[JSJaCJingle:muji] leave > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(this.get_status() == JSJAC_JINGLE_MUJI_STATUS_LEFT) {
        this.get_debug().log('[JSJaCJingle:muji] leave > Cannot terminate, resource already terminated (status: ' + this.get_status() + ').', 0);
        return;
      }

      // Change session status
      this.set_status(JSJAC_JINGLE_MUJI_STATUS_LEAVING);

      // Trigger terminate pending custom callback
      (this.get_session_leave_pending())(this);

      // Leave the room
      this.send_presence({ action: JSJAC_JINGLE_MUJI_ACTION_LEAVE });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] leave > ' + e, 1);
    }
  },

  /**
   * Sends a given Muji presence stanza
   * @public
   */
  send_presence: function(args) {
    this.get_debug().log('[JSJaCJingle:muji] send_presence', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:muji] send_presence > Cannot send, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      var _this = this;

      if(JSJaCJingle.defer(function() { _this.send_presence(args); })) {
        this.get_debug().log('[JSJaCJingle:muji] send_presence > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Assert
      if(typeof args !== 'object') args = {};

      // Build stanza
      var stanza = new JSJaCPresence();
      stanza.setTo(this.get_muc_to());

      if(!args.id) args.id = this.get_id_new();
      stanza.setID(args.id);

      // Submit to registered handler
      switch(args.action) {
        case JSJAC_JINGLE_MUJI_ACTION_PREPARE:
          this._send_session_prepare(stanza, args); break;

        case JSJAC_JINGLE_MUJI_ACTION_INITIATE:
          this._send_session_initiate(stanza, args); break;

        case JSJAC_JINGLE_MUJI_ACTION_LEAVE:
          this._send_session_leave(stanza, args); break;

        default:
          this.get_debug().log('[JSJaCJingle:muji] send_presence > Unexpected error.', 1);

          return false;
      }

      JSJAC_JINGLE_STORE_CONNECTION.send(stanza);

      if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:muji] send_presence > Outgoing packet sent' + '\n\n' + stanza.xml());

      // Trigger custom callback
      (this.get_room_presence_out())(this, stanza);

      return true;
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] send_presence > ' + e, 1);
    }

    return false;
  },

  /**
   * Sends a given Muji message stanza
   * @public
   */
  send_message: function(body) {
    this.get_debug().log('[JSJaCJingle:muji] send_message', 4);

    try {
      // Missing args?
      if(!body) {
        this.get_debug().log('[JSJaCJingle:muji] send_message > Message body missing.', 0);
        return;
      }

      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:muji] send_message > Cannot send, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      var _this = this;

      if(JSJaCJingle.defer(function() { _this.send_message(body); })) {
        this.get_debug().log('[JSJaCJingle:muji] send_message > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Build stanza
      var stanza = new JSJaCMessage();

      stanza.setTo(this.get_to());
      stanza.setType(JSJAC_JINGLE_MESSAGE_TYPE_GROUPCHAT);
      stanza.setBody(body);

      JSJAC_JINGLE_STORE_CONNECTION.send(stanza);

      if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:muji] send_message > Outgoing packet sent' + '\n\n' + stanza.xml());

      // Trigger custom callback
      (this.get_room_message_out())(this, stanza);

      return true;
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] send_message > ' + e, 1);
    }

    return false;
  },

  /**
   * Handles a Muji presence stanza
   * @public
   */
  handle_presence: function(stanza) {
    this.get_debug().log('[JSJaCJingle:muji] handle_presence', 4);

    try {
      if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:muji] handle_presence > Incoming packet received' + '\n\n' + stanza.xml());

      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:muji] handle_presence > Cannot handle, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      var _this = this;

      if(JSJaCJingle.defer(function() { _this.handle_presence(stanza); })) {
        this.get_debug().log('[JSJaCJingle:muji] handle_presence > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Trigger custom callback
      (this.get_room_presence_in())(this, stanza);

      var id = stanza.getID();

      // Submit to custom handler (only for local user packets)
      if(typeof this.get_handlers(JSJAC_JINGLE_PRESENCE_TYPE_ALL, id) == 'function'  &&
         this._stanza_from_local(stanza)) {
        this.get_debug().log('[JSJaCJingle:muji] handle_presence > Submitted to custom handler.', 2);

        (this.get_handlers(JSJAC_JINGLE_PRESENCE_TYPE_ALL, id))(stanza);
        this.unregister_handler(JSJAC_JINGLE_PRESENCE_TYPE_ALL, id);

        return;
      }

      // Submit to registered handler
      if(stanza.getType() == JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE) {
        this._handle_participant_leave(stanza);
      } else {
        var muji = this.utils.stanza_muji(stanza);

        // Don't handle non-Muji stanzas there...
        if(!muji) return;

        // Submit to registered handler
        if(this._stanza_has_preparing(muji)) {
          this._handle_participant_prepare(stanza);
          this.get_participant_prepare()(stanza);
        } else if(this._stanza_has_content(muji)) {
          this._handle_participant_initiate(stanza);
          this.get_participant_initiate()(stanza);
        } else if(this._stanza_from_participant(stanza)) {
          this._handle_participant_leave(stanza);
          this.get_participant_leave()(stanza);
        }
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] handle_presence > ' + e, 1);
    }
  },

  /**
   * Handles a Muji message stanza
   * @public
   */
  handle_message: function(stanza) {
    this.get_debug().log('[JSJaCJingle:muji] handle_message', 4);

    try {
      var stanza_type = stanza.getType();

      if(stanza_type != JSJAC_JINGLE_MESSAGE_TYPE_GROUPCHAT) {
        this.get_debug().log('[JSJaCJingle:muji] handle_message > Dropped invalid stanza type: ' + stanza_type, 0);
        return;
      }

      // Trigger custom callback
      (this.get_room_message_in())(this, stanza);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] handle_message > ' + e, 1);
    }
  },

  /**
   * Mutes a Muji session (local)
   * @public
   */
  mute: function(name) {
    this.get_debug().log('[JSJaCJingle:muji] mute', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:muji] mute > Cannot mute, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      var _this = this;

      if(JSJaCJingle.defer(function() { _this.mute(name); })) {
        this.get_debug().log('[JSJaCJingle:muji] mute > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Already muted?
      if(this.get_mute(name)) {
        this.get_debug().log('[JSJaCJingle:muji] mute > Resource already muted.', 0);
        return;
      }

      this.peer.sound(false);
      this.set_mute(name, true);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] mute > ' + e, 1);
    }
  },

  /**
   * Unmutes a Muji session (local)
   * @public
   */
  unmute: function(name) {
    this.get_debug().log('[JSJaCJingle:muji] unmute', 4);

    try {
      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:muji] unmute > Cannot unmute, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      var _this = this;

      if(JSJaCJingle.defer(function() { _this.unmute(name); })) {
        this.get_debug().log('[JSJaCJingle:muji] unmute > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Already unmute?
      if(!this.get_mute(name)) {
        this.get_debug().log('[JSJaCJingle:muji] unmute > Resource already unmuted.', 0);
        return;
      }

      this.peer.sound(true);
      this.set_mute(name, false);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] unmute > ' + e, 1);
    }
  },



  /**
   * JSJSAC JINGLE MUJI SENDERS
   */

  /**
   * Sends the session prepare event.
   * @private
   */
  _send_session_prepare: function(stanza, args) {
    this.get_debug().log('[JSJaCJingle:muji] _send_session_prepare', 4);

    try {
      if(this.get_status() != JSJAC_JINGLE_MUJI_STATUS_PREPARING) {
        this.get_debug().log('[JSJaCJingle:muji] _send_session_prepare > Cannot send prepare stanza, resource already prepared (status: ' + this.get_status() + ').', 0);
        return;
      }

      // Build Muji stanza
      var muji = this.utils.stanza_generate_muji(stanza);
      muji.appendChild(stanza.buildNode('preparing', { 'xmlns': NS_TELEPATHY_MUJI }));

      // Schedule success
      var _this = this;

      this.register_handler(JSJAC_JINGLE_PRESENCE_TYPE_ALL, args.id, function(stanza) {
        (_this.get_session_prepare_success())(_this, stanza);
        _this._handle_session_prepare_success(stanza);
      });

      // Schedule error timeout
      this.utils.stanza_timeout(JSJAC_JINGLE_PRESENCE_TYPE_ALL, args.id, {
        external:   this.get_session_prepare_error().bind(this),
        internal:   this._handle_session_prepare_error.bind(this)
      });

      this.get_debug().log('[JSJaCJingle:muji] _send_session_prepare > Sent.', 2);

      // Trigger session prepare custom callback
      (this.get_session_prepare_pending())(this);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] _send_session_prepare > ' + e, 1);
    }
  },

  /**
   * Sends the session initiate event.
   * @private
   */
  _send_session_initiate: function(stanza, args) {
    this.get_debug().log('[JSJaCJingle:muji] _send_session_initiate', 4);

    try {
      if(this.get_status() != JSJAC_JINGLE_MUJI_STATUS_INITIATING) {
        this.get_debug().log('[JSJaCJingle:muji] _send_session_initiate > Cannot send prepare stanza, resource already initiated (status: ' + this.get_status() + ').', 0);
        return;
      }

      // Build Muji stanza
      var muji = this.utils.stanza_generate_muji(stanza);

      this.utils.stanza_generate_content_local(stanza, muji);
      this.utils.stanza_generate_group_local(stanza, muji);

      // Schedule success
      var _this = this;

      this.register_handler(JSJAC_JINGLE_PRESENCE_TYPE_ALL, args.id, function(stanza) {
        (_this.get_session_initiate_success())(_this, stanza);
        _this._handle_session_initiate_success(stanza);
      });

      // Schedule error timeout
      this.utils.stanza_timeout(JSJAC_JINGLE_PRESENCE_TYPE_ALL, args.id, {
        external:   this.get_session_initiate_error().bind(this),
        internal:   this._handle_session_initiate_error.bind(this)
      });

      this.get_debug().log('[JSJaCJingle:muji] _send_session_initiate > Sent.', 2);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] _send_session_initiate > ' + e, 1);
    }
  },

  /**
   * Sends the session leave event.
   * @private
   */
  _send_session_leave: function(stanza, args) {
    this.get_debug().log('[JSJaCJingle:muji] _send_session_leave', 4);

    try {
      stanza.setType(JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE);

      // Schedule success
      var _this = this;

      this.register_handler(JSJAC_JINGLE_PRESENCE_TYPE_ALL, args.id, function(stanza) {
        (_this.get_session_leave_success())(_this, stanza);
        _this._handle_session_leave_success(stanza);
      });

      // Schedule error timeout
      this.utils.stanza_timeout(JSJAC_JINGLE_PRESENCE_TYPE_ALL, args.id, {
        external:   this.get_session_leave_error().bind(this),
        internal:   this._handle_session_leave_error.bind(this)
      });

      this.get_debug().log('[JSJaCJingle:muji] _send_session_leave > Sent.', 2);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] _send_session_leave > ' + e, 1);
    }
  },



  /**
   * JSJSAC JINGLE MUJI HANDLERS
   */

  /**
   * Handles the Jingle session prepare success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   * @private
   */
  _handle_session_prepare_success: function(stanza) {
    this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success', 4);

    try {
      var username = this.extract_stanza_username(stanza);

      if(!username) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success > No username provided, not accepting prepare stanza.', 0);
      }

      // Username conflict?
      if(this._stanza_username_conflict(stanza)) {
        var alt_username = (this.get_username() + this.utils.generate_random(4));

        this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success > Conflicting username, changing it to: ' + alt_username, 2);

        this._set_username(alt_username);
        this.send_presence({ action: JSJAC_JINGLE_MUJI_ACTION_PREPARE });
      } else {
        this._set_participants(username);

        // Initialize WebRTC
        var _this = this;

        this.peer.get_user_media(function() {
          _this.peer.connection_create(username, function() {
            _this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success > Ready to begin Jingle negotiation.', 2);

            _this.send_presence({ action: JSJAC_JINGLE_MUJI_ACTION_INITIATE });
          });
        });

        // Change session status
        this.set_status(JSJAC_JINGLE_MUJI_STATUS_PREPARED);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session prepare error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   * @private
   */
  _handle_session_prepare_error: function(stanza) {
    this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_error', 4);

    try {
      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_INACTIVE);

      this.leave();

      // Lock session (cannot be used later)
      this.set_lock(true);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_error > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session initiate success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   * @private
   */
  _handle_session_initiate_success: function(stanza) {
    this.get_debug().log('[JSJaCJingle:muji] _handle_session_initiate_success', 4);

    try {
      // Change session status
      this.set_status(JSJAC_JINGLE_MUJI_STATUS_INITIATED);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_session_initiate_success > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session initiate error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   * @private
   */
  _handle_session_initiate_error: function(stanza) {
    this.get_debug().log('[JSJaCJingle:muji] _handle_session_initiate_error', 4);

    try {
      this.leave();

      // Lock session (cannot be used later)
      this.set_lock(true);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_session_initiate_error > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session leave success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   * @private
   */
  _handle_session_leave_success: function(stanza) {
    this.get_debug().log('[JSJaCJingle:muji] _handle_session_leave_success', 4);

    try {
      // Change session status
      this.set_status(JSJAC_JINGLE_MUJI_STATUS_LEFT);

      // Stop WebRTC
      this.peer.stop();
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_session_leave_success > ' + e, 1);
    }
  },

  /**
   * Handles the Jingle session leave error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   * @private
   */
  _handle_session_leave_error: function(stanza) {
    this.get_debug().log('[JSJaCJingle:muji] _handle_session_leave_error', 4);

    try {
      // Change session status
      this.set_status(JSJAC_JINGLE_MUJI_STATUS_LEFT);

      // Stop WebRTC
      this.peer.stop();

      // Lock session (cannot be used later)
      this.set_lock(true);

      this.get_debug().log('[JSJaCJingle:muji] _handle_session_leave_error > Forced session exit locally.', 0);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_session_leave_error > ' + e, 1);
    }
  },

  /**
   * Handles the participant prepare event.
   * @private
   */
  _handle_participant_prepare: function(stanza) {
    this.get_debug().log('[JSJaCJingle:muji] _handle_participant_prepare', 4);

    try {
      var username = this.extract_stanza_username(stanza);

      this._set_participants(username);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_prepare > ' + e, 1);
    }
  },

  /**
   * Handles the participant initiate event.
   * @private
   */
  _handle_participant_initiate: function(stanza) {
    this.get_debug().log('[JSJaCJingle:muji] _handle_participant_initiate', 4);

    try {
      var username = this.extract_stanza_username(stanza);

      // Slot unavailable?
      if(this.get_status() != JSJAC_JINGLE_MUJI_STATUS_PREPARED    &&
         this.get_status() != JSJAC_JINGLE_MUJI_STATUS_INITIATING  &&
         this.get_status() != JSJAC_JINGLE_MUJI_STATUS_INITIATED) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_initiate > Cannot handle (from: ' + username + '), resource not available (status: ' + this.get_status() + ').', 0);
        return;
      }
      
      // Content is valid?
      if(this.utils.stanza_parse_content(username, stanza)) {
        // Handle additional data (optional)
        this.utils.stanza_parse_group(username, stanza);

        // Generate and store content data
        this.utils.build_content_remote(username);

        // Invalid media?
        if(!(JSJAC_JINGLE_MEDIA_VIDEO in this.get_content_remote(username))  && 
           !(JSJAC_JINGLE_MEDIA_AUDIO in this.get_content_remote(username))) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_participant_initiate > Error (unsupported media).', 1);
          return;
        }

        // Session initiate done
        // TODO: whole stuff below

        // ---- BEGIN ----
          // TODO: create WebRTC peer connection
          // TODO: update participant storage
          // TODO: add participant to DOM (once PeerConnection stram starts flowing)

          // TODO: use get_add_remote_view()(username)
        // ---- END ----
      } else {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_initiate > Error (bad request).', 1);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_initiate > ' + e, 1);
    }
  },

  /**
   * Handles the participant leave event.
   * @private
   */
  _handle_participant_leave: function(stanza) {
    this.get_debug().log('[JSJaCJingle:muji] _handle_participant_leave', 4);

    try {
      var username = this.extract_stanza_username(stanza);

      // Stop WebRTC
      this.peer.stop(username);

      // Flush participant content
      this._set_participants(username, false);
      this._flush_participant(username);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_leave > ' + e, 1);
    }
  },



  /**
   * JSJSAC JINGLE STANZA PARSERS
   */

  /**
   * Returns whether user is preparing or not
   * @private
   * @param {object} muji
   * @returns {boolean} preparing state
   */
  _stanza_has_preparing: function(muji) {
    return this.utils.stanza_get_element(muji, 'preparing', NS_TELEPATHY_MUJI).length && true;
  },

  /**
   * Returns whether user has content or not
   * @private
   * @param {object} muji
   * @returns {boolean} content state
   */
  _stanza_has_content: function(muji) {
    return muji.getChild('content', NS_TELEPATHY_MUJI) && true;
  },



  /**
   * JSJSAC JINGLE MUJI GETTERS
   */

  /**
   * Gets the participants object
   * @public
   * @returns {object} participants object
   */
  get_participants: function(username) {
    if(username)
      return this._participants[username];

    return this._participants;
  },

  /**
   * Gets the creator value
   * @public
   * @returns {string} creator value
   */
  get_creator: function() {
    return this.get_to();
  },

  /**
   * Gets the initiator value
   * @public
   * @returns {string} initiator value
   */
  get_initiator: function() {
    return this.get_to();
  },

  /**
   * Gets the responder value
   * @public
   * @returns {string} responder value
   */
  get_responder: function() {
    return this.get_to();
  },

  /**
   * Gets the incoming message callback function
   * @public
   * @returns {function} incoming message callback function
   */
  get_room_message_in: function() {
    if(typeof this._room_message_in == 'function')
      return this._room_message_in;

    return function() {};
  },

  /**
   * Gets the outgoing message callback function
   * @public
   * @returns {function} outgoing message callback function
   */
  get_room_message_out: function() {
    if(typeof this._room_message_out == 'function')
      return this._room_message_out;

    return function() {};
  },

  /**
   * Gets the incoming presence callback function
   * @public
   * @returns {function} incoming presence callback function
   */
  get_room_presence_in: function() {
    if(typeof this._room_presence_in == 'function')
      return this._room_presence_in;

    return function() {};
  },

  /**
   * Gets the outgoing presence callback function
   * @public
   * @returns {function} outgoing presence callback function
   */
  get_room_presence_out: function() {
    if(typeof this._room_presence_out == 'function')
      return this._room_presence_out;

    return function() {};
  },

  /**
   * Gets the session prepare pending callback function
   * @public
   * @returns {function} session prepare pending callback function
   */
  get_session_prepare_pending: function() {
    if(typeof this._session_prepare_pending == 'function')
      return this._session_prepare_pending;

    return function() {};
  },

  /**
   * Gets the session prepare success callback function
   * @public
   * @returns {function} session prepare success callback function
   */
  get_session_prepare_success: function() {
    if(typeof this._session_prepare_success == 'function')
      return this._session_prepare_success;

    return function() {};
  },

  /**
   * Gets the session prepare error callback function
   * @public
   * @returns {function} session prepare error callback function
   */
  get_session_prepare_error: function() {
    if(typeof this._session_prepare_error == 'function')
      return this._session_prepare_error;

    return function() {};
  },

  /**
   * Gets the session initiate pending callback function
   * @public
   * @returns {function} session initiate pending callback function
   */
  get_session_initiate_pending: function() {
    if(typeof this._session_initiate_pending == 'function')
      return this._session_initiate_pending;

    return function() {};
  },

  /**
   * Gets the session initiate success callback function
   * @public
   * @returns {function} session initiate success callback function
   */
  get_session_initiate_success: function() {
    if(typeof this._session_initiate_success == 'function')
      return this._session_initiate_success;

    return function() {};
  },

  /**
   * Gets the session initiate error callback function
   * @public
   * @returns {function} session initiate error callback function
   */
  get_session_initiate_error: function() {
    if(typeof this._session_initiate_error == 'function')
      return this._session_initiate_error;

    return function() {};
  },

  /**
   * Gets the session leave pending callback function
   * @public
   * @returns {function} session leave pending callback function
   */
  get_session_leave_pending: function() {
    if(typeof this._session_leave_pending == 'function')
      return this._session_leave_pending;

    return function() {};
  },

  /**
   * Gets the session leave success callback function
   * @public
   * @returns {function} session leave success callback function
   */
  get_session_leave_success: function() {
    if(typeof this._session_leave_success == 'function')
      return this._session_leave_success;

    return function() {};
  },

  /**
   * Gets the session leave error callback function
   * @public
   * @returns {function} session leave error callback function
   */
  get_session_leave_error: function() {
    if(typeof this._session_leave_error == 'function')
      return this._session_leave_error;

    return function() {};
  },

  /**
   * Gets the participant prepare callback function
   * @public
   * @returns {function} participant prepare callback function
   */
  get_participant_prepare: function() {
    if(typeof this._participant_prepare == 'function')
      return this._participant_prepare;

    return function() {};
  },

  /**
   * Gets the participant initiate callback function
   * @public
   * @returns {function} participant initiate callback function
   */
  get_participant_initiate: function() {
    if(typeof this._participant_initiate == 'function')
      return this._participant_initiate;

    return function() {};
  },

  /**
   * Gets the participant leave callback function
   * @public
   * @returns {function} participant leave callback function
   */
  get_participant_leave: function() {
    if(typeof this._participant_leave == 'function')
      return this._participant_leave;

    return function() {};
  },

  /**
   * Gets the remote view add callback function
   * @public
   * @returns {function} remote view add callback function
   */
  get_add_remote_view: function() {
    if(typeof this._add_remote_view == 'function')
      return this._add_remote_view;

    return function() {};
  },

  /**
   * Gets the remote view removal callback function
   * @public
   * @returns {function} remote view removal callback function
   */
  get_remove_remote_view: function() {
    if(typeof this._remove_remote_view == 'function')
      return this._remove_remote_view;

    return function() {};
  },

  /**
   * Gets the local username
   * @public
   * @returns {string} local username
   */
  get_username: function() {
    return this._username;
  },

  /**
   * Gets the MUC to value
   * @public
   * @returns {string} MUC to value
   */
  get_muc_to: function() {
    return (this.get_to() + '/' + this.get_username());
  },

  /**
   * Gets the prepended ID
   * @public
   * @returns {string} Prepended ID value
   */
  get_id_pre: function() {
    return JSJAC_JINGLE_STANZA_ID_PRE + '_' + (this.get_sid() || '0') + '_' + this.get_username() + '_';
  },



  /**
   * JSJSAC JINGLE MUJI SETTERS
   */

  /**
   * Sets the participants object
   * @private
   */
  _set_participants: function(username, keep) {
    if(keep === false)
      delete this._participants[username];
    else if(username)
      this._participants[username] = 1;
  },

  /**
   * Sets the local username
   * @private
   */
  _set_username: function(username) {
    this._username = username;
  },



  /**
   * JSJSAC JINGLE SHORTCUTS
   */

  /**
   * Flushes participant data
   * @public
   */
  _flush_participant: function(username) {
    this.set_remote_view(username, null);
    this.set_remote_stream(username, null);
    this.set_content_remote(username, null);
    this.set_payloads_remote(username, null);
    this.set_group_remote(username, null);
    this.set_candidates_remote(username, null);
    this.set_candidates_queue_remote(username, null);
  },

  /**
   * Extracts username from stanza
   * @public
   * @returns {string} Username
   */
  extract_stanza_username: function(stanza) {
    var from = stanza.getFrom();
    return (new JSJaCJID(from)).getResource();
  },

  /**
   * Returns whether stanza is from a participant or not
   * @private
   * @returns {boolean} Participant state
   */
  _stanza_from_participant: function(stanza) {
    var username = this.extract_stanza_username();
    return (typeof self.get_participants(username) === 1) && true;
  },

  /**
   * Returns whether stanza is from local user or not
   * @private
   * @returns {boolean} Local user state
   */
  _stanza_from_local: function(stanza) {
    return this.extract_stanza_username(stanza) === this.get_username();
  },

  /**
   * Returns whether stanza is an username conflict or not
   * @private
   * @returns {boolean} Local user state
   */
  _stanza_username_conflict: function(stanza) {
    has_username_conflict = false;

    try {
      var i,
          error_child, cur_error_child;
      
      error_child = stanza.getChild('error', NS_CLIENT);

      if(error_child && error_child.length) {
        for(i = 0; i < error_child.length; i++) {
          cur_error_child = error_child[i];

          if(cur_error_child.getAttribute('type') === XMPP_ERROR_CONFLICT.type  &&
             cur_error_child.getChild(XMPP_ERROR_CONFLICT.xmpp, NS_IETF_XMPP_STANZAS)) {
            has_username_conflict = true; break;
          }
        }
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] _stanza_username_conflict > ' + e, 1);
    } finally {
      return has_username_conflict;
    }
  },
});
