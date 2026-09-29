import { samtykkeStatus } from './consent.js';
import { sendData } from './lead-form.js';
import { attribution, nytEventId, track } from './tracking.js';
import { gyldigMail, normaliserTelefon } from './validering.js';

/** Kontaktformularen på /kontakt/. Sendes til samme endpoint som beregneren med type "kontakt". */
export function startKontakt() {
  const form = document.getElementById('kontakt-form');
  if (!form) return;
  const send = document.getElementById('kf-send');
  const fejlTekst = document.getElementById('kf-fejl');
  const felter = {
    navn: (v) => (v.trim().length >= 2 ? '' : 'Skriv dit navn.'),
    telefon: (v) => (normaliserTelefon(v) ? '' : 'Skriv et dansk telefonnummer med 8 cifre.'),
    mail: (v) => (gyldigMail(v) ? '' : 'Tjek mailadressen. Den ser ikke rigtig ud.'),
  };
  let forsoegt = false;

  const tjek = (navn) => {
    const el = form.elements[navn];
    const fejl = felter[navn](el.value);
    el.setAttribute('aria-invalid', String(Boolean(fejl)));
    document.getElementById(`${el.id}-fejl`).textContent = fejl;
    return !fejl;
  };
  for (const navn of Object.keys(felter)) {
    form.elements[navn].addEventListener('input', () => { if (forsoegt) tjek(navn); });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    forsoegt = true;
    fejlTekst.hidden = true;
    const ok = Object.keys(felter).map(tjek);
    if (ok.includes(false)) {
      form.elements[Object.keys(felter)[ok.indexOf(false)]].focus();
      return;
    }
    const eventId = nytEventId();
    const data = {
      type: 'kontakt',
      kontakt: {
        navn: form.elements.navn.value.trim(),
        telefon: normaliserTelefon(form.elements.telefon.value),
        mail: form.elements.mail.value.trim(),
        besked: form.elements.besked.value.trim() || null,
      },
      beregning: { postnummer: form.elements.postnummer.value.trim() || null },
      tracking: { event_id: eventId, samtykke: samtykkeStatus(), ...attribution() },
      tidspunkt: new Date().toISOString(),
      firma: form.elements.firma.value,
    };
    const knapTekst = send.innerHTML;
    send.disabled = true;
    send.textContent = 'Sender …';
    try {
      await sendData(data);
      track('Lead', { value: 0, currency: 'DKK', kilde: 'kontakt' }, eventId);
      form.hidden = true;
      document.getElementById('kf-tak').hidden = false;
      document.getElementById('kf-tak-titel').focus();
    } catch {
      fejlTekst.textContent = 'Det gik ikke at sende. Prøv igen om lidt, eller ring til os.';
      fejlTekst.hidden = false;
      send.disabled = false;
      send.innerHTML = knapTekst;
    }
  });
}
