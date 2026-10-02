#!/usr/bin/env node
// Answer-key copy of the shared India map for checking mode: shades and numbers the given
// states. Usage: node scripts/map-key.js app/assets/spNN-map-key.svg IN-AP IN-KA IN-TG
'use strict';
const fs = require('fs');
const path = require('path');
const [out, ...ids] = process.argv.slice(2);
if (!out || !/^app\/assets\/sp\d{2}-[a-z0-9-]+\.svg$/.test(out) || !ids.length || !ids.every(i => /^IN-[A-Z]{2}$/.test(i))) {
  console.error('usage: node scripts/map-key.js app/assets/spNN-name.svg IN-XX [IN-YY …]'); process.exit(2);
}
const base = fs.readFileSync(path.join(__dirname, '..', 'app', 'assets', 'shared-india-states.svg'), 'utf8');
for (const i of ids) if (!base.includes(`id="${i}"`)) { console.error(`map-key: no region ${i}`); process.exit(1); }
const colours = ['#f4a259', '#5b8e7d', '#bc4b51', '#8cb369', '#6c91c2'];
const style = `<style>${ids.map((i, n) => `#${i}{fill:${colours[n % colours.length]}}`).join('')}</style>`;
const svg = base.replace('<title>Outline map of India with state boundaries</title>', `<title>Answer key map: ${ids.length} states shaded</title>${style}`);
fs.writeFileSync(path.join(__dirname, '..', out), svg);
console.log(`map-key: wrote ${out} (${ids.join(', ')})`);
