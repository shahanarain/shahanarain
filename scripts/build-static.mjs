// Builds the static grimoire assets: section headers, spells grid, footer.
// Run: node scripts/build-static.mjs   (edit SPELLS below to change your stack)
import { writeFileSync } from "node:fs";
import { c, esc, fonts, defs, clover, frame } from "./theme.mjs";

const out = (p, svg) => { writeFileSync(new URL(`../assets/${p}`, import.meta.url), svg); console.log("wrote assets/" + p); };

/* ---------------- Section headers ---------------- */
const HEADERS = {
  about: "About the Mage",
  spells: "Spells I Wield",
  license: "Mage License",
  battle: "Battle Record",
};

function header(title) {
  const W = 1000, H = 84, id = "h";
  const tw = title.length * 23.5; // approx text width at 30px serif, letter-spaced
  const l = W / 2 - tw / 2 - 30, r = W / 2 + tw / 2 + 30;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">
<defs>${defs(id)}
  <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
    <stop offset="0" stop-color="${c.gold}"/><stop offset=".45" stop-color="${c.gold}"/><stop offset=".5" stop-color="#fffbe8"/><stop offset=".55" stop-color="${c.gold}"/><stop offset="1" stop-color="${c.gold}"/>
    <animateTransform attributeName="gradientTransform" type="translate" from="-1 0" to="1 0" dur="5s" repeatCount="indefinite"/>
  </linearGradient>
</defs>
<style>@media (prefers-reduced-motion: reduce){ animateTransform{display:none} }</style>
<g stroke="${c.gold}" stroke-opacity=".55">
  <line x1="40" y1="42" x2="${l}" y2="42"/><line x1="${r}" y1="42" x2="${W - 40}" y2="42"/>
</g>
<rect x="${l - 5}" y="37" width="10" height="10" fill="${c.red}" transform="rotate(45 ${l} 42)"/>
<rect x="${r - 5}" y="37" width="10" height="10" fill="${c.red}" transform="rotate(45 ${r} 42)"/>
<g transform="translate(40 42) scale(.32)">${clover()}</g>
<g transform="translate(${W - 40} 42) scale(.32)">${clover()}</g>
<text x="${W / 2}" y="53" text-anchor="middle" font-family="${fonts.serif}" font-size="30" font-weight="700" letter-spacing="3" fill="url(#shine)" filter="url(#${id}-glow)">${esc(title.toUpperCase())}</text>
</svg>`;
}
for (const [k, t] of Object.entries(HEADERS)) out(`headers/${k}.svg`, header(t));

/* ---------------- Spells I Wield (tech stack) ---------------- */
const SPELLS = [
  { school: "Frontend Magic", items: [["React", "#61DAFB", "Re"], ["Next.js", "#ffffff", "Nx"], ["TypeScript", "#3178C6", "Ts"], ["JavaScript", "#F7DF1E", "Js"], ["Tailwind", "#38BDF8", "Tw"], ["HTML5", "#E34F26", "Ht"], ["CSS3", "#2965F1", "Cs"]] },
  { school: "Backend Magic", items: [["Node.js", "#5FA04E", "No"], ["Express", "#d4d4d4", "Ex"], ["Python", "#FFD43B", "Py"], ["PHP", "#8892BF", "Ph"], ["PostgreSQL", "#4169E1", "Pg"], ["MongoDB", "#47A248", "Mg"], ["Firebase", "#FFCA28", "Fb"]] },
  { school: "Arcane Tools", items: [["Git", "#F05032", "Gi"], ["GitHub", "#ffffff", "Gh"], ["Figma", "#F24E1E", "Fg"], ["Docker", "#2496ED", "Dk"], ["AWS", "#FF9900", "Aw"], ["Vercel", "#ffffff", "Vc"]] },
];

function spells() {
  const W = 1000, id = "s", bw = 128, bh = 46, gap = 10, perRow = 7, pad = 26;
  let y = 30, body = "", n = 0;
  for (const school of SPELLS) {
    body += `<text x="${pad}" y="${y + 14}" font-family="${fonts.sans}" font-size="12" font-weight="700" letter-spacing="3" fill="${c.red}">✦ ${esc(school.school.toUpperCase())}</text>`;
    y += 28;
    school.items.forEach(([name, color, mono], i) => {
      const col = i % perRow, row = Math.floor(i / perRow);
      const x = pad + col * (bw + gap), yy = y + row * (bh + gap);
      body += `<g transform="translate(${x} ${yy})">
        <rect class="badge" width="${bw}" height="${bh}" rx="10" fill="#120709" stroke="${c.gold}" style="animation-delay:${(n++ * 0.35).toFixed(2)}s"/>
        <circle cx="23" cy="${bh / 2}" r="14" fill="none" stroke="${color}" stroke-opacity=".9" stroke-width="1.6"/>
        <circle cx="23" cy="${bh / 2}" r="10" fill="${color}" fill-opacity=".14"/>
        <text x="23" y="${bh / 2 + 4}" text-anchor="middle" font-family="${fonts.sans}" font-size="10.5" font-weight="700" fill="${color}">${esc(mono)}</text>
        <text x="44" y="${bh / 2 + 4.5}" font-family="${fonts.sans}" font-size="12.5" fill="${c.text}">${esc(name)}</text>
      </g>`;
    });
    y += Math.ceil(school.items.length / perRow) * (bh + gap) + 18;
  }
  const H = y + 6;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tech stack: ${esc(SPELLS.flatMap((s) => s.items.map((i) => i[0])).join(", "))}">
<defs>${defs(id)}</defs>
<style>
  .badge { stroke-opacity: .25; animation: rune 7s ease-in-out infinite; }
  @keyframes rune { 0%,100% { stroke-opacity: .22; } 8% { stroke-opacity: .95; stroke: ${c.red}; } 18% { stroke-opacity: .22; } }
  @media (prefers-reduced-motion: reduce) { .badge { animation: none; } }
</style>
${frame(W, H, id)}
${body}
</svg>`;
}
out("spells.svg", spells());

/* ---------------- Footer ---------------- */
function footer() {
  const W = 1000, H = 130, id = "f";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="The grimoire grows with every commit">
<defs>${defs(id)}
  <radialGradient id="fglow"><stop offset="0" stop-color="${c.crimson}" stop-opacity=".7"/><stop offset="1" stop-color="${c.crimson}" stop-opacity="0"/></radialGradient>
</defs>
<style>
  .pulse { transform-box: fill-box; transform-origin: center; animation: pulse 3.2s ease-in-out infinite; }
  .ring { transform-box: fill-box; transform-origin: center; animation: spin 40s linear infinite; }
  @keyframes pulse { 0%,100% { opacity: .55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.12); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .pulse, .ring { animation: none; } }
</style>
<g stroke="${c.gold}" stroke-opacity=".45"><line x1="60" y1="50" x2="440" y2="50"/><line x1="560" y1="50" x2="940" y2="50"/></g>
<g transform="translate(500 50)">
  <g><circle class="pulse" r="56" fill="url(#fglow)"/></g>
  <g><circle class="ring" r="40" fill="none" stroke="${c.gold}" stroke-opacity=".6" stroke-dasharray="3 6"/></g>
  <g transform="scale(.62)">${clover()}</g>
</g>
<text x="500" y="118" text-anchor="middle" font-family="${fonts.serif}" font-size="17" font-style="italic" fill="${c.muted}" letter-spacing="1">✦ The grimoire grows with every commit ✦</text>
</svg>`;
}
out("footer.svg", footer());
