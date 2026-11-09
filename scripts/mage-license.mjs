// Forges assets/mage-license.svg from live, PUBLIC GitHub data.
// Runs daily in GitHub Actions. Locally: GITHUB_TOKEN=$(gh auth token) GH_USER=you node scripts/mage-license.mjs
import { writeFileSync } from "node:fs";
import { c, esc, fonts, defs, clover, frame } from "./theme.mjs";

const token = process.env.GITHUB_TOKEN;
const login = process.env.GH_USER;
if (!token || !login) {
  console.error("GITHUB_TOKEN and GH_USER are required");
  process.exit(1);
}

const query = `query($login: String!) {
  user(login: $login) {
    name login createdAt
    followers { totalCount }
    contributionsCollection { contributionCalendar { totalContributions } }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, orderBy: {field: UPDATED_AT, direction: DESC}) {
      totalCount
      nodes { stargazerCount languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } } }
    }
  }
}`;

const res = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json", "User-Agent": "grimoire-profile" },
  body: JSON.stringify({ query, variables: { login } }),
});
const json = await res.json();
if (!res.ok || json.errors) {
  console.error("GitHub API error:", JSON.stringify(json.errors ?? json));
  process.exit(1);
}
const u = json.data.user;

const contributions = u.contributionsCollection.contributionCalendar.totalContributions;
const repos = u.repositories.totalCount;
const stars = u.repositories.nodes.reduce((n, r) => n + r.stargazerCount, 0);
const followers = u.followers.totalCount;

// Top languages by bytes across public, non-fork repos
const langs = new Map();
for (const r of u.repositories.nodes)
  for (const e of r.languages.edges) {
    const cur = langs.get(e.node.name) ?? { size: 0, color: e.node.color ?? c.gold };
    cur.size += e.size;
    langs.set(e.node.name, cur);
  }
const totalBytes = [...langs.values()].reduce((n, l) => n + l.size, 0);
const top = [...langs.entries()].sort((a, b) => b[1].size - a[1].size).slice(0, 5)
  .map(([name, l]) => ({ name, color: l.color, pct: totalBytes ? (l.size / totalBytes) * 100 : 0 }));

// Rank by contributions in the last year
const RANKS = [
  { min: 0, title: "Apprentice Mage" },
  { min: 50, title: "Adept Spellcaster" },
  { min: 200, title: "Magic Knight" },
  { min: 500, title: "Archmage" },
  { min: 1000, title: "Grand Sorcerer" },
];
let ri = 0;
RANKS.forEach((r, i) => { if (contributions >= r.min) ri = i; });
const rank = RANKS[ri];
const next = RANKS[ri + 1];
const progress = next ? (contributions - rank.min) / (next.min - rank.min) : 1;
const since = new Date(u.createdAt).getUTCFullYear();

/* ---------------- render ---------------- */
const W = 1000, H = 320, id = "m";
const fmt = (n) => n.toLocaleString("en-US");

const stats = [
  ["Contributions", fmt(contributions), "past year"],
  ["Public Repos", fmt(repos), "grimoires"],
  ["Stars Earned", fmt(stars), "on public repos"],
  ["Followers", fmt(followers), "allies"],
];

const statX = 392, statW = 136, statGap = 12;
const statsSvg = stats.map(([label, value, sub], i) => {
  const x = statX + i * (statW + statGap);
  return `<g transform="translate(${x} 56)">
    <rect width="${statW}" height="96" rx="12" fill="#120709" stroke="${c.gold}" stroke-opacity=".22"/>
    <text x="16" y="28" font-family="${fonts.sans}" font-size="10.5" letter-spacing="1.6" fill="${c.muted}">${esc(label.toUpperCase())}</text>
    <text x="16" y="64" font-family="${fonts.serif}" font-size="32" font-weight="700" fill="url(#${id}-gold)">${esc(value)}</text>
    <text x="16" y="84" font-family="${fonts.sans}" font-size="10" fill="${c.muted}" fill-opacity=".75">${esc(sub)}</text>
  </g>`;
}).join("");

const barX = statX, barW = 4 * statW + 3 * statGap, barY = 196;
let acc = 0;
const langBar = top.length
  ? top.map((l) => {
      const w = (l.pct / 100) * barW;
      const seg = `<rect x="${(barX + acc).toFixed(1)}" y="${barY}" width="${Math.max(w, 2).toFixed(1)}" height="10" fill="${l.color}"/>`;
      acc += w;
      return seg;
    }).join("")
  : `<rect x="${barX}" y="${barY}" width="${barW}" height="10" fill="#2a1418"/>`;

