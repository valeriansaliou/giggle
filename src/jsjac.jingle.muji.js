/**
 * @fileoverview JSJaC Jingle library - Multi-user call lib
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/muji */
/** @exports JSJaCJingleMuji */


/**
 * Creates a new XMPP Jingle Muji session.
 * @class
 * @classdesc  Creates a new XMPP Jingle Muji session.
 * @augments   __JSJaCJingleBase
 * @requires   nicolas-van/ring.js
 * @requires   sstrigler/JSJaC
 * @requires   jsjac-jingle/main
 * @requires   jsjac-jingle/base
 * @see        {@link http://xmpp.org/extensions/xep-0272.html|XEP-0272: Multiparty Jingle (Muji)}
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://stefan-strigler.de/jsjac-1.3.4/doc/|JSJaC Documentation}
 * @param      {Object}    [args]                           - Muji session arguments.
 * @property   {*}         [args.*]                         - Herits of JSJaCJingle() baseclass prototype.
 * @property   {String}    [args.username]                  - The username when joining room.
 * @property   {Function}  [args.room_message_in]           - The incoming message custom handler.
 * @property   {Function}  [args.room_message_out]          - The outgoing message custom handler.
 * @property   {Function}  [args.room_presence_in]          - The incoming presence custom handler.
 * @property   {Function}  [args.room_presence_out]         - The outgoing presence custom handler.
 * @property   {Function}  [args.session_prepare_pending]   - The session prepare pending custom handler.
 * @property   {Function}  [args.session_prepare_success]   - The session prepare success custom handler.
 * @property   {Function}  [args.session_prepare_error]     - The session prepare error custom handler.
 * @property   {Function}  [args.session_initiate_pending]  - The session initiate pending custom handler.
 * @property   {Function}  [args.session_initiate_success]  - The session initiate success custom handler.
 * @property   {Function}  [args.session_initiate_error]    - The session initiate error custom handler.
 * @property   {Function}  [args.session_leave_pending]     - The session leave pending custom handler.
 * @property   {Function}  [args.session_leave_success]     - The session leave success custom handler.
 * @property   {Function}  [args.session_leave_error]       - The session leave error custom handler.
 * @property   {Function}  [args.participant_prepare]       - The participant prepare custom handler.
 * @property   {Function}  [args.participant_initiate]      - The participant initiate custom handler.
 * @property   {Function}  [args.participant_leave]         - The participant leave custom handler.
 * @property   {Function}  [args.add_remote_view]           - The remote view media add (audio/video) custom handler.
 * @property   {Function}  [args.remove_remote_view]        - The remote view media removal (audio/video) custom handler.
 */
