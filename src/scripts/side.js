import { startSamtykke } from '../consent.js';
import { track } from '../tracking.js';
import { startVideo } from '../video.js';

// ?kladde=0 skjuler pladsholder-markeringerne, fx til skærmbilleder
if (new URLSearchParams(window.location.search).get('kladde') === '0') {
  document.documentElement.classList.remove('kladde');
}

startSamtykke();
startVideo();

document.addEventListener('click', (e) => {
  if (e.target.closest('a[href^="tel:"]')) track('Contact', { kilde: 'telefon' });
});

/* ---------- menu ---------- */
const menuKnap = document.querySelector('.menu-knap');
const mobilmenu = document.getElementById('mobilmenu');
menuKnap?.addEventListener('click', () => {
  const aabn = mobilmenu.hidden;
  mobilmenu.hidden = !aabn;
  menuKnap.setAttribute('aria-expanded', String(aabn));
  menuKnap.textContent = aabn ? 'Luk' : 'Menu';
  document.documentElement.classList.toggle('menu-aaben', aabn);
});

// Undermenuer: åbner ved hover på desktop, ved klik alle steder. Escape og klik udenfor lukker.
const grupper = Array.from(document.querySelectorAll('[data-nav-gruppe]'));
const lukAlle = (undtagen) => grupper.forEach((g) => {
  if (g !== undtagen) g.querySelector('button').setAttribute('aria-expanded', 'false');
});
for (const g of grupper) {
  const knap = g.querySelector('button');
  knap.addEventListener('click', () => {
    const aaben = knap.getAttribute('aria-expanded') === 'true';
    lukAlle(g);
    knap.setAttribute('aria-expanded', String(!aaben));
  });
  g.addEventListener('focusout', (e) => {
    if (!g.contains(e.relatedTarget)) knap.setAttribute('aria-expanded', 'false');
  });
}
document.addEventListener('click', (e) => { if (!e.target.closest('[data-nav-gruppe]')) lukAlle(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lukAlle(); });
