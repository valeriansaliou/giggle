/**
 * @fileoverview Giggle library - Constants map
 *
 * @url https://github.com/valeriansaliou/giggle
 * @author Valerian Saliou https://valeriansaliou.name/
 *
 * @copyright 2015, Valerian Saliou
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module giggle/constants */


/**
 * JINGLE WEBRTC
 */

/**
 * @constant
 * @global
 * @type {Function}
 * @readonly
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
 * @type {Function}
 * @readonly
 * @default
 * @public
 */
var WEBRTC_PEER_CONNECTION     = ( window.RTCPeerConnection         ||
                                   window.webkitRTCPeerConnection   ||
                                   window.mozRTCPeerConnection      );

/**
 * @constant
 * @global
 * @type {Function}
 * @readonly
 * @default
 * @public
 */
var WEBRTC_SESSION_DESCRIPTION = ( window.mozRTCSessionDescription  ||
                                   window.RTCSessionDescription     );

/**
 * @constant
 * @global
 * @type {Function}
 * @readonly
 * @default
 * @public
 */
var WEBRTC_ICE_CANDIDATE       = ( window.mozRTCIceCandidate        ||
                                   window.RTCIceCandidate           );

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var WEBRTC_CONFIGURATION = {
  peer_connection : {
    config        : {
      iceServers : [{
        url: 'stun.l.google.com:19302'
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
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var WEBRTC_SDP_LINE_BREAK      = '\r\n';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var WEBRTC_SDP_TYPE_OFFER      = 'offer';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var WEBRTC_SDP_TYPE_ANSWER     = 'answer';

/**
 * @constant
 * @global
 * @type {RegExp}
 * @readonly
 * @default
 * @public
 */
var R_WEBRTC_SHORT_CANDIDATE   = 'candidate:(\\w{1,32}) (\\d{1,5}) (udp|tcp) (\\d{1,10}) ([a-zA-Z0-9:\\.]{1,45}) (\\d{1,5}) (typ) (host|srflx|prflx|relay)( (raddr) ([a-zA-Z0-9:\\.]{1,45}) (rport) (\\d{1,5}))?( (generation) (\\d))?';

/**
 * @constant
 * @global
 * @type {RegExp}
 * @readonly
 * @default
 * @public
 */
var R_WEBRTC_DATA_CANDIDATE    = new RegExp('^(?:a=)?' + R_WEBRTC_SHORT_CANDIDATE, 'i');

/**
 * @constant
 * @global
 * @type {RegExp}
 * @readonly
 * @default
 * @public
 */
var R_WEBRTC_SDP_CANDIDATE     = new RegExp('^a=' + R_WEBRTC_SHORT_CANDIDATE, 'i');

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
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
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var R_NETWORK_PROTOCOLS        = {
  stun: /^stun:/i
};

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
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
 * @readonly
 * @default
 * @public
 */
var R_GIGGLE_SERVICE_URI    = /^(\w+):([^:\?]+)(?::(\d+))?(?:\?transport=(\w+))?/i;


/**
 * JINGLE NAMESPACES
 */

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE                                       = 'urn:xmpp:jingle:1';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_ERRORS                                = 'urn:xmpp:jingle:errors:1';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP                              = 'urn:xmpp:jingle:apps:rtp:1';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_INFO                         = 'urn:xmpp:jingle:apps:rtp:info:1';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_AUDIO                        = 'urn:xmpp:jingle:apps:rtp:audio';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_VIDEO                        = 'urn:xmpp:jingle:apps:rtp:video';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_RTP_HDREXT                   = 'urn:xmpp:jingle:apps:rtp:rtp-hdrext:0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_RTCP_FB                      = 'urn:xmpp:jingle:apps:rtp:rtcp-fb:0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_ZRTP                         = 'urn:xmpp:jingle:apps:rtp:zrtp:1';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_RTP_SSMA                         = 'urn:xmpp:jingle:apps:rtp:ssma:0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_STUB                             = 'urn:xmpp:jingle:apps:stub:0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_DTLS                             = 'urn:xmpp:tmp:jingle:apps:dtls:0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_APPS_GROUPING                         = 'urn:xmpp:jingle:apps:grouping:0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_TRANSPORTS_RAWUDP                     = 'urn:xmpp:jingle:transports:raw-udp:1';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_TRANSPORTS_ICEUDP                     = 'urn:xmpp:jingle:transports:ice-udp:1';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_TRANSPORTS_STUB                       = 'urn:xmpp:jingle:transports:stub:0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_SECURITY_STUB                         = 'urn:xmpp:jingle:security:stub:0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JINGLE_MESSAGE                               = 'urn:xmpp:jingle-message:0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JABBER_JINGLENODES                           = 'http://jabber.org/protocol/jinglenodes';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JABBER_JINGLENODES_CHANNEL                   = 'http://jabber.org/protocol/jinglenodes#channel';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JABBER_MUC                                   = 'http://jabber.org/protocol/muc';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JABBER_MUC_OWNER                             = 'http://jabber.org/protocol/muc#owner';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JABBER_MUC_ROOMCONFIG                        = 'http://jabber.org/protocol/muc#roomconfig';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JABBER_MUC_USER                              = 'http://jabber.org/protocol/muc#user';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JABBER_CONFERENCE                            = 'jabber:x:conference';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_JABBER_DATA                                  = 'jabber:x:data';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_MUJI                                         = 'urn:xmpp:muji:tmp';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_MUJI_INVITE                                  = 'urn:xmpp:muji:invite:tmp';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_EXTDISCO                                     = 'urn:xmpp:extdisco:1';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_IETF_XMPP_STANZAS                            = 'urn:ietf:params:xml:ns:xmpp-stanzas';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_IETF_RFC_3264                                = 'urn:ietf:rfc:3264';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_IETF_RFC_5576                                = 'urn:ietf:rfc:5576';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var NS_IETF_RFC_5888                                = 'urn:ietf:rfc:5888';

/**
 * @constant
 * @global
 * @type {RegExp}
 * @readonly
 * @default
 * @public
 */
var R_NS_JINGLE_APP                                 = /^urn:xmpp:jingle:app:(\w+)(:(\w+))?(:(\d+))?$/;

/**
 * @constant
 * @global
 * @type {RegExp}
 * @readonly
 * @default
 * @public
 */
var R_NS_JINGLE_TRANSPORT                           = /^urn:xmpp:jingle:transport:(\w+)$/;

/**
 * @constant
 * @global
 * @type {Array}
 * @readonly
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

  /* http://xmpp.org/extensions/xep-0353.html */
  NS_JINGLE_MESSAGE,

  /* http://xmpp.org/extensions/xep-0278.html */
  NS_JABBER_JINGLENODES,

  /* http://xmpp.org/extensions/xep-0215.html */
  NS_EXTDISCO
];


/**
 * @constant
 * @global
 * @type {Array}
 * @readonly
 * @default
 * @public
 */
var MAP_DISCO_MUJI                                = [
  /* http://xmpp.org/extensions/xep-0272.html */
  NS_MUJI,

  /* http://xmpp.org/extensions/xep-0272.html#inviting */
  NS_MUJI_INVITE,

  /* http://xmpp.org/extensions/xep-0249.html */
  NS_JABBER_CONFERENCE
];



/**
 * GIGGLE CONSTANTS
 */

/**
 * @constant
 * @global
 * @type {Boolean}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_AVAILABLE                           = WEBRTC_GET_MEDIA ? true : false;

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SESSION_SINGLE                      = 'single';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SESSION_MUJI                        = 'muji';

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_PEER_TIMEOUT_DEFAULT                = 30;

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_PEER_TIMEOUT_DISCONNECT             = 15;

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MEDIA_READYSTATE_UNINITIALIZED      = 0;

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MEDIA_READYSTATE_LOADING            = 1;

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MEDIA_READYSTATE_LOADED             = 2;

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MEDIA_READYSTATE_INTERACTIVE        = 3;

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MEDIA_READYSTATE_COMPLETED          = 4;

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_STANZA_TIMEOUT                      = 10;

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_BROADCAST_TIMEOUT                   = 30;

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_STANZA_ID_PRE                       = 'jj';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_NETWORK                             = '0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_GENERATION                          = '0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_PLUG_JSJAC                          = 'jsjac';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_DIRECTION_LOCAL                     = 'local';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_DIRECTION_REMOTE                    = 'remote';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_BROWSER_FIREFOX                     = 'Firefox';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_BROWSER_CHROME                      = 'Chrome';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_BROWSER_SAFARI                      = 'Safari';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_BROWSER_OPERA                       = 'Opera';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_BROWSER_IE                          = 'IE';

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SENDERS_BOTH                        = { jingle: 'both',      sdp: 'sendrecv' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SENDERS_INITIATOR                   = { jingle: 'initiator', sdp: 'sendonly' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SENDERS_NONE                        = { jingle: 'none',      sdp: 'inactive' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SENDERS_RESPONDER                   = { jingle: 'responder', sdp: 'recvonly' };

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_CREATOR_INITIATOR                   = 'initiator';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_CREATOR_RESPONDER                   = 'responder';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_STATUS_INACTIVE                     = 'inactive';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_STATUS_INITIATING                   = 'initiating';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_STATUS_INITIATED                    = 'initiated';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_STATUS_ACCEPTING                    = 'accepting';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_STATUS_ACCEPTED                     = 'accepted';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_STATUS_TERMINATING                  = 'terminating';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_STATUS_TERMINATED                   = 'terminated';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ACTION_CONTENT_ACCEPT               = 'content-accept';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ACTION_CONTENT_ADD                  = 'content-add';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ACTION_CONTENT_MODIFY               = 'content-modify';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ACTION_CONTENT_REJECT               = 'content-reject';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ACTION_CONTENT_REMOVE               = 'content-remove';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ACTION_DESCRIPTION_INFO             = 'description-info';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ACTION_SECURITY_INFO                = 'security-info';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ACTION_SESSION_ACCEPT               = 'session-accept';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ACTION_SESSION_INFO                 = 'session-info';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ACTION_SESSION_INITIATE             = 'session-initiate';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ACTION_SESSION_TERMINATE            = 'session-terminate';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ACTION_TRANSPORT_ACCEPT             = 'transport-accept';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ACTION_TRANSPORT_INFO               = 'transport-info';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ACTION_TRANSPORT_REJECT             = 'transport-reject';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ACTION_TRANSPORT_REPLACE            = 'transport-replace';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MESSAGE_ACTION_PROPOSE              = 'propose';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MESSAGE_ACTION_RETRACT              = 'retract';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MESSAGE_ACTION_ACCEPT               = 'accept';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MESSAGE_ACTION_PROCEED              = 'proceed';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MESSAGE_ACTION_REJECT               = 'reject';

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ERROR_OUT_OF_ORDER                  = { jingle: 'out-of-order',           xmpp: 'unexpected-request',         type: 'wait'   };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ERROR_TIE_BREAK                     = { jingle: 'tie-break',              xmpp: 'conflict',                   type: 'cancel' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ERROR_UNKNOWN_SESSION               = { jingle: 'unknown-session',        xmpp: 'item-not-found',             type: 'cancel' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ERROR_UNSUPPORTED_INFO              = { jingle: 'unsupported-info',       xmpp: 'feature-not-implemented',    type: 'modify' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ERROR_SECURITY_REQUIRED             = { jingle: 'security-required',      xmpp: 'not-acceptable',             type: 'cancel' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERROR_UNEXPECTED_REQUEST                    = { xmpp: 'unexpected-request',       type: 'wait' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERROR_CONFLICT                              = { xmpp: 'conflict',                 type: 'cancel' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERROR_ITEM_NOT_FOUND                        = { xmpp: 'item-not-found',           type: 'cancel' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERROR_NOT_ACCEPTABLE                        = { xmpp: 'not-acceptable',           type: 'modify' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERROR_NOT_AUTHORIZED                        = { xmpp: 'not-authorized',           type: 'auth' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERROR_FEATURE_NOT_IMPLEMENTED               = { xmpp: 'feature-not-implemented',  type: 'cancel' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERROR_SERVICE_UNAVAILABLE                   = { xmpp: 'service-unavailable',      type: 'cancel' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERROR_REDIRECT                              = { xmpp: 'redirect',                 type: 'modify' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERROR_RESOURCE_CONSTRAINT                   = { xmpp: 'resource-constraint',      type: 'wait'   };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERROR_BAD_REQUEST                           = { xmpp: 'bad-request',              type: 'cancel' };


/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_REASON_ALTERNATIVE_SESSION          = 'alternative-session';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_REASON_BUSY                         = 'busy';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_REASON_CANCEL                       = 'cancel';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_REASON_CONNECTIVITY_ERROR           = 'connectivity-error';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_REASON_DECLINE                      = 'decline';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_REASON_EXPIRED                      = 'expired';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_REASON_FAILED_APPLICATION           = 'failed-application';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_REASON_FAILED_TRANSPORT             = 'failed-transport';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_REASON_GENERAL_ERROR                = 'general-error';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_REASON_GONE                         = 'gone';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_REASON_INCOMPATIBLE_PARAMETERS      = 'incompatible-parameters';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_REASON_MEDIA_ERROR                  = 'media-error';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_REASON_SECURITY_ERROR               = 'security-error';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_REASON_SUCCESS                      = 'success';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_REASON_TIMEOUT                      = 'timeout';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_REASON_UNSUPPORTED_APPLICATIONS     = 'unsupported-applications';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_REASON_UNSUPPORTED_TRANSPORTS       = 'unsupported-transports';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SESSION_INFO_ACTIVE                 = 'active';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SESSION_INFO_HOLD                   = 'hold';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SESSION_INFO_MUTE                   = 'mute';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SESSION_INFO_RINGING                = 'ringing';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SESSION_INFO_UNHOLD                 = 'unhold';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SESSION_INFO_UNMUTE                 = 'unmute';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MEDIA_AUDIO                         = 'audio';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MEDIA_VIDEO                         = 'video';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_VIDEO_SOURCE_CAMERA                 = 'camera';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_VIDEO_SOURCE_SCREEN                 = 'screen';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_STANZA_IQ                           = 'iq';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_STANZA_MESSAGE                      = 'message';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_STANZA_PRESENCE                     = 'presence';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MESSAGE_TYPE_ALL                    = 'all';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MESSAGE_TYPE_NORMAL                 = 'normal';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MESSAGE_TYPE_CHAT                   = 'chat';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MESSAGE_TYPE_HEADLINE               = 'headline';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MESSAGE_TYPE_GROUPCHAT              = 'groupchat';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MESSAGE_TYPE_ERROR                  = 'error';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_PRESENCE_TYPE_ALL                   = 'all';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_PRESENCE_TYPE_AVAILABLE             = 'available';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_PRESENCE_TYPE_UNAVAILABLE           = 'unavailable';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_PRESENCE_TYPE_ERROR                 = 'error';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_IQ_TYPE_ALL                         = 'all';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_IQ_TYPE_RESULT                      = 'result';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_IQ_TYPE_SET                         = 'set';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_IQ_TYPE_GET                         = 'get';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_IQ_TYPE_ERROR                       = 'error';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ICE_CONNECTION_STATE_NEW            = 'new';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ICE_CONNECTION_STATE_CHECKING       = 'checking';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ICE_CONNECTION_STATE_CONNECTED      = 'connected';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ICE_CONNECTION_STATE_COMPLETED      = 'completed';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ICE_CONNECTION_STATE_FAILED         = 'failed';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ICE_CONNECTION_STATE_DISCONNECTED   = 'disconnected';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ICE_CONNECTION_STATE_CLOSED         = 'closed';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_TYPE_HOST             = 'host';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_TYPE_SRFLX            = 'srflx';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_TYPE_PRFLX            = 'prflx';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_TYPE_RELAY            = 'relay';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_METHOD_ICE            = 'ice';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_METHOD_RAW            = 'raw';

/**
 * @constant
 * @global
 * @type {Array}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_MAP_ICEUDP            = [
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
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_MAP_RAWUDP            = [
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
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_SCOPE_LOCAL           = 'IN';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_SCOPE_REMOTE          = 'IN';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_IPVERSION_V4          = 'IP4';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_IPVERSION_V6          = 'IP6';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_PROTOCOL_TCP          = 'tcp';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_PROTOCOL_UDP          = 'udp';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_IP_V4                 = '0.0.0.0';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_IP_V6                 = '::';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_IP_DEFAULT            = GIGGLE_SDP_CANDIDATE_IP_V4;

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_PORT_DEFAULT          = '1';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_SCOPE_DEFAULT         = GIGGLE_SDP_CANDIDATE_SCOPE_REMOTE;

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_IPVERSION_DEFAULT     = GIGGLE_SDP_CANDIDATE_IPVERSION_V4;

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_PROTOCOL_DEFAULT      = GIGGLE_SDP_CANDIDATE_PROTOCOL_UDP;

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_PRIORITY_DEFAULT      = '1';



/**
 * GIGGLE MUJI CONSTANTS
 */

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_ACTION_PREPARE                 = 'prepare';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_ACTION_INITIATE                = 'initiate';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_ACTION_LEAVE                   = 'leave';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_STATUS_INACTIVE                = 'inactive';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_STATUS_PREPARING               = 'preparing';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_STATUS_PREPARED                = 'prepared';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_STATUS_INITIATING              = 'initiating';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_STATUS_INITIATED               = 'initiated';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_STATUS_LEAVING                 = 'leaving';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_STATUS_LEFT                    = 'left';

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_INITIATE_WAIT                  = 2;

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_LEAVE_WAIT                     = 1;

/**
 * @constant
 * @global
 * @type {Number}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_PARTICIPANT_ACCEPT_WAIT        = 0.250;

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_HANDLER_GET_USER_MEDIA         = 'get_user_media';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_MUC_AFFILIATION_ADMIN          = 'admin';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_MUC_AFFILIATION_MEMBER         = 'member';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_MUC_AFFILIATION_NONE           = 'none';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_MUC_AFFILIATION_OUTCAST        = 'outcast';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_MUC_AFFILIATION_OWNER          = 'owner';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_MUC_OWNER_SUBMIT               = 'submit';

/**
 * @constant
 * @global
 * @type {String}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_MUC_CONFIG_SECRET              = 'muc#roomconfig_roomsecret';



/**
 * GIGGLE CONSTANTS MAPPING
 */

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_PLUGS                 = {};
GIGGLE_PLUGS[GIGGLE_PLUG_JSJAC]                                         = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ICE_CONNECTION_STATES = {};
GIGGLE_ICE_CONNECTION_STATES[GIGGLE_ICE_CONNECTION_STATE_NEW]           = 1;
GIGGLE_ICE_CONNECTION_STATES[GIGGLE_ICE_CONNECTION_STATE_CHECKING]      = 1;
GIGGLE_ICE_CONNECTION_STATES[GIGGLE_ICE_CONNECTION_STATE_CONNECTED]     = 1;
GIGGLE_ICE_CONNECTION_STATES[GIGGLE_ICE_CONNECTION_STATE_COMPLETED]     = 1;
GIGGLE_ICE_CONNECTION_STATES[GIGGLE_ICE_CONNECTION_STATE_FAILED]        = 1;
GIGGLE_ICE_CONNECTION_STATES[GIGGLE_ICE_CONNECTION_STATE_DISCONNECTED]  = 1;
GIGGLE_ICE_CONNECTION_STATES[GIGGLE_ICE_CONNECTION_STATE_CLOSED]        = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SDP_CANDIDATE_TYPES   = {};
GIGGLE_SDP_CANDIDATE_TYPES[GIGGLE_SDP_CANDIDATE_TYPE_HOST]              = GIGGLE_SDP_CANDIDATE_METHOD_ICE;
GIGGLE_SDP_CANDIDATE_TYPES[GIGGLE_SDP_CANDIDATE_TYPE_SRFLX]             = GIGGLE_SDP_CANDIDATE_METHOD_ICE;
GIGGLE_SDP_CANDIDATE_TYPES[GIGGLE_SDP_CANDIDATE_TYPE_PRFLX]             = GIGGLE_SDP_CANDIDATE_METHOD_ICE;
GIGGLE_SDP_CANDIDATE_TYPES[GIGGLE_SDP_CANDIDATE_TYPE_RELAY]             = GIGGLE_SDP_CANDIDATE_METHOD_RAW;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_BROWSERS              = {};
GIGGLE_BROWSERS[GIGGLE_BROWSER_FIREFOX]                                 = 1;
GIGGLE_BROWSERS[GIGGLE_BROWSER_CHROME]                                  = 1;
GIGGLE_BROWSERS[GIGGLE_BROWSER_SAFARI]                                  = 1;
GIGGLE_BROWSERS[GIGGLE_BROWSER_OPERA]                                   = 1;
GIGGLE_BROWSERS[GIGGLE_BROWSER_IE]                                      = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SENDERS               = {};
GIGGLE_SENDERS[GIGGLE_SENDERS_BOTH.jingle]                              = GIGGLE_SENDERS_BOTH.sdp;
GIGGLE_SENDERS[GIGGLE_SENDERS_INITIATOR.jingle]                         = GIGGLE_SENDERS_INITIATOR.sdp;
GIGGLE_SENDERS[GIGGLE_SENDERS_NONE.jingle]                              = GIGGLE_SENDERS_NONE.sdp;
GIGGLE_SENDERS[GIGGLE_SENDERS_RESPONDER.jingle]                         = GIGGLE_SENDERS_RESPONDER.sdp;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_CREATORS              = {};
GIGGLE_CREATORS[GIGGLE_CREATOR_INITIATOR]                               = 1;
GIGGLE_CREATORS[GIGGLE_CREATOR_RESPONDER]                               = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_STATUSES              = {};
GIGGLE_STATUSES[GIGGLE_STATUS_INACTIVE]                                 = 1;
GIGGLE_STATUSES[GIGGLE_STATUS_INITIATING]                               = 1;
GIGGLE_STATUSES[GIGGLE_STATUS_INITIATED]                                = 1;
GIGGLE_STATUSES[GIGGLE_STATUS_ACCEPTING]                                = 1;
GIGGLE_STATUSES[GIGGLE_STATUS_ACCEPTED]                                 = 1;
GIGGLE_STATUSES[GIGGLE_STATUS_TERMINATING]                              = 1;
GIGGLE_STATUSES[GIGGLE_STATUS_TERMINATED]                               = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ACTIONS               = {};
GIGGLE_ACTIONS[GIGGLE_ACTION_CONTENT_ACCEPT]                            = 1;
GIGGLE_ACTIONS[GIGGLE_ACTION_CONTENT_ADD]                               = 1;
GIGGLE_ACTIONS[GIGGLE_ACTION_CONTENT_MODIFY]                            = 1;
GIGGLE_ACTIONS[GIGGLE_ACTION_CONTENT_REJECT]                            = 1;
GIGGLE_ACTIONS[GIGGLE_ACTION_CONTENT_REMOVE]                            = 1;
GIGGLE_ACTIONS[GIGGLE_ACTION_DESCRIPTION_INFO]                          = 1;
GIGGLE_ACTIONS[GIGGLE_ACTION_SECURITY_INFO]                             = 1;
GIGGLE_ACTIONS[GIGGLE_ACTION_SESSION_ACCEPT]                            = 1;
GIGGLE_ACTIONS[GIGGLE_ACTION_SESSION_INFO]                              = 1;
GIGGLE_ACTIONS[GIGGLE_ACTION_SESSION_INITIATE]                          = 1;
GIGGLE_ACTIONS[GIGGLE_ACTION_SESSION_TERMINATE]                         = 1;
GIGGLE_ACTIONS[GIGGLE_ACTION_TRANSPORT_ACCEPT]                          = 1;
GIGGLE_ACTIONS[GIGGLE_ACTION_TRANSPORT_INFO]                            = 1;
GIGGLE_ACTIONS[GIGGLE_ACTION_TRANSPORT_REJECT]                          = 1;
GIGGLE_ACTIONS[GIGGLE_ACTION_TRANSPORT_REPLACE]                         = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MESSAGE_ACTIONS               = {};
GIGGLE_MESSAGE_ACTIONS[GIGGLE_MESSAGE_ACTION_PROPOSE]                   = 1;
GIGGLE_MESSAGE_ACTIONS[GIGGLE_MESSAGE_ACTION_RETRACT]                   = 1;
GIGGLE_MESSAGE_ACTIONS[GIGGLE_MESSAGE_ACTION_ACCEPT]                    = 1;
GIGGLE_MESSAGE_ACTIONS[GIGGLE_MESSAGE_ACTION_PROCEED]                   = 1;
GIGGLE_MESSAGE_ACTIONS[GIGGLE_MESSAGE_ACTION_REJECT]                    = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_ERRORS                = {};
GIGGLE_ERRORS[GIGGLE_ERROR_OUT_OF_ORDER.jingle]                         = 1;
GIGGLE_ERRORS[GIGGLE_ERROR_TIE_BREAK.jingle]                            = 1;
GIGGLE_ERRORS[GIGGLE_ERROR_UNKNOWN_SESSION.jingle]                      = 1;
GIGGLE_ERRORS[GIGGLE_ERROR_UNSUPPORTED_INFO.jingle]                     = 1;
GIGGLE_ERRORS[GIGGLE_ERROR_SECURITY_REQUIRED.jingle]                    = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var XMPP_ERRORS                        = {};
XMPP_ERRORS[XMPP_ERROR_UNEXPECTED_REQUEST.xmpp]                                     = 1;
XMPP_ERRORS[XMPP_ERROR_CONFLICT.xmpp]                                               = 1;
XMPP_ERRORS[XMPP_ERROR_ITEM_NOT_FOUND.xmpp]                                         = 1;
XMPP_ERRORS[XMPP_ERROR_NOT_ACCEPTABLE.xmpp]                                         = 1;
XMPP_ERRORS[XMPP_ERROR_FEATURE_NOT_IMPLEMENTED.xmpp]                                = 1;
XMPP_ERRORS[XMPP_ERROR_SERVICE_UNAVAILABLE.xmpp]                                    = 1;
XMPP_ERRORS[XMPP_ERROR_REDIRECT.xmpp]                                               = 1;
XMPP_ERRORS[XMPP_ERROR_RESOURCE_CONSTRAINT.xmpp]                                    = 1;
XMPP_ERRORS[XMPP_ERROR_BAD_REQUEST.xmpp]                                            = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_REASONS               = {};
GIGGLE_REASONS[GIGGLE_REASON_ALTERNATIVE_SESSION]                       = 1;
GIGGLE_REASONS[GIGGLE_REASON_BUSY]                                      = 1;
GIGGLE_REASONS[GIGGLE_REASON_CANCEL]                                    = 1;
GIGGLE_REASONS[GIGGLE_REASON_CONNECTIVITY_ERROR]                        = 1;
GIGGLE_REASONS[GIGGLE_REASON_DECLINE]                                   = 1;
GIGGLE_REASONS[GIGGLE_REASON_EXPIRED]                                   = 1;
GIGGLE_REASONS[GIGGLE_REASON_FAILED_APPLICATION]                        = 1;
GIGGLE_REASONS[GIGGLE_REASON_FAILED_TRANSPORT]                          = 1;
GIGGLE_REASONS[GIGGLE_REASON_GENERAL_ERROR]                             = 1;
GIGGLE_REASONS[GIGGLE_REASON_GONE]                                      = 1;
GIGGLE_REASONS[GIGGLE_REASON_INCOMPATIBLE_PARAMETERS]                   = 1;
GIGGLE_REASONS[GIGGLE_REASON_MEDIA_ERROR]                               = 1;
GIGGLE_REASONS[GIGGLE_REASON_SECURITY_ERROR]                            = 1;
GIGGLE_REASONS[GIGGLE_REASON_SUCCESS]                                   = 1;
GIGGLE_REASONS[GIGGLE_REASON_TIMEOUT]                                   = 1;
GIGGLE_REASONS[GIGGLE_REASON_UNSUPPORTED_APPLICATIONS]                  = 1;
GIGGLE_REASONS[GIGGLE_REASON_UNSUPPORTED_TRANSPORTS]                    = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_SESSION_INFOS         = {};
GIGGLE_SESSION_INFOS[GIGGLE_SESSION_INFO_ACTIVE]                        = 1;
GIGGLE_SESSION_INFOS[GIGGLE_SESSION_INFO_HOLD]                          = 1;
GIGGLE_SESSION_INFOS[GIGGLE_SESSION_INFO_MUTE]                          = 1;
GIGGLE_SESSION_INFOS[GIGGLE_SESSION_INFO_RINGING]                       = 1;
GIGGLE_SESSION_INFOS[GIGGLE_SESSION_INFO_UNHOLD]                        = 1;
GIGGLE_SESSION_INFOS[GIGGLE_SESSION_INFO_UNMUTE]                        = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MEDIAS                = {};
GIGGLE_MEDIAS[GIGGLE_MEDIA_AUDIO]                                       = { label: '0' };
GIGGLE_MEDIAS[GIGGLE_MEDIA_VIDEO]                                       = { label: '1' };

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_VIDEO_SOURCES         = {};
GIGGLE_VIDEO_SOURCES[GIGGLE_VIDEO_SOURCE_CAMERA]                        = 1;
GIGGLE_VIDEO_SOURCES[GIGGLE_VIDEO_SOURCE_SCREEN]                        = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MESSAGE_TYPES         = {};
GIGGLE_MESSAGE_TYPES[GIGGLE_MESSAGE_TYPE_ALL]                           = 1;
GIGGLE_MESSAGE_TYPES[GIGGLE_MESSAGE_TYPE_NORMAL]                        = 1;
GIGGLE_MESSAGE_TYPES[GIGGLE_MESSAGE_TYPE_CHAT]                          = 1;
GIGGLE_MESSAGE_TYPES[GIGGLE_MESSAGE_TYPE_HEADLINE]                      = 1;
GIGGLE_MESSAGE_TYPES[GIGGLE_MESSAGE_TYPE_GROUPCHAT]                     = 1;
GIGGLE_MESSAGE_TYPES[GIGGLE_MESSAGE_TYPE_ERROR]                         = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_PRESENCE_TYPES        = {};
GIGGLE_PRESENCE_TYPES[GIGGLE_PRESENCE_TYPE_ALL]                         = 1;
GIGGLE_PRESENCE_TYPES[GIGGLE_PRESENCE_TYPE_AVAILABLE]                   = 1;
GIGGLE_PRESENCE_TYPES[GIGGLE_PRESENCE_TYPE_UNAVAILABLE]                 = 1;
GIGGLE_PRESENCE_TYPES[GIGGLE_PRESENCE_TYPE_ERROR]                       = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_IQ_TYPES              = {};
GIGGLE_IQ_TYPES[GIGGLE_IQ_TYPE_ALL]                                     = 1;
GIGGLE_IQ_TYPES[GIGGLE_IQ_TYPE_RESULT]                                  = 1;
GIGGLE_IQ_TYPES[GIGGLE_IQ_TYPE_SET]                                     = 1;
GIGGLE_IQ_TYPES[GIGGLE_IQ_TYPE_GET]                                     = 1;
GIGGLE_IQ_TYPES[GIGGLE_IQ_TYPE_ERROR]                                   = 1;



/**
 * GIGGLE MUJI CONSTANTS MAPPING
 */

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_ACTIONS          = {};
GIGGLE_MUJI_ACTIONS[GIGGLE_MUJI_ACTION_PREPARE]    = 1;
GIGGLE_MUJI_ACTIONS[GIGGLE_MUJI_ACTION_INITIATE]   = 1;
GIGGLE_MUJI_ACTIONS[GIGGLE_MUJI_ACTION_LEAVE]      = 1;

/**
 * @constant
 * @global
 * @type {Object}
 * @readonly
 * @default
 * @public
 */
var GIGGLE_MUJI_STATUS           = {};
GIGGLE_MUJI_STATUS[GIGGLE_MUJI_STATUS_INACTIVE]    = 1;
GIGGLE_MUJI_STATUS[GIGGLE_MUJI_STATUS_PREPARING]   = 1;
GIGGLE_MUJI_STATUS[GIGGLE_MUJI_STATUS_PREPARED]    = 1;
GIGGLE_MUJI_STATUS[GIGGLE_MUJI_STATUS_INITIATING]  = 1;
GIGGLE_MUJI_STATUS[GIGGLE_MUJI_STATUS_INITIATED]   = 1;
GIGGLE_MUJI_STATUS[GIGGLE_MUJI_STATUS_LEAVING]     = 1;
GIGGLE_MUJI_STATUS[GIGGLE_MUJI_STATUS_LEFT]        = 1;

var GIGGLE_MEDIA_GRANT_SUCCESS = false;
var PROPOSE_TIMEOUT, PROPOSED_CALL_ID;

var GIGGLE_IS_SAFARI = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
var GIGGLE_IS_IE = !!document.documentMode;
var GIGGLE_IS_PluginRTC = GIGGLE_IS_SAFARI || GIGGLE_IS_IE;

var WebRTCPlugin = {};

// polyfilling some WebRTC methods with those of temasys RTC plugin.
window.onPluginRTCInitialized = function(pluginRTCObject) {
    WebRTCPlugin = pluginRTCObject;
    MediaStreamTrack            = WebRTCPlugin.MediaStreamTrack;
    RTCPeerConnection           = WebRTCPlugin.RTCPeerConnection;
    WEBRTC_PEER_CONNECTION      = WebRTCPlugin.RTCPeerConnection;
    RTCIceCandidate             = WebRTCPlugin.RTCIceCandidate;
    WEBRTC_ICE_CANDIDATE        = WebRTCPlugin.RTCIceCandidate;
    RTCSessionDescription       = WebRTCPlugin.RTCSessionDescription;
    WEBRTC_SESSION_DESCRIPTION  = WebRTCPlugin.RTCSessionDescription;
    WEBRTC_GET_MEDIA            = WebRTCPlugin.getUserMedia;
    GIGGLE_AVAILABLE            = WEBRTC_GET_MEDIA ? true : false;
};
if (!!window.PluginRTC) window.onPluginRTCInitialized(window.PluginRTC);