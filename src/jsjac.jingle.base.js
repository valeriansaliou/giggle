/**
 * @fileoverview JSJaC Jingle library - Base call lib
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/base */
/** @exports __JSJaCJingleBase */


/**
 * Abstract base class for XMPP Jingle sessions.
 * @abstract
 * @class
 * @classdesc  Abstract base class for XMPP Jingle sessions.
 * @requires   nicolas-van/ring.js
 * @requires   sstrigler/JSJaC
 * @requires   jsjac-jingle/utils
 * @requires   jsjac-jingle/sdp
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://stefan-strigler.de/jsjac-1.3.4/doc/|JSJaC Documentation}
 * @param      {Object}         [args]             - Jingle session arguments.
 * @property   {DOM}            [args.local_view]  - The path to the local stream view element.
 * @property   {String}         [args.to]          - The full JID to start the Jingle session with.
 * @property   {String}         [args.media]       - The media type to be used in the Jingle session.
 * @property   {String}         [args.resolution]  - The resolution to be used for video in the Jingle session.
 * @property   {String}         [args.bandwidth]   - The bandwidth to be limited for video in the Jingle session.
 * @property   {String}         [args.fps]         - The framerate to be used for video in the Jingle session.
 * @property   {Object}         [args.stun]        - A list of STUN servers to use (override the default one).
 * @property   {Object}         [args.turn]        - A list of TURN servers to use.
 * @property   {Boolean}        [args.sdp_trace]   - Log SDP trace in console (requires a debug interface).
 * @property   {Boolean}        [args.net_trace]   - Log network packet trace in console (requires a debug interface).
 * @property   {JSJaCDebugger}  [args.debug]       - A reference to a debugger implementing the JSJaCDebugger interface.
 */
