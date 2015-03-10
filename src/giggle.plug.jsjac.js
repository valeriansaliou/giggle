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
      var instance;

      try {
        // Derivate base instance for easiness of implementation
        instance = (new GigglePlugJSJaC({
          connection : this.get_connection(),
          debug      : this.get_debug()
        }));

        instance.set_packet(
          new JSJaCMessage()
        );

        instance.set_node(
          instance.get_packet().getNode()
        );
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] message > ' + e, 1);
      } finally {
        return instance;
      }
    },

    /**
     * Builds a presence packet
     * @public
     * @returns {__GigglePlug} Constructed object
     */
    presence: function() {
      var instance;

      try {
        // Derivate base instance for easiness of implementation
        instance = (new GigglePlugJSJaC({
          connection : this.get_connection(),
          debug      : this.get_debug()
        }));

        instance.set_packet(
          new JSJaCPresence()
        );

        instance.set_node(
          instance.get_packet().getNode()
        );
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] presence > ' + e, 1);
      } finally {
        return instance;
      }
    },

    /**
     * Builds an IQ packet
     * @public
     * @returns {__GigglePlug} Constructed object
     */
    iq: function() {
      var instance;

      try {
        // Derivate base instance for easiness of implementation
        instance = (new GigglePlugJSJaC({
          connection : this.get_connection(),
          debug      : this.get_debug()
        }));

        instance.set_packet(
          new JSJaCIQ()
        );

        instance.set_node(
          instance.get_packet().getNode()
        );
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] iq > ' + e, 1);
      } finally {
        return instance;
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
      var child;

      try {
        // Swap values? (value shortcut)
        if(typeof attributes == 'string') {
          value = attributes;
          attributes = {};
        }

        child = (new GigglePlugJSJaC({
          connection : this.get_connection(),
          debug      : this.get_debug()
        }));

        // Set parent forward reference (to child)
        this.set_children(child);

        // Set child backwards references (to parent)
        child.set_parent(this);
        child.set_packet(
          this.get_packet()
        );

        // Append node
        child.set_node(
          this.get_node().appendChild(
            child.get_packet().buildNode(
              name, attributes, value
            )
          )
        );
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
          if(name == 'xmlns') {
            this.get_node().namespaceURI = value;
          } else {
            this.get_node().setAttribute(name, value);
          }

          return this;
        }

        return (name == 'xmlns') ? this.get_node().namespaceURI  :
                                   this.get_node().getAttribute(name);
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
     * Gets or sets the 'to' attribute
     * @public
     * @param   {String} [to]
     * @returns {String} 'to' value
     */
    to: function(to) {
      try {
        if(typeof to != 'undefined') {
          return this.get_packet().setTo(to);
        }

        return this.get_packet().getTo();
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
          return this.get_packet().setFrom(from);
        }

        return this.get_packet().getFrom();
      } catch(e) {
        this.get_debug().log('[giggle:plug] from > ' + e, 1);
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
          return this.get_packet().setType(type);
        }

        return this.get_packet().getType();
      } catch(e) {
        this.get_debug().log('[giggle:plug] type > ' + e, 1);
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
          return this.get_packet().setID(id);
        }

        return this.get_packet().getID();
      } catch(e) {
        this.get_debug().log('[giggle:plug] id > ' + e, 1);
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
          return this.get_packet().setBody(body);
        }

        return this.get_packet().getBody();
      } catch(e) {
        this.get_debug().log('[giggle:plug] body > ' + e, 1);
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
          if(typeof cb_handled == 'function') {
            cb_handled.bind(self)(
              self._build_hierarchy(
                stanza
              )
            );
          } else {
            this.get_debug().log('[giggle:plug:jsjac] register > Received an unhandled stanza of type: ' + type, 0);
          }
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
     * @param   {Function}     build_baseline_object_fn
     * @param   {__GigglePlug}     first_in_tree_object
     * @param   {Object}       packet
     * @param   {__GigglePlug} parent_object
     * @param   {Object}       node
     * @returns {__GigglePlug} Constructed object
     */
    _build_hierarchy_sub: function(build_baseline_object_fn, first_in_tree_object, packet, parent_object, node) {
      var hierarchy_element = null;

      try {
        var i, cur_node_item;

        if(first_in_tree_object !== null) {
          hierarchy_element = first_in_tree_object;
        } else {
          hierarchy_element = build_baseline_object_fn();
        }

        if(node && node.hasChildNodes()) {
          for(i = 0; i < node.childNodes.length; i++) {
            cur_node_item = node.childNodes.item(i);

            if(cur_node_item                     &&
               cur_node_item.parentNode == node  &&
               cur_node_item.nodeType == document.ELEMENT_NODE) {
              hierarchy_element.set_children(
                this._build_hierarchy_sub(
                  build_baseline_object_fn,
                  null,
                  packet,
                  hierarchy_element,
                  node.childNodes.item(i)
                )
              );
            }
          }
        }

        hierarchy_element.set_parent(
          parent_object
        );

        hierarchy_element.set_packet(
          packet
        );

        hierarchy_element.set_node(
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
     * @param   {Object} packet
     * @returns {__GigglePlug} Constructed object
     */
    _build_hierarchy: function(packet) {
      var first_in_tree_object;

      try {
        var self = this;

        var build_baseline_object_fn = function() {
          return (new GigglePlugJSJaC({
            connection : self.get_connection(),
            debug      : self.get_debug()
          }));
        };

        first_in_tree_object = build_baseline_object_fn();

        this._build_hierarchy_sub(
          build_baseline_object_fn,
          first_in_tree_object,
          packet,
          null,
          packet.getNode()
        );
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] _build_hierarchy > ' + e, 1);
      } finally {
        return first_in_tree_object;
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
        if(typeof callback == 'function') {
          this.get_connection().send(
            this.get_packet(), on_packet_response
          );
        } else {
          this.get_connection().send(
            this.get_packet()
          );
        }
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] send > ' + e, 1);
      } finally {
        return this;
      }
    },

    /**
     * Selects elements matching query (down in the tree)
     * @public
     * @param  {String}  name
     * @param  {String}  [namespace]
     * @param  {Boolean} [stop_at_first]
     * @return {Object}  Selected elements
     */
    select_element: function(name, namespace, stop_at_first) {
      var selected_elements = [];

      try {
        var i,
            elements;

        // Would that be the element we're asking for?
        if((name == '*' || this.get_node().nodeName == name) &&
          (!namespace || (namespace && this.get_node().namespaceURI == namespace))
        ) {
          selected_elements.push(this);

          if(stop_at_first === true)  return;
        }

        // Iterate on children
        elements = this.get_children();

        for(i = 0; i < elements.length; i++) {
          selected_elements = selected_elements.concat(
            elements[i].select_element(
              name, namespace, stop_at_first
            )
          );

          if(stop_at_first === true && selected_elements.length)  return;
        }
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] select_element > ' + e, 1);
      } finally {
        return selected_elements;
      }
    },

    /**
     * Selects first element matching query (down in the tree)
     * @public
     * @param  {String} name
     * @param  {String} [namespace]
     * @return {Object} Selected element
     */
    select_element_uniq: function(name, namespace) {
      var selected_element = null;

      try {
        var selected_elements_arr = this.select_element(
          name, namespace, true
        );

        if(selected_elements_arr.length) {
          selected_element = selected_elements_arr[0] || null;
        }
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] select_element_uniq > ' + e, 1);
      } finally {
        return selected_element;
      }
    },

    /**
     * Gets the username associated to the current connection
     * @public
     * @returns {String} Username value
     */
    connection_username: function() {
      var username = null;

      try {
        username = this.get_connection().username;
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] connection_username > ' + e, 1);
      } finally {
        return username;
      }
    },

    /**
     * Gets the domain associated to the current connection
     * @public
     * @returns {String} Username value
     */
    connection_domain: function() {
      var domain = null;

      try {
        domain = this.get_connection().domain;
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] connection_domain > ' + e, 1);
      } finally {
        return domain;
      }
    },

    /**
     * Gets the resource associated to the current connection
     * @public
     * @returns {String} Username value
     */
    connection_resource: function() {
      var resource = null;

      try {
        resource = this.get_connection().resource;
      } catch(e) {
        this.get_debug().log('[giggle:plug:jsjac] connection_resource > ' + e, 1);
      } finally {
        return resource;
      }
    }
  }
);
