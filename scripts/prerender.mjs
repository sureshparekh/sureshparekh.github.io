import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { PROFILE, LINKS, RESEARCH, PUBLICATIONS, TIMELINE, PAGES, SITE, TOPICS, FAQ } from "../src/content.js";
import { FIELDS } from "../src/three/fields.js";

const DIST = new URL("../dist/", import.meta.url);
const base = readFileSync(new URL("index.html", DIST), "utf8");
const today = new Date().toISOString().slice(0, 10);
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const href = id => LINKS.find(l => l.id === id).href;
const PROFILES = ["github", "scholar", "orcid", "ads"].map(href);

const person = {
  "@type": "Person", "@id": `${SITE.url}/#person`, name: PROFILE.name, givenName: "Suresh", familyName: "Parekh",
  url: `${SITE.url}/`, image: SITE.image, email: "mailto:suresh.parekh@ufrgs.br", jobTitle: "PhD student in Astrophysics",
  description: PROFILE.bio.slice(0, 2).join(" "),
  affiliation: { "@type": "CollegeOrUniversity", name: "Universidade Federal do Rio Grande do Sul", alternateName: "UFRGS", url: "https://www.ufrgs.br" },
  alumniOf: [{ "@type": "CollegeOrUniversity", name: "Savitribai Phule Pune University" }, { "@type": "CollegeOrUniversity", name: "St. Xavier's College, Ahmedabad" }],
  knowsAbout: TOPICS.map(([name, sameAs]) => ({ "@type": "Thing", name, sameAs })),
  sameAs: PROFILES,
};
const website = { "@type": "WebSite", "@id": `${SITE.url}/#website`, url: `${SITE.url}/`, name: PROFILE.name, inLanguage: "en", publisher: { "@id": person["@id"] } };
const crumbs = (path, name) => ({
  "@type": "BreadcrumbList", "@id": `${SITE.url}${path}#breadcrumb`,
  itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/` }]
    .concat(path === "/" ? [] : [{ "@type": "ListItem", position: 2, name, item: `${SITE.url}${path}` }]),
});
const page = (path, type, extra = {}) => ({
  "@type": type, "@id": `${SITE.url}${path}#webpage`, url: `${SITE.url}${path}`, name: PAGES[path].title,
  description: PAGES[path].description, inLanguage: "en", isPartOf: { "@id": website["@id"] },
  primaryImageOfPage: { "@type": "ImageObject", url: SITE.image, width: 1200, height: 630 },
  breadcrumb: { "@id": `${SITE.url}${path}#breadcrumb` }, dateModified: today, ...extra,
});

