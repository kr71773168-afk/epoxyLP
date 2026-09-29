export const reduceretBevaegelse = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** SVG-sti for en bølge. amp = 0 giver en helt plan linje. */
export function boelge(w, h, amp, fase, k) {
  const n = 64;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * w;
    const y = h / 2 + amp * (0.72 * Math.sin(x * k + fase) + 0.28 * Math.sin(x * k * 2.4 + fase * 1.6));
    d += (i ? ' L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(2);
  }
  return d;
}

/**
 * Linjen under prisen. Bølger, når prisen er usikker, og lægger sig helt plant,
 * når alle svar er givet. Flere stier kan følge samme amplitude (fx bund-baren).
 */
export class Boelgelinje {
  /** @param {{el: SVGPathElement, w: number, h: number, k: number, skala?: number}[]} maal */
  constructor(maal) {
    this.maal = maal;
    this.amp = 0;
    this.maalAmp = 0;
    this.fase = 0;
    this.koerer = false;
    this.synlig = true;
    this.reduce = reduceretBevaegelse();
    this.loop = this.loop.bind(this);
  }

  saet(amp, straks = false) {
    this.maalAmp = amp;
    if (this.reduce || straks) {
      this.amp = amp;
      this.tegn();
    }
    this.start();
  }

  saetSynlig(synlig) {
    this.synlig = synlig;
    this.start();
  }

  start() {
    if (this.reduce || this.koerer) return;
    const skalBevaege = Math.abs(this.maalAmp - this.amp) > 0.03 || (this.synlig && this.maalAmp > 0);
    if (!skalBevaege) return;
    this.koerer = true;
    requestAnimationFrame(this.loop);
  }

  loop() {
    this.amp += (this.maalAmp - this.amp) * 0.07;
    if (this.amp > 0.25) this.fase += 0.018;
    this.tegn();
    const stille = Math.abs(this.maalAmp - this.amp) < 0.03;
    if (stille && (this.maalAmp === 0 || !this.synlig)) {
      if (this.maalAmp === 0) {
        this.amp = 0;
        this.tegn();
      }
      this.koerer = false;
      return;
    }
    requestAnimationFrame(this.loop);
  }

  tegn() {
    for (const m of this.maal) m.el.setAttribute('d', boelge(m.w, m.h, this.amp * (m.skala ?? 1), this.fase, m.k));
  }
}
