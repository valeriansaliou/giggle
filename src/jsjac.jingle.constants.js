/**
 * @fileoverview JSJaC Jingle library - Constants map
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/constants */


/**
 * JINGLE WEBRTC
 */

/**
 * @constant
 * @global
 * @type {function}
 * @default
 * @public
 */
var WEBRTC_GET_MEDIA           = ( navigator.webkitGetUserMedia     ||
                                   navigator.mozGetUserMedia        ||
                                   navigator.msGetUserMedia         ||
                                   navigator.getUserMedia           );

/**
 * @constant
 * @global
 * @type {function}
 * @default
 * @public
 */
var WEBRTC_PEER_CONNECTION     = ( window.webkitRTCPeerConnection   ||
                                   window.mozRTCPeerConnection      ||
                                   window.RTCPeerConnection         );

/**
 * @constant
 * @global
 * @type {function}
 * @default
 * @public
 */
var WEBRTC_SESSION_DESCRIPTION = ( window.mozRTCSessionDescription  ||
                                   window.RTCSessionDescription     );

/**
 * @constant
 * @global
 * @type {function}
 * @default
 * @public
 */
var WEBRTC_ICE_CANDIDATE       = ( window.mozRTCIceCandidate        ||
                                   window.RTCIceCandidate           );

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
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

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var WEBRTC_SDP_LINE_BREAK      = '\r\n';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var WEBRTC_SDP_TYPE_OFFER      = 'offer';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var WEBRTC_SDP_TYPE_ANSWER     = 'answer';

/**
 * @constant
 * @global
 * @type {RegExp}
 * @default
 * @public
 */
var R_WEBRTC_SDP_CANDIDATE     = /^a=candidate:(\w{1,32}) (\d{1,5}) (udp|tcp) (\d{1,10}) ([a-zA-Z0-9:\.]{1,45}) (\d{1,5}) (typ) (host|srflx|prflx|relay)( (raddr) ([a-zA-Z0-9:\.]{1,45}) (rport) (\d{1,5}))?( (generation) (\d))?/i;

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
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

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var R_NETWORK_PROTOCOLS        = {
  stun: /^stun:/i
};

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
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
 * @constant
 * @global
 * @type {RegExp}
 * @default
 * @public
 */
var R_JSJAC_JINGLE_SERVICE_URI    = /^(\w+):([^:\?]+)(?::(\d+))?(?:\?transport=(\w+))?/i;


/**
 * JINGLE NAMESPACES
 */

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_JINGLE                                       = 'urn:xmpp:jingle:1';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_JINGLE_ERRORS                                = 'urn:xmpp:jingle:errors:1';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP                              = 'urn:xmpp:jingle:apps:rtp:1';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_INFO                         = 'urn:xmpp:jingle:apps:rtp:info:1';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_AUDIO                        = 'urn:xmpp:jingle:apps:rtp:audio';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_VIDEO                        = 'urn:xmpp:jingle:apps:rtp:video';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_RTP_HDREXT                   = 'urn:xmpp:jingle:apps:rtp:rtp-hdrext:0';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_RTCP_FB                      = 'urn:xmpp:jingle:apps:rtp:rtcp-fb:0';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_ZRTP                         = 'urn:xmpp:jingle:apps:rtp:zrtp:1';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_SSMA                         = 'urn:xmpp:jingle:apps:rtp:ssma:0';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_JINGLE_APPS_STUB                             = 'urn:xmpp:jingle:apps:stub:0';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_JINGLE_APPS_DTLS                             = 'urn:xmpp:tmp:jingle:apps:dtls:0';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_JINGLE_APPS_GROUPING                         = 'urn:xmpp:jingle:apps:grouping:0';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_JINGLE_TRANSPORTS_RAWUDP                     = 'urn:xmpp:jingle:transports:raw-udp:1';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_JINGLE_TRANSPORTS_ICEUDP                     = 'urn:xmpp:jingle:transports:ice-udp:1';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_JINGLE_TRANSPORTS_STUB                       = 'urn:xmpp:jingle:transports:stub:0';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_JINGLE_SECURITY_STUB                         = 'urn:xmpp:jingle:security:stub:0';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_JABBER_JINGLENODES                           = 'http://jabber.org/protocol/jinglenodes';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_JABBER_JINGLENODES_CHANNEL                   = 'http://jabber.org/protocol/jinglenodes#channel';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_TELEPATHY_MUJI                               = 'http://telepathy.freedesktop.org/muji';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_EXTDISCO                                     = 'urn:xmpp:extdisco:1';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_IETF_XMPP_STANZAS                            = 'urn:ietf:params:xml:ns:xmpp-stanzas';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_IETF_RFC_3264                                = 'urn:ietf:rfc:3264';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_IETF_RFC_5576                                = 'urn:ietf:rfc:5576';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var NS_IETF_RFC_5888                                = 'urn:ietf:rfc:5888';

