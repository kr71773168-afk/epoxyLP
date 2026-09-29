import cfg from './pricing.config.js';
import { TRIN, beregnPris, estimerLbm, tilvalgPris, tommeSvar } from './engine.js';
import { startSnit } from './section-view.js';
import { forvarmPostnumre, slaaOpPostnummer } from './postnumre.js';
import { Boelgelinje, reduceretBevaegelse } from '../effects/wave.js';
import { startHaeld } from '../effects/pour.js';
import { tegnProeve, tegnRumBillede, tegnStandBillede, tegnTilvalgBillede } from '../effects/materials.js';
import { track } from '../tracking.js';

const fmt = (n) => Math.round(n).toLocaleString('da-DK');
const spaend = ([a, b]) => (Math.round(a) === Math.round(b) ? `${fmt(a)} kr` : `${fmt(a)}–${fmt(b)} kr`);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Et valg som flise med billede af materialet, tydelig markering og et flueben, når det er valgt. */
function flise({ type = 'radio', navn, vaerdi, titel, desk = '', meta = '', tegn, klasse = '' }) {
  const id = `${navn}-${vaerdi}`;
  return `<label class="flise ${klasse}" for="${id}" data-vaerdi="${esc(vaerdi)}">
    <input type="${type}" name="${navn}" id="${id}" value="${esc(vaerdi)}">
    <canvas class="flise-billede" data-tegn="${tegn}" width="480" height="300" aria-hidden="true"></canvas>
    <span class="flise-tekst"><span class="flise-anb"></span><span class="flise-navn">${esc(titel)}</span>${desk ? `<span class="flise-desk">${esc(desk)}</span>` : ''}${meta}</span>
    <span class="flise-tjek" aria-hidden="true"></span>
  </label>`;
}

/** Tegner billedet på en flise ud fra data-tegn="gruppe:type". */
export function tegnFliseBillede(canvas, hex) {
  const [gruppe, type] = canvas.dataset.tegn.split(':');
  if (gruppe === 'rum') tegnRumBillede(canvas, type);
  else if (gruppe === 'stand') tegnStandBillede(canvas, type);
  else if (gruppe === 'tilvalg') tegnTilvalgBillede(canvas, type, hex);
  else if (gruppe === 'overflade') tegnProeve(canvas, type, hex);
}

/**
 * Prisberegneren: seks trin, ét ad gangen. Besvarede trin folder sammen til én linje.
 * Prisen vises fra trin 3 og bliver smallere for hvert svar.
 */
