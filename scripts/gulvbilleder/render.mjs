/**
 * Renderer pladsholder-billeder af epoxygulve med WebGL i headless Chromium:
 * fotos til siderne (src/media/foto/gulv-*.jpg) og farveprøver (src/media/farver/*.webp).
 * Scenerne står i scener.json: materiale (mode 0 ensfarvet, 1 flakes, 2 metallic), farver, kamera og rum.
 *
 *   node scripts/gulvbilleder/render.mjs                 # alle scener
 *   node scripts/gulvbilleder/render.mjs flakes-graa     # kun én (kommasepareret for flere)
 *
 * Kræver Playwright med Chromium: npm i -D playwright && npx playwright install chromium
 * (eller PLAYWRIGHT=/sti/til/playwright/index.mjs). Et foto i 1600x1200 tager ca. 2 minutter.
 */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const { chromium } = await import(process.env.PLAYWRIGHT ?? 'playwright');
const her = (f) => fileURLToPath(new URL(f, import.meta.url));
const scener = JSON.parse(fs.readFileSync(her('./scener.json'), 'utf8'));
const kun = process.argv[2]?.split(',');

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const side = await browser.newPage();
side.on('pageerror', (e) => console.error('fejl:', String(e)));
await side.goto(`file://${her('./gulv.html')}`);

for (const [navn, scene] of Object.entries(scener)) {
  if (kun && !kun.includes(navn)) continue;
  const start = Date.now();
  const dataUrl = await side.evaluate((s) => window.render(s), scene);
  const billede = sharp(Buffer.from(dataUrl.split(',')[1], 'base64'));
  const ud = scene.mappe === 'farver'
    ? await billede.webp({ quality: 82 }).toFile(her(`../../src/media/farver/${navn}.webp`))
    : await billede.jpeg({ quality: 86, mozjpeg: true }).toFile(her(`../../src/media/foto/${navn}.jpg`));
  console.log(`${navn}: ${ud.width}x${ud.height}, ${((Date.now() - start) / 1000).toFixed(0)} s`);
}
await browser.close();
