/**
 * @fileoverview JSJaC Jingle library - Utilities
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


var JSJaCJingleUtils = ring.create({
  /**
   * Constructor
   */
  constructor: function(parent) {
    this.parent = parent;
  },

  /**
   * Removes a given array value
   * @return new array
   * @type object
   */
  array_remove_value: function(array, value) {
    try {
      var i;

      for(i = 0; i < array.length; i++) {
        if(array[i] === value) {
          array.splice(i, 1); i--;
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] array_remove_value > ' + e, 1);
    }

    return array;
  },

  /**
   * Returns whether an object is empty or not
   * @return Empty value
   * @type boolean
   */
  object_length: function(object) {    
    var key;
    var l = 0;

    try {
      for(key in object) {
        if(object.hasOwnProperty(key))  l++;
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] object_length > ' + e, 1);
    }

    return l;
  },

  /**
   * Collects given objects
   * @return Empty value
   * @type object
   */
  object_collect: function() {    
    var i, p;

    var collect_obj = {};
    var len = arguments.length;

    for(i = 0; i < len; i++) {
      for(p in arguments[i]) {
        if(arguments[i].hasOwnProperty(p))
          collect_obj[p] = arguments[i][p];
      }
    }

    return collect_obj;
  },

  /**
   * Clones a given object
   * @return Cloned object
   * @type object
   */
  object_clone: function(object) {    
    try {
      var copy, i, attr;

      // Assert
      if(object === null || typeof object !== 'object') return object;

      // Handle Date
      if(object instanceof Date) {
          copy = new Date();
          copy.setTime(object.getTime());

          return copy;
      }

      // Handle Array
      if(object instanceof Array) {
          copy = [];

          for(i = 0, len = object.length; i < len; i++)
            copy[i] = this.object_clone(object[i]);

          return copy;
      }

      // Handle Object
      if(object instanceof Object) {
          copy = {};

          for(attr in object) {
              if(object.hasOwnProperty(attr))
                copy[attr] = this.object_clone(object[attr]);
          }

          return copy;
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] object_clone > ' + e, 1);
    }

    this.parent.get_debug().log('[JSJaCJingle:utils] object_clone > Cannot clone this object.', 1);
  },

  /**
   * Gets the browser info
   * @return browser info
   * @type object
   */
  browser: function() {    
    var browser_info = {
      name    : 'Generic'
    };

    try {
      var user_agent, detect_arr, cur_browser;

      detect_arr = {
        'firefox' : JSJAC_JINGLE_BROWSER_FIREFOX,
        'chrome'  : JSJAC_JINGLE_BROWSER_CHROME,
        'safari'  : JSJAC_JINGLE_BROWSER_SAFARI,
        'opera'   : JSJAC_JINGLE_BROWSER_OPERA,
        'msie'    : JSJAC_JINGLE_BROWSER_IE
      };

      user_agent = navigator.userAgent.toLowerCase();

      for(cur_browser in detect_arr) {
        if(user_agent.indexOf(cur_browser) > -1) {
          browser_info.name = detect_arr[cur_browser];
          break;
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] browser > ' + e, 1);
    }

    return browser_info;
  },

  /**
   * Gets the ICE config
   * @return ICE config
   * @type object
   */
  config_ice: function() {    
    try {
      // Collect data (user + server)
      var stun_config = this.object_collect(
        this.parent.get_stun(),
        JSJAC_JINGLE_STORE_EXTDISCO.stun,
        JSJAC_JINGLE_STORE_RELAYNODES.stun,
        JSJAC_JINGLE_STORE_FALLBACK.stun
      );

      var turn_config = this.object_collect(
        this.parent.get_turn(),
        JSJAC_JINGLE_STORE_EXTDISCO.turn,
        JSJAC_JINGLE_STORE_FALLBACK.turn
      );

      // Can proceed?
      if(stun_config && this.object_length(stun_config)  || 
         turn_config && this.object_length(turn_config)  ) {
        var config = {
          iceServers : []
        };

        // STUN servers
        var cur_stun_host, cur_stun_obj, cur_stun_config;

        for(cur_stun_host in stun_config) {
          if(cur_stun_host) {
            cur_stun_obj = stun_config[cur_stun_host];

            cur_stun_config = {};
            cur_stun_config.url = 'stun:' + cur_stun_host;

            if(cur_stun_obj.port)
              cur_stun_config.url += ':' + cur_stun_obj.port;

            if(cur_stun_obj.transport && this.browser().name != JSJAC_JINGLE_BROWSER_FIREFOX)
              cur_stun_config.url += '?transport=' + cur_stun_obj.transport;

            (config.iceServers).push(cur_stun_config);
          }
        }

        // TURN servers
        var cur_turn_host, cur_turn_obj, cur_turn_config;

        for(cur_turn_host in turn_config) {
          if(cur_turn_host) {
            cur_turn_obj = turn_config[cur_turn_host];

            cur_turn_config = {};
            cur_turn_config.url = 'turn:' + cur_turn_host;

            if(cur_turn_obj.port)
              cur_turn_config.url += ':' + cur_turn_obj.port;

            if(cur_turn_obj.transport)
              cur_turn_config.url += '?transport=' + cur_turn_obj.transport;

            if(cur_turn_obj.username)
              cur_turn_config.username = cur_turn_obj.username;

            if(cur_turn_obj.password)
              cur_turn_config.password = cur_turn_obj.password;

            (config.iceServers).push(cur_turn_config);
          }
        }

        // Check we have at least a STUN server (if user can traverse NAT)
        var i;
        var has_stun = false;

        for(i in config.iceServers) {
          if((config.iceServers[i].url).match(R_NETWORK_PROTOCOLS.stun)) {
            has_stun = true; break;
          }
        }

        if(!has_stun) {
          (config.iceServers).push({
            url: (WEBRTC_CONFIGURATION.peer_connection.config.iceServers)[0].url
          });
        }

        return config;
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] config_ice > ' + e, 1);
    }

    return WEBRTC_CONFIGURATION.peer_connection.config;
  },

  /**
   * Gets the node value from a stanza element
   * @return Node value
   * @type string
   */
  stanza_get_value: function(stanza) {    
    try {
      return stanza.firstChild.nodeValue || null;
    } catch(e) {
      try {
        return (stanza[0]).firstChild.nodeValue || null;
      } catch(_e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_get_value > ' + _e, 1);
      }
    }

    return null;
  },

  /**
   * Gets the attribute value from a stanza element
   * @return Attribute value
   * @type string
   */
  stanza_get_attribute: function(stanza, name) {    
    if(!name) return null;

    try {
      return stanza.getAttribute(name) || null;
    } catch(e) {
      try {
        return (stanza[0]).getAttribute(name) || null;
      } catch(_e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_get_attribute > ' + _e, 1);
      }
    }

    return null;
  },

  /**
   * Sets the attribute value to a stanza element
   */
  stanza_set_attribute: function(stanza, name, value) {    
    if(!(name && value && stanza)) return;

    try {
      stanza.setAttribute(name, value);
    } catch(e) {
      try {
        (stanza[0]).setAttribute(name, value);
      } catch(_e) {
        this.parent.get_debug().log('[JSJaCJingle:utils] stanza_set_attribute > ' + _e, 1);
      }
    }
  },

  /**
   * Gets the Jingle node from a stanza
   * @return Jingle node
   * @type DOM
   */
  stanza_get_element: function(stanza, name, ns) {    
    var matches_result = [];

    // Assert
    if(!stanza)        return matches_result;
    if(stanza.length)  stanza = stanza[0];

    try {
      var i;

      // Get only in lower level (not all sub-levels)
      var matches = stanza.getElementsByTagNameNS(ns, name);

      if(matches && matches.length) {
        for(i = 0; i < matches.length; i++) {
          if(matches[i] && matches[i].parentNode == stanza)
            matches_result.push(matches[i]);
        }
      }

      return matches_result;
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_get_element > ' + e, 1);
    }

    return matches_result;
  },

  /**
   * Gets the Jingle node from a stanza
   * @return Jingle node
   * @type DOM
   */
  stanza_jingle: function(stanza) {    
    try {
      return stanza.getChild('jingle', NS_JINGLE);
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_jingle > ' + e, 1);
    }

    return null;
  },

  /**
   * Gets the from value from a stanza
   * @return from value
   * @type string
   */
  stanza_from: function(stanza) {    
    try {
      return stanza.getFrom() || null;
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_from > ' + e, 1);
    }

    return null;
  },

  /**
   * Gets the SID value from a stanza
   * @return SID value
   * @type string
   */
  stanza_sid: function(stanza) {    
    try {
      return this.stanza_get_attribute(
        this.stanza_jingle(stanza),
        'sid'
      );
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_sid > ' + e, 1);
    }
  },

  /**
   * Checks if a stanza is safe (known SID + sender)
   * @return safety state
   * @type boolean
   */
  stanza_safe: function(stanza) {    
    try {
      return !((stanza.getType() == JSJAC_JINGLE_STANZA_TYPE_SET && this.stanza_sid(stanza) != this.parent.get_sid()) || this.stanza_from(stanza) != this.parent.get_to());
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_safe > ' + e, 1);
    }

    return false;
  },

  /**
   * Gets a stanza terminate reason
   * @return reason code
   * @type string
   */
  stanza_terminate_reason: function(stanza) {    
    try {
      var jingle = this.stanza_jingle(stanza);

      if(jingle) {
        var reason = this.stanza_get_element(jingle, 'reason', NS_JINGLE);

        if(reason.length) {
          var cur_reason;

          for(cur_reason in JSJAC_JINGLE_REASONS) {
            if(this.stanza_get_element(reason[0], cur_reason, NS_JINGLE).length)
              return cur_reason;
          }
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_terminate_reason > ' + e, 1);
    }

    return null;
  },

  /**
   * Gets a stanza session info
   * @return info code
   * @type string
   */
  stanza_session_info: function(stanza) {    
    try {
      var jingle = this.stanza_jingle(stanza);

      if(jingle) {
        var cur_info;

        for(cur_info in JSJAC_JINGLE_SESSION_INFOS) {
          if(this.stanza_get_element(jingle, cur_info, NS_JINGLE_APPS_RTP_INFO).length)
            return cur_info;
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_session_info > ' + e, 1);
    }

    return null;
  },

  /**
   * Set a timeout limit to a stanza
   */
  stanza_timeout: function(t_type, t_id, handlers) {    
    try {
      t_type = t_type || JSJAC_JINGLE_STANZA_TYPE_ALL;

      var t_sid = this.parent.get_sid();
      var t_status = this.parent.get_status();

      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_timeout > Registered (id: ' + t_id + ', status: ' + t_status + ').', 4);

      var _this = this;
      
      setTimeout(function() {
        _this.parent.get_debug().log('[JSJaCJingle:utils] stanza_timeout > Cheking (id: ' + t_id + ', status: ' + t_status + '-' + _this.parent.get_status() + ').', 4);

        // State did not change?
        if(_this.parent.get_sid() == t_sid && _this.parent.get_status() == t_status && !(t_id in _this.parent.get_received_id())) {
          _this.parent.get_debug().log('[JSJaCJingle:utils] stanza_timeout > Stanza timeout.', 2);

          _this.parent.unregister_handler(t_type, t_id);

          if(handlers.external)  (handlers.external)(_this);
          if(handlers.internal)  (handlers.internal)();
        } else {
          _this.parent.get_debug().log('[JSJaCJingle:utils] stanza_timeout > Stanza successful.', 4);
        }
      }, (JSJAC_JINGLE_STANZA_TIMEOUT * 1000));
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_timeout > ' + e, 1);
    }
  },

  /**
   * Parses stanza node
   */
  stanza_parse_node: function(parent, name, ns, obj, attrs, value) {    
    try {
      var i, j,
          error, child, child_arr;
      var children = this.stanza_get_element(parent, name, ns);

      if(children.length) {
        for(i = 0; i < children.length; i++) {
          // Initialize
          error = 0;
          child = children[i];
          child_arr = {};

          // Parse attributes
          for(j in attrs) {
            child_arr[attrs[j].n] = this.stanza_get_attribute(child, attrs[j].n);

            if(attrs[j].r && !child_arr[attrs[j].n]) {
              error++; break;
            }
          }

          // Parse value
          if(value) {
            child_arr[value.n] = this.stanza_get_value(child);
            if(value.r && !child_arr[value.n])  error++;
          }

          if(error !== 0) continue;

          // Push current children
          obj.push(child_arr);
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_parse_node > ' + e, 1);
    }
  },

  /**
   * Parses stanza content
   */
  stanza_parse_content: function(stanza) {    
    try {
      var i,
          jingle, content, cur_content,
          content_creator, content_name, content_senders,
          cur_candidates;

      // Parse initiate stanza
      jingle = this.stanza_jingle(stanza);

      if(jingle) {
        // Childs
        content = this.stanza_get_element(jingle, 'content', NS_JINGLE);

        if(content && content.length) {
          for(i = 0; i < content.length; i++) {
            cur_content = content[i];

            // Attrs (avoids senders & creators to be changed later in the flow)
            content_name    = this.stanza_get_attribute(cur_content, 'name');
            content_senders = this.parent.get_senders(content_name) || this.stanza_get_attribute(cur_content, 'senders');
            content_creator = this.parent.get_creator(content_name) || this.stanza_get_attribute(cur_content, 'creator');

            this.parent.set_name(content_name);
            this.parent.set_senders(content_name, content_senders);
            this.parent.set_creator(content_name, content_creator);

            // Payloads (non-destructive setters / cumulative)
            this.parent.set_payloads_remote_add(
              content_name,
              this.stanza_parse_payload(cur_content)
            );

            // Candidates (enqueue them for ICE processing, too)
            cur_candidate = this.stanza_parse_candidate(cur_content);

            this.parent.set_candidates_remote_add(
              content_name,
              cur_candidate
            );

            this.parent.set_candidates_queue_remote(
              content_name,
              cur_candidate
            );
          }

          return true;
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_parse_content > ' + e, 1);
    }

    return false;
  },

  /**
   * Parses stanza group
   * @return success
   * @type boolean
   */
  stanza_parse_group: function(stanza) {    
    try {
      var i, j,
          jingle,
          group, cur_group,
          content, cur_content, group_content_names;

      // Parse initiate stanza
      jingle = this.stanza_jingle(stanza);

      if(jingle) {
        // Childs
        group = this.stanza_get_element(jingle, 'group', NS_JINGLE_APPS_GROUPING);

        if(group && group.length) {
          for(i = 0; i < group.length; i++) {
            cur_group = group[i];
            group_content_names = [];

            // Attrs
            group_semantics = this.stanza_get_attribute(cur_group, 'semantics');

            // Contents
            content = this.stanza_get_element(cur_group, 'content', NS_JINGLE_APPS_GROUPING);

            for(j = 0; j < content.length; j++) {
              cur_content = content[j];

              // Content attrs
              group_content_names.push(
                this.stanza_get_attribute(cur_content, 'name')
              );
            }

            // Payloads (non-destructive setters / cumulative)
            this.parent.set_group_remote(
              group_semantics,
              group_content_names
            );
          }
        }
      }

      return true;
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_parse_group > ' + e, 1);
    }

    return false;
  },

  /**
   * Parses stanza payload
   */
  stanza_parse_payload: function(stanza_content) {    
    var payload_obj = {
      descriptions : {},
      transports   : {}
    };

    try {
      // Common vars
      var j, k, l, error,
          cur_ssrc, cur_ssrc_id,
          cur_ssrc_group, cur_ssrc_group_semantics,
          cur_payload, cur_payload_arr, cur_payload_id;

      // Common functions
      var init_content = function() {
        var ic_key;
        var ic_arr = {
          'attrs'      : {},
          'rtcp-fb'    : [],
          'bandwidth'  : [],
          'payload'    : {},
          'rtp-hdrext' : [],
          'rtcp-mux'   : 0,

          'encryption' : {
            'attrs'     : {},
            'crypto'    : [],
            'zrtp-hash' : []
          },

          'ssrc': {},
          'ssrc-group': {}
        };

        for(ic_key in ic_arr)
          if(!(ic_key in payload_obj.descriptions))  payload_obj.descriptions[ic_key] = ic_arr[ic_key];
      };

      var init_payload = function(id) {
        var ip_key;
        var ip_arr = {
          'attrs'           : {},
          'parameter'       : [],
          'rtcp-fb'         : [],
          'rtcp-fb-trr-int' : []
        };

        if(!(id in payload_obj.descriptions.payload))  payload_obj.descriptions.payload[id] = {};

        for(ip_key in ip_arr)
          if(!(ip_key in payload_obj.descriptions.payload[id]))  payload_obj.descriptions.payload[id][ip_key] = ip_arr[ip_key];
      };

      var init_ssrc_group_semantics = function(semantics) {
        if(typeof payload_obj.descriptions['ssrc-group'][semantics] != 'object')
          payload_obj.descriptions['ssrc-group'][semantics] = [];
      };

      // Parse session description
      var description = this.stanza_get_element(stanza_content, 'description', NS_JINGLE_APPS_RTP);

      if(description.length) {
        description = description[0];

        var cd_media = this.stanza_get_attribute(description, 'media');
        var cd_ssrc  = this.stanza_get_attribute(description, 'ssrc');

        if(!cd_media)
          this.parent.get_debug().log('[JSJaCJingle:utils] stanza_parse_payload > No media attribute to ' + cc_name + ' stanza.', 1);

        // Initialize current description
        init_content();

        payload_obj.descriptions.attrs.media = cd_media;
        payload_obj.descriptions.attrs.ssrc  = cd_ssrc;

        // Loop on multiple payloads
        var payload = this.stanza_get_element(description, 'payload-type', NS_JINGLE_APPS_RTP);

        if(payload.length) {
          for(j = 0; j < payload.length; j++) {
            error           = 0;
            cur_payload     = payload[j];
            cur_payload_arr = {};

            cur_payload_arr.channels  = this.stanza_get_attribute(cur_payload, 'channels');
            cur_payload_arr.clockrate = this.stanza_get_attribute(cur_payload, 'clockrate');
            cur_payload_arr.id        = this.stanza_get_attribute(cur_payload, 'id') || error++;
            cur_payload_arr.name      = this.stanza_get_attribute(cur_payload, 'name');

            payload_obj.descriptions.attrs.ptime     = this.stanza_get_attribute(cur_payload, 'ptime');
            payload_obj.descriptions.attrs.maxptime  = this.stanza_get_attribute(cur_payload, 'maxptime');

            if(error !== 0) continue;

            // Initialize current payload
            cur_payload_id = cur_payload_arr.id;
            init_payload(cur_payload_id);

            // Push current payload
            payload_obj.descriptions.payload[cur_payload_id].attrs = cur_payload_arr;

            // Loop on multiple parameters
            this.stanza_parse_node(
              cur_payload,
              'parameter',
              NS_JINGLE_APPS_RTP,
              payload_obj.descriptions.payload[cur_payload_id].parameter,
              [ { n: 'name', r: 1 }, { n: 'value', r: 0 } ]
            );

            // Loop on multiple RTCP-FB
            this.stanza_parse_node(
              cur_payload,
              'rtcp-fb',
              NS_JINGLE_APPS_RTP_RTCP_FB,
              payload_obj.descriptions.payload[cur_payload_id]['rtcp-fb'],
              [ { n: 'type', r: 1 }, { n: 'subtype', r: 0 } ]
            );

            // Loop on multiple RTCP-FB-TRR-INT
            this.stanza_parse_node(
              cur_payload,
              'rtcp-fb-trr-int',
              NS_JINGLE_APPS_RTP_RTCP_FB,
              payload_obj.descriptions.payload[cur_payload_id]['rtcp-fb-trr-int'],
              [ { n: 'value', r: 1 } ]
            );
          }
        }

        // Parse the encryption element
        var encryption = this.stanza_get_element(description, 'encryption', NS_JINGLE_APPS_RTP);

        if(encryption.length) {
          encryption = encryption[0];

          payload_obj.descriptions.encryption.attrs.required = this.stanza_get_attribute(encryption, 'required') || '0';

          // Loop on multiple cryptos
          this.stanza_parse_node(
            encryption,
            'crypto',
            NS_JINGLE_APPS_RTP,
            payload_obj.descriptions.encryption.crypto,
            [ { n: 'crypto-suite', r: 1 }, { n: 'key-params', r: 1 }, { n: 'session-params', r: 0 }, { n: 'tag', r: 1 } ]
          );

          // Loop on multiple zrtp-hash
          this.stanza_parse_node(
            encryption,
            'zrtp-hash',
            NS_JINGLE_APPS_RTP_ZRTP,
            payload_obj.descriptions.encryption['zrtp-hash'],
            [ { n: 'version', r: 1 } ],
            { n: 'value', r: 1 }
          );
        }

        // Parse the SSRC-GROUP elements
        var ssrc_group = this.stanza_get_element(description, 'ssrc-group', NS_JINGLE_APPS_RTP_SSMA);

        if(ssrc_group && ssrc_group.length) {
          for(k = 0; k < ssrc_group.length; k++) {
            cur_ssrc_group = ssrc_group[k];
            cur_ssrc_group_semantics = this.stanza_get_attribute(cur_ssrc_group, 'semantics') || null;

            if(cur_ssrc_group_semantics !== null) {
              cur_ssrc_group_semantics_obj = {
                'sources': []
              };

              init_ssrc_group_semantics(cur_ssrc_group_semantics);

              this.stanza_parse_node(
                cur_ssrc_group,
                'source',
                NS_JINGLE_APPS_RTP_SSMA,
                cur_ssrc_group_semantics_obj.sources,
                [ { n: 'ssrc', r: 1 } ]
              );

              payload_obj.descriptions['ssrc-group'][cur_ssrc_group_semantics].push(cur_ssrc_group_semantics_obj);
            }
          }
        }

        // Parse the SSRC (source) elements
        var ssrc = this.stanza_get_element(description, 'source', NS_JINGLE_APPS_RTP_SSMA);

        if(ssrc && ssrc.length) {
          for(l = 0; l < ssrc.length; l++) {
            cur_ssrc = ssrc[l];
            cur_ssrc_id = this.stanza_get_attribute(cur_ssrc, 'ssrc') || null;

            if(cur_ssrc_id !== null) {
              payload_obj.descriptions.ssrc[cur_ssrc_id] = [];

              this.stanza_parse_node(
                cur_ssrc,
                'parameter',
                NS_JINGLE_APPS_RTP_SSMA,
                payload_obj.descriptions.ssrc[cur_ssrc_id],
                [ { n: 'name', r: 1 }, { n: 'value', r: 0 } ]
              );
            }
          }
        }

        // Loop on common RTCP-FB
        this.stanza_parse_node(
          description,
          'rtcp-fb',
          NS_JINGLE_APPS_RTP_RTCP_FB,
          payload_obj.descriptions['rtcp-fb'],
          [ { n: 'type', r: 1 }, { n: 'subtype', r: 0 } ]
        );

        // Loop on bandwidth
        this.stanza_parse_node(
          description,
          'bandwidth',
          NS_JINGLE_APPS_RTP,
          payload_obj.descriptions.bandwidth,
          [ { n: 'type', r: 1 } ],
          { n: 'value', r: 1 }
        );

        // Parse the RTP-HDREXT element
        this.stanza_parse_node(
          description,
          'rtp-hdrext',
          NS_JINGLE_APPS_RTP_RTP_HDREXT,
          payload_obj.descriptions['rtp-hdrext'],
          [ { n: 'id', r: 1 }, { n: 'uri', r: 1 }, { n: 'senders', r: 0 } ]
        );

        // Parse the RTCP-MUX element
        var rtcp_mux = this.stanza_get_element(description, 'rtcp-mux', NS_JINGLE_APPS_RTP);

        if(rtcp_mux.length) {
          payload_obj.descriptions['rtcp-mux'] = 1;
        }
      }

      // Parse transport (need to get 'ufrag' and 'pwd' there)
      var transport = this.stanza_get_element(stanza_content, 'transport', NS_JINGLE_TRANSPORTS_ICEUDP);

      if(transport.length) {
        payload_obj.transports.pwd          = this.stanza_get_attribute(transport, 'pwd');
        payload_obj.transports.ufrag        = this.stanza_get_attribute(transport, 'ufrag');

        var fingerprint = this.stanza_get_element(transport, 'fingerprint', NS_JINGLE_APPS_DTLS);

        if(fingerprint.length) {
          payload_obj.transports.fingerprint       = {};
          payload_obj.transports.fingerprint.setup = this.stanza_get_attribute(fingerprint, 'setup');
          payload_obj.transports.fingerprint.hash  = this.stanza_get_attribute(fingerprint, 'hash');
          payload_obj.transports.fingerprint.value = this.stanza_get_value(fingerprint);
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_parse_payload > ' + e, 1);
    }

    return payload_obj;
  },

  /**
   * Parses stanza candidate
   */
  stanza_parse_candidate: function(stanza_content) {    
    var candidate_arr = [];

    try {
      var _this = this;

      var fn_parse_transport = function(namespace, parse_obj) {
        var transport = _this.stanza_get_element(stanza_content, 'transport', namespace);
        
        if(transport.length) {
          _this.stanza_parse_node(
            transport,
            'candidate',
            namespace,
            candidate_arr,
            parse_obj
          );
        }
      };

      // Parse ICE-UDP transport candidates
      fn_parse_transport(
        NS_JINGLE_TRANSPORTS_ICEUDP,
        JSJAC_JINGLE_SDP_CANDIDATE_MAP_ICEUDP
      );

      // Parse RAW-UDP transport candidates
      fn_parse_transport(
        NS_JINGLE_TRANSPORTS_RAWUDP,
        JSJAC_JINGLE_SDP_CANDIDATE_MAP_RAWUDP
      );
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_parse_candidate > ' + e, 1);
    }

    return candidate_arr;
  },

  /*
   * Builds stanza node
   * @return node
   * @type DOM
   */
  stanza_build_node: function(doc, parent, children, name, ns, value) {    
    var node = null;

    try {
      var i, child, attr;

      if(children && children.length) {
        for(i in children) {
          child = children[i];

          if(!child) continue;

          node = parent.appendChild(doc.buildNode(
            name,
            { 'xmlns': ns },
            (value && child[value]) ? child[value] : null
          ));

          for(attr in child)
            if(attr != value)  this.stanza_set_attribute(node, attr, child[attr]);
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_build_node > name: ' + name + ' > ' + e, 1);
    }

    return node;
  },

  /**
   * Generates stanza Jingle node
   * @return node
   * @type DOM
   */
  stanza_generate_jingle: function(stanza, attrs) {    
    var jingle = null;

    try {
      var cur_attr;

      jingle = stanza.getNode().appendChild(stanza.buildNode('jingle', { 'xmlns': NS_JINGLE }));

      if(!attrs.sid) attrs.sid = this.parent.get_sid();

      for(cur_attr in attrs) this.stanza_set_attribute(jingle, cur_attr, attrs[cur_attr]);
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_generate_jingle > ' + e, 1);
    }

    return jingle;
  },

  /**
   * Generates stanza session info
   */
  stanza_generate_session_info: function(stanza, jingle, args) {    
    try {
      var info = jingle.appendChild(stanza.buildNode(args.info, { 'xmlns': NS_JINGLE_APPS_RTP_INFO }));

      // Info attributes
      switch(args.info) {
        case JSJAC_JINGLE_SESSION_INFO_MUTE:
        case JSJAC_JINGLE_SESSION_INFO_UNMUTE:
          this.stanza_set_attribute(info, 'creator', this.parent.get_creator_this());
          this.stanza_set_attribute(info, 'name',    args.name);

          break;
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_generate_session_info > ' + e, 1);
    }
  },

  /**
   * Generates stanza local content
   */
  stanza_generate_content_local: function(stanza, jingle, override_content) {    
    try {
      var cur_media;
      var content_local = override_content ? override_content : this.parent.get_content_local();

      var _this = this;

      var fn_build_transport = function(content, transport_obj, namespace) {
        var transport = _this.stanza_build_node(
          stanza,
          content,
          [transport_obj.attrs],
          'transport',
          namespace
        );

        // Fingerprint
        _this.stanza_build_node(
          stanza,
          transport,
          [transport_obj.fingerprint],
          'fingerprint',
          NS_JINGLE_APPS_DTLS,
          'value'
        );

        // Candidates
        _this.stanza_build_node(
          stanza,
          transport,
          transport_obj.candidate,
          'candidate',
          namespace
        );
      };

      for(cur_media in content_local) {
        var cur_content = content_local[cur_media];

        var content = jingle.appendChild(stanza.buildNode('content', { 'xmlns': NS_JINGLE }));

        this.stanza_set_attribute(content, 'creator', cur_content.creator);
        this.stanza_set_attribute(content, 'name',    cur_content.name);
        this.stanza_set_attribute(content, 'senders', cur_content.senders);

        // Build description (if action type allows that element)
        if(this.stanza_get_attribute(jingle, 'action') != JSJAC_JINGLE_ACTION_TRANSPORT_INFO) {
          var cs_description  = cur_content.description;
          var cs_d_attrs      = cs_description.attrs;
          var cs_d_rtcp_fb    = cs_description['rtcp-fb'];
          var cs_d_bandwidth  = cs_description.bandwidth;
          var cs_d_payload    = cs_description.payload;
          var cs_d_encryption = cs_description.encryption;
          var cs_d_ssrc       = cs_description.ssrc;
          var cs_d_ssrc_group = cs_description['ssrc-group'];
          var cs_d_rtp_hdrext = cs_description['rtp-hdrext'];
          var cs_d_rtcp_mux   = cs_description['rtcp-mux'];

          var description = this.stanza_build_node(
                              stanza, content,
                              [cs_d_attrs],
                              'description',
                              NS_JINGLE_APPS_RTP
                            );

          // Payload-type
          if(cs_d_payload) {
            var i, j,
                cur_ssrc_id, cur_cs_d_ssrc_group_semantics,
                cs_d_p, payload_type;

            for(i in cs_d_payload) {
              cs_d_p = cs_d_payload[i];

              payload_type = this.stanza_build_node(
                stanza,
                description,
                [cs_d_p.attrs],
                'payload-type',
                NS_JINGLE_APPS_RTP
              );

              // Parameter
              this.stanza_build_node(
                stanza,
                payload_type,
                cs_d_p.parameter,
                'parameter',
                NS_JINGLE_APPS_RTP
              );

              // RTCP-FB (sub)
              this.stanza_build_node(
                stanza,
                payload_type,
                cs_d_p['rtcp-fb'],
                'rtcp-fb',
                NS_JINGLE_APPS_RTP_RTCP_FB
              );

              // RTCP-FB-TRR-INT
              this.stanza_build_node(
                stanza,
                payload_type,
                cs_d_p['rtcp-fb-trr-int'],
                'rtcp-fb-trr-int',
                NS_JINGLE_APPS_RTP_RTCP_FB
              );
            }

            // SSRC-GROUP
            if(cs_d_ssrc_group) {
              for(cur_cs_d_ssrc_group_semantics in cs_d_ssrc_group) {
                for(j in cs_d_ssrc_group[cur_cs_d_ssrc_group_semantics]) {
                  var ssrc_group = description.appendChild(stanza.buildNode('ssrc-group', {
                    'semantics': cur_cs_d_ssrc_group_semantics,
                    'xmlns': NS_JINGLE_APPS_RTP_SSMA
                  }));

                  this.stanza_build_node(
                    stanza,
                    ssrc_group,
                    cs_d_ssrc_group[cur_cs_d_ssrc_group_semantics][j].sources,
                    'source',
                    NS_JINGLE_APPS_RTP_SSMA
                  );
                }
              }
            }

            // SSRC
            if(cs_d_ssrc) {
              for(cur_ssrc_id in cs_d_ssrc) {
                var ssrc = description.appendChild(stanza.buildNode('source', {
                  'ssrc': cur_ssrc_id,
                  'xmlns': NS_JINGLE_APPS_RTP_SSMA
                }));

                this.stanza_build_node(
                  stanza,
                  ssrc,
                  cs_d_ssrc[cur_ssrc_id],
                  'parameter',
                  NS_JINGLE_APPS_RTP_SSMA
                );
              }
            }

            // Encryption
            if(cs_d_encryption && 
               (cs_d_encryption.crypto && cs_d_encryption.crypto.length || 
                cs_d_encryption['zrtp-hash'] && cs_d_encryption['zrtp-hash'].length)) {
              var encryption = description.appendChild(stanza.buildNode('encryption', { 'xmlns': NS_JINGLE_APPS_RTP }));

              this.stanza_set_attribute(encryption, 'required', (cs_d_encryption.attrs.required || '0'));

              // Crypto
              this.stanza_build_node(
                stanza,
                encryption,
                cs_d_encryption.crypto,
                'crypto',
                NS_JINGLE_APPS_RTP
              );

              // ZRTP-HASH
              this.stanza_build_node(
                stanza,
                encryption,
                cs_d_encryption['zrtp-hash'],
                'zrtp-hash',
                NS_JINGLE_APPS_RTP_ZRTP,
                'value'
              );
            }

            // RTCP-FB (common)
            this.stanza_build_node(
              stanza,
              description,
              cs_d_rtcp_fb,
              'rtcp-fb',
              NS_JINGLE_APPS_RTP_RTCP_FB
            );

            // Bandwidth
            this.stanza_build_node(
              stanza,
              description,
              cs_d_bandwidth,
              'bandwidth',
              NS_JINGLE_APPS_RTP,
              'value'
            );

            // RTP-HDREXT
            this.stanza_build_node(
              stanza,
              description,
              cs_d_rtp_hdrext,
              'rtp-hdrext',
              NS_JINGLE_APPS_RTP_RTP_HDREXT
            );

            // RTCP-MUX
            if(cs_d_rtcp_mux)
              description.appendChild(stanza.buildNode('rtcp-mux', { 'xmlns': NS_JINGLE_APPS_RTP }));
          }
        }

        // Build transport
        var cs_transport = this.generate_transport(cur_content.transport);

        // Transport candidates: ICE-UDP
        if((cs_transport.ice.candidate).length > 0) {
          fn_build_transport(
            content,
            cs_transport.ice,
            NS_JINGLE_TRANSPORTS_ICEUDP
          );
        }

        // Transport candidates: RAW-UDP
        if((cs_transport.raw.candidate).length > 0) {
          fn_build_transport(
            content,
            cs_transport.raw,
            NS_JINGLE_TRANSPORTS_RAWUDP
          );
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_generate_content_local > ' + e, 1);
    }
  },

  /**
   * Generates stanza local group
   */
  stanza_generate_group_local: function(stanza, jingle) {    
    try {
      var i,
          cur_semantics, cur_group, cur_group_name,
          group;

      var group_local = this.parent.get_group_local();

      for(cur_semantics in group_local) {
        cur_group = group_local[cur_semantics];

        group = jingle.appendChild(stanza.buildNode('group', {
          'xmlns': NS_JINGLE_APPS_GROUPING,
          'semantics': cur_semantics
        }));

        for(i in cur_group) {
          cur_group_name = cur_group[i];

          group.appendChild(stanza.buildNode('content', {
            'xmlns': NS_JINGLE_APPS_GROUPING,
            'name': cur_group_name
          }));
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] stanza_generate_group_local > ' + e, 1);
    }
  },

  /**
   * Generates content
   * @return content object
   * @type object
   */
  generate_content: function(creator, name, senders, payloads, transports) {    
    var content_obj = {};

    try {
      // Generation process
      content_obj.creator     = creator;
      content_obj.name        = name;
      content_obj.senders     = senders;
      content_obj.description = {};
      content_obj.transport   = {};

      // Generate description
      var i;
      var description_cpy      = this.object_clone(payloads.descriptions);
      var description_ptime    = description_cpy.attrs.ptime;
      var description_maxptime = description_cpy.attrs.maxptime;

      if(description_ptime)     delete description_cpy.attrs.ptime;
      if(description_maxptime)  delete description_cpy.attrs.maxptime;

      for(i in description_cpy.payload) {
        if(!('attrs' in description_cpy.payload[i]))
          description_cpy.payload[i].attrs           = {};

        description_cpy.payload[i].attrs.ptime    = description_ptime;
        description_cpy.payload[i].attrs.maxptime = description_maxptime;
      }

      content_obj.description = description_cpy;

      // Generate transport
      content_obj.transport.candidate      = transports;
      content_obj.transport.attrs          = {};
      content_obj.transport.attrs.pwd   = payloads.transports ? payloads.transports.pwd   : null;
      content_obj.transport.attrs.ufrag = payloads.transports ? payloads.transports.ufrag : null;

      if(payloads.transports && payloads.transports.fingerprint)
        content_obj.transport.fingerprint  = payloads.transports.fingerprint;
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] generate_content > ' + e, 1);
    }

    return content_obj;
  },

  /**
   * Generates transport
   * @return transport object
   * @type object
   */
  generate_transport: function(transport_init_obj) {    
    var transport_obj = {
      'ice': {},
      'raw': {}
    };

    try {
      var i, j, k,
          cur_attr,
          cur_candidate, cur_transport;

      // Reduce RAW-UDP map object for simpler search
      var rawudp_map = {};
      for(i in JSJAC_JINGLE_SDP_CANDIDATE_MAP_RAWUDP) {
        rawudp_map[JSJAC_JINGLE_SDP_CANDIDATE_MAP_RAWUDP[i].n] = 1;
      }

      var fn_init_obj = function(transport_sub_obj) {
        transport_sub_obj.attrs = transport_init_obj.attrs;
        transport_sub_obj.fingerprint = transport_init_obj.fingerprint;
        transport_sub_obj.candidate = [];
      };

      for(j in transport_obj)
        fn_init_obj(transport_obj[j]);

      // Nest candidates in their category
      for(k = 0; k < (transport_init_obj.candidate).length; k++) {
        cur_candidate = this.object_clone(transport_init_obj.candidate[k]);

        if(cur_candidate.type in JSJAC_JINGLE_SDP_CANDIDATE_TYPES) {
          // Remove attributes that are not required by RAW-UDP (XEP-0177 compliance)
          if(JSJAC_JINGLE_SDP_CANDIDATE_TYPES[cur_candidate.type] === JSJAC_JINGLE_SDP_CANDIDATE_METHOD_RAW) {
            for(cur_attr in cur_candidate) {
              if(typeof rawudp_map[cur_attr] == 'undefined')
                delete cur_candidate[cur_attr];
            }
          }

          cur_transport = transport_obj[JSJAC_JINGLE_SDP_CANDIDATE_TYPES[cur_candidate.type]];
          cur_transport.candidate.push(cur_candidate);
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] generate_transport > ' + e, 1);
    }

    return transport_obj;
  },

  /**
   * Builds local content
   */
  build_content_local: function() {    
    try {
      var cur_name;

      for(cur_name in this.parent.get_name()) {
        this.parent.set_content_local(
          cur_name,

          this.generate_content(
            JSJAC_JINGLE_SENDERS_INITIATOR.jingle,
            cur_name,
            this.parent.get_senders(cur_name),
            this.parent.get_payloads_local(cur_name),
            this.parent.get_candidates_local(cur_name)
          )
        );
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] build_content_local > ' + e, 1);
    }
  },

  /**
   * Builds remote content
   */
  build_content_remote: function() {    
    try {
      var cur_name;

      for(cur_name in this.parent.get_name()) {
        this.parent.set_content_remote(
          cur_name,

          this.generate_content(
            this.parent.get_creator(cur_name),
            cur_name,
            this.parent.get_senders(cur_name),
            this.parent.get_payloads_remote(cur_name),
            this.parent.get_candidates_remote(cur_name)
          )
        );
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] build_content_remote > ' + e, 1);
    }
  },

  /**
   * Generates media name
   * @return media name
   * @type string
   */
  name_generate: function(media) {    
    var name = null;

    try {
      var i, cur_name;

      var content_all = [
        this.parent.get_content_remote(),
        this.parent.get_content_local()
      ];

      for(i in content_all) {
        for(cur_name in content_all[i]) {
          try {
            if(content_all[i][cur_name].description.attrs.media == media) {
              name = cur_name; break;
            }
          } catch(e) {}
        }

        if(name) break;
      }

      if(!name) name = media;
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] name_generate > ' + e, 1);
    }

    return name;
  },

  /**
   * Generates media
   * @return media
   * @type string
   */
  media_generate: function(name) {    
    var cur_media;
    var media = null;

    try {
      if(typeof name == 'number') {
        for(cur_media in JSJAC_JINGLE_MEDIAS) {
          if(name == parseInt(JSJAC_JINGLE_MEDIAS[cur_media].label, 10)) {
            media = cur_media; break;
          }
        }
      } else {
        for(cur_media in JSJAC_JINGLE_MEDIAS) {
          if(name == this.name_generate(cur_media)) {
            media = cur_media; break;
          }
        }
      }

      if(!media)  media = name;
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] media_generate > ' + e, 1);
    }

    return media;
  },

  /**
   * Generates a MD5 hash from the given value
   * @return MD5 hash value
   * @type string
   */
  generate_hash_md5: function(value) {
    return hex_md5(value);
  },

  /**
   * Generates a random SID value
   * @return SID value
   * @type string
   */
  generate_sid: function() {
    return JSJaCUtils.cnonce(16);
  },

  /**
   * Generates a random ID value
   * @return ID value
   * @type string
   */
  generate_id: function() {
    return JSJaCUtils.cnonce(10);
  },

  /**
   * Generates the constraints object
   * @return constraints object
   * @type object
   */
  generate_constraints: function() {    
    var constraints = {
      audio : false,
      video : false
    };

    try {
      // Medias?
      constraints.audio = true;
      constraints.video = (this.parent.get_media() == JSJAC_JINGLE_MEDIA_VIDEO);

      // Video configuration
      if(constraints.video === true) {
        // Resolution?
        switch(this.parent.get_resolution()) {
          // 16:9
          case '720':
          case 'hd':
            constraints.video = {
              mandatory : {
                minWidth       : 1280,
                minHeight      : 720,
                minAspectRatio : 1.77
              }
            };
            break;

          case '360':
          case 'md':
            constraints.video = {
              mandatory : {
                minWidth       : 640,
                minHeight      : 360,
                minAspectRatio : 1.77
              }
            };
            break;

          case '180':
          case 'sd':
            constraints.video = {
              mandatory : {
                minWidth       : 320,
                minHeight      : 180,
                minAspectRatio : 1.77
              }
            };
            break;

          // 4:3
          case '960':
            constraints.video = {
              mandatory : {
                minWidth  : 960,
                minHeight : 720
              }
            };
            break;

          case '640':
          case 'vga':
            constraints.video = {
              mandatory : {
                maxWidth  : 640,
                maxHeight : 480
              }
            };
            break;

          case '320':
            constraints.video = {
              mandatory : {
                maxWidth  : 320,
                maxHeight : 240
              }
            };
            break;
        }

        // Bandwidth?
        if(this.parent.get_bandwidth())
          constraints.video.optional = [{ bandwidth: this.parent.get_bandwidth() }];

        // FPS?
        if(this.parent.get_fps())
          constraints.video.mandatory.minFrameRate = this.parent.get_fps();

        // Custom video source? (screenshare)
        if(this.parent.get_media()        == JSJAC_JINGLE_MEDIA_VIDEO         && 
           this.parent.get_video_source() != JSJAC_JINGLE_VIDEO_SOURCE_CAMERA ) {
          if(document.location.protocol !== 'https:')
            this.parent.get_debug().log('[JSJaCJingle:utils] generate_constraints > HTTPS might be required to share screen, otherwise you may get a permission denied error.', 0);

          // Unsupported browser? (for that feature)
          if(this.browser().name != JSJAC_JINGLE_BROWSER_CHROME) {
            this.parent.get_debug().log('[JSJaCJingle:utils] generate_constraints > Video source not supported by ' + this.browser().name + ' (source: ' + this.parent.get_video_source() + ').', 1);
            
            this.parent.terminate(JSJAC_JINGLE_REASON_MEDIA_ERROR);
            return;
          }

          constraints.audio           = false;
          constraints.video.mandatory = {
            'chromeMediaSource': this.parent.get_video_source()
          };
        }
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] generate_constraints > ' + e, 1);
    }

    return constraints;
  },

  /**
   * Returns whether SDP credentials are common or not (fingerprint & so)
   * @return credientials same state
   * @type boolean
   */
  is_sdp_common_credentials: function(payloads) {    
    var is_same = true;

    try {
      var i,
          prev_credentials, cur_credentials;

      for(i in payloads) {
        cur_credentials = payloads[i].transports;

        if(typeof prev_credentials == 'object') {
          if((prev_credentials.ufrag !== cur_credentials.ufrag)  ||
             (prev_credentials.pwd !== cur_credentials.pwd  )    ||
             (JSON.stringify(prev_credentials.fingerprint) !== JSON.stringify(cur_credentials.fingerprint)
            )) {
            is_same = false;
            break;
          }
        }

        prev_credentials = cur_credentials;
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] is_sdp_common_credentials > ' + e, 1);
    }

    return is_same;
  },

  /**
   * Extracts network main details
   * @return network details
   * @type object
   */
  network_extract_main: function(media, candidates) {    
    var network_obj = {
      'ip': JSJAC_JINGLE_SDP_CANDIDATE_IP_DEFAULT,
      'port': JSJAC_JINGLE_SDP_CANDIDATE_PORT_DEFAULT,
      'scope': JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_DEFAULT,
      'protocol': JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_DEFAULT
    };

    var local_obj, remote_obj;

    try {
      var i,
          cur_candidate, cur_candidate_parse;

      var fn_proceed_parse = function(type, candidate_eval) {
        var r_lan, protocol;

        var parse_obj = {
          'ip': candidate_eval.ip,
          'port': candidate_eval.port
        };

        if(candidate_eval.ip.match(R_NETWORK_IP.all.v4)) {
          r_lan = R_NETWORK_IP.lan.v4;
          parse_obj.protocol = JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_V4;
        } else if(candidate_eval.ip.match(R_NETWORK_IP.all.v6)) {
          r_lan = R_NETWORK_IP.lan.v6;
          parse_obj.protocol = JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_V6;
        } else {
          return;
        }

        if((type === JSJAC_JINGLE_SDP_CANDIDATE_TYPE_HOST) &&
           candidate_eval.ip.match(r_lan)) {
          // Local
          parse_obj.scope = JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_LOCAL;
        } else if(type === JSJAC_JINGLE_SDP_CANDIDATE_TYPE_SRFLX) {
          // Remote
          parse_obj.scope = JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_REMOTE;
        } else {
          return;
        }

        return parse_obj;
      };

      for(i in candidates) {
        cur_candidate = candidates[i];

        if(cur_candidate.id == media || cur_candidate.label == media) {
          cur_candidate_parse = this.parent.sdp.parse_candidate(cur_candidate.candidate);

          if(cur_candidate_parse.type === JSJAC_JINGLE_SDP_CANDIDATE_TYPE_HOST) {
            // Only proceed if no local network yet
            if(typeof local_obj == 'undefined') {
              local_obj = fn_proceed_parse(JSJAC_JINGLE_SDP_CANDIDATE_TYPE_HOST, cur_candidate_parse);
            }
          } else if(cur_candidate_parse.type === JSJAC_JINGLE_SDP_CANDIDATE_TYPE_SRFLX) {
            // Only proceed if no remote network yet
            if(typeof remote_obj == 'undefined') {
              remote_obj = fn_proceed_parse(JSJAC_JINGLE_SDP_CANDIDATE_TYPE_SRFLX, cur_candidate_parse);
            }
          }
        }
      }

      if(typeof remote_obj != 'undefined') {
        network_obj = remote_obj;
      } else if(typeof local_obj != 'undefined') {
        network_obj = local_obj;
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] network_extract_main > ' + e, 1);
    }

    return network_obj;
  },

  /**
   * Returns our negotiation status
   * @return Negotiation status
   * @type string
   */
  negotiation_status: function() {
    return (this.parent.get_initiator() == this.connection_jid()) ? JSJAC_JINGLE_SENDERS_INITIATOR.jingle : JSJAC_JINGLE_SENDERS_RESPONDER.jingle;
  },

  /**
   * Get my connection JID
   * @return JID value
   * @type string
   */
  connection_jid: function() {
    return JSJAC_JINGLE_STORE_CONNECTION.username + '@' + 
           JSJAC_JINGLE_STORE_CONNECTION.domain   + '/' + 
           JSJAC_JINGLE_STORE_CONNECTION.resource;
  },

  /**
   * Registers a view to map
   * @return view register functions
   * @type object
   */
  map_register_view: function(type) {    
    var fn = {
      type   : null,
      mute   : false,

      view   : {
        get : null,
        set : null
      },

      stream : {
        get : null,
        set : null
      }
    };

    try {
      switch(type) {
        case 'local':
          fn.type       = type;
          fn.mute       = true;
          fn.view.get   = this.parent.get_local_view;
          fn.view.set   = this.parent.set_local_view;
          fn.stream.get = this.parent.get_local_stream;
          fn.stream.set = this.parent.set_local_stream;
          break;

        case 'remote':
          fn.type       = type;
          fn.view.get   = this.parent.get_remote_view;
          fn.view.set   = this.parent.set_remote_view;
          fn.stream.get = this.parent.get_remote_stream;
          fn.stream.set = this.parent.set_remote_stream;
          break;
      }
    } catch(e) {
      this.parent.get_debug().log('[JSJaCJingle:utils] map_register_view > ' + e, 1);
    }

    return fn;
  },

  /**
   * Unregister a view from map
   * @return view unregister functions
   * @type object
   */
  map_unregister_view: function(type) {    
    return this.map_register_view(type);
  },
});
