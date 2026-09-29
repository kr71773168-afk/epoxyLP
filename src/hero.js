import cfg from './calculator/pricing.config.js';
import { startHaeld } from './effects/pour.js';

// Overskrift pr. annonce-segment: ?gulv=garage osv. Uden parameter bruges teksten i index.html.
const VARIANTER = {
  garage: ['Nyt garagegulv.', 'Se prisen på 60 sekunder.'],
  kaelder: ['Nyt gulv i kælderen.', 'Se prisen på 60 sekunder.'],
  bolig: ['Fugefrit gulv i hjemmet.', 'Se hvad det koster.'],
  erhverv: ['Gulv til værksted og lager.', 'Få et prisoverslag nu.'],
};

export function startHero({ beregner }) {
  const hero = document.querySelector('.hero');
  const valg = document.getElementById('hero-valg');
  valg.innerHTML = Object.entries(cfg.rum).map(([k, r]) => `
    <button type="button" class="hv" data-rum="${k}" aria-pressed="false">
      <span class="hv-navn">${r.navn}</span><span class="hv-pil" aria-hidden="true">→</span>
      <span class="hv-desk">${r.beskrivelse}</span>
    </button>`).join('');
  const knapper = Array.from(valg.querySelectorAll('.hv'));
  const haeld = startHaeld(hero, '.hv');

  const marker = (rum, animer) => {
    for (const k of knapper) {
      const valgt = k.dataset.rum === rum;
      k.setAttribute('aria-pressed', String(valgt));
      if (valgt && !k.classList.contains('er-valgt')) {
        if (animer) haeld.haeld(k);
        k.classList.add('er-valgt');
      } else if (!valgt) {
        k.classList.remove('er-valgt');
      }
    }
  };

  valg.addEventListener('click', (e) => {
    const knap = e.target.closest('.hv');
    if (!knap) return;
    marker(knap.dataset.rum, true);
    beregner.vaelgRum(knap.dataset.rum, { scroll: true, bruger: true });
  });

  const param = new URLSearchParams(window.location.search).get('gulv');
  if (VARIANTER[param]) {
    const [linje1, linje2] = VARIANTER[param];
    document.querySelectorAll('[data-hero="linje1"]').forEach((el) => { el.textContent = linje1; });
    document.querySelectorAll('[data-hero="linje2"]').forEach((el) => { el.textContent = linje2; });
    if (cfg.rum[param]) {
      marker(param, false);
      beregner.vaelgRum(param, { scroll: false, bruger: false });
    }
  }

  // Hold hero-knapperne i takt, hvis rummet ændres nede i beregneren
  beregner.lyt(() => marker(beregner.data().svar.rum, false));
}
