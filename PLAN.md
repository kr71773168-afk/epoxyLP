# Silkeborg Epoxy · landingpage med prisberegner

**Status:** Udkast v0.3 er bygget (29.09.2026): lyst og enkelt design, prisberegneren stiller ét spørgsmål ad gangen og viser prisen til sidst, rigtige billeder fra kundens video. Designafsnittet længere nede beskriver den første retning ("Fugefri"), som er erstattet. Se [README.md](README.md) for opsætning, pladsholdere og tjekliste før launch.
**Priser i dette dokument** er markedsniveau eller pladsholdere. De skal erstattes af kundens egne tal før noget går live.
**Visuel version med skitser** (hero-refleksion, beregner, snit, gummiskraber): https://claude.ai/artifact/EtPejGYeD86SAgKEQwpe81

---

## Kort fortalt

- **Vinklen:** Ingen af de lokale konkurrenter viser en pris. Alle kører "ring for pris" eller "få et tilbud". Silkeborg Epoxy bliver dem, der viser prisen på dit gulv på 60 sekunder. Det er hele siden.
- **Funnel:** Meta-annonce → side der matcher annoncen → 5-6 korte spørgsmål → prisinterval vises med det samme (ingen kontaktmur) → "Få fast pris" med gratis besigtigelse → tak + SMS/mail med beregningen.
- **Beregneren:** Prisen starter som et bredt interval og bliver smallere for hvert svar. Når alle svar er givet, er den ±5 %. Epoxy er selvnivellerende, og det er prisen også. Det får folk til at svare på alt.
- **Design ("Fugefri"):** Siden bygges som et epoxygulv. Én sammenhængende flade uden kasser, helt plan, med ét blankt lag på toppen. Bred og let typografi i stedet for fed. Datablad-sprog (mm, RAL, lag). Signalgul er eneste accent.
- **Teknik:** Statisk side (Vite + vanilla JS) på Netlify/Cloudflare. En lille serverfunktion tager imod leads og sender til Meta CAPI og Zapier/Make. Alle priser ligger i én config-fil, og beregningen testes mod rigtige tilbud, kunden allerede har givet.

---

## 1. Research

### Firmaet

- Jeg går ud fra, at det er **Silkeborg Epoxygulve ApS** (CVR 46299752, stiftet 27.02.2026, Hjejlevej 12, 8600 Silkeborg). Ret mig, hvis det er et andet firma.
- Laver gulve til privat, erhverv og industri. "New York"-gulve til boliger og industrigulve til virksomheder. Kører primært inden for 60 km af Silkeborg.
- Nyt firma, så ingen anmeldelser eller track record endnu. Siden skal selv skabe tilliden: åben pris, rigtige billeder, ejerens ansigt og en garanti.
- Jeg har ikke fundet en hjemmeside. Kun en profil på 3byggetilbud.

### Konkurrenter i området

| Firma | Profil | Pris på siden? |
|---|---|---|
| Vestbjerg Epoxy Gulve (Silkeborg) | Siden 2009, showroom i Silkeborg, 5 års garanti. Flakes, New York, design, garage | Nej. "Få tilbud" |
| Tyrsted Epoxy Gulve (Silkeborg/Aarhus/Viborg) | Garage, lager, industri. Min. 5 års garanti | Nej. "Få et tilbud" |
| Viborg Design, Midtjysk Gulventreprise, Haahr Gulve, Murermester M. Nielsen, GO Gulvslibning, NP Malerservice | Epoxy, PU, mikrocement | Nej. "Ring for pris" / "Kontakt os" |
| Prisportaler (epoxy-gulv-pris.dk, gulvpriser.dk, bygga.dk) | Landsdækkende "beregn din pris" | Ja, men det er portaler, ikke et lokalt firma man kan booke |

**Konklusion:** Lokalt er der ingen, der viser en pris for *dit* gulv med det samme. Beregnere findes kun hos portalerne. Det hul tager vi.

Vestbjerg er den tunge lokale konkurrent (showroom, i gang siden 2009). Vi kan ikke slå dem på historik, så vi slår dem på gennemsigtighed og fart.

### Markedspriser (sanity check, ikke vores priser)

Tallene fra prisportalerne svinger meget og har forskellige forudsætninger. De er kun til at tjekke, at kundens priser ikke ligger helt skævt.

