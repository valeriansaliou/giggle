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
      this._parent = null;

      /**
       * @constant
       * @member {Object}
       * @default
       * @private
       */
      this._children = [];

      /**
       * @constant
       * @member {Object}
       * @default
       * @private
       */
      this._packet = null;

      /**
       * @constant
       * @member {Object}
       * @default
       * @private
       */
      this._node   = null;
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
     * Appends a child on the current element in the tree
     * @public
     * @param   {String} name
     * @param   {Object} [attributes]
     * @param   {String} [value]
     * @returns {__GigglePlug} Child object
     */
    child: function(name, attributes, value) {
      this.get_debug().log('[giggle:plug] child > Method not implemented.', 1);
    },

    /**
     * Goes up in the node tree
     * @public
     * @returns {__GigglePlug} Parent object
     */
    up: function() {
      this.get_debug().log('[giggle:plug] up > Method not implemented.', 1);
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
      this.get_debug().log('[giggle:plug] to > Method not implemented.', 1);
    },

    /**
     * Gets or sets the 'from' attribute
     * @public
     * @param   {String} [from]
     * @returns {String} 'from' value
     */
    from: function(from) {
      this.get_debug().log('[giggle:plug] from > Method not implemented.', 1);
    },

    /**
     * Gets or sets the 'type' attribute
     * @public
     * @param   {String} [type]
     * @returns {String} 'type' value
     */
    type: function(type) {
      this.get_debug().log('[giggle:plug] type > Method not implemented.', 1);
    },

    /**
     * Gets or sets the 'id' attribute
     * @public
     * @param   {String} [id]
     * @returns {String} 'id' value
     */
    id: function(id) {
      this.get_debug().log('[giggle:plug] id > Method not implemented.', 1);
    },

    /**
     * Gets or sets the 'body' element content
     * @public
     * @param   {String} [body]
     * @returns {String} 'body' value
     */
    body: function(body) {
      this.get_debug().log('[giggle:plug] body > Method not implemented.', 1);
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
      this.get_debug().log('[giggle:plug] register > Method not implemented.', 1);
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
      this.get_debug().log('[giggle:plug] _build_hierarchy_sub > Method not implemented.', 1);
    },

    /**
     * Builds the plug hierarchy from a packet object
     * @private
     * @param   {Object} packet
     * @returns {__GigglePlug} Constructed object
     */
    _build_hierarchy: function(packet) {
      this.get_debug().log('[giggle:plug] _build_hierarchy > Method not implemented.', 1);
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
     * Selects elements matching query (down in the tree)
     * @public
     * @param  {String}  name
     * @param  {String}  [namespace]
     * @param  {Boolean} [stop_at_first]
     * @return {Object}  Selected elements
     */
    select_element: function(name, namespace, stop_at_first) {
      this.get_debug().log('[giggle:plug] select_element > Method not implemented.', 1);
    },

    /**
     * Selects first element matching query (down in the tree)
     * @public
     * @param  {String} name
     * @param  {String} [namespace]
     * @return {Object} Selected element
     */
    select_element_uniq: function(name, namespace) {
      this.get_debug().log('[giggle:plug] select_element_uniq > Method not implemented.', 1);
    },

    /**
     * Clones the current object
     * @public
     * @returns {__GigglePlug} Cloned object
     */
    clone: function() {
      var cloned = null;

      try {
        cloned = _.clone(this);
      } catch(e) {
        this.get_debug().log('[giggle:plug] clone > ' + e, 1);
      } finally {
        return cloned;
      }
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
     * Gets the parent
     * @public
     * @returns {Object} Reference to parent object
     */
    get_parent: function() {
      return this._parent;
    },

    /**
     * Gets the children
     * @public
     * @returns {Object} Reference to children objects
     */
    get_children: function() {
      return this._children;
    },

    /**
     * Gets the packet
     * @public
     * @returns {Object} Reference to packet object
     */
    get_packet: function() {
      return this._packet;
    },

    /**
     * Gets the node
     * @public
     * @returns {Object} Node object
     */
    get_node: function() {
      return this._node;
    },



    /**
     * GIGGLE PLUG SETTERS
     */

    /**
     * Sets the session connection value
     * @public
     * @param {Object} connection
     */
    set_connection: function(connection) {
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
     * Sets the reference to parent object
     * @public
     * @param {Object} parent
     */
    set_parent: function(parent) {
      this._parent = parent;
    },

    /**
     * Sets the reference to children objects
     * @public
     * @param {Object} children
     */
    set_children: function(children) {
      if(children === null) {
        this._children = [];
      } else {
        this._children.push(
          children
        );
      }
    },

    /**
     * Sets the packet
     * @public
     * @param {Object} parent
     */
    set_packet: function(packet) {
      this._packet = packet;
    },

    /**
     * Sets the node
     * @public
     * @param {Object} node
     */
    set_node: function(node) {
      this._node = node;
    }
  }
);
