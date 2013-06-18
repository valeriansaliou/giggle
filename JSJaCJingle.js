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

var R_NS_JINGLE_APP                                 = /urn:xmpp:jingle:app:([a-zA-Z]+):([O-9]+)/;
var R_NS_JINGLE_TRANSPORT                           = /urn:xmpp:jingle:transport:([a-zA-Z]+)/;



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

var JSJAC_JINGLE_ERROR_OUT_OF_BORDER                = { jingle: 'out-of-border',    xmpp: 'unexpected-request' };
var JSJAC_JINGLE_ERROR_TIE_BREAK                    = { jingle: 'tie-break',        xmpp: 'conflict' };
var JSJAC_JINGLE_ERROR_UNKNOWN_SESSION              = { jingle: 'unknown-session',  xmpp: 'item-not-found' };
var JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO             = { jingle: 'unsupported-info', xmpp: 'feature-not-implemented' };

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



/**
 * JSJSAC JINGLE CONSTANTS MAPPING
 */

var JSJAC_JINGLE_STATUSES  = {
  JSJAC_JINGLE_STATUS_INACTIVE,
  JSJAC_JINGLE_STATUS_INITIATING,
  JSJAC_JINGLE_STATUS_INITIATED,
  JSJAC_JINGLE_STATUS_STARTING,
  JSJAC_JINGLE_STATUS_STARTED,
  JSJAC_JINGLE_STATUS_TERMINATING,
  JSJAC_JINGLE_STATUS_TERMINATED
};

var JSJAC_JINGLE_ACTIONS   = {
  JSJAC_JINGLE_ACTION_CONTENT_ACCEPT,
  JSJAC_JINGLE_ACTION_CONTENT_ADD,
  JSJAC_JINGLE_ACTION_CONTENT_MODIFY,
  JSJAC_JINGLE_ACTION_CONTENT_REJECT,
  JSJAC_JINGLE_ACTION_CONTENT_REMOVE,
  JSJAC_JINGLE_ACTION_DESCRIPTION_INFO,
  JSJAC_JINGLE_ACTION_SECURITY_INFO,
  JSJAC_JINGLE_ACTION_SESSION_ACCEPT,
  JSJAC_JINGLE_ACTION_SESSION_INFO,
  JSJAC_JINGLE_ACTION_SESSION_INITIATE,
  JSJAC_JINGLE_ACTION_SESSION_TERMINATE,
  JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT,
  JSJAC_JINGLE_ACTION_TRANSPORT_INFO,
  JSJAC_JINGLE_ACTION_TRANSPORT_REJECT,
  JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE
};

var JSJAC_JINGLE_ERRORS     = {
  JSJAC_JINGLE_ERROR_OUT_OF_BORDER,
  JSJAC_JINGLE_ERROR_TIE_BREAK,
  JSJAC_JINGLE_ERROR_UNKNOWN_SESSION,
  JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO
};

var JSJAC_JINGLE_REASONS    = {
  JSJAC_JINGLE_REASON_ALTERNATIVE_SESSION,
  JSJAC_JINGLE_REASON_BUSY,
  JSJAC_JINGLE_REASON_CANCEL,
  JSJAC_JINGLE_REASON_CONNECTIVITY_ERROR,
  JSJAC_JINGLE_REASON_DECLINE,
  JSJAC_JINGLE_REASON_EXPIRED,
  JSJAC_JINGLE_REASON_FAILED_APPLICATION,
  JSJAC_JINGLE_REASON_FAILED_TRANSPORT,
  JSJAC_JINGLE_REASON_GENERAL_ERROR,
  JSJAC_JINGLE_REASON_GONE,
  JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS,
  JSJAC_JINGLE_REASON_MEDIA_ERROR,
  JSJAC_JINGLE_REASON_SECURITY_ERROR,
  JSJAC_JINGLE_REASON_SUCCESS,
  JSJAC_JINGLE_REASON_TIMEOUT,
  JSJAC_JINGLE_REASON_UNSUPPORTED_APPLICATIONS,
JSJAC_JINGLE_REASON_UNSUPPORTED_TRANSPORTS
};



