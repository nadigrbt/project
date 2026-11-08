(function () {
  'use strict';

  var film = document.getElementById('film');
  var video = document.getElementById('filmVideo');
  if (!film || !video) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;                       // leave the first frame, no scroll-driven motion

  var FPS = 24;                             // frame rate of the original video
  var LOOPS = 1;                            // video runs once while it scrolls into view
  var STIFF = 9;                            // lower = softer, longer glide

  var extra = 0;                            // extra seconds earned by scrolling further down at the end of the page
  var pos = 0;                              // eased position, in seconds of unwrapped time
  var vel = 0;
  var raf = 0;
  var last = 0;

  function target() {
    // 0 when the video starts to come into view at the bottom of the screen,
    // 1 when it fills the screen (the end of the page). The page itself scrolls normally.
    var r = film.getBoundingClientRect();
    var p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / window.innerHeight));
    return p * LOOPS * (video.duration || 0) + extra;
  }

  function tick(now) {
    raf = 0;
    var d = video.duration;
    if (!d || !isFinite(d)) return;

    var dt = Math.min(0.05, (now - (last || now)) / 1000 || 0.016);
    last = now;

    // A critically damped spring: starts gently, glides, and settles without overshoot.
    // A fast flick of the wheel only changes where the spring is heading.
    var t = target();
    vel += ((t - pos) * STIFF * STIFF - vel * 2 * STIFF) * dt;
    pos += vel * dt;

    // The video loops: wrap the time, whole frames only, one seek at a time.
    var wrapped = ((pos % d) + d) % d;
    var frame = Math.min(d - 1 / FPS, Math.round(wrapped * FPS) / FPS);
    var delta = Math.abs(frame - video.currentTime);
    delta = Math.min(delta, d - delta);       // the shortest way round the loop
    if (!video.seeking && delta >= 0.5 / FPS) video.currentTime = frame;

    if (Math.abs(t - pos) > 0.003 || Math.abs(vel) > 0.003 || video.seeking) {
      raf = requestAnimationFrame(tick);
    } else {
      last = 0;
    }
  }

  function kick() { if (!raf) raf = requestAnimationFrame(tick); }

  // The page ends on the video, so there is nothing left to scroll. Keep playing the video in a loop
  // while the person keeps scrolling down, and run it back before the page starts to move up again.
  function atBottom() {
    var el = document.documentElement;
    return window.pageYOffset >= el.scrollHeight - window.innerHeight - 2;
  }

  function push(px, event) {
    var d = video.duration;
    if (!d || !isFinite(d)) return;
    var secs = px / window.innerHeight * d;       // one screen of scrolling = one run of the video
    if (px > 0 && atBottom()) {
      extra += secs;
    } else if (px < 0 && extra > 0) {
      extra = Math.max(0, extra + secs);
    } else {
      return;                                     // normal page scrolling
    }
    if (event.cancelable) event.preventDefault();
    kick();
  }

  window.addEventListener('wheel', function (e) {
    var px = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
    push(px, e);
  }, { passive: false });

  var touchY = null;
  window.addEventListener('touchstart', function (e) { touchY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchmove', function (e) {
    if (touchY === null) return;
    var y = e.touches[0].clientY;
    push(touchY - y, e);                          // swiping up scrolls down
    touchY = y;
  }, { passive: false });
  window.addEventListener('touchend', function () { touchY = null; }, { passive: true });

  window.addEventListener('keydown', function (e) {
    var down = e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey);
    var up = e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey);
    if (!down && !up) return;
    var step = (e.key === 'ArrowDown' || e.key === 'ArrowUp') ? 60 : window.innerHeight * 0.9;
    push(down ? step : -step, e);
  });

  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  video.addEventListener('loadedmetadata', function () { pos = target(); vel = 0; kick(); });
  video.addEventListener('seeked', kick);
  kick();
})();
