/**
 * Ydelserne. Hver bliver en side via src/pages/[ydelse].astro.
 * `rum` vælger rummet på forhånd i beregneren, `overflade` vælger overfladen.
 * `billede` er et foto i src/media/foto, `kortBillede` et lille billede i src/media/valg.
 * Fotoene er stillbilleder fra kundens video og renderede gulve (gulv-*.jpg). Alle er pladsholdere,
 * indtil der er billeder af kundens færdige gulve.
 * `farver` vises som farveprøver på gulvtypesiderne: `hex` er en flad farve, `billede` en fil i src/media/farver.
 * `guides` er slugs fra src/data/viden.js.
 */
export const ydelser = [
  {
    slug: 'garagegulv',
    prisTitel: 'Se prisen på dit garagegulv',
    fordeleTitel: 'Det får du med et epoxygulv i garagen',
    gruppe: 'privat',
    navn: 'Garagegulv',
    kort: 'Tåler bil, olie og vejsalt. Og det er nemt at feje.',
    titel: 'Garagegulv i epoxy · Se prisen med det samme',
    beskrivelse: 'Nyt garagegulv i epoxy, der tåler bil, olie og vejsalt. Se prisen på dit garagegulv på et minut. Silkeborg og 60 km omkring.',
    h1: 'Garagegulv i epoxy',
    intro: 'Et epoxygulv gør garagen til et rum, du har lyst til at være i. Det tåler bilen, olien og vejsaltet, og snavset fejer du bare af.',
    billede: 'gulv-flakes',
    kortBillede: 'rum-garage',
    rum: 'garage',
    fordele: [
      { titel: 'Tåler bil og dæk', tekst: 'Vi bygger gulvet op i lag med primer, epoxy og toplak, så varme dæk ikke trækker belægningen af.' },
      { titel: 'Ingen betonstøv', tekst: 'Betonen bliver forseglet. Støvet fra gulvet forsvinder, og olie og vand trænger ikke ned.' },
      { titel: 'Nemt at holde rent', tekst: 'En fugefri overflade uden revner og samlinger. Gulvskraber og vand er nok.' },
      { titel: 'Greb under fødderne', tekst: 'Med flakes eller kvartssand i toplaget står du sikkert, også når gulvet er vådt.' },
    ],
    afsnit: [
      {
        titel: 'Hvilken overflade passer til en garage?',
        tekst: 'De fleste vælger flakes. De farvede chips skjuler snavs og hjulspor og giver gulvet lidt struktur. Ensfarvet epoxy er billigere og ser skarpt ud, men viser støv og spor mere. Står bilen tit våd i garagen, anbefaler vi kvartssand i toplaget.',
      },
      {
        titel: 'Sådan laver vi et garagegulv',
        tekst: 'Vi sliber betonen, så epoxyen kan hæfte, og reparerer revner og huller. Så kommer primer, grundlag og eventuelt flakes, og til sidst en toplak. Et almindeligt garagegulv tager 2-3 arbejdsdage. Du kan gå på det efter et døgn og køre bil på det efter cirka en uge.',
      },
    ],
    faq: [
      { spg: 'Kan jeg køre bil på et epoxygulv?', svar: 'Ja. Et rigtigt epoxysystem tåler bil, olie og vejsalt. Vent cirka en uge, til gulvet er helt hærdet, før du kører ind.' },
      { spg: 'Hvad hvis der er revner i betonen?', svar: 'Dem sliber vi op og reparerer, før vi lægger epoxy. Vælg “Revner og huller” i beregneren, så er det med i prisen.' },
      { spg: 'Hvad med porten?', svar: 'Vi afslutter gulvet pænt ved porten, så vand ikke kommer ind under belægningen. Det aftaler vi ved besigtigelsen.' },
    ],
    relaterede: ['flakesgulv', 'kaeldergulv', 'ensfarvet-epoxy'],
    guides: ['epoxy-eller-gulvmaling', 'rengoering-af-epoxygulv'],
  },
  {
    slug: 'kaeldergulv',
    prisTitel: 'Se prisen på dit kældergulv',
    fordeleTitel: 'Det får du med et epoxygulv i kælderen',
    gruppe: 'privat',
    navn: 'Kældergulv',
    kort: 'Et lyst, tørt og støvfrit gulv i fyrrum, vaskerum og hobbyrum.',
    titel: 'Kældergulv i epoxy · Lyst, støvfrit og nemt at gøre rent',
    beskrivelse: 'Epoxygulv i kælderen: lysere, støvfrit og nemt at holde rent. Vi måler fugt i betonen først. Se prisen på dit kældergulv på et minut.',
    h1: 'Kældergulv i epoxy',
    intro: 'Et epoxygulv gør kælderen lysere og stopper betonstøvet. Rummet bliver til at bruge, uanset om det er vaskerum, fyrrum eller hobbyrum.',
    billede: 'hal-lys',
    kortBillede: 'rum-kaelder',
    rum: 'kaelder',
    fordele: [
      { titel: 'Vi måler fugt først', tekst: 'Kældre kan være fugtige. Vi måler betonen ved besigtigelsen og siger det, hvis der skal en fugtspærre på.' },
      { titel: 'Lysere rum', tekst: 'Et lyst, blankt gulv kaster lyset tilbage, så kælderen virker større og mere indbydende.' },
      { titel: 'Slut med betonstøv', tekst: 'Gulvet bliver forseglet, så der ikke hele tiden kommer nyt støv op fra betonen.' },
      { titel: 'Hulkehl mod vand', tekst: 'En afrundet overgang mellem gulv og væg, så vand og snavs ikke samler sig i hjørnerne.' },
    ],
    afsnit: [
      {
        titel: 'Fugt i kælderen',
        tekst: 'Fugt er det vigtigste at have styr på i en kælder. Er betonen for fugtig, slipper epoxyen. Derfor måler vi altid ved besigtigelsen. Er der behov for en fugtspærre, får du det at vide, før du siger ja, og så er det med i den faste pris.',
      },
      {
        titel: 'Ensfarvet eller flakes?',
        tekst: 'I de fleste kældre vælger folk ensfarvet epoxy i en lys grå. Det er det billigste og gør rummet lyst. I vaskerum og bryggers kan flakes eller kvartssand være et godt valg, fordi gulvet ofte bliver vådt.',
      },
    ],
    faq: [
      { spg: 'Kan man lægge epoxy i en fugtig kælder?', svar: 'Ja, men så skal der en fugtspærre på først. Vi måler fugten ved besigtigelsen og siger, hvad der skal til.' },
      { spg: 'Kan I komme til gennem en smal kældertrappe?', svar: 'Ja. Vi har udstyr, der kan bæres ned. Fortæl gerne om adgangen, når du sender din forespørgsel.' },
      { spg: 'Lugter det?', svar: 'Epoxy lugter lidt, mens det hærder. Vi sørger for udluftning, og lugten er væk efter et par dage.' },
    ],
    relaterede: ['ensfarvet-epoxy', 'garagegulv', 'gulv-i-boligen'],
    guides: ['hvor-laenge-holder-et-epoxygulv', 'epoxy-paa-fliser'],
  },
  {
    slug: 'gulv-i-boligen',
    prisTitel: 'Se prisen på dit nye gulv',
    fordeleTitel: 'Derfor vælger folk et fugefrit gulv',
    gruppe: 'privat',
    navn: 'Gulv i boligen',
    kort: 'Fugefrie gulve i køkken, stue, gang og bryggers.',
    titel: 'Epoxygulv i boligen · Fugefrit gulv i køkken og stue',
    beskrivelse: 'Fugefrit gulv i epoxy eller metallic til køkken, stue, gang og bryggers. Tåler gulvvarme. Se prisen på dit nye gulv på et minut.',
    h1: 'Fugefrit gulv i boligen',
    intro: 'Et støbt gulv uden fuger giver et roligt, moderne udtryk og er nemt at holde rent. Det passer til køkken, stue, gang og bryggers.',
    billede: 'gulv-bolig',
    kortBillede: 'rum-bolig',
    rum: 'bolig',
    fordele: [
      { titel: 'Ingen fuger', tekst: 'Ét sammenhængende gulv gennem hele rummet. Intet snavs i fugerne og et roligt udtryk.' },
      { titel: 'Virker med gulvvarme', tekst: 'Gulvet er tyndt og leder varmen godt, så det fungerer fint sammen med gulvvarme.' },
      { titel: 'Holder farven', tekst: 'Vi slutter af med en UV-stabil toplak, så gulvet ikke gulner, hvor solen falder ind.' },
      { titel: 'Dit eget udtryk', tekst: 'Fra helt rolig ensfarvet til metallic, hvor hvert gulv bliver unikt.' },
    ],
    afsnit: [
      {
        titel: 'Metallic eller ensfarvet?',
        tekst: 'Metallic giver dybde og bevægelse i gulvet. Pigmenterne flyder, mens gulvet hærder, så to gulve aldrig bliver ens. Ensfarvet er roligere og billigere. Vi har prøver med, når vi kommer ud, så du kan se forskellen i dit eget lys.',
      },
      {
        titel: 'Hvad med det gulv, der ligger nu?',
        tekst: 'Vi kan lægge på beton og på mange eksisterende gulve, fx fliser. Ligger der trægulv eller vinyl, skal det af først. Vi kigger på det ved besigtigelsen og fortæller, hvad der skal til.',
      },
    ],
    faq: [
      { spg: 'Er et epoxygulv koldt at gå på?', svar: 'Det føles som et stengulv. Med gulvvarme er det behageligt, og gulvet leder varmen godt.' },
      { spg: 'Bliver det glat?', svar: 'Overfladen kan laves mere eller mindre mat. I bryggers og gang kan vi lægge lidt struktur i toplaget, så det ikke bliver glat.' },
      { spg: 'Kan vi bo i huset imens?', svar: 'Ja, men rummet kan ikke bruges, mens vi arbejder og gulvet hærder. Du kan gå på det efter et døgn.' },
    ],
    relaterede: ['metallic-epoxy', 'ensfarvet-epoxy', 'kaeldergulv'],
    guides: ['epoxygulv-og-gulvvarme', 'epoxy-paa-fliser'],
  },
  {
    slug: 'erhvervsgulve',
    prisTitel: 'Se en pris på jeres gulv',
    fordeleTitel: 'Det får I med et epoxygulv',
    gruppe: 'erhverv',
    navn: 'Erhverv',
    kort: 'Værksted, lager, butik og showroom. Gulve, der tåler hverdagen.',
    titel: 'Epoxygulv til erhverv · Værksted, lager og butik',
    beskrivelse: 'Slidstærke epoxygulve til værksted, lager, butik og showroom. Tåler truck, olie og kemikalier. Se en vejledende pris ekskl. moms på et minut.',
    h1: 'Gulve til værksted, lager og butik',
    intro: 'Et epoxygulv tåler truck, palleløfter, olie og kemikalier. Og det er hurtigt at gøre rent, så det ser ordentligt ud, når kunderne kommer.',
    billede: 'arbejde-primer',
    kortBillede: 'rum-erhverv',
    rum: 'erhverv',
    fordele: [
      { titel: 'Tåler trafik', tekst: 'Truck, palleløfter og tunge maskiner. Vi vælger opbygning efter, hvor hårdt gulvet bliver brugt.' },
      { titel: 'Kemikalier og olie', tekst: 'En tæt overflade, som olie og de fleste kemikalier ikke trænger ned i.' },
      { titel: 'Skridsikkert', tekst: 'Kvartssand i toplaget giver greb, hvor der er vand, olie eller spild.' },
      { titel: 'Planlagt efter jer', tekst: 'Vi kan dele gulvet op og arbejde i weekender, så I kan holde åbent.' },
    ],
    afsnit: [
      {
        titel: 'Til hvilke rum?',
        tekst: 'Vi lægger gulve i værksteder, lagerhaller, butikker, showrooms, klinikker og produktion. Behovene er forskellige, så vi finder den rigtige opbygning ved besigtigelsen.',
      },
      {
        titel: 'Priser for erhverv',
        tekst: 'Beregneren viser priser ekskl. moms, når du vælger erhverv. Store gulve over 250 m² prissætter vi, når vi har set dem, fordi adgang, maskiner og tidsplan betyder meget for prisen.',
      },
    ],
    faq: [
      { spg: 'Kan vi holde åbent, mens I arbejder?', svar: 'Ofte, ja. Vi kan lægge gulvet i etaper eller arbejde uden for åbningstid. Det planlægger vi sammen med jer.' },
      { spg: 'Kan I lave linjer og markeringer?', svar: 'Ja, fx gangzoner og parkeringsfelter. Det aftaler vi ved besigtigelsen.' },
      { spg: 'Hvor store gulve laver I?', svar: 'Fra små værksteder til store haller. Over 250 m² giver vi en pris efter besigtigelse.' },
    ],
    relaterede: ['ensfarvet-epoxy', 'garagegulv', 'flakesgulv'],
    guides: ['hvor-laenge-holder-et-epoxygulv', 'rengoering-af-epoxygulv'],
  },
  {
    slug: 'ensfarvet-epoxy',
    prisTitel: 'Se prisen på et ensfarvet gulv',
    fordeleTitel: 'Derfor vælger folk ensfarvet',
    gruppe: 'gulvtype',
    navn: 'Ensfarvet epoxy',
    kort: 'Én farve, blank og glat. Klassikeren og det billigste valg.',
    titel: 'Ensfarvet epoxygulv · Pris og farver',
    beskrivelse: 'Ensfarvet epoxygulv i én farve: blankt, glat og nemt at holde rent. Klassikeren til garage, kælder og erhverv. Se prisen på dit gulv.',
    h1: 'Ensfarvet epoxygulv',
    intro: 'Én farve fra væg til væg. Ensfarvet epoxy er det enkleste og billigste epoxygulv, og det ser skarpt ud i både garage, kælder og erhverv.',
    billede: 'gulv-ensfarvet',
    kortBillede: 'overflade-ensfarvet',
    overflade: 'ensfarvet',
    fordele: [
      { titel: 'Det billigste valg', tekst: 'Færrest lag og mindst arbejde. Derfor er det den laveste pris pr. m².' },
      { titel: 'Rolig overflade', tekst: 'Ét roligt udtryk i en farve, du vælger fra farvekortet.' },
      { titel: 'Lyst rum', tekst: 'En lys grå kaster lyset tilbage og gør rummet større.' },
      { titel: 'Nemt at gøre rent', tekst: 'Glat og tæt. Snavs og spild tørrer du bare af.' },
    ],
    afsnit: [
      {
        titel: 'Hvornår er ensfarvet det rigtige valg?',
        tekst: 'Når du vil have et roligt og lyst rum til en lav pris, fx i kælder, værksted og bryggers. De fleste vælger en grå tone. Bemærk, at en helt ensfarvet overflade viser støv og hjulspor mere end flakes. Står der bil i garagen hver dag, er flakes ofte det bedre valg.',
      },
    ],
    farveTitel: 'Populære farver',
    farver: [
      { navn: 'Lysegrå', kode: 'RAL 7035', hex: '#C8CBC7' },
      { navn: 'Vinduesgrå', kode: 'RAL 7040', hex: '#9CA1A5' },
      { navn: 'Støvgrå', kode: 'RAL 7037', hex: '#7D7F7D' },
      { navn: 'Antracitgrå', kode: 'RAL 7016', hex: '#383E42' },
    ],
    faq: [
      { spg: 'Kan jeg vælge alle farver?', svar: 'Næsten. De mest brugte er grå toner og lyse beige. Vi har farvekort med, når vi kommer ud.' },
      { spg: 'Bliver det glat?', svar: 'Blank epoxy kan være glat, når den er våd. Vi kan lægge kvartssand i toplaget, hvor der bliver vådt.' },
    ],
    relaterede: ['flakesgulv', 'metallic-epoxy', 'garagegulv'],
    guides: ['hvor-laenge-holder-et-epoxygulv'],
  },
  {
    slug: 'flakesgulv',
    prisTitel: 'Se prisen på et flakesgulv',
    fordeleTitel: 'Derfor vælger folk flakes',
    gruppe: 'gulvtype',
    navn: 'Flakesgulv',
    kort: 'Farvede chips i epoxyen. Skjuler snavs og giver greb.',
    titel: 'Flakesgulv i epoxy · Skjuler snavs og giver greb',
    beskrivelse: 'Flakesgulv: epoxy med farvede chips, der skjuler snavs og giver greb. Populært i garager og bryggers. Se prisen på dit flakesgulv på et minut.',
    h1: 'Flakesgulv',
    intro: 'Farvede chips drysset i epoxyen og forseglet med en klar toplak. Flakes skjuler snavs og hjulspor og giver gulvet lidt struktur under fødderne.',
    billede: 'gulv-flakes-2',
    kortBillede: 'overflade-flakes',
    overflade: 'flakes',
    fordele: [
      { titel: 'Skjuler snavs', tekst: 'Chipsene gør, at støv, sand og hjulspor ikke ses så tydeligt.' },
      { titel: 'Greb', tekst: 'Overfladen får en let struktur, som gør den mindre glat.' },
      { titel: 'Mange blandinger', tekst: 'Vælg en blanding af farver, der passer til rummet.' },
      { titel: 'Stærk overflade', tekst: 'Den klare toplak beskytter chipsene og tåler bil og slid.' },
    ],
    afsnit: [
      {
        titel: 'Sådan bliver et flakesgulv lavet',
        tekst: 'Betonen bliver slebet og primet. Så lægger vi grundlaget og drysser chipsene i, mens det er vådt. Når det er hærdet, fjerner vi de løse chips og slutter af med en klar toplak.',
      },
    ],
    farveTitel: 'Populære blandinger',
    farver: [
      { navn: 'Grå mix', billede: 'flakes-graa' },
      { navn: 'Sort og hvid', billede: 'flakes-sort-hvid' },
      { navn: 'Beige mix', billede: 'flakes-beige' },
      { navn: 'Blå og grå', billede: 'flakes-blaa' },
    ],
    faq: [
      { spg: 'Hvor meget flakes skal der på?', svar: 'Fra et let drys til helt dækkende. De fleste garager får et tæt lag, fordi det skjuler mest.' },
      { spg: 'Er flakes dyrere end ensfarvet?', svar: 'Ja, lidt. Der er et ekstra trin og en klar toplak. Beregneren viser forskellen.' },
    ],
    relaterede: ['garagegulv', 'ensfarvet-epoxy', 'metallic-epoxy'],
    guides: ['epoxy-eller-gulvmaling'],
  },
  {
    slug: 'metallic-epoxy',
    prisTitel: 'Se prisen på et metallic-gulv',
    fordeleTitel: 'Derfor vælger folk metallic',
    gruppe: 'gulvtype',
    navn: 'Metallic epoxy',
    kort: 'Pigmenter, der flyder i mønstre. Hvert gulv bliver unikt.',
    titel: 'Metallic epoxygulv · Unikt gulv til bolig og showroom',
    beskrivelse: 'Metallic epoxygulv med pigmenter, der flyder i mønstre, så hvert gulv bliver unikt. Til bolig, butik og showroom. Se prisen på dit gulv.',
    h1: 'Metallic epoxygulv',
    intro: 'Metalliske pigmenter flyder i epoxyen, mens den hærder, og laver mønstre med dybde og glans. Det giver et gulv, der ikke ligner noget andet.',
    billede: 'gulv-metallic',
    kortBillede: 'overflade-metallic',
    overflade: 'metallic',
    fordele: [
      { titel: 'Unikt', tekst: 'Mønsteret opstår i gulvet. To metallic-gulve bliver aldrig ens.' },
      { titel: 'Dybde og glans', tekst: 'Pigmenterne giver et udtryk, der minder om sten eller marmor.' },
      { titel: 'Holder farven', tekst: 'En UV-stabil toplak beskytter mod gulning, hvor solen falder ind.' },
      { titel: 'Til boligen', tekst: 'Populært i køkken, stue og showrooms, hvor gulvet skal være et blikfang.' },
    ],
    afsnit: [
      {
        titel: 'Hvorfor koster metallic mere?',
        tekst: 'Metallic kræver flere lag og mere håndarbejde, og mønsteret skal styres, mens gulvet er vådt. Derfor er prisen pr. m² højere end ensfarvet og flakes.',
      },
    ],
    farveTitel: 'Farver',
    farver: [
      { navn: 'Sølv', billede: 'metallic-soelv' },
      { navn: 'Grafit', billede: 'metallic-grafit' },
      { navn: 'Kobber', billede: 'metallic-kobber' },
      { navn: 'Perlehvid', billede: 'metallic-perle' },
    ],
    faq: [
      { spg: 'Kan jeg se prøver?', svar: 'Ja. Vi har prøver med ved besigtigelsen, og vi kan lave en prøve i dit rum.' },
      { spg: 'Passer metallic i en garage?', svar: 'Det kan godt, men det viser støv og spor mere end flakes. I garager anbefaler vi oftest flakes.' },
    ],
    relaterede: ['gulv-i-boligen', 'ensfarvet-epoxy', 'flakesgulv'],
    guides: ['epoxygulv-og-gulvvarme', 'rengoering-af-epoxygulv'],
  },
];

export const ydelse = (slug) => ydelser.find((y) => y.slug === slug);
export const privat = ydelser.filter((y) => y.gruppe === 'privat');
export const erhverv = ydelser.filter((y) => y.gruppe === 'erhverv');
export const gulvtyper = ydelser.filter((y) => y.gruppe === 'gulvtype');