| Type | kr/m² |
|---|---|
| Standard 2-lags epoxy (garage, kælder) | ca. 150-280 |
| Industri 3-lag | ca. 280-450 |
| Garage, alt inkl. (slibning, reparation, 2-3 lag) | ca. 300-500 |
| Flakes | ca. 400-900 |
| Special (skridsikker, ESD, fødevare) | ca. 450-600 |
| Design / New Yorker | ca. 800-1.600 |

- Garage på 20-30 m² ligger typisk omkring 16.500-20.000 kr i alt.
- Små gulve er dyrere pr. m². Opstart, afdækning og maskiner fylder relativt mere.
- Klassisk faldgrube i tilbud: slibning, spartling og fugtspærre står som tillæg. Vores beregner skal have dem med fra start, ellers lyver den.

---

## 2. Mål og KPI'er

**Mål:** Kvalificerede leads, der vil have en fast pris eller en besigtigelse.

KPI'er vi måler fra dag 1 (mål sættes efter de første 2 ugers data, ikke før):

- Besøg → startet beregning
- Startet → pris vist (frafald pr. trin)
- Pris vist → lead
- Pris pr. lead (CPL) og pris pr. **kvalificeret** lead (inden for zone, inden for 3 mdr.)
- Lead → besigtigelse → accepteret tilbud (kunden skal melde tilbage, ellers optimerer vi i blinde)

---

## 3. Funnel og flow

1. **Meta-annonce** pr. segment: garage, bolig, erhverv.
2. **Landingpage.** Overskrift og første valg matcher annoncen via URL-parameter (`?gulv=garage`).
3. **Beregner.** 5-6 spørgsmål, ét ad gangen, ca. 60 sekunder.
4. **Prisinterval** vises med det samme, sammen med hvad der er inkluderet.
5. **"Få fast pris"** (gratis besigtigelse): navn, telefon, mail, hvornår.
6. **Tak-skærm** + automatisk SMS/mail med beregningen. Firmaet ringer op inden for 24 timer på hverdage.

Sekundær konvertering: **"Send beregningen til min mail"** (kun mailfelt). Til dem, der ikke er klar endnu. Giver retargeting og en mail-opfølgning. Med i v1, det er én formular og én Zap mere.

### Pris uden kontaktmur (min anbefaling)

- Konkurrenterne gemmer prisen. At vise den er vores differentiering.
- Kold Meta-trafik stoler ikke på "indtast telefonnummer for at se prisen". Det giver frafald og falske numre.
- Dem, der sender formularen *efter* at have set prisen, har accepteret prisniveauet. Færre spildte besigtigelser og højere lukkerate.
- Minus: færre leads i alt. Bliver pris pr. kvalificeret lead for høj, A/B-tester vi en variant med kontaktmur. Men vi starter uden.

### Message match via URL

| Parameter | Hero-overskrift (eksempel) | Forvalgt |
|---|---|---|
| `?gulv=garage` | Nyt garagegulv. Se prisen på 60 sekunder. | Garage, 36 m², flakes |
| `?gulv=bolig` | Fugefrit gulv i hjemmet. Se hvad det koster. | Bolig, ensfarvet |
| `?gulv=erhverv` | Gulv til værksted og lager. Få et prisoverslag nu. | Erhverv, priser ekskl. moms |
| (ingen) | Hvad koster dit nye gulv? Se det på 60 sekunder. | Intet |

Copy er udkast. Det endelige laver vi, når kundens input er der.

---

## 4. Beregneren

### Spørgsmålene (v1)

| # | Spørgsmål | Svar | Påvirker | Hvorfor |
|---|---|---|---|---|
| 1 | Hvad skal have nyt gulv? | Garage · Kælder · Bolig · Erhverv/værksted | Anbefalet overflade, moms-visning | Segment + message match. Stilles direkte i hero |
| 2 | Hvor stort er gulvet? | m² (lineal-slider + tal). Genveje: enkelt garage ca. 18 m², dobbelt ca. 36 m². Hjælper: længde × bredde | Pris | Største prisdriver |
| 3 | Hvilken overflade? | Ensfarvet · Flakes · Metallic (+ New Yorker/industri hvis de laver det). Farve er valgfri og ændrer ikke prisen | Pris pr. m² | Kernevalget. Farven giver bedre lead-info |
| 4 | Hvordan ser gulvet ud i dag? | Pæn beton · Revner og huller · Maling/belægning skal af · Ved ikke | Forbehandling | "Ved ikke" er ærligt og holder intervallet bredt |
| 5 | Tilvalg | Hulkehl langs væggen · Skridsikker overflade · (kundens liste) | Tillæg | Merværdi. Snittet forklarer fagordene |
| 6 | Hvor ligger gulvet? | Postnummer, 4 cifre → bynavn vises | Kørsel | Kvalificering + "pris for dit gulv i 8600 Silkeborg" |

