const sc = s => `<span class="sc">${s}</span>`;
const it = s => `<i>${s}</i>`;
const fQ = `${it("f")}(${it("Q")})`, fRT = `${it("f")}(${it("R")},${it("T")})`;

export const CV = {
  name: "Suresh Parekh",
  role: "PhD candidate in Astrophysics, Universidade Federal do Rio Grande do Sul, Porto Alegre, Brazil",
  contacts: [
    { icon: "email", label: "suresh.parekh@ufrgs.br", href: "mailto:suresh.parekh@ufrgs.br" },
    { icon: "link", label: "sureshparekh.github.io", href: "https://sureshparekh.github.io" },
    { icon: "github", label: "GitHub", href: "https://github.com/sureshparekh" },
    { icon: "orcid", label: "ORCID", href: "https://orcid.org/0009-0008-5705-2908" },
    { icon: "scholar", label: "Google Scholar", href: "https://scholar.google.com/citations?user=E2m8pzwAAAAJ&hl=en" },
    { icon: "ads", label: "NASA ADS", href: "https://ui.adsabs.harvard.edu/search/q=orcid%3A%220009-0008-5705-2908%22&sort=date%20desc%2C%20bibcode%20desc&p_=0" },
  ],
  sections: [
    {
      title: "Education",
      entries: [
        { title: "Universidade Federal do Rio Grande do Sul (UFRGS)", date: "Mar. 2025 – Present", sub: "PhD in Physics (Astrophysics)", place: "Porto Alegre, Brazil",
          points: [`Thesis: ${it("Unveiling the role of AGN in galaxy evolution")}. Supervisors: Prof. Rogério Riffel and Prof. Rafael S. de Souza`] },
        { title: "Savitribai Phule Pune University", date: "Aug. 2021 – May 2023", sub: "Master of Science in Physics", place: "Pune, India",
          points: ["Thesis: Bayesian analysis pipeline with LIRA for X-ray to radio offset detection in quasars with Chandra data (CIAO, Sherpa, MARX, Python, R). Supervisor: Dr. Vaidehi Paliya (IUCAA)"] },
        { title: "St. Xavier's College", date: "May 2018 – May 2021", sub: "Bachelor of Science in Physics", place: "Ahmedabad, India",
          points: ["Thesis: Solar cell materials and doping, improving efficiency by 5–8%. Supervisor: Dr. Sanjeev Gupta"] },
      ],
    },
    {
      title: "PhD Research Projects",
      entries: [
        { title: `${sc("brain")}: full spectral fitting of spectra and IFU datacubes`, date: "2025 – Present", sub: "Lead | Parekh et al. 2027a,b, in prep.", place: "UFRGS",
          points: [`Python/JAX code for CPUs and GPUs fitting stellar populations, dust, kinematics, emission lines, nebular continuum and AGN; reproduces ${sc("starlight")} on JWST cubes`] },
        { title: "Near-infrared stellar population models with extragalactic globular clusters", date: "2025 – Present", sub: "First author, LIBERTY collaboration | Parekh et al., MNRAS, under review", place: "UFRGS",
          points: ["Full spectral fitting of SOAR/TripleSpec4 spectra of 31 globular clusters in Centaurus A with six SSP libraries (E-MILES, M13, BC03, C09, XSL, pyPopStar), cross-validated with optical indices; ages differ by 3–5 Gyr between libraries"] },
        { title: "Evolution of the Little Red Dots with JWST/NIRSpec PRISM spectroscopy", date: "2025 – 2026", sub: "Co-author | Storchi-Bergmann et al., ApJ, under review", place: "UFRGS",
          points: ["Multi-component spectral synthesis (starburst, Black Hole Star, AGN) of stacked spectra of 78 Little Red Dots with four SSP libraries, supporting an evolutionary sequence"] },
        { title: "Blowing Star Formation Away in AGN Hosts (BAH) with JWST/NIRSpec IFU", date: "2025 – Present", sub: "Co-author of Paper V, leading the follow-up study | Riffel et al. 2026, ApJ, 1005, 168", place: "UFRGS",
          points: [`${sc("starlight")} fits of NIRSpec IFU cubes of three nearby AGN with M13, XSL and FSPS models: recent circumnuclear star formation and central drops in stellar metallicity`] },
      ],
    },
    {
      title: "Observing Experience",
      entries: [
        { title: "SOAR 4.1 m Telescope, Cerro Pachón, Chile", date: "2025 – Present", sub: "200+ hours | TripleSpec4.1 (near-infrared) and Goodman High Throughput Spectrograph (optical)", place: "Remote",
          points: ["PI of SO2026A-024 and SO2026A-034; Co-I of SO2025B-016, SO2026A-031, etc.; spectroscopy of globular clusters and early-type galaxies"] },
      ],
    },
    {
      title: "Previous Research Experience",
      entries: [
        { title: "GLA University & United College of Engineering and Research", date: "May 2023 – Present", sub: "Research collaborator | Prof. Anil Kumar Yadav, Prof. Saibal Ray, Dr. Lokesh Kumar Sharma", place: "India (remote)",
          points: [`Cosmological parameter estimation in modified gravity with Bayesian MCMC, neural networks and likelihood-free inference on ${it("H")}(${it("z")}), BAO and Pantheon data; 13 refereed publications`] },
        { title: "National Radio Astronomy Observatory (NRAO)", date: "May 2023 – July 2024", sub: "Research intern | Dr. Viral Parekh", place: "USA (remote)",
          points: ["Radio and X-ray analysis of halos, relics and extended emission in MeerKAT (MGCLS) galaxy clusters with CASA, CIAO and Aladin"] },
        { title: "Inter-University Centre for Astronomy and Astrophysics (IUCAA)", date: "Sept. 2022 – Nov. 2023", sub: "Research intern | Vela pulsar timing with the Ooty Radio Telescope, Prof. Avinash Deshpande", place: "Pune, India", points: [] },
      ],
    },
    {
      title: "Leadership and Achievements",
      list: [
        "NASA Citizen Scientist, discovery of asteroid 2020 HS24, 2020",
        "Gold Medal for Bachelor's thesis research, 2021",
        "Winner, NCICP computational physics competition, 2019",
        "Founder and Lead, Astronomica astronomy club, 2019–2021",
        "Co-founder and Editor, Infinoscope STEM magazine, 2019–2022",
        "Talks on Indian space missions on TV news channels",
      ],
    },
  ],
  publications: [
    {
      group: "Under review",
      items: [
        { a: "@, Riffel, R., Chies Santos, A. L., de Souza, R. S., et al.", t: "Extragalactic globular cluster near-infrared spectroscopy: III. Stellar population synthesis models through the GC system of NGC 5128", v: "Monthly Notices of the Royal Astronomical Society", r: "under review" },
        { a: "Storchi-Bergmann, T., Riffel, R., de Castro Araújo, B. L., @, et al.", t: "Evolution in the UV-optical spectra of the Little Red Dots", v: "The Astrophysical Journal", r: "under review" },
      ],
    },
    {
      group: "In preparation",
      items: [
        { a: "@, Riffel, R., de Souza, R. S., et al.", y: "2027a", t: `${sc("brain")}: a GPU-accelerated framework for full spectral fitting of spectra and integral field datacubes`, h: "https://sureshparekh.github.io/braindoc/" },
        { a: "@, Riffel, R., de Souza, R. S., et al.", y: "2027b", t: `Benchmarking full spectral fitting: ${sc("brain")} against established stellar population synthesis codes` },
      ],
    },
    {
      group: "Peer-reviewed journal articles",
      items: [
        { a: "Riffel, R., Riffel, R. A., Souza-Oliveira, G. L., Zakamska, N. L., Storchi-Bergmann, T., Bianchin, M., Nery Marinho, L., Jaison, S., @, et al.", y: "2026", t: "Blowing Star Formation Away in Active Galactic Nucleus Hosts. V. The Feeding–Feedback Cycle in Local Active Galactic Nuclei as Revealed by their Stellar Populations", h: "https://doi.org/10.3847/1538-4357/ae7bf5", v: "The Astrophysical Journal", r: "1005, 168" },
        { a: "Sharma, L. K., & @", y: "2026", t: `Perturbation-level predictions of power-law ${fQ} gravity from simulation-based inference`, h: "https://doi.org/10.1142/S0217732326502603", v: "Modern Physics Letters A", r: "in press" },
        { a: "Sharma, L. K., Yadav, A. K., @, Vashistha, P., Sharma, M., & Gupta, L.", y: "2026", t: `Constraining Bianchi type-I universe in ${fQ} gravity by Bayesian and deep learning methods`, h: "https://doi.org/10.1142/S0219887825503104", v: "International Journal of Geometric Methods in Modern Physics", r: "23(13), 2550310" },
        { a: "Sharma, L. K., Yadav, A. K., @, & Shrivastava, P.", y: "2026", t: `Constraining Bianchi type-I cosmology in ${fRT} gravity with observational data: a Bayesian and ANN-based approach`, h: "https://doi.org/10.1142/S0219887826503251", v: "International Journal of Geometric Methods in Modern Physics", r: "2650325" },
        { a: "Sharma, L. K., @, Al-Essa, L. A., & Zotos, E. E.", y: "2026", t: `Bayesian vs deep learning: parameter constraints for an anisotropic universe in ${fQ} gravity`, h: "https://doi.org/10.1016/j.aop.2026.170632", v: "Annals of Physics", r: "494, 170632" },
        { a: "Singh, B. K., Sharma, L. K., & @", y: "2026", t: "Deep learning and Bayesian parameter inference for Kaniadakis holographic dark energy models", h: "https://doi.org/10.1016/j.ascom.2026.101120", v: "Astronomy and Computing", r: "56, 101120" },
        { a: "Sharma, L. K., Yadav, A. K., @, Ahmad, N., & Alshehri, A. M.", y: "2025", t: `Framework for estimating cosmological parameters using observational cosmology and artificial neural networks in ${fRT} gravity`, h: "https://doi.org/10.1002/prop.70032", v: "Fortschritte der Physik", r: "73(11), e70032" },
        { a: "Sharma, L. K., @, & Yadav, A. K.", y: "2025", t: `Observational constraints using Bayesian statistics and deep learning in ${fQ} gravity`, h: "https://doi.org/10.1016/j.nuclphysb.2025.117007", v: "Nuclear Physics B", r: "1018, 117007" },
        { a: "Sharma, L. K., @, Yadav, A. K., & Shrivastava, P.", y: "2025", t: "Constraining cosmological parameters using Bayesian MCMC method and artificial neural networks in modified theory of gravity", h: "https://doi.org/10.1007/s12648-025-03590-4", v: "Indian Journal of Physics", r: "99(10), 3989–4001" },
        { a: "Sharma, L. K., @, Ray, S., Yadav, A. K., Khlopov, M., & Mehta, K. C. K.", y: "2025", t: "Modified power law cosmology: theoretical scenarios and observational constraints", h: "https://doi.org/10.1088/1674-1137/adaa57", v: "Chinese Physics C", r: "49(4), 045102" },
        { a: "Shekh, S. H., Sohail, H., Mahmood, I., Ditta, A., Yadav, A. K., & @", y: "2025", t: `Models of ${fQ} gravity with electromagnetic field`, h: "https://doi.org/10.1134/S0202289324700543", v: "Gravitation and Cosmology", r: "31(1), 113–124" },
        { a: "Sharma, L. K., @, Ray, S., & Yadav, A. K.", y: "2024", t: `Constraining anisotropic universe under ${fRT} theory of gravity`, h: "https://doi.org/10.1016/j.jheap.2024.11.001", v: "Journal of High Energy Astrophysics", r: "44, 457–467" },
        { a: "Sharma, L. K., @, Maurya, S., Singh, K., Ray, S., Mehta, K. C. K., & Trivedi, V.", y: "2024", t: "A power law solution for FLRW universe with observational constraints", h: "https://doi.org/10.1142/S0217732324501852", v: "Modern Physics Letters A", r: "39(38), 2450185" },
        { a: "Sharma, L. K., @, Yadav, A. K., & Goyal, N.", y: "2024", t: `A comprehensive analysis of observational cosmology in ${fQ} gravity with deep learning and MCMC method`, h: "https://doi.org/10.1016/j.ascom.2024.100892", v: "Astronomy and Computing", r: "49, 100892" },
      ],
    },
    {
      group: "Conference proceedings and abstracts",
      items: [
        { a: "@", y: "2025", t: "Extragalactic globular cluster near-infrared spectroscopy: full spectral fitting of Centaurus A (NGC 5128)", h: "http://hdl.handle.net/10183/309468", v: "Salão UFRGS 2025: I Salão da Pós-Graduação", r: "Porto Alegre, Brazil" },
        { a: "Trivedi, V., & @", y: "2022", t: "Overcoming the hurdles in imparting astronomy education in schools", h: "https://owncloud.gwdg.de/index.php/s/RQjMBL5XIonrxSl#page=90", v: "Proceedings of the 4th Shaw-IAU Workshop on Astronomy for Education" },
        { a: "@", y: "2021", t: "Innovative computational experiment on projectile motion", h: "https://books.google.co.in/books?id=zqE5EAAAQBAJ&pg=PA110", v: "I do and I understand: Experiments and Demonstrations in Physics and Computational Physics", r: "IAPT" },
      ],
    },
  ],
};

