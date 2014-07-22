JSJaCJingle.js
==============

**JSJaC Jingle library**, implementation of [XEP-0166 (Jingle)](http://xmpp.org/extensions/xep-0166.html). _XMPP audio/video chat in your Web browser!_

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

### One-to-one calls (aka Single)

You can try JSJaCJingle.js one-to-one calls there: https://demo.frenchtouch.pro/valerian.saliou/jsjac-jingle/examples/single_client.html

Open it on 2 separate tabs or 2 different computers, and login with 2 different XMPP accounts (Jappix.com accounts only for this online demo). Then, paste the full JID of the other connected account in the call field.

The call should then be initiated, and after a while the video will come.

### Multiparty calls (aka Muji)

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

We assume your XMPP Web client is using JSJaC and has an active connection, stored in the *JSJAC_CONNECTION* global object.

```javascript
/*
 * JSJaCJingle.js Implementation Example
 */

// 1. Ensure you are loading the following libraries:
//    > jQuery
//    > JSJaC
//    > JSJaCJingle.js

// 2. Define configuration generators
var single_config_generator = function() {
    // Return single configuration object
    // Refer to single_client.js source for more
    return {};
};

var muji_config_generator = function() {
    // Return muji configuration object
    // Refer to muji_client.js source for more
    return {};
};

// 3. Initiate the listener
JSJaCJingle.listen({
    connection: JSJAC_CONNECTION,
    debug: (new JSJaCConsoleLogger(4)),

    // Receive a one-to-one (Single) call
    single_initiate: function(stanza) {
        var config = single_config_generator();

        // Configuration values
        config.to          = stanza.getFrom() || null;
        config.local_view  = $('#video_local')[0];
        config.remote_view = $('#video_remote')[0];

        // Handle call request
        session = JSJaCJingle.session(JSJAC_JINGLE_SESSION_SINGLE, config);
        session.handle(stanza);
    },

    // Receive a multiparty (Muji) call
    muji_invite: function(stanza, args) {
        // Note: auto-accepting call there
        //       you should ask the user before accepting like this

        var config = muji_config_generator();

        // Session values
        config.to           = args.jid;
        config.media        = (args.media == JSJAC_JINGLE_MEDIA_VIDEO) ? JSJAC_JINGLE_MEDIA_VIDEO : JSJAC_JINGLE_MEDIA_AUDIO;
        config.local_view   = $('#video_local')[0];

        if(args.password) {
            config.password = args.password;
        }

        // Handle conference invite
        session = JSJaCJingle.session(JSJAC_JINGLE_SESSION_MUJI, config);
        session.join();
    }
});

// 4. Configure our disco#info handler to reply with JSJaCJingle.js features
var handle_disco_info = function(iq) {
    // Do the parse work there...

    // Get my client feature map
    var client_map = [ /* Features here... */ ];

    // Get the JSJaCJingle.js feature map
    var jsjacjingle_map = JSJaCJingle.disco();

    // Concatenate feature maps
    var final_map = client_map.concat(jsjacjingle_map);

    // Ensure uniqueness of feature map values there...
    // Send back your response stanza there...
};

```

### One-to-one calls

The one-to-one demo client source code can be found at the following URLs:

* **HTML**: https://github.com/valeriansaliou/jsjac-jingle/blob/master/examples/single_client.html
* **CSS**: https://github.com/valeriansaliou/jsjac-jingle/blob/master/examples/styles/single_client.css
* **JavaScript**: https://github.com/valeriansaliou/jsjac-jingle/blob/master/examples/scripts/single_client.js

Here's a sum up on how to use the JSJaCJingle/Single API:

```javascript
/*
 * JSJaCJingle.Single.js API Example
 */

// Single call launcher
var launch_single_call = function(to, target) {
    var config = single_config_generator();

    // Session values
    config.to           = to;
    config.media        = (target == 'call_audio') ? JSJAC_JINGLE_MEDIA_AUDIO : JSJAC_JINGLE_MEDIA_VIDEO;
    config.video_source = (target == 'call_screen') ? JSJAC_JINGLE_VIDEO_SOURCE_SCREEN : JSJAC_JINGLE_VIDEO_SOURCE_CAMERA;
    config.local_view   = $('#video_local')[0];
    config.remote_view  = $('#video_remote')[0];

    // Send call request
    session = JSJaCJingle.session(JSJAC_JINGLE_SESSION_SINGLE, config);
    session.initiate();
};

// Attach form submit event
$('form#launch_single_call').submit(function() {
    var to = $(this).find('input[name="to"]').val();
    var target = ($(this).find('input[name="target"]').val() || 'call_video');

    if(to && target) {
        // Launch call...
        var session = launch_single_call(to, target);

        // Send session info (client ringing & more)...
        session.info(JSJAC_JINGLE_SESSION_INFO_RINGING);

        // Mute/Unmute audio in call...
        session.mute(JSJAC_JINGLE_MEDIA_AUDIO);
        session.umute(JSJAC_JINGLE_MEDIA_AUDIO);

        // Terminate call...
        session.terminate(JSJAC_JINGLE_REASON_SUCCESS);
    }

    return false;
});

```

### Multiparty calls

The multiparty demo client source code can be found at the following URLs:

* **HTML**: https://github.com/valeriansaliou/jsjac-jingle/blob/master/examples/muji_client.html
* **CSS**: https://github.com/valeriansaliou/jsjac-jingle/blob/master/examples/styles/muji_client.css
* **JavaScript**: https://github.com/valeriansaliou/jsjac-jingle/blob/master/examples/scripts/muji_client.js

Here's a sum up on how to use the JSJaCJingle/Muji API:

```javascript
/*
 * JSJaCJingle.Muji.js API Example
 */

// Muji call launcher
var launch_muji_call = function(room, target) {
    var config = muji_config_generator();

    // Session values
    config.to           = room;
    config.media        = (target == 'call_audio') ? JSJAC_JINGLE_MEDIA_AUDIO : JSJAC_JINGLE_MEDIA_VIDEO;
    config.video_source = JSJAC_JINGLE_VIDEO_SOURCE_CAMERA;
    config.local_view   = $('#video_local')[0];

    // Join conference room
    session = JSJaCJingle.session(JSJAC_JINGLE_SESSION_MUJI, config);
    session.join();

    return session;
};

// Attach form submit event
$('form#launch_muji_call').submit(function() {
    var room = $(this).find('input[name="room"]').val();
    var target = ($(this).find('input[name="target"]').val() || 'call_video');

    if(room && target) {
        // Launch conference...
        var session = launch_muji_call(room, target);

        // Send a message to conference...
        session.send_message('Hello World!');

        // Mute/Unmute audio in conference...
        session.mute(JSJAC_JINGLE_MEDIA_AUDIO);
        session.umute(JSJAC_JINGLE_MEDIA_AUDIO);

        // Invite people to conference...
        session.invite([
            'valerian@jappix.com/Phone',
            'julien@jappix.com/Tablet'
        ]);

        // Leave conference...
        session.leave();
    }

    return false;
});

```

## Ah, One More Thing...

**We worked hard on that lib, we would appreciate your feedback and bug reports.**
Plus, if you are using it in your project, we would be glad if you let [@valeriansaliou](https://valeriansaliou.name/) know.

**If you have any enhancement idea or any bug to report:** https://github.com/valeriansaliou/jsjac-jingle/issues