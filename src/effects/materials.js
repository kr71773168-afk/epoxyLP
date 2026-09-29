/**
 * Genererede overflader: prøver, billeder på valgfliserne og pladsholdere,
 * indtil der kommer rigtige billeder og video. Seedet tilfældighed, så de
 * ser ens ud hver gang.
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
const SIGNALGUL = '#EDB500';

export function tegnFlakes(ctx, W, H, seed, antal, sMin, sMax, perspektiv = false, palet = FLAKE_BLANDING) {
  const r = rng(seed);
  for (let i = 0; i < antal; i++) {
    const x = r() * W;
    const y = r() * H;
    const k = perspektiv ? 0.4 + 0.6 * (y / H) : 1;
    const s = (sMin + r() * (sMax - sMin)) * k;
    ctx.fillStyle = palet[(r() * palet.length) | 0];
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

/** Lange, bløde refleksioner af loftslys i et blankt gulv. */
function tegnLysrefleks(ctx, W, H, pos, styrke = 0.5) {
  pos.forEach(([fx, fy, bredde], i) => {
    ctx.save();
    ctx.translate(W * fx, H * fy);
    ctx.scale(bredde ?? 0.14, 1);
    const rad = H * (0.34 + 0.05 * i);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
    g.addColorStop(0, `rgba(255,255,255,${styrke})`);
    g.addColorStop(0.35, `rgba(255,255,255,${styrke * 0.38})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
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

/** Prøve af en overflade i en given farve. Skalerer med canvas-størrelsen. */
export function tegnProeve(canvas, type, base) {
  const ctx = canvas.getContext('2d');
  const { width: W, height: H } = canvas;
  const k = W / 160;
  ctx.clearRect(0, 0, W, H);
  if (type === 'metallic') tegnMetallic(ctx, W, H, base, 11);
  else {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, nuance(base, 0.08));
    g.addColorStop(1, nuance(base, -0.08));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  if (type === 'flakes') tegnFlakes(ctx, W, H, 7, (W * H) / (26 * k * k), 1.6 * k, 4 * k);
  tegnLysrefleks(ctx, W, H, [[0.3, 0.2, 0.2], [0.72, 0.3, 0.16]], 0.28);
  tegnGlans(ctx, W, H, 0.34);
}

/* ---------- beton ---------- */

function tegnBetonflade(ctx, W, H, seed, { lys = false, k = 1 } = {}) {
  const r = rng(seed);
  ctx.fillStyle = lys ? '#B7BAB4' : '#8F928D';
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) {
    const x = r() * W, y = r() * H, rad = (40 + r() * 160) * k;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, r() > 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  const n = (W * H) / (22 * k * k);
  for (let i = 0; i < n; i++) {
    const s = (0.6 + r() * 1.4) * k;
    ctx.fillStyle = r() > 0.5 ? `rgba(255,255,255,${0.05 + r() * 0.12})` : `rgba(0,0,0,${0.05 + r() * 0.13})`;
    ctx.fillRect(r() * W, r() * H, s, s);
  }
}

function revne(ctx, r, W, H, d) {
  let x = r() * W, y = H * (0.2 + r() * 0.7), a = r() * Math.PI * 2;
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
  ctx.strokeStyle = 'rgba(28,28,26,.75)';
  ctx.lineWidth = 1.5 * d;
  ctx.beginPath();
  pkt.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.stroke();
}

function klat(r, cx, cy, rad, punkter = 14) {
  const pkt = [];
  for (let j = 0; j < punkter; j++) {
    const a = (j / punkter) * Math.PI * 2;
    const rr = rad * (0.65 + r() * 0.6);
    pkt.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.75]);
  }
  return pkt;
}
const sti = (ctx, pkt) => {
  ctx.beginPath();
  pkt.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
};

/** Gammel gulvmaling, der skaller af. */
function tegnMalingRester(ctx, W, H, seed, k) {
  const r = rng(seed);
  const lag = document.createElement('canvas');
  lag.width = W;
  lag.height = H;
  const o = lag.getContext('2d');
  o.fillStyle = '#6E8577';
  o.fillRect(0, 0, W, H);
  for (let i = 0; i < (W * H) / (40 * k * k); i++) {
    o.fillStyle = r() > 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.08)';
    o.fillRect(r() * W, r() * H, 1.5 * k, 1.5 * k);
  }
  const huller = [];
  for (let i = 0; i < 7; i++) huller.push(klat(r, r() * W, r() * H, (30 + r() * 70) * k));
  o.globalCompositeOperation = 'destination-out';
  huller.forEach((h) => { sti(o, h); o.fill(); });
  ctx.drawImage(lag, 0, 0);
  ctx.strokeStyle = 'rgba(235,238,230,.5)';
  ctx.lineWidth = 1.5 * k;
  huller.forEach((h) => { sti(ctx, h); ctx.stroke(); });
}

/* ---------- billeder på valgfliserne ---------- */

function gulvMedFlakes(ctx, W, H, base, seed, k, taethed = 1) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, nuance(base, 0.14));
  g.addColorStop(1, nuance(base, -0.14));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  tegnFlakes(ctx, W, H, seed, ((W * H) / (34 * k * k)) * taethed, 1.8 * k, 4.6 * k, true);
}

export function tegnRumBillede(canvas, type) {
  const ctx = canvas.getContext('2d');
  const { width: W, height: H } = canvas;
  const k = W / 480;
  ctx.clearRect(0, 0, W, H);
  if (type === 'garage') {
    gulvMedFlakes(ctx, W, H, '#8C9397', 21, k);
    ctx.fillStyle = SIGNALGUL;
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.moveTo(W * 0.58, 0);
    ctx.lineTo(W * 0.615, 0);
    ctx.lineTo(W * 0.84, H);
    ctx.lineTo(W * 0.75, H);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    tegnLysrefleks(ctx, W, H, [[0.28, 0.3, 0.12], [0.45, 0.25, 0.1]], 0.45);
  } else if (type === 'kaelder') {
    const hor = H * 0.36;
    const vg = ctx.createLinearGradient(0, 0, 0, hor);
    vg.addColorStop(0, '#DADCD7');
    vg.addColorStop(1, '#C9CCC6');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, hor);
    const gg = ctx.createLinearGradient(0, hor, 0, H);
    gg.addColorStop(0, '#C1C5C1');
    gg.addColorStop(1, '#9EA3A0');
    ctx.fillStyle = gg;
    ctx.fillRect(0, hor, W, H - hor);
    const kg = ctx.createLinearGradient(0, hor - 16 * k, 0, hor + 16 * k);
    kg.addColorStop(0, 'rgba(193,197,193,0)');
    kg.addColorStop(0.5, '#B7BBB7');
    kg.addColorStop(1, 'rgba(193,197,193,0)');
    ctx.fillStyle = kg;
    ctx.fillRect(0, hor - 16 * k, W, 32 * k);
    ctx.strokeStyle = 'rgba(255,255,255,.7)';
    ctx.lineWidth = 1.5 * k;
    ctx.beginPath();
    ctx.moveTo(0, hor + 4 * k);
    ctx.lineTo(W, hor + 4 * k);
    ctx.stroke();
    tegnLysrefleks(ctx, W, H, [[0.35, 0.62, 0.16], [0.7, 0.66, 0.12]], 0.35);
  } else if (type === 'bolig') {
    tegnMetallic(ctx, W, H, '#B9A68E', 5);
    tegnLysrefleks(ctx, W, H, [[0.3, 0.35, 0.18], [0.68, 0.3, 0.14]], 0.3);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#6B7276');
    g.addColorStop(1, '#4E5458');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const r = rng(33);
    for (let i = 0; i < (W * H) / (30 * k * k); i++) {
      ctx.fillStyle = r() > 0.5 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.08)';
      ctx.fillRect(r() * W, r() * H, 1.4 * k, 1.4 * k);
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, H * 0.62, W, 34 * k);
    ctx.clip();
    ctx.fillStyle = SIGNALGUL;
    ctx.fillRect(0, H * 0.62, W, 34 * k);
    ctx.fillStyle = '#16181A';
    for (let x = -60 * k; x < W + 60 * k; x += 44 * k) {
      ctx.beginPath();
      ctx.moveTo(x, H * 0.62 + 34 * k);
      ctx.lineTo(x + 22 * k, H * 0.62 + 34 * k);
      ctx.lineTo(x + 56 * k, H * 0.62);
      ctx.lineTo(x + 34 * k, H * 0.62);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(241,242,238,.85)';
    ctx.fillRect(W * 0.2, 0, 8 * k, H * 0.62);
    tegnLysrefleks(ctx, W, H, [[0.55, 0.3, 0.12], [0.8, 0.28, 0.1]], 0.3);
  }
  tegnGlans(ctx, W, H, 0.26);
}

export function tegnStandBillede(canvas, type) {
  const ctx = canvas.getContext('2d');
  const { width: W, height: H } = canvas;
  const k = W / 480;
  ctx.clearRect(0, 0, W, H);
  if (type === 'paen') {
    tegnBetonflade(ctx, W, H, 4, { lys: true, k });
  } else if (type === 'revner') {
    tegnBetonflade(ctx, W, H, 6, { k });
    const r = rng(12);
    for (let i = 0; i < 4; i++) revne(ctx, r, W, H, k);
  } else if (type === 'maling') {
    tegnBetonflade(ctx, W, H, 8, { k });
    tegnMalingRester(ctx, W, H, 17, k);
  } else {
    tegnBetonflade(ctx, W, H, 4, { lys: true, k });
    ctx.save();
    ctx.beginPath();
    ctx.rect(W / 2, 0, W / 2, H);
    ctx.clip();
    tegnBetonflade(ctx, W, H, 6, { k });
    const r = rng(12);
    for (let i = 0; i < 3; i++) revne(ctx, r, W, H, k);
    ctx.restore();
    ctx.setLineDash([8 * k, 6 * k]);
    ctx.strokeStyle = 'rgba(22,24,26,.7)';
    ctx.lineWidth = 2 * k;
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

export function tegnTilvalgBillede(canvas, type, base) {
  const ctx = canvas.getContext('2d');
  const { width: W, height: H } = canvas;
  const k = W / 480;
  ctx.clearRect(0, 0, W, H);
  if (type === 'hulkehl') {
    ctx.fillStyle = '#E4E5E1';
    ctx.fillRect(0, 0, W, H);
    const vaegX = W * 0.72, gulvY = H * 0.62, tyk = 14 * k, rad = 60 * k;
    ctx.fillStyle = '#CFD1CC';
    ctx.fillRect(vaegX, 0, W - vaegX, gulvY);
    tegnBetonflade(ctx, W, H - gulvY, 3, { k });
    const beton = ctx.getImageData(0, 0, W, H - gulvY);
    ctx.fillStyle = '#E4E5E1';
    ctx.fillRect(0, 0, vaegX, gulvY);
    ctx.fillStyle = '#CFD1CC';
    ctx.fillRect(vaegX, 0, W - vaegX, gulvY);
    ctx.putImageData(beton, 0, gulvY);
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.moveTo(0, gulvY - tyk);
    ctx.lineTo(vaegX - tyk - rad, gulvY - tyk);
    ctx.arc(vaegX - tyk - rad, gulvY - tyk - rad, rad, Math.PI / 2, 0, true);
    ctx.lineTo(vaegX - tyk, H * 0.12);
    ctx.lineTo(vaegX, H * 0.12);
    ctx.lineTo(vaegX, gulvY);
    ctx.lineTo(0, gulvY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.9)';
    ctx.lineWidth = 2 * k;
    ctx.beginPath();
    ctx.moveTo(0, gulvY - tyk + 1);
    ctx.lineTo(vaegX - tyk - rad, gulvY - tyk + 1);
    ctx.arc(vaegX - tyk - rad, gulvY - tyk - rad, rad - 1, Math.PI / 2, 0, true);
    ctx.lineTo(vaegX - tyk + 1, H * 0.12);
    ctx.stroke();
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, nuance(base, 0.1));
    g.addColorStop(1, nuance(base, -0.12));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const r = rng(9);
    for (let i = 0; i < (W * H) / (60 * k * k); i++) {
      const x = r() * W, y = r() * H, s = (1 + r() * 1.6) * k;
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      ctx.beginPath();
      ctx.arc(x + s * 0.4, y + s * 0.5, s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = r() > 0.5 ? '#E6DCC4' : '#CFC3A6';
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.fill();
    }
    tegnLysrefleks(ctx, W, H, [[0.35, 0.3, 0.16]], 0.3);
    tegnGlans(ctx, W, H, 0.3);
  }
}

/* ---------- nærbillede og tidslinje ---------- */

export function tegnMotiv(canvas, motiv) {
  const ctx = canvas.getContext('2d');
  const { width: W, height: H } = canvas;
  const k = W / 480;
  ctx.clearRect(0, 0, W, H);
  const faerdigtGulv = (seed) => {
    gulvMedFlakes(ctx, W, H, '#8C9296', seed, k, 1.1);
    tegnLysrefleks(ctx, W, H, [[0.3, 0.3, 0.14], [0.66, 0.28, 0.12]], 0.42);
    tegnGlans(ctx, W, H, 0.25);
  };
  switch (motiv) {
    case 'naerbillede': {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#A2A8AB');
      g.addColorStop(1, '#6E7478');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      tegnFlakes(ctx, W, H, 77, (W * H) / (70 * k * k), 3 * k, 9 * k, true);
      tegnLysrefleks(ctx, W, H, [[0.34, 0.3, 0.1], [0.62, 0.22, 0.08]], 0.55);
      tegnGlans(ctx, W, H, 0.3);
      break;
    }
    case 'tl:besigtigelse': {
      tegnBetonflade(ctx, W, H, 14, { k });
      ctx.save();
      ctx.translate(W * 0.5, H * 0.55);
      ctx.rotate(-0.32);
      const L = W * 0.95, B = 30 * k;
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      ctx.fillRect(-L / 2 + 4 * k, -B / 2 + 6 * k, L, B);
      ctx.fillStyle = '#F2C200';
      ctx.fillRect(-L / 2, -B / 2, L, B);
      ctx.fillStyle = '#16181A';
      for (let x = 0; x <= L; x += 9 * k) {
        const lang = Math.round(x / (9 * k)) % 5 === 0;
        ctx.fillRect(-L / 2 + x, -B / 2, 1.3 * k, lang ? B * 0.45 : B * 0.25);
      }
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      for (let x = L / 5; x < L; x += L / 5) ctx.fillRect(-L / 2 + x, -B / 2, 1.5 * k, B);
      ctx.restore();
      break;
    }
    case 'tl:slibning': {
      tegnBetonflade(ctx, W, H, 24, { lys: true, k });
      ctx.strokeStyle = 'rgba(255,255,255,.22)';
      const r = rng(4);
      for (let i = 0; i < 26; i++) {
        ctx.lineWidth = (1 + r() * 2) * k;
        ctx.beginPath();
        ctx.arc(W * (0.2 + r() * 0.7), H * (0.2 + r() * 0.7), (40 + r() * 90) * k, r() * 6, r() * 6 + 1.8);
        ctx.stroke();
      }
      break;
    }
    case 'tl:grundlag': {
      const g = ctx.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, '#8F9599');
      g.addColorStop(1, '#7C8286');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W * 0.62, H);
      ctx.clip();
      tegnFlakes(ctx, W, H, 31, (W * H) / (30 * k * k), 1.8 * k, 4.6 * k, true);
      ctx.restore();
      tegnFlakes(ctx, W, H, 32, (W * H) / (240 * k * k), 1.8 * k, 4.6 * k, true);
      tegnGlans(ctx, W, H, 0.22);
      break;
    }
    case 'tl:toplak':
      faerdigtGulv(41);
      tegnLysrefleks(ctx, W, H, [[0.48, 0.34, 0.2]], 0.5);
      break;
    case 'tl:gaa': {
      faerdigtGulv(43);
      ctx.fillStyle = 'rgba(20,22,24,.18)';
      [[0.36, 0.72, -0.2], [0.52, 0.5, -0.1], [0.66, 0.3, -0.25]].forEach(([fx, fy, rot]) => {
        ctx.save();
        ctx.translate(W * fx, H * fy);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, 13 * k, 30 * k, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      break;
    }
    default: {
      faerdigtGulv(47);
      ctx.fillStyle = 'rgba(20,22,24,.2)';
      [W * 0.34, W * 0.6].forEach((x) => {
        ctx.fillRect(x, 0, 30 * k, H);
        ctx.fillStyle = 'rgba(20,22,24,.12)';
        for (let y = 0; y < H; y += 12 * k) ctx.fillRect(x + 4 * k, y, 22 * k, 4 * k);
        ctx.fillStyle = 'rgba(20,22,24,.2)';
      });
    }
  }
}

/* ---------- før/efter-pladsholdere ---------- */

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
  tegnLysrefleks(ctx, W, H, [[0.22, 0.34, 0.14], [0.46, 0.3, 0.14], [0.7, 0.38, 0.14]], 0.5);
  tegnGlans(ctx, W, H, 0.2);
}
