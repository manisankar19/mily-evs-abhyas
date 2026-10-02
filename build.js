#!/usr/bin/env node
// Build: validates papers, resolves the marking secret, inlines everything into
// one self-contained dist/index.html (BLUEPRINT §9). Zero dependencies.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { validatePaper } = require('./validate');

const ROOT = __dirname;
const APP = path.join(ROOT, 'app');
const CARD = readCard(path.join(ROOT, 'PROJECT-CARD.yml'));
const SECRET_ENV = CARD.marking_secret_env || 'GANESH_EVS';
const LOCALE = CARD.locale || 'en';

function fail(msg) { console.error('build: ' + msg); process.exit(1); }

// CLI options (tests build from fixture dirs):
//   --data-dir D   (repeatable; env EVS_DATA_DIR, path-list)  default app/data
//   --intake F     (env EVS_INTAKE)      intake file for school papers, passed to validatePaper
//   --review-dir D (env EVS_REVIEW_DIR)  review sheets for school papers, passed to validatePaper
//   --out-dir D    (env EVS_OUT_DIR)     default dist
//   --split, --minify
function parseArgs(argv) {
  const o = { dataDirs: [], split: false, minify: false };
  const VAL = { '--data-dir': 'dataDir', '--intake': 'intake', '--review-dir': 'reviewDir', '--out-dir': 'outDir' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--split') o.split = true;
    else if (a === '--minify') o.minify = true;
    else if (VAL[a]) {
      const v = argv[++i];
      if (!v || v.startsWith('--')) fail(a + ' needs a value');
      if (a === '--data-dir') o.dataDirs.push(path.resolve(v)); else o[VAL[a]] = path.resolve(v);
    } else fail('unknown argument ' + a);
  }
  if (!o.dataDirs.length) o.dataDirs = process.env.EVS_DATA_DIR ? process.env.EVS_DATA_DIR.split(path.delimiter).filter(Boolean).map(d => path.resolve(d)) : [path.join(APP, 'data')];
  o.intake = o.intake || (process.env.EVS_INTAKE ? path.resolve(process.env.EVS_INTAKE) : undefined);
  o.reviewDir = o.reviewDir || (process.env.EVS_REVIEW_DIR ? path.resolve(process.env.EVS_REVIEW_DIR) : undefined);
  o.outDir = o.outDir || (process.env.EVS_OUT_DIR ? path.resolve(process.env.EVS_OUT_DIR) : path.join(ROOT, 'dist'));
  return o;
}
const OPTS = parseArgs(process.argv.slice(2));

