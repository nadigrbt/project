import { defineConfig } from 'astro/config';
import seo from './integrations/seo.mjs';

// Сайт собирается в статические HTML-файлы (папка dist/),
// которые загружаются на хостинг Timeweb в public_html.
export default defineConfig({
  site: 'https://clinic-aj.ru',
  // lpg.html вместо lpg/index.html — адреса остаются как на Тильде: /lpg, /smas …
  build: { format: 'file' },
  trailingSlash: 'never',
  compressHTML: true,
  // sitemap.xml и разметка schema.org (хлебные крошки, вопросы, услуги) — integrations/seo.mjs
  integrations: [seo()],
  // Для тестовой копии на GitHub Pages папка со стилями без «_» в начале (иначе Pages её прячет)
  ...(process.env.PUBLIC_NOINDEX === '1' ? { build: { format: 'file', assets: 'assets' } } : {}),
});
