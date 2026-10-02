#!/usr/bin/env node
// Review sheet generator: one markdown sheet per school paper, from the JSON alone, ⚑ items first
// (sprints/v2/school-contract.md, "Review sheet"). Deterministic, zero dependencies.
// Usage: node scripts/review-sheet.js spNN [spNN …]   writes sprints/v2/answer-review/spNN.md
//        node scripts/review-sheet.js --all           every app/data/evs-spNN.json
//        node scripts/review-sheet.js --check [spNN]  exit 1 if a sheet on disk is missing or differs
//        --out-dir D (default sprints/v2/answer-review)   --data-dir D (default app/data)
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const SP_RE = /^sp\d{2}$/;
const DISCLAIMER = 'Answers written for practice, not by the teacher — ⚑ marks ones worth a second look.';

const esc = (s) => String(s).replace(/([\\`*_[\]<>|])/g, '\\$1');
const fmt = (v) => Array.isArray(v) ? v.map(fmt).join(' · ')
  : v && typeof v === 'object' ? Object.entries(v).map(([k, x]) => `${k}: ${fmt(x)}`).join(', ')
  : String(v);
const marks = (m) => `${m} mark${Number(m) === 1 ? '' : 's'}`;
const quote = (s) => String(s).split('\n').map(l => `> ${esc(l)}`).join('\n');
const flagged = (it) => it.answerConfidence === 'check';

function itemLabel(sec, blk, it) {
  const num = /^\d/.test(String(blk.num)) ? `Q${blk.num}` : String(blk.num || '');
  return [`Section ${sec.code}`, num, it.label].filter(Boolean).map(esc).join(' · ');
}

function renderItem(sec, blk, it, level = '###') {
  const out = [`${level} ${flagged(it) ? '⚑ ' : ''}${itemLabel(sec, blk, it)} — ${marks(it.marks)}`, ''];
  if (it.q) out.push(quote(it.q), '');
  const li = (name, v) => { if (v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length)) out.push(`- ${name}: ${esc(fmt(v))}`); };
  li('Options', it.options);
  if (Array.isArray(it.pairs) && it.pairs.length) {
    out.push('- Pairs:');
    it.pairs.forEach(p => out.push(`  - ${esc(Array.isArray(p) ? p.join(' → ') : p && typeof p === 'object' ? `${fmt(p.left)} → ${fmt(p.right)}` : fmt(p))}`));
  }
  out.push(`- **Answer: ${esc(fmt(it.answer === undefined ? '(none)' : it.answer))}**`);
  li('Also accept', it.acceptable);
  if (Array.isArray(it.answerPoints) && it.answerPoints.length) {
    out.push('- Answer points:');
    it.answerPoints.forEach(p => out.push(`  - ${esc(fmt(p.point))} (${marks(p.marks)})`));
  }
  if (Array.isArray(it.rubric) && it.rubric.length) {
    out.push('- Rubric:');
    it.rubric.forEach(b => out.push(`  - ${esc(b.band)} (${marks(b.marks)}): ${esc(fmt(b.descriptor))}`));
  }
  li('Model answer', it.modelAnswer);
  li('Marking guide', it.markingGuide);
  li('Source', it.sourceRef);
  li('Teacher note', it.teacherNote);
  li('Picture', it.pictureDescription);
  li('Answer picture (checking mode)', it.answerAsset);
  out.push('');
  return out.join('\n');
}

// paper: parsed JSON; rawJsonText: the exact file text (hashed into the first line).
function renderSheet(paper, rawJsonText) {
  const sha = crypto.createHash('sha256').update(rawJsonText, 'utf8').digest('hex');
  const all = [];
  (paper.sections || []).forEach(sec => (sec.blocks || []).forEach(blk => (blk.items || []).forEach(it => all.push({ sec, blk, it }))));
  const flags = all.filter(x => flagged(x.it));
  const out = [
    `<!-- generated from app/data/evs-${paper.sp}.json sha256:${sha} — do not edit -->`,
    `# ${esc(paper.title || paper.sp)}`, '',
  ];
  if (paper.shortLabel) out.push(`*${esc(paper.shortLabel)}*`, '');
  out.push(`- Source PDF: ${esc(paper.sourceFile || '(unknown)')}`,
    `- Total: ${marks(paper.totalMarks)} · ${all.length} items`,
    `- **⚑ to check: ${flags.length} of ${all.length} items**`, '',
    `> ${DISCLAIMER}`, '', '## ⚑ Check these first', '');
  if (!flags.length) out.push('None.', '');
  flags.forEach(x => out.push(renderItem(x.sec, x.blk, x.it)));
  out.push('## All items', '');
  (paper.sections || []).forEach(sec => {
    out.push(`### Section ${esc(sec.code)}${sec.title ? ` — ${esc(sec.title)}` : ''} (${marks(sec.marks)})`, '');
    (sec.blocks || []).forEach(blk => {
      const head = [blk.num && (/^\d/.test(String(blk.num)) ? `Q${blk.num}` : blk.num), blk.instruction].filter(Boolean).map(esc).join(' — ');
      if (head) out.push(`**${head}**`, '');
      if (blk.passage) out.push(quote(blk.passage), '');
      if (blk.stimulus && (blk.stimulus.caption || blk.stimulus.alt)) out.push(`*Picture: ${esc(blk.stimulus.caption || blk.stimulus.alt)}*`, '');
      (blk.items || []).forEach(it => out.push(renderItem(sec, blk, it, '####')));
    });
  });
  return out.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\n*$/, '\n');
}

