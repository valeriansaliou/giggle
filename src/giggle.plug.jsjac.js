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
          var plug_handle = new GigglePlugJSJaC({
            connection : self.get_connection(),
            debug      : self.get_debug()
          });

          plug_handle.set_packet(stanza);
          plug_handle.set_node(stanza);

          cb_handled(plug_handle);
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
     * Sends the packet
     * @public
     * @param {Function} [callback]
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
            response_data
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
    }
  }
);
