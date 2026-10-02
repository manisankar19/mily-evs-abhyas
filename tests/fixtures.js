#!/usr/bin/env node
// Zero-dependency fixture runner for validate.js (sprint v2 Task 12).
// Each bad fixture must FAIL with an error containing the expected substring;
// the good school fixture and the real app/data papers must pass.
// Usage: node tests/fixtures.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SCHOOL = path.join(__dirname, 'fixtures', 'school');
const OPTS = { intake: path.join(SCHOOL, 'intake.json'), reviewDir: path.join(SCHOOL, 'review') };
const HAS_SHEET_GEN = fs.existsSync(path.join(ROOT, 'scripts', 'review-sheet.js'));
const { validatePaper } = require(path.join(ROOT, 'validate.js'));

// fixture (relative to tests/fixtures) -> substring the validator's error must contain
const EXPECT = {
  'school/bad-answer-asset-path.json': 'answerAsset "../secret.svg" must look like assets/name.svg',
  'school/bad-answer-asset-missing.json': 'answerAsset missing: assets/sp99-no-such-key.svg',
  'school/bad-adaptation-empty.json': 'block 1 adaptation must be a non-empty string',
  'school/bad-id.json': 'bad id "evs-sp99-s1-b1-x1"',
  'school/bad-total-intake.json': 'totalMarks 11 != intake printedTotal 10',
  'school/bad-section-marks-intake.json': 'section A: marks 3 != intake 4',
  'school/bad-section-count-intake.json': 'section count 1 != intake 2',
  'school/bad-mark-0.3.json': 'marks 0.3 is not a multiple of 0.5',
  'school/bad-halfmark-sum.json': 'section A: items sum to 4.5, declared 4',
  'school/bad-answerpoints-sum.json': 'answerPoints sum 2.5 != marks 2',
  'school/bad-missing-acceptable.json': 'evs-sp99-s1-b1-i1: fill-blank needs a non-empty acceptable list',
  'school/bad-missing-rubric.json': 'evs-sp99-s2-b2-i1: judgement item needs a band rubric',
  'school/bad-rubric-full-band.json': 'evs-sp99-s2-b2-i1: rubric full band 1.5 != marks 2',
  'school/bad-caption-gives-answer.json': 'evs-sp99-s2-b1-i1: stimulus caption gives away the answer "camel"',
  'school/bad-alt-gives-acceptable.json': 'evs-sp99-s2-b1-i1: stimulus alt gives away the answer "ship of the desert"',
  'school/bad-picturedesc-gives-answer.json': 'evs-sp99-s2-b1-i1: pictureDescription gives away the answer "camel"',
  'school/bad-underline-span.json': 'evs-sp99-s2-b1-i1: underline span 30–99 outside q (length 37)',
  'school/bad-missing-confidence.json': 'evs-sp99-s1-b1-i2: answerConfidence must be "sure" or "check"',
  'school/bad-answer-source.json': 'evs-sp99-s1-b1-i2: answerSource must be "authored"',
  'school/bad-missing-difficulty.json': 'evs-sp99-s1-b1-i2: difficulty must be easy|medium|hard',
  'school/bad-missing-sourcefile.json': 'missing paper field "sourceFile"',
  'school/bad-sourcefile-mismatch.json': 'sourceFile "some other.pdf" != intake "fixture good worksheet.pdf"',
  'school/bad-no-intake-entry.json': 'no intake entry for sp98',
  'school/bad-mcq-answer-not-in-options.json': 'evs-sp99-s1-b2-i1: mcq answer not in options',
  'school/bad-mcq-array-answer.json': 'evs-sp99-s1-b2-i1: mcq answer "horse" not in options',
  'school/bad-mcq-one-option.json': 'evs-sp99-s1-b2-i1: mcq needs at least 2 options',
  'school/bad-match-pairs-marks.json': 'evs-sp99-s1-b3-i1: match has 3 pairs but 2 marks (no ½-step per pair, no teacherNote)',
  'school/bad-fallback-where.json': 'fallbackText[0]: where "evs-sp99-s9-b1-i1" matches no item, section or block',
  'school/bad-stale-review-sheet.json': 'review sheet sp97.md is out of date',
  'chapter/bad-caption.json': 'evs-c3-s1-b1-i1: stimulus caption gives away the answer "Gaur"',
  'chapter/bad-asset-path.json': 'asset path "../../.env.local" must look like assets/name.svg',
};
const NEEDS_SHEET_GEN = new Set(['school/bad-stale-review-sheet.json']);
const SHEET_GEN_ERR = /scripts\/review-sheet\.js/;

