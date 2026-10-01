import "./styles.css";
import { Stage3D } from "./three/stage3d.js";
import { loadGalaxy, fieldRanges } from "./three/galaxy-data.js";
import { FIELDS } from "./three/fields.js";
import { homePage } from "./pages/home.js";
import { explorePage } from "./pages/explore.js";
import { researchPage } from "./pages/research.js";
import { cvPage } from "./pages/cv.js";
import { PAGES, SITE } from "./content.js";

const ROUTES = [
  { path: "/", label: "Home", page: homePage },
  { path: "/explore/", label: "Explore", page: explorePage },
  { path: "/research/", label: "Research", page: researchPage },
  { path: "/cv/", label: "CV", page: cvPage },
];

export const stage = new Stage3D(document.getElementById("stage"));
let progress = 0;
const progressSubs = new Set();
export const data = {
  ready: loadGalaxy(`${import.meta.env.BASE_URL}data/galaxy`, p => { progress = p; progressSubs.forEach(f => f(p)); }).then(gal => {
    const ranges = fieldRanges(gal, FIELDS);
    stage.setData(gal, ranges);
    return gal;
  }),
  onProgress(f) { progressSubs.add(f); f(progress); return () => progressSubs.delete(f); },
};

const nav = document.querySelector(".nav");
nav.insertAdjacentHTML("beforeend", ROUTES.map(r => `<a href="${r.path}" data-path="${r.path}">${r.label}</a>`).join(""));
const lens = nav.querySelector(".lens");
function moveLens(path) {
  const a = nav.querySelector(`a[data-path="${path}"]`);
  nav.querySelectorAll("a[data-path]").forEach(x => x.classList.toggle("active", x === a));
  if (!a) return;
  lens.style.width = `${a.offsetWidth}px`;
  lens.style.transform = `translateX(${a.offsetLeft}px)`;
}
addEventListener("resize", () => moveLens(currentPath));

const view = document.getElementById("view");
let current = null, currentPath = null;
if (location.hash.startsWith("#/")) {
  const [hp, hq] = location.hash.slice(1).split("?");
  const p = hp === "/" ? "/" : `${hp.replace(/\/+$/, "")}/`;
  history.replaceState(null, "", p + (hq ? `?${hq}` : ""));
}
function routeOf(pathname) {
  const p = pathname === "/" ? "/" : `${pathname.replace(/\/+$/, "")}/`;
  return ROUTES.find(r => r.path === p);
}
function parse() {
  const r = routeOf(location.pathname);
  return { path: r ? r.path : "/", params: new URLSearchParams(location.search) };
}
function setMeta(path) {
  const m = PAGES[path];
  if (!m) return;
  document.title = m.title;
  const set = (sel, attr, val) => { const el = document.head.querySelector(sel); if (el) el.setAttribute(attr, val); };
  set('meta[name="description"]', "content", m.description);
  set('link[rel="canonical"]', "href", SITE.url + path);
  set('meta[property="og:url"]', "content", SITE.url + path);
  set('meta[property="og:title"]', "content", m.title);
  set('meta[property="og:description"]', "content", m.description);
}
document.addEventListener("click", e => {
  const a = e.target.closest("a[href]");
  if (!a || a.target || a.hasAttribute("download") || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const u = new URL(a.href, location.href);
  if (u.origin !== location.origin || !routeOf(u.pathname) || u.hash) return;
  e.preventDefault();
  if (u.pathname + u.search !== location.pathname + location.search) history.pushState(null, "", u.pathname + u.search);
  go();
});
async function go() {
  const { path, params } = parse();
  if (path === currentPath && current) return;
  moveLens(path);
  if (current) {
    const old = current;
    old.el.classList.add("leaving");
    old.unmount();
    await new Promise(r => setTimeout(r, 240));
    old.el.remove();
  }
  currentPath = path;
  current = ROUTES.find(r => r.path === path).page(params);
  view.appendChild(current.el);
  setMeta(path);
  window.scrollTo({ top: 0 });
  current.mount();
  backdrop();
  view.focus({ preventScroll: true });
}
addEventListener("popstate", go);

const canvas = document.getElementById("stage");
let scrollT = 0;
function backdrop() {
  const hero = view.querySelector(".hero");
  const o = hero ? 1 - 0.74 * smooth(0.12, 0.85, scrollY / hero.offsetHeight) : currentPath === "/cv/" ? 0.55 : 0.26;
  canvas.style.setProperty("--stage-o", o.toFixed(3));
}
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
addEventListener("scroll", () => {
  canvas.classList.add("scrolling");
  clearTimeout(scrollT); scrollT = setTimeout(() => canvas.classList.remove("scrolling"), 150);
  backdrop();
}, { passive: true });
export const stageAnchor = document.getElementById("stage-anchor");

export { backdrop };
document.fonts?.ready.then(() => moveLens(currentPath));
view.querySelector(".ssr")?.remove();
go();
