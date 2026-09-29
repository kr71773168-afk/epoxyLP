import { startSamtykke } from '../consent.js';
import { track } from '../tracking.js';
import { startVideo } from '../video.js';

// ?kladde=0 skjuler pladsholder-markeringerne, fx til skærmbilleder
if (new URLSearchParams(window.location.search).get('kladde') === '0') {
  document.documentElement.classList.remove('kladde');
}

startSamtykke();
startVideo();

/* ---------- kladde: skift stilart (A, B, C) ---------- */
const stilKnapper = Array.from(document.querySelectorAll('[data-stil-knap]'));
const markerStil = () => {
  const aktivStil = document.documentElement.dataset.stil;
  stilKnapper.forEach((k) => k.setAttribute('aria-pressed', String(k.dataset.stilKnap === aktivStil)));
};
stilKnapper.forEach((k) => k.addEventListener('click', () => {
  document.documentElement.dataset.stil = k.dataset.stilKnap;
  try { localStorage.setItem('se-stil', k.dataset.stilKnap); } catch { /* privat browsing */ }
  markerStil();

/* ---------- kladde: vis eller skjul pladsholderne ---------- */
const pladsholderKnap = document.querySelector('[data-pladsholder-knap]');
if (pladsholderKnap) {
  const rod = document.documentElement;
  const marker = () => pladsholderKnap.setAttribute('aria-pressed', String(rod.classList.contains('vis-pladsholdere')));
  pladsholderKnap.addEventListener('click', () => {
    const vis = rod.classList.toggle('vis-pladsholdere');
    try { localStorage.setItem('se-pladsholdere', vis ? '1' : '0'); } catch { /* privat browsing */ }
    marker();
  });
  marker();
}
}));
markerStil();

/* ---------- kladde: vis eller skjul pladsholderne ---------- */
const pladsholderKnap = document.querySelector('[data-pladsholder-knap]');
if (pladsholderKnap) {
  const rod = document.documentElement;
  const marker = () => pladsholderKnap.setAttribute('aria-pressed', String(rod.classList.contains('vis-pladsholdere')));
  pladsholderKnap.addEventListener('click', () => {
    const vis = rod.classList.toggle('vis-pladsholdere');
    try { localStorage.setItem('se-pladsholdere', vis ? '1' : '0'); } catch { /* privat browsing */ }
    marker();
  });
  marker();
}

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
  menuKnap.querySelector('.menu-tekst').textContent = aabn ? 'Luk' : 'Menu';
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
