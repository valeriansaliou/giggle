/**
 * @fileoverview JSJaC Jingle library - Pluggability to the node-xmpp library
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/plug/nodexmpp */
/** @exports JSJaCJinglePlugNodeXMPP */


/**
 * Plugger class.
 * @class
 * @classdesc  node-xmpp plugger class.
 * @requires   nicolas-van/ring.js
 * @requires   jsjac-jingle/main
 * @requires   jsjac-jingle/plug
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link https://github.com/node-xmpp/node-xmpp|node-xmpp Repository}
 */
var JSJaCJinglePlugNodeXMPP = ring.create([__JSJaCJinglePlug],
  /** @lends JSJaCJinglePlugNodeXMPP.prototype */
  {
    // TODO
  }
);
