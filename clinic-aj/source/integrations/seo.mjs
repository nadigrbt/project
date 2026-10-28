// SEO после сборки (28.10): sitemap.xml и разметка schema.org для поисковиков.
// Работает сам при каждой сборке (npm run build и npm run preview-build), страницы править не нужно:
//   • sitemap.xml — все страницы без noindex (копии Тильды «-tilda» и 404 в него не попадают);
//   • хлебные крошки (BreadcrumbList) — берутся из блока крошек на странице;
//   • вопросы и ответы (FAQPage) — из блока «Что обычно спрашивают» (section.in-faq);
//   • тип страницы — услуга (Service), статья блога (BlogPosting) или курс (Course), см. PAGE_TYPES ниже.
// Разметка строится из текста, который уже есть на странице, поэтому всегда совпадает с ним
// (это требование Яндекса и Google). Данные о самой клинике (адреса, телефон, часы) — в layouts/Base.astro.
//
// Новая страница услуги: добавить её адрес в PAGE_TYPES.service, статьи блога и курсы определяются по началу адреса.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const PAGE_TYPES = {
  service: [
    'cosmetology', 'injections', 'estetica', 'lazer',
    'volnewmer', 'rf', 'smas', 'lumecca', 'heleo4', 'mediostar', 'neogen', 'micro', 'lpg', 'lazer_aleksandrit', 'emsella',
    'botulino', 'biorevitalization', 'hand-biorevitalization', 'sfero', 'plazma',
    'clean', 'intim-piling', 'massage', 'lifting',
    'permanent', 'piercing', 'pedikur', 'orto',
  ],
};

const CLINIC_ID = (site) => `${site}/#clinic`;

const text = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/\s+/g, ' ')
    .trim();

const meta = (html, name) => {
  const m = html.match(new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)"`));
  return m ? text(m[1]) : '';
};

// <h1>Ботулинотерапия <span>коррекция мимических морщин</span></h1> → «Ботулинотерапия»
const h1Main = (html) => {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (!m) return '';
  return text(m[1].replace(/<span[\s\S]*?<\/span>/g, '')) || text(m[1]);
};

const breadcrumbs = (html, url, site) => {
  const nav = html.match(/<nav[^>]*aria-label="Хлебные крошки"[^>]*>([\s\S]*?)<\/nav>/);
  if (!nav) return null;
  const items = [...nav[1].matchAll(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => ({
    name: text(m[2]),
    item: new URL(m[1], site).href.replace(/\/$/, '') || site,
  }));
  const current = nav[1].match(/<span[^>]*aria-current="page"[^>]*>([\s\S]*?)<\/span>/);
  if (current) items.push({ name: text(current[1]), item: url });
  if (items.length < 2) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((x, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: x.name,
      item: x.item === site ? `${site}/` : x.item,
    })),
  };
};

const faq = (html) => {
  // Только блок вопросов (section.in-faq), не «Сведения об образовательной организации» (ed-info)
  const sec = html.match(/<section class="container in-faq"[^>]*>([\s\S]*?)<\/section>/);
  if (!sec) return null;
  const qa = [...sec[1].matchAll(/<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)]
    .map((m) => ({ q: text(m[1]), a: text(m[2]) }))
    .filter((x) => x.q && x.a);
  if (!qa.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa.map((x) => ({
      '@type': 'Question',
      name: x.q,
      acceptedAnswer: { '@type': 'Answer', text: x.a },
    })),
  };
};

const pageType = (slug, html, url, site) => {
  const name = h1Main(html);
  const description = meta(html, 'description');
  const image = meta(html, 'og:image');
  const provider = { '@type': 'MedicalClinic', '@id': CLINIC_ID(site), name: 'Клиника A&J', url: `${site}/` };

  if (PAGE_TYPES.service.includes(slug)) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name,
      serviceType: name,
      description,
      url,
      image,
      provider,
      areaServed: { '@type': 'City', name: 'Мурманск' },
    };
  }
  if (slug.startsWith('blog-')) {
    // «Отвечает Валерия Смыкова, главный врач клиники…» — автор с самой страницы
    const by = html.match(/class="bp-hero__author"[^>]*>([\s\S]*?)<\/p>/);
    const [, person, job] = (by ? text(by[1]) : '').match(/^Отвечает\s+([^,]+),\s*(.+)$/) || [];
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: text(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] || name),
      description,
      url,
      mainEntityOfPage: url,
      image,
      inLanguage: 'ru',
      author: person
        ? { '@type': 'Person', name: person.trim(), jobTitle: job.trim(), worksFor: { '@id': CLINIC_ID(site) } }
        : provider,
      publisher: provider,
    };
  }
  if (slug.startsWith('education-')) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name,
      description,
      url,
      inLanguage: 'ru',
      provider: { '@type': 'Organization', name: 'Учебный центр клиники A&J', sameAs: `${site}/education` },
    };
  }
  return null;
};

// Дата последнего изменения страницы для sitemap — из истории git (если git недоступен, дата сборки)
const lastmod = (root, slug) => {
  try {
    const d = execSync(`git log -1 --format=%cs -- "src/pages/${slug}.astro"`, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    if (d) return d;
  } catch {}
  return new Date().toISOString().slice(0, 10);
};

export default function seo() {
  let site;
  let root;
  return {
    name: 'clinic-aj-seo',
    hooks: {
      'astro:config:done': ({ config }) => {
        site = config.site.replace(/\/$/, '');
        root = fileURLToPath(config.root);
      },
      'astro:build:done': ({ dir }) => {
        const out = fileURLToPath(dir);
        const urls = [];
        for (const file of readdirSync(out).filter((n) => n.endsWith('.html')).sort()) {
          const slug = file.slice(0, -5);
          const path = join(out, file);
          let html = readFileSync(path, 'utf8');
          const url = slug === 'index' ? `${site}/` : `${site}/${slug}`;
          const noindex = /<meta name="robots" content="noindex/.test(html);

          if (slug !== '404' && !noindex) urls.push({ url, lastmod: lastmod(root, slug) });
          // Копии Тильды и 404 не размечаем: их нет в поиске
          if (slug === '404' || /-tilda$/.test(slug)) continue;

          const blocks = [breadcrumbs(html, url, site), pageType(slug, html, url, site), faq(html)].filter(Boolean);
          if (!blocks.length) continue;
          const tags = blocks
            .map((b) => `<script type="application/ld+json">${JSON.stringify(b).replace(/</g, '\\u003c')}</script>`)
            .join('');
          html = html.replace('</head>', `${tags}</head>`);
          writeFileSync(path, html);
        }

        // Главная — первой
        urls.sort((a, b) => (a.url === `${site}/` ? -1 : b.url === `${site}/` ? 1 : 0));
        const xml =
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          urls.map((u) => `  <url><loc>${u.url}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n') +
          '\n</urlset>\n';
        writeFileSync(join(out, 'sitemap.xml'), xml);
        console.log(`SEO: sitemap.xml (${urls.length} страниц), разметка schema.org добавлена`);
      },
    },
  };
}
