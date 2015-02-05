/**
 * @fileoverview Giggle library - Pluggability to the JSJaC library
 *
 * @url https://github.com/valeriansaliou/giggle
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module giggle/plug/jsjac */
/** @exports GigglePlugJSJaC */


/**
 * Plugger class.
 * @class
 * @classdesc  JSJAC plugger class.
 * @requires   nicolas-van/ring.js
 * @requires   sstrigler/JSJaC
 * @requires   giggle/main
 * @requires   giggle/plug
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://stefan-strigler.de/jsjac-1.3.4/doc/|JSJaC Documentation}
 */
var GigglePlugJSJaC = ring.create([__GigglePlug],
  /** @lends GigglePlugJSJaC.prototype */
  {
    // TODO
  }
);
