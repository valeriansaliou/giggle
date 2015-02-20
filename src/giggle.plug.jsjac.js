/**
 * @fileoverview Giggle library - Pluggability to the JSJaC library
 *
 * @url https://github.com/valeriansaliou/giggle
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module giggle/plug/jsjac */
/** @exports GigglePlugJSJaC */


/**
 * Plugger class.
 * @class
 * @classdesc  JSJAC plugger class.
 * @requires   nicolas-van/ring.js
 * @requires   sstrigler/JSJaC
 * @requires   giggle/main
 * @requires   giggle/plug
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://stefan-strigler.de/jsjac-1.3.4/doc/|JSJaC Documentation}
 */
var GigglePlugJSJaC = ring.create([__GigglePlug],
  /** @lends GigglePlugJSJaC.prototype */
  {
    /**
     * Constructor
     */
    constructor: function(args) {
      this.$super(args);
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
      this._set_packet(
        new JSJaCMessage()
      );

      this._set_node(
        this._get_packet()
      );

      return this;
    },

    /**
     * Builds a presence packet
     * @public
     * @returns {__GigglePlug} Constructed object
     */
    presence: function() {
      this._set_packet(
        new JSJaCPresence()
      );

      this._set_node(
        this._get_packet()
      );

      return this;
    },

    /**
     * Builds an IQ packet
     * @public
     * @returns {__GigglePlug} Constructed object
     */
    iq: function() {
      this._set_packet(
        new JSJaCIQ()
      );

      this._set_node(
        this._get_packet()
      );

      return this;
    },

    /**
     * Builds the packet with passed elements
     * @public
     * @param   {String} name
     * @param   {String} [value]
     * @returns {__GigglePlug} Packet object
     */
    build: function(object) {
      var i, k;
      var parent_node;
      var cur_name, cur_value, cur_elements, cur_attrs;

      var descend_node = function(_object, _parent_node) {
        for(i = 0; i < _object.length; i++) {
          for(k in _object[i]) {
            // No such property?
            if(!_object[i].hasOwnProperty(k)) {
              continue;
            }

            // Read name
            cur_name = k;

            // Read attributes
            if(typeof _object[i][k].a == 'object' &&
               _object[i][k].a.length) {
              cur_attrs = _object[i][k].a;
            } else {
              cur_attrs = {};
            }

            // Read value/elements
            if(typeof _object[i][k].e == 'string' ||
               typeof _object[i][k].e == 'number') {
              cur_value = _object[i][k].e;
              cur_elements = [];
            } else if(typeof _object[i][k].e == 'object' ||
                      _object[i][k].e.length) {
              cur_value = null;
              cur_elements = _object[i][k].e;
            }

            // Parse it.
            if(typeof _parent_node != 'undefined') {
              parent_node = this._get_node().appendChild(
                this._get_packet().buildNode(
                  cur_name, cur_attrs, cur_value
                )
              );
            } else {
              parent_node = this._get_node().appendNode(
                cur_name, cur_attrs, cur_value
              );
            }

            // Move to direct childs
            if(typeof _object[i][k].e == 'object' &&
               _object[i][k].e.length) {
              descend_node.bind(this)(
                _object[i][k].e, parent_node
              );
            }

            // Should be an unique key
            break;
          }
        }
      };

      // First direct parents
      descend_node.bind(this)(object);

      return this;
    },



    /**
     * GIGGLE PLUG MODIFIERS
     */

    /**
     * Sets/gets an attribute on an element
     * @public
     * @param   {String} name
     * @param   {String} [value]
     * @returns {__GigglePlug} Packet object
     */
    attribute: function(name, value) {
      // Sets?
      if(typeof value != 'undefined') {
        this._get_node().setAttribute(name, value);

        return this;
      }

      return this._get_node().getAttribute(name);
    },

    /**
     * Sets/gets an element value
     * @public
     * @param   {String} element
     * @param   {String} [value]
     * @returns {__GigglePlug} Packet object
     */
    element: function(element, value) {
      // Sets?
      if(typeof value != 'undefined') {
        this._get_node().getChild(name).setValue(value);

        return this;
      }

      return this._get_node().getChild(name).getValue();
    },

    /**
     * Gets or sets the 'to' attribute
     * @public
     * @param   {String} [to]
     * @returns {String} 'to' value
     */
    to: function(to) {
      if(typeof to != 'undefined') {
        return this.attribute('to', to);
      }

      return this.attribute('to');
    },

    /**
     * Gets or sets the 'from' attribute
     * @public
     * @param   {String} [from]
     * @returns {String} 'from' value
     */
    from: function(from) {
      if(typeof from != 'undefined') {
        return this.attribute('to', from);
      }

      return this.attribute('to');
    },

    /**
     * Gets or sets the 'type' attribute
     * @public
     * @param   {String} [type]
     * @returns {String} 'type' value
     */
    type: function(type) {
      if(typeof type != 'undefined') {
        return this.attribute('to', type);
      }

      return this.attribute('to');
    },

    /**
     * Gets or sets the 'id' attribute
     * @public
     * @param   {String} [id]
     * @returns {String} 'id' value
     */
    id: function(id) {
      if(typeof id != 'undefined') {
        return this.attribute('to', id);
      }

      return this.attribute('to');
    },

    /**
     * Gets or sets the 'body' element content
     * @public
     * @param   {String} [body]
     * @returns {String} 'body' value
     */
    body: function(body) {
      if(typeof body != 'undefined') {
        return this.element('body', body);
      }

      return this.element('body');
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
      return this._get_node().xml();
    },



    /**
     * GIGGLE PLUG HELPERS
     */

    /**
     * Sends the packet
     * @public
     * @param {...Function} [callback]
     * @returns {__GigglePlug} Packet object
     */
    send: function(callback) {
      var self = this;

      var response_data;

      // Callback executor
      var on_packet_response = function(response_data) {
        // Execute callbacks
        for(var i = 0; i < arguments.length; i++) {
          arguments[i].bind(this)(response_data);
        }
      };

      // Send packet
      this._get_node().send(
        on_packet_response
      );

      return this;
    }
  }
);
