import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { FIELD } from "./fields.js";
import { CMAPS } from "../ui/colormaps.js";

const FOV = 30;
const ease = p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

const VERT = (snippet, cloud) => `
uniform vec3 uFwd;
uniform float uProj, uSize;
in vec3 vel;
in vec4 a0;
in vec4 a1;
in vec4 a2;
out vec4 vAcc;
float lpm(float a) { return pow(max(pow(10.0, a - 6.0), 0.3) / 3.0, -0.75); }
vec3 ageColor(float a) {
  float t = clamp((a - 6.4) / 3.7, 0.0, 1.0);
  vec3 c0 = vec3(0.50, 0.66, 1.00), c1 = vec3(0.86, 0.90, 1.00), c2 = vec3(1.00, 0.88, 0.72), c3 = vec3(1.00, 0.70, 0.45);
  return t < 0.33 ? mix(c0, c1, t / 0.33) : t < 0.66 ? mix(c1, c2, (t - 0.33) / 0.33) : mix(c2, c3, (t - 0.66) / 0.34);
}
void main() {
  ${cloud === "stars"
    ? "float aAge = a0.x, aZ = a0.y, aM = a0.z, aH = a1.x;"
    : "float aHa = a0.x, aHb = a0.y, aO3 = a0.z, aN2 = a0.w, aS2 = a1.x, aO1 = a1.y, aCls = a1.z, aNe = a1.w, aM = a2.x, aZ = a2.y, aSig = a2.z, aH = a2.w;"}
  float vlos = dot(vel, uFwd) / 1000.0;
  vec4 acc = vec4(0.0);
  ${snippet}
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float px = clamp(2.0 * aH * uSize * uProj / max(-mv.z, 1e-3), 1.25, 180.0);
  gl_PointSize = px;
  vAcc = acc / (0.19 * px * px);
  if (dot(acc, acc) == 0.0) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
}`;

const FRAG = `
in vec4 vAcc;
out vec4 outColor;
void main() {
  vec2 d = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(d, d);
  if (r2 > 1.0) discard;
  outColor = vAcc * exp(-4.0 * r2);
}`;

const RESOLVE = `
uniform sampler2D uAcc, uLut;
uniform int uMode;
uniform float uPxArea, uUnit, uLo, uHi, uMask, uMul, uAdd, uExposure, uLinear;
uniform vec3 uC0, uC1, uC2, uC3;
in vec2 vUv;
out vec4 outColor;
vec3 lut(float t) { return texture(uLut, vec2(clamp(t, 0.0, 1.0) * 0.996 + 0.002, 0.5)).rgb; }
float l10(float x) { return log(max(x, 1e-30)) / 2.302585; }
void main() {
  vec4 a = texture(uAcc, vUv);
  vec3 col = vec3(0.0);
  float alpha = 0.0;
  float wl = l10(a.r / uPxArea);
  float m = smoothstep(uMask - 0.25, uMask + 0.55, wl);
  if (uMode == 0) {
    vec3 sb = a.rgb / uPxArea * uExposure;
    float av = 0.067 * a.a * 1e4 / (uPxArea * 1e6);
    float avf = 1.5 * (1.0 - exp(-0.5 * av / 1.5));
    sb *= exp(-avf / 1.086 * vec3(0.8, 1.0, 1.28));
    float lum = dot(sb, vec3(0.3, 0.5, 0.2));
    float mapped = log(1.0 + 9.0 * lum) / log(10.0);
    col = sb * (mapped / max(lum, 1e-6));
    col = mix(col, vec3(mapped), smoothstep(0.75, 1.3, mapped) * 0.5);
    col = pow(clamp(col, 0.0, 1.0), vec3(0.85));
    alpha = clamp(max(col.r, max(col.g, col.b)) * 1.4, 0.0, 1.0);
  } else if (uMode == 1) {
    float v = uLinear > 0.5 ? a.r * uUnit / uPxArea : l10(a.r) + l10(uUnit) - l10(uPxArea);
    float t = (v - uLo) / (uHi - uLo);
    col = lut(t);
    alpha = uLinear > 0.5 ? smoothstep(0.0, 0.08, t) : smoothstep(-0.12, 0.08, t);
  } else if (uMode == 2 || uMode == 3 || uMode == 4 || uMode == 7) {
    float v;
    if (uMode == 2) v = a.g / max(a.r, 1e-30) * uMul + uAdd;
    else if (uMode == 3) { float mu = a.g / max(a.r, 1e-30); v = sqrt(max(a.b / max(a.r, 1e-30) - mu * mu, 0.0)) * 1000.0; }
    else if (uMode == 4) v = l10(a.g / max(a.r, 1e-30));
    else v = l10(a.r / max(a.g, 1e-30));
    col = lut((v - uLo) / (uHi - uLo));
    alpha = m;
  } else if (uMode == 5) {
    float n2 = l10(a.a / max(a.r, 1e-30)), o3 = l10(a.b / max(a.g, 1e-30));
    float ka = n2 < 0.05 ? 0.61 / (n2 - 0.05) + 1.3 : -99.0;
    float ke = n2 < 0.47 ? 0.61 / (n2 - 0.47) + 1.19 : -99.0;
    col = o3 < ka ? uC0 : o3 < ke ? uC1 : o3 > 1.05 * n2 + 0.45 ? uC2 : uC3;
    alpha = m;
  } else if (uMode == 6) {
    float s = a.r + a.g + a.b;
    col = (uC0 * a.r + uC1 * a.g + uC2 * a.b) / max(s, 1e-30);
    float b = smoothstep(uMask - 0.2, uMask + 2.2, l10(s / uPxArea));
    col *= 0.35 + 0.65 * b;
    alpha = m;
  }
  outColor = vec4(col * alpha, alpha);
}`;