var JSJaCJingleMuji = ring.create([__JSJaCJingleBase],
  /** @lends JSJaCJingleMuji.prototype */
  {
    /**
     * Constructor
     */
    constructor: function(args) {
      this.$super(args);

      if(args && args.room_message_in)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._room_message_in = args.room_message_in;

      if(args && args.room_message_out)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._room_message_out = args.room_message_out;

      if(args && args.room_presence_in)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._room_presence_in = args.room_presence_in;

      if(args && args.room_presence_out)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._room_presence_out = args.room_presence_out;

      if(args && args.session_prepare_pending)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_prepare_pending = args.session_prepare_pending;

      if(args && args.session_prepare_success)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_prepare_success = args.session_prepare_success;

      if(args && args.session_prepare_error)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_prepare_error = args.session_prepare_error;

      if(args && args.session_initiate_pending)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_initiate_pending = args.session_initiate_pending;

      if(args && args.session_initiate_success)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_initiate_success = args.session_initiate_success;

      if(args && args.session_initiate_error)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_initiate_error = args.session_initiate_error;

      if(args && args.session_leave_pending)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_leave_pending = args.session_leave_pending;

      if(args && args.session_leave_success)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_leave_success = args.session_leave_success;

      if(args && args.session_leave_error)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._session_leave_error = args.session_leave_error;

      if(args && args.participant_prepare)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_prepare = args.participant_prepare;

      if(args && args.participant_initiate)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_initiate = args.participant_initiate;

      if(args && args.participant_leave)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_leave = args.participant_leave;

      if(args && args.add_remote_view)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._add_remote_view = args.add_remote_view;

      if(args && args.remove_remote_view)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._remove_remote_view = args.remove_remote_view;

      if(args && args.username) {
        /**
         * @member {String}
         * @default
         * @private
         */
        this._username = args.username;
      } else {
        /**
         * @member {String}
         * @default
         * @private
         */
        this._username = this.utils.connection_username();
      }

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._participants = {};

      /**
       * @constant
       * @member {String}
       * @default
       * @private
       */
      this._status = JSJAC_JINGLE_MUJI_STATUS_INACTIVE;

      /**
       * @constant
       * @member {String}
       * @default
       * @private
       */
      this._namespace = NS_TELEPATHY_MUJI;
    },


    /**
     * Initiates a new Muji session.
     * @public
     * @fires JSJaCJingleMuji#get_session_initiate_pending
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

        if(JSJaCJingle._defer(function() { _this.join(); })) {
          this.get_debug().log('[JSJaCJingle:muji] join > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        // Slot unavailable?
        if(this.get_status() !== JSJAC_JINGLE_STATUS_INACTIVE) {
          this.get_debug().log('[JSJaCJingle:muji] join > Cannot join, resource not inactive (status: ' + this.get_status() + ').', 0);
          return;
        }

        this.get_debug().log('[JSJaCJingle:muji] join > New Jingle Muji session with media: ' + this.get_media(), 2);

        // Common vars
        var i, cur_name;

        // Trigger init pending custom callback
        /* @function */
        (this.get_session_prepare_pending())(this);

        // Change session status
        this._set_status(JSJAC_JINGLE_MUJI_STATUS_PREPARING);

        // Set session values
        this._set_sid(
          this.utils.generate_hash_md5(this.get_to())
        );

        for(i in this.get_media_all()) {
          cur_name = this.utils.name_generate(
            this.get_username(),
            this.get_media_all()[i]
          );

          this._set_name(cur_name);

          this._set_senders(
            this.get_username(),
            cur_name,
            JSJAC_JINGLE_SENDERS_BOTH.jingle
          );

          this._set_creator(
            cur_name,
            JSJAC_JINGLE_CREATOR_INITIATOR
          );
        }

        // Register session to common router
        JSJaCJingle._add(JSJAC_JINGLE_SESSION_MUJI, this.get_to(), this);

        // Send initial join presence
        this.send_presence({ action: JSJAC_JINGLE_MUJI_ACTION_PREPARE });
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] join > ' + e, 1);
      }
    },


    /**
     * Leaves current Muji session.
     * @public
     * @fires JSJaCJingleMuji#get_session_leave_pending
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

        if(JSJaCJingle._defer(function() { _this.leave(); })) {
          this.get_debug().log('[JSJaCJingle:muji] leave > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        // Slot unavailable?
        if(this.get_status() === JSJAC_JINGLE_MUJI_STATUS_LEFT) {
          this.get_debug().log('[JSJaCJingle:muji] leave > Cannot terminate, resource already terminated (status: ' + this.get_status() + ').', 0);
          return;
        }

        // Change session status
        this._set_status(JSJAC_JINGLE_MUJI_STATUS_LEAVING);

        // Trigger terminate pending custom callback
        /* @function */
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
     * @fires JSJaCJingleMuji#get_room_presence_out
     * @param {Object} [args]
     * @returns {Boolean} Success
     */
    send_presence: function(args) {
      this.get_debug().log('[JSJaCJingle:muji] send_presence', 4);

      try {
        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:muji] send_presence > Cannot send, resource locked. Please open another session or check WebRTC support.', 0);
          return false;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.send_presence(args); })) {
          this.get_debug().log('[JSJaCJingle:muji] send_presence > Deferred (waiting for the library components to be initiated).', 0);
          return false;
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

        this._set_sent_id(args.id);

        JSJAC_JINGLE_STORE_CONNECTION.send(stanza);

        if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:muji] send_presence > Outgoing packet sent' + '\n\n' + stanza.xml());

        // Trigger custom callback
        /* @function */
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
     * @fires JSJaCJingleMuji#get_room_message_out
     * @param {String} body
     * @returns {Boolean} Success
     */
    send_message: function(body) {
      this.get_debug().log('[JSJaCJingle:muji] send_message', 4);

      try {
        // Missing args?
        if(!body) {
          this.get_debug().log('[JSJaCJingle:muji] send_message > Message body missing.', 0);
          return false;
        }

        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:muji] send_message > Cannot send, resource locked. Please open another session or check WebRTC support.', 0);
          return false;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.send_message(body); })) {
          this.get_debug().log('[JSJaCJingle:muji] send_message > Deferred (waiting for the library components to be initiated).', 0);
          return false;
        }

        // Build stanza
        var stanza = new JSJaCMessage();

        stanza.setTo(this.get_to());
        stanza.setType(JSJAC_JINGLE_MESSAGE_TYPE_GROUPCHAT);
        stanza.setBody(body);

        JSJAC_JINGLE_STORE_CONNECTION.send(stanza);

        if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:muji] send_message > Outgoing packet sent' + '\n\n' + stanza.xml());

        // Trigger custom callback
        /* @function */
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
     * @fires JSJaCJingleMuji#_handle_participant_prepare
     * @fires JSJaCJingleMuji#_handle_participant_initiate
     * @fires JSJaCJingleMuji#_handle_participant_leave
     * @fires JSJaCJingleMuji#get_room_presence_in
     * @fires JSJaCJingleMuji#get_participant_prepare
     * @fires JSJaCJingleMuji#get_participant_initiate
     * @fires JSJaCJingleMuji#get_participant_leave
     * @param {JSJaCPacket} stanza
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

        if(JSJaCJingle._defer(function() { _this.handle_presence(stanza); })) {
          this.get_debug().log('[JSJaCJingle:muji] handle_presence > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        // Trigger custom callback
        /* @function */
        (this.get_room_presence_in())(this, stanza);

        var id = stanza.getID();

        if(id)  this._set_received_id(id);

        // Submit to custom handler (only for local user packets)
        var i, handlers = this.get_registered_handlers(JSJAC_JINGLE_PRESENCE_TYPE_ALL, id);

        if(typeof handlers == 'object' && handlers.length && this._stanza_from_local(stanza)) {
          this.get_debug().log('[JSJaCJingle:muji] handle_presence > Submitted to custom registered handlers.', 2);

          for(i in handlers) {
            /* @function */
            handlers[i](stanza);
          }

          this.unregister_handler(JSJAC_JINGLE_PRESENCE_TYPE_ALL, id);

          return;
        }

        // Submit to registered handler
        if(stanza.getType() == JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE) {
          /* @function */
          this.get_participant_leave()(stanza);
          this._handle_participant_leave(stanza);
        } else {
          var muji = this.utils.stanza_muji(stanza);

          // Don't handle non-Muji stanzas there...
          if(!muji) return;

          // Submit to registered handler
          var status = this.get_participants(username);

          var fn_log_drop = function() {
            this.get_debug().log('[JSJaCJingle:muji] handle_presence > Dropped out-of-order participant stanza with status: ' + status, 1);
          };

          if(this._stanza_has_preparing(muji)) {
            if(!status || status === JSJAC_JINGLE_MUJI_STATUS_INACTIVE) {
              /* @function */
              this.get_participant_prepare()(stanza);
              this._handle_participant_prepare(stanza);
            } else {
              fn_log_drop();
            }
          } else if(this._stanza_has_content(muji)) {
            if(!status || status === JSJAC_JINGLE_MUJI_STATUS_INACTIVE || status === JSJAC_JINGLE_MUJI_STATUS_PREPARED) {
              /* @function */
              this.get_participant_initiate()(stanza);
              this._handle_participant_initiate(stanza);
            } else {
              fn_log_drop();
            }
          } else if(this._stanza_from_participant(stanza)) {
            if(!status || status === JSJAC_JINGLE_MUJI_STATUS_INACTIVE || status === JSJAC_JINGLE_MUJI_STATUS_INITIATED) {
              /* @function */
              this.get_participant_leave()(stanza);
              this._handle_participant_leave(stanza);
            } else {
              fn_log_drop();
            }
          }
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] handle_presence > ' + e, 1);
      }
    },

    /**
     * Handles a Muji message stanza
     * @public
     * @fires JSJaCJingleMuji#get_room_message_in
     * @param {JSJaCPacket} stanza
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
        /* @function */
        (this.get_room_message_in())(this, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] handle_message > ' + e, 1);
      }
    },

    /**
     * Mutes a Muji session (local)
     * @public
     * @param {String} name
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

        if(JSJaCJingle._defer(function() { _this.mute(name); })) {
          this.get_debug().log('[JSJaCJingle:muji] mute > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        // Already muted?
        if(this.get_mute(name)) {
          this.get_debug().log('[JSJaCJingle:muji] mute > Resource already muted.', 0);
          return;
        }

        this._peer_sound(false);
        this._set_mute(name, true);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] mute > ' + e, 1);
      }
    },

    /**
     * Unmutes a Muji session (local)
     * @public
     * @param {String} name
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

        if(JSJaCJingle._defer(function() { _this.unmute(name); })) {
          this.get_debug().log('[JSJaCJingle:muji] unmute > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        // Already unmute?
        if(!this.get_mute(name)) {
          this.get_debug().log('[JSJaCJingle:muji] unmute > Resource already unmuted.', 0);
          return;
        }

        this._peer_sound(true);
        this._set_mute(name, false);
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
     * @fires JSJaCJingleMuji#_handle_session_prepare_success
     * @fires JSJaCJingleMuji#_handle_session_prepare_error
     * @fires JSJaCJingleMuji#get_session_prepare_success
     * @fires JSJaCJingleMuji#get_session_prepare_error
     * @fires JSJaCJingleMuji#get_session_prepare_pending
     * @param {JSJaCPacket} stanza
     * @param {Object} args
     */
    _send_session_prepare: function(stanza, args) {
      this.get_debug().log('[JSJaCJingle:muji] _send_session_prepare', 4);

      try {
        if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_PREPARING) {
          this.get_debug().log('[JSJaCJingle:muji] _send_session_prepare > Cannot send prepare stanza, resource already prepared (status: ' + this.get_status() + ').', 0);
          return;
        }

        if(!args) {
          this.get_debug().log('[JSJaCJingle:muji] _send_session_prepare > Argument not provided.', 1);
          return;
        }

        // Build Muji stanza
        var muji = this.utils.stanza_generate_muji(stanza);
        muji.appendChild(stanza.buildNode('preparing', { 'xmlns': NS_TELEPATHY_MUJI }));

        // Schedule success
        var _this = this;

        this.register_handler(JSJAC_JINGLE_PRESENCE_TYPE_ALL, args.id, function(stanza) {
          /* @function */
          (_this.get_session_prepare_success())(_this, stanza);
          _this._handle_session_prepare_success(stanza);
        });

        // Schedule error timeout
        this.utils.stanza_timeout(JSJAC_JINGLE_PRESENCE_TYPE_ALL, args.id, {
          /* @function */
          external:   this.get_session_prepare_error().bind(this),
          internal:   this._handle_session_prepare_error.bind(this)
        });

        this.get_debug().log('[JSJaCJingle:muji] _send_session_prepare > Sent.', 2);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _send_session_prepare > ' + e, 1);
      }
    },

    /**
     * Sends the session initiate event.
     * @private
     * @fires JSJaCJingleMuji#_handle_session_initiate_success
     * @fires JSJaCJingleMuji#_handle_session_initiate_error
     * @fires JSJaCJingleMuji#get_session_initiate_success
     * @fires JSJaCJingleMuji#get_session_initiate_error
     * @param {JSJaCPacket} stanza
     * @param {Object} args
     */
    _send_session_initiate: function(stanza, args) {
      this.get_debug().log('[JSJaCJingle:muji] _send_session_initiate', 4);

      try {
        if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_INITIATING) {
          this.get_debug().log('[JSJaCJingle:muji] _send_session_initiate > Cannot send initiate stanza, resource already initiated (status: ' + this.get_status() + ').', 0);
          return;
        }

        if(!args) {
          this.get_debug().log('[JSJaCJingle:muji] _send_session_initiate > Argument not provided.', 1);
          return;
        }

        // Build Muji stanza
        var muji = this.utils.stanza_generate_muji(stanza);

        this.utils.stanza_generate_content_local(this.get_username(), stanza, muji);
        this.utils.stanza_generate_group_local(this.get_username(), stanza, muji);

        // Schedule success
        var _this = this;

        this.register_handler(JSJAC_JINGLE_PRESENCE_TYPE_ALL, args.id, function(stanza) {
          /* @function */
          (_this.get_session_initiate_success())(_this, stanza);
          _this._handle_session_initiate_success(stanza);
        });

        // Schedule error timeout
        this.utils.stanza_timeout(JSJAC_JINGLE_PRESENCE_TYPE_ALL, args.id, {
          /* @function */
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
     * @fires JSJaCJingleMuji#_handle_session_leave_success
     * @fires JSJaCJingleMuji#_handle_session_leave_error
     * @fires JSJaCJingleMuji#get_session_leave_success
     * @fires JSJaCJingleMuji#get_session_leave_error
     * @param {JSJaCPacket} stanza
     * @param {Object} args
     */
    _send_session_leave: function(stanza, args) {
      this.get_debug().log('[JSJaCJingle:muji] _send_session_leave', 4);

      try {
        if(!args) {
          this.get_debug().log('[JSJaCJingle:muji] _send_session_leave > Argument not provided.', 1);
          return;
        }

        stanza.setType(JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE);

        // Schedule success
        var _this = this;

        this.register_handler(JSJAC_JINGLE_PRESENCE_TYPE_ALL, args.id, function(stanza) {
          /* @function */
          (_this.get_session_leave_success())(_this, stanza);
          _this._handle_session_leave_success(stanza);
        });

        // Schedule error timeout
        this.utils.stanza_timeout(JSJAC_JINGLE_PRESENCE_TYPE_ALL, args.id, {
          /* @function */
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
     * @private
     * @event JSJaCJingleMuji#_handle_session_prepare_success
     * @param {JSJaCPacket} stanza
     */
    _handle_session_prepare_success: function(stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success', 4);

      try {
        var username = this.extract_stanza_username(stanza);

        if(!username) {
          throw 'No username provided, not accepting session prepare stanza.';
        }

        // Username conflict?
        if(this._stanza_username_conflict(stanza)) {
          var alt_username = (this.get_username() + this.utils.generate_random(4));

          this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success > Conflicting username, changing it to: ' + alt_username, 2);

          this._set_username(alt_username);
          this.send_presence({ action: JSJAC_JINGLE_MUJI_ACTION_PREPARE });
        } else {
          // Change session status
          this._set_status(JSJAC_JINGLE_MUJI_STATUS_PREPARED);

          var _this = this;

          var fn_launch_initiate = function() {
            // Initialize WebRTC
            _this._peer_get_user_media(function() {
              // Create local peer connection
              _this._peer_connection_create(username, function() {
                _this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success > Ready to begin Muji initiation.', 2);

                // Change session status
                _this._set_status(JSJAC_JINGLE_MUJI_STATUS_INITIATING);

                _this.send_presence({ action: JSJAC_JINGLE_MUJI_ACTION_INITIATE });
              });

              // Undefer pending handlers
              var i, handlers;
              handlers = _this.get_deferred_handlers(JSJAC_JINGLE_MUJI_HANDLER_GET_USER_MEDIA);

              if(typeof handlers == 'object' && handlers.length) {
                _this.get_debug().log('[JSJaCJingle:single] _handle_session_prepare_success > Submitted to deferred handlers.', 2);

                for(i in handlers) {
                  /* @function */
                  handlers[i]();
                }

                _this.undefer_handler(JSJAC_JINGLE_MUJI_HANDLER_GET_USER_MEDIA);
              }
            });
          };

          // Delay if we didn't receive any other participant presence (assume we're not first joiners)
          if(this.utils.object_length(this.get_participants()) > 0) {
            fn_launch_initiate();
          } else {
            setTimeout(function() {
              // We are still alone, assume we're first joiner, then
              if(_this.utils.object_length(_this.get_participants()) === 0) {
                // Initiate roles/directionality
                _this._set_initiator(_this.utils.connection_jid());
                _this._set_responder(_this.get_to());

                _this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success > Initiator is local and responder is remote.', 2);
              }

              fn_launch_initiate();
            }, (JSJAC_JINGLE_MUJI_INITIATE_WAIT * 1000));
          }
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare error
     * @private
     * @event JSJaCJingleMuji#_handle_session_prepare_error
     * @param {JSJaCPacket} stanza
     */
    _handle_session_prepare_error: function(stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_error', 4);

      try {
        // Change session status
        this._set_status(JSJAC_JINGLE_STATUS_INACTIVE);

        this.leave();

        // Lock session (cannot be used later)
        this._set_lock(true);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_error > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session initiate success
     * @private
     * @event JSJaCJingleMuji#_handle_session_initiate_success
     * @param {JSJaCPacket} stanza
     */
    _handle_session_initiate_success: function(stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_session_initiate_success', 4);

      try {
        // Change session status
        this._set_status(JSJAC_JINGLE_MUJI_STATUS_INITIATED);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_session_initiate_success > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session initiate error
     * @private
     * @event JSJaCJingleMuji#_handle_session_initiate_error
     * @param {JSJaCPacket} stanza
     */
    _handle_session_initiate_error: function(stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_session_initiate_error', 4);

      try {
        this.leave();

        // Lock session (cannot be used later)
        this._set_lock(true);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_session_initiate_error > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session leave success
     * @private
     * @event JSJaCJingleMuji#_handle_session_leave_success
     * @param {JSJaCPacket} stanza
     */
    _handle_session_leave_success: function(stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_session_leave_success', 4);

      try {
        // Change session status
        this._set_status(JSJAC_JINGLE_MUJI_STATUS_LEFT);

        // Stop WebRTC
        this._peer_stop();

        // Flush all participant content
        this._set_participants(null);
        this._flush_participant();

        // Flush local user data
        this._flush_local_user(this.get_username());
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_session_leave_success > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session leave error
     * @private
     * @event JSJaCJingleMuji#_handle_session_leave_error
     * @param {JSJaCPacket} stanza
     */
    _handle_session_leave_error: function(stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_session_leave_error', 4);

      try {
        // Change session status
        this._set_status(JSJAC_JINGLE_MUJI_STATUS_LEFT);

        // Stop WebRTC
        this._peer_stop();

        // Flush all participant content
        this._set_participants(null);
        this._flush_participant();

        // Flush local user data
        this._flush_local_user(this.get_username());

        // Lock session (cannot be used later)
        this._set_lock(true);

        this.get_debug().log('[JSJaCJingle:muji] _handle_session_leave_error > Forced session exit locally.', 0);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_session_leave_error > ' + e, 1);
      }
    },

    /**
     * Handles the participant prepare event.
     * @private
     * @event JSJaCJingleMuji#_handle_participant_prepare
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_prepare: function(stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_prepare', 4);

      try {
        var username = this.extract_stanza_username(stanza);

        if(!username) {
          throw 'No username provided, not accepting participant prepare stanza.';
        }

        this._set_participants(username, JSJAC_JINGLE_MUJI_STATUS_PREPARED);

        // TODO: enable this?
        // Flush participant data in case it was initiated and now is re-preparing
        //this._peer_stop(username);
        //this._flush_participant(username);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_prepare > ' + e, 1);
      }
    },

    /**
     * Handles the participant initiate event.
     * @private
     * @event JSJaCJingleMuji#_handle_participant_initiate
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_initiate: function(stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_initiate', 4);

      try {
        // Defer if user media not ready yet
        var _this = this;

        if(!this._is_ready_user_media()) {
          this.defer_handler(JSJAC_JINGLE_MUJI_HANDLER_GET_USER_MEDIA, function() {
            _this._handle_participant_initiate(stanza);
          });

          return;
        }

        var username = this.extract_stanza_username(stanza);

        if(!username) {
          throw 'No username provided, not accepting participant initiate stanza.';
        }

        this._set_participants(username, JSJAC_JINGLE_MUJI_STATUS_INITIATED);

        // Need to initiate roles/directionality?
        if(!this.get_initiator() || !this.get_responder()) {
          this._set_initiator(this.get_to());
          this._set_responder(this.utils.connection_jid());

          this.get_debug().log('[JSJaCJingle:muji] _handle_participant_initiate > Initiator is remote and responder is local.', 2);
        }

        // TODO: enable this?
        // Flush participant data in case it was initiated and now is re-initiating
        //this._peer_stop(username);
        //this._flush_participant(username);

        // Slot unavailable?
        if(this.get_status() === JSJAC_JINGLE_MUJI_STATUS_INACTIVE  ||
           this.get_status() === JSJAC_JINGLE_MUJI_STATUS_LEAVING   ||
           this.get_status() === JSJAC_JINGLE_MUJI_STATUS_LEFT) {
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

          var sdp_remote = this.sdp._generate(
            username,
            WEBRTC_SDP_TYPE_ANSWER,
            this.get_group_remote(username),
            this.get_payloads_remote(username),
            this.get_candidates_queue_remote(username)
          );

          if(this.get_sdp_trace())  this.get_debug().log('[JSJaCJingle:muji] SDP (remote) > ' + username + '\n\n' + sdp_remote.description.sdp, 4);

          // Initiate user peer connection
          _this._peer_connection_create(username, function() {
            _this.get_debug().log('[JSJaCJingle:muji] _handle_participant_initiate > Created peer connection for participant: ' + username, 2);

            // Remote description
            _this.get_peer_connection(username).setRemoteDescription(
              (new WEBRTC_SESSION_DESCRIPTION(sdp_remote.description)),

              function() {
                // Success (descriptions are compatible)
              },

              function(e) {
                if(_this.get_sdp_trace())  _this.get_debug().log('[JSJaCJingle:muji] SDP (remote:error) > ' + username + '\n\n' + (e.message || e.name || 'Unknown error'), 4);
              }
            );

            // ICE candidates
            for(i in sdp_remote.candidates) {
              cur_candidate_obj = sdp_remote.candidates[i];

              _this.get_peer_connection(username).addIceCandidate(
                new WEBRTC_ICE_CANDIDATE({
                  sdpMLineIndex : cur_candidate_obj.id,
                  candidate     : cur_candidate_obj.candidate
                })
              );
            }

            // Empty the unapplied candidates queue
            _this._set_candidates_queue_remote(username, null);
          });

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
     * @event JSJaCJingleMuji#_handle_participant_leave
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_leave: function(stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_leave', 4);

      try {
        var username = this.extract_stanza_username(stanza);

        if(!username) {
          throw 'No username provided, not accepting participant leave stanza.';
        }

        // Stop WebRTC
        this._peer_stop(username);

        // Flush participant content
        this._set_participants(username, JSJAC_JINGLE_MUJI_STATUS_LEFT);
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
     * @param {DOM} muji
     * @returns {Boolean} Preparing state
     */
    _stanza_has_preparing: function(muji) {
      return this.utils.stanza_get_element(muji, 'preparing', NS_TELEPATHY_MUJI).length && true;
    },

    /**
     * Returns whether user has content or not
     * @private
     * @param {DOM} muji
     * @returns {Boolean} Content state
     */
    _stanza_has_content: function(muji) {
      return this.utils.stanza_get_element(muji, 'content', NS_TELEPATHY_MUJI).length && true;
    },



    /**
     * JSJSAC JINGLE PEER TOOLS
     */

    /**
     * Generates peer connection callback for 'onicecandidate'
     * @private
     * @callback
     * @param {JSJaCJingleMuji} _this
     * @param {String} username
     * @param {Function} sdp_message_callback
     * @param {Object} data
     */
    _peer_connection_callback_onicecandidate: function(_this, username, sdp_message_callback, data) {
      _this.get_debug().log('[JSJaCJingle:muji] _peer_connection_callback_onicecandidate', 4);

      try {
        if(data.candidate) {
          _this.sdp._parse_candidate_store_store_data(username, data);
        } else {
          // Build or re-build content (local)
          _this.utils.build_content_local(username);

          // In which action stanza should candidates be sent?
          if(_this.get_status() === JSJAC_JINGLE_MUJI_STATUS_PREPARED) {
            _this.get_debug().log('[JSJaCJingle:muji] _peer_connection_callback_onicecandidate > Got initial candidates.', 2);

            // Execute what's next (initiate/accept session)
            sdp_message_callback();
          }

          // Empty the unsent candidates queue
          _this._set_candidates_queue_local(username, null);
        }
      } catch(e) {
        _this.get_debug().log('[JSJaCJingle:muji] _peer_connection_callback_onicecandidate > ' + e, 1);
      }
    },

    /**
     * Dispatches peer connection to correct creator (offer/answer)
     * @private
     * @param {String} username
     */
    _peer_connection_create_dispatch: function(username) {
      this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_dispatch', 4);

      try {
        if(username === this.get_username())
          this._peer_connection_create_offer(username);
        else
          this._peer_connection_create_answer(username);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_dispatch > ' + e, 1);
      }
    },

    /**
     * Creates peer connection offer
     * @private
     * @param {String} username
     */
    _peer_connection_create_offer: function(username) {
      this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_offer', 4);

      try {
        // Create offer
        this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_offer > Getting local description for participant: ' + username + '...', 2);

        // Local description
        this.get_peer_connection(username).createOffer(
          function(sdp_local) {
            this._peer_got_description(username, sdp_local);
          }.bind(this),

          this._peer_fail_description.bind(this),
          WEBRTC_CONFIGURATION.create_offer
        );
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_offer > ' + e, 1);
      }
    },

    /**
     * Creates peer connection answer
     * @private
     * @param {String} username
     */
    _peer_connection_create_answer: function(username) {
      this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_answer', 4);

      try {
        // Create offer
        this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_answer > Getting local description for participant: ' + username + '...', 2);

        // Apply SDP data
        sdp_remote = this.sdp._generate(
          username,
          WEBRTC_SDP_TYPE_OFFER,
          this.get_group_remote(username),
          this.get_payloads_remote(username),
          this.get_candidates_queue_remote(username)
        );

        if(this.get_sdp_trace())  this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_answer > SDP (remote) > [' + username + ']' + '\n\n' + sdp_remote.description.sdp, 4);

        // Remote description
        this.get_peer_connection(username).setRemoteDescription(
          (new WEBRTC_SESSION_DESCRIPTION(sdp_remote.description)),

          function() {
            // Success (descriptions are compatible)
          },

          function(e) {
            if(_this.get_sdp_trace())  _this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_answer > SDP (remote:error) > [' + username + ']' + '\n\n' + (e.message || e.name || 'Unknown error'), 4);
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
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_answer > ' + e, 1);
      }
    },

    /**
     * Triggers the media not obtained error event
     * @private
     * @fires JSJaCJingleMuji#get_session_initiate_error
     * @param {Object} error
     */
    _peer_got_user_media_error: function(error) {
      this.get_debug().log('[JSJaCJingle:muji] _peer_got_user_media_error', 4);

      try {
        /* @function */
        (this.get_session_initiate_error())(this);
        this.handle_session_initiate_error();

        this.get_debug().log('[JSJaCJingle:muji] _peer_got_user_media_error > Failed (' + (error.PERMISSION_DENIED ? 'permission denied' : 'unknown' ) + ').', 1);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _peer_got_user_media_error > ' + e, 1);
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
            _this.get_debug().log('[JSJaCJingle:muji] _peer_timeout > Peer timeout.', 2);
          }
        }, ((args.timer || JSJAC_JINGLE_PEER_TIMEOUT_DEFAULT) * 1000));
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _peer_timeout > ' + e, 1);
      }
    },

    /**
     * Stops ongoing peer connections
     * @private
     * @param {String} username
     */
    _peer_stop: function(username) {
      this.get_debug().log('[JSJaCJingle:muji] _peer_stop', 4);

      // Stop selected remote stream, or all streams?
      var i, cur_username, remote_list = [];

      if(username) {
        remote_list.push(username);
      } else {
        // Detach media streams from DOM view
        this._set_local_stream(username, null);

        for(cur_username in this.get_peer_connection())
            remote_list.push(cur_username);
      }

      for(i in remote_list) {
        cur_username = remote_list[i];

        this._set_remote_stream(cur_username, null);

        // Close the media stream
        if(this.get_peer_connection(cur_username))
          this.get_peer_connection(cur_username).close();
      }

      // Remove this session from router
      JSJaCJingle._remove(JSJAC_JINGLE_SESSION_SINGLE, this.get_sid());
    },



    /**
     * JSJSAC JINGLE SHORTCUTS
     */

    /**
     * Returns whether user media is ready or not
     * @private
     * @returns {Boolean} Ready state
     */
    _is_ready_user_media: function() {
      return (this.get_local_stream() !== null) && true;
    },

    /**
     * Flushes participant data
     * @private
     * @param {String} username
     */
    _flush_participant: function(username) {
      // Local
      this._set_content_local(username, null);
      this._set_payloads_local(username, null);
      this._set_group_local(username, null);
      this._set_candidates_local(username, null);
      this._set_candidates_queue_local(username, null);

      // Remote
      this._set_remote_view(username, null);
      this._set_remote_stream(username, null);
      this._set_content_remote(username, null);
      this._set_payloads_remote(username, null);
      this._set_group_remote(username, null);
      this._set_candidates_remote(username, null);
      this._set_candidates_queue_remote(username, null);

      // Others
      this._set_peer_connection(username, null);
    },

    /**
     * Extracts username from stanza
     * @public
     * @param {JSJaCPacket} stanza
     * @returns {String} Username
     */
    extract_stanza_username: function(stanza) {
      var from = stanza.getFrom();
      return (new JSJaCJID(from)).getResource();
    },

    /**
     * Returns whether stanza is from a participant or not
     * @private
     * @param {JSJaCPacket} stanza
     * @returns {Boolean} Participant state
     */
    _stanza_from_participant: function(stanza) {
      var username = this.extract_stanza_username(stanza);
      return (this.get_participants(username) in JSJAC_JINGLE_MUJI_STATUS) && true;
    },

    /**
     * Returns whether stanza is from local user or not
     * @private
     * @param {JSJaCPacket} stanza
     * @returns {Boolean} Local user state
     */
    _stanza_from_local: function(stanza) {
      return this.extract_stanza_username(stanza) === this.get_username();
    },

    /**
     * Returns whether stanza is an username conflict or not
     * @private
     * @param {JSJaCPacket} stanza
     * @returns {Boolean} Local user state
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



    /**
     * JSJSAC JINGLE MUJI GETTERS
     */

    /**
     * Gets the participants object
     * @public
     * @param {String} username
     * @returns {Object} Participants object
     */
    get_participants: function(username) {
      if(username)
        return this._participants[username];

      return this._participants;
    },

    /**
     * Gets the creator value
     * @public
     * @returns {String} Creator value
     */
    get_creator: function() {
      return this.get_to();
    },

    /**
     * Gets the incoming message callback function
     * @public
     * @event JSJaCJingleMuji#get_room_message_in
     * @returns {Function} Incoming message callback function
     */
    get_room_message_in: function() {
      if(typeof this._room_message_in == 'function')
        return this._room_message_in;

      return function() {};
    },

    /**
     * Gets the outgoing message callback function
     * @public
     * @event JSJaCJingleMuji#get_room_message_out
     * @returns {Function} Outgoing message callback function
     */
    get_room_message_out: function() {
      if(typeof this._room_message_out == 'function')
        return this._room_message_out;

      return function() {};
    },

    /**
     * Gets the incoming presence callback function
     * @public
     * @event JSJaCJingleMuji#get_room_presence_in
     * @returns {Function} Incoming presence callback function
     */
    get_room_presence_in: function() {
      if(typeof this._room_presence_in == 'function')
        return this._room_presence_in;

      return function() {};
    },

    /**
     * Gets the outgoing presence callback function
     * @public
     * @event JSJaCJingleMuji#get_room_presence_out
     * @returns {Function} Outgoing presence callback function
     */
    get_room_presence_out: function() {
      if(typeof this._room_presence_out == 'function')
        return this._room_presence_out;

      return function() {};
    },

    /**
     * Gets the session prepare pending callback function
     * @public
     * @event JSJaCJingleMuji#get_session_prepare_pending
     * @returns {Function} Session prepare pending callback function
     */
    get_session_prepare_pending: function() {
      if(typeof this._session_prepare_pending == 'function')
        return this._session_prepare_pending;

      return function() {};
    },

    /**
     * Gets the session prepare success callback function
     * @public
     * @event JSJaCJingleMuji#get_session_prepare_success
     * @returns {Function} Session prepare success callback function
     */
    get_session_prepare_success: function() {
      if(typeof this._session_prepare_success == 'function')
        return this._session_prepare_success;

      return function() {};
    },

    /**
     * Gets the session prepare error callback function
     * @public
     * @event JSJaCJingleMuji#get_session_prepare_error
     * @returns {Function} Session prepare error callback function
     */
    get_session_prepare_error: function() {
      if(typeof this._session_prepare_error == 'function')
        return this._session_prepare_error;

      return function() {};
    },

    /**
     * Gets the session initiate pending callback function
     * @public
     * @event JSJaCJingleMuji#get_session_initiate_pending
     * @returns {Function} Session initiate pending callback function
     */
    get_session_initiate_pending: function() {
      if(typeof this._session_initiate_pending == 'function')
        return this._session_initiate_pending;

      return function() {};
    },

    /**
     * Gets the session initiate success callback function
     * @public
     * @event JSJaCJingleMuji#get_session_initiate_success
     * @returns {Function} Session initiate success callback function
     */
    get_session_initiate_success: function() {
      if(typeof this._session_initiate_success == 'function')
        return this._session_initiate_success;

      return function() {};
    },

    /**
     * Gets the session initiate error callback function
     * @public
     * @event JSJaCJingleMuji#get_session_initiate_error
     * @returns {Function} Session initiate error callback function
     */
    get_session_initiate_error: function() {
      if(typeof this._session_initiate_error == 'function')
        return this._session_initiate_error;

      return function() {};
    },

    /**
     * Gets the session leave pending callback function
     * @public
     * @event JSJaCJingleMuji#get_session_leave_pending
     * @returns {Function} Session leave pending callback function
     */
    get_session_leave_pending: function() {
      if(typeof this._session_leave_pending == 'function')
        return this._session_leave_pending;

      return function() {};
    },

    /**
     * Gets the session leave success callback function
     * @public
     * @event JSJaCJingleMuji#get_session_leave_success
     * @returns {Function} Session leave success callback function
     */
    get_session_leave_success: function() {
      if(typeof this._session_leave_success == 'function')
        return this._session_leave_success;

      return function() {};
    },

    /**
     * Gets the session leave error callback function
     * @public
     * @event JSJaCJingleMuji#get_session_leave_error
     * @returns {Function} Session leave error callback function
     */
    get_session_leave_error: function() {
      if(typeof this._session_leave_error == 'function')
        return this._session_leave_error;

      return function() {};
    },

    /**
     * Gets the participant prepare callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_prepare
     * @returns {Function} Participant prepare callback function
     */
    get_participant_prepare: function() {
      if(typeof this._participant_prepare == 'function')
        return this._participant_prepare;

      return function() {};
    },

    /**
     * Gets the participant initiate callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_initiate
     * @returns {Function} Participant initiate callback function
     */
    get_participant_initiate: function() {
      if(typeof this._participant_initiate == 'function')
        return this._participant_initiate;

      return function() {};
    },

    /**
     * Gets the participant leave callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_leave
     * @returns {Function} Participant leave callback function
     */
    get_participant_leave: function() {
      if(typeof this._participant_leave == 'function')
        return this._participant_leave;

      return function() {};
    },

    /**
     * Gets the remote view add callback function
     * @public
     * @event JSJaCJingleMuji#get_add_remote_view
     * @returns {Function} Remote view add callback function
     */
    get_add_remote_view: function() {
      if(typeof this._add_remote_view == 'function')
        return this._add_remote_view;

      return function() {};
    },

    /**
     * Gets the remote view removal callback function
     * @public
     * @event JSJaCJingleMuji#get_remove_remote_view
     * @returns {Function} Remote view removal callback function
     */
    get_remove_remote_view: function() {
      if(typeof this._remove_remote_view == 'function')
        return this._remove_remote_view;

      return function() {};
    },

    /**
     * Gets the local username
     * @public
     * @returns {String} Local username
     */
    get_username: function() {
      return this._username;
    },

    /**
     * Gets the MUC to value
     * @public
     * @returns {String} To value for MUC
     */
    get_muc_to: function() {
      return (this.get_to() + '/' + this.get_username());
    },

    /**
     * Gets the prepended ID
     * @public
     * @returns {String} Prepended ID value
     */
    get_id_pre: function() {
      return JSJAC_JINGLE_STANZA_ID_PRE + '_' + (this.get_sid() || '0') + '_' + this.get_username() + '_';
    },



    /**
     * JSJSAC JINGLE MUJI SETTERS
     */

    /**
     * Sets the room message in callback function
     * @private
     * @param {Function} room_message_in
     */
    _set_room_message_in: function(room_message_in) {
      this._room_message_in = room_message_in;
    },

    /**
     * Sets the room message out callback function
     * @private
     * @param {Function} room_message_out
     */
    _set_room_message_out: function(room_message_out) {
      this._room_message_out = room_message_out;
    },

    /**
     * Sets the room presence in callback function
     * @private
     * @param {Function} room_presence_in
     */
    _set_room_presence_in: function(room_presence_in) {
      this._room_presence_in = room_presence_in;
    },

    /**
     * Sets the room presence out callback function
     * @private
     * @param {Function} room_presence_out
     */
    _set_room_presence_out: function(room_presence_out) {
      this._room_presence_out = room_presence_out;
    },

    /**
     * Sets the session prepare pending callback function
     * @private
     * @param {Function} session_prepare_pending
     */
    _set_session_prepare_pending: function(session_prepare_pending) {
      this._session_prepare_pending = session_prepare_pending;
    },

    /**
     * Sets the session prepare success callback function
     * @private
     * @param {Function} session_prepare_success
     */
    _set_session_prepare_success: function(session_prepare_success) {
      this._session_prepare_success = session_prepare_success;
    },

    /**
     * Sets the session prepare error callback function
     * @private
     * @param {Function} session_prepare_error
     */
    _set_session_prepare_error: function(session_prepare_error) {
      this._session_prepare_error = session_prepare_error;
    },

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
     * @param {Function} session_initiate_success
     */
    _set_session_initiate_success: function(session_initiate_success) {
      this._session_initiate_success = session_initiate_success;
    },

    /**
     * Sets the session initiate error callback function
     * @private
     * @param {Function} session_initiate_error
     */
    _set_session_initiate_error: function(session_initiate_error) {
      this._session_initiate_error = session_initiate_error;
    },

    /**
     * Sets the session leave pending callback function
     * @private
     * @param {Function} session_leave_pending
     */
    _set_session_leave_pending: function(session_leave_pending) {
      this._session_leave_pending = session_leave_pending;
    },

    /**
     * Sets the session leave success callback function
     * @private
     * @param {Function} session_leave_success
     */
    _set_session_leave_success: function(session_leave_success) {
      this._session_leave_success = session_leave_success;
    },

    /**
     * Sets the session leave error callback function
     * @private
     * @param {Function} session_leave_error
     */
    _set_session_leave_error: function(session_leave_error) {
      this._session_leave_error = session_leave_error;
    },

    /**
     * Sets the participant prepare callback function
     * @private
     * @param {Function} participant_prepare
     */
    _set_participant_prepare: function(participant_prepare) {
      this._participant_prepare = participant_prepare;
    },

    /**
     * Sets the participant initiate callback function
     * @private
     * @param {Function} participant_initiate
     */
    _set_participant_initiate: function(participant_initiate) {
      this._participant_initiate = participant_initiate;
    },

    /**
     * Sets the participant leave callback function
     * @private
     * @param {Function} participant_leave
     */
    _set_participant_leave: function(participant_leave) {
      this._participant_leave = participant_leave;
    },

    /**
     * Sets the add remote view callback function
     * @private
     * @param {Function} add_remote_view
     */
    _set_add_remote_view: function(add_remote_view) {
      this._add_remote_view = add_remote_view;
    },

    /**
     * Sets the remove remote view pending callback function
     * @private
     * @param {Function} remove_remote_view
     */
    _set_remove_remote_view: function(remove_remote_view) {
      this._remove_remote_view = remove_remote_view;
    },

    /**
     * Sets the participants object
     * @private
     * @param {String} username
     * @param {Boolean} [keep]
     */
    _set_participants: function(username, state) {
      if(username === null)
        this._participants = {};
      else if(state === JSJAC_JINGLE_MUJI_STATUS_LEFT)
        delete this._participants[username];
      else if(username)
        this._participants[username] = state;
    },

    /**
     * Sets the local username
     * @private
     * @param {String} username
     */
    _set_username: function(username) {
      this._username = username;
    },

    /**
     * Sets the remote stream
     * @private
     * @fires JSJaCJingleMuji#get_add_remote_view
     * @fires JSJaCJingleMuji#get_remove_remote_view
     * @param {String} username
     * @param {DOM} [remote_stream]
     */
    _set_remote_stream: function(username, remote_stream) {
      try {
        var username_arr, cur_username,
            remote_view_sel;

        // Set for all usernames?
        if(username === null) {
          for(cur_username in this._remote_stream) {
            this._set_remote_stream(cur_username, remote_stream);
          }

          return;
        }

        if(!remote_stream && this._remote_stream[username]) {
          this._peer_stream_detach(
            this.get_remote_view(username)
          );
        }

        this._remote_stream[username] = remote_stream;

        if(remote_stream) {
          // Generate remote view
          remote_view_sel = this.get_add_remote_view()(
            this,
            username,
            this.get_media()
          );

          if(remote_view_sel)
            this._set_remote_view(username, remote_view_sel);

          this._peer_stream_attach(
            this.get_remote_view(username),
            this.get_remote_stream(username),
            false
          );
        } else {
          // Remove remote view
          remote_view_sel = this.get_remove_remote_view()(this, username);

          if(remote_view_sel)
            this._set_remote_view_pop(username, remote_view_sel);

          this._peer_stream_detach(
            this.get_remote_view(username)
          );
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _set_remote_stream > ' + e, 1);
      }
    },
  }
);