#!/usr/bin/env node
// Zero-dependency validator for paper JSON files (BLUEPRINT §5.7, SCHEMA.md).
// Usage: node validate.js                      -> validates every app/data/*.json
//        node validate.js file.json            -> validates one file
//        node validate.js --intake x.json f    -> school papers checked against x.json (or env EVS_INTAKE)
// Env: EVS_REVIEW_DIR overrides sprints/v2/answer-review (review sheets of school papers).
'use strict';
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'app', 'data');
const ASSET_DIR = path.join(__dirname, 'app', 'assets');
const ID_RE = /^[a-z]+-c\d+-s\d+-b\d+-i\d+$/;
const SCHOOL_ID_RE = /^evs-sp\d{2}-s\d+-b\d+-i\d+$/;
const ASSET_RE = /^assets\/[a-z0-9][a-z0-9-]*\.(svg|png|jpg)$/; // no traversal out of app/assets
const TYPES = new Set(['mcq', 'multi-select', 'true-false', 'fill-blank', 'match', 'one-word', 'short', 'long', 'numeric', 'diagram-label', 'draw', 'handwriting', 'activity']);
const SCHOOL_TYPES = new Set([...TYPES, 'transformation']);
const PLACEHOLDER_RE = /\b(TODO|TBD|lorem)\b|\[\s*\]|\{\s*\}/i;
const MIN_ITEMS = 45, MAX_ITEMS = 60;
const DEFAULT_INTAKE = path.join(__dirname, 'source', 'intake.json');
const DEFAULT_REVIEW_DIR = path.join(__dirname, 'sprints', 'v2', 'answer-review');
const ACCEPTABLE_TYPES = ['fill-blank', 'one-word', 'transformation'];
const JUDGEMENT_TYPES = ['short', 'long', 'draw', 'activity'];
const FALLBACK_FIELDS = ['q', 'instruction', 'heading', 'option', 'passage'];

// half-units: marks are compared as integers (0.5 -> 1); null if not a ½ multiple
const hu = (m) => (typeof m === 'number' && Math.abs(m * 2 - Math.round(m * 2)) < 1e-9 ? Math.round(m * 2) : null);
const isStr = (s) => typeof s === 'string' && s.trim() !== '';
const strList = (a) => Array.isArray(a) && a.length > 0 && a.every(isStr);

// whole-word, case-insensitive containment (letters/digits on either side break the match)
const WORD_CH = /[\p{L}\p{N}]/u;
function hasWord(hay, needle) {
  const h = hay.toLowerCase(), n = needle.trim().toLowerCase();
  for (let i = h.indexOf(n); i !== -1; i = h.indexOf(n, i + 1)) {
    if (!WORD_CH.test(h[i - 1] || ' ') && !WORD_CH.test(h[i + n.length] || ' ')) return true;
  }
  return false;
}

