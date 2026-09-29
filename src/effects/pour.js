import { reduceretBevaegelse } from './wave.js';

/**
 * Hæld-effekten: når man vælger en mulighed, flyder farven ud fra det sted,
 * man trykkede. Med tastatur flyder den fra venstre.
 */
export function startHaeld(rod, vaelger = '.opt, .hv') {
  const reduce = reduceretBevaegelse();
  let punkt = null;
  let sidstePointer = -Infinity;
  let sidsteType = '';

  const maal = (e) => {
    const el = e.target.closest(vaelger);
    if (!el || !rod.contains(el)) return null;
    const b = el.getBoundingClientRect();
    return { el, x: ((e.clientX - b.left) / b.width) * 100, y: ((e.clientY - b.top) / b.height) * 100 };
  };

  rod.addEventListener('pointerdown', (e) => {
    sidstePointer = performance.now();
    sidsteType = e.pointerType;
    punkt = maal(e);
  }, { passive: true });

  // Hero-valgene viser en lille dråbe under markøren, før man trykker
  rod.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const p = maal(e);
    if (!p || !p.el.classList.contains('hv') || p.el.classList.contains('er-valgt')) return;
    p.el.style.setProperty('--x', p.x.toFixed(1) + '%');
    p.el.style.setProperty('--y', p.y.toFixed(1) + '%');
  }, { passive: true });

  function haeld(el) {
    const p = punkt && punkt.el === el ? punkt : { x: 0, y: 50 };
    el.style.setProperty('--x', p.x.toFixed(1) + '%');
    el.style.setProperty('--y', p.y.toFixed(1) + '%');
    punkt = null;
    // Tving stilen igennem, så cirklen vokser fra det nye punkt i stedet for at glide derhen
    void getComputedStyle(el, '::before').clipPath;
  }

  /** Synkroniserer .er-valgt med inputs. Nye valg hældes ud. */
  function marker(inputs, animer = true) {
    for (const input of inputs) {
      const el = input.closest(vaelger);
      if (!el) continue;
      if (input.checked) {
        if (!el.classList.contains('er-valgt')) {
          if (animer && !reduce) haeld(el);
          el.classList.add('er-valgt');
        }
      } else {
        el.classList.remove('er-valgt');
      }
    }
  }

  /** Blev det seneste valg lavet med mus eller finger (og ikke med piletaster)? */
  const fraPointer = () => performance.now() - sidstePointer < 900;
  /** Var det en finger (eller pen)? Så åbner vi ikke telefonens tastatur af os selv. */
  const fraTouch = () => fraPointer() && sidsteType !== 'mouse';

  return { haeld, marker, fraPointer, fraTouch };
}
