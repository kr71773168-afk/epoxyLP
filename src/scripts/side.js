import { startSamtykke } from '../consent.js';
import { track } from '../tracking.js';
import { startVideo } from '../video.js';

// ?kladde=0 skjuler pladsholder-markeringerne, fx til skærmbilleder
if (new URLSearchParams(window.location.search).get('kladde') === '0') {
  document.documentElement.classList.remove('kladde');
}

startSamtykke();
startVideo();

/* ---------- kladde: panelet i hjørnet ---------- */
const kladdeFane = document.querySelector('.kladde-fane');
const kladdeIndhold = document.getElementById('kladde-indhold');
if (kladdeFane && kladdeIndhold) {
  const saetAaben = (aaben) => {
    kladdeIndhold.hidden = !aaben;
    kladdeFane.setAttribute('aria-expanded', String(aaben));
  };
  kladdeFane.addEventListener('click', () => saetAaben(kladdeIndhold.hidden));
  document.addEventListener('click', (e) => { if (!e.target.closest('.kladde-panel')) saetAaben(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') saetAaben(false); });
}

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

/* ---------- header med skygge, når siden er rullet ---------- */
const hoved = document.querySelector('.top');
const markerRul = () => hoved?.classList.toggle('er-rullet', window.scrollY > 8);
window.addEventListener('scroll', markerRul, { passive: true });
markerRul();

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

// Kortet over området tegnes ind, når det kommer på skærmen (står bare færdigt ved "reducer bevægelse")
const tegn = document.querySelector('[data-tegn]');
if (tegn && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  tegn.classList.add('kan-tegne');
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    tegn.classList.add('er-tegnet');
    io.disconnect();
  }, { threshold: 0.35 });
  io.observe(tegn);
}

// Rolig indtoning: overskrifter, kort og rækker toner frem, når de kommer på skærmen
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const vis = document.querySelectorAll('[data-vis], .sektion-hoved, .forloeb-hoved, .gulvkort li, .forloeb li, .folk-liste li, .folk-titel, .koer-tekst, .faq-intro');
  for (const el of vis) el.setAttribute('data-vis', '');
  document.documentElement.classList.add('js-vis');
  const io = new IntersectionObserver((rk) => {
    for (const e of rk) {
      if (!e.isIntersecting) continue;
      // Søskende i samme liste kommer lidt efter hinanden
      const i = e.target.parentElement ? [...e.target.parentElement.children].indexOf(e.target) : 0;
      e.target.style.transitionDelay = `${Math.min(i, 4) * 90}ms`;
      e.target.classList.add('er-synlig');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  for (const el of vis) io.observe(el);
}

// Ydelser: fotoet følger musen hen over rækken
for (const liste of document.querySelectorAll('[data-ydelser]')) {
  liste.addEventListener('pointermove', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const r = a.getBoundingClientRect();
    a.style.setProperty('--mx', `${e.clientX - r.left}px`);
    a.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
}

// "Sådan bliver dit gulv til": billederne toner over i hinanden, mens man scroller gennem sektionen
const hist = document.querySelector('[data-hist]');
if (hist && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const billeder = [...hist.querySelectorAll('.hist-billede')];
  const trin = [...hist.querySelectorAll('.hist-trin li')];
  const maerker = [...hist.querySelectorAll('.hist-maerke')];
  const prog = [...hist.querySelectorAll('.hist-prog i')];
  const n = billeder.length - 1;
  // Hent alle billeder, når sektionen nærmer sig, så skiftene ikke hakker
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { billeder.forEach((b) => { b.loading = 'eager'; }); o.disconnect(); } }, { rootMargin: '600px 0px' }).observe(hist);
  let sidst = -1;
  const tegn = () => {
    const r = hist.getBoundingClientRect();
    const laengde = r.height - innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / laengde));
    const f = p * n * 1.08; // lidt luft til sidst, så det færdige gulv står et øjeblik
    billeder.forEach((b, i) => { if (i) b.style.opacity = String(Math.min(1, Math.max(0, (f - (i - .35)) / .22))); });
    prog.forEach((el, k) => el.style.setProperty('--f', String(Math.min(1, Math.max(0, f - k)))));
    const aktiv = Math.min(n, Math.floor(f + .45));
    if (aktiv !== sidst) {
      sidst = aktiv;
      trin.forEach((t, i) => t.classList.toggle('er-aktiv', i === aktiv));
      maerker.forEach((m) => m.classList.toggle('er-aktiv', Number(m.dataset.t) === aktiv));
    }
  };
  let ventende = false;
  addEventListener('scroll', () => { if (!ventende) { ventende = true; requestAnimationFrame(() => { ventende = false; tegn(); }); } }, { passive: true });
  addEventListener('resize', tegn);
  tegn();
}

// Forløbet: striben trækkes ud, mens sektionen passerer midten af skærmen
const fl = document.querySelector('[data-forloeb]');
if (fl) {
  const stribe = fl.querySelector('.fl-stribe');
  const prikker = [...fl.querySelectorAll('.fl-prik')];
  const pos = [.125, .375, .625, .875];
  const opdater = () => {
    const r = stribe.getBoundingClientRect();
    const p = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (innerHeight * .55)));
    stribe.style.setProperty('--p', p.toFixed(3));
    prikker.forEach((el, i) => el.classList.toggle('er-naaet', p >= pos[i] - .02));
  };
  addEventListener('scroll', () => requestAnimationFrame(opdater), { passive: true });
  opdater();
}
