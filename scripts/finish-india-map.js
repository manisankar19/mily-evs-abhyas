#!/usr/bin/env node
// Finishes the mapshaper SVG: neutral title/desc, sea labels, north arrow. No state names.
// Usage: node scripts/finish-india-map.js raw.svg out.svg
'use strict';
const fs = require('fs');
const [src, out] = process.argv.slice(2);
let svg = fs.readFileSync(src, 'utf8').replace(/^<\?xml[^>]*>\s*/, '');
const m = svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
if (!m) throw new Error('no viewBox');
const [w, h] = [Number(m[1]), Number(m[2])];
const head = `<title>Outline map of India with state boundaries</title>
<desc>Outline political map of India showing the boundaries of the states and union territories, without names. Drawn from Natural Earth public-domain data.</desc>
<rect width="${w}" height="${h}" fill="#ffffff"/>`;
const seas = `<g font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="13" fill="#4a6f8a" text-anchor="middle">
<text x="${(w * 0.10).toFixed(0)}" y="${(h * 0.70).toFixed(0)}">Arabian Sea</text>
<text x="${(w * 0.66).toFixed(0)}" y="${(h * 0.70).toFixed(0)}">Bay of Bengal</text>
<text x="${(w * 0.42).toFixed(0)}" y="${(h * 0.985).toFixed(0)}">Indian Ocean</text>
</g>
<g transform="translate(${(w - 34).toFixed(0)} 30)" fill="#111" font-family="sans-serif" font-size="13" text-anchor="middle">
<path d="M0 -18 L7 6 L0 1 L-7 6 Z"/><text y="22">N</text>
</g>`;
svg = svg.replace(/(<svg\b[^>]*>)/, `$1\n${head}`).replace(/<\/svg>\s*$/, `${seas}\n</svg>\n`)
  .replace(/<svg\b/, '<svg role="img"');
fs.writeFileSync(out, svg);
console.log(`finish-india-map: wrote ${out} (${Math.round(svg.length / 1024)} KB)`);
