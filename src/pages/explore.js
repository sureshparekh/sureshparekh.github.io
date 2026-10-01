import { stage, data, stageAnchor } from "../main.js";
import { FIELDS, FIELD, BPT_COLORS, SOURCE_COLORS } from "../three/fields.js";
import { cssGradient } from "../ui/colormaps.js";
import { SpectrumPlot, fmtSci } from "../ui/plot.js";
import { ICONS } from "../ui/icons.js";
import { PROFILE, FAQ } from "../content.js";
import { LAM } from "../physics/constants.js";

const VIEWS = {
  inclined: { label: "Inclined", pos: [-17, -31, 15], target: [0, 0, 0] },
  face: { label: "Face-on", pos: [0, -0.6, 42], target: [0, 0, 0] },
  edge: { label: "Edge-on", pos: [0, -42, 0.6], target: [0, 0, 0] },
  cone: { label: "Down the cone", pos: null, target: [0, 0, 0] },
};
const COL = { obs: "#7a8296", total: "#eef0f5", stars: "#ffd9a8", neb: "#c8a2ff", agn: "#8fb6ff", narrow: "#5b8cff", broad: "#ff6a3d" };
const WINDOWS = [
  ["Optical", 3600, 7400], ["Full", 1500, 9700], ["Balmer break", 3500, 4500],
  ["Hβ + [O III]", 4800, 5060], ["Hα + [N II] + [S II]", 6500, 6780], ["Near-IR", 8400, 9700],
];
const MARKS = [
  [2798, "Mg II"], [3426, "[Ne V]"], [3727, "[O II]"], [3869, "[Ne III]"], [4102, "Hδ"], [4340, "Hγ"], [4686, "He II"],
  [4861, "Hβ"], [5007, "[O III]"], [5876, "He I"], [6300, "[O I]"], [6563, "Hα"], [6583, "[N II]"], [6724, "[S II]"],
  [7136, "[Ar III]"], [9069, "[S III]"], [9531, "[S III]"],
].map(([lam, label]) => ({ lam, label }));
const EMPTY = `<p class="hint">Click the galaxy to place an aperture.</p>`;
const SFH_LABELS = ["< 10 Myr", "10-100 Myr", "0.1-1 Gyr", "1-5 Gyr", "> 5 Gyr"];

const fmt = (v, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : "-");
const lg = v => (v > 0 ? Math.log10(v).toFixed(2) : "-");

