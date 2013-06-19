/**
 * @fileoverview JSJaC Jingle library, implementation of XEP-0166.
 * Built originally for Uno.im service requirements
 *
 * @author Valérian Saliou valerian@jappix.com
 * @license Mozilla Public License (MPL)
 */


/**
 * Workflow
 *
 * Implements: XEP-0166
 * URL: http://xmpp.org/extensions/xep-0166.html

 * This negociation example associates JSJaCJingle.js methods to a real workflow
 * We assume in this workflow example remote user accepts the call he gets

 * 1.cmt Local user wants to start a WebRTC session with remote user
 * 1.snd Local user sends a session-initiate type='set'
 * 1.hdl Remote user sends back a type='result' to '1.snd' stanza (ack)

 * 2.cmt Local user waits silently for remote user to send a session-accept
 * 2.hdl Remote user sends a session-accept type='set'
 * 2.snd Local user sends back a type='result' to '2.hdl' stanza (ack)

 * 3.cmt WebRTC session starts
 * 3.cmt Users chat, and chat, and chat. Happy Jabbering to them!

 * 4.cmt Local user wants to stop WebRTC session with remote user
 * 4.snd Local user sends a session-terminate type='set'
 * 4.hdl Remote user sends back a type='result' to '4.snd' stanza (ack)
 */


/**
 * JINGLE NAMESPACES
 */

var NS_JINGLE                                       = 'urn:xmpp:jingle:1';
var NS_JINGLE_ERRORS                                = 'urn:xmpp:jingle:errors:1';

var NS_JINGLE_APPS_RTP                              = 'urn:xmpp:jingle:apps:rtp:1';
var NS_JINGLE_APPS_RTP_INFO                         = 'urn:xmpp:jingle:apps:rtp:1:info';
var NS_JINGLE_APPS_RTP_AUDIO                        = 'urn:xmpp:jingle:apps:rtp:audio';
var NS_JINGLE_APPS_RTP_VIDEO                        = 'urn:xmpp:jingle:apps:rtp:video';
var NS_JINGLE_APPS_STUB                             = 'urn:xmpp:jingle:apps:stub:0';

var NS_JINGLE_TRANSPORTS_ICEUDP                     = 'urn:xmpp:jingle:transports:ice-udp:1';
var NS_JINGLE_TRANSPORTS_STUB                       = 'urn:xmpp:jingle:transports:stub:0';

var NS_JINGLE_SECURITY_STUB                         = 'urn:xmpp:jingle:security:stub:0';

var R_NS_JINGLE_APP                                 = /^urn:xmpp:jingle:app:(\w+):(\d+)$/;
var R_NS_JINGLE_TRANSPORT                           = /^urn:xmpp:jingle:transport:(\w+)$/;



/**
 * JSJAC JINGLE CONSTANTS
 */

var JSJAC_JINGLE_STATUS_INACTIVE                    = 'inactive';
var JSJAC_JINGLE_STATUS_INITIATING                  = 'initiating';
var JSJAC_JINGLE_STATUS_INITIATED                   = 'initiated';
var JSJAC_JINGLE_STATUS_STARTING                    = 'starting';
var JSJAC_JINGLE_STATUS_STARTED                     = 'started';
var JSJAC_JINGLE_STATUS_TERMINATING                 = 'terminating';
var JSJAC_JINGLE_STATUS_TERMINATED                  = 'terminated';

var JSJAC_JINGLE_ACTION_CONTENT_ACCEPT              = 'content-accept';
var JSJAC_JINGLE_ACTION_CONTENT_ADD                 = 'content-add';
var JSJAC_JINGLE_ACTION_CONTENT_MODIFY              = 'content-modify';
var JSJAC_JINGLE_ACTION_CONTENT_REJECT              = 'content-reject';
var JSJAC_JINGLE_ACTION_CONTENT_REMOVE              = 'content-remove';
var JSJAC_JINGLE_ACTION_DESCRIPTION_INFO            = 'description-info';
var JSJAC_JINGLE_ACTION_SECURITY_INFO               = 'security-info';
var JSJAC_JINGLE_ACTION_SESSION_ACCEPT              = 'session-accept';
var JSJAC_JINGLE_ACTION_SESSION_INFO                = 'session-info';
var JSJAC_JINGLE_ACTION_SESSION_INITIATE            = 'session-initiate';
var JSJAC_JINGLE_ACTION_SESSION_TERMINATE           = 'session-terminate';
var JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT            = 'transport-accept';
var JSJAC_JINGLE_ACTION_TRANSPORT_INFO              = 'transport-info';
var JSJAC_JINGLE_ACTION_TRANSPORT_REJECT            = 'transport-reject';
var JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE           = 'transport-replace';

var JSJAC_JINGLE_ERROR_OUT_OF_BORDER                = { jingle: 'out-of-border',    xmpp: 'unexpected-request',      type: 'wait' };
var JSJAC_JINGLE_ERROR_TIE_BREAK                    = { jingle: 'tie-break',        xmpp: 'conflict',                type: 'cancel' };
var JSJAC_JINGLE_ERROR_UNKNOWN_SESSION              = { jingle: 'unknown-session',  xmpp: 'item-not-found',          type: 'cancel' };
var JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO             = { jingle: 'unsupported-info', xmpp: 'feature-not-implemented', type: 'cancel' };

