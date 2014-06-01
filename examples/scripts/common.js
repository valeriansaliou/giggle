/* 
  JSJaCJingle.js Simple Client

  @fileoverview Scripts (commons)
  
  @url https://github.com/valeriansaliou/jsjac-jingle
  @author Valérian Saliou https://valeriansaliou.name/
  @license Mozilla Public License v2.0 (MPL v2.0)
 */

$(document).ready(function() {
    // Check for WebRTC support
    if(!JSJAC_JINGLE_AVAILABLE) {
        $('#fieldset_login').attr('disabled', true);
        $('#not_supported:hidden').animate({'height': 'toggle', 'opacity': 'toggle'}, 400);
    }

    // Submit first form
    $('#form_login').submit(function() {
        try {
            if(SC_CONNECTED) return false;

            $('.login_notif').hide();

            var login_bosh = $(this).find('input[name="login_bosh"]').val();
            var login_websocket = $(this).find('input[name="login_websocket"]').val();
            var login_jid = $(this).find('input[name="login_jid"]').val();
            var login_pwd = $(this).find('input[name="login_pwd"]').val();

            if(login_bosh && login_jid && login_pwd) {
                $('#login_info').text('Connecting...').show();

                // Generate JID
                login_jid += '/JSJaCJingle.js (' + (new Date()).getTime() + ')';
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

                        // Initialize JSJaCJingle router
                        JSJaCJingle_listen({
                            connection: con,
                            debug: (new JSJaCConsoleLogger(4)),
                            
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

                        if(SC_CONNECTED && JINGLE != null) JINGLE.terminate();

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

                        if(!pr_from)
                            return;

                        var jid_obj = new JSJaCJID(pr_from);

                        if(jid_obj.toString() == con.username + '@' + con.domain + '/' + con.resource)
                            return;

                        // Online buddy: show it!
                        var jid_bare = jid_obj.getBareJID();
                        var jid_resource = jid_obj.getResource();

                        if(presence.getType() == 'unavailable') {
                            if(jid_bare in SC_PRESENCE && jid_resource in SC_PRESENCE[jid_bare]) {
                                delete (SC_PRESENCE[jid_bare])[jid_resource];

                                var size = 0;
                                for(i in SC_PRESENCE[jid_bare]) size++;

                                if(size == 0) delete SC_PRESENCE[jid_bare];
                            }
                        } else {
                            if(!(jid_bare in SC_PRESENCE)) SC_PRESENCE[jid_bare] = {};

                            (SC_PRESENCE[jid_bare])[jid_resource] = 1;
                        }

                        // Update list
                        var roster_call = '';
                        $('#roster_call').hide().empty();

                        for(cur_bare_jid in SC_PRESENCE) {
                            for(cur_resource in SC_PRESENCE[cur_bare_jid]) {
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

                                    $('#form_call input[name="call_jid"]').val($(this).attr('data-jid'));

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
                
                // Configure credentials
                oArgs = new Object();
                oArgs.username = jid_obj.getNode();
                oArgs.domain = jid_obj.getDomain();
                oArgs.resource = jid_obj.getResource();
                oArgs.pass = login_pwd;
                oArgs.secure = true;
                
                // Connect
                con.connect(oArgs);

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

            $('#roster_call').addClass('disabled');

            $('.call_notif').hide();

            var call_jid  = $(this).find('input[name="call_jid"]').val();

            // Any JID defined?
            if(call_jid) {
                $('#call_info').text('Launching...').show();

                try {
                    // Session values
                    ARGS.to           = call_jid;
                    ARGS.media        = (submit_target == 'call_audio') ? JSJAC_JINGLE_MEDIA_AUDIO : JSJAC_JINGLE_MEDIA_VIDEO;
                    ARGS.video_source = (submit_target == 'call_screen') ? JSJAC_JINGLE_VIDEO_SOURCE_SCREEN : JSJAC_JINGLE_VIDEO_SOURCE_CAMERA;
                    ARGS.local_view   = document.getElementById('video_local');
                    ARGS.remote_view  = document.getElementById('video_remote');

                    // Let's go!
                    JINGLE = new JSJaCJingle(ARGS);
                    JINGLE.initiate();
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

            if(JINGLE != null) JINGLE.terminate();

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

            if(JINGLE != null) JINGLE.mute(JSJAC_JINGLE_MEDIA_AUDIO);

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

            if(JINGLE != null) JINGLE.unmute(JSJAC_JINGLE_MEDIA_AUDIO);

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

    if(param_bosh)       $('#form_login input[name="login_bosh"]').val(param_bosh);
    if(param_websocket)  $('#form_login input[name="login_websocket"]').val(param_websocket);
    if(param_jid)        $('#form_login input[name="login_jid"]').val(param_jid);
    if(param_pwd)        $('#form_login input[name="login_pwd"]').val(param_pwd);

    if(param_go == '1')  $('#form_login').submit();
});
