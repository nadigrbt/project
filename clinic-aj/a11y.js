// Версия для слабовидящих (своя, вместо виджета lidrekon.ru).
// Кнопка с глазом стоит в шапке (data-a11y-toggle) и работает в обе стороны:
// включает версию для слабовидящих и возвращает обычную.
// В версии для слабовидящих сверху страницы появляется панель:
// размер шрифта, цвет и картинки. Вернуться — той же кнопкой с глазом в шапке
// (в этом режиме на ней написано «Обычная версия»).
// Настройки запоминаются в браузере (localStorage, ключ aj-a11y).
(function () {
  var KEY = 'aj-a11y';
  var html = document.documentElement;
  var defaults = { on: false, size: 1, theme: 'bw', img: true };

  function load() {
    try { return Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch (e) { return Object.assign({}, defaults); }
  }
  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  }

  var state = load();

  function panel() {
    var p = document.createElement('div');
    p.className = 'a11y-panel';
    p.setAttribute('role', 'region');
    p.setAttribute('aria-label', 'Настройки версии для слабовидящих');
    p.innerHTML =
      '<div class="a11y-panel__in">' +
        '<div class="a11y-panel__group"><span>Шрифт:</span>' +
          '<button type="button" data-a11y-size="1" aria-label="Обычный размер шрифта">А</button>' +
          '<button type="button" data-a11y-size="2" aria-label="Крупный шрифт">А+</button>' +
          '<button type="button" data-a11y-size="3" aria-label="Очень крупный шрифт">А++</button>' +
        '</div>' +
        '<div class="a11y-panel__group"><span>Цвет:</span>' +
          '<button type="button" data-a11y-theme="bw" class="a11y-sw a11y-sw--bw" aria-label="Чёрным по белому">Ц</button>' +
          '<button type="button" data-a11y-theme="wb" class="a11y-sw a11y-sw--wb" aria-label="Белым по чёрному">Ц</button>' +
          '<button type="button" data-a11y-theme="blue" class="a11y-sw a11y-sw--blue" aria-label="Тёмно-синим по голубому">Ц</button>' +
        '</div>' +
        '<div class="a11y-panel__group"><span>Изображения:</span>' +
          '<button type="button" data-a11y-img aria-label="Показывать изображения">Вкл</button>' +
        '</div>' +
      '</div>';
    document.body.insertBefore(p, document.body.firstChild);
    return p;
  }

  var p;
  function apply() {
    html.classList.toggle('a11y', state.on);
    html.setAttribute('data-a11y-size', state.size);
    html.setAttribute('data-a11y-theme', state.theme);
    html.classList.toggle('a11y-noimg', state.on && !state.img);
    if (state.on && !p) p = panel();
    if (p) {
      p.hidden = !state.on;
      p.querySelectorAll('[data-a11y-size]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.a11ySize === +state.size)); });
      p.querySelectorAll('[data-a11y-theme]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.a11yTheme === state.theme)); });
      var ib = p.querySelector('[data-a11y-img]');
      ib.textContent = state.img ? 'Вкл' : 'Выкл';
      ib.setAttribute('aria-pressed', String(state.img));
    }
    document.querySelectorAll('.a11y-btn').forEach(function (b) {
      var label = state.on ? 'Обычная версия сайта' : 'Версия для слабовидящих';
      b.setAttribute('aria-label', label);
      b.title = label;
      b.querySelector('.a11y-btn__text').textContent = state.on ? 'Обычная версия' : 'Для слабовидящих';
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-a11y-toggle],[data-a11y-size],[data-a11y-theme],[data-a11y-img]');
    if (!t) return;
    e.preventDefault();
    if (t.hasAttribute('data-a11y-toggle')) {
      state.on = !state.on;
      window.scrollTo(0, 0);
    } else if (t.dataset.a11ySize) state.size = +t.dataset.a11ySize;
    else if (t.dataset.a11yTheme) state.theme = t.dataset.a11yTheme;
    else if (t.hasAttribute('data-a11y-img')) state.img = !state.img;
    save(state);
    apply();
  });

  apply();
})();
