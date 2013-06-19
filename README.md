JSJaCJingle.js
==============

## What Is JSJaCJingle?

JSJaC Jingle library, implementation of [XEP-0166](http://xmpp.org/extensions/xep-0166.html).

To be used with JSJaC from Stefan Strigler, available there: https://github.com/sstrigler/JSJaC

Made with love by the folks at Jappix https://jappix.com/

## How To Use?

### Call a friend

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

// Some context vars
var ctx_connection = con;
var ctx_to = 'julien@jappix.com/Jappix (42)';
var ctx_hash = hex_md5(ctx_to);

// JSJaCJingle arguments
var args = {
	// Configuration (required)
	connection: ctx_connection,
	to: ctx_to,
	local_view: document.getElementById('jingle-' + ctx_hash + '-local'),
	remote_view: document.getElementById('jingle-' + ctx_hash + '-remote')

	// Custom handlers (optional)
	init_pending: function() {
		// Update your client UI
		// Waiting to be initialized...

		console.log('init_pending');
	},

	init_success: function(stanza) {
		// Update your client UI
		// Initialized!

		// Request for Jingle session to start
		// You can also call this later, on UI confirm or so
		this.start();

		console.log('init_success');
	},

	init_error: function(stanza) {
		// Update your client UI
		// Could not initialize!

		console.log('init_error');
	},

	start_pending: function() {
		// Update your client UI
		// Waiting to be started...

		console.log('start_pending');
	},

	start_success: function(stanza) {
		// Update your client UI
		// Started!

		// Request for Jingle session to terminate
		// You can call this when user press 'end' button
		// Use: this.terminate();

		console.log('start_success');
	},

	start_error: function(stanza) {
		// Update your client UI
		// Could not start!

		console.log('start_error');
	},

	terminate_pending: function() {
		// Update your client UI
		// Waiting to be terminated...

		console.log('terminate_pending');
	},

	terminate_success: function(stanza) {
		// Update your client UI
		// Terminated!

		console.log('terminate_success');
	},

	terminate_error: function(stanza) {
		// Update your client UI
		// Could not terminate!

		console.log('terminate_error');
	}
};

// Create the JSJaCJingle object
var jingle = new JSJaCJingle(args);

// Initialize the Jingle session
// See: http://xmpp.org/extensions/xep-0166.html#protocol-initiate
jingle.init();

// Note: use (new JSJaCJingle(args)).init() if you don't require JSJaCJingle later

// Now, refer to the custom handlers that we passed above!
// Play hard with this lib, have fun!

// If you have any enhancement idea or any bug to report,
// Open tickets on: https://github.com/valeriansaliou/jsjac-jingle/issues

```