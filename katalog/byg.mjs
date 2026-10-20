/**
 * Bygger gulvkataloget som en selvstændig side: katalog/dist/index.html + katalog/dist/img/*.webp.
 * dist/artifact.html er samme side uden <html>/<head>-rammen (til preview-artifacten, der selv sætter rammen på).
 * Siden er ikke en del af hjemmesiden. Den kan lægges op hvor som helst som en almindelig mappe.
 *
 *   node katalog/byg.mjs
 *
 * Data og tekster: data.js. Ikoner: ikoner.js. Telefon, mail og firmanavn hentes fra src/data/firma.js, så de kun står ét sted.
 */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { firma } from '../src/data/firma.js';
import { katalog } from './data.js';
import { ikoner } from './ikoner.js';

const her = (f) => fileURLToPath(new URL(f, import.meta.url));
const ud = her('./dist/');
fs.rmSync(ud, { recursive: true, force: true });
fs.mkdirSync(`${ud}img`, { recursive: true });

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ikon = (navn, klasse = '') => `<svg class="ik ${klasse}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ikoner[navn]}</svg>`;

/** Laver webp i de ønskede bredder og giver src, srcset og størrelse tilbage */
async function billede(kilde, navn, bredder, kvalitet = 78) {
  const meta = await sharp(kilde).metadata();
  const filer = [];
  for (const b of bredder.filter((b) => b <= meta.width)) {
    const fil = `img/${navn}-${b}.webp`;
    await sharp(kilde).resize(b).webp({ quality: kvalitet }).toFile(ud + fil);
    filer.push({ fil, b });
  }
  if (!filer.length) throw new Error(`For lille billede: ${kilde}`);
  const stoerst = filer.at(-1);
  return {
    src: stoerst.fil,
    srcset: filer.map((f) => `${f.fil} ${f.b}w`).join(', '),
    w: stoerst.b,
    h: Math.round((stoerst.b * meta.height) / meta.width),
  };
}
const kilde = (sti) => {
  const fuld = her(`./billeder/${sti}`);
  if (!fs.existsSync(fuld)) throw new Error(`Billede mangler: katalog/billeder/${sti}`);
  return fuld;
};

// Baggrunden i toppen: videoen fra et job (samme klip som på hjemmesiden) med stillbilledet som plakat
const video = her('../src/media/');
fs.mkdirSync(`${ud}video`);
for (const f of ['arbejde.mp4', 'arbejde.webm']) fs.copyFileSync(video + f, `${ud}video/${f}`);
const plakat = await billede(video + 'arbejde.jpg', 'arbejde', [640, 1280]);
const typer = [];
for (const g of katalog) {
  const farver = [];
  for (const f of g.farver) {
    const n = `${g.slug}-${f.slug}`;
    farver.push({
      ...f,
      stor: await billede(kilde(`overflader/${n}.jpg`), n, [900, 1600], 80),
      flade: await billede(kilde(`overflader/flade/${n}.jpg`), `${n}-flade`, [360, 640], 80),
      proeve: await billede(kilde(`overflader/proeve/${n}.jpg`), `${n}-proeve`, [96], 80),
    });
  }
  typer.push({ ...g, scene: await billede(kilde(`fotos/scene-${g.slug}.jpg`), `scene-${g.slug}`, [334], 82), farver });
}

const farvetekst = (f) => (f.kode ? ` · ${esc(f.kode)}` : '');
const proever = (g) => g.farver.map((f, i) => `
            <button type="button" role="radio" class="proeve" aria-checked="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-type="${g.slug}" data-farve="${f.slug}" data-navn="${esc(f.navn)}" data-kode="${esc(f.kode ?? '')}" aria-label="${esc(f.kode ? `${f.navn}, ${f.kode}` : f.navn)}"><img src="${f.proeve.src}" alt="" width="48" height="48" loading="lazy" decoding="async"></button>`).join('');

