// Vẽ bộ icon 3D (docs/assets/img/illus/*.svg) — một khối icon bóng ở giữa, nền sáng tối giản.
//   node scripts/gen-illus-icons.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../docs/assets/img/illus");

// light: mặt sáng, main: màu chính, dark: cạnh dưới, glow: quầng sáng nền, alt: khối phụ
const ICONS = {
  pdf: {
    light: "#fb7185", main: "#e11d48", dark: "#9f1239", glow: "#fecdd3", alt: ["#fda4af", "#f43f5e"],
    glyph: `<path d="M214 116 h32 l24 24 v56 a8 8 0 0 1 -8 8 h-48 a8 8 0 0 1 -8 -8 v-72 a8 8 0 0 1 8 -8z" fill="#fff"/>
      <path d="M246 116 v16 a8 8 0 0 0 8 8 h16z" fill="#ffe4e6"/>
      <rect x="218" y="156" width="44" height="18" rx="5" fill="#e11d48"/>
      <text x="240" y="170" font-family="Arial,Helvetica,sans-serif" font-size="13" font-weight="800" fill="#fff" text-anchor="middle" letter-spacing=".5">PDF</text>
      <rect x="218" y="182" width="30" height="5" rx="2.5" fill="#fecdd3"/>`
  },
  image: {
    light: "#818cf8", main: "#4f46e5", dark: "#3730a3", glow: "#c7d2fe", alt: ["#7dd3fc", "#0ea5e9"],
    glyph: `<rect x="206" y="122" width="68" height="64" rx="12" fill="#fff"/>
      <circle cx="254" cy="140" r="7" fill="#fbbf24"/>
      <path d="M206 172 l20 -20 a5 5 0 0 1 7 0 l13 13 7 -7 a5 5 0 0 1 7 0 l14 14 v3 a12 12 0 0 1 -12 12 h-44 a12 12 0 0 1 -12 -12z" fill="#6366f1"/>`
  },
  media: {
    light: "#c084fc", main: "#9333ea", dark: "#6b21a8", glow: "#e9d5ff", alt: ["#f9a8d4", "#ec4899"],
    glyph: `<path d="M228 124 l40 24 a7 7 0 0 1 0 12 l-40 24 a7 7 0 0 1 -10.5 -6 v-48 a7 7 0 0 1 10.5 -6z" fill="#fff"/>`
  },
  ai: {
    light: "#a78bfa", main: "#7c3aed", dark: "#5b21b6", glow: "#ddd6fe", alt: ["#67e8f9", "#06b6d4"],
    glyph: `<path d="M234 118 c3 18 10 26 28 30 c-18 4 -25 12 -28 30 c-3 -18 -10 -26 -28 -30 c18 -4 25 -12 28 -30z" fill="#fff"/>
      <path d="M262 168 c1.5 8 4.5 11 12 12.5 c-7.5 1.5 -10.5 4.5 -12 12.5 c-1.5 -8 -4.5 -11 -12 -12.5 c7.5 -1.5 10.5 -4.5 12 -12.5z" fill="#ede9fe"/>
      <circle cx="264" cy="128" r="4.5" fill="#ede9fe"/>`
  },
  utility: {
    light: "#fcd34d", main: "#f59e0b", dark: "#b45309", glow: "#fde68a", alt: ["#fdba74", "#f97316"],
    glyph: `<rect x="210" y="122" width="26" height="26" rx="8" fill="#fff"/>
      <rect x="244" y="122" width="26" height="26" rx="8" fill="#fff" opacity=".75"/>
      <rect x="210" y="156" width="26" height="26" rx="8" fill="#fff" opacity=".75"/>
      <rect x="244" y="156" width="26" height="26" rx="13" fill="#fff"/>`
  },
  data: {
    light: "#34d399", main: "#059669", dark: "#065f46", glow: "#a7f3d0", alt: ["#6ee7b7", "#10b981"],
    glyph: `<ellipse cx="240" cy="130" rx="30" ry="10" fill="#fff"/>
      <path d="M210 130 v18 c0 5.5 13.4 10 30 10 s30 -4.5 30 -10 v-18 c0 5.5 -13.4 10 -30 10 s-30 -4.5 -30 -10z" fill="#d1fae5"/>
      <path d="M210 152 v18 c0 5.5 13.4 10 30 10 s30 -4.5 30 -10 v-18 c0 5.5 -13.4 10 -30 10 s-30 -4.5 -30 -10z" fill="#fff"/>`
  },
  dev: {
    light: "#60a5fa", main: "#2563eb", dark: "#1e3a8a", glow: "#bfdbfe", alt: ["#94a3b8", "#475569"],
    glyph: `<path d="M224 134 l-18 18 18 18 M256 134 l18 18 -18 18" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M246 126 l-12 52" stroke="#dbeafe" stroke-width="7" stroke-linecap="round"/>`
  },
  units: {
    light: "#22d3ee", main: "#0891b2", dark: "#155e75", glow: "#a5f3fc", alt: ["#a5b4fc", "#6366f1"],
    glyph: `<path d="M212 140 h50 m-12 -12 l12 12 -12 12" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M268 168 h-50 m12 -12 l-12 12 12 12" fill="none" stroke="#cffafe" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`
  }
};

