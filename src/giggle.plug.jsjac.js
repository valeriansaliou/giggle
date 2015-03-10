/**
 * @fileoverview Giggle library - Pluggability to the JSJaC library
 *
 * @url https://github.com/valeriansaliou/giggle
 * @author Valérian Saliou https://valeriansaliou.name/
 *
 * @copyright 2015, Hakuma Holdings Ltd.
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
        this.set_packet(
          new JSJaCMessage()
        );

        this.set_node(
          this.get_packet()
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
        this.set_packet(
          new JSJaCPresence()
        );

        this.set_node(
          this.get_packet()
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
        this.set_packet(
          new JSJaCIQ()
        );

        this.set_node(
          this.get_packet()
        );
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] iq > ' + e, 1);
      } finally {
        return this;
      }
    },

    /**
     * Appends a child on the current element in the tree
     * @public
     * @param   {String} name
     * @param   {Object} [attributes]
     * @param   {String} [value]
     * @returns {__GigglePlug} Child object
     */
    child: function(name, attributes, value) {
      var child = this.clone();

      // Set reference to child
      this.set_children(child);

      child.set_parent(this);

      try {
        // Parse it.
        if(this.get_parent() !== null) {
          child.set_node(
            child.get_node().appendChild(
              child.get_packet().buildNode(
                name, attributes, value
              )
            )
          );
        } else {
          child.set_node(
            child.get_node().appendNode(
              name, attributes, value
            )
          );
        }
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] child > ' + e, 1);
      } finally {
        return child;
      }
    },

    /**
     * Goes up in the node tree
     * @public
     * @returns {__GigglePlug} Parent object
     */
    up: function() {
      var parent = this;

      try {
        if(this.get_parent() !== null) {
          parent = this.get_parent();
        }
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] up > ' + e, 1);
      } finally {
        return parent;
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
          this.get_node().getNode().setAttribute(name, value);

          return this;
        }

        return this.get_node().getNode().getAttribute(name);
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
          this.get_node().getChild(name).setValue(value);

          return this;
        }

        return this.get_node().getChild(name).getValue();
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] element > ' + e, 1);
      }
    },



    /**
     * GIGGLE PLUG HANDLERS
     */

    /**
     * Registers a handler on a specified stanza type
     * @param {String}   type
     * @param {Function} cb_handled
     * @public
     */
    register: function(type, cb_handled) {
      try {
        var self = this;

        // Local handler (constructs a new plug object)
        var cb_local_handle = function(stanza) {
          cb_handled.bind(self)(
            this._build_hierarchy(
              stanza
            )
          );
        };

        this.get_connection().registerHandler(
          type, cb_local_handle
        );
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] register > ' + e, 1);
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
        return this.get_node().xml();
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] xml > ' + e, 1);
      }
    },



    /**
     * GIGGLE PLUG HELPERS
     */

    /**
     * Builds the plug hierarchy sub elements
     * @private
     * @param {__GigglePlug} baseline_object
     * @param {Object} packet
     * @param {__GigglePlug} parent_object
     * @param {Object} node
     */
    _build_hierarchy_sub: function(baseline_object, packet, parent_object, node) {
      var hierarchy_element = null;
      var hierarchy_children = [];

      try {
        var i;

        hierarchy_element = baseline_object.clone();

        for(i = 0; i < node.childNodes.length; i++) {
          hierarchy_children.push(
            this._build_hierarchy_sub(
              baseline_object,
              packet,
              hierarchy_element,
              node.childNodes[i]
            )
          );
        }

        plug_handle.set_parent(
          parent_object
        );

        plug_handle.set_children(
          hierarchy_children
        );

        plug_handle.set_packet(
          packet
        );

        plug_handle.set_node(
          node
        );
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] _build_hierarchy_sub > ' + e, 1);
      } finally {
        return hierarchy_element;
      }
    },

    /**
     * Builds the plug hierarchy from a packet object
     * @private
     * @param {Object} packet
     */
    _build_hierarchy: function(packet) {
      var hierarchy_parent = null;

      try {
        hierarchy_parent = new GigglePlugJSJaC({
          connection : this.get_connection(),
          debug      : this.get_debug()
        });

        this._build_hierarchy_sub(
          hierarchy_parent,
          packet,
          null,
          packet.getNode()
        );
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] _build_hierarchy > ' + e, 1);
      } finally {
        return hierarchy_parent;
      }
    },

    /**
     * Sends the packet
     * @public
     * @param   {Function} [callback]
     * @returns {__GigglePlug} Packet object
     */
    send: function(callback) {
      var response_data;

      try {
        var self = this;

        // Cannot send a non-parent object
        if(this.get_parent() !== null) {
          throw 'Cannot send non-parent object!';
        }

        // Callback executor
        var on_packet_response = function(response_data) {
          callback.bind(self)(
            self._build_hierarchy(
              response_data
            )
          );
        };

        // Send packet
        this.get_connection().send(
          this.get_packet(), on_packet_response
        );
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] send > ' + e, 1);
      } finally {
        return this;
      }
    },

    /**
     * Selects an element
     * @public
     * @param {String} name
     * @param {String} [namespace]
     * @return {__GigglePlug} Selected element
     */
    select_element: function(name, namespace) {
      var selected_element = null;

      try {
        var i,
            elements;

        // Wanted element?
        if(this.get_node().elementName == name &&
          (!namespace || (namespace && this.get_node().getAttribute('xmlns') == namespace))
        ) {
          selected_element = this;
        } else {
          elements = this.get_children();

          for(i = 0; i < elements.length; i++) {
            selected_element = elements[i].select_element(
              name, namespace
            );

            if(selected_element !== null) break;
          }
        }
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] select_element > ' + e, 1);
      } finally {
        return selected_element;
      }
    }
  }
);
