/**
 * @fileoverview Giggle library - Library loader
 *
 * @url https://github.com/valeriansaliou/giggle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module giggle/loader */
/** @exports GiggleLoader */


/**
 * Library loader tool.
 * @requires module:giggle/main
 * @namespace
 * @global
 */
var GiggleLoader = {
  /**
   * Maps library components to load
   * @constant
   * @type {Object}
   * @readonly
   * @static
   * @default
   * @private
   */
  _includes: {
    lib: [
      'underscore/underscore',
      'ring/ring'
    ],

    src: [
      'giggle.header',
      'giggle.constants',
      'giggle.storage',
      'giggle.utils',
      'giggle.sdp',
      'giggle.base',
      'giggle.single',
      'giggle.muji',
      'giggle.broadcast',
      'giggle.init',
      'giggle.main'
    ]
  },

  /**
   * Requires library component
   * @static
   * @private
   * @param {String} library_name
   */
  _require: function(library_name) {
    document.write(
      '<script type="text/javascript" src="' + library_name + '"></script>'
    );
  },


  /**
   * Engages library load process
   * @static
   * @public
   */
  go: function() {
    var includes = [], c, d;

    for(c in this._includes.lib) {
      includes.push('../lib/' + this._includes.lib[c]);
    }

    for(d in this._includes.src) {
      includes.push('../src/' + this._includes.src[d]);
    }

    var scripts = document.getElementsByTagName('script');
    var path = './', i, j;

    for(i = 0; i < scripts.length; i++) {
      if(scripts.item(i).src && scripts.item(i).src.match(/jsjac\.jingle\.loader\.js$/)) {
        path = scripts.item(i).src.replace(/jsjac\.jingle\.loader\.js$/, '');
        break;
      }
    }

    for(j = 0; j < includes.length; j++) {
      this._require(path + includes[j] + '.js');
    }
  },
};

if(typeof Giggle == 'undefined') {
  GiggleLoader.go();
}
