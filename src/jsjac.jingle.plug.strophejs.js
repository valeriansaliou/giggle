/**
 * @fileoverview JSJaC Jingle library - Pluggability to the Strophe.js library
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/plug/strophejs */
/** @exports JSJaCJinglePlugStropheJS */


/**
 * Plugger class.
 * @class
 * @classdesc  Strophe.js plugger class.
 * @requires   nicolas-van/ring.js
 * @requires   jsjac-jingle/main
 * @requires   jsjac-jingle/plug
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://strophe.im/strophejs/doc/1.1.3|Strophe.js Documentation}
 */
var JSJaCJinglePlugStropheJS = ring.create([__JSJaCJinglePlug],
  /** @lends JSJaCJinglePlugStropheJS.prototype */
  {
    // TODO
  }
);
