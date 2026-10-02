#!/usr/bin/env node
// Task 34: the single-file build carries each picture exactly once (an asset table), and
// every picture path a paper uses resolves in that table. Zero dependencies.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
const check = (name, ok, why) => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : '  ' + (why || '')}`); };

const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'evs-build-'));
execFileSync(process.execPath, [path.join(ROOT, 'build.js'), '--out-dir', OUT],
  { cwd: ROOT, env: { ...process.env, GANESH_EVS: process.env.GANESH_EVS || 'build-assets-test-code' }, stdio: 'pipe' });
const html = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
const uris = html.match(/data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]+/g) || [];
check('every inlined picture appears exactly once', uris.length === new Set(uris).size, `${uris.length} data URIs, ${new Set(uris).size} unique`);

const m = html.match(/window\.__EVS__ = (\{.*\});<\/script>/s);
const data = m ? JSON.parse(m[1]) : {};
const assets = data.assets || {}, alias = data.assetAlias || {};
const resolve = (u) => assets[alias[u] || u];
check('page data has an asset table', data.assets && typeof data.assets === 'object');
const used = new Set();
for (const p of data.papers || []) for (const s of p.sections) for (const b of s.blocks) {
  if (b.stimulus && b.stimulus.asset) used.add(b.stimulus.asset);
  for (const it of b.items) if (it.answerAsset) used.add(it.answerAsset);
}
check('papers reference pictures by path', [...used].every(u => /^assets\/[a-z0-9-]+\.svg$/.test(u)), [...used].filter(u => !/^assets\//.test(u)).slice(0, 2).join(', ').slice(0, 80));
for (const u of used) check(`asset table has ${u.slice(0, 60)}`, typeof resolve(u) === 'string' && resolve(u).startsWith('data:image/'));
check('no unused assets in the table', Object.keys(assets).every(k => used.has(k)));
check(`page under 1.5 MB (${Math.round(html.length / 1024)} KB)`, html.length < 1.5 * 1024 * 1024);
console.log(`build-assets: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