/**
 * @constant
 * @global
 * @type {RegExp}
 * @default
 * @public
 */
var R_NS_JINGLE_APP                                 = /^urn:xmpp:jingle:app:(\w+)(:(\w+))?(:(\d+))?$/;

/**
 * @constant
 * @global
 * @type {RegExp}
 * @default
 * @public
 */
var R_NS_JINGLE_TRANSPORT                           = /^urn:xmpp:jingle:transport:(\w+)$/;

/**
 * @constant
 * @global
 * @type {Arrat}
 * @default
 * @public
 */
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

/**
 * @constant
 * @global
 * @type {boolean}
 * @default
 * @public
 */
var JSJAC_JINGLE_AVAILABLE                           = WEBRTC_GET_MEDIA ? true : false;

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SESSION_SINGLE                      = 'single';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SESSION_MUJI                        = 'muji';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_PEER_TIMEOUT_DEFAULT                = 15;

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_PEER_TIMEOUT_DISCONNECT             = 5;

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_STANZA_TIMEOUT                      = 10;

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_STANZA_ID_PRE                       = 'jj';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_NETWORK                             = '0';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_GENERATION                          = '0';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_DIRECTION_LOCAL                     = 'local';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_DIRECTION_REMOTE                    = 'remote';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_BROWSER_FIREFOX                     = 'Firefox';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_BROWSER_CHROME                      = 'Chrome';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_BROWSER_SAFARI                      = 'Safari';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_BROWSER_OPERA                       = 'Opera';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_BROWSER_IE                          = 'IE';

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_SENDERS_BOTH                        = { jingle: 'both',      sdp: 'sendrecv' };

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_SENDERS_INITIATOR                   = { jingle: 'initiator', sdp: 'sendonly' };

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_SENDERS_NONE                        = { jingle: 'none',      sdp: 'inactive' };

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_SENDERS_RESPONDER                   = { jingle: 'responder', sdp: 'recvonly' };

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_CREATOR_INITIATOR                   = 'initiator';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_CREATOR_RESPONDER                   = 'responder';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_STATUS_INACTIVE                     = 'inactive';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_STATUS_INITIATING                   = 'initiating';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_STATUS_INITIATED                    = 'initiated';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_STATUS_ACCEPTING                    = 'accepting';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_STATUS_ACCEPTED                     = 'accepted';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_STATUS_TERMINATING                  = 'terminating';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_STATUS_TERMINATED                   = 'terminated';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_CONTENT_ACCEPT               = 'content-accept';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_CONTENT_ADD                  = 'content-add';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_CONTENT_MODIFY               = 'content-modify';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_CONTENT_REJECT               = 'content-reject';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_CONTENT_REMOVE               = 'content-remove';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_DESCRIPTION_INFO             = 'description-info';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_SECURITY_INFO                = 'security-info';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_SESSION_ACCEPT               = 'session-accept';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_SESSION_INFO                 = 'session-info';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_SESSION_INITIATE             = 'session-initiate';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_SESSION_TERMINATE            = 'session-terminate';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_TRANSPORT_ACCEPT             = 'transport-accept';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_TRANSPORT_INFO               = 'transport-info';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_TRANSPORT_REJECT             = 'transport-reject';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_ACTION_TRANSPORT_REPLACE            = 'transport-replace';

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_ERROR_OUT_OF_ORDER                  = { jingle: 'out-of-order',           xmpp: 'unexpected-request',         type: 'wait'   };

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_ERROR_TIE_BREAK                     = { jingle: 'tie-break',              xmpp: 'conflict',                   type: 'cancel' };

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_ERROR_UNKNOWN_SESSION               = { jingle: 'unknown-session',        xmpp: 'item-not-found',             type: 'cancel' };

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO              = { jingle: 'unsupported-info',       xmpp: 'feature-not-implemented',    type: 'modify' };

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_ERROR_SECURITY_REQUIRED             = { jingle: 'security-required',      xmpp: 'not-acceptable',             type: 'cancel' };

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var XMPP_ERROR_UNEXPECTED_REQUEST                    = { xmpp: 'unexpected-request',       type: 'wait' };

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var XMPP_ERROR_CONFLICT                              = { xmpp: 'conflict',                 type: 'cancel' };

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var XMPP_ERROR_ITEM_NOT_FOUND                        = { xmpp: 'item-not-found',           type: 'cancel' };

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var XMPP_ERROR_NOT_ACCEPTABLE                        = { xmpp: 'not-acceptable',           type: 'modify' };

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var XMPP_ERROR_FEATURE_NOT_IMPLEMENTED               = { xmpp: 'feature-not-implemented',  type: 'cancel' };

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var XMPP_ERROR_SERVICE_UNAVAILABLE                   = { xmpp: 'service-unavailable',      type: 'cancel' };

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var XMPP_ERROR_REDIRECT                              = { xmpp: 'redirect',                 type: 'modify' };

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var XMPP_ERROR_RESOURCE_CONSTRAINT                   = { xmpp: 'resource-constraint',      type: 'wait'   };

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var XMPP_ERROR_BAD_REQUEST                           = { xmpp: 'bad-request',              type: 'cancel' };


