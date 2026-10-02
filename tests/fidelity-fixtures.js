#!/usr/bin/env node
// Zero-dependency fixture runner for scripts/fidelity.js and scripts/review-sheet.js.
// Usage: node tests/fidelity-fixtures.js   (exit 1 on any unexpected result)
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const FIX = path.join(__dirname, 'fixtures', 'fidelity');
const FIDELITY = path.join(ROOT, 'scripts', 'fidelity.js');
const SHEET = path.join(ROOT, 'scripts', 'review-sheet.js');

let pass = 0, fail = 0;
function check(name, fn) {
  let msg;
  try { msg = fn(); } catch (e) { msg = e.message; }
  if (msg === true) { pass++; console.log(`✓ ${name}`); } else { fail++; console.log(`✗ ${name}\n    ${String(msg).split('\n').join('\n    ')}`); }
}
const run = (script, args) => {
  const r = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', env: { ...process.env, FIDELITY_PDF_DIR: path.join(FIX, 'no-pdfs') } });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
};
const fid = (dataCase, sp = 'sp90') => run(FIDELITY, ['--data-dir', path.join(FIX, dataCase), '--cache-dir', path.join(FIX, 'cache'), '--intake', path.join(FIX, 'intake.json'), sp]);
const expect = (r, code, ...patterns) => {
  if (r.code !== code) return `exit ${r.code}, wanted ${code}\n${r.out}`;
  for (const p of patterns) if (!p.test(r.out)) return `output lacks ${p}\n${r.out}`;
  return true;
};

// ---- fidelity: CLI over fixtures ----
check('fidelity: clean paper passes', () => expect(fid('pass'), 0, /^sp90: 18\/18 strings matched, 0 fallback \(0%\)$/m));
check('fidelity: one altered word fails and names the item', () => expect(fid('altered-word'), 1, /evs-sp90-s1-b2-i2/, /write three rules/));
check('fidelity: wrong section mark fails', () => expect(fid('wrong-mark'), 1, /section B/i, /marks/));
check('fidelity: whitespace / quote / hyphen / case variant passes', () => expect(fid('variants'), 0, /^sp90: 18\/18 strings matched/m));
check('fidelity: fallbackText case passes and is reported', () => expect(fid('fallback'), 0, /^sp90: 17\/18 strings matched, 1 fallback/m, /evs-sp90-s2-b1-i1.*q.*text drawn inside picture/));
check('fidelity: fallbackText whose text differs from the JSON fails', () => expect(fid('bad-fallback'), 1, /evs-sp90-s2-b1-i1/));
check('fidelity: garbled paper reports 100% fallback', () => expect(fid('all-fallback', 'sp91'), 0, /^sp91: 100% fallback$/m));
check('fidelity: two-column passage needs the non-layout cache', () => expect(run(FIDELITY, ['--data-dir', path.join(FIX, 'pass'), '--cache-dir', path.join(FIX, 'cache-layout-only'), '--intake', path.join(FIX, 'intake.json'), 'sp90']), 1, /s2-b1 passage/));
check('fidelity: unknown paper id is rejected', () => expect(fid('pass', '../etc'), 1));

// ---- fidelity: normalise + checkPaper against the real text caches ----
const { normalise, checkPaper } = require(FIDELITY);
check('normalise: quotes, dashes, blanks, hyphenation, case', () => {
  const got = normalise('Why  “Children’s” – red-\n   coloured ______ ……… ( ) for-\nest?');
  return got === 'why childrens red coloured forest' || got === 'why childrens redcoloured forest' ? true : `got "${got}"`;
});
check('normalise: drops page footers and Devanagari-only lines', () => {
  const got = normalise('tall trees and\n        Page 1 of 4\n  P.T.O.\n   2\nकार्यपत्रक\nelephants');
  return got === 'tall trees and elephants' ? true : `got "${got}"`;
});
const realCase = (sp, strings, wantMatched) => () => {
  const file = path.join(ROOT, 'source', 'text-cache', `${sp}.txt`);
  if (!fs.existsSync(file)) return `missing ${file}`;
  const items = strings.map((q, i) => ({ id: `evs-${sp}-s1-b1-i${i + 1}`, q, marks: 1 }));
  const paper = { sp, totalMarks: items.length, fallbackText: [], sections: [{ code: 'A', title: '', marks: items.length, blocks: [{ num: 'Q1', items }] }] };
  const intake = { sp, printedTotal: items.length, sections: [{ code: 'A', marks: items.length }] };
  const r = checkPaper(paper, intake, [fs.readFileSync(file, 'utf8')]);
  const missed = r.mismatches.map(m => m.where);
  const want = items.filter((_, i) => wantMatched[i]).map(it => it.id);
  const wrong = items.filter(it => missed.includes(it.id) === want.includes(it.id));
  return wrong.length ? `unexpected result for ${wrong.map(w => w.id + ' "' + w.q + '"').join(', ')}` : true;
};
check('real sp01 cache: blanks, column gaps, hyphen words match; altered words do not', realCase('sp01', [
  'Fill in the blanks choosing the correct answer from the options given below (5)',
  'Indian Giant Squirrel is a big red-coloured ______________ found in Panchmarhi.',
  'Nature is full of amazing ________.',
  'plants and animals',
  'Abha Didi was a natural scientist.',
  'Indian Giant Squirrel is a big red-coloured ____ found in Pachmarhi.',
  'Nature is full of amazing plants.',
  'Abha Didi was a natural teacher.',
], [true, true, true, true, true, false, false, false]));
check('real sp03 cache: multi-line questions, footers, curly quotes match', realCase('sp03', [
  'Where do we drop our letters to be sent? Who delivers letters to our home?',
  'Which famous Indian prominent leader\'s image is printed on the note?',
  'I am an insect, green in colour. I have three pairs of legs, one pair of antennae to sense surroundings, also sometimes have two pairs of wings.',
  'Name the following . (4x1=4)',
  'A hut built using bamboo and hay during Magh Bihu – ______',
  'Where do we drop our parcels to be sent? Who delivers letters to our home?',
], [true, true, true, true, true, false]));

