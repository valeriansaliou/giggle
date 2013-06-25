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
 * Implements:
 *
 * XEP-0166: http://xmpp.org/extensions/xep-0166.html
 * XEP-0167: http://xmpp.org/extensions/xep-0167.html
 * XEP-0176: http://xmpp.org/extensions/xep-0176.html
 * XEP-0293: http://xmpp.org/extensions/xep-0293.html
 * XEP-0294: http://xmpp.org/extensions/xep-0294.html
 * XEP-0320: http://xmpp.org/extensions/xep-0320.html
 *
 *
 * Workflow:
 *
 * This negotiation example associates JSJaCJingle.js methods to a real workflow
 * We assume in this workflow example remote user accepts the call he gets
 *
 * 1.cmt Local user wants to start a WebRTC session with remote user
 * 1.snd Local user sends a session-initiate type='set'
 * 1.hdl Remote user sends back a type='result' to '1.snd' stanza (ack)
 *
 * 2.cmt Local user waits silently for remote user to send a session-accept
 * 2.hdl Remote user sends a session-accept type='set'
 * 2.snd Local user sends back a type='result' to '2.hdl' stanza (ack)
 *
 * 3.cmt WebRTC session starts
 * 3.cmt Users chat, and chat, and chat. Happy Jabbering to them!
 *
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
        'minAspectRatio' : 1.777,
        'maxAspectRatio' : 1.778
      },

      optional  : []
    }
  },

  create_offer    : {
    mandatory: {
      'OfferToReceiveAudio' : true,
      'OfferToReceiveVideo' : true
    }
  },

  create_answer   : {
    mandatory: {
      'OfferToReceiveAudio' : true,
      'OfferToReceiveVideo' : true
    }
  }
};

var WEBRTC_SDP_LINE_BREAK      = '\r\n';
var WEBRTC_SDP_TYPE_OFFER      = 'offer';
var WEBRTC_SDP_TYPE_ANSWER     = 'answer';

var R_WEBRTC_SDP_ICE_CANDIDATE = /^a=candidate:(\w{1,32}) (\d{1,5}) (udp|tcp) (\d{1,10}) ([a-zA-Z0-9:\.]{1,45}) (\d{1,5}) (typ) (host|srflx|prflx|relay)( (raddr) ([a-zA-Z0-9:\.]{1,45}) (rport) (\d{1,5}))?( (generation) (\d))?/i;

var R_WEBRTC_SDP_ICE_PAYLOAD   = {
  rtpmap          : /^a=rtpmap:(\d+) (([^\s\/]+)\/(\d+)(\/([^\s\/]+))?)?/i,
  rtcp_fb         : /^a=rtcp-fb:(\S+) (\S+)( (\S+))?/i,
  rtcp_fb_trr_int : /^a=rtcp-fb:(\d+) trr-int (\d+)/i,
  pwd             : /^a=ice-pwd:(\S+)/i,
  ufrag           : /^a=ice-ufrag:(\S+)/i,
  ptime           : /^a=ptime:(\d+)/i,
  maxptime        : /^a=maxptime:(\d+)/i,
  ssrc            : /^a=ssrc:(\d+)/i,
  rtcp_mux        : /^a=rtcp-mux/i,
  crypto          : /^a=crypto:(\d{1,9}) (\w+) (\S+)( (\S+))?/i,
  fingerprint     : /^a=fingerprint:(\S+) (\S+)/i,
  extmap          : /^a=extmap:([^\s\/]+)(\/([^\s\/]+))? (\S+)/i,
  media           : /^m=(audio|video|application|data) /i
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
var NS_JINGLE_APPS_RTP_RTP_HDREXT                   = 'urn:xmpp:jingle:apps:rtp:rtp-hdrext:0';
var NS_JINGLE_APPS_RTP_RTCP_FB                      = 'urn:xmpp:jingle:apps:rtp:rtcp-fb:0';
var NS_JINGLE_APPS_STUB                             = 'urn:xmpp:jingle:apps:stub:0';
var NS_JINGLE_APPS_DTLS                             = 'urn:xmpp:tmp:jingle:apps:dtls:0';

var NS_JINGLE_TRANSPORTS_ICEUDP                     = 'urn:xmpp:jingle:transports:ice-udp:1';
var NS_JINGLE_TRANSPORTS_STUB                       = 'urn:xmpp:jingle:transports:stub:0';

var NS_JINGLE_SECURITY_STUB                         = 'urn:xmpp:jingle:security:stub:0';

var NS_IETF_RFC_3264                                = 'urn:ietf:rfc:3264';

var R_NS_JINGLE_APP                                 = /^urn:xmpp:jingle:app:(\w+)(:(\w+))?(:(\d+))?$/;
var R_NS_JINGLE_TRANSPORT                           = /^urn:xmpp:jingle:transport:(\w+)$/;

var MAP_DISCO_JINGLE                                = [
  /* http://xmpp.org/extensions/xep-0166.html#support */
  /* http://xmpp.org/extensions/xep-0167.html#support */
  NS_JINGLE,
  NS_JINGLE_APPS_RTP,
  NS_JINGLE_APPS_RTP_AUDIO,
  NS_JINGLE_APPS_RTP_VIDEO,

  /* http://xmpp.org/extensions/xep-0176.html#support */
  NS_JINGLE_TRANSPORTS_ICEUDP,
  NS_IETF_RFC_3264,

  /* http://xmpp.org/extensions/xep-0293.html#determining-support */
  NS_JINGLE_APPS_RTP_RTCP_FB,

  /* http://xmpp.org/extensions/xep-0294.html#determining-support */
  NS_JINGLE_APPS_RTP_RTP_HDREXT,

  /* http://xmpp.org/extensions/xep-0320.html#disco */
  NS_JINGLE_APPS_DTLS
];



/**
 * JSJAC JINGLE CONSTANTS
 */

var JSJAC_JINGLE_AVAILABLE                           = WEBRTC_GET_MEDIA ? true : false;

var JSJAC_JINGLE_STANZA_TIMEOUT                      = 20;
var JSJAC_JINGLE_STANZA_ID_PRE                       = 'jj_';

var JSJAC_JINGLE_NETWORK                             = '0';

var JSJAC_JINGLE_SENDERS_BOTH                        = { jingle: 'both',      sdp: 'sendrecv' };
var JSJAC_JINGLE_SENDERS_INITIATOR                   = { jingle: 'initiator', sdp: 'sendonly' };
var JSJAC_JINGLE_SENDERS_NONE                        = { jingle: 'none',      sdp: 'inactive' };
var JSJAC_JINGLE_SENDERS_RESPONDER                   = { jingle: 'responder', sdp: 'recvonly' };

var JSJAC_JINGLE_CREATOR_INITIATOR                   = 'initiator';
var JSJAC_JINGLE_CREATOR_RESPONDER                   = 'responder';

var JSJAC_JINGLE_STATUS_INACTIVE                     = 'inactive';
var JSJAC_JINGLE_STATUS_INITIATING                   = 'initiating';
var JSJAC_JINGLE_STATUS_INITIATED                    = 'initiated';
var JSJAC_JINGLE_STATUS_ACCEPTING                    = 'accepting';
var JSJAC_JINGLE_STATUS_ACCEPTED                     = 'accepted';
var JSJAC_JINGLE_STATUS_TERMINATING                  = 'terminating';
var JSJAC_JINGLE_STATUS_TERMINATED                   = 'terminated';

var JSJAC_JINGLE_ACTION_CONTENT_ACCEPT               = 'content-accept';
var JSJAC_JINGLE_ACTION_CONTENT_ADD                  = 'content-add';
var JSJAC_JINGLE_ACTION_CONTENT_MODIFY               = 'content-modify';
var JSJAC_JINGLE_ACTION_CONTENT_REJECT               = 'content-reject';
var JSJAC_JINGLE_ACTION_CONTENT_REMOVE               = 'content-remove';
var JSJAC_JINGLE_ACTION_DESCRIPTION_INFO             = 'description-info';
var JSJAC_JINGLE_ACTION_SECURITY_INFO                = 'security-info';
var JSJAC_JINGLE_ACTION_SESSION_ACCEPT               = 'session-accept';
var JSJAC_JINGLE_ACTION_SESSION_INFO                 = 'session-info';
var JSJAC_JINGLE_ACTION_SESSION_INITIATE             = 'session-initiate';
var JSJAC_JINGLE_ACTION_SESSION_TERMINATE            = 'session-terminate';
var JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT             = 'transport-accept';
var JSJAC_JINGLE_ACTION_TRANSPORT_INFO               = 'transport-info';
var JSJAC_JINGLE_ACTION_TRANSPORT_REJECT             = 'transport-reject';
var JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE            = 'transport-replace';

var JSJAC_JINGLE_ERROR_OUT_OF_BORDER                 = { jingle: 'out-of-border',          xmpp: 'unexpected-request',         type: 'wait'   };
var JSJAC_JINGLE_ERROR_TIE_BREAK                     = { jingle: 'tie-break',              xmpp: 'conflict',                   type: 'cancel' };
var JSJAC_JINGLE_ERROR_UNKNOWN_SESSION               = { jingle: 'unknown-session',        xmpp: 'item-not-found',             type: 'cancel' };
var JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO              = { jingle: 'unsupported-info',       xmpp: 'feature-not-implemented',    type: 'modify' };
var JSJAC_JINGLE_ERROR_SECURITY_REQUIRED             = { jingle: 'security-required',      xmpp: 'not-acceptable',             type: 'cancel' };

var XMPP_ERROR_FEATURE_NOT_IMPLEMENTED               = { xmpp: 'feature-not-implemented',  type: 'cancel' };
var XMPP_ERROR_SERVICE_UNAVAILABLE                   = { xmpp: 'service-unavailable',      type: 'cancel' };
var XMPP_ERROR_REDIRECT                              = { xmpp: 'redirect',                 type: 'modify' };
var XMPP_ERROR_RESOURCE_CONSTRAINT                   = { xmpp: 'resource-constraint',      type: 'wait'   };
var XMPP_ERROR_BAD_REQUEST                           = { xmpp: 'bad-request',              type: 'cancel' };

var JSJAC_JINGLE_REASON_ALTERNATIVE_SESSION          = 'alternative-session';
var JSJAC_JINGLE_REASON_BUSY                         = 'busy';
var JSJAC_JINGLE_REASON_CANCEL                       = 'cancel';
var JSJAC_JINGLE_REASON_CONNECTIVITY_ERROR           = 'connectivity-error';
var JSJAC_JINGLE_REASON_DECLINE                      = 'decline';
var JSJAC_JINGLE_REASON_EXPIRED                      = 'expired';
var JSJAC_JINGLE_REASON_FAILED_APPLICATION           = 'failed-application';
var JSJAC_JINGLE_REASON_FAILED_TRANSPORT             = 'failed-transport';
var JSJAC_JINGLE_REASON_GENERAL_ERROR                = 'general-error';
var JSJAC_JINGLE_REASON_GONE                         = 'gone';
var JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS      = 'incompatible-parameters';
var JSJAC_JINGLE_REASON_MEDIA_ERROR                  = 'media-error';
var JSJAC_JINGLE_REASON_SECURITY_ERROR               = 'security-error';
var JSJAC_JINGLE_REASON_SUCCESS                      = 'success';
var JSJAC_JINGLE_REASON_TIMEOUT                      = 'timeout';
var JSJAC_JINGLE_REASON_UNSUPPORTED_APPLICATIONS     = 'unsupported-applications';
var JSJAC_JINGLE_REASON_UNSUPPORTED_TRANSPORTS       = 'unsupported-transports';

var JSJAC_JINGLE_SESSION_INFO_ACTIVE                 = 'active';
var JSJAC_JINGLE_SESSION_INFO_HOLD                   = 'hold';
var JSJAC_JINGLE_SESSION_INFO_MUTE                   = 'mute';
var JSJAC_JINGLE_SESSION_INFO_RINGING                = 'ringing';
var JSJAC_JINGLE_SESSION_INFO_UNHOLD                 = 'unhold';
var JSJAC_JINGLE_SESSION_INFO_UNMUTE                 = 'unmute';

var JSJAC_JINGLE_MEDIA_AUDIO                         = 'audio';
var JSJAC_JINGLE_MEDIA_VIDEO                         = 'video';



/**
 * JSJSAC JINGLE CONSTANTS MAPPING
 */

var JSJAC_JINGLE_SENDERS            = {};
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_BOTH.jingle]                = JSJAC_JINGLE_SENDERS_BOTH.sdp;
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_INITIATOR.jingle]           = JSJAC_JINGLE_SENDERS_INITIATOR.sdp;
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_NONE.jingle]                = JSJAC_JINGLE_SENDERS_NONE.sdp;
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_RESPONDER.jingle]           = JSJAC_JINGLE_SENDERS_RESPONDER.sdp;