/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_ALTERNATIVE_SESSION          = 'alternative-session';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_BUSY                         = 'busy';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_CANCEL                       = 'cancel';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_CONNECTIVITY_ERROR           = 'connectivity-error';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_DECLINE                      = 'decline';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_EXPIRED                      = 'expired';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_FAILED_APPLICATION           = 'failed-application';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_FAILED_TRANSPORT             = 'failed-transport';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_GENERAL_ERROR                = 'general-error';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_GONE                         = 'gone';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_INCOMPATIBLE_PARAMETERS      = 'incompatible-parameters';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_MEDIA_ERROR                  = 'media-error';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_SECURITY_ERROR               = 'security-error';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_SUCCESS                      = 'success';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_TIMEOUT                      = 'timeout';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_UNSUPPORTED_APPLICATIONS     = 'unsupported-applications';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_REASON_UNSUPPORTED_TRANSPORTS       = 'unsupported-transports';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SESSION_INFO_ACTIVE                 = 'active';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SESSION_INFO_HOLD                   = 'hold';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SESSION_INFO_MUTE                   = 'mute';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SESSION_INFO_RINGING                = 'ringing';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SESSION_INFO_UNHOLD                 = 'unhold';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SESSION_INFO_UNMUTE                 = 'unmute';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_MEDIA_AUDIO                         = 'audio';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_MEDIA_VIDEO                         = 'video';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_VIDEO_SOURCE_CAMERA                 = 'camera';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_VIDEO_SOURCE_SCREEN                 = 'screen';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_STANZA_IQ                           = 'iq';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_STANZA_MESSAGE                      = 'message';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_STANZA_PRESENCE                     = 'presence';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_MESSAGE_TYPE_ALL                    = 'all';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_MESSAGE_TYPE_NORMAL                 = 'normal';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_MESSAGE_TYPE_CHAT                   = 'chat';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_MESSAGE_TYPE_HEADLINE               = 'headline';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_MESSAGE_TYPE_GROUPCHAT              = 'groupchat';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_MESSAGE_TYPE_ERROR                  = 'error';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_PRESENCE_TYPE_ALL                   = 'all';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_PRESENCE_TYPE_AVAILABLE             = 'available';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE           = 'unavailable';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_PRESENCE_TYPE_ERROR                 = 'error';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_IQ_TYPE_ALL                         = 'all';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_IQ_TYPE_RESULT                      = 'result';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_IQ_TYPE_SET                         = 'set';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_IQ_TYPE_GET                         = 'get';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_IQ_TYPE_ERROR                       = 'error';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_TYPE_HOST             = 'host';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_TYPE_SRFLX            = 'srflx';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_TYPE_PRFLX            = 'prflx';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_TYPE_RELAY            = 'relay';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_METHOD_ICE            = 'ice';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_METHOD_RAW            = 'raw';

/**
 * @constant
 * @global
 * @type {Array}
 * @default
 * @public
 */
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

