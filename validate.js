#!/usr/bin/env node
// Zero-dependency validator for paper JSON files (BLUEPRINT §5.7).
// Usage: node validate.js            -> validates every app/data/*.json
//        node validate.js file.json  -> validates one file
'use strict';
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'app', 'data');
const ASSET_DIR = path.join(__dirname, 'app', 'assets');
const ID_RE = /^[a-z]+-c\d+-s\d+-b\d+-i\d+$/;
const TYPES = new Set(['mcq', 'multi-select', 'true-false', 'fill-blank', 'match', 'one-word', 'short', 'long', 'numeric', 'diagram-label', 'draw', 'handwriting', 'activity']);
const PLACEHOLDER_RE = /\b(TODO|TBD|lorem)\b|\[\s*\]|\{\s*\}/i;
const MIN_ITEMS = 45, MAX_ITEMS = 60;

function validatePaper(file) {
  const errors = [];
  const err = (m) => errors.push(m);
  let paper;
  try {
    paper = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return { errors: [`not valid JSON: ${e.message}`], items: 0 };
  }
  if (paper.schemaVersion !== '2.0') err(`unknown schemaVersion ${paper.schemaVersion}`);
  for (const k of ['subject', 'title', 'subtitle', 'totalMarks', 'sections', 'locale', 'numerals']) {
    if (paper[k] === undefined || paper[k] === '') err(`missing paper field "${k}"`);
  }
  const ids = new Set();
  let paperTotal = 0, itemCount = 0;
  const raw = fs.readFileSync(file, 'utf8');
  const ph = raw.match(PLACEHOLDER_RE);
  if (ph) err(`placeholder text found: "${ph[0]}"`);

  (paper.sections || []).forEach((sec, si) => {
    let secTotal = 0;
    if (!sec.code || !sec.title || typeof sec.marks !== 'number') err(`section ${si} missing code/title/marks`);
    (sec.blocks || []).forEach((blk, bi) => {
      if (!blk.num) err(`section ${sec.code} block ${bi} missing num`);
      if (blk.stimulus && blk.stimulus.asset) {
        const p = path.join(__dirname, 'app', blk.stimulus.asset);
        if (!fs.existsSync(p)) err(`asset missing: ${blk.stimulus.asset}`);
        if (!blk.stimulus.caption) err(`asset ${blk.stimulus.asset} has no caption`);
      }
      (blk.items || []).forEach((it) => {
        itemCount++;
        if (!it.id || !ID_RE.test(it.id)) err(`bad id "${it.id}"`);
        if (ids.has(it.id)) err(`duplicate id ${it.id}`);
        ids.add(it.id);
        if (!TYPES.has(it.type)) err(`${it.id}: unknown type "${it.type}"`);
        if (!it.q || !String(it.q).trim()) err(`${it.id}: empty q`);
        const ans = Array.isArray(it.answer) ? it.answer.join('') : it.answer;
        if (!ans || !String(ans).trim()) err(`${it.id}: empty answer`);
        if (typeof it.marks !== 'number' || it.marks <= 0) err(`${it.id}: bad marks`);
        if (it.marks > 1 && !(Array.isArray(it.answerPoints) && it.answerPoints.length) && !it.markingGuide) err(`${it.id}: ${it.marks} marks but no answerPoints/markingGuide`);
        if (Array.isArray(it.answerPoints) && it.answerPoints.length) {
          const s = it.answerPoints.reduce((a, p) => a + (p.marks || 0), 0);
          if (s !== it.marks) err(`${it.id}: answerPoints sum ${s} != marks ${it.marks}`);
        }
        if (it.type === 'mcq') {
          if (!Array.isArray(it.options) || it.options.length < 3 || it.options.length > 4) err(`${it.id}: mcq needs 3–4 options`);
          else if (!it.options.includes(it.answer)) err(`${it.id}: mcq answer not in options`);
        }
        if (it.type === 'true-false' && !/^(True|False)\b/.test(String(it.answer))) err(`${it.id}: true-false answer must start with True/False`);
        if (it.type === 'match') {
          if (!Array.isArray(it.pairs) || it.pairs.length < 3) err(`${it.id}: match needs pairs`);
          else if (it.pairs.length !== it.marks) err(`${it.id}: match has ${it.pairs.length} pairs but ${it.marks} marks`);
        }
        if (['draw', 'handwriting', 'activity'].includes(it.type) && !it.markingGuide) err(`${it.id}: ${it.type} needs markingGuide`);
        secTotal += it.marks;
      });
    });
    if (secTotal !== sec.marks) err(`section ${sec.code}: items sum to ${secTotal}, declared ${sec.marks}`);
    paperTotal += secTotal;
  });
  if (paperTotal !== paper.totalMarks) err(`paper total ${paperTotal} != totalMarks ${paper.totalMarks}`);
  if (itemCount < MIN_ITEMS || itemCount > MAX_ITEMS) err(`item count ${itemCount} outside ${MIN_ITEMS}–${MAX_ITEMS}`);
  return { errors, items: itemCount, total: paperTotal };
}

function main() {
  const args = process.argv.slice(2);
  const files = args.length ? args : fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json')).sort().map(f => path.join(DATA_DIR, f));
  if (!files.length) { console.error('validate: no paper files found'); process.exit(1); }
  let failed = false, items = 0;
  for (const f of files) {
    const r = validatePaper(f);
    items += r.items;
    if (r.errors.length) {
      failed = true;
      console.error(`✗ ${path.basename(f)}`);
      r.errors.forEach(e => console.error(`    - ${e}`));
    } else {
      console.log(`✓ ${path.basename(f)}  ${r.items} items, ${r.total} marks`);
    }
  }
  if (failed) { console.error('validate: FAILED'); process.exit(1); }
  console.log(`validate: OK — ${files.length} papers, ${items} items`);
}

if (require.main === module) main();
module.exports = { validatePaper };
