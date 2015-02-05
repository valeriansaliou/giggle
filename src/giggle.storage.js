/**
 * @fileoverview Giggle library - Storage layer
 *
 * @url https://github.com/valeriansaliou/giggle
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla private License v2.0 (MPL v2.0)
 */


/** @module giggle/storage */
/** @exports GiggleStorage */


/**
 * Storage layer wrapper.
 * @instance
 * @requires   nicolas-van/ring.js
 * @requires   giggle/constants
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://stefan-strigler.de/jsjac-1.3.4/doc/|JSJaC Documentation}
 */
var GiggleStorage = new (ring.create(
  /** @lends GiggleStorage.prototype */
  {
    /**
     * Constructor
     */
    constructor: function() {
      /**
       * GIGGLE STORAGE
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
      this._sessions[GIGGLE_SESSION_SINGLE]  = {};
      this._sessions[GIGGLE_SESSION_MUJI]    = {};

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
      this._single_propose = undefined;

      /**
       * @type {Function}
       * @default
       * @private
       */
      this._single_retract = undefined;

      /**
       * @type {Function}
       * @default
       * @private
       */
      this._single_accept = undefined;

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
      this._single_proceed = undefined;

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
     * Gets the Single propose function
     * @public
     * @returns {Function} Single propose
     */
    get_single_propose: function() {
      if(typeof this._single_propose == 'function')
        return this._single_propose;

      return function(stanza) {};
    },

    /**
     * Gets the Single retract function
     * @public
     * @returns {Function} Single retract
     */
    get_single_retract: function() {
      if(typeof this._single_retract == 'function')
        return this._single_retract;

      return function(stanza) {};
    },

    /**
     * Gets the Single accept function
     * @public
     * @returns {Function} Single accept
     */
    get_single_accept: function() {
      if(typeof this._single_accept == 'function')
        return this._single_accept;

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
     * Sets the Single propose function
     * @public
     * @param {Function} Single propose
     */
    set_single_propose: function(single_propose) {
      this._single_propose = single_propose;
    },

    /**
     * Sets the Single retract function
     * @public
     * @param {Function} Single retract
     */
    set_single_retract: function(single_retract) {
      this._single_retract = single_retract;
    },

    /**
     * Sets the Single accept function
     * @public
     * @param {Function} Single accept
     */
    set_single_accept: function(single_accept) {
      this._single_accept = single_accept;
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
     * Sets the Single proceed function
     * @public
     * @param {Function} Single proceed
     */
    set_single_proceed: function(single_proceed) {
      this._single_proceed = single_proceed;
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