let pass = 0, fail = 0, skip = 0;
const ok = (name, msg) => { pass++; console.log(`PASS ${name}${msg ? '  ' + msg : ''}`); };
const bad = (name, msg) => { fail++; console.log(`FAIL ${name}  ${msg}`); };

// every bad-*.json on disk must have an expectation (and vice versa)
const onDisk = ['school', 'chapter'].flatMap(d => fs.readdirSync(path.join(__dirname, 'fixtures', d))
  .filter(f => /^bad-.*\.json$/.test(f)).map(f => `${d}/${f}`));
for (const f of onDisk) if (!(f in EXPECT)) bad(f, 'no expectation in EXPECT map');
for (const f of Object.keys(EXPECT)) if (!onDisk.includes(f)) bad(f, 'fixture file missing');

for (const [rel, want] of Object.entries(EXPECT)) {
  const file = path.join(__dirname, 'fixtures', rel);
  if (!fs.existsSync(file)) continue;
  if (NEEDS_SHEET_GEN.has(rel) && !HAS_SHEET_GEN) { skip++; console.log(`SKIP ${rel}  scripts/review-sheet.js missing`); continue; }
  const { errors } = validatePaper(file, OPTS);
  if (!errors.length) bad(rel, `expected failure containing "${want}", but it passed`);
  else if (!errors.some(e => e.includes(want))) bad(rel, `expected "${want}", got: ${errors.join(' | ')}`);
  else ok(rel, `→ ${want}`);
}

// the good school fixture passes (sheet check skipped while the generator is absent)
{
  const rel = 'school/good-school.json';
  let { errors } = validatePaper(path.join(SCHOOL, 'good-school.json'), OPTS);
  let note = '';
  if (!HAS_SHEET_GEN) { errors = errors.filter(e => !SHEET_GEN_ERR.test(e)); note = '(sheet check skipped: scripts/review-sheet.js missing)'; }
  errors.length ? bad(rel, errors.join(' | ')) : ok(rel, note);
}

// CLI: --intake flag + EVS_REVIEW_DIR on the good fixture
const run = (args, env) => {
  try { return { code: 0, out: execFileSync(process.execPath, [path.join(ROOT, 'validate.js'), ...args], { cwd: ROOT, env: { ...process.env, ...env }, encoding: 'utf8', stdio: 'pipe' }) }; }
  catch (e) { return { code: e.status, out: String(e.stdout) + String(e.stderr) }; }
};
if (HAS_SHEET_GEN) {
  const r = run(['--intake', OPTS.intake, path.join(SCHOOL, 'good-school.json')], { EVS_REVIEW_DIR: OPTS.reviewDir });
  r.code === 0 ? ok('cli good-school --intake') : bad('cli good-school --intake', r.out.trim());
} else { skip++; console.log('SKIP cli good-school --intake  scripts/review-sheet.js missing'); }
{
  const r = run([path.join(SCHOOL, 'bad-total-intake.json')], { EVS_INTAKE: OPTS.intake, EVS_REVIEW_DIR: OPTS.reviewDir });
  r.code === 1 && r.out.includes('!= intake printedTotal') ? ok('cli EVS_INTAKE bad-total-intake') : bad('cli EVS_INTAKE bad-total-intake', `exit ${r.code}: ${r.out.trim()}`);
}

// the real papers in app/data still pass
{
  const r = run([], {});
  r.code === 0 ? ok('app/data (node validate.js)', r.out.trim().split('\n').pop()) : bad('app/data (node validate.js)', r.out.trim());
}

console.log(`fixtures: ${pass} passed, ${fail} failed, ${skip} skipped`);
process.exit(fail ? 1 : 0);
