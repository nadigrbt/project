// Скачивает все картинки сайта с Тильды в public/images и ужимает их.
// Запуск: npm run images   (нужен интернет; уже скачанные файлы пропускаются,
// чтобы перекачать заново — npm run images -- --force)

import { mkdir, writeFile, access } from 'node:fs/promises';
import { join, extname } from 'node:path';
import sharp from 'sharp';

// Список картинок берём из src/data/images.ts — простым разбором файла,
// чтобы скрипт работал без TypeScript.
import { readFile } from 'node:fs/promises';
const src = await readFile(new URL('../src/data/images.ts', import.meta.url), 'utf8');
const T = 'https://static.tildacdn.com';
const list = [...src.matchAll(/file:\s*'([^']+)',\s*remote:\s*`([^`]+)`(?:,\s*width:\s*(\d+))?/g)].map((m) => ({
  file: m[1],
  remote: m[2].replace('${T}', T),
  width: m[3] ? Number(m[3]) : undefined,
}));

const outDir = new URL('../public/images/', import.meta.url).pathname;
await mkdir(outDir, { recursive: true });
const force = process.argv.includes('--force');

let ok = 0, skipped = 0, failed = 0;
for (const { file, remote, width } of list) {
  const dest = join(outDir, file);
  if (!force && await access(dest).then(() => true, () => false)) { skipped++; continue; }

  try {
    const res = await fetch(remote);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = extname(file).toLowerCase();

    if (ext === '.svg') {
      await writeFile(dest, buf);
    } else {
      let pipeline = sharp(buf);
      if (width) pipeline = pipeline.resize({ width, withoutEnlargement: true });
      if (ext === '.webp') pipeline = pipeline.webp({ quality: 82, alphaQuality: 90 });
      if (ext === '.jpg') pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
      if (ext === '.png') pipeline = pipeline.png({ compressionLevel: 9 });
      await pipeline.toFile(dest);
    }
    console.log('✓', file);
    ok++;
  } catch (e) {
    console.error('✗', file, '—', e.message);
    failed++;
  }
}
console.log(`\nГотово: скачано ${ok}, уже было ${skipped}, ошибок ${failed}`);
if (failed) process.exit(1);
