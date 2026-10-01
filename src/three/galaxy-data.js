const HALF = (() => {
  const t = new Float32Array(65536);
  for (let h = 0; h < 65536; h++) {
    const s = h & 0x8000 ? -1 : 1, e = (h >> 10) & 0x1f, f = h & 0x3ff;
    t[h] = e === 0 ? s * Math.pow(2, -14) * (f / 1024) : e === 31 ? (f ? NaN : s * Infinity) : s * Math.pow(2, e - 15) * (1 + f / 1024);
  }
  return t;
})();

export function decode(meta, buf) {
  const out = { meta };
  for (const b of meta.blocks) {
    const cols = {};
    b.columns.forEach((c, k) => {
      const u = new Uint16Array(buf, b.offset + k * b.count * 2, b.count);
      const f = new Float32Array(b.count);
      for (let i = 0; i < b.count; i++) f[i] = HALF[u[i]];
      cols[c] = f;
    });
    out[b.name] = { count: b.count, cols };
  }
  return out;
}

export async function loadGalaxy(base, onProgress) {
  const meta = await (await fetch(`${base}.json`)).json();
  const res = await fetch(`${base}.bin`);
  const total = +res.headers.get("content-length") || 0;
  const reader = res.body.getReader();
  const chunks = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value); got += value.length;
    onProgress?.(total ? got / total : 0);
  }
  const buf = new Uint8Array(got);
  let o = 0;
  for (const c of chunks) { buf.set(c, o); o += c.length; }
  return decode(meta, buf.buffer);
}

const MASK = {
  sigstar: ["stars", p => Math.pow(10, p.aM) * Math.pow(Math.max(Math.pow(10, p.aAge - 6), 0.3) / 3, -0.75), 1e5],
  s_ha: ["gas", p => Math.pow(10, p.aHa), 1e38], s_o3: ["gas", p => Math.pow(10, p.aO3), 1e38],
  r_o3hb: ["gas", p => Math.pow(10, p.aHb), 1e38], r_n2ha: ["gas", p => Math.pow(10, p.aHa), 1e38],
  r_s2ha: ["gas", p => Math.pow(10, p.aHa), 1e38], bpt: ["gas", p => Math.pow(10, p.aHa), 1e38],
  source: ["gas", p => Math.pow(10, p.aHa), 1e38], ne: ["gas", p => Math.pow(10, p.aS2), 1e38],
  ew_ha: ["gas", p => Math.pow(10, p.aHa), 1e38],
};
const ALIAS = {
  stars: { aAge: "logAge", aZ: "logZ", aM: "logM" },
  gas: { aHa: "logHa", aHb: "logHb", aO3: "logO3", aN2: "logN2", aS2: "logS2", aO1: "logO1", aM: "logM", aZ: "logZ" },
};

export function fieldRanges(gal, fields) {
  const NB = 220, H = 16.5, cell = (2 * H / NB) ** 2;
  const out = {};
  const pct = (a, q) => a[Math.min(a.length - 1, Math.max(0, Math.floor(q * (a.length - 1))))];
  for (const f of fields) {
    const r = { range: f.range ? f.range.slice() : null, mask: -Infinity };
    if (f.mode === "composite") {
      const C = gal.stars.cols, W = new Float64Array(NB * NB);
      for (let i = 0; i < gal.stars.count; i++) {
        const ix = Math.floor((C.x[i] + H) / (2 * H) * NB), iy = Math.floor((C.y[i] + H) / (2 * H) * NB);
        if (ix >= 0 && iy >= 0 && ix < NB && iy < NB) W[iy * NB + ix] += Math.pow(10, C.logM[i] - 5) * Math.pow(Math.max(Math.pow(10, C.logAge[i] - 6), 0.3) / 3, -0.75);
      }
      const v = Array.from(W).filter(x => x > 0).map(x => x / cell).sort((a, b) => a - b);
      r.exposure = 0.55 / pct(v, 0.97);
    }
    const spec = f.js ? [f.js.cloud, f.js.w, f.unit ?? (f.js.cloud === "stars" ? 1e5 : 1e38)] : MASK[f.key];
    if (spec) {
      const [cloud, wf, unit] = spec, C = gal[cloud].cols, n = gal[cloud].count, al = ALIAS[cloud];
      const W = new Float64Array(NB * NB), V = new Float64Array(NB * NB);
      const p = {};
      for (let i = 0; i < n; i++) {
        const ix = Math.floor((C.x[i] + H) / (2 * H) * NB), iy = Math.floor((C.y[i] + H) / (2 * H) * NB);
        if (ix < 0 || iy < 0 || ix >= NB || iy >= NB) continue;
        for (const k in al) p[k] = C[al[k]][i];
        p.vlos = 0;
        const w = wf(p);
        if (!(w > 0)) continue;
        W[iy * NB + ix] += w;
        if (f.js?.v) V[iy * NB + ix] += w * f.js.v(p);
      }
      const lw = [];
      for (let k = 0; k < W.length; k++) if (W[k] > 0) lw.push(Math.log10(W[k] / cell));
      lw.sort((a, b) => a - b);
      r.mask = pct(lw, 0.12) - Math.log10(unit);
      if (!r.range) {
        if (f.mode === "logsum") r.range = [pct(lw, 0.18), pct(lw, 0.9995) + 0.35];
        else if (f.js?.range) r.range = f.js.range.slice();
        else if (f.js?.v) {
          const thr = Math.pow(10, pct(lw, 0.3)) * cell;
          const v = [];
          for (let k = 0; k < W.length; k++) if (W[k] > thr) v.push(V[k] / W[k]);
          v.sort((a, b) => a - b);
          r.range = [pct(v, 0.02), pct(v, 0.98)];
          if (f.add) r.range = r.range.map(x => x);
        }
      }
    }
    if (!r.range) r.range = [0, 1];
    out[f.key] = r;
  }
  return out;
}
