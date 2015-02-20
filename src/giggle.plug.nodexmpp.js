/**
 * @fileoverview Giggle library - Pluggability to the node-xmpp library
 *
 * @url https://github.com/valeriansaliou/giggle
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module giggle/plug/nodexmpp */
/** @exports GigglePlugNodeXMPP */


/**
 * Plugger class.
 * @class
 * @classdesc  node-xmpp plugger class.
 * @requires   nicolas-van/ring.js
 * @requires   giggle/main
 * @requires   giggle/plug
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link https://github.com/node-xmpp/node-xmpp|node-xmpp Repository}
 */
var GigglePlugNodeXMPP = ring.create([__GigglePlug],
  /** @lends GigglePlugNodeXMPP.prototype */
  {
    /**
     * Constructor
     */
    constructor: function(args) {
      this.$super(args);
    },


    /* Packet frame builders */

    /**
     * Builds a message packet
     * @public
     * @returns {__GigglePlug} Constructed object
     */
    message: function() {
      this.parent.get_debug().log('[giggle:plug:nodexmpp] message > Method not implemented.', 1);
    },

    /**
     * Builds a presence packet
     * @public
     * @returns {__GigglePlug} Constructed object
     */
    presence: function() {
      this.parent.get_debug().log('[giggle:plug:nodexmpp] presence > Method not implemented.', 1);
    },

    /**
     * Builds an IQ packet
     * @public
     * @returns {__GigglePlug} Constructed object
     */
    iq: function() {
      this.parent.get_debug().log('[giggle:plug:nodexmpp] iq > Method not implemented.', 1);
    },


    /**
     * Builds the packet with passed elements
     * @public
     * @param   {String} name
     * @param   {String} [value]
     * @returns {__GigglePlug} Packet object
     */
    build: function(object) {
      /*
        {
          'message': [
            {
              'body': {

              }
            }
          ]
        }
       */

      this.parent.get_debug().log('[giggle:plug:nodexmpp] build > Method not implemented.', 1);
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
      this.parent.get_debug().log('[giggle:plug:nodexmpp] attribute > Method not implemented.', 1);
    },

    /**
     * Gets or sets the 'to' attribute
     * @public
     * @param   {String} [to]
     * @returns {String} 'to' value
     */
    to: function(to) {
      this.parent.get_debug().log('[giggle:plug:nodexmpp] to > Method not implemented.', 1);
    },

    /**
     * Gets or sets the 'from' attribute
     * @public
     * @param   {String} [from]
     * @returns {String} 'from' value
     */
    from: function(from) {
      this.parent.get_debug().log('[giggle:plug:nodexmpp] from > Method not implemented.', 1);
    },

    /**
     * Gets or sets the 'type' attribute
     * @public
     * @param   {String} [type]
     * @returns {String} 'type' value
     */
    type: function(type) {
      this.parent.get_debug().log('[giggle:plug:nodexmpp] type > Method not implemented.', 1);
    },

    /**
     * Gets or sets the 'id' attribute
     * @public
     * @param   {String} [id]
     * @returns {String} 'id' value
     */
    id: function(id) {
      this.parent.get_debug().log('[giggle:plug:nodexmpp] id > Method not implemented.', 1);
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

      this.parent.get_debug().log('[giggle:plug:nodexmpp] body > Method not implemented.', 1);
    },


    /* Serializers */

    /**
     * Serializes the packet object to raw XML data
     * @public
     * @returns {String} Raw XML data
     */
    xml: function() {
      this.parent.get_debug().log('[giggle:plug:nodexmpp] xml > Method not implemented.', 1);
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

      this.parent.get_debug().log('[giggle:plug:nodexmpp] send > Method not implemented.', 1);
    }
  }
);
