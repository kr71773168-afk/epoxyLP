import cfg from './pricing.config.js';
import { TRIN, beregnPris, estimerLbm, tilvalgPris, tommeSvar } from './engine.js';
import { forvarmPostnumre, slaaOpPostnummer } from './postnumre.js';
import { track } from '../tracking.js';

const fmt = (n) => Math.round(n).toLocaleString('da-DK');
const spaend = ([a, b]) => (Math.round(a) === Math.round(b) ? `${fmt(a)} kr` : `${fmt(a)}–${fmt(b)} kr`);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Overskrift pr. annonce-segment (?gulv=garage osv.). Rummet vælges også på forhånd.
const OVERSKRIFTER = {
  garage: 'Hvad koster et nyt garagegulv?',
  kaelder: 'Hvad koster et nyt gulv i kælderen?',
  bolig: 'Hvad koster et fugefrit gulv i hjemmet?',
  erhverv: 'Hvad koster et nyt gulv til værksted eller lager?',
};

const RADIO = ['rum', 'overflade', 'stand'];

/**
 * Prisberegneren som en lille app: ét spørgsmål ad gangen og prisen til sidst.
 * Browserens tilbage-knap går ét spørgsmål tilbage i stedet for at forlade siden.
 */
export function startQuiz() {
  const quiz = document.getElementById('beregner');
  const form = document.getElementById('quiz-form');
  const resultat = document.getElementById('resultat');
  const tilbageKnap = document.getElementById('quiz-tilbage');
  const $ = (s, rod = quiz) => rod.querySelector(s);
  const $$ = (s, rod = quiz) => Array.from(rod.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const svar = tommeSvar();
  const ekstra = { by: null, iZone: null };
  const besvaret = new Set();
  const lyttere = new Set();
  let nr = 0; // aktivt trin. TRIN.length er resultatet
  let hIndex = 0; // hvor mange trin vi selv har lagt i browserens historik
  let startet = false;
  let faerdigTracket = false;
  let autoTimer = null;
  let pointerTid = -Infinity;
  let skiftTid = -Infinity;
  let arealRoert = false;
  let prisTekst = '';

  // Valgene (rækkerne) renderes på serveren i Beregner.astro

  const hint = (t, tekst) => {
    const el = $(`.spg[data-trin="${t}"] .spg-hint`);
    if (el) el.textContent = tekst;
  };
  const momsFaktor = () => (cfg.rum[svar.rum]?.erhverv ? 1 : 1 + cfg.moms);

  /** Priser og anbefaling på valgene følger rummet (erhverv er ekskl. moms) og arealet. */
  function opdaterValgtekster() {
    const moms = momsFaktor();
    const eks = moms === 1 ? ' ekskl. moms' : '';
    for (const el of $$('[data-pris-m2]')) {
      el.textContent = `fra ${fmt(cfg.overflader[el.dataset.prisM2].prisPrM2 * moms)} kr/m²${eks}`;
    }
    const anbefalet = cfg.rum[svar.rum]?.anbefalet;
    for (const el of $$('[data-anb]')) {
      el.hidden = el.dataset.anb !== anbefalet;
      if (!el.hidden) el.textContent = `Anbefalet til ${cfg.rum[svar.rum].navn.toLowerCase()}`;
    }
    const areal = svar.areal ?? (parseInt(arealTal.value, 10) || 36);
    const lbm = estimerLbm(areal, svar.rum, cfg);
    for (const el of $$('[data-tilvalg-pris]')) {
      el.textContent = `+ ca. ${fmt(tilvalgPris(cfg.tilvalg[el.dataset.tilvalgPris], areal, lbm) * moms)} kr${eks}`;
    }
  }

  /* ---------- areal ---------- */
  const arealTal = $('#areal-tal');
  const arealLineal = $('#areal-lineal');
  const genvejeEl = $('#genveje');
  // Feltet følger tallets bredde, så "m²" står lige efter tallet
  const tilpasTal = () => { arealTal.style.width = `${Math.max(2, arealTal.value.length) + 0.3}ch`; };
  const markerGenvej = () => {
    for (const b of $$('.genvej', genvejeEl)) b.classList.toggle('er-valgt', Number(b.dataset.m2) === parseInt(arealTal.value, 10));
  };
  function visAreal(v) {
    arealTal.value = String(v);
    arealLineal.value = String(Math.min(250, Math.max(10, v)));
    tilpasTal();
    markerGenvej();
  }
  function saetAreal(v, { fraTal = false } = {}) {
    if (Number.isFinite(v)) {
      const m2 = Math.max(0, Math.round(v));
      if (!fraTal) arealTal.value = String(m2);
      arealLineal.value = String(Math.min(250, Math.max(10, m2)));
      arealRoert = true;
      hint('areal', '');
    }
    tilpasTal();
    markerGenvej();
  }
  function visGenveje() {
    const genveje = cfg.rum[svar.rum]?.genveje ?? [];
    genvejeEl.innerHTML = genveje
      .map(([m2, tekst]) => `<button type="button" class="genvej" data-m2="${m2}">${esc(tekst)} · ca. ${m2} m²</button>`).join('');
    markerGenvej();
  }
  arealLineal.addEventListener('input', () => saetAreal(Number(arealLineal.value)));
  arealTal.addEventListener('input', () => saetAreal(parseInt(arealTal.value, 10), { fraTal: true }));
  $$('.areal-trin').forEach((b) => b.addEventListener('click', () => {
    saetAreal(Math.max(cfg.minM2, (parseInt(arealTal.value, 10) || 0) + Number(b.dataset.skridt)));
  }));
  genvejeEl.addEventListener('click', (e) => {
    const b = e.target.closest('.genvej');
    if (!b) return;
    saetAreal(Number(b.dataset.m2));
    naeste();
  });
  const maalKnap = $('#maal-knap');
  const maal = $('#maal');
  const maalL = $('#maal-l');
  const maalB = $('#maal-b');
  maalKnap.addEventListener('click', () => {
    const aabn = maal.hidden;
    maal.hidden = !aabn;
    maalKnap.setAttribute('aria-expanded', String(aabn));
    if (aabn) maalL.focus();
  });
  const regnUd = () => {
    const l = maalL.valueAsNumber;
    const b = maalB.valueAsNumber;
    if (l > 0 && b > 0) saetAreal(l * b);
  };
  maalL.addEventListener('input', regnUd);
  maalB.addEventListener('input', regnUd);

  /* ---------- tilvalg ---------- */
  const valgteTilvalg = () => $$('input[name="tilvalg"]:checked', form).map((i) => i.value);
  const tilvalgKnap = $('#tilvalg-naeste');
  const opdaterTilvalgKnap = () => {
    tilvalgKnap.firstChild.textContent = valgteTilvalg().length ? 'Næste ' : 'Videre uden tilvalg ';
  };

  /* ---------- postnummer ---------- */
  const postInput = $('#postnummer');
  const postInfo = $('#postnummer-info');
  let opslag = 0;
  let postOpslag = Promise.resolve();
  const nulstilPost = () => {
    svar.postnummer = null;
    ekstra.by = null;
    ekstra.iZone = null;
  };
  postInput.addEventListener('input', () => {
    const v = postInput.value.replace(/\D/g, '').slice(0, 4);
    if (v !== postInput.value) postInput.value = v;
    hint('postnummer', '');
    const mit = ++opslag;
    if (v.length < 4) {
      postInfo.textContent = '';
      nulstilPost();
      postOpslag = Promise.resolve();
      return;
    }
    postOpslag = slaaOpPostnummer(v, cfg.zone).then((info) => {
      if (mit !== opslag) return;
      if (!info) {
        postInfo.textContent = 'Det postnummer kender vi ikke. Tjek det lige.';
        nulstilPost();
        return;
      }
      postInfo.innerHTML = `${v} ${esc(info.by)} <span class="zone${info.iZone ? ' zone-ok' : ''}">${info.iZone ? 'Inden for vores område' : 'Kørsel aftales'}</span>`;
      svar.postnummer = v;
      ekstra.by = info.by;
      ekstra.iZone = info.iZone;
    });
  });

  /* ---------- svar og navigation ---------- */
  function resume(t) {
    switch (t) {
      case 'rum': return cfg.rum[svar.rum]?.navn ?? '';
      case 'areal': return `${svar.areal} m²`;
      case 'overflade': return cfg.overflader[svar.overflade]?.navn ?? '';
      case 'stand': return svar.stand === 'vedikke' ? 'Stand: ved ikke' : (cfg.stand[svar.stand]?.navn ?? '');
      case 'tilvalg': return svar.tilvalg?.length ? svar.tilvalg.map((k) => cfg.tilvalg[k].navn).join(', ') : 'Ingen tilvalg';
      case 'postnummer': return [svar.postnummer, ekstra.by].filter(Boolean).join(' ');
      default: return '';
    }
  }

  function vaelg(navn, vaerdi) {
    svar[navn] = vaerdi;
    hint(navn, '');
    $(`.spg[data-trin="${navn}"] .spg-fod`).hidden = false;
    if (navn === 'rum') {
      if (svar.areal === null && !arealRoert) visAreal(cfg.rum[vaerdi].standardAreal);
      visGenveje();
      opdaterValgtekster();
    }
  }

  function besvar(t, { bruger = true } = {}) {
    const foerste = !besvaret.has(t);
    besvaret.add(t);
    if (!bruger) return;
    if (!startet) {
      startet = true;
      track('CalculatorStart', { rum: svar.rum ?? '' });
    }
    if (foerste) track('CalculatorStep', { trin: TRIN.indexOf(t) + 1, navn: t });
  }

  const foersteAabne = () => {
    const i = TRIN.findIndex((t) => !besvaret.has(t));
    return i === -1 ? TRIN.length : i;
  };
  // Næste er det første ubesvarede trin efter det aktuelle. Retter man et svar fra resultatet, kommer man direkte tilbage.
  const naesteNr = (fra) => {
    for (let i = fra + 1; i < TRIN.length; i++) if (!besvaret.has(TRIN[i])) return i;
    return TRIN.length;
  };

  async function naeste() {
    const t = TRIN[nr];
    if (!t) return;
    clearTimeout(autoTimer);
    if (t === 'areal') {
      const v = parseInt(arealTal.value, 10);
      if (!(v >= cfg.minM2)) return hint('areal', `Skriv et tal fra ${cfg.minM2} m² og op.`);
      svar.areal = v;
    }
    if (t === 'tilvalg') svar.tilvalg = valgteTilvalg();
    if (t === 'postnummer') {
      await postOpslag;
      if (TRIN[nr] !== t) return;
      if (!svar.postnummer) {
        return hint('postnummer', postInput.value.length < 4 ? 'Skriv et postnummer med 4 cifre.' : 'Tjek postnummeret.');
      }
    }
    if (RADIO.includes(t) && !svar[t]) return hint(t, 'Vælg en af mulighederne.');
    hint(t, '');
    besvar(t);
    vis(naesteNr(nr));
  }

  /** Gør trinnet klar, lige før det vises. */
  function forbered(t) {
    hint(t, '');
    if (RADIO.includes(t)) $(`.spg[data-trin="${t}"] .spg-fod`).hidden = !svar[t];
    if (t === 'areal') {
      if (svar.areal === null && !arealRoert) visAreal(cfg.rum[svar.rum]?.standardAreal ?? 36);
      visGenveje();
    }
    if (t === 'overflade' || t === 'tilvalg') opdaterValgtekster();
    if (t === 'tilvalg') opdaterTilvalgKnap();
    if (t === 'stand' || t === 'tilvalg' || t === 'postnummer') forvarmPostnumre();
  }

  function fokuser(el) {
    requestAnimationFrame(() => {
      // Er beregnerens top rullet ud af skærmen (typisk på mobil), rulles den tilbage i syne
      const top = quiz.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.5) {
        window.scrollTo({ top: window.scrollY + top - 12, behavior: reduce ? 'auto' : 'smooth' });
      }
      el.focus({ preventScroll: true });
    });
  }

  function vis(n, { historik = 'push', fokus = true } = {}) {
    const maal = Math.max(0, Math.min(n, foersteAabne()));
    clearTimeout(autoTimer);
    nr = maal;
    skiftTid = performance.now();
    const erResultat = nr >= TRIN.length;
    for (const el of $$('.spg', form)) el.hidden = el.dataset.trin !== TRIN[nr];
    form.hidden = erResultat;
    resultat.hidden = !erResultat;
    tilbageKnap.hidden = nr === 0;
    $('#quiz-trin').textContent = erResultat ? 'Din pris' : `Trin ${nr + 1} af ${TRIN.length}`;
    $('#quiz-bar-fyld').style.width = `${((nr + 1) / (TRIN.length + 1)) * 100}%`;
    if (erResultat) visResultat();
    else forbered(TRIN[nr]);
    if (historik === 'push') {
      hIndex += 1;
      history.pushState({ quiz: nr, i: hIndex }, '');
    } else if (historik === 'replace') {
      history.replaceState({ quiz: nr, i: hIndex }, '');
    }
    if (fokus) fokuser(erResultat ? $('#res-titel') : $(`.spg[data-trin="${TRIN[nr]}"] .spg-titel`));
    lyttere.forEach((fn) => fn());
  }

  window.addEventListener('popstate', (e) => {
    if (typeof e.state?.quiz !== 'number') return;
    hIndex = e.state.i ?? 0;
    vis(e.state.quiz, { historik: 'ingen' });
  });
  tilbageKnap.addEventListener('click', () => {
    if (hIndex > 0) history.back();
    else vis(nr - 1, { historik: 'replace' });
  });

  /* ---------- hændelser i formularen ---------- */
  form.addEventListener('pointerdown', () => { pointerTid = performance.now(); });
  form.addEventListener('click', (e) => {
    const input = e.target.closest('input[type="radio"]');
    if (!input || !RADIO.includes(input.name)) return;
    // Et hurtigt dobbelttryk må ikke svare på næste spørgsmål også
    if (performance.now() - skiftTid < 350) {
      e.preventDefault();
      return;
    }
    vaelg(input.name, input.value);
    // Med mus eller finger går vi selv videre. Med tastaturet venter vi på Enter eller Næste.
    if (performance.now() - pointerTid < 1000) {
      const t = input.name;
      clearTimeout(autoTimer);
      autoTimer = setTimeout(() => { if (TRIN[nr] === t) naeste(); }, reduce ? 0 : 260);
    }
  });
  form.addEventListener('change', (e) => {
    const t = e.target;
    if (RADIO.includes(t.name)) vaelg(t.name, t.value);
    else if (t.name === 'tilvalg') opdaterTilvalgKnap();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    naeste();
  });

  /* ---------- resultatet ---------- */
  function visResultat() {
    const r = beregnPris(svar, cfg);
    const noter = [];
    if (r.individuel) {
      prisTekst = 'Efter besigtigelse';
      $('#res-meta').textContent = `Gulve over ${cfg.maksM2} m² prissætter vi, når vi har set dem.`;
    } else {
      prisTekst = r.lav === r.hoej ? `${fmt(r.lav)} kr` : `${fmt(r.lav)}–${fmt(r.hoej)} kr`;
      $('#res-meta').textContent = `${r.inklMoms ? 'inkl. moms' : 'ekskl. moms'} · ca. ${fmt(Math.round(r.prM2 / 5) * 5)} kr/m²`;
      if (r.minimumspris) noter.push(`Små gulve har en minimumspris på ${fmt(r.lav)} kr.`);
    }
    if (svar.stand === 'vedikke') noter.push('“Ved ikke” gør intervallet lidt bredere. Det afklarer vi, når vi kommer ud.');
    if (ekstra.iZone === false) noter.push('Du bor uden for vores faste område, så kørslen aftaler vi med dig.');
    $('#res-pris').textContent = prisTekst;
    const note = $('#res-note');
    note.textContent = noter.join(' ');
    note.hidden = !noter.length;

    $('#res-svar').innerHTML = TRIN
      .map((t, i) => `<button type="button" data-ret="${i}" aria-label="${esc(resume(t))}. Ret svaret">${esc(resume(t))}<span aria-hidden="true">Ret</span></button>`)
      .join('');

    const dele = [];
    if (r.klar) {
      dele.push([`${cfg.overflader[svar.overflade].navn}, ${svar.areal} m², inkl. opstart`, r.grupper.system]);
      if (r.grupper.forbehandling[1] > 0) dele.push([svar.stand === 'vedikke' ? 'Forbehandling, afklares' : cfg.stand[svar.stand].navn, r.grupper.forbehandling]);
      if (r.grupper.tilvalg[1] > 0) dele.push([resume('tilvalg'), r.grupper.tilvalg]);
    }
    $('#res-dele').innerHTML = dele.map(([navn, v]) => `<div><dt>${esc(navn)}</dt><dd>ca. ${spaend(v)}</dd></div>`).join('');
    $('#res-tid').textContent = [cfg.tid.arbejdsdage, cfg.tid.gaaPaa, cfg.tid.koerPaa].join(' · ');

    if (!faerdigTracket) {
      faerdigTracket = true;
      track('CalculatorComplete', { value: r.klar ? r.midt : 0, currency: 'DKK', overflade: svar.overflade, areal: svar.areal });
    }
  }
  $('#res-svar').addEventListener('click', (e) => {
    const b = e.target.closest('[data-ret]');
    if (b) vis(Number(b.dataset.ret));
  });

  /* ---------- start ---------- */
  opdaterValgtekster();
  tilpasTal();
  // Svar valgt på forhånd: ?gulv=garage fra annoncer, eller data-rum / data-overflade på siden (fx siden om garagegulve)
  const segment = new URLSearchParams(window.location.search).get('gulv');
  const forvalgtRum = cfg.rum[segment] ? segment : (cfg.rum[quiz.dataset.rum] ? quiz.dataset.rum : null);
  if (forvalgtRum) {
    const titel = document.querySelector('[data-hero-titel]');
    if (titel && segment === forvalgtRum && OVERSKRIFTER[segment]) titel.textContent = OVERSKRIFTER[segment];
    $(`input[name="rum"][value="${forvalgtRum}"]`).checked = true;
    vaelg('rum', forvalgtRum);
    besvar('rum', { bruger: false });
  }
  const forvalgtOverflade = quiz.dataset.overflade;
  if (cfg.overflader[forvalgtOverflade]) {
    $(`input[name="overflade"][value="${forvalgtOverflade}"]`).checked = true;
    vaelg('overflade', forvalgtOverflade);
    besvar('overflade', { bruger: false });
  }
  vis(foersteAabne(), { historik: 'replace', fokus: false });

  return {
    data() {
      const r = beregnPris(svar, cfg);
      return {
        svar: { ...svar, by: ekstra.by, iZone: ekstra.iZone },
        tekst: Object.fromEntries(TRIN.map((t) => [t, besvaret.has(t) ? resume(t) : null])),
        pris: r.klar
          ? { lav: r.lav, hoej: r.hoej, midt: r.midt, inklMoms: r.inklMoms }
          : { individuel: Boolean(r.individuel), inklMoms: r.inklMoms },
        faerdig: TRIN.every((t) => besvaret.has(t)),
      };
    },
    /** Til bundbaren: prisen, når resultatet er vist. */
    status: () => ({ erResultat: nr >= TRIN.length, prisTekst: nr >= TRIN.length ? prisTekst : '' }),
    lyt(fn) {
      lyttere.add(fn);
      return () => lyttere.delete(fn);
    },
  };
}
