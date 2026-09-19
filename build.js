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
const DIST = path.join(ROOT, 'dist');
const CARD = readCard(path.join(ROOT, 'PROJECT-CARD.yml'));
const SECRET_ENV = CARD.marking_secret_env || 'GANESH_EVS';
const LOCALE = CARD.locale || 'en';

function fail(msg) { console.error('build: ' + msg); process.exit(1); }

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

// 2. Validate papers.
function loadPapers() {
  const dir = path.join(APP, 'data');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  if (!files.length) fail('no papers in app/data');
  const papers = [];
  let bad = false;
  for (const f of files) {
    const full = path.join(dir, f);
    const r = validatePaper(full);
    if (r.errors.length) { bad = true; console.error(`build: ${f} failed validation:`); r.errors.forEach(e => console.error('   - ' + e)); continue; }
    papers.push(JSON.parse(fs.readFileSync(full, 'utf8')));
  }
  if (bad) fail('validation failed');
  return papers;
}

// 3. Inline assets as data: URIs.
function inlineAssets(papers) {
  const mime = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
  for (const p of papers) for (const s of p.sections) for (const b of s.blocks) {
    if (b.stimulus && b.stimulus.asset) {
      const file = path.join(APP, b.stimulus.asset);
      if (!fs.existsSync(file)) fail('asset missing: ' + b.stimulus.asset);
      const ext = path.extname(file).toLowerCase();
      if (!mime[ext]) fail('unsupported asset type: ' + b.stimulus.asset);
      b.stimulus.asset = `data:${mime[ext]};base64,` + fs.readFileSync(file).toString('base64');
    }
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
  if (process.argv.includes('--minify')) {
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
    totalMarks: Number(CARD.total_marks) || 100,
    durationMinutes: Number(CARD.duration_minutes) || 120,
    login: CARD.login
  };
  // --split: papers go to dist/data/*.json and the page fetches them (for hosts where one
  // big upload is impractical). Default: everything inlined into one file.
  const split = process.argv.includes('--split');
  const paperFiles = papers.map(p => (p.chapter === 0 ? 'evs-' + (p.kind || 'mock') : 'evs-ch' + p.chapter) + '.json');
  const dataBlob = JSON.stringify(split ? { ui, papers: null, paperFiles, config } : { ui, papers, config }).replace(/<\/script/gi, '<\\/script');
  const out = html
    .replace('__SECRET_HASH__', () => hash)
    .replace('<!-- __INLINE_CSS__ -->', () => '<style>\n' + css + '\n</style>')
    .replace('<!-- __INLINE_DATA__ -->', () => '<script>window.__EVS__ = ' + dataBlob + ';</script>')
    .replace('<!-- __INLINE_JS__ -->', () => '<script>\n' + js + '\n</script>');  // function form: "$$"/"$'" in JS must not be treated as replace patterns

  if (out.includes(secret)) fail('secret leaked into output');
  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, 'index.html'), out);
  if (split) {
    fs.mkdirSync(path.join(DIST, 'data'), { recursive: true });
    papers.forEach((p, i) => fs.writeFileSync(path.join(DIST, 'data', paperFiles[i]), JSON.stringify(p)));
  }
  const items = papers.reduce((a, p) => a + p.sections.reduce((b, s) => b + s.blocks.reduce((c, k) => c + k.items.length, 0), 0), 0);
  console.log(`build: dist/index.html ${(out.length / 1024).toFixed(0)} KB · ${papers.length} papers · ${items} items · hash ${hash.slice(0, 12)}…`);
}

main();
