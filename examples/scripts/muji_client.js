/*
 * Giggle.js Simple Client
 *
 * @fileoverview Scripts for the Multiparty Jingle (Muji) client
 *
 * @url https://github.com/valeriansaliou/giggle
 * @author Valérian Saliou https://valeriansaliou.name/
 *
 * @copyright 2015, Hakuma Holdings Ltd.
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */

var SC_CONNECTED = false;
var SC_PRESENCE = {};

var GIGGLE_SESSION = null;

var ARGS = {
  // Configuration (required)
  connection        : null,
  to                : null,
  password          : null,
  password_protect  : false,
  local_view        : null,
  resolution        : 'sd',
  sdp_trace         : (url_param('sdp') == '1'),
  ice_trace   : (url_param('ice') == '1'),
  net_trace         : (url_param('net') == '1'),
  debug             : (new JSJaCConsoleLogger(4)),

  // Custom handlers (optional)
  room_message_in: function(_this, stanza) {
    console.log('room_message_in');

    var pr_from = stanza.from();

    if(!pr_from)
      return;

    var jid_obj = new JSJaCJID(pr_from);
    var jid_bare = jid_obj.getBareJID();
    var jid_resource = jid_obj.getResource();

    // Not our chatroom!
    if(jid_bare != $('#form_call input[name="call_room"]').val().trim()) {
      return;
    }

    var body = stanza.getBody();

    if(body) {
      var chat_messages_sel = $('#chat_messages');

      // Display message
      chat_messages_sel.append(
        '<p class="message">' +
          '<b class="name">' + jid_resource.htmlEnc() + '</b>' +
          '<span class="text">' + body.htmlEnc() + '</span>' +
        '</p>'
      );

      // Scroll to last message
      chat_messages_sel.stop(true).animate({
        scrollTop: chat_messages_sel[0].scrollHeight
      }, 400);
    }
  },

  room_message_out: function(_this, stanza) {
    console.log('room_message_out');
  },

  room_presence_in: function(_this, stanza) {
    console.log('room_presence_in');

    var pr_from = stanza.from();

    if(!pr_from) return;

    var jid_obj = new JSJaCJID(pr_from);
    var jid_bare = jid_obj.getBareJID();
    var jid_resource = jid_obj.getResource();

    if(jid_obj.toString() == con.username + '@' + con.domain + '/' + con.resource) {
      return;
    }

    // Not our chatroom!
    if(jid_bare != $('#form_call input[name="call_room"]').val().trim()) {
      return;
    }

    // Online buddy: show it!
    if(stanza.type() == 'unavailable') {
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
        alert('This is a room user.');
        return false;
      });
    }
  },

  room_presence_out: function(_this, stanza) {
    console.log('room_presence_out');
  },

  session_prepare_pending: function(_this, stanza) {
    console.log('session_prepare_pending');

    $('.call_notif').hide();
    $('#call_info').text('Preparing...').show();

    $('#form_call').find('input, button:not([data-lock])').attr('disabled', true);
  },

  session_prepare_success: function(_this, stanza) {
    console.log('session_prepare_success');

    $('.call_notif').hide();
    $('#call_success').text('Prepared.').show();

    $('#fieldset_live, #form_invite, #form_invite input, #form_invite button').removeAttr('disabled');
  },

  session_prepare_error: function(_this, stanza) {
    console.log('session_prepare_error');

    $('.call_notif').hide();
    $('#call_error').text('Could not prepare.').show();

    $('#form_call').find('input, button:not([data-lock])').removeAttr('disabled');
    $('#form_live').find('button').removeAttr('disabled');
  },

  session_initiate_pending: function(_this) {
    console.log('session_initiate_pending');

    $('.call_notif').hide();
    $('#call_info').text('Initiating...').show();
  },

  session_initiate_success: function(_this, stanza) {
    console.log('session_initiate_success');

    $('.call_notif').hide();
    $('#call_success').text('Call initiated.').show();

    $('#form_live').find('button').removeAttr('disabled');
  },

  session_initiate_error: function(_this, stanza) {
    console.log('session_initiate_error');

    $('.call_notif').hide();
    $('#call_error').text('Could not initialize.').show();
    $('#chat_messages').empty();

    $('#form_call').find('input, button:not([data-lock])').removeAttr('disabled');
    $('#form_live').find('button').removeAttr('disabled');
  },

  session_leave_pending: function(_this) {
    console.log('session_leave_pending');

    $('.call_notif').hide();
    $('#call_info').text('Leaving...').show();

    $('#form_live').find('button').attr('disabled', true);
    $('#form_invite, #form_invite input, #form_invite button').attr('disabled', true);
  },

  session_leave_success: function(_this, stanza) {
    console.log('session_leave_success');

    $('.call_notif').hide();
    $('#call_success').text('Left call.').show();

    $('#fieldset_live').attr('disabled', true);
    $('#live_mute').show();
    $('#live_unmute').hide();
    $('#chat_messages').empty();

    $('#form_call').find('input, button:not([data-lock])').removeAttr('disabled');
    $('#form_live').find('button').removeAttr('disabled');
  },

  session_leave_error: function(_this, stanza) {
    console.log('session_leave_error');

    $('.call_notif').hide();
    $('#call_error').text('Could not leave (forced).').show();

    $('#fieldset_live').attr('disabled', true);
    $('#live_mute').show();
    $('#live_unmute').hide();
    $('#chat_messages').empty();

    $('#form_call').find('input, button:not([data-lock])').removeAttr('disabled');
    $('#form_live').find('button').removeAttr('disabled');
  },

  participant_prepare: function(_this, stanza) {
    console.log('participant_prepare');

    helper_video_load(_this, stanza);
  },

  participant_initiate: function(_this, stanza) {
    console.log('participant_initiate');

    helper_video_load(_this, stanza);
  },

  participant_leave: function(_this, stanza) {
    console.log('participant_leave');
  },

  participant_session_initiate_pending: function(_this, session) {
    console.log('participant_session_initiate_pending');

    helper_video_load(_this, null, session);
  },

  participant_session_initiate_success: function(_this, session, stanza) {
    console.log('participant_session_initiate_success');
  },

  participant_session_initiate_error: function(_this, session, stanza) {
    console.log('participant_session_initiate_error');
  },

  participant_session_initiate_request: function(_this, session, stanza) {
    console.log('participant_session_initiate_request');
  },

  participant_session_accept_pending: function(_this, session) {
    console.log('participant_session_accept_pending');
  },

  participant_session_accept_success: function(_this, session, stanza) {
    console.log('participant_session_accept_success');

    helper_video_remove(_this, stanza);
  },

  participant_session_accept_error: function(_this, session, stanza) {
    console.log('participant_session_accept_error');
  },

  participant_session_accept_request: function(_this, session, stanza) {
    console.log('participant_session_accept_request');
  },

  participant_session_info_pending: function(_this, session) {
    console.log('participant_session_info_pending');
  },

  participant_session_info_success: function(_this, session, stanza) {
    console.log('participant_session_info_success');
  },

  participant_session_info_error: function(_this, session, stanza) {
    console.log('participant_session_info_error');
  },

  participant_session_info_request: function(_this, session, stanza) {
    console.log('participant_session_info_request');
  },

  participant_session_terminate_pending: function(_this, session) {
    console.log('participant_session_terminate_pending');
  },

  participant_session_terminate_success: function(_this, session, stanza) {
    console.log('participant_session_terminate_success');

    helper_video_stop(_this, stanza);
  },

  participant_session_terminate_error: function(_this, session, stanza) {
    console.log('participant_session_terminate_error');

    helper_video_stop(_this, stanza);
  },

  participant_session_terminate_request: function(_this, session, stanza) {
    console.log('participant_session_terminate_request');
  },

  participant_stream_add: function(_this, session, data) {
    console.log('participant_stream_add');
  },

  participant_stream_remove: function(_this, session, data) {
    console.log('participant_stream_remove');
  },

  participant_stream_connected: function(_this, session, data) {
    console.log('participant_stream_connected');
  },

  participant_stream_disconnected: function(_this, session, data) {
    console.log('participant_stream_disconnected');
  },

  add_remote_view: function(_this, username, media) {
    console.log('add_remote_view');

    var nobody_sel = $('#room_container h6');
    var container_sel = $('#room_container .video_remote_container').filter(function() {
      return ($(this).attr('data-username') + '') === (username + '');
    });

    // Not already in view?
    if(!container_sel.size()) {
      // NOTE: we can use 'media' parameter to either append an 'audio' or a 'video' element
      container_sel = $(
        '<div class="video_remote_container">' +
          '<video class="video_remote" src="" alt="" width="320" height="180" poster="./images/video_poster_big.png"></video>' +
        '</div>'
      );

      container_sel.attr('data-username', username);
      container_sel.insertBefore('#room_container .clear:last').hide();

      var fn_reveal_view = function() {
        container_sel.stop(true).hide().fadeIn(400);
      };

      if(nobody_sel.is(':visible')) {
        // If is animated, only delay video container reveal
        if(nobody_sel.is(':animated')) {
          container_sel.oneTime(250, fn_reveal_view);
        } else {
          nobody_sel.stop(true).fadeOut(250, fn_reveal_view);
        }
      } else {
        fn_reveal_view();
      }
    }

    // IMPORTANT: return view selector
    return container_sel.find('video.video_remote')[0];
  },

  remove_remote_view: function(_this, username) {
    console.log('remove_remote_view');

    var nobody_sel = $('#room_container h6');
    var container_sel = $('#room_container .video_remote_container').filter(function() {
      return ($(this).attr('data-username') + '') === (username + '');
    });

    // Exists in view?
    if(container_sel.size()) {
      container_sel.stop(true).fadeOut(250, function() {
        $(this).remove();

        if(!$('#room_container .video_remote_container').size() && nobody_sel.is(':hidden')) {
          nobody_sel.stop(true).fadeIn(400);
        }
      });

      // IMPORTANT: return view selector
      var view_sel = container_sel.find('video.video_remote');

      if(view_sel.size()) {
        return view_sel[0];
      }
    }

    return null;
  }
};

