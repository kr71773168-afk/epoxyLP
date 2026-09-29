import { tegnGammelBeton, tegnNytGulv } from './materials.js';
import { reduceretBevaegelse } from './wave.js';

/**
 * Før/efter, hvor håndtaget er en gummiskraber. Virker med <img> eller med
 * <canvas>-pladsholdere, som tegnes her, indtil der kommer rigtige billeder.
 */
export function startFoerEfter(rod) {
  if (!rod) return;
  const foer = rod.querySelector('.fe-foer');
  const efter = rod.querySelector('.fe-efter');
  const input = rod.querySelector('input[type="range"]');
  let roert = false;

  const saetPos = (v) => {
    const p = Math.max(0, Math.min(100, v));
    rod.style.setProperty('--pos', p + '%');
    input.value = String(Math.round(p));
  };

  const erCanvas = foer instanceof HTMLCanvasElement && efter instanceof HTMLCanvasElement;
  function mal() {
    const W = rod.clientWidth, H = rod.clientHeight;
    if (!W || !H) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    for (const c of [foer, efter]) {
      c.width = Math.round(W * d);
      c.height = Math.round(H * d);
    }
    tegnGammelBeton(foer.getContext('2d'), foer.width, foer.height, d);
    tegnNytGulv(efter.getContext('2d'), efter.width, efter.height, d);
  }
  if (erCanvas) {
    mal();
    let timer;
    let sidsteBredde = rod.clientWidth;
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => {
        if (rod.clientWidth === sidsteBredde) return;
        sidsteBredde = rod.clientWidth;
        clearTimeout(timer);
        timer = setTimeout(mal, 160);
      }).observe(rod);
    }
  }

  let traekker = false;
  const fraX = (x) => {
    const b = rod.getBoundingClientRect();
    saetPos(((x - b.left) / b.width) * 100);
  };
  rod.addEventListener('pointerdown', (e) => {
    roert = true;
    traekker = true;
    try { rod.setPointerCapture(e.pointerId); } catch { /* ældre browsere */ }
    fraX(e.clientX);
  });
  rod.addEventListener('pointermove', (e) => { if (traekker) fraX(e.clientX); });
  const slip = () => { traekker = false; };
  rod.addEventListener('pointerup', slip);
  rod.addEventListener('pointercancel', slip);
  input.addEventListener('input', () => {
    roert = true;
    saetPos(Number(input.value));
  });

  // Første gang den ses, trækker skraberen selv det nye gulv ind
  if (!reduceretBevaegelse() && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || roert) return;
      io.disconnect();
      const t0 = performance.now(), fra = 12, til = 58;
      const trin = (nu) => {
        if (roert) return;
        const p = Math.min(1, (nu - t0) / 1700);
        saetPos(fra + (til - fra) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(trin);
      };
      requestAnimationFrame(trin);
    }, { threshold: 0.6 });
    io.observe(rod);
  }
}
