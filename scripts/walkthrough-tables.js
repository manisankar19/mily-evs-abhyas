#!/usr/bin/env node
// Regenerates the data sections of sprints/v2/WALKTHROUGH.md (between the
// "generated:start" / "generated:end" markers) from the paper JSON, the intake and the files on
// disk, so the walkthrough cannot drift from the data. Usage: node scripts/walkthrough-tables.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { checkPaper } = require('./fidelity.js');
const ROOT = path.join(__dirname, '..');
const W = path.join(ROOT, 'sprints', 'v2', 'WALKTHROUGH.md');
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const intake = JSON.parse(fs.readFileSync(path.join(ROOT, 'source', 'intake.json'), 'utf8')).papers;
const SPS = fs.readdirSync(path.join(ROOT, 'app', 'data')).map(f => (f.match(/^evs-(sp\d{2})\.json$/) || [])[1]).filter(Boolean).sort();
const papers = SPS.map(sp => JSON.parse(fs.readFileSync(path.join(ROOT, 'app', 'data', `evs-${sp}.json`), 'utf8')));
const out = [];

out.push('### Papers', '', '| sp | Source file | Total | Sections | Items | ⚑ actual / intake estimate | Fallback strings |', '|---|---|---|---|---|---|---|');
let T = { marks: 0, items: 0, flags: 0, fb: 0, strings: 0 };
for (const p of papers) {
  const items = p.sections.flatMap(s => s.blocks).flatMap(b => b.items);
  const flags = items.filter(i => i.answerConfidence === 'check').length;
  const ik = intake.find(x => x.sp === p.sp);
  const r = checkPaper(p, ik, [fs.readFileSync(path.join(ROOT, 'source', 'text-cache', `${p.sp}.txt`), 'utf8')]);
  const pct = r.total ? Math.round(r.fallbacks.length * 100 / r.total) : 0;
  out.push(`| ${p.sp} | \`${p.sourceFile}\` | ${p.totalMarks} | ${p.sections.length} | ${items.length} | ${flags} / ${ik.flagEstimate} | ${r.fallbacks.length} of ${r.total} (${pct}%) |`);
  T.marks += p.totalMarks; T.items += items.length; T.flags += flags; T.fb += r.fallbacks.length; T.strings += r.total;
}
out.push(`| **Total** | 6 papers | ${T.marks} | | ${T.items} | ${T.flags} | ${T.fb} of ${T.strings} |`, '');

out.push('### Source PDFs: SHA-256 re-checked against the intake', '', '| sp | File | SHA-256 now | Matches intake | Status |', '|---|---|---|---|---|');
for (const ik of intake) {
  const now = sha(path.join(ROOT, 'source', 'school-papers', ik.sourceFile));
  out.push(`| ${ik.sp} | \`${ik.sourceFile}\` | \`${now}\` | ${now === ik.sha256 ? 'yes' : '**NO**'} | ${ik.status} |`);
}
out.push('');

const pre = JSON.parse(fs.readFileSync(path.join(ROOT, 'sprints', 'v2', 'preflight-hashes.json'), 'utf8'));
out.push('### Existing papers: byte-identical to preflight', '', '| File | SHA-256 (preflight = now) | Identical |', '|---|---|---|');
for (const [f, h] of Object.entries(pre)) out.push(`| \`${f}\` | \`${h}\` | ${sha(path.join(ROOT, f)) === h ? 'yes' : '**NO**'} |`);
out.push('');

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'app', 'assets', 'shared-manifest.json'), 'utf8')).assets;
const usedBy = {};
for (const p of papers) for (const b of p.sections.flatMap(s => s.blocks)) {
  if (b.stimulus && b.stimulus.asset) (usedBy[path.basename(b.stimulus.asset)] = usedBy[path.basename(b.stimulus.asset)] || new Set()).add(`${p.sp} ${b.num} (picture)`);
  for (const it of b.items) if (it.answerAsset) (usedBy[path.basename(it.answerAsset)] = usedBy[path.basename(it.answerAsset)] || new Set()).add(`${p.sp} ${b.num} (answer key)`);
}
const title = (f) => ((fs.readFileSync(path.join(ROOT, 'app', 'assets', f), 'utf8').match(/<title>([^<]*)<\/title>/) || [])[1] || '');
out.push('### Pictures', '', '| File | What it shows | Used by |', '|---|---|---|');
for (const f of fs.readdirSync(path.join(ROOT, 'app', 'assets')).filter(f => f.endsWith('.svg')).sort()) {
  const m = manifest.find(a => a.file === f);
  const what = m ? m.what : title(f);
  const by = usedBy[f] ? [...usedBy[f]].join('; ') : (m ? `embedded in composites (${m.usedBy.join(', ')})` : '—');
  out.push(`| \`${f}\` | ${esc(what)} | ${esc(by)} |`);
}
out.push('');

out.push('### Adapted layouts (block `adaptation`, shown under the printed instruction)', '');
for (const p of papers) {
  out.push(`**${p.sp}**`, '');
  for (const s of p.sections) for (const b of s.blocks) if (b.adaptation) out.push(`- ${esc(b.num)}: ${esc(b.adaptation)}`);
  out.push('');
}

out.push('### Every teacherNote', '');
for (const p of papers) {
  const rows = p.sections.flatMap(s => s.blocks.flatMap(b => b.items.filter(i => i.teacherNote).map(i => `| ${esc(b.num)} ${esc(i.label || '')} | ${esc(i.teacherNote)} |`)));
  out.push(`**${p.sp}** (${rows.length})`, '', '| Question | Note |', '|---|---|', ...rows, '');
}

const md = fs.readFileSync(W, 'utf8');
const a = '<!-- generated:start (node scripts/walkthrough-tables.js) -->', z = '<!-- generated:end -->';
if (!md.includes(a) || !md.includes(z)) { console.error('walkthrough-tables: markers missing'); process.exit(1); }
fs.writeFileSync(W, md.slice(0, md.indexOf(a) + a.length) + '\n\n' + out.join('\n') + '\n' + md.slice(md.indexOf(z)));
console.log(`walkthrough-tables: ${papers.length} papers, ${T.items} items, ${T.flags} ⚑`);
