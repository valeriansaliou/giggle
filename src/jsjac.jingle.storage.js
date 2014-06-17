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
       * @type {Function}
       * @default
       * @private
       */
      this._initiate   = function(stanza) {};

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
     * JSJSAC JINGLE GETTERS
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
     * Gets the initiate function
     * @public
     * @returns {Function} Initiate
     */
    get_initiate: function() {
      return this._initiate;
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
     * JSJSAC JINGLE SETTERS
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
     * Sets the initiate function
     * @public
     * @param {Function} Initiate
     */
    set_initiate: function(initiate) {
      this._initiate = initiate;
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