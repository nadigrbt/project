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

  var IMG = 'https://framerusercontent.com/images/';
  var VID = 'https://framerusercontent.com/assets/';

  var ITEMS = [
    { media: 'image', title: 'Mara Okafor', description: 'Creative Director — leads brand and campaign vision',
      src: IMG + 'KbhZ8TSifLt6oom0DJy3I6dtRk.png?width=800&height=1200',
      srcset: IMG + 'KbhZ8TSifLt6oom0DJy3I6dtRk.png?scale-down-to=1024&width=800&height=1200 682w, ' + IMG + 'KbhZ8TSifLt6oom0DJy3I6dtRk.png?width=800&height=1200 800w' },
    { media: 'video', title: 'Nora Vance', description: 'UX Researcher — listens first, then shapes the product',
      src: VID + 'NN6Lx6k4t7M9vGURDbnyq40sQ.mp4' },
    { media: 'image', title: 'Julian Reyes', description: 'Lead Engineer — builds fast, reliable front-end systems',
      src: IMG + 'xUSdDKegY1epCfmV1Z59ievg1LI.png?width=1536&height=2048',
      srcset: IMG + 'xUSdDKegY1epCfmV1Z59ievg1LI.png?scale-down-to=1024&width=1536&height=2048 768w, ' + IMG + 'xUSdDKegY1epCfmV1Z59ievg1LI.png?width=1536&height=2048 1536w' },
    { media: 'video', title: 'Kai Nakamura', description: 'Motion Designer — crafts transitions that feel alive',
      src: VID + 'evzABRU4WEqu8p0fD9C5sDiGY9s.mp4' },
    { media: 'image', title: 'Iris Calder', description: 'Brand Strategist — finds the story behind each name',
      src: IMG + 'tMsaCZMLrhptj9Km3aVihdywnlw.jpg?width=600&height=749',
      srcset: IMG + 'tMsaCZMLrhptj9Km3aVihdywnlw.jpg?width=600&height=749 600w' },
    { media: 'image', title: 'Lena Moreau', description: 'Art Director — sets the visual tone for every launch',
      src: IMG + 'FnA0lOktORlmJAnlNebTalpe6ZM.png?width=1796&height=2400',
      srcset: IMG + 'FnA0lOktORlmJAnlNebTalpe6ZM.png?scale-down-to=1024&width=1796&height=2400 766w, ' + IMG + 'FnA0lOktORlmJAnlNebTalpe6ZM.png?scale-down-to=2048&width=1796&height=2400 1532w, ' + IMG + 'FnA0lOktORlmJAnlNebTalpe6ZM.png?width=1796&height=2400 1796w' },
    { media: 'video', title: 'Sofia Lind', description: 'Content Lead — writes words people actually remember',
      src: VID + 'roSTU06jbgGlsYXGIPH26maBtQQ.mp4' },
    { media: 'image', title: 'Amara Diallo', description: 'Head of Operations — keeps every project on rhythm',
      src: IMG + 'HKrd4wmSAWqLUZ2RqMnQJF5bxw.jpg?width=736&height=915',
      srcset: IMG + 'HKrd4wmSAWqLUZ2RqMnQJF5bxw.jpg?width=736&height=915 736w' },
    { media: 'video', title: 'Elias Hart', description: 'Photographer — captures light, texture and quiet moments',
      src: VID + 'kGZt3pMAG52JXRenq65ma0fZw.mp4' },
    { media: 'image', title: 'Theo Brandt', description: 'Product Designer — turns rough ideas into clear interfaces',
      src: IMG + 'bw0gFHiTF8Q4IDcQFWSfWh6pyg.png?width=1796&height=2400',
      srcset: IMG + 'bw0gFHiTF8Q4IDcQFWSfWh6pyg.png?scale-down-to=1024&width=1796&height=2400 766w, ' + IMG + 'bw0gFHiTF8Q4IDcQFWSfWh6pyg.png?scale-down-to=2048&width=1796&height=2400 1532w, ' + IMG + 'bw0gFHiTF8Q4IDcQFWSfWh6pyg.png?width=1796&height=2400 1796w' }
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
    plate.setAttribute('aria-label', item.title + ', ' + item.description + (item.link ? ' (opens in a new tab)' : ', bring to centre'));

    var media, video = null;
    if (item.media === 'video') {
      video = media = document.createElement('video');
      media.src = item.src;
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
      media.alt = '';
      media.draggable = false;
      media.loading = 'lazy';
    }
    media.className = 'arc-media';
    plate.appendChild(media);

    var dim = document.createElement('div');
    dim.className = 'arc-dim';
    plate.appendChild(dim);

    var veil = document.createElement('div');
    veil.className = 'arc-veil';
    var title = document.createElement('div');
    title.className = 'arc-title';
    title.textContent = item.title;
    var desc = document.createElement('div');
    desc.className = 'arc-desc';
    desc.textContent = item.description;
    veil.appendChild(title);
    veil.appendChild(desc);
    plate.appendChild(veil);

    plate.addEventListener('click', function () { bringToCentre(n); });
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
        var want = live && !!p && p.alpha > 0.05 && (CONFIG.videoPlayback === 'visible' || Math.abs(e) < 0.5);
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
    e.preventDefault();
    var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
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
