/**
 * Efterbehandler DEMO-byggeriet (npm run build:demo), så det kan deles som preview uden server:
 * - absolutte /filer/-stier (Astros aktiver) bliver relative i HTML, CSS og JS
 * - forsiden laves også som et fragment (artifact.html) til Claude-preview
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const mappe = process.argv[2] || 'dist-demo';
const aktiver = 'filer'; // build.assets i astro.config.mjs, når DEMO=1

const htmlFiler = readdirSync(mappe).filter((f) => f.endsWith('.html'));
for (const f of htmlFiler) {
  const sti = join(mappe, f);
  writeFileSync(sti, readFileSync(sti, 'utf8').replaceAll(`/${aktiver}/`, `${aktiver}/`));
}
for (const f of readdirSync(join(mappe, aktiver))) {
  const sti = join(mappe, aktiver, f);
  if (f.endsWith('.css')) writeFileSync(sti, readFileSync(sti, 'utf8').replaceAll(`/${aktiver}/`, ''));
  if (f.endsWith('.js')) writeFileSync(sti, readFileSync(sti, 'utf8').replaceAll(`"/${aktiver}/`, `"${aktiver}/`));
}

// Forsiden som fragment: titel, kladde-klassen, styles og scripts fra <head> og hele <body>
const forside = readFileSync(join(mappe, 'index.html'), 'utf8');
const head = forside.match(/<head>([\s\S]*?)<\/head>/)[1];
const body = forside.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];
const titel = head.match(/<title>[\s\S]*?<\/title>/)[0];
const tags = head.match(/<link rel="stylesheet"[^>]*>|<link rel="modulepreload"[^>]*>|<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g) ?? [];
const fragment = [titel, '<script>document.documentElement.classList.add("kladde")</script>', ...tags, body.trim()].join('\n');
writeFileSync(join(mappe, 'artifact.html'), `${fragment}\n`);
console.log(`preview: ${htmlFiler.length} sider, artifact.html med ${tags.length} tags`);
