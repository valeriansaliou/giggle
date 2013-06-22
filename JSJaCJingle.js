/**
 * @fileoverview JSJaC Jingle library, implementation of XEP-0166.
 * Written originally for Uno.im service requirements
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou valerian@jappix.com
 * @license Mozilla Public License (MPL)
 */


/**
 * Workflow
 *
 * Implements: XEP-0166
 * URL: http://xmpp.org/extensions/xep-0166.html

 * This negotiation example associates JSJaCJingle.js methods to a real workflow
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
 * JINGLE WEBRTC
 */

var WEBRTC_GET_MEDIA           = ( navigator.getUserMedia           ||
                                   navigator.webkitGetUserMedia     ||
                                   navigator.mozGetUserMedia        ||
                                   navigator.msGetUserMedia         )
                                  .bind(navigator);

var WEBRTC_PEER_CONNECTION     = ( window.RTCPeerConnection         ||
                                   window.webkitRTCPeerConnection   ||
                                   window.mozRTCPeerConnection      );

var WEBRTC_SESSION_DESCRIPTION = ( window.RTCSessionDescription     ||
                                   window.mozRTCSessionDescription  );

var WEBRTC_ICE_CANDIDATE       = ( window.RTCIceCandidate           ||
                                   window.mozRTCIceCandidate        );

var WEBRTC_CONFIGURATION = {
  peer_connection : {
    config        : {
      iceServers : [{
        // TODO: configurable
        'url': 'stun:stun.jappix.com'
      }]
    },

    constraints   : {
      optional : [{
        'DtlsSrtpKeyAgreement': true
      }]
    }
  },

  get_user_media  : {
    audio: true,

    video: {
      mandatory : {
        // TODO: configurable
        // TODO: (self._aspect_ratio, max = min + 1o(p) where p is the precision 10,1,0.1,0.01,0.001,...)
        minAspectRatio : 1.777,
        maxAspectRatio : 1.778
      },

      optional  : []
    }
  }
};

var R_WEBRTC_SDP_ICE_CANDIDATE = /^a=candidate:(\w{1,32}) (\d{1,5}) (udp|tcp) (\d{1,10}) ([a-zA-Z0-9:\.]{1,45}) (\d{1,5}) (typ) (host|srflx|prflx|relay)( (raddr) ([a-zA-Z0-9:\.]{1,45}) (rport) (\d{1,5}))?( (generation) (\d))?/i;

var R_WEBRTC_SDP_ICE_PAYLOAD   = {
  rtpmap   : /^a=rtpmap:(\d+) ((\w+)\/(\d+)(\/(\w+))?)?/i,
  pwd      : /^a=ice-pwd:(\S+)/i,
  ufrag    : /^a=ice-ufrag:(\S+)/i,
  ptime    : /^a=ptime:(\d+)/i,
  maxptime : /^a=maxptime:(\d+)/i,
  ssrc     : /^a=ssrc:(\d+)/i,
  media    : /^m=(audio|video|application|data) /i
};



/**
 * JINGLE NAMESPACES
 */

var NS_JINGLE                                       = 'urn:xmpp:jingle:1';
var NS_JINGLE_ERRORS                                = 'urn:xmpp:jingle:errors:1';

var NS_JINGLE_APPS_RTP                              = 'urn:xmpp:jingle:apps:rtp:1';
var NS_JINGLE_APPS_RTP_INFO                         = 'urn:xmpp:jingle:apps:rtp:info:1';
var NS_JINGLE_APPS_RTP_AUDIO                        = 'urn:xmpp:jingle:apps:rtp:audio';
var NS_JINGLE_APPS_RTP_VIDEO                        = 'urn:xmpp:jingle:apps:rtp:video';
var NS_JINGLE_APPS_STUB                             = 'urn:xmpp:jingle:apps:stub:0';

var NS_JINGLE_TRANSPORTS_ICEUDP                     = 'urn:xmpp:jingle:transports:ice-udp:1';
var NS_JINGLE_TRANSPORTS_STUB                       = 'urn:xmpp:jingle:transports:stub:0';

var NS_JINGLE_SECURITY_STUB                         = 'urn:xmpp:jingle:security:stub:0';

var R_NS_JINGLE_APP                                 = /^urn:xmpp:jingle:app:(\w+)(:(\w+))?(:(\d+))?$/;
var R_NS_JINGLE_TRANSPORT                           = /^urn:xmpp:jingle:transport:(\w+)$/;



/**
 * JSJAC JINGLE CONSTANTS
 */

var JSJAC_JINGLE_AVAILABLE                          = WEBRTC_GET_MEDIA ? true : false;

var JSJAC_JINGLE_STANZA_TIMEOUT                     = 10000;
var JSJAC_JINGLE_STANZA_ID_PRE                      = 'jj_';

var JSJAC_JINGLE_CONTENT_NAME                       = 'conference';
var JSJAC_JINGLE_NETWORK                            = '0';

var JSJAC_JINGLE_STATUS_INACTIVE                    = 'inactive';
var JSJAC_JINGLE_STATUS_INITIATING                  = 'initiating';
var JSJAC_JINGLE_STATUS_INITIATED                   = 'initiated';
var JSJAC_JINGLE_STATUS_ACCEPTING                   = 'accepting';
var JSJAC_JINGLE_STATUS_ACCEPTED                    = 'accepted';
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

var JSJAC_JINGLE_ERROR_OUT_OF_BORDER                = { jingle: 'out-of-border',          xmpp: 'unexpected-request',         type: 'wait'   };
var JSJAC_JINGLE_ERROR_TIE_BREAK                    = { jingle: 'tie-break',              xmpp: 'conflict',                   type: 'cancel' };
var JSJAC_JINGLE_ERROR_UNKNOWN_SESSION              = { jingle: 'unknown-session',        xmpp: 'item-not-found',             type: 'cancel' };
var JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO             = { jingle: 'unsupported-info',       xmpp: 'feature-not-implemented',    type: 'modify' };
var JSJAC_JINGLE_ERROR_SECURITY_REQUIRED            = { jingle: 'security-required',      xmpp: 'not-acceptable',             type: 'cancel' };

var XMPP_ERROR_FEATURE_NOT_IMPLEMENTED              = { xmpp: 'feature-not-implemented',  type: 'cancel' };
var XMPP_ERROR_SERVICE_UNAVAILABLE                  = { xmpp: 'service-unavailable',      type: 'cancel' };
var XMPP_ERROR_REDIRECT                             = { xmpp: 'redirect',                 type: 'modify' };
var XMPP_ERROR_RESOURCE_CONSTRAINT                  = { xmpp: 'resource-constraint',      type: 'wait'   };
var XMPP_ERROR_BAD_REQUEST                          = { xmpp: 'bad-request',              type: 'cancel' };

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

var JSJAC_JINGLE_SESSION_INFO_ACTIVE                = 'active';
var JSJAC_JINGLE_SESSION_INFO_HOLD                  = 'hold';
var JSJAC_JINGLE_SESSION_INFO_MUTE                  = 'mute';
var JSJAC_JINGLE_SESSION_INFO_RINGING               = 'ringing';
var JSJAC_JINGLE_SESSION_INFO_UNHOLD                = 'unhold';
var JSJAC_JINGLE_SESSION_INFO_UNMUTE                = 'unmute';

var JSJAC_JINGLE_MEDIA_AUDIO                        = 'audio';
var JSJAC_JINGLE_MEDIA_VIDEO                        = 'video';



/**
 * JSJSAC JINGLE CONSTANTS MAPPING
 */

