# Gulvkatalog · Silkeborg Epoxy

En selvstændig side, ikke en del af hjemmesiden: en interaktiv brochure med de fem gulvtyper (industrigulv, Flake Floor, Color Quartz, PU-gulv og stentæppe). Hvert kort har et foto, en overflade, farveprøver, fire fordele og en grøn bjælke, der fører ned til kontakt. Et tryk på en farve skifter overfladen. Et tryk på overfladen viser gulvet i stort.

Preview: https://claude.ai/artifact/Fc91USBv9WkGmsMjrk6sSx

## Byg

```
node katalog/byg.mjs
```

Giver `katalog/dist/index.html` og `katalog/dist/img/`. Mappen kan lægges op hvor som helst, fx som et undersite eller sit eget domæne. `dist/artifact.html` er den samme side uden `<html>`-rammen, til preview-artifacten.

## Her retter du

| Hvad | Hvor |
|---|---|
| Gulvtyper, tekster, fordele, bjælketekst, farver og RAL-koder | `data.js` |
| Telefon, mail, adresse, garanti og åbningstider | `../src/data/firma.js` (samme som hjemmesiden) |
| Udseende | `side.css` (én palet øverst) |
| Farveskift, stor visning, kopiér-knapper | `side.js` |
| Ikoner | `ikoner.js` (Lucide) |

## Video i toppen

Baggrunden i toppen er videoen af Dusko, der lægger gulv. Det er det samme klip som på hjemmesiden, og det hentes fra `../src/media/arbejde.mp4`, `arbejde.webm` og stillbilledet `arbejde.jpg`. Videoen spiller uden lyd i loop og kun, mens toppen er på skærmen. Ved "reducer bevægelse" eller datasparetilstand står stillbilledet. Et nyt klip laves med ffmpeg-kommandoerne i hovedmappens README (samme filnavne), og så bygger du igen.

## Billeder

| Billede | Fil | Størrelse |
|---|---|---|
| Fotoet øverst på kortet | `billeder/fotos/scene-<type>.jpg` | kvadrat, mindst 700 px |
| Overfladen på kortet | `billeder/overflader/flade/<type>-<farve>.jpg` | 2,2:1 |
| Den store visning | `billeder/overflader/<type>-<farve>.jpg` | 1600×1000 |
| Den runde prøve | `billeder/overflader/proeve/<type>-<farve>.jpg` | kvadrat, mindst 192 px |

Fotoene er klippet ud af brochure-udkastet (ca. 340 px, så de er lidt bløde på skarpe skærme). Overfladerne er renderede visualiseringer. Skift begge til rigtige fotos med de samme filnavne og byg igen. Mangler et billede, stopper bygget med en fejl, der siger hvilket.

Nye overflader: `PLAYWRIGHT=/sti/til/playwright/index.mjs node katalog/render/render.mjs pu-sand` (scenerne står i `render/scener.json`, ca. 1 minut pr. billede). Scriptet laver selv prøven og udsnittet til kortet.

## Før den bruges

- [ ] Rigtige fotos og overflader i `billeder/`
- [ ] Farver og fordele i `data.js` rettet til det, firmaet faktisk tilbyder
- [ ] Telefon, mail og garanti i `src/data/firma.js` (står som pladsholdere)
