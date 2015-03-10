/**
 * @fileoverview Giggle library - Initialization broadcast lib (XEP-0353)
 *
 * @url https://github.com/valeriansaliou/giggle
 * @author Valérian Saliou https://valeriansaliou.name/
 *
 * @copyright 2015, Hakuma Holdings Ltd.
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module giggle/broadcast */
/** @exports GiggleBroadcast */


/**
 * Library initialization class.
 * @class
 * @classdesc  Initialization broadcast class.
 * @requires   nicolas-van/ring.js
 * @requires   giggle/main
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://xmpp.org/extensions/xep-0353.html|XEP-0353: Jingle Message Initiation}
 * @param      {Object}        [args]        - Broadcast arguments.
 * @property   {__GigglePlug}  [args.plug]   - The plug instance.
 */
var GiggleBroadcast = ring.create(
  /** @lends GiggleBroadcast.prototype */
  {
    /**
     * Constructor
     */
    constructor: function(args) {
      if(args && args.debug && args.debug.log) {
        /**
         * @member {Console}
         * @default
         * @private
         */
        this.debug = args.debug;
      } else {
        /**
         * @member {Function}
         * @default
         * @private
         */
        this.debug = GiggleStorage.get_debug();
      }

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

      /**
       * @constant
       * @member {GiggleUtils}
       * @readonly
       * @default
       * @public
       */
      this.utils = new GiggleUtils({
        debug: this.debug
      });
    },

    /**
     * Proposes a call
     * @public
     * @param {String} to
     * @param {Object} medias
     * @returns {String} Call ID
     */
    propose: function(to, medias, cb_timeout) {
      var id, self;

      try {
        self = this;
        id = this._send_remote_propose(to, medias);

        if(typeof cb_timeout == 'function') {
          setTimeout(function() {
            // Call answered
            if(self._exists_id(id) === false) {
              GiggleStorage.get_debug().log('[giggle:broadcast] propose > Propose successful.', 4);
            } else {
              cb_timeout(id);

              GiggleStorage.get_debug().log('[giggle:broadcast] propose > Propose timeout.', 2);
            }
          }, (GIGGLE_BROADCAST_TIMEOUT * 1000));
        }
      } catch(e) {
        GiggleStorage.get_debug().log('[giggle:broadcast] propose > ' + e, 1);
      } finally {
        return id;
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
        GiggleStorage.get_debug().log('[giggle:broadcast] retract > ' + e, 1);
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
        GiggleStorage.get_debug().log('[giggle:broadcast] accept > ' + e, 1);
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
        GiggleStorage.get_debug().log('[giggle:broadcast] reject > ' + e, 1);
      }
    },

    /**
     * Handles a call
     * @public
     * @param {Object} stanza
     */
    handle: function(stanza) {
      var i,
          is_handled, stanza_child,
          description, cur_description, cur_media,
          proposed_medias,
          id;

      try {
        is_handled = false;

        stanza_child = stanza.select_element_uniq(
          '*', NS_JINGLE_MESSAGE
        );

        if(stanza_child) {
          var _this = this;

          var id_unregister_fn = function(stanza) {
            id = _this.get_call_id(stanza);
            if(id)  _this._unregister_id(id);
          };

          switch(stanza_child.tagName) {
            case GIGGLE_MESSAGE_ACTION_PROPOSE:
              proposed_medias = {};

              description = stanza_child.select_element(
                NS_JINGLE_APPS_RTP, 'description'
              );

              for(i = 0; i < description.length; i++) {
                cur_description = description[i];

                if(cur_description) {
                  cur_media = cur_description.attribute('media');

                  if(cur_media && cur_media in GIGGLE_MEDIAS) {
                    proposed_medias[cur_media] = 1;
                  }
                }
              }

              GiggleStorage.get_single_propose()(stanza, proposed_medias);

              is_handled = true; break;

            case GIGGLE_MESSAGE_ACTION_RETRACT:
              GiggleStorage.get_single_retract()(stanza);
              id_unregister_fn(stanza);

              is_handled = true; break;

            case GIGGLE_MESSAGE_ACTION_ACCEPT:
              GiggleStorage.get_single_accept()(stanza);
              id_unregister_fn(stanza);

              is_handled = true; break;

            case GIGGLE_MESSAGE_ACTION_REJECT:
              GiggleStorage.get_single_reject()(stanza);
              id_unregister_fn(stanza);

              is_handled = true; break;

            case GIGGLE_MESSAGE_ACTION_PROCEED:
              GiggleStorage.get_single_proceed()(stanza);
              id_unregister_fn(stanza);

              is_handled = true; break;
          }
        }
      } catch(e) {
        GiggleStorage.get_debug().log('[giggle:broadcast] handle > ' + e, 1);
      } finally {
        return is_handled;
      }
    },

    /**
     * Returns the call ID
     * @public
     * @param {Object} stanza
     * @returns {String} Call ID
     */
    get_call_id: function(stanza) {
      var call_id = null;

      try {
        var stanza_child = stanza.select_element_uniq(
          '*', NS_JINGLE_MESSAGE
        );

        if(stanza_child) {
          call_id = stanza_child.attribute('id') || null;
        }
      } catch(e) {
        GiggleStorage.get_debug().log('[giggle:broadcast] get_call_id > ' + e, 1);
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
        call_medias = GiggleStorage.get_broadcast_ids(id) || [];
      } catch(e) {
        GiggleStorage.get_debug().log('[giggle:broadcast] get_call_medias > ' + e, 1);
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
          to, id, GIGGLE_MESSAGE_ACTION_PROPOSE
        );

        if(medias && typeof medias == 'object' && medias.length) {
          for(i = 0; i < medias.length; i++) {
            cur_media = medias[i];

            if(cur_media) {
              propose[1].child('description', {
                'xmlns': NS_JINGLE_APPS_RTP,
                'media': cur_media
              });
            }
          }
        }

        this._send_stanza(propose);
      } catch(e) {
        GiggleStorage.get_debug().log('[giggle:broadcast] _send_remote_propose > ' + e, 1);
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
            to, id, GIGGLE_MESSAGE_ACTION_RETRACT
          );

          this._send_stanza(retract);
          this._unregister_id(id);
        } else {
          GiggleStorage.get_debug().log('[giggle:broadcast] _send_remote_retract > Cannot retract, target ID not existing.', 0);
        }
      } catch(e) {
        GiggleStorage.get_debug().log('[giggle:broadcast] _send_remote_retract > ' + e, 1);
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
            to, id, GIGGLE_MESSAGE_ACTION_PROCEED
          );

          this._send_stanza(proceed);
          this._unregister_id(id);
        } else {
          GiggleStorage.get_debug().log('[giggle:broadcast] _send_remote_proceed > Cannot proceed, target ID not existing.', 0);
        }
      } catch(e) {
        GiggleStorage.get_debug().log('[giggle:broadcast] _send_remote_proceed > ' + e, 1);
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
            null, id, GIGGLE_MESSAGE_ACTION_ACCEPT
          );

          this._send_stanza(accept);
        } else {
          GiggleStorage.get_debug().log('[giggle:broadcast] _send_local_accept > Cannot accept, target ID not existing.', 0);
        }
      } catch(e) {
        GiggleStorage.get_debug().log('[giggle:broadcast] _send_local_accept > ' + e, 1);
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
            null, id, GIGGLE_MESSAGE_ACTION_REJECT
          );

          this._send_stanza(reject);
        } else {
          GiggleStorage.get_debug().log('[giggle:broadcast] _send_local_reject > Cannot reject, target ID not existing.', 0);
        }
      } catch(e) {
        GiggleStorage.get_debug().log('[giggle:broadcast] _send_local_reject > ' + e, 1);
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

        stanza = new this.plug.message();

        // Set to connection user?
        if(to === null) {
          connection = GiggleStorage.get_connection();
          to = (connection.username + '@' + connection.domain);
        }

        stanza.to(to);

        node = stanza.child(
          action, {
            'xmlns': NS_JINGLE_MESSAGE,
            'id': id
          }
        );

        stanza_arr = [stanza, node];
      } catch(e) {
        GiggleStorage.get_debug().log('[giggle:broadcast] _build_stanza > ' + e, 1);
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
        GiggleStorage.get_connection().send(
          stanza_arr[0]
        );
      } catch(e) {
        GiggleStorage.get_debug().log('[giggle:broadcast] _send_stanza > ' + e, 1);
      }
    },

    /**
     * Returns whether an ID exists or not
     * @private
     */
    _exists_id: function(id) {
      var is_existing = false;

      try {
        is_existing = (GiggleStorage.get_broadcast_ids(id) !== null) && true;
      } catch(e) {
        GiggleStorage.get_debug().log('[giggle:broadcast] _exists_id > ' + e, 1);
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
        id = id || this.utils.nonce(16);

        GiggleStorage.set_broadcast_ids(id, medias);
      } catch(e) {
        GiggleStorage.get_debug().log('[giggle:broadcast] _register_id > ' + e, 1);
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
        GiggleStorage.set_broadcast_ids(id, null, true);
      } catch(e) {
        GiggleStorage.get_debug().log('[giggle:broadcast] _unregister_id > ' + e, 1);
      }
    },
  }
);