var JSJAC_JINGLE_STATUSES           = {};
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INACTIVE]                   = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INITIATING]                 = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INITIATED]                  = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_ACCEPTING]                  = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_ACCEPTED]                   = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_TERMINATING]                = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_TERMINATED]                 = 1;

var JSJAC_JINGLE_ACTIONS            = {};
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

var JSJAC_JINGLE_ERRORS             = {};
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_OUT_OF_BORDER.jingle]          = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_TIE_BREAK.jingle]              = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_UNKNOWN_SESSION.jingle]        = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.jingle]       = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_SECURITY_REQUIRED.jingle]      = 1;

var XMPP_ERRORS                     = {};
XMPP_ERRORS[XMPP_ERROR_FEATURE_NOT_IMPLEMENTED.xmpp]                  = 1;
XMPP_ERRORS[XMPP_ERROR_SERVICE_UNAVAILABLE.xmpp]                      = 1;
XMPP_ERRORS[XMPP_ERROR_REDIRECT.xmpp]                                 = 1;
XMPP_ERRORS[XMPP_ERROR_RESOURCE_CONSTRAINT.xmpp]                      = 1;
XMPP_ERRORS[XMPP_ERROR_BAD_REQUEST.xmpp]                              = 1;

var JSJAC_JINGLE_REASONS            = {};
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

var JSJAC_JINGLE_SESSION_INFOS      = {};
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_ACTIVE]          = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_HOLD]            = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_MUTE]            = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_RINGING]         = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_UNHOLD]          = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_UNMUTE]          = 1;

var JSJAC_JINGLE_MEDIAS             = {};
JSJAC_JINGLE_MEDIAS[JSJAC_JINGLE_MEDIA_AUDIO]                         = { label: '0' };//TODO: label shouldn't be hard-coded!
JSJAC_JINGLE_MEDIAS[JSJAC_JINGLE_MEDIA_VIDEO]                         = { label: '1' };//TODO: label shouldn't be hard-coded!



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
 * @param {function} args.session_initiate_pending The initiate pending custom handler.
 * @param {function} args.session_initiate_success The initiate success custom handler.
 * @param {function} args.session_initiate_error The initiate error custom handler.
 * @param {function} args.session_initiate_request The initiate request custom handler.
 * @param {function} args.session_accept_pending The accept pending custom handler.
 * @param {function} args.session_accept_success The accept success custom handler.
 * @param {function} args.session_accept_error The accept error custom handler.
 * @param {function} args.session_accept_request The accept request custom handler.
 * @param {function} args.session_info_pending The info pending custom handler.
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
 * @param {JSJaCDebugger} args.debug A reference to a debugger implementing the JSJaCDebugger interface.
 */
