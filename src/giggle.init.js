/**
 * @fileoverview Giggle library - Initialization components
 *
 * @url https://github.com/valeriansaliou/giggle
 * @author Valérian Saliou https://valeriansaliou.name/
 *
 * @copyright 2015, Hakuma Holdings Ltd.
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module giggle/init */
/** @exports GiggleInit */


/**
 * Library initialization class.
 * @class
 * @classdesc  Library initialization class.
 * @requires   nicolas-van/ring.js
 * @requires   giggle/main
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @param      {Object}        [args]        - Initialization arguments.
 * @property   {__GigglePlug}  [args.plug]   - The plug instance.
 */
var GiggleInit = ring.create(
  /** @lends GiggleInit.prototype */
  {
    /**
     * Constructor
     */
    constructor: function(args) {
      if(args && args.plug) {
        /**
         * @constant
         * @member {__GigglePlug}
         * @readonly
         * @default
         * @public
         */
        this.plug = args.plug;
      } else {
        this.plug = {};
      }
    },

    /**
     * Query the server for external services
     * @private
     */
    _extdisco: function() {
      GiggleStorage.get_debug().log('[giggle:init] _extdisco > Discovering available services...', 2);

      try {
        // Pending state (defer other requests)
        Giggle._defer(true);

        // Build request
        var request = this.plug.iq();

        request.to(GiggleStorage.get_connection().domain);
        request.type(GIGGLE_IQ_TYPE_GET);

        request.child('services', {
          'xmlns': NS_EXTDISCO
        });

        request.send(function(response) {
          try {
            // Parse response
            if(response.type() == GIGGLE_IQ_TYPE_RESULT) {
              var i,
                  service_arr, cur_service,
                  cur_host, cur_password, cur_port, cur_transport, cur_type, cur_username,
                  store_obj;

              var services = response.select_element_uniq('services', NS_EXTDISCO);

              if(services) {
                service_arr = services.select_element('service', NS_EXTDISCO);

                for(i = 0; i < service_arr.length; i++) {
                  cur_service = service_arr[i];

                  cur_host      = cur_service.attribute('host')       || null;
                  cur_port      = cur_service.attribute('port')       || null;
                  cur_transport = cur_service.attribute('transport')  || null;
                  cur_type      = cur_service.attribute('type')       || null;

                  cur_username  = cur_service.attribute('username')   || null;
                  cur_password  = cur_service.attribute('password')   || null;

                  if(!cur_host || !cur_type)  continue;

                  if(!(cur_type in GiggleStorage.get_extdisco())) {
                    GiggleStorage.get_debug().log('[giggle:init] _extdisco > handle > Service skipped (type: ' + cur_type + ', host: ' + cur_host + ', port: ' + cur_port + ', transport: ' + cur_transport + ').', 4);
                    continue;
                  }

                  store_obj = {
                    'host'      : cur_host,
                    'port'      : cur_port,
                    'transport' : cur_transport,
                    'type'      : cur_type
                  };

                  if(cur_type == 'turn') {
                    store_obj.username = cur_username;
                    store_obj.password = cur_password;
                  }

                  GiggleStorage.get_extdisco()[cur_type].push(store_obj);

                  GiggleStorage.get_debug().log('[giggle:init] _extdisco > handle > Service stored (type: ' + cur_type + ', host: ' + cur_host + ', port: ' + cur_port + ', transport: ' + cur_transport + ').', 4);
                }
              }

              GiggleStorage.get_debug().log('[giggle:init] _extdisco > handle > Discovered available services.', 2);
            } else {
              GiggleStorage.get_debug().log('[giggle:init] _extdisco > handle > Could not discover services (server might not support XEP-0215).', 0);
            }
          } catch(e) {
            GiggleStorage.get_debug().log('[giggle:init] _extdisco > handle > ' + e, 1);
          }

          GiggleStorage.get_debug().log('[giggle:init] _extdisco > Ready.', 2);

          // Execute deferred requests
          Giggle._defer(false);
        });
      } catch(e) {
        GiggleStorage.get_debug().log('[giggle:init] _extdisco > ' + e, 1);

        // Execute deferred requests
        Giggle._defer(false);
      }
    },

    /**
     * Query the server for Jingle Relay Nodes services
     * @private
     */
    _relaynodes: function() {
      GiggleStorage.get_debug().log('[giggle:init] _relaynodes > Discovering available Jingle Relay Nodes services...', 2);

      try {
        // Pending state (defer other requests)
        Giggle._defer(true);

        // Build request
        var request = this.plug.iq();

        request.to(GiggleStorage.get_connection().domain);
        request.type(GIGGLE_IQ_TYPE_GET);

        request.child('services', {
          'xmlns': NS_JABBER_JINGLENODES
        });

        request.send(function(response) {
          try {
            // Parse response
            if(response.type() == GIGGLE_IQ_TYPE_RESULT) {
              var i,
                  stun_arr, cur_stun,
                  cur_policy, cur_address, cur_protocol;

              var services = response.select_element_uniq('services', NS_JABBER_JINGLENODES);

              if(services) {
                // Parse STUN servers
                stun_arr = services.select_element('stun', NS_JABBER_JINGLENODES);

                for(i = 0; i < stun_arr.length; i++) {
                  cur_stun = stun_arr[i];

                  cur_policy    = cur_stun.attribute('policy')    || null;
                  cur_address   = cur_stun.attribute('address')   || null;
                  cur_port      = cur_stun.attribute('port')      || null;
                  cur_protocol  = cur_stun.attribute('protocol')  || null;

                  if(!cur_address || !cur_protocol || !cur_policy || (cur_policy && cur_policy != 'public'))  continue;

                  GiggleStorage.get_relaynodes().stun.push({
                    'host'      : cur_address,
                    'port'      : cur_port,
                    'transport' : cur_protocol,
                    'type'      : 'stun'
                  });

                  GiggleStorage.get_debug().log('[giggle:init] _relaynodes > handle > STUN service stored (address: ' + cur_address + ', port: ' + cur_port + ', policy: ' + cur_policy + ', protocol: ' + cur_protocol + ').', 4);
                }
              }

              GiggleStorage.get_debug().log('[giggle:init] _relaynodes > handle > Discovered available Jingle Relay Nodes services.', 2);
            } else {
              GiggleStorage.get_debug().log('[giggle:init] _relaynodes > handle > Could not discover Jingle Relay Nodes services (server might not support XEP-0278).', 0);
            }
          } catch(e) {
            GiggleStorage.get_debug().log('[giggle:init] _relaynodes > handle > ' + e, 1);
          }

          GiggleStorage.get_debug().log('[giggle:init] _relaynodes > Ready.', 2);

          // Execute deferred requests
          Giggle._defer(false);
        });
      } catch(e) {
        GiggleStorage.get_debug().log('[giggle:init] _relaynodes > ' + e, 1);

        // Execute deferred requests
        Giggle._defer(false);
      }
    },

    /**
     * Query some external APIs for fallback STUN/TURN (must be configured)
     * @private
     * @param {String} fallback_url
     */
    _fallback: function(fallback_url) {
      GiggleStorage.get_debug().log('[giggle:init] _fallback > Discovering fallback services...', 2);

      try {
        // Pending state (defer other requests)
        Giggle._defer(true);

        // Generate fallback API URL
        fallback_url += '?username=' +
                        encodeURIComponent(GiggleStorage.get_connection().username + '@' + GiggleStorage.get_connection().domain);

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
                  cur_username, cur_password,
                  store_obj;

              if(data.uris && data.uris.length) {
                GiggleStorage.get_debug().log('[giggle:init] _fallback > handle > Parsing ' + data.uris.length + ' URIs...', 2);

                for(i in data.uris) {
                  cur_url = data.uris[i];

                  if(cur_url) {
                    // Parse current URL
                    cur_parse = R_GIGGLE_SERVICE_URI.exec(cur_url);

                    if(cur_parse) {
                      cur_type = cur_parse[1]        || null;
                      cur_host = cur_parse[2]        || null;
                      cur_port = cur_parse[3]        || null;
                      cur_transport = cur_parse[4]   || null;

                      cur_username  = data.username  || null;
                      cur_password  = data.password  || null;

                      if(!cur_host || !cur_type)  continue;

                      if(!(cur_type in GiggleStorage.get_fallback())) {
                        GiggleStorage.get_debug().log('[giggle:init] _fallback > handle > Service skipped (type: ' + cur_type + ', host: ' + cur_host + ', port: ' + cur_port + ', transport: ' + cur_transport + ').', 4);
                        continue;
                      }

                      store_obj = {
                        'host'      : cur_host,
                        'port'      : cur_port,
                        'transport' : cur_transport,
                        'type'      : cur_type
                      };

                      if(cur_type == 'turn') {
                        store_obj.username = cur_username;
                        store_obj.password = cur_password;
                      }

                      GiggleStorage.get_fallback()[cur_type].push(store_obj);

                      GiggleStorage.get_debug().log('[giggle:init] _fallback > handle > Fallback service stored (type: ' + cur_type + ', host: ' + cur_host + ', port: ' + cur_port + ', transport: ' + cur_transport + ').', 4);
                    } else {
                      GiggleStorage.get_debug().log('[giggle:init] _fallback > handle > Fallback service not stored, weird URI (' + cur_url + ').', 0);
                    }
                  }
                }

                GiggleStorage.get_debug().log('[giggle:init] _fallback > handle > Finished parsing URIs.', 2);
              } else {
                GiggleStorage.get_debug().log('[giggle:init] _fallback > handle > No URI to parse.', 2);
              }

              GiggleStorage.get_debug().log('[giggle:init] _fallback > handle > Discovered fallback services.', 2);
            } else {
              GiggleStorage.get_debug().log('[giggle:init] _fallback > handle > Could not discover fallback services (API malfunction).', 0);
            }

            GiggleStorage.get_debug().log('[giggle:init] _fallback > Ready.', 2);

            // Execute deferred requests
            Giggle._defer(false);
          }
        };

        xhr.send();
      } catch(e) {
        GiggleStorage.get_debug().log('[giggle:init] _fallback > ' + e, 1);
      }
    },
  }
);
