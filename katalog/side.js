// Videoen i toppen: spiller uden lyd, kun mens toppen er på skærmen. Står stille ved "reducer bevægelse" eller datasparetilstand.
const video = document.querySelector('[data-video]');
const stille = matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData === true;
if (!stille) {
  video.addEventListener('playing', () => video.classList.add('spiller'));
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) { video.pause(); return; }
    if (video.preload === 'none') video.preload = 'auto';
    video.play().catch(() => {}); // blokeret afspilning: stillbilledet bliver stående
  }).observe(video);
}

// Farverne: et tryk (eller piletasterne) skifter overfladen på kortet og i den store visning
const stor = document.getElementById('stor');
const valgt = {};

const visStor = (type) => {
  for (const el of stor.querySelectorAll('[data-stor-type]')) el.hidden = el.dataset.storType !== type;
  for (const b of stor.querySelectorAll('.stor-billede img')) b.hidden = !(b.dataset.type === type && b.dataset.farve === valgt[type]);
};

const vaelg = (knap, fokus) => {
  const { type, farve, navn, kode } = knap.dataset;
  valgt[type] = farve;
  for (const p of document.querySelectorAll(`.proeve[data-type="${type}"]`)) {
    const er = p.dataset.farve === farve;
    p.setAttribute('aria-checked', String(er));
    p.tabIndex = er ? 0 : -1;
  }
  for (const b of document.querySelectorAll(`#${type} .flade img`)) {
    b.hidden = b.dataset.farve !== farve;
    if (!b.hidden) { b.classList.remove('er-ny'); void b.offsetWidth; b.classList.add('er-ny'); }
  }
  for (const el of document.querySelectorAll(`[data-navn-for="${type}"]`)) el.textContent = navn;
  for (const el of document.querySelectorAll(`[data-kode-for="${type}"]`)) el.textContent = kode ? ` · ${kode}` : '';
  if (stor.open) visStor(type);
  if (fokus) knap.focus();
};

for (const gruppe of document.querySelectorAll('.proever')) {
  const knapper = Array.from(gruppe.querySelectorAll('.proeve'));
  knapper.forEach((p, i) => {
    if (p.getAttribute('aria-checked') === 'true') valgt[p.dataset.type] = p.dataset.farve;
    p.addEventListener('click', () => vaelg(p));
    p.addEventListener('keydown', (e) => {
      const ret = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!ret) return;
      e.preventDefault();
      vaelg(knapper[(i + ret + knapper.length) % knapper.length], true);
    });
  });
}

// Den store visning
for (const knap of document.querySelectorAll('[data-forstoer]')) {
  knap.addEventListener('click', () => { visStor(knap.dataset.forstoer); stor.showModal(); });
  // Hent det store billede, så snart man peger på overfladen
  knap.addEventListener('pointerenter', () => {
    const t = knap.dataset.forstoer;
    const b = stor.querySelector(`img[data-type="${t}"][data-farve="${valgt[t]}"]`);
    if (b) b.loading = 'eager';
  });
}
stor.querySelector('[data-luk]').addEventListener('click', () => stor.close());
stor.querySelector('[data-luk-link]').addEventListener('click', () => stor.close());
stor.addEventListener('click', (e) => { if (e.target === stor) stor.close(); });

// Kopiér telefon og mail (et tryk på tel:/mailto: virker ikke alle steder)
for (const k of document.querySelectorAll('[data-kopier]')) {
  k.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(k.dataset.kopier);
      k.textContent = 'Kopieret';
    } catch {
      const r = document.createRange();
      r.selectNodeContents(k.parentElement.querySelector('.kontakt-vaerdi'));
      getSelection().removeAllRanges();
      getSelection().addRange(r);
      k.textContent = 'Markeret';
    }
    setTimeout(() => { k.textContent = 'Kopiér'; }, 2000);
  });
}