function svg(key, c) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320" width="480" height="320">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfbfd"/><stop offset="1" stop-color="#f2f2f6"/></linearGradient>
  <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${c.glow}" stop-opacity=".9"/><stop offset="1" stop-color="${c.glow}" stop-opacity="0"/></radialGradient>
  <linearGradient id="face" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.light}"/><stop offset=".55" stop-color="${c.main}"/><stop offset="1" stop-color="${c.dark}"/></linearGradient>
  <linearGradient id="side" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.dark}"/><stop offset="1" stop-color="${c.dark}" stop-opacity=".85"/></linearGradient>
  <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="alt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.alt[0]}"/><stop offset="1" stop-color="${c.alt[1]}"/></linearGradient>
  <radialGradient id="ball" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="${c.alt[0]}"/><stop offset="1" stop-color="${c.alt[1]}"/></radialGradient>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="gs" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${c.dark}" flood-opacity=".45"/></filter>
</defs>
<rect width="480" height="320" fill="url(#bg)"/>
<circle cx="240" cy="160" r="150" fill="url(#glow)"/>
<circle cx="240" cy="160" r="118" fill="none" stroke="${c.main}" stroke-opacity=".08"/>
<circle cx="240" cy="160" r="146" fill="none" stroke="${c.main}" stroke-opacity=".05"/>
<ellipse cx="240" cy="254" rx="74" ry="10" fill="${c.dark}" opacity=".35" filter="url(#soft)"/>
<rect x="172" y="98" width="136" height="136" rx="36" fill="url(#side)"/>
<rect x="172" y="86" width="136" height="136" rx="36" fill="url(#face)"/>
<path d="M208 86 h64 a36 36 0 0 1 36 36 v8 c-40 -14 -96 -14 -136 6 v-14 a36 36 0 0 1 36 -36z" fill="url(#gloss)"/>
<rect x="172.75" y="86.75" width="134.5" height="134.5" rx="35.25" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/>
<g filter="url(#gs)" transform="translate(0 -2)">${c.glyph}</g>
<g transform="rotate(14 336 92)"><rect x="318" y="80" width="36" height="36" rx="11" fill="${c.alt[1]}" opacity=".9"/><rect x="318" y="74" width="36" height="36" rx="11" fill="url(#alt)"/><rect x="324" y="78" width="24" height="8" rx="4" fill="#fff" opacity=".35"/></g>
<circle cx="146" cy="214" r="15" fill="url(#ball)"/>
<circle cx="124" cy="104" r="5" fill="${c.main}" opacity=".25"/><circle cx="364" cy="214" r="4" fill="${c.main}" opacity=".3"/>
</svg>
`;
}

for (const [key, c] of Object.entries(ICONS)) {
  const full = svg(key, c);
  fs.writeFileSync(path.join(OUT, key + ".svg"), full);
  // bản vuông chỉ có khối icon, cho chỗ nhỏ (tiêu đề nhóm ở trang chủ)
  const lines = full.split("\n").filter((l) => !/^<(rect width|circle|ellipse|g transform="rotate)/.test(l));
  fs.writeFileSync(path.join(OUT, key + "-icon.svg"), lines.join("\n").replace("viewBox=\"0 0 480 320\" width=\"480\" height=\"320\"", "viewBox=\"168 82 144 156\" width=\"144\" height=\"156\""));
}
console.log("icons:", Object.keys(ICONS).join(", "));
