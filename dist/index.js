"use strict";

var EventEmitter = require('events');
var audio = require('../buildWin/Release/audio.node');
var init = function init(mic) {
  var events = new EventEmitter();
  var data = {
    audio: audio.get(mic),
    status: audio.isMuted(mic)
  };

  /**
   * Check and update current volume. [Generic]
   */
  var _check = function _check(fn, key, event) {
    var now = fn(mic);
    if (key == 'status') {
      now = Boolean(now);
    }
    if (data[key] != now) {
      events.emit(event, {
        old: data[key],
        "new": now
      });
    }
    data[key] = now;
  };

  /**
   * Check and update current volume.
   */
  var check = function check() {
    _check(audio.get, 'audio', 'change');
    _check(audio.isMuted, 'status', 'toggle');
  };

  /**
   * Get current audio
   */
  var get = function get() {
    return audio.get(mic);
  };

  /**
   * Update current and delegate audio set to native module.
   */
  var set = function set(value) {
    audio.set(value, mic);
    check();
  };

  /**
   * Save current status and mute volume.
   */
  var mute = function mute() {
    return audio.mute(mic, 1);
  };

  /**
   * Restore previous volume.
   */
  var unmute = function unmute() {
    return audio.mute(mic, 0);
  };

  /**
   * Mute/Unmute volume.
   */
  var toggle = function toggle() {
    if (audio.isMuted(mic)) unmute(); else mute();
  };

  /**
   * React to volume changes using polling check.
   */
  var polling = function polling(interval) {
    return setInterval(check, interval || 500);
  };

  /**
   * Increase current volume of value%
   */
  var increase = function increase(value) {
    unmute();
    var perc = data.audio + value;
    if (perc < 0) perc = 0;
    if (perc > 100) perc = 100;
    set(perc);
  };

  /**
   * Decrease current volume of value%
   */
  var decrease = function decrease(value) {
    return increase(-value);
  };

  /**
   * Check if is muted
   */
  var isMuted = function isMuted() {
    return audio.isMuted(mic) == 1;
  };
  return {
    events: events,
    polling: polling,
    get: get,
    set: set,
    increase: increase,
    decrease: decrease,
    mute: mute,
    unmute: unmute,
    isMuted: isMuted,
    toggle: toggle
  };
};
module.exports = {
  speaker: init(0),
  mic: init(1)
};