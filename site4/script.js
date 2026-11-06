(function () {
  'use strict';

  var CDN_IMG = 'https://framerusercontent.com/images/';
  var CDN_VID = 'https://framerusercontent.com/assets/';

  // The product is the first card. It is larger than the rest (see --hero in style.css)
  // and takes more room along the arc, so its neighbours do not overlap it.
  var HERO_SLOT = 1.25;   // room along the arc, in "cards"

  var people = [
    { name: 'Mara Okafor',   role: 'Creative Director',  tagline: 'Leads brand and campaign vision',           img: 'KbhZ8TSifLt6oom0DJy3I6dtRk.png' },
    { name: 'Nora Vance',    role: 'UX Researcher',      tagline: 'Listens first, then shapes the product',    vid: 'NN6Lx6k4t7M9vGURDbnyq40sQ.mp4' },
    { name: 'Julian Reyes',  role: 'Lead Engineer',      tagline: 'Builds fast, reliable front-end systems',   img: 'xUSdDKegY1epCfmV1Z59ievg1LI.png' },
    { name: 'Kai Nakamura',  role: 'Motion Designer',    tagline: 'Crafts transitions that feel alive',        vid: 'evzABRU4WEqu8p0fD9C5sDiGY9s.mp4' },
    { name: 'Iris Calder',   role: 'Brand Strategist',   tagline: 'Finds the story behind each name',          img: 'tMsaCZMLrhptj9Km3aVihdywnlw.jpg' },
    { name: 'Lena Moreau',   role: 'Art Director',       tagline: 'Sets the visual tone for every launch',     img: 'FnA0lOktORlmJAnlNebTalpe6ZM.png' },
    { name: 'Sofia Lind',    role: 'Content Lead',       tagline: 'Writes words people actually remember',     vid: 'roSTU06jbgGlsYXGIPH26maBtQQ.mp4' },
    { name: 'Amara Diallo',  role: 'Head of Operations', tagline: 'Keeps every project on rhythm',             img: 'HKrd4wmSAWqLUZ2RqMnQJF5bxw.jpg' },
    { name: 'Elias Hart',    role: 'Photographer',       tagline: 'Captures light, texture and quiet moments', vid: 'kGZt3pMAG52JXRenq65ma0fZw.mp4' },
    { name: 'Theo Brandt',   role: 'Product Designer',   tagline: 'Turns rough ideas into clear interfaces',   img: 'bw0gFHiTF8Q4IDcQFWSfWh6pyg.png' }
  ];

  var products = [
    { name: 'Краскопистолет HVLP с верхним бачком', sku: 'HVLP-20418',
      spec: 'Сопло 1,4 мм · бачок 600 мл · давление 2–3 бар', price: '8 400 руб.', src: 'images/hvlp.jpg' },
    { name: 'Блок подготовки воздуха со спиральным шлангом', sku: 'AIR-31760',
      spec: 'Фильтр-регулятор и маслёнка · манометр 0–10 бар', price: '5 200 руб.', src: 'images/air-unit.jpg' },
    { name: 'Респиратор-полумаска со сменными фильтрами', sku: 'RSP-52907',
      spec: 'Фильтры A1P2 · силиконовый обтюратор', price: '3 700 руб.', src: 'images/respirator.jpg' }
  ];

  // Text for the four video cards, in order.
  var videoInfo = [
    { name: 'Краскопистолет SATA mini для подкраски', sku: 'MIN-60215',
      spec: 'Сопло 1,0 мм · бачок 125 мл · расход воздуха 130 л/мин', price: '6 900 руб.' },
    { name: 'Набор сопел и игл для краскопистолета', sku: 'NZL-74392',
      spec: 'Комплекты 1,3 / 1,4 / 1,8 мм · нержавеющая сталь', price: '2 300 руб.' },
    { name: 'Одноразовые бачки для краски, 600 мл', sku: 'CUP-83051',
      spec: 'Набор 50 шт · адаптеры в комплекте', price: '1 850 руб.' },
    { name: 'Набор для чистки краскопистолетов', sku: 'CLN-19846',
      spec: '12 предметов · щётки, иглы, смазка', price: '1 450 руб.' }
  ];

  var items = [
    { hero: true, name: 'Краскопистолет SATA HRS с нижним бачком', sku: 'HRS-48213',
      spec: 'Макс. давление 10 бар / 145 psi', price: '12 900 руб.', src: 'images/sata-hrs-card.jpg' }
  ].concat(products, people.filter(function (p) { return !!p.vid; }).map(function (p, i) {
    var d = videoInfo[i];
    return { name: d.name, sku: d.sku, spec: d.spec, price: d.price, video: true, src: CDN_VID + p.vid };
  }));

  var N = items.length;

  var stage = document.getElementById('stage');
  var track = document.getElementById('catalog');
  var carousel = document.getElementById('carousel');
  var header = document.getElementById('header');
  var nameEl = document.getElementById('name');
  var skuEl = document.getElementById('sku');
  var specEl = document.getElementById('spec');
  var priceEl = document.getElementById('price');

  var mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduceMotion = !!(mq && mq.matches);

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function mod(a, n) { return ((a % n) + n) % n; }
  function wrapTo(x, n) { var m = mod(x, n); return m > n / 2 ? m - n : m; }

  /* ------------------------------------------------------------------
   * Cards
   * ---------------------------------------------------------------- */
  var cards = items.map(function (it) {
    var el = document.createElement('div');
    el.className = 'card' + (it.hero ? ' card--hero' : '');
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', it.name);

    var media;
    if (it.video) {
      media = document.createElement('video');
      media.src = it.src;
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      media.preload = 'metadata';
      media.setAttribute('aria-hidden', 'true');
    } else {
      media = document.createElement('img');
      media.src = it.src;
      media.alt = it.name;
      media.loading = it.hero ? 'eager' : 'lazy';
      media.draggable = false;
    }
    el.appendChild(media);
    stage.appendChild(el);
    return { el: el, media: media, isVideo: !!it.video, playing: false };
  });

  /* ------------------------------------------------------------------
   * Layout along the arc. Each card takes a "slot" (1 card wide, the
   * product takes more), so the centre card can be bigger without
   * crowding its neighbours.
   * ---------------------------------------------------------------- */
  var slot = items.map(function (it) { return it.hero ? HERO_SLOT : 1; });
  var ringLength = slot.reduce(function (a, b) { return a + b; }, 0);
  var centre = [];
  (function () {
    var acc = 0;
    slot.forEach(function (w, i) { centre[i] = acc + w / 2; acc += w; });
  })();

  // Where the "focus" sits along the ring for a fractional card position.
  function focusAt(pos) {
    var base = Math.floor(pos);
    var t = pos - base;
    var c0 = centre[mod(base, N)];
    var c1 = centre[mod(base + 1, N)];
    if (c1 < c0) c1 += ringLength;   // stepping from the last card back to the first
    return c0 + (c1 - c0) * t;
  }

  /* ------------------------------------------------------------------
   * State. The page scroll position is the single source of truth:
   * `target` follows it, `offset` eases towards `target`.
   * ---------------------------------------------------------------- */
  var offset = 0;       // eased position, in card units
  var target = 0;       // position the scroll asks for
  var raf = 0;
  var shownIndex = -1;
  var dir = 1;          // last scroll direction
  var lastY = 0;
  var settleTimer = 0;
  var drag = null;
  var dragging = false;

  function scrollYNow() {
    return window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  // Infinite scroll: the track holds several identical "laps" of the carousel and
  // the page is silently moved back to the middle lap, so there is no last card.
  var LAPS = 5;
  var step = 300;                       // scroll distance per card, px (set in layout)
  function lapPx() { return N * step; }
  function travel() { return LAPS * lapPx(); }

  function posFromScroll() { return scrollYNow() / step; }
  function scrollForItem(i) { return i * step; }

  // Move the page by whole laps; the picture does not change.
  function recentre(force) {
    var lap = lapPx(), y = scrollYNow();
    var shift = 0;
    var lo = lap * (force ? 1.5 : 0.6), hi = lap * (force ? 3.5 : 4.4);
    if (y < lo) shift = Math.ceil((lo - y) / lap) * lap;
    else if (y > hi) shift = -Math.ceil((y - hi) / lap) * lap;
    if (!shift) return;
    window.scrollTo(0, y + shift);
    lastY = y + shift;
    offset += shift / step;
    target += shift / step;
  }

  function scrollToY(y, smooth) {
    window.scrollTo({ top: y, behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
  }

  function setCaption(i) {
    if (i === shownIndex) return;
    shownIndex = i;
    nameEl.textContent = items[i].name;
    skuEl.textContent = 'Артикул: ' + items[i].sku;
    specEl.textContent = items[i].spec;
    priceEl.textContent = 'Цена: ' + items[i].price;
  }

  function render() {
    var w = stage.clientWidth;
    var R = Math.max(w * 0.85, 640);   // arc radius
    var STEP = 0.2;                    // tilt per card, radians
    var STEP_X = 0.2;                  // spacing per card along the arc, same as site2
    var f = focusAt(offset);

    for (var i = 0; i < N; i++) {
      var c = cards[i];
      var d = wrapTo(centre[i] - f, ringLength);
      var ad = Math.abs(d);
      var angle = d * STEP;

      if (ad > 4.6) {
        c.el.style.visibility = 'hidden';
        if (c.isVideo && c.playing) { c.media.pause(); c.playing = false; }
        continue;
      }

      var x = Math.sin(d * STEP_X) * R;
      var y = (1 - Math.cos(angle)) * R * 0.55;
      var scale = Math.max(0.55, 1 - ad * 0.07);
      var opacity = ad > 3.6 ? Math.max(0, 1 - (ad - 3.6)) : 1;

      c.el.style.visibility = 'visible';
      c.el.style.opacity = opacity.toFixed(3);
      c.el.style.zIndex = String(100 - Math.round(ad * 10));
      c.el.style.transform =
        'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) ' +
        'rotate(' + angle.toFixed(4) + 'rad) scale(' + scale.toFixed(3) + ')';

      if (c.isVideo) {
        var near = ad <= 2.5;
        if (near && !c.playing) {
          c.playing = true;
          var pr = c.media.play();
          if (pr && pr.catch) pr.catch(function () {});
        } else if (!near && c.playing) {
          c.media.pause();
          c.playing = false;
        }
      }
    }

    setCaption(mod(Math.round(offset), N));
  }

  function tick() {
    raf = 0;
    var diff = target - offset;
    if (reduceMotion || Math.abs(diff) < 0.0008) {
      offset = target;
      render();
      return;
    }
    offset += diff * 0.14;
    render();
    raf = requestAnimationFrame(tick);
  }

  function kick() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------
   * Scroll drives the carousel; when scrolling stops it settles
   * exactly on a card, leaning in the direction the user was going.
   * ---------------------------------------------------------------- */
  function settle() {
    var p = posFromScroll();
    var idx = dir > 0 ? Math.ceil(p - 0.08) : Math.floor(p + 0.08);
    var y = scrollForItem(idx);
    if (Math.abs(y - scrollYNow()) > 1) scrollToY(y, true);
    else recentre(true);
  }

  function onScroll() {
    var y = scrollYNow();
    if (y !== lastY) {
      dir = y > lastY ? 1 : -1;
      lastY = y;
    }
    recentre(false);
    target = posFromScroll();
    kick();
    if (!dragging) {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, 140);
    }
  }

  function go(delta) {
    var i = Math.round(posFromScroll()) + delta;
    dir = delta;
    scrollToY(scrollForItem(i), true);
  }

  /* ------------------------------------------------------------------
   * Layout: pin height under the header, size the scroll track
   * ---------------------------------------------------------------- */
  function layout() {
    document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
    var oldPos = posFromScroll(), hadLayout = !!track.style.height;
    var oldStep = step;
    step = clamp(window.innerHeight * 0.38, 240, 420);
    track.style.height = (carousel.offsetHeight + travel()) + 'px';
    // keep the same card in the centre after a resize; first time, start on lap 3 (the product)
    var pos = hadLayout ? oldPos * oldStep / oldStep : 2 * N;
    window.scrollTo(0, Math.round(pos * step));
    lastY = scrollYNow();
    target = posFromScroll();
    offset = target;
    render();
  }

  /* ------------------------------------------------------------------
   * Controls
   * ---------------------------------------------------------------- */
  // Dragging sideways moves the page scroll, so everything stays in sync.
  stage.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    var hit = e.target.closest ? e.target.closest('.card') : null;
    drag = { x0: e.clientX, y0: scrollYNow(), moved: false, id: e.pointerId, card: hit };
  });

  stage.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x0;
    if (!drag.moved) {
      if (Math.abs(dx) < 6) return;   // small movements are not a drag
      drag.moved = true;
      dragging = true;
      clearTimeout(settleTimer);
      stage.classList.add('dragging');
      try { stage.setPointerCapture(drag.id); } catch (err) { /* not supported */ }
    }
    var unit = Math.max(stage.clientWidth * 0.17, 110);   // pixels per card
    scrollToY(drag.y0 - dx / unit * step, false);
  });

  function endDrag() {
    if (!drag) return;
    var moved = drag.moved, hit = drag.card;
    drag = null;
    if (!moved) {
      // A plain click on a card brings it to the centre.
      var k = cards.map(function (c) { return c.el; }).indexOf(hit);
      if (k >= 0) {
        var p = Math.round(posFromScroll());
        var diff = wrapTo(k - mod(p, N), N);
        if (diff) { dir = diff > 0 ? 1 : -1; scrollToY(scrollForItem(p + diff), true); }
      }
      return;
    }
    dragging = false;
    stage.classList.remove('dragging');
    settle();
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  // Sideways trackpad swipes scroll the page, so they move the carousel too.
  stage.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      window.scrollBy(0, e.deltaX);
    }
  }, { passive: false });

  stage.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); go(-1); }
  });

  document.getElementById('next').addEventListener('click', function () { go(1); });
  document.getElementById('prev').addEventListener('click', function () { go(-1); });

  Array.prototype.forEach.call(document.querySelectorAll('.chip'), function (chip) {
    chip.addEventListener('click', function () {
      Array.prototype.forEach.call(document.querySelectorAll('.chip'), function (c) {
        c.classList.toggle('is-active', c === chip);
        c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
      });
    });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', layout);
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(layout).observe(header);

  if (mq) {
    var onMq = function () { reduceMotion = mq.matches; };
    if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);
  }

  try { history.scrollRestoration = 'manual'; } catch (err) { /* ignore */ }
  layout();
})();