/**
 * JSJSAC JINGLE GENERAL METHODS
 */

/**
 * Creates a new XMPP Jingle session.
 * @class Somewhat abstract base class for XMPP Jingle sessions. Contains all
 * of the code in common for all Jingle sessions
 * @constructor
 * @param {object} args Jingle session arguments
 */
function JSJaCJingle(args) {
  if(args && args.connection)
    /**
     * @private
     */
    this._connection = args.connection;

  if(args && args.success_callback)
    /**
     * @private
     */
    this._success_callback = args.success_callback;

  if(args && args.error_callback)
    /**
     * @private
     */
    this._error_callback = args.error_callback;

  if(args && local_view)
    /**
     * @private
     */
    this._local_view = args.local_view;

  if(args && remote_view)
    /**
     * @private
     */
    this._remote_view = args.remote_view;

  if(args && args.debug && args.debug.log) {
      /**
       * Reference to debugger interface
       * (needs to implement method <code>log</code>)
       * @type JSJaCDebugger
       */
    this._debug = args.debug;
  } else {
      this._debug = {
        log: function() {}
      };
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
  this._content_session = {};

  /**
   * @private
   */
  this._initiator = '';

  /**
   * @private
   */
  this._sid = '';

  /**
   * @private
   */
  this._action_last = '';

  /**
   * @private
   */
  this._status = JSJAC_JINGLE_STATUS_INACTIVE;

  /**
   * @private
   */
  this._receiver = false;

  /**
   * @private
   */
  this._response = '';

  /**
   * @private
   */
  this._handlers = {};

  /**
   * @private
   */
  this._server_config = 'NONE';

  /**
   * @private
   */
  this._peer_connection = null;

  /**
   * @private
   */
  this._sdp_message = '';
}


/**
 * Init a new Jingle session.
 * @param {object} args Jingle session arguments
 */
JSJaCJingle.prototype.init = function() {
  // Slot unavailable?
  if(this.get_status() != JSJAC_JINGLE_STATUS_INACTIVE)
    this.get_debug().log('[JSJaCJingle] Cannot init, resource not inactive (status: ' + this.get_status() + ').', 1); return;

  // Register Jingle IQ handler
  // TODO
  registerIQSet(<String> childName, <String> childNS, <Function> handler);

  // TODO: .send() session-initiate
  // TODO: REGISTER: .handle() over .send() --> start()
}

/**
 * Starts the Jingle session.
 */
JSJaCJingle.prototype.start = function(to, handler) {
  // Slot unavailable?
  if(!(this.get_status() == JSJAC_JINGLE_STATUS_INITIATED || this.get_status() == JSJAC_JINGLE_STATUS_TERMINATED))
    this.get_debug().log('[JSJaCJingle] Cannot start, resource not initiated or terminated (status: ' + this.get_status() + ').', 1); return;

  // TODO
  // TODO: REGISTER: .handle() over .send()
}

/**
 * Terminates an active Jingle session.
 * @return 'true' if session was terminated, 'false' in case it wasn't found
 * @type boolean
 */
JSJaCJingle.prototype.terminate = function() {
  // Slot unavailable?
  if(!(this.get_status() == JSJAC_JINGLE_STATUS_INITIATED || this.get_status() == JSJAC_JINGLE_STATUS_TERMINATED))
    this.get_debug().log('[JSJaCJingle] Cannot terminate, resource not started (status: ' + this.get_status() + ').', 1); return;

  // TODO: .send() session-terminate
  // TODO: REGISTER: .handle() over .send()
  // TODO: .handle session-terminate ack, trigger a client event
}

/**
 * Sends a given Jingle stanza packet
 */
JSJaCJingle.prototype.send = function(stanza) {
  // Slot unavailable?
  if(!(this.get_status() == JSJAC_JINGLE_STATUS_INITIATED || this.get_status() == JSJAC_JINGLE_STATUS_STARTED))
    this.get_debug().log('[JSJaCJingle] Cannot send, resource not initiated or started (status: ' + this.get_status() + ').', 1); return;

  // TODO
  // TODO: send over the network
  // TODO: get stanza data from one of the send_* method
}

/**
 * Handles a given Jingle stanza response
 */
JSJaCJingle.prototype.handle = function(stanza) {
  // TODO

  var action = stanza.getNode().getChild('contents').getAttribute('action');
  this._set_action_last(action);

  // Submit to registered handler
  switch(action) {
    case JSJAC_JINGLE_ACTION_CONTENT_ACCEPT:
      this.handle_content_accept(stanza); break;

    case JSJAC_JINGLE_ACTION_CONTENT_ADD:
      this.handle_content_add(stanza); break;

    case JSJAC_JINGLE_ACTION_CONTENT_MODIFY:
      this.handle_content_modify(stanza); break;

    case JSJAC_JINGLE_ACTION_CONTENT_REJECT:
      this.handle_content_reject(stanza); break;

    case JSJAC_JINGLE_ACTION_CONTENT_REMOVE:
      this.handle_content_remove(stanza); break;

    case JSJAC_JINGLE_ACTION_DESCRIPTION_INFO:
      this.handle_description_info(stanza); break;

    case JSJAC_JINGLE_ACTION_SECURITY_INFO:
      this.handle_security_info(stanza); break;

    case JSJAC_JINGLE_ACTION_SESSION_ACCEPT:
      this.send_session_accept(stanza); break;

    case JSJAC_JINGLE_ACTION_SESSION_INFO:
      this.send_session_info(stanza); break;

    case JSJAC_JINGLE_ACTION_SESSION_INITIATE:
      this.send_session_initiate(stanza); break;

    case JSJAC_JINGLE_ACTION_SESSION_TERMINATE:
      this.send_session_terminate(stanza); break;

    case JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT:
      this.send_transport_accept(stanza); break;

    case JSJAC_JINGLE_ACTION_TRANSPORT_INFO:
      this.send_transport_info(stanza); break;

    case JSJAC_JINGLE_ACTION_TRANSPORT_REJECT:
      this.send_transport_reject(stanza); break;

    case JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE:
      this.send_transport_replace(stanza); break;
  }

  if(action in this.get_handlers()) {
    try {
      this.get_debug().log('[JSJaCJingle] Binding to handler for action: ' + action, 4);

      ((this.get_handlers())[action])(jingle);
    } catch(e) {
      this.get_debug().log('[JSJaCJingle] Could not bind to handler for action: ' + action + ' > ' + e, 1);
    }
  }
}

/**
 * Registers a given handler on a given Jingle stanza
 */
JSJaCJingle.prototype.register_handler = function(action, fn) {
  if(typeof(fn) != 'function') {
    this.get_debug().log('[JSJaCJingle] fn parameter not passed or not a function!', 1);

    return false;
  }

  if(action && action in JSJAC_JINGLE_ACTIONS) {
    this._set_handlers(action, fn);

    this.get_debug().log('[JSJaCJingle] Registered handler for action: ' + action, 4);

    return true;
  } else {
    this.get_debug().log('[JSJaCJingle] Could not register handler for action: ' + action + ' (not in protocol)', 1);

    return false;
  }
}



/**
 * JSJSAC JINGLE SENDERS
 */

/**
 * Sends the Jingle content accept
 */
JSJaCJingle.prototype.send_content_accept = function() {
  // TODO
  // Feature not implemented for now

  this.get_debug().log('[JSJaCJingle] Send content accept.', 4);
}

/**
 * Sends the Jingle content add
 */
JSJaCJingle.prototype.send_content_add = function() {
  // TODO
  // Feature not implemented for now

  this.get_debug().log('[JSJaCJingle] Send content add.', 4);
}

/**
 * Sends the Jingle content modify
 */
JSJaCJingle.prototype.send_content_modify = function() {
  // TODO
  // Feature not implemented for now

  this.get_debug().log('[JSJaCJingle] Send content modify.', 4);
}

/**
 * Sends the Jingle content reject
 */
JSJaCJingle.prototype.send_content_reject = function() {
  // TODO
  // Feature not implemented for now

  this.get_debug().log('[JSJaCJingle] Send content reject.', 4);
}

/**
 * Sends the Jingle content remove
 */
JSJaCJingle.prototype.send_content_remove = function() {
  // TODO
  // Feature not implemented for now

  this.get_debug().log('[JSJaCJingle] Send content remove.', 4);
}

/**
 * Sends the Jingle description info
 */
JSJaCJingle.prototype.send_description_info = function() {
  // TODO
  // Feature not implemented for now

  this.get_debug().log('[JSJaCJingle] Send description info.', 4);
}

/**
 * Sends the Jingle security info
 */
JSJaCJingle.prototype.send_security_info = function() {
  // TODO
  // Feature not implemented for now

  this.get_debug().log('[JSJaCJingle] Send security info.', 4);
}

/**
 * Sends the Jingle session accept
 */
JSJaCJingle.prototype.send_session_accept = function() {
  // TODO

  this.get_debug().log('[JSJaCJingle] Send session accept.', 4);
}

/**
 * Sends the Jingle session info
 */
JSJaCJingle.prototype.send_session_info = function() {
  // TODO

  this.get_debug().log('[JSJaCJingle] Send session info.', 4);
}

/**
 * Sends the Jingle session initiate
 */
JSJaCJingle.prototype.send_session_initiate = function() {
  // TODO

  this.get_debug().log('[JSJaCJingle] Send session initiate.', 4);
}

/**
 * Sends the Jingle session terminate
 */
JSJaCJingle.prototype.send_session_terminate = function() {
  // TODO

  this.get_debug().log('[JSJaCJingle] Send session terminate.', 4);
}

/**
 * Sends the Jingle transport accept
 */
JSJaCJingle.prototype.send_transport_accept = function() {
  // TODO
  // Error reply: feature-not-implemented

  this.get_debug().log('[JSJaCJingle] Send transport accept.', 4);
}

/**
 * Sends the Jingle transport info
 */
JSJaCJingle.prototype.send_transport_info = function() {
  // TODO
  // Error reply: feature-not-implemented

  this.get_debug().log('[JSJaCJingle] Send transport info.', 4);
}

/**
 * Sends the Jingle transport reject
 */
JSJaCJingle.prototype.send_transport_reject = function() {
  // TODO
  // Error reply: feature-not-implemented

  this.get_debug().log('[JSJaCJingle] Send transport reject.', 4);
}

/**
 * Sends the Jingle transport replace
 */
JSJaCJingle.prototype.send_transport_replace = function() {
  // TODO
  // Error reply: feature-not-implemented

  this.get_debug().log('[JSJaCJingle] Send transport replace.', 4);
}



/**
 * JSJSAC JINGLE HANDLERS
 */

/**
 * Handles the Jingle content accept
 * @param {JSJaCPacket} stanza Jingle handled stanza
 */
JSJaCJingle.prototype.handle_content_accept = function(stanza) {
  // TODO
  // Error reply: feature-not-implemented

  this.get_debug().log('[JSJaCJingle] Handle content accept.', 4);
}

/**
 * Handles the Jingle content add
 * @param {JSJaCPacket} stanza Jingle handled stanza
 */
JSJaCJingle.prototype.handle_content_add = function(stanza) {
  // TODO
  // Error reply: feature-not-implemented

  this.get_debug().log('[JSJaCJingle] Handle content add.', 4);
}

/**
 * Handles the Jingle content modify
 * @param {JSJaCPacket} stanza Jingle handled stanza
 */
JSJaCJingle.prototype.handle_content_modify = function(stanza) {
  // TODO
  // Error reply: feature-not-implemented

  this.get_debug().log('[JSJaCJingle] Handle content modify.', 4);
}

/**
 * Handles the Jingle content reject
 * @param {JSJaCPacket} stanza Jingle handled stanza
 */
JSJaCJingle.prototype.handle_content_reject = function(stanza) {
  // TODO
  // Error reply: feature-not-implemented

  this.get_debug().log('[JSJaCJingle] Handle content reject.', 4);
}

/**
 * Handles the Jingle content remove
 * @param {JSJaCPacket} stanza Jingle handled stanza
 */
JSJaCJingle.prototype.handle_content_remove = function(stanza) {
  // TODO
  // Error reply: feature-not-implemented

  this.get_debug().log('[JSJaCJingle] Handle content remove.', 4);
}

/**
 * Handles the Jingle description info
 * @param {JSJaCPacket} stanza Jingle handled stanza
 */
JSJaCJingle.prototype.handle_description_info = function(stanza) {
  // TODO
  // Error reply: feature-not-implemented

  this.get_debug().log('[JSJaCJingle] Handle description info.', 4);
}

/**
 * Handles the Jingle security info
 * @param {JSJaCPacket} stanza Jingle handled stanza
 */
JSJaCJingle.prototype.handle_security_info = function(stanza) {
  // TODO
  // Error reply: feature-not-implemented

  this.get_debug().log('[JSJaCJingle] Handle security info.', 4);
}

/**
 * Handles the Jingle session accept
 * @param {JSJaCPacket} stanza Jingle handled stanza
 */
JSJaCJingle.prototype.handle_session_accept = function(stanza) {
  // TODO

  this.get_debug().log('[JSJaCJingle] Handle session accept.', 4);
}

/**
 * Handles the Jingle session info
 * @param {JSJaCPacket} stanza Jingle handled stanza
 */
JSJaCJingle.prototype.handle_session_info = function(stanza) {
  // TODO

  this.get_debug().log('[JSJaCJingle] Handle session info.', 4);
}

/**
 * Handles the Jingle session initiate
 * @param {JSJaCPacket} stanza Jingle handled stanza
 */
JSJaCJingle.prototype.handle_session_initiate = function(stanza) {
  // TODO

  this.get_debug().log('[JSJaCJingle] Handle session initiate.', 4);
}

/**
 * Handles the Jingle session terminate
 * @param {JSJaCPacket} stanza Jingle handled stanza
 */
JSJaCJingle.prototype.handle_session_terminate = function(stanza) {
  // TODO

  this.get_debug().log('[JSJaCJingle] Handle session terminate.', 4);
}

/**
 * Handles the Jingle transport accept
 * @param {JSJaCPacket} stanza Jingle handled stanza
 */
JSJaCJingle.prototype.handle_transport_accept = function(stanza) {
  // TODO
  // Error reply: feature-not-implemented

  this.get_debug().log('[JSJaCJingle] Handle transport accept.', 4);
}

/**
 * Handles the Jingle transport info
 * @param {JSJaCPacket} stanza Jingle handled stanza
 */
JSJaCJingle.prototype.handle_transport_info = function(stanza) {
  // TODO
  // Error reply: feature-not-implemented

  this.get_debug().log('[JSJaCJingle] Handle transport info.', 4);
}

/**
 * Handles the Jingle transport reject
 * @param {JSJaCPacket} stanza Jingle handled stanza
 */
JSJaCJingle.prototype.handle_transport_reject = function(stanza) {
  // TODO
  // Error reply: feature-not-implemented

  this.get_debug().log('[JSJaCJingle] Handle transport reject.', 4);
}

/**
 * Handles the Jingle transport replace
 * @param {JSJaCPacket} stanza Jingle handled stanza
 */
JSJaCJingle.prototype.handle_transport_replace = function(stanza) {
  // TODO
  // Error reply: feature-not-implemented

  this.get_debug().log('[JSJaCJingle] Handle transport replace.', 4);
}



/**
 * JSJSAC JINGLE GETTERS
 */

/**
 * Gets the connection value
 * @return connection value
 * @type JSJaCConnection
 */
JSJaCJingle.prototype.get_connection = function() {
  return this._connection;
}

/**
 * Gets the success_callback value
 * @return success_callback value
 * @type function
 */
JSJaCJingle.prototype.get_success_callback = function() {
  return this._success_callback;
}

/**
 * Gets the error_callback value
 * @return error_callback value
 * @type function
 */
JSJaCJingle.prototype.get_error_callback = function() {
  return this._error_callback;
}

/**
 * Gets the local_view value
 * @return local_view value
 * @type dom
 */
JSJaCJingle.prototype.get_local_view = function() {
  return this._local_view;
}

/**
 * Gets the remote_view value
 * @return remote_view value
 * @type dom
 */
JSJaCJingle.prototype.get_remote_view = function() {
  return this._remote_view;
}

/**
 * Gets the debug value
 * @return debug value
 * @type function
 */
JSJaCJingle.prototype.get_debug = function() {
  return this._debug;
}

/**
 * Gets the content_session value
 * @return content_session value
 * @type object
 */
JSJaCJingle.prototype.get_content_session = function() {
  return this._content_session;
}

/**
 * Gets the sid value
 * @return sid value
 * @type string
 */
JSJaCJingle.prototype.get_sid = function() {
  return this._sid;
}

/**
 * Gets the action_last value
 * @return action_last value
 * @type string
 */
JSJaCJingle.prototype.get_action_last = function() {
  return this._action_last;
}

/**
 * Gets the status value
 * @return status value
 * @type string
 */
JSJaCJingle.prototype.get_status = function() {
  return this._status;
}

/**
 * Gets the receiver value
 * @return receiver value
 * @type string
 */
JSJaCJingle.prototype.get_receiver = function() {
  return this._receiver;
}

/**
 * Gets the initiator value
 * @return initiator value
 * @type string
 */
JSJaCJingle.prototype.get_initiator = function() {
  return this._initiator;
}

/**
 * Gets the response value
 * @return response value
 * @type string
 */
JSJaCJingle.prototype.get_response = function() {
  return this._response;
}

/**
 * Gets the handlers value
 * @return handlers value
 * @type object
 */
JSJaCJingle.prototype.get_handlers = function() {
  return this._handlers;
}



/**
 * JSJSAC JINGLE SETTERS
 */

/**
 * @private
 */
JSJaCJingle.prototype._set_connection = function(connection) {
  this._connection = connection;
}

/**
 * @private
 */
JSJaCJingle.prototype._set_success_callback = function(success_callback) {
  this._success_callback = success_callback;
}

/**
 * @private
 */
JSJaCJingle.prototype._set_error_callback = function(error_callback) {
  this._error_callback = error_callback;
}

/**
 * @private
 */
JSJaCJingle.prototype._set_local_view = function(local_view) {
  this._local_view = local_view;
}

/**
 * @private
 */
JSJaCJingle.prototype._set_remote_view = function(remote_view) {
  this._remote_view = remote_view;
}

/**
 * @private
 */
JSJaCJingle.prototype._set_debug = function(debug) {
  this._debug = debug;
}

/**
 * @private
 */
JSJaCJingle.prototype._set_content_session = function(content_session) {
  this._content_session = content_session;
}

/**
 * @private
 */
JSJaCJingle.prototype._set_sid = function(sid) {
  this._sid = sid;
}

/**
 * @private
 */
JSJaCJingle.prototype._set_action_last = function(action_last) {
  this._action_last = action_last;
}

/**
 * @private
 */
JSJaCJingle.prototype._set_status = function(status) {
  this._status = status;
}

/**
 * @private
 */
JSJaCJingle.prototype._set_receiver = function(receiver) {
  this._receiver = receiver;
}

/**
 * @private
 */
JSJaCJingle.prototype._set_initiator = function(initiator) {
  this._initiator = initiator;
}

/**
 * @private
 */
JSJaCJingle.prototype._set_response = function(response) {
  this._response = response;
}

/**
 * @private
 */
JSJaCJingle.prototype._set_handlers = function(action, handler) {
  this._handlers[action] = handler;
}



/**
 * JSJSAC JINGLE PEER API
 */

/**
 * @private
 */
JSJaCJingle.prototype._peer_connection_create = function(sdp_message_callback) {
  // Create PeerConnection object
  this._set_peer_connection(new PeerConnection(_serverConfig, sdpMessageCallback));

  // Event: onaddstream
  this.get_peer_connection().onaddstream = function(e) {
    this.get_debug().info('[JSJaCJingle] onaddstream');
    this.get_debug().log('[JSJaCJingle] ' + e, 4);

    // Attach PeerConnection remote stream
    var stream = e.stream,
    url = URL.createObjectURL(stream);

    this.get_remote_view().attr('src', url);
    this.get_remote_stream() = stream;
  };

  // Event: onremovestream
  this.get_peer_connection().onremovestream = function(e) {
    this.get_remote_view().attr('src', '');
  };

  // Event: onmessage
  this.get_peer_connection().onmessage = function(e) {
    this.get_debug().info('[JSJaCJingle] onmessage');
    this.get_debug().log('[JSJaCJingle] ' + e, 4);
  };

  // Event: onopen
  this.get_peer_connection().onopen = function(e) {
    this.get_debug().info('[JSJaCJingle] onopen');
    this.get_debug().log('[JSJaCJingle] ' + e, 4);
  };

  // Event: onconnecting
  this.get_peer_connection().onconnecting = function(e) {
    this.get_debug().info('[JSJaCJingle] onconnecting');
    this.get_debug().dir(e);
  };

  // Event: onstatechange
  this.get_peer_connection().onstatechange = function(e, state) {
    this.get_debug().info('[JSJaCJingle] onstatechange');
    this.get_debug().dir(e, state);
  };

  // Attach PeerConnection local stream
  this.get_peer_connection().addStream(this.get_local_stream());
}

/**
 * @private
 */
JSJaCJingle.prototype._peer_get_user_media = function(callback) {
  try {
    this.get_debug().log('[JSJaCJingle] Getting user media...', 4);

    navigator.getUserMedia('video,audio', this._peer_got_stream.bind(this, callback), this._peer_got_stream.bind(this));
  } catch(e) {
    this.get_debug().log('[JSJaCJingle] Could not get user media.', 1);
  }
}

/**
 * @private
 */
JSJaCJingle.prototype._peer_got_stream = function(callback, stream) {
  // TODO

  this.get_debug().log('[JSJaCJingle] Got stream.', 4);
}

/**
 * @private
 */
JSJaCJingle.prototype._peer_got_stream_failed = function(error) {
  this.get_debug().log('[JSJaCJingle] Stream failed.', 1);
}

/**
 * @private
 */
JSJaCJingle.prototype._peer_get_json_from_sdp = function(message) {
  try
    return JSON.parse(msg.substring(4));
  catch(e)
    this.get_debug().log('[JSJaCJingle] JSON parser not available.', 1);

  return null;
}

/**
 * @private
 */
JSJaCJingle.prototype._peer_xml_html_node = function(html) {
  // From Strophe.js (License: MIT)
  if(window.DOMParser) {
    parser = new DOMParser();
    node = parser.parseFromString(html, 'text/xml');
  } else {
    node = new ActiveXObject('Microsoft.XMLDOM');
    node.async = 'false';
    node.loadXML(html);
  }

  return node;
}

/**
 * @private
 */
JSJaCJingle.prototype._peer_generate_json_from_sdp = function(sdp, info) {
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

  return str + '\n}';
}

/**
 * @private
 */
JSJaCJingle.prototype._peer_jingle_to_sdp = function(sdp_message_callback) {
  // TODO
}

/**
 * @private
 */
JSJaCJingle.prototype._peer_sdp_to_jingle = function(sdp_message_callback) {
  // TODO
}