/**
 * @fileoverview Giggle library - Library loader
 *
 * @url https://github.com/valeriansaliou/giggle
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
   * @private
   */
  _ready_check_interval: 200,


  /**
   * @private
   */
  _ready_callbacks: [],


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
   * Handles the ready state event
   * @static
   * @private
   */
   _fire_ready: function() {
    // Executes all pending ready callbacks
    for(var i = 0; i < this._ready_callbacks.length; i++) {
      // Fire, fire, fire!
      this._ready_callbacks[i]().bind(window);
    }
  },

  /**
   * Requires library component
   * @static
   * @private
   * @param {String} library_name
   */
  _require: function(library_name) {
    var script = document.createElement('script');

    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', library_name);

    document.getElementsByTagName('head')[0].appendChild(script);
  },


  /**
   * Engages library load process
   * @static
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
      if(scripts.item(i).src && scripts.item(i).src.match(/giggle\.loader\.js$/)) {
        path = scripts.item(i).src.replace(/giggle\.loader\.js$/, '');
        break;
      }
    }

    for(j = 0; j < includes.length; j++) {
      this._require(path + includes[j] + '.js');
    }

    this._fire_ready();
  },


  /**
   * Handles the ready state event
   * @static
   * @public
   */
   on_ready: function(handler) {
    this._ready_callbacks.push(
      handler
    );
   },
};

if(typeof Giggle == 'undefined') {
  GiggleLoader.go();
}
