// Background galaxy: the same Stage3D, data and "true colour" field as the home
// page. The talk timeline tweens window.GAL; this loop maps it onto the stage:
// alpha -> canvas opacity, zoom -> camera distance, ox/oy -> screen offset
// (done with a camera view offset, so the canvas never moves and nothing is clipped).
import { Stage3D } from "../../src/three/stage3d.js";
import { loadGalaxy, fieldRanges } from "../../src/three/galaxy-data.js";
import { FIELDS } from "../../src/three/fields.js";

// Same framing as HOME_VIEW in src/pages/home.js (not imported: that module boots the site).
const VIEW = { pos: [-25, -21, 18.5], target: [0, 0, 3.2] };
const D0 = Math.hypot(VIEW.pos[0] - VIEW.target[0], VIEW.pos[1] - VIEW.target[1], VIEW.pos[2] - VIEW.target[2]);

const G = (window.GAL = { alpha: 0, zoom: 0.55, ox: 0, oy: 0 });

// The talk waits on this before it starts, so the entrance never plays over an empty sky.
let ready;
window.GAL_READY = new Promise((r) => (ready = r));
const settle = (ms) => new Promise((r) => setTimeout(r, ms));

if (new URLSearchParams(location.search).has("presenter")) ready();
else {
  const canvas = document.getElementById("galaxy");
  const anchor = document.getElementById("gal-anchor");
  const stage = new Stage3D(canvas);
  const bar = document.querySelector("#loader b"), pct = document.querySelector("#loader em");
  const progress = (p) => { bar.style.width = `${(p * 100).toFixed(1)}%`; pct.textContent = `${Math.round(p * 100)}%`; };
  loadGalaxy("/data/galaxy", progress)
    .then(async (gal) => {
      progress(1);
      stage.setData(gal, fieldRanges(gal, FIELDS));
      stage.setField("composite");
      stage.attach(anchor, null, { view: VIEW, ms: 0, autoRotate: 0.045 });
      await settle(600); // let Stage3D's auto-exposure run before the first fade-in
    })
    .catch((e) => console.error("galaxy failed to load; starting without it", e))
    .finally(ready);

  let lastView = "";
  const tick = () => {
    requestAnimationFrame(tick);
    canvas.style.opacity = G.alpha.toFixed(3);
    const sz = stage.size;
    if (sz) {
      const key = `${sz.w}|${sz.h}|${G.ox.toFixed(4)}|${G.oy.toFixed(4)}`;
      if (key !== lastView) {
        stage.camera.setViewOffset(sz.w, sz.h, (-G.ox * sz.w) / 2, (G.oy * sz.h) / 2, sz.w, sz.h);
        stage.dirty = true;
        lastView = key;
      }
    }
    if (!stage.target || stage.tween) return;
    const off = stage.camera.position.clone().sub(stage.target);
    const d = D0 / G.zoom;
    if (Math.abs(off.length() - d) > 1e-3) {
      off.setLength(d);
      stage._setCam(stage.target.clone().add(off), stage.target);
    }
  };
  requestAnimationFrame(tick);
}
