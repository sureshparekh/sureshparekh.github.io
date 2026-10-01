const PAD = { l: 66, r: 12, t: 14, b: 30 };
const FONT = '10.5px "JetBrains Mono", ui-monospace, monospace';

export class SpectrumPlot {
  constructor(host, { onView } = {}) {
    this.host = host;
    this.cv = document.createElement("canvas");
    host.appendChild(this.cv);
    this.ctx = this.cv.getContext("2d");
    this.series = [];
    this.marks = [];
    this.x0 = 1200; this.x1 = 9800;
    this.full = [1200, 9800];
    this.logy = false;
    this.hover = null;
    this.drag = null;
    this.onView = onView;
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this._bind();
    this.resize();
  }

  destroy() { this.ro.disconnect(); this.cv.remove(); }

  resize() {
    const r = this.host.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = Math.max(10, r.width); this.h = Math.max(10, r.height);
    this.cv.width = Math.round(this.w * dpr); this.cv.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  }

  setData(series, marks = []) {
    this.series = series;
    this.marks = marks;
    this.draw();
  }

  setView(x0, x1, notify = true) {
    const [a, b] = this.full;
    x0 = Math.max(a, x0); x1 = Math.min(b, x1);
    if (x1 - x0 < 20) return;
    this.x0 = x0; this.x1 = x1;
    this.draw();
    if (notify && this.onView) this.onView(x0, x1);
  }

  reset() { this.setView(this.full[0], this.full[1]); }

  px(l) { return PAD.l + (l - this.x0) / (this.x1 - this.x0) * (this.w - PAD.l - PAD.r); }
  lx(x) { return this.x0 + (x - PAD.l) / (this.w - PAD.l - PAD.r) * (this.x1 - this.x0); }
  py(v) {
    const [y0, y1] = this.yr;
    const f = this.logy ? (Math.log10(Math.max(v, this.floor)) - y0) / (y1 - y0) : (v - y0) / (y1 - y0);
    return this.h - PAD.b - f * (this.h - PAD.t - PAD.b);
  }

