import { loadGalaxy } from "./galaxy-data.js";
import { LAM, NLAM, C_KMS } from "../physics/constants.js";
import { kSMC, planck } from "../physics/continuum.js";
import { starlightArray, starlight } from "../physics/stars.js";

const KL = Float64Array.from(LAM, kSMC);
const DV = C_KMS * Math.log(LAM[1] / LAM[0]);
const SIG_INST = 60;
let gal = null;
const ready = loadGalaxy(new URL(`${import.meta.env.BASE_URL}data/galaxy`, self.location.origin).href).then(g => { gal = g; });

const AGE_GRID = [6.0, 6.3, 6.5, 6.7, 7.0, 7.3, 7.5, 7.7, 8.0, 8.3, 8.5, 8.7, 9.0, 9.3, 9.5, 9.7, 9.85, 10.0, 10.1];
const Z_GRID = [-1.0, -0.6, -0.3, 0.0, 0.2, 0.4];
const lpm = la => Math.pow(Math.max(Math.pow(10, la - 6), 0.3) / 3, -0.75);
const near = (g, v) => { let k = 0; for (let i = 1; i < g.length; i++) if (Math.abs(g[i] - v) < Math.abs(g[k] - v)) k = i; return k; };
const TPL = new Map();
function template(ai, zi) {
  const key = ai * 16 + zi;
  let t = TPL.get(key);
  if (!t) {
    const age = Math.pow(10, AGE_GRID[ai] - 6), z = Math.pow(10, Z_GRID[zi]);
    t = starlightArray(LAM, age, z, new Float64Array(NLAM));
    const s = 1.1e32 * lpm(AGE_GRID[ai]) / starlight(5000, age, z);
    for (let i = 0; i < NLAM; i++) t[i] *= s;
    TPL.set(key, t);
  }
  return t;
}
const EXT = new Map();
const extArr = av => { const q = Math.round(av * 40) / 40; let e = EXT.get(q); if (!e) { e = Float64Array.from(KL, k => Math.pow(10, -0.4 * q * k)); EXT.set(q, e); } return e; };
const ext1 = (av, l) => Math.pow(10, -0.4 * av * kSMC(l));

const NEB = (() => {
  const s = l => {
    const J = l < 3646 ? 2.1 : l < 8204 ? 1.0 : 0.62;
    const bf = J * Math.exp(-14388 / l) / (l * l);
    const tp = l > 1216 ? 0.5 * (Math.exp(-2.96) / 4861 ** 2) * Math.exp(-(((Math.log10(l) - Math.log10(2000)) / 0.22) ** 2)) : 0;
    return bf + tp;
  };
  const n = s(4861), a = new Float64Array(NLAM);
  for (let i = 0; i < NLAM; i++) a[i] = s(LAM[i]) / n / 900;
  return a;
})();

const sii = ne => 0.4315 * (2107 + ne) / (627.1 + ne);
const LINES = [
  ["mgii", 2798.0, "Mg II", p => p.hb * (p.cls === 1 ? 0.6 : 0.15)],
  ["nev", 3426.0, "[Ne V]", p => (p.cls === 1 ? p.hb * 0.6 : 0)],
  ["oii", 3727.4, "[O II]", p => p.hb * (p.cls === 1 ? 3.0 : p.cls === 2 ? 3.6 : 2.6 * Math.pow(10, -0.3 * p.z))],
  ["neiii", 3868.8, "[Ne III]", p => p.hb * (p.cls === 1 ? 1.0 : 0.25 * Math.pow(10, -0.8 * p.z))],
  ["hd", 4101.7, "Hδ", p => p.hb * 0.26],
  ["hg", 4340.5, "Hγ", p => p.hb * 0.47],
  ["heii", 4685.7, "He II", p => (p.cls === 1 ? p.hb * 0.25 : 0)],
  ["hb", 4861.3, "Hβ", p => p.hb],
  ["oiii4959", 4958.9, "[O III]", p => p.o3 / 2.98],
  ["oiii", 5006.8, "[O III]", p => p.o3],
  ["hei", 5875.6, "He I", p => p.hb * 0.11],
  ["oi", 6300.3, "[O I]", p => p.o1],
  ["oi6363", 6363.8, "[O I]", p => p.o1 / 3.1],
  ["nii6548", 6548.0, "[N II]", p => p.n2 / 3.05],
  ["ha", 6562.8, "Hα", p => p.ha],
  ["nii", 6583.5, "[N II]", p => p.n2],
  ["sii6716", 6716.4, "[S II]", p => p.s2 * sii(p.ne) / (1 + sii(p.ne))],
  ["sii6731", 6730.8, "[S II]", p => p.s2 / (1 + sii(p.ne))],
  ["ariii", 7135.8, "[Ar III]", p => p.hb * (p.cls === 1 ? 0.15 : 0.1)],
  ["siii9069", 9068.6, "[S III]", p => p.hb * (p.cls === 1 ? 0.35 : 0.25)],
  ["siii9531", 9530.6, "[S III]", p => p.hb * (p.cls === 1 ? 0.86 : 0.62)],
];
export const LINE_MARKS = LINES.map(([id, lam, label]) => ({ id, lam, label }));