**Derefter:** resultat og formular (navn, telefon, mail, hvornår: hurtigst muligt / 1-3 mdr. / senere / undersøger bare, besked valgfri, samtykke).

**UX-regler:**

- Ét spørgsmål ad gangen. Besvarede spørgsmål folder sammen til én linje ("Garage · 36 m² · Flakes"), man kan trykke på for at rette.
- Prisen vises fra spørgsmål 3 og bliver smallere for hvert svar.
- På mobil ligger prisen i en sticky bund-bar.
- Rigtige radio-knapper og inputs under stylingen: tastatur, skærmlæser og autofyld virker.

### Prismodel

Hver komponent giver et **[min, maks]**. Er spørgsmålet besvaret, er min = maks. Er det ubesvaret eller "Ved ikke", er det billigste og dyreste svar.

```
opstart          fast beløb (maskiner, afdækning, kørsel inden for zonen)
overflade        m² × pris_pr_m²(overflade)
forbehandling    m² × pris_pr_m²(stand)
hulkehl          lbm × pris_pr_lbm     (lbm estimeres ud fra m² og rumtype)
tilvalg          pr. m², pr. lbm eller fast beløb

lav  = maks(minimumspris, Σ min × (1 − 5 %))    → rundes ned til nærmeste 500 kr
høj  = maks(minimumspris, Σ maks × (1 + 5 %))   → rundes op til nærmeste 500 kr
+ moms for private
```

- **Intervallet er altid ærligt.** Det dækker billigste og dyreste udfald af det, man ikke har svaret på endnu. Svar på alt, og kun ±5 % er tilbage (adgang, rummets form og lignende).
- **Store gulve:** Opstartsbeløbet giver automatisk lavere pris pr. m² på store gulve. Prissætter kunden med m²-trin, lægger vi det ind.
- **Over fx 250 m² eller industri:** Ingen tal. "Store gulve prissætter vi efter besigtigelse" → direkte til formularen.
- **Moms:** Priser til private skal være inkl. moms (markedsføringsloven § 13). Erhverv vises ekskl. moms og markeres tydeligt.
- **Uden for zonen (60 km):** Prisen vises stadig, med "kørsel aftales". Vi afviser ingen på siden.

### Resultatet

- Stort interval, fx **17.000-19.500 kr** (36 m² flakes med pladsholder-priserne), og under det "inkl. moms · ca. 505 kr/m²".
- **Snit gennem gulvet:** lagene bygges op, mens man vælger (beton → slibning → primer → grundlag → flakes → toplak). Hulkehl vises som en kurve op ad væggen. Det forklarer, hvad man betaler for.
- **Tid:** "2-3 arbejdsdage · gå på det efter 24 timer · bil efter 7 døgn" (kundens tal).
- **Forbehold:** "Vejledende pris. Du får en fast pris efter gratis besigtigelse."
- **Prislinjer:** Min anbefaling er 3 grupper (gulvsystem, forbehandling, tilvalg) og ikke hver enkelt post. Det undgår, at kunden forhandler post for post.

### Kalibrering (det vigtigste punkt)

- Kunden sender 5-10 tilbud, de har givet (m², overflade, stand, tilvalg, endelig pris).
- De bliver til automatiske tests: beregneren skal ramme hvert tilbud inden for sit interval. Ellers justerer vi config før launch.
- Siger beregneren 18.000 og tilbuddet bliver 28.000, har vi brændt leadet og kundens navn. Hellere et lidt bredere interval, der holder.

### Config

Alle tal ligger i én fil. Priser ekskl. moms, fordi det er sådan håndværkere tænker. Beregneren lægger moms på for private.

