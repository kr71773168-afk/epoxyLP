import cfg from './calculator/pricing.config.js';
import { tegnRumBillede } from './effects/materials.js';

// Overskrift pr. annonce-segment: ?gulv=garage osv. Uden parameter bruges teksten i index.html.
const VARIANTER = {
  garage: ['Nyt garagegulv.', 'Se prisen på 60 sekunder.'],
  kaelder: ['Nyt gulv i kælderen.', 'Se prisen på 60 sekunder.'],
  bolig: ['Fugefrit gulv i hjemmet.', 'Se hvad det koster.'],
  erhverv: ['Gulv til værksted og lager.', 'Få et prisoverslag nu.'],
};

export function startHero({ beregner }) {
  const valg = document.getElementById('hero-valg');
  valg.innerHTML = Object.entries(cfg.rum).map(([k, r]) => `
    <button type="button" class="flise" data-rum="${k}" aria-pressed="false">
      <canvas class="flise-billede" data-tegn="rum:${k}" width="480" height="300" aria-hidden="true"></canvas>
      <span class="flise-tekst"><span class="flise-navn">${r.navn}</span><span class="flise-desk">${r.beskrivelse}</span></span>
      <span class="flise-tjek" aria-hidden="true"></span>
    </button>`).join('');
  valg.querySelectorAll('canvas').forEach((c) => tegnRumBillede(c, c.dataset.tegn.split(':')[1]));
  const knapper = Array.from(valg.querySelectorAll('.flise'));

  const marker = (rum) => {
    for (const k of knapper) {
      const valgt = k.dataset.rum === rum;
      k.setAttribute('aria-pressed', String(valgt));
      k.classList.toggle('er-valgt', valgt);
    }
  };

  valg.addEventListener('click', (e) => {
    const knap = e.target.closest('.flise');
    if (!knap) return;
    marker(knap.dataset.rum);
    beregner.vaelgRum(knap.dataset.rum, { scroll: true, bruger: true });
  });

  const param = new URLSearchParams(window.location.search).get('gulv');
  if (VARIANTER[param]) {
    const [linje1, linje2] = VARIANTER[param];
    document.querySelectorAll('[data-hero="linje1"]').forEach((el) => { el.textContent = linje1; });
    document.querySelectorAll('[data-hero="linje2"]').forEach((el) => { el.textContent = linje2; });
    if (cfg.rum[param]) {
      marker(param);
      beregner.vaelgRum(param, { scroll: false, bruger: false });
    }
  }

  // Hold hero-fliserne i takt, hvis rummet ændres nede i beregneren
  beregner.lyt(() => marker(beregner.data().svar.rum));
}