const kort = typer.map((g, gi) => `
      <li>
        <article class="kort" id="${g.slug}" aria-labelledby="${g.slug}-titel">
          <div class="foto"><img src="${g.scene.src}" alt="" width="${g.scene.w}" height="${g.scene.h}" ${gi < 2 ? '' : 'loading="lazy" '}decoding="async"></div>
          <button type="button" class="flade" data-forstoer="${g.slug}">${g.farver.map((f, i) => `
            <img src="${f.flade.src}" srcset="${f.flade.srcset}" sizes="(max-width: 600px) 92vw, 320px" alt="" loading="lazy" decoding="async" data-farve="${f.slug}"${i ? ' hidden' : ''}>`).join('')}
            <span class="flade-tekst">${ikon('forstoer')}Se i stort<span class="vh"> ${esc(g.navn)}</span></span>
          </button>
          <div class="krop">
            <h2 id="${g.slug}-titel">${esc(g.navn)}</h2>
            <div class="farver">
              <div class="proever" role="radiogroup" aria-label="Farver til ${esc(g.navn)}">${proever(g)}
              </div>
              <p class="farvenavn" aria-live="polite">Farve: <b data-navn-for="${g.slug}">${esc(g.farver[0].navn)}</b><span data-kode-for="${g.slug}">${farvetekst(g.farver[0])}</span></p>
            </div>
            <p class="tekst">${esc(g.tekst)}</p>
            <ul class="fordele">${g.fordele.map((f) => `
              <li><span class="fordel-ikon">${ikon(f.ikon)}</span>${esc(f.tekst)}</li>`).join('')}
            </ul>
          </div>
          <a class="bjaelke" href="#kontakt"><span>${esc(g.bjaelke)}</span>${ikon('pil')}</a>
        </article>
      </li>`).join('');

const loefter = [
  { ikon: 'skjold', titel: firma.garanti, tekst: 'på gulvet, skrevet ind i aftalen' },
  { ikon: 'kontrakt', titel: 'Fast pris', tekst: 'på skrift, før vi går i gang' },
  { ikon: 'besigtigelse', titel: 'Gratis besigtigelse', tekst: 'med rigtige prøver i dit eget lys' },
  { ikon: 'sted', titel: 'Lokalt firma', tekst: 'i Silkeborg og 60 km omkring' },
];

const stor = `
  <dialog class="stor" id="stor" aria-labelledby="stor-titel">
    <div class="stor-hoved">
      <div>
        <h2 id="stor-titel">${typer.map((g) => `<span data-stor-type="${g.slug}" hidden>${esc(g.navn)}</span>`).join('')}</h2>
        <p class="farvenavn">${typer.map((g) => `<span data-stor-type="${g.slug}" hidden>Farve: <b data-navn-for="${g.slug}">${esc(g.farver[0].navn)}</b><span data-kode-for="${g.slug}">${farvetekst(g.farver[0])}</span></span>`).join('')}</p>
      </div>
      <button type="button" class="luk" data-luk aria-label="Luk"><span aria-hidden="true">×</span></button>
    </div>
    <div class="stor-billede">${typer.map((g) => g.farver.map((f) => `
      <img src="${f.stor.src}" srcset="${f.stor.srcset}" sizes="(max-width: 1100px) 100vw, 1060px" alt="${esc(`${g.navn} i ${f.navn.toLowerCase()}`)}" loading="lazy" decoding="async" data-type="${g.slug}" data-farve="${f.slug}" hidden>`).join('')).join('')}
    </div>
    <div class="stor-fod">${typer.map((g) => `
      <div class="proever" role="radiogroup" aria-label="Farver til ${esc(g.navn)}" data-stor-type="${g.slug}" hidden>${proever(g)}
      </div>`).join('')}
      <a class="knap knap-groen" href="#kontakt" data-luk-link>Spørg om prøver</a>
    </div>
  </dialog>`;

const css = fs.readFileSync(her('./side.css'), 'utf8');
const js = fs.readFileSync(her('./side.js'), 'utf8');

