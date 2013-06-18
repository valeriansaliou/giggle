/**
 * @fileoverview JSJaC Jingle library, implementation of XEP-0166.
 * @url http://xmpp.org/extensions/xep-0166.html
 * @author Valérian Saliou valerian@jappix.com
 */


/**
 * Jingle namespaces
 */
var NS_JINGLE                                       = 'urn:xmpp:jingle:1';
var NS_JINGLE_ERRORS                                = 'urn:xmpp:jingle:errors:1';

var NS_JINGLE_APPS_RTP                              = 'urn:xmpp:jingle:apps:rtp:1';
var NS_JINGLE_APPS_RTP_AUDIO                        = 'urn:xmpp:jingle:apps:rtp:audio';
var NS_JINGLE_APPS_RTP_VIDEO                        = 'urn:xmpp:jingle:apps:rtp:video';
var NS_JINGLE_APPS_STUB                             = 'urn:xmpp:jingle:apps:stub:0';

var NS_JINGLE_TRANSPORTS_ICEUDP                     = 'urn:xmpp:jingle:transports:ice-udp:1';
var NS_JINGLE_TRANSPORTS_STUB                       = 'urn:xmpp:jingle:transports:stub:0';

var NS_JINGLE_SECURITY_STUB                         = 'urn:xmpp:jingle:security:stub:0';

var R_NS_JINGLE_APP                                 = /urn:xmpp:jingle:app:([a-zA-Z]+):([O-9]+)/;
var R_NS_JINGLE_TRANSPORT                           = /urn:xmpp:jingle:transport:([a-zA-Z]+)/;


/**
 * JSJaC Jingle constants
 */
var JSJAC_JINGLE_ACTION_CONTENT_ACCEPT              = 'content-accept';
var JSJAC_JINGLE_ACTION_CONTENT_ADD                 = 'content-add';
var JSJAC_JINGLE_ACTION_CONTENT_MODIFY              = 'content-modify';
var JSJAC_JINGLE_ACTION_CONTENT_REJECT              = 'content-reject';
var JSJAC_JINGLE_ACTION_CONTENT_REMOVE              = 'content-remove';
var JSJAC_JINGLE_ACTION_DESCRIPTION_INFO            = 'description-info';
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
 * JSJaC Jingle constants mapping
 */
 var JSJAC_JINGLE_ACTIONS   = [
  JSJAC_JINGLE_ACTION_CONTENT_ACCEPT,
  JSJAC_JINGLE_ACTION_CONTENT_ADD,
  JSJAC_JINGLE_ACTION_CONTENT_MODIFY,
  JSJAC_JINGLE_ACTION_CONTENT_REJECT,
  JSJAC_JINGLE_ACTION_CONTENT_REMOVE,
  JSJAC_JINGLE_ACTION_DESCRIPTION_INFO,
  JSJAC_JINGLE_ACTION_SESSION_ACCEPT,
  JSJAC_JINGLE_ACTION_SESSION_INFO,
  JSJAC_JINGLE_ACTION_SESSION_INITIATE,
  JSJAC_JINGLE_ACTION_SESSION_TERMINATE,
  JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT,
  JSJAC_JINGLE_ACTION_TRANSPORT_INFO,
  JSJAC_JINGLE_ACTION_TRANSPORT_REJECT,
  JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE
];

var JSJAC_JINGLE_ERRORS     = [
  JSJAC_JINGLE_ERROR_OUT_OF_BORDER,
  JSJAC_JINGLE_ERROR_TIE_BREAK,
  JSJAC_JINGLE_ERROR_UNKNOWN_SESSION,
  JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO
];

var JSJAC_JINGLE_REASONS    = [
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
];


/**
 * Creates a new XMPP Jingle session.
 * @class Somewhat abstract base class for XMPP Jingle sessions. Contains all
 * of the code in common for all Jingle sessions
 * @constructor
 * @param {object} content_client Client supported Jingle content
 */
function JSJaCJingle(content_client) {
  if(content_client && typeof(content_client) == 'object')
    /**
     * @private
     */
    this._content_client = {};

  /**
   * @private
   */
  this._content_session = {};

  /**
   * @private
   */
  this._busy = false;

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
  this._status = 'terminated';
}


/**
 * Initializes a new Jingle session.
 * @param {object} content_client Client supported Jingle content
 */
JSJaCJingle.prototype.init = function(content_client) {
  // TODO: .send() session-initiate
  // TODO: REGISTER: .handle() over .send()
}

/**
 * Terminates an active Jingle session.
 * @return 'true' if session was terminated, 'false' in case it wasn't found
 * @type boolean
 */
JSJaCJingle.prototype.terminate = function() {
  // TODO: .send() session-terminate
  // TODO: REGISTER: .handle() over .send()
  // TODO: .handle session-terminate ack, trigger a client event
}

/**
 * Sends a given Jingle stanza packet
 */
JSJaCJingle.prototype.send = function(to) {
  // TODO
}

/**
 * Handles a given Jingle stanza response
 */
JSJaCJingle.prototype.handle = function(jingle) {
  // TODO
}

/**
 * Sets the Jingle session mode
 * @param {string} mode Jingle session mode
 */
JSJaCJingle.prototype.mode = function(mode) {
  // TODO: send the new mode request, register ack handler
}


/**
 * Gets the busy value
 * @return 'true' if Jingle is busy, 'false' otherwise
 * @type boolean
 */
JSJaCJingle.prototype.is_busy = function() {
  return this._busy;
}

/**
 * Gets the status value
 * @return status value
 * @type string
 */
JSJaCJingle.prototype.status = function() {
  return this._status;
}


/**
 * @private
 */
JSJaCJingle.prototype._set_content_session = function(mode) {
  //TODO: change session content on other party ack
}

/**
 * @private
 */
JSJaCJingle.prototype._set_busy = function(busy) {
  this._busy = busy;
}

/**
 * @private
 */
JSJaCJingle.prototype._set_status = function(status) {
  this._status = status;
}