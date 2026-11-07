(function () {
  var CDN_IMG = "https://framerusercontent.com/images/";
  var CDN_VID = "https://framerusercontent.com/assets/";

  var people = [
    { name: "Надежда Горбатенко", role: "AI/digital creator", tagline: "Создаёт цифровые образы с помощью нейросетей",           img: "KbhZ8TSifLt6oom0DJy3I6dtRk.png" },
    { name: "Виктория Соколова", role: "UX-исследователь", tagline: "Сначала слушает, потом проектирует продукт",    vid: "NN6Lx6k4t7M9vGURDbnyq40sQ.mp4" },
    { name: "Артём Лебедев", role: "Ведущий инженер", tagline: "Строит быстрые и надёжные интерфейсы",   img: "xUSdDKegY1epCfmV1Z59ievg1LI.png" },
    { name: "Кирилл Назаров", role: "Моушн-дизайнер", tagline: "Делает переходы, которые оживают",        vid: "evzABRU4WEqu8p0fD9C5sDiGY9s.mp4" },
    { name: "Ирина Калинина", role: "Бренд-стратег", tagline: "Находит историю за каждым именем",          img: "tMsaCZMLrhptj9Km3aVihdywnlw.jpg" },
    { name: "Елена Морозова", role: "Арт-директор", tagline: "Задаёт визуальный тон каждого запуска",     img: "FnA0lOktORlmJAnlNebTalpe6ZM.png" },
    { name: "Софья Линдт", role: "Контент-редактор", tagline: "Пишет тексты, которые запоминаются",     vid: "roSTU06jbgGlsYXGIPH26maBtQQ.mp4" },
    { name: "Амина Дьяконова", role: "Руководитель операций", tagline: "Держит ритм каждого проекта",             img: "HKrd4wmSAWqLUZ2RqMnQJF5bxw.jpg" },
    { name: "Илья Харитонов", role: "Фотограф", tagline: "Ловит свет, фактуру и тихие моменты", vid: "kGZt3pMAG52JXRenq65ma0fZw.mp4" },
    { name: "Фёдор Брандт", role: "Продуктовый дизайнер", tagline: "Превращает наброски в понятные интерфейсы",   img: "bw0gFHiTF8Q4IDcQFWSfWh6pyg.png" }
  ];

  var N = people.length;
  var stage = document.getElementById("stage");
  var nameEl = document.getElementById("name");
  var roleEl = document.getElementById("role");
  var taglineEl = document.getElementById("tagline");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Build cards
  var cards = people.map(function (p) {
    var el = document.createElement("div");
    el.className = "card";
    el.setAttribute("role", "group");
    el.setAttribute("aria-label", p.name + ", " + p.role);

    var media;
    if (p.vid) {
      media = document.createElement("video");
      media.src = CDN_VID + p.vid;
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      media.preload = "metadata";
      media.setAttribute("aria-hidden", "true");
    } else {
      media = document.createElement("img");
      media.src = CDN_IMG + p.img;
      media.alt = p.name;
      media.loading = "lazy";
      media.draggable = false;
    }
    el.appendChild(media);
    stage.appendChild(el);
    return { el: el, media: media, isVideo: !!p.vid, playing: false };
  });

  // Carousel state
  var offset = 0;        // current (smoothed) position, in card units
  var target = 0;        // where we are heading
  var auto = !reduceMotion;
  var dragging = false;
  var lastX = 0;
  var resumeTimer = null;
  var shownIndex = -1;

  function wrap(d) {
    return ((d + N / 2) % N + N) % N - N / 2;
  }

  function pause(ms) {
    auto = false;
    clearTimeout(resumeTimer);
    if (!reduceMotion) {
      resumeTimer = setTimeout(function () { auto = true; }, ms || 2500);
    }
  }

  function setCaption(i) {
    if (i === shownIndex) return;
    shownIndex = i;
    var p = people[i];
    nameEl.textContent = p.name;
    roleEl.textContent = p.role;
    taglineEl.textContent = p.tagline;
  }

  function render() {
    var w = stage.clientWidth;
    var R = Math.max(w * 0.85, 640);   // arc radius
    var STEP = 0.2;                    // radians between neighbours

    for (var i = 0; i < N; i++) {
      var c = cards[i];
      var d = wrap(i - offset);
      var ad = Math.abs(d);
      var angle = d * STEP;

      if (ad > 4.6) {
        c.el.style.visibility = "hidden";
        if (c.isVideo && c.playing) { c.media.pause(); c.playing = false; }
        continue;
      }

      var x = Math.sin(angle) * R;
      var y = (1 - Math.cos(angle)) * R * 0.55;
      var scale = Math.max(0.55, 1 - ad * 0.07);
      var opacity = ad > 3.6 ? Math.max(0, 1 - (ad - 3.6)) : 1;

      c.el.style.visibility = "visible";
      c.el.style.opacity = opacity.toFixed(3);
      c.el.style.zIndex = String(100 - Math.round(ad * 10));
      c.el.style.transform =
        "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) " +
        "rotate(" + angle.toFixed(4) + "rad) scale(" + scale.toFixed(3) + ")";

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

    setCaption(((Math.round(offset) % N) + N) % N);
  }

  function tick() {
    if (!dragging) {
      if (auto) target += 0.005;
      offset += (target - offset) * 0.08;
    }
    render();
    requestAnimationFrame(tick);
  }

  function go(delta) {
    pause(3500);
    target = Math.round(target) + delta;
  }

  // Dragging
  stage.addEventListener("pointerdown", function (e) {
    dragging = true;
    lastX = e.clientX;
    stage.classList.add("dragging");
    stage.setPointerCapture(e.pointerId);
    pause(4000);
  });

  stage.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var cardPx = Math.max(stage.clientWidth * 0.17, 110);
    var dx = e.clientX - lastX;
    lastX = e.clientX;
    target -= dx / cardPx;
    offset = target;
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove("dragging");
    if (e && stage.hasPointerCapture && stage.hasPointerCapture(e.pointerId)) {
      stage.releasePointerCapture(e.pointerId);
    }
    target = Math.round(target);
    pause(2500);
  }
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  // Wheel / trackpad
  stage.addEventListener("wheel", function (e) {
    var delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (!delta) return;
    e.preventDefault();
    pause(2500);
    target += delta * 0.004;
  }, { passive: false });

  // Keyboard
  stage.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); go(-1); }
  });

  document.getElementById("next").addEventListener("click", function () { go(1); });
  document.getElementById("prev").addEventListener("click", function () { go(-1); });

  requestAnimationFrame(tick);
})();
