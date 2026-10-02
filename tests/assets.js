#!/usr/bin/env node
// Shared picture checks (Task 17): every asset in app/assets/shared-manifest.json is a
// well-formed, self-contained SVG that does not print its own answer. Zero dependencies
// apart from xmllint. Renders 2× PNGs to tests/screenshots/ with --render (needs Playwright).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DIR = path.join(__dirname, '..', 'app', 'assets');
const MAX_BYTES = 150 * 1024;
const manifest = JSON.parse(fs.readFileSync(path.join(DIR, 'shared-manifest.json'), 'utf8'));
let pass = 0, fail = 0;
const check = (name, ok, why) => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : '  ' + why}`); };

// Visible text: <text>/<tspan>, <title>, <desc>, aria-label.
function visibleText(svg) {
  const out = [];
  for (const m of svg.matchAll(/<(text|tspan|title|desc)\b[^>]*>([^<]*)/g)) out.push(m[2]);
  for (const m of svg.matchAll(/aria-label="([^"]*)"/g)) out.push(m[1]);
  return out.join(' ');
}

for (const a of manifest.assets) {
  if (!/^shared-[a-z0-9-]+\.svg$/.test(a.file)) { check(a.file, false, 'bad file name'); continue; }
  const f = path.join(DIR, a.file);
  if (!fs.existsSync(f)) { check(`${a.file} exists`, false, 'missing'); continue; }
  const svg = fs.readFileSync(f, 'utf8');
  let wellFormed = true;
  try { execFileSync('xmllint', ['--noout', f], { stdio: ['ignore', 'ignore', 'pipe'] }); } catch (e) { wellFormed = false; }
  check(`${a.file} well-formed XML`, wellFormed, 'xmllint failed');
  check(`${a.file} has viewBox`, /<svg\b[^>]*\bviewBox="[\d.\s-]+"/.test(svg), 'no viewBox on <svg>');
  check(`${a.file} has <title>`, /<title>[^<]+<\/title>/.test(svg), 'no <title>');
  check(`${a.file} self-contained`, !/<script|\bon[a-z]+="|<foreignObject|@import|(?:href|src)="(?!#|data:)/i.test(svg), 'script, handler, foreignObject or external reference');
  check(`${a.file} ≤ ${MAX_BYTES / 1024} KB`, svg.length <= MAX_BYTES, `${Math.round(svg.length / 1024)} KB`);
  const text = visibleText(svg).toLowerCase();
  const leaked = (a.forbiddenText || []).filter(w => text.includes(w.toLowerCase()));
  check(`${a.file} does not print its answer`, !leaked.length, `contains ${leaked.join(', ')}`);
  for (const id of a.requiredIds || []) check(`${a.file} has #${id}`, svg.includes(`id="${id}"`), 'missing region id');
}

if (process.argv.includes('--render')) {
  const { chromium } = require('playwright');
  const outDir = path.join(__dirname, 'screenshots');
  fs.mkdirSync(outDir, { recursive: true });
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 600, height: 700 } });
    for (const a of manifest.assets) {
      const f = path.join(DIR, a.file);
      if (!fs.existsSync(f)) continue;
      const uri = 'data:image/svg+xml;base64,' + fs.readFileSync(f).toString('base64');
      // nosemgrep: playwright-setcontent-injection — uri is base64 of a repo file, no quotes or markup possible
      await page.setContent(`<body style="margin:0;background:#fff"><img data-testid="asset" src="${uri}" style="width:560px;display:block;margin:20px"></body>`);
      await (await page.$('[data-testid=asset]')).screenshot({ path: path.join(outDir, `task17-${a.file.replace('.svg', '')}.png`) });
    }
    await browser.close();
    console.log(`rendered → tests/screenshots/task17-*.png`);
    finish();
  })();
} else finish();

function finish() {
  console.log(`assets: ${pass} passed, ${fail} failed`);
  if (fail) process.exit(1);
}
