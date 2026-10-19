/**
 * Renderer billederne til gulvkataloget (/gulvtyper/) med WebGL i headless Chromium.
 * Scenerne står i scener.json: materiale (mode 0 ensfarvet, 1 flakes, 3 color quartz, 4 PU, 5 stentæppe), farver og kamera.
 * Skriver src/media/katalog/<navn>.jpg og en rund farveprøve i src/media/katalog/proeve/<navn>.jpg.
 *
 *   node scripts/katalog/render.mjs                    # alle
 *   node scripts/katalog/render.mjs sten-carrara       # kun én (kommasepareret for flere)
 *
 * Kræver Playwright med Chromium (PLAYWRIGHT=/sti/til/playwright/index.mjs). Et billede i 1600x1000 tager ca. 1 minut.
 * Billederne er pladsholdere: skift dem til kundens egne fotos med samme filnavne, når de er klar.
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
  const png = Buffer.from((await side.evaluate((s) => window.render(s), scene)).split(',')[1], 'base64');
  await gem(png, navn);
  console.log(`${navn}: ${((Date.now() - start) / 1000).toFixed(0)} s`);
}
await browser.close();

/** Gemmer billedet og skærer en prøve ud nederst til højre, hvor overfladen er skarp og fri for refleksstriberne. */
export async function gem(png, navn) {
  const ud = her('../../src/media/katalog/');
  fs.mkdirSync(`${ud}proeve`, { recursive: true });
  const b = sharp(png);
  const { width: w, height: h } = await b.metadata();
  await b.clone().jpeg({ quality: 86, mozjpeg: true }).toFile(`${ud}${navn}.jpg`);
  const s = Math.round(h * 0.3);
  await b.clone().extract({ left: Math.round(w * 0.8 - s / 2), top: h - s - Math.round(h * 0.04), width: s, height: s })
    .resize(192, 192).jpeg({ quality: 84, mozjpeg: true }).toFile(`${ud}proeve/${navn}.jpg`);
}
