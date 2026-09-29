// Laver src/calculator/postnumre.json ud fra PostNords postnummerfil.
// Kilde: npm-pakken dk-postals (ISC), som er PostNords officielle fil fra 17.10.2020.
//
//   npm pack dk-postals@1.0.0 && tar xzf dk-postals-1.0.0.tgz
//   node scripts/postnumre-fra-csv.mjs package/postals.csv
//
// Format: { "8600": ["Silkeborg", [740, 746, 756]], ... }  (bynavn, kommunekoder)
import fs from 'node:fs';

const kilde = process.argv[2];
if (!kilde) {
  console.error('Brug: node scripts/postnumre-fra-csv.mjs <postals.csv>');
  process.exit(1);
}

const linjer = fs.readFileSync(kilde, 'utf8').replace(/^﻿/, '').split(/\r?\n/).slice(1);
const postnumre = {};
for (const linje of linjer) {
  const [, , kommune, , postnr, bynavn] = linje.split(';');
  if (!postnr || !bynavn) continue;
  const nr = Number(postnr);
  // Under 1000 er næsten kun virksomheds- og pakkecenternumre. Høje Taastrup (0800) er den undtagelse, der er et rigtigt område.
  if (nr < 1000 && postnr !== '0800') continue;
  const post = (postnumre[postnr] ??= [bynavn.trim(), []]);
  const kode = Number(kommune);
  if (!post[1].includes(kode)) post[1].push(kode);
}
for (const post of Object.values(postnumre)) post[1].sort((a, b) => a - b);

const ud = new URL('../src/calculator/postnumre.json', import.meta.url);
fs.writeFileSync(ud, JSON.stringify(postnumre));
console.log(`${Object.keys(postnumre).length} postnumre skrevet til ${ud.pathname}`);
