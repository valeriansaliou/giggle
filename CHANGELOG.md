Giggle.js Changelog
===================

Here's the log of what has changed over the Giggle.js releases.


v0.8.0 (Mar 11, 2015)
---------------------

 * **In a nutshell**
    * **JSJaCJingle.js is now Giggle.js**              @valeriansaliou
    * **Pluggability module** to other XMPP libraries  @valeriansaliou


v0.7.6 (Oct 13, 2014)
---------------------

 * **In a nutshell**
    * **[XEP-0353](http://xmpp.org/extensions/xep-0353.html)** (full support)  @valeriansaliou
    * **WebRTC SDP messages parsing fixed** for Chrome 38+                     @valeriansaliou


v0.7.5 (Oct 3, 2014)
--------------------

 * **In a nutshell**
    * **CI links updated**  @valeriansaliou


v0.7.4 (Aug 7, 2014)
--------------------

 * **In a nutshell**
    * **NodeJS dependencies updated** (fixes broken installer)  @valeriansaliou


v0.7.3 (Jul 23, 2014)
---------------------

 * **In a nutshell**
    * **Participant stream custom handlers** added to GiggleMuji  @valeriansaliou


v0.7.2 (Jul 23, 2014)
---------------------

 * **In a nutshell**
    * **Stream custom handlers** added to GiggleSingle  @valeriansaliou


v0.7.1 (Jul 19, 2014)
---------------------

 * **In a nutshell**
    * **Quick build task** added to Gruntfile  @valeriansaliou


v0.7.0 (Jun 24, 2014)
---------------------

 * **In a nutshell**
    * **Library API changed** to support both Single (one-to-one) + Muji (one-to-many) calls     @valeriansaliou
    * **Refactored library structure** to be more maintenable (using Ring.js + GruntJS + Bower)  @valeriansaliou
    * **Code documented** using JSDoc                                                            @valeriansaliou

 * **XEP added**
    * **[XEP-0177](http://xmpp.org/extensions/xep-0177.html)** (full support)     @valeriansaliou
    * **[XEP-0249](http://xmpp.org/extensions/xep-0249.html)** (full support)     @valeriansaliou
    * **[XEP-0272](http://xmpp.org/extensions/xep-0272.html)** (full support)     @valeriansaliou
    * **[XEP-0278](http://xmpp.org/extensions/xep-0278.html)** (partial support)  @valeriansaliou
    * **[XEP-0338](http://xmpp.org/extensions/xep-0338.html)** (full support)     @valeriansaliou
    * **[XEP-0339](http://xmpp.org/extensions/xep-0339.html)** (full support)     @valeriansaliou


v0.6.0 (Dec 26, 2013)
---------------------

 * **In a nutshell**
    * **Firefox compatibility**                @valeriansaliou
    * **Safer stanza custom handler** helpers  @valeriansaliou
    * **More precise SDP debugging**           @valeriansaliou
    * **Tests for CI** added                   @valeriansaliou
    * **XEPs support file**                    @valeriansaliou


v0.5.0 (Jul 15, 2013)
---------------------

 * **In a nutshell**
    * **Fix video in Chrome 31+** loaded callback (doubling, tripling, and so forth) bug fixed  @valeriansaliou
    * **XEP support** file listing implemented protocols and specifications                     @valeriansaliou
    * **Fix wrong SDP ID/Label** which was breaking some clients                                @valeriansaliou
    * **Cross-browser compatibility** between Chrome and Firefox                                @valeriansaliou
    * **Firefox compatibility**


v0.4.0 (Jul 13, 2013)
---------------------

 * **In a nutshell**
    * Better **code debugging** for issue reporting                                                  @valeriansaliou
    * A lot of **bugfixes**                                                                          @valeriansaliou
    * **transport-info** support (add transports after descriptions are sent)                        @valeriansaliou
    * **Audio-only** calls support                                                                   @valeriansaliou
    * **Configurable video** (resolution, framerate, bandwidth)                                      @valeriansaliou
    * **Video resolution** is sent to other peer in the Jingle stanza                                @valeriansaliou
    * More **robust content naming** system (if _name_ != _media_)                                   @valeriansaliou
    * **Screen sharing** support (still experimental, requires Chrome v26+ and proper flag enabled)  @valeriansaliou


v0.3.0 (Jul 6, 2013)
--------------------

 * **In a nutshell**
    * Ability to **attach more video views** as the call is going on using _Giggle.register_view()_  @valeriansaliou

 * **XEP added**
    **[XEP-0262](http://xmpp.org/extensions/xep-0262.html)** (full support)  @valeriansaliou


v0.2.0 (Jul 2, 2013)
--------------------

 * **In a nutshell**
    * Complex **code split** in separate functions           @valeriansaliou
    * **Router fixes** (some packets were dropped)           @valeriansaliou
    * **Full integration debug**, improvements on that side  @valeriansaliou


v0.1.0 (Jun 27, 2013)
---------------------

 * **In a nutshell**
    * **Initial release**                         @valeriansaliou
    * Ability to **videochat** with another peer  @valeriansaliou
    * Working **test client**                     @valeriansaliou

 * **XEP added**
    * **[XEP-0166](http://xmpp.org/extensions/xep-0166.html)** (partial support)  @valeriansaliou
    * **[XEP-0167](http://xmpp.org/extensions/xep-0167.html)** (partial support)  @valeriansaliou
    * **[XEP-0176](http://xmpp.org/extensions/xep-0176.html)** (full support)     @valeriansaliou
    * **[XEP-0293](http://xmpp.org/extensions/xep-0293.html)** (full support)     @valeriansaliou
    * **[XEP-0294](http://xmpp.org/extensions/xep-0294.html)** (full support)     @valeriansaliou
    * **[XEP-0320](http://xmpp.org/extensions/xep-0320.html)** (full support)     @valeriansaliou


**For more information about what changed through time, check the changes made to our source code on GitHub: https://github.com/valeriansaliou/giggle/commits/master**
