/* Плавающее видео слева внизу, как на Тильде: маленькое превью без звука, по клику увеличивается, можно свернуть или спрятать (после обновления страницы возвращается).
   Пока видна cookie-плашка, окошко стоит над ней (переменная --cookie-h из CookieBanner.astro). */
(function () {
  var s = document.currentScript;
  var src = s && s.getAttribute('data-src');
  if (!src) return;
  // Необязательные: картинка-заставка до загрузки видео и подпись для экранного диктора
  var poster = s.getAttribute('data-poster-src');
  var label = s.getAttribute('data-label') || 'Видео о процедуре';

  var css = document.createElement('style');
  css.textContent =
    '.vw{position:fixed;left:20px;bottom:calc(20px + var(--cookie-h,0px));z-index:40;width:132px;aspect-ratio:9/16;background:#262323;border-radius:14px;overflow:hidden;box-shadow:0 8px 28px rgba(38,35,35,.28);cursor:pointer;transition:width .25s,height .25s}' +
    '.vw video{display:block;width:100%;height:100%;object-fit:cover}' +
    '.vw__btn{position:absolute;top:8px;width:28px;height:28px;padding:0;border:0;border-radius:50%;background:rgba(38,35,35,.65);color:#fff;font:16px/28px Jost,sans-serif;text-align:center;cursor:pointer}' +
    '.vw__btn:hover{background:#784443}' +
    '.vw__close{right:8px}.vw__min{right:44px;display:none}' +
    '.vw--open{width:min(360px,calc(100vw - 40px));max-height:calc(100vh - 40px - var(--cookie-h,0px));cursor:default}' +
    '.vw--open .vw__min{display:block}' +
    '@media (max-width:959px){.vw{left:12px;bottom:calc(12px + var(--cookie-h,0px));width:104px}.vw--open{width:min(300px,calc(100vw - 24px))}}';
  document.head.appendChild(css);

  var box = document.createElement('div');
  box.className = 'vw';
  box.innerHTML =
    '<video muted loop playsinline autoplay preload="metadata"></video>' +
    '<button class="vw__btn vw__min" type="button" aria-label="Свернуть видео">&minus;</button>' +
    '<button class="vw__btn vw__close" type="button" aria-label="Закрыть видео">&times;</button>';
  var v = box.querySelector('video');
  v.setAttribute('aria-label', label);
  if (poster) v.poster = poster;
  v.src = src;

  function open() {
    box.classList.add('vw--open');
    box.removeAttribute('role'); box.removeAttribute('aria-label');
    v.muted = false; v.controls = true; v.currentTime = 0; v.loop = false;
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  }
  function shrink() {
    box.classList.remove('vw--open');
    box.setAttribute('role', 'button'); box.setAttribute('aria-label', 'Открыть видео со звуком: ' + label);
    v.controls = false; v.muted = true; v.loop = true;
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  }
  box.addEventListener('click', function (e) {
    if (e.target.closest('.vw__btn')) return;
    if (!box.classList.contains('vw--open')) open();
  });
  // С клавиатуры: Tab до окошка, Enter или пробел открывают видео со звуком
  box.tabIndex = 0;
  box.setAttribute('role', 'button');
  box.setAttribute('aria-label', 'Открыть видео со звуком: ' + label);
  box.addEventListener('keydown', function (e) {
    if (e.target !== box || box.classList.contains('vw--open')) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
  box.querySelector('.vw__min').addEventListener('click', shrink);
  box.querySelector('.vw__close').addEventListener('click', function () {
    v.pause(); box.remove();
  });
  document.body.appendChild(box);
})();
