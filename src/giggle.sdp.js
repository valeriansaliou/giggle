/**
 * @fileoverview Giggle library - SDP tools
 *
 * @url https://github.com/valeriansaliou/giggle
 * @author Valérian Saliou https://valeriansaliou.name/
 *
 * @copyright 2015, Hakuma Holdings Ltd.
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module giggle/sdp */
/** @exports GiggleSDP */


/**
 * SDP helpers class.
 * @class
 * @classdesc  SDP helpers class.
 * @requires   nicolas-van/ring.js
 * @requires   giggle/plug
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @param      {GiggleSingle|GiggleMuji} parent Parent class.
 */
var GiggleSDP = ring.create(
  /** @lends GiggleSDP.prototype */
  {
    /**
     * Constructor
     */
    constructor: function(parent) {
      /**
       * @constant
       * @member {GiggleSingle|GiggleMuji}
       * @readonly
       * @default
       * @public
       */
      this.parent = parent;
    },


    /**
     * Parses SDP payload
     * @private
     * @param {String} sdp_payload
     * @returns {Object} Parsed payload object
     */
    _parse_payload: function(sdp_payload) {
      var payload = {};

      try {
        if(!sdp_payload || sdp_payload.indexOf('\n') == -1)  return payload;

        // Common vars
        var lines     = sdp_payload.split('\n');
        var cur_name  = null;
        var cur_media = null;

        var common_transports = {
          'fingerprint' : {},
          'pwd'         : null,
          'ufrag'       : null
        };

        var error, i, j, k,
            cur_line,
            cur_fmtp, cur_fmtp_id, cur_fmtp_values, cur_fmtp_attrs, cur_fmtp_key, cur_fmtp_value,
            cur_rtpmap, cur_rtcp_fb, cur_rtcp_fb_trr_int,
            cur_crypto, cur_zrtp_hash, cur_fingerprint, cur_ssrc,
            cur_ssrc_group, cur_ssrc_group_semantics, cur_ssrc_group_ids, cur_ssrc_group_id,
            cur_extmap, cur_rtpmap_id, cur_rtcp_fb_id, cur_bandwidth,
            m_rtpmap, m_fmtp, m_rtcp_fb, m_rtcp_fb_trr_int, m_crypto, m_zrtp_hash,
            m_fingerprint, m_pwd, m_ufrag, m_ptime, m_maxptime, m_bandwidth, m_media, m_candidate,
            cur_check_name, cur_transport_sub;

        // Common functions
        var init_content = function(name) {
          if(!(name in payload))  payload[name] = {};
        };

        var init_descriptions = function(name, sub, sub_default) {
          init_content(name);

          if(!('descriptions' in payload[name]))     payload[name].descriptions      = {};
          if(!(sub  in payload[name].descriptions))  payload[name].descriptions[sub] = sub_default;
        };

        var init_transports = function(name, sub, sub_default) {
          init_content(name);

          if(!('transports' in payload[name]))     payload[name].transports      = {};
          if(!(sub  in payload[name].transports))  payload[name].transports[sub] = sub_default;
        };

        var init_ssrc = function(name, id) {
          init_descriptions(name, 'ssrc-id', []);
          init_descriptions(name, 'ssrc', {});

          if(payload[name].descriptions['ssrc-id'].indexOf(id) === -1) {
            payload[name].descriptions['ssrc-id'].push(id);
          }

          if(!(id in payload[name].descriptions.ssrc)) {
            payload[name].descriptions.ssrc[id] = [];
          }
        };

        var init_ssrc_group = function(name, semantics) {
          init_descriptions(name, 'ssrc-group', {});

          if(!(semantics in payload[name].descriptions['ssrc-group'])) {
            payload[name].descriptions['ssrc-group'][semantics] = [];
          }
        };

        var init_payload = function(name, id) {
          init_descriptions(name, 'payload', {});

          if(!(id in payload[name].descriptions.payload)) {
            payload[name].descriptions.payload[id] = {
              'attrs'           : {},
              'parameter'       : [],
              'rtcp-fb'         : [],
              'rtcp-fb-trr-int' : []
            };
          }
        };

        var init_encryption = function(name) {
          init_descriptions(name, 'encryption', {
            'attrs'     : {
              'required' : '1'
            },

            'crypto'    : [],
            'zrtp-hash' : []
          });
        };

        for(i in lines) {
          cur_line = lines[i];

          m_media = (R_WEBRTC_SDP_ICE_PAYLOAD.media).exec(cur_line);

          // 'audio/video' line?
          if(m_media) {
            cur_media = m_media[1];
            cur_name  = this.parent.utils.name_generate(cur_media);

            // Push it to parent array
            init_descriptions(cur_name, 'attrs', {});
            payload[cur_name].descriptions.attrs.media = cur_media;

            continue;
          }

          m_bandwidth = (R_WEBRTC_SDP_ICE_PAYLOAD.bandwidth).exec(cur_line);

          // 'bandwidth' line?
          if(m_bandwidth) {
            // Populate current object
            error = 0;
            cur_bandwidth = {};

            cur_bandwidth.type  = m_bandwidth[1]  || error++;
            cur_bandwidth.value = m_bandwidth[2]  || error++;

            // Incomplete?
            if(error !== 0)  continue;

            // Push it to parent array
            init_descriptions(cur_name, 'bandwidth', []);
            payload[cur_name].descriptions.bandwidth.push(cur_bandwidth);

            continue;
          }

          m_rtpmap = (R_WEBRTC_SDP_ICE_PAYLOAD.rtpmap).exec(cur_line);

          // 'rtpmap' line?
          if(m_rtpmap) {
            // Populate current object
            error = 0;
            cur_rtpmap = {};

            cur_rtpmap.channels  = m_rtpmap[6];
            cur_rtpmap.clockrate = m_rtpmap[4];
            cur_rtpmap.id        = m_rtpmap[1] || error++;
            cur_rtpmap.name      = m_rtpmap[3];

            // Incomplete?
            if(error !== 0)  continue;

            cur_rtpmap_id = cur_rtpmap.id;

            // Push it to parent array
            init_payload(cur_name, cur_rtpmap_id);
            payload[cur_name].descriptions.payload[cur_rtpmap_id].attrs = cur_rtpmap;

            continue;
          }

          m_fmtp = (R_WEBRTC_SDP_ICE_PAYLOAD.fmtp).exec(cur_line);

          // 'fmtp' line?
          if(m_fmtp) {
            cur_fmtp_id = m_fmtp[1];

            if(cur_fmtp_id) {
              cur_fmtp_values = m_fmtp[2] ? (m_fmtp[2]).split(';') : [];

              for(j in cur_fmtp_values) {
                // Parse current attribute
                if(cur_fmtp_values[j].indexOf('=') !== -1) {
                  cur_fmtp_attrs = cur_fmtp_values[j].split('=');
                  cur_fmtp_key   = cur_fmtp_attrs[0];
                  cur_fmtp_value = cur_fmtp_attrs[1];

                  while(cur_fmtp_key.length && !cur_fmtp_key[0]) {
                    cur_fmtp_key = cur_fmtp_key.substring(1);
                  }
                } else {
                  cur_fmtp_key = cur_fmtp_values[j];
                  cur_fmtp_value = null;
                }

                // Populate current object
                error = 0;
                cur_fmtp = {};

                cur_fmtp.name  = cur_fmtp_key   || error++;
                cur_fmtp.value = cur_fmtp_value;

                // Incomplete?
                if(error !== 0)  continue;

                // Push it to parent array
                init_payload(cur_name, cur_fmtp_id);
                payload[cur_name].descriptions.payload[cur_fmtp_id].parameter.push(cur_fmtp);
              }
            }

            continue;
          }

          m_rtcp_fb = (R_WEBRTC_SDP_ICE_PAYLOAD.rtcp_fb).exec(cur_line);

          // 'rtcp-fb' line?
          if(m_rtcp_fb) {
            // Populate current object
            error = 0;
            cur_rtcp_fb = {};

            cur_rtcp_fb.id      = m_rtcp_fb[1] || error++;
            cur_rtcp_fb.type    = m_rtcp_fb[2];
            cur_rtcp_fb.subtype = m_rtcp_fb[4];

            // Incomplete?
            if(error !== 0)  continue;

            cur_rtcp_fb_id = cur_rtcp_fb.id;

            // Push it to parent array
            if(cur_rtcp_fb_id == '*') {
              init_descriptions(cur_name, 'rtcp-fb', []);
              (payload[cur_name].descriptions['rtcp-fb']).push(cur_rtcp_fb);
            } else {
              init_payload(cur_name, cur_rtcp_fb_id);
              (payload[cur_name].descriptions.payload[cur_rtcp_fb_id]['rtcp-fb']).push(cur_rtcp_fb);
            }

            continue;
          }

          m_rtcp_fb_trr_int = (R_WEBRTC_SDP_ICE_PAYLOAD.rtcp_fb_trr_int).exec(cur_line);

          // 'rtcp-fb-trr-int' line?
          if(m_rtcp_fb_trr_int) {
            // Populate current object
            error = 0;
            cur_rtcp_fb_trr_int = {};

            cur_rtcp_fb_trr_int.id      = m_rtcp_fb_trr_int[1] || error++;
            cur_rtcp_fb_trr_int.value   = m_rtcp_fb_trr_int[2] || error++;

            // Incomplete?
            if(error !== 0)  continue;

            cur_rtcp_fb_trr_int_id = cur_rtcp_fb_trr_int.id;

            // Push it to parent array
            init_payload(cur_name, cur_rtcp_fb_trr_int_id);
            (payload[cur_name].descriptions.payload[cur_rtcp_fb_trr_int_id]['rtcp-fb-trr-int']).push(cur_rtcp_fb_trr_int);

            continue;
          }

          m_crypto = (R_WEBRTC_SDP_ICE_PAYLOAD.crypto).exec(cur_line);

          // 'crypto' line?
          if(m_crypto) {
            // Populate current object
            error = 0;
            cur_crypto = {};

            cur_crypto['crypto-suite']   = m_crypto[2]  || error++;
            cur_crypto['key-params']     = m_crypto[3]  || error++;
            cur_crypto['session-params'] = m_crypto[5];
            cur_crypto.tag               = m_crypto[1]  || error++;

            // Incomplete?
            if(error !== 0)  continue;

            // Push it to parent array
            init_encryption(cur_name);
            (payload[cur_name].descriptions.encryption.crypto).push(cur_crypto);

            continue;
          }

          m_zrtp_hash = (R_WEBRTC_SDP_ICE_PAYLOAD.zrtp_hash).exec(cur_line);

          // 'zrtp-hash' line?
          if(m_zrtp_hash) {
            // Populate current object
            error = 0;
            cur_zrtp_hash = {};

            cur_zrtp_hash.version = m_zrtp_hash[1]  || error++;
            cur_zrtp_hash.value   = m_zrtp_hash[2]  || error++;

            // Incomplete?
            if(error !== 0)  continue;

            // Push it to parent array
            init_encryption(cur_name);
            (payload[cur_name].descriptions.encryption['zrtp-hash']).push(cur_zrtp_hash);

            continue;
          }

          m_ptime = (R_WEBRTC_SDP_ICE_PAYLOAD.ptime).exec(cur_line);

          // 'ptime' line?
          if(m_ptime) {
            // Push it to parent array
            init_descriptions(cur_name, 'attrs', {});
            payload[cur_name].descriptions.attrs.ptime = m_ptime[1];

            continue;
          }

          m_maxptime = (R_WEBRTC_SDP_ICE_PAYLOAD.maxptime).exec(cur_line);

          // 'maxptime' line?
          if(m_maxptime) {
            // Push it to parent array
            init_descriptions(cur_name, 'attrs', {});
            payload[cur_name].descriptions.attrs.maxptime = m_maxptime[1];

            continue;
          }

          m_ssrc = (R_WEBRTC_SDP_ICE_PAYLOAD.ssrc).exec(cur_line);

          // 'ssrc' line?
          if(m_ssrc) {
            // Populate current object
            error = 0;
            cur_ssrc = {};

            cur_ssrc_id    = m_ssrc[1]  || error++;
            cur_ssrc.name  = m_ssrc[2]  || error++;
            cur_ssrc.value = m_ssrc[4];

            // Incomplete?
            if(error !== 0)  continue;

            // Push it to storage array
            init_ssrc(cur_name, cur_ssrc_id);
            (payload[cur_name].descriptions.ssrc[cur_ssrc_id]).push(cur_ssrc);

            // Push it to parent array (common attr required for Jingle)
            init_descriptions(cur_name, 'attrs', {});
            payload[cur_name].descriptions.attrs.ssrc = cur_ssrc_id;

            continue;
          }

          m_ssrc_group = (R_WEBRTC_SDP_ICE_PAYLOAD.ssrc_group).exec(cur_line);

          // 'ssrc-group' line?
          if(m_ssrc_group) {
            // Populate current object
            error = 0;
            cur_ssrc_group = {};

            cur_ssrc_group_semantics = m_ssrc_group[1]  || error++;
            cur_ssrc_group_ids       = m_ssrc_group[2]  || error++;

            // Explode sources into a list
            cur_ssrc_group.sources = [];
            cur_ssrc_group_ids = cur_ssrc_group_ids.trim();

            if(cur_ssrc_group_ids) {
              cur_ssrc_group_ids = cur_ssrc_group_ids.split(' ');

              for(k in cur_ssrc_group_ids) {
                cur_ssrc_group_id = cur_ssrc_group_ids[k].trim();

                if(cur_ssrc_group_id) {
                  cur_ssrc_group.sources.push({
                    'ssrc': cur_ssrc_group_id
                  });
                }
              }
            }

            if(cur_ssrc_group.sources.length === 0)  error++;

            // Incomplete?
            if(error !== 0)  continue;

            // Push it to storage array
            init_ssrc_group(cur_name, cur_ssrc_group_semantics);
            (payload[cur_name].descriptions['ssrc-group'][cur_ssrc_group_semantics]).push(cur_ssrc_group);

            continue;
          }

          m_rtcp_mux = (R_WEBRTC_SDP_ICE_PAYLOAD.rtcp_mux).exec(cur_line);

          // 'rtcp-mux' line?
          if(m_rtcp_mux) {
            // Push it to parent array
            init_descriptions(cur_name, 'rtcp-mux', 1);

            continue;
          }

          m_extmap = (R_WEBRTC_SDP_ICE_PAYLOAD.extmap).exec(cur_line);

          // 'extmap' line?
          if(m_extmap) {
            // Populate current object
            error = 0;
            cur_extmap = {};

            cur_extmap.id      = m_extmap[1]  || error++;
            cur_extmap.uri     = m_extmap[4]  || error++;
            cur_extmap.senders = m_extmap[3];

            // Incomplete?
            if(error !== 0)  continue;

            // Push it to parent array
            init_descriptions(cur_name, 'rtp-hdrext', []);
            (payload[cur_name].descriptions['rtp-hdrext']).push(cur_extmap);

            continue;
          }

          m_fingerprint = (R_WEBRTC_SDP_ICE_PAYLOAD.fingerprint).exec(cur_line);

          // 'fingerprint' line?
          if(m_fingerprint) {
            // Populate current object
            error = 0;
            cur_fingerprint = common_transports.fingerprint || {};

            cur_fingerprint.hash  = m_fingerprint[1]  || error++;
            cur_fingerprint.value = m_fingerprint[2]  || error++;

            // Incomplete?
            if(error !== 0)  continue;

            // Push it to parent array
            init_transports(cur_name, 'fingerprint', cur_fingerprint);
            common_transports.fingerprint = cur_fingerprint;

            continue;
          }

          m_setup = (R_WEBRTC_SDP_ICE_PAYLOAD.setup).exec(cur_line);

          // 'setup' line?
          if(m_setup) {
            // Populate current object
            cur_fingerprint = common_transports.fingerprint || {};
            cur_fingerprint.setup = m_setup[1];

            // Push it to parent array
            if(cur_fingerprint.setup) {
              // Map it to fingerprint as XML-wise it is related
              init_transports(cur_name, 'fingerprint', cur_fingerprint);
              common_transports.fingerprint = cur_fingerprint;
            }

            continue;
          }

          m_pwd = (R_WEBRTC_SDP_ICE_PAYLOAD.pwd).exec(cur_line);

          // 'pwd' line?
          if(m_pwd) {
            init_transports(cur_name, 'pwd', m_pwd[1]);

            if(!common_transports.pwd) {
              common_transports.pwd = m_pwd[1];
            }

            continue;
          }

          m_ufrag = (R_WEBRTC_SDP_ICE_PAYLOAD.ufrag).exec(cur_line);

          // 'ufrag' line?
          if(m_ufrag) {
            init_transports(cur_name, 'ufrag', m_ufrag[1]);

            if(!common_transports.ufrag) {
              common_transports.ufrag = m_ufrag[1];
            }

            continue;
          }

          // 'candidate' line? (shouldn't be there)
          m_candidate = R_WEBRTC_SDP_CANDIDATE.exec(cur_line);

          if(m_candidate) {
            this._parse_candidate_store({
              media     : cur_media,
              candidate : cur_line
            });

            continue;
          }
        }

        // Filter medias
        for(cur_check_name in payload) {
          // Undesired media?
          if(!this.parent.get_name()[cur_check_name]) {
            delete payload[cur_check_name]; continue;
          }

          // Validate transports
          if(typeof payload[cur_check_name].transports !== 'object') {
            payload[cur_check_name].transports = {};
          }

          for(cur_transport_sub in common_transports) {
            if(!payload[cur_check_name].transports[cur_transport_sub]) {
              payload[cur_check_name].transports[cur_transport_sub] = common_transports[cur_transport_sub];
            }
          }
        }
      } catch(e) {
        this.parent.get_debug().log('[giggle:sdp] _parse_payload > ' + e, 1);
      }

      return payload;
    },

    /**
     * Parses SDP group
     * @private
     * @param {String} sdp_payload
     * @returns {Object} Parsed group object
     */
    _parse_group: function(sdp_payload) {
      var group = {};

      try {
        if(!sdp_payload || sdp_payload.indexOf('\n') == -1)  return group;

        // Common vars
        var lines = sdp_payload.split('\n');
        var i, cur_line,
            m_group;

        var init_group = function(semantics) {
          if(!(semantics in group))  group[semantics] = [];
        };

        for(i in lines) {
          cur_line = lines[i];

          // 'group' line?
          m_group = (R_WEBRTC_SDP_ICE_PAYLOAD.group).exec(cur_line);

          if(m_group) {
            if(m_group[1] && m_group[2]) {
              init_group(m_group[1]);

              group[m_group[1]] = (m_group[2].indexOf(' ') === -1 ? [m_group[2]] : m_group[2].split(' '));
            }

            continue;
          }
        }
      } catch(e) {
        this.parent.get_debug().log('[giggle:sdp] _parse_group > ' + e, 1);
      }

      return group;
    },

    /**
     * Update video resolution in payload
     * @private
     * @param {Object} payload
     * @returns {Object} Updated payload
     */
    _resolution_payload: function(payload) {
      try {
        if(!payload || typeof payload !== 'object') return {};

        // No video?
        if(this.parent.get_media_all().indexOf(GIGGLE_MEDIA_VIDEO) === -1) return payload;

        var i, j, k, cur_media;
        var cur_payload, res_arr, constraints;
        var res_height = null;
        var res_width  = null;

        // Try local view? (more reliable)
        for(i in this.parent.get_local_view()) {
          if(typeof this.parent.get_local_view()[i].videoWidth  == 'number'  &&
             typeof this.parent.get_local_view()[i].videoHeight == 'number'  ) {
            res_height = this.parent.get_local_view()[i].videoHeight;
            res_width  = this.parent.get_local_view()[i].videoWidth;

            if(res_height && res_width)  break;
          }
        }

        // Try media constraints? (less reliable)
        if(!res_height || !res_width) {
          this.parent.get_debug().log('[giggle:sdp] _resolution_payload > Could not get local video resolution, falling back on constraints (local video may not be ready).', 0);

          constraints = this.parent.utils.generate_constraints();

          // Still nothing?!
          if(typeof constraints.video                     !== 'object'  ||
             typeof constraints.video.mandatory           !== 'object'  ||
             typeof constraints.video.mandatory.minWidth  !== 'number'  ||
             typeof constraints.video.mandatory.minHeight !== 'number'  ) {
            this.parent.get_debug().log('[giggle:sdp] _resolution_payload > Could not get local video resolution (not sending it).', 1);
            return payload;
          }

          res_height = constraints.video.mandatory.minHeight;
          res_width  = constraints.video.mandatory.minWidth;
        }

        // Constraints to be used
        res_arr = [
          {
            name  : 'height',
            value : res_height
          },

          {
            name  : 'width',
            value : res_width
          }
        ];

        for(cur_media in payload) {
          if(cur_media != GIGGLE_MEDIA_VIDEO)  continue;

          cur_payload = payload[cur_media].descriptions.payload;

          for(j in cur_payload) {
            if(typeof cur_payload[j].parameter !== 'object') {
              cur_payload[j].parameter = [];
            }

            for(k in res_arr) {
              (cur_payload[j].parameter).push(res_arr[k]);
            }
          }
        }

        this.parent.get_debug().log('[giggle:sdp] _resolution_payload > Got local video resolution (' + res_width + 'x' + res_height + ').', 2);
      } catch(e) {
        this.parent.get_debug().log('[giggle:sdp] _resolution_payload > ' + e, 1);
      }

      return payload;
    },

    /**
     * Parses SDP candidate
     * @private
     * @param {String} sdp_candidate
     * @returns {Object} Parsed candidates object
     */
    _parse_candidate: function(sdp_candidate) {
      var candidate = {};

      try {
        if(!sdp_candidate)  return candidate;

        var error     = 0;
        var matches   = R_WEBRTC_DATA_CANDIDATE.exec(sdp_candidate);

        // Matches!
        if(matches) {
          candidate.component     = matches[2]  || error++;
          candidate.foundation    = matches[1]  || error++;
          candidate.generation    = matches[16] || GIGGLE_GENERATION;
          candidate.id            = this.parent.utils.generate_id();
          candidate.ip            = matches[5]  || error++;
          candidate.network       = GIGGLE_NETWORK;
          candidate.port          = matches[6]  || error++;
          candidate.priority      = matches[4]  || error++;
          candidate.protocol      = matches[3]  || error++;
          candidate['rel-addr']   = matches[11];
          candidate['rel-port']   = matches[13];
          candidate.type          = matches[8]  || error++;
        }

        // Incomplete?
        if(error !== 0)  return {};
      } catch(e) {
        this.parent.get_debug().log('[giggle:sdp] _parse_candidate > ' + e, 1);
      }

      return candidate;
    },

    /**
     * Parses SDP candidate & store it
     * @private
     * @param {Object} sdp_candidate
     */
    _parse_candidate_store: function(sdp_candidate) {
      // Store received candidate
      var candidate_media = sdp_candidate.media;
      var candidate_data  = sdp_candidate.candidate;

      // Convert SDP raw data to an object
      var candidate_obj   = this._parse_candidate(candidate_data);
      var candidate_name  = this.parent.utils.name_generate(candidate_media);

      this.parent._set_candidates_local(
        candidate_name,
        candidate_obj
      );

      // Enqueue candidate
      this.parent._set_candidates_queue_local(
        candidate_name,
        candidate_obj
      );
    },

    /**
     * Parses SDP candidate & store it from data
     * @private
     * @param {Object} data
     */
    _parse_candidate_store_store_data: function(data) {
      this._parse_candidate_store({
        media     : (isNaN(data.candidate.sdpMid) ? data.candidate.sdpMid
                                                  : this.parent.utils.media_generate(parseInt(data.candidate.sdpMid, 10))),
        candidate : data.candidate.candidate
      });
    },

    /**
     * Generates SDP description
     * @private
     * @param {String} type
     * @param {Object} group
     * @param {Object} payloads
     * @param {Object} candidates
     * @returns {Object} SDP object
     */
    _generate: function(type, group, payloads, candidates) {
      try {
        var sdp_obj = {};

        sdp_obj.candidates  = this._generate_candidates(candidates);
        sdp_obj.description = this._generate_description(type, group, payloads, sdp_obj.candidates);

        return sdp_obj;
      } catch(e) {
        this.parent.get_debug().log('[giggle:sdp] _generate > ' + e, 1);
      }

      return {};
    },

    /**
     * Generate SDP candidates
     * @private
     * @param {Object} candidates
     * @returns {Array} SDP candidates array
     */
    _generate_candidates: function(candidates) {
      var candidates_arr = [];

      try {
        // Parse candidates
        var i,
            cur_media, cur_name, cur_c_name, cur_candidate,
            cur_label, cur_id, cur_candidate_str;

        for(cur_name in candidates) {
          cur_c_name  = candidates[cur_name];
          cur_media   = this.parent.utils.media_generate(cur_name);

          for(i in cur_c_name) {
            cur_candidate = cur_c_name[i];

            cur_label         = GIGGLE_MEDIAS[cur_media].label;
            cur_id            = cur_label;
            cur_candidate_str = '';

            cur_candidate_str += 'a=candidate:';
            cur_candidate_str += (cur_candidate.foundation || cur_candidate.id);
            cur_candidate_str += ' ';
            cur_candidate_str += cur_candidate.component;
            cur_candidate_str += ' ';
            cur_candidate_str += cur_candidate.protocol || GIGGLE_SDP_CANDIDATE_PROTOCOL_DEFAULT;
            cur_candidate_str += ' ';
            cur_candidate_str += cur_candidate.priority || GIGGLE_SDP_CANDIDATE_PRIORITY_DEFAULT;
            cur_candidate_str += ' ';
            cur_candidate_str += cur_candidate.ip;
            cur_candidate_str += ' ';
            cur_candidate_str += cur_candidate.port;

            if(cur_candidate.type) {
              cur_candidate_str += ' ';
              cur_candidate_str += 'typ';
              cur_candidate_str += ' ';
              cur_candidate_str += cur_candidate.type;
            }

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

            if(cur_candidate.generation) {
              cur_candidate_str += ' ';
              cur_candidate_str += 'generation';
              cur_candidate_str += ' ';
              cur_candidate_str += cur_candidate.generation;
            }

            cur_candidate_str   += WEBRTC_SDP_LINE_BREAK;

            candidates_arr.push({
              label     : cur_label,
              id        : cur_id,
              candidate : cur_candidate_str
            });
          }
        }
      } catch(e) {
        this.parent.get_debug().log('[giggle:sdp] _generate_candidates > ' + e, 1);
      }

      return candidates_arr;
    },

    /**
     * Generates SDP description
     * @private
     * @param {String} type
     * @param {Object} group
     * @param {Object} payloads
     * @param {Object} sdp_candidates
     * @returns {Object} SDP description payloads
     */
    _generate_description: function(type, group, payloads, sdp_candidates) {
      var payloads_obj = {};

      try {
        var payloads_str = '';
        var is_common_credentials = this.parent.utils.is_sdp_common_credentials(payloads);

        // Common vars
        var i, c, j, k, l, m, n, o, p, q, r, s, t, u, v,
            cur_name, cur_name_first, cur_name_obj,
            cur_media, cur_senders,
            cur_group_semantics, cur_group_names, cur_group_name,
            cur_network_obj, cur_transports_obj, cur_transports_obj_first, cur_description_obj,
            cur_d_pwd, cur_d_ufrag, cur_d_fingerprint,
            cur_d_attrs, cur_d_rtcp_fb, cur_d_bandwidth, cur_d_encryption,
            cur_d_ssrc_id_arr, cur_d_ssrc, cur_d_ssrc_id, cur_d_ssrc_obj, cur_d_ssrc_group, cur_d_ssrc_group_semantics, cur_d_ssrc_group_obj,
            cur_d_rtcp_fb_obj,
            cur_d_payload, cur_d_payload_obj, cur_d_payload_obj_attrs, cur_d_payload_obj_id,
            cur_d_payload_obj_parameter, cur_d_payload_obj_parameter_obj, cur_d_payload_obj_parameter_str,
            cur_d_payload_obj_rtcp_fb, cur_d_payload_obj_rtcp_fb_obj,
            cur_d_payload_obj_rtcp_fb_ttr_int, cur_d_payload_obj_rtcp_fb_ttr_int_obj,
            cur_d_crypto_obj, cur_d_zrtp_hash_obj,
            cur_d_rtp_hdrext, cur_d_rtp_hdrext_obj,
            cur_d_rtcp_mux;

        // Payloads headers
        payloads_str += this._generate_protocol_version();
        payloads_str += WEBRTC_SDP_LINE_BREAK;
        payloads_str += this._generate_origin();
        payloads_str += WEBRTC_SDP_LINE_BREAK;
        payloads_str += this._generate_session_name();
        payloads_str += WEBRTC_SDP_LINE_BREAK;
        payloads_str += this._generate_timing();
        payloads_str += WEBRTC_SDP_LINE_BREAK;

        // Add groups
        for(cur_group_semantics in group) {
          cur_group_names = group[cur_group_semantics];

          payloads_str += 'a=group:' + cur_group_semantics;

          for(s in cur_group_names) {
            cur_group_name = cur_group_names[s];
            payloads_str += ' ' + cur_group_name;
          }

          payloads_str += WEBRTC_SDP_LINE_BREAK;
        }

        // Common credentials?
        if(is_common_credentials === true) {
          for(cur_name_first in payloads) {
            cur_transports_obj_first = payloads[cur_name_first].transports || {};

            payloads_str += this._generate_credentials(
              cur_transports_obj_first.ufrag,
              cur_transports_obj_first.pwd,
              cur_transports_obj_first.fingerprint
            );

            break;
          }
        }

        // Add media groups
        for(cur_name in payloads) {
          cur_name_obj          = payloads[cur_name];
          cur_senders           = this.parent.get_senders(cur_name);
          cur_media             = this.parent.get_name(cur_name) ? this.parent.utils.media_generate(cur_name) : null;

          // No media?
          if(!cur_media) continue;

          // Network
          cur_network_obj       = this.parent.utils.network_extract_main(cur_name, sdp_candidates);

          // Transports
          cur_transports_obj    = cur_name_obj.transports || {};
          cur_d_pwd             = cur_transports_obj.pwd;
          cur_d_ufrag           = cur_transports_obj.ufrag;
          cur_d_fingerprint     = cur_transports_obj.fingerprint;

          // Descriptions
          cur_description_obj   = cur_name_obj.descriptions;
          cur_d_attrs           = cur_description_obj.attrs;
          cur_d_rtcp_fb         = cur_description_obj['rtcp-fb'];
          cur_d_bandwidth       = cur_description_obj.bandwidth;
          cur_d_payload         = cur_description_obj.payload;
          cur_d_encryption      = cur_description_obj.encryption;
          cur_d_ssrc_id_arr     = cur_description_obj['ssrc-id'];
          cur_d_ssrc            = cur_description_obj.ssrc;
          cur_d_ssrc_group      = cur_description_obj['ssrc-group'];
          cur_d_rtp_hdrext      = cur_description_obj['rtp-hdrext'];
          cur_d_rtcp_mux        = cur_description_obj['rtcp-mux'];

          // Current media
          payloads_str += this._generate_description_media(
            cur_media,
            cur_network_obj.port,
            cur_d_encryption,
            cur_d_fingerprint,
            cur_d_payload
          );
          payloads_str += WEBRTC_SDP_LINE_BREAK;

          payloads_str += 'c=' +
                          cur_network_obj.scope + ' ' +
                          cur_network_obj.protocol + ' ' +
                          cur_network_obj.ip;
          payloads_str += WEBRTC_SDP_LINE_BREAK;

          payloads_str += 'a=rtcp:' +
                          cur_network_obj.port + ' ' +
                          cur_network_obj.scope + ' ' +
                          cur_network_obj.protocol + ' ' +
                          cur_network_obj.ip;
          payloads_str += WEBRTC_SDP_LINE_BREAK;

          // Specific credentials?
          if(is_common_credentials === false) {
            payloads_str += this._generate_credentials(
              cur_d_ufrag,
              cur_d_pwd,
              cur_d_fingerprint
            );
          }

          // Fingerprint
          if(cur_d_fingerprint && cur_d_fingerprint.setup) {
            payloads_str += 'a=setup:' + cur_d_fingerprint.setup;
            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }

          // RTP-HDREXT
          if(cur_d_rtp_hdrext && cur_d_rtp_hdrext.length) {
            for(i in cur_d_rtp_hdrext) {
              cur_d_rtp_hdrext_obj = cur_d_rtp_hdrext[i];

              payloads_str += 'a=extmap:' + cur_d_rtp_hdrext_obj.id;

              if(cur_d_rtp_hdrext_obj.senders) {
                payloads_str += '/' + cur_d_rtp_hdrext_obj.senders;
              }

              payloads_str += ' ' + cur_d_rtp_hdrext_obj.uri;
              payloads_str += WEBRTC_SDP_LINE_BREAK;
            }
          }

          // Senders
          if(cur_senders) {
            payloads_str += 'a=' + GIGGLE_SENDERS[cur_senders];
            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }

          // Name
          if(cur_media && GIGGLE_MEDIAS[cur_media]) {
            payloads_str += 'a=mid:' + (GIGGLE_MEDIAS[cur_media]).label;
            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }

          // RTCP-MUX
          // WARNING: no spec!
          // See: http://code.google.com/p/libjingle/issues/detail?id=309
          //      http://mail.jabber.org/pipermail/jingle/2011-December/001761.html
          if(cur_d_rtcp_mux) {
            payloads_str += 'a=rtcp-mux';
            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }

          // 'encryption'
          if(cur_d_encryption) {
            // 'crypto'
            for(j in cur_d_encryption.crypto) {
              cur_d_crypto_obj = cur_d_encryption.crypto[j];

              payloads_str += 'a=crypto:'                       +
                              cur_d_crypto_obj.tag              + ' ' +
                              cur_d_crypto_obj['crypto-suite']  + ' ' +
                              cur_d_crypto_obj['key-params']    +
                              (cur_d_crypto_obj['session-params'] ? (' ' + cur_d_crypto_obj['session-params']) : '');

              payloads_str += WEBRTC_SDP_LINE_BREAK;
            }

            // 'zrtp-hash'
            for(p in cur_d_encryption['zrtp-hash']) {
              cur_d_zrtp_hash_obj = cur_d_encryption['zrtp-hash'][p];

              payloads_str += 'a=zrtp-hash:'               +
                              cur_d_zrtp_hash_obj.version  + ' ' +
                              cur_d_zrtp_hash_obj.value;

              payloads_str += WEBRTC_SDP_LINE_BREAK;
            }
          }

          // 'rtcp-fb' (common)
          for(n in cur_d_rtcp_fb) {
            cur_d_rtcp_fb_obj = cur_d_rtcp_fb[n];

            payloads_str += 'a=rtcp-fb:*';
            payloads_str += ' ' + cur_d_rtcp_fb_obj.type;

            if(cur_d_rtcp_fb_obj.subtype) {
              payloads_str += ' ' + cur_d_rtcp_fb_obj.subtype;
            }

            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }

          // 'bandwidth' (common)
          for(q in cur_d_bandwidth) {
            cur_d_bandwidth_obj = cur_d_bandwidth[q];

            payloads_str += 'b=' + cur_d_bandwidth_obj.type;
            payloads_str += ':'  + cur_d_bandwidth_obj.value;
            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }

          // 'payload-type'
          for(k in cur_d_payload) {
            cur_d_payload_obj                 = cur_d_payload[k];
            cur_d_payload_obj_attrs           = cur_d_payload_obj.attrs;
            cur_d_payload_obj_parameter       = cur_d_payload_obj.parameter;
            cur_d_payload_obj_rtcp_fb         = cur_d_payload_obj['rtcp-fb'];
            cur_d_payload_obj_rtcp_fb_ttr_int = cur_d_payload_obj['rtcp-fb-trr-int'];

            cur_d_payload_obj_id              = cur_d_payload_obj_attrs.id;

            payloads_str += 'a=rtpmap:' + cur_d_payload_obj_id;

            // 'rtpmap'
            if(cur_d_payload_obj_attrs.name) {
              payloads_str += ' ' + cur_d_payload_obj_attrs.name;

              if(cur_d_payload_obj_attrs.clockrate) {
                payloads_str += '/' + cur_d_payload_obj_attrs.clockrate;

                if(cur_d_payload_obj_attrs.channels) {
                  payloads_str += '/' + cur_d_payload_obj_attrs.channels;
                }
              }
            }

            payloads_str += WEBRTC_SDP_LINE_BREAK;

            // 'parameter'
            if(cur_d_payload_obj_parameter.length) {
              payloads_str += 'a=fmtp:' + cur_d_payload_obj_id + ' ';
              cur_d_payload_obj_parameter_str = '';

              for(o in cur_d_payload_obj_parameter) {
                cur_d_payload_obj_parameter_obj = cur_d_payload_obj_parameter[o];

                if(cur_d_payload_obj_parameter_str) {
                  cur_d_payload_obj_parameter_str += ';';
                }

                cur_d_payload_obj_parameter_str += cur_d_payload_obj_parameter_obj.name;

                if(cur_d_payload_obj_parameter_obj.value !== null) {
                  cur_d_payload_obj_parameter_str += '=';
                  cur_d_payload_obj_parameter_str += cur_d_payload_obj_parameter_obj.value;
                }
              }

              payloads_str += cur_d_payload_obj_parameter_str;
              payloads_str += WEBRTC_SDP_LINE_BREAK;
            }

            // 'rtcp-fb' (sub)
            for(l in cur_d_payload_obj_rtcp_fb) {
              cur_d_payload_obj_rtcp_fb_obj = cur_d_payload_obj_rtcp_fb[l];

              payloads_str += 'a=rtcp-fb:' + cur_d_payload_obj_id;
              payloads_str += ' ' + cur_d_payload_obj_rtcp_fb_obj.type;

              if(cur_d_payload_obj_rtcp_fb_obj.subtype) {
                payloads_str += ' ' + cur_d_payload_obj_rtcp_fb_obj.subtype;
              }

              payloads_str += WEBRTC_SDP_LINE_BREAK;
            }

            // 'rtcp-fb-ttr-int'
            for(m in cur_d_payload_obj_rtcp_fb_ttr_int) {
              cur_d_payload_obj_rtcp_fb_ttr_int_obj = cur_d_payload_obj_rtcp_fb_ttr_int[m];

              payloads_str += 'a=rtcp-fb:' + cur_d_payload_obj_id;
              payloads_str += ' ' + 'trr-int';
              payloads_str += ' ' + cur_d_payload_obj_rtcp_fb_ttr_int_obj.value;
              payloads_str += WEBRTC_SDP_LINE_BREAK;
            }
          }

          if(cur_d_attrs.ptime)     payloads_str += 'a=ptime:'    + cur_d_attrs.ptime + WEBRTC_SDP_LINE_BREAK;
          if(cur_d_attrs.maxptime)  payloads_str += 'a=maxptime:' + cur_d_attrs.maxptime + WEBRTC_SDP_LINE_BREAK;

          // 'ssrc-group'
          for(cur_d_ssrc_group_semantics in cur_d_ssrc_group) {
            for(t in cur_d_ssrc_group[cur_d_ssrc_group_semantics]) {
              cur_d_ssrc_group_obj = cur_d_ssrc_group[cur_d_ssrc_group_semantics][t];

              payloads_str += 'a=ssrc-group';
              payloads_str += ':' + cur_d_ssrc_group_semantics;

              for(u in cur_d_ssrc_group_obj.sources) {
                payloads_str += ' ' + cur_d_ssrc_group_obj.sources[u].ssrc;
              }

              payloads_str += WEBRTC_SDP_LINE_BREAK;
            }
          }

          // 'ssrc'
          for(v in cur_d_ssrc_id_arr) {
            cur_d_ssrc_id = cur_d_ssrc_id_arr[v];

            for(r in cur_d_ssrc[cur_d_ssrc_id]) {
              cur_d_ssrc_obj = cur_d_ssrc[cur_d_ssrc_id][r];

              payloads_str += 'a=ssrc';
              payloads_str += ':' + cur_d_ssrc_id;
              payloads_str += ' ' + cur_d_ssrc_obj.name;

              if(cur_d_ssrc_obj.value) {
                payloads_str += ':' + cur_d_ssrc_obj.value;
              }

              payloads_str += WEBRTC_SDP_LINE_BREAK;
            }
          }

          // Candidates (some browsers require them there, too)
          if(typeof sdp_candidates == 'object') {
            for(c in sdp_candidates) {
              if((sdp_candidates[c]).label == GIGGLE_MEDIAS[cur_media].label) {
                payloads_str += (sdp_candidates[c]).candidate;
              }
            }
          }
        }

        // Push to object
        payloads_obj.type = type;
        payloads_obj.sdp  = payloads_str;
      } catch(e) {
        this.parent.get_debug().log('[giggle:sdp] _generate_description > ' + e, 1);
      }

      return payloads_obj;
    },

    /**
     * Generates SDP protocol version
     * @private
     * @returns {String} SDP protocol version raw text
     */
    _generate_protocol_version: function() {
      return 'v=0';
    },

    /**
     * Generates SDP origin
     * @private
     * @returns {String} SDP origin raw text
     */
    _generate_origin: function() {
      var sdp_origin = '';

      try {
        // Values
        var jid = new this.parent.utils.jid(
          this.parent.utils, this.parent.get_initiator()
        );

        var username        = jid.node() ? jid.node() : '-';
        var session_id      = '1';
        var session_version = '1';
        var nettype         = GIGGLE_SDP_CANDIDATE_SCOPE_DEFAULT;
        var addrtype        = GIGGLE_SDP_CANDIDATE_IPVERSION_DEFAULT;
        var unicast_address = GIGGLE_SDP_CANDIDATE_IP_DEFAULT;

        // Line content
        sdp_origin += 'o=';
        sdp_origin += username         + ' ';
        sdp_origin += session_id       + ' ';
        sdp_origin += session_version  + ' ';
        sdp_origin += nettype          + ' ';
        sdp_origin += addrtype         + ' ';
        sdp_origin += unicast_address;
      } catch(e) {
        this.parent.get_debug().log('[giggle:sdp] _generate_origin > ' + e, 1);
      }

      return sdp_origin;
    },

    /**
     * Generates SDP session name
     * @private
     * @returns {String} SDP session name raw text
     */
    _generate_session_name: function() {
      return ('s=' + (this.parent.get_sid() || '-'));
    },

    /**
     * Generates SDP timing
     * @private
     * @returns {String} SDP timing raw text
     */
    _generate_timing: function() {
      return 't=0 0';
    },

    /**
     * Generates SDP credentials
     * @private
     * @param {String} ufrag
     * @param {String} pwd
     * @param {Object} fingerprint
     * @returns {String} SDP credentials raw text
     */
    _generate_credentials: function(ufrag, pwd, fingerprint) {
      var sdp = '';

      // ICE credentials
      if(ufrag)  sdp += ('a=ice-ufrag:' + ufrag + WEBRTC_SDP_LINE_BREAK);
      if(pwd)    sdp += ('a=ice-pwd:'   + pwd   + WEBRTC_SDP_LINE_BREAK);

      // Fingerprint
      if(fingerprint) {
        if(fingerprint.hash && fingerprint.value) {
          sdp += ('a=fingerprint:' + fingerprint.hash + ' ' + fingerprint.value);
          sdp += WEBRTC_SDP_LINE_BREAK;
        }
      }

      return sdp;
    },

    /**
     * Generates SDP media description
     * @private
     * @param {String} media
     * @param {String} port
     * @param {String} crypto
     * @param {Object} fingerprint
     * @param {Array} payload
     * @returns {String} SDP media raw text
     */
    _generate_description_media: function(media, port, crypto, fingerprint, payload) {
      var sdp_media = '';

      try {
        var i;
        var type_ids = [];

        sdp_media += ('m=' + media + ' ' + port + ' ');

        // Protocol
        if((crypto && crypto.length) || (fingerprint && fingerprint.hash && fingerprint.value)) {
          sdp_media += 'RTP/SAVPF';
        } else {
          sdp_media += 'RTP/AVPF';
        }

        // Payload type IDs
        for(i in payload)  type_ids.push(payload[i].attrs.id);

        sdp_media += (' ' + type_ids.join(' '));
      } catch(e) {
        this.parent.get_debug().log('[giggle:sdp] _generate_description_media > ' + e, 1);
      }

      return sdp_media;
    },
  }
);
