/**
 * @fileoverview Giggle library - Pluggability to the node-xmpp library
 *
 * @url https://github.com/valeriansaliou/giggle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module giggle/plug/nodexmpp */
/** @exports GigglePlugNodeXMPP */


/**
 * Plugger class.
 * @class
 * @classdesc  node-xmpp plugger class.
 * @requires   nicolas-van/ring.js
 * @requires   giggle/main
 * @requires   giggle/plug
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link https://github.com/node-xmpp/node-xmpp|node-xmpp Repository}
 */
var GigglePlugNodeXMPP = ring.create([__GigglePlug],
  /** @lends GigglePlugNodeXMPP.prototype */
  {
    // TODO
  }
);
