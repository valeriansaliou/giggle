/**
 * @fileoverview Giggle library - Pluggability to other network libs
 *
 * @url https://github.com/valeriansaliou/giggle
 * @author Valérian Saliou https://valeriansaliou.name/
 *
 * @copyright 2015, Hakuma Holdings Ltd.
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module giggle/plug */
/** @exports __GigglePlug */


/**
 * Plugger class.
 * @class
 * @classdesc  Plugger class.
 * @requires   nicolas-van/ring.js
 * @requires   giggle/main
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @param      {Object}   [args]              - Plug arguments.
 * @property   {Object}   [args.connection]   - The connection to be attached to.
 * @property   {Console}  [args.debug]        - A reference to a debugger implementing the Console interface.
 */
var __GigglePlug = ring.create(
  /** @lends __GigglePlug.prototype */
  {
    /**
     * Constructor
     */
    constructor: function(args) {
      if(args && args.connection) {
        /**
         * @constant
         * @member {Object}
         * @default
         * @private
         */
        this._connection = args.connection;
      } else {
        /**
         * @constant
         * @member {Object}
         * @default
         * @private
         */
        this._connection = GiggleStorage.get_connection();
      }

      if(args && args.debug && args.debug.log) {
        /**
         * @member {Console}
         * @default
         * @private
         */
        this._debug = args.debug;
      } else {
        /**
         * @member {Function}
         * @default
         * @private
         */
        this._debug = GiggleStorage.get_debug();
      }

      /**
       * @constant
       * @member {Object}
       * @default
       * @private
       */
      this._node   = null;

      /**
       * @constant
       * @member {Object}
       * @default
       * @private
       */
      this._packet = null;
    },



    /**
     * GIGGLE PLUG BUILDERS
     */

    /**
     * Builds a message packet
     * @public
     * @returns {__GigglePlug} Constructed object
     */
    message: function() {
      this.get_debug().log('[giggle:plug] message > Method not implemented.', 1);
    },

    /**
     * Builds a presence packet
     * @public
     * @returns {__GigglePlug} Constructed object
     */
    presence: function() {
      this.get_debug().log('[giggle:plug] presence > Method not implemented.', 1);
    },

    /**
     * Builds an IQ packet
     * @public
     * @returns {__GigglePlug} Constructed object
     */
    iq: function() {
      this.get_debug().log('[giggle:plug] iq > Method not implemented.', 1);
    },

    /**
     * Builds the packet with passed elements
     * @public
     * @param   {String} name
     * @param   {String} [value]
     * @returns {__GigglePlug} Packet object
     */
    build: function(object) {
      /* @example
       * [
       *   {'element_name': {
       *     e: [
       *       // Sub elements
       *     ],
       *
       *     a: {
       *       'attribute_name': 'attribute_value'
       *     }
       *   }}
       * ]
       */

      this.get_debug().log('[giggle:plug] build > Method not implemented.', 1);
    },



    /**
     * GIGGLE PLUG MODIFIERS
     */

    /**
     * Sets an attribute on an element
     * @public
     * @param   {String} name
     * @param   {String} [value]
     * @returns {__GigglePlug} Packet object
     */
    attribute: function(name, value) {
      this.get_debug().log('[giggle:plug] attribute > Method not implemented.', 1);
    },

    /**
     * Sets/gets an element value
     * @public
     * @param   {String} element
     * @param   {String} [value]
     * @returns {__GigglePlug} Packet object
     */
    element: function(element, value) {
      this.get_debug().log('[giggle:plug] element > Method not implemented.', 1);
    },



    /**
     * Gets or sets the 'to' attribute
     * @public
     * @param   {String} [to]
     * @returns {String} 'to' value
     */
    to: function(to) {
      try {
        if(typeof to != 'undefined') {
          return this.attribute('to', to);
        }

        return this.attribute('to');
      } catch(e) {
        this.get_debug().log('[giggle:plug] to > ' + e, 1);
      }
    },

    /**
     * Gets or sets the 'from' attribute
     * @public
     * @param   {String} [from]
     * @returns {String} 'from' value
     */
    from: function(from) {
      try {
        if(typeof from != 'undefined') {
          return this.attribute('to', from);
        }

        return this.attribute('to');
      } catch(e) {
        this.get_debug().log('[giggle:plug] to > ' + e, 1);
      }
    },

    /**
     * Gets or sets the 'type' attribute
     * @public
     * @param   {String} [type]
     * @returns {String} 'type' value
     */
    type: function(type) {
      try {
        if(typeof type != 'undefined') {
          return this.attribute('to', type);
        }

        return this.attribute('to');
      } catch(e) {
        this.get_debug().log('[giggle:plug] to > ' + e, 1);
      }
    },

    /**
     * Gets or sets the 'id' attribute
     * @public
     * @param   {String} [id]
     * @returns {String} 'id' value
     */
    id: function(id) {
      try {
        if(typeof id != 'undefined') {
          return this.attribute('to', id);
        }

        return this.attribute('to');
      } catch(e) {
        this.get_debug().log('[giggle:plug] to > ' + e, 1);
      }
    },

    /**
     * Gets or sets the 'body' element content
     * @public
     * @param   {String} [body]
     * @returns {String} 'body' value
     */
    body: function(body) {
      try {
        if(typeof body != 'undefined') {
          return this.element('body', body);
        }

        return this.element('body');
      } catch(e) {
        this.get_debug().log('[giggle:plug] to > ' + e, 1);
      }
    },



    /**
     * GIGGLE PLUG SERIALIZERS
     */

    /**
     * Serializes the packet object to raw XML data
     * @public
     * @returns {String} Raw XML data
     */
    xml: function() {
      this.get_debug().log('[giggle:plug] xml > Method not implemented.', 1);
    },



    /**
     * GIGGLE PLUG HELPERS
     */

    /**
     * Selects an object in the existing node tree
     * @public
     * @param {String} name
     * @param {String} ns
     * @returns {__GigglePlug} Selected object
     */
    select: function(name, ns) {
      this.get_debug().log('[giggle:plug] select > Method not implemented.', 1);
    },

    /**
     * Sends the packet
     * @public
     * @param {...Function} [callback]
     */
    send: function(callback) {
      this.get_debug().log('[giggle:plug] send > Method not implemented.', 1);
    },



    /**
     * GIGGLE PLUG GETTERS
     */

    /**
     * Gets the connection value
     * @public
     * @returns {Object} Connection value
     */
    get_connection: function() {
      return this._connection;
    },

    /**
     * Gets the debug value
     * @public
     * @returns {Console} Debug value
     */
    get_debug: function() {
      return this._debug;
    },

    /**
     * Gets the packet
     * @public
     * @returns {Object} Packet object
     */
    get_packet: function(packet) {
      this._packet = packet;
    },

    /**
     * Gets the node
     * @public
     * @returns {Object} Node object
     */
    get_node: function(node) {
      this._node = node;
    },



    /**
     * GIGGLE PLUG SETTERS
     */

    /**
     * Sets the session connection value
     * @private
     * @param {Object} connection
     */
    _set_connection: function(connection) {
      this._connection = connection;
    },

    /**
     * Sets the debugging wrapper
     * @public
     * @param {Console} debug
     */
    set_debug: function(debug) {
      this._debug = debug;
    },

    /**
     * Sets the packet
     * @private
     * @param {Object} packet
     */
    _set_packet: function(packet) {
      this._packet = packet;
    },

    /**
     * Sets the node
     * @private
     * @param {Object} node
     */
    _set_node: function(node) {
      this._node = node;
    }
  }
);
