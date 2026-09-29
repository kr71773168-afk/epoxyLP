import { attribution, nytEventId, track } from './tracking.js';
import { gyldigMail, normaliserTelefon } from './validering.js';

// Demo: intet sendes, tak-skærmen viser de data, der ville være sendt. Slås til med VITE_DEMO=1.
const DEMO = import.meta.env.VITE_DEMO === '1';
const ENDPOINT = import.meta.env.VITE_LEAD_ENDPOINT || '/api/lead';

const HVORNAAR = {
  hurtigst: 'Hurtigst muligt',
  '1-3-mdr': 'Inden for 1-3 måneder',
  senere: 'Senere',
  undersoeger: 'Undersøger bare',
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export async function sendData(payload) {
  if (DEMO) {
    await new Promise((r) => setTimeout(r, 500));
    return;
  }
  const svar = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!svar.ok) throw new Error(`HTTP ${svar.status}`);
}

export function startLead({ beregner, samtykke }) {
  const form = document.getElementById('lead-form');
  const send = document.getElementById('lf-send');
  const formFejl = document.getElementById('lf-fejl');
  const telefonTekst = document.querySelector('[data-telefon] .tlf-nr')?.textContent.trim() ?? '';

  const felter = {
    navn: { el: form.elements.navn, tjek: (v) => (v.trim().length >= 2 ? '' : 'Skriv dit navn.') },
    telefon: { el: form.elements.telefon, tjek: (v) => (normaliserTelefon(v) ? '' : 'Skriv et dansk telefonnummer med 8 cifre.') },
    mail: { el: form.elements.mail, tjek: (v) => (gyldigMail(v) ? '' : 'Tjek mailadressen. Den ser ikke rigtig ud.') },
  };
  let forsoegt = false;

  function tjekFelt(navn) {
    const { el, tjek } = felter[navn];
    const fejl = tjek(el.value);
    el.setAttribute('aria-invalid', String(Boolean(fejl)));
    document.getElementById(`${el.id}-fejl`).textContent = fejl;
    return !fejl;
  }
  for (const navn of Object.keys(felter)) {
    felter[navn].el.addEventListener('blur', () => { if (forsoegt) tjekFelt(navn); });
    felter[navn].el.addEventListener('input', () => { if (forsoegt) tjekFelt(navn); });
  }

  function payload(type, kontakt, eventId) {
    const b = beregner.data();
    return {
      type,
      kontakt,
      beregning: { ...b.svar, tekst: b.tekst, faerdig: b.faerdig },
      pris: b.pris,
      tracking: { event_id: eventId, samtykke: samtykke.status(), ...attribution() },
      tidspunkt: new Date().toISOString(),
      firma: form.elements.firma.value,
    };
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    forsoegt = true;
    formFejl.hidden = true;
    const ok = Object.keys(felter).map(tjekFelt);
    if (ok.includes(false)) {
      felter[Object.keys(felter)[ok.indexOf(false)]].el.focus();
      return;
    }
    const eventId = nytEventId();
    const data = payload('fast-pris', {
      navn: form.elements.navn.value.trim(),
      telefon: normaliserTelefon(form.elements.telefon.value),
      mail: form.elements.mail.value.trim(),
      hvornaar: form.elements.hvornaar.value || null,
      besked: null,
    }, eventId);

    const knapTekst = send.innerHTML;
    send.disabled = true;
    send.textContent = 'Sender …';
    try {
      await sendData(data);
      track('Lead', { value: data.pris.midt ?? 0, currency: 'DKK' }, eventId);
      visTak(data);
      beregner.visPris();
    } catch {
      formFejl.textContent = `Det gik ikke at sende. Prøv igen om lidt, eller ring på ${telefonTekst}.`;
      formFejl.hidden = false;
      send.disabled = false;
      send.innerHTML = knapTekst;
    }
  });

  /** Tak-teksten under prisen. Prisen selv vises af beregneren (visPris). */
  function visTak(data) {
    const fornavn = data.kontakt.navn.split(/\s+/)[0];
    const titel = document.getElementById('tak-titel');
    titel.innerHTML = `Tak, ${esc(fornavn)}. Vi ringer dig op <span data-pladsholder>inden for 24 timer på hverdage</span>.`;
    const t = data.beregning.tekst;
    const raekker = [
      ['Gulv', [t.rum, t.areal, t.overflade].filter(Boolean).join(' · ')],
      ['Stand', t.stand],
      ['Tilvalg', t.tilvalg],
      ['Sted', t.postnummer],
      ['Hvornår', HVORNAAR[data.kontakt.hvornaar]],
    ].filter(([, v]) => v);
    document.getElementById('tak-resume').innerHTML = raekker
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
    if (DEMO) {
      document.getElementById('demo-data').hidden = false;
      document.getElementById('demo-data-pre').textContent = JSON.stringify(data, null, 2);
    }
  }
}