// Functions: helpers
function helper_get_username(_this, stanza) {
  return _this.utils.stanza_username(stanza);
}

function helper_select_video(username) {
  return $('#room_container .video_remote_container').filter(function() {
    return ($(this).attr('data-username') + '') === (username + '');
  });
}

function helper_video_load(_this, stanza, session) {
  var username;

  if(session)
    username = session.utils.extract_username(session.get_to());
  else if(stanza)
    username = helper_get_username(_this, stanza);
  else
    return;

  var container_sel = helper_select_video(username);

  if(container_sel.size() && !container_sel.find('.load').size()) {
    container_sel.append('<span class="load"></span>');
  }
}

function helper_video_remove(_this, stanza) {
  var username = helper_get_username(_this, stanza);
  var container_sel = helper_select_video(username);

  container_sel.find('.load').remove();
}

function helper_video_stop(_this, stanza) {
  var username = helper_get_username(_this, stanza);
  var container_sel = helper_select_video(username);

  container_sel.find('.load').remove();
  if(container_sel.size() && !container_sel.find('.error').size()) {
    container_sel.append('<span class="error"></span>');
  }
}

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

              muji_invite: function(stanza, args) {
                console.log('muji_invite');

                var prompt_text = 'Invite to multiparty ' + args.media + ' call received.\n' +
                          '\n' +
                          'From: ' + args.from + '\n' +
                          'Room: ' + args.jid + '\n' +
                          'Reason: ' + (args.reason || '[none]') + '\n' +
                          'Password: ' + (args.password || '[none]') + '\n' +
                          '\n' +
                          'Accept?';

                // Prompt user
                if(confirm(prompt_text)) {
                  console.log('muji_invite > Invite accepted.');

                  // Session values
                  ARGS.to           = args.jid;
                  ARGS.media        = (args.media == GIGGLE_MEDIA_VIDEO) ? GIGGLE_MEDIA_VIDEO : GIGGLE_MEDIA_AUDIO;
                  ARGS.local_view   = $('#video_local')[0];

                  if(args.password) {
                    ARGS.password = args.password;
                  }

                  // Let's go!
                  GIGGLE_SESSION = Giggle.session(GIGGLE_SESSION_MUJI, ARGS);
                  GIGGLE_SESSION.join();
                } else {
                  console.log('muji_invite > Invite declined.');
                }
              }
            });

            // Auto-join call?
            var param_call = url_param('call');

            if(param_call === 'audio') {
              $('#form_call button[name="call_video"]').click();
            } else if(param_call == 'video') {
              $('#form_call button[name="call_video"]').click();
            }
          } catch(e) {
            alert('onconnect > ' + e);
          }
        });

        con.registerHandler('ondisconnect', function() {
          try {
            $('.login_notif').hide();

            if(SC_CONNECTED)
              $('#login_error').text('Disconnected.').show();
            else
              $('#login_error').text('Invalid credentials.').show();

            if(SC_CONNECTED && GIGGLE_SESSION !== null) GIGGLE_SESSION.leave();

            $('#form_login').find('input, button').removeAttr('disabled');
            $('#form_login button').show();
            $('#login_disconnect').hide();

            SC_PRESENCE = {};
            $('#roster_call').empty();

            $('#fieldset_call, #fieldset_live, #form_invite, #form_invite input, #form_invite button').attr('disabled', true);

            SC_CONNECTED = false;
          } catch(e) {
            alert('ondisconnect > ' + e);
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
      if(!SC_CONNECTED) return false;

      $('.call_notif').hide();

      var call_room  = $(this).find('input[name="call_room"]').val().trim();

      // Any JID defined?
      if(call_room) {
        $('#call_info').text('Launching...').show();

        try {
          // Session values
          ARGS.to           = call_room;
          ARGS.media        = (submit_target == 'call_audio') ? GIGGLE_MEDIA_AUDIO : GIGGLE_MEDIA_VIDEO;
          ARGS.video_source = GIGGLE_VIDEO_SOURCE_CAMERA;
          ARGS.local_view   = $('#video_local')[0];

          // Let's go!
          GIGGLE_SESSION = Giggle.session(GIGGLE_SESSION_MUJI, ARGS);
          GIGGLE_SESSION.join();
        } catch(e) {
          alert('jingle > ' + e);
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

      if(GIGGLE_SESSION !== null) GIGGLE_SESSION.leave();

      $('.live_notif').hide();
    } catch(e) {
      alert('form_live > ' + e);
    } finally {
      return false;
    }
  });

  // Submit invite form
  $('#form_invite').submit(function() {
    try {
      var input_sel = $(this).find('input[name="invite_jid"]');
      var invite_jid = input_sel.val().trim();

      if(invite_jid) {
        GIGGLE_SESSION.invite(invite_jid, 'Join me buddy!');
        input_sel.val('');
      }
    } catch(e) {
      alert('form_invite > ' + e);
    } finally {
      return false;
    }
  });

  // Submit chat form
  $('#form_chat').submit(function() {
    try {
      var input_sel = $(this).find('input[name="message"]');
      var body = input_sel.val().trim();

      if(body) {
        GIGGLE_SESSION.send_message(body);
        input_sel.val('');
      }
    } catch(e) {
      alert('form_chat > ' + e);
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
  var param_room       = url_param('room');

  var login_input_sel = $('#form_login input');

  if(param_bosh)       login_input_sel.filter('[name="login_bosh"]').val(param_bosh);
  if(param_websocket)  login_input_sel.filter('[name="login_websocket"]').val(param_websocket);
  if(param_jid)        login_input_sel.filter('[name="login_jid"]').val(param_jid);
  if(param_pwd)        login_input_sel.filter('[name="login_pwd"]').val(param_pwd);

  if(param_room)       $('#form_call input[name="call_room"]').val(param_room);

  if(param_go == '1')  $('#form_login').submit();
});
