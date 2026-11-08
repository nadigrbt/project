(function () {
  'use strict';

  var film = document.getElementById('film');
  var video = document.getElementById('filmVideo');
  if (!film || !video) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;                       // leave the first frame, no scroll-driven motion

  // Phones: seeking frame by frame is jerky on iOS, so let the video play on its own
  // while the page is being scrolled and pause it when scrolling stops.
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
    var lastY = window.scrollY, lastT = performance.now(), idle = 0, rate = 1;
    video.loop = true;
    video.muted = true;
    function visible() {
      var r = film.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    }
    function go(speed) {
      var target = Math.min(3.5, Math.max(1.8, 1.8 + speed * 1.6));
      rate += (target - rate) * 0.5;
      try { video.playbackRate = rate; } catch (e) {}
      if (video.paused) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      clearTimeout(idle);
      idle = setTimeout(function () { video.pause(); }, 300);
    }
    function poke(fast) {
      var now = performance.now(), y = window.scrollY;
      var speed = Math.abs(y - lastY) / Math.max(1, now - lastT);   // px per ms
      lastY = y; lastT = now;
      if (!visible()) return;
      go(fast ? Math.max(speed, 0.4) : speed);
    }
    // Any finger movement on the screen sets the video going, scrolling or not.
    window.addEventListener('touchstart', function () {
      // first touch also unlocks playback on iOS, wherever the finger lands
      var p = video.play();
      if (p && p.then) p.then(function () { if (!visible()) video.pause(); }).catch(function () {});
    }, { passive: true });
    window.addEventListener('touchmove', function () { poke(true); }, { passive: true });
    window.addEventListener('scroll', function () { poke(false); }, { passive: true });
    return;
  }

  var FPS = 24;                             // frame rate of the original video
  var LOOPS = 1;                            // video runs once while it scrolls into view
  var STIFF = 9;                            // lower = softer, longer glide

  var pos = 0;                              // eased position, in seconds of unwrapped time
  var vel = 0;
  var raf = 0;
  var last = 0;

  function target() {
    // 0 when the video starts to come into view at the bottom of the screen,
    // 1 when it fills the screen (the end of the page). The page itself scrolls normally.
    var r = film.getBoundingClientRect();
    var h = Math.min(window.innerHeight, film.offsetHeight || window.innerHeight);
    // On a phone the video block is short, so the whole clip would flash by in a few swipes.
    // Start the progress earlier, while the text above is still scrolling, to stretch it out.
    var run = window.innerWidth <= 820 ? window.innerHeight * 1.6 : 0;
    var p = Math.min(1, Math.max(0, (window.innerHeight + run - r.top) / (h + run)));
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
  // iOS Safari will not decode/seek a video until it has been played once. Muted inline play
  // is allowed, so prime it on load and again on the first touch/scroll.
  var primed = false;
  function prime() {
    if (primed) return;
    var pr = video.play();
    if (pr && pr.then) {
      pr.then(function () { video.pause(); primed = true; kick(); }).catch(function () {});
    } else { video.pause(); primed = true; }
  }
  prime();
  ['touchend', 'pointerup', 'scroll'].forEach(function (ev) {
    window.addEventListener(ev, prime, { passive: true });
  });

  // Fallback: if the browser still refuses to scrub (frame never changes while the video is
  // on screen), simply play it on a loop so the block is never a black hole.
  var fell = false;
  setInterval(function () {
    if (fell) return;
    var r = film.getBoundingClientRect();
    if (r.top > innerHeight * 0.7 || r.bottom < 0) return;
    if (!video.paused) return;
    var before = video.currentTime;
    setTimeout(function () {
      if (fell || !video.paused) return;
      var moved = Math.abs(video.currentTime - before) > 0.01;
      var scrolled = Math.abs(target() - 0) > 0.01;
      if (!moved && scrolled && (video.readyState < 2 || video.currentTime === 0)) {
        fell = true; video.loop = true;
        var p = video.play(); if (p && p.catch) p.catch(function () {});
      }
    }, 900);
  }, 1200);
  kick();
})();
