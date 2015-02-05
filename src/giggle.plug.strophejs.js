/**
 * @fileoverview Giggle library - Pluggability to the Strophe.js library
 *
 * @url https://github.com/valeriansaliou/giggle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module giggle/plug/strophejs */
/** @exports GigglePlugStropheJS */


/**
 * Plugger class.
 * @class
 * @classdesc  Strophe.js plugger class.
 * @requires   nicolas-van/ring.js
 * @requires   giggle/main
 * @requires   giggle/plug
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://strophe.im/strophejs/doc/1.1.3|Strophe.js Documentation}
 */
var GigglePlugStropheJS = ring.create([__GigglePlug],
  /** @lends GigglePlugStropheJS.prototype */
  {
    // TODO
  }
);
