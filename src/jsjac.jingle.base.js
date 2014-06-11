/**
 * @fileoverview JSJaC Jingle library - Base call lib
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/**
 * JSJSAC JINGLE METHODS
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
 * @param {function} args.add_remote_view The remote view media add (audio/video) custom handler.
 * @param {function} args.remove_remote_view The remote view media removal (audio/video) custom handler.
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
function JSJaCJingleBase(args) {
  var self = this;

  if(args && args.session_initiate_pending)
    /**
     * @private
     */
    self._session_initiate_pending = args.session_initiate_pending;

  if(args && args.session_initiate_success)
    /**
     * @private
     */
    self._session_initiate_success = args.session_initiate_success;

  if(args && args.session_initiate_error)
    /**
     * @private
     */
    self._session_initiate_error = args.session_initiate_error;

  if(args && args.session_initiate_request)
    /**
     * @private
     */
    self._session_initiate_request = args.session_initiate_request;

  if(args && args.session_accept_pending)
    /**
     * @private
     */
    self._session_accept_pending = args.session_accept_pending;

  if(args && args.session_accept_success)
    /**
     * @private
     */
    self._session_accept_success = args.session_accept_success;

  if(args && args.session_accept_error)
    /**
     * @private
     */
    self._session_accept_error = args.session_accept_error;

  if(args && args.session_accept_request)
    /**
     * @private
     */
    self._session_accept_request = args.session_accept_request;

  if(args && args.session_info_success)
    /**
     * @private
     */
    self._session_info_success = args.session_info_success;

  if(args && args.session_info_error)
    /**
     * @private
     */
    self._session_info_error = args.session_info_error;

  if(args && args.session_info_request)
    /**
     * @private
     */
    self._session_info_request = args.session_info_request;

  if(args && args.session_terminate_pending)
    /**
     * @private
     */
    self._session_terminate_pending = args.session_terminate_pending;

  if(args && args.session_terminate_success)
    /**
     * @private
     */
    self._session_terminate_success = args.session_terminate_success;

  if(args && args.session_terminate_error)
    /**
     * @private
     */
    self._session_terminate_error = args.session_terminate_error;

  if(args && args.session_terminate_request)
    /**
     * @private
     */
    self._session_terminate_request = args.session_terminate_request;

  if(args && args.add_remote_view)
    /**
     * @private
     */
    self._add_remote_view = args.add_remote_view;

  if(args && args.remove_remote_view)
    /**
     * @private
     */
    self._remove_remote_view = args.remove_remote_view;

  if(args && args.to)
    /**
     * @private
     */
    self._to = args.to;

  if(args && args.media)
    /**
     * @private
     */
    self._media = args.media;

  if(args && args.video_source)
    /**
     * @private
     */
    self._video_source = args.video_source;

  if(args && args.resolution)
    /**
     * @private
     */
    self._resolution = args.resolution;

  if(args && args.bandwidth)
    /**
     * @private
     */
    self._bandwidth = args.bandwidth;

  if(args && args.fps)
    /**
     * @private
     */
    self._fps = args.fps;

  if(args && args.local_view)
    /**
     * @private
     */
    self._local_view = [args.local_view];

  if(args && args.remote_view)
    /**
     * @private
     */
    self._remote_view = [args.remote_view];

  if(args && args.stun) {
    /**
     * @private
     */
    self._stun = args.stun;
  } else {
    self._stun = {};
  }

  if(args && args.turn) {
    /**
     * @private
     */
    self._turn = args.turn;
  } else {
    self._turn = {};
  }

  if(args && args.sdp_trace)
    /**
     * @private
     */
    self._sdp_trace = args.sdp_trace;

  if(args && args.net_trace)
    /**
     * @private
     */
    self._net_trace = args.net_trace;

  if(args && args.debug && args.debug.log) {
      /**
       * Reference to debugger interface
       * (needs to implement method <code>log</code>)
       * @type JSJaCDebugger
       */
    self._debug = args.debug;
  } else {
    self._debug = JSJAC_JINGLE_STORE_DEBUG;
  }

  /**
   * @private
   */
  self._local_stream = null;

  /**
   * @private
   */
  self._remote_stream = null;

  /**
   * @private
   */
  self._content_local = {};

  /**
   * @private
   */
  self._content_remote = {};

  /**
   * @private
   */
  self._payloads_local = [];

  /**
   * @private
   */
  self._group_local = {};

  /**
   * @private
   */
  self._candidates_local = {};

  /**
   * @private
   */
  self._candidates_queue_local = {};

  /**
   * @private
   */
  self._payloads_remote = {};

  /**
   * @private
   */
  self._group_remote = {};

  /**
   * @private
   */
  self._candidates_remote = {};

  /**
   * @private
   */
  self._candidates_queue_remote = {};

  /**
   * @private
   */
  self._initiator = '';

  /**
   * @private
   */
  self._responder = '';

  /**
   * @private
   */
  self._mute = {};

  /**
   * @private
   */
  self._lock = false;

  /**
   * @private
   */
  self._media_busy = false;

  /**
   * @private
   */
  self._sid = '';

  /**
   * @private
   */
  self._name = {};

  /**
   * @private
   */
  self._senders = {};

  /**
   * @private
   */
  self._creator = {};

  /**
   * @private
   */
  self._status = JSJAC_JINGLE_STATUS_INACTIVE;

  /**
   * @private
   */
  self._reason = JSJAC_JINGLE_REASON_CANCEL;

  /**
   * @private
   */
  self._handlers = {};

  /**
   * @private
   */
  self._peer_connection = null;

  /**
   * @private
   */
  self._id = 0;

  /**
   * @private
   */
  self._sent_id = {};

  /**
   * @private
   */
  self._received_id = {};

  

  /**
   * JSJSAC JINGLE GETTERS
   */

  /**
   * @private
   */
  self._get_session_initiate_pending = function() {
    if(typeof self._session_initiate_pending == 'function')
      return self._session_initiate_pending;

    return function() {};
  };

  /**
   * @private
   */
  self._get_session_initiate_success = function() {
    if(typeof self._session_initiate_success == 'function')
      return self._session_initiate_success;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_initiate_error = function() {
    if(typeof self._session_initiate_error == 'function')
      return self._session_initiate_error;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_initiate_request = function() {
    if(typeof self._session_initiate_request == 'function')
      return self._session_initiate_request;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_accept_pending = function() {
    if(typeof self._session_accept_pending == 'function')
      return self._session_accept_pending;

    return function() {};
  };

  /**
   * @private
   */
  self._get_session_accept_success = function() {
    if(typeof self._session_accept_success == 'function')
      return self._session_accept_success;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_accept_error = function() {
    if(typeof self._session_accept_error == 'function')
      return self._session_accept_error;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_accept_request = function() {
    if(typeof self._session_accept_request == 'function')
      return self._session_accept_request;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_info_success = function() {
    if(typeof self._session_info_success == 'function')
      return self._session_info_success;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_info_error = function() {
    if(typeof self._session_info_error == 'function')
      return self._session_info_error;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_info_request = function() {
    if(typeof self._session_info_request == 'function')
      return self._session_info_request;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_terminate_pending = function() {
    if(typeof self._session_terminate_pending == 'function')
      return self._session_terminate_pending;

    return function() {};
  };

  /**
   * @private
   */
  self._get_session_terminate_success = function() {
    if(typeof self._session_terminate_success == 'function')
      return self._session_terminate_success;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_terminate_error = function() {
    if(typeof self._session_terminate_error == 'function')
      return self._session_terminate_error;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_session_terminate_request = function() {
    if(typeof self._session_terminate_request == 'function')
      return self._session_terminate_request;

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_add_remote_view = function() {
    if(typeof self._add_remote_view == 'function')
      return self._add_remote_view;

    return function() {};
  };

  /**
   * @private
   */
  self._get_remove_remote_view = function() {
    if(typeof self._remove_remote_view == 'function')
      return self._remove_remote_view;

    return function() {};
  };

  /**
   * @private
   */
  self._get_local_stream = function() {
    return self._local_stream;
  };

  /**
   * @private
   */
  self._get_remote_stream = function() {
    return self._remote_stream;
  };

  /**
   * @private
   */
  self._get_payloads_local = function(name) {
    if(name)
      return (name in self._payloads_local) ? self._payloads_local[name] : {};

    return self._payloads_local;
  };

  /**
   * @private
   */
  self._get_group_local = function(semantics) {
    if(semantics)
      return (semantics in self._group_local) ? self._group_local[semantics] : {};

    return self._group_local;
  };

  /**
   * @private
   */
  self._get_candidates_local = function(name) {
    if(name)
      return (name in self._candidates_local) ? self._candidates_local[name] : {};

    return self._candidates_local;
  };

  /**
   * @private
   */
  self._get_candidates_queue_local = function(name) {
    if(name)
      return (name in self._candidates_queue_local) ? self._candidates_queue_local[name] : {};

    return self._candidates_queue_local;
  };

  /**
   * @private
   */
  self._get_payloads_remote = function(name) {
    if(name)
      return (name in self._payloads_remote) ? self._payloads_remote[name] : {};

    return self._payloads_remote;
  };

  /**
   * @private
   */
  self._get_group_remote = function(semantics) {
    if(semantics)
      return (semantics in self._group_remote) ? self._group_remote[semantics] : {};

    return self._group_remote;
  };

  /**
   * @private
   */
  self._get_candidates_remote = function(name) {
    if(name)
      return (name in self._candidates_remote) ? self._candidates_remote[name] : [];

    return self._candidates_remote;
  };

  /**
   * @private
   */
  self._get_candidates_queue_remote = function(name) {
    if(name)
      return (name in self._candidates_queue_remote) ? self._candidates_queue_remote[name] : {};

    return self._candidates_queue_remote;
  };

  /**
   * @private
   */
  self._get_content_local = function(name) {
    if(name)
      return (name in self._content_local) ? self._content_local[name] : {};

    return self._content_local;
  };

  /**
   * @private
   */
  self._get_content_remote = function(name) {
    if(name)
      return (name in self._content_remote) ? self._content_remote[name] : {};

    return self._content_remote;
  };

  /**
   * @private
   */
  self._get_handlers = function(type, id) {
    type = type || JSJAC_JINGLE_STANZA_TYPE_ALL;

    if(id) {
      if(type != JSJAC_JINGLE_STANZA_TYPE_ALL && type in self._handlers && typeof self._handlers[type][id] == 'function')
        return self._handlers[type][id];

      if(JSJAC_JINGLE_STANZA_TYPE_ALL in self._handlers && typeof self._handlers[JSJAC_JINGLE_STANZA_TYPE_ALL][id] == 'function')
        return self._handlers[type][id];
    }

    return null;
  };

  /**
   * @private
   */
  self._get_peer_connection = function() {
    return self._peer_connection;
  };

  /**
   * @private
   */
  self._get_id = function() {
    return self._id;
  };

  /**
   * @private
   */
  self._get_id_pre = function() {
    return JSJAC_JINGLE_STANZA_ID_PRE + '_' + (self.get_sid() || '0') + '_';
  };

  /**
   * @private
   */
  self._get_id_new = function() {
    var trans_id = self._get_id() + 1;
    self._set_id(trans_id);

    return self._get_id_pre() + trans_id;
  };

  /**
   * @private
   */
  self._get_sent_id = function() {
    return self._sent_id;
  };

  /**
   * @private
   */
  self._get_received_id = function() {
    return self._received_id;
  };

  /**
   * Gets the mute state
   * @return mute value
   * @type boolean
   */
  self.get_mute = function(name) {
    if(!name) name = '*';

    return (name in self._mute) ? self._mute[name] : false;
  };

  /**
   * Gets the lock value
   * @return lock value
   * @type boolean
   */
  self.get_lock = function() {
    return self._lock || !JSJAC_JINGLE_AVAILABLE;
  };

  /**
   * Gets the media busy value
   * @return media busy value
   * @type boolean
   */
  self.get_media_busy = function() {
    return self._media_busy;
  };

  /**
   * Gets the sid value
   * @return sid value
   * @type string
   */
  self.get_sid = function() {
    return self._sid;
  };

  /**
   * Gets the status value
   * @return status value
   * @type string
   */
  self.get_status = function() {
    return self._status;
  };

  /**
   * Gets the reason value
   * @return reason value
   * @type string
   */
  self.get_reason = function() {
    return self._reason;
  };

  /**
   * Gets the is_muji value
   * @return is_muji value
   * @type boolean
   */
  self.get_is_muji = function() {
    return self._is_muji || false;
  };

  /**
   * Gets the to value
   * @return to value
   * @type string
   */
  self.get_to = function() {
    return self._to;
  };

  /**
   * Gets the media value
   * @return media value
   * @type string
   */
  self.get_media = function() {
    return (self._media && self._media in JSJAC_JINGLE_MEDIAS) ? self._media : JSJAC_JINGLE_MEDIA_VIDEO;
  };

  /**
   * Gets a list of medias in use
   * @return media list
   * @type object
   */
  self.get_media_all = function() {
    if(self.get_media() == JSJAC_JINGLE_MEDIA_AUDIO)
      return [JSJAC_JINGLE_MEDIA_AUDIO];

    return [JSJAC_JINGLE_MEDIA_AUDIO, JSJAC_JINGLE_MEDIA_VIDEO];
  };

  /**
   * Gets the video source value
   * @return video source value
   * @type string
   */
  self.get_video_source = function() {
    return (self._video_source && self._video_source in JSJAC_JINGLE_VIDEO_SOURCES) ? self._video_source : JSJAC_JINGLE_VIDEO_SOURCE_CAMERA;
  };

  /**
   * Gets the resolution value
   * @return resolution value
   * @type string
   */
  self.get_resolution = function() {
    return self._resolution ? (self._resolution).toString() : null;
  };

  /**
   * Gets the bandwidth value
   * @return bandwidth value
   * @type string
   */
  self.get_bandwidth = function() {
    return self._bandwidth ? (self._bandwidth).toString() : null;
  };

  /**
   * Gets the fps value
   * @return fps value
   * @type string
   */
  self.get_fps = function() {
    return self._fps ? (self._fps).toString() : null;
  };

  /**
   * Gets the name value
   * @return name value
   * @type string
   */
  self.get_name = function(name) {
    if(name)
      return name in self._name;

    return self._name;
  };

  /**
   * Gets the senders value
   * @return senders value
   * @type string
   */
  self.get_senders = function(name) {
    if(name)
      return (name in self._senders) ? self._senders[name] : null;

    return self._senders;
  };

  /**
   * Gets the creator value
   * @return creator value
   * @type string
   */
  self.get_creator = function(name) {
    if(name)
      return (name in self._creator) ? self._creator[name] : null;

    return self._creator;
  };

  /**
   * Gets the creator value (for this)
   * @return creator value
   * @type string
   */
  self.get_creator_this = function(name) {
    return self.get_responder() == self.get_to() ? JSJAC_JINGLE_CREATOR_INITIATOR : JSJAC_JINGLE_CREATOR_RESPONDER;
  };

  /**
   * Gets the initiator value
   * @return initiator value
   * @type string
   */
  self.get_initiator = function() {
    return self._initiator;
  };

  /**
   * Gets the response value
   * @return response value
   * @type string
   */
  self.get_responder = function() {
    return self._responder;
  };

  /**
   * Gets the local_view value
   * @return local_view value
   * @type DOM
   */
  self.get_local_view = function() {
    return (typeof self._local_view == 'object') ? self._local_view : [];
  };

  /**
   * Gets the remote_view value
   * @return remote_view value
   * @type DOM
   */
  self.get_remote_view = function() {
    return (typeof self._remote_view == 'object') ? self._remote_view : [];
  };

  /**
   * Gets the STUN servers
   * @return STUN servers
   * @type object
   */
  self.get_stun = function() {
    return (typeof self._stun == 'object') ? self._stun : {};
  };

  /**
   * Gets the TURN servers
   * @return TURN servers
   * @type object
   */
  self.get_turn = function() {
    return (typeof self._turn == 'object') ? self._turn : {};
  };

  /**
   * Gets the SDP trace value
   * @return SDP trace value
   * @type boolean
   */
  self.get_sdp_trace = function() {
    return (self._sdp_trace === true);
  };

  /**
   * Gets the network packet trace value
   * @return Network packet trace value
   * @type boolean
   */
  self.get_net_trace = function() {
    return (self._net_trace === true);
  };

  /**
   * Gets the debug value
   * @return debug value
   * @type JSJaCDebugger
   */
  self.get_debug = function() {
    return self._debug;
  };



  /**
   * JSJSAC JINGLE SETTERS
   */

  /**
   * @private
   */
  self._set_session_initiate_pending = function(session_initiate_pending) {
    self._session_initiate_pending = session_initiate_pending;
  };

  /**
   * @private
   */
  self._set_initiate_success = function(initiate_success) {
    self._session_initiate_success = initiate_success;
  };

  /**
   * @private
   */
  self._set_initiate_error = function(initiate_error) {
    self._session_initiate_error = initiate_error;
  };

  /**
   * @private
   */
  self._set_initiate_request = function(initiate_request) {
    self._session_initiate_request = initiate_request;
  };

  /**
   * @private
   */
  self._set_accept_pending = function(accept_pending) {
    self._session_accept_pending = accept_pending;
  };

  /**
   * @private
   */
  self._set_accept_success = function(accept_success) {
    self._session_accept_success = accept_success;
  };

  /**
   * @private
   */
  self._set_accept_error = function(accept_error) {
    self._session_accept_error = accept_error;
  };

  /**
   * @private
   */
  self._set_accept_request = function(accept_request) {
    self._session_accept_request = accept_request;
  };

  /**
   * @private
   */
  self._set_info_success = function(info_success) {
    self._session_info_success = info_success;
  };

  /**
   * @private
   */
  self._set_info_error = function(info_error) {
    self._session_info_error = info_error;
  };

  /**
   * @private
   */
  self._set_info_request = function(info_request) {
    self._session_info_request = info_request;
  };

  /**
   * @private
   */
  self._set_terminate_pending = function(terminate_pending) {
    self._session_terminate_pending = terminate_pending;
  };

  /**
   * @private
   */
  self._set_terminate_success = function(terminate_success) {
    self._session_terminate_success = terminate_success;
  };

  /**
   * @private
   */
  self._set_terminate_error = function(terminate_error) {
    self._session_terminate_error = terminate_error;
  };

  /**
   * @private
   */
  self._set_terminate_request = function(terminate_request) {
    self._session_terminate_request = terminate_request;
  };

  /**
   * @private
   */
  self._set_local_stream = function(local_stream) {
    try {
      if(!local_stream && self._local_stream) {
        (self._local_stream).stop();

        self._util_peer_stream_detach(
          self.get_local_view()
        );
      }

      self._local_stream = local_stream;

      if(local_stream) {
        self._util_peer_stream_attach(
          self.get_local_view(),
          self._get_local_stream(),
          true
        );
      } else {
        self._util_peer_stream_detach(
          self.get_local_view()
        );
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _set_local_stream > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._set_remote_stream = function(remote_stream) {
    try {
      if(!remote_stream && self._remote_stream) {
        self._util_peer_stream_detach(
          self.get_remote_view()
        );
      }

      self._remote_stream = remote_stream;

      if(remote_stream) {
        self._util_peer_stream_attach(
          self.get_remote_view(),
          self._get_remote_stream(),
          false
        );
      } else {
        self._util_peer_stream_detach(
          self.get_remote_view()
        );
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _set_remote_stream > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._set_local_view = function(local_view) {
    if(typeof self._local_view !== 'object')
      self._local_view = [];

    self._local_view.push(local_view);
  };

  /**
   * @private
   */
  self._set_remote_view = function(remote_view) {
    if(typeof self._remote_view !== 'object')
      self._remote_view = [];

    self._remote_view.push(remote_view);
  };

  /**
   * @private
   */
  self._set_payloads_local = function(name, payload_data) {
    self._payloads_local[name] = payload_data;
  };

  /**
   * @private
   */
  self._set_group_local = function(semantics, group_data) {
    self._group_local[semantics] = group_data;
  };

  /**
   * @private
   */
  self._set_candidates_local = function(name, candidate_data) {
    if(!(name in self._candidates_local))  self._candidates_local[name] = [];

    (self._candidates_local[name]).push(candidate_data);
  };

  /**
   * @private
   */
  self._set_candidates_queue_local = function(name, candidate_data) {
    try {
      if(name === null) {
        self._candidates_queue_local = {};
      } else {
        if(!(name in self._candidates_queue_local))  self._candidates_queue_local[name] = [];

        (self._candidates_queue_local[name]).push(candidate_data);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _set_candidates_queue_local > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._set_payloads_remote = function(name, payload_data) {
    self._payloads_remote[name] = payload_data;
  };

  /**
   * @private
   */
  self._set_payloads_remote_add = function(name, payload_data) {
    try {
      if(!(name in self._payloads_remote)) {
        self._set_payloads_remote(name, payload_data);
      } else {
        var key;
        var payloads_store = self._payloads_remote[name].descriptions.payload;
        var payloads_add   = payload_data.descriptions.payload;

        for(key in payloads_add) {
          if(!(key in payloads_store))
            payloads_store[key] = payloads_add[key];
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _set_payloads_remote_add > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._set_group_remote = function(semantics, group_data) {
    self._group_remote[semantics] = group_data;
  };

  /**
   * @private
   */
  self._set_candidates_remote = function(name, candidate_data) {
    self._candidates_remote[name] = candidate_data;
  };

  /**
   * @private
   */
  self._set_candidates_queue_remote = function(name, candidate_data) {
    if(name === null)
      self._candidates_queue_remote = {};
    else
      self._candidates_queue_remote[name] = (candidate_data);
  };

  /**
   * @private
   */
  self._set_candidates_remote_add = function(name, candidate_data) {
    try {
      if(!name) return;

      if(!(name in self._candidates_remote))
        self._set_candidates_remote(name, []);
   
      var c, i;
      var candidate_ids = [];

      for(c in self._get_candidates_remote(name))
        candidate_ids.push(self._get_candidates_remote(name)[c].id);

      for(i in candidate_data) {
        if((candidate_data[i].id).indexOf(candidate_ids) !== -1)
          self._get_candidates_remote(name).push(candidate_data[i]);
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _set_candidates_remote_add > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._set_content_local = function(name, content_local) {
    self._content_local[name] = content_local;
  };

  /**
   * @private
   */
  self._set_content_remote = function(name, content_remote) {
    self._content_remote[name] = content_remote;
  };

  /**
   * @private
   */
  self._set_handlers = function(type, id, handler) {
    if(!(type in self._handlers))  self._handlers[type] = {};

    self._handlers[type][id] = handler;
  };

  /**
   * @private
   */
  self._set_peer_connection = function(peer_connection) {
    self._peer_connection = peer_connection;
  };

  /**
   * @private
   */
  self._set_id = function(id) {
    self._id = id;
  };

  /**
   * @private
   */
  self._set_sent_id = function(sent_id) {
    self._sent_id[sent_id] = 1;
  };

  /**
   * @private
   */
  self._set_received_id = function(received_id) {
    self._received_id[received_id] = 1;
  };

  /**
   * @private
   */
  self._set_mute = function(name, mute) {
    if(!name || name == '*') {
      self._mute = {};
      name = '*';
    }

    self._mute[name] = mute;
  };

  /**
   * @private
   */
  self._set_lock = function(lock) {
    self._lock = lock;
  };

  /**
   * Gets the media busy value
   * @return media busy value
   * @type boolean
   */
  self._set_media_busy = function(busy) {
    self._media_busy = busy;
  };

  /**
   * @private
   */
  self._set_sid = function(sid) {
    self._sid = sid;
  };

  /**
   * @private
   */
  self._set_status = function(status) {
    self._status = status;
  };

  /**
   * @private
   */
  self._set_reason = function(reason) {
    self._reason = reason || JSJAC_JINGLE_REASON_CANCEL;
  };

  /**
   * @private
   */
  self._set_is_muji = function(is_muji) {
    self._is_muji = is_muji;
  };

  /**
   * @private
   */
  self._set_to = function(to) {
    self._to = to;
  };

  /**
   * @private
   */
  self._set_media = function(media) {
    self._media = media;
  };

  /**
   * @private
   */
  self._set_video_source = function() {
    self._video_source = video_source;
  };

  /**
   * @private
   */
  self._set_resolution = function(resolution) {
    self._resolution = resolution;
  };

  /**
   * @private
   */
  self._set_bandwidth = function(bandwidth) {
    self._bandwidth = bandwidth;
  };

  /**
   * @private
   */
  self._set_fps = function(fps) {
    self._fps = fps;
  };

  /**
   * @private
   */
  self._set_name = function(name) {
    self._name[name] = 1;
  };

  /**
   * @private
   */
  self._set_senders = function(name, senders) {
    if(!(senders in JSJAC_JINGLE_SENDERS)) senders = JSJAC_JINGLE_SENDERS_BOTH.jingle;

    self._senders[name] = senders;
  };

  /**
   * @private
   */
  self._set_creator = function(name, creator) {
    if(!(creator in JSJAC_JINGLE_CREATORS)) creator = JSJAC_JINGLE_CREATOR_INITIATOR;

    self._creator[name] = creator;
  };

  /**
   * @private
   */
  self._set_initiator = function(initiator) {
    self._initiator = initiator;
  };

  /**
   * @private
   */
  self._set_responder = function(responder) {
    self._responder = responder;
  };

  /**
   * @private
   */
  self._set_stun = function(stun_host, stun_data) {
    self._stun[stun_server] = stun_data;
  };

  /**
   * @private
   */
  self._set_turn = function(turn_host, turn_data) {
    self._turn[turn_server] = turn_data;
  };

  /**
   * @private
   */
  self._set_sdp_trace = function(sdp_trace) {
    self._sdp_trace = sdp_trace;
  };

  /**
   * @private
   */
  self._set_net_trace = function(net_trace) {
    self._net_trace = net_trace;
  };

  /**
   * @private
   */
  self._set_debug = function(debug) {
    self._debug = debug;
  };
}