const html = `<title>Silkeborg Epoxy Gulvtyper</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Industrigulv, Flake Floor, Color Quartz, PU-gulv og stentæppe fra Silkeborg Epoxy. Se overfladerne, tryk på en farve, og find det gulv, der passer til dig.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400..800&display=swap">
<style>
${css}
</style>

<header class="top">
  <div class="kol top-indre">
    <a class="logo" href="#top" aria-label="${esc(firma.navn)}, til toppen">
      <svg class="logo-maerke" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#1D2925"/><path d="M4.5 20 16 13.6 27.5 20 16 26.4z" fill="#6F9282"/><path d="M10.2 20.9 17.6 16.8" stroke="#fff" stroke-opacity=".55" stroke-width="1.3" stroke-linecap="round"/><path d="M16 4.2c2.7 3.1 4.1 5.1 4.1 7a4.1 4.1 0 0 1-8.2 0c0-1.9 1.4-3.9 4.1-7z" fill="#DCE7E1"/></svg>
      <span>Silkeborg <b>Epoxy</b></span>
    </a>
    <a class="knap knap-groen top-knap" href="#kontakt">Kontakt os</a>
  </div>
</header>

<main id="top">
  <section class="hero" aria-labelledby="titel">
    <img class="hero-billede" src="${plakat.src}" srcset="${plakat.srcset}" sizes="100vw" alt="" fetchpriority="high">
    <video class="hero-video" muted loop playsinline preload="none" poster="${plakat.src}" aria-hidden="true" data-video>
      <source src="video/arbejde.webm" type="video/webm">
      <source src="video/arbejde.mp4" type="video/mp4">
    </video>
    <button type="button" class="video-knap" data-video-knap aria-pressed="false"><span class="video-ikon" aria-hidden="true"></span><span data-video-tekst>Stop video</span></button>
    <div class="kol hero-indre">
      <p class="tag">Stærke gulve<br>til krævende miljøer</p>
      <h1 id="titel">Vores<br>gulvtyper</h1>
      <p class="hero-tekst">Vi tilbyder en række slidstærke og flotte gulvløsninger, der kombinerer funktion, holdbarhed og et godt udtryk. Her er vores fem gulvtyper. Tryk på en farve, og se overfladen.</p>
      <nav class="hop" aria-label="Gulvtyperne">${typer.map((g) => `<a href="#${g.slug}">${esc(g.navn)}</a>`).join('')}</nav>
    </div>
  </section>

  <div class="kol kort-ramme">
    <ul class="kort-liste">${kort}
    </ul>
    <p class="note">Fotos og overflader er eksempler, og farverne er visualiseringer. Ved den gratis besigtigelse viser vi rigtige prøver, så du kan se farven i dit eget lys.</p>
  </div>

  <section class="kontakt" id="kontakt" aria-labelledby="kontakt-titel">
    <div class="kol kontakt-indre">
      <div class="kontakt-tekst">
        <h2 id="kontakt-titel">Vil du se prøverne i virkeligheden?</h2>
        <p>Ring eller skriv, så kommer vi forbi med rigtige prøver og giver dig en fast pris på skrift. Besigtigelsen er gratis.</p>
      </div>
      <div class="kontakt-felter">
        <div class="kontakt-felt">
          <span class="kontakt-ikon">${ikon('telefon')}</span>
          <div><span class="kontakt-label">Telefon · ${esc(firma.aabningstider)}</span><a class="kontakt-vaerdi" href="tel:${esc(firma.telefonLink)}">${esc(firma.telefon)}</a></div>
          <button type="button" class="kopier" data-kopier="${esc(firma.telefon)}">Kopiér</button>
        </div>
        <div class="kontakt-felt">
          <span class="kontakt-ikon"><svg class="ik" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></span>
          <div><span class="kontakt-label">Mail</span><a class="kontakt-vaerdi" href="mailto:${esc(firma.mail)}">${esc(firma.mail)}</a></div>
          <button type="button" class="kopier" data-kopier="${esc(firma.mail)}">Kopiér</button>
        </div>
      </div>
    </div>
  </section>

  <section class="loefter" aria-label="Det får du hos os">
    <ul class="kol loefter-liste">${loefter.map((l) => `
      <li>${ikon(l.ikon, 'loefte-ikon')}<p><b>${esc(l.titel)}</b><span>${esc(l.tekst)}</span></p></li>`).join('')}
    </ul>
  </section>
</main>

<footer class="fod">
  <div class="kol fod-indre">
    <p>© ${new Date().getFullYear()} ${esc(firma.juridiskNavn)} · CVR ${esc(firma.cvr)}</p>
    <p>${esc(firma.adresse.vej)}, ${esc(firma.adresse.postnr)} ${esc(firma.adresse.by)}</p>
  </div>
</footer>
${stor}

<script>
${js}
</script>
`;
fs.writeFileSync(`${ud}artifact.html`, html);
fs.writeFileSync(`${ud}index.html`, `<!doctype html>
<html lang="da">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
</head>
<body>
${html}</body>
</html>
`);
const filer = fs.readdirSync(`${ud}img`);
const kb = filer.reduce((s, f) => s + fs.statSync(`${ud}img/${f}`).size, 0) / 1024;
console.log(`katalog/dist: index.html (${(html.length / 1024).toFixed(0)} kB) + ${filer.length} billeder (${kb.toFixed(0)} kB)`);
