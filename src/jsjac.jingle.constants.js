/**
 * @fileoverview JSJaC Jingle library - Constants map
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/**
 * JINGLE WEBRTC
 */

var WEBRTC_GET_MEDIA           = ( navigator.webkitGetUserMedia     ||
                                   navigator.mozGetUserMedia        ||
                                   navigator.msGetUserMedia         ||
                                   navigator.getUserMedia           );

var WEBRTC_PEER_CONNECTION     = ( window.webkitRTCPeerConnection   ||
                                   window.mozRTCPeerConnection      ||
                                   window.RTCPeerConnection         );

var WEBRTC_SESSION_DESCRIPTION = ( window.mozRTCSessionDescription  ||
                                   window.RTCSessionDescription     );

var WEBRTC_ICE_CANDIDATE       = ( window.mozRTCIceCandidate        ||
                                   window.RTCIceCandidate           );

var WEBRTC_CONFIGURATION = {
  peer_connection : {
    config        : {
      iceServers : [{
        url: 'stun:stun.jappix.com'
      }]
    },

    constraints   : {
      optional : [{
        'DtlsSrtpKeyAgreement': true
      }]
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

var R_WEBRTC_SDP_CANDIDATE     = /^a=candidate:(\w{1,32}) (\d{1,5}) (udp|tcp) (\d{1,10}) ([a-zA-Z0-9:\.]{1,45}) (\d{1,5}) (typ) (host|srflx|prflx|relay)( (raddr) ([a-zA-Z0-9:\.]{1,45}) (rport) (\d{1,5}))?( (generation) (\d))?/i;

var R_WEBRTC_SDP_ICE_PAYLOAD   = {
  rtpmap          : /^a=rtpmap:(\d+) (([^\s\/]+)\/(\d+)(\/([^\s\/]+))?)?/i,
  fmtp            : /^a=fmtp:(\d+) (.+)/i,
  group           : /^a=group:(\S+) (.+)/,
  rtcp_fb         : /^a=rtcp-fb:(\S+) (\S+)( (\S+))?/i,
  rtcp_fb_trr_int : /^a=rtcp-fb:(\d+) trr-int (\d+)/i,
  pwd             : /^a=ice-pwd:(\S+)/i,
  ufrag           : /^a=ice-ufrag:(\S+)/i,
  ptime           : /^a=ptime:(\d+)/i,
  maxptime        : /^a=maxptime:(\d+)/i,
  ssrc            : /^a=ssrc:(\d+) (\w+)(:(.+))?/i,
  ssrc_group      : /^a=ssrc-group:(\S+) ([\d ]+)/i,
  rtcp_mux        : /^a=rtcp-mux/i,
  crypto          : /^a=crypto:(\d{1,9}) (\S+) (\S+)( (\S+))?/i,
  zrtp_hash       : /^a=zrtp-hash:(\S+) (\S+)/i,
  fingerprint     : /^a=fingerprint:(\S+) (\S+)/i,
  setup           : /^a=setup:(\S+)/i,
  extmap          : /^a=extmap:([^\s\/]+)(\/([^\s\/]+))? (\S+)/i,
  bandwidth       : /^b=(\w+):(\d+)/i,
  media           : /^m=(audio|video|application|data) /i
};

var R_NETWORK_PROTOCOLS        = {
  stun: /^stun:/i
};

var R_NETWORK_IP               = {
  all: {
    v4: /((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])/,
    v6: /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i
  },

  lan: {
    v4: /(^127\.0\.0\.1)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^192\.168\.)/,
    v6: /((::1)|(^fe80::))(.+)?/i
  }
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
var NS_JINGLE_APPS_RTP_ZRTP                         = 'urn:xmpp:jingle:apps:rtp:zrtp:1';
var NS_JINGLE_APPS_RTP_SSMA                         = 'urn:xmpp:jingle:apps:rtp:ssma:0';
var NS_JINGLE_APPS_STUB                             = 'urn:xmpp:jingle:apps:stub:0';
var NS_JINGLE_APPS_DTLS                             = 'urn:xmpp:tmp:jingle:apps:dtls:0';
var NS_JINGLE_APPS_GROUPING                         = 'urn:xmpp:jingle:apps:grouping:0';

var NS_JINGLE_TRANSPORTS_RAWUDP                     = 'urn:xmpp:jingle:transports:raw-udp:1';
var NS_JINGLE_TRANSPORTS_ICEUDP                     = 'urn:xmpp:jingle:transports:ice-udp:1';
var NS_JINGLE_TRANSPORTS_STUB                       = 'urn:xmpp:jingle:transports:stub:0';

var NS_JINGLE_SECURITY_STUB                         = 'urn:xmpp:jingle:security:stub:0';

var NS_JABBER_JINGLENODES                           = 'http://jabber.org/protocol/jinglenodes';
var NS_JABBER_JINGLENODES_CHANNEL                   = 'http://jabber.org/protocol/jinglenodes#channel';
var NS_TELEPATHY_MUJI                               = 'http://telepathy.freedesktop.org/muji';

var NS_EXTDISCO                                     = 'urn:xmpp:extdisco:1';

var NS_IETF_RFC_3264                                = 'urn:ietf:rfc:3264';
var NS_IETF_RFC_5576                                = 'urn:ietf:rfc:5576';
var NS_IETF_RFC_5888                                = 'urn:ietf:rfc:5888';

var R_NS_JINGLE_APP                                 = /^urn:xmpp:jingle:app:(\w+)(:(\w+))?(:(\d+))?$/;
var R_NS_JINGLE_TRANSPORT                           = /^urn:xmpp:jingle:transport:(\w+)$/;

var MAP_DISCO_JINGLE                                = [
  /* http://xmpp.org/extensions/xep-0166.html#support */
  /* http://xmpp.org/extensions/xep-0167.html#support */
  NS_JINGLE,
  NS_JINGLE_APPS_RTP,
  NS_JINGLE_APPS_RTP_AUDIO,
  NS_JINGLE_APPS_RTP_VIDEO,

  /* http://xmpp.org/extensions/xep-0177.html */
  NS_JINGLE_TRANSPORTS_RAWUDP,

  /* http://xmpp.org/extensions/xep-0176.html#support */
  NS_JINGLE_TRANSPORTS_ICEUDP,
  NS_IETF_RFC_3264,

  /* http://xmpp.org/extensions/xep-0339.html#disco */
  NS_IETF_RFC_5576,

  /* http://xmpp.org/extensions/xep-0338.html#disco */
  NS_IETF_RFC_5888,

  /* http://xmpp.org/extensions/xep-0293.html#determining-support */
  NS_JINGLE_APPS_RTP_RTCP_FB,

  /* http://xmpp.org/extensions/xep-0294.html#determining-support */
  NS_JINGLE_APPS_RTP_RTP_HDREXT,

  /* http://xmpp.org/extensions/xep-0320.html#disco */
  NS_JINGLE_APPS_DTLS,

  /* http://xmpp.org/extensions/xep-0262.html */
  NS_JINGLE_APPS_RTP_ZRTP,

  /* http://xmpp.org/extensions/xep-0272.html */
  NS_TELEPATHY_MUJI,

  /* http://xmpp.org/extensions/xep-0278.html */
  NS_JABBER_JINGLENODES,

  /* http://xmpp.org/extensions/xep-0215.html */
  NS_EXTDISCO
];



/**
 * JSJAC JINGLE CONSTANTS
 */

var JSJAC_JINGLE_AVAILABLE                           = WEBRTC_GET_MEDIA ? true : false;

var JSJAC_JINGLE_SESSION_SINGLE                      = 'single';
var JSJAC_JINGLE_SESSION_MUJI                        = 'muji';

var JSJAC_JINGLE_PRESENCE_TYPE_AVAILABLE             = 'available';
var JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE           = 'unavailable';

var JSJAC_JINGLE_PEER_TIMEOUT_DEFAULT                = 15;
var JSJAC_JINGLE_PEER_TIMEOUT_DISCONNECT             = 5;
var JSJAC_JINGLE_STANZA_TIMEOUT                      = 10;
var JSJAC_JINGLE_STANZA_ID_PRE                       = 'jj';

var JSJAC_JINGLE_NETWORK                             = '0';
var JSJAC_JINGLE_GENERATION                          = '0';

var JSJAC_JINGLE_BROWSER_FIREFOX                     = 'Firefox';
var JSJAC_JINGLE_BROWSER_CHROME                      = 'Chrome';
var JSJAC_JINGLE_BROWSER_SAFARI                      = 'Safari';
var JSJAC_JINGLE_BROWSER_OPERA                       = 'Opera';
var JSJAC_JINGLE_BROWSER_IE                          = 'IE';

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

var JSJAC_JINGLE_ERROR_OUT_OF_ORDER                  = { jingle: 'out-of-order',           xmpp: 'unexpected-request',         type: 'wait'   };
var JSJAC_JINGLE_ERROR_TIE_BREAK                     = { jingle: 'tie-break',              xmpp: 'conflict',                   type: 'cancel' };
var JSJAC_JINGLE_ERROR_UNKNOWN_SESSION               = { jingle: 'unknown-session',        xmpp: 'item-not-found',             type: 'cancel' };
var JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO              = { jingle: 'unsupported-info',       xmpp: 'feature-not-implemented',    type: 'modify' };
var JSJAC_JINGLE_ERROR_SECURITY_REQUIRED             = { jingle: 'security-required',      xmpp: 'not-acceptable',             type: 'cancel' };

var XMPP_ERROR_UNEXPECTED_REQUEST                    = { xmpp: 'unexpected-request',       type: 'wait' };
var XMPP_ERROR_CONFLICT                              = { xmpp: 'conflict',                 type: 'cancel' };
var XMPP_ERROR_ITEM_NOT_FOUND                        = { xmpp: 'item-not-found',           type: 'cancel' };
var XMPP_ERROR_NOT_ACCEPTABLE                        = { xmpp: 'not-acceptable',           type: 'modify' };
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

var JSJAC_JINGLE_VIDEO_SOURCE_CAMERA                 = 'camera';
var JSJAC_JINGLE_VIDEO_SOURCE_SCREEN                 = 'screen';

var JSJAC_JINGLE_STANZA_TYPE_ALL                     = 'all';
var JSJAC_JINGLE_STANZA_TYPE_RESULT                  = 'result';
var JSJAC_JINGLE_STANZA_TYPE_SET                     = 'set';
var JSJAC_JINGLE_STANZA_TYPE_GET                     = 'get';

var JSJAC_JINGLE_SDP_CANDIDATE_TYPE_HOST             = 'host';
var JSJAC_JINGLE_SDP_CANDIDATE_TYPE_SRFLX            = 'srflx';
var JSJAC_JINGLE_SDP_CANDIDATE_TYPE_PRFLX            = 'prflx';
var JSJAC_JINGLE_SDP_CANDIDATE_TYPE_RELAY            = 'relay';

var JSJAC_JINGLE_SDP_CANDIDATE_METHOD_ICE            = 'ice';
var JSJAC_JINGLE_SDP_CANDIDATE_METHOD_RAW            = 'raw';

var JSJAC_JINGLE_SDP_CANDIDATE_MAP_ICEUDP            = [
  { n: 'component',  r: 1 },
  { n: 'foundation', r: 1 },
  { n: 'generation', r: 1 },
  { n: 'id',         r: 1 },
  { n: 'ip',         r: 1 },
  { n: 'network',    r: 1 },
  { n: 'port',       r: 1 },
  { n: 'priority',   r: 1 },
  { n: 'protocol',   r: 1 },
  { n: 'rel-addr',   r: 0 },
  { n: 'rel-port',   r: 0 },
  { n: 'type',       r: 1 }
];
var JSJAC_JINGLE_SDP_CANDIDATE_MAP_RAWUDP            = [
  { n: 'component',  r: 1 },
  { n: 'generation', r: 1 },
  { n: 'id',         r: 1 },
  { n: 'ip',         r: 1 },
  { n: 'port',       r: 1 },
  { n: 'type',       r: 1 }
];

var JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_LOCAL           = 'IN';
var JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_REMOTE          = 'IN';
var JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_V4          = 'IP4';
var JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_V6          = 'IP6';
var JSJAC_JINGLE_SDP_CANDIDATE_PROTOCOL_TCP          = 'tcp';
var JSJAC_JINGLE_SDP_CANDIDATE_PROTOCOL_UDP          = 'udp';

var JSJAC_JINGLE_SDP_CANDIDATE_IP_V4                 = '0.0.0.0';
var JSJAC_JINGLE_SDP_CANDIDATE_IP_V6                 = '::';

var JSJAC_JINGLE_SDP_CANDIDATE_IP_DEFAULT            = JSJAC_JINGLE_SDP_CANDIDATE_IP_V4;
var JSJAC_JINGLE_SDP_CANDIDATE_PORT_DEFAULT          = '1';
var JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_DEFAULT         = JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_REMOTE;
var JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_DEFAULT     = JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_V4;
var JSJAC_JINGLE_SDP_CANDIDATE_PROTOCOL_DEFAULT      = JSJAC_JINGLE_SDP_CANDIDATE_PROTOCOL_UDP;
var JSJAC_JINGLE_SDP_CANDIDATE_PRIORITY_DEFAULT      = '1';



/**
 * JSJAC JINGLE MUJI CONSTANTS
 */

var JSJAC_JINGLE_MUJI_STATUS_PREPARE                 = 'prepare';
var JSJAC_JINGLE_MUJI_STATUS_INITIATE                = 'initiate';
var JSJAC_JINGLE_MUJI_STATUS_LEAVE                   = 'leave';



/**
 * JSJSAC JINGLE CONSTANTS MAPPING
 */

var JSJAC_JINGLE_SDP_CANDIDATE_TYPES  = {};
JSJAC_JINGLE_SDP_CANDIDATE_TYPES[JSJAC_JINGLE_SDP_CANDIDATE_TYPE_HOST]   = JSJAC_JINGLE_SDP_CANDIDATE_METHOD_ICE;
JSJAC_JINGLE_SDP_CANDIDATE_TYPES[JSJAC_JINGLE_SDP_CANDIDATE_TYPE_SRFLX]  = JSJAC_JINGLE_SDP_CANDIDATE_METHOD_ICE;
JSJAC_JINGLE_SDP_CANDIDATE_TYPES[JSJAC_JINGLE_SDP_CANDIDATE_TYPE_PRFLX]  = JSJAC_JINGLE_SDP_CANDIDATE_METHOD_ICE;
JSJAC_JINGLE_SDP_CANDIDATE_TYPES[JSJAC_JINGLE_SDP_CANDIDATE_TYPE_RELAY]  = JSJAC_JINGLE_SDP_CANDIDATE_METHOD_RAW;

var JSJAC_JINGLE_BROWSERS             = {};
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_FIREFOX]                      = 1;
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_CHROME]                       = 1;
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_SAFARI]                       = 1;
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_OPERA]                        = 1;
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_IE]                           = 1;

