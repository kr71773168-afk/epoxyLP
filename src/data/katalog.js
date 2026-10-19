/**
 * Gulvkataloget (/gulvtyper/): gulvtyperne med farver. Billederne ligger i src/media/katalog/<slug>-<farve>.jpg
 * og de små prøver i src/media/katalog/proeve/ med samme navn. Billederne er visualiseringer (scripts/katalog),
 * og farverne er eksempler. Skift til kundens egne fotos og farvekort, når de er klar: samme filnavne, eller nye farver her.
 */
export const katalog = [
  {
    slug: 'industri',
    navn: 'Industrigulv / tolagsgulv',
    tekst: 'Et slidstærkt epoxygulv i to lag: en primer, der lukker betonen, og et tykt, blankt slidlag ovenpå. Tåler trucks, olie og hård rengøring.',
    egnet: ['Værksted', 'Lager', 'Produktion'],
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
    tekst: 'Farvede flager drysset i epoxyen og forseglet med en klar toplak. Overfladen skjuler støv og hjulspor og giver lidt greb under fødderne.',
    egnet: ['Garage', 'Kælder', 'Bryggers'],
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
    tekst: 'Farvet kvartssand i klar epoxy. Et meget slidstærkt og skridsikkert gulv med en let ru overflade, der stadig er nem at gøre ren.',
    egnet: ['Entré', 'Køkken', 'Vådrum', 'Butik'],
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
    tekst: 'Et polyurethangulv med en rolig, mat overflade. Det er en smule elastisk, så det er behageligt og stille at gå på. Ét sammenhængende gulv uden fuger.',
    egnet: ['Bolig', 'Kontor', 'Institution'],
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
    tekst: 'Små runde natursten bundet i klar epoxy. Et naturligt, åbent udtryk, der er rart at gå på og kan lægges både inde og ude.',
    egnet: ['Entré', 'Bad', 'Terrasse', 'Altan'],
    farver: [
      { slug: 'carrara', navn: 'Carrara hvid' },
      { slug: 'graa', navn: 'Grå mix' },
      { slug: 'botticino', navn: 'Botticino beige' },
      { slug: 'nero', navn: 'Nero sort' },
    ],
  },
];
