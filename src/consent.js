import { aktiverPixel, deaktiverPixel, pixelKonfigureret } from './tracking.js';

const NOEGLE = 'se-samtykke-v1';

function laes() {
  try { return localStorage.getItem(NOEGLE); } catch { return null; }
}
function gem(valg) {
  try { localStorage.setItem(NOEGLE, valg); } catch { /* privat browsing */ }
}

/**
 * Cookie-samtykke. Banneret vises kun, hvis der er noget at spørge om (en Pixel ID).
 * "Nej tak" og "Ja tak" er lige nemme at trykke på.
 */
export function startSamtykke() {
  const banner = document.getElementById('samtykke');
  const knapper = document.querySelectorAll('[data-cookie-indstillinger]');

  if (!pixelKonfigureret()) {
    knapper.forEach((k) => { k.hidden = true; });
    return { status: () => null };
  }

  if (laes() === 'ja') aktiverPixel();
  if (!laes()) banner.hidden = false;

  banner.addEventListener('click', (e) => {
    const knap = e.target.closest('[data-samtykke]');
    if (!knap) return;
    const valg = knap.dataset.samtykke;
    gem(valg);
    banner.hidden = true;
    if (valg === 'ja') aktiverPixel();
    else deaktiverPixel();
  });
  knapper.forEach((k) => k.querySelector('button')?.addEventListener('click', () => {
    banner.hidden = false;
    banner.querySelector('[data-samtykke="nej"]').focus();
  }));

  return { status: () => laes() };
}
