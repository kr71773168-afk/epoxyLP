/**
 * Prismotor. Ren funktion: svar + config → prisinterval.
 *
 * Hver del af prisen er et [min, maks]. Et besvaret spørgsmål giver min = maks.
 * Et ubesvaret spørgsmål eller "ved ikke" giver det billigste og det dyreste svar.
 * Intervallet dækker derfor altid den pris, kunden ender med, og det bliver
 * smallere for hvert svar.
 */

/** Rækkefølgen af spørgsmålene i beregneren. */
export const TRIN = ['rum', 'areal', 'overflade', 'stand', 'tilvalg', 'postnummer'];

/**
 * @typedef {object} Svar
 * @property {string|null} rum
 * @property {number|null} areal
 * @property {string|null} overflade
 * @property {string|null} stand        'vedikke' tæller som besvaret, men usikkert
 * @property {string[]|null} tilvalg    null = ikke besvaret, [] = ingen tilvalg
 * @property {string|null} postnummer
 */

/** @returns {Svar} */
export function tommeSvar() {
  return { rum: null, areal: null, overflade: null, stand: null, tilvalg: null, postnummer: null };
}

export function erBesvaret(svar, trin) {
  const v = svar[trin];
  if (trin === 'postnummer') return typeof v === 'string' && /^\d{4}$/.test(v);
  return v !== null && v !== undefined;
}

/** Løbende meter væg, estimeret ud fra et nogenlunde kvadratisk rum. */
export function estimerLbm(areal, rum, cfg) {
  const faktor = cfg.rum[rum]?.vaegFaktor ?? 0.85;
  return 4 * Math.sqrt(areal) * faktor;
}

export function tilvalgPris(tilvalg, areal, lbm) {
  if (tilvalg.type === 'lbm') return tilvalg.pris * lbm;
  if (tilvalg.type === 'm2') return tilvalg.pris * areal;
  return tilvalg.pris;
}

// Rund til hele kroner først, så kommatal som 11999,9999 ikke falder et trin ned.
const rundNed = (x, trin) => Math.floor(Math.round(x) / trin) * trin;
const rundOp = (x, trin) => Math.ceil(Math.round(x) / trin) * trin;

/**
 * @param {Svar} svar
 * @param {object} cfg  pricing.config.js
 */
export function beregnPris(svar, cfg) {
  const aabne = TRIN.filter((t) => !erBesvaret(svar, t)).length;
  const usikre = svar.stand === 'vedikke' ? 1 : 0;
  const erhverv = svar.rum ? Boolean(cfg.rum[svar.rum]?.erhverv) : false;
  const momsFaktor = erhverv ? 1 : 1 + cfg.moms;

  const basis = {
    klar: false,
    individuel: false,
    aabne,
    usikre,
    iVater: aabne === 0 && usikre === 0,
    inklMoms: !erhverv,
  };

  const areal = svar.areal;
  if (!areal || !svar.overflade) return basis;
  if (areal > cfg.maksM2) return { ...basis, individuel: true };

  const system = cfg.opstart + areal * cfg.overflader[svar.overflade].prisPrM2;

  const standValg = svar.stand && svar.stand !== 'vedikke' ? [svar.stand] : Object.keys(cfg.stand);
  const standPriser = standValg.map((k) => cfg.stand[k].prisPrM2 * areal);
  const forbehandling = [Math.min(...standPriser), Math.max(...standPriser)];

  const lbm = estimerLbm(areal, svar.rum, cfg);
  const tilvalg = [0, 0];
  for (const [noegle, t] of Object.entries(cfg.tilvalg)) {
    const pris = tilvalgPris(t, areal, lbm);
    if (svar.tilvalg === null) {
      tilvalg[1] += pris;
    } else if (svar.tilvalg.includes(noegle)) {
      tilvalg[0] += pris;
      tilvalg[1] += pris;
    }
  }

  const sumMin = system + forbehandling[0] + tilvalg[0];
  const sumMaks = system + forbehandling[1] + tilvalg[1];
  const lavEks = Math.max(cfg.minimumspris, sumMin * (1 - cfg.basisUsikkerhed));
  const hoejEks = Math.max(cfg.minimumspris, sumMaks * (1 + cfg.basisUsikkerhed));
  const lav = rundNed(lavEks * momsFaktor, cfg.afrunding);
  const hoej = rundOp(hoejEks * momsFaktor, cfg.afrunding);
  const midt = (lav + hoej) / 2;

  return {
    ...basis,
    klar: true,
    lav,
    hoej,
    midt,
    prM2: midt / areal,
    spred: hoej === lav ? 0 : (hoej - lav) / 2 / midt,
    minimumspris: hoej === lav && lav === rundOp(cfg.minimumspris * momsFaktor, cfg.afrunding),
    lbm,
    grupper: {
      system: [system * momsFaktor, system * momsFaktor],
      forbehandling: forbehandling.map((v) => v * momsFaktor),
      tilvalg: tilvalg.map((v) => v * momsFaktor),
    },
  };
}
