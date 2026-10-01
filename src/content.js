export const PROFILE = {
  name: "Suresh Parekh",
  role: "PhD student in astrophysics",
  affiliation: "UFRGS, Porto Alegre, Brazil",
  hero: "Spatially resolved stellar and nebular spectroscopy of a simulated Seyfert galaxy.",
  bio: [
    "I'm a PhD student in astrophysics at UFRGS in Porto Alegre, Brazil, working on active galaxies and the stars around their nuclei.",
    "I'm developing BRAIN, our stellar population fitting code for spectra and IFU datacubes, and I'm building other tools for spectral fitting in the optical and near-infrared.",
    "Before Brazil I worked on radio halos in galaxy clusters, observational cosmology and pulsar timing, at NRAO, GLA University and IUCAA.",
    "Away from the science I just like coding. Most of it ends up as slightly crazy simulations built for fun, and the galaxy at the top of this page is one of them.",
  ],
};

export const LINKS = [
  { id: "email", label: "Email", value: "suresh.parekh@ufrgs.br", href: "mailto:suresh.parekh@ufrgs.br" },
  { id: "github", label: "GitHub", value: "@sureshparekh", href: "https://github.com/sureshparekh" },
  { id: "scholar", label: "Google Scholar", value: "Profile", href: "https://scholar.google.com/citations?user=E2m8pzwAAAAJ&hl=en" },
  { id: "orcid", label: "ORCID", value: "0009-0008-5705-2908", href: "https://orcid.org/0009-0008-5705-2908" },
  { id: "ads", label: "NASA ADS", value: "Publications", href: "https://ui.adsabs.harvard.edu/search/q=orcid%3A%220009-0008-5705-2908%22&sort=date%20desc%2C%20bibcode%20desc&p_=0" },
];

export const RESEARCH = [
  {
    id: "brain",
    kicker: "Stellar populations",
    title: "BRAIN",
    body: "Our stellar population fitting code for spectra and IFU datacubes. It recovers star-formation histories, metallicities, dust and emission-line properties, spaxel by spaxel.",
    meta: "PhD project, UFRGS",
    links: [{ label: "Documentation", href: "https://sureshparekh.github.io/braindoc/" }],
  },
  {
    id: "lrd",
    kicker: "JWST",
    title: "Little Red Dots",
    body: "Spectral fitting of JWST spectra of Little Red Dots with a starburst, a black hole star and an AGN component. The fits suggest an evolutionary sequence from a black hole star to a typical AGN.",
    meta: "Storchi-Bergmann et al., in preparation",
    links: [{ label: "lrd-fitter", href: "https://github.com/sureshparekh/LRD-fitting" }],
  },
  {
    id: "earlier",
    kicker: "Earlier work",
    title: "Radio, X-ray and cosmology",
    body: "Radio halos and relics in galaxy clusters (NRAO), power-law cosmology with OHD, BAO and Pantheon data (GLA University), and Vela pulsar timing and X-ray to radio offsets (IUCAA).",
    meta: "2021 to 2025",
    links: [],
  },
];

export const PUBLICATIONS = [
  { title: "Evolution in the UV-optical spectra of the Little Red Dots", authors: "T. Storchi-Bergmann, R. Riffel, B. L. de Castro Araújo, S. Parekh, et al.", venue: "In preparation", href: null },
  { title: "A power law solution for FLRW Universe with observational constraints", authors: "L. Sharma, S. Parekh, S. Maurya, K. Singh, S. Ray, et al.", venue: "arXiv:2310.18665", href: "https://arxiv.org/abs/2310.18665" },
  { title: "A power law solution for Bianchi-I Universe with observational constraints", authors: "L. Sharma, S. Parekh, S. Ray, A. Yadav, et al.", venue: "arXiv:2402.13596", href: "https://arxiv.org/abs/2402.13596" },
  { title: "Modified power law cosmology: theoretical scenarios and observational constraints", authors: "L. Sharma, S. Parekh, S. Ray, A. Yadav, et al.", venue: "IJGMMP, under review", href: null },
];

export const TIMELINE = [
  { when: "2025-", what: "PhD in Astrophysics", where: "UFRGS, Brazil" },
  { when: "2023-2025", what: "Research assistant, galaxy clusters", where: "NRAO, USA" },
  { when: "2023-2024", what: "Research assistant, cosmology", where: "GLA University, India" },
  { when: "2022-2023", what: "Research assistant, pulsars and X-ray", where: "IUCAA, India" },
  { when: "2021-2023", what: "M.Sc. Physics", where: "Savitribai Phule Pune University" },
  { when: "2018-2021", what: "B.Sc. Physics", where: "St. Xavier's College, Ahmedabad" },
];

