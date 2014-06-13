/**
 * @fileoverview JSJaC Jingle library - Base call lib
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/**
 * Creates a new XMPP Jingle session.
 * @class Abstract base class for XMPP Jingle sessions. Contains all of the code in common for all Jingle sessions
 * @constructor
 * @abstract
 * @param {Object} args Jingle session arguments.
 * @param {DOM} args.local_view The path to the local stream view element.
 * @param {string} args.to The full JID to start the Jingle session with.
 * @param {string} args.media The media type to be used in the Jingle session.
 * @param {string} args.resolution The resolution to be used for video in the Jingle session.
 * @param {string} args.bandwidth The bandwidth to be limited for video in the Jingle session.
 * @param {string} args.fps The framerate to be used for video in the Jingle session.
 * @param {object} args.stun A list of STUN servers to use (override the default one).
 * @param {object} args.turn A list of TURN servers to use.
 * @param {boolean} args.sdp_trace Log SDP trace in console (requires a debug interface).
 * @param {boolean} args.net_trace Log network packet trace in console (requires a debug interface).
 * @param {JSJaCDebugger} args.debug A reference to a debugger implementing the JSJaCDebugger interface.
 */

var __JSJaCJingleBase = ring.create({
  /**
   * Constructor
   */
  constructor: function(args) {
    this.utils  = new JSJaCJingleUtils(this);
    this.sdp    = new JSJaCJingleSDP(this);

    if(args && args.to)
      /**
       * @private
       */
      this._to = args.to;

    if(args && args.media)
      /**
       * @private
       */
      this._media = args.media;

    if(args && args.video_source)
      /**
       * @private
       */
      this._video_source = args.video_source;

    if(args && args.resolution)
      /**
       * @private
       */
      this._resolution = args.resolution;

    if(args && args.bandwidth)
      /**
       * @private
       */
      this._bandwidth = args.bandwidth;

    if(args && args.fps)
      /**
       * @private
       */
      this._fps = args.fps;

    if(args && args.local_view)
      /**
       * @private
       */
      this._local_view = [args.local_view];

    if(args && args.stun) {
      /**
       * @private
       */
      this._stun = args.stun;
    } else {
      this._stun = {};
    }

    if(args && args.turn) {
      /**
       * @private
       */
      this._turn = args.turn;
    } else {
      this._turn = {};
    }

    if(args && args.sdp_trace)
      /**
       * @private
       */
      this._sdp_trace = args.sdp_trace;

    if(args && args.net_trace)
      /**
       * @private
       */
      this._net_trace = args.net_trace;

    if(args && args.debug && args.debug.log) {
      /**
       * Reference to debugger interface
       * (needs to implement method <code>log</code>)
       * @private
       * @type JSJaCDebugger
       */
      this._debug = args.debug;
    } else {
      /**
       * @private
       */
      this._debug = JSJAC_JINGLE_STORE_DEBUG;
    }

    /**
     * @private
     */
    this._initiator = '';

    /**
     * @private
     */
    this._responder = '';

    /**
     * @private
     */
    this._creator = {};

    /**
     * @private
     */
    this._senders = {};

    /**
     * @private
     */
    this._local_stream = null;

    /**
     * @private
     */
    this._content_local = {};

    /**
     * @private
     */
    this._peer_connection = {};

    /**
     * @private
     */
    this._id = 0;

    /**
     * @private
     */
    this._sent_id = {};

    /**
     * @private
     */
    this._received_id = {};

    /**
     * @private
     */
    this._payloads_local = [];

    /**
     * @private
     */
    this._group_local = {};

    /**
     * @private
     */
    this._candidates_local = {};

    /**
     * @private
     */
    this._candidates_queue_local = {};

    /**
     * @private
     */
    this._handlers = {};

    /**
     * @private
     */
    this._mute = {};

    /**
     * @private
     */
    this._lock = false;

    /**
     * @private
     */
    this._media_busy = false;

    /**
     * @private
     */
    this._sid = '';

    /**
     * @private
     */
    this._name = {};

    /**
     * @private
     */
    this._remote_view = {};

    /**
     * @private
     */
    this._remote_stream = {};

    /**
     * @private
     */
    this._content_remote = {};

    /**
     * @private
     */
    this._payloads_remote = {};

    /**
     * @private
     */
    this._group_remote = {};

    /**
     * @private
     */
    this._candidates_remote = {};

    /**
     * @private
     */
    this._candidates_queue_remote = {};
  },



  /**
   * JSJSAC JINGLE REGISTERS
   */

  /**
   * Registers a given handler on a given Jingle stanza
   * @public
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
        this._set_handlers(type, id, fn);

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
   */
  unregister_handler: function(type, id) {
    this.get_debug().log('[JSJaCJingle:base] unregister_handler', 4);

    try {
      type = type || JSJAC_JINGLE_IQ_TYPE_ALL;

      if(type in this._handlers && id in this._handlers[type]) {
        delete this._handlers[type][id];

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
   * Registers a view element
   * @public
   */
  register_view: function(username, type, view) {
    this.get_debug().log('[JSJaCJingle:base] register_view', 4);

    try {
      // Get view functions
      var fn = this.utils.map_register_view(username, type);

      if(fn.type == type) {
        var i;

        // Check view is not already registered
        for(i in (fn.view.get)(username)) {
          if((fn.view.get)(username)[i] == view) {
            this.get_debug().log('[JSJaCJingle:base] register_view > Could not register view of type: ' + type + ' (already registered).', 2);
            return true;
          }
        }

        // Proceeds registration
        (fn.view.set)(username, view);

        this.utils._peer_stream_attach(
          [view],
          (fn.stream.get)(username),
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
   */
  unregister_view: function(username, type, view) {
    this.get_debug().log('[JSJaCJingle:base] unregister_view', 4);

    try {
      // Get view functions
      var fn = this.utils.map_unregister_view(username, type);

      if(fn.type == type) {
        var i;

        // Check view is registered
        for(i in (fn.view.get)(username)) {
          if((fn.view.get)(username)[i] == view) {
            // Proceeds un-registration
            this.utils._peer_stream_detach(
              [view]
            );

            this.utils.array_remove_value(
              (fn.view.get)(username),
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
   */
  _peer_connection_create: function(username, sdp_message_callback) {
    this.get_debug().log('[JSJaCJingle:base] _peer_connection_create', 4);

    try {
      // Create peer connection instance
      this._peer_connection_create_instance(username);

      // Event callbacks
      var _this = this;

      this.get_peer_connection(username).onicecandidate = function(e) {
        _this._peer_connection_callback_onicecandidate.bind(this)(_this, sdp_message_callback, e);
      };

      this.get_peer_connection(username).oniceconnectionstatechange = function(e) {
        _this._peer_connection_callback_oniceconnectionstatechange.bind(this)(_this, username, e);
      };

      this.get_peer_connection(username).onaddstream = function(e) {
        _this._peer_connection_callback_onaddstream.bind(this)(_this, username, e);
      };

      this.get_peer_connection(username).onremovestream = function(e) {
        _this._peer_connection_callback_onremovestream.bind(this)(_this, username, e);
      };

      // Add local stream
      this._peer_connection_create_local_stream(username);

      // Create offer
      this._peer_connection_create_offer(username);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:base] _peer_connection_create > ' + e, 1);
    }
  },

  /**
   * Creates peer connection instance
   * @private
   */
  _peer_connection_create_instance: function(username) {
    this.get_debug().log('[JSJaCJingle:base] _peer_connection_create_instance', 4);

    try {
      // Log STUN servers in use
      var i;
      var ice_config = this.utils.config_ice();

      if(typeof ice_config.iceServers == 'object') {
        for(i = 0; i < (ice_config.iceServers).length; i++)
          this.get_debug().log('[JSJaCJingle:base] _peer_connection_create_instance > Using ICE server at: ' + ice_config.iceServers[i].url + ' (' + (i + 1) + ').', 2);
      } else {
        this.get_debug().log('[JSJaCJingle:base] _peer_connection_create_instance > No ICE server configured. Network may not work properly.', 0);
      }

      // Create the RTCPeerConnection object
      this._set_peer_connection(
        username,

        new WEBRTC_PEER_CONNECTION(
          ice_config,
          WEBRTC_CONFIGURATION.peer_connection.constraints
        )
      );
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:base] _peer_connection_create_instance > ' + e, 1);
    }
  },

  /**
   * Generates peer connection callback for 'oniceconnectionstatechange'
   * @private
   */
  _peer_connection_callback_oniceconnectionstatechange: function(_this, username, e) {
    _this.get_debug().log('[JSJaCJingle:base] _peer_connection_callback_oniceconnectionstatechange', 4);

    try {
      // Connection errors?
      switch(this.iceConnectionState) {
        case 'disconnected':
          _this._peer_timeout(username, this.iceConnectionState, {
            timer  : JSJAC_JINGLE_PEER_TIMEOUT_DISCONNECT,
            reason : JSJAC_JINGLE_REASON_CONNECTIVITY_ERROR
          });
          break;

        case 'checking':
          _this._peer_timeout(username, this.iceConnectionState); break;
      }

      _this.get_debug().log('[JSJaCJingle:base] _peer_connection_callback_oniceconnectionstatechange > (state: ' + this.iceConnectionState + ').', 2);
    } catch(e) {
      _this.get_debug().log('[JSJaCJingle:base] _peer_connection_callback_oniceconnectionstatechange > ' + e, 1);
    }
  },

  /**
   * Generates peer connection callback for 'onaddstream'
   * @private
   */
  _peer_connection_callback_onaddstream: function(_this, username, e) {
    _this.get_debug().log('[JSJaCJingle:base] _peer_connection_callback_onaddstream', 4);

    try {
      if(!e) {
        _this.get_debug().log('[JSJaCJingle:base] _peer_connection_callback_onaddstream > No data passed, dropped.', 2); return;
      }

      // Attach remote stream to DOM view
      _this._set_remote_stream(username, e.stream);
    } catch(e) {
      _this.get_debug().log('[JSJaCJingle:base] _peer_connection_callback_onaddstream > ' + e, 1);
    }
  },

  /**
   * Generates peer connection callback for 'onremovestream'
   * @private
   */
  _peer_connection_callback_onremovestream: function(_this, username, e) {
    _this.get_debug().log('[JSJaCJingle:base] _peer_connection_callback_onremovestream', 4);

    try {
      // Detach remote stream from DOM view
      _this._set_remote_stream(username, null);
    } catch(e) {
      _this.get_debug().log('[JSJaCJingle:base] _peer_connection_callback_onremovestream > ' + e, 1);
    }
  },

  /**
   * Creates peer connection local stream
   * @private
   */
  _peer_connection_create_local_stream: function(username) {
    this.get_debug().log('[JSJaCJingle:base] _peer_connection_create_local_stream', 4);

    try {
      this.get_peer_connection(username).addStream(
        this.get_local_stream()
    	);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:base] _peer_connection_create_local_stream > ' + e, 1);
    }
  },

  /**
   * Requests the user media (audio/video)
   * @private
   */
  _peer_get_user_media: function(callback) {
    this.get_debug().log('[JSJaCJingle:base] _peer_get_user_media', 4);

    try {
      this.get_debug().log('[JSJaCJingle:base] _peer_get_user_media > Getting user media...', 2);

      (WEBRTC_GET_MEDIA.bind(navigator))(
        this.utils.generate_constraints(),
        this._peer_got_user_media_success.bind(this, callback),
        this._peer_got_user_media_error.bind(this)
      );
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:base] _peer_get_user_media > ' + e, 1);
    }
  },

  /**
   * Triggers the media obtained success event
   * @private
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
   */
  _peer_got_description: function(username, sdp_local) {
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

      this.get_peer_connection(username).setLocalDescription(
        (new WEBRTC_SESSION_DESCRIPTION(sdp_local_desc)),

        function() {
          // Success (descriptions are compatible)
        },

        function(e) {
          if(_this.get_sdp_trace())  _this.get_debug().log('[JSJaCJingle:base] _peer_got_description >SDP (local:error)' + '\n\n' + (e.message || e.name || 'Unknown error'), 4);

          // Error (descriptions are incompatible)
        }
      );

      this.get_debug().log('[JSJaCJingle:base] _peer_got_description > Waiting for local candidates...', 2);
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
   * @returns {boolean} Receiver state
   */
  is_responder: function() {
    return this.utils.negotiation_status() == JSJAC_JINGLE_SENDERS_RESPONDER.jingle;
  },

  /**
   * Am I initiator?
   * @public
   * @returns {boolean} Initiator state
   */
  is_initiator: function() {
    return this.utils.negotiation_status() == JSJAC_JINGLE_SENDERS_INITIATOR.jingle;
  },

  /**
   * Shortcut for commonly used tri-set-toggle
   * @private
   */
  _tri_toggle_set: function(db_obj, username, key, store_obj) {
    if(!(username in db_obj))  db_obj[username] = {};

    if(key === null) {
      delete db_obj[username];
    } else if(store_obj === null) {
      if(key in db_obj[username])
        delete db_obj[username][key];
    } else {
      db_obj[username][key] = store_obj;
    }
  },



  /**
   * JSJSAC JINGLE GETTERS
   */

  /**
   * Gets the namespace
   * @public
   * @returns {string} Namespace value
   */
  get_namespace: function() {
    return this._namespace;
  },

  /**
   * Gets the local stream
   * @public
   * @returns {object} Local stream instance
   */
  get_local_stream: function() {
    return this._local_stream;
  },

  /**
   * Gets the local payloads
   * @public
   * @returns {object} Local payloads object
   */
  get_payloads_local: function(name) {
    if(name)
      return (name in this._payloads_local) ? this._payloads_local[name] : {};

    return this._payloads_local;
  },

  /**
   * Gets the local group
   * @public
   * @returns {object} Local group object
   */
  get_group_local: function(semantics) {
    if(semantics)
      return (semantics in this._group_local) ? this._group_local[semantics] : {};

    return this._group_local;
  },

  /**
   * Gets the local candidates
   * @public
   * @returns {object} Local candidates object
   */
  get_candidates_local: function(name) {
    if(name)
      return (name in this._candidates_local) ? this._candidates_local[name] : {};

    return this._candidates_local;
  },

  /**
   * Gets the local candidates queue
   * @public
   * @returns {object} Local candidates queue object
   */
  get_candidates_queue_local: function(name) {
    if(name)
      return (name in this._candidates_queue_local) ? this._candidates_queue_local[name] : {};

    return this._candidates_queue_local;
  },

  /**
   * Gets the local content
   * @public
   * @returns {object} Local content object
   */
  get_content_local: function(name) {
    if(name)
      return (name in this._content_local) ? this._content_local[name] : {};

    return this._content_local;
  },

  /**
   * Gets the remote stream
   * @public
   * @returns {object} Remote stream instance
   */
  get_remote_stream: function(username) {
    if(username)
        return this._remote_stream[username];

    return this._remote_stream;
  },

  /**
   * Gets the remote content
   * @public
   * @returns {object} Remote content object
   */
  get_content_remote: function(username, name) {
    if(name)
      return (name in this._content_remote[username]) ? this._content_remote[username][name] : {};
    
    if(username)
        return this._content_remote[username];

    return this._content_remote;
  },

  /**
   * Gets the remote payloads
   * @public
   * @returns {object} Remote payloads object
   */
  get_payloads_remote: function(username, name) {
    if(name)
      return (username in this._payloads_remote  &&
              name in this._payloads_remote[username]) ? this._payloads_remote[username][name] : {};

    if(username)
        return this._payloads_remote[username];

    return this._payloads_remote;
  },

  /**
   * Gets the remote group
   * @public
   * @returns {object} Remote group object
   */
  get_group_remote: function(username, semantics) {
    if(semantics)
      return (username in this._group_remote  &&
              semantics in this._group_remote[username]) ? this._group_remote[username][semantics] : {};

    if(username)
        return this._group_remote[username];

    return this._group_remote;
  },

  /**
   * Gets the remote candidates
   * @public
   * @returns {object} Remote candidates object
   */
  get_candidates_remote: function(username, name) {
    if(name)
      return (username in this._candidates_remote  &&
              name in this._candidates_remote[username]) ? this._candidates_remote[username][name] : [];

    if(username)
        return this._candidates_remote[username];

    return this._candidates_remote;
  },

  /**
   * Gets the remote candidates queue
   * @public
   * @returns {object} Remote candidates queue object
   */
  get_candidates_queue_remote: function(username, name) {
    if(name)
      return (username in this._candidates_queue_remote  &&
              name in this._candidates_queue_remote[username]) ? this._candidates_queue_remote[username][name] : {};

    if(username)
        return this._candidates_queue_remote[username];

    return this._candidates_queue_remote;
  },

  /**
   * Gets the peer connection
   * @public
   * @returns {object} Peer connection
   */
  get_peer_connection: function(username) {
    if(username)
        return this._peer_connection[username];

    return this._peer_connection;
  },

  /**
   * Gets the ID
   * @public
   * @returns {number} ID value
   */
  get_id: function() {
    return this._id;
  },

  /**
   * Gets the new ID
   * @public
   * @returns {string} New ID value
   */
  get_id_new: function() {
    var trans_id = this.get_id() + 1;
    this._set_id(trans_id);

    return this.get_id_pre() + trans_id;
  },

  /**
   * Gets the sent IDs
   * @public
   * @returns {object} Sent IDs object
   */
  get_sent_id: function() {
    return this._sent_id;
  },

  /**
   * Gets the received IDs
   * @public
   * @returns {object} Received IDs object
   */
  get_received_id: function() {
    return this._received_id;
  },

  /**
   * Gets the stanza handler
   * @public
   * @returns {function} Stanza handler
   */
  get_handlers: function(type, id) {
    type = type || JSJAC_JINGLE_IQ_TYPE_ALL;

    if(id) {
      if(type != JSJAC_JINGLE_IQ_TYPE_ALL && type in this._handlers && typeof this._handlers[type][id] == 'function')
        return this._handlers[type][id];

      if(JSJAC_JINGLE_IQ_TYPE_ALL in this._handlers && typeof this._handlers[JSJAC_JINGLE_IQ_TYPE_ALL][id] == 'function')
        return this._handlers[type][id];
    }

    return null;
  },

  /**
   * Gets the mute state
   * @public
   * @returns {boolean} Mute value
   */
  get_mute: function(name) {
    if(!name) name = '*';

    return (name in this._mute) ? this._mute[name] : false;
  },

  /**
   * Gets the lock value
   * @public
   * @returns {boolean} Lock value
   */
  get_lock: function() {
    return this._lock || !JSJAC_JINGLE_AVAILABLE;
  },

  /**
   * Gets the media busy value
   * @public
   * @returns {boolean} Media busy value
   */
  get_media_busy: function() {
    return this._media_busy;
  },

  /**
   * Gets the sid value
   * @public
   * @returns {string} SID value
   */
  get_sid: function() {
    return this._sid;
  },

  /**
   * Gets the status value
   * @public
   * @returns {string} Status value
   */
  get_status: function() {
    return this._status;
  },

  /**
   * Gets the to value
   * @public
   * @returns {string} To value
   */
  get_to: function() {
    return this._to;
  },

  /**
   * Gets the initiator value
   * @public
   * @returns {string} Initiator value
   */
  get_initiator: function() {
    return this._initiator;
  },

  /**
   * Gets the responder value
   * @public
   * @returns {string} Responder value
   */
  get_responder: function() {
    return this._responder;
  },

  /**
   * Gets the creator value
   * @public
   * @returns {string} Creator value
   */
  get_creator: function(name) {
    if(name)
      return (name in this._creator) ? this._creator[name] : null;

    return this._creator;
  },

  /**
   * Gets the creator value (for this)
   * @public
   * @returns {string} Creator value
   */
  get_creator_this: function(name) {
    return this.get_responder() == this.get_to() ? JSJAC_JINGLE_CREATOR_INITIATOR : JSJAC_JINGLE_CREATOR_RESPONDER;
  },

  /**
   * Gets the senders value
   * @public
   * @returns {string} Senders value
   */
  get_senders: function(name) {
    if(name)
      return (name in this._senders) ? this._senders[name] : null;

    return this._senders;
  },

  /**
   * Gets the media value
   * @public
   * @returns {string} Media value
   */
  get_media: function() {
    return (this._media && this._media in JSJAC_JINGLE_MEDIAS) ? this._media : JSJAC_JINGLE_MEDIA_VIDEO;
  },

  /**
   * Gets a list of medias in use
   * @public
   * @returns {object} Media list
   */
  get_media_all: function() {
    if(this.get_media() == JSJAC_JINGLE_MEDIA_AUDIO)
      return [JSJAC_JINGLE_MEDIA_AUDIO];

    return [JSJAC_JINGLE_MEDIA_AUDIO, JSJAC_JINGLE_MEDIA_VIDEO];
  },

  /**
   * Gets the video source value
   * @public
   * @returns {string} Video source value
   */
  get_video_source: function() {
    return (this._video_source && this._video_source in JSJAC_JINGLE_VIDEO_SOURCES) ? this._video_source : JSJAC_JINGLE_VIDEO_SOURCE_CAMERA;
  },

  /**
   * Gets the resolution value
   * @public
   * @returns {string} Resolution value
   */
  get_resolution: function() {
    return this._resolution ? (this._resolution).toString() : null;
  },

  /**
   * Gets the bandwidth value
   * @public
   * @returns {string} Bandwidth value
   */
  get_bandwidth: function() {
    return this._bandwidth ? (this._bandwidth).toString() : null;
  },

  /**
   * Gets the FPS value
   * @public
   * @returns {string} FPS value
   */
  get_fps: function() {
    return this._fps ? (this._fps).toString() : null;
  },

  /**
   * Gets the name value
   * @public
   * @returns {string} Name value
   */
  get_name: function(name) {
    if(name)
      return name in this._name;

    return this._name;
  },

  /**
   * Gets the local_view value
   * @public
   * @returns {DOM} local_view value
   */
  get_local_view: function() {
    return (typeof this._local_view == 'object') ? this._local_view : [];
  },

  /**
   * Gets the remote_view value
   * @public
   * @returns {DOM} remote_view value
   */
  get_remote_view: function(username) {
    return (typeof this._remote_view == 'object'  &&
            username in this._remote_view) ? this._remote_view[username] : [];
  },

  /**
   * Gets the STUN servers
   * @public
   * @returns {object} STUN servers
   */
  get_stun: function() {
    return (typeof this._stun == 'object') ? this._stun : {};
  },

  /**
   * Gets the TURN servers
   * @public
   * @returns {object} TURN servers
   */
  get_turn: function() {
    return (typeof this._turn == 'object') ? this._turn : {};
  },

  /**
   * Gets the SDP trace value
   * @public
   * @returns {boolean} SDP trace value
   */
  get_sdp_trace: function() {
    return (this._sdp_trace === true);
  },

  /**
   * Gets the network packet trace value
   * @public
   * @returns {boolean} Network packet trace value
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
   * Sets the local stream
   * @private
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
   */
  _set_local_view: function(local_view) {
    if(typeof this._local_view !== 'object')
      this._local_view = [];

    this._local_view.push(local_view);
  },

  /**
   * Sets the remote view
   * @private
   */
  _set_remote_view: function(username, remote_view) {
    if(typeof this._remote_view !== 'object')
      this._remote_view = {};

    if(typeof this._remote_view[username] !== 'object')
      this._remote_view[username] = [];

    if(remote_view === null)
      delete this._remote_view[username];
    else
      this._remote_view[username].push(remote_view);
  },

  /**
   * Pops the given remote view
   * @private
   */
  _set_remote_view_pop: function(username, remote_view_pop) {
  	var i,
  	    remote_views, cur_remote_view,
  	    remote_views_new;

  	remote_views = this.get_remote_view(username);
  	remote_views_new = [];

  	for(i = 0; i < remote_views.length; i++) {
  		cur_remote_view = remote_views[i];

  		if(cur_remote_view !== remote_view_pop)
  			remote_views_new.push(cur_remote_view);
  	}

  	this._remote_view[username] = remote_views_new;
  },

  /**
   * Sets the local payload
   * @private
   */
  _set_payloads_local: function(name, payload_data) {
    this._payloads_local[name] = payload_data;
  },

  /**
   * Sets the local group
   * @private
   */
  _set_group_local: function(semantics, group_data) {
    this._group_local[semantics] = group_data;
  },

  /**
   * Sets the local candidates
   * @private
   */
  _set_candidates_local: function(name, candidate_data) {
    if(!(name in this._candidates_local))  this._candidates_local[name] = [];

    (this._candidates_local[name]).push(candidate_data);
  },

  /**
   * Sets the local candidates queue
   * @private
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
   */
  _set_content_local: function(name, content_local) {
    this._content_local[name] = content_local;
  },

  /**
   * Sets the remote content
   * @private
   */
  _set_content_remote: function(username, name, content_remote) {
    this._tri_toggle_set(
      this._content_remote,

      username,
      name,
      content_remote
    );
  },

  /**
   * Sets the remote payloads
   * @private
   */
  _set_payloads_remote: function(username, name, payload_data) {
    this._tri_toggle_set(
      this._payloads_remote,

      username,
      name,
      payload_data
    );
  },

  /**
   * Adds a remote payload
   * @private
   */
  _set_payloads_remote_add: function(username, name, payload_data) {
    try {
      if(!(username in this._payloads_remote))  this._payloads_remote[username] = {};

      if(!(name in this._payloads_remote[username])) {
        this._set_payloads_remote(username, name, payload_data);
      } else {
        var key;
        var payloads_store = this._payloads_remote[username][name].descriptions.payload;
        var payloads_add   = payload_data.descriptions.payload;

        for(key in payloads_add) {
          if(!(key in payloads_store))
            payloads_store[key] = payloads_add[key];
        }
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:base] _set_payloads_remote_add > ' + e, 1);
    }
  },

  /**
   * Sets the remote group
   * @private
   */
  _set_group_remote: function(username, semantics, group_data) {
    this._tri_toggle_set(
      this._group_remote,

      username,
      semantics,
      group_data
    );
  },

  /**
   * Sets the remote candidates
   * @private
   */
  _set_candidates_remote: function(username, name, candidate_data) {
    this._tri_toggle_set(
      this._candidates_remote,

      username,
      name,
      candidate_data
    );
  },

  /**
   * Sets the session initiate pending callback function
   * @private
   */
  _set_candidates_queue_remote: function(username, name, candidate_data) {
    this._tri_toggle_set(
      this._candidates_queue_remote,

      username,
      name,
      candidate_data
    );
  },

  /**
   * Adds a remote candidate
   * @private
   */
  _set_candidates_remote_add: function(username, name, candidate_data) {
    try {
      if(!name) return;

      if(!(username in this._candidates_remote))  this._candidates_remote[username] = {};

      if(!(name in this._candidates_remote[username]))
        this._set_candidates_remote(username, name, []);
   
      var c, i;
      var candidate_ids = [];

      for(c in this.get_candidates_remote(username, name))
        candidate_ids.push(this.get_candidates_remote(username, name)[c].id);

      for(i in candidate_data) {
        if((candidate_data[i].id).indexOf(candidate_ids) !== -1)
          this.get_candidates_remote(username, name).push(candidate_data[i]);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:base] _set_candidates_remote_add > ' + e, 1);
    }
  },

  /**
   * Sets the peer connection
   * @private
   */
  _set_peer_connection: function(username, peer_connection) {
    this._peer_connection[username] = peer_connection;
  },

  /**
   * Sets the ID
   * @private
   */
  _set_id: function(id) {
    this._id = id;
  },

  /**
   * Sets the sent ID
   * @private
   */
  _set_sent_id: function(sent_id) {
    this._sent_id[sent_id] = 1;
  },

  /**
   * Sets the last received ID
   * @private
   */
  _set_received_id: function(received_id) {
    this._received_id[received_id] = 1;
  },

  /**
   * Sets the stanza handlers
   * @private
   */
  _set_handlers: function(type, id, handler) {
    if(!(type in this._handlers))  this._handlers[type] = {};

    this._handlers[type][id] = handler;
  },

  /**
   * Sets the mute state
   * @private
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
   */
  _set_lock: function(lock) {
    this._lock = lock;
  },

  /**
   * Gets the media busy value
   * @private
   */
  _set_media_busy: function(busy) {
    this._media_busy = busy;
  },

  /**
   * Sets the session ID
   * @private
   */
  _set_sid: function(sid) {
    this._sid = sid;
  },

  /**
   * Sets the session status
   * @private
   */
  _set_status: function(status) {
    this._status = status;
  },

  /**
   * Sets the session to value
   * @private
   */
  _set_to: function(to) {
    this._to = to;
  },

  /**
   * Sets the session initiator
   * @private
   */
  _set_initiator: function(initiator) {
    this._initiator = initiator;
  },

  /**
   * Sets the session responder
   * @private
   */
  _set_responder: function(responder) {
    this._responder = responder;
  },

  /**
   * Sets the session creator
   * @private
   */
  _set_creator: function(name, creator) {
    if(!(creator in JSJAC_JINGLE_CREATORS)) creator = JSJAC_JINGLE_CREATOR_INITIATOR;

    this._creator[name] = creator;
  },

   /**
   * Sets the session senders
   * @private
   */
  _set_senders: function(name, senders) {
    if(!(senders in JSJAC_JINGLE_SENDERS)) senders = JSJAC_JINGLE_SENDERS_BOTH.jingle;

    this._senders[name] = senders;
  },

  /**
   * Sets the session media
   * @private
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
   */
  _set_resolution: function(resolution) {
    this._resolution = resolution;
  },

  /**
   * Sets the video bandwidth
   * @private
   */
  _set_bandwidth: function(bandwidth) {
    this._bandwidth = bandwidth;
  },

  /**
   * Sets the video FPS
   * @private
   */
  _set_fps: function(fps) {
    this._fps = fps;
  },

  /**
   * Sets the source name
   * @private
   */
  _set_name: function(name) {
    this._name[name] = 1;
  },

  /**
   * Sets the STUN server address
   * @private
   */
  _set_stun: function(stun_host, stun_data) {
    this._stun[stun_server] = stun_data;
  },

  /**
   * Sets the TURN server address
   * @private
   */
  _set_turn: function(turn_host, turn_data) {
    this._turn[turn_server] = turn_data;
  },

  /**
   * Enables/disables SDP traces
   * @public
   */
  set_sdp_trace: function(sdp_trace) {
    this._sdp_trace = sdp_trace;
  },

  /**
   * Enables/disables network traces
   * @public
   */
  set_net_trace: function(net_trace) {
    this._net_trace = net_trace;
  },

  /**
   * Sets the debugging wrapper
   * @public
   */
  set_debug: function(debug) {
    this._debug = debug;
  },
});