function main() {
  const args = process.argv.slice(2);
  let dataDir = path.join(ROOT, 'app', 'data'), outDir = path.join(ROOT, 'sprints', 'v2', 'answer-review');
  let all = false, check = false;
  const sps = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--all') all = true;
    else if (a === '--check') check = true;
    else if ((a === '--out-dir' || a === '--data-dir') && args[i + 1] !== undefined) { if (a === '--out-dir') outDir = args[++i]; else dataDir = args[++i]; }
    else if (SP_RE.test(a)) sps.push(a);
    else { console.error(`review-sheet: unknown argument "${a}"`); process.exit(1); }
  }
  if (all || (check && !sps.length)) {
    for (const f of fs.existsSync(dataDir) ? fs.readdirSync(dataDir).sort() : []) {
      const m = f.match(/^evs-(sp\d{2})\.json$/);
      if (m && !sps.includes(m[1])) sps.push(m[1]);
    }
  }
  if (!sps.length) {
    if (all || check) { console.log('review-sheet: no school papers found'); return; }
    console.error('usage: review-sheet.js spNN … | --all | --check [spNN …] [--out-dir D] [--data-dir D]'); process.exit(1);
  }
  let bad = 0;
  for (const sp of sps) {
    const src = path.join(dataDir, `evs-${sp}.json`), dest = path.join(outDir, `${sp}.md`);
    let sheet;
    try {
      const raw = fs.readFileSync(src, 'utf8');
      sheet = renderSheet({ ...JSON.parse(raw), sp }, raw);
    } catch (e) { console.error(`✗ ${sp}: ${e.message}`); bad++; continue; }
    if (check) {
      const disk = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : null;
      if (disk === sheet) console.log(`✓ ${sp}.md up to date`);
      else { console.error(`✗ ${sp}.md ${disk === null ? 'missing' : 'differs from the JSON (regenerate it, do not hand-edit)'}`); bad++; }
    } else {
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(dest, sheet);
      console.log(`wrote ${path.relative(ROOT, dest) || dest}`);
    }
  }
  if (bad) { console.error(`review-sheet: FAILED — ${bad} sheet(s)`); process.exit(1); }
}

if (require.main === module) main();
module.exports = { renderSheet };
