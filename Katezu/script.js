(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * Settings (the same values the reference page uses)
   * ---------------------------------------------------------------- */
  var CONFIG = {
    cardWidth: 420,
    cardHeight: 600,
    gap: 16,
    cylinderRadius: 1330,
    perspective: 1200,
    maxTurn: 65,          // cards never rotate more than this, in degrees
    visibleArc: 90,       // cards beyond this angle from the centre are hidden
    opacityFalloff: 0.55,
    blurAtEdge: 6,
    darkening: 0.6,
    edgeStrength: 0.2,    // share of the width covered by each edge fade
    dragSensitivity: 1,
    stiffness: 120,
    damping: 20,
    driftSpeed: 0.15,     // cards per second
    heading: 1,           // 1 = forward, -1 = backward
    pauseOnHover: false,
    videoPlayback: 'visible' // 'visible' = every visible card, 'centre' = only the middle one
  };

  // The media sits next to the page in ./media. Title and description are optional:
  // a card without them simply shows no caption on hover.
  var ITEMS = [
    { media: 'image', src: 'media/work-13.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-1.jpg', alt: 'Платье цвета айвори с корсетом и объёмными рукавами' },
    { media: 'image', src: 'media/work-14.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'video', src: 'media/work-v1.mp4' },
    { media: 'image', src: 'media/work-15.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-2.jpg', alt: 'Невеста поправляет серьгу, платье с кружевом на рукавах' },
    { media: 'image', src: 'media/work-16.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-17.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-3.jpg', alt: 'Жемчужные пуговицы на спине свадебного платья' },
    { media: 'image', src: 'media/work-18.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-19.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-4.jpg', alt: 'Пара на прогулке, свадебное платье с открытым плечом' },
    { media: 'image', src: 'media/work-20.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-21.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-5.jpg', alt: 'Невеста в платье с накидкой в музейном коридоре' },
    { media: 'image', src: 'media/work-22.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-23.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'video', src: 'media/work-v3.mp4' },
    { media: 'image', src: 'media/work-6.jpg', alt: 'Вечернее платье из жаккарда на лестнице' },
    { media: 'image', src: 'media/work-24.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-25.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-7.jpg', alt: 'Атласное платье с открытой спиной на балконе' },
    { media: 'image', src: 'media/work-26.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-27.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-8.jpg', alt: 'Кружевной лиф и жемчужные пуговицы, крупный план' },
    { media: 'image', src: 'media/work-28.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-29.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-9.jpg', alt: 'Чёрно-белый портрет пары, платье с вышивкой и объёмными рукавами' },
    { media: 'image', src: 'media/work-30.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-31.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-10.jpg?v=3', alt: 'Невеста в многоярусном платье оглядывается на прогулке' },
    { media: 'video', src: 'media/work-v2.mp4' },
    { media: 'image', src: 'media/work-32.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-33.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-11.jpg', alt: 'Белый костюм с топом на прогулке по воде' },
    { media: 'image', src: 'media/work-34.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-35.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-12.jpg', alt: 'Невеста в лёгком платье с открытыми плечами у реки' },
    { media: 'image', src: 'media/work-36.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-37.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-38.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-39.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-40.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-41.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-42.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-43.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'video', src: 'media/work-v4.mp4' },
    { media: 'image', src: 'media/work-44.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-45.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-46.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-47.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-48.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-49.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-50.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-51.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-52.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-53.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' },
    { media: 'image', src: 'media/work-54.jpg', alt: 'Работа Katezu: свадебное и вечернее платье' }
  ];

  /* ------------------------------------------------------------------
   * Geometry. Cards sit on the outside of a cylinder and are viewed
   * through a CSS perspective. These functions hold all the maths.
   * ---------------------------------------------------------------- */
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function smoothstep(v) {
    var t = clamp(v, 0, 1);
    return t * t * (3 - 2 * t);
  }

  // Shortest signed distance on a ring of n slots, in the range (-n/2, n/2].
  function wrap(e, n) {
    var m = ((e % n) + n) % n;
    return m > n / 2 ? m - n : m;
  }

  // Scales the whole scene down so the visible part of the ring fits the viewport.
  function makeRig(size) {
    var radius = Math.max(60, CONFIG.cylinderRadius);
    var persp = Math.max(100, CONFIG.perspective);
    var cardW = Math.max(40, CONFIG.cardWidth);
    var cardH = Math.max(40, CONFIG.cardHeight);
    var gap = Math.max(0, CONFIG.gap);
    var stride = (cardW + gap) / radius;   // angle between neighbouring cards, radians
    var s = 1;

    if (size && size.w > 0 && size.h > 0) {
      var x = radius * Math.sin(stride);
      var z = radius * (Math.cos(stride) - 1);
      var zoom = persp / (persp - z);
      var needW = 2 * x * zoom + cardW * 0.9;
      var needH = cardH * 1.12;
      s = clamp(Math.min(1, size.w / needW, size.h / needH), 0.4, 1);
    }

    return { s: s, cw: cardW * s, ch: cardH * s, gap: gap * s, R: radius * s, persp: persp * s, stride: stride };
  }

  // The ring needs enough slots to cover the visible arc, in whole copies of the item list.
  function ringCount(items, stride, arc) {
    if (!items) return 0;
    var needed = Math.ceil(2 * arc * Math.PI / 180 / stride) + 3;
    return Math.ceil(Math.max(items, needed) / items) * items;
  }

  // Where one card goes, given its signed distance e (in cards) from the centre.
  // Returns null when the card is outside the visible arc.
  function place(e, rig) {
    var arc = clamp(CONFIG.visibleArc, 10, 90);
    var maxTurn = clamp(CONFIG.maxTurn, 0, 85);
    var rad = e * rig.stride;
    var deg = rad * 180 / Math.PI;
    var a = Math.abs(deg) / arc;               // 0 at the centre, 1 at the edge of the arc
    if (a >= 1) return null;

    var edgeFade = a > 0.72 ? 1 - smoothstep((a - 0.72) / 0.28) : 1;
    return {
      x: rig.R * Math.sin(rad),
      z: rig.R * (Math.cos(rad) - 1),
      turn: clamp(deg, -maxTurn, maxTurn),
      alpha: clamp(1 - CONFIG.opacityFalloff * a, 0, 1) * edgeFade,
      blur: CONFIG.blurAtEdge * Math.pow(a, 1.3) * rig.s,
      dim: clamp(CONFIG.darkening * a, 0, 1),
      layer: 500 - Math.round(Math.abs(e) * 20)
    };
  }

  // Lets the maths be checked from node without a browser.
  if (typeof document === 'undefined') {
    if (typeof module !== 'undefined') {
      module.exports = { CONFIG: CONFIG, ITEMS: ITEMS, clamp: clamp, smoothstep: smoothstep, wrap: wrap, makeRig: makeRig, ringCount: ringCount, place: place };
    }
    return;
  }

  /* ------------------------------------------------------------------
   * DOM
   * ---------------------------------------------------------------- */
  var root = document.getElementById('carousel');
  var itemCount = ITEMS.length;
  var count = ringCount(itemCount, makeRig(null).stride, clamp(CONFIG.visibleArc, 10, 90));

  root.setAttribute('role', 'region');
  root.setAttribute('aria-roledescription', 'carousel');
  root.setAttribute('aria-label', 'Card carousel');

  var ring = document.createElement('div');
  ring.className = 'arc-ring';
  root.appendChild(ring);

  var plates = [];   // card elements
  var dims = [];     // darkening layers
  var videos = [];   // video elements (or null)

  function buildPlate(n) {
    var item = ITEMS[n % itemCount];
    var plate = document.createElement('div');
    plate.className = 'arc-plate';
    plate.setAttribute('role', item.link ? 'link' : 'button');
    plate.tabIndex = -1;
    plate.setAttribute('aria-hidden', 'true');
    var label = [item.title, item.description].filter(Boolean).join(', ') || item.alt || ('Card ' + (n % itemCount + 1));
    plate.setAttribute('aria-label', label + (item.link ? ' (opens in a new tab)' : ', bring to centre'));

    var media, video = null;
    if (item.media === 'video') {
      video = media = document.createElement('video');
      media.src = item.src + '#t=0.001';   // makes browsers show the first frame before playing
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      media.preload = 'metadata';
      media.disablePictureInPicture = true;
      media.setAttribute('aria-hidden', 'true');
      media.tabIndex = -1;
    } else {
      media = document.createElement('img');
      media.src = item.src;
      if (item.srcset) media.srcset = item.srcset;
      media.alt = item.alt || '';
      media.draggable = false;
      media.loading = 'lazy';
    }
    media.className = 'arc-media';
    plate.appendChild(media);

    var dim = document.createElement('div');
    dim.className = 'arc-dim';
    plate.appendChild(dim);

    if (item.title || item.description) {
      var veil = document.createElement('div');
      veil.className = 'arc-veil';
      if (item.title) {
        var title = document.createElement('div');
        title.className = 'arc-title';
        title.textContent = item.title;
        veil.appendChild(title);
      }
      if (item.description) {
        var desc = document.createElement('div');
        desc.className = 'arc-desc';
        desc.textContent = item.description;
        veil.appendChild(desc);
      }
      plate.appendChild(veil);
    }

    plate.addEventListener('click', function () {
      if (!ITEMS[n % itemCount].link && Math.abs(wrap(n - st.pos, count)) < 0.5) openZoom(n);
      else bringToCentre(n);
    });
    plate.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        bringToCentre(n);
      }
    });

    ring.appendChild(plate);
    plates[n] = plate;
    dims[n] = dim;
    videos[n] = video;
  }

  for (var n = 0; n < count; n++) buildPlate(n);

  ['left', 'right'].forEach(function (side) {
    var edge = document.createElement('div');
    edge.className = 'arc-edge arc-edge-' + side;
    edge.style.width = (CONFIG.edgeStrength * 100) + '%';
    edge.setAttribute('aria-hidden', 'true');
    root.appendChild(edge);
  });

  /* ------------------------------------------------------------------
   * State
   * ---------------------------------------------------------------- */
  var rig = makeRig(null);
  var st = {
    pos: 0,            // current position, measured in cards
    vel: 0,            // velocity in cards per second
    aim: null,         // spring target (whole number of cards), or null
    wheelHold: false,
    grabbed: false,
    lastTouch: 0,
    lastT: 0,
    raf: 0
  };

  var calm = false;        // user prefers reduced motion
  var inView = true;
  var tabVisible = document.visibilityState !== 'hidden';
  var hovering = false;
  var pending = null;      // pointer gesture that may become a drag
  var suppressClick = false;
  var wheelTimer = 0;

  function isVisible() { return inView && tabVisible; }

  /* ------------------------------------------------------------------
   * Rendering
   * ---------------------------------------------------------------- */
  function applySize() {
    var size = { w: root.clientWidth, h: root.clientHeight };
    rig = makeRig(size);
    root.style.setProperty('--s', rig.s.toFixed(4));
    ring.style.perspective = rig.persp.toFixed(2) + 'px';
    for (var i = 0; i < count; i++) {
      plates[i].style.width = rig.cw.toFixed(2) + 'px';
      plates[i].style.height = rig.ch.toFixed(2) + 'px';
    }
  }

  function render() {
    var live = isVisible() && !calm;

    for (var i = 0; i < count; i++) {
      var plate = plates[i];
      var e = wrap(i - st.pos, count);
      var p = place(e, rig);
      var video = videos[i];

      if (video) {
        var want = live;   // videos always play in a loop, even when they are not the front card
        if (want && !video.__want) {
          video.__want = true;
          var played = video.play();
          if (played && played.catch) {
            // The browser may refuse to autoplay; forget the request so it is retried later.
            played.catch((function (v) { return function () { v.__want = false; }; })(video));
          }
        } else if (!want && video.__want) {
          video.__want = false;
          video.pause();
        }
      }

      if (!p) {
        if (plate.style.visibility !== 'hidden') {
          plate.style.visibility = 'hidden';
          plate.style.opacity = '0';
          plate.style.pointerEvents = 'none';
          plate.tabIndex = -1;
          plate.setAttribute('aria-hidden', 'true');
        }
        continue;
      }

      plate.style.visibility = 'visible';
      plate.style.opacity = p.alpha.toFixed(4);
      plate.style.transform =
        'translate(-50%, -50%) translate3d(' + p.x.toFixed(2) + 'px, 0px, ' + p.z.toFixed(2) + 'px) rotateY(' + p.turn.toFixed(3) + 'deg)';
      plate.style.zIndex = String(p.layer);
      plate.style.filter = p.blur > 0.05 ? 'blur(' + p.blur.toFixed(2) + 'px)' : 'none';

      var usable = p.alpha > 0.18;
      plate.style.pointerEvents = usable ? 'auto' : 'none';
      plate.tabIndex = usable ? 0 : -1;
      if (usable) plate.removeAttribute('aria-hidden'); else plate.setAttribute('aria-hidden', 'true');

      dims[i].style.opacity = p.dim.toFixed(4);
    }
  }

  // Back to a clean, settled state (used when the carousel leaves the screen).
  function settle() {
    st.grabbed = false;
    st.wheelHold = false;
    st.vel = 0;
    st.pos = Math.round(st.aim === null ? st.pos : st.aim);
    st.aim = null;
    st.lastT = 0;
    pending = null;
    render();
  }

  /* ------------------------------------------------------------------
   * Animation loop: spring towards a target, or slow drift when idle
   * ---------------------------------------------------------------- */
  function tick(now) {
    st.raf = 0;
    if (!isVisible()) { settle(); return; }

    var dt = Math.min(0.05, st.lastT ? (now - st.lastT) / 1000 : 1 / 60);
    st.lastT = now;
    var animating = false;

    if (st.grabbed) {
      animating = true;
    } else if (st.aim !== null) {
      var h = dt / 4;
      for (var k = 0; k < 4; k++) {
        var acc = CONFIG.stiffness * (st.aim - st.pos) - CONFIG.damping * st.vel;
        st.vel += acc * h;
        st.pos += st.vel * h;
      }
      if (Math.abs(st.aim - st.pos) < 8e-4 && Math.abs(st.vel) < 0.003) {
        st.pos = st.aim;
        st.vel = 0;
        if (!st.wheelHold) st.aim = null;
      } else {
        animating = true;
      }
    } else if (!calm) {
      var idle = now - st.lastTouch > 1400 && !(CONFIG.pauseOnHover && hovering);
      if (idle) st.pos += CONFIG.heading * CONFIG.driftSpeed * dt;
      animating = true;
    }

    if (!calm) animating = true;   // keep drifting
    render();

    if (animating) st.raf = requestAnimationFrame(tick);
    else st.lastT = 0;
  }

  function kick() {
    if (st.raf || !isVisible()) return;
    st.lastT = 0;
    st.raf = requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------
   * Interaction
   * ---------------------------------------------------------------- */
  // Tap on the centre card: show it 70% larger than on the page, tap again to close.
  function openZoom(n) {
    var plate = plates[n], src = plate.querySelector('.arc-media');
    var r = plate.getBoundingClientRect();
    var small = window.matchMedia && window.matchMedia('(max-width: 820px)').matches;
    var z = small ? 1.87 : 1.7;      // phones: 10% more than on a computer
    var w = r.width * z, h = r.height * z;
    var k = Math.min(1, (window.innerWidth - 16) / w, (window.innerHeight - 16) / h);
    var el = src.tagName === 'VIDEO' ? document.createElement('video') : document.createElement('img');
    el.src = src.currentSrc || src.src;
    if (el.tagName === 'VIDEO') { el.muted = true; el.loop = true; el.playsInline = true; el.autoplay = true; }
    el.style.width = (w * k) + 'px';
    el.style.height = (h * k) + 'px';
    var box = document.createElement('div');
    box.className = 'zoom';
    var wrapEl = document.createElement('div');
    wrapEl.className = 'zoom-frame';
    wrapEl.style.width = el.style.width;
    wrapEl.style.height = el.style.height;
    el.style.width = '100%';
    el.style.height = '100%';
    wrapEl.appendChild(el);
    var x = document.createElement('button');
    x.type = 'button';
    x.className = 'zoom-x';
    x.setAttribute('aria-label', 'Закрыть');
    x.innerHTML = '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/></svg>';
    wrapEl.appendChild(x);
    box.appendChild(wrapEl);
    document.body.appendChild(box);
    requestAnimationFrame(function () { box.classList.add('on'); });
    function close() {
      box.classList.remove('on');
      setTimeout(function () { box.remove(); }, 240);
      window.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    box.addEventListener('click', close);
    window.addEventListener('keydown', onKey);
  }

  // If the browser refused to autoplay a video, try again on the first touch, click or scroll.
  function retryVideos() {
    var again = false;
    for (var i = 0; i < count; i++) {
      if (videos[i] && videos[i].paused) { videos[i].__want = false; again = true; }
    }
    if (again) render();
  }
  ['touchstart', 'pointerdown', 'scroll', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, retryVideos, { passive: true });
  });

  function bringToCentre(n) {
    if (ITEMS[n % itemCount].link) {
      window.open(ITEMS[n % itemCount].link, '_blank', 'noopener,noreferrer');
      return;
    }
    st.aim = Math.round(st.pos + wrap(n - st.pos, count));
    st.wheelHold = false;
    st.lastTouch = performance.now();
    kick();
  }

  function step(delta) {
    st.aim = Math.round(st.aim === null ? st.pos : st.aim) + delta;
    st.wheelHold = false;
    st.lastTouch = performance.now();
    kick();
  }

  function onMove(e) {
    if (!pending) return;
    var dx = e.clientX - pending.x0;
    var unit = rig.cw + rig.gap;

    if (!pending.moved) {
      if (Math.abs(dx) < 6) return;   // small movements are still a click
      pending.moved = true;
      st.grabbed = true;
      st.aim = null;
      st.wheelHold = false;
      st.vel = 0;
      pending.pos0 = st.pos + dx / unit * CONFIG.dragSensitivity;
      root.style.cursor = 'grabbing';
      kick();
    }

    st.pos = pending.pos0 - dx / unit * CONFIG.dragSensitivity;

    var t = performance.now();
    var dt = (t - pending.tPrev) / 1000;
    if (dt > 0) {
      var inst = -(e.clientX - pending.xPrev) / unit * CONFIG.dragSensitivity / dt;
      st.vel = st.vel * 0.55 + inst * 0.45;   // smoothed release speed
    }
    pending.xPrev = e.clientX;
    pending.tPrev = t;
  }

  function onUp() {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);

    var g = pending;
    pending = null;
    if (!g || !g.moved) return;

    suppressClick = true;
    setTimeout(function () { suppressClick = false; }, 80);

    var now = performance.now();
    if (now - g.tPrev > 90) st.vel = 0;   // held still before letting go: no fling
    st.grabbed = false;

    // Fling: coast a little further, then land on a whole card.
    var fling = clamp(st.vel, -24, 24);
    st.aim = Math.round(st.pos + fling * 0.32);
    st.lastTouch = now;
    root.style.cursor = 'grab';
    kick();
  }

  root.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pending = { x0: e.clientX, xPrev: e.clientX, tPrev: performance.now(), pos0: st.pos, moved: false };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  });

  // A drag must not end in an accidental click on the card underneath.
  root.addEventListener('click', function (e) {
    if (suppressClick) {
      suppressClick = false;
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);

  root.addEventListener('dragstart', function (e) { e.preventDefault(); });

  root.addEventListener('wheel', function (e) {
    // Only sideways swipes turn the carousel; vertical scrolling moves the page to the text below.
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    var d = e.deltaX;
    if (e.deltaMode === 1) d *= 16; else if (e.deltaMode === 2) d *= 400;

    var base = st.aim === null ? st.pos : st.aim;
    st.aim = clamp(base + d / (rig.cw + rig.gap) * 0.8, st.pos - 6, st.pos + 6);
    st.wheelHold = true;
    st.lastTouch = performance.now();

    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(function () {
      st.wheelHold = false;
      st.aim = Math.round(st.aim === null ? st.pos : st.aim);
      st.lastTouch = performance.now();
      kick();
    }, 150);
    kick();
  }, { passive: false });

  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });

  root.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hovering = true; });
  root.addEventListener('pointerleave', function (e) {
    if (e.pointerType === 'mouse') {
      hovering = false;
      st.lastTouch = performance.now() - 900;   // resume drifting shortly after the cursor leaves
    }
  });

  /* ------------------------------------------------------------------
   * Environment: size, visibility, reduced motion
   * ---------------------------------------------------------------- */
  function resized() { applySize(); render(); }

  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resized).observe(root);
  window.addEventListener('resize', resized);

  if (typeof IntersectionObserver !== 'undefined') {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { inView = en.isIntersecting; });
      isVisible() ? kick() : settle();
    }, { threshold: 0 }).observe(root);
  }

  document.addEventListener('visibilitychange', function () {
    tabVisible = document.visibilityState !== 'hidden';
    isVisible() ? kick() : settle();
  });

  var mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq) {
    var onMq = function () { calm = mq.matches; render(); kick(); };
    onMq();
    if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);
  }

  applySize();
  render();
  kick();
})();
