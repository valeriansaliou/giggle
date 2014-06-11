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
         * @type JSJaCDebugger
         */
      this._debug = args.debug;
    } else {
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
    this._status = JSJAC_JINGLE_STATUS_INACTIVE;

    /**
     * @private
     */
    this._name = {};
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
   */
  set_local_view: function(local_view) {
    if(typeof this._local_view !== 'object')
      this._local_view = [];

    this._local_view.push(local_view);
  },

  /**
   * Sets the local payload
   */
  set_payloads_local: function(name, payload_data) {
    this._payloads_local[name] = payload_data;
  },

  /**
   * Sets the local group
   */
  set_group_local: function(semantics, group_data) {
    this._group_local[semantics] = group_data;
  },

  /**
   * Sets the local candidates
   */
  set_candidates_local: function(name, candidate_data) {
    if(!(name in this._candidates_local))  this._candidates_local[name] = [];

    (this._candidates_local[name]).push(candidate_data);
  },

  /**
   * Sets the local candidates queue
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
   */
  set_content_local: function(name, content_local) {
    this._content_local[name] = content_local;
  },

  /**
   * Sets the mute state
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
   */
  set_lock: function(lock) {
    this._lock = lock;
  },

  /**
   * Gets the media busy value
   */
  set_media_busy: function(busy) {
    this._media_busy = busy;
  },

  /**
   * Sets the session ID
   */
  set_sid: function(sid) {
    this._sid = sid;
  },

  /**
   * Sets the session status
   */
  set_status: function(status) {
    this._status = status;
  },

  /**
   * Sets the session to value
   */
  set_to: function(to) {
    this._to = to;
  },

  /**
   * Sets the session media
   */
  set_media: function(media) {
    this._media = media;
  },

  /**
   * Sets the video source
   */
  set_video_source: function() {
    this._video_source = video_source;
  },

  /**
   * Sets the video resolution
   */
  set_resolution: function(resolution) {
    this._resolution = resolution;
  },

  /**
   * Sets the video bandwidth
   */
  set_bandwidth: function(bandwidth) {
    this._bandwidth = bandwidth;
  },

  /**
   * Sets the video FPS
   */
  set_fps: function(fps) {
    this._fps = fps;
  },

  /**
   * Sets the source name
   */
  set_name: function(name) {
    this._name[name] = 1;
  },

  /**
   * Sets the STUN server address
   */
  set_stun: function(stun_host, stun_data) {
    this._stun[stun_server] = stun_data;
  },

  /**
   * Sets the TURN server address
   */
  set_turn: function(turn_host, turn_data) {
    this._turn[turn_server] = turn_data;
  },

  /**
   * Enables/disables SDP traces
   */
  set_sdp_trace: function(sdp_trace) {
    this._sdp_trace = sdp_trace;
  },

  /**
   * Enables/disables network traces
   */
  set_net_trace: function(net_trace) {
    this._net_trace = net_trace;
  },

  /**
   * Sets the debugging wrapper
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
});
