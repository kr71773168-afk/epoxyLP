import { createHash } from 'node:crypto';
import { gyldigMail, normaliserTelefon } from '../../src/validering.js';

/**
 * Modtager leads fra formularen.
 *  1. Validerer (og ignorerer bots via honeypot-feltet "firma")
 *  2. Sender leadet videre til Zapier/Make (LEAD_WEBHOOK_URL). Fejler det, får formularen en fejl.
 *  3. Sender Lead til Meta Conversions API, hvis der er givet samtykke. Fejler det, blokerer det ikke.
 *
 * Miljøvariabler: LEAD_WEBHOOK_URL, META_PIXEL_ID, META_CAPI_TOKEN,
 *                 META_TEST_EVENT_CODE (valgfri), META_GRAPH_VERSION (standard v26.0)
 */
export const config = { path: '/api/lead' };

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

const sha256 = (v) => createHash('sha256').update(v).digest('hex');
const norm = (v) => String(v ?? '').trim().toLowerCase();
const hash = (v) => (norm(v) ? [sha256(norm(v))] : undefined);


export function valider(data) {
  if (!data || typeof data !== 'object') return 'Ingen data';
  const k = data.kontakt ?? {};
  if (data.type === 'kun-mail') return gyldigMail(k.mail) ? null : 'Ugyldig mail';
  if (data.type !== 'fast-pris') return 'Ukendt type';
  if (String(k.navn ?? '').trim().length < 2) return 'Navn mangler';
  if (!normaliserTelefon(k.telefon)) return 'Ugyldigt telefonnummer';
  if (!gyldigMail(k.mail)) return 'Ugyldig mail';
  return null;
}

export function leadScore(data) {
  const b = data.beregning ?? {};
  const hvornaar = data.kontakt?.hvornaar;
  if (b.iZone === false) return 'UDEN FOR ZONE';
  if (b.iZone === true && ['hurtigst', '1-3-mdr'].includes(hvornaar) && (b.areal ?? 0) >= 15) return 'HOT';
  return 'NORMAL';
}

export function capiEvent(data, { ip, userAgent, nu = Date.now() }) {
  const k = data.kontakt ?? {};
  const b = data.beregning ?? {};
  const t = data.tracking ?? {};
  const [fornavn, ...resten] = String(k.navn ?? '').trim().split(/\s+/);
  const fbc = t.fbc || (t.fbclid ? `fb.1.${Number(t.landet) || nu}.${t.fbclid}` : undefined);
  const telefon = normaliserTelefon(k.telefon);
  // Meta vil have byen uden mellemrum og tegn. Postdistrikter som "Aarhus C" og "Viby J" skæres af.
  const by = norm(String(b.by ?? '').replace(/\s+[A-ZÆØÅ]{1,2}$/, '')).replace(/[^a-zæøå]/g, '');
  return {
    event_name: 'Lead',
    event_time: Math.floor(nu / 1000),
    event_id: t.event_id,
    action_source: 'website',
    event_source_url: t.side,
    user_data: {
      em: hash(k.mail),
      ph: telefon ? [sha256(`45${telefon}`)] : undefined,
      fn: hash(fornavn),
      ln: hash(resten.join(' ')),
      zp: hash(b.postnummer),
      ct: by ? [sha256(by)] : undefined,
      country: [sha256('dk')],
      client_ip_address: ip || undefined,
      client_user_agent: userAgent || undefined,
      fbc,
      fbp: t.fbp || undefined,
    },
    custom_data: {
      currency: 'DKK',
      value: Number(data.pris?.midt) || 0,
      content_name: b.overflade || undefined,
    },
  };
}

async function sendTilMeta(event) {
  const pixel = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixel || !token) return;
  const version = process.env.META_GRAPH_VERSION || 'v26.0';
  const body = { data: [event] };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;
  const svar = await fetch(`https://graph.facebook.com/${version}/${pixel}/events?access_token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(4000),
  });
  if (!svar.ok) console.error('Meta CAPI fejlede', svar.status, await svar.text());
}

export default async (req, context) => {
  if (req.method !== 'POST') return json({ ok: false, fejl: 'Kun POST' }, 405);

  let data;
  try {
    data = await req.json();
  } catch {
    return json({ ok: false, fejl: 'Ugyldig JSON' }, 400);
  }

  // Honeypot: bots udfylder feltet "firma". Lad som om alt gik godt.
  if (data?.firma) return json({ ok: true });

  const fejl = valider(data);
  if (fejl) return json({ ok: false, fejl }, 422);

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (!webhook) {
    console.error('LEAD_WEBHOOK_URL mangler');
    return json({ ok: false, fejl: 'Serveren er ikke sat op endnu' }, 500);
  }

  const { firma, ...lead } = data;
  lead.leadScore = leadScore(data);
  lead.modtaget = new Date().toISOString();

  try {
    const svar = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(8000),
    });
    if (!svar.ok) throw new Error(`Webhook svarede ${svar.status}`);
  } catch (err) {
    console.error('Lead kunne ikke sendes videre', err);
    return json({ ok: false, fejl: 'Kunne ikke gemme henvendelsen' }, 502);
  }

  // Samme regel som pixel: kun med samtykke. Justeres, når kundens privatlivspolitik er på plads.
  if (data.type === 'fast-pris' && data.tracking?.samtykke === 'ja') {
    try {
      await sendTilMeta(capiEvent(data, { ip: context?.ip, userAgent: req.headers.get('user-agent') }));
    } catch (err) {
      console.error('Meta CAPI fejlede', err);
    }
  }

  return json({ ok: true });
};
