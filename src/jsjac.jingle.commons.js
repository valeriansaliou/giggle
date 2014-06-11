/**
 * @fileoverview JSJaC Jingle library - Common components
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/**
 * Listens for Jingle events
 */
function JSJaCJingle_listen(args) {
  try {
    if(args && args.connection)
      JSJAC_JINGLE_STORE_CONNECTION = args.connection;

    if(args && args.initiate)
      JSJAC_JINGLE_STORE_INITIATE = args.initiate;

    if(args && args.debug)
      JSJAC_JINGLE_STORE_DEBUG = args.debug;

    // Incoming IQs handler
    JSJAC_JINGLE_STORE_CONNECTION.registerHandler('iq', JSJaCJingle_route);

    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:listen > Listening.', 2);

    // Discover available network services
    if(!args || args.extdisco !== false)
      JSJaCJingle_extdisco();
    if(!args || args.relaynodes !== false)
      JSJaCJingle_relaynodes();
    if(args.fallback && typeof args.fallback === 'string')
      JSJaCJingle_fallback(args.fallback);
  } catch(e) {
    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:listen > ' + e, 1);
  }
}

/**
 * Routes Jingle stanzas
 */
function JSJaCJingle_route(stanza) {
  try {
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
      JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:route > Dropped Jingle packet (WebRTC not available).', 0);

      (new JSJaCJingleSingle({ to: stanza.getFrom() })).send_error(stanza, XMPP_ERROR_SERVICE_UNAVAILABLE);
    } else {
      // New session? Or registered one?
      var session_route = JSJaCJingle_read(sid);

      if(action == JSJAC_JINGLE_ACTION_SESSION_INITIATE && session_route === null) {
        JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:route > New Jingle session (sid: ' + sid + ').', 2);

        JSJAC_JINGLE_STORE_INITIATE(stanza);
      } else if(sid) {
        if(session_route !== null) {
          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:route > Routed to Jingle session (sid: ' + sid + ').', 2);

          session_route.handle(stanza);
        } else if(stanza.getType() == JSJAC_JINGLE_STANZA_TYPE_SET && stanza.getFrom()) {
          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:route > Unknown Jingle session (sid: ' + sid + ').', 0);

          (new JSJaCJingleSingle({ to: stanza.getFrom() })).send_error(stanza, JSJAC_JINGLE_ERROR_UNKNOWN_SESSION);
        }
      }
    }
  } catch(e) {
    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:route > ' + e, 1);
  }
}

/**
 * Adds a new Jingle session
 */
function JSJaCJingle_add(sid, obj) {
  JSJAC_JINGLE_STORE_SESSIONS[sid] = obj;
}

/**
 * Reads a new Jingle session
 * @return Session
 * @type object
 */
function JSJaCJingle_read(sid) {
  return (sid in JSJAC_JINGLE_STORE_SESSIONS) ? JSJAC_JINGLE_STORE_SESSIONS[sid] : null;
}

/**
 * Removes a new Jingle session
 */
function JSJaCJingle_remove(sid) {
  delete JSJAC_JINGLE_STORE_SESSIONS[sid];
}

/**
 * Defer given task/execute deferred tasks
 */
function JSJaCJingle_defer(arg) {
  try {
    if(typeof arg == 'function') {
      // Deferring?
      if(JSJAC_JINGLE_STORE_DEFER.deferred) {
        (JSJAC_JINGLE_STORE_DEFER.fn).push(arg);

        JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:defer > Registered a function to be executed once ready.', 2);
      }

      return JSJAC_JINGLE_STORE_DEFER.deferred;
    } else if(!arg || typeof arg == 'boolean') {
      JSJAC_JINGLE_STORE_DEFER.deferred = (arg === true);

      if(JSJAC_JINGLE_STORE_DEFER.deferred === false) {
        // Execute deferred tasks?
        if((--JSJAC_JINGLE_STORE_DEFER.count) <= 0) {
          JSJAC_JINGLE_STORE_DEFER.count = 0;

          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:defer > Executing ' + JSJAC_JINGLE_STORE_DEFER.fn.length + ' deferred functions...', 2);

          while(JSJAC_JINGLE_STORE_DEFER.fn.length)
            ((JSJAC_JINGLE_STORE_DEFER.fn).shift())();

          JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:defer > Done executing deferred functions.', 2);
        }
      } else {
        ++JSJAC_JINGLE_STORE_DEFER.count;
      }
    }
  } catch(e) {
    JSJAC_JINGLE_STORE_DEBUG.log('[JSJaCJingle:commons] lib:defer > ' + e, 1);
  }
}

/**
 * Maps the Jingle disco features
 * @return Feature namespaces
 * @type array
 */
function JSJaCJingle_disco() {
  return JSJAC_JINGLE_AVAILABLE ? MAP_DISCO_JINGLE : [];
}
