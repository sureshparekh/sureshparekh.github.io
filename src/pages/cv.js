import { PROFILE } from "../content.js";
import { ICONS } from "../ui/icons.js";
import { stage, stageAnchor } from "../main.js";

const CV_URL = `${import.meta.env.BASE_URL}cv.pdf`;

export function cvPage() {
  const el = document.createElement("div");
  el.className = "page";
  el.innerHTML = `
    <section class="wrap cv-head">
      <h1>Curriculum vitae</h1>
      <div class="cv-actions">
        <a class="btn glass tint" href="${CV_URL}" download="Suresh_Parekh_CV.pdf">Download PDF ${ICONS.download}</a>
        <a class="btn glass" href="${CV_URL}" target="_blank" rel="noopener">Open in new tab ${ICONS.arrow}</a>
      </div>
    </section>
    <section class="wrap cv-pages" data-k="pages" aria-label="CV pages">
      <div class="cv-sheet glass skeleton" aria-hidden="true"></div>
    </section>
    <footer class="wrap footer"><span>© ${new Date().getFullYear()} ${PROFILE.name}</span><span><a href="/">Home</a></span></footer>`;

  const host = el.querySelector('[data-k="pages"]');
  let doc = null, task = null, alive = true, resizeT = 0, ro = null;

  async function renderAll() {
    if (!doc || !alive) return;
    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
    const width = Math.min(host.clientWidth, 880);
    const sheets = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const base = page.getViewport({ scale: 1 });
      const scale = width / base.width;
      const vp = page.getViewport({ scale: scale * dpr });
      const sheet = document.createElement("div");
      sheet.className = "cv-sheet glass";
      sheet.style.aspectRatio = `${base.width} / ${base.height}`;
      const cv = document.createElement("canvas");
      cv.width = Math.round(vp.width); cv.height = Math.round(vp.height);
      cv.setAttribute("role", "img");
      cv.setAttribute("aria-label", `CV page ${n} of ${doc.numPages}`);
      sheet.appendChild(cv);
      await page.render({ canvasContext: cv.getContext("2d"), canvas: cv, viewport: vp, background: "rgba(0,0,0,0)" }).promise;
      const ann = await page.getAnnotations();
      const [vx0, vy0, vx1, vy1] = page.view;
      const vp1 = { width: vx1 - vx0, height: vy1 - vy0 };
      for (const a of ann) {
        if (a.subtype !== "Link" || !a.url) continue;
        const x1 = a.rect[0] - vx0, x2 = a.rect[2] - vx0, y1 = vy1 - a.rect[3], y2 = vy1 - a.rect[1];
        const link = document.createElement("a");
        link.className = "cv-link";
        link.href = a.url; link.target = "_blank"; link.rel = "noopener";
        link.setAttribute("aria-label", a.url);
        Object.assign(link.style, {
          left: `${(Math.min(x1, x2) / vp1.width) * 100}%`, top: `${(Math.min(y1, y2) / vp1.height) * 100}%`,
          width: `${(Math.abs(x2 - x1) / vp1.width) * 100}%`, height: `${(Math.abs(y2 - y1) / vp1.height) * 100}%`,
        });
        sheet.appendChild(link);
      }
      sheets.push(sheet);
      if (!alive) return;
    }
    host.replaceChildren(...sheets);
  }

  async function load() {
    try {
      const [pdfjs, worker] = await Promise.all([
        import("pdfjs-dist"),
        import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
      ]);
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      task = pdfjs.getDocument({ url: new URL(CV_URL, location.href).href });
      doc = await task.promise;
      await renderAll();
      ro = new ResizeObserver(() => { clearTimeout(resizeT); resizeT = setTimeout(renderAll, 250); });
      ro.observe(host);
    } catch (err) {
      host.innerHTML = `<div class="cv-sheet glass cv-error"><p>The PDF viewer could not load here.</p><a class="btn glass tint" href="${CV_URL}" target="_blank" rel="noopener">Open the PDF ${ICONS.arrow}</a></div>`;
      console.error(err);
    }
  }

  return {
    el,
    title: `CV | ${PROFILE.name}`,
    mount() {
      stage.attach(stageAnchor, null, { view: { pos: [-23, -27, 19], target: [0, 0, 1.5] }, autoRotate: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.03 });
      stage.setField("composite");
      stage.clearSight();
      load();
    },
    unmount() { alive = false; ro?.disconnect(); task?.destroy?.(); },
  };
}
