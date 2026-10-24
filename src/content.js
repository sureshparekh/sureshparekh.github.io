export const PROFILE = {
  name: "Suresh Parekh",
  role: "PhD candidate in astrophysics",
  affiliation: "UFRGS, Porto Alegre, Brazil",
  hero: "Spatially resolved stellar and nebular spectroscopy of a simulated Seyfert galaxy.",
  bio: [
    "I'm a PhD candidate in astrophysics at UFRGS in Porto Alegre, Brazil, working on active galaxies and the stars around their nuclei.",
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
    body: "Multi-component spectral synthesis of stacked JWST/NIRSpec PRISM spectra of 78 Little Red Dots, with a starburst, a black hole star and an AGN component and four stellar population libraries. The fits support an evolutionary sequence from a black hole star to a typical AGN.",
    meta: "Storchi-Bergmann et al., ApJ, under review",
    links: [{ label: "lrd-fitter", href: "https://github.com/sureshparekh/LRD-fitting" }],
  },
  {
    id: "globular-clusters",
    kicker: "Near-infrared",
    title: "Globular clusters in the near-infrared",
    body: "Full spectral fitting of SOAR/TripleSpec4 spectra of 31 globular clusters in Centaurus A with six stellar population libraries, cross-validated with optical indices. The ages differ by 3 to 5 Gyr between libraries, a direct test of near-infrared stellar population models.",
    meta: "First author, LIBERTY collaboration. Parekh et al., MNRAS, under review",
    links: [],
  },
  {
    id: "bah",
    kicker: "JWST IFU",
    title: "Blowing Star Formation Away in AGN Hosts",
    body: "Stellar population fits of JWST/NIRSpec IFU datacubes of nearby AGN, revealing recent circumnuclear star formation and central drops in stellar metallicity. I am a co-author of Paper V and lead the follow-up study.",
    meta: "Riffel et al. 2026, ApJ, 1005, 168",
    links: [{ label: "Paper V", href: "https://doi.org/10.3847/1538-4357/ae7bf5" }],
  },
  {
    id: "earlier",
    kicker: "Earlier work",
    title: "Radio, X-ray and cosmology",
    body: "Radio halos and relics in galaxy clusters (NRAO), cosmology in modified gravity with Bayesian MCMC, neural networks and simulation-based inference on H(z), BAO and Pantheon data (GLA University, 13 refereed papers), Vela pulsar timing (IUCAA) and X-ray to radio offsets in quasars with Chandra (M.Sc. thesis).",
    meta: "2021 to present",
    links: [],
  },
];

export const PUBLICATIONS = [
  { title: "Extragalactic globular cluster near-infrared spectroscopy: III. Stellar population synthesis models through the GC system of NGC 5128", authors: "S. Parekh, R. Riffel, A. L. Chies Santos, R. S. de Souza, et al.", venue: "MNRAS, under review", href: null },
  { title: "Evolution in the UV-optical spectra of the Little Red Dots", authors: "T. Storchi-Bergmann, R. Riffel, B. L. de Castro Araújo, S. Parekh, et al.", venue: "ApJ, under review", href: null },
  { title: "BRAIN: a GPU-accelerated framework for full spectral fitting of spectra and integral field datacubes", authors: "S. Parekh, R. Riffel, R. S. de Souza, et al.", venue: "In preparation", href: "https://sureshparekh.github.io/braindoc/" },
  { title: "Blowing Star Formation Away in AGN Hosts. V. The Feeding-Feedback Cycle in Local AGN as Revealed by their Stellar Populations", authors: "R. Riffel, R. A. Riffel, G. L. Souza-Oliveira, N. L. Zakamska, T. Storchi-Bergmann, et al., incl. S. Parekh", venue: "ApJ 1005, 168 (2026)", href: "https://doi.org/10.3847/1538-4357/ae7bf5" },
  { title: "Perturbation-level predictions of power-law f(Q) gravity from simulation-based inference", authors: "L. K. Sharma, S. Parekh", venue: "MPLA, in press (2026)", href: "https://doi.org/10.1142/S0217732326502603" },
  { title: "Bayesian vs deep learning: parameter constraints for an anisotropic universe in f(Q) gravity", authors: "L. K. Sharma, S. Parekh, L. A. Al-Essa, E. E. Zotos", venue: "Annals of Physics 494, 170632 (2026)", href: "https://doi.org/10.1016/j.aop.2026.170632" },
  { title: "Modified power law cosmology: theoretical scenarios and observational constraints", authors: "L. K. Sharma, S. Parekh, S. Ray, A. K. Yadav, M. Khlopov, K. C. K. Mehta", venue: "Chinese Physics C 49, 045102 (2025)", href: "https://doi.org/10.1088/1674-1137/adaa57" },
  { title: "A power law solution for FLRW universe with observational constraints", authors: "L. K. Sharma, S. Parekh, S. Maurya, K. Singh, S. Ray, et al.", venue: "MPLA 39, 2450185 (2024)", href: "https://doi.org/10.1142/S0217732324501852" },
];

export const TIMELINE = [
  { when: "2025-", what: "PhD in Physics (Astrophysics)", where: "UFRGS, Brazil" },
  { when: "2025-", what: "Observer, 200+ hours on the SOAR 4.1 m telescope", where: "Cerro Pachón, Chile" },
  { when: "2023-", what: "Research collaborator, cosmology", where: "GLA University, India" },
  { when: "2023-2024", what: "Research intern, galaxy clusters", where: "NRAO, USA" },
  { when: "2022-2023", what: "Research intern, Vela pulsar timing", where: "IUCAA, India" },
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
    description: "Suresh Parekh, PhD candidate in astrophysics at UFRGS. Spectral analysis of active galactic nuclei, the BRAIN stellar population fitting code, and an interactive 3D simulation of a Seyfert galaxy.",
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
    title: "CV | Suresh Parekh, PhD candidate in astrophysics (UFRGS)",
    description: "Curriculum vitae of Suresh Parekh, PhD candidate in astrophysics at UFRGS, Porto Alegre, Brazil: education, research experience and publications.",
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
    "Suresh Parekh is a PhD candidate in astrophysics at the Universidade Federal do Rio Grande do Sul (UFRGS) in Porto Alegre, Brazil. He works on active galaxies and develops tools for spectral fitting in the optical and near-infrared."],
];
