# Silkeborg Epoxy · hjemmeside med prisberegner

Udkast v0.6: komplet hjemmeside i [Astro](https://astro.build) med 28 statiske sider, heraf 5 guides under Viden. Prisberegneren stiller ét spørgsmål ad gangen og ligger på forsiden, prissiden, alle ydelser, alle bysider og alle guides. Leads går gennem en Netlify-funktion til Zapier/Make og Meta CAPI. Baggrund og research står i [PLAN.md](PLAN.md).

**Alle priser er pladsholdere.** Siden kører i "kladde"-tilstand: tekster og tal, der skal bekræftes af kunden, er markeret med gult, og alle sider har `noindex`.

**Billederne er pladsholdere.** I beregneren er ni billeder AI-genererede (Canva) og fire stillbilleder fra kundens egen video. Fotoene på siderne er stillbilleder fra videoen. De skal skiftes til kundens egne billeder af færdige gulve før launch.

**Designretning (aftalt i v0.3):** lyst og enkelt, beregneren øverst på alle salgssider, rigtige fotos, få sektioner og ingen kasser. Ingen mørke sektioner midt på siden, ingen mono-/nummer-labels og ingen gulve tegnet med kode. Den eneste mørke flade er afslutningen med et foto fra et job.

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
| Telefon, mail, adresse, garanti, svartid, kladde-tilstand | `src/data/firma.js` |
| Tekster, fordele og spørgsmål pr. ydelse | `src/data/ydelser.js` |
| Byer, afstande og lokale tekster | `src/data/byer.js` |
| Generelle spørgsmål | `src/data/faq.js` |
| Guides (tekster, tabel, billede) | `src/data/viden.js` |
| "Derfor vælger folk os" på forsiden | `loefter` øverst i `src/pages/index.astro` |
| Referencer | `src/data/referencer.js` (pladsholdere) |
| Domæne | `astro.config.mjs` (`site`) og `public/robots.txt` |
| Billeder i beregneren | `src/media/valg/`, fx `rum-garage.webp`. Samme navn, 4:3 |
| Fotos på siderne | `src/media/foto/`. Læg en ny fil med samme navn, så laver Astro selv de mindre størrelser. Referencernes fotos står i `src/data/referencer.js` |
| Videoen | `src/media/arbejde.mp4`, `arbejde.webm` og stillbilledet `arbejde.jpg`, se herunder |
| Farver, typografi, afstande | `src/styles/tokens.css` |

Beregneren er testet, så intervallet altid dækker prisen for enhver måde at svare færdig på. Når kundens tilbud er lagt ind i `calibration.cases.js`, fejler `npm test`, hvis beregneren rammer ved siden af et tilbud. Prissidens tabel og eksempler og bysidernes eksempelpris regnes med samme motor, så tallene altid passer med beregneren.

### Video

Videoen spiller uden lyd i loop og kun, mens den er på skærmen. Den hentes først, når den kommer i syne. Ved "reducer bevægelse" eller datasparetilstand vises stillbilledet i stedet. Skift den ved at lave nye filer med samme navne (1280 px bred, ingen lyd, gerne under 2 MB):

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

Lighthouse (29.09.2026, produktionsbyg, mobil med simuleret 4G):

| Side | Hastighed | Tilgængelighed | Best practices | SEO |
|---|---|---|---|---|
| Forside | 99 | 100 | 100 | 100 |
| Garagegulv | 99 | 100 | 100 | 100 |
| Pris | 99 | 100 | 100 | 100 |
| Guide | 98 | 100 | 100 | 100 |
| Epoxygulv Aarhus | 99 | 100 | 100 | 100 |

Desktop: 100 på forsiden. Ingen layout-hop (CLS 0). SEO er målt uden kladde-tilstand. Med `kladde: true` giver `noindex` med vilje 69.

Det, der holder siden hurtig: CSS ligger direkte i HTML'en, skrifttypen hentes først (preload), billederne laves i flere størrelser som webp, og beregnerens valg bygges på serveren, så intet hopper, når JavaScript starter.

## URL-parametre

- `?gulv=garage` / `kaelder` / `bolig` / `erhverv`: skifter overskriften på forsiden, vælger rummet og starter beregneren ved størrelsen. Brug én pr. annoncesæt.
- `?kladde=0`: skjuler de gule pladsholder-markeringer, fx til skærmbilleder.

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

Typer: `fast-pris` fra beregneren, `kun-mail` fra "Få beregningen på mail" og `kontakt` fra kontaktsiden.

## Events

`CalculatorStart`, `CalculatorStep`, `CalculatorComplete` (custom), `Lead` og `Contact` (standard). Pixel indlæses først efter samtykke.

Browserens tilbage-knap går ét spørgsmål tilbage i beregneren, så folk i Facebook- og Instagram-browseren ikke ryger ud af siden, når de vil rette et svar.

## Før launch

- [ ] Kundens priser i `pricing.config.js` og 5-10 tilbud i `calibration.cases.js` (`npm test` grøn)
- [ ] Telefon, mail, adresse, garanti, svartid og åbningstider i `src/data/firma.js`
- [ ] Ejerens navn, historie og foto på Om os
- [ ] Kundens egne fotos i stedet for AI-billederne i `src/media/valg/` og videostillbillederne i `src/media/foto/`
- [ ] Rigtige referencer i `src/data/referencer.js` og anmeldelser fra Trustpilot eller Google
- [ ] Kundens farvekort og fotos af færdige gulve pr. overflade, så gulvtypesiderne kan vise dem
- [ ] Guiderne læst igennem af ejeren, især levetid, garanti og gulvvarme i `src/data/viden.js`
- [ ] Zone (kommuner) og bysidernes afstande bekræftet
- [ ] Privatlivspolitik gennemgået
- [ ] Domæne i `astro.config.mjs` og `public/robots.txt`
- [ ] `kladde: false` i `src/data/firma.js` (fjerner noindex og de gule markeringer)
- [ ] Miljøvariabler sat på Netlify, test-lead hele vejen igennem til Zapier/Make og Meta Test Events
- [ ] Test i Facebook- og Instagram-browseren på iOS og Android

## Data

Postnumre og bynavne i `src/calculator/postnumre.json` kommer fra PostNords postnummerfil via npm-pakken `dk-postals` (ISC). Se `scripts/postnumre-fra-csv.mjs`.