  _yRange() {
    let lo = Infinity, hi = -Infinity;
    for (const s of this.series) {
      if (s.visible === false || s.noScale) continue;
      const { lam, data } = s;
      for (let i = 0; i < lam.length; i++) {
        const l = lam[i];
        if (l < this.x0) continue;
        if (l > this.x1) break;
        const v = data[i];
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
    }
    if (!Number.isFinite(hi) || hi <= 0) { this.floor = 1e-30; return this.logy ? [-1, 1] : [0, 1]; }
    if (this.logy) {
      this.floor = hi * 1e-4;
      return [Math.log10(Math.max(lo, this.floor)) - 0.05, Math.log10(hi) + 0.12];
    }
    const span = hi - Math.min(0, lo);
    return [Math.min(0, lo) - span * 0.02, hi + span * 0.08];
  }

  draw() {
    const c = this.ctx, W = this.w, H = this.h;
    c.clearRect(0, 0, W, H);
    this.yr = this._yRange();
    c.font = FONT; c.textBaseline = "middle";
    c.strokeStyle = "rgba(255,255,255,0.06)"; c.fillStyle = "#6c7486"; c.lineWidth = 1;
    for (const t of niceTicks(this.x0, this.x1, Math.max(3, Math.floor((W - 80) / 90)))) {
      const x = Math.round(this.px(t)) + 0.5;
      c.beginPath(); c.moveTo(x, PAD.t); c.lineTo(x, H - PAD.b); c.stroke();
      c.textAlign = "center"; c.fillText(t >= 1000 ? t.toFixed(0) : t, x, H - PAD.b + 14);
    }
    const [y0, y1] = this.yr;
    for (const t of niceTicks(y0, y1, 4)) {
      const y = Math.round(this.logy ? this.h - PAD.b - (t - y0) / (y1 - y0) * (H - PAD.t - PAD.b) : this.py(t)) + 0.5;
      c.beginPath(); c.moveTo(PAD.l, y); c.lineTo(W - PAD.r, y); c.stroke();
      c.textAlign = "right"; c.fillText(this.logy ? `${t.toFixed(1)}` : fmtSci(t), PAD.l - 6, y);
    }
    c.textAlign = "left"; c.fillStyle = "#4f5768";
    c.fillText("λ rest [Å]", W - PAD.r - 64, H - 8);
    c.save();
    c.translate(11, PAD.t + (H - PAD.t - PAD.b) / 2); c.rotate(-Math.PI / 2); c.textAlign = "center";
    c.fillText(this.logy ? "log L_λ" : "L_λ [erg s⁻¹ Å⁻¹]", 0, 0);
    c.restore();

    c.save();
    c.beginPath(); c.rect(PAD.l, PAD.t, W - PAD.l - PAD.r, H - PAD.t - PAD.b); c.clip();
    let lastX = -1e9;
    for (const m of this.marks) {
      if (m.lam < this.x0 || m.lam > this.x1) continue;
      const x = Math.round(this.px(m.lam)) + 0.5;
      c.strokeStyle = m.color || "rgba(255,255,255,0.10)";
      c.setLineDash([2, 3]);
      c.beginPath(); c.moveTo(x, PAD.t + 14); c.lineTo(x, H - PAD.b); c.stroke();
      c.setLineDash([]);
      if (x - lastX > 34) {
        c.fillStyle = "#7d8597"; c.textAlign = "center"; c.font = '9.5px "JetBrains Mono", monospace';
        c.fillText(m.label, x, PAD.t + 6);
        lastX = x;
      }
    }

    const nx = Math.ceil(W - PAD.l - PAD.r);
    if (nx < 2 || H < PAD.t + PAD.b + 2) { c.restore(); return; }
    for (const s of this.series) {
      if (s.visible === false) continue;
      const env = this._decimate(s, nx);
      if (s.band) {
        c.fillStyle = s.band;
        c.beginPath();
        for (let k = 0; k < nx; k++) if (env.has[k]) c.lineTo(PAD.l + k, this.py(env.max[k]));
        for (let k = nx - 1; k >= 0; k--) if (env.has[k]) c.lineTo(PAD.l + k, this.py(env.min[k]));
        c.closePath(); c.fill();
        continue;
      }
      if (s.fill) {
        c.fillStyle = s.fill;
        c.beginPath();
        let started = false;
        const base = this.logy ? this.py(this.floor) : this.py(0);
        for (let k = 0; k < nx; k++) {
          if (!env.has[k]) continue;
          if (!started) { c.moveTo(PAD.l + k, base); started = true; }
          c.lineTo(PAD.l + k, this.py(env.mean[k]));
        }
        c.lineTo(W - PAD.r, base); c.closePath(); c.fill();
      }
      c.strokeStyle = s.color; c.lineWidth = s.width || 1.2; c.lineJoin = "round";
      if (s.dash) c.setLineDash(s.dash);
      c.beginPath();
      let pen = false;
      for (let k = 0; k < nx; k++) {
        if (!env.has[k]) { pen = false; continue; }
        const x = PAD.l + k + 0.5;
        if (env.max[k] - env.min[k] > 0 && (this.py(env.min[k]) - this.py(env.max[k])) > 1.5) {
          if (!pen) c.moveTo(x, this.py(env.first[k]));
          c.lineTo(x, this.py(env.max[k])); c.lineTo(x, this.py(env.min[k])); c.lineTo(x, this.py(env.last[k]));
        } else {
          const y = this.py(env.mean[k]);
          if (pen) c.lineTo(x, y); else c.moveTo(x, y);
        }
        pen = true;
      }
      c.stroke();
      c.setLineDash([]);
    }
    c.restore();

    if (this.drag && Math.abs(this.drag.x1 - this.drag.x0) > 3) {
      const a = Math.min(this.drag.x0, this.drag.x1), b = Math.max(this.drag.x0, this.drag.x1);
      c.fillStyle = "rgba(244,162,89,0.10)"; c.strokeStyle = "rgba(244,162,89,0.5)";
      c.fillRect(a, PAD.t, b - a, H - PAD.t - PAD.b);
      c.strokeRect(a + 0.5, PAD.t + 0.5, b - a, H - PAD.t - PAD.b);
    }
    if (this.hover && !this.drag) {
      const x = this.hover.x;
      if (x >= PAD.l && x <= W - PAD.r) {
        const l = this.lx(x);
        c.strokeStyle = "rgba(255,255,255,0.25)";
        c.beginPath(); c.moveTo(Math.round(x) + 0.5, PAD.t); c.lineTo(Math.round(x) + 0.5, H - PAD.b); c.stroke();
        const rows = [[`λ ${l.toFixed(1)} Å`, "#e9ebf1"]];
        for (const s of this.series) {
          if (s.visible === false || s.band || !s.label) continue;
          const v = sample(s, l);
          if (Number.isFinite(v)) rows.push([`${s.label} ${fmtSci(v)}`, s.color]);
        }
        c.font = FONT;
        const bw = Math.max(...rows.map(r => c.measureText(r[0]).width)) + 16, bh = rows.length * 15 + 8;
        let bx = x + 12; if (bx + bw > W - 4) bx = x - bw - 12;
        const by = PAD.t + 6;
        c.fillStyle = "rgba(10,12,18,0.92)"; c.strokeStyle = "#262c39";
        roundRect(c, bx, by, bw, bh, 6); c.fill(); c.stroke();
        rows.forEach(([t, col], i) => { c.fillStyle = col; c.textAlign = "left"; c.fillText(t, bx + 8, by + 11 + i * 15); });
      }
    }
  }

  _decimate(s, nx) {
    const min = new Float64Array(nx).fill(Infinity), max = new Float64Array(nx).fill(-Infinity);
    const sum = new Float64Array(nx), cnt = new Uint16Array(nx), first = new Float64Array(nx), last = new Float64Array(nx);
    const { lam, data } = s;
    const scale = nx / (this.x1 - this.x0);
    for (let i = 0; i < lam.length; i++) {
      const l = lam[i];
      if (l < this.x0) continue;
      if (l > this.x1) break;
      const k = Math.min(nx - 1, Math.floor((l - this.x0) * scale)), v = data[i];
      if (!cnt[k]) first[k] = v;
      last[k] = v;
      if (v < min[k]) min[k] = v;
      if (v > max[k]) max[k] = v;
      sum[k] += v; cnt[k]++;
    }
    const mean = new Float64Array(nx), has = new Uint8Array(nx);
    for (let k = 0; k < nx; k++) {
      if (cnt[k]) { mean[k] = sum[k] / cnt[k]; has[k] = 1; }
      else {
        const v = sample(s, this.x0 + (k + 0.5) / scale);
        if (Number.isFinite(v)) { mean[k] = min[k] = max[k] = first[k] = last[k] = v; has[k] = 1; }
      }
    }
    return { min, max, mean, has, first, last };
  }

  _bind() {
    const cv = this.cv;
    const pos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    cv.addEventListener("pointerdown", e => {
      const p = pos(e);
      if (p.x < PAD.l) return;
      cv.setPointerCapture(e.pointerId);
      this.drag = { x0: p.x, x1: p.x };
    });
    cv.addEventListener("pointermove", e => {
      const p = pos(e);
      this.hover = p;
      if (this.drag) this.drag.x1 = p.x;
      this.draw();
    });
    cv.addEventListener("pointerup", () => {
      const d = this.drag;
      this.drag = null;
      if (d && Math.abs(d.x1 - d.x0) > 6) {
        const a = this.lx(Math.min(d.x0, d.x1)), b = this.lx(Math.max(d.x0, d.x1));
        this.setView(a, b);
      } else this.draw();
    });
    cv.addEventListener("pointerleave", () => { this.hover = null; if (!this.drag) this.draw(); });
    cv.addEventListener("dblclick", () => this.reset());
    cv.addEventListener("wheel", e => {
      e.preventDefault();
      const l = this.lx(pos(e).x), f = Math.exp(Math.sign(e.deltaY) * 0.15);
      this.setView(l - (l - this.x0) * f, l + (this.x1 - l) * f);
    }, { passive: false });
  }
}

function sample(s, l) {
  const { lam, data } = s;
  if (l < lam[0] || l > lam[lam.length - 1]) return NaN;
  const f = Math.log(l / lam[0]) / Math.log(lam[1] / lam[0]);
  const i = Math.floor(f), w = f - i;
  return i + 1 < lam.length ? data[i] * (1 - w) + data[i + 1] * w : data[i];
}

export function niceTicks(a, b, n) {
  const span = b - a;
  if (!(span > 0)) return [];
  const step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => span / s <= n) || 10 * mag;
  const out = [];
  for (let t = Math.ceil(a / step) * step; t <= b + 1e-9; t += step) out.push(Math.abs(t) < step * 1e-6 ? 0 : t);
  return out;
}

export function fmtSci(v) {
  if (!Number.isFinite(v)) return "—";
  if (v === 0) return "0";
  const e = Math.floor(Math.log10(Math.abs(v)));
  if (e >= -2 && e <= 3) return v.toFixed(Math.max(0, 2 - e));
  const m = v / Math.pow(10, e);
  return `${m.toFixed(2)}e${e}`;
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