var JSJAC_JINGLE_REASON_ALTERNATIVE_SESSION         = 'alternative-session';
var JSJAC_JINGLE_REASON_BUSY                        = 'busy';
var JSJAC_JINGLE_REASON_CANCEL                      = 'cancel';
var JSJAC_JINGLE_REASON_CONNECTIVITY_ERROR          = 'connectivity-error';
var JSJAC_JINGLE_REASON_DECLINE                     = 'decline';
var JSJAC_JINGLE_REASON_EXPIRED                     = 'expired';
var JSJAC_JINGLE_REASON_FAILED_APPLICATION          = 'failed-application';
var JSJAC_JINGLE_REASON_FAILED_TRANSPORT            = 'failed-transport';
var JSJAC_JINGLE_REASON_GENERAL_ERROR               = 'general-error';
var JSJAC_JINGLE_REASON_GONE                        = 'gone';
var JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS     = 'incompatible-parameters';
var JSJAC_JINGLE_REASON_MEDIA_ERROR                 = 'media-error';
var JSJAC_JINGLE_REASON_SECURITY_ERROR              = 'security-error';
var JSJAC_JINGLE_REASON_SUCCESS                     = 'success';
var JSJAC_JINGLE_REASON_TIMEOUT                     = 'timeout';
var JSJAC_JINGLE_REASON_UNSUPPORTED_APPLICATIONS    = 'unsupported-applications';
var JSJAC_JINGLE_REASON_UNSUPPORTED_TRANSPORTS      = 'unsupported-transports';

var JSJAC_JINGLE_CONTENT_CLIENT = {
  // TODO: populate this with WebRTC data
  'audio': {
    'creator': null,
    'name': null,
    'description': {},
    'transport': {}
  }
};



/**
 * JSJSAC JINGLE CONSTANTS MAPPING
 */

var JSJAC_JINGLE_STATUSES  = {};
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INACTIVE]                   = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INITIATING]                 = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INITIATED]                  = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_STARTING]                   = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_STARTED]                    = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_TERMINATING]                = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_TERMINATED]                 = 1;

var JSJAC_JINGLE_ACTIONS   = {};
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_ACCEPT]              = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_ADD]                 = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_MODIFY]              = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_REJECT]              = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_REMOVE]              = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_DESCRIPTION_INFO]            = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SECURITY_INFO]               = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SESSION_ACCEPT]              = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SESSION_INFO]                = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SESSION_INITIATE]            = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SESSION_TERMINATE]           = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT]            = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_TRANSPORT_INFO]              = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_TRANSPORT_REJECT]            = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE]           = 1;

var JSJAC_JINGLE_ERRORS     = {
  'out-of-border':      JSJAC_JINGLE_ERROR_OUT_OF_BORDER,
  'tie-break':          JSJAC_JINGLE_ERROR_TIE_BREAK,
  'unknown-session':    JSJAC_JINGLE_ERROR_UNKNOWN_SESSION,
  'unsupported-info':   JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO
};

var JSJAC_JINGLE_REASONS    = {};
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_ALTERNATIVE_SESSION]         = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_BUSY]                        = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_CANCEL]                      = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_CONNECTIVITY_ERROR]          = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_DECLINE]                     = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_EXPIRED]                     = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_FAILED_APPLICATION]          = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_FAILED_TRANSPORT]            = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_GENERAL_ERROR]               = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_GONE]                        = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS]     = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_MEDIA_ERROR]                 = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_SECURITY_ERROR]              = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_SUCCESS]                     = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_TIMEOUT]                     = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_UNSUPPORTED_APPLICATIONS]    = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_UNSUPPORTED_TRANSPORTS]      = 1;



/**
 * JSJSAC JINGLE GENERAL METHODS
 */

/**
 * Creates a new XMPP Jingle session.
 * @class Somewhat abstract base class for XMPP Jingle sessions. Contains all
 * of the code in common for all Jingle sessions
 * @constructor
 * @param {Object} args Jingle session arguments.
 * @param {JSJaConnection} args.connection The XMPP connection.
 * @param {function} args.init_pending The init pending custom handler.
 * @param {function} args.init_success The init success custom handler.
 * @param {function} args.init_error The init error custom handler.
 * @param {function} args.start_pending The start pending custom handler.
 * @param {function} args.start_success The start success custom handler.
 * @param {function} args.start_error The start error custom handler.
 * @param {function} args.terminate_pending The terminate pending custom handler.
 * @param {function} args.terminate_success The terminate success custom handler.
 * @param {function} args.terminate_error The terminate error custom handler.
 * @param {DOM} args.local_view The path to the local stream view element.
 * @param {DOM} args.remote_view The path to the remote stream view element.
 * @param {string} args.to The full JID to start the Jingle session with.
 * @param {JSJaCDebugger} args.debug A reference to a debugger implementing the JSJaCDebugger interface.
 */