export function explorePage(params) {
  const el = document.createElement("div");
  el.className = "page";
  el.innerHTML = `
    <section class="hero">
      <div class="hero-grid"></div>
      <div class="viz-anchor"></div>
      <div class="hero-scrim"></div>
      <div class="viz-hit" aria-label="3-D model. Drag to orbit, scroll to zoom, click to place an aperture."></div>
      <div class="aperture-ring" data-k="ring" hidden></div>

      <div class="ov ov-tl glass">
        <div class="label">N-body model</div>
        <h1>Seyfert galaxy simulation</h1>
        <button class="select glass dark" data-k="select" aria-haspopup="listbox" aria-expanded="false">
          <span class="sv"><span class="sg" data-k="sg"></span><span class="sn" data-k="sn"></span></span>${ICONS.chevron}
        </button>
        <div data-k="key"></div>
      </div>

      <div class="ov ov-tr glass">
        <div class="ov-label">View</div>
        <div class="grid2" data-k="views">
          ${Object.entries(VIEWS).map(([k, v]) => `<button class="pill" data-v="${k}">${v.label}</button>`).join("")}
        </div>
        <div class="row rot"><span>Auto-rotate</span><button class="switch" data-k="rot" role="switch" aria-checked="false" aria-label="Auto-rotate"></button></div>
        <div class="row ap" style="flex-direction:column;align-items:stretch;gap:8px">
          <span style="display:flex;justify-content:space-between"><span>Aperture</span><span class="mono" data-k="apv" style="font:400 11px var(--mono)"></span></span>
          <input type="range" class="slider" min="4" max="60" value="14" data-k="ap" aria-label="Aperture radius" />
        </div>
      </div>

      <div class="ov ov-bl glass" data-k="agn"></div>
      <div class="ov ov-br">Drag to orbit, scroll to zoom<br>Click to take a spectrum</div>
      <div class="loading glass" data-k="loading"><span>Loading simulation</span><i><b></b></i></div>
    </section>

    <section class="wrap" style="padding-top:20px;padding-bottom:64px">
      <div class="results">
        <div class="panel wide glass">
          <div class="panel-head">
            <div>
              <h3 data-k="stitle">Click the galaxy to take a spectrum</h3>
              <div class="spx-sub" data-k="ssub">Every star and gas particle along your line of sight inside the aperture contributes.</div>
            </div>
          </div>
          <div class="plotbox" data-k="plot"></div>
          <div class="chips" data-k="chips"></div>
          <div class="chips" data-k="wins"></div>
        </div>
        <div class="panel third glass"><h3>Stars in the aperture</h3><div data-k="pStars">${EMPTY}</div></div>
        <div class="panel third glass"><h3>Emission lines</h3><div data-k="pLines">${EMPTY}</div></div>
        <div class="panel third glass"><h3>Nebular continuum &amp; AGN</h3><div data-k="pNeb">${EMPTY}</div></div>
      </div>
    </section>
    <section class="wrap section faq" style="padding-top:0">
      <h2>Questions about AGN and this simulation</h2>
      <div class="faq-list">
        ${FAQ.map(([q, a]) => `<details class="faq-item glass"><summary><h3>${q}</h3>${ICONS.chevron}</summary><p>${a}</p></details>`).join("")}
      </div>
    </section>
    <footer class="wrap footer"><span>© ${new Date().getFullYear()} ${PROFILE.name}</span><span><a href="/">Home</a> · <a href="/research/">Research</a></span></footer>`;

  const q = k => el.querySelector(`[data-k="${k}"]`);
  const hit = el.querySelector(".viz-hit");
  const state = { field: FIELD[params.get("map")] ? params.get("map") : "composite", ap: 14, show: { obs: true, total: true, stars: true, neb: true, agn: true, lines: true }, logy: false };
  let lastPick = null, reqId = 0, menu = null;

  function syncSelect() {
    const f = FIELD[state.field];
    q("sg").textContent = f.group; q("sn").textContent = f.label;
    const key = q("key");
    if (f.mode === "composite") {
      key.innerHTML = `<div class="legend"><span><i style="background:#9fb8ff"></i>young stars</span><span><i style="background:#ffd29a"></i>old stars</span><span><i style="background:#ff4f6a"></i>Hα</span><span><i style="background:#4fb0ff"></i>[O III]</span></div><div class="ov-note">${f.note}</div>`;
    } else if (f.mode === "bpt" || f.mode === "mix") {
      const cols = f.mode === "bpt" ? BPT_COLORS : SOURCE_COLORS;
      key.innerHTML = `<div class="legend">${f.classes.map((c, i) => `<span><i style="background:${cols[i]}"></i>${c}</span>`).join("")}</div>`;
    } else {
      const [a, b] = stage.range(state.field);
      key.innerHTML = `<div class="cbar"><div class="bar" style="background:${cssGradient(f.cmap)}"></div><div class="ticks"><span>${tick(a)}</span><span>${tick((a + b) / 2)}</span><span>${tick(b)}</span></div><div class="unit">${f.label2 || ""}</div></div>`;
    }
  }
  const tick = v => (Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(2));

  function openMenu() {
    if (menu) return closeMenu();
    const btn = q("select");
    btn.setAttribute("aria-expanded", "true");
    menu = document.createElement("div");
    menu.className = "menu glass dark";
    menu.setAttribute("role", "listbox");
    menu.innerHTML = `<input type="search" placeholder="Search ${FIELDS.length} maps: age, Hα, velocity, BPT" aria-label="Search maps" /><div class="list"></div>`;
    document.body.appendChild(menu);
    const r = btn.getBoundingClientRect();
    menu.style.left = `${Math.max(12, Math.min(r.left, innerWidth - menu.offsetWidth - 12))}px`;
    menu.style.top = `${r.bottom + 8}px`;
    const input = menu.querySelector("input"), list = menu.querySelector(".list");
    let items = [], hl = 0;
    const render = () => {
      const s = input.value.trim().toLowerCase();
      items = FIELDS.filter(f => !s || `${f.label} ${f.group} ${f.key} ${f.label2 || ""}`.toLowerCase().includes(s));
      if (!items.length) { list.innerHTML = `<div class="empty">No map matches “${input.value}”</div>`; return; }
      hl = Math.min(hl, items.length - 1);
      let html = "", g = null;
      items.forEach((f, i) => {
        if (f.group !== g) { g = f.group; html += `<div class="grp">${g}</div>`; }
        const sw = f.cmap ? `<span class="sw" style="background:${cssGradient(f.cmap)}"></span>` : f.mode === "composite" ? `<span class="sw" style="background:linear-gradient(90deg,#9fb8ff,#ffd29a,#ff4f6a,#4fb0ff)"></span>` : `<span class="sw" style="background:linear-gradient(90deg,${(f.mode === "bpt" ? BPT_COLORS : SOURCE_COLORS).join(",")})"></span>`;
        html += `<div class="opt ${f.key === state.field ? "sel" : ""} ${i === hl ? "hl" : ""}" data-i="${i}" role="option"><span>${f.label}</span>${sw}</div>`;
      });
      list.innerHTML = html;
      list.querySelector(".hl")?.scrollIntoView({ block: "nearest" });
    };
    input.addEventListener("input", () => { hl = 0; render(); });
    input.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { hl = Math.min(items.length - 1, hl + 1); render(); e.preventDefault(); }
      else if (e.key === "ArrowUp") { hl = Math.max(0, hl - 1); render(); e.preventDefault(); }
      else if (e.key === "Enter" && items[hl]) { choose(items[hl].key); closeMenu(); }
      else if (e.key === "Escape") closeMenu();
    });
    list.addEventListener("click", e => { const o = e.target.closest(".opt"); if (o) { choose(items[+o.dataset.i].key); closeMenu(); } });
    hl = Math.max(0, FIELDS.findIndex(f => f.key === state.field));
    render();
    input.focus();
    setTimeout(() => document.addEventListener("pointerdown", outside), 0);
  }
  const outside = e => { if (menu && !menu.contains(e.target) && !q("select").contains(e.target)) closeMenu(); };
  function closeMenu() { menu?.remove(); menu = null; q("select").setAttribute("aria-expanded", "false"); document.removeEventListener("pointerdown", outside); }
  function choose(key) { state.field = key; stage.setField(key); syncSelect(); writeURL(); }

  function viewFor(k) {
    if (k !== "cone") return VIEWS[k];
    const a = stage.agnAxis;
    return { pos: [a.x * 40 + 0.4, a.y * 40 - 0.4, a.z * 40], target: [0, 0, 0] };
  }
  q("views").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    stage.flyTo(viewFor(b.dataset.v), 1400);
    q("views").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
  });
  q("rot").addEventListener("click", () => {
    const on = !stage.autoRotate;
    stage.autoRotate = on ? 0.06 : 0;
    q("rot").classList.toggle("on", on); q("rot").setAttribute("aria-checked", String(on));
  });
  const apLabel = () => {
    const a = stage.anchorRect, d = stage.camera.position.distanceTo(stage.target || stage.camera.position.clone().set(0, 0, 0));
    const kpc = a ? state.ap * (2 * d * Math.tan((stage.camera.fov / 2) * Math.PI / 180)) / a.height : NaN;
    q("apv").textContent = Number.isFinite(kpc) ? (kpc < 1 ? `r = ${(kpc * 1000).toFixed(0)} pc` : `r = ${kpc.toFixed(2)} kpc`) : "";
  };
  q("ap").addEventListener("input", e => { state.ap = +e.target.value; apLabel(); if (lastPick) pickAt(lastPick.x, lastPick.y); });

  function updateAgn() {
    const v = stage.agnView();
    if (!v) return;
    const t1 = v.type === 1;
    q("agn").innerHTML = `<span class="badge ${t1 ? "s1" : "s2"}"><i style="background:${t1 ? "#8fb6ff" : "#ff6a3d"}"></i>Seyfert ${t1 ? "1" : "2"}</span>
      <span class="meta">${v.angle.toFixed(0)}° from the cone axis. ${t1 ? "Broad lines visible" : "Torus hides the nucleus"}</span>`;
  }

  let down = null;
  hit.addEventListener("pointerdown", e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  hit.addEventListener("pointerup", e => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    if (moved < 5 && performance.now() - down.t < 600 && e.button === 0) pickAt(e.clientX, e.clientY);
    down = null;
  });

  function pickAt(x, y) {
    if (!stage.gal) return;
    const ap = stage.aperture(x, y, state.ap);
    if (!ap) return;
    lastPick = { x, y };
    const ring = q("ring"), hr = el.querySelector(".hero").getBoundingClientRect();
    ring.hidden = false; ring.style.opacity = 1;
    ring.style.left = `${x - hr.left}px`; ring.style.top = `${y - hr.top}px`;
    ring.style.width = ring.style.height = `${state.ap * 2}px`;
    q("stitle").innerHTML = `Aperture r = ${ap.rKpc < 1 ? (ap.rKpc * 1000).toFixed(0) + " pc" : ap.rKpc.toFixed(2) + " kpc"} <span style="font:400 12px var(--mono);color:var(--dim)">computing</span>`;
    worker.postMessage({ id: ++reqId, ...ap });
  }

  const worker = new Worker(new URL("../three/aperture-worker.js", import.meta.url), { type: "module" });
  let last = null;
  worker.onmessage = e => { if (e.data.id !== reqId) return; last = e.data; showResult(); };

  const plot = new SpectrumPlot(q("plot"));
  plot.full = [1500, 9700];
  plot.setView(3600, 7400, false);
  const chips = [["obs", "Observed"], ["total", "Model"], ["stars", "Stars"], ["neb", "Nebular cont."], ["agn", "AGN"], ["lines", "Lines"]];
  q("chips").innerHTML = chips.map(([k, l]) => `<button class="chip on" data-v="${k}"><i style="background:${COL[k] || COL.narrow}"></i>${l}</button>`).join("") + `<span class="sep"></span><button class="chip" data-v="logy">log y</button>`;
  q("wins").innerHTML = WINDOWS.map(([l, a, b], i) => `<button class="chip ${i ? "" : "on"}" data-a="${a}" data-b="${b}">${l}</button>`).join("");
  q("chips").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    const k = b.dataset.v;
    if (k === "logy") { state.logy = !state.logy; b.classList.toggle("on", state.logy); plot.logy = state.logy; plot.draw(); return; }
    state.show[k] = !state.show[k];
    b.classList.toggle("on", state.show[k]); b.classList.toggle("off", !state.show[k]);
    for (const s of plot.series) if (s.key === k) s.visible = state.show[k];
    plot.draw();
  });
  q("wins").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    plot.setView(+b.dataset.a, +b.dataset.b, false);
    q("wins").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
  });
  plot.onView = () => q("wins").querySelectorAll("button").forEach(x => x.classList.remove("on"));

  function showResult() {
    const { spec: s, stats: st } = last, S = state.show;
    const lines = new Float64Array(LAM.length);
    for (let i = 0; i < LAM.length; i++) lines[i] = s.narrow[i] + s.broad[i];
    plot.logy = state.logy;
    plot.setData([
      { key: "obs", label: "obs", color: COL.obs, data: s.obs, lam: LAM, width: 0.8, visible: S.obs },
      { key: "stars", label: "stars", color: COL.stars, data: s.stars, lam: LAM, width: 1.2, visible: S.stars, fill: "rgba(255,217,168,0.06)" },
      { key: "neb", label: "nebular", color: COL.neb, data: s.neb, lam: LAM, width: 1.2, visible: S.neb },
      { key: "agn", label: "AGN", color: COL.agn, data: s.agn, lam: LAM, width: 1.2, visible: S.agn },
      { key: "lines", label: "lines", color: COL.narrow, data: lines, lam: LAM, width: 1, visible: S.lines, noScale: true },
      { key: "total", label: "model", color: COL.total, data: s.total, lam: LAM, width: 1.3, visible: S.total },
    ], MARKS);
    const r = st.rKpc;
    q("stitle").textContent = `Aperture r = ${r < 1 ? (r * 1000).toFixed(0) + " pc" : r.toFixed(2) + " kpc"}`;
    q("ssub").innerHTML = `${st.n.stars.toLocaleString()} star and ${st.n.gas.toLocaleString()} gas particles along the sightline, S/N ${fmt(st.snr5500, 0)} at 5500 Å${st.agn.inAperture ? `. <b>Includes the nucleus (Seyfert ${st.agn.type})</b>` : ""}`;
    q("pStars").innerHTML = starsPanel(st);
    q("pLines").innerHTML = linesPanel(st);
    q("pNeb").innerHTML = nebPanel(st);
  }

  function starsPanel(st) {
    const s = st.stars;
    if (!s) return `<p class="hint">No stars in this aperture.</p>`;
    const mx = Math.max(...s.sfhL, ...s.sfhM, 1e-6);
    return `
      <div class="bars">${s.sfhL.map((l, i) => `<div class="b"><i style="height:${(l / mx) * 100}%;background:#ffd9a8"></i><i style="height:${(s.sfhM[i] / mx) * 100}%;background:#c8a2ff"></i></div>`).join("")}</div>
      <div class="bars-x">${SFH_LABELS.map(l => `<span>${l}</span>`).join("")}</div>
      <div class="legend-row"><span><i style="background:#ffd9a8"></i>light (5000 Å)</span><span><i style="background:#c8a2ff"></i>mass</span></div>
      <table class="kv">
        <tr><td>Stellar mass</td><td class="n">${lg(s.mass)}</td><td class="u">log M☉</td></tr>
        <tr><td>Age, light / mass-weighted</td><td class="n">${fmt(s.lAge)} / ${fmt(s.mAge)}</td><td class="u">log yr</td></tr>
        <tr><td>Metallicity, light / mass</td><td class="n">${fmt(s.lZ)} / ${fmt(s.mZ)}</td><td class="u">log Z/Z☉</td></tr>
        <tr><td>SFR, last 10 / 100 Myr</td><td class="n">${fmt(s.sfr10, 3)} / ${fmt(s.sfr100, 3)}</td><td class="u">M☉ yr⁻¹</td></tr>
        <tr><td>A_V (stars)</td><td class="n">${fmt(s.av)}</td><td class="u">mag</td></tr>
        <tr><td>v⋆ · σ⋆</td><td class="n">${fmt(s.v, 0)} · ${fmt(s.sig, 0)}</td><td class="u">km s⁻¹</td></tr>
      </table>`;
  }

  function linesPanel(st) {
    const g = st.gas;
    if (!g || !(g.lines.ha.obs > 0)) return `<p class="hint">No ionised gas in this aperture.</p>`;
    const L = g.lines;
    const row = (id, name) => L[id] && L[id].obs > 0 ? `<tr><td>${name}</td><td class="n">${lg(L[id].obs)}</td><td class="n">${fmt(L[id].ew, 1)}</td><td class="n">${fmt(L[id].v, 0)}</td><td class="n">${fmt(L[id].sig, 0)}</td></tr>` : "";
    const src = g.src;
    return `
      <table class="kv">
        <tr><th>Line</th><th class="n">log L</th><th class="n">EW Å</th><th class="n">v</th><th class="n">σ</th></tr>
        ${row("oii", "[O II] 3727")}${row("hb", "Hβ")}${row("oiii", "[O III] 5007")}${row("oi", "[O I] 6300")}${row("ha", "Hα")}${row("nii", "[N II] 6583")}${row("sii6716", "[S II] 6716")}${row("sii6731", "[S II] 6731")}${row("heii", "He II 4686")}${row("nev", "[Ne V] 3426")}
        <tr class="grp"><td colspan="5">Diagnostics</td></tr>
        <tr><td>BPT class</td><td class="n" colspan="4">${g.bpt}</td></tr>
        <tr><td>log [N II]/Hα · [O III]/Hβ</td><td class="n" colspan="4">${fmt(g.n2)} · ${fmt(g.o3)}</td></tr>
        <tr><td>Hα/Hβ → A_V(gas)</td><td class="n" colspan="4">${fmt(g.hahb)} → ${fmt(g.avGas)} mag</td></tr>
        <tr><td>n_e from [S II]</td><td class="n" colspan="4">${fmt(g.ne, 0)} cm⁻³</td></tr>
        <tr><td>12 + log O/H (N2 / true)</td><td class="n" colspan="4">${fmt(g.ohN2)} / ${fmt(g.oh)}</td></tr>
      </table>
      <div class="legend-row" style="margin-top:14px">Hα powered by</div>
      <div class="stackbar"><i style="width:${src[0] * 100}%;background:${SOURCE_COLORS[0]}"></i><i style="width:${src[1] * 100}%;background:${SOURCE_COLORS[1]}"></i><i style="width:${src[2] * 100}%;background:${SOURCE_COLORS[2]}"></i></div>
      <div class="legend-row"><span><i style="background:${SOURCE_COLORS[0]}"></i>H II ${(src[0] * 100).toFixed(0)}%</span><span><i style="background:${SOURCE_COLORS[1]}"></i>AGN ${(src[1] * 100).toFixed(0)}%</span><span><i style="background:${SOURCE_COLORS[2]}"></i>diffuse ${(src[2] * 100).toFixed(0)}%</span></div>
      <p class="hint" style="margin-top:8px">L in erg s⁻¹; v, σ in km s⁻¹ (line of sight, + = receding).</p>`;
  }

  function nebPanel(st) {
    const n = st.neb, a = st.agn;
    return `
      <table class="kv">
        <tr class="grp"><td colspan="3">Nebular continuum (H I bf + ff + 2γ, 10⁴ K)</td></tr>
        <tr><td>Share of continuum at 3600 Å</td><td class="n">${fmt(n.f3600 * 100, 1)}%</td><td class="u"></td></tr>
        <tr><td>Share of continuum at 5000 Å</td><td class="n">${fmt(n.f5000 * 100, 1)}%</td><td class="u"></td></tr>
        <tr><td>Balmer jump (3600/3700)</td><td class="n">${fmt(n.jump)}</td><td class="u">in emission</td></tr>
        <tr><td>EW(Hβ)</td><td class="n">${fmt(n.ewHb, 1)}</td><td class="u">Å</td></tr>
        <tr class="grp"><td colspan="3">Active nucleus</td></tr>
        <tr><td>Nucleus in aperture</td><td class="n">${a.inAperture ? "yes" : "no"}</td><td class="u"></td></tr>
        <tr><td>Seen as</td><td class="n">Seyfert ${a.type}</td><td class="u">${fmt(a.angle, 0)}° from axis</td></tr>
        ${a.inAperture ? `<tr><td>AGN share at 5100 Å</td><td class="n">${fmt(a.f5100 * 100, 1)}%</td><td class="u"></td></tr>` : ""}
      </table>
      <p class="hint" style="margin-top:10px">Orientation sets the type: within ${fmt(a.half, 0)}° of the cone axis the accretion disk and broad-line region are seen directly; otherwise the torus hides them and only ≈1.5 % scattered light survives.</p>`;
  }

  q("select").addEventListener("click", openMenu);
  let urlTimer = 0;
  function writeURL() { clearTimeout(urlTimer); urlTimer = setTimeout(() => history.replaceState(null, "", `/explore/?map=${state.field}`), 200); }
  let offStage, offProg;

  return {
    el,
    title: `Explore | ${PROFILE.name}`,
    mount() {
      stage.attach(stageAnchor, hit, { view: VIEWS.inclined, autoRotate: 0 });
      offProg = data.onProgress(p => { const b = q("loading")?.querySelector("b"); if (b) b.style.width = `${p * 100}%`; });
      data.ready.then(() => {
        q("loading")?.remove();
        stage.setField(state.field);
        syncSelect(); updateAgn(); apLabel();
        setTimeout(() => { const r = stage.anchorRect; if (r && !lastPick) pickAt(r.left + r.width / 2, r.top + r.height / 2); }, 1500);
      });
      offStage = stage.on(k => {
        if (k === "camera") { updateAgn(); apLabel(); q("ring").hidden = true; }
        if (k === "field" || k === "range") syncSelect();
      });
      syncSelect();
    },
    unmount() { offStage?.(); offProg?.(); closeMenu(); worker.terminate(); plot.destroy(); stage.clearSight(); },
  };
}
