/**
 * Alle tal til prisberegneren. Priser rettes her og ingen andre steder.
 *
 * ALLE BELØB ER EKSKL. MOMS. Beregneren lægger moms på for private.
 * ALLE PRISER ER PLADSHOLDERE, indtil kunden har sendt sin prisliste.
 * Tjek dem mod rigtige tilbud i calibration.cases.js, før siden går live.
 */
export default {
  moms: 0.25,
  opstart: 2400, // fast beløb pr. opgave: maskiner, afdækning, kørsel i zonen
  minimumspris: 9600, // laveste pris for en opgave
  basisUsikkerhed: 0.05, // ±5 % tilbage, når alt er besvaret (adgang, rummets form)
  afrunding: 500, // lav rundes ned, høj rundes op
  minM2: 5,
  maksM2: 250, // over det: ingen tal, "store gulve prissætter vi efter besigtigelse"

  rum: {
    garage: {
      navn: 'Garage',
      beskrivelse: 'Carport og værksted derhjemme',
      standardAreal: 36,
      vaegFaktor: 0.75, // andel af væggene, der kan få hulkehl (porten tæller ikke)
      anbefalet: 'flakes',
      erhverv: false,
    },
    kaelder: {
      navn: 'Kælder',
      beskrivelse: 'Fyrrum, vaskerum, hobbyrum',
      standardAreal: 40,
      vaegFaktor: 0.9,
      anbefalet: 'ensfarvet',
      erhverv: false,
    },
    bolig: {
      navn: 'Bolig',
      beskrivelse: 'Køkken, stue og gang',
      standardAreal: 50,
      vaegFaktor: 0.85,
      anbefalet: 'metallic',
      erhverv: false,
    },
    erhverv: {
      navn: 'Erhverv',
      beskrivelse: 'Værksted, lager og butik',
      standardAreal: 120,
      vaegFaktor: 0.8,
      anbefalet: 'ensfarvet',
      erhverv: true, // priser vises ekskl. moms
    },
  },

  overflader: {
    ensfarvet: {
      navn: 'Ensfarvet epoxy',
      beskrivelse: 'Én farve, blank og glat. Klassikeren til garage og kælder.',
      prisPrM2: 240,
    },
    flakes: {
      navn: 'Flakes',
      beskrivelse: 'Farvede chips i epoxyen. Skjuler snavs og giver greb.',
      prisPrM2: 340,
    },
    metallic: {
      navn: 'Metallic',
      beskrivelse: 'Pigmenter, der flyder i mønstre. Hvert gulv bliver unikt.',
      prisPrM2: 620,
    },
  },

  stand: {
    paen: { navn: 'Pæn beton', beskrivelse: 'Hel og tør, uden maling', prisPrM2: 0 },
    revner: { navn: 'Revner og huller', beskrivelse: 'Repareres, før vi lægger epoxy', prisPrM2: 50 },
    maling: { navn: 'Maling eller belægning skal af', beskrivelse: 'Slibes helt af', prisPrM2: 90 },
  },

  tilvalg: {
    hulkehl: {
      navn: 'Hulkehl langs væggen',
      beskrivelse: 'Afrundet overgang fra gulv til væg. Ingen hjørner, hvor snavs samler sig.',
      type: 'lbm', // pris pr. løbende meter. Meter estimeres ud fra m² og rum
      pris: 150,
    },
    skridsikker: {
      navn: 'Skridsikker overflade',
      beskrivelse: 'Kvartssand i toplaget. God ved vand og olie.',
      type: 'm2',
      pris: 35,
    },
  },

  // Vises i resultatet og på siden. Kundens egne tider skal ind her.
  tid: {
    arbejdsdage: '2-3 arbejdsdage',
    gaaPaa: 'Gå på det efter 24 timer',
    koerPaa: 'Kør bil på det efter 7 døgn',
  },

  // Farver ændrer ikke prisen. Hex er kun til visning og ca. RAL-farven.
  farver: [
    { kode: '7035', navn: 'Lysgrå', hex: '#C9CDC9' },
    { kode: '7040', navn: 'Vinduesgrå', hex: '#9BA1A4' },
    { kode: '7016', navn: 'Antracitgrå', hex: '#3A4044' },
    { kode: '1015', navn: 'Lys elfenben', hex: '#E3D3B6' },
  ],
  standardFarve: '7040',

  // Lagene i snittet. Tykkelser er pladsholdere, indtil kunden har sendt deres opbygning.
  lag: {
    toplak: { navn: 'Toplak', beskrivelse: 'PU, klar og blank', mm: '0,1 mm' },
    flakes: { navn: 'Flakes', beskrivelse: 'Blanding efter farvekort', mm: '' },
    metallic: { navn: 'Metallic', beskrivelse: 'Pigment i grundlaget', mm: '' },
    grundlag: { navn: 'Grundlag', beskrivelse: 'Epoxy', mm: '1,5 mm' },
    primer: { navn: 'Primer', beskrivelse: 'Epoxy-primer', mm: '0,3 mm' },
    forbehandling: { navn: 'Forbehandling', beskrivelse: 'Diamantslibning', mm: '' },
  },

  zone: {
    // Kommuner inden for ca. 60 km af Silkeborg. Et postnummer er i zonen, hvis det
    // dækker mindst én af dem. Skal bekræftes af kunden.
    // 740 Silkeborg, 746 Skanderborg, 751 Aarhus, 756 Ikast-Brande, 791 Viborg,
    // 710 Favrskov, 730 Randers, 615 Horsens, 657 Herning, 766 Hedensted, 727 Odder
    kommuner: [740, 746, 751, 756, 791, 710, 730, 615, 657, 766, 727],
    ekstraPostnumre: [],
    udelukPostnumre: [],
  },
};
