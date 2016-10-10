/*
 * Giggle.js Simple Client
 *
 * @fileoverview Scripts for the Simple client
 *
 * @url https://github.com/valeriansaliou/giggle
 * @author Valerian Saliou https://valeriansaliou.name/
 *
 * @copyright 2015, Valerian Saliou
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */

var SC_CONNECTED = false;
var SC_PRESENCE = {};

var CALL_AUTO_ACCEPT = {
  'from' : null,
  'sid'  : null
};

var GIGGLE_SESSION = null;
var GIGGLE_PLUG = null;
var GIGGLE_BROADCAST = null;

var ARGS = {
  // Configuration (required)
  connection  : null,
  to          : null,
  local_view  : null,
  remote_view : null,
  resolution  : 'md',
  sdp_trace   : (url_param('sdp') == '1'),
  ice_trace   : (url_param('ice') == '1'),
  net_trace   : (url_param('net') == '1'),
  debug       : (new JSJaCConsoleLogger(4)),

  // STUN servers list (optional)
  // List: https://gist.github.com/zziuni/3741933
  stun: [
    {
      host      : 'stun.l.google.com',
      port      : 19302,
      transport : 'udp'
    }
  ],

  // Custom handlers (optional)
  session_initiate_pending: function(_this) {
    console.log('session_initiate_pending');

    $('.call_notif').hide();
    $('#call_info').text('Initializing...').show();

    $('#form_call').find('input, button:not([data-lock])').attr('disabled', true);
    $('#roster_call').addClass('disabled');
  },

  session_initiate_success: function(_this, stanza) {
    console.log('session_initiate_success');

    $('.call_notif').hide();
    $('#call_success').text('Initialized.').show();

    // This is an incoming call
    if(_this.is_responder()) {
      // Hard-fix: avoids the JSJaC packets group timer (that will delay success reply)
      setTimeout(function() {
        // Notify the other party that it's ringing there...
        _this.info(GIGGLE_SESSION_INFO_RINGING);

        // Request for Jingle session to be accepted
        // Note: auto-accept if we previously accepted the associated broadcast request
        if((CALL_AUTO_ACCEPT.from == _this.get_to() && CALL_AUTO_ACCEPT.sid == _this.get_sid())  ||
           confirm("Incoming call from " + _this.utils.stanza_from(stanza) + "\n\nAccept?")) {
          $('#form_call input[name="call_jid"]').val(_this.get_to());
          _this.accept();
        } else {
          _this.terminate(GIGGLE_REASON_DECLINE);
        }
      }, 1000);
    }
  },

  session_initiate_error: function(_this, stanza) {
    console.log('session_initiate_error');

    $('.call_notif').hide();
    $('#call_error').text('Could not initialize.').show();

    $('#form_call').find('input, button:not([data-lock])').removeAttr('disabled');
    $('#roster_call').removeClass('disabled');
  },

  session_initiate_request: function(_this, stanza) {
    console.log('session_initiate_request');
  },

  session_accept_pending: function(_this) {
    console.log('session_accept_pending');

    $('.call_notif').hide();
    $('#call_info').text('Waiting to be accepted...').show();

    if(_this.is_responder()) {
      $('#form_call').find('input, button:not([data-lock])').attr('disabled', true);
      $('#roster_call').addClass('disabled');
    }
  },

  session_accept_success: function(_this, stanza) {
    console.log('session_accept_success');

    $('.call_notif').hide();
    $('#call_success').text('Accepted.').show();

    $('#form_live').find('button').removeAttr('disabled');
    $('#fieldset_live').removeAttr('disabled');
  },

  session_accept_error: function(_this, stanza) {
    console.log('session_accept_error');

    $('.call_notif').hide();
    $('#call_error').text('Could not be accepted.').show();

    $('#form_call').find('input, button:not([data-lock])').removeAttr('disabled');
    $('#roster_call').removeClass('disabled');
  },

  session_accept_request: function(_this, stanza) {
    console.log('session_accept_request');
  },

  session_info_pending: function(_this) {
    console.log('session_info_pending');
  },

  session_info_success: function(_this, stanza) {
    console.log('session_info_success');
  },

  session_info_error: function(_this, stanza) {
    console.log('session_info_error');
  },

  session_info_request: function(_this, stanza) {
    console.log('session_info_request');
  },

  session_terminate_pending: function(_this) {
    console.log('session_terminate_pending');

    $('.call_notif').hide();
    $('#call_info').text('Terminating...').show();

    $('#form_live').find('button').attr('disabled', true);
  },

  session_terminate_success: function(_this, stanza) {
    console.log('session_terminate_success');

    $('.call_notif').hide();
    $('#call_success').text('Terminated (' + _this.get_reason() + ').').show();

    $('#fieldset_live').attr('disabled', true);
    $('#live_mute').show();
    $('#live_unmute').hide();

    $('#form_call').find('input, button:not([data-lock])').removeAttr('disabled');
    $('#roster_call').removeClass('disabled');
  },

  session_terminate_error: function(_this, stanza) {
    console.log('session_terminate_error');

    $('.call_notif').hide();
    $('#call_error').text('Could not terminate (forced).').show();

    $('#fieldset_live').attr('disabled', true);
    $('#live_mute').show();
    $('#live_unmute').hide();

    $('#form_call').find('input, button:not([data-lock])').removeAttr('disabled');
    $('#roster_call').removeClass('disabled');
  },

  session_terminate_request: function(_this, stanza) {
    console.log('session_terminate_request');
  },

  stream_add: function(_this, stanza) {
    console.log('stream_add');
  },

  stream_remove: function(_this, stanza) {
    console.log('stream_remove');
  },

  stream_connected: function(_this, stanza) {
    console.log('stream_connected');
  },

  stream_disconnected: function(_this, stanza) {
    console.log('stream_disconnected');
  }
};

