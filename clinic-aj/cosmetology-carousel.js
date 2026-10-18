// Карусель аппаратов на первом экране /cosmetology: бесконечная, свайп / стрелки / точки.
(function () {
  var track = document.getElementById('cs-track');
  if (!track) return;
  var prev = document.getElementById('cs-prev'), next = document.getElementById('cs-next');
  var dots = [].slice.call(document.querySelectorAll('#cs-dots button'));
  var nameEl = document.getElementById('cs-name'), textEl = document.getElementById('cs-text'), linkEl = document.getElementById('cs-link');
  var originals = [].slice.call(track.children), N = originals.length, START = 1;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // три копии подряд: после остановки в крайней копии мгновенно возвращаемся в среднюю, шва не видно
  [0, 1].forEach(function (c) {
    originals.forEach(function (o) {
      var k = o.cloneNode(true);
      k.setAttribute('aria-hidden', 'true'); k.tabIndex = -1;
      var im = k.querySelector('img'); if (im) { im.alt = ''; im.loading = 'lazy'; }
      if (c === 0) track.insertBefore(k, originals[0]); else track.appendChild(k);
    });
  });
  var slides = [].slice.call(track.children), cur = N + START, tick = 0, settle = 0;
  var wasClone = function (k) { return k < N || k >= 2 * N; };
  function center(k, smooth) {
    var s = slides[k];
    track.scrollTo({ left: s.offsetLeft + s.offsetWidth / 2 - track.clientWidth / 2, behavior: smooth && !reduce ? 'smooth' : 'auto' });
  }
  function show(k) {
    cur = k; var i = k % N, o = originals[i];
    slides.forEach(function (s, j) { s.classList.toggle('is-on', j === k); });
    dots.forEach(function (d, j) { d.setAttribute('aria-current', String(j === i)); });
    nameEl.textContent = o.getAttribute('data-name');
    textEl.textContent = o.getAttribute('data-text');
    linkEl.setAttribute('href', o.getAttribute('href'));
    linkEl.textContent = o.getAttribute('data-label');
    if (o.getAttribute('data-blank')) { linkEl.setAttribute('target', '_blank'); linkEl.setAttribute('rel', 'noopener'); } else { linkEl.removeAttribute('target'); linkEl.removeAttribute('rel'); }
  }
  function nearest() {
    var c = track.scrollLeft + track.clientWidth / 2, best = 0, bd = 1e9;
    slides.forEach(function (s, k) { var d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - c); if (d < bd) { bd = d; best = k; } });
    return best;
  }
  function recenter() { var k = nearest(); if (wasClone(k)) { var m = N + (k % N); center(m, false); show(m); } }
  track.addEventListener('scroll', function () {
    cancelAnimationFrame(tick);
    tick = requestAnimationFrame(function () { var n = nearest(); if (n !== cur) show(n); });
    clearTimeout(settle); settle = setTimeout(recenter, 140);
  });
  // клик по соседнему аппарату листает к нему, по центральному открывает страницу
  track.addEventListener('click', function (e) {
    var s = e.target.closest('.cs-show__slide'); if (!s) return;
    var k = slides.indexOf(s);
    if (k !== cur) { e.preventDefault(); center(k, true); }
  });
  prev.addEventListener('click', function () { center(cur - 1, true); });
  next.addEventListener('click', function () { center(cur + 1, true); });
  dots.forEach(function (d, j) { d.addEventListener('click', function () { center(N + j, true); }); });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); center(cur + 1, true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); center(cur - 1, true); }
  });
  prev.hidden = false; next.hidden = false;
  show(N + START); center(N + START, false);
  requestAnimationFrame(function () { center(cur, false); });
  window.addEventListener('load', function () { center(cur, false); });
  if (window.ResizeObserver) new ResizeObserver(function () { center(cur, false); }).observe(document.getElementById('cs-show'));
})();
