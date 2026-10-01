const ANCHORS = {
  viridis: ["#440154", "#482878", "#3e4a89", "#31688e", "#26828e", "#1f9e89", "#35b779", "#6ece58", "#b5de2b", "#fde725"],
  magma: ["#000004", "#140e36", "#3b0f70", "#641a80", "#8c2981", "#b73779", "#de4968", "#f7705c", "#fe9f6d", "#fecf92", "#fcfdbf"],
  inferno: ["#000004", "#160b39", "#420a68", "#6a176e", "#932667", "#bc3754", "#dd513a", "#f37819", "#fca50a", "#f6d746", "#fcffa4"],
  plasma: ["#0d0887", "#46039f", "#7201a8", "#9c179e", "#bd3786", "#d8576b", "#ed7953", "#fb9f3a", "#fdca26", "#f0f921"],
  cividis: ["#00224e", "#123570", "#3b496c", "#575d6d", "#707173", "#8a8779", "#a69d75", "#c4b56c", "#e4cf5b", "#fee838"],
  velocity: ["#2a5bd7", "#3f86e8", "#73b1f2", "#a9d3f5", "#1a1d26", "#f6c3a6", "#f1906c", "#de5a3c", "#b52a1c"],
  coolwarm: ["#3b4cc0", "#6a8bef", "#9abbff", "#c9d7ef", "#edd1c2", "#f7a789", "#e26952", "#b40426"],
};

const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

function build(anchors) {
  const c = anchors.map(hex), lut = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const f = (i / 255) * (c.length - 1), k = Math.min(c.length - 2, Math.floor(f)), w = f - k;
    for (let ch = 0; ch < 3; ch++) lut[i * 3 + ch] = c[k][ch] * (1 - w) + c[k + 1][ch] * w;
  }
  return lut;
}

export const CMAPS = Object.fromEntries(Object.entries(ANCHORS).map(([k, v]) => [k, build(v)]));
export const CMAP_NAMES = Object.keys(ANCHORS);

export function cssGradient(name, dir = "to right") {
  return `linear-gradient(${dir}, ${ANCHORS[name].join(", ")})`;
}

export const CATEGORICAL = ["#ffd166", "#f39b4a", "#e4483a", "#5b8cff", "#8a5a3c", "#7fd0a8", "#c8a2ff"];
export const catRGB = CATEGORICAL.map(hex);
