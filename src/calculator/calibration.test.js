import { describe, expect, it } from 'vitest';
import cfg from './pricing.config.js';
import cases from './calibration.cases.js';
import { beregnPris, tommeSvar } from './engine.js';

describe('kalibrering mod kundens rigtige tilbud', () => {
  if (cases.length === 0) {
    it.todo('tilføj 5-10 af kundens tidligere tilbud i calibration.cases.js');
    return;
  }

  it.each(cases)('$navn', ({ svar, faktiskPris }) => {
    const r = beregnPris({ ...tommeSvar(), tilvalg: [], postnummer: '8600', ...svar }, cfg);
    expect(r.klar, 'beregneren skal kunne give en pris').toBe(true);
    expect(faktiskPris).toBeGreaterThanOrEqual(r.lav);
    expect(faktiskPris).toBeLessThanOrEqual(r.hoej);
  });
});