export const SITE = {
  url: "https://sureshparekh.github.io",
  image: "https://sureshparekh.github.io/og-spectral.jpg",
};

export const PAGES = {
  "/": {
    title: "Suresh Parekh | Astrophysics, AGN and spectral fitting",
    description: "Suresh Parekh, PhD student in astrophysics at UFRGS. Spectral analysis of active galactic nuclei, the BRAIN stellar population fitting code, and an interactive 3D simulation of a Seyfert galaxy.",
    h1: "Spectral Analysis of an AGN",
  },
  "/explore/": {
    title: "Interactive AGN simulation: 3D Seyfert galaxy with spectra | Suresh Parekh",
    description: "Rotate an N-body simulation of a Seyfert galaxy in 3D, map its stellar ages, metallicity, star formation, H-alpha and [O III] gas, and take an AGN spectrum anywhere you click.",
    h1: "Interactive AGN simulation: a Seyfert galaxy in 3D",
  },
  "/research/": {
    title: "Research: BRAIN stellar population fitting and Little Red Dots | Suresh Parekh",
    description: "Research by Suresh Parekh: BRAIN, a stellar population fitting code for spectra and IFU datacubes, spectral fitting of JWST Little Red Dots, publications and academic background.",
    h1: "Tools for reading galaxies from their spectra",
  },
  "/cv/": {
    title: "CV | Suresh Parekh, PhD student in astrophysics (UFRGS)",
    description: "Curriculum vitae of Suresh Parekh, PhD student in astrophysics at UFRGS, Porto Alegre, Brazil: education, research experience and publications.",
    h1: "Curriculum vitae",
  },
};

export const TOPICS = [
  ["Active galactic nucleus", "https://en.wikipedia.org/wiki/Active_galactic_nucleus"],
  ["Seyfert galaxy", "https://en.wikipedia.org/wiki/Seyfert_galaxy"],
  ["Quasar", "https://en.wikipedia.org/wiki/Quasar"],
  ["Supermassive black hole", "https://en.wikipedia.org/wiki/Supermassive_black_hole"],
  ["N-body simulation", "https://en.wikipedia.org/wiki/N-body_simulation"],
  ["Stellar population synthesis", "https://en.wikipedia.org/wiki/Stellar_population_synthesis"],
  ["Integral field spectroscopy", "https://en.wikipedia.org/wiki/Integral_field_spectrograph"],
  ["Emission line", "https://en.wikipedia.org/wiki/Spectral_line"],
  ["James Webb Space Telescope", "https://en.wikipedia.org/wiki/James_Webb_Space_Telescope"],
];

export const FAQ = [
  ["What is an active galactic nucleus (AGN)?",
    "An AGN is the centre of a galaxy where a supermassive black hole is accreting gas and shines as brightly as, or brighter than, all the stars of its host. Seyfert galaxies and quasars are both AGN; quasars are the most luminous ones."],
  ["What is a Seyfert galaxy?",
    "A Seyfert galaxy is usually a spiral galaxy with a moderately luminous AGN. Its spectrum shows strong high-ionisation emission lines such as [O III] 5007. Type 1 Seyferts also show broad Balmer lines from gas close to the black hole; type 2 Seyferts show only narrow lines."],
  ["Why do Seyfert 1 and Seyfert 2 galaxies look different?",
    "In the unified model they are the same kind of object seen from different angles. Looking down the ionisation cones you see the accretion disk and the broad-line region (type 1); from the side a dusty torus hides them (type 2). In this simulation the type changes as you rotate the galaxy."],
  ["How was this AGN simulation made?",
    "The host galaxy is a particle-mesh N-body simulation of a stellar and gas disk, with gas pressure, a rotating spiral density wave and Kennicutt-Schmidt star formation, evolved for 640 million years. The AGN ionisation cones, the emission lines and the spectra are added on top and computed live in the browser."],
  ["What can I measure in the interactive model?",
    "Thirty projected maps, including stellar age, mass and metallicity, star formation, H-alpha and [O III] emission, gas and stellar velocities, dust and BPT classification, plus a spectrum through any aperture with its stellar populations, emission lines, nebular continuum and AGN light."],
  ["What is BRAIN?",
    "BRAIN is a stellar population fitting code for spectra and IFU datacubes, developed by Suresh Parekh at UFRGS. It recovers star-formation histories, metallicities, dust and emission-line properties."],
  ["Who is Suresh Parekh?",
    "Suresh Parekh is a PhD student in astrophysics at the Universidade Federal do Rio Grande do Sul (UFRGS) in Porto Alegre, Brazil. He works on active galaxies and develops tools for spectral fitting in the optical and near-infrared."],
];
