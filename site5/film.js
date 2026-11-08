(function () {
  'use strict';

  var film = document.getElementById('film');
  var video = document.getElementById('filmVideo');
  if (!film || !video) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;                       // leave the first frame, no scroll-driven motion

  var target = 0;                           // wanted time, seconds
  var raf = 0;

  function progress() {
    var r = film.getBoundingClientRect();
    var span = Math.max(1, r.height - window.innerHeight);
    return Math.min(1, Math.max(0, -r.top / span));
  }

  function update() {
    raf = 0;
    var d = video.duration;
    if (!d || !isFinite(d)) return;
    target = progress() * d;
    var diff = target - video.currentTime;
    // seek only when the previous seek has finished, otherwise the browser queues them up
    if (Math.abs(diff) > 0.03 && !video.seeking) {
      video.currentTime = video.currentTime + diff * 0.6;
    }
    if (Math.abs(diff) > 0.03) raf = requestAnimationFrame(update);
  }

  function kick() { if (!raf) raf = requestAnimationFrame(update); }

  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  video.addEventListener('loadedmetadata', kick);
  video.addEventListener('seeked', function () { if (Math.abs(target - video.currentTime) > 0.03) kick(); });
  kick();
})();
