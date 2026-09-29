import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler, { capiEvent, leadScore, valider } from '../netlify/functions/lead.mjs';
import { gyldigMail, normaliserTelefon } from '../src/validering.js';

const sha = (v) => createHash('sha256').update(v).digest('hex');

const lead = (over = {}) => ({
  type: 'fast-pris',
  kontakt: { navn: 'Mads Nørgaard Jensen', telefon: '+45 22 33 44 55', mail: 'Mads@Example.dk ', hvornaar: 'hurtigst', besked: null },
  beregning: { rum: 'garage', areal: 36, overflade: 'flakes', stand: 'paen', tilvalg: [], postnummer: '8600', by: 'Silkeborg', iZone: true },
  pris: { lav: 17000, hoej: 19500, midt: 18250, inklMoms: true },
  tracking: { event_id: 'abc-123', samtykke: 'ja', fbclid: 'IwAR123', landet: 1790000000000, side: 'https://example.dk/?gulv=garage', fbp: 'fb.1.1.2' },
  tidspunkt: '2026-09-29T10:00:00.000Z',
  firma: '',
  ...over,
});

const req = (body, method = 'POST') => new Request('https://example.dk/api/lead', {
  method,
  headers: { 'Content-Type': 'application/json', 'User-Agent': 'Testbrowser/1.0' },
  body: method === 'POST' ? JSON.stringify(body) : undefined,
});

describe('validering', () => {
  it('normaliserer danske numre', () => {
    expect(normaliserTelefon('+45 22 33 44 55')).toBe('22334455');
    expect(normaliserTelefon('0045-22334455')).toBe('22334455');
    expect(normaliserTelefon('2233 4455')).toBe('22334455');
    expect(normaliserTelefon('1233 4455')).toBeNull();
    expect(normaliserTelefon('223344')).toBeNull();
  });
  it('kender en gyldig mail', () => {
    expect(gyldigMail(' mads@example.dk ')).toBe(true);
    expect(gyldigMail('mads@example')).toBe(false);
    expect(gyldigMail('mads example.dk')).toBe(false);
  });
  it('afviser leads uden kontaktinfo', () => {
    expect(valider(lead())).toBeNull();
    expect(valider(lead({ kontakt: { navn: 'M', telefon: '22334455', mail: 'a@b.dk' } }))).toMatch(/Navn/);
    expect(valider(lead({ type: 'kun-mail', kontakt: { mail: 'a@b.dk' } }))).toBeNull();
    expect(valider(lead({ type: 'noget-andet' }))).toMatch(/type/);
  });
  it('tager imod kontaktformularen med samme krav som beregneren', () => {
    const kontakt = { type: 'kontakt', kontakt: { navn: 'Mads', telefon: '22334455', mail: 'a@b.dk', besked: 'Garage' }, beregning: { postnummer: null } };
    expect(valider(kontakt)).toBeNull();
    expect(valider({ ...kontakt, kontakt: { navn: 'Mads', telefon: '123', mail: 'a@b.dk' } })).toMatch(/telefon/);
    expect(leadScore(kontakt)).toBe('NORMAL');
  });
});

describe('leadScore', () => {
  it('giver HOT i zonen, snart og over 15 m²', () => {
    expect(leadScore(lead())).toBe('HOT');
    expect(leadScore(lead({ kontakt: { ...lead().kontakt, hvornaar: 'senere' } }))).toBe('NORMAL');
    expect(leadScore(lead({ beregning: { ...lead().beregning, iZone: false } }))).toBe('UDEN FOR ZONE');
  });
});

describe('capiEvent', () => {
  it('hasher kontaktdata efter Metas regler og bygger fbc fra fbclid', () => {
    const e = capiEvent(lead(), { ip: '1.2.3.4', userAgent: 'UA', nu: 1790000100000 });
    expect(e.event_name).toBe('Lead');
    expect(e.event_id).toBe('abc-123');
    expect(e.event_time).toBe(1790000100);
    expect(e.user_data.em).toEqual([sha('mads@example.dk')]);
    expect(e.user_data.ph).toEqual([sha('4522334455')]);
    expect(e.user_data.fn).toEqual([sha('mads')]);
    expect(e.user_data.ln).toEqual([sha('nørgaard jensen')]);
    expect(e.user_data.zp).toEqual([sha('8600')]);
    expect(e.user_data.ct).toEqual([sha('silkeborg')]);
    expect(e.user_data.country).toEqual([sha('dk')]);
    expect(e.user_data.fbc).toBe('fb.1.1790000000000.IwAR123');
    expect(e.user_data.fbp).toBe('fb.1.1.2');
    expect(e.custom_data).toMatchObject({ currency: 'DKK', value: 18250 });
  });

  it('skærer postdistriktet af byen', () => {
    const e = capiEvent(lead({ beregning: { ...lead().beregning, by: 'Aarhus C' } }), { nu: 1 });
    expect(e.user_data.ct).toEqual([sha('aarhus')]);
    const viby = capiEvent(lead({ beregning: { ...lead().beregning, by: 'Viby J' } }), { nu: 1 });
    expect(viby.user_data.ct).toEqual([sha('viby')]);
  });
});

describe('handler', () => {
  let kald;
  beforeEach(() => {
    kald = [];
    vi.stubEnv('LEAD_WEBHOOK_URL', 'https://hooks.example.com/lead');
    vi.stubEnv('META_PIXEL_ID', '123');
    vi.stubEnv('META_CAPI_TOKEN', 'token');
    vi.stubGlobal('fetch', vi.fn(async (url, init) => {
      kald.push({ url: String(url), body: JSON.parse(init.body) });
      return new Response('{}', { status: 200 });
    }));
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('sender leadet til webhooken og Lead til Meta', async () => {
    const svar = await handler(req(lead()), { ip: '1.2.3.4' });
    expect(svar.status).toBe(200);
    expect(kald).toHaveLength(2);
    expect(kald[0].url).toBe('https://hooks.example.com/lead');
    expect(kald[0].body.leadScore).toBe('HOT');
    expect(kald[0].body).not.toHaveProperty('firma');
    expect(kald[1].url).toContain('graph.facebook.com/v26.0/123/events');
    expect(kald[1].body.data[0].user_data.client_ip_address).toBe('1.2.3.4');
  });

  it('sender ikke til Meta uden samtykke', async () => {
    await handler(req(lead({ tracking: { ...lead().tracking, samtykke: 'nej' } })), {});
    expect(kald).toHaveLength(1);
  });

  it('lader som om, bots lykkedes, men sender intet', async () => {
    const svar = await handler(req(lead({ firma: 'Spam ApS' })), {});
    expect(svar.status).toBe(200);
    expect(kald).toHaveLength(0);
  });

  it('giver fejl, hvis webhooken fejler, så formularen kan vise det', async () => {
    fetch.mockImplementationOnce(async () => new Response('nej', { status: 500 }));
    const svar = await handler(req(lead()), {});
    expect(svar.status).toBe(502);
  });

  it('afviser ugyldige data og forkerte metoder', async () => {
    expect((await handler(req(lead({ kontakt: { navn: 'Mads', telefon: '12', mail: 'x' } })), {})).status).toBe(422);
    expect((await handler(req(null, 'GET'), {})).status).toBe(405);
  });
});
