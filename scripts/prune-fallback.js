#!/usr/bin/env node
// Removes fallbackText entries that are no longer needed (the string now matches the text
// cache on its own). Usage: node scripts/prune-fallback.js spNN   (rewrites app/data/evs-spNN.json)
'use strict';
const fs = require('fs');
const path = require('path');
const { checkPaper } = require('./fidelity.js');
const sp = process.argv[2];
if (!/^sp\d{2}$/.test(String(sp))) { console.error('usage: node scripts/prune-fallback.js spNN'); process.exit(2); }
const ROOT = path.join(__dirname, '..');
const file = path.join(ROOT, 'app', 'data', `evs-${sp}.json`);
const paper = JSON.parse(fs.readFileSync(file, 'utf8'));
const intake = (JSON.parse(fs.readFileSync(path.join(ROOT, 'source', 'intake.json'), 'utf8')).papers || []).find(p => p.sp === sp);
const caches = [`${sp}.txt`, `${sp}.raw.txt`].map(f => path.join(ROOT, 'source', 'text-cache', f)).filter(fs.existsSync).map(f => fs.readFileSync(f, 'utf8'));
const before = (paper.fallbackText || []).length;
const keep = [];
for (const e of paper.fallbackText || []) {
  const others = (paper.fallbackText || []).filter(x => x !== e);
  const r = checkPaper({ ...paper, fallbackText: others }, intake, caches);
  if (r.mismatches.some(m => m.where === e.where)) keep.push(e);
}
if (keep.length) paper.fallbackText = keep; else delete paper.fallbackText;
fs.writeFileSync(file, JSON.stringify(paper, null, 2) + '\n');
console.log(`prune-fallback: ${sp} ${before} → ${keep.length} fallbackText entries`);
