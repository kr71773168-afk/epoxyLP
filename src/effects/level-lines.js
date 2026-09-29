import { boelge, reduceretBevaegelse } from './wave.js';

/** Skillelinjerne "sætter sig": en lille bølge, der flader ud, når linjen kommer ind i billedet. */
export function startNiveaulinjer() {
  if (reduceretBevaegelse() || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      const sti = e.target.querySelector('path');
      const t0 = performance.now();
      const varighed = 1600;
      const trin = (t) => {
        const p = Math.min(1, (t - t0) / varighed);
        const amp = 6 * Math.exp(-3.2 * p) * (1 - p);
        sti.setAttribute('d', boelge(1000, 20, amp, p * 8, 0.011));
        if (p < 1) requestAnimationFrame(trin);
        else sti.setAttribute('d', 'M0 10 L1000 10');
      };
      requestAnimationFrame(trin);
    }
  }, { threshold: 1 });
  document.querySelectorAll('.niveau').forEach((el) => io.observe(el));
}