check('real sp05 cache: spaced mark brackets and number-only strings match; changed marks do not', realCase('sp05', [
  'Fill in the gaps with the correct answer. ( 6 x 1 = 6 )',
  '6',
  '7',
  'Fill in the gaps with the correct answer. ( 5 x 1 = 6 )',
  'Fill in the gaps with the wrong answer.',
], [true, true, true, false, false]));
check('normalise: digit x digit splits into tokens', () => {
  const a = normalise('(6x1=6 )'), b = normalise('( 6 x 1 = 6 )'), c = normalise('( 6 × ½ = 3 )'), d = normalise('(6x½=3)');
  return a === b && c === d ? true : `got "${a}" / "${b}" / "${c}" / "${d}"`;
});

// ---- review sheet ----
const { renderSheet } = require(SHEET);
const rawPass = fs.readFileSync(path.join(FIX, 'pass', 'evs-sp90.json'), 'utf8');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const sheet = renderSheet(JSON.parse(rawPass), rawPass);
check('review sheet: first line carries the JSON sha256', () => {
  const want = `<!-- generated from app/data/evs-sp90.json sha256:${sha(rawPass)} — do not edit -->`;
  return sheet.split('\n')[0] === want ? true : `first line: ${sheet.split('\n')[0]}`;
});
check('review sheet: deterministic', () => renderSheet(JSON.parse(rawPass), rawPass) === sheet || 'two renders differ');
check('review sheet: ⚑ items first, then all items in section order', () => {
  const a = sheet.indexOf('⚑ Check these first'), b = sheet.indexOf('All items');
  if (a < 0 || b < 0 || a > b) return 'missing or misordered headings';
  const flagged = sheet.slice(a, b);
  if (!/red-coloured/.test(flagged) || !/footprints/.test(flagged)) return 'check items missing from ⚑ section';
  if (/Nature is full/.test(flagged)) return 'sure item listed under ⚑';
  const all = sheet.slice(b);
  const order = ['Nature is full', 'red-coloured', 'footprints', 'two rules', 'Who led the trail'].map(s => all.indexOf(s));
  if (order.some(i => i < 0) || order.some((v, i) => i && v < order[i - 1])) return `section order wrong: ${order}`;
  if (!/Answers written for practice, not by the teacher — ⚑ marks ones worth a second look\./.test(sheet)) return 'disclaimer missing';
  if (!/⚑[^\n]*2/.test(sheet.split('All items')[0])) return 'flag count missing';
  for (const s of ['plants and animals', 'giant squirrel', 'One difference', 'A teacher walking', 'Printed options include', 'Ch 1, p.7', 'fixture-sp90.pdf', 'Worksheet (2025-26)']) if (!sheet.includes(s)) return `sheet lacks "${s}"`;
  return true;
});
check('review sheet: editing the JSON changes the hash line', () => {
  const edited = rawPass.replace('Abha Didi', 'Abha  Didi');
  return renderSheet(JSON.parse(edited), edited).split('\n')[0] !== sheet.split('\n')[0] || 'hash line unchanged';
});
check('review sheet: CLI writes, --check passes, hand edit fails --check', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'review-sheet-'));
  try {
    const base = ['--data-dir', path.join(FIX, 'pass'), '--out-dir', out];
    let r = run(SHEET, [...base, 'sp90']);
    if (r.code !== 0) return `write failed: ${r.out}`;
    const f = path.join(out, 'sp90.md');
    if (fs.readFileSync(f, 'utf8') !== sheet) return 'written sheet differs from renderSheet';
    r = run(SHEET, [...base, '--check', 'sp90']);
    if (r.code !== 0) return `--check on fresh sheet failed: ${r.out}`;
    fs.appendFileSync(f, 'hand edit\n');
    r = run(SHEET, [...base, '--check', 'sp90']);
    return r.code === 1 ? true : `--check after edit exited ${r.code}`;
  } finally { fs.rmSync(out, { recursive: true, force: true }); }
});

console.log(`fidelity-fixtures: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