```js
// src/calculator/pricing.config.js · tal er PLADSHOLDERE
export default {
  moms: 0.25,
  opstart: 2400,
  minimumspris: 9600,
  basisUsikkerhed: 0.05,
  afrunding: 500,
  maksM2: 250,
  overflader: {
    ensfarvet: { navn: 'Ensfarvet epoxy', prisPrM2: 240, lag: ['primer', 'grundlag', 'toplak'] },
    flakes:    { navn: 'Flakes',          prisPrM2: 340, lag: ['primer', 'grundlag', 'flakes', 'toplak'] },
    metallic:  { navn: 'Metallic',        prisPrM2: 620, lag: ['primer', 'grundlag', 'metallic', 'toplak'] },
  },
  stand: {
    paen:   { navn: 'Pæn beton',              prisPrM2: 0 },
    revner: { navn: 'Revner og huller',       prisPrM2: 50 },
    maling: { navn: 'Maling/belægning skal af', prisPrM2: 90 },
  },
  tilvalg: {
    hulkehl:     { navn: 'Hulkehl langs væggen', prisPrLbm: 150 },
    skridsikker: { navn: 'Skridsikker overflade', prisPrM2: 35 },
  },
  zone: { postnumre: [/* alle postnumre inden for 60 km */], udenforTekst: 'Kørsel aftales' },
};
```

Postnumre ligger som statisk liste i koden. Ingen afhængighed af eksterne adresse-API'er.

---

## 5. Siden, sektion for sektion (mobil først)

1. **Topbar:** logo + telefonnummer (tryk for at ringe). Ingen menu, ingen udgange.
2. **Hero:** overskrift der matcher annoncen, spejlet i "gulvet". Første spørgsmål (rumtype) står direkte i hero. Ét tryk, og beregneren er i gang.
3. **Beregneren:** se afsnit 4.
4. **Resultat + formular** på samme flade. Ingen popup.
5. **Før/efter:** rigtige billeder fra deres jobs. Man trækker det nye gulv hen over det gamle med en gummiskraber.
6. **Datablad:** hvad gulvet kan (tåler, rengøring, levetid, tid, garanti), sat op som et teknisk datablad. Ingen ikoner.
7. **Sådan foregår det:** tidslinje som en hærdeproces. Besigtigelse → slibning → epoxy → toplak → gå på det → kør bil på det.
8. **Ejeren:** navn, ansigt, to linjer. Det erstatter anmeldelser, indtil de har nogen.
9. **Spørgsmål (FAQ)** som rene linjer: Hvor lang tid tager det? Kan jeg køre bil på det? Hvad med fugt i betonen? Hvad hvis mit gulv har revner? Er prisen fast? Kører I ud til mig?
10. **Afslutning:** "Se din pris" + telefon. Footer: CVR, adresse, privatlivs- og cookiepolitik.

---

## 6. Designretning: "Fugefri"

Et epoxygulv er én flade uden fuger, helt plan, med et blankt lag øverst. Siden bygges efter de samme regler. Det giver et look, ingen andre i branchen har, og "ingen kasser" bliver en konsekvens af materialet i stedet for en smagssag.

### Fem regler

| Regel | Hvad det betyder på siden |
|---|---|
| **Fugefri** | Ingen kort, ingen kasser, ingen runde hjørner (0 px radius overalt). Indhold adskilles af luft og hårfine linjer. |
| **Plan** | Stram vandret struktur. Skillelinjer "sætter sig": en lille bølge, der flader ud, når de kommer ind i billedet. |
| **Blank** | Ét glansmoment. Overskriften spejles i "gulvet" i hero, og et lysrefleks glider over prisen, når den opdateres. Ikke mere end det. |
| **Lag** | Prisen forklares som et snit gennem gulvet. Lagene bygges op, mens man vælger. |
| **Mærket** | Datablad-sprog: mm, RAL-koder, lag, tider. Signalgul, som afmærkningen på et lagergulv, er eneste accent og bruges kun på det, man skal trykke på. |

### Typografi

- **Archivo** (gratis, OFL) med variabel bredde og vægt. Overskrifter i **bred og let** (expanded, vægt ca. 300). Hierarki kommer fra størrelse og bredde, ikke fra fed. Brødtekst i normal bredde.
- **IBM Plex Mono** til labels, mål og tekniske detaljer. Det er datablad-stemmen.
- Ingen fed tekst. Vægte mellem 300 og 500.
- Hero-detalje: bredde-aksen animeres én gang ved load, så overskriften "flyder ud" fra smal til bred, som epoxy der fordeler sig. Ét sekund, kun på desktop.
- Fonts hostes selv, ikke fra Googles CDN (GDPR).

### Farver (udgangspunkt, tilpasses deres logo)

