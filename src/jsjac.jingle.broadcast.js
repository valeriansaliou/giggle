/**
 * @fileoverview JSJaC Jingle library - Initialization broadcast lib (XEP-0353)
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/broadcast */
/** @exports JSJaCJingleBroadcast */


/**
 * Library initialization class.
 * @class
 * @classdesc  Initialization broadcast class.
 * @requires   nicolas-van/ring.js
 * @requires   jsjac-jingle/main
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://stefan-strigler.de/jsjac-1.3.4/doc/|JSJaC Documentation}
 * @see        {@link http://xmpp.org/extensions/xep-0353.html|XEP-0353: Jingle Message Initiation}
 */
var JSJaCJingleBroadcast = new (ring.create(
  /** @lends JSJaCJingleBroadcast.prototype */
  {
    /**
     * Proposes a call
     * @public
     * @param {String} to
     * @param {Object} medias
     */
    propose: function(to, medias, cb_timeout) {
      try {
        var self = this;
        var id = this._send_remote_propose(to, medias);

        if(typeof cb_timeout == 'function') {
          setTimeout(function() {
            // Call answered
            if(self._exists_id(id) === false) {
              JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] propose > Propose successful.', 4);
            } else {
              cb_timeout();

              JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] propose > Propose timeout.', 2);
            }
          }, (JSJAC_JINGLE_BROADCAST_TIMEOUT * 1000));
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] propose > ' + e, 1);
      }
    },

    /**
     * Retracts from a call
     * @public
     * @param {String} to
     * @param {String} id
     */
    retract: function(to, id) {
      try {
        this._send_remote_retract(to, id);
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] retract > ' + e, 1);
      }
    },

    /**
     * Accepts a call
     * @public
     * @param {String} to
     * @param {String} id
     * @param {Object} medias
     */
    accept: function(to, id, medias) {
      try {
        this._register_id(id, medias);

        this._send_local_accept(id);
        this._send_remote_proceed(to, id);
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] accept > ' + e, 1);
      }
    },

    /**
     * Rejects a call
     * @public
     * @param {String} to
     * @param {String} id
     * @param {Object} medias
     */
    reject: function(to, id, medias) {
      try {
        this._register_id(id, medias);

        this._send_local_reject(id);
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] reject > ' + e, 1);
      }
    },

    /**
     * Handles a call
     * @public
     * @param {JSJaCPacket} stanza
     */
    handle: function(stanza) {
      var i,
          is_handled, stanza_child,
          description, cur_description, cur_media,
          proposed_medias,
          id;

      try {
        is_handled = false;

        stanza_child = stanza.getChild(
          '*', NS_JINGLE_MESSAGE
        );

        if(stanza_child) {
          var _this = this;

          var id_unregister_fn = function(stanza) {
            id = _this.get_call_id(stanza);
            if(id)  _this._unregister_id(id);
          };

          switch(stanza_child.tagName) {
            case JSJAC_JINGLE_MESSAGE_ACTION_PROPOSE:
              proposed_medias = {};

              description = stanza_child.getElementsByTagNameNS(
                NS_JINGLE_APPS_RTP, 'description'
              );

              for(i = 0; i < description.length; i++) {
                cur_description = description[i];

                if(cur_description) {
                  cur_media = cur_description.getAttribute('media');

                  if(cur_media && cur_media in JSJAC_JINGLE_MEDIAS) {
                    proposed_medias[cur_media] = 1;
                  }
                }
              }

              JSJaCJingleStorage.get_single_propose()(stanza, proposed_medias);

              is_handled = true; break;

            case JSJAC_JINGLE_MESSAGE_ACTION_RETRACT:
              JSJaCJingleStorage.get_single_retract()(stanza);
              id_unregister_fn(stanza);

              is_handled = true; break;

            case JSJAC_JINGLE_MESSAGE_ACTION_ACCEPT:
              JSJaCJingleStorage.get_single_accept()(stanza);
              id_unregister_fn(stanza);

              is_handled = true; break;

            case JSJAC_JINGLE_MESSAGE_ACTION_REJECT:
              JSJaCJingleStorage.get_single_reject()(stanza);
              id_unregister_fn(stanza);

              is_handled = true; break;

            case JSJAC_JINGLE_MESSAGE_ACTION_PROCEED:
              JSJaCJingleStorage.get_single_proceed()(stanza);
              id_unregister_fn(stanza);

              is_handled = true; break;
          }
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] handle > ' + e, 1);
      } finally {
        return is_handled;
      }
    },

    /**
     * Returns the call ID
     * @public
     * @param {JSJaCPacket} stanza
     * @returns {String} Call ID
     */
    get_call_id: function(stanza) {
      var call_id = null;

      try {
        var stanza_child = stanza.getChild(
          '*', NS_JINGLE_MESSAGE
        );

        if(stanza_child) {
          call_id = stanza_child.getAttribute('id') || null;
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] get_call_id > ' + e, 1);
      } finally {
        return call_id;
      }
    },

    /**
     * Returns the call medias
     * @public
     * @param {String} id
     * @returns {Object} Call medias
     */
    get_call_medias: function(id) {
      var call_medias = [];

      try {
        call_medias = JSJaCJingleStorage.get_broadcast_ids(id) || [];
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] get_call_medias > ' + e, 1);
      } finally {
        return call_medias;
      }
    },

    /**
     * Broadcasts a Jingle session proposal (remote packet)
     * @private
     * @see {@link http://xmpp.org/extensions/xep-0353.html#intent|XEP-0353 - Propose}
     */
    _send_remote_propose: function(to, medias) {
      var i, cur_media, propose, id;

      try {
        id = this._register_id(null, medias);
        propose = this._build_stanza(
          to, id, JSJAC_JINGLE_MESSAGE_ACTION_PROPOSE
        );

        if(medias && typeof medias == 'object' && medias.length) {
          for(i = 0; i < medias.length; i++) {
            cur_media = medias[i];

            if(cur_media) {
              propose[1].appendChild(
                propose[0].buildNode('description', {
                  'xmlns': NS_JINGLE_APPS_RTP,
                  'media': cur_media
                })
              );
            }
          }
        }

        this._send_stanza(propose);
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _send_remote_propose > ' + e, 1);
      } finally {
        return id;
      }
    },

    /**
     * Broadcasts a Jingle session retract (remote packet)
     * @private
     * @see {@link http://xmpp.org/extensions/xep-0353.html#retract|XEP-0353 - Retract}
     */
    _send_remote_retract: function(to, id) {
      try {
        if(this._exists_id(id) === true) {
          var retract = this._build_stanza(
            to, id, JSJAC_JINGLE_MESSAGE_ACTION_RETRACT
          );

          this._send_stanza(retract);
          this._unregister_id(id);
        } else {
          JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _send_remote_retract > Cannot retract, target ID not existing.', 0);
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _send_remote_retract > ' + e, 1);
      }
    },

    /**
     * Broadcasts a Jingle session proceed (remote packet)
     * @private
     * @see {@link http://xmpp.org/extensions/xep-0353.html#accept|XEP-0353 - Accept}
     */
    _send_remote_proceed: function(to, id) {
      try {
        // ID shouldn't exist at this point since we're the receiving party
        if(this._exists_id(id) === true) {
          var proceed = this._build_stanza(
            to, id, JSJAC_JINGLE_MESSAGE_ACTION_PROCEED
          );

          this._send_stanza(proceed);
          this._unregister_id(id);
        } else {
          JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _send_remote_proceed > Cannot proceed, target ID not existing.', 0);
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _send_remote_proceed > ' + e, 1);
      }
    },

    /**
     * Broadcasts a Jingle session accept (local packet)
     * @private-
     * @see {@link http://xmpp.org/extensions/xep-0353.html#accept|XEP-0353 - Accept}
     */
    _send_local_accept: function(id) {
      try {
        // ID shouldn't exist at this point since we're the receiving party
        if(this._exists_id(id) === true) {
          var accept = this._build_stanza(
            null, id, JSJAC_JINGLE_MESSAGE_ACTION_ACCEPT
          );

          this._send_stanza(accept);
        } else {
          JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _send_local_accept > Cannot accept, target ID not existing.', 0);
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _send_local_accept > ' + e, 1);
      }
    },

    /**
     * Broadcasts a Jingle session reject (local packet)
     * @private
     * @see {@link http://xmpp.org/extensions/xep-0353.html#reject|XEP-0353 - Reject}
     */
    _send_local_reject: function(id) {
      try {
        // ID shouldn't exist at this point since we're the receiving party
        if(this._exists_id(id) === true) {
          var reject = this._build_stanza(
            null, id, JSJAC_JINGLE_MESSAGE_ACTION_REJECT
          );

          this._send_stanza(reject);
        } else {
          JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _send_local_reject > Cannot reject, target ID not existing.', 0);
        }
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _send_local_reject > ' + e, 1);
      }
    },

    /**
     * Builds a XEP-0353 stanza
     * @private
     */
    _build_stanza: function(to, id, action) {
      stanza_arr = [];

      try {
        var connection, stanza, node;

        stanza = new JSJaCMessage();

        // Set to connection user?
        if(to === null) {
          connection = JSJaCJingleStorage.get_connection();
          to = (connection.username + '@' + connection.domain);
        }

        stanza.setTo(to);

        node = stanza.getNode().appendChild(
          stanza.buildNode(action, {
            'xmlns': NS_JINGLE_MESSAGE,
            'id': id
          })
        );

        stanza_arr = [stanza, node];
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _build_stanza > ' + e, 1);
      } finally {
        return stanza_arr;
      }
    },

    /**
     * Sends a XEP-0353 stanza
     * @private
     */
    _send_stanza: function(stanza_arr) {
      try {
        JSJaCJingleStorage.get_connection().send(
          stanza_arr[0]
        );
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _send_stanza > ' + e, 1);
      }
    },

    /**
     * Returns whether an ID exists or not
     * @private
     */
    _exists_id: function(id) {
      var is_existing = false;

      try {
        is_existing = (JSJaCJingleStorage.get_broadcast_ids(id) !== null) && true;
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _exists_id > ' + e, 1);
      } finally {
        return is_existing;
      }
    },

    /**
     * Registers an ID
     * @private
     */
    _register_id: function(id, medias) {
      try {
        id = id || JSJaCUtils.cnonce(16);

        JSJaCJingleStorage.set_broadcast_ids(id, medias);
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _register_id > ' + e, 1);
      } finally {
        return id;
      }
    },

    /**
     * Unregisters an ID
     * @private
     */
    _unregister_id: function(id) {
      try {
        JSJaCJingleStorage.set_broadcast_ids(id, null, true);
      } catch(e) {
        JSJaCJingleStorage.get_debug().log('[JSJaCJingle:broadcast] _unregister_id > ' + e, 1);
      }
    },
  }
))();
