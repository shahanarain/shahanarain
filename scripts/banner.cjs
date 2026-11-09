// Generates an original dark-fantasy "grimoire" banner (animated SVG, CSS only).
const fs = require("fs");
const out = process.argv[2];
const W = 1200, H = 420, CX = 270, CY = 212;

// deterministic pseudo-random
let seed = 7;
const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

const leaf = "M0 -4 C -4 -14 -26 -18 -26 -36 C -26 -48 -12 -52 0 -40 C 12 -52 26 -48 26 -36 C 26 -18 4 -14 0 -4 Z";
const clover = [0, 72, 144, 216, 288]
  .map((a) => `<g transform="rotate(${a})"><path d="${leaf}"/><path d="M0 -6 L0 -36" stroke="#ff3b4e" stroke-opacity=".55" stroke-width="1" fill="none"/></g>`)
  .join("");

const runes = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";
const runeRing = (r, size, cls) => {
  const n = Math.floor((2 * Math.PI * r) / (size * 1.25));
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 360;
    s += `<text transform="rotate(${a.toFixed(2)}) translate(0 ${-r})" font-size="${size}" text-anchor="middle">${runes[i % runes.length]}</text>`;
  }
  return `<g class="${cls}">${s}</g>`;
};

// rising sparks
let sparks = "";
for (let i = 0; i < 34; i++) {
  const x = (rnd() * W).toFixed(1);
  const y = (H - rnd() * 60).toFixed(1);
  const r = (0.8 + rnd() * 2).toFixed(2);
  const dur = (5 + rnd() * 6).toFixed(2);
  const delay = (-rnd() * 10).toFixed(2);
  const gold = rnd() > 0.55;
  sparks += `<circle class="spark" cx="${x}" cy="${y}" r="${r}" fill="${gold ? "#f3c766" : "#ff3b4e"}" style="animation-duration:${dur}s;animation-delay:${delay}s"/>`;
}

// anti-magic flames around the grimoire (teardrops pointing up)
let flames = "";
const flameSpots = [[-92,78,62],[-84,34,92],[-78,-14,104],[-58,-62,88],[-30,-80,74],[30,-80,76],[58,-62,90],[80,-14,106],[86,34,94],[94,78,64]];
flameSpots.forEach(([x, y, h0], i) => {
  const h = h0 * 0.8, w = h * 0.3, c = x < 0 ? -1 : 1; // curl away from the book
  const f = (n) => n.toFixed(1);
  const d = `M0 0 C ${f(-w)} 0 ${f(-w * 1.1)} ${f(-h * 0.4)} ${f(-w * 0.2 + c * w * 0.3)} ${f(-h * 0.68)} C ${f(c * w * 0.2)} ${f(-h * 0.84)} ${f(c * w * 0.5)} ${f(-h * 0.9)} ${f(c * w * 0.6)} ${f(-h)} C ${f(w * 0.9)} ${f(-h * 0.55)} ${f(w)} 0 0 0 Z`;
  flames += `<g transform="translate(${x} ${y})"><path class="flame" d="${d}" style="animation-delay:${(-i * 0.31).toFixed(2)}s"/></g>`;
});

const phrases = ["Building things for the web", "Every bug is just another trial", "Always leveling up"];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="shahanarain — Code is my grimoire">
<defs>
  <radialGradient id="bg" cx="${CX}" cy="${CY}" r="900" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#3b0911"/>
    <stop offset="0.35" stop-color="#16060a"/>
    <stop offset="1" stop-color="#060405"/>
  </radialGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff3c9"/>
    <stop offset="0.5" stop-color="#e9b54c"/>
    <stop offset="1" stop-color="#9c6a17"/>
  </linearGradient>
  <linearGradient id="cover" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#1c1416"/>
    <stop offset="1" stop-color="#070506"/>
  </linearGradient>
  <radialGradient id="cloverFill" cx="0" cy="0" r="46" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#4a0610"/>
    <stop offset="0.55" stop-color="#140205"/>
    <stop offset="1" stop-color="#000"/>
  </radialGradient>
  <linearGradient id="flameGrad" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#000"/><stop offset="0.35" stop-color="#6d0a18" stop-opacity=".9"/><stop offset="0.75" stop-color="#d11a33" stop-opacity=".55"/><stop offset="1" stop-color="#ff3b4e" stop-opacity="0"/></linearGradient>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter>
  <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="4" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="titleGlow" x="-10%" y="-40%" width="120%" height="180%">
    <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#c4142b" flood-opacity="0.75"/>
  </filter>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="22"/></clipPath>
