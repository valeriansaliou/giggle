/**
 * @fileoverview JSJaC Jingle library - Pluggability to the Stanza.io library
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module jsjac-jingle/plug/stanzaio */
/** @exports JSJaCJinglePlugStanzaIO */


/**
 * Plugger class.
 * @class
 * @classdesc  Stanza.io plugger class.
 * @requires   nicolas-van/ring.js
 * @requires   jsjac-jingle/main
 * @requires   jsjac-jingle/plug
 * @see        {@link http://ringjs.neoname.eu/|Ring.js}
 * @see        {@link https://github.com/otalk/stanza.io/blob/master/docs/Reference.md|Stanza.io Documentation}
 */
var JSJaCJinglePlugStanzaIO = ring.create([__JSJaCJinglePlug],
  /** @lends JSJaCJinglePlugStanzaIO.prototype */
  {
    // TODO
  }
);
