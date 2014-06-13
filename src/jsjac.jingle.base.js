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
    this.peer   = new JSJaCJinglePeer(this);

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
    this.get_debug().log('[JSJaCJingle:single] register_handler', 4);

    try {
      type = type || JSJAC_JINGLE_IQ_TYPE_ALL;

      if(typeof fn !== 'function') {
        this.get_debug().log('[JSJaCJingle:single] register_handler > fn parameter not passed or not a function!', 1);
        return false;
      }

      if(id) {
        this.set_handlers(type, id, fn);

        this.get_debug().log('[JSJaCJingle:single] register_handler > Registered handler for id: ' + id + ' and type: ' + type, 3);
        return true;
      } else {
        this.get_debug().log('[JSJaCJingle:single] register_handler > Could not register handler (no ID).', 1);
        return false;
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] register_handler > ' + e, 1);
    }

    return false;
  },

  /**
   * Unregisters the given handler on a given Jingle stanza
   * @public
   */
  unregister_handler: function(type, id) {
    this.get_debug().log('[JSJaCJingle:single] unregister_handler', 4);

    try {
      type = type || JSJAC_JINGLE_IQ_TYPE_ALL;

      if(type in this._handlers && id in this._handlers[type]) {
        delete this._handlers[type][id];

        this.get_debug().log('[JSJaCJingle:single] unregister_handler > Unregistered handler for id: ' + id + ' and type: ' + type, 3);
        return true;
      } else {
        this.get_debug().log('[JSJaCJingle:single] unregister_handler > Could not unregister handler with id: ' + id + ' and type: ' + type + ' (not found).', 2);
        return false;
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] unregister_handler > ' + e, 1);
    }

    return false;
  },

  /**
   * Registers a view element
   * @public
   */
  register_view: function(username, type, view) {
    this.get_debug().log('[JSJaCJingle:single] register_view', 4);

    try {
      // Get view functions
      var fn = this.utils.map_register_view(username, type);

      if(fn.type == type) {
        var i;

        // Check view is not already registered
        for(i in (fn.view.get)(username)) {
          if((fn.view.get)(username)[i] == view) {
            this.get_debug().log('[JSJaCJingle:single] register_view > Could not register view of type: ' + type + ' (already registered).', 2);
            return true;
          }
        }

        // Proceeds registration
        (fn.view.set)(username, view);

        this.utils.peer_stream_attach(
          [view],
          (fn.stream.get)(username),
          fn.mute
        );

        this.get_debug().log('[JSJaCJingle:single] register_view > Registered view of type: ' + type, 3);

        return true;
      } else {
        this.get_debug().log('[JSJaCJingle:single] register_view > Could not register view of type: ' + type + ' (type unknown).', 1);
        return false;
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] register_view > ' + e, 1);
    }

    return false;
  },

  /**
   * Unregisters a view element
   * @public
   */
  unregister_view: function(username, type, view) {
    this.get_debug().log('[JSJaCJingle:single] unregister_view', 4);

    try {
      // Get view functions
      var fn = this.utils.map_unregister_view(username, type);

      if(fn.type == type) {
        var i;

        // Check view is registered
        for(i in (fn.view.get)(username)) {
          if((fn.view.get)(username)[i] == view) {
            // Proceeds un-registration
            this.utils.peer_stream_detach(
              [view]
            );

            this.utils.array_remove_value(
              (fn.view.get)(username),
              view
            );

            this.get_debug().log('[JSJaCJingle:single] unregister_view > Unregistered view of type: ' + type, 3);
            return true;
          }
        }

        this.get_debug().log('[JSJaCJingle:single] unregister_view > Could not unregister view of type: ' + type + ' (not found).', 2);
        return true;
      } else {
        this.get_debug().log('[JSJaCJingle:single] unregister_view > Could not unregister view of type: ' + type + ' (type unknown).', 1);
        return false;
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:single] unregister_view > ' + e, 1);
    }

    return false;
  },



  /**
   * JSJSAC JINGLE GETTERS
   */

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

    return this._payloads_remote
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
    this.set_id(trans_id);

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
   */
  set_local_stream: function(local_stream) {
    try {
      if(!local_stream && this._local_stream) {
        (this._local_stream).stop();

        this.peer.stream_detach(
          this.get_local_view()
        );
      }

      this._local_stream = local_stream;

      if(local_stream) {
        this.peer.stream_attach(
          this.get_local_view(),
          this.get_local_stream(),
          true
        );
      } else {
        this.peer.stream_detach(
          this.get_local_view()
        );
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:base] set_local_stream > ' + e, 1);
    }
  },

  /**
   * Sets the local view
   * @public
   */
  set_local_view: function(local_view) {
    if(typeof this._local_view !== 'object')
      this._local_view = [];

    this._local_view.push(local_view);
  },

  /**
   * Sets the remote view
   * @public
   */
  set_remote_view: function(username, remote_view) {
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
   * Sets the local payload
   * @public
   */
  set_payloads_local: function(name, payload_data) {
    this._payloads_local[name] = payload_data;
  },

  /**
   * Sets the local group
   * @public
   */
  set_group_local: function(semantics, group_data) {
    this._group_local[semantics] = group_data;
  },

  /**
   * Sets the local candidates
   * @public
   */
  set_candidates_local: function(name, candidate_data) {
    if(!(name in this._candidates_local))  this._candidates_local[name] = [];

    (this._candidates_local[name]).push(candidate_data);
  },

  /**
   * Sets the local candidates queue
   * @public
   */
  set_candidates_queue_local: function(name, candidate_data) {
    try {
      if(name === null) {
        this._candidates_queue_local = {};
      } else {
        if(!(name in this._candidates_queue_local))  this._candidates_queue_local[name] = [];

        (this._candidates_queue_local[name]).push(candidate_data);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:base] set_candidates_queue_local > ' + e, 1);
    }
  },

  /**
   * Sets the local content
   * @public
   */
  set_content_local: function(name, content_local) {
    this._content_local[name] = content_local;
  },

  /**
   * Sets the remote stream
   * @public
   */
  set_remote_stream: function(username, remote_stream) {
    try {
      if(!remote_stream && this._remote_stream[username]) {
        this.peer.stream_detach(
          this.get_remote_view(username)
        );
      }

      this._remote_stream[username] = remote_stream;

      if(remote_stream) {
        this.peer.stream_attach(
          this.get_remote_view(username),
          this.get_remote_stream(username),
          false
        );
      } else {
        this.peer.stream_detach(
          this.get_remote_view(username)
        );
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:base] set_remote_stream > ' + e, 1);
    }
  },

  /**
   * Sets the remote content
   * @public
   */
  set_content_remote: function(username, name, content_remote) {
    this._set_tri_toggle(
      this._content_remote,

      username,
      name,
      content_remote
    );
  },

  /**
   * Sets the remote payloads
   * @public
   */
  set_payloads_remote: function(username, name, payload_data) {
    this._set_tri_toggle(
      this._payloads_remote,

      username,
      name,
      payload_data
    );
  },

  /**
   * Adds a remote payload
   * @public
   */
  set_payloads_remote_add: function(username, name, payload_data) {
    try {
      if(!(username in this._payloads_remote))  this._payloads_remote[username] = {};

      if(!(name in this._payloads_remote[username])) {
        this.set_payloads_remote(username, name, payload_data);
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
      this.get_debug().log('[JSJaCJingle:base] set_payloads_remote_add > ' + e, 1);
    }
  },

  /**
   * Sets the remote group
   * @public
   */
  set_group_remote: function(username, semantics, group_data) {
    this._set_tri_toggle(
      this._group_remote,

      username,
      semantics,
      group_data
    );
  },

  /**
   * Sets the remote candidates
   * @public
   */
  set_candidates_remote: function(username, name, candidate_data) {
    this._set_tri_toggle(
      this._candidates_remote,

      username,
      name,
      candidate_data
    );
  },

  /**
   * Sets the session initiate pending callback function
   * @public
   */
  set_candidates_queue_remote: function(username, name, candidate_data) {
    this._set_tri_toggle(
      this._candidates_queue_remote,

      username,
      name,
      candidate_data
    );
  },

  /**
   * Adds a remote candidate
   * @public
   */
  set_candidates_remote_add: function(username, name, candidate_data) {
    try {
      if(!name) return;

      if(!(username in this._candidates_remote))  this._candidates_remote[username] = {};

      if(!(name in this._candidates_remote[username]))
        this.set_candidates_remote(username, name, []);
   
      var c, i;
      var candidate_ids = [];

      for(c in this.get_candidates_remote(username, name))
        candidate_ids.push(this.get_candidates_remote(username, name)[c].id);

      for(i in candidate_data) {
        if((candidate_data[i].id).indexOf(candidate_ids) !== -1)
          this.get_candidates_remote(username, name).push(candidate_data[i]);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:base] set_candidates_remote_add > ' + e, 1);
    }
  },

  /**
   * Sets the peer connection
   * @public
   */
  set_peer_connection: function(username, peer_connection) {
    this._peer_connection[username] = peer_connection;
  },

  /**
   * Sets the ID
   * @public
   */
  set_id: function(id) {
    this._id = id;
  },

  /**
   * Sets the sent ID
   * @public
   */
  set_sent_id: function(sent_id) {
    this._sent_id[sent_id] = 1;
  },

  /**
   * Sets the last received ID
   * @public
   */
  set_received_id: function(received_id) {
    this._received_id[received_id] = 1;
  },

  /**
   * Sets the stanza handlers
   * @public
   */
  set_handlers: function(type, id, handler) {
    if(!(type in this._handlers))  this._handlers[type] = {};

    this._handlers[type][id] = handler;
  },

  /**
   * Sets the mute state
   * @public
   */
  set_mute: function(name, mute) {
    if(!name || name == '*') {
      this._mute = {};
      name = '*';
    }

    this._mute[name] = mute;
  },

  /**
   * Sets the lock value
   * @public
   */
  set_lock: function(lock) {
    this._lock = lock;
  },

  /**
   * Gets the media busy value
   * @public
   */
  set_media_busy: function(busy) {
    this._media_busy = busy;
  },

  /**
   * Sets the session ID
   * @public
   */
  set_sid: function(sid) {
    this._sid = sid;
  },

  /**
   * Sets the session status
   * @public
   */
  set_status: function(status) {
    this._status = status;
  },

  /**
   * Sets the session to value
   * @public
   */
  set_to: function(to) {
    this._to = to;
  },

  /**
   * Sets the session media
   * @public
   */
  set_media: function(media) {
    this._media = media;
  },

  /**
   * Sets the video source
   * @public
   */
  set_video_source: function() {
    this._video_source = video_source;
  },

  /**
   * Sets the video resolution
   * @public
   */
  set_resolution: function(resolution) {
    this._resolution = resolution;
  },

  /**
   * Sets the video bandwidth
   * @public
   */
  set_bandwidth: function(bandwidth) {
    this._bandwidth = bandwidth;
  },

  /**
   * Sets the video FPS
   * @public
   */
  set_fps: function(fps) {
    this._fps = fps;
  },

  /**
   * Sets the source name
   * @public
   */
  set_name: function(name) {
    this._name[name] = 1;
  },

  /**
   * Sets the STUN server address
   * @public
   */
  set_stun: function(stun_host, stun_data) {
    this._stun[stun_server] = stun_data;
  },

  /**
   * Sets the TURN server address
   * @public
   */
  set_turn: function(turn_host, turn_data) {
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
  _set_tri_toggle: function(db_obj, username, key, store_obj) {
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
});