var JSJAC_JINGLE_CREATORS           = {};
JSJAC_JINGLE_CREATORS[JSJAC_JINGLE_CREATOR_INITIATOR]                 = 1;
JSJAC_JINGLE_CREATORS[JSJAC_JINGLE_CREATOR_RESPONDER]                 = 1;

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
JSJAC_JINGLE_MEDIAS[JSJAC_JINGLE_MEDIA_AUDIO]                         = { label: '0' };
JSJAC_JINGLE_MEDIAS[JSJAC_JINGLE_MEDIA_VIDEO]                         = { label: '1' };



/**
 * JSJAC JINGLE STORAGE
 */

var JSJAC_JINGLE_STORE_CONNECTION = null;
var JSJAC_JINGLE_STORE_SESSIONS   = {};
var JSJAC_JINGLE_STORE_INITIATE   = function(stanza) {};



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
  if(!JSJAC_JINGLE_AVAILABLE) return;

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

  if(args && args.to)
    /**
     * @private
     */
    self._to = args.to;

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
  self._candidates_local = {};

  /**
   * @private
   */
  self._payloads_remote = [];

  /**
   * @private
   */
  self._candidates_remote = {};

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
    self._set_initiator(self.util_connection_jid());
    self._set_responder(self.get_to());

    for(available_name in JSJAC_JINGLE_MEDIAS) {
      self._set_name(available_name);
      self._set_senders(available_name, JSJAC_JINGLE_SENDERS_BOTH.jingle);
      self._set_creator(available_name, JSJAC_JINGLE_CREATOR_INITIATOR);
    }

    // Trigger init pending custom callback
    (self._get_session_initiate_pending())(self);

    // Register session to common router
    JSJaCJingle_add(self.get_sid(), self);

    // Initialize WebRTC
    self._peer_get_user_media(function() {
      self._peer_connection_create(function() {
        self.get_debug().log('[JSJaCJingle] init > Ready to begin Jingle negotiation.', 2);

        // Build content (local)
        self._util_initialize_content_local();

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

    // Initialize WebRTC
    self._peer_get_user_media(function() {
      self._peer_connection_create(function() {
        self.get_debug().log('[JSJaCJingle] accept > Ready to complete Jingle negotiation.', 2);

        // Build content (local)
        self._util_initialize_content_local();

        // Process accept actions
        self.send('set', { action: JSJAC_JINGLE_ACTION_SESSION_ACCEPT });
      })
    });
  };

  /**
   * Terminates the Jingle session.
   */
  self.terminate = function(reason) {
    // Slot unavailable?
    if(!(self.get_status() == JSJAC_JINGLE_STATUS_INITIATED || self.get_status() == JSJAC_JINGLE_STATUS_TERMINATED)) {
      self.get_debug().log('[JSJaCJingle] terminate > Cannot terminate, resource not accepted (status: ' + self.get_status() + ').', 1);
      return;
    }

    // Trigger terminate pending custom callback
    (self._get_session_terminate_pending())(self);

    // Process terminate actions
    self.send('set', { action: JSJAC_JINGLE_ACTION_SESSION_TERMINATE, reason: reason });
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

    JSJAC_JINGLE_STORE_CONNECTION.send(stanza);

    return true;
  };

  /**
   * Handles a given Jingle stanza response
   */
  self.handle = function(stanza) {
    var jingle = self.util_stanza_jingle(stanza);

    // Don't handle non-Jingle stanzas there...
    if(!jingle) return;

    var action = self.util_stanza_get_attribute(jingle, 'action');

    // Don't handle action-less Jingle stanzas there...
    if(!action) return;

    var id = stanza.getID();
    if(id) self._set_received_id(id);

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
    if(!arg && type == 'result') {
        self.get_debug().log('[JSJaCJingle] send_session_accept > Argument not provided.', 1);
        return;
    }

    if(type == 'set') {
      if(!(self.get_status() == JSJAC_JINGLE_STATUS_INITIATED || self.get_status() == JSJAC_JINGLE_STATUS_ACCEPTING)) {
        self.get_debug().log('[JSJaCJingle] send_session_accept > Resource not initiated (status: ' + self.get_status() + ').', 1);
        return;
      }

      // Build Jingle stanza
      var jingle = stanza.getNode().appendChild(stanza.buildNode('jingle', {
                                                  'xmlns': NS_JINGLE,
                                                  'action': JSJAC_JINGLE_ACTION_SESSION_ACCEPT,
                                                  'responder': self.get_responder(),
                                                  'sid': self.get_sid()
                                               }));

      self._util_stanza_content_local(stanza, jingle, self.get_sid());
    } else if(type == 'result') {
      stanza.setID(arg);
    } else {
      self.get_debug().log('[JSJaCJingle] send_session_accept > Stanza type must either be set or result.', 1);
      return;
    }

    // Change session status
    self.handle_session_accept_success(stanza);
    (self._get_session_accept_success())(self, stanza);

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

      // Build Jingle stanza
      var jingle = stanza.getNode().appendChild(stanza.buildNode('jingle', {
                                                  'xmlns': NS_JINGLE,
                                                  'action': JSJAC_JINGLE_ACTION_SESSION_INITIATE,
                                                  'initiator': self.get_initiator(),
                                                  'sid': self.get_sid()
                                               }));

      self._util_stanza_content_local(stanza, jingle, self.get_sid());
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

    // Change session status
    self.handle_session_initiate_success(stanza);
    (self._get_session_initiate_success())(self, stanza);

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

    // Change session status
    self.handle_session_terminate_success(stanza);
    (self._get_session_terminate_success())(self, stanza);

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
      self.get_debug().log('[JSJaCJingle] handle_session_accept > Dropped unsafe stanza.', 2);

      self.send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
      return;
    }

    self.get_debug().log('[JSJaCJingle] handle_session_accept > Handled.', 4);

    // Can now safely dispatch the stanza
    switch(stanza.getType()) {
      case 'result':
        self.handle_session_accept_success(stanza);
        (self._get_session_accept_success())(self, stanza);

        break;

      case 'error':
        self.handle_session_accept_error(stanza);
        (self._get_session_accept_error())(self, stanza);

        break;

      case 'set':
        self.handle_session_accept_request(stanza);
        (self._get_session_accept_request())(self, stanza);

        break;

      default:
        self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    }
  };

  /**
   * Handles the Jingle session accept success
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_accept_success = function(stanza) {
    // Change session status
    self._set_status(JSJAC_JINGLE_STATUS_ACCEPTED);

    self.get_debug().log('[JSJaCJingle] handle_session_accept_success > Handled.', 4);
  };

  /**
   * Handles the Jingle session accept error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_accept_error = function(stanza) {
    // Change session status
    self._set_status(JSJAC_JINGLE_STATUS_INITIATED);

    self.get_debug().log('[JSJaCJingle] handle_session_accept_error > Handled.', 4);
  };

  /**
   * Handles the Jingle session accept request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_accept_request = function(stanza) {
    // Common vars
    var req_error = false;
    var i, j,
        rd_sid, rd_content,
        jingle, content,
        content_creator, content_name, content_senders,
        accept_payload, accept_candidate, accept_sdp,
        cur_candidate_id, cur_accept_candidate, cur_candidate_obj;

    // Change session status
    self._set_status(JSJAC_JINGLE_STATUS_INITIATED);

    rd_sid = self.util_stanza_sid(stanza);

    // Request is valid?
    if(rd_sid && self.is_initiator()) {
      // Parse initiate stanza
      jingle = self.util_stanza_jingle(stanza);

      if(jingle) {
        // Childs
        content = self.util_stanza_get_element(jingle, 'content', NS_JINGLE);
        
        if(content.length) {
          content = content[0];

          // Attrs
          content_creator = self.util_stanza_get_attribute(content, 'creator');
          content_name    = self.util_stanza_get_attribute(content, 'name');
          content_senders = self.util_stanza_get_attribute(content, 'senders');

          // Generate full content data
          if(content_creator && content_name) {
            accept_payload   = self.util_stanza_parse_payload(stanza);
            accept_candidate = self.util_stanza_parse_candidate(stanza);
          } else {
            req_error = true;
          }
        } else {
          req_error = true;
        }
      } else {
        req_error = true;
      }
    } else {
      req_error = true;
    }

    if(!req_error) {
      // Generate and store content data
      rd_content = self._util_generate_content(
        content_creator,
        content_name,
        content_senders,
        accept_payload,
        accept_candidate
      );

      // Store remote data
      self._set_content_remote(content_name, rd_content);
      self._set_payloads_remote(accept_payload);

      for(cur_candidate_id in accept_candidate) {
        cur_accept_candidate = accept_candidate[cur_candidate_id];

        for(i in cur_accept_candidate)
          self._set_candidates_remote(cur_candidate_id, cur_accept_candidate[i]);
      }

      // Process accept actions
      self.send('result', { id: stanza.getID() });

      // Trigger accept success custom callback
      (self._get_session_accept_success())(self, stanza);

      // Apply SDP data
      accept_sdp = self.util_sdp_generate(WEBRTC_SDP_TYPE_OFFER, accept_payload, accept_candidate);

      // Remote description
      self._get_peer_connection().setRemoteDescription(
        new WEBRTC_SESSION_DESCRIPTION(accept_sdp.description)
      );

      // ICE candidates
      for(j in accept_sdp.candidates) {
        cur_candidate_obj = (accept_sdp.candidates)[j];

        self._get_peer_connection().addIceCandidate(
          new WEBRTC_ICE_CANDIDATE({
            sdpMLineIndex : cur_candidate_obj.label,
            sdpMid        : cur_candidate_obj.id,
            candidate     : cur_candidate_obj.candidate
          })
        );
      }

      // TODO-LATER: send an unsupported transport reply if there's no way the session can work
      //             will need to request for our own SDP, parse it, compare with friend's one
      //             issue: SDP can cause a little delay which will delay the ring handler trigger

      self.get_debug().log('[JSJaCJingle] handle_session_accept_request > Handled.', 4);
    } else {
      // Send error reply
      self.send_error(stanza, XMPP_ERROR_BAD_REQUEST);

      // Trigger success error custom callback
      (self._get_session_accept_error())(self, stanza);

      self.get_debug().log('[JSJaCJingle] handle_session_accept_request > Error.', 2);
    }
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

    self.get_debug().log('[JSJaCJingle] handle_session_info > Handled.', 4);

    // Can now safely dispatch the stanza
    switch(stanza.getType()) {
      case 'result':
        self.handle_session_info_success(stanza);
        (self._get_session_info_success())(self, stanza);

        break;

      case 'error':
        self.handle_session_info_error(stanza);
        (self._get_session_info_error())(self, stanza);

        break;

      case 'set':
        self.handle_session_info_request(stanza);
        (self._get_session_info_request())(self, stanza);

        break;

      default:
        self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    }
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
      case JSJAC_JINGLE_SESSION_INFO_RINGING:
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
    self.get_debug().log('[JSJaCJingle] handle_session_initiate > Handled.', 4);

    switch(stanza.getType()) {
      case 'result':
        self.handle_session_initiate_success(stanza);
        (self._get_session_initiate_success())(self, stanza);

        break;

      case 'error':
        self.handle_session_initiate_error(stanza);
        (self._get_session_initiate_error())(self, stanza);

        break;

      case 'set':
        self.handle_session_initiate_request(stanza);
        (self._get_session_initiate_request())(self, stanza);

        break;

      default:
        self.send_error(stanza, XMPP_ERROR_FEATURE_NOT_IMPLEMENTED);
    }
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

    // Stop WebRTC
    self._peer_stop();

    // TODO-LATER: auto-destroy self object + this

    self.get_debug().log('[JSJaCJingle] handle_session_initiate_error > Handled.', 4);
  };

  /**
   * Handles the Jingle session initiate request
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_initiate_request = function(stanza) {
    // Change session status
    self._set_status(JSJAC_JINGLE_STATUS_INITIATING);

    // Common vars
    var req_error = false;
    var i, j,
        rd_from, rd_sid, rd_content,
        jingle, content, cur_content,
        content_creator, content_name, content_senders,
        cur_candidate_id, cur_accept_candidate;

    rd_from = self.util_stanza_from(stanza);
    rd_sid  = self.util_stanza_sid(stanza);

    // Request is valid?
    if(rd_sid) {
      // Parse initiate stanza
      jingle = self.util_stanza_jingle(stanza);

      if(jingle) {
        // Childs
        content = self.util_stanza_get_element(jingle, 'content', NS_JINGLE);

        if(content && content.length) {
          for(j in content) {
            cur_content = content[j];

            // Attrs
            content_name    = self.util_stanza_get_attribute(cur_content, 'name');
            content_senders = self.util_stanza_get_attribute(cur_content, 'senders');
            content_creator = self.util_stanza_get_attribute(cur_content, 'creator');

            self._set_name(content_name);
            self._set_senders(content_name, content_senders);
            self._set_creator(content_name, content_creator);

            // Nodes
            self._set_payloads_remote(
              content_name,
              self.util_stanza_parse_payload(stanza)
            );

            self._set_candidates_remote(
              content_name,
              self.util_stanza_parse_candidate(stanza)
            );
          }
        } else {
          req_error = true;
        }
      } else {
        req_error = true;
      }
    } else {
      req_error = true;
    }

    if(!req_error) {
      // Set session values
      self._set_sid(rd_sid);
      self._set_to(rd_from);
      self._set_initiator(rd_from);
      self._set_responder(self.util_connection_jid());

      // Register session to common router
      JSJaCJingle_add(rd_sid, self);

      // Generate and store content data
      self._util_initialize_content_remote();

      // TODO-LATER: send an unsupported transport reply if there's no way the session can work
      //             will need to request for our own SDP, parse it, compare with friend's one
      //             issue: SDP can cause a little delay which will delay the ring handler trigger

      // Session initiate done
      self.handle_session_initiate_success(stanza);
      (self._get_session_initiate_success())(self, stanza);

      self.get_debug().log('[JSJaCJingle] handle_session_initiate_request > Handled.', 4);
    } else {
      // Send error reply
      self.send_error(stanza, XMPP_ERROR_BAD_REQUEST);

      // Trigger success error custom callback
      (self._get_session_initiate_error())(self, stanza);

      self.get_debug().log('[JSJaCJingle] handle_session_initiate_request > Error.', 2);
    }
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

    self.get_debug().log('[JSJaCJingle] handle_session_terminate > Handled.', 4);

    // Can now safely dispatch the stanza
    switch(stanza.getType()) {
      case 'result':
        self.handle_session_terminate_success(stanza);
        (self._get_session_terminate_success())(self, stanza);

        break;

      case 'error':
        self.handle_session_terminate_error(stanza);
        (self._get_session_terminate_error())(self, stanza);

        break;

      case 'set':
        self.handle_session_terminate_request(stanza);
        (self._get_session_terminate_request())(self, stanza);

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

    // Stop WebRTC
    self._peer_stop();

    self.get_debug().log('[JSJaCJingle] handle_session_terminate_success > Handled.', 4);
  };

  /**
   * Handles the Jingle session terminate error
   * @param {JSJaCPacket} stanza Jingle handled stanza
   */
  self.handle_session_terminate_error = function(stanza) {
    // Change session status
    self._set_status(JSJAC_JINGLE_STATUS_TERMINATED);

    // Stop WebRTC
    self._peer_stop();

    // TODO-LATER: auto-destroy self object + this

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

    // Trigger terminate success callbacks
    self.handle_session_terminate_success(stanza);
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
  self._get_payloads_local = function(name) {
    if(name)
      return (name in self._payloads_local) ? self._payloads_local[name] : {};

    return self._payloads_local;
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
  self._get_payloads_remote = function(name) {
    if(name)
      return (name in self._payloads_remote) ? self._payloads_remote[name] : {};

    return self._payloads_remote;
  };

  /**
   * @private
   */
  self._get_candidates_remote = function(name) {
    if(name)
      return (name in self._candidates_remote) ? self._candidates_remote[name] : {};

    return self._candidates_remote;
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
    if(!local_stream && self._local_stream) {
      (self.get_local_view()).pause();
      (self._local_stream).stop();
    }

    self._local_stream = local_stream;

    (self.get_local_view()).src = local_stream ? URL.createObjectURL(self._get_local_stream()) : '';

    self.util_peer_stream_attach(
      self.get_local_view(),
      self._local_stream,
      true
    );
  };

  /**
   * @private
   */
  self._set_remote_stream = function(remote_stream) {
    if(!remote_stream && self._remote_stream)
      (self.get_remote_view()).pause();

    self._remote_stream = remote_stream;

    (self.get_remote_view()).src = remote_stream ? URL.createObjectURL(self._get_remote_stream()) : '';

    self.util_peer_stream_attach(
      self.get_remote_view(),
      self._remote_stream,
      false
    );
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
  self._set_candidates_local = function(name, candidate_data) {
    if(!(name in self._candidates_local))  self._candidates_local[name] = [];

    (self._candidates_local[name]).push(candidate_data);
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
  self._set_candidates_remote = function(name, candidate_data) {
    if(!(name in self._candidates_remote))  self._candidates_remote[name] = [];

    (self._candidates_remote[name]).push(candidate_data);
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
  self._set_to = function(to) {
    self._to = to;
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
   * JSJSAC JINGLE SHORTCUTS
   */

  /**
   * Am I responder?
   * @return Receiver state
   * @type boolean
   */
  self.is_responder = function() {
    return self.util_negotiation_status() == JSJAC_JINGLE_SENDERS_RESPONDER.jingle;
  };

  /**
   * Am I initiator?
   * @return Initiator state
   * @type boolean
   */
  self.is_initiator = function() {
    return self.util_negotiation_status() == JSJAC_JINGLE_SENDERS_INITIATOR.jingle;
  };



  /**
   * JSJSAC JINGLE UTILITIES
   */

  /**
   * Gets the node value from a stanza element
   * @return Node value
   * @type string
   */
  self.util_stanza_get_value = function(stanza) {
    try {
      return stanza.firstChild.nodeValue || null;
    } catch(e) {
      try {
        return (stanza[0]).firstChild.nodeValue || null;
      } catch(e) {
        return null;
      }
    }
  };

  /**
   * Gets the attribute value from a stanza element
   * @return Attribute value
   * @type string
   */
  self.util_stanza_get_attribute = function(stanza, name) {
    if(!name) return null;

    try {
      return stanza.getAttribute(name) || null;
    } catch(e) {
      try {
        return (stanza[0]).getAttribute(name) || null;
      } catch(e) {
        return null;
      }
    }
  };

  /**
   * Sets the attribute value to a stanza element
   */
  self.util_stanza_set_attribute = function(stanza, name, value) {
    if(!(name && value && stanza)) return;

    try {
      stanza.setAttribute(name, value);
    } catch(e) {
      (stanza[0]).setAttribute(name, value);
    }
  };

  /**
   * Gets the Jingle node from a stanza
   * @return Jingle node
   * @type DOM
   */
  self.util_stanza_get_element = function(stanza, name, ns) {
    try {
      return stanza.getElementsByTagNameNS(ns, name);
    } catch(e) {
      try {
        return (stanza[0]).getElementsByTagNameNS(ns, name);
      } catch(e) {
        return [];
      }
    }
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
    return self.util_stanza_get_attribute(
      self.util_stanza_jingle(stanza),
      'sid'
    );
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
    var jingle = self.util_stanza_jingle(stanza);

    if(jingle) {
      var reason = self.util_stanza_get_element(jingle, 'reason', NS_JINGLE);

      if(reason.length) {
        for(cur_reason in JSJAC_JINGLE_REASONS)
          if(self.util_stanza_get_element(reason[0], cur_reason, NS_JINGLE).length) return cur_reason;
      }
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

    if(jingle) {
      for(cur_info in JSJAC_JINGLE_SESSION_INFOS)
        if(self.util_stanza_get_element(jingle, cur_info, NS_JINGLE_APPS_RTP_INFO).length) return cur_info;
    }

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
    }, (JSJAC_JINGLE_STANZA_TIMEOUT * 1000));
  };

  /**
   * Parses a Jingle payload stanza
   * @return parsed object
   * @type object
   */
  self.util_stanza_parse_payload = function(stanza_payload) {
    var jingle      = self.util_stanza_jingle(stanza_payload);
    var payload_obj = {};

    if(!jingle) return {};

    var content = self.util_stanza_get_element(jingle, 'content', NS_JINGLE);

    if(!content.length) return {};

    // Common vars
    var c, cur_content,
        j, k, l, m, n, o,
        description, cur_description, cd_media, cd_ssrc,
        rtcp_fb_common, cur_p_rtcp_fb_common, cur_p_rtcp_fb_common_arr,
        payload, e, cur_payload, cur_payload_arr, cur_payload_id,
        encryption, crypto, cur_crypto, cur_crypto_arr,
        rtp_hdrext, cur_rtp_hdrext, cur_rtp_hdrext_arr,
        rtcp_mux;

    // Common functions
    var init_content = function(name) {
      if(!(name               in payload_obj))             payload_obj[name]                                = {};

      if(!('attrs'            in payload_obj[name]))       payload_obj[name]['attrs']                       = {};
      if(!('rtcp-fb'          in payload_obj[name]))       payload_obj[name]['rtcp-fb']                     = [];
      if(!('payload'          in payload_obj[name]))       payload_obj[name]['payload']                     = {};
      if(!('crypto'           in payload_obj[name]))       payload_obj[name]['crypto']                      = [];
      if(!('rtp-hdrext'       in payload_obj[name]))       payload_obj[name]['rtp-hdrext']                  = [];
      if(!('rtcp-mux'         in payload_obj[name]))       payload_obj[name]['rtcp-mux']                    = 0;
    };

    var init_payload = function(name, id) {
      if(!(id                 in payload_obj[name]['payload']))      payload_obj[name]['payload'][id]                    = {};

      if(!('attrs'            in payload_obj[name]['payload'][id]))  payload_obj[name]['payload'][id]['attrs']           = {};
      if(!('rtcp-fb'          in payload_obj[name]['payload'][id]))  payload_obj[name]['payload'][id]['rtcp-fb']         = [];
      if(!('rtcp-fb-trr-int'  in payload_obj[name]['payload'][id]))  payload_obj[name]['payload'][id]['rtcp-fb-trr-int'] = [];
    }

    for(c in content) {
      cur_content = content[c];

      cc_name    = self.util_stanza_get_attribute(description, 'name');
      cc_senders = self.util_stanza_get_attribute(description, 'senders');
      cc_creator = self.util_stanza_get_attribute(description, 'creator');

      // Parse session description
      description = self.util_stanza_get_element(cur_content, 'description', NS_JINGLE_APPS_RTP);

      if(!description.length) continue;

      description = description[0];

      cd_media = self.util_stanza_get_attribute(description, 'media');
      cd_ssrc  = self.util_stanza_get_attribute(description, 'ssrc');

      if(!cd_media) continue;

      // Initialize current description
      init_content(cc_name);
      payload_obj[cc_name]['attrs']['ssrc'] = cd_ssrc;

      // Loop on common RTCP-FB
      rtcp_fb_common = self.util_stanza_get_element(description, 'rtcp-fb', NS_JINGLE_APPS_RTP_RTCP_FB);

      if(rtcp_fb_common.length) {
        for(o = 0; o < rtcp_fb_common.length; o++) {
          e = 0;
          cur_p_rtcp_fb_common = rtcp_fb_common[o];
          cur_p_rtcp_fb_common_arr = {};

          cur_p_rtcp_fb_common_arr['type']    = self.util_stanza_get_attribute(cur_p_rtcp_fb_common, 'type')  || e++;
          cur_p_rtcp_fb_common_arr['subtype'] = self.util_stanza_get_attribute(cur_p_rtcp_fb_common, 'subtype');

          if(e != 0) continue;

          // Push current crypto
          (payload_obj[cc_name]['rtcp-fb']).push(cur_p_rtcp_fb_common_arr);
        }
      }

      // Loop on multiple payloads
      payload = self.util_stanza_get_element(cur_content, 'payload-type', NS_JINGLE_APPS_RTP);

      if(payload.length) {
        for(j = 0; j < payload.length; j++) {
          e               = 0;
          cur_payload     = payload[j];
          cur_payload_arr = {};

          cur_payload_arr['channels']  = self.util_stanza_get_attribute(cur_payload, 'channels');
          cur_payload_arr['clockrate'] = self.util_stanza_get_attribute(cur_payload, 'clockrate');
          cur_payload_arr['id']        = self.util_stanza_get_attribute(cur_payload, 'id') || e++;
          cur_payload_arr['maxptime']  = self.util_stanza_get_attribute(cur_payload, 'maxptime');
          cur_payload_arr['name']      = self.util_stanza_get_attribute(cur_payload, 'name');
          cur_payload_arr['ptime']     = self.util_stanza_get_attribute(cur_payload, 'ptime');

          if(e != 0) continue;

          // Initialize current payload
          cur_payload_id = cur_payload_arr['id'];
          init_payload(cc_name, cur_payload_id);

          // Push current payload
          payload_obj[cc_name]['payload'][cur_payload_id]['attrs'] = cur_payload_arr;

          // Loop on multiple RTCP-FB
          rtcp_fb = self.util_stanza_get_element(cur_payload, 'rtcp-fb', NS_JINGLE_APPS_RTP_RTCP_FB);

          if(rtcp_fb.length) {
            for(m = 0; m < rtcp_fb.length; m++) {
              e = 0;
              cur_p_rtcp_fb = rtcp_fb[m];
              cur_p_rtcp_fb_arr = {};

              cur_p_rtcp_fb_arr['type']    = self.util_stanza_get_attribute(cur_p_rtcp_fb, 'type')  || e++;
              cur_p_rtcp_fb_arr['subtype'] = self.util_stanza_get_attribute(cur_p_rtcp_fb, 'subtype');

              if(e != 0) continue;

              // Push current crypto
              (payload_obj[cc_name]['payload'][cur_payload_id]['rtcp-fb']).push(cur_p_rtcp_fb_arr);
            }
          }

          // Loop on multiple RTCP-FB-TRR-INT
          rtcp_fb_trr_int = self.util_stanza_get_element(cur_payload, 'rtcp-fb-trr-int', NS_JINGLE_APPS_RTP_RTCP_FB);

          if(rtcp_fb_trr_int.length) {
            for(n = 0; n < rtcp_fb_trr_int.length; m++) {
              e = 0;
              cur_p_rtcp_fb_trr_int = rtcp_fb_trr_int[n];
              cur_p_rtcp_fb_trr_arr = {};

              cur_p_rtcp_fb_trr_int_arr['value'] = self.util_stanza_get_attribute(cur_p_rtcp_fb_trr_int, 'value')  || e++;

              if(e != 0) continue;

              // Push current crypto
              (payload_obj[cc_name]['payload'][cur_payload_id]['rtcp-fb-trr-int']).push(cur_p_rtcp_fb_trr_int_arr);
            }
          }
        }
      }

      // Parse the encryption element
      encryption = self.util_stanza_get_element(description, 'encryption', NS_JINGLE_APPS_RTP);

      if(encryption.length) {
        // Loop on multiple cryptos
        crypto = self.util_stanza_get_element(encryption, 'crypto', NS_JINGLE_APPS_RTP);

        for(k = 0; k < crypto.length; k++) {
          e              = 0;
          cur_crypto     = crypto[k];
          cur_crypto_arr = {};

          cur_crypto_arr['crypto-suite']   = self.util_stanza_get_attribute(cur_crypto, 'crypto-suite');
          cur_crypto_arr['key-params']     = self.util_stanza_get_attribute(cur_crypto, 'key-params');
          cur_crypto_arr['session-params'] = self.util_stanza_get_attribute(cur_crypto, 'session-params')  || e++;
          cur_crypto_arr['tag']            = self.util_stanza_get_attribute(cur_crypto, 'tag');

          if(e != 0) continue;

          // Push current crypto
          (payload_obj[cc_name]['crypto']).push(cur_crypto_arr);
        }
      }

      // Parse the RTP-HDREXT element
      rtp_hdrext = self.util_stanza_get_element(description, 'rtp-hdrext', NS_JINGLE_APPS_RTP_RTP_HDREXT);

      if(rtp_hdrext.length) {
        for(l = 0; l < rtp_hdrext.length; l++) {
          e                  = 0;
          cur_rtp_hdrext     = rtp_hdrext[l];
          cur_rtp_hdrext_arr = {};

          cur_rtp_hdrext_arr['id']      = self.util_stanza_get_attribute(cur_rtp_hdrext, 'id')   || e++;
          cur_rtp_hdrext_arr['uri']     = self.util_stanza_get_attribute(cur_rtp_hdrext, 'uri')  || e++;
          cur_rtp_hdrext_arr['senders'] = self.util_stanza_get_attribute(cur_rtp_hdrext, 'senders');

          if(e != 0) continue;

          // Push current RTP-HDREXT
          (payload_obj[cc_name]['rtp-hdrext']).push(cur_rtp_hdrext_arr);
        }
      }

      // Parse the RTCP-MUX element
      rtcp_mux = self.util_stanza_get_element(description, 'rtcp-mux', NS_JINGLE_APPS_RTP);

      payload_obj[cc_name]['rtcp-mux'] = 1;

      // Parse transport (need to get 'ufrag' and 'pwd' there)
      var transport = self.util_stanza_get_element(cur_content, 'transport', NS_JINGLE_TRANSPORTS_ICEUDP);

      if(!transport.length) continue;

      payload_obj['pwd']          = self.util_stanza_get_attribute(transport, 'pwd');
      payload_obj['ufrag']        = self.util_stanza_get_attribute(transport, 'ufrag');

      var fingerprint = self.util_stanza_get_element(transport, 'fingerprint', NS_JINGLE_APPS_DTLS);

      if(fingerprint.length) {
        payload_obj['fingerprint']          = {};
        payload_obj['fingerprint']['hash']  = self.util_stanza_get_attribute(fingerprint, 'hash');
        payload_obj['fingerprint']['value'] = self.util_stanza_get_value(fingerprint);
      }
    }

    return payload_obj;
  };

  /**
   * Parses a Jingle candidate stanza
   * @return parsed object
   * @type object
   */
  self.util_stanza_parse_candidate = function(stanza_candidate) {
    var jingle        = self.util_stanza_jingle(stanza_candidate);
    var candidate_obj = {};

    var content = self.util_stanza_get_element(jingle, 'content', NS_JINGLE);

    if(!content.length) return {};

    for(c in content) {
      var cur_content = content[c];

      var cc_name     = self.util_stanza_get_attribute(cur_content, 'name');

      // Parse transport candidates
      var transport = self.util_stanza_get_element(cur_content, 'transport', NS_JINGLE_TRANSPORTS_ICEUDP);
      
      if(!transport.length) return {};

      var candidate = self.util_stanza_get_element(transport, 'candidate', NS_JINGLE_TRANSPORTS_ICEUDP);

      if(!candidate.length) return {};

      // Common vars
      var candidate_arr = [];

      var e, cur_candidate, cur_candidate_arr, cur_description, cd_media;

      // Common functions
      var init_content = function(name) {
        if(!(name in candidate_obj)) candidate_obj[name] = [];
      };

      // Loop on multiple candidates
      for(var j = 0; j < candidate.length; j++) {
        e                 = 0;
        cur_candidate     = candidate[j];
        cur_candidate_arr = {};

        cur_candidate_arr['component']  = self.util_stanza_get_attribute(cur_candidate, 'component')   || e++;
        cur_candidate_arr['foundation'] = self.util_stanza_get_attribute(cur_candidate, 'foundation')  || e++;
        cur_candidate_arr['generation'] = self.util_stanza_get_attribute(cur_candidate, 'generation')  || e++;
        cur_candidate_arr['id']         = self.util_stanza_get_attribute(cur_candidate, 'id')          || e++;
        cur_candidate_arr['ip']         = self.util_stanza_get_attribute(cur_candidate, 'ip')          || e++;
        cur_candidate_arr['network']    = self.util_stanza_get_attribute(cur_candidate, 'network')     || e++;
        cur_candidate_arr['port']       = self.util_stanza_get_attribute(cur_candidate, 'port')        || e++;
        cur_candidate_arr['priority']   = self.util_stanza_get_attribute(cur_candidate, 'priority')    || e++;
        cur_candidate_arr['protocol']   = self.util_stanza_get_attribute(cur_candidate, 'protocol')    || e++;
        cur_candidate_arr['rel-addr']   = self.util_stanza_get_attribute(cur_candidate, 'rel-addr');
        cur_candidate_arr['rel-port']   = self.util_stanza_get_attribute(cur_candidate, 'rel-port');
        cur_candidate_arr['type']       = self.util_stanza_get_attribute(cur_candidate, 'type')        || e++;

        if(e != 0) continue;

        // Push current candidate
        init_content(cc_name);
        (candidate_obj[cc_name]).push(cur_candidate_arr);
      }
    }

    return candidate_obj;
  };

  /**
   * Generates the current content local stanza
   */
  self._util_stanza_content_local = function(stanza, jingle) {
    var content_local = self._get_content_local();

    console.log('_util_stanza_content_local >> ALL CONTENT', content_local);

    for(cur_media in content_local) {
      var cur_content = content_local[cur_media];

      var content = jingle.appendChild(stanza.buildNode('content', { 'xmlns': NS_JINGLE }));

      self.util_stanza_set_attribute(content, 'creator', cur_content['creator']);
      self.util_stanza_set_attribute(content, 'name',    cur_content['name']);
      self.util_stanza_set_attribute(content, 'senders', cur_content['senders']);

      // Build description
      var cs_description  = cur_content['description'];
      var cs_d_attrs      = cs_description['attrs'];
      var cs_d_rtcp_fb    = cs_description['rtcp-fb'];
      var cs_d_payload    = cs_description['payload'];
      var cs_d_crypto     = cs_description['crypto'];
      var cs_d_rtp_hdrext = cs_description['rtp-hdrext'];
      var cs_d_rtcp_mux   = cs_description['rtcp-mux'];

      var description = content.appendChild(stanza.buildNode('description', { 'xmlns': NS_JINGLE_APPS_RTP }));

      self.util_stanza_set_attribute(description, cur_media);

      // Description attributes
      for(cur_description_attr in cs_d_attrs)
          self.util_stanza_set_attribute(description, cur_description_attr, cs_d_attrs[cur_description_attr]);

      // RTCP-FB (common)
      if(cs_d_rtcp_fb && cs_d_rtcp_fb.length) {
        for(l in cs_d_rtcp_fb) {
          var cs_d_rf = cs_d_rtcp_fb[l];

          var rtcp_fb_common = description.appendChild(stanza.buildNode('rtcp-fb', { 'xmlns': NS_JINGLE_APPS_RTP_RTCP_FB }));

          for(cur_rtcp_fb_common_attr in cs_d_rf)
            self.util_stanza_set_attribute(rtcp_fb_common, cur_rtcp_fb_common_attr, cs_d_rf[cur_rtcp_fb_common_attr]);
        }
      }

      // Payload-type
      if(cs_d_payload) {
        for(i in cs_d_payload) {
          var cs_d_p                 = cs_d_payload[i];
          var cs_d_p_attrs           = cs_d_p['attrs'];
          var cs_d_p_rtcp_fb         = cs_d_p['rtcp-fb'];
          var cs_d_p_rtcp_fb_trr_int = cs_d_p['rtcp-fb-trr-int'];

          var payload_type = description.appendChild(stanza.buildNode('payload-type', { 'xmlns': NS_JINGLE_APPS_RTP }));

          for(cur_payload_attr in cs_d_p_attrs)
            self.util_stanza_set_attribute(payload_type, cur_payload_attr, cs_d_p_attrs[cur_payload_attr]);

          // RTCP-FB (sub)
          if(cs_d_p_rtcp_fb && cs_d_p_rtcp_fb.length) {
            for(m in cs_d_p_rtcp_fb) {
              var cs_d_p_rf = cs_d_p_rtcp_fb[m];

              var rtcp_fb_sub = payload_type.appendChild(stanza.buildNode('rtcp-fb', { 'xmlns': NS_JINGLE_APPS_RTP_RTCP_FB }));

              for(cur_rtcp_fb_sub_attr in cs_d_p_rf)
                self.util_stanza_set_attribute(rtcp_fb_sub, cur_rtcp_fb_sub_attr, cs_d_p_rf[cur_rtcp_fb_sub_attr]);
            }
          }

          // RTCP-FB-TRR-INT
          if(cs_d_p_rtcp_fb_trr_int && cs_d_p_rtcp_fb_trr_int.length) {
            for(n in cs_d_p_rtcp_fb_trr_int) {
              var cs_d_p_rfti = cs_d_p_rtcp_fb_trr_int[n];

              var rtcp_fb_trr_int = payload_type.appendChild(stanza.buildNode('rtcp-fb-trr-int', { 'xmlns': NS_JINGLE_APPS_RTP_RTCP_FB }));

              for(cur_rtcp_fb_trr_int_attr in cs_d_p_rfti)
                self.util_stanza_set_attribute(rtcp_fb_trr_int, cur_rtcp_fb_trr_int_attr, cs_d_p_rfti[cur_rtcp_fb_trr_int_attr]);
            }
          }
        }

        // Encryption
        if(cs_d_crypto && cs_d_crypto.length) {
          var encryption = description.appendChild(stanza.buildNode('encryption', { 'xmlns': NS_JINGLE_APPS_RTP }));

          for(j in cs_d_crypto) {
            var cs_d_c = cs_d_crypto[j];

            var crypto = encryption.appendChild(stanza.buildNode('crypto', { 'xmlns': NS_JINGLE_APPS_RTP }));

            for(cur_crypto_attr in cs_d_c)
              self.util_stanza_set_attribute(crypto, cur_crypto_attr, cs_d_c[cur_crypto_attr]);
          }
        }

        // RTP-HDREXT
        if(cs_d_rtp_hdrext && cs_d_rtp_hdrext.length) {
          for(k in cs_d_rtp_hdrext) {
            var cs_d_h = cs_d_rtp_hdrext[k];

            var rtp_hdrext = description.appendChild(stanza.buildNode('rtp-hdrext', { 'xmlns': NS_JINGLE_APPS_RTP_RTP_HDREXT }));

            for(cur_rtp_hdrext_attr in cs_d_h)
              self.util_stanza_set_attribute(rtp_hdrext, cur_rtp_hdrext_attr, cs_d_h[cur_rtp_hdrext_attr]);
          }
        }

        // RTCP-MUX
        if(cs_d_rtcp_mux)
          description.appendChild(stanza.buildNode('rtcp-mux', { 'xmlns': NS_JINGLE_APPS_RTP }));
      }

      // Build transport
      var cs_transport     = cur_content['transport'];
      var cs_t_attrs       = cs_transport['attrs'];
      var cs_t_candidate   = cs_transport['candidate'];
      var cs_t_fingerprint = cs_transport['fingerprint'];

      var transport = content.appendChild(stanza.buildNode('transport', { 'xmlns': NS_JINGLE_TRANSPORTS_ICEUDP }));

      for(cur_transport_attr in cs_t_attrs)
            self.util_stanza_set_attribute(transport, cur_transport_attr, cs_t_attrs[cur_transport_attr]);

      if(cs_t_fingerprint && cs_t_fingerprint['hash'] && cs_t_fingerprint['value']) {
        var fingerprint = transport.appendChild(stanza.buildNode('fingerprint', { 'xmlns': NS_JINGLE_APPS_DTLS }, cs_t_fingerprint['value']));

        self.util_stanza_set_attribute(fingerprint, 'hash', cs_t_fingerprint['hash']);
      }

      for(m in cs_t_candidate) {
        var cs_t_c = cs_t_candidate[m];

        var candidate = transport.appendChild(stanza.buildNode('candidate', { 'xmlns': NS_JINGLE_TRANSPORTS_ICEUDP }));

        for(cur_candidate_attr in cs_t_c)
          self.util_stanza_set_attribute(candidate, cur_candidate_attr, cs_t_c[cur_candidate_attr]);
      }
    }
  };

  /**
   * Generates the content data
   * @return content data value
   * @type object
   */
  self._util_generate_content = function(creator, name, senders, payloads, transports) {
    console.log('_util_generate_content >> INPUT: creator', creator);
    console.log('_util_generate_content >> INPUT: name', name);
    console.log('_util_generate_content >> INPUT: senders', senders);
    console.log('_util_generate_content >> INPUT: payloads', payloads);
    console.log('_util_generate_content >> INPUT: transports', transports);

    // Generation process
    var content_obj = {};

    content_obj['creator']     = creator;
    content_obj['name']        = name;
    content_obj['senders']     = senders;
    content_obj['description'] = {};
    content_obj['transport']   = {};

    // Generate description
    var description_cpy      = payloads['descriptions'];
    var description_ptime    = description_cpy['attrs']['ptime'];
    var description_maxptime = description_cpy['attrs']['maxptime'];

    delete description_cpy['attrs']['ptime'];
    delete description_cpy['attrs']['maxptime'];

    for(i in description_cpy['payload']) {
      if(!('attrs' in description_cpy['payload'][i]))
        description_cpy['payload'][i]['attrs']           = {};

      description_cpy['payload'][i]['attrs']['ptime']    = description_ptime;
      description_cpy['payload'][i]['attrs']['maxptime'] = description_maxptime;
    }

    content_obj['description'] = description_cpy;

    // Generate transport
    content_obj['transport']['candidate']      = transports;
    content_obj['transport']['attrs']          = {};
    content_obj['transport']['attrs']['pwd']   = payloads['transports']['pwd'];
    content_obj['transport']['attrs']['ufrag'] = payloads['transports']['ufrag'];

    if(payloads['transports']['fingerprint'])
      content_obj['transport']['fingerprint']  = payloads['transports']['fingerprint'];

    console.log('_util_generate_content >> OUT: content_obj', content_obj);

    // Storage process
    return content_obj;
  };

  /**
   * Generates the initial local content data
   */
  self._util_initialize_content_local = function() {
    for(cur_name in self.get_name()) {
      self._set_content_local(
        cur_name,

        self._util_generate_content(
          JSJAC_JINGLE_SENDERS_INITIATOR.jingle,
          cur_name,
          self.get_senders(cur_name),
          self._get_payloads_local(cur_name),
          self._get_candidates_local(cur_name)
        )
      );
    }
  };

  /**
   * Generates the initial remote content data
   */
  self._util_initialize_content_remote = function() {
    for(cur_name in self.get_name()) {
      self._set_content_remote(
        cur_name,

        self._util_generate_content(
          self.get_creator(cur_name),
          cur_name,
          self.get_senders(cur_name),
          self._get_payloads_remote(cur_name),
          self._get_candidates_remote(cur_name)
        )
      );
    }
  };

  /**
   * Generates SDP data from payloads and candidates
   * @return SDP data
   * @type object
   */
  self.util_sdp_generate = function(type, payloads, candidates) {
    return {
      candidates  : self.util_sdp_generate_candidates(candidates),
      description : self.util_sdp_generate_description(type, payloads)
    };
  };

  /**
   * Generates SDP candidates from candidates
   * @return SDP candidates
   * @type object
   */
  self.util_sdp_generate_candidates = function(candidates) {
    var candidates_arr = [];

    // Parse candidates
    var i,
        cur_media, cur_c_media, cur_candidate, cur_label, cur_candidate_str;

    for(cur_media in candidates) {
      cur_c_media = candidates[cur_media];

      for(i in cur_c_media) {
        cur_candidate = cur_c_media[i];

        cur_label         = JSJAC_JINGLE_MEDIAS[cur_media]['label'];
        cur_candidate_str = '';

        cur_candidate_str += 'a=candidate:';
        cur_candidate_str += cur_candidate['foundation'];
        cur_candidate_str += ' ';
        cur_candidate_str += cur_candidate['component'];
        cur_candidate_str += ' ';
        cur_candidate_str += cur_candidate['protocol'];
        cur_candidate_str += ' ';
        cur_candidate_str += cur_candidate['priority'];
        cur_candidate_str += ' ';
        cur_candidate_str += cur_candidate['ip'];
        cur_candidate_str += ' ';
        cur_candidate_str += cur_candidate['port'];
        cur_candidate_str += ' ';
        cur_candidate_str += 'typ';
        cur_candidate_str += ' ';
        cur_candidate_str += cur_candidate['type'];

        if(cur_candidate['rel-addr'] && cur_candidate['rel-port']) {
          cur_candidate_str += ' ';
          cur_candidate_str += 'raddr';
          cur_candidate_str += ' ';
          cur_candidate_str += cur_candidate['rel-addr'];
          cur_candidate_str += ' ';
          cur_candidate_str += 'rport';
          cur_candidate_str += ' ';
          cur_candidate_str += cur_candidate['rel-port'];
        }

        if(cur_candidate['generation']) {
          cur_candidate_str += ' ';
          cur_candidate_str += 'generation';
          cur_candidate_str += ' ';
          cur_candidate_str += cur_candidate['generation'];
        }

        cur_candidate_str   += WEBRTC_SDP_LINE_BREAK;

        candidates_arr.push({
          label     : cur_label,
          id        : cur_media,
          candidate : cur_candidate_str
        });
      }
    }

    return candidates_arr;
  };

  /**
   * Generates SDP payloads from payloads
   * @return SDP payloads
   * @type string
   */
  self.util_sdp_generate_description = function(type, payloads) {
    var payloads_obj = {};
    var payloads_str = '';

    // Common vars
    var i, j, k, l, m, n,
        media, pwd, ufrag,
        cur_media, cur_media_obj,
        cur_attrs, cur_rtcp_fb, cur_crypto,
        cur_rtcp_fb_obj,
        cur_payload, cur_payload_obj, cur_payload_obj_attrs, cur_payload_obj_id,
        cur_payload_obj_rtcp_fb, cur_payload_obj_rtcp_fb_obj,
        cur_payload_obj_rtcp_fb_ttr_int, cur_payload_obj_rtcp_fb_ttr_int_obj,
        cur_crypto, cur_crypto_obj,
        cur_rtp_hdrext, cur_rtp_hdrext_obj,
        cur_rtcp_mux;

    // Read initial data
    pwd         = payloads['pwd'];
    ufrag       = payloads['ufrag'];
    fingerprint = payloads['fingerprint'];

    // Payloads headers
    payloads_str += 'v=0';
    payloads_str += WEBRTC_SDP_LINE_BREAK;
    payloads_str += 'o=- 952338584 2 IN IP4 127.0.0.1'; // TODO: no hardcoding!
    payloads_str += WEBRTC_SDP_LINE_BREAK;
    payloads_str += 's=-';
    payloads_str += WEBRTC_SDP_LINE_BREAK;
    payloads_str += 't=0 0';
    payloads_str += WEBRTC_SDP_LINE_BREAK;

    // Add bundle line
    payloads_str += 'a=group:BUNDLE ' + Object.keys(payloads).join(' ');
    payloads_str += WEBRTC_SDP_LINE_BREAK;

    // Add media groups
    for(cur_media in payloads) {
      cur_media_obj  = payloads[cur_media];

      cur_attrs      = cur_media_obj['attrs'];
      cur_rtcp_fb    = cur_media_obj['rtcp-fb'];
      cur_payload    = cur_media_obj['payload'];
      cur_crypto     = cur_media_obj['crypto'];
      cur_rtp_hdrext = cur_media_obj['rtp-hdrext'];
      cur_rtcp_mux   = cur_media_obj['rtcp-mux'];

      // Current media
      payloads_str += self.util_sdp_generate_description_media(cur_media, cur_crypto, fingerprint, cur_payload);
      payloads_str += WEBRTC_SDP_LINE_BREAK;

      payloads_str += 'c=IN IP4 0.0.0.0';
      payloads_str += WEBRTC_SDP_LINE_BREAK;
      payloads_str += 'a=rtcp:1 IN IP4 0.0.0.0';
      payloads_str += WEBRTC_SDP_LINE_BREAK;

      if(ufrag)  payloads_str += 'a=ice-ufrag:' + ufrag + WEBRTC_SDP_LINE_BREAK;
      if(pwd)    payloads_str += 'a=ice-pwd:' + pwd + WEBRTC_SDP_LINE_BREAK;

      // TODO: really needed?!
      // payloads_str += 'a=ice-options:google-ice';
      // payloads_str += WEBRTC_SDP_LINE_BREAK;

      if(fingerprint && fingerprint['hash'] && fingerprint['value']) {
        payloads_str += 'a=fingerprint:' + fingerprint['hash'] + ' ' + fingerprint['value'];
        payloads_str += WEBRTC_SDP_LINE_BREAK;
      }

      // RTP-HDREXT
      if(cur_rtp_hdrext && cur_rtp_hdrext.length) {
        for(i in cur_rtp_hdrext) {
          cur_rtp_hdrext_obj = cur_rtp_hdrext[i];

          payloads_str += 'a=extmap:' + cur_rtp_hdrext_obj['id'];

          if(cur_rtp_hdrext_obj['senders'])
            payloads_str += '/' + cur_rtp_hdrext_obj['senders'];

          payloads_str += ' ' + cur_rtp_hdrext_obj['uri'];
          payloads_str += WEBRTC_SDP_LINE_BREAK;
        }
      }

      // Senders
      payloads_str += 'a=' + JSJAC_JINGLE_SENDERS[self.get_senders()];
      payloads_str += WEBRTC_SDP_LINE_BREAK;

      // Name
      payloads_str += 'a=mid:' + self.get_name();
      payloads_str += WEBRTC_SDP_LINE_BREAK;

      // RTCP-MUX
      // WARNING: no spec!
      // See: http://code.google.com/p/libjingle/issues/detail?id=309
      //      http://mail.jabber.org/pipermail/jingle/2011-December/001761.html
      if(cur_rtcp_mux) {
        payloads_str += 'a=rtcp-mux';
        payloads_str += WEBRTC_SDP_LINE_BREAK;
      }

      // 'encryption'
      for(j in cur_crypto) {
        cur_crypto_obj = cur_crypto[j];

        payloads_str += 'a=crypto:'                     + 
                        cur_crypto_obj['tag']           + ' ' + 
                        cur_crypto_obj['crypto-suite']  + ' ' + 
                        cur_crypto_obj['key-params']    + 
                        (cur_crypto_obj['session-params'] ? (' ' + cur_crypto_obj['session-params']) : '');

        payloads_str += WEBRTC_SDP_LINE_BREAK;
      }

      // 'rtcp-fb' (common)
      for(n in cur_rtcp_fb) {
        cur_rtcp_fb_obj = cur_rtcp_fb[n];

        payloads_str += 'a=rtcp-fb:*';
        payloads_str += ' ' + cur_rtcp_fb_obj['type'];

        if(cur_rtcp_fb_obj['subtype'])
          payloads_str += ' ' + cur_rtcp_fb_obj['subtype'];

        payloads_str += WEBRTC_SDP_LINE_BREAK;
      }

      // 'payload-type'
      for(k in cur_payload) {
        cur_payload_obj                 = cur_payload[k];
        cur_payload_obj_attrs           = cur_payload_obj['attrs'];
        cur_payload_obj_rtcp_fb         = cur_payload_obj['rtcp-fb'];
        cur_payload_obj_rtcp_fb_ttr_int = cur_payload_obj['rtcp-fb-trr-int'];

        cur_payload_obj_id              = cur_payload_obj_attrs['id'];

        payloads_str += 'a=rtpmap:' + cur_payload_obj_id;

        // 'rtpmap'
        if(cur_payload_obj_attrs['name']) {
          payloads_str += ' ' + cur_payload_obj_attrs['name'];

          if(cur_payload_obj_attrs['clockrate']) {
            payloads_str += '/' + cur_payload_obj_attrs['clockrate'];

            if(cur_payload_obj_attrs['channels'])
              payloads_str += '/' + cur_payload_obj_attrs['channels'];
          }
        }

        payloads_str += WEBRTC_SDP_LINE_BREAK;

        // 'rtcp-fb' (sub)
        for(l in cur_payload_obj_rtcp_fb) {
          cur_payload_obj_rtcp_fb_obj = cur_payload_obj_rtcp_fb[l];

          payloads_str += 'a=rtcp-fb:' + cur_payload_obj_id;
          payloads_str += ' ' + cur_payload_obj_rtcp_fb_obj['type'];

          if(cur_payload_obj_rtcp_fb_obj['subtype'])
            payloads_str += ' ' + cur_payload_obj_rtcp_fb_obj['subtype'];

          payloads_str += WEBRTC_SDP_LINE_BREAK;
        }

        // 'rtcp-fb-ttr-int' (sub)
        for(m in cur_payload_obj_rtcp_fb_ttr_int) {
          cur_payload_obj_rtcp_fb_ttr_int_obj = cur_payload_obj_rtcp_fb_ttr_int[m];

          payloads_str += 'a=rtcp-fb:' + cur_payload_obj_id;
          payloads_str += ' ' + 'trr-int';
          payloads_str += ' ' + cur_payload_obj_rtcp_fb_ttr_int_obj['value'];
          payloads_str += WEBRTC_SDP_LINE_BREAK;
        }
      }

      if(cur_attrs['ptime'])     payloads_str += 'a=ptime:'    + cur_attrs['ptime'] + WEBRTC_SDP_LINE_BREAK;
      if(cur_attrs['maxptime'])  payloads_str += 'a=maxptime:' + cur_attrs['maxptime'] + WEBRTC_SDP_LINE_BREAK;
    }

    // Push to object
    payloads_obj.type = type;
    payloads_obj.sdp  = payloads_str;

    return payloads_obj;
  };

  /**
   * Generates SDP media line from payloads
   * @return SDP media line
   * @type string
   */
  self.util_sdp_generate_description_media = function(media, crypto, fingerprint, payload) {
    var i;
    var type_ids = [];
    var sdp_media = 'm=' + media + ' 1 ';

    // Protocol
    if((crypto && crypto.length) || (fingerprint && fingerprint['hash'] && fingerprint['value']))
      sdp_media += 'RTP/SAVPF';
    else
      sdp_media += 'RTP/AVPF';

    // Payload type IDs
    for(i in payload) type_ids.push(payload[i]['attrs']['id']);

    sdp_media += ' ' + type_ids.join(' ');

    return sdp_media;
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
   * Returns our negotiation status
   * @return Negotiation status
   * @type string
   */
  self.util_negotiation_status = function() {
    return (self.get_initiator() == self.util_connection_jid()) ? JSJAC_JINGLE_SENDERS_INITIATOR.jingle : JSJAC_JINGLE_SENDERS_RESPONDER.jingle;
  };

  /**
   * Get my connection JID
   * @return JID value
   * @type string
   */
  self.util_connection_jid = function() {
    return JSJAC_JINGLE_STORE_CONNECTION.username + '@' + 
           JSJAC_JINGLE_STORE_CONNECTION.domain   + '/' + 
           JSJAC_JINGLE_STORE_CONNECTION.resource;
  };

  /**
   * Attaches a stream source
   */
  self.util_peer_stream_attach = function(element, stream, mute) {
    if(navigator.mozGetUserMedia)
      element.play();
    else
      element.autoplay = true;

    if(typeof mute == 'boolean') element.muted = mute;
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
    var cur_media = null;

    var e,
        cur_line, cur_rtpmap, cur_rtcp_fb, cur_rtcp_fb_trr_int,
        cur_crypto, cur_fingerprint, cur_extmap,
        cur_rtpmap_id, cur_rtcp_fb_id,
        m_rtpmap, m_rtcp_fb, m_rtcp_fb_trr_int, m_crypto, m_fingerprint, m_pwd, m_ufrag, m_ptime, m_maxptime, m_media;

    // Common functions
    var init_content = function(name) {
      if(!(name in payload))  payload[name] = {};
    };

    var init_descriptions = function(name, sub, sub_default) {
      init_content(name);

      if(!('descriptions' in payload[name]))        payload[name]['descriptions']      = {};
      if(!(sub  in payload[name]['descriptions']))  payload[name]['descriptions'][sub] = sub_default;
    };

    var init_transports = function(name, sub, sub_default) {
      init_content(name);

      if(!('transports' in payload[name]))        payload[name]['transports']      = {};
      if(!(sub  in payload[name]['transports']))  payload[name]['transports'][sub] = sub_default;
    };

    var init_payload = function(name, id) {
      init_descriptions(name, 'payload', {});

      if(!(id in payload[name]['descriptions']['payload'])) {
        payload[name]['descriptions']['payload'][id] = {
          'attrs'           : {},
          'rtcp-fb'         : [],
          'rtcp-fb-trr-int' : []
        };
      }
    };

    for(i in lines) {
      var cur_line = lines[i];

      m_media = (R_WEBRTC_SDP_ICE_PAYLOAD.media).exec(cur_line);

      // 'audio/video' line?
      if(m_media) {
        cur_media = m_media[1]; continue;
      }

      m_rtpmap = (R_WEBRTC_SDP_ICE_PAYLOAD.rtpmap).exec(cur_line);

      // 'rtpmap' line?
      if(m_rtpmap) {
        // Populate current object
        e = 0;
        cur_rtpmap = {};

        cur_rtpmap['channels']  = m_rtpmap[6];
        cur_rtpmap['clockrate'] = m_rtpmap[4];
        cur_rtpmap['id']        = m_rtpmap[1] || e++;
        cur_rtpmap['name']      = m_rtpmap[3];

        // Incomplete?
        if(e != 0) continue;

        cur_rtpmap_id = cur_rtpmap['id'];

        // Push it to parent array
        init_payload(cur_media, cur_rtpmap_id);

        payload[cur_media]['descriptions']['payload'][cur_rtpmap_id]['attrs'] = cur_rtpmap;

        continue;
      }

      m_rtcp_fb = (R_WEBRTC_SDP_ICE_PAYLOAD.rtcp_fb).exec(cur_line);

      // 'rtcp-fb' line?
      if(m_rtcp_fb) {
        // Populate current object
        e = 0;
        cur_rtcp_fb = {};

        cur_rtcp_fb['id']      = m_rtcp_fb[1] || e++;
        cur_rtcp_fb['type']    = m_rtcp_fb[2];
        cur_rtcp_fb['subtype'] = m_rtcp_fb[4];

        // Incomplete?
        if(e != 0) continue;

        cur_rtcp_fb_id = cur_rtcp_fb['id'];

        // Push it to parent array
        if(cur_rtcp_fb_id == '*') {
          init_descriptions(cur_media, 'rtcp-fb', []);

          (payload[cur_media]['descriptions']['rtcp-fb']).push(cur_rtcp_fb);
        } else {
          init_payload(cur_media, cur_rtcp_fb_id);

          (payload[cur_media]['descriptions']['payload'][cur_rtcp_fb_id]['rtcp-fb']).push(cur_rtcp_fb);
        }

        continue;
      }

      m_rtcp_fb_trr_int = (R_WEBRTC_SDP_ICE_PAYLOAD.rtcp_fb_trr_int).exec(cur_line);

      // 'rtcp-fb-trr-int' line?
      if(m_rtcp_fb_trr_int) {
        // Populate current object
        e = 0;
        cur_rtcp_fb_trr_int = {};

        cur_rtcp_fb_trr_int['id']      = m_rtcp_fb_trr_int[1] || e++;
        cur_rtcp_fb_trr_int['value']   = m_rtcp_fb_trr_int[2] || e++;

        // Incomplete?
        if(e != 0) continue;

        cur_rtcp_fb_trr_int_id = cur_rtcp_fb_trr_int['id'];

        // Push it to parent array
        init_payload(cur_media, cur_rtcp_fb_trr_int_id);

        (payload[cur_media]['descriptions']['payload'][cur_rtcp_fb_trr_int_id]['rtcp-fb-trr-int']).push(cur_rtcp_fb_trr_int);

        continue;
      }

      m_crypto = (R_WEBRTC_SDP_ICE_PAYLOAD.crypto).exec(cur_line);

      // 'crypto' line?
      if(m_crypto) {
        // Populate current object
        e = 0;
        cur_crypto = {};

        cur_crypto['crypto-suite']   = m_crypto[2]  || e++;
        cur_crypto['key-params']     = m_crypto[3]  || e++;
        cur_crypto['session-params'] = m_crypto[5];
        cur_crypto['tag']            = m_crypto[1]  || e++;

        console.log('CRYPTO-REGEX', m_crypto);

        // Incomplete?
        if(e != 0) continue;

        // Push it to parent array
        init_descriptions(cur_media, 'crypto', []);

        (payload[cur_media]['descriptions']['crypto']).push(cur_crypto);

        continue;
      }

      m_ptime = (R_WEBRTC_SDP_ICE_PAYLOAD.ptime).exec(cur_line);

      // 'ptime' line?
      if(m_ptime) {
        // Push it to parent array
        init_descriptions(cur_media, 'attrs', {});

        payload[cur_media]['descriptions']['attrs']['ptime'] = m_ptime[1];

        continue;
      }

      m_maxptime = (R_WEBRTC_SDP_ICE_PAYLOAD.maxptime).exec(cur_line);

      // 'maxptime' line?
      if(m_maxptime) {
        // Push it to parent array
        init_descriptions(cur_media, 'attrs', {});

        payload[cur_media]['descriptions']['attrs']['maxptime'] = m_maxptime[1];

        continue;
      }

      m_ssrc = (R_WEBRTC_SDP_ICE_PAYLOAD.ssrc).exec(cur_line);

      // 'ssrc' line?
      if(m_ssrc) {
        // Push it to parent array
        init_descriptions(cur_media, 'attrs', {});

        payload[cur_media]['descriptions']['attrs']['ssrc'] = m_ssrc[1];

        continue;
      }

      m_rtcp_mux = (R_WEBRTC_SDP_ICE_PAYLOAD.rtcp_mux).exec(cur_line);

      // 'rtcp-mux' line?
      if(m_rtcp_mux) {
        // Push it to parent array
        init_descriptions(cur_media, 'rtcp-mux', 1);

        continue;
      }

      m_extmap = (R_WEBRTC_SDP_ICE_PAYLOAD.extmap).exec(cur_line);

      // 'extmap' line?
      if(m_extmap) {
        // Populate current object
        e = 0;
        cur_extmap = {};

        cur_extmap['id']      = m_extmap[1]  || e++;
        cur_extmap['uri']     = m_extmap[4]  || e++;
        cur_extmap['senders'] = m_extmap[3];

        // Incomplete?
        if(e != 0) continue;

        // Push it to parent array
        init_descriptions(cur_media, 'rtp-hdrext', []);

        (payload[cur_media]['descriptions']['rtp-hdrext']).push(cur_extmap);

        continue;
      }

      m_fingerprint = (R_WEBRTC_SDP_ICE_PAYLOAD.fingerprint).exec(cur_line);

      // 'fingerprint' line?
      if(m_fingerprint) {
        // Populate current object
        e = 0;
        cur_fingerprint = {};

        cur_fingerprint['hash']  = m_fingerprint[1]  || e++;
        cur_fingerprint['value'] = m_fingerprint[2]  || e++;

        // Incomplete?
        if(e != 0) continue;

        // Push it to parent array
        init_transports(cur_media, 'fingerprint', cur_fingerprint);

        continue;
      }

      m_pwd = (R_WEBRTC_SDP_ICE_PAYLOAD.pwd).exec(cur_line);

      // 'pwd' line?
      if(m_pwd) {
        init_transports(cur_media, 'pwd', m_pwd[1]); continue;
      }

      m_ufrag = (R_WEBRTC_SDP_ICE_PAYLOAD.ufrag).exec(cur_line);

      // 'ufrag' line?
      if(m_ufrag) {
        init_transports(cur_media, 'ufrag', m_ufrag[1]); continue;
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
        if (!e) return;

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

      // Add local stream
      self._get_peer_connection().addStream(self._get_local_stream()); 

      // Create offer
      if(self.is_initiator()) {
        // Local description
        self._get_peer_connection().createOffer(self._peer_got_description,  null, WEBRTC_CONFIGURATION.create_offer);

        // Then, wait for responder to send back its remote description
      } else {
        // Apply SDP data
        accept_sdp = self.util_sdp_generate(
          WEBRTC_SDP_TYPE_OFFER,
          self._get_payloads_remote(),
          self._get_candidates_remote()
        );

        // Remote description
        self._get_peer_connection().setRemoteDescription(
          new WEBRTC_SESSION_DESCRIPTION(accept_sdp.description)
        );

        // Local description
        self._get_peer_connection().createAnswer(self._peer_got_description, null, WEBRTC_CONFIGURATION.create_answer);

        // ICE candidates
        var cur_candidate_obj;

        for(i in accept_sdp.candidates) {
          cur_candidate_obj = (accept_sdp.candidates)[i];

          self._get_peer_connection().addIceCandidate(
            new WEBRTC_ICE_CANDIDATE({
              sdpMLineIndex : cur_candidate_obj.label,
              sdpMid        : cur_candidate_obj.id,
              candidate     : cur_candidate_obj.candidate
            })
          );
        }
      }

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
        self._peer_got_user_media_success.bind(this, callback),
        self._peer_got_user_media_error.bind(this)
      );
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_get_user_media > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._peer_got_user_media_success = function(callback, stream) {
    try {
      self.get_debug().log('[JSJaCJingle] _peer_got_user_media_success > Got user media.', 4);

      self._set_local_stream(stream);

      if(callback) callback();
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_got_user_media_success > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._peer_got_user_media_error = function(error) {
    if(self.is_responder())
      self.terminate(JSJAC_JINGLE_REASON_MEDIA_ERROR);

    self.handle_session_initiate_error();
    (self._get_session_initiate_error())(self);

    self.get_debug().log('[JSJaCJingle] _peer_got_user_media_error > Failed.', 1);
  };

  /**
   * @private
   */
  self._peer_got_description = function(session_description) {
    try {
      self.get_debug().log('[JSJaCJingle] _peer_got_description > Got local description.', 4);

      self._get_peer_connection().setLocalDescription(session_description);

      self.get_debug().log('[JSJaCJingle] _peer_got_description > Waiting for local candidates...', 4);

      // Convert SDP raw data to an object
      var payload_parsed = self.util_sdp_parse_payload(session_description.sdp);

      for(c in payload_parsed)
        self._set_payloads_local(c, payload_parsed[c]);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _peer_got_description > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._peer_stop = function() {
    // Detach media streams from DOM view
    self._set_local_stream(null);
    self._set_remote_stream(null);

    // Close the media stream
    if(self._get_peer_connection())
      self._get_peer_connection().close();

    // Remove this session from router
    JSJaCJingle_remove(self.get_sid());
  };
}



/**
 * Listens for Jingle events
 */
function JSJaCJingle_listen(args) {
  // WebRTC not supported?
  if(!JSJAC_JINGLE_AVAILABLE) return;

  if(args && args.connection)
    JSJAC_JINGLE_STORE_CONNECTION = args.connection;

  if(args && args.initiate)
    JSJAC_JINGLE_STORE_INITIATE = args.initiate;

  // Incoming IQs handler
  JSJAC_JINGLE_STORE_CONNECTION.registerHandler('iq', JSJaCJingle_route);
}

/**
 * Routes Jingle stanzas
 */
function JSJaCJingle_route(stanza) {
  // WebRTC not supported?
  if(!JSJAC_JINGLE_AVAILABLE) return;

  // Route the incoming stanza
  var jingle = stanza.getChild('jingle', NS_JINGLE);

  if(!jingle) return;

  var sid = jingle.getAttribute('sid');
  var action = jingle.getAttribute('action');

  // Don't handle action-less Jingle stanzas there...
  if(!action) return;

  // New session? Or registered one?
  if(action == JSJAC_JINGLE_ACTION_SESSION_INITIATE && JSJaCJingle_read(sid) == null) {
    JSJAC_JINGLE_STORE_INITIATE(stanza);
  } else {
    // Pass to session handler
    var session_route = JSJaCJingle_read(sid);

    if(session_route != null)
      session_route.handle(stanza);
  }
}

/**
 * Adds a new Jingle session
 */
function JSJaCJingle_add(sid, obj) {
  // WebRTC not supported?
  if(!JSJAC_JINGLE_AVAILABLE) return;

  JSJAC_JINGLE_STORE_SESSIONS[sid] = obj;
}

/**
 * Reads a new Jingle session
 * @return Session
 * @type object
 */
function JSJaCJingle_read(sid) {
  // WebRTC not supported?
  if(!JSJAC_JINGLE_AVAILABLE) return {};

  return (sid in JSJAC_JINGLE_STORE_SESSIONS) ? JSJAC_JINGLE_STORE_SESSIONS[sid] : null;
}

/**
 * Removes a new Jingle session
 */
function JSJaCJingle_remove(sid) {
  // WebRTC not supported?
  if(!JSJAC_JINGLE_AVAILABLE)
    return;

  delete JSJAC_JINGLE_STORE_SESSIONS[sid];
}

/**
 * Maps the Jingle disco features
 * @return Feature namespaces
 * @type array
 */
function JSJaCJingle_disco() {
  // WebRTC not supported?
  if(!JSJAC_JINGLE_AVAILABLE) return [];

  return MAP_DISCO_JINGLE;
}