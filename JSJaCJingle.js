/**
 * @fileoverview JSJaC Jingle library, implementation of XEP-0166.
 * @author Valérian Saliou valerian@jappix.com
 */

/**
 * Creates a new XMPP Jingle session
 * @class Somewhat abstract base class for jabber connections. Contains all
 * of the code in common for all jabber connections
 * @constructor
 * @param {content_client} content_client Client supported Jingle content
 */
function JSJaCJingle(content_client) {
  if(content_client && typeof(content_client) == 'object') {
    /**
     * @private
     */
    this._content_client = {};
  } else {
    /**
     * @private
     */
    this._content_client = {};
  }

   /**
   * @private
   */
  this._content_session = {};

   /**
   * @private
   */
  this._busy = false;

   /**
   * @private
   */
  this._initiator = '';

   /**
   * @private
   */
  this._sid = null;

   /**
   * @private
   */
  this._action_last = null;
}

