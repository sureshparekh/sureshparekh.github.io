import { RESEARCH, PUBLICATIONS, TIMELINE, LINKS, PROFILE } from "../content.js";
import { ICONS } from "../ui/icons.js";
import { stage, stageAnchor } from "../main.js";

const ext = href => (href.startsWith("http") ? 'target="_blank" rel="noopener"' : "");

export function researchPage() {
  const el = document.createElement("div");
  el.className = "page";
  const ads = LINKS.find(l => l.id === "ads");
  el.innerHTML = `
    <section class="wrap r-hero">
      <div class="label">Research</div>
      <h1>Tools for reading galaxies from their spectra.</h1>
      <p class="lede">${PROFILE.bio[1]}</p>
    </section>
    <section class="wrap section" style="padding-top:40px">
      ${RESEARCH.map(r => `
        <article class="r-item glass" id="${r.id}">
          <div><h2>${r.title}</h2><div class="meta">${r.meta}</div></div>
          <div>
            <p>${r.body}</p>
            <div class="r-links">${r.links.map(l => `<a class="btn glass" href="${l.href}" ${ext(l.href)}>${l.label} ${ICONS.arrow}</a>`).join("")}</div>
          </div>
        </article>`).join("")}
    </section>
    <section class="wrap section" style="padding-top:0">
      <div class="section-head">
        <h2>Papers</h2>
        <a class="btn glass" href="${ads.href}" target="_blank" rel="noopener">Full list on NASA ADS ${ICONS.arrow}</a>
      </div>
      <ul class="pubs glass">
        ${PUBLICATIONS.map(p => `
          <li><div>${p.href ? `<a class="t" href="${p.href}" target="_blank" rel="noopener">${p.title}</a>` : `<span class="t">${p.title}</span>`}<div class="a">${p.authors}</div></div><span class="v">${p.venue}</span></li>`).join("")}
      </ul>
    </section>
    <section class="wrap section" style="padding-top:0">
      <div class="section-head"><h2>Path</h2></div>
      <ul class="tl glass">${TIMELINE.map(t => `<li><span class="w">${t.when}</span><span class="x">${t.what}<span>, ${t.where}</span></span></li>`).join("")}</ul>
    </section>
    <footer class="wrap footer">
      <span>© ${new Date().getFullYear()} ${PROFILE.name}</span>
      <span class="flinks">${LINKS.map(l => `<a href="${l.href}" ${ext(l.href)}>${l.label}</a>`).join("")}</span>
    </footer>`;
  return { el, title: `Research | ${PROFILE.name}`, mount() { stage.attach(stageAnchor, null, { view: { pos: [-30, -26, 20], target: [0, 0, 0] }, autoRotate: 0.03 }); stage.setField("composite"); stage.clearSight(); }, unmount() {} };
}
