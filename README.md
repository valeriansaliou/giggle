JSJaCJingle.js
==============

## What Is JSJaCJingle.js?

**JSJaC Jingle library**, implementation of [XEP-0166 (Jingle)](http://xmpp.org/extensions/xep-0166.html). _XMPP videochat in your Web browser!_

To be used with JSJaC from Stefan Strigler, available there: https://github.com/sstrigler/JSJaC

Made with love by the happy folks at Jappix https://jappix.com/

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
	remote_view: document.getElementById('jingle-' + ctx_hash + '-remote'),

	// Custom handlers (optional)
	session_initiate_pending: function() {
		// Update your client UI
		// Waiting to be initialized...

		console.log('session_initiate_pending');
	},

	session_initiate_success: function(stanza) {
		// Update your client UI
		// Initialized!

		// Request for Jingle session to be accepted
		// You can also call this later, on UI confirm or so
		this.accept();

		console.log('session_initiate_success');
	},

	session_initiate_error: function(stanza) {
		// Update your client UI
		// Could not initialize!

		console.log('session_initiate_error');
	},

	session_initiate_request: function(stanza) {
		// Update your client UI
		// Got an initiate request!

		console.log('session_initiate_request');
	},

	session_accept_pending: function() {
		// Update your client UI
		// Waiting to be accepted...

		console.log('session_accept_pending');
	},

	session_accept_success: function(stanza) {
		// Update your client UI
		// Accepted!

		// Request for Jingle session to terminate
		// You can call this when user press 'end' button
		// Use: this.terminate();

		console.log('session_accept_success');
	},

	session_accept_error: function(stanza) {
		// Update your client UI
		// Could not be accepted!

		console.log('session_accept_error');
	},

	session_accept_request: function(stanza) {
		// Update your client UI
		// Got an accept request!

		console.log('session_accept_request');
	},

	session_info_pending: function() {
		// Update your client UI
		// Waiting for info to be received...

		console.log('session_info_pending');
	},

	session_info_success: function(stanza) {
		// Update your client UI
		// Info successfully sent!

		console.log('session_info_success');
	},

	session_info_error: function(stanza) {
		// Update your client UI
		// Got an info error!

		console.log('session_info_error');
	},

	session_info_request: function(stanza) {
		// Update your client UI
		// Got an info request!

		console.log('session_info_request');
	},

	session_terminate_pending: function() {
		// Update your client UI
		// Waiting to be terminated...

		console.log('session_terminate_pending');
	},

	session_terminate_success: function(stanza) {
		// Update your client UI
		// Terminated!

		console.log('session_terminate_success');
	},

	session_terminate_error: function(stanza) {
		// Update your client UI
		// Could not terminate!

		console.log('session_terminate_error');
	},

	session_terminate_request: function(stanza) {
		// Update your client UI
		// Got a terminate request!

		console.log('session_terminate_request');
	}
};

// Create the JSJaCJingle object
var jingle = new JSJaCJingle(args);

// Initialize the Jingle session
// See: http://xmpp.org/extensions/xep-0166.html#protocol-initiate
jingle.initialize();

// Note: use (new JSJaCJingle(args)).initialize() if you don't require JSJaCJingle later

// Now, refer to the custom handlers that we passed above!
// Play hard with this lib, have fun!

// If you have any enhancement idea or any bug to report,
// Open tickets on: https://github.com/valeriansaliou/jsjac-jingle/issues

```