| Navn | Hex | Brug |
|---|---|---|
| Beton | `#E5E6E2` | Baggrund. I familie med RAL 7035 lysgrå |
| Flade | `#D7D9D4` | Prøveflader, snittet |
| Antracit | `#24282B` | Tekst og mørke sektioner. I familie med RAL 7016 |
| Grafit | `#5C6266` | Sekundær tekst |
| Signalgul | `#F0B400` | CTA og markeringslinjer. I familie med RAL 1003 |

### Signaturdetaljer

1. **Hero-refleksion.** Overskriften står på en blank flade og spejles svagt: sløret, og den fader ud. Ren CSS, ingen video.
2. **Valg der hældes ud.** Når man vælger en mulighed, flyder farven ud fra det sted, man trykkede, og lægger sig i linjen.
3. **Selvnivellerende pris.** Intervallet bliver smallere for hvert svar. Under prisen ligger en tynd linje, der bølger, når prisen er usikker, og ligger helt plan, når alle svar er givet.
4. **Snittet.** Lagdiagram af gulvet som kvittering. Hulkehl vises som en kurve op ad væggen, så folk forstår ordet.
5. **Gummiskraber før/efter.** Håndtaget på før/efter-slideren er en gummiskraber. Man trækker det nye gulv hen over det gamle.
6. **Datablad i stedet for ikon-grid.** Nøgle, prikket linje, værdi.
7. **Hærde-tidslinje i stedet for "3 nemme trin".**

### Hvad vi undgår (branchens standard)

- Mørk hero med sportsvogn på blankt gulv og stor fed versal-overskrift (Montserrat, Oswald, Bebas).
- Metallic-swirl som baggrund overalt.
- Ikon-grid med skjold for "holdbart" og dråbe for "nem rengøring".
- Afrundede kort med skygge. Afrundede orange knapper.
- Stockfotos.

### Motion

- Kort og fysisk, som væske der lægger sig: ease-out, 400-900 ms.
- `prefers-reduced-motion`: ingen bølger eller flyd, kun direkte skift.
- Intet må blokere. Alt kan læses uden animation.

---

## 7. Teknik

### Stack

- **Vite + vanilla JS** (ES modules) og ren CSS med design-tokens. Intet framework. Beregneren er framework-fri, så den kan lægges ind i Webflow som embed senere, hvis det bliver aktuelt.
- **Hosting:** Netlify eller Cloudflare Pages (gratis niveau) + eget domæne.
- **Serverfunktion `/api/lead`:** validerer, sender `Lead` til Meta CAPI (med IP og user agent, som giver bedre match) og videresender til en Zapier/Make-webhook.
- **Vitest** til prismotoren, inkl. kalibreringstests.

### Filstruktur

```
epoxyLP/
├── index.html
├── src/
│   ├── main.js
│   ├── styles/                tokens.css · base.css · sections.css · calculator.css
│   ├── calculator/
│   │   ├── pricing.config.js  alle priser ét sted (ekskl. moms)
│   │   ├── engine.js          ren funktion: svar → { lav, høj, lag, linjer }
│   │   ├── engine.test.js     inkl. kalibrering mod rigtige tilbud
│   │   ├── ui.js              trin, state, live-opdatering, URL-parametre
│   │   └── section-view.js    snittet (SVG)
│   ├── effects/               reflection.js · level-line.js · pour.js · before-after.js
│   ├── tracking.js            pixel, event_id, fbclid/fbp, UTM
│   └── lead-form.js
├── public/                    fonts (self-hosted) · billeder · og-image
├── netlify/functions/lead.js  validering → Meta CAPI → Zapier/Make
└── PLAN.md
```

### Lead-flow

Formular → `/api/lead` →

1. Meta CAPI `Lead` med samme `event_id` som pixel-eventet (dedup).
2. Zapier/Make: mail + SMS til firmaet med det samme (speed-to-lead), række i Google Sheet/CRM, SMS/mail til kunden med beregningen.

**Payload:** navn, telefon, mail, postnummer, hvornår, besked, alle svar fra beregneren, prisinterval, UTM'er, fbclid/fbc, fbp, event_id, side-URL, tidspunkt.

**Lead-score** i Zapier/Make: HOT hvis inden for zonen + "inden for 3 mdr." + mindst 15 m². Står øverst i mailen til firmaet.

### Tracking

