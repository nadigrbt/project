(function () {
  'use strict';

  var film = document.getElementById('film');
  var video = document.getElementById('filmVideo');
  if (!film || !video) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;                       // leave the first frame, no scroll-driven motion

  var FPS = 24;
  var cur = 0;                              // the time we are showing, seconds (eased)
  var raf = 0;
  var last = 0;

  function target() {
    var r = film.getBoundingClientRect();
    var span = Math.max(1, r.height - window.innerHeight);
    var p = Math.min(1, Math.max(0, -r.top / span));
    return p * (video.duration || 0);
  }

  function tick(now) {
    raf = 0;
    var d = video.duration;
    if (!d || !isFinite(d)) return;

    var dt = Math.min(0.05, (now - (last || now)) / 1000 || 0.016);
    last = now;

    // Ease towards the scroll position. The speed of the scroll does not matter:
    // a fast flick is spread over a short, smooth glide instead of a jump.
    var t = target();
    cur += (t - cur) * (1 - Math.exp(-dt * 6));

    // Show whole frames only, and never queue seeks.
    var frame = Math.round(cur * FPS) / FPS;
    if (!video.seeking && Math.abs(frame - video.currentTime) >= 0.5 / FPS) {
      video.currentTime = frame;
    }

    if (Math.abs(t - cur) > 0.004 || video.seeking) {
      raf = requestAnimationFrame(tick);
    } else {
      last = 0;
    }
  }

  function kick() { if (!raf) raf = requestAnimationFrame(tick); }

  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  video.addEventListener('loadedmetadata', function () { cur = target(); kick(); });
  video.addEventListener('seeked', kick);
  kick();
})();