</defs>
<style>
  .spin { transform-box: view-box; transform-origin: ${CX}px ${CY}px; animation: spin 60s linear infinite; }
  .spin-rev { transform-box: view-box; transform-origin: ${CX}px ${CY}px; animation: spin 90s linear infinite reverse; }
  .runes text { fill: #e9b54c; font-family: 'Segoe UI Symbol', 'Noto Sans Runic', serif; opacity: .75; }
  .book { animation: float 6s ease-in-out infinite; }
  .clover { transform-box: fill-box; transform-origin: center; animation: pulse 3.2s ease-in-out infinite; }
  .flame { fill: url(#flameGrad); filter: url(#soft); opacity: .95; transform-box: fill-box; transform-origin: 50% 100%; animation: flicker 2.4s ease-in-out infinite; }
  .aura { animation: aura 4s ease-in-out infinite; }
  .spark { animation-name: rise; animation-timing-function: linear; animation-iteration-count: infinite; }
  .phrase { opacity: 0; animation: cycle 12s infinite; }
  .p1 { animation-delay: 4s; } .p2 { animation-delay: 8s; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes pulse { 0%,100% { transform: scale(1); filter: drop-shadow(0 0 4px #ff2a40); } 50% { transform: scale(1.06); filter: drop-shadow(0 0 14px #ff2a40); } }
  @keyframes flicker { 0%,100% { transform: scaleY(1) scaleX(1); } 33% { transform: scaleY(1.12) scaleX(.94); } 66% { transform: scaleY(.94) scaleX(1.05); } }
  @keyframes aura { 0%,100% { opacity: .55; } 50% { opacity: .95; } }
  @keyframes rise { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: .9; } 100% { transform: translateY(-${H}px); opacity: 0; } }
  @keyframes cycle { 0% { opacity: 0; transform: translateY(6px); } 4%,29% { opacity: 1; transform: translateY(0); } 33%,100% { opacity: 0; transform: translateY(-6px); } }
  @media (prefers-reduced-motion: reduce) {
    .spin, .spin-rev, .book, .clover, .flame, .aura, .spark { animation: none; }
    .phrase { animation: none; } .p0 { opacity: 1; }
  }
</style>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <!-- faint diagonal texture -->
  <g stroke="#ffffff" stroke-opacity="0.025">${Array.from({ length: 40 }, (_, i) => `<line x1="${i * 40 - 400}" y1="0" x2="${i * 40}" y2="${H}"/>`).join("")}</g>
  ${sparks}

  <!-- magic circle -->
  <g fill="none" stroke="#e9b54c">
    <g class="spin">
      <circle cx="${CX}" cy="${CY}" r="178" stroke-opacity=".35" stroke-dasharray="2 7"/>
      <circle cx="${CX}" cy="${CY}" r="166" stroke-opacity=".55"/>
      <g transform="translate(${CX} ${CY})" stroke="none">${runeRing(152, 15, "runes")}</g>
      <circle cx="${CX}" cy="${CY}" r="138" stroke-opacity=".55"/>
    </g>
    <g class="spin-rev" stroke-opacity=".4">
      <polygon points="${[0, 1, 2, 3, 4].map((i) => { const a = (i * 72 - 90) * Math.PI / 180; return `${(CX + Math.cos(a) * 128).toFixed(1)},${(CY + Math.sin(a) * 128).toFixed(1)}`; }).join(" ")}"/>
      ${[0, 1, 2, 3, 4].map((i) => { const a = (i * 72 - 90) * Math.PI / 180; return `<circle cx="${(CX + Math.cos(a) * 128).toFixed(1)}" cy="${(CY + Math.sin(a) * 128).toFixed(1)}" r="7" fill="#16060a" stroke-opacity=".8"/>`; }).join("")}
      <circle cx="${CX}" cy="${CY}" r="104" stroke-dasharray="14 6 3 6"/>
    </g>
  </g>

  <!-- anti-magic aura + grimoire -->
  <g transform="translate(${CX} ${CY})">
    <g class="aura"><circle r="96" fill="#a10f24" opacity=".55" filter="url(#blur)"/></g>
    <g class="book">
      <g>${flames}</g>
      <rect x="-66" y="-84" width="132" height="168" rx="8" fill="#000" opacity=".55" transform="translate(6 8)"/>
      <rect x="-66" y="-84" width="132" height="168" rx="8" fill="url(#cover)" stroke="url(#gold)" stroke-width="2.5"/>
      <rect x="-66" y="-84" width="14" height="168" rx="6" fill="#000" opacity=".45"/>
      <rect x="-50" y="-72" width="106" height="144" rx="4" fill="none" stroke="#e9b54c" stroke-opacity=".45"/>
      ${[[-50, -72, 1, 1], [56, -72, -1, 1], [-50, 72, 1, -1], [56, 72, -1, -1]].map(([x, y, sx, sy]) => `<path d="M${x} ${y} l${14 * sx} 0 l${-14 * sx} ${14 * sy} Z" fill="url(#gold)"/>`).join("")}
      <g transform="translate(3 0) scale(1.15)"><g class="clover" fill="url(#cloverFill)" stroke="#ff3b4e" stroke-width="1.6">${clover}<circle r="5" fill="#e9b54c" stroke="none"/></g></g>
    </g>
  </g>

  <!-- title block -->
  <g font-family="Georgia, 'Times New Roman', serif">
    <text x="520" y="138" fill="#e0414f" font-size="15" letter-spacing="7" font-family="Verdana, sans-serif" font-weight="700">✦ GRIMOIRE OF ✦</text>
    <text x="516" y="214" fill="url(#gold)" font-size="72" font-weight="700" letter-spacing="5" filter="url(#titleGlow)">SHAHANARAIN</text>
    <line x1="520" y1="240" x2="1110" y2="240" stroke="#e9b54c" stroke-opacity=".45"/>
    <rect x="811" y="236" width="8" height="8" fill="#e9b54c" transform="rotate(45 815 240)"/>
    <text x="520" y="284" fill="#efe6d8" font-size="27" font-style="italic">Code is my grimoire.</text>
    <g font-family="Verdana, sans-serif" font-size="16" fill="#c9a86a" letter-spacing="1.5">
      ${phrases.map((p, i) => `<text class="phrase p${i}" x="520" y="326">» ${p}</text>`).join("")}
    </g>
  </g>

  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="21" fill="none" stroke="#e9b54c" stroke-opacity=".28" stroke-width="2"/>
</g>
</svg>`;
fs.writeFileSync(out, svg);
console.log("wrote", out, svg.length, "bytes");
