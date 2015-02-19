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
  /** @lends GigglePlug.prototype */
  {
    /* Packet frame builders */

    /**
     * Builds a message packet
     * @public
     * @returns {__GigglePlug} Constructed object
     */
    message: function() {
      var message;

      // TODO

      return message;
    },

    /**
     * Builds a presence packet
     * @public
     * @returns {__GigglePlug} Constructed object
     */
    presence: function() {
      var presence;

      // TODO

      return presence;
    },

    /**
     * Builds an IQ packet
     * @public
     * @returns {__GigglePlug} Constructed object
     */
    iq: function() {
      var iq;

      // TODO

      return iq;
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
    },


    /* Packet browsing tool */

    /**
     * Returns selected node in packet
     * @public
     * @param   {String} path
     * @returns {__GigglePlug} Selected packet path object
     */
    select: function(path) {
      // TODO
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
      value = (value || null);

      // TODO
    },

    /**
     * Gets or sets the 'to' attribute
     * @public
     * @param   {String} [to]
     * @returns {String} 'to' value
     */
    to: function(to) {
      if (typeof to != 'undefined') {
        this.to = to;
      }

      return this.to || null;
    },

    /**
     * Gets or sets the 'from' attribute
     * @public
     * @param   {String} [from]
     * @returns {String} 'from' value
     */
    from: function(from) {
      if (typeof from != 'undefined') {
        this.from = from;
      }

      return this.from || null;
    },

    /**
     * Gets or sets the 'type' attribute
     * @public
     * @param   {String} [type]
     * @returns {String} 'type' value
     */
    type: function(type) {
      if (typeof type != 'undefined') {
        this.type = type;
      }

      return this.type || null;
    },

    /**
     * Gets or sets the 'id' attribute
     * @public
     * @param   {String} [id]
     * @returns {String} 'id' value
     */
    id: function(id) {
      if (typeof id != 'undefined') {
        this.id = id;
      }

      return this.id || null;
    },


    /* Main data accessor/setters methods */

    /**
     * Gets or sets the 'body' element content
     * @public
     * @param   {String} [body]
     * @returns {String} 'body' value
     */
    body: function(body) {
      if (typeof body != 'undefined') {
        this.body = body;
      }

      return this.body || null;
    },


    /* Serializers */

    /**
     * Serializes the packet object to raw XML data
     * @public
     * @returns {String} Raw XML data
     */
    xml: function() {

    },


    /* Network tools */

    /**
     * Sends the packet
     * @public
     * @param {...Function} [callback]
     */
    send: function(callback) {
      var self = this;

      var response_data;

      // Callback executor
      var on_packet_response = function() {
        // Execute callbacks
        for(var i = 0; i < arguments.length; i++) {
          arguments[i].bind(this)(response_data);
        }
      };
    }
  }
);