let lx = barX;
const legend = top.length
  ? top.map((l) => {
      const x = lx;
      lx += 16 + (l.name.length + l.pct.toFixed(1).length + 2) * 7.4 + 20; // approx text width at 12px
      return `<g transform="translate(${x.toFixed(1)} ${barY + 34})"><circle cx="5" cy="-4" r="5" fill="${l.color}"/><text x="16" y="0" font-family="${fonts.sans}" font-size="12" fill="${c.text}">${esc(l.name)} <tspan fill="${c.muted}">${l.pct.toFixed(1)}%</tspan></text></g>`;
    }).join("")
  : `<text x="${barX}" y="${barY + 34}" font-family="${fonts.sans}" font-size="12" fill="${c.muted}">No spells recorded in public grimoires yet</text>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mage License for ${esc(u.login)}: rank ${esc(rank.title)}, ${contributions} contributions in the past year, ${repos} public repos, ${stars} stars, ${followers} followers">
<defs>${defs(id)}
  <linearGradient id="mana" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c.crimson}"/><stop offset="1" stop-color="${c.red}"/></linearGradient>
  <clipPath id="barclip"><rect x="${barX}" y="${barY}" width="${barW}" height="10" rx="5"/></clipPath>
</defs>
<style>
  .crest { transform-box: fill-box; transform-origin: center; animation: pulse 3.2s ease-in-out infinite; }
  .seal { transform-box: fill-box; transform-origin: center; animation: spin 50s linear infinite; }
  .mana { animation: fill 2.2s cubic-bezier(.22,1,.36,1) both; transform-box: fill-box; transform-origin: left center; }
  @keyframes pulse { 0%,100% { filter: drop-shadow(0 0 3px ${c.red}); } 50% { filter: drop-shadow(0 0 12px ${c.red}); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @media (prefers-reduced-motion: reduce) { .crest, .seal, .mana { animation: none; } }
</style>
${frame(W, H, id)}

<!-- license card -->
<g transform="translate(30 30)">
  <rect width="330" height="260" rx="14" fill="#100608" stroke="url(#${id}-gold)" stroke-width="1.5"/>
  <rect x="8" y="8" width="314" height="244" rx="10" fill="none" stroke="${c.gold}" stroke-opacity=".25" stroke-dasharray="2 4"/>
  <text x="165" y="36" text-anchor="middle" font-family="${fonts.sans}" font-size="11" font-weight="700" letter-spacing="4" fill="${c.red}">✦ MAGE LICENSE ✦</text>
  <g transform="translate(165 104)">
    <g><circle class="seal" r="46" fill="none" stroke="${c.gold}" stroke-opacity=".55" stroke-dasharray="4 5"/></g>
    <circle r="38" fill="#1a070b" stroke="${c.gold}" stroke-opacity=".35"/>
    <g transform="scale(.62)"><g class="crest">${clover()}</g></g>
  </g>
  <text x="165" y="182" text-anchor="middle" font-family="${fonts.serif}" font-size="24" font-weight="700" fill="url(#${id}-gold)" filter="url(#${id}-glow)">${esc(u.name || u.login)}</text>
  <text x="165" y="206" text-anchor="middle" font-family="${fonts.sans}" font-size="12" letter-spacing="2" fill="${c.text}">RANK · ${esc(rank.title.toUpperCase())}</text>
  <text x="165" y="236" text-anchor="middle" font-family="${fonts.sans}" font-size="10" fill="${c.muted}">@${esc(u.login)} · Mage since ${since}</text>
</g>

<!-- stats -->
<text x="${statX}" y="40" font-family="${fonts.sans}" font-size="11" font-weight="700" letter-spacing="3" fill="${c.red}">✦ POWER LEVEL</text>
${statsSvg}

<!-- languages -->
<text x="${barX}" y="${barY - 14}" font-family="${fonts.sans}" font-size="11" font-weight="700" letter-spacing="3" fill="${c.red}">✦ SPELL AFFINITY</text>
<g clip-path="url(#barclip)"><g class="mana">${langBar}</g></g>
${legend}

<!-- mana to next rank -->
<text x="${barX}" y="${H - 34}" font-family="${fonts.sans}" font-size="10.5" fill="${c.muted}">${next ? `Mana to ${esc(next.title)}: ${fmt(contributions)} / ${fmt(next.min)}` : "Maximum rank reached"}</text>
<rect x="${barX + 250}" y="${H - 42}" width="${barW - 250}" height="6" rx="3" fill="#2a1418"/>
<rect class="mana" x="${barX + 250}" y="${H - 42}" width="${((barW - 250) * Math.min(1, Math.max(0.02, progress))).toFixed(1)}" height="6" rx="3" fill="url(#mana)"/>
</svg>`;

writeFileSync(new URL("../assets/mage-license.svg", import.meta.url), svg);
console.log(`Forged license: ${rank.title} · ${contributions} contributions · ${repos} repos · ${stars} stars · ${followers} followers · ${top.map((l) => l.name).join(", ")}`);
