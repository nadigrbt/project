// Поиск по сайту (строка на главной, 18.11). Разметка и стили — src/components/SiteSearch.astro.
// Индекс search-index.json собирается при сборке (integrations/search-index.mjs) и грузится,
// только когда посетитель нажал на строку поиска.
//
// Как ищем:
//   1) точное совпадение с названием страницы или её ключом (src/data/search.mjs) — первыми;
//   2) название или ключ начинается с запроса, все слова запроса есть в названии/ключах;
//   3) остальное по релевантности: формы слов («рубцов» = «рубцы»), опечатки («бтокс»),
//      синонимы («шрамы» → «постакне»), запрос в английской раскладке («kfpth» → «лазер»),
//      совпадения в подзаголовках и тексте страницы.
(() => {
  const roots = document.querySelectorAll('[data-site-search]');
  if (!roots.length) return;

  // Адрес сайта: на тестовой копии он /project/clinic-aj, на рабочем — корень
  const me = document.currentScript || document.querySelector('script[src*="search.js"]');
  const BASE = me ? new URL('.', me.src).pathname.replace(/\/$/, '') : '';
  const LIMIT = 8;

  /* ---------- Текст ---------- */
  const norm = (s) => s.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, ' ').trim();

  const EN = "qwertyuiop[]asdfghjkl;'zxcvbnm,.`";
  const RU = 'йцукенгшщзхъфывапролджэячсмитьбюё';
  const swap = (s, from, to) => [...s].map((c) => (from.includes(c) ? to[from.indexOf(c)] : c)).join('');

  // Упрощённый стеммер: отрезаем окончание, чтобы «лазерную» = «лазерная», «рубцов» = «рубцы»
  const ENDINGS = ['иями', 'ями', 'ами', 'ией', 'ого', 'его', 'ому', 'ему', 'ыми', 'ими', 'ться', 'тся',
    'ия', 'ья', 'ие', 'ье', 'ий', 'ый', 'ой', 'ая', 'яя', 'ое', 'ее', 'ые', 'ии', 'ей', 'ом', 'ем',
    'ам', 'ям', 'ах', 'ях', 'ую', 'юю', 'ов', 'ев', 'ию', 'ью',
    'а', 'я', 'о', 'е', 'и', 'ы', 'у', 'ю', 'ь', 'й'];
  const stem = (w) => {
    if (!/[а-я]/.test(w)) return w;
    for (const e of ENDINGS) if (w.endsWith(e) && w.length - e.length >= 3) return w.slice(0, -e.length);
    return w;
  };
  const STOP = new Set(['и', 'в', 'на', 'с', 'со', 'по', 'для', 'от', 'до', 'из', 'к', 'у', 'о', 'об', 'за', 'при', 'после', 'без', 'или', 'а', 'the']);
  const stems = (s) => norm(s).split(' ').filter((w) => w && !STOP.has(w)).map(stem);

  // Расстояние Дамерау — Левенштейна (опечатки: пропуск, лишняя буква, замена, перестановка)
  const dist = (a, b) => {
    const m = a.length, n = b.length;
    if (Math.abs(m - n) > 2) return 9;
    let p2 = [], p = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const c = [i];
      for (let j = 1; j <= n; j++) {
        c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) c[j] = Math.min(c[j], p2[j - 2] + 1);
      }
      p2 = p; p = c;
    }
    return p[n];
  };

  // «Как слышится»: типичные ошибки в русском письме дают одинаковый ключ.
  // о/а, е/и/э/ё, ы/и, я/а, ю/у, звонкие/глухие (б/п, в/ф, г/к, д/т, ж/ш, з/с), ц/с, щ/ш,
  // ь/ъ не пишем, двойные буквы — одна: «марщины» = «морщины», «масаж» = «массаж»,
  // «педекюр» = «педикюр», «тотуаж» = «татуаж», «биоривитолизация» = «биоревитализация».
  const PH = { о: 'а', я: 'а', е: 'и', ё: 'и', э: 'и', ы: 'и', й: 'и', ю: 'у', б: 'п', в: 'ф', г: 'к', д: 'т', ж: 'ш', з: 'с', ц: 'с', щ: 'ш', ь: '', ъ: '' };
  const phCache = new Map();
  const phon = (w) => {
    let r = phCache.get(w);
    if (r === undefined) {
      r = [...w].map((c) => (c in PH ? PH[c] : c)).join('').replace(/(.)\1+/g, '$1');
      phCache.set(w, r);
    }
    return r;
  };

  // Насколько слово запроса q похоже на слово страницы t: 1 — то же слово, 0 — не похоже
  const allowedTypos = (n) => (n >= 7 ? 2 : n >= 4 ? 1 : 0);
  const quality = (q, t) => {
    if (q === t) return 1;
    if (q.length >= 2 && t.startsWith(q)) return 0.9; // слово ещё набирают
    if (t.length >= 4 && q.startsWith(t)) return 0.8;
    if (Math.abs(q.length - t.length) > 3 && !(t.length > q.length)) return 0;
    // Ошибка «на слух» — почти как точное совпадение
    const pq = phon(q), pt = phon(t);
    if (pq.length >= 3 && pq === pt) return 0.8;
    if (pq.length >= 4 && pt.startsWith(pq)) return 0.72;
    // Опечатки: пропущенная, лишняя, заменённая или переставленная буква (и то же по ключу «на слух»)
    const allowed = allowedTypos(q.length);
    if (!allowed) return 0;
    // Ошибка «на слух» плюс опечатка — только в длинных словах, иначе «машина» нашла бы «морщины»
    const d = Math.min(dist(q, t), pq.length >= 7 ? dist(pq, pt) : 9);
    if (d <= allowed) return d === 1 ? 0.65 : 0.5;
    if (t.length > q.length && dist(q, t.slice(0, q.length)) <= allowed) return 0.5;
    return 0;
  };

  // Латиница вместо кириллицы: «botox» → «ботокс», «massazh» → «массаж», «epilyaciya» → «эпиляция»
  const TR = [['shch', 'щ'], ['sch', 'щ'], ['zh', 'ж'], ['kh', 'х'], ['ch', 'ч'], ['sh', 'ш'], ['ts', 'ц'], ['ya', 'я'], ['yu', 'ю'], ['yo', 'е'], ['ye', 'е'], ['ja', 'я'], ['ju', 'ю'],
    ['ci', 'ци'], ['ce', 'це'], ['cy', 'ци'], ['ph', 'ф'], ['x', 'кс'], ['a', 'а'], ['b', 'б'], ['c', 'к'], ['d', 'д'], ['e', 'е'], ['f', 'ф'], ['g', 'г'], ['h', 'х'],
    ['i', 'и'], ['j', 'й'], ['k', 'к'], ['l', 'л'], ['m', 'м'], ['n', 'н'], ['o', 'о'], ['p', 'п'], ['q', 'к'], ['r', 'р'], ['s', 'с'], ['t', 'т'], ['u', 'у'],
    ['v', 'в'], ['w', 'в'], ['y', 'и'], ['z', 'з']];
  const translit = (s) => {
    let out = '';
    for (let i = 0; i < s.length;) {
      const hit = TR.find(([l]) => s.startsWith(l, i));
      if (hit) { out += hit[1]; i += hit[0].length; } else { out += s[i]; i++; }
    }
    return out;
  };

  /* ---------- Индекс ---------- */
  const FIELDS = [['title', 10], ['keys', 10], ['alt', 5], ['sub', 4], ['heads', 3], ['section', 2], ['desc', 2], ['text', 1]];
  let index = null;
  let loading = null;
  let vocab = [];

  const prepare = (data) => {
    const all = new Set();
    const pages = data.pages.map((p) => {
      const f = {};
      for (const [name] of FIELDS) {
        const v = name === 'keys' ? (p.keys || []).join(' ') : p[name] || '';
        f[name] = new Set(stems(v));
        f[name].forEach((s) => all.add(s));
      }
      return {
        ...p,
        f,
        exact: [p.title, ...(p.keys || [])].map((k) => stems(k).join(' ')).filter(Boolean),
        exactPh: [p.title, ...(p.keys || [])].map((k) => stems(k).map(phon).join(' ')).filter(Boolean),
        keyStems: new Set([...f.title, ...f.keys]),
      };
    });
    vocab = [...all];
    const synonyms = (data.synonyms || []).map((g) => g.map(stems).filter((x) => x.length));
    return { pages, synonyms, popular: data.popular || [] };
  };

  const load = () => {
    if (!loading) {
      loading = fetch(`${BASE}/search-index.json?v=3`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((d) => (index = prepare(d)))
        .catch((e) => { loading = null; throw e; });
    }
    return loading;
  };

  /* ---------- Поиск ---------- */
  const matchMap = (q) => {
    const m = new Map();
    for (const t of vocab) {
      const v = quality(q, t);
      if (v) m.set(t, v);
    }
    return m;
  };

  // Лучшее совпадение слова (или фразы-синонима) в полях страницы
  const fieldScore = (page, maps) => {
    let best = 0, inKey = 0;
    for (const [name, w] of FIELDS) {
      let fq = 1;
      for (const mp of maps) {
        let b = 0;
        for (const s of page.f[name]) { const v = mp.get(s); if (v > b) b = v; if (b === 1) break; }
        fq = Math.min(fq, b);
        if (!fq) break;
      }
      if (fq * w > best) best = fq * w;
      if ((name === 'title' || name === 'keys') && fq > inKey) inKey = fq;
    }
    return { best, inKey };
  };

  const variants = (raw) => {
    const s = raw.toLowerCase();
    const out = [s];
    if (/[a-z]/.test(s) && !/[а-я]/.test(s)) {
      out.push(swap(s, EN, RU)); // «kfpth» → «лазер»
      out.push(translit(s)); // «botox» → «ботокс»
    }
    if (/[а-я]/.test(s) && !/[a-z]/.test(s)) out.push(swap(s, RU, EN)); // «дзп» → «lpg»
    // Раздельно вместо слитно: «био ревитализация», «плазмо лифтинг», «пост акне»
    for (const v of [...out]) if (/\s/.test(v.trim())) out.push(v.replace(/\s+/g, ''));
    return out;
  };

  const cache = new Map();
  const mm = (q) => cache.get(q) || (cache.set(q, matchMap(q)), cache.get(q));

  const searchOne = (raw) => {
    const qs = stems(raw);
    if (!qs.length) return [];
    const joined = qs.join(' ');
    const joinedPh = qs.map(phon).join(' ');

    // Для каждого слова запроса — его совпадения и совпадения синонимов
    const tokens = qs.map((q) => {
      const direct = mm(q);
      const syn = [];
      for (const g of index.synonyms) {
        if (g.some((ph) => ph.length === 1 && quality(q, ph[0]) >= 0.8)) {
          for (const ph of g) syn.push(ph.map(mm));
        }
      }
      return { direct, syn };
    });

    // Первый проход: насколько каждое слово совпало на каждой странице
    const rows = [];
    const df = tokens.map(() => 0);
    for (const p of index.pages) {
      let allKey = true;
      const bests = tokens.map((t, i) => {
        const d = fieldScore(p, [t.direct]);
        let best = d.best;
        for (const ph of t.syn) best = Math.max(best, fieldScore(p, ph).best * 0.75);
        if (best > 0) df[i]++;
        if (d.inKey < 0.9) allKey = false;
        return best;
      });
      if (bests.some(Boolean)) rows.push({ p, bests, allKey });
    }
    // Редкое слово («сосуды») весит больше частого («лицо»)
    const N = index.pages.length;
    const idf = df.map((n) => Math.log(1 + N / (n || 1)));

    const res = rows.map(({ p, bests, allKey }) => {
      const score = bests.reduce((sum, v, i) => sum + v * idf[i], 0);
      let tier = 2;
      if (p.exact.includes(joined)) tier = 0;
      else if (allKey || p.exact.some((k) => k.startsWith(joined))) tier = 1;
      // Название или ключ, написанные с ошибкой «на слух» («педекюр», «тотуаж») — сразу за точными
      else if (p.exactPh.includes(joinedPh)) tier = 1.5;
      return { p, tier, score, full: bests.every(Boolean) };
    });
    const full = res.filter((r) => r.full);
    return (full.length ? full : res)
      .sort((a, b) => a.tier - b.tier || b.score - a.score || a.p.title.length - b.p.title.length);
  };

  const search = (raw) => {
    const lists = variants(raw).map(searchOne);
    // Если запрос был в другой раскладке, берём вариант, где нашлось лучшее
    const seen = new Map();
    for (const list of lists) for (const r of list) {
      const old = seen.get(r.p.url);
      if (!old || r.tier < old.tier || (r.tier === old.tier && r.score > old.score)) seen.set(r.p.url, r);
    }
    const sorted = [...seen.values()]
      .sort((a, b) => a.tier - b.tier || b.score - a.score || a.p.title.length - b.p.title.length);
    // Случайные совпадения где-то в тексте страницы не показываем, если есть сильные
    const top = Math.max(0, ...sorted.map((r) => r.score));
    return sorted.filter((r) => r.tier < 2 || r.score >= top * 0.3).slice(0, LIMIT);
  };

  /* ---------- Подсветка совпавших слов ---------- */
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const highlight = (title, raw) => {
    const qs = variants(raw).flatMap(stems);
    return title.split(/([^A-Za-zА-Яа-яЁё0-9]+)/).map((part) => {
      const s = stem(norm(part));
      const hit = s && qs.some((q) => quality(q, s) >= 0.65);
      return hit ? `<mark>${esc(part)}</mark>` : esc(part);
    }).join('');
  };

  const href = (url) => BASE + url;

  /* ---------- Интерфейс ---------- */
  roots.forEach((root, n) => {
    const input = root.querySelector('[data-search-input]');
    const panel = root.querySelector('[data-search-panel]');
    const list = root.querySelector('[data-search-list]');
    const empty = root.querySelector('[data-search-empty]');
    const emptyQ = root.querySelector('[data-search-empty-q]');
    const hint = root.querySelector('[data-search-hint]');
    const hintList = root.querySelector('[data-search-popular]');
    const status = root.querySelector('[data-search-status]');
    const clear = root.querySelector('[data-search-clear]');
    let items = [];
    let active = -1;
    let timer;

    const open = (on) => {
      panel.hidden = !on;
      input.setAttribute('aria-expanded', on && items.length ? 'true' : 'false');
      root.classList.toggle('is-open', on);
    };

    const setActive = (i) => {
      const opts = list.querySelectorAll('[role="option"]');
      opts.forEach((o, j) => o.setAttribute('aria-selected', j === i ? 'true' : 'false'));
      active = i;
      if (i >= 0 && opts[i]) {
        input.setAttribute('aria-activedescendant', opts[i].id);
        opts[i].scrollIntoView({ block: 'nearest' });
      } else input.removeAttribute('aria-activedescendant');
    };

    const showPopular = () => {
      items = [];
      list.innerHTML = '';
      empty.hidden = true;
      if (index && index.popular.length && !hintList.childElementCount) {
        hintList.innerHTML = index.popular
          .map((x) => `<li><a class="ssearch__chip" href="${esc(href(x.url))}">${esc(x.title)}</a></li>`)
          .join('');
      }
      hint.hidden = !hintList.childElementCount;
      status.textContent = '';
      setActive(-1);
      open(!hint.hidden);
    };

    const render = () => {
      const raw = input.value.trim();
      clear.hidden = !input.value;
      if (!raw) return showPopular();
      if (!index) {
        load().then(render).catch(() => {});
        return;
      }
      const found = search(raw);
      items = found.map((r) => r.p);
      hint.hidden = true;
      list.innerHTML = items
        .map((p, i) => `<li role="option" id="ssearch-${n}-${i}" aria-selected="false">
  <a class="ssearch__item" href="${esc(href(p.url))}" tabindex="-1">
    <span class="ssearch__section">${esc(p.section || '')}</span>
    <span class="ssearch__title">${highlight(p.title, raw)}${p.sub ? ` <span class="ssearch__sub">${esc(p.sub)}</span>` : ''}</span>
  </a>
</li>`)
        .join('');
      empty.hidden = items.length > 0;
      emptyQ.textContent = raw;
      status.textContent = items.length ? `Найдено: ${items.length}` : 'Ничего не нашли';
      setActive(items.length ? 0 : -1);
      open(true);
    };

    // На телефоне строка стоит низко: поднимаем её к верху экрана, чтобы над клавиатурой были видны результаты
    const phone = window.matchMedia('(max-width: 959px)');
    const lift = () => {
      if (!phone.matches) return;
      const top = root.getBoundingClientRect().top + window.scrollY - 12;
      if (Math.abs(window.scrollY - top) > 4) window.scrollTo({ top, behavior: 'smooth' });
    };
    input.addEventListener('focus', () => {
      load().then(render).catch(() => {});
      render();
      setTimeout(lift, 50);
    });
    root.addEventListener('pointerenter', () => load().catch(() => {}), { once: true });
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(render, 60);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' && items.length) { e.preventDefault(); if (panel.hidden) open(true); setActive((active + 1) % items.length); }
      else if (e.key === 'ArrowUp' && items.length) { e.preventDefault(); setActive((active - 1 + items.length) % items.length); }
      else if (e.key === 'Escape') {
        if (!panel.hidden) { e.preventDefault(); open(false); }
        else if (input.value) { input.value = ''; render(); open(false); }
      }
    });
    root.addEventListener('submit', (e) => {
      e.preventDefault();
      clearTimeout(timer);
      if (!index) return load().then(() => { render(); if (items[0]) location.href = href(items[0].url); }).catch(() => {});
      render();
      const p = items[active >= 0 ? active : 0];
      if (p) location.href = href(p.url);
    });
    clear.addEventListener('click', () => {
      input.value = '';
      input.focus();
      render();
    });
    list.addEventListener('pointermove', (e) => {
      const li = e.target.closest('[role="option"]');
      if (li) setActive([...list.children].indexOf(li));
    });
    document.addEventListener('pointerdown', (e) => { if (!root.contains(e.target)) open(false); });
    // Нажатие на подсказку или результат не должно забирать фокус у строки: в Safari (Mac, iPhone)
    // ссылка не получает фокус, строка теряет его раньше клика, и список закрывался до перехода.
    panel.addEventListener('mousedown', (e) => e.preventDefault());
    // Ссылки в списке открываем сами — на случай, если список успел закрыться до клика
    panel.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || a.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();
      location.href = a.href;
    });
    root.addEventListener('focusout', (e) => {
      if (root.contains(e.relatedTarget)) return;
      // Закрываем чуть позже, когда клик по подсказке уже сработал
      setTimeout(() => { if (!root.contains(document.activeElement)) open(false); }, 200);
    });
  });
})();
