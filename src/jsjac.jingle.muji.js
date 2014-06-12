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
 * @class Depends on JSJaCJingle() base class (needs to instantiate it)
 * @constructor
 * @param {Object} args Jingle session arguments.
 * @param {*} args.* Herits of JSJaCJingle() prototype
 * @param {function} args.room_message The incoming message custom handler.
 * @param {function} args.session_prepare The room join custom handler.
 * @param {function} args.session_initiate The room initiate custom handler.
 * @param {function} args.session_leave The room leave custom handler.
 * @param {function} args.participant_join The participant join custom handler.
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

    if(args && args.room_message)
      /**
       * @private
       */
      this._room_message = args.room_message;

    if(args && args.session_prepare)
      /**
       * @private
       */
      this._session_prepare = args.session_prepare;

    if(args && args.session_initiate)
      /**
       * @private
       */
      this._session_initiate = args.session_initiate;

    if(args && args.session_leave)
      /**
       * @private
       */
      this._session_leave = args.session_leave;

    if(args && args.participant_join)
      /**
       * @private
       */
      this._participant_join = args.participant_join;

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
  },


  /**
   * Initiates a new Jingle session.
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

      // Send initial join presence
      this.send_presence({ action: JSJAC_JINGLE_MUJI_STATUS_PREPARE });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] join > ' + e, 1);
    }
  },


  /**
   * Leaves current Jingle session.
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
      if(this.get_status() == JSJAC_JINGLE_STATUS_TERMINATED) {
        this.get_debug().log('[JSJaCJingle:muji] leave > Cannot terminate, resource already terminated (status: ' + this.get_status() + ').', 0);
        return;
      }

      // Leave the room
      this.send_presence({ action: JSJAC_JINGLE_MUJI_STATUS_LEAVE });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] leave > ' + e, 1);
    }
  },

  /**
   * Sends a given Muji presence stanza
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

      if(JSJaCJingle.defer(function() { _this.send(type, args); })) {
        this.get_debug().log('[JSJaCJingle:muji] send_presence > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Assert
      if(typeof args !== 'object') args = {};

      // Build stanza
      var stanza = new JSJaCPresence();
      stanza.setTo(this.get_to());

      // Submit to registered handler
      switch(args.action) {
        case JSJAC_JINGLE_MUJI_STATUS_PREPARE:
          this.send_session_prepare(stanza); break;

        case JSJAC_JINGLE_MUJI_STATUS_INITIATE:
          this.send_session_initiate(stanza); break;

        case JSJAC_JINGLE_MUJI_STATUS_LEAVE:
          this.send_session_leave(stanza); break;

        default:
          this.get_debug().log('[JSJaCJingle:muji] send_presence > Unexpected error.', 1);

          return false;
      }

      JSJAC_JINGLE_STORE_CONNECTION.send(stanza);

      if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:muji] Outgoing packet sent' + '\n\n' + stanza.xml());

      return true;
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] send > ' + e, 1);
    }

    return false;
  },

  /**
   * Sends a given Muji message stanza
   */
  send_message: function(body) {
    this.get_debug().log('[JSJaCJingle:muji] send_message', 4);

    try {
      // TODO

      return true;
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] send_message > ' + e, 1);
    }

    return false;
  },

  /**
   * Handles a Muji presence stanza
   */
  handle_presence: function(stanza) {
    this.get_debug().log('[JSJaCJingle:muji] handle_presence', 4);

    try {
      if(this.get_net_trace())  this.get_debug().log('[JSJaCJingle:muji] Incoming packet received' + '\n\n' + stanza.xml());

      // Locked?
      if(this.get_lock()) {
        this.get_debug().log('[JSJaCJingle:muji] handle_presence > Cannot handle, resource locked. Please open another session or check WebRTC support.', 0);
        return;
      }

      // Defer?
      var _this = this;

      if(JSJaCJingle.defer(function() { _this.handle(stanza); })) {
        this.get_debug().log('[JSJaCJingle:muji] handle_presence > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      if(stanza.getType() == JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE) {
        this.handle_participant_left(stanza);
      } else {
        var muji = this.utils.stanza_muji(stanza);

        // Don't handle non-Muji stanzas there...
        if(!muji) return;

        // Submit to registered handler
        if(this.stanza_has_preparing(muji)) {
          this.handle_participant_preparing(stanza);
        } else if(this.stanza_has_content(muji)) {
          this.handle_participant_initiating(stanza);
        } else {
          if(this.stanza_from_participant(stanza)) {
            this.handle_participant_terminating(stanza);
          } else {
            this.handle_participant_joining(stanza);
          }
        }
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] handle_presence > ' + e, 1);
    }
  },

  /**
   * Handles a Muji message stanza
   */
  handle_message: function(stanza) {
    this.get_debug().log('[JSJaCJingle:muji] handle_message', 4);

    try {
      // TODO: only for use by the user custom callbacks (route message)

      // Trigger handle message custom callback
      (this.get_room_message())(this, stanza);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] handle_message > ' + e, 1);
    }
  },



  /**
   * JSJSAC JINGLE MUJI SENDERS
   */

  /**
   * Sends the session prepare event.
   */
  send_session_prepare: function(stanza) {
    this.get_debug().log('[JSJaCJingle:muji] send_session_prepare', 4);

    try {
      if(this.get_status() === JSJAC_JINGLE_MUJI_STATUS_PREPARE   || 
         this.get_status() === JSJAC_JINGLE_MUJI_STATUS_INITIATE  ||
         this.get_status() === JSJAC_JINGLE_MUJI_STATUS_LEAVE) {
        this.get_debug().log('[JSJaCJingle:muji] send_session_prepare > Cannot send prepare stanza, resource already prepared or initiated or left (status: ' + this.get_status() + ').', 0);
        return;
      }

      // Build Muji stanza
      var muji = this.utils.stanza_generate_muji(stanza);
      muji.appendChild(stanza.buildNode('preparing', { 'xmlns': NS_TELEPATHY_MUJI }));

      this.get_debug().log('[JSJaCJingle:muji] send_session_prepare > Sent.', 2);

      // Trigger session prepare custom callback
      (this.get_session_prepare())(this);

      // Change session status
      this.set_status(JSJAC_JINGLE_MUJI_STATUS_PREPARE);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] send_session_prepare > ' + e, 1);
    }
  },

  /**
   * Sends the session initiate event.
   */
  send_session_initiate: function(stanza) {
    this.get_debug().log('[JSJaCJingle:muji] send_session_initiate', 4);

    try {
      if(this.get_status() !== JSJAC_JINGLE_MUJI_STATUS_PREPARE) {
        this.get_debug().log('[JSJaCJingle:muji] send_session_prepare > Cannot send prepare stanza, resource not prepared (status: ' + this.get_status() + ').', 0);
        return;
      }

      // Build Muji stanza
      var muji = this.utils.stanza_generate_muji(stanza);

      this.utils.stanza_generate_content_local(stanza, muji);
      this.utils.stanza_generate_group_local(stanza, muji);

      this.get_debug().log('[JSJaCJingle:muji] send_session_prepare > Sent.', 2);

      // Trigger session session initiate custom callback
      (this.get_session_initiate())(this);

      // Change session status
      this.set_status(JSJAC_JINGLE_MUJI_STATUS_INITIATE);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] send_session_initiate > ' + e, 1);
    }
  },

  /**
   * Sends the session leave event.
   */
  send_session_leave: function(stanza) {
    this.get_debug().log('[JSJaCJingle:muji] send_session_leave', 4);

    try {
      stanza.setType(JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE);

      // Change session status
      this.set_status(JSJAC_JINGLE_MUJI_STATUS_LEAVE);

      // Trigger session leave custom callback
      (this.get_session_leave())(this);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] send_session_leave > ' + e, 1);
    }
  },



  /**
   * JSJSAC JINGLE MUJI HANDLERS
   */

  /**
   * Handles the room join event.
   */
  handle_room_join: function() {
    this.get_debug().log('[JSJaCJingle:muji] handle_room_join', 4);

    try {
      // Initialize WebRTC
      this.peer.get_user_media(function() {
        _this.peer.connection_create(function() {
          _this.get_debug().log('[JSJaCJingle:muji] handle_room_join > Ready to begin Jingle negotiation.', 2);

          _this.send_presence({ action: JSJAC_JINGLE_MUJI_STATUS_INITIATE });
        });
      });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] handle_room_join > ' + e, 1);
    }
  },

  /**
   * Handles the room leave event.
   */
  handle_room_leave: function() {
    this.get_debug().log('[JSJaCJingle:muji] handle_room_leave', 4);

    try {
      // TODO
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] handle_room_leave > ' + e, 1);
    }
  },

  /**
   * Handles the participant preparing event.
   */
  handle_participant_preparing: function(stanza) {
    this.get_debug().log('[JSJaCJingle:muji] handle_participant_preparing', 4);

    try {
      var username = this.extract_stanza_username(stanza);

      var participant_obj = {
        state: null,
        media: null,

        content: null,
        remote_video: null
      };

      this._set_participants(username, participant_obj);

      // TODO
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] handle_participant_preparing > ' + e, 1);
    }
  },

  /**
   * Handles the participant initiating event.
   */
  handle_participant_initiating: function(stanza) {
    this.get_debug().log('[JSJaCJingle:muji] handle_participant_initiating', 4);

    try {
      var username = this.extract_stanza_username(stanza);
      
      // TODO: create WebRTC peer connection
      // TODO: update participant storage
      // TODO: add participant to DOM (once PeerConnection stram starts flowing)
        // TODO: trigger participant leave user-defined callback
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] handle_participant_initiating > ' + e, 1);
    }
  },

  /**
   * Handles the participant terminating event.
   */
  handle_participant_terminating: function(stanza) {
    this.get_debug().log('[JSJaCJingle:muji] handle_participant_terminating', 4);

    try {
      var username = this.extract_stanza_username(stanza);
      
      // TODO: stop WebRTC stream
      // TODO: remove participant from storage
      // TODO: remove participant from DOM
        // TODO: trigger participant leave user-defined callback
      // TODO: if no more participant, close videochat
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] handle_participant_terminating > ' + e, 1);
    }
  },

  /**
   * Handles the participant joining event.
   */
  handle_participant_joining: function(stanza) {
    this.get_debug().log('[JSJaCJingle:muji] handle_participant_joining', 4);

    try {
      var username = this.extract_stanza_username(stanza);
      
      // TODO
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] handle_participant_joining > ' + e, 1);
    }
  },



  /**
   * JSJSAC JINGLE STANZA PARSERS
   */

  /**
   * Returns whether user is preparing or not
   * @param {object} muji
   * @returns {boolean} preparing state
   */
  stanza_has_preparing: function(muji) {
    return muji.getChild('preparing', NS_TELEPATHY_MUJI) && true;
  },

  /**
   * Returns whether user has content or not
   * @param {object} muji
   * @returns {boolean} content state
   */
  stanza_has_content: function(muji) {
    return muji.getChild('content', NS_TELEPATHY_MUJI) && true;
  },



  /**
   * JSJSAC JINGLE MUJI GETTERS
   */

  /**
   * Gets the participants object
   * @returns {object} participants object
   */
  get_participants: function(username) {
    if(username && typeof username == 'string') {
      if(username in this._participants)
        return this._participants[username];
      return null;
    }

    return this._participants;
  },

  /**
   * Gets the creator value
   * @returns {string} creator value
   */
  get_creator: function() {
    return this.get_to();
  },

  /**
   * Gets the initiator value
   * @returns {string} initiator value
   */
  get_initiator: function() {
    return this.get_to();
  },

  /**
   * Gets the responder value
   * @returns {string} responder value
   */
  get_responder: function() {
    return this.get_to();
  },

  /**
   * Gets the room message callback function
   * @returns {function} remote view add callback function
   */
  get_room_message: function() {
    if(typeof this._room_message == 'function')
      return this._room_message;

    return function() {};
  },

  /**
   * Gets the session prepare callback function
   * @returns {function} remote view add callback function
   */
  get_session_prepare: function() {
    if(typeof this._session_prepare == 'function')
      return this._session_prepare;

    return function() {};
  },

  /**
   * Gets the session initiate callback function
   * @returns {function} remote view add callback function
   */
  get_session_initiate: function() {
    if(typeof this._session_initiate == 'function')
      return this._session_initiate;

    return function() {};
  },

  /**
   * Gets the session leave callback function
   * @returns {function} remote view add callback function
   */
  get_session_leave: function() {
    if(typeof this._session_leave == 'function')
      return this._session_leave;

    return function() {};
  },

  /**
   * Gets the participant join callback function
   * @returns {function} remote view add callback function
   */
  get_participant_join: function() {
    if(typeof this._participant_join == 'function')
      return this._participant_join;

    return function() {};
  },

  /**
   * Gets the participant initiate callback function
   * @returns {function} remote view add callback function
   */
  get_participant_initiate: function() {
    if(typeof this._participant_initiate == 'function')
      return this._participant_initiate;

    return function() {};
  },

  /**
   * Gets the participant leave callback function
   * @returns {function} remote view add callback function
   */
  get_participant_leave: function() {
    if(typeof this._participant_leave == 'function')
      return this._participant_leave;

    return function() {};
  },

  /**
   * Gets the remote view add callback function
   * @returns {function} remote view add callback function
   */
  get_add_remote_view: function() {
    if(typeof this._add_remote_view == 'function')
      return this._add_remote_view;

    return function() {};
  },

  /**
   * Gets the remote view removal callback function
   * @returns {function} remote view removal callback function
   */
  get_remove_remote_view: function() {
    if(typeof this._remove_remote_view == 'function')
      return this._remove_remote_view;

    return function() {};
  },



  /**
   * JSJSAC JINGLE MUJI SETTERS
   */

  /**
   * Sets the participants object
   * @private
   * @returns {object} participants object
   */
  _set_participants: function(username, value) {
    if(!(username in this._participants))  this._participants[username] = {};

    if(typeof value == 'object')
      this._participants[username] = value;
    else if(value === null)
      delete this._participants[username];
  },



  /**
   * JSJSAC JINGLE SHORTCUTS
   */

  /**
   * Returns whether stanza is from a participant or not
   * @public
   * @returns {boolean} Receiver state
   */
  stanza_from_participant: function(stanza) {
    var username = this.extract_stanza_username();
    return (typeof self.get_participants(username) == 'object') && true;
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
});
