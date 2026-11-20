# Silkeborg Epoxy · hjemmeside med prisberegner

Udkast v0.9: komplet hjemmeside i [Astro](https://astro.build) med 28 statiske sider, heraf 5 guides under Viden. Prisberegneren stiller ét spørgsmål ad gangen og ligger på forsiden, prissiden, alle ydelser, alle bysider og alle guides. Prisen vises først, når den besøgende har skrevet navn, telefon og mail (kundens valg, v0.8). Leads går gennem en Netlify-funktion til Zapier/Make og Meta CAPI. Baggrund og research står i [PLAN.md](PLAN.md).

**Alle priser er pladsholdere.** Siden kører i "kladde"-tilstand: der er en lille "Kladde"-knap nederst til venstre, og alle sider har `noindex`. Tekster og tal, der skal bekræftes af kunden, er markeret i koden. Åbn "Kladde" og tryk "Vis pladsholdere" for at se dem på siden (stiplet gul ramme). Valget huskes.

**Billederne er pladsholdere.** I beregneren er ni billeder AI-genererede (Canva) og fire stillbilleder fra kundens egen video. Fotoene på siderne er stillbilleder fra videoen. De skal skiftes til kundens egne billeder af færdige gulve før launch.

**Designet (v0.14):** Én fast stil for Silkeborg Epoxy efter designreglerne fra sikker-isolering ("det må ikke ligne noget, en AI har lavet"): 1px hårlinjer, overskrifter i vægt 600 (små overskrifter 500), ingen ikon-fliser, pille-badges, flueben-lister, gradienter eller store skygger, og ingen opfundne citater. Toppen har videoen fra et job under en neutral mørk hinde (.64), beregneren har en mørkegrøn top og står som frostet glas i toppen på computer. Under toppen kører et slankt, mørkegrønt bånd med korte punkter (stopper ved hover, står stille ved "reducer bevægelse"). Lister er rækker med hårlinjer, forløbet er tre fotos med tal, ydelserne har et lille foto af rummet, og kortet over, hvor vi kører, tegnes ind, når man ruller ned til det. Afslutningen er centreret over et foto fra et job. Farver, skrift og former står i `src/styles/tokens.css`.

Gulvkataloget (brochuren med de fem gulvtyper) bygges for sig selv i `katalog/` og ligger på `/katalog/` under samme domæne. Se [katalog/README.md](katalog/README.md).

## Kom i gang

```bash
npm install
npm run dev         # http://localhost:4321 · demo-tilstand: formularerne sender intet
npm test            # prismotor, kalibrering og lead-funktionen
npm run build       # bygger til dist/
npm run build:demo  # preview med flade .html-filer og relative links i dist-demo/
```

I `npm run dev` er `VITE_DEMO=1` slået til (`.env.development`). Tak-skærmen viser så de data, der ville være sendt.

## Sider

| Side | Fil |
|---|---|
| Forside `/` | `src/pages/index.astro` |
| Pris og prisguide `/pris/` | `src/pages/pris.astro` |
| Ydelser `/garagegulv/`, `/kaeldergulv/`, `/gulv-i-boligen/`, `/erhvervsgulve/`, `/ensfarvet-epoxy/`, `/flakesgulv/`, `/metallic-epoxy/` | `src/pages/[ydelse].astro` + `src/data/ydelser.js` |
| Bysider `/epoxygulv-silkeborg/`, `/epoxygulv-aarhus/` osv. | `src/pages/epoxygulv-[by].astro` + `src/data/byer.js` |
| Viden `/viden/` og guides fx `/epoxy-eller-gulvmaling/` | `src/pages/viden.astro`, `src/components/GuideSide.astro` + `src/data/viden.js` |
| Referencer, Om os, Kontakt, Privatliv, 404 | `src/pages/*.astro` |

En ny ydelse eller by er en ny post i data-filen. Siden, menuen, footeren og sitemap følger med. En ny guide er en post i `src/data/viden.js` plus en sidefil på tre linjer i `src/pages/` (kopiér en af de eksisterende).

## Her retter du

| Hvad | Hvor |
|---|---|
| Priser, opstart, minimumspris, tilvalg, tider, zone, hurtigvalg for størrelse | `src/calculator/pricing.config.js` (alt ekskl. moms) |
| Kundens rigtige tilbud til kalibrering | `src/calculator/calibration.cases.js` |
| Telefon, mail, adresse, garanti, svartid, kladde-tilstand, anmeldelser | `src/data/firma.js` |
| Tekster, fordele og spørgsmål pr. ydelse | `src/data/ydelser.js` |
| Byer, afstande og lokale tekster | `src/data/byer.js` |
| Generelle spørgsmål | `src/data/faq.js` |
| Guides (tekster og tabeller) | `src/data/viden.js` |
| "Derfor vælger folk os" på forsiden | `loefter` øverst i `src/pages/index.astro` |
| Referencer | `src/data/referencer.js` (pladsholdere) |
| Domæne | `astro.config.mjs` (`site`) og `public/robots.txt` |
| Billeder i beregneren | `src/media/valg/`, fx `rum-garage.webp`. Samme navn, 4:3 |
| Fotos på siderne | `src/media/foto/`. Læg en ny fil med samme navn, så laver Astro selv de mindre størrelser. Referencernes fotos står i `src/data/referencer.js` |
| Videoen | `src/media/arbejde.mp4`, `arbejde.webm` og stillbilledet `arbejde.jpg`, se herunder |
| Farver, skrift og former | `src/styles/tokens.css` |
| Toppen med video eller foto, flueben og beregneren | `src/components/Hero.astro` |

Beregneren er testet, så intervallet altid dækker prisen for enhver måde at svare færdig på. Når kundens tilbud er lagt ind i `calibration.cases.js`, fejler `npm test`, hvis beregneren rammer ved siden af et tilbud. Prissidens tabel og eksempler og bysidernes eksempelpris regnes med samme motor, så tallene altid passer med beregneren.

### Video

Videoen spiller uden lyd i loop og kun, mens den er på skærmen. I toppen ligger et stillbillede (webp i flere størrelser) under videoen, og videoen toner frem, når den spiller. Den kan stoppes med knappen ved "Fra et af vores jobs". Ved "reducer bevægelse" eller datasparetilstand vises kun stillbilledet. Skift den ved at lave nye filer med samme navne (1280 px bred, ingen lyd, gerne under 2 MB):

```sh
ffmpeg -i nyt-klip.mov -an -vf "fps=30,scale=1280:-2,format=yuv420p" -c:v libx264 -profile:v high -preset slow -crf 29 -movflags +faststart src/media/arbejde.mp4
ffmpeg -i nyt-klip.mov -an -vf "fps=30,scale=1280:-2,format=yuv420p" -c:v libvpx-vp9 -b:v 0 -crf 46 -row-mt 1 src/media/arbejde.webm
ffmpeg -i nyt-klip.mov -frames:v 1 -vf "scale=1280:-2" -q:v 5 src/media/arbejde.jpg
```

Stillbilledet skal være første billede i klippet, så der ikke er et hop, når videoen starter.

## SEO

- Egen titel og beskrivelse på hver side, canonical-URL og Open Graph.
- Strukturerede data: virksomheden som lokal virksomhed med område (alle sider), `Service` på ydelserne, `Article` på guiderne, `FAQPage` og `BreadcrumbList`.
- Delingsbillede til Facebook, LinkedIn og Google (`public/og.jpg`, 1200×630) og ikoner til browser og iPhone.
- Guiderne svarer på det, folk søger på før de køber ("epoxy eller maling", "gulvvarme", "fliser"), og linker til ydelserne og beregneren.
- `sitemap-index.xml` bygges automatisk, og `robots.txt` peger på den.
- Bysiderne har hver deres afstand, køretid, nærområder og lokale tekst, så de ikke er kopier med et nyt bynavn.
- Så længe `kladde: true` står i `src/data/firma.js`, har alle sider `noindex`.

## Hastighed

Lighthouse (20.11.2026, produktionsbyg, mobil med simuleret 4G):

| Side | Hastighed | Tilgængelighed | Best practices |
|---|---|---|---|
| Forside | 97 | 100 | 100 |
| Garagegulv | 96 | 100 | 100 |
| Gulvkatalog | 98 | 100 | 100 |

Ingen layout-hop (CLS 0-0,001). Med `kladde: true` giver `noindex` med vilje en lav SEO-score.

Det, der holder siden hurtig: CSS ligger direkte i HTML'en, skriften (Archivo) hentes med det samme (preload), billederne laves i flere størrelser som webp, videoen hentes først, når siden er vist, og beregnerens valg bygges på serveren, så intet hopper, når JavaScript starter.

## URL-parametre

- `?gulv=garage` / `kaelder` / `bolig` / `erhverv`: skifter overskriften på forsiden, vælger rummet og starter beregneren ved størrelsen. Brug én pr. annoncesæt.
- `?kladde=0`: skjuler "Kladde"-knappen, fx til skærmbilleder.

## Online (Vercel)

https://silkeborg-epoxy.fyldtordrebog.dk: hjemmesiden på `/` og gulvkataloget på `/katalog/`. Vercel-projektet hedder `silkeborg-epoxy-lp` (teamet TFCX) og bygger fra GitHub med `vercel.json`: `node scripts/byg-vercel.mjs` bygger Astro til `dist/` og kataloget til `dist/katalog/`. Formularerne sender til `api/lead.mjs` (samme kode som Netlify-funktionen). Miljøvariablerne er de samme som herunder og sættes under *Settings → Environment Variables*. Uden `LEAD_WEBHOOK_URL` tager funktionen kun imod leads, mens `kladde: true` (de står i Vercels log). Uden kladde svarer den med en fejl, så ingen leads forsvinder i stilhed.

DNS for fyldtordrebog.dk ligger hos Simply: A-record `silkeborg-epoxy` → `76.76.21.21`.

## Deploy på Netlify

Build-kommando og funktioner er sat op i `netlify.toml` (`npm run build`, udgiver `dist/`). Sæt miljøvariablerne under *Site configuration → Environment variables* (se `.env.example`):

| Variabel | Bruges til |
|---|---|
| `LEAD_WEBHOOK_URL` | Zapier/Make-webhook, der modtager leads. Påkrævet |
| `META_PIXEL_ID`, `META_CAPI_TOKEN` | Lead via Conversions API |
| `META_TEST_EVENT_CODE` | Valgfri, mens der testes i Events Manager |
| `VITE_META_PIXEL_ID` | Pixel i browseren. Uden den vises intet cookie-banner |
| `VITE_DEMO=1` | Til et preview-link til kunden, hvor formularerne ikke sender noget |

## Lead-flow

Formular → `/api/lead` (`netlify/functions/lead.mjs`) →

1. Validering + honeypot mod bots.
2. Webhook til Zapier/Make med alle svar, prisinterval, lead-score (`HOT` / `NORMAL` / `UDEN FOR ZONE`), UTM'er, fbclid/fbc/fbp og event_id. Fejler webhooken, får formularen en fejl, så leadet ikke forsvinder i stilhed.
3. `Lead` til Meta CAPI med hashet mail, telefon, navn, postnummer og by. Samme `event_id` som pixel-eventet, så Meta kun tæller det én gang. Sendes kun, når den besøgende har sagt ja til cookies. Den regel justeres, når privatlivspolitikken er på plads.

Typer: `fast-pris` fra beregneren (sendes, før prisen vises) og `kontakt` fra kontaktsiden. Funktionen tager også imod `kun-mail` (kun mailadresse), som ikke bruges på siden lige nu.

## Events

`CalculatorStart`, `CalculatorStep`, `CalculatorComplete` (custom), `Lead` og `Contact` (standard). Pixel indlæses først efter samtykke.

Browserens tilbage-knap går ét spørgsmål tilbage i beregneren, så folk i Facebook- og Instagram-browseren ikke ryger ud af siden, når de vil rette et svar.

## Konvertering

Det, siden gør for at få flest mulige til at se prisen og skrive sig op:

- **Beregneren over folden på mobil.** Overskriften står kort i toppen, og beregneren kommer lige under. Flueben og knapper står efter beregneren.
- **Headeren følger med**, når man scroller, med telefon og "Beregn pris". På mobil er der også en bundbar med ring-knap og "Se hvad dit gulv koster".
- **Prisen efter kontaktoplysninger.** Sidste trin viser en sløret pris ("Din pris er klar"), så man kan se, at den ligger klar. Svarene kan rettes, før man sender.
- **Tryghed:** garanti-segl og ejerens citat ved "Derfor vælger folk os", "Det er med i prisen" (hvad der altid er med, og hvad der kan komme oveni), tider på hvert trin i forløbet og tre løfter i afslutningen.
- **Ærlige referencer:** billeder fra jobbet i videoen med tekster, der kun beskriver billedet. Stjerner og anmeldelser vises først, når der er rigtige.

## Før launch

- [ ] Kundens priser i `pricing.config.js` og 5-10 tilbud i `calibration.cases.js` (`npm test` grøn)
- [ ] Telefon, mail, adresse, garanti, svartid og åbningstider i `src/data/firma.js`
- [ ] Rigtige anmeldelser (`anmeldelser` i `src/data/firma.js`). Stjernerne i toppen vises først, når snit og antal står der
- [ ] Ejerens navn, historie og foto på Om os, og citatet på forsiden i ejerens egne ord (`src/pages/index.astro`)
- [ ] Logo, hvis firmaet har et (ellers bruges dråbe-logoet i `src/components/Logo.astro`)
- [ ] Kundens egne fotos i stedet for AI-billederne i `src/media/valg/` og videostillbillederne i `src/media/foto/`
- [ ] Rigtige referencer i `src/data/referencer.js` og anmeldelser fra Trustpilot eller Google
- [ ] Kundens farvekort og fotos af færdige gulve pr. overflade, så gulvtypesiderne kan vise dem
- [ ] Guiderne læst igennem af ejeren, især levetid, garanti og gulvvarme i `src/data/viden.js`
- [ ] Zone (kommuner) og bysidernes afstande bekræftet
- [ ] Privatlivspolitik gennemgået
- [ ] Domæne i `astro.config.mjs` og `public/robots.txt`
- [ ] `kladde: false` i `src/data/firma.js` (fjerner noindex og "Kladde"-knappen)
- [ ] Miljøvariabler sat på Netlify, test-lead hele vejen igennem til Zapier/Make og Meta Test Events
- [ ] Test i Facebook- og Instagram-browseren på iOS og Android

## Data

Ikonerne i `src/lib/ikoner.js` er fra [Lucide](https://lucide.dev) (ISC-licens, © Lucide Icons and Contributors).

Postnumre og bynavne i `src/calculator/postnumre.json` kommer fra PostNords postnummerfil via npm-pakken `dk-postals` (ISC). Se `scripts/postnumre-fra-csv.mjs`.