/**
 * @constant
 * @global
 * @type {Array}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_MAP_RAWUDP            = [
  { n: 'component',  r: 1 },
  { n: 'generation', r: 1 },
  { n: 'id',         r: 1 },
  { n: 'ip',         r: 1 },
  { n: 'port',       r: 1 },
  { n: 'type',       r: 1 }
];

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_LOCAL           = 'IN';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_REMOTE          = 'IN';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_V4          = 'IP4';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_V6          = 'IP6';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_PROTOCOL_TCP          = 'tcp';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_PROTOCOL_UDP          = 'udp';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_IP_V4                 = '0.0.0.0';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_IP_V6                 = '::';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_IP_DEFAULT            = JSJAC_JINGLE_SDP_CANDIDATE_IP_V4;

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_PORT_DEFAULT          = '1';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_DEFAULT         = JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_REMOTE;

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_DEFAULT     = JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_V4;

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_PROTOCOL_DEFAULT      = JSJAC_JINGLE_SDP_CANDIDATE_PROTOCOL_UDP;

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_PRIORITY_DEFAULT      = '1';



/**
 * JSJAC JINGLE MUJI CONSTANTS
 */

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_ACTION_PREPARE                 = 'prepare';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_ACTION_INITIATE                = 'initiate';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_ACTION_LEAVE                   = 'leave';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_STATUS_INACTIVE                = 'inactive';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_STATUS_PREPARING               = 'preparing';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_STATUS_PREPARED                = 'prepared';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_STATUS_INITIATING              = 'initiating';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_STATUS_INITIATED               = 'initiated';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_STATUS_LEAVING                 = 'leaving';

/**
 * @constant
 * @global
 * @type {string}
 * @default
 * @public
 */
var JSJAC_JINGLE_MUJI_STATUS_LEFT                    = 'left';



/**
 * JSJSAC JINGLE CONSTANTS MAPPING
 */

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_SDP_CANDIDATE_TYPES  = {};
JSJAC_JINGLE_SDP_CANDIDATE_TYPES[JSJAC_JINGLE_SDP_CANDIDATE_TYPE_HOST]   = JSJAC_JINGLE_SDP_CANDIDATE_METHOD_ICE;
JSJAC_JINGLE_SDP_CANDIDATE_TYPES[JSJAC_JINGLE_SDP_CANDIDATE_TYPE_SRFLX]  = JSJAC_JINGLE_SDP_CANDIDATE_METHOD_ICE;
JSJAC_JINGLE_SDP_CANDIDATE_TYPES[JSJAC_JINGLE_SDP_CANDIDATE_TYPE_PRFLX]  = JSJAC_JINGLE_SDP_CANDIDATE_METHOD_ICE;
JSJAC_JINGLE_SDP_CANDIDATE_TYPES[JSJAC_JINGLE_SDP_CANDIDATE_TYPE_RELAY]  = JSJAC_JINGLE_SDP_CANDIDATE_METHOD_RAW;

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_BROWSERS             = {};
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_FIREFOX]                      = 1;
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_CHROME]                       = 1;
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_SAFARI]                       = 1;
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_OPERA]                        = 1;
JSJAC_JINGLE_BROWSERS[JSJAC_JINGLE_BROWSER_IE]                           = 1;

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_SENDERS              = {};
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_BOTH.jingle]                   = JSJAC_JINGLE_SENDERS_BOTH.sdp;
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_INITIATOR.jingle]              = JSJAC_JINGLE_SENDERS_INITIATOR.sdp;
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_NONE.jingle]                   = JSJAC_JINGLE_SENDERS_NONE.sdp;
JSJAC_JINGLE_SENDERS[JSJAC_JINGLE_SENDERS_RESPONDER.jingle]              = JSJAC_JINGLE_SENDERS_RESPONDER.sdp;

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_CREATORS             = {};
JSJAC_JINGLE_CREATORS[JSJAC_JINGLE_CREATOR_INITIATOR]                    = 1;
JSJAC_JINGLE_CREATORS[JSJAC_JINGLE_CREATOR_RESPONDER]                    = 1;

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_STATUSES             = {};
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INACTIVE]                      = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INITIATING]                    = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_INITIATED]                     = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_ACCEPTING]                     = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_ACCEPTED]                      = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_TERMINATING]                   = 1;
JSJAC_JINGLE_STATUSES[JSJAC_JINGLE_STATUS_TERMINATED]                    = 1;

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
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

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_ERRORS               = {};
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_OUT_OF_ORDER.jingle]              = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_TIE_BREAK.jingle]                 = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_UNKNOWN_SESSION.jingle]           = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_UNSUPPORTED_INFO.jingle]          = 1;
JSJAC_JINGLE_ERRORS[JSJAC_JINGLE_ERROR_SECURITY_REQUIRED.jingle]         = 1;

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
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

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
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

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_SESSION_INFOS        = {};
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_ACTIVE]             = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_HOLD]               = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_MUTE]               = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_RINGING]            = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_UNHOLD]             = 1;
JSJAC_JINGLE_SESSION_INFOS[JSJAC_JINGLE_SESSION_INFO_UNMUTE]             = 1;

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_MEDIAS               = {};
JSJAC_JINGLE_MEDIAS[JSJAC_JINGLE_MEDIA_AUDIO]                            = { label: '0' };
JSJAC_JINGLE_MEDIAS[JSJAC_JINGLE_MEDIA_VIDEO]                            = { label: '1' };

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_VIDEO_SOURCES        = {};
JSJAC_JINGLE_VIDEO_SOURCES[JSJAC_JINGLE_VIDEO_SOURCE_CAMERA]             = 1;
JSJAC_JINGLE_VIDEO_SOURCES[JSJAC_JINGLE_VIDEO_SOURCE_SCREEN]             = 1;

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_MESSAGE_TYPES        = {};
JSJAC_JINGLE_MESSAGE_TYPES[JSJAC_JINGLE_MESSAGE_TYPE_ALL]                = 1;
JSJAC_JINGLE_MESSAGE_TYPES[JSJAC_JINGLE_MESSAGE_TYPE_NORMAL]             = 1;
JSJAC_JINGLE_MESSAGE_TYPES[JSJAC_JINGLE_MESSAGE_TYPE_CHAT]               = 1;
JSJAC_JINGLE_MESSAGE_TYPES[JSJAC_JINGLE_MESSAGE_TYPE_HEADLINE]           = 1;
JSJAC_JINGLE_MESSAGE_TYPES[JSJAC_JINGLE_MESSAGE_TYPE_GROUPCHAT]          = 1;
JSJAC_JINGLE_MESSAGE_TYPES[JSJAC_JINGLE_MESSAGE_TYPE_ERROR]              = 1;

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_PRESENCE_TYPES       = {};
JSJAC_JINGLE_PRESENCE_TYPES[JSJAC_JINGLE_PRESENCE_TYPE_ALL]              = 1;
JSJAC_JINGLE_PRESENCE_TYPES[JSJAC_JINGLE_PRESENCE_TYPE_AVAILABLE]        = 1;
JSJAC_JINGLE_PRESENCE_TYPES[JSJAC_JINGLE_PRESENCE_TYPE_UNAVAILABLE]      = 1;
JSJAC_JINGLE_PRESENCE_TYPES[JSJAC_JINGLE_PRESENCE_TYPE_ERROR]            = 1;