function JSJaCJingle(args) {
  // WebRTC not supported?
  if(!JSJAC_JINGLE_AVAILABLE)
    return;

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

  if(args && args.session_info_pending)
    /**
     * @private
     */
    self._session_info_pending = args.session_info_pending;

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

  if(args && args.connection)
    /**
     * @private
     */
    self._connection = args.connection;

  if(args && args.to)
    /**
     * @private
     */
    self._to = args.to;

  if(args && args.name)
    /**
     * @private
     */
    self._name = args.name;

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
        log   : function() {}
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
  self._payloads_local = [];

  /**
   * @private
   */
  self._candidates_local = {};

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
   * Register stanza handler
   */
  (self._connection).registerHandler('iq', self.handle);
  // TODO: ondestroy >> unregisterHandler('iq', self.handle)



  /**
   * Initiates a new Jingle session.
   */
  self.initiate = function() {
    // Slot unavailable?
    if(self.get_status() != JSJAC_JINGLE_STATUS_INACTIVE) {
      self.get_debug().log('[JSJaCJingle] init > Cannot init, resource not inactive (status: ' + self.get_status() + ').', 1)
      return;
    }

    // Set session values
    self._set_sid(self.util_generate_sid());
    self._set_name(JSJAC_JINGLE_CONTENT_NAME);
    self._set_initiator(self.util_connection_jid());
    self._set_responder(self.get_to());

    // Trigger init pending custom callback
    (self._get_session_initiate_pending())(self);

    // Process init actions
    (self._get_connection()).registerIQSet('jingle', NS_JINGLE, self.handle);

    // Initialize WebRTC
    self._peer_get_user_media(function() {
      self._peer_connection_create(function() {
        self.get_debug().log('[JSJaCJingle] init > Ready to begin Jingle negotiation.', 2);

        self.send('set', { action: JSJAC_JINGLE_ACTION_SESSION_INITIATE });
      })
    });
  };

  /**
   * Accepts the Jingle session.
   */
  self.accept = function() {
    // Slot unavailable?
    if(!(self.get_status() == JSJAC_JINGLE_STATUS_INITIATED || self.get_status() == JSJAC_JINGLE_STATUS_TERMINATED)) {
      self.get_debug().log('[JSJaCJingle] init > Cannot accept, resource not initiated or terminated (status: ' + self.get_status() + ').', 1);
      return;
    }

    // Trigger accept pending custom callback
    (self._get_session_accept_pending())(self);

    // Process accept actions
    self.send('set', { action: JSJAC_JINGLE_ACTION_SESSION_ACCEPT });
  };

  /**
   * Terminates the Jingle session.
   */
  self.terminate = function() {
    // Slot unavailable?
    if(!(self.get_status() == JSJAC_JINGLE_STATUS_INITIATED || self.get_status() == JSJAC_JINGLE_STATUS_TERMINATED)) {
      self.get_debug().log('[JSJaCJingle] terminate > Cannot terminate, resource not accepted (status: ' + self.get_status() + ').', 1);
      return;
    }

    // Trigger terminate pending custom callback
    (self._get_session_terminate_pending())(self);

    // Process terminate actions
    self.send('set', { action: JSJAC_JINGLE_ACTION_SESSION_TERMINATE });
  };

  /**
   * Sends a given Jingle stanza packet
   */
  self.send = function(type, args) {
    // Assert
    if(typeof args != 'object') args = {};

    // Build stanza
    var stanza = new JSJaCIQ();
    stanza.setTo(self.get_to());

    if(type) stanza.setType(type);

    if(!args.id) args.id = self._get_id_new();
    stanza.setID(args.id);

    if(type == 'set') {
      if(!(args.action && args.action in JSJAC_JINGLE_ACTIONS)) {
        self.get_debug().log('[JSJaCJingle] send > Stanza action unknown: ' + (args.action || 'undefined'), 1);
        return;
      }

      self._set_sent_id(args.id);

      // Submit to registered handler
      switch(args.action) {
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
          self.send_session_terminate(stanza, 'set', (args.reason || JSJAC_JINGLE_REASON_SUCCESS)); break;

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

    con.send(stanza);

    return true;
  };

  /**
   * Handles a given Jingle stanza response
   */
  self.handle = function(stanza) {
    var jingle = self.util_stanza_jingle(stanza);

    // Don't handle non-Jingle stanzas there...
    if(!jingle) return;

    var action = jingle.getAttribute('action');

    // Don't handle action-less Jingle stanzas there...
    if(!action) return;

    var id = stanza.getID();
    if(id) self._set_received_id(id);

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
    (self._get_handlers(action))(stanza);
  };

  /**
   * Registers a given handler on a given Jingle stanza
   */
  self.register_handler = function(action, fn) {
    if(typeof fn != 'function') {
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
  };

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
  };



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
  };

  /**
   * Sends the Jingle content add
   */
  self.send_content_add = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_content_add > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_content_add > Sent.', 4);
  };

  /**
   * Sends the Jingle content modify
   */
  self.send_content_modify = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_content_modify > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_content_modify > Sent.', 4);
  };

  /**
   * Sends the Jingle content reject
   */
  self.send_content_reject = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_content_reject > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_content_reject > Sent.', 4);
  };

  /**
   * Sends the Jingle content remove
   */
  self.send_content_remove = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_content_remove > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_content_remove > Sent.', 4);
  };

  /**
   * Sends the Jingle description info
   */
  self.send_description_info = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_description_info > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] Send description info.', 4);
  };

  /**
   * Sends the Jingle security info
   */
  self.send_security_info = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_security_info > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_security_info > Sent.', 4);
  };

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
      self._set_status(JSJAC_JINGLE_STATUS_ACCEPTING);

      // Build Jingle stanza
      var jingle = stanza.getNode().appendChild(stanza.buildNode('jingle', {
                                                  'xmlns': NS_JINGLE,
                                                  'action': JSJAC_JINGLE_ACTION_SESSION_ACCEPT,
                                                  'responder': self.get_responder(),
                                                  'sid': self.get_sid()
                                               }));

      // TODO
    } else if(type == 'result') {
      stanza.setID(arg);
    } else {
      self.get_debug().log('[JSJaCJingle] send_session_accept > Stanza type must either be set or result.', 1);
      return;
    }

    // Schedule error timeout
    self.util_stanza_timeout({
      external:   self._get_session_accept_error(),
      internal:   self.handle_session_accept_error
    });

    self.get_debug().log('[JSJaCJingle] send_session_accept > Sent.', 4);
  };

  /**
   * Sends the Jingle session info
   */
  self.send_session_info = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_session_info > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_session_info > Sent.', 4);
  };

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

      // Build session content
      self._util_generate_content_session();

      // Build Jingle stanza
      var jingle = stanza.getNode().appendChild(stanza.buildNode('jingle', {
                                                  'xmlns': NS_JINGLE,
                                                  'action': JSJAC_JINGLE_ACTION_SESSION_INITIATE,
                                                  'initiator': self.get_initiator(),
                                                  'sid': self.get_sid()
                                               }));

      self._util_stanza_content_session(stanza, jingle, self.get_sid());
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

    // Schedule error timeout
    self.util_stanza_timeout({
      external:   self._get_session_initiate_error(),
      internal:   self.handle_session_initiate_error
    });

    self.get_debug().log('[JSJaCJingle] send_session_initiate > Sent.', 4);
  };

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
           self.get_status() == JSJAC_JINGLE_STATUS_ACCEPTING   ||
           self.get_status() == JSJAC_JINGLE_STATUS_ACCEPTED    )) {
        self.get_debug().log('[JSJaCJingle] send_session_terminate > Resource neither initiating, initiated, accepting nor accepted (status: ' + self.get_status() + ').', 1);
        return;
      }

      var jingle = stanza.getNode().appendChild(stanza.buildNode('jingle', {
                                                  'xmlns': NS_JINGLE,
                                                  'action': JSJAC_JINGLE_ACTION_SESSION_TERMINATE,
                                                  'sid': self.get_sid()
                                               }));

      var jingle_reason = jingle.appendChild(stanza.buildNode('reason', {'xmlns': NS_JINGLE}));
      jingle_reason.appendChild(stanza.buildNode(arg, {'xmlns': NS_JINGLE}));
    } else if(type == 'result') {
      stanza.setID(arg);
    } else {
      self.get_debug().log('[JSJaCJingle] send_session_terminate > Stanza type must either be set or result.', 1);
      return;
    }

    // Schedule error timeout
    self.util_stanza_timeout({
      external:   self._get_session_terminate_error(),
      internal:   self.handle_session_terminate_error
    });

    self.get_debug().log('[JSJaCJingle] send_session_terminate > Sent (reason: ' + (arg || 'undefined') + ')', 4);
  };

  /**
   * Sends the Jingle transport accept
   */
  self.send_transport_accept = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_transport_accept > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_transport_accept > Sent.', 4);
  };

  /**
   * Sends the Jingle transport info
   */
  self.send_transport_info = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_transport_info > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_transport_info > Sent.', 4);
  };

  /**
   * Sends the Jingle transport reject
   */
  self.send_transport_reject = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_transport_reject > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_transport_reject > Sent.', 4);
  };

  /**
   * Sends the Jingle transport replace
   */
  self.send_transport_replace = function(stanza) {
    // Not implemented for now
    self.get_debug().log('[JSJaCJingle] send_transport_replace > Feature not implemented!', 1);

    self.get_debug().log('[JSJaCJingle] send_transport_replace > Sent.', 4);
  };

  /**
   * Sends the Jingle transport replace
   */
  self.send_error = function(stanza, error) {
    // Assert
    if(!('type' in error)) {
      self.get_debug().log('[JSJaCJingle] send_error > Type unknown.', 1);
      return;
    }

    if('jingle' in error && !(error.jingle in JSJAC_JINGLE_ERRORS)) {
      self.get_debug().log('[JSJaCJingle] send_error > Jingle condition unknown.', 1);
      return;
    }

    if('xmpp' in error && !(error.xmpp in XMPP_ERRORS)) {
      self.get_debug().log('[JSJaCJingle] send_error > XMPP condition unknown.', 1);
      return;
    }

    stanza.setType('error');

    var error_node = stanza.getNode().appendChild(stanza.buildNode('error', {'xmlns': NS_CLIENT, 'type': error.type}));

    if('xmpp'   in error) error_node.appendChild(stanza.buildNode(error.xmpp,   { 'xmlns': NS_STANZAS       }));
    if('jingle' in error) error_node.appendChild(stanza.buildNode(error.jingle, { 'xmlns': NS_JINGLE_ERRORS }));

    self.get_debug().log('[JSJaCJingle] send_error > Sent: ' + (error.jingle || error.xmpp), 2);
  };



  /**
   * JSJSAC JINGLE HANDLERS
   */

  /**
   * Handles the Jingle content accept
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_content_accept = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);

    self.get_debug().log('[JSJaCJingle] handle_content_accept > Handled.', 4);
  };

  /**
   * Handles the Jingle content add
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_content_add = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);

    self.get_debug().log('[JSJaCJingle] handle_content_add > Handled.', 4);
  };

  /**
   * Handles the Jingle content modify
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_content_modify = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);

    self.get_debug().log('[JSJaCJingle] handle_content_modify > Handled.', 4);
  };

  /**
   * Handles the Jingle content reject
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_content_reject = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);

    self.get_debug().log('[JSJaCJingle] handle_content_reject > Handled.', 4);
  };

  /**
   * Handles the Jingle content remove
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_content_remove = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);

    self.get_debug().log('[JSJaCJingle] handle_content_remove > Handled.', 4);
  };

  /**
   * Handles the Jingle description info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_description_info = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);

    self.get_debug().log('[JSJaCJingle] handle_description_info > Handled.', 4);
  };

  /**
   * Handles the Jingle security info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_security_info = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);

    self.get_debug().log('[JSJaCJingle] handle_security_info > Handled.', 4);
  };

  /**
   * Handles the Jingle session accept
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_accept = function(stanza) {
    // Security preconditions
    if(!self.util_stanza_safe(stanza)) {
      self.get_debug().log('[JSJaCJingle] handle_session_terminate > Dropped unsafe stanza.', 2);

      self.send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
      return;
    }

    // Can now safely dispatch the stanza
    switch(stanza.getType()) {
      case 'result':
        (self._get_session_accept_success())(self, stanza);
        self.handle_session_accept_success(stanza);

        break;

      case 'error':
        (self._get_session_accept_error())(self, stanza);
        self.handle_session_accept_error(stanza);

        break;

      case 'set':
        (self._get_session_accept_request())(self, stanza);
        self.handle_session_accept_request(stanza);

        break;

      default:
        self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    }

    self.get_debug().log('[JSJaCJingle] handle_session_accept > Handled.', 4);
  };

  /**
   * Handles the Jingle session accept success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_accept_success = function(stanza) {
    // TODO

    self.get_debug().log('[JSJaCJingle] handle_session_accept_success > Handled.', 4);
  };

  /**
   * Handles the Jingle session accept error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_accept_error = function(stanza) {
    // TODO

    self.get_debug().log('[JSJaCJingle] handle_session_accept_error > Handled.', 4);
  };

  /**
   * Handles the Jingle session accept request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_accept_request = function(stanza) {
    // Extract SDP data from packet
    // TODO: session description
    // TODO: transport candidates

    // Set it to remote view
    // TODO: session description >> 
                                      /*self._get_peer_connection().setRemoteDescription(new WEBRTC_SESSION_DESCRIPTION(message.payload));*/
    // TODO: transport candidates >> 
                                      /*self._get_peer_connection().addIceCandidate(new WEBRTC_ICE_CANDIDATE({
                                          sdpMLineIndex: message.payload.label,
                                          candidate: message.payload.candidate
                                      }));*/

    //TODO: self._set_content_session(sid, );

    self.get_debug().log('[JSJaCJingle] handle_session_accept_request > Handled.', 4);
  };

  /**
   * Handles the Jingle session info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_info = function(stanza) {
    // Security preconditions
    if(!self.util_stanza_safe(stanza)) {
      self.get_debug().log('[JSJaCJingle] handle_session_terminate > Dropped unsafe stanza.', 2);

      self.send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
      return;
    }

    // Can now safely dispatch the stanza
    switch(stanza.getType()) {
      case 'result':
        (self._get_session_info_success())(self, stanza);
        self.handle_session_info_success(stanza);

        break;

      case 'error':
        (self._get_session_info_error())(self, stanza);
        self.handle_session_info_error(stanza);

        break;

      case 'set':
        (self._get_session_info_request())(self, stanza);
        self.handle_session_info_request(stanza);

        break;

      default:
        self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    }

    self.get_debug().log('[JSJaCJingle] handle_session_info > Handled.', 4);
  };

  /**
   * Handles the Jingle session info success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_info_success = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_info_success > Handled.', 4);
  };

  /**
   * Handles the Jingle session info error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_info_error = function(stanza) {
    self.get_debug().log('[JSJaCJingle] handle_session_info_error > Handled.', 4);
  };

  /**
   * Handles the Jingle session info request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_info_request = function(stanza) {
    // Parse stanza
    var info_name = self.util_stanza_session_info(stanza);
    var info_result = false;

    switch(info_name) {
      case JSJAC_JINGLE_SESSION_INFO_ACTIVE:
        info_result = true; break;
    }

    if(info_result) {
      // Process info actions
      self.send('result', { id: stanza.getID() });

      // Trigger info success custom callback
      (self._get_session_info_success())(self, stanza);

      self.get_debug().log('[JSJaCJingle] handle_session_info_request > Handled (name: ' + (info_name || 'undefined') + ')', 4);
    } else {
      // Send error reply
      self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);

      // Trigger info error custom callback
      (self._get_session_info_error())(self, stanza);

      self.get_debug().log('[JSJaCJingle] handle_session_info_request > Error (name: ' + (info_name || 'undefined') + ')', 2);
    }
  };

  /**
   * Handles the Jingle session initiate
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_initiate = function(stanza) {
    switch(stanza.getType()) {
      case 'result':
        (self._get_session_initiate_success())(self, stanza);
        self.handle_session_initiate_success(stanza);

        break;

      case 'error':
        (self._get_session_initiate_error())(self, stanza);
        self.handle_session_initiate_error(stanza);

        break;

      case 'set':
        (self._get_session_initiate_request())(self, stanza);
        self.handle_session_initiate_request(stanza);

        break;

      default:
        self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    }

    self.get_debug().log('[JSJaCJingle] handle_session_initiate > Handled.', 4);
  };

  /**
   * Handles the Jingle session initiate success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_initiate_success = function(stanza) {
    // Change session status
    self._set_status(JSJAC_JINGLE_STATUS_INITIATED);

    self.get_debug().log('[JSJaCJingle] handle_session_initiate_success > Handled.', 4);
  };

  /**
   * Handles the Jingle session initiate error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_initiate_error = function(stanza) {
    // Change session status
    self._set_status(JSJAC_JINGLE_STATUS_INACTIVE);

    self.get_debug().log('[JSJaCJingle] handle_session_initiate_error > Handled.', 4);
  };

  /**
   * Handles the Jingle session initiate request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_initiate_request = function(stanza) {
    // Change session status
    self._set_status(JSJAC_JINGLE_STATUS_INITIATING);

    // Initialize content session read
    var rd_content = {};
    var rd_sid = self.util_stanza_sid(stanza);

    // Request is valid?
    if(rd_sid) {
      // Parse initiate stanza
      var jingle = self.util_stanza_jingle(stanza);

      if(jingle) {
        // Childs
        var content = jingle.getElementsByTagNameNS(NS_JINGLE, 'content');

        if(content.length) {
          content = content[0];

          // Attrs
          var content_creator = content.getAttribute('creator') || null;
          var content_name    = content.getAttribute('name')    || null;

          // Childs
          var description = content.getElementsByTagNameNS(NS_JINGLE_APPS_RTP, 'description');
          var transport   = content.getElementsByTagNameNS(NS_JINGLE_TRANSPORTS_ICEUDP, 'transport');

          // Push (if requirements satisfied)
          if(content_creator && content_name) {
            rd_content['creator'] = content_creator;
            rd_content['name']    = content_name;

            if(description.length) {
              /* XEP-0167 http://xmpp.org/extensions/xep-0167.html */

              description = description[0];

              // Attrs
              var description_media = description.getAttribute('media') || null;
              var description_ssrc  = description.getAttribute('ssrc')  || null;

              // Childs
              var payload_type = description.getElementsByTagNameNS(NS_JINGLE_APPS_RTP, 'payload-type');

              // Push (if requirements satisfied)
              if(description_media) {
                rd_content['description']             = {};
                rd_content['description']['media']    = description_media;
                rd_content['description']['ssrc']     = description_ssrc;
                rd_content['description']['payloads'] = {};

                for(var i = 0; i < payload_type.length; i++) {
                  var cur_payload_type = payload_type[i];

                  // Attrs
                  var cur_payload_type_channels  = cur_payload_type.getAttribute('channels')  || null;
                  var cur_payload_type_clockrate = cur_payload_type.getAttribute('clockrate') || null;
                  var cur_payload_type_id        = cur_payload_type.getAttribute('id')        || null;
                  var cur_payload_type_maxptime  = cur_payload_type.getAttribute('maxptime')  || null;
                  var cur_payload_type_name      = cur_payload_type.getAttribute('name')      || null;
                  var cur_payload_type_ptime     = cur_payload_type.getAttribute('ptime')     || null;

                  // Push (if requirements satisfied)
                  if(cur_payload_type_id) {
                    rd_content['description']['payloads'][cur_payload_type_id]              = {};
                    rd_content['description']['payloads'][cur_payload_type_id]['channels']  = cur_payload_type_channels;
                    rd_content['description']['payloads'][cur_payload_type_id]['clockrate'] = cur_payload_type_clockrate;
                    rd_content['description']['payloads'][cur_payload_type_id]['id']        = cur_payload_type_id;
                    rd_content['description']['payloads'][cur_payload_type_id]['maxptime']  = cur_payload_type_maxptime;
                    rd_content['description']['payloads'][cur_payload_type_id]['name']      = cur_payload_type_name;
                    rd_content['description']['payloads'][cur_payload_type_id]['ptime']     = cur_payload_type_ptime;
                  }
                }
              }

              if(transport.length) {
                /* XEP-0176 http://xmpp.org/extensions/xep-0176.html */

                transport = transport[0];

                // Attrs
                var transport_pwd   = transport.getAttribute('pwd')   || null;
                var transport_ufrag = transport.getAttribute('ufrag') || null;

                // Childs
                var candidate = transport.getElementsByTagNameNS(NS_JINGLE_TRANSPORTS_ICEUDP, 'candidate');

                // Push (no requirement there)
                if(true) {
                  rd_content['transport']               = {};
                  rd_content['transport']['pwd']        = transport_pwd;
                  rd_content['transport']['ufrag']      = transport_ufrag;
                  rd_content['transport']['candidates'] = {};

                  for(var j = 0; j < candidate.length; j++) {
                    var cur_candidate = candidate[j];

                    // Attrs
                    var cur_candidate_component  = cur_candidate.getAttribute('component')  || null;
                    var cur_candidate_foundation = cur_candidate.getAttribute('foundation') || null;
                    var cur_candidate_generation = cur_candidate.getAttribute('generation') || null;
                    var cur_candidate_id         = cur_candidate.getAttribute('id')         || null;
                    var cur_candidate_ip         = cur_candidate.getAttribute('ip')         || null;
                    var cur_candidate_network    = cur_candidate.getAttribute('network')    || null;
                    var cur_candidate_port       = cur_candidate.getAttribute('port')       || null;
                    var cur_candidate_priority   = cur_candidate.getAttribute('priority')   || null;
                    var cur_candidate_protocol   = cur_candidate.getAttribute('protocol')   || null;
                    var cur_candidate_rel_addr   = cur_candidate.getAttribute('rel-addr')   || null;
                    var cur_candidate_rel_port   = cur_candidate.getAttribute('rel-port')   || null;
                    var cur_candidate_type       = cur_candidate.getAttribute('type')       || null;

                    // Push (if requirements satisfied)
                    if(cur_candidate_component   &&
                       cur_candidate_foundation  &&
                       cur_candidate_generation  &&
                       cur_candidate_id          &&
                       cur_candidate_ip          &&
                       cur_candidate_network     &&
                       cur_candidate_port        &&
                       cur_candidate_priority    &&
                       cur_candidate_protocol    &&
                       cur_candidate_type        ) {
                      rd_content['transport']['candidates'][cur_candidate_id]               = {};
                      rd_content['transport']['candidates'][cur_candidate_id]['component']  = cur_candidate_component;
                      rd_content['transport']['candidates'][cur_candidate_id]['foundation'] = cur_candidate_foundation;
                      rd_content['transport']['candidates'][cur_candidate_id]['generation'] = cur_candidate_generation;
                      rd_content['transport']['candidates'][cur_candidate_id]['id']         = cur_candidate_id;
                      rd_content['transport']['candidates'][cur_candidate_id]['ip']         = cur_candidate_ip;
                      rd_content['transport']['candidates'][cur_candidate_id]['network']    = cur_candidate_network;
                      rd_content['transport']['candidates'][cur_candidate_id]['port']       = cur_candidate_port;
                      rd_content['transport']['candidates'][cur_candidate_id]['priority']   = cur_candidate_priority;
                      rd_content['transport']['candidates'][cur_candidate_id]['protocol']   = cur_candidate_protocol;
                      rd_content['transport']['candidates'][cur_candidate_id]['rel-addr']   = cur_candidate_rel_addr;
                      rd_content['transport']['candidates'][cur_candidate_id]['rel-port']   = cur_candidate_rel_addr;
                      rd_content['transport']['candidates'][cur_candidate_id]['type']       = cur_candidate_type;
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Check content values support
      var accept_content_session = false;

        // TODO: accept_content_session = true if one match
        // TODO: remove unmatching items from rd_content

      if(accept_content_session) {
        self._set_content_session(rd_sid, rd_content);
        
        // TODO: success?! (send back matching items)
      } else {
        self.send('set', {
                          action: JSJAC_JINGLE_ACTION_SESSION_TERMINATE,
                          reason: JSJAC_JINGLE_REASON_UNSUPPORTED_TRANSPORTS
                         });
      }
    } else {
      self.send_error(stanza, XMPP_ERROR_BAD_REQUEST);
    }

    self.get_debug().log('[JSJaCJingle] handle_session_initiate_request > Handled.', 4);
  };

  /**
   * Handles the Jingle session terminate
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_terminate = function(stanza) {
    var type = stanza.getType();

    // Security preconditions
    if(!self.util_stanza_safe(stanza)) {
      self.get_debug().log('[JSJaCJingle] handle_session_terminate > Dropped unsafe stanza.', 2);

      self.send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
      return;
    }

    // Can now safely dispatch the stanza
    switch(stanza.getType()) {
      case 'result':
        (self._get_session_terminate_success())(self, stanza);
        self.handle_session_terminate_success(stanza);

        break;

      case 'error':
        (self._get_session_terminate_error())(self, stanza);
        self.handle_session_terminate_error(stanza);

        break;

      case 'set':
        (self._get_session_terminate_request())(self, stanza);
        self.handle_session_terminate_request(stanza);

        break;

      default:
        self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    }
  };

  /**
   * Handles the Jingle session terminate success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_terminate_success = function(stanza) {
    // Change session status
    self._set_status(JSJAC_JINGLE_STATUS_TERMINATED);

    self.get_debug().log('[JSJaCJingle] handle_session_terminate_success > Handled.', 4);
  };

  /**
   * Handles the Jingle session terminate error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_terminate_error = function(stanza) {
    // Change session status
    self._set_status(JSJAC_JINGLE_STATUS_TERMINATED);

    // TODO: force termination

    self.get_debug().log('[JSJaCJingle] handle_session_terminate_error > Handled.', 4);
  };

  /**
   * Handles the Jingle session terminate request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_terminate_request = function(stanza) {
    // Process terminate actions
    self._set_status(JSJAC_JINGLE_STATUS_TERMINATED);
    self.send('result', { id: stanza.getID() });

    // Trigger terminate success custom callback
    (self._get_session_terminate_success())(self, stanza);

    self.get_debug().log('[JSJaCJingle] handle_session_terminate_request > Handled (reason: ' + (self.util_stanza_terminate_reason(stanza) || 'undefined') + ')', 4);
  };

  /**
   * Handles the Jingle transport accept
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_transport_accept = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);

    self.get_debug().log('[JSJaCJingle] handle_transport_accept > Handled.', 4);
  };

  /**
   * Handles the Jingle transport info
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_transport_info = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);

    self.get_debug().log('[JSJaCJingle] handle_transport_info > Handled.', 4);
  };

  /**
   * Handles the Jingle transport reject
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_transport_reject = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);

    self.get_debug().log('[JSJaCJingle] handle_transport_reject > Handled.', 4);
  };

  /**
   * Handles the Jingle transport replace
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_transport_replace = function(stanza) {
    // Not implemented for now
    self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);

    self.get_debug().log('[JSJaCJingle] handle_transport_replace > Handled.', 4);
  };



  /**
   * JSJSAC JINGLE GETTERS
   */

  /**
   * @private
   */
  self._get_connection = function() {
    return self._connection;
  };

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
  self._get_session_info_pending = function() {
    if(typeof self._session_info_pending == 'function')
      return self._session_info_pending;

    return function() {};
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
   * Gets the local_view value
   * @return local_view value
   * @type DOM
   */
  self.get_local_view = function() {
    return self._local_view;
  };

  /**
   * Gets the remote_view value
   * @return remote_view value
   * @type DOM
   */
  self.get_remote_view = function() {
    return self._remote_view;
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
  self._get_payloads_local = function() {
    return self._payloads_local;
  };

  /**
   * @private
   */
  self._get_candidates_local = function() {
    return self._candidates_local;
  };

  /**
   * @private
   */
  self._get_content_session = function(sid) {
    return (sid in self._content_session) ? self._content_session[sid] : {};
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
   * Gets the action_last value
   * @return action_last value
   * @type string
   */
  self.get_action_last = function() {
    return self._action_last;
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
   * Gets the to value
   * @return to value
   * @type string
   */
  self.get_to = function() {
    return self._to;
  };

  /**
   * Gets the name value
   * @return name value
   * @type string
   */
  self.get_name = function() {
    return self._name;
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
   * @private
   */
  self._get_handlers = function(action) {
    if(action && typeof self._handlers[action] == 'function')
      return self._handlers[action];

    return function(stanza) {};
  };

  /**
   * @private
   */
  self._get_peer_connection = function() {
    return self._peer_connection;
  }

  /**
   * @private
   */
  self._get_id = function() {
    return self._id;
  };

  /**
   * @private
   */
  self._get_id_last = function() {
    return JSJAC_JINGLE_STANZA_ID_PRE + self._get_id();
  };

  /**
   * @private
   */
  self._get_id_new = function() {
    var trans_id = self._get_id() + 1;
    self._set_id(trans_id);

    return JSJAC_JINGLE_STANZA_ID_PRE + trans_id;
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
   * JSJSAC JINGLE SETTERS
   */

  /**
   * @private
   */
  self._set_connection = function(connection) {
    self._connection = connection;
  };

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
  self._set_info_pending = function(info_pending) {
    self._session_info_pending = info_pending;
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
  self._set_local_view = function(local_view) {
    self._local_view = local_view;
  };

  /**
   * @private
   */
  self._set_remote_view = function(remote_view) {
    self._remote_view = remote_view;
  };

  /**
   * @private
   */
  self._set_debug = function(debug) {
    self._debug = debug;
  };

  /**
   * @private
   */
  self._set_local_stream = function(local_stream) {
    self._local_stream = local_stream;
    (self.get_local_view()).src = local_stream ? URL.createObjectURL(self._get_local_stream()) : '';
  };

  /**
   * @private
   */
  self._set_remote_stream = function(remote_stream) {
    self._remote_stream = remote_stream;
    (self.get_remote_view()).src = remote_stream ? URL.createObjectURL(self._get_remote_stream()) : '';
  };

  /**
   * @private
   */
  self._set_payloads_local = function(payload_data) {
    self._payloads_local = payload_data;
  };

  /**
   * @private
   */
  self._set_candidates_local = function(candidate_id, candidate_data) {
    if(!candidate_data['id']) return;

    if(!(candidate_id in self._candidates_local))
      self._candidates_local[candidate_id] = [];

    (self._candidates_local[candidate_id]).push(candidate_data);
  };

  /**
   * @private
   */
  self._set_content_session = function(sid, content_session) {
    self._content_session[sid] = content_session;
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
  self._set_action_last = function(action_last) {
    self._action_last = action_last;
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
  self._set_to = function(to) {
    self._to = to;
  };

  /**
   * @private
   */
  self._set_name = function(name) {
    self._name = name;
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
  self._set_handlers = function(action, handler) {
    self._handlers[action] = handler;
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
    (self._get_sent_id())[sent_id] = 1;
  };

  /**
   * @private
   */
  self._set_received_id = function(received_id) {
    (self._get_received_id())[received_id] = 1;
  };



  /**
   * JSJSAC JINGLE UTILITIES
   */

  /**
   * Gets the attribute value from a stanza element
   * @return Attribute value
   * @type string
   */
  self.util_stanza_get_attribute = function(stanza, name) {
    return (name && stanza.length) ? (stanza.getAttribute(name) || null) : null;
  };

  /**
   * Sets the attribute value to a stanza element
   */
  self.util_stanza_set_attribute = function(stanza, name, value) {
    if(name && value && stanza.length) stanza.setAttribute(name, value);
  };

  /**
   * Gets the Jingle node from a stanza
   * @return Jingle node
   * @type DOM
   */
  self.util_stanza_jingle = function(stanza) {
    return stanza.getChild('jingle', NS_JINGLE);
  };

  /**
   * Gets the from value from a stanza
   * @return from value
   * @type string
   */
  self.util_stanza_from = function(stanza) {
    try {
      return stanza.getFrom() || null;
    } catch(e) {
      return null;
    }
  };

  /**
   * Gets the SID value from a stanza
   * @return SID value
   * @type string
   */
  self.util_stanza_sid = function(stanza) {
    try {
      return (self.util_stanza_jingle(stanza)).getAttribute('sid') || null;
    } catch(e) {
      return null;
    }
  };

  /**
   * Checks if a stanza is safe (known SID + sender)
   * @return safety state
   * @type boolean
   */
  self.util_stanza_safe = function(stanza) {
    return !((stanza.getType() == 'set' && self.util_stanza_sid(stanza) != self.get_sid()) || self.util_stanza_from(stanza) != self.get_to());
  };

  /**
   * Gets a stanza terminate reason
   * @return reason code
   * @type string
   */
  self.util_stanza_terminate_reason = function(stanza) {
    var reason = (self.util_stanza_jingle(stanza)).getElementsByTagName('reason');

    if(reason.length) {
      for(cur_reason in JSJAC_JINGLE_REASONS)
        if((reason[0]).getElementsByTagName(cur_reason, NS_JINGLE).length) return cur_reason;
    }

    return null;
  };

  /**
   * Gets a stanza session info
   * @return reason code
   * @type string
   */
  self.util_stanza_session_info = function(stanza) {
    var jingle = self.util_stanza_jingle(stanza);

    for(cur_info in JSJAC_JINGLE_SESSION_INFOS)
      if(jingle.getElementsByTagName(cur_info, NS_JINGLE_APPS_RTP_INFO).length) return cur_info;

    return null;
  };

  /**
   * Set a timeout limit to a stanza
   */
  self.util_stanza_timeout = function(handlers) {
    var t_id = self._get_id_last();
    var t_sid = self.get_sid();
    var t_status = self.get_status();

    setTimeout(function() {
      // State did not change?
      if(self.get_sid() == t_sid && self.get_status() == t_status && !(t_id in self._get_received_id())) {
        self.get_debug().log('[JSJaCJingle] util_stanza_timeout > Stanza timeout.', 2);

        (handlers.external)(self);
        (handlers.internal)();
      }
    }, JSJAC_JINGLE_STANZA_TIMEOUT);
  };

  /**
   * Parses a Jingle payload stanza
   * @return parsed object
   * @type object
   */
  self.util_stanza_parse_payload = function(stanza_payload) {
    var jingle  = self.util_stanza_jingle(stanza);
    var payload = {};

    var content = jingle.getElementsByTagNameNS('content', NS_JINGLE);

    if(!content.length) return {};

    var description = content.getElementsByTagNameNS('description', NS_JINGLE_APPS_RTP);
    var d_media     = self.util_stanza_get_attribute(description, 'name');

    if(!description.length || !d_media) return {};

    var e, payload, cur_payload_arr;

    // Parse session description
    for(var i = 0; i < description.length; i++) {
      e = 0;
      payload = description[i];
      cur_payload_arr = {};

      cur_payload_arr['channels']  = self.util_stanza_get_attribute(payload, 'channels');
      cur_payload_arr['clockrate'] = self.util_stanza_get_attribute(payload, 'clockrate');
      cur_payload_arr['id']        = self.util_stanza_get_attribute(payload, 'id') || e++;
      cur_payload_arr['maxptime']  = self.util_stanza_get_attribute(payload, 'maxptime');
      cur_payload_arr['name']      = self.util_stanza_get_attribute(payload, 'name');
      cur_payload_arr['ptime']     = self.util_stanza_get_attribute(payload, 'ptime');

      if(e != 0) continue;
    }

    

    return payload;
  };

  /**
   * Parses a Jingle candidate stanza
   * @return parsed object
   * @type object
   */
  self.util_stanza_parse_candidate = function(stanza_candidate) {
    var jingle = self.util_stanza_jingle(stanza);
    var candidate = {};

    // TODO

    return candidate;
  };

  /**
   * Generates the current session content stanza
   */
  self._util_stanza_content_session = function(stanza, jingle, sid) {
    var content_session = self._get_content_session(sid);

    var content = jingle.appendChild(stanza.buildNode('content', { 'xmlns': NS_JINGLE }));

    self.util_stanza_set_attribute(content, 'creator', content_session['creator']);
    self.util_stanza_set_attribute(content, 'name',    content_session['name']);

    // Build description
    for(cur_media in content_session['description']) {
      var cs_description = content_session['description'][cur_media];
      var cs_d_attrs     = cs_description['attrs'];
      var cs_d_data      = cs_description['data'];

      var description = content.appendChild(stanza.buildNode('description', { 'xmlns': NS_JINGLE_APPS_RTP }));

      self.util_stanza_set_attribute(description, 'media', cur_media);

      for(cur_description_attr in cs_d_attrs)
          self.util_stanza_set_attribute(description, cur_description_attr, cs_d_attrs[cur_description_attr]);

      for(i in cs_d_data) {
        var cs_d_p = cs_d_data[i];

        var payload_type = description.appendChild(stanza.buildNode('payload-type', { 'xmlns': NS_JINGLE_APPS_RTP }));

        for(cur_payload_attr in cs_d_p)
          self.util_stanza_set_attribute(payload_type, cur_payload_attr, cs_d_p[cur_payload_attr]);
      }
    }

    // Build transport
    var cs_transport = content_session['transport'];
    var cs_t_attrs   = cs_transport['attrs'];
    var cs_t_data    = cs_transport['data'];

    var transport = content.appendChild(stanza.buildNode('transport', { 'xmlns': NS_JINGLE_TRANSPORTS_ICEUDP }));

    for(cur_transport_attr in cs_t_attrs)
          self.util_stanza_set_attribute(transport, cur_transport_attr, cs_t_attrs[cur_transport_attr]);

    for(cur_candidate_hash in cs_t_data) {
      var cs_t_c = cs_t_data[cur_candidate_hash];

      var candidate = transport.appendChild(stanza.buildNode('candidate', { 'xmlns': NS_JINGLE_TRANSPORTS_ICEUDP }));

      for(cur_candidate_attr in cs_t_c)
        self.util_stanza_set_attribute(candidate, cur_candidate_attr, cs_t_c[cur_candidate_attr]);
    }
  };

  /**
   * Generates the session content (initial state)
   */
  self._util_generate_content_session = function() {
    // Generation process
    var content_session = {};

    content_session['creator']     = 'initiator';//TODO: dynamic value mapping, either initiator or responder
    content_session['name']        = self.get_name();
    content_session['description'] = {};
    content_session['transport']   = {};

    // Loop on payloads
    var payloads = self._get_payloads_local();
    var description_cpy, description_ptime, description_maxptime;

    if('media' in payloads) {
      for(cur_media in payloads['media']) {
        if(!(cur_media in JSJAC_JINGLE_MEDIAS)) continue;

        description_cpy      = payloads['media'][cur_media];
        description_ptime    = description_cpy['attrs']['ptime'];
        description_maxptime = description_cpy['attrs']['maxptime'];

        delete description_cpy['attrs']['ptime'];
        delete description_cpy['attrs']['maxptime'];

        for(i in description_cpy['data']) {
          description_cpy['data'][i]['ptime']    = description_ptime;
          description_cpy['data'][i]['maxptime'] = description_maxptime;
        }

        content_session['description'][cur_media] = description_cpy;
      }
    }

    // Loop on transports (candidates)
    var transports = self._get_candidates_local();
    var transport_cpy, transport_id, transport_hash;

    content_session['transport']['data']           = {};
    content_session['transport']['attrs']          = {};
    content_session['transport']['attrs']['pwd']   = payloads['pwd'];
    content_session['transport']['attrs']['ufrag'] = payloads['ufrag'];

    for(cur_media in transports) {
      if(!(cur_media in JSJAC_JINGLE_MEDIAS)) continue;

      for(j in transports[cur_media]) {
        // Generate transport hash (avoids duplicate transports)
        transport_cpy = transports[cur_media][j];
        transport_id = transport_cpy['id'];

        delete transport_cpy['id'];

        transport_hash = self.util_checksum_object(transport_cpy);
        transport_cpy['id'] = transport_id;

        content_session['transport']['data'][transport_hash] = transports[cur_media][j];
      }
    }

    // Storage process
    self._set_content_session(self.get_sid(), content_session);
  };

  /**
   * Generates a random SID value
   * @return SID value
   * @type string
   */
  self.util_generate_sid = function() {
    return cnonce(16);
  };

  /**
   * Generates a random ID value
   * @return ID value
   * @type string
   */
  self.util_generate_id = function() {
    return cnonce(10);
  };

  /**
   * Generates the checksum of an object
   * @return MD5 checksum value
   * @type string
   */
  self.util_checksum_object = function(object) {
    // Assert
    if(typeof object != 'object')
      return null;

    // Sort
    var object_keys = [];

    for(key_p in object)
      object_keys.push(key_p);

    object_keys.sort();

    // Generate trace string
    var object_str  = '';

    for(key_s in object_keys)
      object_str += (object[object_keys[key_s]] || '') + ',';

    return hex_md5(object_str);
  };

  /**
   * Get my connection JID
   * @return JID value
   * @type string
   */
  self.util_connection_jid = function() {
    var con = self._get_connection();
    return con.username + '@' + con.domain + '/' + con.resource;
  };

  /**
   * Attaches a stream source
   */
  self.util_peer_stream_attach = function(element, stream) {
    if(navigator.mozGetUserMedia) {
      element.mozSrcObject = stream;
      element.play();
    } else {
      element.autoplay = true;
      element.src = URL.createObjectURL(stream);
    }
  };

  /**
   * Parses an SDP payload message
   * @return parsed object
   * @type object
   */
  self.util_sdp_parse_payload = function(sdp_payload) {
    if(!sdp_payload || sdp_payload.indexOf('\n') == -1) return {};

    // Common vars
    var payload   = {};
    var lines     = sdp_payload.split('\n');

    var e = 0;
    var cur_line    = null;
    var cur_media   = null;
    var cur_rtpmap  = {};

    var m_rtpmap, m_pwd, m_ufrag, m_ptime, m_maxptime, m_media;

    // Common functions
    var init_media = function(media, sub, sub_default) {
      if(!('media' in payload))              payload['media']             = {};
      if(!(media in payload['media']))       payload['media'][media]      = {};
      if(!(sub in payload['media'][media]))  payload['media'][media][sub] = sub_default;
    };

    for(i in lines) {
      var cur_line = lines[i];

      m_rtpmap = (R_WEBRTC_SDP_ICE_PAYLOAD.rtpmap).exec(cur_line);

      // 'rtpmap' line?
      if(m_rtpmap) {
        if(!cur_media || !(cur_media in JSJAC_JINGLE_MEDIAS)) continue;

        // Populate current object
        e = 0;
        cur_rtpmap = {};

        cur_rtpmap['channels']  = m_rtpmap[6];
        cur_rtpmap['clockrate'] = m_rtpmap[4];
        cur_rtpmap['id']        = m_rtpmap[1] || e++;
        cur_rtpmap['name']      = m_rtpmap[3];

        // Incomplete?
        if(e != 0) continue;

        // Push it to parent array
        init_media(cur_media, 'data', []);

        ((payload.media)[cur_media]['data']).push(cur_rtpmap);

        continue;
      }

      m_pwd = (R_WEBRTC_SDP_ICE_PAYLOAD.pwd).exec(cur_line);

      // 'pwd' line?
      if(m_pwd) {
        payload['pwd'] = m_pwd[1]; continue;
      }

      m_ufrag = (R_WEBRTC_SDP_ICE_PAYLOAD.ufrag).exec(cur_line);

      // 'ufrag' line?
      if(m_ufrag) {
        payload['ufrag'] = m_ufrag[1]; continue;
      }

      m_ptime = (R_WEBRTC_SDP_ICE_PAYLOAD.ptime).exec(cur_line);

      // 'ptime' line?
      if(m_ptime) {
        // Push it to parent array
        init_media(cur_media, 'attrs', {});

        payload['media'][cur_media]['attrs']['ptime'] = m_ptime[1];

        continue;
      }

      m_maxptime = (R_WEBRTC_SDP_ICE_PAYLOAD.maxptime).exec(cur_line);

      // 'maxptime' line?
      if(m_maxptime) {
        // Push it to parent array
        init_media(cur_media, 'attrs', {});

        payload['media'][cur_media]['attrs']['maxptime'] = m_maxptime[1];

        continue;
      }

      m_ssrc = (R_WEBRTC_SDP_ICE_PAYLOAD.ssrc).exec(cur_line);

      // 'ssrc' line?
      if(m_ssrc) {
        // Push it to parent array
        init_media(cur_media, 'attrs', {});

        payload['media'][cur_media]['attrs']['ssrc'] = m_ssrc[1];

        continue;
      }

      m_media = (R_WEBRTC_SDP_ICE_PAYLOAD.media).exec(cur_line);

      // 'audio/video' line?
      if(m_media) {
        cur_media = m_media[1]; continue;
      }
    }

    return payload;
  };

  /**
   * Parses an SDP candidate message
   * @return parsed object
   * @type object
   */
  self.util_sdp_parse_candidate = function(sdp_candidate) {
    if(!sdp_candidate) return {};
    
    var e         = 0;
    var candidate = {};
    var matches   = R_WEBRTC_SDP_ICE_CANDIDATE.exec(sdp_candidate);

    // Matches!
    if(matches) {
      candidate['component']  = matches[2]  || e++;
      candidate['foundation'] = matches[1]  || e++;
      candidate['generation'] = matches[16] || e++;
      candidate['id']         = self.util_generate_id();
      candidate['ip']         = matches[5]  || e++;
      candidate['network']    = JSJAC_JINGLE_NETWORK;
      candidate['port']       = matches[6]  || e++;
      candidate['priority']   = matches[4]  || e++;
      candidate['protocol']   = matches[3]  || e++;
      candidate['rel-addr']   = matches[11];
      candidate['rel-port']   = matches[13];
      candidate['type']       = matches[8]  || e++;
    }

    // Incomplete?
    if(e != 0) return {};

    return candidate;
  };



  /**
   * JSJSAC JINGLE PEER API
   */

  /**
   * @private
   */
  self._peer_connection_create = function(sdp_message_callback) {
    try {
      // Create the RTCPeerConnection object
      self._set_peer_connection(
        new WEBRTC_PEER_CONNECTION(
          WEBRTC_CONFIGURATION.peer_connection.config,
          WEBRTC_CONFIGURATION.peer_connection.constraints
        )
      );

      // Add local stream
      self._get_peer_connection().addStream(self._get_local_stream());

      // Create offer
      self._get_peer_connection().createOffer(self._peer_got_description);

      // Event: onicecandidate
      self._get_peer_connection().onicecandidate = function(e) {
        if(e.candidate) {
          // Store received candidate
          var candidate_id    = e.candidate.sdpMid;
          var candidate_data  = e.candidate.candidate;

          // Convert SDP raw data to an object
          var candidate_obj   = self.util_sdp_parse_candidate(candidate_data);

          self._set_candidates_local(candidate_id, candidate_obj);
        } else {
          self.get_debug().log('[JSJaCJingle] _peer_connection_create > onicecandidate > Got candidates.', 4);

          // Execute what's next
          sdp_message_callback();
        }
      };

      // Event: onaddstream
      self._get_peer_connection().onaddstream = function(e) {
        self.get_debug().log('[JSJaCJingle] _peer_connection_create > onaddstream', 2);

        // Attach remote stream to DOM view
        self._set_remote_stream(e.stream);
      };

      // Event: onremovestream
      self._get_peer_connection().onremovestream = function(e) {
        self.get_debug().log('[JSJaCJingle] _peer_connection_create > onremovestream', 2);

        // Detach remote stream from DOM view
        self._set_remote_stream(null);
      };

      self.get_debug().log('[JSJaCJingle] _peer_connection_create > Done.', 4);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_connection_create > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._peer_get_user_media = function(callback) {
    try {
      self.get_debug().log('[JSJaCJingle] _peer_get_user_media > Getting user media...', 4);

      WEBRTC_GET_MEDIA(
        WEBRTC_CONFIGURATION.get_user_media,
        self._peer_got_stream.bind(this, callback),
        self._peer_got_stream_failed.bind(this)
      );
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_get_user_media > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._peer_got_stream = function(callback, stream) {
    try {
      self.get_debug().log('[JSJaCJingle] _peer_got_stream > Got user media.', 4);

      self._set_local_stream(stream);

      self.util_peer_stream_attach(
        self.get_local_view(),
        stream
      );

      if(callback) callback();
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_got_stream > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._peer_got_stream_failed = function(error) {
    self.get_debug().log('[JSJaCJingle] _peer_got_stream_failed > Failed.', 1);
  };

  /**
   * @private
   */
  self._peer_got_description = function(session_description) {
    try {
      self.get_debug().log('[JSJaCJingle] _peer_got_description > Got description.', 4);

      self._get_peer_connection().setLocalDescription(session_description);

      self.get_debug().log('[JSJaCJingle] _peer_got_description > Waiting for candidates...', 4);

      // Convert SDP raw data to an object
      var payload_obj   = self.util_sdp_parse_payload(session_description.sdp);

      self._set_payloads_local(payload_obj);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_got_stream > ' + e, 1);
    }
  };

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
  };

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
  };

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
  };
}