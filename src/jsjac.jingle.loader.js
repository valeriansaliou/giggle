/**
 * @fileoverview JSJaC Jingle library - Library loader
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


var JSJaCJingleLoader = {
  /**
   * Maps library components to load
   * @private
   */
  _includes: {
    lib: [
      'underscore/underscore',
      'ring/ring'
    ],

    src: [
      'jsjac.jingle.header',
      'jsjac.jingle.constants',
      'jsjac.jingle.utils',
      'jsjac.jingle.sdp',
      'jsjac.jingle.base',
      'jsjac.jingle.single',
      'jsjac.jingle.muji',
      'jsjac.jingle.init',
      'jsjac.jingle.main'
    ]
  },

  /**
   * Requires library component
   * @private
   */
  _require: function(library_name) {
    document.write(
      '<script type="text/javascript" src="' + library_name + '"></script>'
    );
  },


  /**
   * Engages library load process
   * @public
   */
  go: function() {
    var includes = [], c;

    for(c in this._includes.lib) {
      includes.push('../lib/' + this._includes.lib[c]);
    }
    includes = includes.concat(this._includes.src);

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

if(typeof JSJaCJingle == 'undefined') {
  JSJaCJingleLoader.go();
}
