import { PROFILE, LINKS } from "../content.js";
import { ICONS } from "../ui/icons.js";
import { stage, data, stageAnchor } from "../main.js";

export const HOME_VIEW = { pos: [-25, -21, 18.5], target: [0, 0, 3.2] };

export function homePage() {
  const el = document.createElement("div");
  el.className = "page";
  el.innerHTML = `
    <section class="hero">
      <div class="hero-grid"></div>
      <div class="hero-scrim"></div>
      <div class="home-title">
        <div class="kicker">${PROFILE.name}</div>
        <h1>Spectral Analysis <span class="l2">of an AGN</span></h1>
        <p class="hero-sub">${PROFILE.hero}</p>
        <a class="btn glass tint" href="/explore/">Explore ${ICONS.right}</a>
        <div class="loading inline glass" data-k="loading"><span>Loading simulation</span><i><b></b></i></div>
      </div>
    </section>

    <section class="wrap section" id="about">
      <h2>About</h2>
      <div class="about">
        <div class="about-text">
          ${PROFILE.bio.map(p => `<p>${p}</p>`).join("")}
        </div>
        <div class="contacts glass">
          ${LINKS.map(l => `
            <a class="contact" href="${l.href}" ${l.href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>
              ${ICONS[l.id]}<span class="k">${l.label}</span><span class="v">${l.value}</span>
            </a>`).join("")}
        </div>
      </div>
    </section>

    <section class="wrap section" style="padding-top:0">
      <h2 style="margin-bottom:26px">Where to go next</h2>
      <div class="cards">
        <a class="card glass" href="/explore/">
          <span class="arrow">${ICONS.arrow}</span>
          <h3>Explore the galaxy</h3>
          <p>Orbit the model, switch between 30 maps of stars and gas, and click anywhere for a spectrum.</p>
          <div class="glow" style="background:var(--orange)"></div>
        </a>
        <a class="card glass" href="/research/">
          <span class="arrow">${ICONS.arrow}</span>
          <h3>Research</h3>
          <p>BRAIN, our stellar population fitting code, and spectral fitting of Little Red Dots.</p>
          <div class="glow" style="background:var(--blue)"></div>
        </a>
        <a class="card glass" href="https://github.com/sureshparekh" target="_blank" rel="noopener">
          <span class="arrow">${ICONS.arrow}</span>
          <h3>Code</h3>
          <p>lrd-fitter, BRAIN documentation and teaching material on GitHub.</p>
          <div class="glow" style="background:var(--red)"></div>
        </a>
      </div>
    </section>
    <footer class="wrap footer">
      <span>© ${new Date().getFullYear()} ${PROFILE.name}</span>
      <span>The galaxy is an N-body simulation. <a href="/explore/">Explore it</a></span>
    </footer>`;

  const q = k => el.querySelector(`[data-k="${k}"]`);
  let off;
  return {
    el,
    title: `${PROFILE.name} | Astrophysicist`,
    mount() {
      stage.attach(stageAnchor, null, { view: HOME_VIEW, autoRotate: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.045 });
      stage.setField("composite");
      stage.clearSight();
      off = data.onProgress(p => { const b = q("loading")?.querySelector("b"); if (b) b.style.width = `${p * 100}%`; });
      data.ready.then(() => q("loading")?.classList.add("done"));
    },
    unmount() { off?.(); },
  };
}