const amp = s => s.replace(/&(?![a-z#0-9]+;)/gi, "&amp;");

export function pubHTML(p, icon = "") {
  const authors = amp(p.a).replace("@", `<b class="me">Parekh, S.</b>`);
  const title = p.h ? `<a href="${amp(p.h)}" target="_blank" rel="noopener">${p.t}${icon}</a>` : p.t;
  const lead = `${authors}${p.y ? ` ${p.y}` : ""}`;
  const venue = [p.v && `<i>${p.v}</i>`, p.r].filter(Boolean).join(", ");
  return `${lead}${lead.endsWith(".") ? "" : "."} ${title}.${venue ? ` ${venue}.` : ""}`;
}

export function cvHTML({ icons = {}, ext = "" } = {}) {
  const ic = k => icons[k] || "";
  const head = `<header class="cv-top">
      <h2 class="cv-name">${CV.name}</h2>
      <p class="cv-role">${CV.role}</p>
      <ul class="cv-contacts">${CV.contacts.map(c => `<li><a href="${amp(c.href)}"${c.href.startsWith("mailto:") ? "" : ` target="_blank" rel="noopener"`}>${ic(c.icon)}<span>${c.label}</span></a></li>`).join("")}</ul>
    </header>`;
  const sections = CV.sections.map(s => `<section class="cv-sec"><h3 class="cv-h">${s.title}</h3>${s.entries ? s.entries.map(e => `<article class="cv-entry">
        <div class="cv-row"><span class="cv-title">${amp(e.title)}</span><span class="cv-date">${e.date}</span></div>
        <div class="cv-row sub"><span class="cv-sub">${amp(e.sub)}</span><span class="cv-place">${e.place}</span></div>
        ${e.points.length ? `<ul class="cv-points">${e.points.map(p => `<li>${amp(p)}</li>`).join("")}</ul>` : ""}
      </article>`).join("") : `<ul class="cv-points cols">${s.list.map(l => `<li>${amp(l)}</li>`).join("")}</ul>`}</section>`).join("");
  let n = 0;
  const pubs = `<section class="cv-sec"><h3 class="cv-h">Publications</h3>${CV.publications.map(g => `<h4 class="cv-g">${g.group}</h4><ol class="cv-pubs" start="${n + 1}">${g.items.map(p => `<li data-n="${++n}">${pubHTML(p, ext)}</li>`).join("")}</ol>`).join("")}</section>`;
  return { main: head + sections, pubs };
}
