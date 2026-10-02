#!/usr/bin/env node
// Fidelity check: every printed string in a school paper JSON must appear in the paper's text cache
// (sprints/v2/school-contract.md, "Fidelity"). Zero dependencies.
// Usage: node scripts/fidelity.js [spNN …]   (default: every app/data/evs-spNN.json)
//   --data-dir D  (FIDELITY_DATA_DIR)   --cache-dir D (FIDELITY_CACHE_DIR)
//   --intake F    (EVS_INTAKE)          --pdf-dir D   (FIDELITY_PDF_DIR, for the non-layout cache)
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SP_RE = /^sp\d{2}$/;
const half = (m) => Math.round(Number(m) * 2);

// Lines that are never question text: page footers, bare page numbers, Devanagari-only header lines.
const FOOTER_RE = /^\s*(page\s*\d+\s*(of\s*\d+)?|p\s*\.?\s*t\s*\.?\s*o\s*\.?|-?\s*\d{1,3}\s*-?)\s*$/i;
const DEVANAGARI_RE = /[ऀ-ॿ꣠-ꣿ]/g;
const isDevanagariOnly = (l) => /[ऀ-ॿ]/.test(l) && !/[A-Za-z0-9]/.test(l);

// Normalise to a space-separated sequence of lowercase word tokens. Blanks (____, ……, ( )), punctuation
// and Devanagari are not tokens, so they vanish; words are compared whole, never as character soup.
// joinHyphen=false splits line-break hyphens instead of joining them (used as a second cache variant).
// cache=true drops page footers (cache text); paper strings keep number-only text such as an option "6".
function normalise(text, joinHyphen = true, cache = true) {
  let s = String(text == null ? '' : text).normalize('NFKC').replace(/\r\n?|\f/g, '\n');
  s = s.split('\n').filter(l => !(cache && FOOTER_RE.test(l)) && !isDevanagariOnly(l)).join('\n');
  s = s.replace(/(\d)\s*[x×X]\s*(?=\d)/g, '$1 x ');                          // printed marks: 6x1 = 6 x 1
  s = s.replace(/[‘’‚‛′`´]/g, "'").replace(/[“”„‟″]/g, '"').replace(/[­]/g, '')
    .replace(/[‐‑‒–—―−]/g, '-');
  s = s.replace(/(\p{L})-[ \t]*\n\s*(?=\p{L})/gu, joinHyphen ? '$1' : '$1 ')   // hyphenated line break
    .replace(/(\p{L})-(?=\p{L})/gu, '$1')                                      // red-coloured → redcoloured
    .replace(/(\p{L})'(?=\p{L})/gu, '$1')                                      // children's → childrens
    .toLowerCase().replace(DEVANAGARI_RE, ' ');
  return (s.match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}]*/gu) || []).join(' ');
}

// Every checked string of a paper: { where, field, text }.
function paperStrings(paper) {
  const out = [];
  const add = (where, field, text) => { if (typeof text === 'string' && text.trim()) out.push({ where, field, text }); };
  (paper.sections || []).forEach((sec, si) => {
    const sw = `s${si + 1}`;
    add(sw, 'heading', sec.title);
    if (sec.heading !== sec.title) add(sw, 'heading', sec.heading);
    (sec.blocks || []).forEach((blk, bi) => {
      const bw = `${sw}-b${bi + 1}`;
      add(bw, 'instruction', blk.instruction);
      add(bw, 'passage', blk.passage);
      (blk.items || []).forEach((it) => {
        add(it.id, 'q', it.q);
        (Array.isArray(it.options) ? it.options : []).forEach(o => add(it.id, 'option', o));
        (Array.isArray(it.pairs) ? it.pairs : []).forEach(pr => { if (pr) { add(it.id, 'pair', pr.left); add(it.id, 'pair', pr.right); } });
      });
    });
  });
  return out;
}

// paper: parsed JSON; intake: its intake entry (or null); cacheTexts: raw text-cache strings
// (layout and, if available, non-layout). Returns counts, fallbacks, mismatches and errors.
function checkPaper(paper, intake, cacheTexts) {
  const hays = [];
  for (const t of cacheTexts || []) for (const j of [true, false]) hays.push(` ${normalise(t, j)} `);
  const fb = (Array.isArray(paper.fallbackText) ? paper.fallbackText : []).map(e => ({ ...e, used: false }));
  const fieldOf = (f) => (f === 'title' ? 'heading' : f);
  const r = { sp: paper.sp, total: 0, matched: 0, fallbacks: [], mismatches: [], errors: [] };
  for (const s of paperStrings(paper)) {
    const cover = fb.filter(e => e.where === s.where && fieldOf(e.field) === s.field);
    const hit = cover.find(e => e.text === s.text);
    const n = normalise(s.text, true, false);
    if (!hit && !n && !/[\p{L}\p{N}]/u.test(s.text)) continue;   // only blanks/punctuation: nothing to check
    r.total++;
    if (hit) { hit.used = true; r.fallbacks.push({ where: s.where, field: s.field, reason: hit.reason || '(no reason given)' }); continue; }
    if (n && hays.some(h => h.includes(` ${n} `))) { r.matched++; continue; }
    r.mismatches.push({ where: s.where, field: s.field, text: n || '(no Latin text: needs fallbackText)', note: cover.length ? 'fallbackText text differs from JSON' : '' });
  }
  for (const e of fb) if (!e.used) r.errors.push(`fallbackText ${e.where} ${e.field}: text equals no JSON string ("${e.text}")`);
  if (!intake) r.errors.push('no intake entry');
  else {
    if (half(paper.totalMarks) !== half(intake.printedTotal)) r.errors.push(`totalMarks ${paper.totalMarks} ≠ intake printedTotal ${intake.printedTotal}`);
    const ps = paper.sections || [], is = intake.sections || [];
    if (ps.length !== is.length) r.errors.push(`section count ${ps.length} ≠ intake ${is.length}`);
    ps.forEach((sec, i) => {
      if (is[i] && half(sec.marks) !== half(is[i].marks)) r.errors.push(`section ${sec.code}: marks ${sec.marks} ≠ intake ${is[i].marks}`);
    });
  }
  r.ok = !r.mismatches.length && !r.errors.length;
  return r;
}

function summary(r) {
  const F = r.fallbacks.length;
  if (r.total && F === r.total) return `${r.sp}: 100% fallback`;
  return `${r.sp}: ${r.matched}/${r.total} strings matched, ${F} fallback (${r.total ? Math.round(F * 100 / r.total) : 0}%)`;
}

// Non-layout text: spNN.raw.txt next to the cache, else pdftotext (no shell) into a temp dir.
function rawText(sp, cacheDir, pdfDir, intake) {
  const cached = path.join(cacheDir, `${sp}.raw.txt`);
  if (fs.existsSync(cached)) return fs.readFileSync(cached, 'utf8');
  const name = intake && intake.sourceFile;
  if (typeof name !== 'string' || !name || path.basename(name) !== name) return null;
  const pdf = path.join(pdfDir, name);
  if (!fs.existsSync(pdf)) return null;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fidelity-'));
  try {
    const out = path.join(tmp, `${sp}.raw.txt`);
    execFileSync('pdftotext', ['-enc', 'UTF-8', pdf, out], { stdio: ['ignore', 'ignore', 'pipe'] });
    return fs.readFileSync(out, 'utf8');
  } catch (e) {
    console.error(`  (${sp}: pdftotext failed, layout cache only: ${e.message.split('\n')[0]})`);
    return null;
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}

function parseArgs(argv) {
  const o = {
    dataDir: process.env.FIDELITY_DATA_DIR || path.join(ROOT, 'app', 'data'),
    cacheDir: process.env.FIDELITY_CACHE_DIR || path.join(ROOT, 'source', 'text-cache'),
    intake: process.env.EVS_INTAKE || path.join(ROOT, 'source', 'intake.json'),
    pdfDir: process.env.FIDELITY_PDF_DIR || path.join(ROOT, 'source', 'school-papers'),
    sps: [],
  };
  const flags = { '--data-dir': 'dataDir', '--cache-dir': 'cacheDir', '--intake': 'intake', '--pdf-dir': 'pdfDir' };
  for (let i = 0; i < argv.length; i++) {
    if (flags[argv[i]]) { if (argv[i + 1] === undefined) throw new Error(`${argv[i]} needs a value`); o[flags[argv[i]]] = argv[++i]; }
    else if (SP_RE.test(argv[i])) o.sps.push(argv[i]);
    else throw new Error(`unknown argument "${argv[i]}" (expected spNN or an option)`);
  }
  return o;
}

function main() {
  let o;
  try { o = parseArgs(process.argv.slice(2)); } catch (e) { console.error(`fidelity: ${e.message}`); process.exit(1); }
  let intake = { papers: [] };
  if (fs.existsSync(o.intake)) {
    try { intake = JSON.parse(fs.readFileSync(o.intake, 'utf8')); } catch (e) { console.error(`fidelity: bad intake ${o.intake}: ${e.message}`); process.exit(1); }
  }
  const sps = o.sps.length ? o.sps : (fs.existsSync(o.dataDir) ? fs.readdirSync(o.dataDir) : [])
    .map(f => (f.match(/^evs-(sp\d{2})\.json$/) || [])[1]).filter(Boolean).sort();
  if (!sps.length) { console.log('fidelity: no school papers found'); return; }
  let failed = 0;
  for (const sp of sps) {
    const entry = (intake.papers || []).find(p => p && p.sp === sp) || null;
    const file = path.join(o.dataDir, `evs-${sp}.json`), cache = path.join(o.cacheDir, `${sp}.txt`);
    let r;
    try {
      const paper = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (!fs.existsSync(cache)) throw new Error(`text cache missing: ${cache}`);
      const texts = [fs.readFileSync(cache, 'utf8'), rawText(sp, o.cacheDir, o.pdfDir, entry)].filter(t => t != null);
      r = checkPaper({ ...paper, sp }, entry, texts);
    } catch (e) {
      r = { sp, total: 0, matched: 0, fallbacks: [], mismatches: [], errors: [e.message], ok: false };
    }
    console.log(summary(r));
    r.fallbacks.forEach(f => console.log(`  fallback ${f.where} ${f.field}: ${f.reason}`));
    r.mismatches.forEach(m => console.log(`  ✗ ${m.where} ${m.field}: "${m.text}"${m.note ? ` (${m.note})` : ''}`));
    r.errors.forEach(e => console.log(`  ✗ ${e}`));
    if (!r.ok) failed++;
  }
  if (failed) { console.error(`fidelity: FAILED — ${failed} of ${sps.length} papers`); process.exit(1); }
  console.log(`fidelity: OK — ${sps.length} papers`);
}

if (require.main === module) main();
module.exports = { normalise, checkPaper, paperStrings };
