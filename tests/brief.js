#!/usr/bin/env node
// Task 18: the paper-authoring sub-agent brief covers every rule it must and points only at
// files that exist. Zero dependencies.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const BRIEF = path.join(ROOT, 'sprints', 'v2', 'subagent-brief.md');
let pass = 0, fail = 0;
const check = (name, ok, why) => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : '  ' + (why || '')}`); };

const brief = fs.existsSync(BRIEF) ? fs.readFileSync(BRIEF, 'utf8') : '';
check('brief exists', brief.length > 0, BRIEF);
const instruction = fs.readFileSync(path.join(ROOT, 'sprints', 'v2', 'instruction.md'), 'utf8');

// Brief §4 and §6 are quoted verbatim (every bullet line).
const section = (n) => (instruction.split(/^## /m).find(s => s.startsWith(`${n}.`)) || '');
for (const n of [4, 6]) {
  const bullets = section(n).split('\n').filter(l => /^- /.test(l));
  check(`instruction §${n} found`, bullets.length > 0);
  for (const b of bullets) check(`quotes §${n}: ${b.slice(2, 50)}…`, brief.includes(b), 'not quoted verbatim');
}

// Rules the brief must state (phrases).
const MUST = [
  'Never correct the teacher', 'teacherNote', 'fallbackText', 'answerConfidence', '"check"', 'acceptable',
  'rubric', 'answerSource', 'half-units', 'numbered panels', 'answerAsset', 'map-key.js', 'shared-india-states.svg',
  'review-sheet.js', 'fidelity.js', 'validate.js', 'hash-existing.js', 'Do not commit', 'only your own',
  'Hindi', 'regional', 'sourceRef', 'paper-based', 'Gate 0b',
];
for (const m of MUST) check(`states "${m}"`, brief.includes(m), 'missing');

// Every repo path the brief mentions in backticks exists (patterns with spNN/NN are skipped).
for (const m of brief.matchAll(/`((?:app|source|sprints|scripts|tests)\/[^`\s]+)`/g)) {
  const p = m[1];
  if (/NN|\*|<|\{/.test(p)) continue;
  check(`path exists: ${p}`, fs.existsSync(path.join(ROOT, p)), 'missing');
}
console.log(`brief: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