// Minimal YAML reader for the flat keys we need from PROJECT-CARD.yml.
function readCard(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^([a-z_]+):\s*(.*?)\s*(#.*)?$/);
    if (!m) continue;
    let v = m[2].trim();
    if (/^".*"$/.test(v)) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  const login = (fs.readFileSync(file, 'utf8').match(/student_login:\s*\{\s*user:\s*"([^"]+)",\s*pass:\s*"([^"]+)"\s*\}/) || []);
  out.login = { user: login[1] || 'Mily', pass: login[2] || '2026' };
  return out;
}

// 1. Secret: env var first; .env.local only if the key is entirely absent from env.
function resolveSecret() {
  if (SECRET_ENV in process.env) {
    const v = process.env[SECRET_ENV];
    if (!v || !v.trim()) fail(`${SECRET_ENV} is set but empty — refusing to build.`);
    return v.trim();
  }
  const envFile = path.join(ROOT, '.env.local');
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
      const m = line.match(new RegExp('^' + SECRET_ENV + '=(.*)$'));
      if (m && m[1].trim()) return m[1].trim().replace(/^["']|["']$/g, '');
    }
  }
  fail(`${SECRET_ENV} is not set (env var or .env.local). Nothing written.`);
}

// 2. Validate papers (every evs-*.json in each data dir), then sort: chapter papers by
// chapter, the mock (chapter 0), then school papers by sp.
const isSchool = (p) => p.kind === 'school';
function sortKey(p) { return isSchool(p) ? 2000 + Number(String(p.sp).slice(2)) : (p.chapter === 0 ? 1000 : p.chapter); }
function loadPapers() {
  const papers = [], seen = new Set();
  let bad = false;
  for (const dir of OPTS.dataDirs) {
    if (!fs.existsSync(dir)) fail('data dir missing: ' + dir);
    for (const f of fs.readdirSync(dir).filter(n => /^evs-[a-z0-9-]+\.json$/.test(n)).sort()) {
      if (seen.has(f)) fail('duplicate paper file ' + f + ' across data dirs');
      seen.add(f);
      const full = path.join(dir, f);
      const r = validatePaper(full, { intake: OPTS.intake, reviewDir: OPTS.reviewDir });
      if (r.errors.length) { bad = true; console.error(`build: ${f} failed validation:`); r.errors.forEach(e => console.error('   - ' + e)); continue; }
      papers.push(JSON.parse(fs.readFileSync(full, 'utf8')));
    }
  }
  if (bad) fail('validation failed');
  if (!papers.length) fail('no papers in ' + OPTS.dataDirs.join(', '));
  return papers.sort((a, b) => sortKey(a) - sortKey(b));
}

// 3. Inline assets (block stimulus pictures and school answerAsset pictures) as data: URIs.
const MIME = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
function dataUri(asset) {
  const file = path.join(APP, asset);
  if (!path.resolve(file).startsWith(path.join(APP, 'assets') + path.sep)) fail('asset outside app/assets: ' + asset);
  if (!fs.existsSync(file)) fail('asset missing: ' + asset);
  const ext = path.extname(file).toLowerCase();
  if (!MIME[ext]) fail('unsupported asset type: ' + asset);
  return `data:${MIME[ext]};base64,` + fs.readFileSync(file).toString('base64');
}
function inlineAssets(papers) {
  for (const p of papers) for (const s of p.sections) for (const b of s.blocks) {
    if (b.stimulus && b.stimulus.asset) b.stimulus.asset = dataUri(b.stimulus.asset);
    for (const it of b.items) if (it.answerAsset) it.answerAsset = dataUri(it.answerAsset);
  }
}

// 4. UI strings: every key used in HTML (data-ui) and JS (t('...')) must exist.
function loadUi(html, js) {
  const uiFile = path.join(APP, 'ui', LOCALE + '.json');
  if (!fs.existsSync(uiFile)) fail('missing ' + uiFile);
  const ui = JSON.parse(fs.readFileSync(uiFile, 'utf8'));
  const used = new Set();
  for (const m of html.matchAll(/data-ui="([^"]+)"/g)) used.add(m[1]);
  for (const m of js.matchAll(/\bt\('([^']+)'/g)) used.add(m[1]);
  const missing = [...used].filter(k => !(k in ui));
  if (missing.length) fail('missing UI strings: ' + missing.join(', '));
  for (const k of Object.keys(ui)) if (typeof ui[k] !== 'string' || !ui[k].trim()) fail('empty UI string: ' + k);
  return ui;
}

function main() {
  const secret = resolveSecret();
  const html = fs.readFileSync(path.join(APP, 'index.html'), 'utf8');
  let css = fs.readFileSync(path.join(APP, 'styles.css'), 'utf8');
  let js = fs.readFileSync(path.join(APP, 'app.js'), 'utf8');
  const ui = loadUi(html, js);           // check strings against the un-minified source
  if (OPTS.minify) {
    // Optional: shrink CSS/JS with terser + clean-css if they are installed globally (npm i -g terser clean-css-cli).
    const { execFileSync } = require('child_process');
    try {
      css = execFileSync('cleancss', ['-O1', path.join(APP, 'styles.css')], { encoding: 'utf8' });
      js = execFileSync('terser', [path.join(APP, 'app.js'), '--compress', '--mangle'], { encoding: 'utf8' });
    } catch (e) { fail('--minify needs terser and cleancss on PATH: ' + e.message); }
  }
  if (!html.includes('__SECRET_HASH__')) fail('__SECRET_HASH__ placeholder missing from app/index.html — never commit a built file over the source.');
  for (const ph of ['<!-- __INLINE_CSS__ -->', '<!-- __INLINE_DATA__ -->', '<!-- __INLINE_JS__ -->']) if (!html.includes(ph)) fail('placeholder missing: ' + ph);

  const papers = loadPapers();
  inlineAssets(papers);
  const hash = crypto.createHash('sha256').update(secret).digest('hex');
  if (html.includes(secret) || css.includes(secret) || js.includes(secret)) fail('the plaintext secret appears in the source — remove it.');

  const config = {
    subject: CARD.subject_code || 'evs',
    locale: LOCALE,
    numerals: CARD.numerals || 'latn',
    durationMinutes: Number(CARD.duration_minutes) || 120,
    login: CARD.login
  };
  // --split: papers go to dist/data/*.json and the page fetches them (for hosts where one
  // big upload is impractical). Default: everything inlined into one file.
  const split = OPTS.split;
  const paperFiles = papers.map(p => (isSchool(p) ? 'evs-' + p.sp : p.chapter === 0 ? 'evs-' + (p.kind || 'mock') : 'evs-ch' + p.chapter) + '.json');
  paperFiles.forEach(f => { if (!/^evs-[a-z0-9-]+\.json$/.test(f)) fail('bad split filename ' + JSON.stringify(f)); });
  if (new Set(paperFiles).size !== paperFiles.length) fail('split filenames collide: ' + paperFiles.join(', '));
  const dataBlob = JSON.stringify(split ? { ui, papers: null, paperFiles, config } : { ui, papers, config }).replace(/<\/script/gi, '<\\/script');
  const out = html
    .replace('__SECRET_HASH__', () => hash)
    .replace('<!-- __INLINE_CSS__ -->', () => '<style>\n' + css + '\n</style>')
    .replace('<!-- __INLINE_DATA__ -->', () => '<script>window.__EVS__ = ' + dataBlob + ';</script>')
    .replace('<!-- __INLINE_JS__ -->', () => '<script>\n' + js + '\n</script>');  // function form: "$$"/"$'" in JS must not be treated as replace patterns

  if (out.includes(secret)) fail('secret leaked into output');
  const DIST = OPTS.outDir;
  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, 'index.html'), out);
  if (split) {
    fs.mkdirSync(path.join(DIST, 'data'), { recursive: true });
    papers.forEach((p, i) => fs.writeFileSync(path.join(DIST, 'data', paperFiles[i]), JSON.stringify(p)));
  }
  const items = papers.reduce((a, p) => a + p.sections.reduce((b, s) => b + s.blocks.reduce((c, k) => c + k.items.length, 0), 0), 0);
  const rel = path.relative(ROOT, path.join(DIST, 'index.html'));
  console.log(`build: ${rel.startsWith('..') ? path.join(DIST, 'index.html') : rel} ${(out.length / 1024).toFixed(0)} KB · ${papers.length} papers · ${items} items · hash ${hash.slice(0, 12)}…`);
}

main();