const MODES = { composite: 0, logsum: 1, mean: 2, sigma: 3, ratio: 4, bpt: 5, mix: 6, ewlog: 7 };

function lutTexture(name) {
  const src = CMAPS[name] || CMAPS.viridis, data = new Uint8Array(256 * 4);
  for (let i = 0; i < 256; i++) { data[i * 4] = src[i * 3]; data[i * 4 + 1] = src[i * 3 + 1]; data[i * 4 + 2] = src[i * 3 + 2]; data[i * 4 + 3] = 255; }
  const t = new THREE.DataTexture(data, 256, 1, THREE.RGBAFormat);
  t.magFilter = t.minFilter = THREE.LinearFilter;
  t.colorSpace = THREE.NoColorSpace;
  t.needsUpdate = true;
  return t;
}
const hexVec = h => new THREE.Vector3(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);

export class Stage3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.autoClear = false;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.renderer.setPixelRatio(this.dpr);
    this.camera = new THREE.PerspectiveCamera(FOV, 2, 0.05, 400);
    this.camera.up.set(0, 0, 1);
    this.camera.position.set(0, -34, 20);
    this.accScene = new THREE.Scene();
    this.overScene = new THREE.Scene();
    this.rt = null;
    this.field = "composite";
    this.cmap = null;
    this.ranges = {};
    this.mats = new Map();
    this.luts = new Map();
    this.anchor = null;
    this.hit = null;
    this.controls = null;
    this.dirty = true;
    this.tween = null;
    this.autoRotate = 0;
    this.listeners = new Set();
    this.exposure = 2.2;

    this.resolveMat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3, vertexShader: "out vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: RESOLVE, transparent: true, depthTest: false, depthWrite: false,
      blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
      uniforms: {
        uAcc: { value: null }, uLut: { value: lutTexture("viridis") }, uMode: { value: 0 }, uPxArea: { value: 1 },
        uUnit: { value: 1 }, uLo: { value: 0 }, uHi: { value: 1 }, uMask: { value: -99 }, uMul: { value: 1 }, uAdd: { value: 0 },
        uExposure: { value: this.exposure }, uLinear: { value: 0 },
        uC0: { value: new THREE.Vector3() }, uC1: { value: new THREE.Vector3() }, uC2: { value: new THREE.Vector3() }, uC3: { value: new THREE.Vector3() },
      },
    });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.resolveMat);
    this.quadScene = new THREE.Scene();
    this.quadScene.add(this.quad);
    this.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const g = document.createElement("canvas"); g.width = g.height = 128;
    const gc = g.getContext("2d"), grd = gc.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(0.12, "rgba(200,225,255,0.85)"); grd.addColorStop(0.4, "rgba(120,170,255,0.18)"); grd.addColorStop(1, "rgba(0,0,0,0)");
    gc.fillStyle = grd; gc.fillRect(0, 0, 128, 128);
    this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(g), blending: THREE.AdditiveBlending, depthTest: false, transparent: true }));
    this.glow.scale.set(2.2, 2.2, 1);
    this.overScene.add(this.glow);

    this.sight = null;
    requestAnimationFrame(this._frame);
  }

  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  _emit(k, d) { for (const f of this.listeners) f(k, d); }

  setData(gal, ranges) {
    this.gal = gal;
    this.ranges = ranges;
    this.agnAxis = new THREE.Vector3(...gal.meta.agn.axis);
    const mk = (cloud, cols, a0, a1, a2) => {
      const C = gal[cloud].cols, n = gal[cloud].count, geo = new THREE.BufferGeometry();
      const pos = new Float32Array(n * 3), vel = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        pos[i * 3] = C.x[i]; pos[i * 3 + 1] = C.y[i]; pos[i * 3 + 2] = C.z[i];
        vel[i * 3] = C.vx[i]; vel[i * 3 + 1] = C.vy[i]; vel[i * 3 + 2] = C.vz[i];
      }
      const pack = keys => { const a = new Float32Array(n * 4); keys.forEach((k, j) => { if (!k) return; const c = C[k]; for (let i = 0; i < n; i++) a[i * 4 + j] = c[i]; }); return a; };
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("vel", new THREE.BufferAttribute(vel, 3));
      geo.setAttribute("a0", new THREE.BufferAttribute(pack(a0), 4));
      geo.setAttribute("a1", new THREE.BufferAttribute(pack(a1), 4));
      geo.setAttribute("a2", new THREE.BufferAttribute(pack(a2), 4));
      geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);
      const pts = new THREE.Points(geo, new THREE.PointsMaterial());
      pts.frustumCulled = false;
      pts.userData.cloud = cloud;
      this.accScene.add(pts);
      return pts;
    };
    this.stars = mk("stars", null, ["logAge", "logZ", "logM", null], ["h", null, null, null], [null, null, null, null]);
    this.gas = mk("gas", null, ["logHa", "logHb", "logO3", "logN2"], ["logS2", "logO1", "cls", "logNe"], ["logM", "logZ", "sig", "h"]);
    this.setField(this.field);
  }

  _material(fieldKey, cloud) {
    const key = `${fieldKey}|${cloud}`;
    if (this.mats.has(key)) return this.mats.get(key);
    const f = FIELD[fieldKey], snippet = f[cloud];
    let m = null;
    if (snippet) {
      m = new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3, vertexShader: VERT(snippet, cloud), fragmentShader: FRAG,
        transparent: true, depthTest: false, depthWrite: false,
        blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
        blendEquationAlpha: THREE.AddEquation, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor,
        uniforms: { uFwd: { value: new THREE.Vector3() }, uProj: { value: 1 }, uSize: { value: 0.8 } },
      });
    }
    this.mats.set(key, m);
    return m;
  }

  setField(key, cmap = null) {
    this.field = key;
    this.cmap = cmap;
    const f = FIELD[key];
    for (const pts of [this.stars, this.gas]) {
      if (!pts) continue;
      const m = this._material(key, pts.userData.cloud);
      pts.visible = !!m;
      if (m) pts.material = m;
    }
    const u = this.resolveMat.uniforms, r = this.ranges[key] || { range: [0, 1], mask: -99 };
    u.uMode.value = MODES[f.mode];
    u.uUnit.value = f.unit ?? 1;
    u.uLo.value = r.range[0]; u.uHi.value = r.range[1];
    u.uMask.value = r.mask;
    u.uMul.value = f.mul ?? 1; u.uAdd.value = f.add ?? 0;
    u.uLinear.value = f.linear ? 1 : 0;
    if (f.mode === "composite" && r.exposure) u.uExposure.value = r.exposure;
    const name = cmap || f.cmap || "viridis";
    if (!this.luts.has(name)) this.luts.set(name, lutTexture(name));
    u.uLut.value = this.luts.get(name);
    const cols = f.mode === "bpt" ? ["#8fb6ff", "#7fd0a8", "#ff6a3d", "#ffd166"] : ["#8fb6ff", "#ff6a3d", "#c8a2ff", "#ffffff"];
    [u.uC0, u.uC1, u.uC2, u.uC3].forEach((x, i) => x.value.copy(hexVec(cols[i])));
    this.glow.visible = f.mode === "composite";
    this.dirty = true;
    this._scheduleAuto(60);
    this._emit("field", key);
  }

  range(key = this.field) { return (this.ranges[key] || {}).range || [0, 1]; }

  autoRange() {
    if (!this.rt || !this.gal) return;
    const f = FIELD[this.field], rd = this.renderer, gl = rd.getContext();
    const W = this.rt.width, H = this.rt.height, buf = new Float32Array(W * H * 4);
    try {
      rd.setRenderTarget(this.rt);
      gl.readPixels(0, 0, W, H, gl.RGBA, gl.FLOAT, buf);
      rd.setRenderTarget(null);
      if (gl.getError()) return;
    } catch { return; }
    const u = this.resolveMat.uniforms, pa = u.uPxArea.value, unit = f.unit ?? 1;
    const pct = (a, q) => a[Math.min(a.length - 1, Math.max(0, Math.floor(q * (a.length - 1))))];
    const lw = [], st = 3;
    for (let j = 0; j < H; j += st) for (let i = 0; i < W; i += st) { const r = buf[(j * W + i) * 4]; if (r > 0) lw.push(Math.log10(r / pa)); }
    if (lw.length < 50 && f.mode !== "composite") return;
    lw.sort((a, b) => a - b);
    const r = this.ranges[f.key] || (this.ranges[f.key] = {});
    r.mask = pct(lw, 0.2);
    const thr = Math.pow(10, pct(lw, 0.35)) * pa;
    const vals = [];
    if (f.mode === "composite") {
      const L = [];
      for (let k = 0; k < W * H; k += st * 2) { const a = buf[k * 4] * 0.3 + buf[k * 4 + 1] * 0.5 + buf[k * 4 + 2] * 0.2; if (a > 0) L.push(a / pa); }
      L.sort((a, b) => a - b);
      if (L.length) { r.exposure = 0.22 / pct(L, 0.9); u.uExposure.value = r.exposure; }
    } else if (!f.range) {
      for (let j = 0; j < H; j += st) for (let i = 0; i < W; i += st) {
        const o = (j * W + i) * 4, R = buf[o], G = buf[o + 1], B = buf[o + 2];
        if (f.mode === "logsum") { if (R > 0) vals.push(Math.log10(R * unit / pa)); continue; }
        if (!(R > thr)) continue;
        if (f.mode === "mean") vals.push(G / R * (f.mul ?? 1) + (f.add ?? 0));
        else if (f.mode === "sigma") { const mu = G / R; vals.push(Math.sqrt(Math.max(0, B / R - mu * mu)) * 1000); }
        else if (f.mode === "ratio" && G > 0) vals.push(Math.log10(G / R));
        else if (f.mode === "ewlog" && G > 0) vals.push(Math.log10(R / G));
      }
      if (vals.length > 30) {
        vals.sort((a, b) => a - b);
        let lo = f.mode === "logsum" ? pct(vals, 0.25) : pct(vals, 0.02), hi = f.mode === "logsum" ? pct(vals, 0.998) : pct(vals, 0.98);
        if (f.symmetric) { const m = Math.max(Math.abs(lo), Math.abs(hi)); lo = -m; hi = m; }
        if (hi - lo < 1e-3) hi = lo + 1;
        r.range = [lo, hi];
      }
    }
    if (r.range) { u.uLo.value = r.range[0]; u.uHi.value = r.range[1]; }
    u.uMask.value = r.mask;
    this.dirty = true;
    this._emit("range", f.key);
  }

  _scheduleAuto(ms = 380) {
    clearTimeout(this._autoT);
    this._autoT = setTimeout(() => { this._autoPending = true; this.dirty = true; }, ms);
  }

  attach(anchor, hit, opts = {}) {
    this.anchor = anchor;
    this.canvas.classList.toggle("on", !!anchor);
    if (this.controls) { this.controls.dispose(); this.controls = null; }
    this.hit = hit;
    if (hit) {
      const c = new OrbitControls(this.camera, hit);
      c.enableDamping = true; c.dampingFactor = 0.08; c.rotateSpeed = 0.6; c.zoomSpeed = 0.8;
      c.minDistance = 3; c.maxDistance = 90; c.enablePan = true; c.screenSpacePanning = true;
      c.target.copy(this.target || new THREE.Vector3());
      c.addEventListener("change", () => { this.dirty = true; this._emit("camera"); });
      c.addEventListener("start", () => { this.tween = null; this.autoRotate = 0; this._emit("interact"); });
      c.addEventListener("end", () => this._scheduleAuto());
      this.controls = c;
    }
    this.autoRotate = opts.autoRotate || 0;
    if (opts.view) this.flyTo(opts.view, opts.ms ?? 1300);
    this.dirty = true;
  }

  flyTo(view, ms = 1200) {
    const from = { pos: this.camera.position.clone(), target: (this.controls?.target || this.target || new THREE.Vector3()).clone() };
    const to = { pos: new THREE.Vector3(...view.pos), target: new THREE.Vector3(...(view.target || [0, 0, 0])) };
    if (ms <= 0 || matchMedia("(prefers-reduced-motion: reduce)").matches) { this._setCam(to.pos, to.target); return; }
    this.tween = { from, to, t0: performance.now(), ms };
  }

  _setCam(pos, target) {
    this.camera.position.copy(pos);
    this.target = target.clone();
    if (this.controls) this.controls.target.copy(target);
    this.camera.lookAt(target);
    this.dirty = true;
  }

  agnView() {
    if (!this.agnAxis) return null;
    const dir = new THREE.Vector3().subVectors(this.camera.position, this.target || new THREE.Vector3()).normalize();
    const ang = Math.acos(Math.min(1, Math.abs(dir.dot(this.agnAxis)))) * 180 / Math.PI;
    const half = this.gal.meta.agn.halfOpening;
    return { angle: ang, type: ang < half ? 1 : 2, half };
  }

  aperture(clientX, clientY, radiusPx) {
    const r = this.canvas.getBoundingClientRect(), a = this.anchorRect;
    if (!a) return null;
    const nx = ((clientX - a.left) / a.width) * 2 - 1, ny = -(((clientY - a.top) / a.height) * 2 - 1);
    const vp = new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    const fwd = new THREE.Vector3(); this.camera.getWorldDirection(fwd);
    const near = new THREE.Vector3(nx, ny, -1).unproject(this.camera), far = new THREE.Vector3(nx, ny, 1).unproject(this.camera);
    const dir = far.clone().sub(near).normalize();
    const dist = this.camera.position.distanceTo(this.target || new THREE.Vector3());
    const kpcPerPx = (2 * dist * Math.tan((this.camera.fov / 2) * Math.PI / 180)) / a.height;
    void r;
    return {
      vp: Array.from(vp.elements), fwd: fwd.toArray(), ndc: [nx, ny],
      rx: (radiusPx / a.width) * 2, ry: (radiusPx / a.height) * 2,
      rKpc: radiusPx * kpcPerPx, origin: near.toArray(), dir: dir.toArray(), agn: this.agnView(),
    };
  }

  _setSight(origin, dir, rKpc) {
    if (this.sight) { this.overScene.remove(this.sight); this.sight.geometry.dispose(); }
    const R = 22, b = origin.dot(dir), c = origin.lengthSq() - R * R, disc = b * b - c;
    if (disc < 0) { this.sight = null; return; }
    const t0 = -b - Math.sqrt(disc), t1 = -b + Math.sqrt(disc);
    const p0 = origin.clone().addScaledVector(dir, t0), p1 = origin.clone().addScaledVector(dir, t1);
    const geo = new LineGeometry();
    geo.setPositions([p0.x, p0.y, p0.z, p1.x, p1.y, p1.z]);
    const mat = new LineMaterial({ color: 0xffb26b, linewidth: 2.2, transparent: true, opacity: 0.95, depthTest: false });
    mat.resolution.set(this.size?.w || 1, this.size?.h || 1);
    this.sight = new Line2(geo, mat);
    this.sight.userData.r = rKpc;
    this.overScene.add(this.sight);
    this.dirty = true;
  }

  clearSight() { if (this.sight) { this.overScene.remove(this.sight); this.sight = null; this.dirty = true; } }

  _frame = now => {
    requestAnimationFrame(this._frame);
    if (!this.anchor || !this.anchor.isConnected || !this.gal) return;
    const r = this.anchor.getBoundingClientRect();
    this.anchorRect = r;
    const visible = r.bottom > 0 && r.top < innerHeight;
    this.canvas.style.visibility = visible ? "visible" : "hidden";
    if (!visible) return;
    this.canvas.style.transform = `translate(${r.left}px, ${r.top}px)`;
    const w = Math.round(r.width), h = Math.round(r.height);
    if (!this.size || this.size.w !== w || this.size.h !== h) this._resize(w, h);

    if (this.tween) {
      const p = Math.min(1, (now - this.tween.t0) / this.tween.ms), e = ease(p), { from, to } = this.tween;
      const tgt = from.target.clone().lerp(to.target, e);
      const sw = v => new THREE.Vector3(v.x, v.z, v.y);
      const a = new THREE.Spherical().setFromVector3(sw(from.pos.clone().sub(from.target)));
      const b = new THREE.Spherical().setFromVector3(sw(to.pos.clone().sub(to.target)));
      let dth = b.theta - a.theta; if (dth > Math.PI) dth -= 2 * Math.PI; if (dth < -Math.PI) dth += 2 * Math.PI;
      const s = new THREE.Spherical(a.radius + (b.radius - a.radius) * e, a.phi + (b.phi - a.phi) * e, a.theta + dth * e);
      const off = sw(new THREE.Vector3().setFromSpherical(s));
      this._setCam(tgt.clone().add(off), tgt);
      if (p >= 1) { this.tween = null; this._scheduleAuto(120); }
      this._emit("camera");
    } else if (this.autoRotate && !this.controls?.dragging) {
      const t = this.target || new THREE.Vector3();
      const off = this.camera.position.clone().sub(t).applyAxisAngle(new THREE.Vector3(0, 0, 1), this.autoRotate * 0.016);
      this._setCam(t.clone().add(off), t);
      this._emit("camera");
    }
    if (this.controls) this.controls.update();
    if (this.dirty) {
      this._render();
      if (this._autoPending) { this._autoPending = false; this.autoRange(); this._render(); }
    }
  };

  _resize(w, h) {
    this.size = { w, h };
    this.renderer.setSize(w, h, false);
    this.canvas.style.width = `${w}px`; this.canvas.style.height = `${h}px`;
    this.camera.aspect = w / h;
    this.camera.fov = w / h < 1.25 ? Math.min(58, FOV * Math.pow(1.25 / (w / h), 0.75)) : FOV;
    this.camera.updateProjectionMatrix();
    const W = Math.round(w * this.dpr), H = Math.round(h * this.dpr);
    this.rt?.dispose();
    this.rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, format: THREE.RGBAFormat, depthBuffer: false, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    this.resolveMat.uniforms.uAcc.value = this.rt.texture;
    if (this.sight) this.sight.material.resolution.set(w, h);
    this.dirty = true;
    this._scheduleAuto(200);
  }

  _render() {
    this.dirty = false;
    const cam = this.camera;
    cam.updateMatrixWorld();
    const fwd = new THREE.Vector3(); cam.getWorldDirection(fwd);
    const H = this.size.h * this.dpr;
    const proj = H / (2 * Math.tan((cam.fov / 2) * Math.PI / 180));
    for (const pts of [this.stars, this.gas]) {
      if (!pts?.visible) continue;
      pts.material.uniforms.uFwd.value.copy(fwd);
      pts.material.uniforms.uProj.value = proj;
    }
    const dist = cam.position.distanceTo(this.target || new THREE.Vector3());
    const kpcPerPx = (2 * dist * Math.tan((cam.fov / 2) * Math.PI / 180)) / H;
    this.resolveMat.uniforms.uPxArea.value = kpcPerPx * kpcPerPx;
    const rd = this.renderer;
    rd.setRenderTarget(this.rt);
    rd.setClearColor(0x000000, 0);
    rd.clear();
    rd.render(this.accScene, cam);
    rd.setRenderTarget(null);
    rd.clear();
    rd.render(this.quadScene, this.quadCam);
    const agn = this.agnView();
    if (this.glow.visible && agn) {
      const s = (agn.type === 1 ? 2.6 : 0.9) * dist / 34;
      this.glow.scale.set(s, s, 1);
      this.glow.material.opacity = agn.type === 1 ? 0.95 : 0.35;
    }
    rd.render(this.overScene, cam);
  }
}
