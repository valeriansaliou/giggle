/**
 * @fileoverview Giggle library - Pluggability to the Stanza.io library
 *
 * @url https://github.com/valeriansaliou/giggle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module giggle/plug/stanzaio */
/** @exports GigglePlugStanzaIO */


/**
 * Plugger class.
 * @class
 * @classdesc  Stanza.io plugger class.
 * @requires   nicolas-van/ring.js
 * @requires   giggle/main
 * @requires   giggle/plug
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link https://github.com/otalk/stanza.io/blob/master/docs/Reference.md|Stanza.io Documentation}
 */
var GigglePlugStanzaIO = ring.create([__GigglePlug],
  /** @lends GigglePlugStanzaIO.prototype */
  {
    // TODO
  }
);
