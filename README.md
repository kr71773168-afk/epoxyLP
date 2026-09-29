# Silkeborg Epoxy · hjemmeside med prisberegner

Udkast v0.8: komplet hjemmeside i [Astro](https://astro.build) med 28 statiske sider, heraf 5 guides under Viden. Prisberegneren stiller ét spørgsmål ad gangen og ligger på forsiden, prissiden, alle ydelser, alle bysider og alle guides. Prisen vises først, når den besøgende har skrevet navn, telefon og mail (kundens valg, v0.8). Leads går gennem en Netlify-funktion til Zapier/Make og Meta CAPI. Baggrund og research står i [PLAN.md](PLAN.md).

**Alle priser er pladsholdere.** Siden kører i "kladde"-tilstand: der er en gul bjælke øverst, og alle sider har `noindex`. Tekster og tal, der skal bekræftes af kunden, er markeret i koden. Tryk "Vis pladsholdere" i bjælken for at se dem på siden (stiplet gul ramme). Valget huskes.

**Billederne er pladsholdere.** I beregneren er ni billeder AI-genererede (Canva) og fire stillbilleder fra kundens egen video. Fotoene på siderne er stillbilleder fra videoen. De skal skiftes til kundens egne billeder af færdige gulve før launch.

**Stilarter (v0.7):** Sitet er bygget efter samme opskrift som ejerens referencer (vestbjergepoxygulve.dk og viborg-design.dk): tillid øverst, fluebensliste, telefonen som rund knap, én stærk farve og rigtige fotos. Det findes i tre stilarter med samme indhold:

| Stil | Udtryk | Skrift |
|---|---|---|
| A · Blå | Marineblå og klar blå, tættest på Vestbjerg | Red Hat Display + Red Hat Text |
| B · Grøn | Hvid, dyb grøn og beige, tættest på Viborg Design | Lexend |
| C · Egen (standard) | Antracit som et gulv, ravgul som epoxy, sand | Manrope |

C er standard, fordi den ikke kan forveksles med Vestbjerg, der også holder til i Silkeborg. Stilen vælges med `stil` i `src/data/firma.js`. I kladden kan man skifte med knapperne i den gule bjælke øverst eller med `?stil=A` i adressen. Valget huskes i browseren. Videoen fra et job er levende baggrund i toppen af forsiden, prissiden og bysiderne. Ydelserne har et foto af gulvtypen eller rummet i stedet.

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
| Telefon, mail, adresse, garanti, svartid, kladde-tilstand, stilart, anmeldelser | `src/data/firma.js` |
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
| Farver, skrift og former pr. stilart | `src/styles/tokens.css` (A, B og C hver for sig) |
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

Lighthouse (29.09.2026, produktionsbyg, mobil med simuleret 4G):

| Side | Hastighed | Tilgængelighed | Best practices | SEO |
|---|---|---|---|---|
| Side | Hastighed | Tilgængelighed | Best practices |
|---|---|---|---|
| Forside | 100 | 100 | 100 |
| Garagegulv | 98 | 100 | 100 |
| Pris | 99 | 100 | 100 |
| Guide | 100 | 100 | 100 |
| Epoxygulv Aarhus | 99 | 100 | 100 |

Stil C. A og B giver også 100 i tilgængelighed og 99-100 i hastighed. Desktop: 100. Ingen layout-hop (CLS 0-0,001). SEO er 100 uden kladde-tilstand (målt på forsiden). Med `kladde: true` giver `noindex` med vilje 69.

Det, der holder siden hurtig: CSS ligger direkte i HTML'en, kun den valgte stilarts skrift hentes (preload), billederne laves i flere størrelser som webp, videoen hentes først, når siden er vist, og beregnerens valg bygges på serveren, så intet hopper, når JavaScript starter.

## URL-parametre

- `?gulv=garage` / `kaelder` / `bolig` / `erhverv`: skifter overskriften på forsiden, vælger rummet og starter beregneren ved størrelsen. Brug én pr. annoncesæt.
- `?kladde=0`: skjuler kladde-bjælken, fx til skærmbilleder.
- `?stil=A` / `B` / `C`: viser siden i en anden stilart (kun i kladden). Valget huskes, så man kan klikke rundt på sitet.

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

## Før launch

- [ ] Kundens priser i `pricing.config.js` og 5-10 tilbud i `calibration.cases.js` (`npm test` grøn)
- [ ] Stilart valgt (`stil: 'A'`, `'B'` eller `'C'` i `src/data/firma.js`)
- [ ] Telefon, mail, adresse, garanti, svartid og åbningstider i `src/data/firma.js`
- [ ] Rigtige anmeldelser (`anmeldelser` i `src/data/firma.js`). Stjernerne i toppen vises først, når snit og antal står der
- [ ] Ejerens navn, historie og foto på Om os
- [ ] Kundens egne fotos i stedet for AI-billederne i `src/media/valg/` og videostillbillederne i `src/media/foto/`
- [ ] Rigtige referencer i `src/data/referencer.js` og anmeldelser fra Trustpilot eller Google
- [ ] Kundens farvekort og fotos af færdige gulve pr. overflade, så gulvtypesiderne kan vise dem
- [ ] Guiderne læst igennem af ejeren, især levetid, garanti og gulvvarme i `src/data/viden.js`
- [ ] Zone (kommuner) og bysidernes afstande bekræftet
- [ ] Privatlivspolitik gennemgået
- [ ] Domæne i `astro.config.mjs` og `public/robots.txt`
- [ ] `kladde: false` i `src/data/firma.js` (fjerner noindex og kladde-bjælken)
- [ ] Miljøvariabler sat på Netlify, test-lead hele vejen igennem til Zapier/Make og Meta Test Events
- [ ] Test i Facebook- og Instagram-browseren på iOS og Android

## Data

Postnumre og bynavne i `src/calculator/postnumre.json` kommer fra PostNords postnummerfil via npm-pakken `dk-postals` (ISC). Se `scripts/postnumre-fra-csv.mjs`.