const app = {
  "@type": "WebApplication", "@id": `${SITE.url}/explore/#app`, name: PAGES["/explore/"].h1, url: `${SITE.url}/explore/`,
  description: PAGES["/explore/"].description, applicationCategory: "EducationalApplication", operatingSystem: "Any web browser with WebGL 2",
  isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, creator: { "@id": person["@id"] },
  image: SITE.image, about: TOPICS.slice(0, 5).map(([name, sameAs]) => ({ "@type": "Thing", name, sameAs })),
  keywords: "AGN simulation, Seyfert galaxy, quasar, active galactic nucleus, N-body simulation, galaxy simulation, IFU datacube, BPT diagram, emission lines, stellar populations",
};
const faq = { "@type": "FAQPage", "@id": `${SITE.url}/explore/#faq`, mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
const software = [
  { "@type": "SoftwareSourceCode", name: "BRAIN", description: RESEARCH.find(r => r.id === "brain").body, url: "https://sureshparekh.github.io/braindoc/", author: { "@id": person["@id"] }, programmingLanguage: "Python" },
  { "@type": "SoftwareSourceCode", name: "lrd-fitter", description: "Spectral fitting and testing tool for Little Red Dots.", codeRepository: "https://github.com/sureshparekh/LRD-fitting", author: { "@id": person["@id"] }, programmingLanguage: "Python" },
];
const articles = PUBLICATIONS.filter(p => p.href).map(p => ({
  "@type": "ScholarlyArticle", headline: p.title, url: p.href,
  author: p.authors.replace(/,?\s*et al\.?/, "").split(/,\s*/).map(n => (n.includes("Parekh") ? { "@id": person["@id"] } : { "@type": "Person", name: n })),
}));

const GRAPH = {
  "/": [person, website, page("/", "ProfilePage", { mainEntity: { "@id": person["@id"] } }), crumbs("/", "Home")],
  "/explore/": [person, website, page("/explore/", "WebPage", { mainEntity: { "@id": app["@id"] } }), app, faq, crumbs("/explore/", "Explore")],
  "/research/": [person, website, page("/research/", "WebPage", { about: { "@id": person["@id"] } }), ...software, ...articles, crumbs("/research/", "Research")],
  "/cv/": [person, website, page("/cv/", "WebPage", { about: { "@id": person["@id"] } }), crumbs("/cv/", "CV")],
};

const nav = `<nav><a href="/">Home</a> | <a href="/explore/">Interactive AGN simulation</a> | <a href="/research/">Research</a> | <a href="/cv/">CV</a></nav>`;
const contacts = `<ul>${LINKS.map(l => `<li><a href="${esc(l.href)}">${esc(l.label)}</a>: ${esc(l.value)}</li>`).join("")}</ul>`;
const faqHtml = `<h2>Questions about AGN and this simulation</h2>${FAQ.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("")}`;
const groups = [...new Set(FIELDS.map(f => f.group))];
const BODY = {
  "/": `<h1>${esc(PAGES["/"].h1)}</h1><p>${esc(PROFILE.hero)}</p>
    <h2>About Suresh Parekh</h2>${PROFILE.bio.map(p => `<p>${esc(p)}</p>`).join("")}
    <h2>Contact and profiles</h2>${contacts}
    <h2>Where to go next</h2><ul><li><a href="/explore/">Explore the galaxy</a>: an interactive 3D AGN simulation with maps and spectra.</li><li><a href="/research/">Research</a>: BRAIN and spectral fitting of Little Red Dots.</li><li><a href="https://github.com/sureshparekh">Code on GitHub</a>.</li></ul>`,
  "/explore/": `<h1>${esc(PAGES["/explore/"].h1)}</h1><p>${esc(PAGES["/explore/"].description)}</p>
    <p>The model is an N-body simulation of a spiral galaxy hosting an active galactic nucleus (AGN): a Seyfert galaxy with a 10<sup>8</sup> solar-mass black hole, a tilted bicone of AGN-ionised gas, star-forming spiral arms and a bulge. Click anywhere to take a spectrum through an aperture along your line of sight, as with an integral-field (IFU) datacube. Look down the ionisation cones to see it as a Seyfert 1 with broad lines; from the side it appears as a Seyfert 2.</p>
    <h2>Maps</h2>${groups.map(g => `<h3>${esc(g)}</h3><ul>${FIELDS.filter(f => f.group === g).map(f => `<li>${esc(f.label)}</li>`).join("")}</ul>`).join("")}
    ${faqHtml}`,
  "/research/": `<h1>${esc(PAGES["/research/"].h1)}</h1><p>${esc(PROFILE.bio[1])}</p>
    ${RESEARCH.map(r => `<h2>${esc(r.title)}</h2><p>${esc(r.body)}</p><p>${esc(r.meta)}</p>${r.links.map(l => `<p><a href="${esc(l.href)}">${esc(l.label)}</a></p>`).join("")}`).join("")}
    <h2>Publications</h2><ul>${PUBLICATIONS.map(p => `<li>${p.href ? `<a href="${esc(p.href)}">${esc(p.title)}</a>` : esc(p.title)}. ${esc(p.authors)}. ${esc(p.venue)}.</li>`).join("")}</ul>
    <h2>Academic path</h2><ul>${TIMELINE.map(t => `<li>${esc(t.when)}: ${esc(t.what)}, ${esc(t.where)}</li>`).join("")}</ul>`,
  "/cv/": `<h1>${esc(PAGES["/cv/"].h1)}</h1><p>Curriculum vitae of ${esc(PROFILE.name)}, ${esc(PROFILE.role)} at ${esc(PROFILE.affiliation)}.</p>
    <p><a href="/cv.pdf">Download the CV as PDF</a></p>
    <h2>Academic path</h2><ul>${TIMELINE.map(t => `<li>${esc(t.when)}: ${esc(t.what)}, ${esc(t.where)}</li>`).join("")}</ul>`,
};

function render(path, { noindex = false } = {}) {
  const m = PAGES[path], url = `${SITE.url}${path}`;
  let h = base;
  const rep = (re, val) => { if (!re.test(h)) throw new Error(`pattern not found: ${re}`); h = h.replace(re, val); };
  rep(/<title>[^<]*<\/title>/, `<title>${esc(m.title)}</title>`);
  rep(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(m.description)}" />`);
  rep(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);
  rep(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`);
  rep(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(m.title)}" />`);
  rep(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(m.description)}" />`);
  rep(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${esc(m.title)}" />`);
  rep(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${esc(m.description)}" />`);
  if (noindex) rep(/<meta name="robots" content="[^"]*" \/>/, `<meta name="robots" content="noindex" />`);
  const ld = JSON.stringify({ "@context": "https://schema.org", "@graph": GRAPH[path] }).replace(/</g, "\\u003c");
  rep(/<script type="application\/ld\+json" id="ld">\{\}<\/script>/, `<script type="application/ld+json">${ld}</script>`);
  rep(/<main id="view" tabindex="-1"><\/main>/, `<main id="view" tabindex="-1"><div class="ssr">${nav}${BODY[path]}</div></main>`);
  return h;
}

for (const path of Object.keys(PAGES)) {
  const dir = new URL(`.${path}`, DIST);
  mkdirSync(dir, { recursive: true });
  writeFileSync(new URL("index.html", dir), render(path));
}
writeFileSync(new URL("404.html", DIST), render("/", { noindex: true }));

writeFileSync(new URL("sitemap.xml", DIST), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${Object.keys(PAGES).map((p, i) => `  <url><loc>${SITE.url}${p}</loc><lastmod>${today}</lastmod><priority>${[1.0, 0.9, 0.8, 0.6][i]}</priority>${i < 2 ? `<image:image><image:loc>${SITE.image}</image:loc></image:image>` : ""}</url>`).join("\n")}
</urlset>
`);

writeFileSync(new URL("llms.txt", DIST), `# ${PROFILE.name}

> ${PROFILE.name} is a ${PROFILE.role} at the Universidade Federal do Rio Grande do Sul (UFRGS) in Porto Alegre, Brazil. He works on active galactic nuclei (AGN) and develops BRAIN, a stellar population fitting code for spectra and IFU datacubes. His website hosts an interactive 3D AGN simulation: an N-body model of a Seyfert galaxy you can rotate, map and take spectra of.

## Pages

- [Home](${SITE.url}/): ${PAGES["/"].description}
- [Interactive AGN simulation](${SITE.url}/explore/): ${PAGES["/explore/"].description}
- [Research](${SITE.url}/research/): ${PAGES["/research/"].description}
- [CV](${SITE.url}/cv/): ${PAGES["/cv/"].description}

## About

${PROFILE.bio.map(p => `- ${p}`).join("\n")}

## Research

${RESEARCH.map(r => `- ${r.title}: ${r.body}`).join("\n")}

## The interactive AGN simulation

- What it is: a particle-mesh N-body simulation of a stellar and gas disk (bulge, dark-matter halo and a 10^8 solar-mass black hole), evolved for 640 Myr with gas pressure, a spiral density wave and Kennicutt-Schmidt star formation, plus an AGN ionisation bicone and emission lines.
- What you can do: rotate it in 3D, switch between ${FIELDS.length} maps (stellar age, metallicity, mass, star formation, H-alpha, [O III], [N II], velocities, dust, BPT class), and click anywhere for an aperture spectrum with stellar populations, emission lines, nebular continuum and AGN light.
- Seyfert 1 or 2: the AGN type follows the viewing angle, as in the unified model.

## Frequently asked questions

${FAQ.map(([q, a]) => `### ${q}\n\n${a}`).join("\n\n")}

## Profiles

${LINKS.map(l => `- ${l.label}: ${l.href}`).join("\n")}
`);

console.log(`prerendered ${Object.keys(PAGES).length} pages + 404, sitemap.xml, llms.txt (${today})`);
