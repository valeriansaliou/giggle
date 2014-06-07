/* 
  JSJaCJingle.js Simple Client

  @fileoverview Scripts (commons)
  
  @url https://github.com/valeriansaliou/jsjac-jingle
  @author Valérian Saliou https://valeriansaliou.name/
  @license Mozilla Public License v2.0 (MPL v2.0)
 */

function url_param(name) {
    try {
        var uri_param = (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [,null])[1];

        if(uri_param) {
            return decodeURI(uri_param);
        }

        return null;
    } catch(e) {
        return null;
    }
}
