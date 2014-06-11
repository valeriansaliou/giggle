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
 * @param {function} args.add_remote_view The remote view media add (audio/video) custom handler.
 * @param {function} args.remove_remote_view The remote view media removal (audio/video) custom handler.
 */
var JSJaCJingleMuji = ring.create([__JSJaCJingleBase], {
  /**
   * Constructor
   */
  constructor: function(args) {
    this.$super(args);

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

      // Trigger init pending custom callback
      (this.get_session_initiate_pending())(this);

      // Change session status
      this.set_status(JSJAC_JINGLE_STATUS_INITIATING);

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
      JSJaCJingle.add(this.get_sid(), this);

      // Initialize WebRTC
      var _this = this;

      this.peer.get_user_media(function() {
        _this.peer.connection_create(function() {
          _this.get_debug().log('[JSJaCJingle:single] initiate > Ready to begin Jingle negotiation.', 2);

          _this.send(JSJAC_JINGLE_STANZA_TYPE_SET, { action: JSJAC_JINGLE_ACTION_SESSION_INITIATE });
        });
      });
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] join > ' + e, 1);
    }
  },



  /**
   * JSJSAC JINGLE MUJI GETTERS
   */

  /**
   * Gets the creator value
   * @return creator value
   * @type string
   */
  get_creator: function() {
    return this.get_to();
  },

  /**
   * Gets the initiator value
   * @return initiator value
   * @type string
   */
  get_initiator: function() {
    return this.get_to();
  },

  /**
   * Gets the responder value
   * @return responder value
   * @type string
   */
  get_responder: function() {
    return this.get_to();
  },

  /**
   * Gets the remote view add callback function
   */
  get_add_remote_view: function() {
    if(typeof this._add_remote_view == 'function')
      return this._add_remote_view;

    return function() {};
  },

  /**
   * Gets the remote view removal callback function
   */
  get_remove_remote_view: function() {
    if(typeof this._remove_remote_view == 'function')
      return this._remove_remote_view;

    return function() {};
  },
});
