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
      try {
        this._set_packet(
          new JSJaCMessage()
        );

        this._set_node(
          this._get_packet()
        );
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] message > ' + e, 1);
      } finally {
        return this;
      }
    },

    /**
     * Builds a presence packet
     * @public
     * @returns {__GigglePlug} Constructed object
     */
    presence: function() {
      try {
        this._set_packet(
          new JSJaCPresence()
        );

        this._set_node(
          this._get_packet()
        );
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] presence > ' + e, 1);
      } finally {
        return this;
      }
    },

    /**
     * Builds an IQ packet
     * @public
     * @returns {__GigglePlug} Constructed object
     */
    iq: function() {
      try {
        this._set_packet(
          new JSJaCIQ()
        );

        this._set_node(
          this._get_packet()
        );
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] iq > ' + e, 1);
      } finally {
        return this;
      }
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

      try {
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
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] build > ' + e, 1);
      } finally {
        return this;
      }
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
      try {
        // Sets?
        if(typeof value != 'undefined') {
          this._get_node().setAttribute(name, value);

          return this;
        }

        return this._get_node().getAttribute(name);
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] attribute > ' + e, 1);
      }
    },

    /**
     * Sets/gets an element value
     * @public
     * @param   {String} element
     * @param   {String} [value]
     * @returns {__GigglePlug} Packet object
     */
    element: function(element, value) {
      try {
        // Sets?
        if(typeof value != 'undefined') {
          this._get_node().getChild(name).setValue(value);

          return this;
        }

        return this._get_node().getChild(name).getValue();
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] element > ' + e, 1);
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
      try {
        return this._get_node().xml();
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] xml > ' + e, 1);
      }
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
      try {
        this.node = this.packet.getNode().getChild(
          name, ns
        );
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] select > ' + e, 1);
      } finally {
        return this.node;
      }
    },

    /**
     * Sends the packet
     * @public
     * @param {...Function} [callback]
     * @returns {__GigglePlug} Packet object
     */
    send: function(callback) {
      var response_data;

      try {
        // Callback executor
        var on_packet_response = function(response_data) {
          // Execute callbacks
          for(var i = 0; i < arguments.length; i++) {
            arguments[i].bind(this)(response_data);
          }
        };

        // Send packet
        this.parent.get_connection().send(
          this._get_packet(), on_packet_response
        );
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] send > ' + e, 1);
      } finally {
        return this;
      }
    }
  }
);