var JSJAC_JINGLE_SENDERS              = {};
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_BOTH.jingle]                   = JSJAC_JINGLE_SENDERS_BOTH.sdp;
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_INITIATOR.jingle]              = JSJAC_JINGLE_SENDERS_INITIATOR.sdp;
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_NONE.jingle]                   = JSJAC_JINGLE_SENDERS_NONE.sdp;
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_RESPONDER.jingle]              = JSJAC_JINGLE_SENDERS_RESPONDER.sdp;

var JSJAC_JINGLE_CREATORS             = {};
JSJAC_JINGLE_CREATORS[JSJAC_JINGLE_CREATOR_INITIATOR]                    = 1;
JSJAC_JINGLE_CREATORS[JSJAC_JINGLE_CREATOR_RESPONDER]                    = 1;

var JSJAC_JINGLE_STATUSES             = {};
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INACTIVE]                      = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INITIATING]                    = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INITIATED]                     = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_ACCEPTING]                     = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_ACCEPTED]                      = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_TERMINATING]                   = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_TERMINATED]                    = 1;

var JSJAC_JINGLE_ACTIONS              = {};
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_ACCEPT]                 = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_ADD]                    = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_MODIFY]                 = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_REJECT]                 = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_CONTENT_REMOVE]                 = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_DESCRIPTION_INFO]               = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SECURITY_INFO]                  = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SESSION_ACCEPT]                 = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SESSION_INFO]                   = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SESSION_INITIATE]               = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_SESSION_TERMINATE]              = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT]               = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_TRANSPORT_INFO]                 = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_TRANSPORT_REJECT]               = 1;
JSJAC_JINGLE_ACTIONS[JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE]              = 1;

