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

// Gulvtyperne på forsiden: et tryk på en række skifter foto, mærker og tekst. Piletasterne flytter mellem rækkerne.
for (const gv of document.querySelectorAll('[data-gulvvalg]')) {
  const knapper = [...gv.querySelectorAll('[data-gv-knap]')];
  const vaelg = (i, fokus) => {
    knapper.forEach((k, j) => { k.setAttribute('aria-selected', String(j === i)); k.tabIndex = j === i ? 0 : -1; });
    gv.querySelectorAll('[data-gv]').forEach((el, j) => el.classList.toggle('er-aktiv', j === i));
    gv.querySelectorAll('[data-gv-info]').forEach((el, j) => { el.hidden = j !== i; });
    if (fokus) knapper[i].focus();
  };
  knapper.forEach((k, i) => {
    if (i) k.tabIndex = -1;
    k.addEventListener('click', () => vaelg(i));
    k.addEventListener('keydown', (e) => {
      const r = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (r) { e.preventDefault(); vaelg((i + r + knapper.length) % knapper.length, true); }
    });
  });
}

// Beregneren som pop-up: knapperne "Beregn pris" længere nede åbner beregneren midt på skærmen (computer)
// eller i fuld skærm (mobil). Det er den samme beregner, der flyttes ind i pop-up'en, så svarene følger med.
// Luk, Esc, klik udenfor og browserens tilbage-knap lukker den, og man står, hvor man var.
const quizEl = document.getElementById('beregner');
if (quizEl) {
  const plads = document.createElement('div');
  plads.className = 'pop-plads';
  const pop = document.createElement('div');
  pop.className = 'pop';
  pop.hidden = true;
  pop.innerHTML = `<div class="pop-bag" data-pop-luk></div>
    <div class="pop-panel" role="dialog" aria-modal="true" aria-label="Prisberegner">
      <div class="pop-top"><button type="button" class="pop-tilbage" data-pop-luk>← Tilbage</button><span class="pop-navn">Silkeborg Epoxy</span><button type="button" class="pop-luk" data-pop-luk aria-label="Luk beregneren">Luk <span aria-hidden="true">×</span></button></div>
      <div class="pop-krop"></div>
    </div>`;
  document.body.append(pop);
  const krop = pop.querySelector('.pop-krop');
  let aaben = false;
  let fra = null;
  let y = 0;
  const aabn = (udloeser) => {
    if (aaben) return;
    aaben = true;
    fra = udloeser;
    y = scrollY;
    plads.style.height = `${quizEl.offsetHeight}px`;
    quizEl.before(plads);
    krop.append(quizEl);
    pop.hidden = false;
    document.documentElement.classList.add('pop-aaben');
    history.pushState({ ...(history.state || {}), pop: true }, '');
    requestAnimationFrame(() => { pop.classList.add('er-aaben'); (quizEl.querySelector('.spg:not([hidden]) .spg-titel, .kontakt-trin:not([hidden]) .spg-titel') || pop.querySelector('.pop-luk')).focus({ preventScroll: true }); });
  };
  const luk = () => {
    if (!aaben) return;
    aaben = false;
    pop.classList.remove('er-aaben');
    pop.hidden = true;
    plads.replaceWith(quizEl);
    document.documentElement.classList.remove('pop-aaben');
    fra?.focus({ preventScroll: true });
    // Beregneren ruller sig selv i syne, når den skifter trin. Efter lukning skal man stå, hvor man var.
    const tilbage = () => scrollTo({ top: y, behavior: 'instant' });
    tilbage();
    requestAnimationFrame(() => requestAnimationFrame(tilbage));
    setTimeout(tilbage, 120);
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#beregner"], a.top-cta, .mobilmenu a[href$="/pris/"]');
    if (!a || quizEl.contains(a)) return;
    e.preventDefault();
    document.documentElement.classList.remove('menu-aaben');
    aabn(a);
  });
  pop.addEventListener('click', (e) => {
    if (!e.target.closest('[data-pop-luk]')) return;
    if (history.state?.pop) history.back(); else luk();
  });
  addEventListener('keydown', (e) => { if (aaben && e.key === 'Escape') { if (history.state?.pop) history.back(); else luk(); } });
  addEventListener('popstate', (e) => { if (aaben && !e.state?.pop) luk(); });
}
