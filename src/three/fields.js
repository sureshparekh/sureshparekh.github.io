export const lpmJS = logAge => Math.pow(Math.max(Math.pow(10, logAge - 6), 0.3) / 3, -0.75);

const F = [];
const add = (group, key, label, o) => F.push({ group, key, label, ...o });

add("Overview", "composite", "True colour", {
  mode: "composite",
  note: "Starlight coloured by age, Hα from H II regions in red, AGN-ionised [O III] in blue, dust from the gas column",
  stars: `float L = pow(10.0, aM - 5.0) * lpm(aAge); acc = vec4(ageColor(aAge) * L, 0.0);`,
  gas: `float ha = pow(10.0, aHa - 38.0), o3 = pow(10.0, aO3 - 38.0);
        float ob = aCls > 0.5 && aCls < 1.5 ? 1.1 : 0.12;
        acc = vec4(vec3(1.0, 0.24, 0.34) * ha * 0.2 + vec3(0.25, 0.62, 1.0) * o3 * ob, pow(10.0, aM - 4.0) * pow(10.0, aZ));`,
});

const S = "Stellar populations";
add(S, "mstar", "Stellar mass surface density", {
  mode: "logsum", unit: 1e5, cmap: "magma", label2: "log Σ⋆ [M☉ kpc⁻²]",
  stars: `acc = vec4(pow(10.0, aM - 5.0), 0.0, 0.0, 0.0);`,
  js: { cloud: "stars", w: p => Math.pow(10, p.aM) },
});
add(S, "age_l", "Mean age, light-weighted", {
  mode: "mean", cmap: "viridis", label2: "log age [yr]",
  stars: `float L = pow(10.0, aM - 5.0) * lpm(aAge); acc = vec4(L, L * aAge, 0.0, 0.0);`,
  js: { cloud: "stars", w: p => Math.pow(10, p.aM) * lpmJS(p.aAge), v: p => p.aAge },
});
add(S, "age_m", "Mean age, mass-weighted", {
  mode: "mean", cmap: "viridis", label2: "log age [yr]",
  stars: `float M = pow(10.0, aM - 5.0); acc = vec4(M, M * aAge, 0.0, 0.0);`,
  js: { cloud: "stars", w: p => Math.pow(10, p.aM), v: p => p.aAge },
});
add(S, "z_l", "Metallicity, light-weighted", {
  mode: "mean", cmap: "cividis", label2: "log Z/Z☉",
  stars: `float L = pow(10.0, aM - 5.0) * lpm(aAge); acc = vec4(L, L * aZ, 0.0, 0.0);`,
  js: { cloud: "stars", w: p => Math.pow(10, p.aM) * lpmJS(p.aAge), v: p => p.aZ },
});
add(S, "z_m", "Metallicity, mass-weighted", {
  mode: "mean", cmap: "cividis", label2: "log Z/Z☉",
  stars: `float M = pow(10.0, aM - 5.0); acc = vec4(M, M * aZ, 0.0, 0.0);`,
  js: { cloud: "stars", w: p => Math.pow(10, p.aM), v: p => p.aZ },
});
add(S, "sfr", "Star formation (last 10 Myr)", {
  mode: "logsum", unit: 1e5 / 1e7, cmap: "inferno", label2: "log Σ_SFR [M☉ yr⁻¹ kpc⁻²]",
  stars: `acc = vec4(aAge < 7.0 ? pow(10.0, aM - 5.0) : 0.0, 0.0, 0.0, 0.0);`,
  js: { cloud: "stars", w: p => (p.aAge < 7 ? Math.pow(10, p.aM) / 1e7 : 0) },
});
add(S, "young", "Young light fraction (< 100 Myr)", {
  mode: "mean", cmap: "inferno", range: [0, 1], label2: "L(< 100 Myr) / L",
  stars: `float L = pow(10.0, aM - 5.0) * lpm(aAge); acc = vec4(L, aAge < 8.0 ? L : 0.0, 0.0, 0.0);`,
  js: { cloud: "stars", w: p => Math.pow(10, p.aM) * lpmJS(p.aAge), v: p => (p.aAge < 8 ? 1 : 0) },
});
add(S, "vstar", "Stellar velocity", {
  mode: "mean", mul: 1000, cmap: "velocity", symmetric: true, label2: "v_los [km s⁻¹]",
  stars: `float L = pow(10.0, aM - 5.0) * lpm(aAge); acc = vec4(L, L * vlos, L * vlos * vlos, 0.0);`,
  js: { cloud: "stars", w: p => Math.pow(10, p.aM) * lpmJS(p.aAge), v: p => p.vlos * 1000, range: [-280, 280] },
});
add(S, "sigstar", "Stellar velocity dispersion", {
  mode: "sigma", cmap: "plasma", label2: "σ⋆ [km s⁻¹]", range: [20, 200],
  stars: `float L = pow(10.0, aM - 5.0) * lpm(aAge); acc = vec4(L, L * vlos, L * vlos * vlos, 0.0);`,
});

