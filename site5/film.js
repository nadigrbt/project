(function () {
  'use strict';

  var film = document.getElementById('film');
  var video = document.getElementById('filmVideo');
  if (!film || !video) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;                       // leave the first frame, no scroll-driven motion

  var FPS = 24;                             // frame rate of the original video
  var LOOPS = 3;                            // how many times the video runs over the whole section
  var STIFF = 9;                            // lower = softer, longer glide

  var pos = 0;                              // eased position, in seconds of unwrapped time
  var vel = 0;
  var raf = 0;
  var last = 0;

  function target() {
    var r = film.getBoundingClientRect();
    var span = Math.max(1, r.height - window.innerHeight);
    var p = Math.min(1, Math.max(0, -r.top / span));
    return p * LOOPS * (video.duration || 0);
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

  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  video.addEventListener('loadedmetadata', function () { pos = target(); vel = 0; kick(); });
  video.addEventListener('seeked', kick);
  kick();
})();