var JSJAC_JINGLE_ERRORS               = {};
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_OUT_OF_ORDER.jingle]              = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_TIE_BREAK.jingle]                 = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_UNKNOWN_SESSION.jingle]           = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.jingle]          = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_SECURITY_REQUIRED.jingle]         = 1;

var XMPP_ERRORS                       = {};
XMPP_ERRORS[XMPP_ERROR_UNEXPECTED_REQUEST.xmpp]                          = 1;
XMPP_ERRORS[XMPP_ERROR_CONFLICT.xmpp]                                    = 1;
XMPP_ERRORS[XMPP_ERROR_ITEM_NOT_FOUND.xmpp]                              = 1;
XMPP_ERRORS[XMPP_ERROR_NOT_ACCEPTABLE.xmpp]                              = 1;
XMPP_ERRORS[XMPP_ERROR_FEATURE_NOT_IMPLEMENTED.xmpp]                     = 1;
XMPP_ERRORS[XMPP_ERROR_SERVICE_UNAVAILABLE.xmpp]                         = 1;
XMPP_ERRORS[XMPP_ERROR_REDIRECT.xmpp]                                    = 1;
XMPP_ERRORS[XMPP_ERROR_RESOURCE_CONSTRAINT.xmpp]                         = 1;
XMPP_ERRORS[XMPP_ERROR_BAD_REQUEST.xmpp]                                 = 1;

