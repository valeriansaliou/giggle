JSJaCJingle.js
==============

**JSJaC Jingle library**, implementation of [XEP-0166 (Jingle)](http://xmpp.org/extensions/xep-0166.html). _XMPP videochat in your Web browser!_

To be used with JSJaC from Stefan Strigler, available there: https://github.com/sstrigler/JSJaC

[![build status](https://ci.frenchtouch.pro/projects/8/status.png?ref=master)](https://ci.frenchtouch.pro/projects/8?ref=master)


## Who's Behind It?

Made with love by the happy folks at **Jappix** https://jappix.com/ and **FrenchTouch Web Agency** https://frenchtouch.pro/, originally for the awesome guys at **Uno IM** https://uno.im/ and **Virtustructure** http://www.virtustructure.com/

## Online Demo

You can try JSJaCJingle.js there: https://demo.frenchtouch.pro/valerian.saliou/jsjac-jingle/examples/simple_client.html

Open it on 2 separate tabs or 2 different computers, and login with 2 different XMPP accounts (Jappix.com accounts only for this online demo). Then, paste the full JID of the other connected account in the call field.

The call should then be initiated, and after a while the video will come.

## Notes About Security

Jingle could have be implemented in a dirty-way there, so that "It just works". But it's **NOT** the case. JSJaCJingle.js has been thought as secure on its basis.

We wanted to avoid such possible security exploits: _imagine a friend of you wants to disturb your call, and send you a session-terminate with a wrong SID. In a quick-and-dirty implementation, the request would have been dropped because the call is already ongoing, but the client-side handlers would still have been fired, thus modifying the UI._

JSJaCJingle.js simply **DOES NOT** fire the custom event handlers that you may have defined, so that you don't have to check yourself that each incoming packet is safe, thus to ensure your client implementation of Jingle is rock-solid (safe: session is authorized **AND** stanza sender is authorized **AND** the Jingle session flow is respected). It's all mind-free for you guys!

## Commercial Support

If you don't manage to setup JSJaCJingle.js or you need us to implement more features in the library as an open-source or a proprietary code patch, **we can handle that** for you!

We are running a **commercial support service** for Jappix, that you can also use for JSJaCJingle.js support requests. Please **[send us a quote on Jappix Pro](https://jappix.pro/)**, as a feature development service.

*We provide a quality service where customer satisfaction is our goal.*

## How To Use?

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

**You first need to create the global ARGS object, storing JSJaCJingle configuration:**

```javascript
// JSJaCJingle arguments
// Note: you don't need to pass them all, only the 4 first ones are required
var ARGS = {
    // Configuration (required)
    connection: null,
    to: null,
    local_view: null,
    remote_view: null,

    // Custom handlers (optional)
    session_initiate_pending: function(self) {
        // Update your client UI
        // Waiting to be initialized...

        console.log('session_initiate_pending');
    },

    session_initiate_success: function(self, stanza) {
        // Update your client UI
        // Initialized!

        // This is an incoming call
        if(self.is_responder()) {
            // Request for Jingle session to be accepted
            if(confirm("Incoming call from " + self.util_stanza_from(stanza) + "\n\nAccept?"))
                self.accept();
            else
                self.terminate(JSJAC_JINGLE_REASON_DECLINE);
        }

        console.log('session_initiate_success');
    },

    session_initiate_error: function(self, stanza) {
        // Update your client UI
        // Could not initialize!

        console.log('session_initiate_error');
    },

    session_initiate_request: function(self, stanza) {
        // Update your client UI
        // Got an initiate request!

        console.log('session_initiate_request');
    },

    session_accept_pending: function(self) {
        // Update your client UI
        // Waiting to be accepted...

        console.log('session_accept_pending');
    },

    session_accept_success: function(self, stanza) {
        // Update your client UI
        // Accepted!

        // Request for Jingle session to terminate
        // You can call this when user press 'end' button
        // Use: self.terminate();

        console.log('session_accept_success');
    },

    session_accept_error: function(self, stanza) {
        // Update your client UI
        // Could not be accepted!

        console.log('session_accept_error');
    },

    session_accept_request: function(self, stanza) {
        // Update your client UI
        // Got an accept request!

        console.log('session_accept_request');
    },

    session_info_success: function(self, stanza) {
        // Update your client UI
        // Info successfully sent!

        console.log('session_info_success');
    },

    session_info_error: function(self, stanza) {
        // Update your client UI
        // Got an info error!

        console.log('session_info_error');
    },

    session_info_request: function(self, stanza) {
        // Update your client UI
        // Got an info request!

        console.log('session_info_request');
    },

    session_terminate_pending: function(self) {
        // Update your client UI
        // Waiting to be terminated...

        console.log('session_terminate_pending');
    },

    session_terminate_success: function(self, stanza) {
        // Update your client UI
        // Terminated!

        console.log('session_terminate_success');
    },

    session_terminate_error: function(self, stanza) {
        // Update your client UI
        // Could not terminate!

        console.log('session_terminate_error');
    },

    session_terminate_request: function(self, stanza) {
        // Update your client UI
        // Got a terminate request!

        console.log('session_terminate_request');
    }
};
```

**Then, launch JSJaCJingle listener on JSJaC connect:**

```javascript
// Call this on JSJaC connect (earlier in your code)
// Role: listens for incoming Jingle calls
con.registerHandler('onconnect', function() {
    // Initialize JSJaCJingle router
    JSJaCJingle_listen({
        connection: con,

        initiate: function(stanza) {
            // Session values
            ARGS.to          = stanza.getFrom() || null;
            ARGS.local_view  = document.getElementById('video_local');
            ARGS.remote_view = document.getElementById('video_remote');

            // Let's go!
            JINGLE = new JSJaCJingle(ARGS);
            JINGLE.handle(stanza);
        }
    });
});
```

**Initiate a new one-to-one call when the user press a button:**

```javascript
$('button').click(function() {
    // Session values
    ARGS.to          = 'julien@jappix.com';
    ARGS.local_view  = document.getElementById('video_local');
    ARGS.remote_view = document.getElementById('video_remote');

    // Create the JSJaCJingle object
    var jingle = new JSJaCJingle(ARGS);

    // Initialize the Jingle session
    // See: http://xmpp.org/extensions/xep-0166.html#protocol-initiate
    jingle.initiate();
});
```

**Initiate a new multi-user call when the user press a button:**

```javascript
$('button').click(function() {
    // Session values
    ARGS.to              = 'multiuser_room@muc.jappix.com';
    ARGS.local_view      = document.getElementById('video_local');

    // Remote view management callbacks
    ARGS.add_remote_view = function(jid, mode) {
        // Actions to do when an user joins the room
    };
    ARGS.remove_remote_view = function(jid) {
        // Actions to do when an user quits the room
    };

    // Create the JSJaCJingle object
    var jingle_muji = new JSJaCJingleMuji(ARGS);

    // Join the Jingle session
    // See: http://xmpp.org/extensions/xep-0272.html#joining
    jingle_muji.join();
});
```

Now, refer to the custom handlers that we passed above.

**We worked hard on that lib, now it's your turn to play hard with its features!**

**If you have any enhancement idea or any bug to report:** https://github.com/valeriansaliou/jsjac-jingle/issues