/**
 * @fileoverview JSJaC Jingle library, implementation of XEP-0166.
 * Written originally for Uno.im service requirements
 *
 * @version v0.7 (dev)
 * @url https://github.com/valeriansaliou/jsjac-jingle
 * @depends https://github.com/sstrigler/JSJaC
 * @author Valérian Saliou https://valeriansaliou.name/
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/**
 * Implements:
 *
 * See the PROTOCOL.md file for a list of supported protocol extensions
 *
 *
 * Workflow:
 *
 * This negotiation example associates JSJaCJingle.js methods to a real workflow
 * We assume in this workflow example remote user accepts the call he gets
 *
 * 1.cmt Local user wants to start a WebRTC session with remote user
 * 1.snd Local user sends a session-initiate type='set'
 * 1.hdl Remote user sends back a type='result' to '1.snd' stanza (ack)
 *
 * 2.cmt Local user waits silently for remote user to send a session-accept
 * 2.hdl Remote user sends a session-accept type='set'
 * 2.snd Local user sends back a type='result' to '2.hdl' stanza (ack)
 *
 * 3.cmt WebRTC session starts
 * 3.cmt Users chat, and chat, and chat. Happy Jabbering to them!
 *
 * 4.cmt Local user wants to stop WebRTC session with remote user
 * 4.snd Local user sends a session-terminate type='set'
 * 4.hdl Remote user sends back a type='result' to '4.snd' stanza (ack)
 */
 
 var JSJaCJingle = {
  require: function(library_name) {
    document.write(
      '<script type="text/javascript" src="' + library_name + '"></script>'
    );
  },

  load: function() {
    var includes = [
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
      if(scripts.item(i).src && scripts.item(i).src.match(/JSJaC\.js$/)) {
        path = scripts.item(i).src.replace(/JSJaC.js$/, '');
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
  JSJaCJingleHeader.load();
}