function JSJaCJingle(args) {
  var self = this;

  if(args && args.init_pending)
    /**
     * @private
     */
    self._init_pending = args.init_pending;

  if(args && args.init_success)
    /**
     * @private
     */
    self._init_success = args.init_success;

  if(args && args.init_error)
    /**
     * @private
     */
    self._init_error = args.init_error;

  if(args && args.start_pending)
    /**
     * @private
     */
    self._start_pending = args.start_pending;

  if(args && args.start_success)
    /**
     * @private
     */
    self._start_success = args.start_success;

  if(args && args.start_error)
    /**
     * @private
     */
    self._start_error = args.start_error;

  if(args && args.terminate_pending)
    /**
     * @private
     */
    self._terminate_pending = args.terminate_pending;

  if(args && args.terminate_success)
    /**
     * @private
     */
    self._terminate_success = args.terminate_success;

  if(args && args.terminate_error)
    /**
     * @private
     */
    self._terminate_error = args.terminate_error;

  if(args && args.connection)
    /**
     * @private
     */
    self._connection = args.connection;

  if(args && args.to)
    /**
     * @private
     */
    self._to = '';

  if(args && args.local_view)
    /**
     * @private
     */
    self._local_view = args.local_view;

  if(args && args.remote_view)
    /**
     * @private
     */
    self._remote_view = args.remote_view;

  if(args && args.debug && args.debug.log) {
      /**
       * Reference to debugger interface
       * (needs to implement method <code>log</code>)
       * @type JSJaCDebugger
       */
    self._debug = args.debug;
  } else {
      self._debug = {
        log: function() {}
      };
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
  self._content_session = {};

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
  self._sid = '';

  /**
   * @private
   */
  self._action_last = '';

  /**
   * @private
   */
  self._status = JSJAC_JINGLE_STATUS_INACTIVE;

  /**
   * @private
   */
  self._receiver = false;

  /**
   * @private
   */
  self._handlers = {};

  /**
   * @private
   */
  self._server_config = 'NONE';

  /**
   * @private
   */
  self._peer_connection = null;

  /**
   * @private
   */
  cc_sdp_message = '';

  /**
   * Register stanza handler
   */
  (self._connection).registerHandler('iq', self.handle);
  // TODO: ondestroy >> unregisterHandler('iq', self.handle)



  /**
   * Init a new Jingle session.
   */
  self.init = function() {
    // Slot unavailable?
    if(self.get_status() != JSJAC_JINGLE_STATUS_INACTIVE) {
      self.get_debug().log('[JSJaCJingle] init > Cannot init, resource not inactive (status: ' + self.get_status() + ').', 1)
      return;
    }

    // Trigger init pending custom callback
    (self.get_init_pending())();

    // Process init actions
    (self.get_connection()).registerIQSet('jingle', NS_JINGLE, self.handle);
    self.send(null, 'set', JSJAC_JINGLE_ACTION_SESSION_INITIATE, self.handle_session_initiate);
  }

  /**
   * Starts the Jingle session.
   */
  self.start = function() {
    // Slot unavailable?
    if(!(self.get_status() == JSJAC_JINGLE_STATUS_INITIATED || self.get_status() == JSJAC_JINGLE_STATUS_TERMINATED)) {
      self.get_debug().log('[JSJaCJingle] init > Cannot start, resource not initiated or terminated (status: ' + self.get_status() + ').', 1);
      return;
    }

    // Trigger start pending custom callback
    (self.get_start_pending())();

    // Process start actions
    self.send(null, 'set', JSJAC_JINGLE_ACTION_SESSION_ACCEPT, self.handle_session_accept);
  }

  /**
   * Terminates the Jingle session.
   */
  self.terminate = function() {
    // Slot unavailable?
    if(!(self.get_status() == JSJAC_JINGLE_STATUS_INITIATED || self.get_status() == JSJAC_JINGLE_STATUS_TERMINATED)) {
      self.get_debug().log('[JSJaCJingle] terminate > Cannot terminate, resource not started (status: ' + self.get_status() + ').', 1);
      return;
    }

    // Trigger terminate pending custom callback
    (self.get_terminate_pending())();

    // Process terminate actions
    self.send(null, 'set', JSJAC_JINGLE_ACTION_SESSION_TERMINATE, self.handle_session_terminate);
  }

  /**
   * Sends a given Jingle stanza packet
   */
  self.send = function(id, type, action, handler) {
    // Build stanza
    var stanza = new JSJaCIQ();
    stanza.setTo(self.get_to());

    if(id) stanza.setID(id);

    if(type == 'set') {
      if(!(action && action in JSJAC_JINGLE_ACTIONS)) {
        self.get_debug().log('[JSJaCJingle] send > Stanza action unknown: ' + (action || 'undefined'), 1);
        return;
      }

      // Submit to registered handler
      switch(action) {
        case JSJAC_JINGLE_ACTION_CONTENT_ACCEPT:
          self.send_content_accept(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_ADD:
          self.send_content_add(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_MODIFY:
          self.send_content_modify(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_REJECT:
          self.send_content_reject(stanza); break;

        case JSJAC_JINGLE_ACTION_CONTENT_REMOVE:
          self.send_content_remove(stanza); break;

        case JSJAC_JINGLE_ACTION_DESCRIPTION_INFO:
          self.send_description_info(stanza); break;

        case JSJAC_JINGLE_ACTION_SECURITY_INFO:
          self.send_security_info(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_ACCEPT:
          self.send_session_accept(stanza, 'set'); break;

        case JSJAC_JINGLE_ACTION_SESSION_INFO:
          self.send_session_info(stanza); break;

        case JSJAC_JINGLE_ACTION_SESSION_INITIATE:
          self.send_session_initiate(stanza, 'set'); break;

        case JSJAC_JINGLE_ACTION_SESSION_TERMINATE:
          self.send_session_terminate(stanza, 'set', 'success'); break;//TODO: dynamic reason mapping

        case JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT:
          self.send_transport_accept(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_INFO:
          self.send_transport_info(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_REJECT:
          self.send_transport_reject(stanza); break;

        case JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE:
          self.send_transport_replace(stanza); break;

        default:
          self.get_debug().log('[JSJaCJingle] send > Unexpected error.', 1);

          return false;
      }
    } else if(type != 'result') {
      self.get_debug().log('[JSJaCJingle] send > Stanza type must either be set or result.', 1);

      return false;
    }

    if(handler)
      con.send(stanza, handler);
    else
      con.send(stanza);

    return true;
  }

  /**
   * Handles a given Jingle stanza response
   */
  self.handle = function(stanza) {
    var jingle = stanza.getChild('jingle', NS_JINGLE);

    // Don't handle non-Jingle stanzas there...
    if(!jingle) return;

    var action = jingle.getAttribute('action');

    // Don't handle action-less Jingle stanzas there...
    if(!action) return;

    self._set_action_last(action);

    // Submit to registered handler
    switch(action) {
      case JSJAC_JINGLE_ACTION_CONTENT_ACCEPT:
        self.handle_content_accept(stanza); break;

      case JSJAC_JINGLE_ACTION_CONTENT_ADD:
        self.handle_content_add(stanza); break;

      case JSJAC_JINGLE_ACTION_CONTENT_MODIFY:
        self.handle_content_modify(stanza); break;

      case JSJAC_JINGLE_ACTION_CONTENT_REJECT:
        self.handle_content_reject(stanza); break;

      case JSJAC_JINGLE_ACTION_CONTENT_REMOVE:
        self.handle_content_remove(stanza); break;

      case JSJAC_JINGLE_ACTION_DESCRIPTION_INFO:
        self.handle_description_info(stanza); break;

      case JSJAC_JINGLE_ACTION_SECURITY_INFO:
        self.handle_security_info(stanza); break;

      case JSJAC_JINGLE_ACTION_SESSION_ACCEPT:
        self.handle_session_accept(stanza); break;

      case JSJAC_JINGLE_ACTION_SESSION_INFO:
        self.handle_session_info(stanza); break;

      case JSJAC_JINGLE_ACTION_SESSION_INITIATE:
        self.handle_session_initiate(stanza); break;

      case JSJAC_JINGLE_ACTION_SESSION_TERMINATE:
        self.handle_session_terminate(stanza); break;

      case JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT:
        self.handle_transport_accept(stanza); break;

      case JSJAC_JINGLE_ACTION_TRANSPORT_INFO:
        self.handle_transport_info(stanza); break;

      case JSJAC_JINGLE_ACTION_TRANSPORT_REJECT:
        self.handle_transport_reject(stanza); break;

      case JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE:
        self.handle_transport_replace(stanza); break;
    }

    // Submit to custom handler
    (self.get_handlers(action))(stanza);
  }

  /**
   * Registers a given handler on a given Jingle stanza
   */
  self.register_handler = function(action, fn) {
    if(typeof(fn) != 'function') {
      self.get_debug().log('[JSJaCJingle] register_handler > fn parameter not passed or not a function!', 1);

      return false;
    }

    if(action && action in JSJAC_JINGLE_ACTIONS) {
      self._set_handlers(action, fn);

      self.get_debug().log('[JSJaCJingle] register_handler > Registered handler for action: ' + action, 4);

      return true;
    } else {
      self.get_debug().log('[JSJaCJingle] register_handler > Could not register handler for action: ' + action + ' (not in protocol)', 1);

      return false;
    }
  }

  /**
   * Unregisters the given handler on a given Jingle stanza
   */
  self.unregister_handler = function(action) {
    if(action in self._handlers) {
      delete self._handlers[action];

      self.get_debug().log('[JSJaCJingle] unregister_handler > Unregistered handler for action: ' + action, 4);

      return true;
    } else {
      self.get_debug().log('[JSJaCJingle] unregister_handler > Could not unregister handler action: ' + action + ' (not found)', 2);

      return false;
    }
  }



  /**
   * JSJSAC JINGLE SENDERS
   */

  /**
   * Sends the Jingle content accept
   */
  self.send_content_accept = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_content_accept > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_content_accept > Sent.', 4);
  }

  /**
   * Sends the Jingle content add
   */
  self.send_content_add = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_content_add > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_content_add > Sent.', 4);
  }

  /**
   * Sends the Jingle content modify
   */
  self.send_content_modify = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_content_modify > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_content_modify > Sent.', 4);
  }

  /**
   * Sends the Jingle content reject
   */
  self.send_content_reject = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_content_reject > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_content_reject > Sent.', 4);
  }

  /**
   * Sends the Jingle content remove
   */
  self.send_content_remove = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_content_remove > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_content_remove > Sent.', 4);
  }

  /**
   * Sends the Jingle description info
   */
  self.send_description_info = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_description_info > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] Send description info.', 4);
  }

  /**
   * Sends the Jingle security info
   */
  self.send_security_info = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_security_info > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_security_info > Sent.', 4);
  }

  /**
   * Sends the Jingle session accept
   */
  self.send_session_accept = function(stanza, type, arg) {
    if(!arg) {
        self.get_debug().log('[JSJaCJingle] send_session_accept > Argument not provided.', 1);
        return;
    }

    if(type == 'set') {
      if(self.get_status() != JSJAC_JINGLE_STATUS_INITIATED) {
        self.get_debug().log('[JSJaCJingle] send_session_accept > Resource not initiated (status: ' + self.get_status() + ').', 1);
        return;
      }

      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_STARTING);

      // Build Jingle stanza
      var jingle = stanza.appendNode('jingle', {
                                                  'xmlns': NS_JINGLE,
                                                  'action': JSJAC_JINGLE_ACTION_SESSION_ACCEPT,
                                                  'responder': self.get_responder(),
                                                  'sid': self.get_sid()
                                               });

      var content = jingle.appendChild(stanza.buildNode('content', {'xmlns': NS_JINGLE, 'creator': 'TODO', 'name': 'TODO'}));
      content.appendChild(stanza.buildNode(reason, {'xmlns': NS_JINGLE}));
    } else if(type == 'result') {
      stanza.setID(arg);
    } else {
      self.get_debug().log('[JSJaCJingle] send_session_accept > Stanza type must either be set or result.', 1);
      return;
    }

    self.get_debug().log('[JSJaCJingle] send_session_accept > Sent.', 4);
  }

  /**
   * Sends the Jingle session info
   */
  self.send_session_info = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_session_info > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_session_info > Sent.', 4);
  }

  /**
   * Sends the Jingle session initiate
   */
  self.send_session_initiate = function(stanza, type, arg) {
    if(type == 'set') {
      if(!(self.get_status() == JSJAC_JINGLE_STATUS_INACTIVE || 
           self.get_status() == JSJAC_JINGLE_STATUS_TERMINATED)) {
        self.get_debug().log('[JSJaCJingle] send_session_initiate > Resource not inactive or terminated (status: ' + self.get_status() + ').', 1);
        return;
      }

      // Change session status
      self._set_status(JSJAC_JINGLE_STATUS_INACTIVE);

      // Build Jingle stanza
      var jingle = stanza.appendNode('jingle', {
                                                  'xmlns': NS_JINGLE,
                                                  'action': JSJAC_JINGLE_ACTION_SESSION_INITIATE,
                                                  'initiator': self.get_initiator(),
                                                  'sid': self.get_sid()
                                               });

      var content = jingle.appendNode(stanza.buildNode('content', {'xmlns': NS_JINGLE, 'creator': 'TODO', 'name': 'TODO'}));
      // TODO
    } else if(type == 'result') {
      if(!arg) {
        self.get_debug().log('[JSJaCJingle] send_session_initiate > Argument not provided.', 1);
        return;
      }

      stanza.setID(arg);
    } else {
      self.get_debug().log('[JSJaCJingle] send_session_initiate > Stanza type must either be set or result.', 1);
      return;
    }

    self.get_debug().log('[JSJaCJingle] send_session_initiate > Sent.', 4);
  }

  /**
   * Sends the Jingle session terminate
   */
  self.send_session_terminate = function(stanza, type, arg) {
    if(!arg) {
      self.get_debug().log('[JSJaCJingle] send_session_terminate > Argument not provided.', 1);
      return;
    }

    if(type == 'set') {
      if(!(self.get_status() == JSJAC_JINGLE_STATUS_INITIATING  || 
           self.get_status() == JSJAC_JINGLE_STATUS_INITIATED   ||
           self.get_status() == JSJAC_JINGLE_STATUS_STARTING    ||
           self.get_status() == JSJAC_JINGLE_STATUS_STARTED)) {
        self.get_debug().log('[JSJaCJingle] send_session_terminate > Resource neither initiating, initiated, starting nor started (status: ' + self.get_status() + ').', 1);
        return;
      }

      var jingle = stanza.appendNode('jingle', {
                                                  'xmlns': NS_JINGLE,
                                                  'action': JSJAC_JINGLE_ACTION_SESSION_TERMINATE,
                                                  'sid': self.get_sid()
                                               });

      var jingle_reason = jingle.appendChild(stanza.buildNode('reason', {'xmlns': NS_JINGLE}));
      jingle_reason.appendChild(stanza.buildNode(arg, {'xmlns': NS_JINGLE}));
    } else if(type == 'result') {
      stanza.setID(arg);
    } else {
      self.get_debug().log('[JSJaCJingle] send_session_terminate > Stanza type must either be set or result.', 1);
      return;
    }

    self.get_debug().log('[JSJaCJingle] send_session_terminate > Sent.', 4);
  }

  /**
   * Sends the Jingle transport accept
   */
  self.send_transport_accept = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_transport_accept > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_transport_accept > Sent.', 4);
  }

  /**
   * Sends the Jingle transport info
   */
  self.send_transport_info = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_transport_info > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_transport_info > Sent.', 4);
  }

  /**
   * Sends the Jingle transport reject
   */
  self.send_transport_reject = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_transport_reject > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_transport_reject > Sent.', 4);
  }

  /**
   * Sends the Jingle transport replace
   */
  self.send_transport_replace = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_transport_replace > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_transport_replace > Sent.', 4);
  }

  /**
   * Sends the Jingle transport replace
   */
  self.send_error = function(stanza, jingle_condition) {
    if(!(jingle_condition in JSJAC_JINGLE_ERRORS)) {
      self.get_debug().log('[JSJaCJingle] send_error > Jingle condition unknown.', 1);
      return;
    }

    var jingle_error_map = JSJAC_JINGLE_ERRORS[jingle_condition];

    stanza.setType('error');

    var error = stanza.appendNode('error', {'xmlns': NS_CLIENT, 'type': jingle_error_map.type});

    error.appendChild(stanza.buildNode(jingle_error_map.xmpp, {'xmlns': NS_STANZAS}));
    error.appendChild(stanza.buildNode(jingle_error_map.jingle, {'xmlns': NS_JINGLE_ERRORS}));

    self.get_debug().log('[JSJaCJingle] send_error > Sent: ' + jingle_condition, 4);
  }



  /**
   * JSJSAC JINGLE HANDLERS
   */

  /**
   * Handles the Jingle content accept
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_content_accept = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.xmpp);

    self.get_debug().log('[JSJaCJingle] handle_content_accept > Handled.', 4);
  }

  /**
   * Handles the Jingle content add
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_content_add = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.xmpp);

    self.get_debug().log('[JSJaCJingle] handle_content_add > Handled.', 4);
  }

  /**
   * Handles the Jingle content modify
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_content_modify = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.xmpp);

    self.get_debug().log('[JSJaCJingle] handle_content_modify > Handled.', 4);
  }

  /**
   * Handles the Jingle content reject
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_content_reject = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.xmpp);

    self.get_debug().log('[JSJaCJingle] handle_content_reject > Handled.', 4);
  }

  /**
   * Handles the Jingle content remove
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_content_remove = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.xmpp);

    self.get_debug().log('[JSJaCJingle] handle_content_remove > Handled.', 4);
  }

  /**
   * Handles the Jingle description info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_description_info = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.xmpp);

    self.get_debug().log('[JSJaCJingle] handle_description_info > Handled.', 4);
  }

  /**
   * Handles the Jingle security info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_security_info = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.xmpp);

    self.get_debug().log('[JSJaCJingle] handle_security_info > Handled.', 4);
  }

  /**
   * Handles the Jingle session accept
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_accept = function(stanza) {
    switch(stanza.getType()) {
      case 'result':
        self.handle_session_accept_success(stanza);
        (self.get_start_success())(stanza);

        break;

      case 'error':
        self.handle_session_accept_error(stanza);
        (self.get_start_error())(stanza);

        break;

      case 'set':
        self.handle_session_accept_request(stanza);

        break;

      default:
        self.send_error(stanza, JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.xmpp);
    }

    self.get_debug().log('[JSJaCJingle] handle_session_accept > Handled.', 4);
  }

  /**
   * Handles the Jingle session accept success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_accept_success = function(stanza) {
    // TODO

    self.get_debug().log('[JSJaCJingle] handle_session_accept_success > Handled.', 4);
  }

  /**
   * Handles the Jingle session accept error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_accept_error = function(stanza) {
    // TODO

    self.get_debug().log('[JSJaCJingle] handle_session_accept_error > Handled.', 4);
  }

  /**
   * Handles the Jingle session accept request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_accept_request = function(stanza) {
    // TODO

    self.get_debug().log('[JSJaCJingle] handle_session_accept_request > Handled.', 4);
  }

  /**
   * Handles the Jingle session info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_info = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.xmpp);

    self.get_debug().log('[JSJaCJingle] handle_session_info > Handled.', 4);
  }

  /**
   * Handles the Jingle session initiate
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_initiate = function(stanza) {
    switch(stanza.getType()) {
      case 'result':
        self.handle_session_initiate_success(stanza);
        (self.get_init_success())(stanza);

        break;

      case 'error':
        self.handle_session_initiate_error(stanza);
        (self.get_init_error())(stanza);

        break;

      case 'set':
        self.handle_session_initiate_request(stanza);

        break;

      default:
        self.send_error(stanza, JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.xmpp);
    }

    self.get_debug().log('[JSJaCJingle] handle_session_initiate > Handled.', 4);
  }

  /**
   * Handles the Jingle session initiate success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_initiate_success = function(stanza) {
    // TODO
    // 1. Check the IQ ID
    // 2. Match, accept and change current status
    // DO THIS UPPER-LEVEL - PARENT FUNCTION!

    // Change session status
    self._set_status(JSJAC_JINGLE_STATUS_INITIATED);

    self.get_debug().log('[JSJaCJingle] handle_session_initiate_success > Handled.', 4);
  }

  /**
   * Handles the Jingle session initiate error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_initiate_error = function(stanza) {
    // TODO

    // Change session status
    self._set_status(JSJAC_JINGLE_STATUS_INACTIVE);

    self.get_debug().log('[JSJaCJingle] handle_session_initiate_error > Handled.', 4);
  }

  /**
   * Handles the Jingle session initiate request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_initiate_request = function(stanza) {
    // TODO: reply to initiate request!

    // Change session status
    self._set_status(JSJAC_JINGLE_STATUS_INITIATING);

    self.get_debug().log('[JSJaCJingle] handle_session_initiate_request > Handled.', 4);
  }

  /**
   * Handles the Jingle session terminate
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_terminate = function(stanza) {
    switch(stanza.getType()) {
      case 'result':
        self.handle_session_terminate_success(stanza);
        (self.get_terminate_success())(stanza);

        break;

      case 'error':
        self.handle_session_terminate_error(stanza);
        (self.get_terminate_error())(stanza);

        break;

      case 'set':
        self.handle_session_terminate_request(stanza);

        break;

      default:
        self.send_error(stanza, JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.xmpp);
    }

    self.get_debug().log('[JSJaCJingle] handle_session_terminate > Handled.', 4);
  }

  /**
   * Handles the Jingle session terminate success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_terminate_success = function(stanza) {
    // Change session status
    self._set_status(JSJAC_JINGLE_STATUS_TERMINATED);

    self.get_debug().log('[JSJaCJingle] handle_session_terminate_success > Handled.', 4);
  }

  /**
   * Handles the Jingle session terminate error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_terminate_error = function(stanza) {
    // TODO: force termination

    // Change session status
    self._set_status(JSJAC_JINGLE_STATUS_TERMINATED);

    self.get_debug().log('[JSJaCJingle] handle_session_terminate_error > Handled.', 4);
  }

  /**
   * Handles the Jingle session terminate request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_terminate_request = function(stanza) {
    // TODO: send termination result

    // Change session status
    self._set_status(JSJAC_JINGLE_STATUS_TERMINATED);

    self.get_debug().log('[JSJaCJingle] handle_session_terminate_request > Handled.', 4);
  }

  /**
   * Handles the Jingle transport accept
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_transport_accept = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.xmpp);

    self.get_debug().log('[JSJaCJingle] handle_transport_accept > Handled.', 4);
  }

  /**
   * Handles the Jingle transport info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_transport_info = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.xmpp);

    self.get_debug().log('[JSJaCJingle] handle_transport_info > Handled.', 4);
  }

  /**
   * Handles the Jingle transport reject
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_transport_reject = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.xmpp);

    self.get_debug().log('[JSJaCJingle] handle_transport_reject > Handled.', 4);
  }

  /**
   * Handles the Jingle transport replace
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_transport_replace = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.xmpp);

    self.get_debug().log('[JSJaCJingle] handle_transport_replace > Handled.', 4);
  }



  /**
   * JSJSAC JINGLE GETTERS
   */

  /**
   * Gets the connection value
   * @return connection value
   * @type JSJaCConnection
   */
  self.get_connection = function() {
    return self._connection;
  }

  /**
   * Gets the init_pending value
   * @return init_pending value
   * @type function
   */
  self.get_init_pending = function() {
    if(typeof(self._init_pending) == 'function')
      return self._init_pending;

    return function() {};
  }

  /**
   * Gets the init_success value
   * @return init_success value
   * @type function
   */
  self.get_init_success = function() {
    if(typeof(self._init_success) == 'function')
      return self._init_success;

    return function(stanza) {};
  }

  /**
   * Gets the init_error value
   * @return init_error value
   * @type function
   */
  self.get_init_error = function() {
    if(typeof(self._init_error) == 'function')
      return self._init_error;

    return function(stanza) {};
  }

  /**
   * Gets the start_pending value
   * @return start_pending value
   * @type function
   */
  self.get_start_pending = function() {
    if(typeof(self._start_pending) == 'function')
      return self._start_pending;

    return function() {};
  }

  /**
   * Gets the start_success value
   * @return start_success value
   * @type function
   */
  self.get_start_success = function() {
    if(typeof(self._start_success) == 'function')
      return self._start_success;

    return function(stanza) {};
  }

  /**
   * Gets the start_error value
   * @return start_error value
   * @type function
   */
  self.get_start_error = function() {
    if(typeof(self._start_error) == 'function')
      return self._start_error;

    return function(stanza) {};
  }

  /**
   * Gets the terminate_pending value
   * @return terminate_pending value
   * @type function
   */
  self.get_terminate_pending = function() {
    if(typeof(self._terminate_pending) == 'function')
      return self._terminate_pending;

    return function() {};
  }

  /**
   * Gets the terminate_success value
   * @return terminate_success value
   * @type function
   */
  self.get_terminate_success = function() {
    if(typeof(self._terminate_success) == 'function')
      return self._terminate_success;

    return function(stanza) {};
  }

  /**
   * Gets the terminate_error value
   * @return terminate_error value
   * @type function
   */
  self.get_terminate_error = function() {
    if(typeof(self._terminate_error) == 'function')
      return self._terminate_error;

    return function(stanza) {};
  }

  /**
   * Gets the local_view value
   * @return local_view value
   * @type DOM
   */
  self.get_local_view = function() {
    return self._local_view;
  }

  /**
   * Gets the remote_view value
   * @return remote_view value
   * @type DOM
   */
  self.get_remote_view = function() {
    return self._remote_view;
  }

  /**
   * Gets the debug value
   * @return debug value
   * @type JSJaCDebugger
   */
  self.get_debug = function() {
    return self._debug;
  }

  /**
   * Gets the local_stream value
   * @return local_stream value
   * @type string
   */
  self.get_local_stream = function() {
    return self._local_stream;
  }

  /**
   * Gets the remote_stream value
   * @return remote_stream value
   * @type string
   */
  self.get_remote_stream = function() {
    return self._remote_stream;
  }

  /**
   * Gets the content_session value
   * @return content_session value
   * @type Object
   */
  self.get_content_session = function() {
    return self._content_session;
  }

  /**
   * Gets the sid value
   * @return sid value
   * @type string
   */
  self.get_sid = function() {
    return self._sid;
  }

  /**
   * Gets the action_last value
   * @return action_last value
   * @type string
   */
  self.get_action_last = function() {
    return self._action_last;
  }

  /**
   * Gets the status value
   * @return status value
   * @type string
   */
  self.get_status = function() {
    return self._status;
  }

  /**
   * Gets the to value
   * @return to value
   * @type string
   */
  self.get_to = function() {
    return self._to;
  }

  /**
   * Gets the receiver value
   * @return receiver value
   * @type string
   */
  self.get_receiver = function() {
    return self._receiver;
  }

  /**
   * Gets the initiator value
   * @return initiator value
   * @type string
   */
  self.get_initiator = function() {
    return self._initiator;
  }

  /**
   * Gets the response value
   * @return response value
   * @type string
   */
  self.get_responder = function() {
    return self._responder;
  }

  /**
   * Gets the handlers value
   * @return handlers value
   * @type Object
   */
  self.get_handlers = function(action) {
    if(action && typeof(self._handlers[action]) == 'function')
      return self._handlers[action];

    return function(stanza) {};
  }

  /**
   * Gets the server_config value
   * @return server_config value
   * @type string
   */
  self.server_config = function() {
    return self._server_config;
  }

  /**
   * Gets the peer_connection value
   * @return peer_connection value
   * @type PeerConnection
   */
  self.peer_connection = function() {
    return self._peer_connection;
  }

  /**
   * Gets the sdp_message value
   * @return sdp_message value
   * @type string
   */
  self.get_sdp_message = function() {
    return self._sdp_message;
  }



  /**
   * JSJSAC JINGLE SETTERS
   */

  /**
   * @private
   */
  self._set_connection = function(connection) {
    self._connection = connection;
  }

  /**
   * @private
   */
  self._set_init_pending = function(init_pending) {
    self._init_pending = init_pending;
  }

  /**
   * @private
   */
  self._set_init_success = function(init_success) {
    self._init_success = init_success;
  }

  /**
   * @private
   */
  self._set_init_error = function(init_error) {
    self._init_error = init_error;
  }

  /**
   * @private
   */
  self._set_start_pending = function(start_pending) {
    self._start_pending = start_pending;
  }

  /**
   * @private
   */
  self._set_start_success = function(start_success) {
    self._start_success = start_success;
  }

  /**
   * @private
   */
  self._set_start_error = function(start_error) {
    self._start_error = start_error;
  }

  /**
   * @private
   */
  self._set_terminate_pending = function(terminate_pending) {
    self._terminate_pending = terminate_pending;
  }

  /**
   * @private
   */
  self._set_terminate_success = function(terminate_success) {
    self._terminate_success = terminate_success;
  }

  /**
   * @private
   */
  self._set_terminate_error = function(terminate_error) {
    self._terminate_error = terminate_error;
  }

  /**
   * @private
   */
  self._set_local_view = function(local_view) {
    self._local_view = local_view;
  }

  /**
   * @private
   */
  self._set_remote_view = function(remote_view) {
    self._remote_view = remote_view;
  }

  /**
   * @private
   */
  self._set_debug = function(debug) {
    self._debug = debug;
  }

  /**
   * @private
   */
  self._set_local_stream = function(local_stream) {
    self._local_stream = local_stream;
  }

  /**
   * @private
   */
  self._set_remote_stream = function(remote_stream) {
    self._remote_stream = remote_stream;
  }

  /**
   * @private
   */
  self._set_content_session = function(content_session) {
    self._content_session = content_session;
  }

  /**
   * @private
   */
  self._set_sid = function(sid) {
    self._sid = sid;
  }

  /**
   * @private
   */
  self._set_action_last = function(action_last) {
    self._action_last = action_last;
  }

  /**
   * @private
   */
  self._set_status = function(status) {
    self._status = status;
  }

  /**
   * @private
   */
  self._set_to = function(receiver) {
    self._to = to;
  }

  /**
   * @private
   */
  self._set_receiver = function(receiver) {
    self._receiver = receiver;
  }

  /**
   * @private
   */
  self._set_initiator = function(initiator) {
    self._initiator = initiator;
  }

  /**
   * @private
   */
  self._set_responder = function(responder) {
    self._responder = responder;
  }

  /**
   * @private
   */
  self._set_handlers = function(action, handler) {
    self._handlers[action] = handler;
  }

  /**
   * @private
   */
  self._set_server_config = function(server_config) {
    self._server_config = server_config;
  }

  /**
   * @private
   */
  self._set_peer_connection = function(peer_connection) {
    self._peer_connection = peer_connection;
  }

  /**
   * @private
   */
  self._set_sdp_message = function(sdp_message) {
    self._sdp_message = sdp_message;
  }



  /**
   * JSJSAC JINGLE PEER API
   */

  /**
   * @private
   */
  self._peer_connection_create = function(sdp_message_callback) {
    try {
      // Create PeerConnection object
      self._set_peer_connection(new PeerConnection(_serverConfig, sdpMessageCallback));

      // Event: onaddstream
      self.get_peer_connection().onaddstream = function(e) {
        self.get_debug().info('[JSJaCJingle] _peer_connection_create > onaddstream');
        self.get_debug().log('[JSJaCJingle] _peer_connection_create > ' + e, 4);

        // Attach PeerConnection remote stream
        var stream = e.stream,
        url = URL.createObjectURL(stream);

        self.get_remote_view().attr('src', url);
        self.get_remote_stream() = stream;
      };

      // Event: onremovestream
      self.get_peer_connection().onremovestream = function(e) {
        self.get_remote_view().attr('src', '');
      };

      // Event: onmessage
      self.get_peer_connection().onmessage = function(e) {
        self.get_debug().info('[JSJaCJingle] _peer_connection_create > onmessage');
        self.get_debug().log('[JSJaCJingle] _peer_connection_create > ' + e, 4);
      };

      // Event: onopen
      self.get_peer_connection().onopen = function(e) {
        self.get_debug().info('[JSJaCJingle] _peer_connection_create > onopen');
        self.get_debug().log('[JSJaCJingle] _peer_connection_create > ' + e, 4);
      };

      // Event: onconnecting
      self.get_peer_connection().onconnecting = function(e) {
        self.get_debug().info('[JSJaCJingle] _peer_connection_create > onconnecting');
        self.get_debug().dir(e);
      };

      // Event: onstatechange
      self.get_peer_connection().onstatechange = function(e, state) {
        self.get_debug().info('[JSJaCJingle] _peer_connection_create > onstatechange');
        self.get_debug().dir(e, state);
      };

      // Attach PeerConnection local stream
      self.get_peer_connection().addStream(self.get_local_stream());

      self.get_debug().log('[JSJaCJingle] _peer_connection_create > Done.', 4);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_connection_create > Error: ' + e, 1);
    }
  }

  /**
   * @private
   */
  self._peer_get_user_media = function(callback) {
    try {
      self.get_debug().log('[JSJaCJingle] _peer_get_user_media > Getting user media...', 4);

      navigator.getUserMedia('video,audio', self._peer_got_stream.bind(this, callback), self._peer_got_stream.bind(this));
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_get_user_media > Could not get user media.', 1);
    }
  }

  /**
   * @private
   */
  self._peer_got_stream = function(callback, stream) {
    try {
      var url = URL.createObjectURL(stream);

      (self.get_local_view()).attr('src', url);
      self._set_local_stream(stream);

      if(callback)
        callback();

      self.get_debug().log('[JSJaCJingle] _peer_got_stream > Got stream.', 4);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_got_stream > URL.createObjectURL() method not available.', 1);
    }
  }

  /**
   * @private
   */
  self._peer_got_stream_failed = function(error) {
    self.get_debug().log('[JSJaCJingle] _peer_got_stream_failed > Stream failed.', 1);
  }

  /**
   * @private
   */
  self._peer_get_json_from_sdp = function(message) {
    try {
      return JSON.parse(msg.substring(4));
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_get_json_from_sdp > JSON parser not available.', 1);
    }

    return null;
  }

  /**
   * @private
   */
  self._peer_xml_html_node = function(html) {
    // From Strophe.js (License: MIT)
    if(window.DOMParser) {
      parser = new DOMParser();
      node = parser.parseFromString(html, 'text/xml');
    } else {
      node = new ActiveXObject('Microsoft.XMLDOM');
      node.async = 'false';
      node.loadXML(html);
    }

    self.get_debug().log('[JSJaCJingle] _peer_xml_html_node > Done.', 4);

    return node;
  }

  /**
   * @private
   */
  self._peer_generate_json_from_sdp = function(sdp, info) {
    var str = 'SDP\n{\n';

    if(info.attr('answererid'))
      str += '   "answererSessionId" : "' + info.attr('answererid') + '",\n';

    str += '   "messageType" : "' + info.attr('type') + '",\n';

    if(info.attr('offererid'))
      str += '   "offererSessionId" : "' + info.attr('offererid') + '",\n';

    if(sdp)
      str += '   "sdp" : "' + sdp + '",\n';

    str += '   "seq" : ' + parseInt(info.attr('seq'), 10);

    if(info.attr('tiebreaker'))
      str += ',\n   "tieBreaker" : ' + parseInt(info.attr('tiebreaker'), 10);

    self.get_debug().log('[JSJaCJingle] _peer_generate_json_from_sdp > Generated.', 4);

    return str + '\n}';
  }

  /**
   * @private
   */
  self._peer_jingle_to_sdp = function(sdp_message_callback) {
    // TODO

    self.get_debug().log('[JSJaCJingle] _peer_jingle_to_sdp > Done.', 4);
  }

  /**
   * @private
   */
  self._peer_sdp_to_jingle = function(sdp_message_callback) {
    // TODO

    self.get_debug().log('[JSJaCJingle] _peer_sdp_to_jingle > Done.', 4);
  }
}