const G = "Ionised gas";
const flux = (key, label, col, cmap) => add(G, `f_${key}`, `${label} flux`, {
  mode: "logsum", unit: 1e38, cmap, label2: `log Σ(${label}) [erg s⁻¹ kpc⁻²]`,
  gas: `acc = vec4(pow(10.0, ${col} - 38.0), 0.0, 0.0, 0.0);`,
  js: { cloud: "gas", w: p => Math.pow(10, p[col]) },
});
flux("ha", "Hα", "aHa", "magma");
flux("hb", "Hβ", "aHb", "magma");
flux("o3", "[O III] λ5007", "aO3", "magma");
flux("n2", "[N II] λ6583", "aN2", "magma");
flux("s2", "[S II] λλ6716,31", "aS2", "magma");
flux("o1", "[O I] λ6300", "aO1", "magma");
add(G, "v_ha", "Hα velocity", {
  mode: "mean", mul: 1000, cmap: "velocity", symmetric: true, label2: "v_los [km s⁻¹]",
  gas: `float w = pow(10.0, aHa - 38.0); float s = aSig / 1000.0; acc = vec4(w, w * vlos, w * (vlos * vlos + s * s), 0.0);`,
  js: { cloud: "gas", w: p => Math.pow(10, p.aHa), v: p => p.vlos * 1000, range: [-300, 300] },
});
add(G, "s_ha", "Hα velocity dispersion", {
  mode: "sigma", cmap: "plasma", label2: "σ(Hα) [km s⁻¹]", range: [15, 260],
  gas: `float w = pow(10.0, aHa - 38.0); float s = aSig / 1000.0; acc = vec4(w, w * vlos, w * (vlos * vlos + s * s), 0.0);`,
});
add(G, "v_o3", "[O III] velocity", {
  mode: "mean", mul: 1000, cmap: "velocity", symmetric: true, label2: "v_los [km s⁻¹]",
  gas: `float w = pow(10.0, aO3 - 38.0); float s = aSig / 1000.0; acc = vec4(w, w * vlos, w * (vlos * vlos + s * s), 0.0);`,
  js: { cloud: "gas", w: p => Math.pow(10, p.aO3), v: p => p.vlos * 1000, range: [-600, 600] },
});
add(G, "s_o3", "[O III] velocity dispersion", {
  mode: "sigma", cmap: "plasma", label2: "σ([O III]) [km s⁻¹]", range: [15, 400],
  gas: `float w = pow(10.0, aO3 - 38.0); float s = aSig / 1000.0; acc = vec4(w, w * vlos, w * (vlos * vlos + s * s), 0.0);`,
});
add(G, "ew_ha", "Hα equivalent width", {
  mode: "ewlog", cmap: "viridis", label2: "log EW(Hα) [Å]", range: [-0.5, 2.8],
  stars: `acc = vec4(0.0, pow(10.0, aM - 5.0) * lpm(aAge) * 1.1e-1, 0.0, 0.0);`,
  gas: `acc = vec4(pow(10.0, aHa - 38.0), 0.0, 0.0, 0.0);`,
});
add(G, "mgas", "Gas mass surface density", {
  mode: "logsum", unit: 1e4, cmap: "cividis", label2: "log Σ_gas [M☉ kpc⁻²]",
  gas: `acc = vec4(pow(10.0, aM - 4.0), 0.0, 0.0, 0.0);`,
  js: { cloud: "gas", w: p => Math.pow(10, p.aM) },
});
add(G, "oh", "Gas metallicity (Hα-weighted)", {
  mode: "mean", add: 8.69, cmap: "cividis", label2: "12 + log O/H",
  gas: `float w = pow(10.0, aHa - 38.0); acc = vec4(w, w * aZ, 0.0, 0.0);`,
  js: { cloud: "gas", w: p => Math.pow(10, p.aHa), v: p => p.aZ + 8.69 },
});
add(G, "av", "Dust extinction A_V (full column)", {
  mode: "logsum", unit: 1e4 * 0.067e-6, cmap: "cividis", linear: true, label2: "A_V [mag]", range: [0, 2.5],
  gas: `acc = vec4(pow(10.0, aM - 4.0) * pow(10.0, aZ), 0.0, 0.0, 0.0);`,
});
add(G, "ne", "Electron density ([S II]-weighted)", {
  mode: "mean", cmap: "plasma", label2: "log n_e [cm⁻³]", range: [1.2, 3.4],
  gas: `float w = pow(10.0, aS2 - 38.0); acc = vec4(w, w * aNe, 0.0, 0.0);`,
});

