import { planck } from "./continuum.js";

const gauss = (x, s) => Math.exp(-0.5 * (x / s) * (x / s));
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

const BALMER = [6563, 4861, 4340, 4102, 3970, 3889, 3835, 3798];
const METAL = [[3934, 6, 0.55], [3969, 6, 0.45], [4304, 8, 0.25], [5175, 6, 0.2], [5893, 4, 0.2], [8542, 3, 0.3], [8662, 3, 0.25]];
const WIND = [[1400, 6, 0.3], [1549, 7, 0.4]];

function raw(l, p) {
  let f = planck(l, p.th) + p.wRed * planck(l, 4000) * p.redScale;
  if (l < 3720) f *= 1 - p.jump * (1 - smooth(3646, 3720, l)) * Math.min(1, (l / 3646) ** 2);
  if (p.d4000 > 0 && l < 4050) f *= 1 - p.d4000 * (1 - smooth(3900, 4050, l)) * Math.min(1, (l / 3900) ** 1.5);
  for (const lb of BALMER) { const d = l - lb; if (d > -40 && d < 40) f *= 1 - p.balmer * gauss(d, 9); }
  if (p.metal > 0.005) for (const [l0, s, dd] of METAL) { const d = l - l0; if (d > -25 && d < 25) f *= 1 - dd * p.metal * gauss(d, s); }
  if (p.wind > 0.005) for (const [l0, s, dd] of WIND) { const d = l - l0; if (d > -30 && d < 30) f *= 1 - dd * p.wind * gauss(d, s); }
  return f;
}

const cache = new Map();
function params(age, z) {
  const key = Math.round(age * 100) * 4096 + Math.round(z * 1000);
  let p = cache.get(key);
  if (p) return p;
  const th = 5000 + 38000 * Math.exp(-age / 8) + 3500 * Math.exp(-age / 900);
  p = {
    th,
    redScale: planck(5500, th) / planck(5500, 4000),
    jump: 0.1 + 0.4 * (1 - Math.exp(-age / 40)),
    balmer: 0.05 + 0.35 * (1 - Math.exp(-age / 60)),
    metal: 0.3 * Math.sqrt(z) * smooth(8, 100, age),
    wind: Math.pow(z, 0.3) * (1 - smooth(4, 8, age)),
    d4000: 0.45 * Math.sqrt(z) * smooth(300, 4000, age),
    wRed: 0.35 * smooth(5, 20, age) + 0.4 * smooth(500, 5000, age),
  };
  p.norm = 1 / raw(3540, p);
  if (cache.size > 4000) cache.clear();
  cache.set(key, p);
  return p;
}

export function starlight(l, age, z) {
  const p = params(age, z);
  return raw(l, p) * p.norm;
}

export function starlightArray(lam, age, z, out) {
  const p = params(age, z);
  for (let i = 0; i < lam.length; i++) out[i] = raw(lam[i], p) * p.norm;
  return out;
}

export const lightPerMass = age => 3.8e32 * Math.pow(Math.max(age, 1) / 3, -0.9);

export const ewHaSF = age => 1500 * Math.exp(-age / 3.5);
