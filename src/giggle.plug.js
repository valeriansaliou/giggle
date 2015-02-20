/**
 * @fileoverview Giggle library - Pluggability to other network libs
 *
 * @url https://github.com/valeriansaliou/giggle
 * @author Valérian Saliou https://valeriansaliou.name/
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
      this.parent = parent;
    },


    /* Packet frame builders */

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
      /* Data structure example */
      /*
        [
          {'message': {
            e: [
              {'body': {
                // {DESC}
              }
            ],

            a: {
              'key': 'value'
            }
          }}
        ]
      */

      this.parent.get_debug().log('[giggle:plug] build > Method not implemented.', 1);
    },


    /* Main attribute accessor/setters methods */

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
     * Gets or sets the 'to' attribute
     * @public
     * @param   {String} [to]
     * @returns {String} 'to' value
     */
    to: function(to) {
      this.parent.get_debug().log('[giggle:plug] to > Method not implemented.', 1);
    },

    /**
     * Gets or sets the 'from' attribute
     * @public
     * @param   {String} [from]
     * @returns {String} 'from' value
     */
    from: function(from) {
      this.parent.get_debug().log('[giggle:plug] from > Method not implemented.', 1);
    },

    /**
     * Gets or sets the 'type' attribute
     * @public
     * @param   {String} [type]
     * @returns {String} 'type' value
     */
    type: function(type) {
      this.parent.get_debug().log('[giggle:plug] type > Method not implemented.', 1);
    },

    /**
     * Gets or sets the 'id' attribute
     * @public
     * @param   {String} [id]
     * @returns {String} 'id' value
     */
    id: function(id) {
      this.parent.get_debug().log('[giggle:plug] id > Method not implemented.', 1);
    },


    /* Main data accessor/setters methods */

    /**
     * Gets or sets the 'body' element content
     * @public
     * @param   {String} [body]
     * @returns {String} 'body' value
     */
    body: function(body) {
      /*if (typeof body != 'undefined') {
        this.body = body;
      }

      return this.body || null;*/

      this.parent.get_debug().log('[giggle:plug] body > Method not implemented.', 1);
    },


    /* Serializers */

    /**
     * Serializes the packet object to raw XML data
     * @public
     * @returns {String} Raw XML data
     */
    xml: function() {
      this.parent.get_debug().log('[giggle:plug] xml > Method not implemented.', 1);
    },


    /* Network tools */

    /**
     * Sends the packet
     * @public
     * @param {...Function} [callback]
     */
    send: function(callback) {
      /*var self = this;

      var response_data;

      // Callback executor
      var on_packet_response = function() {
        // Execute callbacks
        for(var i = 0; i < arguments.length; i++) {
          arguments[i].bind(this)(response_data);
        }
      };*/

      this.parent.get_debug().log('[giggle:plug] send > Method not implemented.', 1);
    }
  }
);
