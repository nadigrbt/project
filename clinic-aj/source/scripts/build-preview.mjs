// Собирает тестовую копию сайта для GitHub Pages: https://nadigrbt.github.io/project/clinic-aj/
// Копия закрыта от поисковиков (noindex). Основной сайт собирается как обычно: npm run build.
//
// Запуск: npm run preview-build  → готовые файлы появятся в папке ../ (рядом с source/)
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, statSync, rmSync, cpSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = '/project/clinic-aj';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tmp = join(root, 'dist-preview');
const out = resolve(root, '..'); // папка clinic-aj в репозитории

execSync(`npx astro build --outDir ${tmp}`, {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, PUBLIC_NOINDEX: '1' },
});

// Все ссылки вида "/images/…" → "/project/clinic-aj/images/…"
const fix = (text) =>
  text
    .replace(/(href|src|action|content)="\/(?!\/)/g, `$1="${BASE}/`)
    .replace(/url\((['"]?)\/(?!\/)/g, `url($1${BASE}/`);

const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(html|css|js)$/.test(name)) writeFileSync(p, fix(readFileSync(p, 'utf8')));
  }
};
walk(tmp);

// Страницы, которые ещё не перенесены с Тильды, на тестовой копии ведут на рабочий
// сайт clinic-aj.ru, чтобы не было «страница не найдена». Готовые страницы
// ссылаются друг на друга внутри тестовой копии.
const ready = new Set(readdirSync(tmp).filter((n) => n.endsWith('.html')).map((n) => n.slice(0, -5)));
const linkUnready = (text) =>
  text.replace(new RegExp(`href="${BASE}/([a-z0-9_-]+)(#[^"]*)?"`, 'gi'), (m, slug, hash = '') =>
    ready.has(slug) ? m : `href="https://clinic-aj.ru/${slug}${hash}"`);
for (const name of readdirSync(tmp)) {
  if (name.endsWith('.html')) writeFileSync(join(tmp, name), linkUnready(readFileSync(join(tmp, name), 'utf8')));
}

// api/ (PHP) на GitHub Pages не работает — не копируем
rmSync(join(tmp, 'api'), { recursive: true, force: true });
for (const f of ['.htaccess', 'robots.txt']) rmSync(join(tmp, f), { force: true });

// Убираем старую сборку и кладём новую рядом с source/
for (const name of readdirSync(out)) {
  if (name === 'source' || name.startsWith('.')) continue;
  rmSync(join(out, name), { recursive: true, force: true });
}
cpSync(tmp, out, { recursive: true });
rmSync(tmp, { recursive: true, force: true });
console.log(`Готово: тестовая копия собрана в ${out}`);