| Event | Hvornår | Type | Data |
|---|---|---|---|
| `PageView` | Ved load (efter samtykke) | Standard | |
| `CalculatorStart` | Første svar | Custom | rumtype |
| `CalculatorStep` | Hvert trin | Custom | trin nr. (frafaldsanalyse) |
| `CalculatorComplete` | Pris vist med alle svar | Custom | value = midtpris, DKK, overflade, m² |
| `Lead` | Formular modtaget (2xx fra `/api/lead`) | Standard + CAPI | value = midtpris, event_id |
| `Contact` | Tryk på telefonnummer | Standard | |

- **fbclid** læses fra URL'en ved submit. Siden er én side, så den er der stadig. fbc bygges på serveren, hvis cookien mangler. fbp sendes med, hvis den findes.
- **UTM'er** sendes med i payload.
- **Optimering:** Start på `Lead`. Er volumen for lav til at komme ud af læringsfasen (ca. 50 events om ugen pr. annoncesæt), optimerer vi midlertidigt på `CalculatorComplete` som custom conversion.

### Samtykke og jura

- Pixel og Clarity først efter samtykke (cookie-banner, fx Cookie Information eller Cookiebot). `fbq('consent', 'revoke')` indtil accept.
- CAPI-leads sendes på baggrund af formularens samtykke og privatlivspolitikken. Det afklares med kunden.
- Priser til private er altid inkl. moms. Forbrugerombudsmanden har givet bøder for priser ekskl. moms.
- Privatlivspolitik og cookiepolitik skal ligge på siden.

### Performance og kvalitet

- Mål: LCP under 2 sek. på 4G, under 30 kB JS (gzip), ingen layout-hop.
- Fonts subsettes og preloades. Billeder i AVIF/WebP i flere størrelser.
- Testes i Facebook- og Instagram-browseren på iOS og Android. Det er der, trafikken kommer fra.
- Tilgængelighed: tastatur, `aria-live` på prisen, AA-kontrast.

---

## 8. Rækkefølge

1. **Input fra kunden** (tjeklisten nedenfor).
2. **Prisconfig + motor + kalibreringstests.** Kan starte, så snart priserne er der.
3. **Hero + beregner, mobil først.** Det vigtigste skærmbillede. Godkendes i browseren, ikke i Figma.
4. **Resten af sektionerne.**
5. **Lead-flow, tracking og samtykke.** Test-leads hele vejen igennem.
6. **QA:** in-app browsere, Lighthouse, Meta Test Events.
7. **Launch** med 2-3 annoncevarianter (garage, bolig, erhverv) på hver sin URL-parameter.
8. **Efter 2 uger:** frafald pr. trin, heatmap (Microsoft Clarity), første A/B-test.

---

## 9. Det skal jeg bruge fra dig / kunden

- [ ] Bekræft firma (Silkeborg Epoxygulve ApS?) og domæne
- [ ] Hvilke gulvtyper de laver (ensfarvet, flakes, metallic, New Yorker, industri, skridsikker …)
- [ ] Prisliste ekskl. moms: pr. m² pr. gulvtype, opstart, minimumspris, forbehandling pr. stand, hulkehl pr. lbm, andre tilvalg, evt. m²-trin
- [ ] 5-10 tidligere tilbud (m², type, stand, tilvalg, pris) til kalibrering
- [ ] Opbygning af deres systemer (lag, mm, produkter/brand) til snittet
- [ ] Tider: antal arbejdsdage, hvornår man kan gå på det og køre på det
- [ ] Garanti (konkurrenterne lover 5 år)
- [ ] Farvekort: RAL-farver og flakes-blandinger de tilbyder
- [ ] Logo og evt. farver
- [ ] Billeder: før/efter fra samme vinkel, nærbilleder, ejeren på arbejde. Har de ingen, så en times fotografering på næste job. De kan også bruges i annoncerne.
- [ ] Kontakt: telefon, mail, hvem ringer leads op, svartid
- [ ] Hvor leads skal hen (mail, Google Sheet, CRM?) + adgang til Zapier/Make
- [ ] Meta Pixel ID + adgang til Events Manager (CAPI-token)
- [ ] Webflow eller selvstændig side (se nedenfor)

---

## 10. Beslutninger (min anbefaling)