var __JSJaCJingleBase = ring.create(
  /** @lends __JSJaCJingleBase.prototype */
  {
    /**
     * Constructor
     */
    constructor: function(args) {
      /**
       * @constant
       * @member {JSJaCJingleUtils}
       * @readonly
       * @default
       * @public
       */
      this.utils = new JSJaCJingleUtils(this);

      /**
       * @constant
       * @member {JSJaCJingleSDP}
       * @readonly
       * @default
       * @public
       */
      this.sdp = new JSJaCJingleSDP(this);

      if(args && args.to)
        /**
         * @constant
         * @member {String}
         * @default
         * @private
         */
        this._to = args.to;

      if(args && args.media)
        /**
         * @member {String}
         * @default
         * @private
         */
        this._media = args.media;

      if(args && args.video_source)
        /**
         * @member {String}
         * @default
         * @private
         */
        this._video_source = args.video_source;

      if(args && args.resolution)
        /**
         * @member {String}
         * @default
         * @private
         */
        this._resolution = args.resolution;

      if(args && args.bandwidth)
        /**
         * @member {Number}
         * @default
         * @private
         */
        this._bandwidth = args.bandwidth;

      if(args && args.fps)
        /**
         * @member {Number}
         * @default
         * @private
         */
        this._fps = args.fps;

      if(args && args.local_view) {
        if(args.local_view instanceof Array) {
          /**
           * @member {DOM}
           * @default
           * @private
           */
          this._local_view = args.local_view;
        } else {
          /**
           * @member {DOM}
           * @default
           * @private
           */
          this._local_view = [args.local_view];
        }
      }

      if(args && args.stun) {
        /**
         * @constant
         * @member {Object}
         * @default
         * @private
         */
        this._stun = args.stun;
      } else {
        this._stun = {};
      }

      if(args && args.turn) {
        /**
         * @constant
         * @member {Object}
         * @default
         * @private
         */
        this._turn = args.turn;
      } else {
        this._turn = {};
      }

      if(args && args.sdp_trace)
        /**
         * @member {Boolean}
         * @default
         * @private
         */
        this._sdp_trace = args.sdp_trace;

      if(args && args.net_trace)
        /**
         * @member {Boolean}
         * @default
         * @private
         */
        this._net_trace = args.net_trace;

      if(args && args.debug && args.debug.log) {
        /**
         * @member {JSJaCDebugger}
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
        this._debug = JSJAC_JINGLE_STORE_DEBUG;
      }

      /**
       * @member {String}
       * @default
       * @private
       */
      this._initiator = '';

      /**
       * @member {String}
       * @default
       * @private
       */
      this._responder = '';

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._creator = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._senders = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._local_stream = null;

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._content_local = [];

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._peer_connection = {};

      /**
       * @member {Number}
       * @default
       * @private
       */
      this._id = 0;

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._sent_id = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._received_id = {};

      /**
       * @member {Array}
       * @default
       * @private
       */
      this._payloads_local = [];

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._group_local = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._candidates_local = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._candidates_queue_local = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._registered_handlers = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._deferred_handlers = {};

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._mute = {};

      /**
       * @member {Boolean}
       * @default
       * @private
       */
      this._lock = false;

      /**
       * @member {Boolean}
       * @default
       * @private
       */
      this._media_busy = false;

      /**
       * @member {String}
       * @default
       * @private
       */
      this._sid = '';

      /**
       * @member {Object}
       * @default
       * @private
       */
      this._name = {};
    },



    /**
     * JSJSAC JINGLE REGISTERS
     */

    /**
     * Registers a given handler on a given Jingle stanza
     * @public
     * @param {String} type
     * @param {String} id
     * @param {Function} fn
     * @returns {Boolean} Success
     */
    register_handler: function(type, id, fn) {
      this.get_debug().log('[JSJaCJingle:base] register_handler', 4);

      try {
        type = type || JSJAC_JINGLE_IQ_TYPE_ALL;

        if(typeof fn !== 'function') {
          this.get_debug().log('[JSJaCJingle:base] register_handler > fn parameter not passed or not a function!', 1);
          return false;
        }

        if(id) {
          this._set_registered_handlers(type, id, fn);

          this.get_debug().log('[JSJaCJingle:base] register_handler > Registered handler for id: ' + id + ' and type: ' + type, 3);
          return true;
        } else {
          this.get_debug().log('[JSJaCJingle:base] register_handler > Could not register handler (no ID).', 1);
          return false;
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] register_handler > ' + e, 1);
      }

      return false;
    },

    /**
     * Unregisters the given handler on a given Jingle stanza
     * @public
     * @param {String} type
     * @param {String} id
     * @returns {Boolean} Success
     */
    unregister_handler: function(type, id) {
      this.get_debug().log('[JSJaCJingle:base] unregister_handler', 4);

      try {
        type = type || JSJAC_JINGLE_IQ_TYPE_ALL;

        if(type in this._registered_handlers && id in this._registered_handlers[type]) {
          this._set_registered_handlers(type, id, null);

          this.get_debug().log('[JSJaCJingle:base] unregister_handler > Unregistered handler for id: ' + id + ' and type: ' + type, 3);
          return true;
        } else {
          this.get_debug().log('[JSJaCJingle:base] unregister_handler > Could not unregister handler with id: ' + id + ' and type: ' + type + ' (not found).', 2);
          return false;
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] unregister_handler > ' + e, 1);
      }

      return false;
    },

    /**
     * Defers a given handler
     * @public
     * @param {String} ns
     * @param {Function} fn
     * @returns {Boolean} Success
     */
    defer_handler: function(ns, fn) {
      this.get_debug().log('[JSJaCJingle:base] defer_handler', 4);

      try {
        if(typeof fn !== 'function') {
          this.get_debug().log('[JSJaCJingle:base] defer_handler > fn parameter not passed or not a function!', 1);
          return false;
        }

        this._set_deferred_handlers(ns, fn);

        this.get_debug().log('[JSJaCJingle:base] defer_handler > Deferred handler for namespace: ' + ns, 3);
        return true;
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] defer_handler > ' + e, 1);
      }

      return false;
    },

    /**
     * Undefers the given handler
     * @public
     * @param {String} ns
     * @returns {Boolean} Success
     */
    undefer_handler: function(ns) {
      this.get_debug().log('[JSJaCJingle:base] undefer_handler', 4);

      try {
        if(ns in this._deferred_handlers) {
          this._set_deferred_handlers(ns, null);

          this.get_debug().log('[JSJaCJingle:base] undefer_handler > Undeferred handler for namespace: ' + ns, 3);
          return true;
        } else {
          this.get_debug().log('[JSJaCJingle:base] undefer_handler > Could not undefer handler with namespace: ' + ns + ' (not found).', 2);
          return false;
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] undefer_handler > ' + e, 1);
      }

      return false;
    },

    /**
     * Registers a view element
     * @public
     * @param {String} tyoe
     * @param {DOM} view
     * @returns {Boolean} Success
     */
    register_view: function(type, view) {
      this.get_debug().log('[JSJaCJingle:base] register_view', 4);

      try {
        // Get view functions
        var fn = this.utils.map_register_view(type);

        if(fn.type == type) {
          var i;

          // Check view is not already registered
          for(i in (fn.view.get)()) {
            if((fn.view.get)()[i] == view) {
              this.get_debug().log('[JSJaCJingle:base] register_view > Could not register view of type: ' + type + ' (already registered).', 2);
              return true;
            }
          }

          // Proceeds registration
          (fn.view.set)(view);

          this.utils._peer_stream_attach(
            [view],
            (fn.stream.get)(),
            fn.mute
          );

          this.get_debug().log('[JSJaCJingle:base] register_view > Registered view of type: ' + type, 3);

          return true;
        } else {
          this.get_debug().log('[JSJaCJingle:base] register_view > Could not register view of type: ' + type + ' (type unknown).', 1);
          return false;
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] register_view > ' + e, 1);
      }

      return false;
    },

    /**
     * Unregisters a view element
     * @public
     * @param {String} type
     * @param {DOM} view
     * @returns {Boolean} Success
     */
    unregister_view: function(type, view) {
      this.get_debug().log('[JSJaCJingle:base] unregister_view', 4);

      try {
        // Get view functions
        var fn = this.utils.map_unregister_view(type);

        if(fn.type == type) {
          var i;

          // Check view is registered
          for(i in (fn.view.get)()) {
            if((fn.view.get)()[i] == view) {
              // Proceeds un-registration
              this.utils._peer_stream_detach(
                [view]
              );

              this.utils.array_remove_value(
                (fn.view.get)(),
                view
              );

              this.get_debug().log('[JSJaCJingle:base] unregister_view > Unregistered view of type: ' + type, 3);
              return true;
            }
          }

          this.get_debug().log('[JSJaCJingle:base] unregister_view > Could not unregister view of type: ' + type + ' (not found).', 2);
          return true;
        } else {
          this.get_debug().log('[JSJaCJingle:base] unregister_view > Could not unregister view of type: ' + type + ' (type unknown).', 1);
          return false;
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] unregister_view > ' + e, 1);
      }

      return false;
    },



    /**
     * JSJSAC JINGLE PEER TOOLS
     */

    /**
     * Creates a new peer connection
     * @private
     * @param {Function} sdp_message_callback
     */
    _peer_connection_create: function(sdp_message_callback) {
      this.get_debug().log('[JSJaCJingle:base] _peer_connection_create', 4);

      try {
        // Create peer connection instance
        this._peer_connection_create_instance();

        // Event callbacks
        this._peer_connection_callbacks(sdp_message_callback);

        // Add local stream
        this._peer_connection_create_local_stream();

        // Create offer/answer
        this._peer_connection_create_dispatch(sdp_message_callback);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _peer_connection_create > ' + e, 1);
      }
    },

    /**
     * Creates peer connection local stream
     * @private
     */
    _peer_connection_create_local_stream: function() {
      this.get_debug().log('[JSJaCJingle:base] _peer_connection_create_local_stream', 4);

      try {
        this.get_peer_connection().addStream(
          this.get_local_stream()
      	);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _peer_connection_create_local_stream > ' + e, 1);
      }
    },

    /**
     * Requests the user media (audio/video)
     * @private
     * @param {Function} callback
     */
    _peer_get_user_media: function(callback) {
      this.get_debug().log('[JSJaCJingle:base] _peer_get_user_media', 4);

      try {
        if(this.get_local_stream() === null) {
          this.get_debug().log('[JSJaCJingle:base] _peer_get_user_media > Getting user media...', 2);

          (WEBRTC_GET_MEDIA.bind(navigator))(
            this.utils.generate_constraints(),
            this._peer_got_user_media_success.bind(this, callback),
            this._peer_got_user_media_error.bind(this)
          );
        } else {
          this.get_debug().log('[JSJaCJingle:base] _peer_get_user_media > User media already acquired.', 2);

          callback();
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _peer_get_user_media > ' + e, 1);
      }
    },

    /**
     * Triggers the media obtained success event
     * @private
     * @param {Function} callback
     * @param {Object} stream
     */
    _peer_got_user_media_success: function(callback, stream) {
      this.get_debug().log('[JSJaCJingle:base] _peer_got_user_media_success', 4);

      try {
        this.get_debug().log('[JSJaCJingle:base] _peer_got_user_media_success > Got user media.', 2);

        this._set_local_stream(stream);

        if(callback && typeof callback == 'function') {
          if((this.get_media() == JSJAC_JINGLE_MEDIA_VIDEO) && this.get_local_view().length) {
            this.get_debug().log('[JSJaCJingle:base] _peer_got_user_media_success > Waiting for local video to be loaded...', 2);

            var _this = this;

            var fn_loaded = function() {
              _this.get_debug().log('[JSJaCJingle:base] _peer_got_user_media_success > Local video loaded.', 2);

              this.removeEventListener('loadeddata', fn_loaded, false);
              callback();
            };

            _this.get_local_view()[0].addEventListener('loadeddata', fn_loaded, false);
          } else {
            callback();
          }
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _peer_got_user_media_success > ' + e, 1);
      }
    },

    /**
     * Triggers the SDP description retrieval success event
     * @private
     * @param {Object} sdp_local
     * @param {Function} [sdp_message_callback]
     */
    _peer_got_description: function(sdp_local, sdp_message_callback) {
      this.get_debug().log('[JSJaCJingle:base] _peer_got_description', 4);

      try {
        this.get_debug().log('[JSJaCJingle:base] _peer_got_description > Got local description.', 2);

        if(this.get_sdp_trace())  this.get_debug().log('[JSJaCJingle:base] _peer_got_description > SDP (local:raw)' + '\n\n' + sdp_local.sdp, 4);

        // Convert SDP raw data to an object
        var cur_name;
        var payload_parsed = this.sdp._parse_payload(sdp_local.sdp);
        this.sdp._resolution_payload(payload_parsed);

        for(cur_name in payload_parsed) {
          this._set_payloads_local(
            cur_name,
            payload_parsed[cur_name]
          );
        }

        var cur_semantics;
        var group_parsed = this.sdp._parse_group(sdp_local.sdp);

        for(cur_semantics in group_parsed) {
          this._set_group_local(
            cur_semantics,
            group_parsed[cur_semantics]
          );
        }

        // Filter our local description (remove unused medias)
        var sdp_local_desc = this.sdp._generate_description(
          sdp_local.type,
          this.get_group_local(),
          this.get_payloads_local(),

          this.sdp._generate_candidates(
            this.get_candidates_local()
          )
        );

        if(this.get_sdp_trace())  this.get_debug().log('[JSJaCJingle:base] _peer_got_description > SDP (local:gen)' + '\n\n' + sdp_local_desc.sdp, 4);

        var _this = this;

        this.get_peer_connection().setLocalDescription(
          (new WEBRTC_SESSION_DESCRIPTION(sdp_local_desc)),

          function() {
            // Success (descriptions are compatible)
          },

          function(e) {
            if(_this.get_sdp_trace())  _this.get_debug().log('[JSJaCJingle:base] _peer_got_description > SDP (local:error)' + '\n\n' + (e.message || e.name || 'Unknown error'), 4);

            // Error (descriptions are incompatible)
          }
        );

        // Need to wait for local candidates?
        if(typeof sdp_message_callback == 'function') {
          this.get_debug().log('[JSJaCJingle:base] _peer_got_description > Executing SDP message callback.', 2);

          /* @function */
          sdp_message_callback();
        } else if(this.utils.count_candidates(this._local_user_candidates()) === 0) {
          this.get_debug().log('[JSJaCJingle:base] _peer_got_description > Waiting for local candidates...', 2);
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _peer_got_description > ' + e, 1);
      }
    },

    /**
     * Triggers the SDP description not retrieved error event
     * @private
     */
    _peer_fail_description: function() {
      this.get_debug().log('[JSJaCJingle:base] _peer_fail_description', 4);

      try {
        this.get_debug().log('[JSJaCJingle:base] _peer_fail_description > Could not get local description!', 1);
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _peer_fail_description > ' + e, 1);
      }
    },

    /**
     * Enables/disables the local stream sound
     * @private
     * @param {Boolean} enable
     */
    _peer_sound: function(enable) {
      this.get_debug().log('[JSJaCJingle:base] _peer_sound', 4);

      try {
        this.get_debug().log('[JSJaCJingle:base] _peer_sound > Enable: ' + enable, 2);

        var i;
        var audio_tracks = this.get_local_stream().getAudioTracks();

        for(i = 0; i < audio_tracks.length; i++)
          audio_tracks[i].enabled = enable;
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _peer_sound > ' + e, 1);
      }
    },

    /**
     * Attaches given stream to given DOM element
     * @private
     * @param {DOM} element
     * @param {Object} stream
     * @param {Boolean} mute
     */
    _peer_stream_attach: function(element, stream, mute) {
      try {
        var i;
        var stream_src = stream ? URL.createObjectURL(stream) : '';

        for(i in element) {
          element[i].src = stream_src;

          if(navigator.mozGetUserMedia)
            element[i].play();
          else
            element[i].autoplay = true;

          if(typeof mute == 'boolean') element[i].muted = mute;
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _peer_stream_attach > ' + e, 1);
      }
    },

    /**
     * Detaches stream from given DOM element
     * @private
     * @param {DOM} element
     */
    _peer_stream_detach: function(element) {
      try {
        var i;

        for(i in element) {
          element[i].pause();
          element[i].src = '';
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _peer_stream_detach > ' + e, 1);
      }
    },



    /**
     * JSJSAC JINGLE SHORTCUTS
     */

    /**
     * Am I responder?
     * @public
     * @returns {Boolean} Receiver state
     */
    is_responder: function() {
      return this.utils.negotiation_status() == JSJAC_JINGLE_SENDERS_RESPONDER.jingle;
    },

    /**
     * Am I initiator?
     * @public
     * @returns {Boolean} Initiator state
     */
    is_initiator: function() {
      return this.utils.negotiation_status() == JSJAC_JINGLE_SENDERS_INITIATOR.jingle;
    },



    /**
     * JSJSAC JINGLE GETTERS
     */

    /**
     * Gets the namespace
     * @public
     * @returns {String} Namespace value
     */
    get_namespace: function() {
      return this._namespace;
    },

    /**
     * Gets the local stream
     * @public
     * @returns {Object} Local stream instance
     */
    get_local_stream: function() {
      return this._local_stream;
    },

    /**
     * Gets the local payloads
     * @public
     * @param {String} [name]
     * @returns {Object} Local payloads object
     */
    get_payloads_local: function(name) {
      if(name)
        return (name in this._payloads_local) ? this._payloads_local[name] : {};

      return this._payloads_local;
    },

    /**
     * Gets the local group
     * @public
     * @param {String} [semantics]
     * @returns {Object} Local group object
     */
    get_group_local: function(semantics) {
      if(semantics)
        return (semantics in this._group_local) ? this._group_local[semantics] : {};

      return this._group_local;
    },

    /**
     * Gets the local candidates
     * @public
     * @param {String} [name]
     * @returns {Object} Local candidates object
     */
    get_candidates_local: function(name) {
      if(name)
        return (name in this._candidates_local) ? this._candidates_local[name] : {};

      return this._candidates_local;
    },

    /**
     * Gets the local candidates queue
     * @public
     * @param {String} [name]
     * @returns {Object} Local candidates queue object
     */
    get_candidates_queue_local: function(name) {
      if(name)
        return (name in this._candidates_queue_local) ? this._candidates_queue_local[name] : {};

      return this._candidates_queue_local;
    },

    /**
     * Gets the local content
     * @public
     * @param {String} [name]
     * @returns {Object} Local content object
     */
    get_content_local: function(name) {
      if(name)
        return (name in this._content_local) ? this._content_local[name] : {};

      return this._content_local;
    },

    /**
     * Gets the peer connection
     * @public
     * @returns {Object} Peer connection
     */
    get_peer_connection: function() {
      return this._peer_connection;
    },

    /**
     * Gets the ID
     * @public
     * @returns {Number} ID value
     */
    get_id: function() {
      return this._id;
    },

    /**
     * Gets the new ID
     * @public
     * @returns {String} New ID value
     */
    get_id_new: function() {
      var trans_id = this.get_id() + 1;
      this._set_id(trans_id);

      return this.get_id_pre() + trans_id;
    },

    /**
     * Gets the sent IDs
     * @public
     * @returns {Object} Sent IDs object
     */
    get_sent_id: function() {
      return this._sent_id;
    },

    /**
     * Gets the received IDs
     * @public
     * @returns {Object} Received IDs object
     */
    get_received_id: function() {
      return this._received_id;
    },

    /**
     * Gets the registered stanza handler
     * @public
     * @param {String} type
     * @param {String} id
     * @returns {Array} Stanza handler
     */
    get_registered_handlers: function(type, id) {
      type = type || JSJAC_JINGLE_IQ_TYPE_ALL;

      if(id) {
        if(type != JSJAC_JINGLE_IQ_TYPE_ALL && type in this._registered_handlers && typeof this._registered_handlers[type][id] == 'object')
          return this._registered_handlers[type][id];

        if(JSJAC_JINGLE_IQ_TYPE_ALL in this._registered_handlers && typeof this._registered_handlers[JSJAC_JINGLE_IQ_TYPE_ALL][id] == 'object')
          return this._registered_handlers[type][id];
      }

      return [];
    },

    /**
     * Gets the deferred stanza handler
     * @public
     * @param {String} ns
     * @returns {Array} Stanza handler
     */
    get_deferred_handlers: function(ns) {
      return this._deferred_handlers[ns] || [];
    },

    /**
     * Gets the mute state
     * @public
     * @param {String} [name]
     * @returns {Boolean} Mute value
     */
    get_mute: function(name) {
      if(!name) name = '*';

      return (name in this._mute) ? this._mute[name] : false;
    },

    /**
     * Gets the lock value
     * @public
     * @returns {Boolean} Lock value
     */
    get_lock: function() {
      return this._lock || !JSJAC_JINGLE_AVAILABLE;
    },

    /**
     * Gets the media busy value
     * @public
     * @returns {Boolean} Media busy value
     */
    get_media_busy: function() {
      return this._media_busy;
    },

    /**
     * Gets the sid value
     * @public
     * @returns {String} SID value
     */
    get_sid: function() {
      return this._sid;
    },

    /**
     * Gets the status value
     * @public
     * @returns {String} Status value
     */
    get_status: function() {
      return this._status;
    },

    /**
     * Gets the connection value
     * @public
     * @returns {JSJaCConnection} Connection value
     */
    get_connection: function() {
      return this._connection;
    },

    /**
     * Gets the to value
     * @public
     * @returns {String} To value
     */
    get_to: function() {
      return this._to;
    },

    /**
     * Gets the initiator value
     * @public
     * @returns {String} Initiator value
     */
    get_initiator: function() {
      return this._initiator;
    },

    /**
     * Gets the responder value
     * @public
     * @returns {String} Responder value
     */
    get_responder: function() {
      return this._responder;
    },

    /**
     * Gets the creator value
     * @public
     * @param {String} [name]
     * @returns {String|Object} Creator value
     */
    get_creator: function(name) {
      if(name)
        return (name in this._creator) ? this._creator[name] : null;

      return this._creator;
    },

    /**
     * Gets the creator value (for this)
     * @public
     * @param {String} name
     * @returns {String} Creator value
     */
    get_creator_this: function(name) {
      return this.get_responder() == this.get_to() ? JSJAC_JINGLE_CREATOR_INITIATOR : JSJAC_JINGLE_CREATOR_RESPONDER;
    },

    /**
     * Gets the senders value
     * @public
     * @param {String} [name]
     * @returns {String} Senders value
     */
    get_senders: function(name) {
      if(name)
        return (name in this._senders) ? this._senders[name] : null;

      return this._senders;
    },

    /**
     * Gets the media value
     * @public
     * @returns {String} Media value
     */
    get_media: function() {
      return (this._media && this._media in JSJAC_JINGLE_MEDIAS) ? this._media : JSJAC_JINGLE_MEDIA_VIDEO;
    },

    /**
     * Gets a list of medias in use
     * @public
     * @returns {Object} Media list
     */
    get_media_all: function() {
      if(this.get_media() == JSJAC_JINGLE_MEDIA_AUDIO)
        return [JSJAC_JINGLE_MEDIA_AUDIO];

      return [JSJAC_JINGLE_MEDIA_AUDIO, JSJAC_JINGLE_MEDIA_VIDEO];
    },

    /**
     * Gets the video source value
     * @public
     * @returns {String} Video source value
     */
    get_video_source: function() {
      return (this._video_source && this._video_source in JSJAC_JINGLE_VIDEO_SOURCES) ? this._video_source : JSJAC_JINGLE_VIDEO_SOURCE_CAMERA;
    },

    /**
     * Gets the resolution value
     * @public
     * @returns {String} Resolution value
     */
    get_resolution: function() {
      return this._resolution ? (this._resolution).toString() : null;
    },

    /**
     * Gets the bandwidth value
     * @public
     * @returns {String} Bandwidth value
     */
    get_bandwidth: function() {
      return this._bandwidth ? (this._bandwidth).toString() : null;
    },

    /**
     * Gets the FPS value
     * @public
     * @returns {String} FPS value
     */
    get_fps: function() {
      return this._fps ? (this._fps).toString() : null;
    },

    /**
     * Gets the name value
     * @public
     * @param {String} [name]
     * @returns {String} Name value
     */
    get_name: function(name) {
      if(name)
        return name in this._name;

      return this._name;
    },

    /**
     * Gets the local_view value
     * @public
     * @returns {DOM} Local view
     */
    get_local_view: function() {
      return (typeof this._local_view == 'object') ? this._local_view : [];
    },

    /**
     * Gets the STUN servers
     * @public
     * @returns {Object} STUN servers
     */
    get_stun: function() {
      return (typeof this._stun == 'object') ? this._stun : {};
    },

    /**
     * Gets the TURN servers
     * @public
     * @returns {Object} TURN servers
     */
    get_turn: function() {
      return (typeof this._turn == 'object') ? this._turn : {};
    },

    /**
     * Gets the SDP trace value
     * @public
     * @returns {Boolean} SDP trace value
     */
    get_sdp_trace: function() {
      return (this._sdp_trace === true);
    },

    /**
     * Gets the network packet trace value
     * @public
     * @returns {Boolean} Network packet trace value
     */
    get_net_trace: function() {
      return (this._net_trace === true);
    },

    /**
     * Gets the debug value
     * @public
     * @returns {JSJaCDebugger} Debug value
     */
    get_debug: function() {
      return this._debug;
    },



    /**
     * JSJSAC JINGLE SETTERS
     */

    /**
     * Sets the namespace
     * @private
     * @param {String} Namespace value
     */
    _set_namespace: function(namespace) {
      this._namespace = namespace;
    },

    /**
     * Sets the local stream
     * @private
     * @param {Object} local_stream
     */
    _set_local_stream: function(local_stream) {
      try {
        if(!local_stream && this._local_stream) {
          (this._local_stream).stop();

          this._peer_stream_detach(
            this.get_local_view()
          );
        }

        this._local_stream = local_stream;

        if(local_stream) {
          this._peer_stream_attach(
            this.get_local_view(),
            this.get_local_stream(),
            true
          );
        } else {
          this._peer_stream_detach(
            this.get_local_view()
          );
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _set_local_stream > ' + e, 1);
      }
    },

    /**
     * Sets the local view
     * @private
     * @param {DOM} local_view
     */
    _set_local_view: function(local_view) {
      if(typeof this._local_view !== 'object')
        this._local_view = [];

      this._local_view.push(local_view);
    },

    /**
     * Sets the local payload
     * @private
     * @param {String} name
     * @param {Object} payload_data
     */
    _set_payloads_local: function(name, payload_data) {
      this._payloads_local[name] = payload_data
    },

    /**
     * Sets the local group
     * @private
     * @param {String} name
     * @param {Object} group_data
     */
    _set_group_local: function(semantics, group_data) {
      this._group_local[semantics] = group_data;
    },

    /**
     * Sets the local candidates
     * @private
     * @param {String} name
     * @param {Object} candidate_data
     */
    _set_candidates_local: function(name, candidate_data) {
      if(!(name in this._candidates_local))  this._candidates_local[name] = [];

      (this._candidates_local[name]).push(candidate_data);
    },

    /**
     * Sets the local candidates queue
     * @private
     * @param {String} name
     * @param {Object} candidate_data
     */
    _set_candidates_queue_local: function(name, candidate_data) {
      try {
        if(name === null) {
          this._candidates_queue_local = {};
        } else {
          if(!(name in this._candidates_queue_local))  this._candidates_queue_local[name] = [];

          (this._candidates_queue_local[name]).push(candidate_data);
        }
      } catch(e) {
        this.get_debug().log('[JSJaCJingle:base] _set_candidates_queue_local > ' + e, 1);
      }
    },

    /**
     * Sets the local content
     * @private
     * @param {String} name
     * @param {Object} content_local
     */
    _set_content_local: function(name, content_local) {
      this._content_local[name] = content_local;
    },

    /**
     * Sets the peer connection
     * @private
     * @param {Object} peer_connection
     */
    _set_peer_connection: function(peer_connection) {
      this._peer_connection = peer_connection;
    },

    /**
     * Sets the ID
     * @private
     * @param {String|Number} id
     */
    _set_id: function(id) {
      this._id = id;
    },

    /**
     * Sets the sent ID
     * @private
     * @param {String|Number} sent_id
     */
    _set_sent_id: function(sent_id) {
      this._sent_id[sent_id] = 1;
    },

    /**
     * Sets the last received ID
     * @private
     * @param {String|Number} received_id
     */
    _set_received_id: function(received_id) {
      this._received_id[received_id] = 1;
    },

    /**
     * Sets the registered stanza handlers
     * @private
     * @param {String} type
     * @param {String|Number} id
     * @param {Function} handler
     */
    _set_registered_handlers: function(type, id, handler) {
      if(!(type in this._registered_handlers))  this._registered_handlers[type] = {};

      if(handler === null) {
        if(id in this._registered_handlers[type])
          delete this._registered_handlers[type][id];
      } else {
        if(typeof this._registered_handlers[type][id] != 'object')
          this._registered_handlers[type][id] = [];

        this._registered_handlers[type][id].push(handler);
      }
    },

    /**
     * Sets the deferred stanza handlers
     * @private
     * @param {String} ns
     * @param {Function|Object} handler
     */
    _set_deferred_handlers: function(ns, handler) {
      if(!(ns in this._deferred_handlers))  this._deferred_handlers[ns] = [];

      if(handler === null)
        delete this._deferred_handlers[ns];
      else
        this._deferred_handlers[ns].push(handler);
    },

    /**
     * Sets the mute state
     * @private
     * @param {String} [name]
     * @param {String} mute
     */
    _set_mute: function(name, mute) {
      if(!name || name == '*') {
        this._mute = {};
        name = '*';
      }

      this._mute[name] = mute;
    },

    /**
     * Sets the lock value
     * @private
     * @param {Boolean} lock
     */
    _set_lock: function(lock) {
      this._lock = lock;
    },

    /**
     * Gets the media busy value
     * @private
     * @param {Boolean} busy
     */
    _set_media_busy: function(busy) {
      this._media_busy = busy;
    },

    /**
     * Sets the session ID
     * @private
     * @param {String} sid
     */
    _set_sid: function(sid) {
      this._sid = sid;
    },

    /**
     * Sets the session status
     * @private
     * @param {String} status
     */
    _set_status: function(status) {
      this._status = status;
    },

    /**
     * Sets the session to value
     * @private
     * @param {String} to
     */
    _set_to: function(to) {
      this._to = to;
    },

    /**
     * Sets the session connection value
     * @private
     * @param {JSJaCConnection} connection
     */
    _set_to: function(connection) {
      this._connection = connection;
    },

    /**
     * Sets the session initiator
     * @private
     * @param {String} initiator
     */
    _set_initiator: function(initiator) {
      this._initiator = initiator;
    },

    /**
     * Sets the session responder
     * @private
     * @param {String} responder
     */
    _set_responder: function(responder) {
      this._responder = responder;
    },

    /**
     * Sets the session creator
     * @private
     * @param {String} name
     * @param {String} creator
     */
    _set_creator: function(name, creator) {
      if(!(creator in JSJAC_JINGLE_CREATORS)) creator = JSJAC_JINGLE_CREATOR_INITIATOR;

      this._creator[name] = creator;
    },

     /**
     * Sets the session senders
     * @private
     * @param {String} name
     * @param {String} senders
     */
    _set_senders: function(name, senders) {
      if(!(senders in JSJAC_JINGLE_SENDERS)) senders = JSJAC_JINGLE_SENDERS_BOTH.jingle;

      this._senders[name] = senders;
    },

    /**
     * Sets the session media
     * @private
     * @param {String} media
     */
    _set_media: function(media) {
      this._media = media;
    },

    /**
     * Sets the video source
     * @private
     */
    _set_video_source: function() {
      this._video_source = video_source;
    },

    /**
     * Sets the video resolution
     * @private
     * @param {String} resolution
     */
    _set_resolution: function(resolution) {
      this._resolution = resolution;
    },

    /**
     * Sets the video bandwidth
     * @private
     * @param {Number} bandwidth
     */
    _set_bandwidth: function(bandwidth) {
      this._bandwidth = bandwidth;
    },

    /**
     * Sets the video FPS
     * @private
     * @param {Number} fps
     */
    _set_fps: function(fps) {
      this._fps = fps;
    },

    /**
     * Sets the source name
     * @private
     * @param {String} name
     */
    _set_name: function(name) {
      this._name[name] = 1;
    },

    /**
     * Sets the STUN server address
     * @private
     * @param {String} stun_host
     * @param {Object} stun_data
     */
    _set_stun: function(stun_host, stun_data) {
      this._stun[stun_host] = stun_data;
    },

    /**
     * Sets the TURN server address
     * @private
     * @param {String} turn_host
     * @param {Object} turn_data
     */
    _set_turn: function(turn_host, turn_data) {
      this._turn[turn_host] = turn_data;
    },

    /**
     * Enables/disables SDP traces
     * @public
     * @param {Boolean} sdp_trace
     */
    set_sdp_trace: function(sdp_trace) {
      this._sdp_trace = sdp_trace;
    },

    /**
     * Enables/disables network traces
     * @public
     * @param {Boolean} net_trace
     */
    set_net_trace: function(net_trace) {
      this._net_trace = net_trace;
    },

    /**
     * Sets the debugging wrapper
     * @public
     * @param {JSJaCDebugger} debug
     */
    set_debug: function(debug) {
      this._debug = debug;
    },
  }
);