var JSJAC_JINGLE_REASONS              = {};
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_ALTERNATIVE_SESSION]            = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_BUSY]                           = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_CANCEL]                         = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_CONNECTIVITY_ERROR]             = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_DECLINE]                        = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_EXPIRED]                        = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_FAILED_APPLICATION]             = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_FAILED_TRANSPORT]               = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_GENERAL_ERROR]                  = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_GONE]                           = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS]        = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_MEDIA_ERROR]                    = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_SECURITY_ERROR]                 = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_SUCCESS]                        = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_TIMEOUT]                        = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_UNSUPPORTED_APPLICATIONS]       = 1;
JSJAC_JINGLE_REASONS[JSJAC_JINGLE_REASON_UNSUPPORTED_TRANSPORTS]         = 1;

var JSJAC_JINGLE_SESSION_INFOS        = {};
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_ACTIVE]             = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_HOLD]               = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_MUTE]               = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_RINGING]            = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_UNHOLD]             = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_UNMUTE]             = 1;

var JSJAC_JINGLE_MEDIAS               = {};
JSJAC_JINGLE_MEDIAS[JSJAC_JINGLE_MEDIA_AUDIO]                            = { label: '0' };
JSJAC_JINGLE_MEDIAS[JSJAC_JINGLE_MEDIA_VIDEO]                            = { label: '1' };

