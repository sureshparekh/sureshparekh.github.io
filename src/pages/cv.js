import { PROFILE } from "../content.js";
import { ICONS } from "../ui/icons.js";
import { stage, stageAnchor } from "../main.js";
import { cvHTML } from "../cv-data.js";

const CV_URL = `${import.meta.env.BASE_URL}cv.pdf`;

export function cvPage() {
  const el = document.createElement("div");
  el.className = "page";
  const { main, pubs } = cvHTML({ icons: ICONS, ext: `<span class="ext" aria-hidden="true">${ICONS.arrow}</span>` });
  el.innerHTML = `
    <section class="wrap cv-head">
      <h1>Curriculum vitae</h1>
      <div class="cv-actions">
        <a class="btn glass tint" href="${CV_URL}" download="Suresh_Parekh_CV.pdf">Download PDF ${ICONS.download}</a>
        <a class="btn glass" href="${CV_URL}" target="_blank" rel="noopener">Open in new tab ${ICONS.arrow}</a>
      </div>
    </section>
    <section class="wrap cv-pages" aria-label="Curriculum vitae">
      <div class="cv-doc">${main}</div>
      <div class="cv-doc">${pubs}</div>
    </section>
    <footer class="wrap footer"><span>© ${new Date().getFullYear()} ${PROFILE.name}</span><span><a href="/">Home</a></span></footer>`;

  return {
    el,
    title: `CV | ${PROFILE.name}`,
    mount() {
      stage.attach(stageAnchor, null, { view: { pos: [-23, -27, 19], target: [0, 0, 1.5] }, autoRotate: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.03 });
      stage.setField("composite");
      stage.clearSight();
    },
    unmount() {},
  };
}
