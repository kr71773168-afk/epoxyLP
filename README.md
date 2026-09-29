# Silkeborg Epoxy · landingpage med prisberegner

Første udkast (v0.1). Statisk side (Vite + vanilla JS) med prisberegner, lead-formular og en Netlify-funktion, der sender leads videre til Zapier/Make og Meta CAPI. Baggrund, research og designretning står i [PLAN.md](PLAN.md).

**Alle priser er pladsholdere.** Siden kører i "kladde"-tilstand: tekster og tal, der skal bekræftes af kunden, er markeret med gult.

## Kom i gang

```bash
npm install
npm run dev      # http://localhost:5173 · demo-tilstand: formularen sender intet
npm test         # prismotor, kalibrering og lead-funktionen
npm run build    # bygger til dist/
```

I `npm run dev` er `VITE_DEMO=1` slået til (`.env.development`). Tak-skærmen viser så de data, der ville være sendt.

## Her retter du

| Hvad | Hvor |
|---|---|
| Priser, opstart, minimumspris, tilvalg, tider, farver, zone | `src/calculator/pricing.config.js` (alt ekskl. moms) |
| Kundens rigtige tilbud til kalibrering | `src/calculator/calibration.cases.js` |
| Tekster på siden | `index.html` |
| Overskrifter pr. annonce (`?gulv=`) | `src/hero.js` |
| Farver, typografi, afstande | `src/styles/tokens.css` |
| Før/efter-billeder | `index.html`, sektionen `#foer-efter`: skift de to `<canvas>` til `<img class="fe-foer">` og `<img class="fe-efter">` |
| Video bag hero og afslutning | `src/media/arbejde.mp4`, `arbejde.webm` og stillbilledet `arbejde.jpg`, se herunder |
| Privatlivspolitik | `privatliv.html` |

Beregneren er testet, så intervallet altid dækker prisen for enhver måde at svare færdig på. Når kundens tilbud er lagt ind i `calibration.cases.js`, fejler `npm test`, hvis beregneren rammer ved siden af et tilbud.

### Video

Videoen spiller uden lyd i loop og kun, mens den er på skærmen. Ved "reducer bevægelse" eller datasparetilstand vises stillbilledet i stedet. Skift den ved at lave nye filer med samme navne (1280 px bred, ingen lyd, gerne under 2 MB):

```sh
ffmpeg -i nyt-klip.mov -an -vf "fps=30,scale=1280:-2,format=yuv420p" -c:v libx264 -profile:v high -preset slow -crf 29 -movflags +faststart src/media/arbejde.mp4
ffmpeg -i nyt-klip.mov -an -vf "fps=30,scale=1280:-2,format=yuv420p" -c:v libvpx-vp9 -b:v 0 -crf 46 -row-mt 1 src/media/arbejde.webm
ffmpeg -i nyt-klip.mov -frames:v 1 -vf "scale=1280:-2" -q:v 5 src/media/arbejde.jpg
```

Stillbilledet skal være første billede i klippet, så der ikke er et hop, når videoen starter.

## URL-parametre

- `?gulv=garage` / `kaelder` / `bolig` / `erhverv`: skifter overskriften og vælger rummet på forhånd. Brug én pr. annoncesæt.
- `?kladde=0`: skjuler de gule pladsholder-markeringer, fx til skærmbilleder.

## Deploy på Netlify

Build-kommando og funktioner er sat op i `netlify.toml`. Sæt miljøvariablerne under *Site configuration → Environment variables* (se `.env.example`):

| Variabel | Bruges til |
|---|---|
| `LEAD_WEBHOOK_URL` | Zapier/Make-webhook, der modtager leads. Påkrævet |
| `META_PIXEL_ID`, `META_CAPI_TOKEN` | Lead via Conversions API |
| `META_TEST_EVENT_CODE` | Valgfri, mens der testes i Events Manager |
| `VITE_META_PIXEL_ID` | Pixel i browseren. Uden den vises intet cookie-banner |
| `VITE_DEMO=1` | Til et preview-link til kunden, hvor formularen ikke sender noget |

## Lead-flow

Formular → `/api/lead` (`netlify/functions/lead.mjs`) →

1. Validering + honeypot mod bots.
2. Webhook til Zapier/Make med alle svar, prisinterval, lead-score (`HOT` / `NORMAL` / `UDEN FOR ZONE`), UTM'er, fbclid/fbc/fbp og event_id. Fejler webhooken, får formularen en fejl, så leadet ikke forsvinder i stilhed.
3. `Lead` til Meta CAPI med hashet mail, telefon, navn, postnummer og by. Samme `event_id` som pixel-eventet, så Meta kun tæller det én gang. Sendes kun, når den besøgende har sagt ja til cookies. Den regel justeres, når privatlivspolitikken er på plads.

"Få beregningen på mail" sender `type: "kun-mail"` til samme webhook.

## Events

`CalculatorStart`, `CalculatorStep`, `CalculatorComplete` (custom), `Lead` og `Contact` (standard). Pixel indlæses først efter samtykke.

## Før launch

- [ ] Kundens priser i `pricing.config.js` og 5-10 tilbud i `calibration.cases.js` (`npm test` grøn)
- [ ] Telefon, mail, adresse, garanti, svartid, ejerens navn og foto
- [ ] Rigtige før/efter-billeder
- [ ] Zone (kommuner) bekræftet
- [ ] Privatlivspolitik gennemgået
- [ ] Fjern `class="kladde"` og `<meta name="robots" content="noindex">` i `index.html` og `privatliv.html`
- [ ] Miljøvariabler sat på Netlify, test-lead hele vejen igennem til Zapier/Make og Meta Test Events
- [ ] Test i Facebook- og Instagram-browseren på iOS og Android

## Data

Postnumre og bynavne i `src/calculator/postnumre.json` kommer fra PostNords postnummerfil via npm-pakken `dk-postals` (ISC). Se `scripts/postnumre-fra-csv.mjs`.