var JSJAC_JINGLE_VIDEO_SOURCES        = {};
JSJAC_JINGLE_VIDEO_SOURCES[JSJAC_JINGLE_VIDEO_SOURCE_CAMERA]             = 1;
JSJAC_JINGLE_VIDEO_SOURCES[JSJAC_JINGLE_VIDEO_SOURCE_SCREEN]             = 1;

var JSJAC_JINGLE_STANZAS              = {};
JSJAC_JINGLE_STANZAS[JSJAC_JINGLE_STANZA_TYPE_ALL]                       = 1;
JSJAC_JINGLE_STANZAS[JSJAC_JINGLE_STANZA_TYPE_RESULT]                    = 1;
JSJAC_JINGLE_STANZAS[JSJAC_JINGLE_STANZA_TYPE_SET]                       = 1;
JSJAC_JINGLE_STANZAS[JSJAC_JINGLE_STANZA_TYPE_GET]                       = 1;



/**
 * JSJAC JINGLE STORAGE
 */

var JSJAC_JINGLE_STORE_CONNECTION = null;
var JSJAC_JINGLE_STORE_SESSIONS   = {};
var JSJAC_JINGLE_STORE_INITIATE   = function(stanza) {};

var JSJAC_JINGLE_STORE_DEBUG      = {
  log : function() {}
};

var JSJAC_JINGLE_STORE_EXTDISCO   = {
  stun : {},
  turn : {}
};

var JSJAC_JINGLE_STORE_FALLBACK   = {
  stun : {},
  turn : {}
};

var JSJAC_JINGLE_STORE_RELAYNODES = {
  stun  : {}
};

var JSJAC_JINGLE_STORE_DEFER      = {
  deferred : false,
  count    : 0,
  fn       : []
};

var R_JSJAC_JINGLE_SERVICE_URI    = /^(\w+):([^:\?]+)(?::(\d+))?(?:\?transport=(\w+))?/i;
