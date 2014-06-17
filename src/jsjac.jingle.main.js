/**
 * @fileoverview JSJaC Jingle library - Common components
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/main */
/** @exports JSJaCJingle */


/**
 * Library main class.
 * @instance
 * @requires   nicolas-van/ring.js
 * @requires   sstrigler/JSJaC
 * @requires   jsjac-jingle/init
 * @requires   jsjac-jingle/single
 * @requires   jsjac-jingle/muji
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://stefan-strigler.de/jsjac-1.3.4/doc/|JSJaC Documentation}
 */
var JSJaCJingle = new (ring.create(
  /** @lends JSJaCJingle.prototype */
  {
    /**
     * Starts a new Jingle session
     * @public
     * @param {String} type
     * @param {Object} [args]
     * @returns {JSJaCJingleSingle|JSJaCJingleMuji} JSJaCJingle session instance
     */
    session: function(type, args) {
      var jingle;

      try {
        switch(type) {
          case JSJAC_JINGLE_SESSION_SINGLE:
            jingle = new JSJaCJingleSingle(args);
            break;

          case JSJAC_JINGLE_SESSION_MUJI:
            jingle = new JSJaCJingleMuji(args);
            break;

          default:
            throw ('Unknown session type: ' + type);
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] session > ' + e, 1);
      } finally {
        return jingle;
      }
    },

    /**
     * Listens for Jingle events
     * @public
     * @param {Object} [args]
     */
    listen: function(args) {
      try {
        if(args && args.connection)
          JSJaCJingleStorage.set_connection(args.connection);

        if(args && args.initiate)
          JSJaCJingleStorage.set_initiate(args.initiate);

        if(args && args.debug)
          JSJaCJingleStorage.set_debug(args.debug);

        // Incoming IQs handler
        var cur_type, route_map = {};
        route_map[JSJAC_JINGLE_STANZA_IQ]        = this._route_iq;
        route_map[JSJAC_JINGLE_STANZA_MESSAGE]   = this._route_message;
        route_map[JSJAC_JINGLE_STANZA_PRESENCE]  = this._route_presence;

        for(cur_type in route_map) {
          JSJaCJingleStorage.get_connection().registerHandler(
            cur_type,
            route_map[cur_type].bind(this)
          );
        }

        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] listen > Listening.', 2);

        // Discover available network services
        if(!args || args.extdisco !== false)
          JSJaCJingleInit._extdisco();
        if(!args || args.relaynodes !== false)
          JSJaCJingleInit._relaynodes();
        if(args.fallback && typeof args.fallback === 'string')
          JSJaCJingleInit._fallback(args.fallback);
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] listen > ' + e, 1);
      }
    },

    /**
     * Maps the Jingle disco features
     * @public
     * @returns {Array} Feature namespaces
     */
    disco: function() {
      return JSJAC_JINGLE_AVAILABLE ? MAP_DISCO_JINGLE : [];
    },

    /**
     * Routes Jingle IQ stanzas
     * @private
     * @param {JSJaCPacket} stanza
     */
    _route_iq: function(stanza) {
      try {
        var from = stanza.getFrom();

        // Single or Muji?
        var is_muji   = (this._read(JSJAC_JINGLE_SESSION_MUJI, from) !== null);
        var is_single = !is_muji;

        var action        = null;
        var sid           = null;
        var session_route = null;

        // Route the incoming stanza
        var jingle = stanza.getChild('jingle', NS_JINGLE);

        if(jingle) {
          sid = jingle.getAttribute('sid');
          action = jingle.getAttribute('action');
        } else {
          var stanza_id = stanza.getID();

          if(stanza_id) {
            var is_jingle = stanza_id.indexOf(JSJAC_JINGLE_STANZA_ID_PRE + '_') !== -1;

            if(is_jingle) {
              var stanza_id_split = stanza_id.split('_');
              sid = stanza_id_split[1];
            }
          }
        }

        // WebRTC not available ATM?
        if(jingle && !JSJAC_JINGLE_AVAILABLE) {
          JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_iq > Dropped Jingle packet (WebRTC not available).', 0);

          (new JSJaCJingleSingle({ to: from })).send_error(stanza, XMPP_ERROR_SERVICE_UNAVAILABLE);
        } else if(is_muji) {
          // Unknown Muji error
          var fn_raise_unknown_muji = function(stanza, from, sid) {
            JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_iq > Unknown Muji participant session (sid: ' + sid + ').', 0);

            (new JSJaCJingleSingle({ to: from })).send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
          };

          // Muji: new session? Or registered one?
          session_route = this._read(JSJAC_JINGLE_SESSION_MUJI, from);

          if(session_route !== null) {
            // Get participant
            var username    = (new JSJaCJID(from)).getResource();
            var participant = {};

            if(username && participant.session  &&
              (participant.session instanceof JSJaCJingleSingle)) {
              // Route to Single session
              var session_route_single = this._read(
                JSJAC_JINGLE_SESSION_SINGLE,
                participant.session.get_sid()
              );

              if(session_route_single !== null) {
                JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_iq > [' + username + '] > Routed to Muji participant session (sid: ' + session_route_single.get_sid() + ').', 2);

                session_route_single.handle(stanza);
              } else {
                fn_raise_unknown_muji(stanza, from, participant.session.get_sid());
              }
            } else {
              fn_raise_unknown_muji(stanza, from, sid);
            }
          } else {
            JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_iq > Unknown Muji session (sid: ' + sid + ').', 0);

            (new JSJaCJingleSingle({ to: from })).send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
          }
        } else if(is_single) {
          // Single: new session? Or registered one?
          session_route = this._read(JSJAC_JINGLE_SESSION_SINGLE, sid);

          if(action == JSJAC_JINGLE_ACTION_SESSION_INITIATE && session_route === null) {
            JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_iq > New Jingle session (sid: ' + sid + ').', 2);

            JSJaCJingleStorage.get_initiate()(stanza);
          } else if(sid) {
            if(session_route !== null) {
              JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_iq > Routed to Jingle session (sid: ' + sid + ').', 2);

              session_route.handle(stanza);
            } else if(stanza.getType() == JSJAC_JINGLE_IQ_TYPE_SET && from) {
              JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_iq > Unknown Jingle session (sid: ' + sid + ').', 0);

              (new JSJaCJingleSingle({ to: from })).send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
            }
          }
        } else {
          JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_iq > No route to session, not Jingle nor Muji (sid: ' + sid + ').', 0);

          (new JSJaCJingleSingle({ to: from })).send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_iq > ' + e, 1);
      }
    },

    /**
     * Routes Jingle message stanzas
     * @private
     * @param {JSJaCPacket} stanza
     */
    _route_message: function(stanza) {
      try {
        // Muji?
        var from = stanza.getFrom();

        if(from) {
          var jid = new JSJaCJID(from);
          var room = jid.getNode() + '@' + jid.getDomain();

          var session_route = this._read(JSJAC_JINGLE_SESSION_MUJI, room);

          if(session_route !== null) {
            JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_message > Routed to Jingle session (room: ' + room + ').', 2);

            session_route.handle_message(stanza);
          }
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_message > ' + e, 1);
      }
    },

    /**
     * Routes Jingle presence stanzas
     * @private
     * @param {JSJaCPacket} stanza
     */
    _route_presence: function(stanza) {
      try {
        // Muji?
        var from = stanza.getFrom();

        if(from) {
          var jid = new JSJaCJID(from);
          var room = jid.getNode() + '@' + jid.getDomain();

          var session_route = this._read(JSJAC_JINGLE_SESSION_MUJI, room);

          if(session_route !== null) {
            JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_presence > Routed to Jingle session (room: ' + room + ').', 2);

            session_route.handle_presence(stanza);
          }
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] _route_presence > ' + e, 1);
      }
    },

    /**
     * Adds a new Jingle session
     * @private
     * @param {String} type
     * @param {String} sid
     * @param {Object} obj
     */
    _add: function(type, sid, obj) {
      JSJaCJingleStorage.get_sessions()[type][sid] = obj;
    },

    /**
     * Reads a new Jingle session
     * @private
     * @param {String} type
     * @param {String} sid
     * @returns {Object} Session
     */
    _read: function(type, sid) {
      return (sid in JSJaCJingleStorage.get_sessions()[type]) ? JSJaCJingleStorage.get_sessions()[type][sid] : null;
    },

    /**
     * Removes a new Jingle session
     * @private
     * @param {String} type
     * @param {String} sid
     */
    _remove: function(type, sid) {
      delete JSJaCJingleStorage.get_sessions()[type][sid];
    },

    /**
     * Defer given task/execute deferred tasks
     * @private
     * @param {(Function|Boolean)} arg
     */
    _defer: function(arg) {
      try {
        if(typeof arg == 'function') {
          // Deferring?
          if(JSJaCJingleStorage.get_defer().deferred) {
            (JSJaCJingleStorage.get_defer().fn).push(arg);

            JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] defer > Registered a function to be executed once ready.', 2);
          }

          return JSJaCJingleStorage.get_defer().deferred;
        } else if(!arg || typeof arg == 'boolean') {
          JSJaCJingleStorage.get_defer().deferred = (arg === true);

          if(JSJaCJingleStorage.get_defer().deferred === false) {
            // Execute deferred tasks?
            if((--JSJaCJingleStorage.get_defer().count) <= 0) {
              JSJaCJingleStorage.get_defer().count = 0;

              JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] defer > Executing ' + JSJaCJingleStorage.get_defer().fn.length + ' deferred functions...', 2);

              while(JSJaCJingleStorage.get_defer().fn.length)
                ((JSJaCJingleStorage.get_defer().fn).shift())();

              JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] defer > Done executing deferred functions.', 2);
            }
          } else {
            ++JSJaCJingleStorage.get_defer().count;
          }
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:main] defer > ' + e, 1);
      }
    },
  }
))();