// Индекс для поиска по сайту (18.11). После каждой сборки (npm run build и npm run preview-build)
// кладёт в dist файл search-index.json: все страницы без noindex (кроме главной, копий Тильды и 404)
// с их названием, разделом, подзаголовками и словами из текста, плюс ключи и синонимы
// из src/data/search.mjs. Сам поиск работает в браузере — public/search.js.
// Новую страницу добавлять никуда не нужно: она попадёт в поиск сама.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { keywords, synonyms, extra, popular } from '../src/data/search.mjs';

const decode = (s) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));

const text = (html) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

const meta = (html, name) => {
  const m = html.match(new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)"`));
  return m ? text(m[1]) : '';
};

// Слова из текста страницы — без повторов и без коротких служебных слов
const STOP = new Set('если чтобы перед после через между может можно нужно которые который которая также более менее этого этой этом эти этот какие какой когда только очень всех всего вашей вашего ваша ваши ваше вашу своей свои себя ними него нему неё один одна одно одного будет быть есть были было была клиника клиники клинике клинику мурманск мурманске записаться запись консультация консультации специалиста имеются противопоказания необходима'.split(' '));
const words = (s, limit) => {
  const out = new Set();
  for (const w of s.toLowerCase().replace(/ё/g, 'е').split(/[^a-zа-я0-9-]+/)) {
    const t = w.replace(/^-+|-+$/g, '');
    if (t.length < 4 || STOP.has(t) || /^\d+$/.test(t)) continue;
    out.add(t);
    if (out.size >= limit) break;
  }
  return [...out].join(' ');
};

const SECTION_BY_SLUG = [
  [/^blog-/, 'Блог'],
  [/^education-/, 'Учебный центр'],
  [/^vrach-/, 'Специалисты клиники'],
  [/^(policy|agreement|rules|rights|license)$/, 'Документы'],
  [/^(blog)$/, 'Блог'],
  [/^(vrachi)$/, 'Специалисты клиники'],
  [/^(education)$/, 'Учебный центр'],
  [/^(sale)$/, 'Акции'],
  [/^(instructions)$/, 'Пациентам'],
];

export default function searchIndex() {
  return {
    name: 'clinic-aj-search-index',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const out = fileURLToPath(dir);
        const pages = [];
        for (const file of readdirSync(out).filter((n) => n.endsWith('.html')).sort()) {
          const slug = file.slice(0, -5);
          if (slug === 'index' || slug === '404' || /-tilda$/.test(slug)) continue;
          const html = readFileSync(join(out, file), 'utf8');
          // noindex у самой страницы (на тестовой копии noindex стоит везде, его не учитываем)
          if (/<html[^>]*data-page-noindex/.test(html)) continue;

          const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] || '';
          const title = text(h1.replace(/<span[\s\S]*?<\/span>/g, '')) || text(h1);
          const sub = text(h1.match(/<span[^>]*>([\s\S]*?)<\/span>/)?.[1] || '');
          const docTitle = text(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '').replace(/\s*[—|]\s*(клиника|Клиника).*$/, '');

          // Раздел — из хлебных крошек (родитель страницы), иначе по адресу
          const nav = html.match(/<nav[^>]*aria-label="Хлебные крошки"[^>]*>([\s\S]*?)<\/nav>/)?.[1] || '';
          const crumbs = [...nav.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/g)].map((m) => text(m[1])).filter((c) => c !== 'Главная');
          const section = crumbs.at(-1) || SECTION_BY_SLUG.find(([re]) => re.test(slug))?.[1] || 'Услуги клиники';

          const headings = [...html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/g)]
            .map((m) => text(m[1]))
            .filter((h) => h && h.length < 90 && !/^(Хотите задать вопрос|Контакты|Отзывы|Онлайн запись|Другие)/.test(h));

          // Текст страницы без шапки, подвала, контактов и отзывов
          const main = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] || html)
            .replace(/<script[\s\S]*?<\/script>/g, ' ')
            .replace(/<style[\s\S]*?<\/style>/g, ' ')
            .replace(/<header[\s\S]*?<\/header>/g, ' ')
            .replace(/<form[^>]*data-site-search[\s\S]*?<\/form>/g, ' ')
            .replace(/<section class="contacts"[\s\S]*$/, ' ');

          pages.push({
            url: `/${slug}`,
            title,
            sub,
            section,
            keys: keywords[slug] || [],
            alt: docTitle,
            desc: meta(html, 'description'),
            heads: [...new Set(headings)].join(' · '),
            text: words(text(main), 400),
          });
        }

        // Общие слова и подзаголовки, которые есть почти на каждой странице («Консультация»,
        // «процедура», «кожи»), поиску не помогают — убираем их, чтобы индекс был лёгким
        const df = (list) => {
          const c = new Map();
          for (const l of list) for (const x of new Set(l)) c.set(x, (c.get(x) || 0) + 1);
          return c;
        };
        const tooCommon = (c) => (x) => c.get(x) <= pages.length * 0.25;
        const headDf = df(pages.map((p) => p.heads.split(' · ')));
        const textDf = df(pages.map((p) => p.text.split(' ')));
        for (const p of pages) {
          p.heads = p.heads.split(' · ').filter(tooCommon(headDf)).join(' · ');
          const own = new Set(`${p.title} ${p.sub} ${p.alt} ${p.desc} ${p.heads}`.toLowerCase().replace(/ё/g, 'е').split(/[^a-zа-я0-9-]+/));
          p.text = p.text.split(' ').filter((w) => !own.has(w)).filter(tooCommon(textDf)).slice(0, 180).join(' ');
        }
        for (const e of extra) pages.push({ sub: '', alt: '', desc: '', heads: '', text: '', ...e, keys: e.keywords, keywords: undefined });

        writeFileSync(join(out, 'search-index.json'), JSON.stringify({ pages, synonyms, popular }));
      },
    },
  };
}
