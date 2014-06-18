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
 * @param      {Object}    [args]                                        - Muji session arguments.
 * @property   {*}         [args.*]                                      - Herits of JSJaCJingle() baseclass prototype.
 * @property   {String}    [args.username]                               - The username when joining room.
 * @property   {String}    [args.password]                               - The room password.
 * @property   {Boolean}   [args.password_protect]                       - Automatically password-protect the MUC if first joiner.
 * @property   {Function}  [args.room_message_in]                        - The incoming message custom handler.
 * @property   {Function}  [args.room_message_out]                       - The outgoing message custom handler.
 * @property   {Function}  [args.room_presence_in]                       - The incoming presence custom handler.
 * @property   {Function}  [args.room_presence_out]                      - The outgoing presence custom handler.
 * @property   {Function}  [args.session_prepare_pending]                - The session prepare pending custom handler.
 * @property   {Function}  [args.session_prepare_success]                - The session prepare success custom handler.
 * @property   {Function}  [args.session_prepare_error]                  - The session prepare error custom handler.
 * @property   {Function}  [args.session_initiate_pending]               - The session initiate pending custom handler.
 * @property   {Function}  [args.session_initiate_success]               - The session initiate success custom handler.
 * @property   {Function}  [args.session_initiate_error]                 - The session initiate error custom handler.
 * @property   {Function}  [args.session_leave_pending]                  - The session leave pending custom handler.
 * @property   {Function}  [args.session_leave_success]                  - The session leave success custom handler.
 * @property   {Function}  [args.session_leave_error]                    - The session leave error custom handler.
 * @property   {Function}  [args.participant_prepare]                    - The participant prepare custom handler.
 * @property   {Function}  [args.participant_initiate]                   - The participant initiate custom handler.
 * @property   {Function}  [args.participant_leave]                      - The participant session leave custom handler.
 * @property   {Function}  [args.participant_session_initiate_pending]   - The participant session initiate pending custom handler.
 * @property   {Function}  [args.participant_session_initiate_success]   - The participant session initiate success custom handler.
 * @property   {Function}  [args.participant_session_initiate_error]     - The participant session initiate error custom handler.
 * @property   {Function}  [args.participant_session_initiate_request]   - The participant session initiate request custom handler.
 * @property   {Function}  [args.participant_session_accept_pending]     - The participant session accept pending custom handler.
 * @property   {Function}  [args.participant_session_accept_success]     - The participant session accept success custom handler.
 * @property   {Function}  [args.participant_session_accept_error]       - The participant session accept error custom handler.
 * @property   {Function}  [args.participant_session_accept_request]     - The participant session accept request custom handler.
 * @property   {Function}  [args.participant_session_info_pending]       - The participant session info request custom handler.
 * @property   {Function}  [args.participant_session_info_success]       - The participant session info success custom handler.
 * @property   {Function}  [args.participant_session_info_error]         - The participant session info error custom handler.
 * @property   {Function}  [args.participant_session_info_request]       - The participant session info request custom handler.
 * @property   {Function}  [args.participant_session_terminate_pending]  - The participant session terminate pending custom handler.
 * @property   {Function}  [args.participant_session_terminate_success]  - The participant session terminate success custom handler.
 * @property   {Function}  [args.participant_session_terminate_error]    - The participant session terminate error custom handler.
 * @property   {Function}  [args.participant_session_terminate_request]  - The participant session terminate request custom handler.
 * @property   {Function}  [args.add_remote_view]                        - The remote view media add (audio/video) custom handler.
 * @property   {Function}  [args.remove_remote_view]                     - The remote view media removal (audio/video) custom handler.
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

      if(args && args.participant_session_initiate_pending)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_initiate_pending = args.participant_session_initiate_pending;

      if(args && args.participant_session_initiate_success)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_initiate_success = args.participant_session_initiate_success;

      if(args && args.participant_session_initiate_error)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_initiate_error = args.participant_session_initiate_error;

      if(args && args.participant_session_initiate_request)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_initiate_request = args.participant_session_initiate_request;

      if(args && args.participant_session_accept_pending)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_accept_pending = args.participant_session_accept_pending;

      if(args && args.participant_session_accept_success)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_accept_success = args.participant_session_accept_success;

      if(args && args.participant_session_accept_error)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_accept_error = args.participant_session_accept_error;

      if(args && args.participant_session_accept_request)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_accept_request = args.participant_session_accept_request;

      if(args && args.participant_session_info_pending)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_info_pending = args.participant_session_info_pending;

      if(args && args.participant_session_info_success)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_info_success = args.participant_session_info_success;

      if(args && args.participant_session_info_error)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_info_error = args.participant_session_info_error;

      if(args && args.participant_session_info_request)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_info_request = args.participant_session_info_request;

      if(args && args.participant_session_terminate_pending)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_terminate_pending = args.participant_session_terminate_pending;

      if(args && args.participant_session_terminate_success)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_terminate_success = args.participant_session_terminate_success;

      if(args && args.participant_session_terminate_error)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_terminate_error = args.participant_session_terminate_error;

      if(args && args.participant_session_terminate_request)
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._participant_session_terminate_request = args.participant_session_terminate_request;

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

      if(args && args.password)
        /**
         * @member {String}
         * @default
         * @private
         */
        this._password = args.password;

      if(args && args.password_protect)
        /**
         * @member {Boolean}
         * @default
         * @private
         */
        this._password_protect = args.password_protect;

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._participants = {};

      /**
       * @member {String}
       * @default
       * @private
       */
      this._iid = '';

      /**
       * @member {Boolean}
       * @default
       * @private
       */
      this._is_room_owner = false;

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
      this._namespace = NS_MUJI;
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

        // Trigger session prepare pending custom callback
        /* @function */
        (this.get_session_prepare_pending())(this);

        // Change session status
        this._set_status(JSJAC_JINGLE_MUJI_STATUS_PREPARING);

        // Set session values
        this._set_iid(this.utils.generate_iid());
        this._set_sid(
          this.utils.generate_hash_md5(this.get_to())
        );

        this._set_initiator(this.get_to());
        this._set_responder(this.utils.connection_jid());

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

        // Trigger session leave pending custom callback
        /* @function */
        (this.get_session_leave_pending())(this);

        // Leave the room (after properly terminating participant sessions)
        this._terminate_participant_sessions(true, function() {
          _this.send_presence({ action: JSJAC_JINGLE_MUJI_ACTION_LEAVE });
        });
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] leave > ' + e, 1);
      }
    },

    /**
     * Aborts current Muji session.
     * @public
     * @param {Boolean} [set_lock]
     */
    abort: function(set_lock) {
      this.get_debug().log('[JSJaCJingle:muji] abort', 4);

      try {
        // Change session status
        this._set_status(JSJAC_JINGLE_MUJI_STATUS_LEFT);

        // Stop WebRTC
        this._peer_stop();

        // Flush all participant content
        this._set_participants(null);

        // Lock session? (cannot be used later)
        if(set_lock === true)  this._set_lock(true);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] abort > ' + e, 1);
      }
    },

    /**
     * Invites people to current Muji session
     * @public
     * @param {String|Array} jid
     * @param {String} [reason]
     */
    invite: function(jid, reason) {
      this.get_debug().log('[JSJaCJingle:muji] invite', 4);

      try {
        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:muji] invite > Cannot invite, resource locked. Please open another session or check WebRTC support.', 0);
          return;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.invite(jid); })) {
          this.get_debug().log('[JSJaCJingle:muji] invite > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        if(!jid) {
          this.get_debug().log('[JSJaCJingle:muji] invite > JID parameter not provided or blank.', 0);
          return;
        }

        var i;
            jid_arr = (jid instanceof Array) ? jid : [jid];

        for(i = 0; i < jid_arr.length; i++)  this._send_invite(jid_arr[i], reason);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] invite > ' + e, 1);
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
        if(this.get_mute(name) === true) {
          this.get_debug().log('[JSJaCJingle:muji] mute > Resource already muted.', 0);
          return;
        }

        this._peer_sound(false);
        this._set_mute(name, true);

        // Mute all participants
        this._toggle_participants_mute(name, JSJAC_JINGLE_SESSION_INFO_MUTE);
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
        if(this.get_mute(name) === false) {
          this.get_debug().log('[JSJaCJingle:muji] unmute > Resource already unmuted.', 0);
          return;
        }

        this._peer_sound(true);
        this._set_mute(name, false);

        // Unmute all participants
        this._toggle_participants_mute(name, JSJAC_JINGLE_SESSION_INFO_UNMUTE);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] unmute > ' + e, 1);
      }
    },

    /**
     * Toggles media type in a Muji session (local)
     * @todo Code media() (Muji version)
     * @public
     * @param {String} [media]
     */
    media: function(media) {
      /* DEV: don't expect this to work as of now! */
      /* MEDIA() - MUJI VERSION */

      this.get_debug().log('[JSJaCJingle:muji] media', 4);

      try {
        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:muji] media > Cannot change media, resource locked. Please open another session or check WebRTC support.', 0);
          return;
        }

        // Defer?
        var _this = this;

        if(JSJaCJingle._defer(function() { _this.media(media); })) {
          this.get_debug().log('[JSJaCJingle:muji] media > Deferred (waiting for the library components to be initiated).', 0);
          return;
        }

        // Toggle media?
        if(!media)
          media = (this.get_media() == JSJAC_JINGLE_MEDIA_VIDEO) ? JSJAC_JINGLE_MEDIA_AUDIO : JSJAC_JINGLE_MEDIA_VIDEO;

        // Media unknown?
        if(!(media in JSJAC_JINGLE_MEDIAS)) {
          this.get_debug().log('[JSJaCJingle:muji] media > No media provided or media unsupported (media: ' + media + ').', 0);
          return;
        }

        // Already using provided media?
        if(this.get_media() == media) {
          this.get_debug().log('[JSJaCJingle:muji] media > Resource already using this media (media: ' + media + ').', 0);
          return;
        }

        // Switch locked for now? (another one is being processed)
        if(this.get_media_busy()) {
          this.get_debug().log('[JSJaCJingle:muji] media > Resource already busy switching media (busy: ' + this.get_media() + ', media: ' + media + ').', 0);
          return;
        }

        this.get_debug().log('[JSJaCJingle:muji] media > Changing media to: ' + media + '...', 2);

        // Store new media
        this._set_media(media);
        this._set_media_busy(true);

        // Toggle video mode (add/remove)
        if(media == JSJAC_JINGLE_MEDIA_VIDEO) {
          /* @todo the flow is something like that... */
          /*this._peer_get_user_media(function() {
            this._peer_connection_create(
              function() {
                this.get_debug().log('[JSJaCJingle:muji] media > Ready to change media (to: ' + media + ').', 2);

                // 'content-add' >> video
                // @todo restart video stream configuration

                // WARNING: only change get user media, DO NOT TOUCH THE STREAM THING (don't stop active stream as it's flowing!!)

                this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_CONTENT_ADD, name: JSJAC_JINGLE_MEDIA_VIDEO });
              }
            )
          });*/
        } else {
          /* @todo the flow is something like that... */
          /*this._peer_get_user_media(function() {
            this._peer_connection_create(
              function() {
                this.get_debug().log('[JSJaCJingle:muji] media > Ready to change media (to: ' + media + ').', 2);

                // 'content-remove' >> video
                // @todo remove video stream configuration

                // WARNING: only change get user media, DO NOT TOUCH THE STREAM THING (don't stop active stream as it's flowing!!)
                //          here, only stop the video stream, do not touch the audio stream

                this.send(JSJAC_JINGLE_IQ_TYPE_SET, { action: JSJAC_JINGLE_ACTION_CONTENT_REMOVE, name: JSJAC_JINGLE_MEDIA_VIDEO });
              }
            )
          });*/
        }

        /* @todo loop on participant sessions and toggle medias individually */
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] media > ' + e, 1);
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

        this.get_connection().send(stanza);

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

        this.get_connection().send(stanza);

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
        var type = (stanza.getType() || JSJAC_JINGLE_PRESENCE_TYPE_AVAILABLE);

        if(id)  this._set_received_id(id);

        // Submit to custom handler (only for local user packets)
        var i, handlers, is_stanza_from_local;

        handlers = this.get_registered_handlers(JSJAC_JINGLE_STANZA_PRESENCE, type, id);
        is_stanza_from_local = this.is_stanza_from_local(stanza);

        if(typeof handlers == 'object' && handlers.length && is_stanza_from_local === true) {
          this.get_debug().log('[JSJaCJingle:muji] handle_presence > Submitted to custom registered handlers.', 2);

          for(i in handlers) {
            /* @function */
            handlers[i](stanza);
          }

          this.unregister_handler(JSJAC_JINGLE_STANZA_PRESENCE, type, id);

          return;
        }

        // Local stanza?
        if(is_stanza_from_local === true) {
          if(stanza.getType() === JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE) {
            this.get_debug().log('[JSJaCJingle:muji] handle_presence > Conference room going offline, forcing termination...', 1);

            // Change session status
            this._set_status(JSJAC_JINGLE_MUJI_STATUS_LEAVING);

            this._terminate_participant_sessions();

            // Trigger leave error handlers
            /* @function */
            this.get_session_leave_error()(this, stanza);
            this._handle_session_leave_error(stanza);
          } else {
            this.get_debug().log('[JSJaCJingle:muji] handle_presence > Dropped local stanza.', 1);
          }
        } else {
          // Defer if user media not ready yet
          this._defer_participant_handlers(function(is_deferred) {
            // Remote stanza handlers
            if(stanza.getType() === JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE) {
              _this._handle_participant_leave(stanza, is_deferred);

              /* @function */
              _this.get_participant_leave()(stanza);
            } else {
              var muji = _this.utils.stanza_muji(stanza);

              // Don't handle non-Muji stanzas there...
              if(!muji) return;

              // Submit to registered handler
              var username = _this.utils.stanza_username(stanza);
              var status = _this._shortcut_participant_status(username);

              var fn_log_drop = function() {
                _this.get_debug().log('[JSJaCJingle:muji] handle_presence > Dropped out-of-order participant stanza with status: ' + status, 1);
              };

              if(_this._stanza_has_preparing(muji)) {
                if(!status || status === JSJAC_JINGLE_MUJI_STATUS_INACTIVE) {
                  _this._handle_participant_prepare(stanza, is_deferred);

                  /* @function */
                  _this.get_participant_prepare()(_this, stanza);
                } else {
                  fn_log_drop();
                }
              } else if(_this._stanza_has_content(muji)) {
                if(!status || status === JSJAC_JINGLE_MUJI_STATUS_INACTIVE || status === JSJAC_JINGLE_MUJI_STATUS_PREPARED) {
                  _this._handle_participant_initiate(stanza, is_deferred);

                  /* @function */
                  _this.get_participant_initiate()(_this, stanza);
                } else {
                  fn_log_drop();
                }
              } else if(_this.is_stanza_from_participant(stanza)) {
                if(!status || status === JSJAC_JINGLE_MUJI_STATUS_INACTIVE || status === JSJAC_JINGLE_MUJI_STATUS_INITIATED) {
                  _this._handle_participant_leave(stanza, is_deferred);

                  /* @function */
                  _this.get_participant_leave()(_this, stanza);
                } else {
                  fn_log_drop();
                }
              }
            }
          });
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

        if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:muji] handle_message > Incoming packet received' + '\n\n' + stanza.xml());

        // Locked?
        if(this.get_lock()) {
          this.get_debug().log('[JSJaCJingle:muji] handle_message > Cannot handle, resource locked. Please open another session or check WebRTC support.', 0);
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
     * JSJSAC JINGLE MUJI SENDERS
     */

    /**
     * Sends the invite message.
     * @private
     * @param {String} jid
     */
    _send_invite: function(jid, reason) {
      this.get_debug().log('[JSJaCJingle:muji] _send_invite', 4);

      try {
        var cur_participant, participants,
            stanza, x_invite;

        stanza = new JSJaCMessage();
        stanza.setTo(jid);

        x_invite = stanza.buildNode('x', {
          'jid': this.get_to(),
          'xmlns': NS_JABBER_CONFERENCE
        });

        if(reason)
          x_invite.setAttribute('reason', reason);
        if(this.get_password())
          x_invite.setAttribute('password', this.get_password());

        stanza.getNode().appendChild(x_invite);
        
        stanza.appendNode('x', {
          'media': this.get_media(),
          'xmlns': NS_MUJI_INVITE
        });

        this.get_connection().send(stanza);

        if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:muji] _send_invite > Outgoing packet sent' + '\n\n' + stanza.xml());

        // Trigger custom callback
        /* @function */
        (this.get_room_message_out())(this, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _send_invite > ' + e, 1);
      }
    },

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
          this.get_debug().log('[JSJaCJingle:muji] _send_session_prepare > Arguments not provided.', 1);
          return;
        }

        // Build Muji stanza
        var muji = this.utils.stanza_generate_muji(stanza);
        muji.appendChild(stanza.buildNode('preparing', { 'xmlns': NS_MUJI }));

        // Password-protected room?
        if(this.get_password()) {
          var x_muc = stanza.getNode().appendChild(stanza.buildNode('x', { 'xmlns': NS_JABBER_MUC }));

          x_muc.appendChild(
            stanza.buildNode('password', { 'xmlns': NS_JABBER_MUC }, this.get_password())
          );
        }

        // Schedule success
        var _this = this;

        this.register_handler(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_AVAILABLE, args.id, function(stanza) {
          /* @function */
          (_this.get_session_prepare_success())(_this, stanza);
          _this._handle_session_prepare_success(stanza);
        });

        this.register_handler(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_ERROR, args.id, function(stanza) {
          /* @function */
          (_this.get_session_prepare_error())(_this, stanza);
          _this._handle_session_prepare_error(stanza);
        });

        // Schedule timeout
        this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_AVAILABLE, args.id, {
          /* @function */
          external:   this.get_session_prepare_error().bind(this),
          internal:   this._handle_session_prepare_error.bind(this)
        });
        this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_ERROR, args.id);

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
          this.get_debug().log('[JSJaCJingle:muji] _send_session_initiate > Arguments not provided.', 1);
          return;
        }

        // Build Muji stanza
        var muji = this.utils.stanza_generate_muji(stanza);

        this.utils.stanza_generate_content_local(stanza, muji, false);
        this.utils.stanza_generate_group_local(stanza, muji);

        // Schedule success
        var _this = this;

        this.register_handler(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_AVAILABLE, args.id, function(stanza) {
          /* @function */
          (_this.get_session_initiate_success())(_this, stanza);
          _this._handle_session_initiate_success(stanza);
        });

        this.register_handler(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_ERROR, args.id, function(stanza) {
          /* @function */
          (_this.get_session_initiate_error())(_this, stanza);
          _this._handle_session_initiate_error(stanza);
        });

        // Schedule timeout
        this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_AVAILABLE, args.id, {
          /* @function */
          external:   this.get_session_initiate_error().bind(this),
          internal:   this._handle_session_initiate_error.bind(this)
        });
        this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_ERROR, args.id);

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
        if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_LEAVING) {
          this.get_debug().log('[JSJaCJingle:muji] _send_session_leave > Cannot send leave stanza, resource already left (status: ' + this.get_status() + ').', 0);
          return;
        }

        if(!args) {
          this.get_debug().log('[JSJaCJingle:muji] _send_session_leave > Arguments not provided.', 1);
          return;
        }

        stanza.setType(JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE);

        // Schedule success
        var _this = this;

        this.register_handler(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE, args.id, function(stanza) {
          /* @function */
          (_this.get_session_leave_success())(_this, stanza);
          _this._handle_session_leave_success(stanza);
        });

        this.register_handler(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_ERROR, args.id, function(stanza) {
          /* @function */
          (_this.get_session_leave_error())(_this, stanza);
          _this._handle_session_leave_error(stanza);
        });

        // Schedule timeout
        this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE, args.id, {
          /* @function */
          external:   this.get_session_leave_error().bind(this),
          internal:   this._handle_session_leave_error.bind(this)
        });
        this.utils.stanza_timeout(JSJAC_JINGLE_STANZA_PRESENCE, JSJAC_JINGLE_PRESENCE_TYPE_ERROR, args.id);

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
        if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_PREPARING) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success > Cannot handle prepare success stanza, resource already prepared (status: ' + this.get_status() + ').', 0);
          return;
        }

        var username = this.utils.stanza_username(stanza);

        if(!username) {
          throw 'No username provided, not accepting session prepare stanza.';
        }

        if(this._stanza_has_room_owner(stanza)) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success > Current MUC affiliation is owner.', 2);

          this._set_is_room_owner(true);
        }

        if(this._stanza_has_password_invalid(stanza)) {
          // Password protected room?
          this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success > Password-protected room, aborting.', 1);

          /* @function */
          (this.get_session_leave_success())(this, stanza);
          this._handle_session_leave_success(stanza);
        } else if(this._stanza_has_username_conflict(stanza)) {
          // Username conflict
          var alt_username = (this.get_username() + this.utils.generate_random(4));

          this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success > Conflicting username, changing it to: ' + alt_username, 2);

          this._set_username(alt_username);
          this.send_presence({ action: JSJAC_JINGLE_MUJI_ACTION_PREPARE });
        } else {
          // Change session status
          this._set_status(JSJAC_JINGLE_MUJI_STATUS_PREPARED);

          // Initialize WebRTC
          var _this = this;

          this._peer_get_user_media(function() {
            _this._peer_connection_create(function() {
              _this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_success > Ready to begin Muji initiation.', 2);

              // Trigger session initiate pending custom callback
              /* @function */
              (_this.get_session_initiate_pending())(_this);

              // Build content (local)
              _this.utils.build_content_local();

              // Change session status
              _this._set_status(JSJAC_JINGLE_MUJI_STATUS_INITIATING);

              _this.send_presence({ action: JSJAC_JINGLE_MUJI_ACTION_INITIATE });
            });
          });
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
        if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_PREPARING) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_session_prepare_error > Cannot handle prepare error stanza, resource already prepared (status: ' + this.get_status() + ').', 0);
          return;
        }

        this.leave();
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
        if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_INITIATING) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_session_initiate_success > Cannot handle initiate success stanza, resource already initiated (status: ' + this.get_status() + ').', 0);
          return;
        }

        // Change session status
        this._set_status(JSJAC_JINGLE_MUJI_STATUS_INITIATED);

        // Undefer pending participant handlers
        this._undefer_participant_handlers();

        // Autoconfigure room password if new MUC
        if(this.get_is_room_owner() === true     &&
           this.get_password_protect() === true  &&
           this.utils.object_length(this.get_participants()) === 0) {
          this._autoconfigure_room_password();
        }
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
        if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_INITIATING) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_session_initiate_error > Cannot handle initiate error stanza, resource already initiated (status: ' + this.get_status() + ').', 0);
          return;
        }

        this.leave();
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
        if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_LEAVING) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_session_leave_success > Cannot handle leave success stanza, resource already left (status: ' + this.get_status() + ').', 0);
          return;
        }

        this.abort();
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
        if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_LEAVING) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_session_leave_success > Cannot handle leave error stanza, resource already left (status: ' + this.get_status() + ').', 0);
          return;
        }

        this.abort(true);

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
     * @param {Boolean} [is_deferred]
     */
    _handle_participant_prepare: function(stanza, is_deferred) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_prepare', 4);

      try {
        var username = this.utils.stanza_username(stanza);

        if(!username) {
          throw 'No username provided, not accepting participant prepare stanza.';
        }

        // Local slot unavailable?
        if(this.get_status() === JSJAC_JINGLE_MUJI_STATUS_INACTIVE  ||
           this.get_status() === JSJAC_JINGLE_MUJI_STATUS_LEAVING   ||
           this.get_status() === JSJAC_JINGLE_MUJI_STATUS_LEFT) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_participant_prepare > [' + username + '] > Cannot handle, resource not available (status: ' + this.get_status() + ').', 0);
          return;
        }

        // Remote slot unavailable?
        var status = this._shortcut_participant_status(username);

        if(status !== JSJAC_JINGLE_MUJI_STATUS_INACTIVE) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_participant_prepare > [' + username + '] > Cannot handle prepare stanza, participant already prepared (status: ' + status + ').', 0);
          return;
        }

        this._set_participants(username, {
          status: JSJAC_JINGLE_MUJI_STATUS_PREPARED,
          view: this._shortcut_participant_view(username)
        });
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_prepare > ' + e, 1);
      }
    },

    /**
     * Handles the participant initiate event.
     * @private
     * @event JSJaCJingleMuji#_handle_participant_initiate
     * @param {JSJaCPacket} stanza
     * @param {Boolean} [is_deferred]
     */
    _handle_participant_initiate: function(stanza, is_deferred) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_initiate', 4);

      try {
        var username = this.utils.stanza_username(stanza);

        if(!username) {
          throw 'No username provided, not accepting participant initiate stanza.';
        }

        // Local slot unavailable?
        if(this.get_status() === JSJAC_JINGLE_MUJI_STATUS_INACTIVE  ||
           this.get_status() === JSJAC_JINGLE_MUJI_STATUS_LEAVING   ||
           this.get_status() === JSJAC_JINGLE_MUJI_STATUS_LEFT) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_participant_initiate > [' + username + '] > Cannot handle, resource not available (status: ' + this.get_status() + ').', 0);
          return;
        }

        // Remote slot unavailable?
        var status = this._shortcut_participant_status(username);

        if(status !== JSJAC_JINGLE_MUJI_STATUS_INACTIVE  &&
           status !== JSJAC_JINGLE_MUJI_STATUS_PREPARED) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_participant_initiate > [' + username + '] > Cannot handle initiate stanza, participant already initiated (status: ' + status + ').', 0);
          return;
        }

        // Need to initiate? (participant was here before we joined)
        /* @see {@link http://xmpp.org/extensions/xep-0272.html#joining|XEP-0272: Multiparty Jingle (Muji) - Joining a Conference} */
        if(is_deferred === true) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_participant_initiate > [' + username + '] Initiating participant Jingle session...', 2);

          // Create Jingle session
          this._create_participant_session(username).initiate();
        } else {
          this.get_debug().log('[JSJaCJingle:muji] _handle_participant_initiate > [' + username + '] Waiting for participant Jingle initiation request...', 2);

          this._set_participants(username, {
            status: JSJAC_JINGLE_MUJI_STATUS_INITIATED,
            view: this._shortcut_participant_view(username)
          });
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
     * @param {Boolean} [is_deferred]
     */
    _handle_participant_leave: function(stanza, is_deferred) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_leave', 4);

      try {
        var username = this.utils.stanza_username(stanza);

        if(!username) {
          throw 'No username provided, not accepting participant leave stanza.';
        }

        // Local slot unavailable?
        if(this.get_status() === JSJAC_JINGLE_MUJI_STATUS_INACTIVE  ||
           this.get_status() === JSJAC_JINGLE_MUJI_STATUS_LEAVING   ||
           this.get_status() === JSJAC_JINGLE_MUJI_STATUS_LEFT) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_participant_leave > [' + username + '] > Cannot handle, resource not available (status: ' + this.get_status() + ').', 0);
          return;
        }

        // Remote slot unavailable?
        var status = this._shortcut_participant_status(username);

        if(status !== JSJAC_JINGLE_MUJI_STATUS_PREPARED  &&
           status !== JSJAC_JINGLE_MUJI_STATUS_INITIATED) {
          this.get_debug().log('[JSJaCJingle:muji] _handle_participant_leave > [' + username + '] > Cannot handle leave stanza, participant already left or inactive (status: ' + status + ').', 0);
          return;
        }

        // Remove participant session
        var session = (this.get_participants(username) || {}).session;

        if(session && session.get_status() !== JSJAC_JINGLE_STATUS_TERMINATED)
          session.abort(true);

        this._set_participants(username, null);
        this.get_remove_remote_view()(this, username);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_leave > ' + e, 1);
      }
    },



    /**
     * JSJSAC JINGLE SESSION HANDLERS
     */

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_initiate_pending
     * @param {JSJaCJingleSingle} session
     */
    _handle_participant_session_initiate_pending: function(session) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_initiate_pending', 4);

      try {
        /* @function */
        (this.get_participant_session_initiate_pending())(this, session);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_initiate_pending > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_initiate_success
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_initiate_success: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_initiate_success', 4);

      try {
        /* @function */
        (this.get_participant_session_initiate_success())(this, session, stanza);

        // Mute participant?
        var cur_media_name;

        for(cur_media_name in this._mute) {
          if(this.get_mute(cur_media_name) === true) {
            this._toggle_participants_mute(
              cur_media_name,
              JSJAC_JINGLE_SESSION_INFO_MUTE,
              username
            );
          }
        }

        // Auto-accept incoming sessions
        if(session.is_responder()) {
          // Accept after a while
          setTimeout(function() {
            session.accept();
          }, (JSJAC_JINGLE_MUJI_PARTICIPANT_ACCEPT_WAIT * 1000));
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_initiate_success > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_initiate_error
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_initiate_error: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_initiate_error', 4);

      try {
        /* @function */
        (this.get_participant_session_initiate_error())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_initiate_error > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_initiate_request
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_initiate_request: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_initiate_request', 4);

      try {
        /* @function */
        (this.get_participant_session_initiate_request())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_initiate_request > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_accept_pending
     * @param {JSJaCJingleSingle} session
     */
    _handle_participant_session_accept_pending: function(session) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_accept_pending', 4);

      try {
        /* @function */
        (this.get_participant_session_accept_pending())(this, session);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_accept_pending > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_accept_success
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_accept_success: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_accept_success', 4);

      try {
        /* @function */
        (this.get_participant_session_accept_success())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_accept_success > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_accept_error
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_accept_error: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_accept_error', 4);

      try {
        /* @function */
        (this.get_participant_session_accept_error())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_accept_error > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_accept_request
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_accept_request: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_accept_request', 4);

      try {
        /* @function */
        (this.get_participant_session_accept_request())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_accept_request > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_info_pending
     * @param {JSJaCJingleSingle} session
     */
    _handle_participant_session_info_pending: function(session) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_info_pending', 4);

      try {
        /* @function */
        (this.get_participant_session_info_pending())(this, session);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_info_pending > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_info_success
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_info_success: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_info_success', 4);

      try {
        /* @function */
        (this.get_participant_session_info_success())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_info_success > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_info_error
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_info_error: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_info_error', 4);

      try {
        /* @function */
        (this.get_participant_session_info_error())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_info_error > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_info_request
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_info_request: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_info_request', 4);

      try {
        /* @function */
        (this.get_participant_session_info_request())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_info_request > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_terminate_pending
     * @param {JSJaCJingleSingle} session
     */
    _handle_participant_session_terminate_pending: function(session) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_terminate_pending', 4);

      try {
        /* @function */
        (this.get_participant_session_terminate_pending())(this, session);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_terminate_pending > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_terminate_success
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_terminate_success: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_terminate_success', 4);

      try {
        /* @function */
        (this.get_participant_session_terminate_success())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_terminate_success > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_terminate_error
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_terminate_error: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_terminate_error', 4);

      try {
        /* @function */
        (this.get_participant_session_terminate_error())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_terminate_error > ' + e, 1);
      }
    },

    /**
     * Handles the Jingle session prepare success
     * @private
     * @event JSJaCJingleMuji#_handle_participant_session_terminate_request
     * @param {JSJaCJingleSingle} session
     * @param {JSJaCPacket} stanza
     */
    _handle_participant_session_terminate_request: function(session, stanza) {
      this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_terminate_request', 4);

      try {
        /* @function */
        (this.get_participant_session_terminate_request())(this, session, stanza);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _handle_participant_session_terminate_request > ' + e, 1);
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
      return this.utils.stanza_get_element(muji, 'preparing', NS_MUJI).length && true;
    },

    /**
     * Returns whether user has content or not
     * @private
     * @param {DOM} muji
     * @returns {Boolean} Content state
     */
    _stanza_has_content: function(muji) {
      return this.utils.stanza_get_element(muji, 'content', NS_MUJI).length && true;
    },

    /**
     * Returns whether stanza has the room owner code or not
     * @private
     * @param {JSJaCPacket} stanza
     * @returns {Boolean} Room owner state
     */
    _stanza_has_room_owner: function(stanza) {
      var is_room_owner = false;

      try {
        var i, items,
            x_muc_user = stanza.getChild('x', NS_JABBER_MUC_USER);

        if(x_muc_user) {
          items = this.utils.stanza_get_element(x_muc_user, 'item', NS_JABBER_MUC_USER);

          for(i = 0; i < items.length; i++) {
            if(items[i].getAttribute('affiliation') === JSJAC_JINGLE_MUJI_MUC_AFFILIATION_OWNER) {
              is_room_owner = true; break;
            }
          }
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _stanza_has_room_owner > ' + e, 1);
      } finally {
        return is_room_owner;
      }
    },

    /**
     * Returns whether stanza is a password invalid or not
     * @private
     * @param {JSJaCPacket} stanza
     * @returns {Boolean} Password invalid state
     */
    _stanza_has_password_invalid: function(stanza) {
      return (this.utils.stanza_get_error(stanza, XMPP_ERROR_NOT_AUTHORIZED).length >= 1) && true;
    },

    /**
     * Returns whether stanza is an username conflict or not
     * @private
     * @param {JSJaCPacket} stanza
     * @returns {Boolean} Local user state
     */
    _stanza_has_username_conflict: function(stanza) {
      return (this.utils.stanza_get_error(stanza, XMPP_ERROR_CONFLICT).length >= 1) && true;
    },



    /**
     * JSJSAC JINGLE PEER TOOLS
     */

    /**
     * Creates peer connection instance
     * @private
     */
    _peer_connection_create_instance: function() {
      this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_instance', 4);

      try {
        // Create the RTCPeerConnection object
        this._set_peer_connection(
          new WEBRTC_PEER_CONNECTION(
            null,
            WEBRTC_CONFIGURATION.peer_connection.constraints
          )
        );
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_instance > ' + e, 1);
      }
    },

    /**
     * Attaches peer connection callbacks (not used)
     * @private
     * @param {Function} [sdp_message_callback]
     */
    _peer_connection_callbacks: function(sdp_message_callback) {
      this.get_debug().log('[JSJaCJingle:muji] _peer_connection_callbacks', 4);

      try {
        // Not used for Muji
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _peer_connection_callbacks > ' + e, 1);
      }
    },

    /**
     * Dispatches peer connection to correct creator (offer/answer)
     * @private
     * @param {Function} [sdp_message_callback]
     */
    _peer_connection_create_dispatch: function(sdp_message_callback) {
      this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_dispatch', 4);

      try {
        this._peer_connection_create_offer(sdp_message_callback);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_dispatch > ' + e, 1);
      }
    },

    /**
     * Creates peer connection offer
     * @private
     * @param {Function} [sdp_message_callback]
     */
    _peer_connection_create_offer: function(sdp_message_callback) {
      this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_offer', 4);

      try {
        // Create offer
        this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_offer > Getting local description...', 2);

        // Local description
        this.get_peer_connection().createOffer(
          function(sdp_local) {
            this._peer_got_description(sdp_local, sdp_message_callback);
          }.bind(this),

          this._peer_fail_description.bind(this),
          WEBRTC_CONFIGURATION.create_offer
        );
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _peer_connection_create_offer > ' + e, 1);
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
     * @param {String} state
     * @param {Object} [args]
     */
    _peer_timeout: function(state, args) {
      try {
        // Assert
        if(typeof args !== 'object') args = {};

        var t_iid = this.get_iid();

        var _this = this;

        setTimeout(function() {
          try {
            // State did not change?
            if(_this.get_iid() == t_iid && _this.get_peer_connection().iceConnectionState == state) {
              _this.get_debug().log('[JSJaCJingle:muji] _peer_timeout > Peer timeout.', 2);
            }
          } catch(e) {
            _this.get_debug().log('[JSJaCJingle:muji] _peer_timeout > ' + e, 1);
          }
        }, ((args.timer || JSJAC_JINGLE_PEER_TIMEOUT_DEFAULT) * 1000));
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _peer_timeout > ' + e, 1);
      }
    },

    /**
     * Stops ongoing peer connections
     * @private
     */
    _peer_stop: function() {
      this.get_debug().log('[JSJaCJingle:muji] _peer_stop', 4);

      // Detach media streams from DOM view
      this._set_local_stream(null);

      // Close the media stream
      if(this.get_peer_connection()  && 
         (typeof this.get_peer_connection().close == 'function'))
        this.get_peer_connection().close();

      // Remove this session from router
      JSJaCJingle._remove(JSJAC_JINGLE_SESSION_SINGLE, this.get_sid());
    },



    /**
     * JSJSAC JINGLE STATES
     */

    /**
     * Is user media ready?
     * @public
     * @returns {Boolean} Ready state
     */
    is_ready_user_media: function() {
      return (this.get_local_stream() !== null) && true;
    },

    /**
     * Is this stanza from a participant?
     * @public
     * @param {JSJaCPacket} stanza
     * @returns {Boolean} Participant state
     */
    is_stanza_from_participant: function(stanza) {
      var username = this.utils.stanza_username(stanza);
      return (this.get_participants(username) in JSJAC_JINGLE_MUJI_STATUS) && true;
    },

    /**
     * Is this stanza from local user?
     * @public
     * @param {JSJaCPacket} stanza
     * @returns {Boolean} Local user state
     */
    is_stanza_from_local: function(stanza) {
      return this.utils.stanza_username(stanza) === this.get_username();
    },



    /**
     * JSJSAC JINGLE SHORTCUTS
     */

    /**
     * Returns participant status (even if inexistant)
     * @private
     * @param {String} username
     * @returns {String} Status
     */
    _shortcut_participant_status: function(username) {
      return ((this.get_participants(username) || {}).status || JSJAC_JINGLE_MUJI_STATUS_INACTIVE);
    },

    /**
     * Returns local user candidates
     * @private
     * @returns {Object} Candidates
     */
    _shortcut_local_user_candidates: function() {
      return this.get_candidates_local();
    },

    /**
     * Gets participant view (or create it)
     * @private
     * @param {String} username
     * @returns {Object} View
     */
    _shortcut_participant_view: function(username) {
      if((this.get_participants(username) || {}).view)
        return this.get_participants(username).view;
      
      return this.get_add_remote_view()(this, username, this.get_media());
    },



    /**
     * JSJSAC JINGLE VARIOUS TOOLS
     */

    /**
     * Terminate participant sessions
     * @private
     * @param {Boolean} [send_terminate]
     * @param {Function} [leave_callback]
     */
    _terminate_participant_sessions: function(send_terminate, leave_callback) {
      try {
        // Terminate each session
        var cur_username, cur_participant,
            participants = this.get_participants();

        for(cur_username in participants) {
          cur_participant = participants[cur_username];

          if(typeof cur_participant.session != 'undefined') {
            if(send_terminate === true)
              cur_participant.session.terminate();

            this.get_remove_remote_view()(this, cur_username);
          }
        }

        // Execute callback after a while
        var _this = this;

        if(typeof leave_callback == 'function') {
          setTimeout(function() {
            try {
              leave_callback();
            } catch(e) {
              _this.get_debug().log('[JSJaCJingle:muji] _terminate_participant_sessions > ' + e, 1);
            }
          }, (JSJAC_JINGLE_MUJI_LEAVE_WAIT * 1000));
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _terminate_participant_sessions > ' + e, 1);
      }
    },

    /**
     * Mutes/unmutes all or given participant(s)
     * @private
     * @param {String} media_name
     * @param {String} mute_action
     * @param {String} [username]
     */
    _toggle_participants_mute: function(media_name, mute_action, username) {
      try {
        var i, cur_participant;
        var participants = {};

        // One specific or all?
        if(username)
          participants[username] = this.get_participants(username);
        else
          participants = this.get_participants();

        for(i in participants) {
          cur_participant = participants[i];

          if(cur_participant.session.get_status() === JSJAC_JINGLE_STATUS_ACCEPTED) {
            switch(mute_action) {
              case JSJAC_JINGLE_SESSION_INFO_MUTE:
                cur_participant.session.mute(media_name); break;

              case JSJAC_JINGLE_SESSION_INFO_UNMUTE:
                cur_participant.session.unmute(media_name); break;
            }
          }
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _toggle_participants_mute > ' + e, 1);
      }
    },

    /**
     * Defers given participant handler (or executes it)
     * @private
     * @param {Function} fn
     * @returns {Boolean} Defer status
     */
    _defer_participant_handlers: function(fn) {
      var is_deferred = false;

      try {
        var _this = this;

        if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_INITIATED  &&
           this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_LEAVING    &&
           this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_LEFT
          ) {
          this.defer_handler(JSJAC_JINGLE_MUJI_HANDLER_GET_USER_MEDIA, function() {
            fn.bind(_this)(true);
          });

          is_deferred = true;

          this.get_debug().log('[JSJaCJingle:muji] _defer_participant_handlers > Deferred participant handler (waiting for user media).', 0);
        } else {
          fn(false);
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _defer_participant_handlers > ' + e, 1);
      } finally {
        return is_deferred;
      }
    },

    /**
     * Undefers participant handlers
     * @private
     */
    _undefer_participant_handlers: function() {
      try {
        // Undefer pending handlers
        var i, handlers;
        handlers = this.get_deferred_handlers(JSJAC_JINGLE_MUJI_HANDLER_GET_USER_MEDIA);

        if(typeof handlers == 'object' && handlers.length) {
          this.get_debug().log('[JSJaCJingle:muji] _undefer_participant_handlers > Submitted to deferred handlers.', 2);

          for(i = 0; i < handlers.length; i++) {
            /* @function */
            handlers[i]();
          }

          this.undefer_handler(JSJAC_JINGLE_MUJI_HANDLER_GET_USER_MEDIA);
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _undefer_participant_handlers > ' + e, 1);
      }
    },

    /**
     * Creates participant Jingle session
     * @private
     * @param {String} username
     * @returns {JSJaCJingleSingle|Object} Jingle session instance
     */
    _create_participant_session: function(username) {
      var session = null;

      try {
        // Create Jingle session
        var session_args = this._generate_participant_session_args(username);

        session = new JSJaCJingleSingle(session_args);

        this._set_participants(username, {
          status: JSJAC_JINGLE_MUJI_STATUS_INITIATED,
          session: session,
          view: session_args.remote_view
        });

        // Configure Jingle session
        this.get_participants(username).session._set_local_stream_raw(
          this.get_local_stream()
        );
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _create_participant_session > ' + e, 1);
      } finally {
        return session;
      }
    },

    /**
     * Generates participant Jingle session arguments
     * @private
     * @param {String} username
     * @returns {Object} Jingle session arguments
     */
    _generate_participant_session_args: function(username) {
      args = {};

      try {
        // Main values
        args.connection             = this.get_connection();
        args.to                     = this.get_to() + '/' + username;
        args.local_view             = this.get_local_view();
        args.remote_view            = this._shortcut_participant_view(username);
        args.local_stream_readonly  = true;

        // Propagate values
        args.media         = this.get_media();
        args.video_source  = this.get_video_source();
        args.resolution    = this.get_resolution();
        args.bandwidth     = this.get_bandwidth();
        args.fps           = this.get_fps();
        args.stun          = this.get_stun();
        args.turn          = this.get_turn();
        args.sdp_trace     = this.get_sdp_trace();
        args.net_trace     = this.get_net_trace();
        args.debug         = this.get_debug();

        // Handlers
        args.session_initiate_pending   = this._handle_participant_session_initiate_pending.bind(this);
        args.session_initiate_success   = this._handle_participant_session_initiate_success.bind(this);
        args.session_initiate_error     = this._handle_participant_session_initiate_error.bind(this);
        args.session_initiate_request   = this._handle_participant_session_initiate_request.bind(this);

        args.session_accept_pending     = this._handle_participant_session_accept_pending.bind(this);
        args.session_accept_success     = this._handle_participant_session_accept_success.bind(this);
        args.session_accept_error       = this._handle_participant_session_accept_error.bind(this);
        args.session_accept_request     = this._handle_participant_session_accept_request.bind(this);

        args.session_info_pending       = this._handle_participant_session_info_pending.bind(this);
        args.session_info_success       = this._handle_participant_session_info_success.bind(this);
        args.session_info_error         = this._handle_participant_session_info_error.bind(this);
        args.session_info_request       = this._handle_participant_session_info_request.bind(this);

        args.session_terminate_pending  = this._handle_participant_session_terminate_pending.bind(this);
        args.session_terminate_success  = this._handle_participant_session_terminate_success.bind(this);
        args.session_terminate_error    = this._handle_participant_session_terminate_error.bind(this);
        args.session_terminate_request  = this._handle_participant_session_terminate_request.bind(this);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _generate_participant_session_args > ' + e, 1);
      } finally {
        return args;
      }
    },

    /**
     * Autoconfigures MUC room password
     * @private
     */
    _autoconfigure_room_password: function() {
      try {
        // Build stanza
        stanza = new JSJaCIQ();

        stanza.setTo(this.get_to());
        stanza.setType(JSJAC_JINGLE_IQ_TYPE_GET);

        stanza.setQuery(NS_JABBER_MUC_OWNER);

        var _this = this;

        this.get_connection().send(stanza, function(_stanza) {
          if(_this.get_net_trace())  _this.get_debug().log('[JSJaCJingle:muji] _autoconfigure_room_password > Incoming packet received' + '\n\n' + _stanza.xml());

          if(_stanza.getType() === JSJAC_JINGLE_IQ_TYPE_ERROR)
            _this.get_debug().log('[JSJaCJingle:muji] _autoconfigure_room_password > Could not get room configuration.', 1);
          else
            _this._receive_autoconfigure_room_password(_stanza);
        });

        if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:muji] _autoconfigure_room_password > Outgoing packet sent' + '\n\n' + stanza.xml());

        this.get_debug().log('[JSJaCJingle:muji] _autoconfigure_room_password > Getting room configuration...', 4);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _autoconfigure_room_password > ' + e, 1);
      }
    },

    /**
     * Receives MUC room password configuration
     * @private
     * @param {JSJaCPacket} stanza
     */
    _receive_autoconfigure_room_password: function(stanza) {
      try {
        var parse_obj = this._parse_autoconfigure_room_password(stanza);
        
        this._set_password(parse_obj.password);

        if(parse_obj.password != parse_obj.old_password) {
          this._send_autoconfigure_room_password(stanza, parse_obj);
        } else {
          this.get_debug().log('[JSJaCJingle:muji] _parse_autoconfigure_room_password > Room password already configured (password: ' + parse_obj.password + ').', 2);
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _receive_autoconfigure_room_password > ' + e, 1);
      }
    },

    /**
     * Parses MUC room password configuration
     * @private
     * @param {JSJaCPacket} stanza
     * @returns {Object} Parse results
     */
    _parse_autoconfigure_room_password: function(stanza) {
      var i,
          x_data_sel, field_item_sel, password_field_sel, password_value_sel,
          old_password, password;

      try {
        // Get stanza items
        query_sel = stanza.getQuery(NS_JABBER_MUC_OWNER);

        if(!query_sel)  throw 'No query element received.';

        x_data_sel = this.utils.stanza_get_element(query_sel, 'x', NS_JABBER_DATA);
        if(!x_data_sel || x_data_sel.length === 0)  throw 'No X data element received.';

        x_data_sel = x_data_sel[0];

        field_item_sel = this.utils.stanza_get_element(x_data_sel, 'field', NS_JABBER_DATA);
        if(!field_item_sel || field_item_sel.length === 0)  throw 'No field element received.';

        for(i = 0; i < field_item_sel.length; i++) {
          if(field_item_sel[i].getAttribute('var') === JSJAC_JINGLE_MUJI_MUC_CONFIG_SECRET) {
            password_field_sel = field_item_sel[i]; break;
          }
        }

        if(password_field_sel === undefined)  throw 'No password field element received.';

        password_value_sel = this.utils.stanza_get_element(password_field_sel, 'value', NS_JABBER_DATA);
        if(!password_value_sel || password_value_sel.length === 0)  throw 'No password field value element received.';

        password_value_sel = password_value_sel[0];

        // Get old password
        old_password = password_value_sel.nodeValue;

        // Apply password?
        if(this.get_password() && old_password != this.get_password()) {
          password = this.get_password();
        } else if(old_password) {
          password = old_password;
        } else {
          password = this.utils.generate_password();
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _parse_autoconfigure_room_password > ' + e, 1);
      } finally {
        return {
          password           : password,
          old_password       : old_password,
          x_data_sel         : x_data_sel,
          field_item_sel     : field_item_sel,
          password_field_sel : password_field_sel,
          password_value_sel : password_value_sel,
        };
      }
    },

    /**
     * Receives MUC room password configuration
     * @private
     * @param {JSJaCPacket} stanza
     * @param {Object} parse_obj
     */
    _send_autoconfigure_room_password: function(stanza, parse_obj) {
      try {
        // Change stanza headers
        stanza.setID(this.get_id_new());
        stanza.setType(JSJAC_JINGLE_IQ_TYPE_SET);
        stanza.setTo(stanza.getFrom());
        stanza.setFrom(null);

        // Change stanza items
        parse_obj.x_data_sel.setAttribute('type', JSJAC_JINGLE_MUJI_MUC_OWNER_SUBMIT);

        parse_obj.password_value_sel.parentNode.removeChild(parse_obj.password_value_sel);
        parse_obj.password_field_sel.appendChild(
          stanza.buildNode('value', { 'xmlns': NS_JABBER_DATA }, parse_obj.password)
        );

        var _this = this;

        this.get_connection().send(stanza, function(_stanza) {
          if(_this.get_net_trace())  _this.get_debug().log('[JSJaCJingle:muji] _send_autoconfigure_room_password > Incoming packet received' + '\n\n' + _stanza.xml());

          if(_stanza.getType() === JSJAC_JINGLE_IQ_TYPE_ERROR) {
            _this._set_password(undefined);

            _this.get_debug().log('[JSJaCJingle:muji] _send_autoconfigure_room_password > Could not autoconfigure room password.', 1);
          } else {
            _this.get_debug().log('[JSJaCJingle:muji] _send_autoconfigure_room_password > Successfully autoconfigured room password.', 2);
          }
        });

        this.get_debug().log('[JSJaCJingle:muji] _send_autoconfigure_room_password > Autoconfiguring room password (password: ' + parse_obj.password + ')...', 4);

        if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:muji] _send_autoconfigure_room_password > Outgoing packet sent' + '\n\n' + stanza.xml());
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:muji] _send_autoconfigure_room_password > ' + e, 1);
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
      return this._shortcut_get_handler(
        this._room_message_in
      );
    },

    /**
     * Gets the outgoing message callback function
     * @public
     * @event JSJaCJingleMuji#get_room_message_out
     * @returns {Function} Outgoing message callback function
     */
    get_room_message_out: function() {
      return this._shortcut_get_handler(
        this._room_message_out
      );
    },

    /**
     * Gets the incoming presence callback function
     * @public
     * @event JSJaCJingleMuji#get_room_presence_in
     * @returns {Function} Incoming presence callback function
     */
    get_room_presence_in: function() {
      return this._shortcut_get_handler(
        this._room_presence_in
      );
    },

    /**
     * Gets the outgoing presence callback function
     * @public
     * @event JSJaCJingleMuji#get_room_presence_out
     * @returns {Function} Outgoing presence callback function
     */
    get_room_presence_out: function() {
      return this._shortcut_get_handler(
        this._room_presence_out
      );
    },

    /**
     * Gets the session prepare pending callback function
     * @public
     * @event JSJaCJingleMuji#get_session_prepare_pending
     * @returns {Function} Session prepare pending callback function
     */
    get_session_prepare_pending: function() {
      return this._shortcut_get_handler(
        this._session_prepare_pending
      );
    },

    /**
     * Gets the session prepare success callback function
     * @public
     * @event JSJaCJingleMuji#get_session_prepare_success
     * @returns {Function} Session prepare success callback function
     */
    get_session_prepare_success: function() {
      return this._shortcut_get_handler(
        this._session_prepare_success
      );
    },

    /**
     * Gets the session prepare error callback function
     * @public
     * @event JSJaCJingleMuji#get_session_prepare_error
     * @returns {Function} Session prepare error callback function
     */
    get_session_prepare_error: function() {
      return this._shortcut_get_handler(
        this._session_prepare_error
      );
    },

    /**
     * Gets the session initiate pending callback function
     * @public
     * @event JSJaCJingleMuji#get_session_initiate_pending
     * @returns {Function} Session initiate pending callback function
     */
    get_session_initiate_pending: function() {
      return this._shortcut_get_handler(
        this._session_initiate_pending
      );
    },

    /**
     * Gets the session initiate success callback function
     * @public
     * @event JSJaCJingleMuji#get_session_initiate_success
     * @returns {Function} Session initiate success callback function
     */
    get_session_initiate_success: function() {
      return this._shortcut_get_handler(
        this._session_initiate_success
      );
    },

    /**
     * Gets the session initiate error callback function
     * @public
     * @event JSJaCJingleMuji#get_session_initiate_error
     * @returns {Function} Session initiate error callback function
     */
    get_session_initiate_error: function() {
      return this._shortcut_get_handler(
        this._session_initiate_error
      );
    },

    /**
     * Gets the session leave pending callback function
     * @public
     * @event JSJaCJingleMuji#get_session_leave_pending
     * @returns {Function} Session leave pending callback function
     */
    get_session_leave_pending: function() {
      return this._shortcut_get_handler(
        this._session_leave_pending
      );
    },

    /**
     * Gets the session leave success callback function
     * @public
     * @event JSJaCJingleMuji#get_session_leave_success
     * @returns {Function} Session leave success callback function
     */
    get_session_leave_success: function() {
      return this._shortcut_get_handler(
        this._session_leave_success
      );
    },

    /**
     * Gets the session leave error callback function
     * @public
     * @event JSJaCJingleMuji#get_session_leave_error
     * @returns {Function} Session leave error callback function
     */
    get_session_leave_error: function() {
      return this._shortcut_get_handler(
        this._session_leave_error
      );
    },

    /**
     * Gets the participant prepare callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_prepare
     * @returns {Function} Participant prepare callback function
     */
    get_participant_prepare: function() {
      return this._shortcut_get_handler(
        this._participant_prepare
      );
    },

    /**
     * Gets the participant initiate callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_initiate
     * @returns {Function} Participant initiate callback function
     */
    get_participant_initiate: function() {
      return this._shortcut_get_handler(
        this._participant_initiate
      );
    },

    /**
     * Gets the participant leave callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_leave
     * @returns {Function} Participant leave callback function
     */
    get_participant_leave: function() {
      return this._shortcut_get_handler(
        this._participant_leave
      );
    },

    /**
     * Gets the participant session initiate pending callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_initiate_pending
     * @returns {Function} Participant session initiate pending callback function
     */
    get_participant_session_initiate_pending: function() {
      return this._shortcut_get_handler(
        this._participant_session_initiate_pending
      );
    },

    /**
     * Gets the participant session initiate success callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_initiate_success
     * @returns {Function} Participant session initiate success callback function
     */
    get_participant_session_initiate_success: function() {
      return this._shortcut_get_handler(
        this._participant_session_initiate_success
      );
    },

    /**
     * Gets the participant session initiate error callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_initiate_error
     * @returns {Function} Participant session initiate error callback function
     */
    get_participant_session_initiate_error: function() {
      return this._shortcut_get_handler(
        this._participant_session_initiate_error
      );
    },

    /**
     * Gets the participant session initiate request callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_initiate_request
     * @returns {Function} Participant session initiate request callback function
     */
    get_participant_session_initiate_request: function() {
      return this._shortcut_get_handler(
        this._participant_session_initiate_request
      );
    },

    /**
     * Gets the participant session accept pending callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_accept_pending
     * @returns {Function} Participant session accept pending callback function
     */
    get_participant_session_accept_pending: function() {
      return this._shortcut_get_handler(
        this._participant_session_accept_pending
      );
    },

    /**
     * Gets the participant session accept success callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_accept_success
     * @returns {Function} Participant session accept success callback function
     */
    get_participant_session_accept_success: function() {
      return this._shortcut_get_handler(
        this._participant_session_accept_success
      );
    },

    /**
     * Gets the participant session accept error callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_accept_error
     * @returns {Function} Participant session accept error callback function
     */
    get_participant_session_accept_error: function() {
      return this._shortcut_get_handler(
        this._participant_session_accept_error
      );
    },

    /**
     * Gets the participant session accept request callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_accept_request
     * @returns {Function} Participant session accept request callback function
     */
    get_participant_session_accept_request: function() {
      return this._shortcut_get_handler(
        this._participant_session_accept_request
      );
    },

    /**
     * Gets the participant session info pending callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_info_pending
     * @returns {Function} Participant session info pending callback function
     */
    get_participant_session_info_pending: function() {
      return this._shortcut_get_handler(
        this._participant_session_info_pending
      );
    },

    /**
     * Gets the participant session info success callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_info_success
     * @returns {Function} Participant session info success callback function
     */
    get_participant_session_info_success: function() {
      return this._shortcut_get_handler(
        this._participant_session_info_success
      );
    },

    /**
     * Gets the participant session info error callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_info_error
     * @returns {Function} Participant session info error callback function
     */
    get_participant_session_info_error: function() {
      return this._shortcut_get_handler(
        this._participant_session_info_error
      );
    },

    /**
     * Gets the participant session info request callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_info_request
     * @returns {Function} Participant session info request callback function
     */
    get_participant_session_info_request: function() {
      return this._shortcut_get_handler(
        this._participant_session_info_request
      );
    },

    /**
     * Gets the participant session terminate pending callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_terminate_pending
     * @returns {Function} Participant session terminate pending callback function
     */
    get_participant_session_terminate_pending: function() {
      return this._shortcut_get_handler(
        this._participant_session_terminate_pending
      );
    },

    /**
     * Gets the participant session terminate success callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_terminate_success
     * @returns {Function} Participant session terminate success callback function
     */
    get_participant_session_terminate_success: function() {
      return this._shortcut_get_handler(
        this._participant_session_terminate_success
      );
    },

    /**
     * Gets the participant session terminate error callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_terminate_error
     * @returns {Function} Participant session terminate error callback function
     */
    get_participant_session_terminate_error: function() {
      return this._shortcut_get_handler(
        this._participant_session_terminate_error
      );
    },

    /**
     * Gets the participant session terminate request callback function
     * @public
     * @event JSJaCJingleMuji#get_participant_session_terminate_request
     * @returns {Function} Participant session terminate request callback function
     */
    get_participant_session_terminate_request: function() {
      return this._shortcut_get_handler(
        this._participant_session_terminate_request
      );
    },

    /**
     * Gets the remote view add callback function
     * @public
     * @event JSJaCJingleMuji#get_add_remote_view
     * @returns {Function} Remote view add callback function
     */
    get_add_remote_view: function() {
      return this._shortcut_get_handler(
        this._add_remote_view
      );
    },

    /**
     * Gets the remote view removal callback function
     * @public
     * @event JSJaCJingleMuji#get_remove_remote_view
     * @returns {Function} Remote view removal callback function
     */
    get_remove_remote_view: function() {
      return this._shortcut_get_handler(
        this._remove_remote_view
      );
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
     * Gets the room password
     * @public
     * @returns {String} Room password
     */
    get_password: function() {
      return this._password;
    },

    /**
     * Gets the password protect state
     * @public
     * @returns {Boolean} Password protect state
     */
    get_password_protect: function() {
      return this._password_protect;
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
     * Gets the instance ID
     * @public
     * @returns {String} IID value
     */
    get_iid: function() {
      return this._iid;
    },

    /**
     * Gets the room owner state
     * @public
     * @returns {Boolean} Room owner state
     */
    get_is_room_owner: function() {
      return this._is_room_owner;
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
     * Sets the participant session initiate pending callback function
     * @private
     * @param {Function} participant_session_initiate_pending
     */
    _set_participant_session_initiate_pending: function(participant_session_initiate_pending) {
      this._participant_session_initiate_pending = participant_session_initiate_pending;
    },

    /**
     * Sets the participant session initiate success callback function
     * @private
     * @param {Function} participant_session_initiate_success
     */
    _set_participant_session_initiate_success: function(participant_session_initiate_success) {
      this._participant_session_initiate_success = participant_session_initiate_success;
    },

    /**
     * Sets the participant session initiate error callback function
     * @private
     * @param {Function} participant_session_initiate_error
     */
    _set_participant_session_initiate_error: function(participant_session_initiate_error) {
      this._participant_session_initiate_error = participant_session_initiate_error;
    },

    /**
     * Sets the participant session initiate request callback function
     * @private
     * @param {Function} participant_session_initiate_request
     */
    _set_participant_session_initiate_request: function(participant_session_initiate_request) {
      this._participant_session_initiate_request = participant_session_initiate_request;
    },

    /**
     * Sets the participant session accept pending callback function
     * @private
     * @param {Function} participant_session_accept_pending
     */
    _set_participant_session_accept_pending: function(participant_session_accept_pending) {
      this._participant_session_accept_pending = participant_session_accept_pending;
    },

    /**
     * Sets the participant session accept success callback function
     * @private
     * @param {Function} participant_session_accept_success
     */
    _set_participant_session_accept_success: function(participant_session_accept_success) {
      this._participant_session_accept_success = participant_session_accept_success;
    },

    /**
     * Sets the participant session accept error callback function
     * @private
     * @param {Function} participant_session_accept_error
     */
    _set_participant_session_accept_error: function(participant_session_accept_error) {
      this._participant_session_accept_error = participant_session_accept_error;
    },

    /**
     * Sets the participant session accept request callback function
     * @private
     * @param {Function} participant_session_accept_request
     */
    _set_participant_session_accept_request: function(participant_session_accept_request) {
      this._participant_session_accept_request = participant_session_accept_request;
    },

    /**
     * Sets the participant session info pending callback function
     * @private
     * @param {Function} participant_session_info_pending
     */
    _set_participant_session_info_pending: function(participant_session_info_pending) {
      this._participant_session_info_pending = participant_session_info_pending;
    },

    /**
     * Sets the participant session info success callback function
     * @private
     * @param {Function} participant_session_info_success
     */
    _set_participant_session_info_success: function(participant_session_info_success) {
      this._participant_session_info_success = participant_session_info_success;
    },

    /**
     * Sets the participant session info error callback function
     * @private
     * @param {Function} participant_session_info_error
     */
    _set_participant_session_info_error: function(participant_session_info_error) {
      this._participant_session_info_error = participant_session_info_error;
    },

    /**
     * Sets the participant session info request callback function
     * @private
     * @param {Function} participant_session_info_request
     */
    _set_participant_session_info_request: function(participant_session_info_request) {
      this._participant_session_info_request = participant_session_info_request;
    },

    /**
     * Sets the participant session terminate pending callback function
     * @private
     * @param {Function} participant_session_terminate_pending
     */
    _set_participant_session_terminate_pending: function(participant_session_terminate_pending) {
      this._participant_session_terminate_pending = participant_session_terminate_pending;
    },

    /**
     * Sets the participant session terminate success callback function
     * @private
     * @param {Function} participant_session_terminate_success
     */
    _set_participant_session_terminate_success: function(participant_session_terminate_success) {
      this._participant_session_terminate_success = participant_session_terminate_success;
    },

    /**
     * Sets the participant session terminate error callback function
     * @private
     * @param {Function} participant_session_terminate_error
     */
    _set_participant_session_terminate_error: function(participant_session_terminate_error) {
      this._participant_session_terminate_error = participant_session_terminate_error;
    },

    /**
     * Sets the participant session terminate request callback function
     * @private
     * @param {Function} participant_session_terminate_request
     */
    _set_participant_session_terminate_request: function(participant_session_terminate_request) {
      this._participant_session_terminate_request = participant_session_terminate_request;
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
     * @param {Object} data_obj
     */
    _set_participants: function(username, data_obj) {
      if(username === null) {
        this._participants = {};
      } else if(data_obj === null) {
        if(username in this._participants)
          delete this._participants[username];
      } else if(username) {
        this._participants[username] = data_obj;
      }
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
     * Sets the room password
     * @private
     * @param {String} password
     */
    _set_password: function(password) {
      this._password = password;
    },

    /**
     * Sets the password protect state
     * @private
     * @param {Boolean} password_protect
     */
    _set_password_protect: function(password_protect) {
      this._password_protect = password_protect;
    },

    /**
     * Sets the instance ID
     * @private
     * @param {String} iid
     */
    _set_iid: function(iid) {
      this._iid = iid;
    },

    /**
     * Sets the room owner state
     * @private
     * @param {Boolean} is_room_owner
     */
    _set_is_room_owner: function(is_room_owner) {
      this._is_room_owner = is_room_owner;
    },
  }
);