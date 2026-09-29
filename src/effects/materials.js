/**
 * Genererede overflader til prøver og pladsholder-billeder.
 * Seedet tilfældighed, så de ser ens ud hver gang.
 */

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** t < 0 mørkere, t > 0 lysere */
export function nuance(hex, t) {
  const f = (c) => Math.round(t < 0 ? c * (1 + t) : c + (255 - c) * t);
  const [r, g, b] = hexRgb(hex);
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

export const FLAKE_BLANDING = ['#1F2224', '#F1F0EC', '#8B8F92', '#C9C3B5', '#5E656A'];

export function tegnFlakes(ctx, W, H, seed, antal, sMin, sMax, perspektiv = false) {
  const r = rng(seed);
  for (let i = 0; i < antal; i++) {
    const x = r() * W;
    const y = r() * H;
    const k = perspektiv ? 0.45 + 0.55 * (y / H) : 1;
    const s = (sMin + r() * (sMax - sMin)) * k;
    ctx.fillStyle = FLAKE_BLANDING[(r() * FLAKE_BLANDING.length) | 0];
    ctx.beginPath();
    const a0 = r() * Math.PI * 2;
    for (let j = 0; j < 4; j++) {
      const a = a0 + j * (Math.PI / 2) + (r() - 0.5) * 0.9;
      const rr = s * (0.6 + r() * 0.6);
      const px = x + Math.cos(a) * rr;
      const py = y + Math.sin(a) * rr * (perspektiv ? 0.62 : 1);
      if (j) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
}

export function tegnGlans(ctx, W, H, styrke) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, `rgba(255,255,255,${styrke * 0.9})`);
  g.addColorStop(0.35, 'rgba(255,255,255,0)');
  g.addColorStop(0.62, 'rgba(255,255,255,0)');
  g.addColorStop(0.78, `rgba(255,255,255,${styrke * 0.45})`);
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

export function tegnMetallic(ctx, W, H, base, seed) {
  const r = rng(seed);
  ctx.fillStyle = nuance(base, -0.38);
  ctx.fillRect(0, 0, W, H);
  ctx.lineCap = 'round';
  for (let i = 0; i < 28; i++) {
    ctx.strokeStyle = i % 3 === 0 ? nuance(base, 0.6) : i % 3 === 1 ? nuance(base, 0.15) : nuance(base, -0.6);
    ctx.globalAlpha = 0.16 + r() * 0.24;
    ctx.lineWidth = (W / 9) * (0.3 + r() * 0.9);
    ctx.beginPath();
    let x = r() * W;
    let y = r() * H;
    ctx.moveTo(x, y);
    for (let j = 0; j < 3; j++) {
      const c1x = x + (r() - 0.5) * W, c1y = y + (r() - 0.5) * H;
      const c2x = x + (r() - 0.5) * W, c2y = y + (r() - 0.5) * H;
      x = r() * W;
      y = r() * H;
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** Lille prøve af en overflade i en given farve. */
export function tegnProeve(canvas, type, base) {
  const ctx = canvas.getContext('2d');
  const { width: W, height: H } = canvas;
  ctx.clearRect(0, 0, W, H);
  if (type === 'metallic') tegnMetallic(ctx, W, H, base, 11);
  else {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);
  }
  if (type === 'flakes') tegnFlakes(ctx, W, H, 7, (W * H) / 26, 1.6, 4);
  tegnGlans(ctx, W, H, 0.38);
}

function revne(ctx, r, W, H, d) {
  let x = r() * W, y = H * (0.25 + r() * 0.7), a = r() * Math.PI * 2;
  const pkt = [[x, y]];
  const n = (40 + r() * 70) | 0;
  for (let i = 0; i < n; i++) {
    a += (r() - 0.5) * 0.7;
    x += Math.cos(a) * 7 * d;
    y += Math.sin(a) * 4 * d;
    pkt.push([x, y]);
  }
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(255,255,255,.16)';
  ctx.lineWidth = 1 * d;
  ctx.beginPath();
  pkt.forEach(([px, py], i) => (i ? ctx.lineTo(px + d, py + d) : ctx.moveTo(px + d, py + d)));
  ctx.stroke();
  ctx.strokeStyle = 'rgba(28,28,26,.72)';
  ctx.lineWidth = 1.4 * d;
  ctx.beginPath();
  pkt.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.stroke();
}

/** Pladsholder: gammelt betongulv med revner og oliepletter. */
export function tegnGammelBeton(ctx, W, H, d) {
  const r = rng(42);
  ctx.fillStyle = '#8D908B';
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) {
    const x = r() * W, y = r() * H, rad = (60 + r() * 220) * d;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, r() > 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.08)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  const n = (W * H) / (26 * d * d);
  for (let i = 0; i < n; i++) {
    const y = r() * H;
    const s = (0.6 + r() * 1.6) * d * (0.5 + 0.5 * (y / H));
    ctx.fillStyle = r() > 0.5 ? `rgba(255,255,255,${0.05 + r() * 0.12})` : `rgba(0,0,0,${0.05 + r() * 0.14})`;
    ctx.fillRect(r() * W, y, s, s);
  }
  for (let i = 0; i < 3; i++) {
    const x = W * (0.45 + r() * 0.45), y = H * (0.45 + r() * 0.45), rx = (50 + r() * 90) * d;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, 0.45);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, 'rgba(38,34,28,.42)');
    g.addColorStop(0.6, 'rgba(38,34,28,.2)');
    g.addColorStop(1, 'rgba(38,34,28,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  for (let i = 0; i < 4; i++) revne(ctx, r, W, H, d);
  ctx.fillStyle = 'rgba(184,186,180,.55)';
  ctx.beginPath();
  const cx = W * 0.8, cy = H * 0.22;
  for (let j = 0; j < 16; j++) {
    const a = (j / 16) * Math.PI * 2;
    const rr = (40 + r() * 36) * d;
    const px = cx + Math.cos(a) * rr * 1.6, py = cy + Math.sin(a) * rr * 0.55;
    if (j) ctx.lineTo(px, py);
    else ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

/** Pladsholder: nyt flakes-gulv med refleks fra loftslys. */
export function tegnNytGulv(ctx, W, H, d) {
  const base = '#8C9296';
  const g0 = ctx.createLinearGradient(0, 0, 0, H);
  g0.addColorStop(0, nuance(base, 0.14));
  g0.addColorStop(1, nuance(base, -0.14));
  ctx.fillStyle = g0;
  ctx.fillRect(0, 0, W, H);
  tegnFlakes(ctx, W, H, 9, (W * H) / (52 * d * d), 2.2 * d, 5.6 * d, true);
  [[0.22, 0.34], [0.46, 0.3], [0.7, 0.38]].forEach(([fx, fy], i) => {
    ctx.save();
    ctx.translate(W * fx, H * fy);
    ctx.scale(0.14, 1);
    const rad = H * (0.3 + 0.04 * i);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
    g.addColorStop(0, 'rgba(255,255,255,.5)');
    g.addColorStop(0.35, 'rgba(255,255,255,.2)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  tegnGlans(ctx, W, H, 0.2);
}
