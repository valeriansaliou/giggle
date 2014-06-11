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
 * @class Somewhat abstract base class for XMPP Jingle sessions. Contains all
 * of the code in common for all Jingle sessions
 * @constructor
 * @param {Object} args Jingle session arguments.
 * @param {function} args.session_initiate_pending The initiate pending custom handler.
 * @param {function} args.session_initiate_success The initiate success custom handler.
 * @param {function} args.session_initiate_error The initiate error custom handler.
 * @param {function} args.session_initiate_request The initiate request custom handler.
 * @param {function} args.session_accept_pending The accept pending custom handler.
 * @param {function} args.session_accept_success The accept success custom handler.
 * @param {function} args.session_accept_error The accept error custom handler.
 * @param {function} args.session_accept_request The accept request custom handler.
 * @param {function} args.session_info_success The info success custom handler.
 * @param {function} args.session_info_error The info error custom handler.
 * @param {function} args.session_info_request The info request custom handler.
 * @param {function} args.session_terminate_pending The terminate pending custom handler.
 * @param {function} args.session_terminate_success The terminate success custom handler.
 * @param {function} args.session_terminate_error The terminate error custom handler.
 * @param {function} args.session_terminate_request The terminate request custom handler.
 * @param {DOM} args.local_view The path to the local stream view element.
 * @param {DOM} args.remote_view The path to the remote stream view element.
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
    
    if(args && args.session_initiate_pending)
      /**
       * @private
       */
      this._session_initiate_pending = args.session_initiate_pending;

    if(args && args.session_initiate_success)
      /**
       * @private
       */
      this._session_initiate_success = args.session_initiate_success;

    if(args && args.session_initiate_error)
      /**
       * @private
       */
      this._session_initiate_error = args.session_initiate_error;

    if(args && args.session_initiate_request)
      /**
       * @private
       */
      this._session_initiate_request = args.session_initiate_request;

    if(args && args.session_accept_pending)
      /**
       * @private
       */
      this._session_accept_pending = args.session_accept_pending;

    if(args && args.session_accept_success)
      /**
       * @private
       */
      this._session_accept_success = args.session_accept_success;

    if(args && args.session_accept_error)
      /**
       * @private
       */
      this._session_accept_error = args.session_accept_error;

    if(args && args.session_accept_request)
      /**
       * @private
       */
      this._session_accept_request = args.session_accept_request;

    if(args && args.session_info_success)
      /**
       * @private
       */
      this._session_info_success = args.session_info_success;

    if(args && args.session_info_error)
      /**
       * @private
       */
      this._session_info_error = args.session_info_error;

    if(args && args.session_info_request)
      /**
       * @private
       */
      this._session_info_request = args.session_info_request;

    if(args && args.session_terminate_pending)
      /**
       * @private
       */
      this._session_terminate_pending = args.session_terminate_pending;

    if(args && args.session_terminate_success)
      /**
       * @private
       */
      this._session_terminate_success = args.session_terminate_success;

    if(args && args.session_terminate_error)
      /**
       * @private
       */
      this._session_terminate_error = args.session_terminate_error;

    if(args && args.session_terminate_request)
      /**
       * @private
       */
      this._session_terminate_request = args.session_terminate_request;

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

    if(args && args.remote_view)
      /**
       * @private
       */
      this._remote_view = [args.remote_view];

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
    this._remote_stream = null;

    /**
     * @private
     */
    this._content_local = {};

    /**
     * @private
     */
    this._content_remote = {};

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
    this._senders = {};

    /**
     * @private
     */
    this._creator = {};

    /**
     * @private
     */
    this._status = JSJAC_JINGLE_STATUS_INACTIVE;

    /**
     * @private
     */
    this._reason = JSJAC_JINGLE_REASON_CANCEL;

    /**
     * @private
     */
    this._handlers = {};

    /**
     * @private
     */
    this._peer_connection = null;

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
  },

  

  /**
   * JSJSAC JINGLE GETTERS
   */

  /**
   * Gets the session initiate pending callback function
   */
  get_session_initiate_pending: function() {
    if(typeof this._session_initiate_pending == 'function')
      return this._session_initiate_pending;

    return function() {};
  },

  /**
   * Gets the session initiate success callback function
   */
  get_session_initiate_success: function() {
    if(typeof this._session_initiate_success == 'function')
      return this._session_initiate_success;

    return function(stanza) {};
  },

  /**
   * Gets the session initiate error callback function
   */
  get_session_initiate_error: function() {
    if(typeof this._session_initiate_error == 'function')
      return this._session_initiate_error;

    return function(stanza) {};
  },

  /**
   * Gets the session initiate request callback function
   */
  get_session_initiate_request: function() {
    if(typeof this._session_initiate_request == 'function')
      return this._session_initiate_request;

    return function(stanza) {};
  },

  /**
   * Gets the session accept pending callback function
   */
  get_session_accept_pending: function() {
    if(typeof this._session_accept_pending == 'function')
      return this._session_accept_pending;

    return function() {};
  },

  /**
   * Gets the session accept success callback function
   */
  get_session_accept_success: function() {
    if(typeof this._session_accept_success == 'function')
      return this._session_accept_success;

    return function(stanza) {};
  },

  /**
   * Gets the session accept error callback function
   */
  get_session_accept_error: function() {
    if(typeof this._session_accept_error == 'function')
      return this._session_accept_error;

    return function(stanza) {};
  },

  /**
   * Gets the session accept request callback function
   */
  get_session_accept_request: function() {
    if(typeof this._session_accept_request == 'function')
      return this._session_accept_request;

    return function(stanza) {};
  },

  /**
   * Gets the session info success callback function
   */
  get_session_info_success: function() {
    if(typeof this._session_info_success == 'function')
      return this._session_info_success;

    return function(stanza) {};
  },

  /**
   * Gets the session info error callback function
   */
  get_session_info_error: function() {
    if(typeof this._session_info_error == 'function')
      return this._session_info_error;

    return function(stanza) {};
  },

  /**
   * Gets the session info request callback function
   */
  get_session_info_request: function() {
    if(typeof this._session_info_request == 'function')
      return this._session_info_request;

    return function(stanza) {};
  },

  /**
   * Gets the session terminate pending callback function
   */
  get_session_terminate_pending: function() {
    if(typeof this._session_terminate_pending == 'function')
      return this._session_terminate_pending;

    return function() {};
  },

  /**
   * Gets the session terminate success callback function
   */
  get_session_terminate_success: function() {
    if(typeof this._session_terminate_success == 'function')
      return this._session_terminate_success;

    return function(stanza) {};
  },

  /**
   * Gets the session terminate error callback function
   */
  get_session_terminate_error: function() {
    if(typeof this._session_terminate_error == 'function')
      return this._session_terminate_error;

    return function(stanza) {};
  },

  /**
   * Gets the session terminate request callback function
   */
  get_session_terminate_request: function() {
    if(typeof this._session_terminate_request == 'function')
      return this._session_terminate_request;

    return function(stanza) {};
  },

  /**
   * Gets the local stream
   */
  get_local_stream: function() {
    return this._local_stream;
  },

  /**
   * Gets the remote stream
   */
  get_remote_stream: function() {
    return this._remote_stream;
  },

  /**
   * Gets the local payloads
   */
  get_payloads_local: function(name) {
    if(name)
      return (name in this._payloads_local) ? this._payloads_local[name] : {};

    return this._payloads_local;
  },

  /**
   * Gets the local group
   */
  get_group_local: function(semantics) {
    if(semantics)
      return (semantics in this._group_local) ? this._group_local[semantics] : {};

    return this._group_local;
  },

  /**
   * Gets the local candidates
   */
  get_candidates_local: function(name) {
    if(name)
      return (name in this._candidates_local) ? this._candidates_local[name] : {};

    return this._candidates_local;
  },

  /**
   * Gets the local candidates queue
   */
  get_candidates_queue_local: function(name) {
    if(name)
      return (name in this._candidates_queue_local) ? this._candidates_queue_local[name] : {};

    return this._candidates_queue_local;
  },

  /**
   * Gets the remote payloads
   */
  get_payloads_remote: function(name) {
    if(name)
      return (name in this._payloads_remote) ? this._payloads_remote[name] : {};

    return this._payloads_remote;
  },

  /**
   * Gets the remote group
   */
  get_group_remote: function(semantics) {
    if(semantics)
      return (semantics in this._group_remote) ? this._group_remote[semantics] : {};

    return this._group_remote;
  },

  /**
   * Gets the remote candidates
   */
  get_candidates_remote: function(name) {
    if(name)
      return (name in this._candidates_remote) ? this._candidates_remote[name] : [];

    return this._candidates_remote;
  },

  /**
   * Gets the remote candidates queue
   */
  get_candidates_queue_remote: function(name) {
    if(name)
      return (name in this._candidates_queue_remote) ? this._candidates_queue_remote[name] : {};

    return this._candidates_queue_remote;
  },

  /**
   * Gets the local content
   */
  get_content_local: function(name) {
    if(name)
      return (name in this._content_local) ? this._content_local[name] : {};

    return this._content_local;
  },

  /**
   * Gets the remote content
   */
  get_content_remote: function(name) {
    if(name)
      return (name in this._content_remote) ? this._content_remote[name] : {};

    return this._content_remote;
  },

  /**
   * Gets the stanza handlers
   */
  get_handlers: function(type, id) {
    type = type || JSJAC_JINGLE_STANZA_TYPE_ALL;

    if(id) {
      if(type != JSJAC_JINGLE_STANZA_TYPE_ALL && type in this._handlers && typeof this._handlers[type][id] == 'function')
        return this._handlers[type][id];

      if(JSJAC_JINGLE_STANZA_TYPE_ALL in this._handlers && typeof this._handlers[JSJAC_JINGLE_STANZA_TYPE_ALL][id] == 'function')
        return this._handlers[type][id];
    }

    return null;
  },

  /**
   * Gets the peer connection
   */
  get_peer_connection: function() {
    return this._peer_connection;
  },

  /**
   * Gets the ID
   */
  get_id: function() {
    return this._id;
  },

  /**
   * Gets the prepended ID
   */
  get_id_pre: function() {
    return JSJAC_JINGLE_STANZA_ID_PRE + '_' + (this.get_sid() || '0') + '_';
  },

  /**
   * Gets the new ID
   */
  get_id_new: function() {
    var trans_id = this.get_id() + 1;
    this.set_id(trans_id);

    return this.get_id_pre() + trans_id;
  },

  /**
   * Gets the sent ID
   */
  get_sent_id: function() {
    return this._sent_id;
  },

  /**
   * Gets the last received ID
   */
  get_received_id: function() {
    return this._received_id;
  },

  /**
   * Gets the mute state
   * @return mute value
   * @type boolean
   */
  get_mute: function(name) {
    if(!name) name = '*';

    return (name in this._mute) ? this._mute[name] : false;
  },

  /**
   * Gets the lock value
   * @return lock value
   * @type boolean
   */
  get_lock: function() {
    return this._lock || !JSJAC_JINGLE_AVAILABLE;
  },

  /**
   * Gets the media busy value
   * @return media busy value
   * @type boolean
   */
  get_media_busy: function() {
    return this._media_busy;
  },

  /**
   * Gets the sid value
   * @return sid value
   * @type string
   */
  get_sid: function() {
    return this._sid;
  },

  /**
   * Gets the status value
   * @return status value
   * @type string
   */
  get_status: function() {
    return this._status;
  },

  /**
   * Gets the reason value
   * @return reason value
   * @type string
   */
  get_reason: function() {
    return this._reason;
  },

  /**
   * Gets the to value
   * @return to value
   * @type string
   */
  get_to: function() {
    return this._to;
  },

  /**
   * Gets the media value
   * @return media value
   * @type string
   */
  get_media: function() {
    return (this._media && this._media in JSJAC_JINGLE_MEDIAS) ? this._media : JSJAC_JINGLE_MEDIA_VIDEO;
  },

  /**
   * Gets a list of medias in use
   * @return media list
   * @type object
   */
  get_media_all: function() {
    if(this.get_media() == JSJAC_JINGLE_MEDIA_AUDIO)
      return [JSJAC_JINGLE_MEDIA_AUDIO];

    return [JSJAC_JINGLE_MEDIA_AUDIO, JSJAC_JINGLE_MEDIA_VIDEO];
  },

  /**
   * Gets the video source value
   * @return video source value
   * @type string
   */
  get_video_source: function() {
    return (this._video_source && this._video_source in JSJAC_JINGLE_VIDEO_SOURCES) ? this._video_source : JSJAC_JINGLE_VIDEO_SOURCE_CAMERA;
  },

  /**
   * Gets the resolution value
   * @return resolution value
   * @type string
   */
  get_resolution: function() {
    return this._resolution ? (this._resolution).toString() : null;
  },

  /**
   * Gets the bandwidth value
   * @return bandwidth value
   * @type string
   */
  get_bandwidth: function() {
    return this._bandwidth ? (this._bandwidth).toString() : null;
  },

  /**
   * Gets the fps value
   * @return fps value
   * @type string
   */
  get_fps: function() {
    return this._fps ? (this._fps).toString() : null;
  },

  /**
   * Gets the name value
   * @return name value
   * @type string
   */
  get_name: function(name) {
    if(name)
      return name in this._name;

    return this._name;
  },

  /**
   * Gets the senders value
   * @return senders value
   * @type string
   */
  get_senders: function(name) {
    if(name)
      return (name in this._senders) ? this._senders[name] : null;

    return this._senders;
  },

  /**
   * Gets the creator value
   * @return creator value
   * @type string
   */
  get_creator: function(name) {
    if(name)
      return (name in this._creator) ? this._creator[name] : null;

    return this._creator;
  },

  /**
   * Gets the creator value (for this)
   * @return creator value
   * @type string
   */
  get_creator_this: function(name) {
    return this.get_responder() == this.get_to() ? JSJAC_JINGLE_CREATOR_INITIATOR : JSJAC_JINGLE_CREATOR_RESPONDER;
  },

  /**
   * Gets the initiator value
   * @return initiator value
   * @type string
   */
  get_initiator: function() {
    return this._initiator;
  },

  /**
   * Gets the responder value
   * @return responder value
   * @type string
   */
  get_responder: function() {
    return this._responder;
  },

  /**
   * Gets the local_view value
   * @return local_view value
   * @type DOM
   */
  get_local_view: function() {
    return (typeof this._local_view == 'object') ? this._local_view : [];
  },

  /**
   * Gets the remote_view value
   * @return remote_view value
   * @type DOM
   */
  get_remote_view: function() {
    return (typeof this._remote_view == 'object') ? this._remote_view : [];
  },

  /**
   * Gets the STUN servers
   * @return STUN servers
   * @type object
   */
  get_stun: function() {
    return (typeof this._stun == 'object') ? this._stun : {};
  },

  /**
   * Gets the TURN servers
   * @return TURN servers
   * @type object
   */
  get_turn: function() {
    return (typeof this._turn == 'object') ? this._turn : {};
  },

  /**
   * Gets the SDP trace value
   * @return SDP trace value
   * @type boolean
   */
  get_sdp_trace: function() {
    return (this._sdp_trace === true);
  },

  /**
   * Gets the network packet trace value
   * @return Network packet trace value
   * @type boolean
   */
  get_net_trace: function() {
    return (this._net_trace === true);
  },

  /**
   * Gets the debug value
   * @return debug value
   * @type JSJaCDebugger
   */
  get_debug: function() {
    return this._debug;
  },



  /**
   * JSJSAC JINGLE SETTERS
   */

  /**
   * Sets the session initiate pending callback function
   */
  set_session_initiate_pending: function(session_initiate_pending) {
    this._session_initiate_pending = session_initiate_pending;
  },

  /**
   * Sets the session initiate success callback function
   */
  set_initiate_success: function(initiate_success) {
    this._session_initiate_success = initiate_success;
  },

  /**
   * Sets the session initiate error callback function
   */
  set_initiate_error: function(initiate_error) {
    this._session_initiate_error = initiate_error;
  },

  /**
   * Sets the session initiate request callback function
   */
  set_initiate_request: function(initiate_request) {
    this._session_initiate_request = initiate_request;
  },

  /**
   * Sets the session accept pending callback function
   */
  set_accept_pending: function(accept_pending) {
    this._session_accept_pending = accept_pending;
  },

  /**
   * Sets the session accept success callback function
   */
  set_accept_success: function(accept_success) {
    this._session_accept_success = accept_success;
  },

  /**
   * Sets the session accept error callback function
   */
  set_accept_error: function(accept_error) {
    this._session_accept_error = accept_error;
  },

  /**
   * Sets the session accept request callback function
   */
  set_accept_request: function(accept_request) {
    this._session_accept_request = accept_request;
  },

  /**
   * Sets the session info success callback function
   */
  set_info_success: function(info_success) {
    this._session_info_success = info_success;
  },

  /**
   * Sets the session info error callback function
   */
  set_info_error: function(info_error) {
    this._session_info_error = info_error;
  },

  /**
   * Sets the session info request callback function
   */
  set_info_request: function(info_request) {
    this._session_info_request = info_request;
  },

  /**
   * Sets the session terminate pending callback function
   */
  set_terminate_pending: function(terminate_pending) {
    this._session_terminate_pending = terminate_pending;
  },

  /**
   * Sets the session terminate success callback function
   */
  set_terminate_success: function(terminate_success) {
    this._session_terminate_success = terminate_success;
  },

  /**
   * Sets the session terminate error callback function
   */
  set_terminate_error: function(terminate_error) {
    this._session_terminate_error = terminate_error;
  },

  /**
   * Sets the session terminate request callback function
   */
  set_terminate_request: function(terminate_request) {
    this._session_terminate_request = terminate_request;
  },

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
   * Sets the remote stream
   */
  set_remote_stream: function(remote_stream) {
    try {
      if(!remote_stream && this._remote_stream) {
        this.peer.stream_detach(
          this.get_remote_view()
        );
      }

      this._remote_stream = remote_stream;

      if(remote_stream) {
        this.peer.stream_attach(
          this.get_remote_view(),
          this.get_remote_stream(),
          false
        );
      } else {
        this.peer.stream_detach(
          this.get_remote_view()
        );
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:base] set_remote_stream > ' + e, 1);
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
   * Sets the remote view
   */
  set_remote_view: function(remote_view) {
    if(typeof this._remote_view !== 'object')
      this._remote_view = [];

    this._remote_view.push(remote_view);
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
   * Sets the remote payloads
   */
  set_payloads_remote: function(name, payload_data) {
    this._payloads_remote[name] = payload_data;
  },

  /**
   * Adds a remote payload
   */
  set_payloads_remote_add: function(name, payload_data) {
    try {
      if(!(name in this._payloads_remote)) {
        this.set_payloads_remote(name, payload_data);
      } else {
        var key;
        var payloads_store = this._payloads_remote[name].descriptions.payload;
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
   */
  set_group_remote: function(semantics, group_data) {
    this._group_remote[semantics] = group_data;
  },

  /**
   * Sets the remote candidates
   */
  set_candidates_remote: function(name, candidate_data) {
    this._candidates_remote[name] = candidate_data;
  },

  /**
   * Sets the session initiate pending callback function
   */
  set_candidates_queue_remote: function(name, candidate_data) {
    if(name === null)
      this._candidates_queue_remote = {};
    else
      this._candidates_queue_remote[name] = (candidate_data);
  },

  /**
   * Adds a remote candidate
   */
  set_candidates_remote_add: function(name, candidate_data) {
    try {
      if(!name) return;

      if(!(name in this._candidates_remote))
        this.set_candidates_remote(name, []);
   
      var c, i;
      var candidate_ids = [];

      for(c in this.get_candidates_remote(name))
        candidate_ids.push(this.get_candidates_remote(name)[c].id);

      for(i in candidate_data) {
        if((candidate_data[i].id).indexOf(candidate_ids) !== -1)
          this.get_candidates_remote(name).push(candidate_data[i]);
      }
    } catch(e) {
      this.get_debug().log('[JSJaCJingle:base] set_candidates_remote_add > ' + e, 1);
    }
  },

  /**
   * Sets the local content
   */
  set_content_local: function(name, content_local) {
    this._content_local[name] = content_local;
  },

  /**
   * Sets the remote content
   */
  set_content_remote: function(name, content_remote) {
    this._content_remote[name] = content_remote;
  },

  /**
   * Sets the stanza handlers
   */
  set_handlers: function(type, id, handler) {
    if(!(type in this._handlers))  this._handlers[type] = {};

    this._handlers[type][id] = handler;
  },

  /**
   * Sets the peer connection
   */
  set_peer_connection: function(peer_connection) {
    this._peer_connection = peer_connection;
  },

  /**
   * Sets the ID
   */
  set_id: function(id) {
    this._id = id;
  },

  /**
   * Sets the sent ID
   */
  set_sent_id: function(sent_id) {
    this._sent_id[sent_id] = 1;
  },

  /**
   * Sets the last received ID
   */
  set_received_id: function(received_id) {
    this._received_id[received_id] = 1;
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
   * @return media busy value
   * @type boolean
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
   * Sets the termination reason
   */
  set_reason: function(reason) {
    this._reason = reason || JSJAC_JINGLE_REASON_CANCEL;
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
   * Sets the session senders
   */
  set_senders: function(name, senders) {
    if(!(senders in JSJAC_JINGLE_SENDERS)) senders = JSJAC_JINGLE_SENDERS_BOTH.jingle;

    this._senders[name] = senders;
  },

  /**
   * Sets the session creator
   */
  set_creator: function(name, creator) {
    if(!(creator in JSJAC_JINGLE_CREATORS)) creator = JSJAC_JINGLE_CREATOR_INITIATOR;

    this._creator[name] = creator;
  },

  /**
   * Sets the session initiator
   */
  set_initiator: function(initiator) {
    this._initiator = initiator;
  },

  /**
   * Sets the session responder
   */
  set_responder: function(responder) {
    this._responder = responder;
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
   * @return Receiver state
   * @type boolean
   */
  is_responder: function() {
    return this.utils.negotiation_status() == JSJAC_JINGLE_SENDERS_RESPONDER.jingle;
  },

  /**
   * Am I initiator?
   * @return Initiator state
   * @type boolean
   */
  is_initiator: function() {
    return this.utils.negotiation_status() == JSJAC_JINGLE_SENDERS_INITIATOR.jingle;
  },
});
