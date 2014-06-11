/**
 * @fileoverview JSJaC Jingle library - Library loader
 *
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


var JSJaCJingle = {
  require: function(library_name) {
    document.write(
      '<script type="text/javascript" src="' + library_name + '"></script>'
    );
  },

  load: function() {
    var includes = [
      'jsjac.jingle.header',
      'jsjac.jingle.constants',
      'jsjac.jingle.base',
      'jsjac.jingle.utils',
      'jsjac.jingle.peer',
      'jsjac.jingle.single',
      'jsjac.jingle.muji',
      'jsjac.jingle.commons',
      'jsjac.jingle.init'
    ];

    var scripts = document.getElementsByTagName('script');
    var path = './', i, j;

    for(i = 0; i < scripts.length; i++) {
      if(scripts.item(i).src && scripts.item(i).src.match(/jsjac\.jingle\.js$/)) {
        path = scripts.item(i).src.replace(/jsjac\.jingle\.js$/, '');
        break;
      }
    }

    for(j = 0; j < includes.length; j++) {
      this.require(path + includes[j] + '.js');
    }
  },

  bind: function(fn, obj, opt_arg) {
    return function(arg) {
      return fn.apply(
        obj,
        [arg, opt_arg]
      );
    };
  }
};

if(typeof JSJAC_JINGLE_AVAILABLE == 'undefined') {
  JSJaCJingle.load();
}
