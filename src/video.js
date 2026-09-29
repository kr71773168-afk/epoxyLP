/**
 * Videoerne spiller kun, mens de er på skærmen, og hentes først, når de kommer i syne.
 * Ved "reducer bevægelse" eller datasparetilstand vises kun stillbilledet.
 * Videoen i toppen toner frem oven på stillbilledet, når den spiller, og kan stoppes med knappen (WCAG 2.2.2).
 */
export function startVideo() {
  const videoer = Array.from(document.querySelectorAll('video[data-auto]'));
  const stille = window.matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData === true;
  if (stille || !('IntersectionObserver' in window)) return;

  for (const v of videoer) v.addEventListener('playing', () => v.classList.add('spiller'), { once: true });

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting && !e.target.dataset.stoppet) e.target.play().catch(() => {});
      else e.target.pause();
    }
  }, { threshold: 0.25 });
  videoer.forEach((v) => io.observe(v));

  for (const knap of document.querySelectorAll('[data-video-knap]')) {
    const video = knap.closest('.hero')?.querySelector('video');
    if (!video) continue;
    knap.hidden = false;
    knap.addEventListener('click', () => {
      const stop = !video.dataset.stoppet;
      if (stop) {
        video.dataset.stoppet = '1';
        video.pause();
      } else {
        delete video.dataset.stoppet;
        video.play().catch(() => {});
      }
      knap.setAttribute('aria-label', stop ? 'Afspil videoen' : 'Stop videoen');
      knap.classList.toggle('er-stoppet', stop);
    });
  }
}
