/**
 * Videoen spiller kun, mens den er på skærmen, og hentes først, når den kommer i syne.
 * Ved "reducer bevægelse" eller datasparetilstand vises kun stillbilledet.
 */
export function startVideo() {
  const videoer = Array.from(document.querySelectorAll('video[data-auto]'));
  const stille = window.matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData === true;
  if (stille || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) e.target.play().catch(() => {});
      else e.target.pause();
    }
  }, { threshold: 0.25 });
  videoer.forEach((v) => io.observe(v));
}
