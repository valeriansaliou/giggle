/**
 * @fileoverview JSJaC Jingle library - Multi-user call lib
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/**
 * Creates a new XMPP Jingle Muji session.
 * @class Depends on JSJaCJingle() base class (needs to instantiate it)
 * @constructor
 * @param {Object} args Jingle session arguments.
 * @param {*} args.* Herits of JSJaCJingle() prototype
 */
function JSJaCJingleMuji(args) {
  if(typeof args != 'object')  args = {};
  args.is_muji = true;

  return (new JSJaCJingle(args));
}
