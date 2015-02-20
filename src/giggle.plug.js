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
 */
var __GigglePlug = ring.create(
  /** @lends __GigglePlug.prototype */
  {
    /**
     * Constructor
     */
    constructor: function(parent) {
      /**
       * @constant
       * @member {GiggleSingle|GiggleMuji}
       * @readonly
       * @default
       * @public
       */
      this._parent = parent;

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
      this.parent.get_debug().log('[giggle:plug] message > Method not implemented.', 1);
    },

    /**
     * Builds a presence packet
     * @public
     * @returns {__GigglePlug} Constructed object
     */
    presence: function() {
      this.parent.get_debug().log('[giggle:plug] presence > Method not implemented.', 1);
    },

    /**
     * Builds an IQ packet
     * @public
     * @returns {__GigglePlug} Constructed object
     */
    iq: function() {
      this.parent.get_debug().log('[giggle:plug] iq > Method not implemented.', 1);
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

      this.parent.get_debug().log('[giggle:plug] build > Method not implemented.', 1);
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
      this.parent.get_debug().log('[giggle:plug] attribute > Method not implemented.', 1);
    },

    /**
     * Sets/gets an element value
     * @public
     * @param   {String} element
     * @param   {String} [value]
     * @returns {__GigglePlug} Packet object
     */
    element: function(element, value) {
      this.parent.get_debug().log('[giggle:plug] element > Method not implemented.', 1);
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
      this.parent.get_debug().log('[giggle:plug] xml > Method not implemented.', 1);
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
      this.parent.get_debug().log('[giggle:plug] select > Method not implemented.', 1);
    },

    /**
     * Sends the packet
     * @public
     * @param {...Function} [callback]
     */
    send: function(callback) {
      this.parent.get_debug().log('[giggle:plug] send > Method not implemented.', 1);
    },



    /**
     * GIGGLE PLUG GETTERS
     */

    /**
     * Gets the packet
     * @private
     * @returns {Object} Packet object
     */
    _get_packet: function(packet) {
      this._packet = packet;
    },

    /**
     * Gets the node
     * @private
     * @returns {Object} Node object
     */
    _get_node: function(node) {
      this._node = node;
    },



    /**
     * GIGGLE PLUG SETTERS
     */

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
