/**
 * Gulvkataloget: en selvstændig side (ikke en del af hjemmesiden), bygget som en brochure med et kort pr. gulvtype.
 * Bygges med `node katalog/byg.mjs` til katalog/dist/.
 * - fotoet øverst på kortet: billeder/fotos/scene-<slug>.jpg
 * - farverne: overfladen i billeder/overflader/flade/<slug>-<farve>.jpg, den store visning i billeder/overflader/<slug>-<farve>.jpg
 *   og den runde prøve i billeder/overflader/proeve/. Overfladerne er visualiseringer (render/), farverne er eksempler.
 * - fordele: fire linjer med ikon (navnene står i ikoner.js)
 * - bjaelke: teksten i den grønne bjælke nederst på kortet. Den fører ned til kontakt.
 * Skift til kundens egne fotos og farvekort, når de er klar: samme filnavne, eller nye farver her.
 */
export const katalog = [
  {
    slug: 'industri',
    navn: 'Industrigulv / tolagsgulv',
    tekst: 'Et robust og slidstærkt gulv med høj kemikalieresistens og lang levetid. Ideelt til industrien, lagerhaller, værksteder og andre krævende miljøer.',
    fordele: [
      { ikon: 'lag', tekst: 'Meget slidstærkt' },
      { ikon: 'kemi', tekst: 'Høj kemikalieresistens' },
      { ikon: 'rengoering', tekst: 'Nem rengøring' },
      { ikon: 'skjold', tekst: 'Lang levetid' },
    ],
    bjaelke: 'Perfekt til industri og lager',
    farver: [
      { slug: 'antracit', navn: 'Antracit', kode: 'RAL 7016' },
      { slug: 'lysegraa', navn: 'Lysegrå', kode: 'RAL 7035' },
      { slug: 'kiselgraa', navn: 'Kiselgrå', kode: 'RAL 7032' },
      { slug: 'soelvgraa', navn: 'Sølvgrå', kode: 'RAL 7001' },
      { slug: 'roedbrun', navn: 'Oxydrød', kode: 'RAL 3009' },
    ],
  },
  {
    slug: 'flakes',
    navn: 'Flake Floor',
    tekst: 'Et dekorativt og slidstærkt gulv med farveflager, der giver et unikt udtryk og en struktureret overflade. Velegnet til både private og erhverv.',
    fordele: [
      { ikon: 'palet', tekst: 'Dekorativt udtryk' },
      { ikon: 'fodspor', tekst: 'Skridsikker overflade' },
      { ikon: 'lag', tekst: 'Slidstærkt' },
      { ikon: 'farvekort', tekst: 'Mange farvekombinationer' },
    ],
    bjaelke: 'Et populært valg til både privat og erhverv',
    farver: [
      { slug: 'graa', navn: 'Grå mix' },
      { slug: 'beige', navn: 'Beige mix' },
      { slug: 'blaa', navn: 'Blå mix' },
      { slug: 'sort-hvid', navn: 'Sort og hvid' },
    ],
  },
  {
    slug: 'kvarts',
    navn: 'Color Quartz',
    tekst: 'Et elegant og stærkt gulv med farvet kvartssand, der giver en ensartet og stilren overflade. Kombinerer høj slidstyrke med et eksklusivt udtryk.',
    fordele: [
      { ikon: 'diamant', tekst: 'Eksklusivt og moderne udtryk' },
      { ikon: 'lag', tekst: 'Meget slidstærkt' },
      { ikon: 'fodspor', tekst: 'Skridsikker overflade' },
      { ikon: 'farvekort', tekst: 'Flere farvemuligheder' },
    ],
    bjaelke: 'Ideel til erhverv og repræsentative miljøer',
    farver: [
      { slug: 'granit', navn: 'Granit' },
      { slug: 'sand', navn: 'Sand' },
      { slug: 'grafit', navn: 'Grafit' },
      { slug: 'terracotta', navn: 'Terracotta' },
    ],
  },
  {
    slug: 'pu',
    navn: 'PU-gulv',
    tekst: 'Et elastisk og komfortabelt gulv med god kemikalieresistens og høj hygiejne. Velegnet til miljøer med krav til komfort, lyddæmpning og rengøringsvenlighed.',
    fordele: [
      { ikon: 'elastisk', tekst: 'Elastisk og komfortabelt' },
      { ikon: 'kemi', tekst: 'Høj kemikalieresistens' },
      { ikon: 'lyd', tekst: 'Lyddæmpende' },
      { ikon: 'rengoering', tekst: 'Meget rengøringsvenligt' },
    ],
    bjaelke: 'Velegnet til bl.a. fødevarer og sundhed',
    farver: [
      { slug: 'lysegraa', navn: 'Lysegrå' },
      { slug: 'varmgraa', navn: 'Varm grå' },
      { slug: 'sand', navn: 'Sand' },
      { slug: 'antracit', navn: 'Antracit' },
    ],
  },
  {
    slug: 'sten',
    navn: 'Stentæppe',
    tekst: 'Et naturligt og dekorativt gulv med små sten, der giver en smuk, skridsikker og holdbar overflade. Ideelt til udendørsarealer, indgange og terrasser.',
    fordele: [
      { ikon: 'blad', tekst: 'Naturligt og dekorativt udtryk' },
      { ikon: 'fodspor', tekst: 'Skridsikker overflade' },
      { ikon: 'sol', tekst: 'Velegnet til ude og inde' },
      { ikon: 'skjold', tekst: 'Lang holdbarhed' },
    ],
    bjaelke: 'Perfekt til udendørsarealer og indgange',
    farver: [
      { slug: 'carrara', navn: 'Carrara hvid' },
      { slug: 'graa', navn: 'Grå mix' },
      { slug: 'botticino', navn: 'Botticino beige' },
      { slug: 'nero', navn: 'Nero sort' },
    ],
  },
];