function addGauss(arr, F, lam0, v, sig) {
  const s = Math.sqrt(sig * sig + SIG_INST * SIG_INST), lc = lam0 * (1 + v / C_KMS);
  const sl = lc * s / C_KMS, norm = F / (sl * 2.5066283);
  const i0 = Math.max(0, Math.floor(Math.log((lc - 5 * sl) / LAM[0]) / Math.log(LAM[1] / LAM[0])));
  for (let i = i0; i < NLAM; i++) {
    const d = LAM[i] - lc;
    if (d > 5 * sl) break;
    arr[i] += norm * Math.exp(-0.5 * (d / sl) ** 2);
  }
}

self.onmessage = async e => {
  await ready;
  const { id, vp, ndc, rx, ry, rKpc, agn } = e.data;
  const M = vp;
  const proj = (x, y, z) => {
    const w = M[3] * x + M[7] * y + M[11] * z + M[15];
    if (w <= 0) return null;
    const px = (M[0] * x + M[4] * y + M[8] * z + M[12]) / w, py = (M[1] * x + M[5] * y + M[9] * z + M[13]) / w;
    const dx = (px - ndc[0]) / rx, dy = (py - ndc[1]) / ry;
    return dx * dx + dy * dy < 1 ? w : null;
  };
  const fwd = e.data.fwd;
  const vl = (C, i) => C.vx[i] * fwd[0] + C.vy[i] * fwd[1] + C.vz[i] * fwd[2];

  const G = gal.gas.cols, gsel = [];
  for (let i = 0; i < gal.gas.count; i++) { const w = proj(G.x[i], G.y[i], G.z[i]); if (w !== null) gsel.push([w, i]); }
  gsel.sort((a, b) => a[0] - b[0]);
  const areaPc2 = Math.PI * (rKpc * 1000) ** 2;
  const colDepth = new Float64Array(gsel.length + 1);
  for (let k = 0; k < gsel.length; k++) {
    const i = gsel[k][1];
    colDepth[k + 1] = colDepth[k] + Math.pow(10, G.logM[i]) * Math.pow(10, G.logZ[i]) / areaPc2;
  }
  const avAt = depth => {
    let lo = 0, hi = gsel.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (gsel[m][0] < depth) lo = m + 1; else hi = m; }
    return Math.min(6, 0.067 * colDepth[lo]);
  };

  const S = gal.stars.cols, groups = new Map();
  const VB = 31, vh = new Float64Array(VB);
  let mTot = 0, lTot = 0, lAge = 0, mAge = 0, lZ = 0, mZ = 0, lAv = 0, sfr10 = 0, sfr100 = 0, lv = 0, lv2 = 0, nS = 0;
  const SFH_EDGES = [7, 8, 9, 9.7, 11], sfhL = new Float64Array(5), sfhM = new Float64Array(5);
  for (let i = 0; i < gal.stars.count; i++) {
    const w = proj(S.x[i], S.y[i], S.z[i]);
    if (w === null) continue;
    nS++;
    const m = Math.pow(10, S.logM[i]), la = S.logAge[i], lz = S.logZ[i];
    const av = avAt(w), L = m * lpm(la) * Math.pow(10, -0.4 * av);
    const key = near(AGE_GRID, la) * 4096 + near(Z_GRID, lz) * 256 + Math.round(av * 40);
    groups.set(key, (groups.get(key) || 0) + m);
    const v = vl(S, i);
    vh[Math.min(VB - 1, Math.max(0, Math.round(v / DV) + 15))] += L;
    mTot += m; lTot += L; lAge += L * la; mAge += m * la; lZ += L * lz; mZ += m * lz; lAv += L * av; lv += L * v; lv2 += L * v * v;
    if (la < 7) sfr10 += m / 1e7;
    if (la < 8) sfr100 += m / 1e8;
    let b = 0; while (la >= SFH_EDGES[b] && b < 4) b++;
    sfhL[b] += L; sfhM[b] += m;
  }
  const stars0 = new Float64Array(NLAM);
  for (const [key, m] of groups) {
    const ai = Math.floor(key / 4096), zi = Math.floor((key % 4096) / 256), av = (key % 256) / 40;
    const t = template(ai, zi), ex = extArr(av);
    for (let i = 0; i < NLAM; i++) stars0[i] += m * t[i] * ex[i];
  }
  const stars = new Float64Array(NLAM);
  const vsum = vh.reduce((a, b) => a + b, 0) || 1;
  for (let k = 0; k < VB; k++) {
    const wk = vh[k] / vsum, sh = k - 15;
    if (!wk) continue;
    for (let i = 0; i < NLAM; i++) { const j = i - sh; if (j >= 0 && j < NLAM) stars[i] += wk * stars0[j]; }
  }

  const narrow = new Float64Array(NLAM), neb = new Float64Array(NLAM);
  const meas = Object.fromEntries(LINES.map(([lid]) => [lid, { obs: 0, int: 0, v: 0, v2: 0 }]));
  const srcHa = [0, 0, 0];
  let nebHbByAv = new Map(), mGas = 0, gasZ = 0, gasZw = 0;
  const p = {};
  for (const [w, i] of gsel) {
    const av = avAt(w) + 0.5 * 0.067 * Math.pow(10, G.logM[i]) * Math.pow(10, G.logZ[i]) / areaPc2 * 0;
    p.ha = Math.pow(10, G.logHa[i]); p.hb = Math.pow(10, G.logHb[i]); p.o3 = Math.pow(10, G.logO3[i]);
    p.n2 = Math.pow(10, G.logN2[i]); p.s2 = Math.pow(10, G.logS2[i]); p.o1 = Math.pow(10, G.logO1[i]);
    p.cls = Math.round(G.cls[i]); p.ne = Math.pow(10, G.logNe[i]); p.z = G.logZ[i];
    const v = vl(G, i), sg = G.sig[i];
    mGas += Math.pow(10, G.logM[i]);
    gasZ += p.ha * p.z; gasZw += p.ha;
    srcHa[p.cls] += p.ha;
    for (const [lid, lam, , fn] of LINES) {
      const Fi = fn(p);
      if (!(Fi > 0)) continue;
      const Fo = Fi * ext1(av, lam), q = meas[lid];
      q.obs += Fo; q.int += Fi; q.v += Fo * v; q.v2 += Fo * (v * v + sg * sg);
      addGauss(narrow, Fo, lam, v, sg);
    }
    const ak = Math.round(av * 40);
    nebHbByAv.set(ak, (nebHbByAv.get(ak) || 0) + p.hb);
  }
  for (const [ak, hb] of nebHbByAv) {
    const ex = extArr(ak / 40);
    for (let i = 0; i < NLAM; i++) neb[i] += hb * NEB[i] * ex[i];
  }

  const agnC = new Float64Array(NLAM), broad = new Float64Array(NLAM);
  const nucleus = proj(0, 0, 0) !== null;
  if (nucleus) {
    const A = gal.meta.agn, type1 = agn.type === 1, f = type1 ? 1 : 0.015;
    const L5 = Math.pow(10, A.logL5100) / 5100, eAv = type1 ? 0.25 : 0.25;
    for (let i = 0; i < NLAM; i++) agnC[i] = f * L5 * Math.pow(LAM[i] / 5100, -1.6) * Math.pow(10, -0.4 * eAv * KL[i]);
    const Lha = Math.pow(10, A.logLHaBroad) * f, sb = A.fwhmBroad / 2.3548;
    for (const [lam, F] of [[6562.8, Lha], [4861.3, Lha / 3.1], [4340.5, Lha / 3.1 * 0.45], [4101.7, Lha / 3.1 * 0.25], [5875.6, Lha / 3.1 * 0.12], [2798, Lha / 3.1 * 1.4]]) {
      addGauss(broad, F * 0.7 * ext1(eAv, lam), lam, 0, sb);
      addGauss(broad, F * 0.3 * ext1(eAv, lam), lam, 150, sb * 2.4);
    }
  }

  const total = new Float64Array(NLAM), obs = new Float64Array(NLAM), err = new Float64Array(NLAM);
  let seed = (id * 2654435761) >>> 0;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const gauss = () => Math.sqrt(-2 * Math.log(Math.max(1e-12, rnd()))) * Math.cos(2 * Math.PI * rnd());
  const cont = new Float64Array(NLAM);
  for (let i = 0; i < NLAM; i++) {
    cont[i] = stars[i] + neb[i] + agnC[i];
    total[i] = cont[i] + narrow[i] + broad[i];
  }
  const at = (a, l) => a[Math.round(Math.log(l / LAM[0]) / Math.log(LAM[1] / LAM[0]))];
  const F0 = 2e38;
  for (let i = 0; i < NLAM; i++) {
    const s = Math.sqrt(Math.max(total[i], 0) * F0 / 1600 + (F0 / 300) ** 2);
    err[i] = s; obs[i] = total[i] + s * gauss();
  }

  const L = {};
  for (const [lid, lam] of LINES) {
    const q = meas[lid];
    const c = at(cont, lam);
    const mu = q.obs > 0 ? q.v / q.obs : NaN;
    L[lid] = { lam, obs: q.obs, int: q.int, ew: c > 0 ? q.obs / c : NaN, v: mu, sig: q.obs > 0 ? Math.sqrt(Math.max(0, q.v2 / q.obs - mu * mu)) : NaN };
  }
  const r = (a, b) => (L[a].obs > 0 && L[b].obs > 0 ? L[a].obs / L[b].obs : NaN);
  const n2 = Math.log10(r("nii", "ha")), o3 = Math.log10(r("oiii", "hb"));
  let bpt = "—";
  if (Number.isFinite(n2) && Number.isFinite(o3)) {
    const ka = n2 < 0.05 ? 0.61 / (n2 - 0.05) + 1.3 : -99, ke = n2 < 0.47 ? 0.61 / (n2 - 0.47) + 1.19 : -99;
    bpt = o3 < ka ? "Star-forming" : o3 < ke ? "Composite" : o3 > 1.05 * n2 + 0.45 ? "Seyfert" : "LINER";
  }
  const siiR = r("sii6716", "sii6731");
  const neFromR = R => { R = Math.min(1.44, Math.max(0.45, R)); return Math.max(1, (2107 * 0.4315 - 627.1 * R) / (R - 0.4315)); };
  const hahb = r("ha", "hb");
  const kHa = kSMC(6562.8), kHb = kSMC(4861.3);
  const stats = {
    n: { stars: nS, gas: gsel.length }, rKpc,
    stars: nS ? {
      mass: mTot, lAge: lAge / lTot, mAge: mAge / mTot, lZ: lZ / lTot, mZ: mZ / mTot, av: lAv / lTot,
      sfr10, sfr100, v: lv / lTot, sig: Math.sqrt(Math.max(0, lv2 / lTot - (lv / lTot) ** 2)),
      sfhL: Array.from(sfhL, x => x / lTot), sfhM: Array.from(sfhM, x => x / mTot),
    } : null,
    gas: gsel.length ? {
      mass: mGas, lines: L, hahb, avGas: Number.isFinite(hahb) ? Math.max(0, 2.5 / (kHb - kHa) * Math.log10(hahb / 2.86)) : NaN,
      n2, o3, bpt, ne: Number.isFinite(siiR) ? neFromR(siiR) : NaN, oh: 8.69 + gasZ / Math.max(gasZw, 1e-30),
      ohN2: Number.isFinite(n2) && n2 > -2.5 && n2 < -0.3 ? 8.90 + 0.57 * n2 : NaN,
      src: srcHa.map(x => x / Math.max(1e-30, srcHa[0] + srcHa[1] + srcHa[2])),
    } : null,
    neb: {
      f3600: at(neb, 3600) / Math.max(at(cont, 3600), 1e-30), f5000: at(neb, 5000) / Math.max(at(cont, 5000), 1e-30),
      jump: at(neb, 3600) / Math.max(at(neb, 3700), 1e-30), ewHb: L.hb ? L.hb.ew : NaN,
    },
    agn: { inAperture: nucleus, ...agn, f5100: at(agnC, 5100) / Math.max(at(cont, 5100), 1e-30) },
    snr5500: at(total, 5500) / at(err, 5500),
  };
  const out = { stars, neb, agn: agnC, narrow, broad, total, obs, err };
  self.postMessage({ id, spec: out, stats }, Object.values(out).map(a => a.buffer));
};
