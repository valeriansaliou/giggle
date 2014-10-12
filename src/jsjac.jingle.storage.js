/**
 * @fileoverview JSJaC Jingle library - Storage layer
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla private License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/storage */
/** @exports JSJaCJingleStorage */


/**
 * Storage layer wrapper.
 * @instance
 * @requires   nicolas-van/ring.js
 * @requires   jsjac-jingle/constants
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://stefan-strigler.de/jsjac-1.3.4/doc/|JSJaC Documentation}
 */
var JSJaCJingleStorage = new (ring.create(
  /** @lends JSJaCJingleStorage.prototype */
  {
    /**
     * Constructor
     */
    constructor: function() {
      /**
       * JSJAC JINGLE STORAGE
       */

      /**
       * @member {JSJaCConnection}
       * @default
       * @private
       */
      this._connection = null;

      /**
       * @type {Object}
       * @default
       * @private
       */
      this._sessions                               = {};
      this._sessions[JSJAC_JINGLE_SESSION_SINGLE]  = {};
      this._sessions[JSJAC_JINGLE_SESSION_MUJI]    = {};

      /**
       * @type {Object}
       * @default
       * @private
       */
      this._broadcast_ids                          = {};

      /**
       * @type {Function}
       * @default
       * @private
       */
      this._single_initiate = undefined;

      /**
       * @type {Function}
       * @default
       * @private
       */
      this._single_prepare = undefined;

      /**
       * @type {Function}
       * @default
       * @private
       */
      this._single_proceed = undefined;

      /**
       * @type {Function}
       * @default
       * @private
       */
      this._single_reject = undefined;

      /**
       * @type {Function}
       * @default
       * @private
       */
      this._muji_invite     = undefined;

      /**
       * @type {Object}
       * @default
       * @private
       */
      this._debug      = {
        log : function() {}
      };

      /**
       * @type {Object}
       * @default
       * @private
       */
      this._extdisco   = {
        stun : [],
        turn : []
      };

      /**
       * @type {Object}
       * @default
       * @private
       */
      this._fallback   = {
        stun : [],
        turn : []
      };

      /**
       * @type {Object}
       * @default
       * @private
       */
      this._relaynodes = {
        stun  : []
      };

      /**
       * @type {Object}
       * @default
       * @private
       */
      this._defer      = {
        deferred : false,
        count    : 0,
        fn       : []
      };
    },



    /**
     * JSJSAC JINGLE STORAGE GETTERS
     */

    /**
     * Gets the connection object
     * @public
     * @returns {JSJaCConnection} Connection
     */
    get_connection: function() {
      return this._connection;
    },

    /**
     * Gets the sessions storage
     * @public
     * @returns {Object} Sessions
     */
    get_sessions: function() {
      return this._sessions;
    },

    /**
     * Gets the broadcast_ids storage
     * @public
     * @returns {Object} Broadcast ID medias
     */
    get_broadcast_ids: function(id) {
      if(id in this._broadcast_ids)
        return this._broadcast_ids[id];

      return null;
    },

    /**
     * Gets the Single initiate function
     * @public
     * @returns {Function} Single initiate
     */
    get_single_initiate: function() {
      if(typeof this._single_initiate == 'function')
        return this._single_initiate;

      return function(stanza) {};
    },

    /**
     * Gets the Single initiate raw value
     * @public
     * @returns {Function} Single initiate raw value
     */
    get_single_initiate_raw: function() {
      return this._single_initiate;
    },

    /**
     * Gets the Single prepare function
     * @public
     * @returns {Function} Single prepare
     */
    get_single_prepare: function() {
      if(typeof this._single_prepare == 'function')
        return this._single_prepare;

      return function(stanza) {};
    },

    /**
     * Gets the Single proceed function
     * @public
     * @returns {Function} Single proceed
     */
    get_single_proceed: function() {
      if(typeof this._single_proceed == 'function')
        return this._single_proceed;

      return function(stanza) {};
    },

    /**
     * Gets the Single reject function
     * @public
     * @returns {Function} Single reject
     */
    get_single_reject: function() {
      if(typeof this._single_reject == 'function')
        return this._single_reject;

      return function(stanza) {};
    },

    /**
     * Gets the Muji invite function
     * @public
     * @returns {Function} Muji invite
     */
    get_muji_invite: function() {
      if(typeof this._muji_invite == 'function')
        return this._muji_invite;

      return function(stanza) {};
    },

    /**
     * Gets the Muji invite raw value
     * @public
     * @returns {Function} Muji invite raw value
     */
    get_muji_invite_raw: function() {
      return this._muji_invite;
    },

    /**
     * Gets the debug interface
     * @public
     * @returns {Object} Debug
     */
    get_debug: function() {
      return this._debug;
    },

    /**
     * Gets the extdisco storage
     * @public
     * @returns {Object} Extdisco
     */
    get_extdisco: function() {
      return this._extdisco;
    },

    /**
     * Gets the fallback storage
     * @public
     * @returns {Object} Fallback
     */
    get_fallback: function() {
      return this._fallback;
    },

    /**
     * Gets the relay nodes storage
     * @public
     * @returns {Object} Relay nodes
     */
    get_relaynodes: function() {
      return this._relaynodes;
    },

    /**
     * Gets the defer storage
     * @public
     * @returns {Object} Defer
     */
    get_defer: function() {
      return this._defer;
    },



    /**
     * JSJSAC JINGLE STORAGE SETTERS
     */

    /**
     * Sets the connection object
     * @public
     * @param {JSJaCConnection} Connection
     */
    set_connection: function(connection) {
      this._connection = connection;
    },

    /**
     * Sets the sessions storage
     * @public
     * @param {Object} sessions
     */
    set_sessions: function(sessions) {
      this._sessions = sessions;
    },

    /**
     * Sets the broadcast IDs storage
     * @public
     * @param {String} id
     * @param {Object} medias
     * @param {Boolean} [proceed_unset]
     */
    set_broadcast_ids: function(id, medias, proceed_unset) {
      this._broadcast_ids[id] = medias;

      if(proceed_unset === true && id in this._broadcast_ids)
        delete this._broadcast_ids[id];
    },

    /**
     * Sets the Single initiate function
     * @public
     * @param {Function} Single initiate
     */
    set_single_initiate: function(single_initiate) {
      this._single_initiate = single_initiate;
    },

    /**
     * Sets the Single prepare function
     * @public
     * @param {Function} Single prepare
     */
    set_single_prepare: function(single_prepare) {
      this._single_prepare = single_prepare;
    },

    /**
     * Sets the Single proceed function
     * @public
     * @param {Function} Single proceed
     */
    set_single_proceed: function(single_proceed) {
      this._single_proceed = single_proceed;
    },

    /**
     * Sets the Single reject function
     * @public
     * @param {Function} Single reject
     */
    set_single_reject: function(single_reject) {
      this._single_reject = single_reject;
    },

    /**
     * Sets the Muji invite function
     * @public
     * @param {Function} Muji invite
     */
    set_muji_invite: function(muji_invite) {
      this._muji_invite = muji_invite;
    },

    /**
     * Sets the debug interface
     * @public
     * @param {Object} Debug
     */
    set_debug: function(debug) {
      this._debug = debug;
    },

    /**
     * Sets the extdisco storage
     * @public
     * @param {Object} Extdisco
     */
    set_extdisco: function(extdisco) {
      this._extdisco = extdisco;
    },

    /**
     * Sets the fallback storage
     * @public
     * @param {Object} Fallback
     */
    set_fallback: function(fallback) {
      this._fallback = fallback;
    },

    /**
     * Sets the relay nodes storage
     * @public
     * @param {Object} Relay nodes
     */
    set_relaynodes: function(relaynodes) {
      this._relaynodes = relaynodes;
    },

    /**
     * Sets the defer storage
     * @public
     * @param {Object} Defer
     */
    set_defer: function(defer) {
      this._defer = defer;
    },
  }
))();
