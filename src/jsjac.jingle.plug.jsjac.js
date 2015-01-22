/**
 * @fileoverview JSJaC Jingle library - Pluggability to the JSJaC library
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/plug/jsjac */
/** @exports JSJaCJinglePlugJSJaC */


/**
 * Plugger class.
 * @class
 * @classdesc  JSJAC plugger class.
 * @requires   nicolas-van/ring.js
 * @requires   jsjac-jingle/main
 * @requires   jsjac-jingle/plug
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link http://stefan-strigler.de/jsjac-1.3.4/doc/|JSJaC Documentation}
 */
var JSJaCJinglePlugJSJaC = ring.create([__JSJaCJinglePlug],
  /** @lends JSJaCJinglePlugJSJaC.prototype */
  {
    // TODO
  }
);
