JSJaCJingle.js
==============

**JSJaC Jingle library**, implementation of [XEP-0166 (Jingle)](http://xmpp.org/extensions/xep-0166.html). _XMPP videochat in your Web browser!_

To be used with JSJaC from Stefan Strigler, available there: https://github.com/sstrigler/JSJaC

[![build status](https://ci.frenchtouch.pro/projects/8/status.png?ref=master)](https://ci.frenchtouch.pro/projects/8?ref=master)


## How To Build It?

Only JSJaCJingle.js raw sources are provided in this repository. Those are not usable out-of-the-box for production purposes. You first need to build the library components locally.

**Important: our automated build system requires that you have NodeJS, NPM, GruntJS, Bower (+ bower-installer) and Java on your machine. UNIX systems (MacOS, Linux) are recommended to proceed build.**

If you already have NodeJS and NPM installed, you can simply install GruntJS and Bower:

> npm install -g grunt-cli bower bower-installer

Deploy the library in one simple command:

> ./tools/deploy.sh

## Who's Behind It?

Made with love by the happy folks at **Jappix** https://jappix.com/ and **FrenchTouch Web Agency** https://frenchtouch.pro/, originally for the awesome guys at **Uno IM** https://uno.im/ and **Virtustructure** http://www.virtustructure.com/

## Online Demo

### One-to-one calls (aKa Single)

You can try JSJaCJingle.js one-to-one calls there: https://demo.frenchtouch.pro/valerian.saliou/jsjac-jingle/examples/single_client.html

Open it on 2 separate tabs or 2 different computers, and login with 2 different XMPP accounts (Jappix.com accounts only for this online demo). Then, paste the full JID of the other connected account in the call field.

The call should then be initiated, and after a while the video will come.

### Multiparty calls (aKa Muji)

You can try JSJaCJingle.js multiparty calls there: https://demo.frenchtouch.pro/valerian.saliou/jsjac-jingle/examples/muji_client.html

Open it on 3+ separate tabs or 3+ different computers, and login with 3+ different XMPP accounts (Jappix.com accounts only for this online demo). Then, join the same conference room (you can enter any room even if it doesn't exist, just be sure to use muc.jappix.com as a MUC server - eg: happy-muji-test@muc.jappix.com).

The multiparty conference call should take some time to initiate.

**Note: depending on how powerful your CPU is and how much bandwidth your network can allocated, performances may degrade with many participants.**

## Notes About Security

Jingle could have been implemented in a dirty-way there, so that "It just works". But it's **NOT** the case. JSJaCJingle.js has been thought as secure on its basis.

We wanted to avoid such possible security exploits: _imagine a friend of you wants to disturb your call, and send you a session-terminate with a wrong SID. In a quick-and-dirty implementation, the request would have been dropped because the call is already ongoing, but the client-side handlers would still have been fired, thus modifying the UI._

JSJaCJingle.js simply **DOES NOT** fire the custom event handlers that you may have defined, so that you don't have to check yourself that each incoming packet is safe, thus to ensure your client implementation of Jingle is rock-solid (safe: session is authorized **AND** stanza sender is authorized **AND** the Jingle session flow is respected).

Multiparty call can be password-protected, in a completely transparent fashion. JSJaCJingle.js can handle the password generation process, and then transmit it to other potential call participants through the Muji call invites you send to them. [See our API docs](https://demo.frenchtouch.pro/valerian.saliou/jsjac-jingle/doc/) for more about this.

## Commercial Support

If you don't manage to setup JSJaCJingle.js or you need us to implement more features in the library as an open-source or a proprietary code patch, **we can handle that** for you!

We are running a **commercial support service** for Jappix, that you can also use for JSJaCJingle.js support requests. Please **[send us a quote on Jappix Pro](https://jappix.pro/)**, as a feature development service.

*We provide a quality service where customer satisfaction is our goal.*

## Usage

API documentation: https://demo.frenchtouch.pro/valerian.saliou/jsjac-jingle/doc/

We assume your XMPP Web client is using JSJaC and has an active connection, stored in the _con_ object.

```javascript
/*
 * JSJaCJingle.js Implementation Example
 *
 * > con.username + '@' con.domain == 'valerian@jappix.com'
 * true
 *
 * Yay, I'm connected!
 * Let's call my friend Julien.
 *
 * Important: JSJaCJingle.js will not check that Julien's client supports Jingle
 *            You must first check its CAPS and look for the NS_JINGLE variable value
 *
 * Note: You need to create the HTML5 audio or video elements yourself.
 *       JSJaCJingle.js needs them to display the WebRTC stream
 */
```

### One-to-one calls

The one-to-one demo client source code can be found at the following URLs:

* **HTML**: https://github.com/valeriansaliou/jsjac-jingle/blob/master/examples/single_client.html
* **CSS**: https://github.com/valeriansaliou/jsjac-jingle/blob/master/examples/styles/single_client.css
* **JavaScript**: https://github.com/valeriansaliou/jsjac-jingle/blob/master/examples/scripts/single_client.js

### Multiparty calls

The multiparty demo client source code can be found at the following URLs:

* **HTML**: https://github.com/valeriansaliou/jsjac-jingle/blob/master/examples/muji_client.html
* **CSS**: https://github.com/valeriansaliou/jsjac-jingle/blob/master/examples/styles/muji_client.css
* **JavaScript**: https://github.com/valeriansaliou/jsjac-jingle/blob/master/examples/scripts/muji_client.js

**We worked hard on that lib, we would appreciate your feedback and bug reports.**
Plus, if you are using it in your project, we would be glad if you let @valeriansaliou know.

**If you have any enhancement idea or any bug to report:** https://github.com/valeriansaliou/jsjac-jingle/issues