const intakeCache = new Map();
function loadIntake(file) {
  if (!intakeCache.has(file)) {
    let v;
    try { v = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { v = { error: `cannot read intake ${path.relative(__dirname, file)}: ${e.message}` }; }
    intakeCache.set(file, v);
  }
  return intakeCache.get(file);
}

// Caption/alt-text check (all papers): an item is picture-dependent when its block has a
// stimulus or the item has a pictureDescription; none of those texts may contain the
// item's answer (or any answer element / acceptable string) as a whole word.
function checkGiveaway(blk, it, err) {
  if (!blk.stimulus && !it.pictureDescription) return;
  if (['true-false', 'match'].includes(it.type)) return;
  const needles = [...(Array.isArray(it.answer) ? it.answer : [it.answer]), ...(Array.isArray(it.acceptable) ? it.acceptable : [])]
    .filter(s => typeof s === 'string' && s.trim().length >= 2);
  const hays = [['stimulus caption', blk.stimulus && blk.stimulus.caption], ['stimulus alt', blk.stimulus && blk.stimulus.alt], ['pictureDescription', it.pictureDescription]];
  for (const [where, hay] of hays) {
    if (typeof hay !== 'string') continue;
    const hit = needles.find(n => hasWord(hay, n));
    if (hit) err(`${it.id}: ${where} gives away the answer "${hit}"`);
  }
}

// School-only item checks (kind: "school").
function checkSchoolItem(it, paper, err) {
  const id = it.id;
  if (it.id && SCHOOL_ID_RE.test(it.id) && paper.sp && !it.id.startsWith(`evs-${paper.sp}-`)) err(`${id}: id does not match sp ${paper.sp}`);
  if (typeof it.marks === 'number' && it.marks > 0 && hu(it.marks) === null) err(`${id}: marks ${it.marks} is not a multiple of 0.5`);
  if (it.answerSource !== 'authored') err(`${id}: answerSource must be "authored"`);
  if (!['sure', 'check'].includes(it.answerConfidence)) err(`${id}: answerConfidence must be "sure" or "check"`);
  if (!['easy', 'medium', 'hard'].includes(it.difficulty)) err(`${id}: difficulty must be easy|medium|hard`);
  for (const k of ['label', 'pictureDescription', 'teacherNote']) if (it[k] !== undefined && !isStr(it[k])) err(`${id}: ${k} must be a non-empty string`);
  if (it.topics !== undefined && !strList(it.topics)) err(`${id}: topics must be a non-empty list of strings`);
  // acceptable (gated to school, see SCHEMA.md Decisions)
  if (ACCEPTABLE_TYPES.includes(it.type) && !strList(it.acceptable)) err(`${id}: ${it.type} needs a non-empty acceptable list`);
  else if (it.acceptable !== undefined && !strList(it.acceptable)) err(`${id}: acceptable must be a non-empty list of strings`);
  // band rubric (gated to school, see SCHEMA.md Decisions)
  const judgement = JUDGEMENT_TYPES.includes(it.type) || (it.answerConfidence === 'check' && it.marks > 1);
  if (judgement && !Array.isArray(it.rubric)) err(`${id}: judgement item needs a band rubric`);
  if (it.rubric !== undefined) {
    if (!Array.isArray(it.rubric) || !it.rubric.length) err(`${id}: rubric must be a non-empty list of bands`);
    else {
      it.rubric.forEach((b, i) => {
        if (!b || !isStr(b.band) || !isStr(b.descriptor) || hu(b.marks) === null || b.marks < 0 || b.marks > it.marks) err(`${id}: rubric band ${i} needs band, descriptor and ½-step marks within 0–${it.marks}`);
      });
      const full = it.rubric.filter(b => b && b.band === 'full');
      if (full.length !== 1) err(`${id}: rubric needs exactly one "full" band`);
      else if (hu(full[0].marks) !== hu(it.marks)) err(`${id}: rubric full band ${full[0].marks} != marks ${it.marks}`);
    }
  }
  // underline spans: character offsets into q
  if (it.underline !== undefined) {
    const len = String(it.q || '').length;
    if (!Array.isArray(it.underline) || !it.underline.length) err(`${id}: underline must be a non-empty list of spans`);
    else for (const u of it.underline) {
      if (!u || !Number.isInteger(u.start) || !Number.isInteger(u.end) || u.start < 0 || u.start >= u.end || u.end > len) err(`${id}: underline span ${u && u.start}–${u && u.end} outside q (length ${len})`);
    }
  }
}

// School-only paper checks against the intake entry and the fallbackText list.
function checkSchoolPaper(paper, opts, err) {
  if (!/^sp\d{2}$/.test(String(paper.sp))) err(`sp "${paper.sp}" must look like sp01`);
  for (const k of ['sp', 'sourceFile', 'shortLabel']) if (!isStr(paper[k])) err(`missing paper field "${k}"`);
  const intake = loadIntake(opts.intake);
  if (intake.error) return err(intake.error);
  const entry = (intake.papers || []).find(p => p.sp === paper.sp);
  if (!entry) return err(`no intake entry for ${paper.sp} in ${path.relative(__dirname, opts.intake)}`);
  if (isStr(paper.sourceFile) && paper.sourceFile !== entry.sourceFile) err(`sourceFile "${paper.sourceFile}" != intake "${entry.sourceFile}"`);
  if (hu(paper.totalMarks) !== hu(entry.printedTotal)) err(`totalMarks ${paper.totalMarks} != intake printedTotal ${entry.printedTotal}`);
  const secs = paper.sections || [], want = entry.sections || [];
  if (secs.length !== want.length) err(`section count ${secs.length} != intake ${want.length}`);
  secs.forEach((s, i) => { if (want[i] && hu(s.marks) !== hu(want[i].marks)) err(`section ${s.code}: marks ${s.marks} != intake ${want[i].marks}`); });
}

function checkFallback(paper, err) {
  if (paper.fallbackText === undefined) return;
  if (!Array.isArray(paper.fallbackText)) return err('fallbackText must be a list');
  const where = new Set();
  (paper.sections || []).forEach((s, si) => {
    where.add(`s${si + 1}`);
    (s.blocks || []).forEach((b, bi) => { where.add(`s${si + 1}-b${bi + 1}`); (b.items || []).forEach(it => where.add(it.id)); });
  });
  paper.fallbackText.forEach((f, i) => {
    if (!f || !where.has(f.where)) err(`fallbackText[${i}]: where "${f && f.where}" matches no item, section or block`);
    else if (!FALLBACK_FIELDS.includes(f.field) || !isStr(f.text) || !isStr(f.reason)) err(`fallbackText[${i}]: needs field (${FALLBACK_FIELDS.join('|')}), text and reason`);
  });
}

// Review sheet freshness: regenerate in memory and compare with the file on disk.
function checkSheet(paper, raw, opts, err) {
  let renderSheet;
  try { ({ renderSheet } = require('./scripts/review-sheet.js')); } catch (e) { return err(`review sheet: cannot load scripts/review-sheet.js (${e.code || e.message})`); }
  if (!/^sp\d{2}$/.test(String(paper.sp))) return; // bad sp already reported; never build a path from it
  const f = path.join(opts.reviewDir, `${paper.sp}.md`);
  if (!fs.existsSync(f)) return err(`review sheet ${path.basename(f)} is missing (run node scripts/review-sheet.js ${paper.sp})`);
  let want;
  try { want = renderSheet(paper, raw); } catch (e) { return err(`review sheet: renderSheet failed: ${e.message}`); }
  if (fs.readFileSync(f, 'utf8') !== want) err(`review sheet ${path.basename(f)} is out of date (run node scripts/review-sheet.js ${paper.sp})`);
}

function validatePaper(file, opts = {}) {
  opts = { intake: opts.intake || process.env.EVS_INTAKE || DEFAULT_INTAKE, reviewDir: opts.reviewDir || process.env.EVS_REVIEW_DIR || DEFAULT_REVIEW_DIR };
  const errors = [];
  const err = (m) => errors.push(m);
  let paper;
  try {
    paper = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return { errors: [`not valid JSON: ${e.message}`], items: 0 };
  }
  const school = paper.kind === 'school';
  if (paper.schemaVersion !== '2.0') err(`unknown schemaVersion ${paper.schemaVersion}`);
  for (const k of ['subject', 'title', 'subtitle', 'totalMarks', 'sections', 'locale', 'numerals']) {
    if (paper[k] === undefined || paper[k] === '') err(`missing paper field "${k}"`);
  }
  if (school) checkSchoolPaper(paper, opts, err);
  const ids = new Set();
  let paperTotal = 0, itemCount = 0, paperHu = 0, badHu = false; // badHu: some item marks not ½-steps (already reported)
  const raw = fs.readFileSync(file, 'utf8');
  const ph = raw.match(PLACEHOLDER_RE);
  if (ph) err(`placeholder text found: "${ph[0]}"`);

  (paper.sections || []).forEach((sec, si) => {
    let secTotal = 0, secHu = 0;
    if (!sec.code || !sec.title || typeof sec.marks !== 'number') err(`section ${si} missing code/title/marks`);
    (sec.blocks || []).forEach((blk, bi) => {
      if (!blk.num) err(`section ${sec.code} block ${bi} missing num`);
      if (blk.stimulus && blk.stimulus.asset && !ASSET_RE.test(blk.stimulus.asset)) err(`asset path "${blk.stimulus.asset}" must look like assets/name.svg`);
      else if (blk.stimulus && blk.stimulus.asset) {
        const p = path.join(__dirname, 'app', blk.stimulus.asset);
        if (!fs.existsSync(p)) err(`asset missing: ${blk.stimulus.asset}`);
        if (!blk.stimulus.caption) err(`asset ${blk.stimulus.asset} has no caption`);
      }
      (blk.items || []).forEach((it) => {
        itemCount++;
        if (!it.id || !(school ? SCHOOL_ID_RE : ID_RE).test(it.id)) err(`bad id "${it.id}"`);
        if (ids.has(it.id)) err(`duplicate id ${it.id}`);
        ids.add(it.id);
        if (!(school ? SCHOOL_TYPES : TYPES).has(it.type)) err(`${it.id}: unknown type "${it.type}"`);
        if (!it.q || !String(it.q).trim()) err(`${it.id}: empty q`);
        const ans = Array.isArray(it.answer) ? it.answer.join('') : it.answer;
        if (!ans || !String(ans).trim()) err(`${it.id}: empty answer`);
        if (typeof it.marks !== 'number' || it.marks <= 0) err(`${it.id}: bad marks`);
        if (it.marks > 1 && !(Array.isArray(it.answerPoints) && it.answerPoints.length) && !it.markingGuide) err(`${it.id}: ${it.marks} marks but no answerPoints/markingGuide`);
        if (Array.isArray(it.answerPoints) && it.answerPoints.length) {
          const s = it.answerPoints.reduce((a, p) => a + (p.marks || 0), 0);
          if (school ? hu(s) !== hu(it.marks) || hu(s) === null : s !== it.marks) err(`${it.id}: answerPoints sum ${school ? it.answerPoints.reduce((a, p) => a + (hu(p.marks) || 0), 0) / 2 : s} != marks ${it.marks}`);
        }
        if (it.type === 'mcq' && school) {
          // printed papers: ≥2 options; an array answer lists every defensible option
          if (!Array.isArray(it.options) || it.options.length < 2) err(`${it.id}: mcq needs at least 2 options`);
          else if (Array.isArray(it.answer)) {
            if (!it.answer.length) err(`${it.id}: mcq answer list is empty`);
            it.answer.filter(a => !it.options.includes(a)).forEach(a => err(`${it.id}: mcq answer "${a}" not in options`));
          } else if (!it.options.includes(it.answer)) err(`${it.id}: mcq answer not in options`);
        } else if (it.type === 'mcq') {
          if (!Array.isArray(it.options) || it.options.length < 3 || it.options.length > 4) err(`${it.id}: mcq needs 3–4 options`);
          else if (!it.options.includes(it.answer)) err(`${it.id}: mcq answer not in options`);
        }
        if (it.type === 'true-false' && !/^(True|False)\b/.test(String(it.answer))) err(`${it.id}: true-false answer must start with True/False`);
        if (it.type === 'match' && school) {
          // pairs may differ from marks only for a ½-step per pair, or with a teacherNote
          if (!Array.isArray(it.pairs) || it.pairs.length < 2) err(`${it.id}: match needs at least 2 pairs`);
          else if (it.pairs.length !== it.marks && !(hu(it.marks) !== null && hu(it.marks) % it.pairs.length === 0) && !isStr(it.teacherNote)) err(`${it.id}: match has ${it.pairs.length} pairs but ${it.marks} marks (no ½-step per pair, no teacherNote)`);
        } else if (it.type === 'match') {
          if (!Array.isArray(it.pairs) || it.pairs.length < 3) err(`${it.id}: match needs pairs`);
          else if (it.pairs.length !== it.marks) err(`${it.id}: match has ${it.pairs.length} pairs but ${it.marks} marks`);
        }
        if (['draw', 'handwriting', 'activity'].includes(it.type) && !it.markingGuide) err(`${it.id}: ${it.type} needs markingGuide`);
        checkGiveaway(blk, it, err);
        if (school) checkSchoolItem(it, paper, err);
        secTotal += it.marks;
        secHu += hu(it.marks) || 0;
        if (hu(it.marks) === null) badHu = true;
      });
    });
    if (school) {
      if (!badHu && hu(sec.marks) !== secHu) err(`section ${sec.code}: items sum to ${secHu / 2}, declared ${sec.marks}`);
    } else if (secTotal !== sec.marks) err(`section ${sec.code}: items sum to ${secTotal}, declared ${sec.marks}`);
    paperTotal += secTotal;
    paperHu += secHu;
  });
  if (school) {
    if (!badHu && paperHu !== hu(paper.totalMarks)) err(`paper total ${paperHu / 2} != totalMarks ${paper.totalMarks}`);
    paperTotal = paperHu / 2;
    checkFallback(paper, err);
    checkSheet(paper, raw, opts, err);
  } else {
    if (paperTotal !== paper.totalMarks) err(`paper total ${paperTotal} != totalMarks ${paper.totalMarks}`);
    if (itemCount < MIN_ITEMS || itemCount > MAX_ITEMS) err(`item count ${itemCount} outside ${MIN_ITEMS}–${MAX_ITEMS}`);
  }
  return { errors, items: itemCount, total: paperTotal };
}

function main() {
  const args = process.argv.slice(2);
  const opts = {};
  const i = args.indexOf('--intake');
  if (i !== -1) {
    if (!args[i + 1]) { console.error('validate: --intake needs a path'); process.exit(1); }
    opts.intake = path.resolve(args[i + 1]);
    args.splice(i, 2);
  }
  const files = args.length ? args : fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json')).sort().map(f => path.join(DATA_DIR, f));
  if (!files.length) { console.error('validate: no paper files found'); process.exit(1); }
  let failed = false, items = 0;
  for (const f of files) {
    const r = validatePaper(f, opts);
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
