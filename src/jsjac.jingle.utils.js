/**
 * @fileoverview JSJaC Jingle library - Utilities
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/**
 * JSJSAC JINGLE UTILITIES
 */

function JSJaCJingleUtils(args) {
  var self = this;

  /**
   * Removes a given array value
   * @return new array
   * @type object
   */
  self.util_array_remove_value = function(array, value) {
    try {
      var i;

      for(i = 0; i < array.length; i++) {
        if(array[i] === value) {
          array.splice(i, 1); i--;
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_array_remove_value > ' + e, 1);
    }

    return array;
  };

  /**
   * Returns whether an object is empty or not
   * @return Empty value
   * @type boolean
   */
  self.util_object_length = function(object) {
    var key;
    var l = 0;

    try {
      for(key in object) {
        if(object.hasOwnProperty(key))  l++;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_object_length > ' + e, 1);
    }

    return l;
  };

  /**
   * Collects given objects
   * @return Empty value
   * @type object
   */
  self.util_object_collect = function() {
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
  };

  /**
   * Clones a given object
   * @return Cloned object
   * @type object
   */
  self.util_object_clone = function(object) {
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
            copy[i] = self.util_object_clone(object[i]);

          return copy;
      }

      // Handle Object
      if(object instanceof Object) {
          copy = {};

          for(attr in object) {
              if(object.hasOwnProperty(attr))
                copy[attr] = self.util_object_clone(object[attr]);
          }

          return copy;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_object_clone > ' + e, 1);
    }

    self.get_debug().log('[JSJaCJingle] util_object_clone > Cannot clone this object.', 1);
  };

  /**
   * Gets the browser info
   * @return browser info
   * @type object
   */
  self._util_browser = function() {
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
      self.get_debug().log('[JSJaCJingle] _util_browser > ' + e, 1);
    }

    return browser_info;
  };

  /**
   * Gets the ICE config
   * @return ICE config
   * @type object
   */
  self._util_config_ice = function() {
    try {
      // Collect data (user + server)
      var stun_config = self.util_object_collect(
        self.get_stun(),
        JSJAC_JINGLE_STORE_EXTDISCO.stun,
        JSJAC_JINGLE_STORE_RELAYNODES.stun,
        JSJAC_JINGLE_STORE_FALLBACK.stun
      );

      var turn_config = self.util_object_collect(
        self.get_turn(),
        JSJAC_JINGLE_STORE_EXTDISCO.turn,
        JSJAC_JINGLE_STORE_FALLBACK.turn
      );

      // Can proceed?
      if(stun_config && self.util_object_length(stun_config)  || 
         turn_config && self.util_object_length(turn_config)  ) {
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

            if(cur_stun_obj.transport && self._util_browser().name != JSJAC_JINGLE_BROWSER_FIREFOX)
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
      self.get_debug().log('[JSJaCJingle] _util_config_ice > ' + e, 1);
    }

    return WEBRTC_CONFIGURATION.peer_connection.config;
  };

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
      } catch(_e) {
        self.get_debug().log('[JSJaCJingle] util_stanza_get_value > ' + _e, 1);
      }
    }

    return null;
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
      } catch(_e) {
        self.get_debug().log('[JSJaCJingle] util_stanza_get_attribute > ' + _e, 1);
      }
    }

    return null;
  };

  /**
   * Sets the attribute value to a stanza element
   */
  self.util_stanza_set_attribute = function(stanza, name, value) {
    if(!(name && value && stanza)) return;

    try {
      stanza.setAttribute(name, value);
    } catch(e) {
      try {
        (stanza[0]).setAttribute(name, value);
      } catch(_e) {
        self.get_debug().log('[JSJaCJingle] util_stanza_set_attribute > ' + _e, 1);
      }
    }
  };

  /**
   * Gets the Jingle node from a stanza
   * @return Jingle node
   * @type DOM
   */
  self.util_stanza_get_element = function(stanza, name, ns) {
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
      self.get_debug().log('[JSJaCJingle] util_stanza_get_element > ' + e, 1);
    }

    return matches_result;
  };

  /**
   * Gets the Jingle node from a stanza
   * @return Jingle node
   * @type DOM
   */
  self.util_stanza_jingle = function(stanza) {
    try {
      return stanza.getChild('jingle', NS_JINGLE);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_stanza_jingle > ' + e, 1);
    }

    return null;
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
      self.get_debug().log('[JSJaCJingle] util_stanza_from > ' + e, 1);
    }

    return null;
  };

  /**
   * Gets the SID value from a stanza
   * @return SID value
   * @type string
   */
  self.util_stanza_sid = function(stanza) {
    try {
      return self.util_stanza_get_attribute(
        self.util_stanza_jingle(stanza),
        'sid'
      );
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_stanza_sid > ' + e, 1);
    }
  };

  /**
   * Checks if a stanza is safe (known SID + sender)
   * @return safety state
   * @type boolean
   */
  self.util_stanza_safe = function(stanza) {
    try {
      return !((stanza.getType() == JSJAC_JINGLE_STANZA_TYPE_SET && self.util_stanza_sid(stanza) != self.get_sid()) || self.util_stanza_from(stanza) != self.get_to());
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_stanza_safe > ' + e, 1);
    }

    return false;
  };

  /**
   * Gets a stanza terminate reason
   * @return reason code
   * @type string
   */
  self.util_stanza_terminate_reason = function(stanza) {
    try {
      var jingle = self.util_stanza_jingle(stanza);

      if(jingle) {
        var reason = self.util_stanza_get_element(jingle, 'reason', NS_JINGLE);

        if(reason.length) {
          var cur_reason;

          for(cur_reason in JSJAC_JINGLE_REASONS) {
            if(self.util_stanza_get_element(reason[0], cur_reason, NS_JINGLE).length)
              return cur_reason;
          }
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_stanza_terminate_reason > ' + e, 1);
    }

    return null;
  };

  /**
   * Gets a stanza session info
   * @return info code
   * @type string
   */
  self.util_stanza_session_info = function(stanza) {
    try {
      var jingle = self.util_stanza_jingle(stanza);

      if(jingle) {
        var cur_info;

        for(cur_info in JSJAC_JINGLE_SESSION_INFOS) {
          if(self.util_stanza_get_element(jingle, cur_info, NS_JINGLE_APPS_RTP_INFO).length)
            return cur_info;
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_stanza_session_info > ' + e, 1);
    }

    return null;
  };

  /**
   * Set a timeout limit to a stanza
   */
  self.util_stanza_timeout = function(t_type, t_id, handlers) {
    try {
      t_type = t_type || JSJAC_JINGLE_STANZA_TYPE_ALL;

      var t_sid = self.get_sid();
      var t_status = self.get_status();

      self.get_debug().log('[JSJaCJingle] util_stanza_timeout > Registered (id: ' + t_id + ', status: ' + t_status + ').', 4);

      setTimeout(function() {
        self.get_debug().log('[JSJaCJingle] util_stanza_timeout > Cheking (id: ' + t_id + ', status: ' + t_status + '-' + self.get_status() + ').', 4);

        // State did not change?
        if(self.get_sid() == t_sid && self.get_status() == t_status && !(t_id in self._get_received_id())) {
          self.get_debug().log('[JSJaCJingle] util_stanza_timeout > Stanza timeout.', 2);

          self.unregister_handler(t_type, t_id);

          if(handlers.external)  (handlers.external)(self);
          if(handlers.internal)  (handlers.internal)();
        } else {
          self.get_debug().log('[JSJaCJingle] util_stanza_timeout > Stanza successful.', 4);
        }
      }, (JSJAC_JINGLE_STANZA_TIMEOUT * 1000));
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_stanza_timeout > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._util_stanza_parse_node = function(parent, name, ns, obj, attrs, value) {
    try {
      var i, j,
          error, child, child_arr;
      var children = self.util_stanza_get_element(parent, name, ns);

      if(children.length) {
        for(i = 0; i < children.length; i++) {
          // Initialize
          error = 0;
          child = children[i];
          child_arr = {};

          // Parse attributes
          for(j in attrs) {
            child_arr[attrs[j].n] = self.util_stanza_get_attribute(child, attrs[j].n);

            if(attrs[j].r && !child_arr[attrs[j].n]) {
              error++; break;
            }
          }

          // Parse value
          if(value) {
            child_arr[value.n] = self.util_stanza_get_value(child);
            if(value.r && !child_arr[value.n])  error++;
          }

          if(error !== 0) continue;

          // Push current children
          obj.push(child_arr);
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_stanza_parse_node > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._util_stanza_parse_content = function(stanza) {
    try {
      var i,
          jingle, content, cur_content,
          content_creator, content_name, content_senders,
          cur_candidates;

      // Parse initiate stanza
      jingle = self.util_stanza_jingle(stanza);

      if(jingle) {
        // Childs
        content = self.util_stanza_get_element(jingle, 'content', NS_JINGLE);

        if(content && content.length) {
          for(i = 0; i < content.length; i++) {
            cur_content = content[i];

            // Attrs (avoids senders & creators to be changed later in the flow)
            content_name    = self.util_stanza_get_attribute(cur_content, 'name');
            content_senders = self.get_senders(content_name) || self.util_stanza_get_attribute(cur_content, 'senders');
            content_creator = self.get_creator(content_name) || self.util_stanza_get_attribute(cur_content, 'creator');

            self._set_name(content_name);
            self._set_senders(content_name, content_senders);
            self._set_creator(content_name, content_creator);

            // Payloads (non-destructive setters / cumulative)
            self._set_payloads_remote_add(
              content_name,
              self._util_stanza_parse_payload(cur_content)
            );

            // Candidates (enqueue them for ICE processing, too)
            cur_candidate = self._util_stanza_parse_candidate(cur_content);

            self._set_candidates_remote_add(
              content_name,
              cur_candidate
            );

            self._set_candidates_queue_remote(
              content_name,
              cur_candidate
            );
          }

          return true;
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_stanza_parse_content > ' + e, 1);
    }

    return false;
  };

  /**
   * @private
   */
  self._util_stanza_parse_group = function(stanza) {
    try {
      var i, j,
          jingle,
          group, cur_group,
          content, cur_content, group_content_names;

      // Parse initiate stanza
      jingle = self.util_stanza_jingle(stanza);

      if(jingle) {
        // Childs
        group = self.util_stanza_get_element(jingle, 'group', NS_JINGLE_APPS_GROUPING);

        if(group && group.length) {
          for(i = 0; i < group.length; i++) {
            cur_group = group[i];
            group_content_names = [];

            // Attrs
            group_semantics = self.util_stanza_get_attribute(cur_group, 'semantics');

            // Contents
            content = self.util_stanza_get_element(cur_group, 'content', NS_JINGLE_APPS_GROUPING);

            for(j = 0; j < content.length; j++) {
              cur_content = content[j];

              // Content attrs
              group_content_names.push(
                self.util_stanza_get_attribute(cur_content, 'name')
              );
            }

            // Payloads (non-destructive setters / cumulative)
            self._set_group_remote(
              group_semantics,
              group_content_names
            );
          }
        }
      }

      return true;
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_stanza_parse_group > ' + e, 1);
    }

    return false;
  };

  /**
   * @private
   */
  self._util_stanza_parse_payload = function(stanza_content) {
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
      var description = self.util_stanza_get_element(stanza_content, 'description', NS_JINGLE_APPS_RTP);

      if(description.length) {
        description = description[0];

        var cd_media = self.util_stanza_get_attribute(description, 'media');
        var cd_ssrc  = self.util_stanza_get_attribute(description, 'ssrc');

        if(!cd_media)
          self.get_debug().log('[JSJaCJingle] util_stanza_parse_payload > No media attribute to ' + cc_name + ' stanza.', 1);

        // Initialize current description
        init_content();

        payload_obj.descriptions.attrs.media = cd_media;
        payload_obj.descriptions.attrs.ssrc  = cd_ssrc;

        // Loop on multiple payloads
        var payload = self.util_stanza_get_element(description, 'payload-type', NS_JINGLE_APPS_RTP);

        if(payload.length) {
          for(j = 0; j < payload.length; j++) {
            error           = 0;
            cur_payload     = payload[j];
            cur_payload_arr = {};

            cur_payload_arr.channels  = self.util_stanza_get_attribute(cur_payload, 'channels');
            cur_payload_arr.clockrate = self.util_stanza_get_attribute(cur_payload, 'clockrate');
            cur_payload_arr.id        = self.util_stanza_get_attribute(cur_payload, 'id') || error++;
            cur_payload_arr.name      = self.util_stanza_get_attribute(cur_payload, 'name');

            payload_obj.descriptions.attrs.ptime     = self.util_stanza_get_attribute(cur_payload, 'ptime');
            payload_obj.descriptions.attrs.maxptime  = self.util_stanza_get_attribute(cur_payload, 'maxptime');

            if(error !== 0) continue;

            // Initialize current payload
            cur_payload_id = cur_payload_arr.id;
            init_payload(cur_payload_id);

            // Push current payload
            payload_obj.descriptions.payload[cur_payload_id].attrs = cur_payload_arr;

            // Loop on multiple parameters
            self._util_stanza_parse_node(
              cur_payload,
              'parameter',
              NS_JINGLE_APPS_RTP,
              payload_obj.descriptions.payload[cur_payload_id].parameter,
              [ { n: 'name', r: 1 }, { n: 'value', r: 0 } ]
            );

            // Loop on multiple RTCP-FB
            self._util_stanza_parse_node(
              cur_payload,
              'rtcp-fb',
              NS_JINGLE_APPS_RTP_RTCP_FB,
              payload_obj.descriptions.payload[cur_payload_id]['rtcp-fb'],
              [ { n: 'type', r: 1 }, { n: 'subtype', r: 0 } ]
            );

            // Loop on multiple RTCP-FB-TRR-INT
            self._util_stanza_parse_node(
              cur_payload,
              'rtcp-fb-trr-int',
              NS_JINGLE_APPS_RTP_RTCP_FB,
              payload_obj.descriptions.payload[cur_payload_id]['rtcp-fb-trr-int'],
              [ { n: 'value', r: 1 } ]
            );
          }
        }

        // Parse the encryption element
        var encryption = self.util_stanza_get_element(description, 'encryption', NS_JINGLE_APPS_RTP);

        if(encryption.length) {
          encryption = encryption[0];

          payload_obj.descriptions.encryption.attrs.required = self.util_stanza_get_attribute(encryption, 'required') || '0';

          // Loop on multiple cryptos
          self._util_stanza_parse_node(
            encryption,
            'crypto',
            NS_JINGLE_APPS_RTP,
            payload_obj.descriptions.encryption.crypto,
            [ { n: 'crypto-suite', r: 1 }, { n: 'key-params', r: 1 }, { n: 'session-params', r: 0 }, { n: 'tag', r: 1 } ]
          );

          // Loop on multiple zrtp-hash
          self._util_stanza_parse_node(
            encryption,
            'zrtp-hash',
            NS_JINGLE_APPS_RTP_ZRTP,
            payload_obj.descriptions.encryption['zrtp-hash'],
            [ { n: 'version', r: 1 } ],
            { n: 'value', r: 1 }
          );
        }

        // Parse the SSRC-GROUP elements
        var ssrc_group = self.util_stanza_get_element(description, 'ssrc-group', NS_JINGLE_APPS_RTP_SSMA);

        if(ssrc_group && ssrc_group.length) {
          for(k = 0; k < ssrc_group.length; k++) {
            cur_ssrc_group = ssrc_group[k];
            cur_ssrc_group_semantics = self.util_stanza_get_attribute(cur_ssrc_group, 'semantics') || null;

            if(cur_ssrc_group_semantics !== null) {
              cur_ssrc_group_semantics_obj = {
                'sources': []
              };

              init_ssrc_group_semantics(cur_ssrc_group_semantics);

              self._util_stanza_parse_node(
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
        var ssrc = self.util_stanza_get_element(description, 'source', NS_JINGLE_APPS_RTP_SSMA);

        if(ssrc && ssrc.length) {
          for(l = 0; l < ssrc.length; l++) {
            cur_ssrc = ssrc[l];
            cur_ssrc_id = self.util_stanza_get_attribute(cur_ssrc, 'ssrc') || null;

            if(cur_ssrc_id !== null) {
              payload_obj.descriptions.ssrc[cur_ssrc_id] = [];

              self._util_stanza_parse_node(
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
        self._util_stanza_parse_node(
          description,
          'rtcp-fb',
          NS_JINGLE_APPS_RTP_RTCP_FB,
          payload_obj.descriptions['rtcp-fb'],
          [ { n: 'type', r: 1 }, { n: 'subtype', r: 0 } ]
        );

        // Loop on bandwidth
        self._util_stanza_parse_node(
          description,
          'bandwidth',
          NS_JINGLE_APPS_RTP,
          payload_obj.descriptions.bandwidth,
          [ { n: 'type', r: 1 } ],
          { n: 'value', r: 1 }
        );

        // Parse the RTP-HDREXT element
        self._util_stanza_parse_node(
          description,
          'rtp-hdrext',
          NS_JINGLE_APPS_RTP_RTP_HDREXT,
          payload_obj.descriptions['rtp-hdrext'],
          [ { n: 'id', r: 1 }, { n: 'uri', r: 1 }, { n: 'senders', r: 0 } ]
        );

        // Parse the RTCP-MUX element
        var rtcp_mux = self.util_stanza_get_element(description, 'rtcp-mux', NS_JINGLE_APPS_RTP);

        if(rtcp_mux.length) {
          payload_obj.descriptions['rtcp-mux'] = 1;
        }
      }

      // Parse transport (need to get 'ufrag' and 'pwd' there)
      var transport = self.util_stanza_get_element(stanza_content, 'transport', NS_JINGLE_TRANSPORTS_ICEUDP);

      if(transport.length) {
        payload_obj.transports.pwd          = self.util_stanza_get_attribute(transport, 'pwd');
        payload_obj.transports.ufrag        = self.util_stanza_get_attribute(transport, 'ufrag');

        var fingerprint = self.util_stanza_get_element(transport, 'fingerprint', NS_JINGLE_APPS_DTLS);

        if(fingerprint.length) {
          payload_obj.transports.fingerprint       = {};
          payload_obj.transports.fingerprint.setup = self.util_stanza_get_attribute(fingerprint, 'setup');
          payload_obj.transports.fingerprint.hash  = self.util_stanza_get_attribute(fingerprint, 'hash');
          payload_obj.transports.fingerprint.value = self.util_stanza_get_value(fingerprint);
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_stanza_parse_payload > ' + e, 1);
    }

    return payload_obj;
  };

  /**
   * @private
   */
  self._util_stanza_parse_candidate = function(stanza_content) {
    var candidate_arr = [];

    try {
      var fn_parse_transport = function(namespace, parse_obj) {
        var transport = self.util_stanza_get_element(stanza_content, 'transport', namespace);
        
        if(transport.length) {
          self._util_stanza_parse_node(
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
      self.get_debug().log('[JSJaCJingle] _util_stanza_parse_candidate > ' + e, 1);
    }

    return candidate_arr;
  };

  /*
   * @private
   */
  self._util_stanza_build_node = function(doc, parent, children, name, ns, value) {
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
            if(attr != value)  self.util_stanza_set_attribute(node, attr, child[attr]);
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_stanza_build_node > name: ' + name + ' > ' + e, 1);
    }

    return node;
  };

  /**
   * @private
   */
  self._util_stanza_generate_jingle = function(stanza, attrs) {
    var jingle = null;

    try {
      var cur_attr;

      jingle = stanza.getNode().appendChild(stanza.buildNode('jingle', { 'xmlns': NS_JINGLE }));

      if(!attrs.sid) attrs.sid = self.get_sid();

      for(cur_attr in attrs) self.util_stanza_set_attribute(jingle, cur_attr, attrs[cur_attr]);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_stanza_generate_jingle > ' + e, 1);
    }

    return jingle;
  };

  /**
   * @private
   */
  self._util_stanza_generate_session_info = function(stanza, jingle, args) {
    try {
      var info = jingle.appendChild(stanza.buildNode(args.info, { 'xmlns': NS_JINGLE_APPS_RTP_INFO }));

      // Info attributes
      switch(args.info) {
        case JSJAC_JINGLE_SESSION_INFO_MUTE:
        case JSJAC_JINGLE_SESSION_INFO_UNMUTE:
          self.util_stanza_set_attribute(info, 'creator', self.get_creator_this());
          self.util_stanza_set_attribute(info, 'name',    args.name);

          break;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_stanza_generate_session_info > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._util_stanza_generate_content_local = function(stanza, jingle, override_content) {
    try {
      var cur_media;
      var content_local = override_content ? override_content : self._get_content_local();

      var fn_build_transport = function(content, transport_obj, namespace) {
        var transport = self._util_stanza_build_node(
          stanza,
          content,
          [transport_obj.attrs],
          'transport',
          namespace
        );

        // Fingerprint
        self._util_stanza_build_node(
          stanza,
          transport,
          [transport_obj.fingerprint],
          'fingerprint',
          NS_JINGLE_APPS_DTLS,
          'value'
        );

        // Candidates
        self._util_stanza_build_node(
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

        self.util_stanza_set_attribute(content, 'creator', cur_content.creator);
        self.util_stanza_set_attribute(content, 'name',    cur_content.name);
        self.util_stanza_set_attribute(content, 'senders', cur_content.senders);

        // Build description (if action type allows that element)
        if(self.util_stanza_get_attribute(jingle, 'action') != JSJAC_JINGLE_ACTION_TRANSPORT_INFO) {
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

          var description = self._util_stanza_build_node(
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

              payload_type = self._util_stanza_build_node(
                               stanza,
                               description,
                               [cs_d_p.attrs],
                               'payload-type',
                               NS_JINGLE_APPS_RTP
                             );

              // Parameter
              self._util_stanza_build_node(
                stanza,
                payload_type,
                cs_d_p.parameter,
                'parameter',
                NS_JINGLE_APPS_RTP
              );

              // RTCP-FB (sub)
              self._util_stanza_build_node(
                stanza,
                payload_type,
                cs_d_p['rtcp-fb'],
                'rtcp-fb',
                NS_JINGLE_APPS_RTP_RTCP_FB
              );

              // RTCP-FB-TRR-INT
              self._util_stanza_build_node(
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

                  self._util_stanza_build_node(
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

                self._util_stanza_build_node(
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

              self.util_stanza_set_attribute(encryption, 'required', (cs_d_encryption.attrs.required || '0'));

              // Crypto
              self._util_stanza_build_node(
                stanza,
                encryption,
                cs_d_encryption.crypto,
                'crypto',
                NS_JINGLE_APPS_RTP
              );

              // ZRTP-HASH
              self._util_stanza_build_node(
                stanza,
                encryption,
                cs_d_encryption['zrtp-hash'],
                'zrtp-hash',
                NS_JINGLE_APPS_RTP_ZRTP,
                'value'
              );
            }

            // RTCP-FB (common)
            self._util_stanza_build_node(
              stanza,
              description,
              cs_d_rtcp_fb,
              'rtcp-fb',
              NS_JINGLE_APPS_RTP_RTCP_FB
            );

            // Bandwidth
            self._util_stanza_build_node(
              stanza,
              description,
              cs_d_bandwidth,
              'bandwidth',
              NS_JINGLE_APPS_RTP,
              'value'
            );

            // RTP-HDREXT
            self._util_stanza_build_node(
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
        var cs_transport = self._util_generate_transport(cur_content.transport);

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
      self.get_debug().log('[JSJaCJingle] _util_stanza_generate_content_local > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._util_stanza_generate_group_local = function(stanza, jingle) {
    try {
      var i,
          cur_semantics, cur_group, cur_group_name,
          group;

      var group_local = self._get_group_local();

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
      self.get_debug().log('[JSJaCJingle] _util_stanza_generate_group_local > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._util_generate_content = function(creator, name, senders, payloads, transports) {
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
      var description_cpy      = self.util_object_clone(payloads.descriptions);
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
      self.get_debug().log('[JSJaCJingle] _util_generate_content > ' + e, 1);
    }

    return content_obj;
  };

  /**
   * @private
   */
  self._util_generate_transport = function(transport_init_obj) {
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
        cur_candidate = self.util_object_clone(transport_init_obj.candidate[k]);

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
      self.get_debug().log('[JSJaCJingle] _util_generate_transport > ' + e, 1);
    }

    return transport_obj;
  };

  /**
   * @private
   */
  self._util_build_content_local = function() {
    try {
      var cur_name;

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
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_build_content_local > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._util_build_content_remote = function() {
    try {
      var cur_name;

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
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_build_content_remote > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._util_name_generate = function(media) {
    var name = null;

    try {
      var i, cur_name;

      var content_all = [
        self._get_content_remote(),
        self._get_content_local()
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
      self.get_debug().log('[JSJaCJingle] _util_name_generate > ' + e, 1);
    }

    return name;
  };

  /**
   * @private
   */
  self._util_media_generate = function(name) {
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
          if(name == self._util_name_generate(cur_media)) {
            media = cur_media; break;
          }
        }
      }

      if(!media)  media = name;
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_media_generate > ' + e, 1);
    }

    return media;
  };

  /**
   * @private
   */
  self._util_sdp_generate = function(type, group, payloads, candidates) {
    try {
      var sdp_obj = {};

      sdp_obj.candidates  = self._util_sdp_generate_candidates(candidates);
      sdp_obj.description = self._util_sdp_generate_description(type, group, payloads, sdp_obj.candidates);

      return sdp_obj;
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_sdp_generate > ' + e, 1);
    }

    return {};
  };

  /**
   * @private
   */
  self._util_sdp_generate_candidates = function(candidates) {
    var candidates_arr = [];

    try {
      // Parse candidates
      var i,
          cur_media, cur_name, cur_c_name, cur_candidate, cur_label, cur_id, cur_candidate_str;

      for(cur_name in candidates) {
        cur_c_name = candidates[cur_name];
        cur_media   = self._util_media_generate(cur_name);

        for(i in cur_c_name) {
          cur_candidate = cur_c_name[i];

          cur_label         = JSJAC_JINGLE_MEDIAS[cur_media].label;
          cur_id            = cur_label;
          cur_candidate_str = '';

          cur_candidate_str += 'a=candidate:';
          cur_candidate_str += (cur_candidate.foundation || cur_candidate.id);
          cur_candidate_str += ' ';
          cur_candidate_str += cur_candidate.component;
          cur_candidate_str += ' ';
          cur_candidate_str += cur_candidate.protocol || JSJAC_JINGLE_SDP_CANDIDATE_PROTOCOL_DEFAULT;
          cur_candidate_str += ' ';
          cur_candidate_str += cur_candidate.priority || JSJAC_JINGLE_SDP_CANDIDATE_PRIORITY_DEFAULT;
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
      self.get_debug().log('[JSJaCJingle] _util_sdp_generate_candidates > ' + e, 1);
    }

    return candidates_arr;
  };

  /**
   * @private
   */
  self._util_sdp_generate_description = function(type, group, payloads, sdp_candidates) {
    var payloads_obj = {};

    try {
      var payloads_str = '';
      var is_common_credentials = self._util_is_sdp_common_credentials(payloads);

      // Common vars
      var i, c, j, k, l, m, n, o, p, q, r, s, t, u,
          cur_name, cur_name_first, cur_name_obj,
          cur_media, cur_senders,
          cur_group_semantics, cur_group_names, cur_group_name,
          cur_network_obj, cur_transports_obj, cur_transports_obj_first, cur_description_obj,
          cur_d_pwd, cur_d_ufrag, cur_d_fingerprint,
          cur_d_attrs, cur_d_rtcp_fb, cur_d_bandwidth, cur_d_encryption,
          cur_d_ssrc, cur_d_ssrc_id, cur_d_ssrc_obj, cur_d_ssrc_group, cur_d_ssrc_group_semantics, cur_d_ssrc_group_obj,
          cur_d_rtcp_fb_obj,
          cur_d_payload, cur_d_payload_obj, cur_d_payload_obj_attrs, cur_d_payload_obj_id,
          cur_d_payload_obj_parameter, cur_d_payload_obj_parameter_obj, cur_d_payload_obj_parameter_str,
          cur_d_payload_obj_rtcp_fb, cur_d_payload_obj_rtcp_fb_obj,
          cur_d_payload_obj_rtcp_fb_ttr_int, cur_d_payload_obj_rtcp_fb_ttr_int_obj,
          cur_d_crypto_obj, cur_d_zrtp_hash_obj,
          cur_d_rtp_hdrext, cur_d_rtp_hdrext_obj,
          cur_d_rtcp_mux;

      // Payloads headers
      payloads_str += self._util_sdp_generate_protocol_version();
      payloads_str += WEBRTC_SDP_LINE_BREAK;
      payloads_str += self._util_sdp_generate_origin();
      payloads_str += WEBRTC_SDP_LINE_BREAK;
      payloads_str += self._util_sdp_generate_session_name();
      payloads_str += WEBRTC_SDP_LINE_BREAK;
      payloads_str += self._util_sdp_generate_timing();
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

          payloads_str += self._util_sdp_generate_credentials(
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
        cur_senders           = self.get_senders(cur_name);
        cur_media             = self.get_name(cur_name) ? self._util_media_generate(cur_name) : null;

        // No media?
        if(!cur_media) continue;

        // Network
        cur_network_obj       = self._util_network_extract_main(cur_name, sdp_candidates);

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
        cur_d_ssrc            = cur_description_obj.ssrc;
        cur_d_ssrc_group      = cur_description_obj['ssrc-group'];
        cur_d_rtp_hdrext      = cur_description_obj['rtp-hdrext'];
        cur_d_rtcp_mux        = cur_description_obj['rtcp-mux'];

        // Current media
        payloads_str += self._util_sdp_generate_description_media(
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
          payloads_str += self._util_sdp_generate_credentials(
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

            if(cur_d_rtp_hdrext_obj.senders)
              payloads_str += '/' + cur_d_rtp_hdrext_obj.senders;

            payloads_str += ' ' + cur_d_rtp_hdrext_obj.uri;
            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }
        }

        // Senders
        if(cur_senders) {
          payloads_str += 'a=' + JSJAC_JINGLE_SENDERS[cur_senders];
          payloads_str += WEBRTC_SDP_LINE_BREAK;
        }

        // Name
        if(cur_media && JSJAC_JINGLE_MEDIAS[cur_media]) {
          payloads_str += 'a=mid:' + (JSJAC_JINGLE_MEDIAS[cur_media]).label;
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
                            cur_d_crypto_obj.tag           + ' ' + 
                            cur_d_crypto_obj['crypto-suite']  + ' ' + 
                            cur_d_crypto_obj['key-params']    + 
                            (cur_d_crypto_obj['session-params'] ? (' ' + cur_d_crypto_obj['session-params']) : '');

            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }

          // 'zrtp-hash'
          for(p in cur_d_encryption['zrtp-hash']) {
            cur_d_zrtp_hash_obj = cur_d_encryption['zrtp-hash'][p];

            payloads_str += 'a=zrtp-hash:'                  + 
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

          if(cur_d_rtcp_fb_obj.subtype)
            payloads_str += ' ' + cur_d_rtcp_fb_obj.subtype;

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

              if(cur_d_payload_obj_attrs.channels)
                payloads_str += '/' + cur_d_payload_obj_attrs.channels;
            }
          }

          payloads_str += WEBRTC_SDP_LINE_BREAK;

          // 'parameter'
          if(cur_d_payload_obj_parameter.length) {
            payloads_str += 'a=fmtp:' + cur_d_payload_obj_id + ' ';
            cur_d_payload_obj_parameter_str = '';

            for(o in cur_d_payload_obj_parameter) {
              cur_d_payload_obj_parameter_obj = cur_d_payload_obj_parameter[o];

              if(cur_d_payload_obj_parameter_str)  cur_d_payload_obj_parameter_str += ';';

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

            if(cur_d_payload_obj_rtcp_fb_obj.subtype)
              payloads_str += ' ' + cur_d_payload_obj_rtcp_fb_obj.subtype;

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
        for(cur_d_ssrc_id in cur_d_ssrc) {
          for(r in cur_d_ssrc[cur_d_ssrc_id]) {
            cur_d_ssrc_obj = cur_d_ssrc[cur_d_ssrc_id][r];

            payloads_str += 'a=ssrc';
            payloads_str += ':' + cur_d_ssrc_id;
            payloads_str += ' ' + cur_d_ssrc_obj.name;

            if(cur_d_ssrc_obj.value)
              payloads_str += ':' + cur_d_ssrc_obj.value;

            payloads_str += WEBRTC_SDP_LINE_BREAK;
          }
        }

        // Candidates (some browsers require them there, too)
        if(typeof sdp_candidates == 'object') {
          for(c in sdp_candidates) {
            if((sdp_candidates[c]).label == JSJAC_JINGLE_MEDIAS[cur_media].label)
              payloads_str += (sdp_candidates[c]).candidate;
          }
        }
      }

      // Push to object
      payloads_obj.type = type;
      payloads_obj.sdp  = payloads_str;
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_sdp_generate_description > ' + e, 1);
    }

    return payloads_obj;
  };

  /**
   * @private
   */
  self._util_sdp_generate_protocol_version = function() {
    return 'v=0';
  };

  /**
   * @private
   */
  self._util_sdp_generate_origin = function() {
    var sdp_origin = '';

    try {
      // Values
      var jid = new JSJaCJID(self.get_initiator());

      var username        = jid.getNode()   ? jid.getNode()   : '-';
      var session_id      = '1';
      var session_version = '1';
      var nettype         = JSJAC_JINGLE_SDP_CANDIDATE_SCOPE_DEFAULT;
      var addrtype        = JSJAC_JINGLE_SDP_CANDIDATE_IPVERSION_DEFAULT;
      var unicast_address = JSJAC_JINGLE_SDP_CANDIDATE_IP_DEFAULT;

      // Line content
      sdp_origin += 'o=';
      sdp_origin += username + ' ';
      sdp_origin += session_id + ' ';
      sdp_origin += session_version + ' ';
      sdp_origin += nettype + ' ';
      sdp_origin += addrtype + ' ';
      sdp_origin += unicast_address;
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_sdp_generate_origin > ' + e, 1);
    }

    return sdp_origin;
  };

  /**
   * @private
   */
  self._util_sdp_generate_session_name = function() {
    return 's=' + (self.get_sid() || '-');
  };

  /**
   * @private
   */
  self._util_sdp_generate_timing = function() {
    return 't=0 0';
  };

  /**
   * @private
   */
  self._util_sdp_generate_credentials = function(ufrag, pwd, fingerprint) {
    var sdp = '';

    // ICE credentials
    if(ufrag)  sdp += 'a=ice-ufrag:' + ufrag + WEBRTC_SDP_LINE_BREAK;
    if(pwd)    sdp += 'a=ice-pwd:' + pwd + WEBRTC_SDP_LINE_BREAK;

    // Fingerprint
    if(fingerprint) {
      if(fingerprint.hash && fingerprint.value) {
        sdp += 'a=fingerprint:' + fingerprint.hash + ' ' + fingerprint.value;
        sdp += WEBRTC_SDP_LINE_BREAK;
      }
    }

    return sdp;
  };

  /**
   * @private
   */
  self._util_sdp_generate_description_media = function(media, port, crypto, fingerprint, payload) {
    var sdp_media = '';

    try {
      var i;
      var type_ids = [];

      sdp_media += 'm=' + media + ' ' + port + ' ';

      // Protocol
      if((crypto && crypto.length) || (fingerprint && fingerprint.hash && fingerprint.value))
        sdp_media += 'RTP/SAVPF';
      else
        sdp_media += 'RTP/AVPF';

      // Payload type IDs
      for(i in payload)  type_ids.push(payload[i].attrs.id);

      sdp_media += ' ' + type_ids.join(' ');
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_sdp_generate_description_media > ' + e, 1);
    }

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
   * Generates the constraints object
   * @return constraints object
   * @type object
   */
  self.util_generate_constraints = function() {
    var constraints = {
      audio : false,
      video : false
    };

    try {
      // Medias?
      constraints.audio = true;
      constraints.video = (self.get_media() == JSJAC_JINGLE_MEDIA_VIDEO);

      // Video configuration
      if(constraints.video === true) {
        // Resolution?
        switch(self.get_resolution()) {
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
        if(self.get_bandwidth())
          constraints.video.optional = [{ bandwidth: self.get_bandwidth() }];

        // FPS?
        if(self.get_fps())
          constraints.video.mandatory.minFrameRate = self.get_fps();

        // Custom video source? (screenshare)
        if(self.get_media()        == JSJAC_JINGLE_MEDIA_VIDEO         && 
           self.get_video_source() != JSJAC_JINGLE_VIDEO_SOURCE_CAMERA ) {
          if(document.location.protocol !== 'https:')
            self.get_debug().log('[JSJaCJingle] util_generate_constraints > HTTPS might be required to share screen, otherwise you may get a permission denied error.', 0);

          // Unsupported browser? (for that feature)
          if(self._util_browser().name != JSJAC_JINGLE_BROWSER_CHROME) {
            self.get_debug().log('[JSJaCJingle] util_generate_constraints > Video source not supported by ' + self._util_browser().name + ' (source: ' + self.get_video_source() + ').', 1);
            
            self.terminate(JSJAC_JINGLE_REASON_MEDIA_ERROR);
            return;
          }

          constraints.audio           = false;
          constraints.video.mandatory = {
            'chromeMediaSource': self.get_video_source()
          };
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] util_generate_constraints > ' + e, 1);
    }

    return constraints;
  };

  /**
   * @private
   */
  self._util_is_sdp_common_credentials = function(payloads) {
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
      self.get_debug().log('[JSJaCJingle] _util_is_sdp_common_credentials > ' + e, 1);
    }

    return is_same;
  };

  /**
   * @private
   */
  self._util_network_extract_main = function(media, candidates) {
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
          cur_candidate_parse = self._util_sdp_parse_candidate(cur_candidate.candidate);

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
      self.get_debug().log('[JSJaCJingle] _util_network_extract_main > ' + e, 1);
    }

    return network_obj;
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
   * @private
   */
  self._util_map_register_view = function(type) {
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
          fn.view.get   = self.get_local_view;
          fn.view.set   = self._set_local_view;
          fn.stream.get = self._get_local_stream;
          fn.stream.set = self._set_local_stream;
          break;

        case 'remote':
          fn.type       = type;
          fn.view.get   = self.get_remote_view;
          fn.view.set   = self._set_remote_view;
          fn.stream.get = self._get_remote_stream;
          fn.stream.set = self._set_remote_stream;
          break;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_map_register_view > ' + e, 1);
    }

    return fn;
  };

  /**
   * @private
   */
  self._util_map_unregister_view = function(type) {
    return self._util_map_register_view(type);
  };

  /**
   * @private
   */
  self._util_peer_stream_attach = function(element, stream, mute) {
    try {
      var i;
      var stream_src = stream ? URL.createObjectURL(stream) : '';

      for(i in element) {
        element[i].src = stream_src;

        if(navigator.mozGetUserMedia)
          element[i].play();
        else
          element[i].autoplay = true;

        if(typeof mute == 'boolean') element[i].muted = mute;
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_peer_stream_attach > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._util_peer_stream_detach = function(element) {
    try {
      var i;

      for(i in element) {
        element[i].pause();
        element[i].src = '';
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_peer_stream_detach > ' + e, 1);
    }
  };

  /**
   * @private
   */
  self._util_sdp_parse_payload = function(sdp_payload) {
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

        if(!('descriptions' in payload[name]))        payload[name].descriptions      = {};
        if(!(sub  in payload[name].descriptions))  payload[name].descriptions[sub] = sub_default;
      };

      var init_transports = function(name, sub, sub_default) {
        init_content(name);

        if(!('transports' in payload[name]))        payload[name].transports      = {};
        if(!(sub  in payload[name].transports))  payload[name].transports[sub] = sub_default;
      };

      var init_ssrc = function(name, id) {
        init_descriptions(name, 'ssrc', {});

        if(!(id in payload[name].descriptions.ssrc))
          payload[name].descriptions.ssrc[id] = [];
      };

      var init_ssrc_group = function(name, semantics) {
        init_descriptions(name, 'ssrc-group', {});

        if(!(semantics in payload[name].descriptions['ssrc-group']))
          payload[name].descriptions['ssrc-group'][semantics] = [];
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
          cur_name  = self._util_name_generate(cur_media);

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
          if(error !== 0) continue;

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
          if(error !== 0) continue;

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

                while(cur_fmtp_key.length && !cur_fmtp_key[0])
                  cur_fmtp_key = cur_fmtp_key.substring(1);
              } else {
                cur_fmtp_key = cur_fmtp_values[j];
                cur_fmtp_value = null;
              }

              // Populate current object
              error = 0;
              cur_fmtp = {};

              cur_fmtp.name  = cur_fmtp_key    || error++;
              cur_fmtp.value = cur_fmtp_value;

              // Incomplete?
              if(error !== 0) continue;

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
          if(error !== 0) continue;

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
          if(error !== 0) continue;

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
          if(error !== 0) continue;

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
          if(error !== 0) continue;

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
          if(error !== 0) continue;

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
          if(error !== 0) continue;

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
          if(error !== 0) continue;

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
          if(error !== 0) continue;

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

          if(!common_transports.pwd)
            common_transports.pwd = m_pwd[1];

          continue;
        }

        m_ufrag = (R_WEBRTC_SDP_ICE_PAYLOAD.ufrag).exec(cur_line);

        // 'ufrag' line?
        if(m_ufrag) {
          init_transports(cur_name, 'ufrag', m_ufrag[1]);

          if(!common_transports.ufrag)
            common_transports.ufrag = m_ufrag[1];

          continue;
        }

        // 'candidate' line? (shouldn't be there)
        m_candidate = R_WEBRTC_SDP_CANDIDATE.exec(cur_line);

        if(m_candidate) {
          self._util_sdp_parse_candidate_store({
            media     : cur_media,
            candidate : cur_line
          });

          continue;
        }
      }

      // Filter medias
      for(cur_check_name in payload) {
        // Undesired media?
        if(!self.get_name()[cur_check_name]) {
          delete payload[cur_check_name]; continue;
        }

        // Validate transports
        if(typeof payload[cur_check_name].transports !== 'object')
          payload[cur_check_name].transports = {};

        for(cur_transport_sub in common_transports) {
          if(!payload[cur_check_name].transports[cur_transport_sub])
            payload[cur_check_name].transports[cur_transport_sub] = common_transports[cur_transport_sub];
        }
      }
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_sdp_parse_payload > ' + e, 1);
    }

    return payload;
  };

  /**
   * @private
   */
  self._util_sdp_parse_group = function(sdp_payload) {
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
      self.get_debug().log('[JSJaCJingle] _util_sdp_parse_group > ' + e, 1);
    }

    return group;
  };

  /**
   * @private
   */
  self._util_sdp_resolution_payload = function(payload) {
    try {
      if(!payload || typeof payload !== 'object') return {};

      // No video?
      if(self.get_media_all().indexOf(JSJAC_JINGLE_MEDIA_VIDEO) === -1) return payload;

      var i, j, k, cur_media;
      var cur_payload, res_arr, constraints;
      var res_height = null;
      var res_width  = null;

      // Try local view? (more reliable)
      for(i in self.get_local_view()) {
        if(typeof self.get_local_view()[i].videoWidth  == 'number'  &&
           typeof self.get_local_view()[i].videoHeight == 'number'  ) {
          res_height = self.get_local_view()[i].videoHeight;
          res_width  = self.get_local_view()[i].videoWidth;

          if(res_height && res_width)  break;
        }
      }

      // Try media constraints? (less reliable)
      if(!res_height || !res_width) {
        self.get_debug().log('[JSJaCJingle] _util_sdp_resolution_payload > Could not get local video resolution, falling back on constraints (local video may not be ready).', 0);

        constraints = self.util_generate_constraints();

        // Still nothing?!
        if(typeof constraints.video                     !== 'object'  || 
           typeof constraints.video.mandatory           !== 'object'  || 
           typeof constraints.video.mandatory.minWidth  !== 'number'  || 
           typeof constraints.video.mandatory.minHeight !== 'number'  ) {
          self.get_debug().log('[JSJaCJingle] _util_sdp_resolution_payload > Could not get local video resolution (not sending it).', 1);
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
        if(cur_media != JSJAC_JINGLE_MEDIA_VIDEO) continue;

        cur_payload = payload[cur_media].descriptions.payload;

        for(j in cur_payload) {
          if(typeof cur_payload[j].parameter !== 'object')  cur_payload[j].parameter = [];

          for(k in res_arr)
            (cur_payload[j].parameter).push(res_arr[k]);
        }
      }

      self.get_debug().log('[JSJaCJingle] _util_sdp_resolution_payload > Got local video resolution (' + res_width + 'x' + res_height + ').', 2);
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_sdp_resolution_payload > ' + e, 1);
    }

    return payload;
  };

  /**
   * @private
   */
  self._util_sdp_parse_candidate = function(sdp_candidate) {
    var candidate = {};

    try {
      if(!sdp_candidate)  return candidate;

      var error     = 0;
      var matches   = R_WEBRTC_SDP_CANDIDATE.exec(sdp_candidate);

      // Matches!
      if(matches) {
        candidate.component     = matches[2]  || error++;
        candidate.foundation    = matches[1]  || error++;
        candidate.generation    = matches[16] || JSJAC_JINGLE_GENERATION;
        candidate.id            = self.util_generate_id();
        candidate.ip            = matches[5]  || error++;
        candidate.network       = JSJAC_JINGLE_NETWORK;
        candidate.port          = matches[6]  || error++;
        candidate.priority      = matches[4]  || error++;
        candidate.protocol      = matches[3]  || error++;
        candidate['rel-addr']   = matches[11];
        candidate['rel-port']   = matches[13];
        candidate.type          = matches[8]  || error++;
      }

      // Incomplete?
      if(error !== 0) return {};
    } catch(e) {
      self.get_debug().log('[JSJaCJingle] _util_sdp_parse_candidate > ' + e, 1);
    }

    return candidate;
  };

  /**
   * @private
   */
  self._util_sdp_parse_candidate_store = function(sdp_candidate) {
    // Store received candidate
    var candidate_media = sdp_candidate.media;
    var candidate_data  = sdp_candidate.candidate;

    // Convert SDP raw data to an object
    var candidate_obj   = self._util_sdp_parse_candidate(candidate_data);

    self._set_candidates_local(
      self._util_name_generate(
        candidate_media
      ),

      candidate_obj
    );

    // Enqueue candidate
    self._set_candidates_queue_local(
      self._util_name_generate(
        candidate_media
      ),

      candidate_obj
    );
  };
}
