/**
 * @fileoverview JSJaC Jingle library - Common components
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


var JSJaCJingle = new (ring.create({
  /**
   * Starts a new Jingle session
   * @public
   * @return {object} JSJaCJingle session instance
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
      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:main] session > ' + e, 1);
    } finally {
      return jingle;
    }
  },

  /**
   * Listens for Jingle events
   * @public
   */
  listen: function(args) {
    try {
      if(args && args.connection)
        JSJAC_JINGLE_STORE_CONNECTION = args.connection;

      if(args && args.initiate)
        JSJAC_JINGLE_STORE_INITIATE = args.initiate;

      if(args && args.debug)
        JSJAC_JINGLE_STORE_DEBUG = args.debug;

      // Incoming IQs handler
      var cur_type, route_map = {}
      route_map[JSJAC_JINGLE_STANZA_IQ]        = this._route_iq;
      route_map[JSJAC_JINGLE_STANZA_MESSAGE]   = this._route_message;
      route_map[JSJAC_JINGLE_STANZA_PRESENCE]  = this._route_presence;

      for(cur_type in route_map) {
        JSJAC_JINGLE_STORE_CONNECTION.registerHandler(
          cur_type,
          route_map[cur_type].bind(this)
        );
      }

      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:main] listen > Listening.', 2);

      // Discover available network services
      if(!args || args.extdisco !== false)
        JSJaCJingleInit._extdisco();
      if(!args || args.relaynodes !== false)
        JSJaCJingleInit._relaynodes();
      if(args.fallback && typeof args.fallback === 'string')
        JSJaCJingleInit._fallback(args.fallback);
    } catch(e) {
      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:main] listen > ' + e, 1);
    }
  },

  /**
   * Maps the Jingle disco features
   * @public
   * @return {array} Feature namespaces
   */
  disco: function() {
    return JSJAC_JINGLE_AVAILABLE ? MAP_DISCO_JINGLE : [];
  },

  /**
   * Routes Jingle IQ stanzas
   * @private
   */
  _route_iq: function(stanza) {
    try {
      // Single?
      var action = null;
      var sid    = null;

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
        JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:main] _route_iq > Dropped Jingle packet (WebRTC not available).', 0);

        (new JSJaCJingleSingle({ to: stanza.getFrom() })).send_error(stanza, XMPP_ERROR_SERVICE_UNAVAILABLE);
      } else {
        // New session? Or registered one?
        var session_route = this._read(JSJAC_JINGLE_SESSION_SINGLE, sid);

        if(action == JSJAC_JINGLE_ACTION_SESSION_INITIATE && session_route === null) {
          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:main] _route_iq > New Jingle session (sid: ' + sid + ').', 2);

          JSJAC_JINGLE_STORE_INITIATE(stanza);
        } else if(sid) {
          if(session_route !== null) {
            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:main] _route_iq > Routed to Jingle session (sid: ' + sid + ').', 2);

            session_route.handle(stanza);
          } else if(stanza.getType() == JSJAC_JINGLE_IQ_TYPE_SET && stanza.getFrom()) {
            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:main] _route_iq > Unknown Jingle session (sid: ' + sid + ').', 0);

            (new JSJaCJingleSingle({ to: stanza.getFrom() })).send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
          }
        }
      }
    } catch(e) {
      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:main] _route_iq > ' + e, 1);
    }
  },

  /**
   * Routes Jingle message stanzas
   * @private
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
          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:main] _route_message > Routed to Jingle session (room: ' + room + ').', 2);

          session_route.handle_message(stanza);
        }
      }
    } catch(e) {
      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:main] _route_message > ' + e, 1);
    }
  },

  /**
   * Routes Jingle presence stanzas
   * @private
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
          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:main] _route_presence > Routed to Jingle session (room: ' + room + ').', 2);

          session_route.handle_presence(stanza);
        }
      }
    } catch(e) {
      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:main] _route_presence > ' + e, 1);
    }
  },

  /**
   * Adds a new Jingle session
   * @private
   */
  _add: function(type, sid, obj) {
    JSJAC_JINGLE_STORE_SESSIONS[type][sid] = obj;
  },

  /**
   * Reads a new Jingle session
   * @private
   * @return {object} Session
   */
  _read: function(type, sid) {
    return (sid in JSJAC_JINGLE_STORE_SESSIONS[type]) ? JSJAC_JINGLE_STORE_SESSIONS[type][sid] : null;
  },

  /**
   * Removes a new Jingle session
   * @private
   */
  _remove: function(type, sid) {
    delete JSJAC_JINGLE_STORE_SESSIONS[type][sid];
  },

  /**
   * Defer given task/execute deferred tasks
   * @private
   */
  _defer: function(arg) {
    try {
      if(typeof arg == 'function') {
        // Deferring?
        if(JSJAC_JINGLE_STORE_DEFER.deferred) {
          (JSJAC_JINGLE_STORE_DEFER.fn).push(arg);

          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:main] defer > Registered a function to be executed once ready.', 2);
        }

        return JSJAC_JINGLE_STORE_DEFER.deferred;
      } else if(!arg || typeof arg == 'boolean') {
        JSJAC_JINGLE_STORE_DEFER.deferred = (arg === true);

        if(JSJAC_JINGLE_STORE_DEFER.deferred === false) {
          // Execute deferred tasks?
          if((--JSJAC_JINGLE_STORE_DEFER.count) <= 0) {
            JSJAC_JINGLE_STORE_DEFER.count = 0;

            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:main] defer > Executing ' + JSJAC_JINGLE_STORE_DEFER.fn.length + ' deferred functions...', 2);

            while(JSJAC_JINGLE_STORE_DEFER.fn.length)
              ((JSJAC_JINGLE_STORE_DEFER.fn).shift())();

            JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:main] defer > Done executing deferred functions.', 2);
          }
        } else {
          ++JSJAC_JINGLE_STORE_DEFER.count;
        }
      }
    } catch(e) {
      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:main] defer > ' + e, 1);
    }
  },
}))();
