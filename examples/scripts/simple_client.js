/* 
  JSJaCJingle.js Simple Client

  @fileoverview Scripts for the Simple client
  
  @url https://github.com/valeriansaliou/jsjac-jingle
  @author Valérian Saliou https://valeriansaliou.name/
  @license Mozilla Public License v2.0 (MPL v2.0)
 */

var SC_CONNECTED = false;
var SC_PRESENCE = {};

var JINGLE = null;

var ARGS = {
    // Configuration (required)
    connection  : null,
    to          : null,
    local_view  : null,
    remote_view : null,
    resolution  : 'md',
    sdp_trace   : (url_param('sdp') == '1'),
    net_trace   : (url_param('net') == '1'),
    debug       : (new JSJaCConsoleLogger(4)),

    // Custom handlers (optional)
    session_initiate_pending: function(self) {
        console.log('session_initiate_pending');

        $('.call_notif').hide();
        $('#call_info').text('Initializing...').show();

        $('#form_call').find('input, button:not([data-lock])').attr('disabled', true);
        $('#roster_call').addClass('disabled');
    },

    session_initiate_success: function(self, stanza) {
        console.log('session_initiate_success');

        $('.call_notif').hide();
        $('#call_success').text('Initialized.').show();

        // This is an incoming call
        if(self.is_responder()) {
            // Hard-fix: avoids the JSJaC packets group timer (that will delay success reply)
            setTimeout(function() {
                // Notify the other party that it's ringing there...
                self.info(JSJAC_JINGLE_SESSION_INFO_RINGING);

                // Request for Jingle session to be accepted
                if(confirm("Incoming call from " + self.util_stanza_from(stanza) + "\n\nAccept?")) {
                    $('#form_call input[name="call_jid"]').val(self.get_to());
                    self.accept();
                } else {
                    self.terminate(JSJAC_JINGLE_REASON_DECLINE);
                }
            }, 1000);
        }
    },

    session_initiate_error: function(self, stanza) {
        console.log('session_initiate_error');

        $('.call_notif').hide();
        $('#call_error').text('Could not initialize.').show();

        $('#form_call').find('input, button:not([data-lock])').removeAttr('disabled');
        $('#roster_call').removeClass('disabled');
    },

    session_initiate_request: function(self, stanza) {
        console.log('session_initiate_request');
    },

    session_accept_pending: function(self) {
        console.log('session_accept_pending');

        $('.call_notif').hide();
        $('#call_info').text('Waiting to be accepted...').show();

        if(self.is_responder()) {
            $('#form_call').find('input, button:not([data-lock])').attr('disabled', true);
            $('#roster_call').addClass('disabled');
        }
    },

    session_accept_success: function(self, stanza) {
        console.log('session_accept_success');

        $('.call_notif').hide();
        $('#call_success').text('Accepted.').show();

        $('#form_live').find('button').removeAttr('disabled');
        $('#fieldset_live').removeAttr('disabled');
    },

    session_accept_error: function(self, stanza) {
        console.log('session_accept_error');

        $('.call_notif').hide();
        $('#call_error').text('Could not be accepted.').show();

        $('#form_call').find('input, button:not([data-lock])').removeAttr('disabled');
        $('#roster_call').removeClass('disabled');
    },

    session_accept_request: function(self, stanza) {
        console.log('session_accept_request');
    },

    session_info_success: function(self, stanza) {
        console.log('session_info_success');
    },

    session_info_error: function(self, stanza) {
        console.log('session_info_error');
    },

    session_info_request: function(self, stanza) {
        console.log('session_info_request');
    },

    session_terminate_pending: function(self) {
        console.log('session_terminate_pending');

        $('.call_notif').hide();
        $('#call_info').text('Terminating...').show();

        $('#form_live').find('button').attr('disabled', true);
    },

    session_terminate_success: function(self, stanza) {
        console.log('session_terminate_success');

        $('.call_notif').hide();
        $('#call_success').text('Terminated (' + self.get_reason() + ').').show();

        $('#fieldset_live').attr('disabled', true);
        $('#live_mute').show();
        $('#live_unmute').hide();

        $('#form_call').find('input, button:not([data-lock])').removeAttr('disabled');
        $('#roster_call').removeClass('disabled');
    },

    session_terminate_error: function(self, stanza) {
        console.log('session_terminate_error');

        $('.call_notif').hide();
        $('#call_error').text('Could not terminate (forced).').show();

        $('#fieldset_live').attr('disabled', true);
        $('#live_mute').show();
        $('#live_unmute').hide();
        
        $('#form_call').find('input, button:not([data-lock])').removeAttr('disabled');
        $('#roster_call').removeClass('disabled');
    },

    session_terminate_request: function(self, stanza) {
        console.log('session_terminate_request');
    }
};

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
