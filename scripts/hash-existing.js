#!/usr/bin/env node
// Records or checks SHA-256 of the 6 existing (v1) paper JSONs, which must stay byte-identical.
// Usage: node scripts/hash-existing.js --record | --check
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const FILES = ['evs-ch1', 'evs-ch2', 'evs-ch3', 'evs-ch4', 'evs-ch5', 'evs-hy'].map(n => `app/data/${n}.json`);
const STORE = path.join(ROOT, 'sprints', 'v2', 'preflight-hashes.json');

const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, f))).digest('hex');

const mode = process.argv[2];
if (mode === '--record') {
  const out = {};
  for (const f of FILES) out[f] = sha(f);
  fs.writeFileSync(STORE, JSON.stringify(out, null, 2) + '\n');
  console.log(`hash-existing: recorded ${FILES.length} hashes → ${path.relative(ROOT, STORE)}`);
} else if (mode === '--check') {
  const want = JSON.parse(fs.readFileSync(STORE, 'utf8'));
  let bad = 0;
  for (const f of FILES) {
    if (!fs.existsSync(path.join(ROOT, f))) { console.error(`✗ ${f} missing`); bad++; continue; }
    if (sha(f) !== want[f]) { console.error(`✗ ${f} changed`); bad++; }
  }
  if (bad) { console.error(`hash-existing: FAILED — ${bad} file(s) differ from preflight`); process.exit(1); }
  console.log(`hash-existing: OK — ${FILES.length} existing papers byte-identical`);
} else {
  console.error('usage: node scripts/hash-existing.js --record | --check');
  process.exit(2);
}
