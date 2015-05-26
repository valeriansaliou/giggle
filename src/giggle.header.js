/**
 * @fileoverview Giggle library - Header
 *
 * @url https://github.com/valeriansaliou/giggle
 * @author Valérian Saliou https://valeriansaliou.name/
 *
 * @copyright 2015, Valérian Saliou
 * @license Mozilla Public License v2.0 (MPL v2.0)
 */


/** @module giggle/header */


/**
 * Implements:
 *
 * See the PROTOCOL.md file for a list of supported protocol extensions
 *
 *
 * Workflow:
 *
 * This negotiation example associates Giggle.js methods to a real workflow
 * We assume in this workflow example remote user accepts the call he gets
 *
 * 1.cmt Local user wants to start a WebRTC session with remote user
 * 1.snd Local user sends a session-initiate type='set'
 * 1.hdl Remote user sends back a type='result' to '1.snd' stanza (ack)
 *
 * 2.cmt Local user waits silently for remote user to send a session-accept
 * 2.hdl Remote user sends a session-accept type='set'
 * 2.snd Local user sends back a type='result' to '2.hdl' stanza (ack)
 *
 * 3.cmt WebRTC session starts
 * 3.cmt Users chat, and chat, and chat. Happy Jabbering to them!
 *
 * 4.cmt Local user wants to stop WebRTC session with remote user
 * 4.snd Local user sends a session-terminate type='set'
 * 4.hdl Remote user sends back a type='result' to '4.snd' stanza (ack)
 */