/**
 * @constant
 * @global
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_IQ_TYPES             = {};
JSJAC_JINGLE_IQ_TYPES[JSJAC_JINGLE_IQ_TYPE_ALL]                          = 1;
JSJAC_JINGLE_IQ_TYPES[JSJAC_JINGLE_IQ_TYPE_RESULT]                       = 1;
JSJAC_JINGLE_IQ_TYPES[JSJAC_JINGLE_IQ_TYPE_SET]                          = 1;
JSJAC_JINGLE_IQ_TYPES[JSJAC_JINGLE_IQ_TYPE_GET]                          = 1;
JSJAC_JINGLE_IQ_TYPES[JSJAC_JINGLE_IQ_TYPE_ERROR]                        = 1;



/**
 * JSJAC JINGLE STORAGE
 */

/**
 * @type {JSJaCConnection}
 * @default
 * @public
 */
var JSJAC_JINGLE_STORE_CONNECTION                         = null;

/**
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_STORE_SESSIONS                           = {};
JSJAC_JINGLE_STORE_SESSIONS[JSJAC_JINGLE_SESSION_SINGLE]  = {};
JSJAC_JINGLE_STORE_SESSIONS[JSJAC_JINGLE_SESSION_MUJI]    = {};

/**
 * @type {function}
 * @default
 * @public
 */
var JSJAC_JINGLE_STORE_INITIATE   = function(stanza) {};

/**
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_STORE_DEBUG      = {
  log : function() {}
};

/**
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_STORE_EXTDISCO   = {
  stun : {},
  turn : {}
};

/**
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_STORE_FALLBACK   = {
  stun : {},
  turn : {}
};

/**
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_STORE_RELAYNODES = {
  stun  : {}
};

/**
 * @type {object}
 * @default
 * @public
 */
var JSJAC_JINGLE_STORE_DEFER      = {
  deferred : false,
  count    : 0,
  fn       : []
};