export function startBeregner() {
  const app = document.getElementById('beregner-app');
  const form = document.getElementById('beregner-form');
  const prisbord = document.getElementById('prisbord');
  const lead = document.getElementById('lead');
  const $ = (s, rod = app) => rod.querySelector(s);
  const $$ = (s, rod = app) => Array.from(rod.querySelectorAll(s));
  const reduce = reduceretBevaegelse();
  const smal = window.matchMedia('(max-width: 900px)');

  const svar = tommeSvar();
  const ekstra = { farve: cfg.standardFarve, by: null, iZone: null };
  const besvaret = new Set();
  const lyttere = new Set();
  let aktivt = 'rum';
  let startet = false;
  let faerdigTracket = false;
  let autoTimer = null;
  let senesteResultat = null;

  /* ---------- valgmuligheder fra config ---------- */
  $('[data-valg="rum"]').innerHTML = Object.entries(cfg.rum)
    .map(([k, r]) => flise({ navn: 'rum', vaerdi: k, titel: r.navn, desk: r.beskrivelse, tegn: `rum:${k}` })).join('');
  $('[data-valg="overflade"]').innerHTML = Object.entries(cfg.overflader)
    .map(([k, o]) => flise({
      navn: 'overflade', vaerdi: k, titel: o.navn, desk: o.beskrivelse, tegn: `overflade:${k}`, klasse: 'ov',
      meta: `<span class="flise-meta" data-pris-m2="${k}"></span>`,
    })).join('');
  $('[data-valg="stand"]').innerHTML = [
    ...Object.entries(cfg.stand).map(([k, st]) => flise({ navn: 'stand', vaerdi: k, titel: st.navn, desk: st.beskrivelse, tegn: `stand:${k}` })),
    flise({ navn: 'stand', vaerdi: 'vedikke', titel: 'Ved ikke', desk: 'Vi kigger på det ved besigtigelsen', tegn: 'stand:vedikke' }),
  ].join('');
  $('[data-valg="tilvalg"]').innerHTML = Object.entries(cfg.tilvalg)
    .map(([k, t]) => flise({
      type: 'checkbox', navn: 'tilvalg', vaerdi: k, titel: t.navn, desk: t.beskrivelse, tegn: `tilvalg:${k}`,
      meta: `<span class="flise-meta" data-tilvalg-pris="${k}"></span>`,
    })).join('');
  $('[data-valg="farve"]').innerHTML = cfg.farver
    .map((f) => `<label class="opt" for="farve-${f.kode}"><input type="radio" name="farve" id="farve-${f.kode}" value="${f.kode}"${f.kode === ekstra.farve ? ' checked' : ''}><span class="chip" style="--c:${f.hex}" aria-hidden="true"></span><span class="opt-navn">${esc(f.navn)} <span class="mono">${f.kode}</span></span></label>`)
    .join('');
  $('#pb-tid').textContent = [cfg.tid.arbejdsdage, cfg.tid.gaaPaa, cfg.tid.koerPaa].join(' · ');

  const haeld = startHaeld(app);
  haeld.marker($$('input[name="farve"]'), false);
  const snit = startSnit({ svg: $('#snit'), holder: prisbord, liste: $('#lag-liste'), cfg });
  const linje = new Boelgelinje([
    { el: $('.pb-linje path'), w: 600, h: 28, k: 0.021 },
    { el: document.querySelector('.bb-linje path'), w: 200, h: 16, k: 0.06, skala: 0.5 },
  ]);

  const farveHex = () => cfg.farver.find((f) => f.kode === ekstra.farve)?.hex ?? '#9BA1A4';
  // Fliserne med rum og stand tegnes én gang. Overflader og tilvalg følger den valgte farve.
  $$('canvas[data-tegn^="rum:"], canvas[data-tegn^="stand:"]').forEach((c) => tegnFliseBillede(c));
  function tegnProever() {
    const hex = farveHex();
    $$('canvas[data-tegn^="overflade:"], canvas[data-tegn^="tilvalg:"]').forEach((c) => tegnFliseBillede(c, hex));
    const strimmel = $('#pb-proeve');
    const farve = cfg.farver.find((f) => f.kode === ekstra.farve);
    if (svar.overflade) {
      tegnProeve(strimmel, svar.overflade, hex);
      $('#pb-proeve-tekst').textContent = `${cfg.overflader[svar.overflade].navn} · ${farve.navn} ${farve.kode}`;
    } else {
      tegnStandBillede(strimmel, 'paen');
      $('#pb-proeve-tekst').textContent = 'Dit gulv · vælg overflade';
    }
  }

  /* ---------- trin ---------- */
  function resume(t) {
    switch (t) {
      case 'rum': return cfg.rum[svar.rum]?.navn ?? '';
      case 'areal': return `${svar.areal} m²`;
      case 'overflade': return cfg.overflader[svar.overflade]?.navn ?? '';
      case 'stand': return svar.stand === 'vedikke' ? 'Ved ikke' : (cfg.stand[svar.stand]?.navn ?? '');
      case 'tilvalg': return svar.tilvalg?.length ? svar.tilvalg.map((k) => cfg.tilvalg[k].navn).join(', ') : 'Ingen';
      case 'postnummer': return [svar.postnummer, ekstra.by].filter(Boolean).join(' ');
      default: return '';
    }
  }

  function renderTrin() {
    const nr = aktivt ? TRIN.indexOf(aktivt) + 1 : TRIN.length;
    document.getElementById('fremdrift-tekst').textContent = aktivt ? `Trin ${nr} af ${TRIN.length}` : 'Alle trin besvaret';
    document.getElementById('fremdrift-fyld').style.width = `${(besvaret.size / TRIN.length) * 100}%`;
    for (const li of $$('.trin', form)) {
      const t = li.dataset.trin;
      const erAktiv = t === aktivt;
      const erBesvaret = besvaret.has(t);
      li.classList.toggle('aktiv', erAktiv);
      li.classList.toggle('besvaret', erBesvaret && !erAktiv);
      li.classList.toggle('kommende', !erAktiv && !erBesvaret);
      li.querySelector('.trin-krop').hidden = !erAktiv;
      li.querySelector('.trin-ret').hidden = !(erBesvaret && !erAktiv);
      li.querySelector('.trin-svar').textContent = erBesvaret ? resume(t) : '';
    }
  }

  const hint = (t, tekst) => { $(`.trin[data-trin="${t}"] .trin-hint`, form).textContent = tekst; };

  function fokusTrin(t) {
    const li = $(`.trin[data-trin="${t}"]`, form);
    const fraTouch = haeld.fraTouch();
    requestAnimationFrame(() => {
      const { top, bottom } = li.getBoundingClientRect();
      const bar = document.getElementById('bundbar');
      const synligBund = window.innerHeight - (bar.hidden ? 0 : bar.offsetHeight) - 12;
      // Rul, så hele trinnet inkl. knappen kan ses. Er trinnet højere end skærmen, vises toppen.
      if (top < 0 || bottom > synligBund) {
        const flyt = Math.min(top - 16, bottom - synligBund);
        window.scrollTo({ top: window.scrollY + (top < 0 ? top - 16 : flyt), behavior: reduce ? 'auto' : 'smooth' });
      }
      // Fokus følger med til næste trin. På telefonen åbner vi ikke tastaturet af os selv.
      if (!fraTouch) {
        const felt = li.querySelector('input:checked') || li.querySelector('.trin-krop input');
        felt?.focus({ preventScroll: true });
      }
    });
  }

  function besvar(t, { fokus = true, bruger = true } = {}) {
    clearTimeout(autoTimer);
    const foerste = !besvaret.has(t);
    besvaret.add(t);
    if (bruger && !startet) {
      startet = true;
      track('CalculatorStart', { rum: svar.rum ?? '' });
    }
    if (bruger && foerste) track('CalculatorStep', { trin: TRIN.indexOf(t) + 1, navn: t });
    aktivt = TRIN.find((x) => !besvaret.has(x)) ?? null;
    if (aktivt === 'areal' && svar.areal === null) visAreal(cfg.rum[svar.rum]?.standardAreal ?? 36);
    if (aktivt === 'tilvalg' || aktivt === 'postnummer') forvarmPostnumre();
    renderTrin();
    opdater();
    if (aktivt) {
      if (fokus) fokusTrin(aktivt);
    } else {
      faerdig();
    }
  }

  function naeste() {
    const t = aktivt;
    if (!t) return;
    clearTimeout(autoTimer);
    if (t === 'areal') {
      const v = parseInt(arealTal.value, 10);
      if (!(v >= cfg.minM2)) return hint('areal', `Skriv et tal fra ${cfg.minM2} m² og op.`);
      svar.areal = v;
    }
    if (t === 'tilvalg') svar.tilvalg = valgteTilvalg();
    if (t === 'postnummer' && !svar.postnummer) return hint('postnummer', 'Skriv et postnummer med 4 cifre.');
    if (['rum', 'overflade', 'stand'].includes(t) && !svar[t]) return hint(t, 'Vælg en af mulighederne.');
    hint(t, '');
    besvar(t);
  }

  function autoVidere(t) {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(() => { if (aktivt === t) besvar(t); }, reduce ? 0 : 380);
  }

  /* ---------- areal ---------- */
  const arealTal = $('#areal-tal');
  const arealLineal = $('#areal-lineal');
  // Feltet følger tallets bredde, så "m²" står lige efter tallet
  const tilpasTal = () => { arealTal.style.width = `${Math.max(2, arealTal.value.length) + 0.3}ch`; };
  function visAreal(v) {
    arealTal.value = String(v);
    arealLineal.value = String(Math.min(250, Math.max(10, v)));
    tilpasTal();
  }
  function saetAreal(v, { fraTal = false } = {}) {
    if (Number.isFinite(v) && !fraTal) arealTal.value = String(Math.round(v));
    tilpasTal();
    if (!Number.isFinite(v)) return;
    const m2 = Math.round(v);
    arealLineal.value = String(Math.min(250, Math.max(10, m2)));
    if (m2 >= cfg.minM2) {
      svar.areal = m2;
      hint('areal', '');
      opdater({ glans: false });
    }
  }
  arealLineal.addEventListener('input', () => saetAreal(Number(arealLineal.value)));
  arealLineal.addEventListener('change', () => opdater());
  arealTal.addEventListener('input', () => saetAreal(parseInt(arealTal.value, 10), { fraTal: true }));
  tilpasTal();
  $$('.genveje [data-m2]').forEach((b) => b.addEventListener('click', () => {
    saetAreal(Number(b.dataset.m2));
    besvar('areal');
  }));
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
  const opdaterTilvalgKnap = () => {
    $('#tilvalg-naeste').textContent = svar.tilvalg?.length ? 'Næste' : 'Ingen tilvalg';
  };

  /* ---------- postnummer ---------- */
  const postInput = $('#postnummer');
  const postInfo = $('#postnummer-info');
  let opslag = 0;
  const nulstilPost = () => {
    svar.postnummer = null;
    ekstra.by = null;
    ekstra.iZone = null;
  };
  postInput.addEventListener('input', async () => {
    const v = postInput.value.replace(/\D/g, '').slice(0, 4);
    if (v !== postInput.value) postInput.value = v;
    hint('postnummer', '');
    const nr = ++opslag;
    if (v.length < 4) {
      postInfo.textContent = '';
      if (svar.postnummer) {
        nulstilPost();
        opdater({ glans: false });
      }
      return;
    }
    const info = await slaaOpPostnummer(v, cfg.zone);
    if (nr !== opslag) return;
    if (!info) {
      postInfo.textContent = 'Det postnummer kender vi ikke. Tjek det lige.';
      nulstilPost();
    } else {
      postInfo.innerHTML = `${v} ${esc(info.by)} <span class="zone">${info.iZone ? 'Inden for vores område' : 'Kørsel aftales'}</span>`;
      svar.postnummer = v;
      ekstra.by = info.by;
      ekstra.iZone = info.iZone;
    }
    opdater({ glans: false });
  });

  /* ---------- hændelser ---------- */
  form.addEventListener('change', (e) => {
    const t = e.target;
    if (['rum', 'overflade', 'stand'].includes(t.name)) {
      svar[t.name] = t.value;
      haeld.marker($$(`input[name="${t.name}"]`, form));
      if (t.name === 'rum' && svar.areal === null) visAreal(cfg.rum[t.value].standardAreal);
      if (t.name === 'overflade') tegnProever();
      hint(t.name, '');
      opdater();
      if (haeld.fraPointer()) autoVidere(t.name);
    } else if (t.name === 'tilvalg') {
      svar.tilvalg = valgteTilvalg();
      haeld.marker($$('input[name="tilvalg"]', form));
      opdaterTilvalgKnap();
      opdater();
    }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    naeste();
  });
  $$('.trin-ret', form).forEach((b) => b.addEventListener('click', () => {
    aktivt = b.dataset.ret;
    renderTrin();
    fokusTrin(aktivt);
  }));
  prisbord.addEventListener('change', (e) => {
    if (e.target.name !== 'farve') return;
    ekstra.farve = e.target.value;
    haeld.marker($$('input[name="farve"]', prisbord));
    tegnProever();
    opdater({ glans: false });
  });

  /* ---------- prisbord ---------- */
  function statusTekst(r) {
    if (r.minimumspris) return `Små gulve har en minimumspris på ${fmt(r.lav)} kr.`;
    if (svar.stand === 'vedikke') return '“Ved ikke” holder intervallet åbent. Det afklarer vi ved besigtigelsen.';
    if (r.aabne > 1) return `${r.aabne} spørgsmål mangler. Intervallet dækker det billigste og det dyreste svar.`;
    if (r.aabne === 1) return '1 spørgsmål mangler.';
    return 'Alle svar givet. Tilbage er kun ±5 % til adgang og rummets form.';
  }

  function opdater({ glans = true, straks = false } = {}) {
    const r = beregnPris(svar, cfg);
    senesteResultat = r;
    const momsFaktor = r.inklMoms ? 1 + cfg.moms : 1;

    let prisTekst = '–';
    let status = 'Prisen vises, når vi kender størrelse og overflade.';
    let spred = '';
    let prm2 = '';
    let amp = 11;
    if (r.individuel) {
      prisTekst = 'Efter besigtigelse';
      status = `Gulve over ${cfg.maksM2} m² prissætter vi, når vi har set dem. Send dine oplysninger, så ringer vi.`;
      amp = 5;
    } else if (r.klar) {
      prisTekst = r.lav === r.hoej ? `${fmt(r.lav)} kr` : `${fmt(r.lav)}–${fmt(r.hoej)} kr`;
      spred = r.minimumspris ? 'minimumspris' : `±${Math.round(r.spred * 100)} %`;
      prm2 = `ca. ${fmt(Math.round(r.prM2 / 5) * 5)} kr/m²`;
      status = statusTekst(r);
      amp = r.iVater || r.minimumspris ? 0 : Math.min(11, Math.max(2.5, (r.spred - 0.05) * 55 + r.aabne * 0.8));
    }

    $('#pb-moms').textContent = r.inklMoms ? 'inkl. moms' : 'ekskl. moms';
    const pris = $('#pb-pris');
    pris.classList.toggle('tom', !r.klar);
    if (pris.textContent !== prisTekst) {
      pris.textContent = prisTekst;
      if (glans && !reduce && r.klar) {
        pris.classList.remove('glans');
        void pris.offsetWidth;
        pris.classList.add('glans');
      }
    }
    $('#pb-spred').textContent = spred;
    $('#pb-prm2').textContent = prm2;
    $('#pb-vater').hidden = !(r.klar && r.iVater);
    $('#pb-status').textContent = status;
    linje.saet(amp, straks);

    if (r.klar) {
      $('#g-system-d').textContent = `${cfg.overflader[svar.overflade].navn} · ${svar.areal} m² · inkl. opstart`;
      $('#g-system-v').textContent = spaend(r.grupper.system);
      $('#g-forb-d').textContent = svar.stand === 'vedikke' ? 'Ved ikke endnu' : (cfg.stand[svar.stand]?.navn ?? 'Ikke besvaret');
      $('#g-forb-v').textContent = spaend(r.grupper.forbehandling);
      $('#g-tilv-d').textContent = svar.tilvalg === null ? 'Ikke besvaret' : resume('tilvalg');
      $('#g-tilv-v').textContent = spaend(r.grupper.tilvalg);
    } else {
      for (const id of ['#g-system-d', '#g-forb-d', '#g-tilv-d']) $(id).textContent = '–';
      for (const id of ['#g-system-v', '#g-forb-v', '#g-tilv-v']) $(id).textContent = '';
    }

    for (const el of $$('[data-pris-m2]')) {
      el.textContent = `fra ${fmt(cfg.overflader[el.dataset.prisM2].prisPrM2 * momsFaktor)} kr/m²`;
    }
    const anbefalet = cfg.rum[svar.rum]?.anbefalet;
    for (const el of $$('.flise.ov')) {
      const erAnb = anbefalet === el.dataset.vaerdi;
      el.classList.toggle('anbefalet', erAnb);
      if (erAnb) el.querySelector('.flise-anb').textContent = `Anbefalet til ${cfg.rum[svar.rum].navn.toLowerCase()}`;
    }
    const areal = svar.areal ?? (Number(arealTal.value) || 36);
    const lbm = estimerLbm(areal, svar.rum, cfg);
    for (const el of $$('[data-tilvalg-pris]')) {
      el.textContent = `+ ca. ${fmt(tilvalgPris(cfg.tilvalg[el.dataset.tilvalgPris], areal, lbm) * momsFaktor)} kr til dit gulv`;
    }

    snit.opdater({ ...svar, farve: ekstra.farve }, r);
    bbPris.textContent = prisTekst;
    bbSpred.textContent = spred;
    opdaterBundbar();
    lyttere.forEach((fn) => fn('aendring'));
  }

  /* ---------- bund-bar på mobil ---------- */
  const bb = document.getElementById('bundbar');
  const bbPris = document.getElementById('bb-pris');
  const bbSpred = document.getElementById('bb-spred');
  let formSynlig = false;
  let prisSynlig = false;
  let leadSynlig = false;
  function opdaterBundbar() {
    const harPris = senesteResultat?.klar || senesteResultat?.individuel;
    bb.hidden = !(smal.matches && formSynlig && !prisSynlig && !leadSynlig && harPris);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { formSynlig = e.isIntersecting; opdaterBundbar(); }, { rootMargin: '0px 0px -30% 0px' }).observe(form);
    new IntersectionObserver(([e]) => { prisSynlig = e.isIntersecting; opdaterBundbar(); }, { threshold: 0.2 }).observe($('#pb-pris'));
    new IntersectionObserver(([e]) => { leadSynlig = e.isIntersecting; opdaterBundbar(); }, { threshold: 0.05 }).observe(lead);
    new IntersectionObserver(([e]) => linje.saetSynlig(e.isIntersecting)).observe(document.getElementById('beregner'));
  }
  smal.addEventListener?.('change', opdaterBundbar);
  document.getElementById('bb-knap').addEventListener('click', () => {
    prisbord.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  });

  /* ---------- færdig og lead ---------- */
  // På desktop skal prisen kunne ses ved siden af formularen. Prisbordet hænger fast i toppen,
  // men kun så længe området under det er mindst lige så højt som prisbordet selv.
  function tilpasLeadHoejde() {
    lead.style.minHeight = !lead.hidden && !smal.matches ? `${prisbord.offsetHeight + 40}px` : '';
  }
  if ('ResizeObserver' in window) new ResizeObserver(tilpasLeadHoejde).observe(prisbord);
  smal.addEventListener?.('change', tilpasLeadHoejde);

  function aabnLead({ scroll = true, tilForm = false } = {}) {
    lead.hidden = false;
    tilpasLeadHoejde();
    lyttere.forEach((fn) => fn('lead-aaben'));
    if (!scroll) return;
    const visResultat = smal.matches && !tilForm;
    requestAnimationFrame(() => {
      (visResultat ? prisbord : lead).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      const fokus = tilForm ? document.getElementById('lf-navn') : document.getElementById(visResultat ? 'prisbord-titel' : 'lead-titel');
      fokus.focus({ preventScroll: true });
    });
  }

  function faerdig() {
    app.classList.add('er-faerdig');
    if (faerdigTracket) {
      aabnLead({ scroll: false });
      return;
    }
    faerdigTracket = true;
    const r = beregnPris(svar, cfg);
    track('CalculatorComplete', { value: r.klar ? r.midt : 0, currency: 'DKK', overflade: svar.overflade, areal: svar.areal });
    aabnLead({ scroll: true });
  }

  $('#pb-cta').addEventListener('click', () => aabnLead({ scroll: true, tilForm: true }));

  /* ---------- start ---------- */
  renderTrin();
  tegnProever();
  opdater({ glans: false, straks: true });

  return {
    haeld,
    /** Vælg rum udefra (hero-knapperne og ?gulv=). */
    vaelgRum(rum, { scroll = true, bruger = true } = {}) {
      const input = form.querySelector(`input[name="rum"][value="${rum}"]`);
      if (!input) return;
      input.checked = true;
      svar.rum = rum;
      haeld.marker($$('input[name="rum"]', form), false);
      if (svar.areal === null) visAreal(cfg.rum[rum].standardAreal);
      besvar('rum', { fokus: false, bruger });
      if (scroll) {
        const liste = $('.trin-liste', form);
        window.scrollTo({ top: window.scrollY + liste.getBoundingClientRect().top - 24, behavior: reduce ? 'auto' : 'smooth' });
      }
    },
    data() {
      const r = beregnPris(svar, cfg);
      return {
        svar: { ...svar, farve: ekstra.farve, by: ekstra.by, iZone: ekstra.iZone },
        tekst: Object.fromEntries(TRIN.map((t) => [t, besvaret.has(t) ? resume(t) : null])),
        pris: r.klar
          ? { lav: r.lav, hoej: r.hoej, midt: r.midt, inklMoms: r.inklMoms }
          : { individuel: Boolean(r.individuel), inklMoms: r.inklMoms },
        faerdig: TRIN.every((t) => besvaret.has(t)),
      };
    },
    lyt(fn) {
      lyttere.add(fn);
      return () => lyttere.delete(fn);
    },
  };
}