GiggleLoader.on_ready(function() {
  // Check for WebRTC support
  if(!GIGGLE_AVAILABLE) {
    $('#fieldset_login').attr('disabled', true);
    $('#not_supported:hidden').animate({'height': 'toggle', 'opacity': 'toggle'}, 400);
  }

  // Submit first form
  $('#form_login').submit(function() {
    try {
      if(SC_CONNECTED) return false;

      $('.login_notif').hide();

      var this_sel = $(this);

      var login_bosh = this_sel.find('input[name="login_bosh"]').val().trim();
      var login_websocket = this_sel.find('input[name="login_websocket"]').val().trim();
      var login_jid = this_sel.find('input[name="login_jid"]').val().trim();
      var login_pwd = this_sel.find('input[name="login_pwd"]').val().trim();

      if(login_bosh && login_jid && login_pwd) {
        $('#login_info').text('Connecting...').show();

        // Generate JID
        login_jid += '/Giggle.js (' + (new Date()).getTime() + ')';
        var jid_obj = new JSJaCJID(login_jid);

        // Configure connection
        if(login_websocket && typeof window.WebSocket != 'undefined') {
          con = new JSJaCWebSocketConnection({
            httpbase: login_websocket
          });
        } else {
          con = new JSJaCHttpBindingConnection({
            httpbase: login_bosh
          });
        }

        // Instanciate Giggle plug & broadcast (in case we need it later on)
        GIGGLE_PLUG = (new GigglePlugJSJaC({
          connection : con,
          debug      : (new JSJaCConsoleLogger(4))
        }));

        GIGGLE_BROADCAST = (new GiggleBroadcast({
          debug : (new JSJaCConsoleLogger(4)),
          plug  : GIGGLE_PLUG
        }));

        // Configure handlers
        con.registerHandler('onconnect', function() {
          try {
            $('.login_notif').hide();
            $('#login_success').text('Connected: ' + jid_obj.toString()).show();

            $('#form_login button').hide();
            $('#login_disconnect').show();

            $('#form_login').find('button').removeAttr('disabled');
            $('#fieldset_call').removeAttr('disabled');

            SC_CONNECTED = true;

            // Initial presence
            con.send(new JSJaCPresence());

            // Initialize Giggle router
            Giggle.listen({
              plug: GIGGLE_PLUG_JSJAC,
              connection: con,
              debug: (new JSJaCConsoleLogger(4)),

              single_initiate: function(stanza) {
                console.log('single_initiate');

                // Session values
                ARGS.to          = stanza.from() || null;
                ARGS.sid         = null;
                ARGS.local_view  = $('#video_local')[0];
                ARGS.remote_view = $('#video_remote')[0];

                // Let's go!
                GIGGLE_SESSION = Giggle.session(GIGGLE_SESSION_SINGLE, ARGS);
                GIGGLE_SESSION.handle(stanza);
              },

              single_propose: function(stanza, proposed_medias) {
                console.log('single_propose');

                var stanza_from = stanza.from() || null;
                var call_id = GIGGLE_BROADCAST.get_call_id(stanza);

                // Request for Jingle session to be accepted
                if(stanza_from && call_id) {
                  var call_media_main = 'audio';

                  if(GIGGLE_MEDIA_VIDEO in proposed_medias) {
                    call_media_main = 'video';
                  }

                  if(confirm("Incoming " + call_media_main + " call from " + stanza_from + "\n\nAccept?")) {
                    $('#form_call input[name="call_jid"]').val(stanza_from);

                    $('.call_notif').hide();
                    $('#call_info').text('Waiting for call initiation...').show();

                    GIGGLE_BROADCAST.accept(stanza_from, call_id, proposed_medias);

                    // Marker to auto-accept call later
                    CALL_AUTO_ACCEPT.from = stanza_from;
                    CALL_AUTO_ACCEPT.sid = call_id;
                  } else {
                    GIGGLE_BROADCAST.reject(stanza_from, call_id, proposed_medias);
                  }
                }
              },

              single_retract: function(stanza) {
                console.log('single_retract');
              },

              single_accept: function(stanza) {
                 console.log('single_accept');
              },

              single_reject: function(stanza) {
                console.log('single_reject');

                $('.call_notif').hide();
                $('#call_info').text('Call rejected.').show();

                $('#form_live').find('button').removeAttr('disabled');
                $('#fieldset_live').removeAttr('disabled');
              },

              single_proceed: function(stanza) {
                console.log('single_proceed');

                $('.call_notif').hide();
                $('#call_info').text('Call accepted. Proceeding...').show();

                // Read broadcast parameters
                // Important: access ID-related data there as it will be unset right after
                var call_to = stanza.from() || null;
                var call_id = GIGGLE_BROADCAST.get_call_id(stanza);
                var call_medias = GIGGLE_BROADCAST.get_call_medias(call_id);

                // Wait 1 second for message visibility purposes
                setTimeout(function() {
                  // Check medias to include
                  var has_media_video = false;

                  for(var i = 0; i < call_medias.length; i++) {
                    if(call_medias[i] === GIGGLE_MEDIA_VIDEO) {
                      has_media_video = true;
                      break;
                    }
                  }

                  // Session values
                  ARGS.to           = call_to;
                  ARGS.sid          = call_id;
                  ARGS.media        = has_media_video ? GIGGLE_MEDIA_VIDEO : GIGGLE_MEDIA_AUDIO;
                  ARGS.video_source = GIGGLE_VIDEO_SOURCE_CAMERA;
                  ARGS.local_view   = $('#video_local')[0];
                  ARGS.remote_view  = $('#video_remote')[0];

                  // Let's go!
                  GIGGLE_SESSION = Giggle.session(GIGGLE_SESSION_SINGLE, ARGS);
                  GIGGLE_SESSION.initiate();
                }, 1000);
              }
            });
          } catch(e) {
            alert('onconnect > ' + e);
          }
        });

        con.registerHandler('ondisconnect', function() {
          try {
            $('.login_notif').hide();

            if(SC_CONNECTED) {
              $('#login_error').text('Disconnected.').show();
            } else {
              $('#login_error').text('Invalid credentials.').show();
            }

            if(SC_CONNECTED && GIGGLE_SESSION !== null) GIGGLE_SESSION.terminate();

            $('#form_login').find('input, button').removeAttr('disabled');
            $('#form_login button').show();
            $('#login_disconnect').hide();

            SC_PRESENCE = {};
            $('#roster_call').removeClass('disabled').empty();

            $('#fieldset_call, #fieldset_live').attr('disabled', true);

            SC_CONNECTED = false;
          } catch(e) {
            alert('ondisconnect > ' + e);
          }
        });

        con.registerHandler('presence', function(presence) {
          try {
            var pr_from = presence.getFrom();

            if(!pr_from) return;

            var jid_obj = new JSJaCJID(pr_from);

            if(jid_obj.toString() == con.username + '@' + con.domain + '/' + con.resource) {
              return;
            }

            // Online buddy: show it!
            var jid_bare = jid_obj.getBareJID();
            var jid_resource = jid_obj.getResource();

            if(presence.getType() == 'unavailable') {
              if(jid_bare in SC_PRESENCE && jid_resource in SC_PRESENCE[jid_bare]) {
                delete (SC_PRESENCE[jid_bare])[jid_resource];

                var size = 0;
                for(var i in SC_PRESENCE[jid_bare]) size++;

                if(size === 0) delete SC_PRESENCE[jid_bare];
              }
            } else {
              if(!(jid_bare in SC_PRESENCE)) SC_PRESENCE[jid_bare] = {};

              (SC_PRESENCE[jid_bare])[jid_resource] = 1;
            }

            // Update list
            var roster_call = '';
            $('#roster_call').hide().empty();

            for(var cur_bare_jid in SC_PRESENCE) {
              for(var cur_resource in SC_PRESENCE[cur_bare_jid]) {
                roster_call += '<li>';
                  roster_call += '<a href="#" data-jid="' + (cur_bare_jid + '/' + cur_resource).htmlEnc() + '"><b>' + cur_bare_jid.htmlEnc() + '</b>/' + cur_resource.htmlEnc() + '</a>';
                roster_call += '</li>';
              }
            }

            if(roster_call) {
              $('#roster_call').html(roster_call).show();

              $('#roster_call a').click(function() {
                try {
                  if($('#roster_call').hasClass('disabled'))
                    return false;

                  $('#form_call input[name="call_jid"]').val(
                    $(this).attr('data-jid')
                  );

                  if($('#form_call').find('button:not([data-lock])').size() == 1)
                    $('#form_call').submit();
                } catch(e) {
                  alert('roster_call > ' + e);
                } finally {
                  return false;
                }
              });
            }
          } catch(e) {
            alert('presence > ' + e);
          }
        });

        // Connect
        con.connect({
          username:  jid_obj.getNode(),
          domain:    jid_obj.getDomain(),
          resource:  jid_obj.getResource(),
          pass:      login_pwd,
          secure:    true
        });

        // Disable form
        $('#form_login').find('input, button').attr('disabled', true);
      } else {
        $('#login_error').text('Please fill the form.').show();
      }
    } catch(e) {
      alert('form_login > ' + e);
    } finally {
      return false;
    }
  });

  // Submit second form
  var submit_target = null;

  $('#form_call button[type="submit"]').click(function() {
    submit_target = $(this).attr('name');
  });

  $('#form_call').submit(function() {
    try {
      var this_sel = $(this);

      if(!SC_CONNECTED) return false;

      $('#roster_call').addClass('disabled');

      $('.call_notif').hide();

      var call_jid  = this_sel.find('input[name="call_jid"]').val().trim();

      // Any JID defined?
      if(call_jid) {
        var call_bare = this_sel.find('input[name="call_bare"]').is(':checked') && true;

        if(call_bare === true) {
          // Call all resources
          $('.call_notif').hide();
          $('#call_info').text('Proposing call to all resources...').show();

          $('#form_call').find('input, button:not([data-lock])').attr('disabled', true);
          $('#roster_call').addClass('disabled');

          var jid_obj = new JSJaCJID(call_jid);
          var medias = [GIGGLE_MEDIA_AUDIO];

          if(submit_target == 'call_video') {
            medias.push(GIGGLE_MEDIA_VIDEO);
          }

          GIGGLE_BROADCAST.propose(
            jid_obj.getBareJID(), medias,

            function(id) {
              // Timeout callback
              $('#call_info').text('The other party did not answer.').show();

              $('#form_call').find('input, button:not([data-lock])').removeAttr('disabled');
              $('#roster_call').removeClass('disabled');

              // Retract
              GIGGLE_BROADCAST.retract(
                jid_obj.getBareJID(), id
              );
            }
          );
        } else {
          // Direct call
          $('#call_info').text('Launching...').show();

          try {
            // Session values
            ARGS.to           = call_jid;
            ARGS.sid          = null;
            ARGS.media        = (submit_target == 'call_audio') ? GIGGLE_MEDIA_AUDIO : GIGGLE_MEDIA_VIDEO;
            ARGS.video_source = (submit_target == 'call_screen') ? GIGGLE_VIDEO_SOURCE_SCREEN : GIGGLE_VIDEO_SOURCE_CAMERA;
            ARGS.local_view   = $('#video_local')[0];
            ARGS.remote_view  = $('#video_remote')[0];

            // Let's go!
            GIGGLE_SESSION = Giggle.session(GIGGLE_SESSION_SINGLE, ARGS);
            GIGGLE_SESSION.initiate();
          } catch(e) {
            alert('jingle > ' + e);
          }
        }
      } else {
        $('#call_error').text('Please fill the form.').show();
      }
    } catch(e) {
      alert('form_call > ' + e);
    } finally {
      return false;
    }
  });

  // Submit third form
  $('#form_live').submit(function() {
    try {
      if(!SC_CONNECTED) return false;

      if(GIGGLE_SESSION !== null) GIGGLE_SESSION.terminate();

      $('.live_notif').hide();
    } catch(e) {
      alert('form_live > ' + e);
    } finally {
      return false;
    }
  });

  // Mute button pressed
  $('#live_mute').click(function() {
    try {
      if(!SC_CONNECTED) return false;

      if(GIGGLE_SESSION !== null) GIGGLE_SESSION.mute(GIGGLE_MEDIA_AUDIO);

      $(this).hide();
      $('#live_unmute').show();
    } catch(e) {
      alert('live_mute > ' + e);
    } finally {
      return false;
    }
  });

  // Mute button pressed
  $('#live_unmute').click(function() {
    try {
      if(!SC_CONNECTED) return false;

      if(GIGGLE_SESSION !== null) GIGGLE_SESSION.unmute(GIGGLE_MEDIA_AUDIO);

      $(this).hide();
      $('#live_mute').show();
    } catch(e) {
      alert('live_mute > ' + e);
    } finally {
      return false;
    }
  });

  // Disconnect button pressed
  $('#login_disconnect').click(function() {
    try {
      if(typeof(con) != 'undefined' && con) con.disconnect();
    } catch(e) {
      alert('login_disconnect > ' + e);
    } finally {
      return false;
    }
  });

  // Check for URL parameters
  var param_bosh       = url_param('bosh');
  var param_websocket  = url_param('websocket');
  var param_jid        = url_param('jid');
  var param_pwd        = url_param('pwd');
  var param_go         = url_param('go');

  var login_input_sel = $('#form_login input');

  if(param_bosh)       login_input_sel.filter('[name="login_bosh"]').val(param_bosh);
  if(param_websocket)  login_input_sel.filter('[name="login_websocket"]').val(param_websocket);
  if(param_jid)        login_input_sel.filter('[name="login_jid"]').val(param_jid);
  if(param_pwd)        login_input_sel.filter('[name="login_pwd"]').val(param_pwd);

  if(param_go == '1')  $('#form_login').submit();
});