const D = "Diagnostics";
add(D, "r_o3hb", "log [O III] / Hβ", {
  mode: "ratio", cmap: "coolwarm", range: [-0.8, 1.2], label2: "log [O III]/Hβ",
  gas: `acc = vec4(pow(10.0, aHb - 38.0), pow(10.0, aO3 - 38.0), 0.0, 0.0);`,
});
add(D, "r_n2ha", "log [N II] / Hα", {
  mode: "ratio", cmap: "coolwarm", range: [-1.4, 0.2], label2: "log [N II]/Hα",
  gas: `acc = vec4(pow(10.0, aHa - 38.0), pow(10.0, aN2 - 38.0), 0.0, 0.0);`,
});
add(D, "r_s2ha", "log [S II] / Hα", {
  mode: "ratio", cmap: "coolwarm", range: [-1.2, 0.0], label2: "log [S II]/Hα",
  gas: `acc = vec4(pow(10.0, aHa - 38.0), pow(10.0, aS2 - 38.0), 0.0, 0.0);`,
});
add(D, "bpt", "BPT classification", {
  mode: "bpt", classes: ["Star-forming", "Composite", "Seyfert", "LINER"],
  gas: `acc = vec4(pow(10.0, aHa - 38.0), pow(10.0, aHb - 38.0), pow(10.0, aO3 - 38.0), pow(10.0, aN2 - 38.0));`,
});
add(D, "source", "Ionising source", {
  mode: "mix", classes: ["H II regions", "AGN", "Diffuse gas"],
  gas: `float w = pow(10.0, aHa - 38.0);
        acc = vec4(aCls < 0.5 ? w : 0.0, (aCls > 0.5 && aCls < 1.5) ? w : 0.0, aCls > 1.5 ? w : 0.0, 0.0);`,
});

export const FIELDS = F;
export const FIELD = Object.fromEntries(F.map(f => [f.key, f]));
export const FIELD_GROUPS = [...new Set(F.map(f => f.group))];
export const BPT_COLORS = ["#8fb6ff", "#7fd0a8", "#ff6a3d", "#ffd166"];
export const SOURCE_COLORS = ["#8fb6ff", "#ff6a3d", "#c8a2ff"];
