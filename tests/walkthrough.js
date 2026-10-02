#!/usr/bin/env node
// Task 37: sprints/v2/WALKTHROUGH.md agrees with the data. Per-paper figures, every
// teacherNote and adaptation, every picture, PDF hashes (re-computed now), the existing-paper
// hash check, and the parent-review sentence. Zero dependencies.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const W = path.join(ROOT, 'sprints', 'v2', 'WALKTHROUGH.md');
let pass = 0, fail = 0;
const check = (name, ok, why) => { ok ? pass++ : fail++; if (!ok || process.argv.includes('-v')) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : '  ' + (why || '')}`); };
const md = fs.existsSync(W) ? fs.readFileSync(W, 'utf8') : '';
check('WALKTHROUGH.md exists', md.length > 0);
check('states the parent-review rule verbatim', md.includes('Parent reads every answer review sheet (`sprints/v2/answer-review/spNN.md`) before the child uses each paper.'));

const intake = JSON.parse(fs.readFileSync(path.join(ROOT, 'source', 'intake.json'), 'utf8')).papers;
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const SPS = fs.readdirSync(path.join(ROOT, 'app', 'data')).map(f => (f.match(/^evs-(sp\d{2})\.json$/) || [])[1]).filter(Boolean).sort();
check('six school papers', SPS.length === 6, SPS.join(','));
const { checkPaper } = require(path.join(ROOT, 'scripts', 'fidelity.js'));
for (const sp of SPS) {
  const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'app', 'data', `evs-${sp}.json`), 'utf8'));
  const items = p.sections.flatMap(s => s.blocks).flatMap(b => b.items);
  const flags = items.filter(i => i.answerConfidence === 'check').length;
  const ik = intake.find(x => x.sp === sp);
  const cache = path.join(ROOT, 'source', 'text-cache', `${sp}.txt`);
  const r = checkPaper(p, ik, [fs.readFileSync(cache, 'utf8')]);
  const pct = r.total ? Math.round(r.fallbacks.length * 100 / r.total) : 0;
  const row = `| ${sp} | \`${p.sourceFile}\` | ${p.totalMarks} | ${p.sections.length} | ${items.length} | ${flags} / ${ik.flagEstimate} | ${r.fallbacks.length} of ${r.total} (${pct}%) |`;
  check(`${sp}: table row matches the data`, md.includes(row), row);
  for (const it of items) if (it.teacherNote) check(`${sp} ${it.id}: teacherNote listed`, md.includes(it.teacherNote.replace(/\|/g, '\\|')), it.teacherNote.slice(0, 60));
  for (const b of p.sections.flatMap(s => s.blocks)) if (b.adaptation) check(`${sp} ${b.num}: adaptation listed`, md.includes(b.adaptation.replace(/\|/g, '\\|')), b.adaptation.slice(0, 60));
}
for (const f of fs.readdirSync(path.join(ROOT, 'app', 'assets')).filter(f => f.endsWith('.svg'))) check(`picture ${f} listed`, md.includes(f));
for (const p of intake) {
  const file = path.join(ROOT, 'source', 'school-papers', p.sourceFile);
  const now = sha(file);
  check(`${p.sp}: PDF hash unchanged since intake`, now === p.sha256, `${now.slice(0, 12)} vs ${p.sha256.slice(0, 12)}`);
  check(`${p.sp}: PDF hash written in the walkthrough`, md.includes(now));
}
const pre = JSON.parse(fs.readFileSync(path.join(ROOT, 'sprints', 'v2', 'preflight-hashes.json'), 'utf8'));
for (const [f, h] of Object.entries(pre)) check(`${f}: byte-identical to preflight and recorded`, sha(path.join(ROOT, f)) === h && md.includes(h), f);
console.log(`walkthrough: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
