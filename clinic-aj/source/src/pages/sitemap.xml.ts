// Карта сайта /sitemap.xml для Яндекса и Google (на неё ссылается public/robots.txt).
// Собирается сама из файлов src/pages: новая страница попадает в карту без правок здесь.
// Не включаем: 404, копии Тильды (-tilda, noindex) и страницы врачей без специальности (noindex, см. data/doctors.ts).
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { doctors, doctorUrl, isIndexable } from '../data/doctors';
import { abs } from '../data/schema';

export function GET() {
  const pages = readdirSync(join(process.cwd(), 'src/pages'))
    .filter((f) => f.endsWith('.astro') && !f.startsWith('[') && f !== '404.astro' && !f.endsWith('-tilda.astro'))
    .map((f) => (f === 'index.astro' ? '/' : `/${f.slice(0, -'.astro'.length)}`));
  const urls = [...pages, ...doctors.filter(isIndexable).map(doctorUrl)].sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${abs(u)}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