| Beslutning | Anbefaling | Hvorfor |
|---|---|---|
| Pris med eller uden kontaktmur | **Uden.** A/B-test senere | Tillid, lead-kvalitet, differentiering |
| Webflow eller selvstændig side | **Selvstændig** fra repo'et, deploy på Netlify/Cloudflare | Fuld kontrol over design og animation, serverfunktion til CAPI, hurtig. Beregneren kan stadig embeddes i Webflow senere |
| Prislinjer i resultatet | **3 grupper**, ikke hver post | Undgår forhandling post for post |
| Billedupload i formularen | **Ikke i v1.** Tak-skærmen beder om billeder via SMS/mail | Mindre friktion, simplere |
| Postnummer før eller efter prisen | **Før** (sidste spørgsmål) | Lav friktion, kvalificerer, personlig pris |

**Senere, høj effekt:** Google-anmeldelser fra de første kunder (widget på siden ved 5+), og pour-videoer fra jobs til annoncerne.

---

## Kilder

**Firmaet:** [3byggetilbud: Silkeborg Epoxygulve ApS](https://www.3byggetilbud.dk/leverandoer/silkeborg-epoxygulve-aps/) · [Proff: Silkeborg Epoxygulve ApS](https://www.proff.dk/firma/silkeborg-epoxygulve-aps/k%C3%B8benhavn-s/bygningsh%C3%A5ndv%C3%A6rkere/0RKD48I07TR)

**Konkurrenter:** [Vestbjerg Epoxy Gulve](https://vestbjergepoxygulve.dk/) · [Vestbjerg showroom](https://vestbjergepoxygulve.dk/showroom/) · [Tyrsted Epoxy Gulve](https://tyrstedepoxygulve.dk/) · [Viborg Design](https://viborg-design.dk/gulvfirma-silkeborg/) · [Midtjysk Gulventreprise](https://midtjyskgulventreprise.dk/epoxygulv.aspx) · [Haahr Gulve](https://haahrgulve.dk/epoxy-gulv-silkeborg/) · [Murermester M. Nielsen](https://murermester-mnielsen.dk/epoxygulv.aspx) · [GO Gulvslibning](https://go-gulvslibning.dk/epoxygulv/) · [NP Malerservice](https://www.npmalerservice.dk/epoxygulve/) · [United Flooring](https://united-flooring.dk/)

**Prisportaler med beregner:** [epoxy-gulv-pris.dk](https://epoxy-gulv-pris.dk/) · [gulvpriser.dk](https://gulvpriser.dk/) · [bygga.dk](https://bygga.dk/gulvbelaegning/laegning-af-epoxygulv/)

**Markedspriser:** [Nivelar](https://nivelar.dk/viden/hvad-koster-epoxy-gulv) · [Cempur](https://cempur.dk/epoxy-pris/) · [Hjemsted](https://hjemsted.dk/epoxy-gulv-pris/) · [Gulvpriser: epoxy](https://gulvpriser.dk/epoxy-gulv/) · [Gulvpriser: New Yorker](https://gulvpriser.dk/new-yorker-gulv/) · [Bygliga: New Yorker](https://bygliga.dk/nyt-gulv/new-yorker-gulv/) · [Handyhand: metallic 50 m²](https://handyhand.dk/gulv/hvad-koster-epoxy-gulv-50-m2-med-metallic/pris-data) · [Konstruktøren: garage](https://konstruktoeren.dk/epoxy-gulv-garage-pris/) · [Byggeli: garage](https://byggeli.dk/epoxy-gulv-garage/)

**Opbygning og hærdetid:** [Nivelar: flake-gulve](https://nivelar.dk/flake-gulve) · [Sika: Sikafloor-150 primer](https://dnk.sika.com/da/byggeri/finish/gulvsystemer/primer-underlag-ogtilbehor/sikafloor-150.html) · [Gulvspecialist: hærdetid](https://gulvspecialist.dk/planlaeg-haerdetiden-sadan-far-du-et-staerkt-og-holdbart-gulv/)

**Prisoplysning:** [Forbrugerombudsmanden: bøde for priser ekskl. moms](https://forbrugerombudsmanden.dk/find-sager/sager/retssager/boedevedtagelser/annoncering-med-priser-ekskl-moms) · [Forbrugerombudsmandens retningslinjer for prismarkedsføring](https://forbrugerombudsmanden.dk/media/49800/retningslinjer-for-prismarkedsfoering.pdf) · [Advodan: prismarkedsføring](https://www.advodan.dk/da/erhverv/min-virksomhed/virksomhedsdrift/markedsforingsloven/prismarkedsforing/)
