import { describe, expect, it } from 'vitest';
import { TRIN, beregnPris, estimerLbm, tommeSvar } from './engine.js';

// Fast test-config, så testene af selve mekanikken ikke ændrer sig, når kundens priser kommer.
const cfg = {
  moms: 0.25,
  opstart: 2400,
  minimumspris: 9600,
  basisUsikkerhed: 0.05,
  afrunding: 500,
  maksM2: 250,
  rum: {
    garage: { vaegFaktor: 0.75, erhverv: false },
    kaelder: { vaegFaktor: 0.9, erhverv: false },
    bolig: { vaegFaktor: 0.85, erhverv: false },
    erhverv: { vaegFaktor: 0.8, erhverv: true },
  },
  overflader: {
    ensfarvet: { prisPrM2: 240 },
    flakes: { prisPrM2: 340 },
    metallic: { prisPrM2: 620 },
  },
  stand: {
    paen: { prisPrM2: 0 },
    revner: { prisPrM2: 50 },
    maling: { prisPrM2: 90 },
  },
  tilvalg: {
    hulkehl: { type: 'lbm', pris: 150 },
    skridsikker: { type: 'm2', pris: 35 },
  },
};

const garage = { ...tommeSvar(), rum: 'garage', areal: 36, overflade: 'flakes' };

describe('beregnPris', () => {
  it('viser ingen pris før areal og overflade er kendt', () => {
    expect(beregnPris(tommeSvar(), cfg).klar).toBe(false);
    expect(beregnPris({ ...tommeSvar(), rum: 'garage', areal: 36 }, cfg).klar).toBe(false);
    expect(beregnPris({ ...tommeSvar(), overflade: 'flakes' }, cfg).klar).toBe(false);
  });

  it('giver et bredt interval, når stand og tilvalg mangler', () => {
    const r = beregnPris(garage, cfg);
    // min: (2400 + 36*340) * 0,95 * 1,25 = 17.385 → 17.000
    // maks: (14.640 + 36*90 + 36*35 + 18 lbm*150) * 1,05 * 1,25 → 28.665 → 29.000
    expect(r.klar).toBe(true);
    expect(r.lav).toBe(17000);
    expect(r.hoej).toBe(29000);
    expect(r.aabne).toBe(3);
    expect(r.iVater).toBe(false);
  });

  it('snævrer ind til ±5 % plus afrunding, når alt er besvaret', () => {
    const r = beregnPris({ ...garage, stand: 'paen', tilvalg: [], postnummer: '8600' }, cfg);
    expect(r.lav).toBe(17000);
    expect(r.hoej).toBe(19500);
    expect(r.aabne).toBe(0);
    expect(r.iVater).toBe(true);
    expect(r.spred).toBeLessThan(0.08);
  });

  it('regner tilvalg med, når de er valgt', () => {
    const r = beregnPris({ ...garage, stand: 'revner', tilvalg: ['hulkehl'], postnummer: '8600' }, cfg);
    expect(r.lbm).toBeCloseTo(18, 5);
    // (14.640 + 1.800 + 2.700) = 19.140 → 22.729 til 25.121 inkl. moms
    expect(r.lav).toBe(22500);
    expect(r.hoej).toBe(25500);
  });

  it('behandler "ved ikke" som hele spændet, men som et besvaret spørgsmål', () => {
    const ubesvaret = beregnPris({ ...garage, tilvalg: [] }, cfg);
    const vedIkke = beregnPris({ ...garage, stand: 'vedikke', tilvalg: [] }, cfg);
    expect(vedIkke.lav).toBe(ubesvaret.lav);
    expect(vedIkke.hoej).toBe(ubesvaret.hoej);
    expect(vedIkke.aabne).toBe(ubesvaret.aabne - 1);
    expect(vedIkke.usikre).toBe(1);
    expect(beregnPris({ ...garage, stand: 'vedikke', tilvalg: [], postnummer: '8600' }, cfg).iVater).toBe(false);
  });

  it('viser erhverv ekskl. moms', () => {
    const r = beregnPris({ ...tommeSvar(), rum: 'erhverv', areal: 120, overflade: 'ensfarvet', stand: 'paen', tilvalg: [] }, cfg);
    expect(r.inklMoms).toBe(false);
    // (2400 + 120*240) = 31.200 → 29.640 til 32.760
    expect(r.lav).toBe(29500);
    expect(r.hoej).toBe(33000);
  });

  it('bruger minimumsprisen på små gulve', () => {
    const r = beregnPris({ ...garage, areal: 10, overflade: 'ensfarvet', stand: 'paen', tilvalg: [] }, cfg);
    expect(r.lav).toBe(12000);
    expect(r.hoej).toBe(12000);
    expect(r.minimumspris).toBe(true);
    expect(r.spred).toBe(0);
  });

  it('giver ingen tal over maks-arealet', () => {
    const r = beregnPris({ ...garage, areal: 300 }, cfg);
    expect(r.individuel).toBe(true);
    expect(r.klar).toBe(false);
  });

  it('dækker altid prisen for enhver måde at svare færdig på', () => {
    const standValg = ['paen', 'revner', 'maling', 'vedikke'];
    const tilvalgValg = [[], ['hulkehl'], ['skridsikker'], ['hulkehl', 'skridsikker']];
    for (const areal of [8, 18, 36, 75, 180]) {
      for (const overflade of Object.keys(cfg.overflader)) {
        const delvis = beregnPris({ ...tommeSvar(), rum: 'garage', areal, overflade }, cfg);
        for (const stand of standValg) {
          const medStand = beregnPris({ ...tommeSvar(), rum: 'garage', areal, overflade, stand }, cfg);
          expect(medStand.lav).toBeGreaterThanOrEqual(delvis.lav);
          expect(medStand.hoej).toBeLessThanOrEqual(delvis.hoej);
          for (const tilvalg of tilvalgValg) {
            const fuld = beregnPris({ ...tommeSvar(), rum: 'garage', areal, overflade, stand, tilvalg }, cfg);
            expect(fuld.lav).toBeGreaterThanOrEqual(medStand.lav);
            expect(fuld.hoej).toBeLessThanOrEqual(medStand.hoej);
          }
        }
      }
    }
  });

  it('tæller alle seks trin som åbne fra start', () => {
    expect(beregnPris(tommeSvar(), cfg).aabne).toBe(TRIN.length);
    expect(beregnPris({ ...tommeSvar(), postnummer: '86' }, cfg).aabne).toBe(TRIN.length);
  });
});

describe('estimerLbm', () => {
  it('bruger rummets vægfaktor', () => {
    expect(estimerLbm(36, 'garage', cfg)).toBeCloseTo(18, 5);
    expect(estimerLbm(36, 'kaelder', cfg)).toBeCloseTo(21.6, 5);
    expect(estimerLbm(36, null, cfg)).toBeCloseTo(20.4, 5);
  });
});
