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
  constructor: function(args) {
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
      if(JSJaCJingle.defer(function() { this.join(); })) {
        this.get_debug().log('[JSJaCJingle:muji] join > Deferred (waiting for the library components to be initiated).', 0);
        return;
      }

      // Slot unavailable?
      if(this.get_status() != JSJAC_JINGLE_STATUS_INACTIVE) {
        this.get_debug().log('[JSJaCJingle:muji] join > Cannot join, resource not inactive (status: ' + this.get_status() + ').', 0);
        return;
      }

      this.get_debug().log('[JSJaCJingle:muji] join > New Jingle Muji session with media: ' + this.get_media(), 2);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:muji] join > ' + e, 1);
    }
  },



  /**
   * JSJSAC JINGLE MUJI GETTERS
   */

  /**
   * @private
   */
  get_add_remote_view: function() {
    if(typeof this._add_remote_view == 'function')
      return this._add_remote_view;

    return function() {};
  },

  /**
   * @private
   */
  get_remove_remote_view: function() {
    if(typeof this._remove_remote_view == 'function')
      return this._remove_remote_view;

    return function() {};
  },
});
