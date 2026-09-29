import { tegnMotiv } from './materials.js';

/**
 * Styrer videoerne bag hero og afslutning og tegner pladsholder-billederne
 * (nærbillede og tidslinje), når de nærmer sig skærmen.
 */
export function startScener() {
  startVideoer();

  const motiver = Array.from(document.querySelectorAll('canvas[data-tegn="naerbillede"], canvas[data-tegn^="tl:"]'));
  const tegn = (c) => { if (!c.dataset.tegnet) { tegnMotiv(c, c.dataset.tegn); c.dataset.tegnet = '1'; } };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        tegn(e.target);
      }
    }, { rootMargin: '400px 0px' });
    motiver.forEach((c) => io.observe(c));
  } else {
    motiver.forEach(tegn);
  }
}

/** Videoerne spiller kun, mens de er på skærmen. Ved "reducer bevægelse" eller datasparetilstand vises stillbilledet. */
function startVideoer() {
  const videoer = Array.from(document.querySelectorAll('video.scene-medie'));
  const stille = window.matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData === true;
  if (stille) {
    for (const v of videoer) {
      v.removeAttribute('autoplay');
      v.preload = 'none';
      v.pause();
    }
    return;
  }
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) e.target.play().catch(() => {});
      else e.target.pause();
    }
  });
  videoer.forEach((v) => io.observe(v));
}
