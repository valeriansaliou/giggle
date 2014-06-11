/**
 * @fileoverview JSJaC Jingle library - Initialization components
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


var JSJaCJingleInit = new (ring.create({
  /**
   * Query the server for external services
   */
  extdisco: function() {
    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:extdisco > Discovering available services...', 2);

    try {
      // Pending state (defer other requests)
      JSJaCJingle.defer(true);

      // Build request
      var request = new JSJaCIQ();

      request.setTo(JSJAC_JINGLE_STORE_CONNECTION.domain);
      request.setType(JSJAC_JINGLE_STANZA_TYPE_GET);

      request.getNode().appendChild(request.buildNode('services', { 'xmlns': NS_EXTDISCO }));

      JSJAC_JINGLE_STORE_CONNECTION.send(request, function(response) {
        try {
          // Parse response
          if(response.getType() == JSJAC_JINGLE_STANZA_TYPE_RESULT) {
            var i,
                service_arr, cur_service,
                cur_host, cur_password, cur_port, cur_transport, cur_type, cur_username;

            var services = response.getChild('services', NS_EXTDISCO);

            if(services) {
              service_arr = services.getElementsByTagNameNS(NS_EXTDISCO, 'service');

              for(i = 0; i < service_arr.length; i++) {
                cur_service = service_arr[i];

                cur_host      = cur_service.getAttribute('host')       || null;
                cur_port      = cur_service.getAttribute('port')       || null;
                cur_transport = cur_service.getAttribute('transport')  || null;
                cur_type      = cur_service.getAttribute('type')       || null;

                cur_username  = cur_service.getAttribute('username')   || null;
                cur_password  = cur_service.getAttribute('password')   || null;

                if(!cur_host || !cur_type)  continue;

                if(!(cur_type in JSJAC_JINGLE_STORE_EXTDISCO)) {
                  JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:extdisco > handle > Service skipped (type: ' + cur_type + ', host: ' + cur_host + ', port: ' + cur_port + ', transport: ' + cur_transport + ').', 4);
                  continue;
                }

                JSJAC_JINGLE_STORE_EXTDISCO[cur_type][cur_host] = {
                  'port'      : cur_port,
                  'transport' : cur_transport,
                  'type'      : cur_type
                };

                if(cur_type == 'turn') {
                  JSJAC_JINGLE_STORE_EXTDISCO[cur_type][cur_host].username = cur_username;
                  JSJAC_JINGLE_STORE_EXTDISCO[cur_type][cur_host].password = cur_password;
                }

                JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:extdisco > handle > Service stored (type: ' + cur_type + ', host: ' + cur_host + ', port: ' + cur_port + ', transport: ' + cur_transport + ').', 4);
              }
            }

            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:extdisco > handle > Discovered available services.', 2);
          } else {
            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:extdisco > handle > Could not discover services (server might not support XEP-0215).', 0);
          }
        } catch(e) {
          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:extdisco > handle > ' + e, 1);
        }

        JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:extdisco > Ready.', 2);

        // Execute deferred requests
        JSJaCJingle.defer(false);
      });
    } catch(e) {
      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:extdisco > ' + e, 1);
      
      // Execute deferred requests
      JSJaCJingle.defer(false);
    }
  },

  /**
   * Query the server for Jingle Relay Nodes services
   */
  relaynodes: function() {
    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:relaynodes > Discovering available Jingle Relay Nodes services...', 2);

    try {
      // Pending state (defer other requests)
      JSJaCJingle.defer(true);

      // Build request
      var request = new JSJaCIQ();

      request.setTo(JSJAC_JINGLE_STORE_CONNECTION.domain);
      request.setType(JSJAC_JINGLE_STANZA_TYPE_GET);

      request.getNode().appendChild(request.buildNode('services', { 'xmlns': NS_JABBER_JINGLENODES }));

      JSJAC_JINGLE_STORE_CONNECTION.send(request, function(response) {
        try {
          // Parse response
          if(response.getType() == JSJAC_JINGLE_STANZA_TYPE_RESULT) {
            var i,
                stun_arr, cur_stun,
                cur_policy, cur_address, cur_protocol;

            var services = response.getChild('services', NS_JABBER_JINGLENODES);

            if(services) {
              // Parse STUN servers
              stun_arr = services.getElementsByTagNameNS(NS_JABBER_JINGLENODES, 'stun');

              for(i = 0; i < stun_arr.length; i++) {
                cur_stun = stun_arr[i];

                cur_policy    = cur_stun.getAttribute('policy')    || null;
                cur_address   = cur_stun.getAttribute('address')   || null;
                cur_port      = cur_stun.getAttribute('port')      || null;
                cur_protocol  = cur_stun.getAttribute('protocol')  || null;

                if(!cur_address || !cur_protocol || !cur_policy || (cur_policy && cur_policy != 'public'))  continue;

                JSJAC_JINGLE_STORE_RELAYNODES.stun[cur_address] = {
                  'port'      : cur_port,
                  'transport' : cur_protocol,
                  'type'      : 'stun'
                };

                JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:relaynodes > handle > STUN service stored (address: ' + cur_address + ', port: ' + cur_port + ', policy: ' + cur_policy + ', protocol: ' + cur_protocol + ').', 4);
              }
            }

            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:relaynodes > handle > Discovered available Jingle Relay Nodes services.', 2);
          } else {
            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:relaynodes > handle > Could not discover Jingle Relay Nodes services (server might not support XEP-0278).', 0);
          }
        } catch(e) {
          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:relaynodes > handle > ' + e, 1);
        }

        JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:relaynodes > Ready.', 2);

        // Execute deferred requests
        JSJaCJingle.defer(false);
      });
    } catch(e) {
      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:relaynodes > ' + e, 1);
      
      // Execute deferred requests
      JSJaCJingle.defer(false);
    }
  },

  /**
   * Query some external APIs for fallback STUN/TURN (must be configured)
   */
  fallback: function(fallback_url) {
    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > Discovering fallback services...', 2);

    try {
      // Pending state (defer other requests)
      JSJaCJingle.defer(true);

      // Generate fallback API URL
      fallback_url += '?username=' + 
                      encodeURIComponent(JSJAC_JINGLE_STORE_CONNECTION.username + '@' + JSJAC_JINGLE_STORE_CONNECTION.domain);

      // Proceed request
      var xhr = new XMLHttpRequest();
      xhr.open('GET', fallback_url, true);

      xhr.onreadystatechange = function() {
        if(xhr.readyState === 4) {
          // Success?
          if(xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);

            var cur_parse,
                i, cur_url,
                cur_type, cur_host, cur_port, cur_transport,
                cur_username, cur_password;

            if(data.uris && data.uris.length) {
              JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > handle > Parsing ' + data.uris.length + ' URIs...', 2);

              for(i in data.uris) {
                cur_url = data.uris[i];

                if(cur_url) {
                  // Parse current URL
                  cur_parse = R_JSJAC_JINGLE_SERVICE_URI.exec(cur_url);

                  if(cur_parse) {
                    cur_type = cur_parse[1]        || null;
                    cur_host = cur_parse[2]        || null;
                    cur_port = cur_parse[3]        || null;
                    cur_transport = cur_parse[4]   || null;

                    cur_username  = data.username  || null;
                    cur_password  = data.password  || null;

                    if(!cur_host || !cur_type)  continue;

                    if(!(cur_type in JSJAC_JINGLE_STORE_FALLBACK)) {
                      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > handle > Service skipped (type: ' + cur_type + ', host: ' + cur_host + ', port: ' + cur_port + ', transport: ' + cur_transport + ').', 4);
                      continue;
                    }

                    JSJAC_JINGLE_STORE_FALLBACK[cur_type][cur_host] = {
                      'port'      : cur_port,
                      'transport' : cur_transport,
                      'type'      : cur_type
                    };

                    if(cur_type == 'turn') {
                      JSJAC_JINGLE_STORE_FALLBACK[cur_type][cur_host].username = cur_username;
                      JSJAC_JINGLE_STORE_FALLBACK[cur_type][cur_host].password = cur_password;
                    }

                    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > handle > Fallback service stored (type: ' + cur_type + ', host: ' + cur_host + ', port: ' + cur_port + ', transport: ' + cur_transport + ').', 4);
                  } else {
                    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > handle > Fallback service not stored, weird URI (' + cur_url + ').', 0);
                  }
                }
              }

              JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > handle > Finished parsing URIs.', 2);
            } else {
              JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > handle > No URI to parse.', 2);
            }

            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > handle > Discovered fallback services.', 2);
          } else {
            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > handle > Could not discover fallback services (API malfunction).', 0);
          }

          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > Ready.', 2);

          // Execute deferred requests
          JSJaCJingle.defer(false);
        }
      };

      xhr.send();
    } catch(e) {
      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:init] lib:fallback > ' + e, 1);
    }
  },
}))();
