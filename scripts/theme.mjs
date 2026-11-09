// Shared palette + helpers for every grimoire SVG.
export const c = {
  bg: "#0b0607",
  bg2: "#16080b",
  crimson: "#d11a33",
  red: "#ff3b4e",
  gold: "#e9b54c",
  goldLight: "#fff3c9",
  goldDark: "#9c6a17",
  text: "#efe6d8",
  muted: "#a8927a",
};

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[ch]);

export const fonts = {
  serif: "Georgia, 'Times New Roman', serif",
  sans: "Verdana, 'Segoe UI', sans-serif",
};

/** <defs> shared by all cards: gold gradient, crimson glow, background */
export const defs = (id) => `
  <linearGradient id="${id}-gold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${c.goldLight}"/><stop offset=".5" stop-color="${c.gold}"/><stop offset="1" stop-color="${c.goldDark}"/>
  </linearGradient>
  <radialGradient id="${id}-bg" cx=".15" cy=".5" r="1">
    <stop offset="0" stop-color="#2a070d"/><stop offset=".5" stop-color="${c.bg2}"/><stop offset="1" stop-color="${c.bg}"/>
  </radialGradient>
  <filter id="${id}-glow" x="-20%" y="-50%" width="140%" height="200%">
    <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="${c.crimson}" flood-opacity=".7"/>
  </filter>`;

/** Five heart-leaf clover, centred at 0,0, ~52px across at scale 1 */
export const clover = (fill = "#120205", stroke = c.red) => {
  const leaf = "M0 -4 C -4 -14 -26 -18 -26 -36 C -26 -48 -12 -52 0 -40 C 12 -52 26 -48 26 -36 C 26 -18 4 -14 0 -4 Z";
  return `<g fill="${fill}" stroke="${stroke}" stroke-width="2">${[0, 72, 144, 216, 288]
    .map((a) => `<path d="${leaf}" transform="rotate(${a})"/>`)
    .join("")}<circle r="5" fill="${c.gold}" stroke="none"/></g>`;
};

export const frame = (W, H, id) =>
  `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="url(#${id}-bg)" stroke="${c.gold}" stroke-opacity=".3" stroke-width="2"/>`;
