// School-paper click-through (sprint v2 Tasks 29–31): builds a dist from app/data (the chapter
// papers) plus the fixture school paper tests/fixtures/app/evs-sp98.json, serves it on its own
// port and checks the School Papers group, school rendering, checking mode and ½ marks.
// Usage: node tests/e2e-school.js   (GANESH_EVS from the env, else a throwaway test code)
'use strict';
const { chromium } = require(process.env.NPM_GLOBAL ? require.resolve('playwright', { paths: [process.env.NPM_GLOBAL] }) : 'playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const FIX = path.join(__dirname, 'fixtures', 'app');
const SHOTS = path.join(__dirname, 'screenshots');
const PORT = Number(process.env.SCHOOL_PORT) || 4183;
const CODE = process.env.GANESH_EVS || 'test-code-123';
const DISCLAIMER = 'Answers written for practice, not by the teacher — ⚑ marks ones worth a second look.';
const SP = JSON.parse(fs.readFileSync(path.join(FIX, 'evs-sp98.json'), 'utf8'));
const CHAPTER_COUNT = fs.readdirSync(path.join(ROOT, 'app', 'data')).filter(f => /^evs-.*\.json$/.test(f))
  .filter(f => JSON.parse(fs.readFileSync(path.join(ROOT, 'app', 'data', f), 'utf8')).kind !== 'school').length;
const items = [];
SP.sections.forEach(s => s.blocks.forEach(b => b.items.forEach(i => items.push({ ...i, block: b }))));
const byType = (t) => items.find(i => i.type === t);

const results = [];
function check(name, ok, extra) { results.push({ name, ok: !!ok, extra }); console.log((ok ? '✓ ' : '✗ ') + name + (extra !== undefined && extra !== '' ? '  (' + extra + ')' : '')); }

// 1. Build into a temp dir from the chapter papers + the fixture dir.
// Only the chapter papers are copied: real school papers are validated against source/intake.json, not the fixture intake.
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'evs-school-'));
const CH_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'evs-chapters-'));
for (const f of fs.readdirSync(path.join(ROOT, 'app', 'data')).filter(f => /^evs-.*\.json$/.test(f))) {
  const raw = fs.readFileSync(path.join(ROOT, 'app', 'data', f), 'utf8');
  if (JSON.parse(raw).kind !== 'school') fs.writeFileSync(path.join(CH_DIR, f), raw);
}
try {
  execFileSync(process.execPath, [path.join(ROOT, 'build.js'),
    '--data-dir', CH_DIR, '--data-dir', FIX,
    '--intake', path.join(FIX, 'intake.json'), '--review-dir', path.join(FIX, 'review'), '--out-dir', OUT],
  { cwd: ROOT, env: { ...process.env, GANESH_EVS: CODE }, stdio: 'pipe', encoding: 'utf8' });
} catch (e) { console.error('build failed:\n' + e.stdout + e.stderr); process.exit(1); }
const built = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
check('build: dist has no plaintext checking code', !built.includes(CODE));

// 2. Serve it.
const server = http.createServer((req, res) => {
  if (req.url.split('?')[0] !== '/') { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(built);
});

(async () => {
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  const URL = `http://localhost:${PORT}/`;
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const noHScroll = () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  const count = (sel) => page.$$eval(sel, n => n.length);

  // Login → list
  await page.goto(URL);
  await page.fill('#login-user', 'Mily'); await page.fill('#login-pass', '2026'); await page.click('#login-form button[type=submit]');
  await page.waitForSelector('#screen-chapters:not([hidden])');
  check('list: chapter papers + mock in the first group', await count('[data-testid=paper-group-chapters] .chapter-card') === CHAPTER_COUNT, CHAPTER_COUNT);
  const groupHead = await page.$eval('[data-testid=paper-group-school] h2', n => n.textContent).catch(() => '');
  check('list: "School Papers" group heading', groupHead.trim() === 'School Papers', groupHead);
  const order = await page.$$eval('.chapter-card', n => n.map(x => x.getAttribute('data-testid') || ''));
  check('list: school group comes after the chapter papers and the mock', order.length === CHAPTER_COUNT + 1 && order[order.length - 1] === 'school-card-sp98', order.join(','));
  const card = await page.$eval('[data-testid=school-card-sp98]', n => n.innerText).catch(() => '');
  check('list: school card shows shortLabel and printed total', card.includes(SP.shortLabel) && card.includes('10 marks'), card.replace(/\n/g, ' | '));
  const sub = await page.textContent('#chapters-subtitle');
  check('list: subtitle uses the papers\' own total (100)', sub.includes('100 marks'), sub);
  check('390px: no horizontal scroll (list)', await noHScroll());
  await page.screenshot({ path: path.join(SHOTS, 'task30-list-390.png'), fullPage: true });

  // Open sp98
  await page.click('[data-testid=school-card-sp98]');
  await page.waitForSelector('#screen-paper:not([hidden])');
  check('paper: printed title', (await page.textContent('#paper h1')).trim() === SP.title);
  const head = await page.$$eval('[data-testid=paper-header-line]', n => n.map(x => x.textContent));
  check('paper: header lines verbatim', JSON.stringify(head) === JSON.stringify(SP.header), head.length);
  const secs = await page.$$eval('[data-testid=section-title]', n => n.map(x => x.textContent));
  check('paper: section titles verbatim', JSON.stringify(secs) === JSON.stringify(SP.sections.map(s => s.title)), secs.join(' / '));
  const instr = await page.$$eval('.block-instruction', n => n.map(x => x.textContent));
  const nums = await page.$$eval('.block-num', n => n.map(x => x.textContent));
  const blocks = SP.sections.flatMap(s => s.blocks);
  check('paper: block num + instruction verbatim', JSON.stringify(instr) === JSON.stringify(blocks.map(b => b.instruction)) && JSON.stringify(nums) === JSON.stringify(blocks.map(b => b.num)));
  const adapt = await page.$$eval('[data-testid=adaptation]', n => n.map(x => x.textContent));
  const adaptBlk = blocks.find(b => b.adaptation);
  check('paper: adaptation note under the instruction', adapt.length === 1 && adapt[0].includes(adaptBlk.adaptation), adapt.join('|'));
  const ulItem = items.find(i => i.underline);
  const u = await page.$$eval(`.item[data-id="${ulItem.id}"] u`, n => n.map(x => x.textContent));
  check('paper: underline span rendered as <u>', u.length === 1 && u[0] === ulItem.q.slice(ulItem.underline[0].start, ulItem.underline[0].end), u.join('|'));
  const qText = await page.$eval(`.item[data-id="${ulItem.id}"] .item-q`, n => n.textContent);
  check('paper: underlined question text intact', qText === ulItem.q);
  const labels = await page.$$eval('.item-label', n => n.map(x => x.textContent));
  check('paper: item labels', labels.includes('(a)') && labels.includes('(iii)'));
  const half = await page.$eval(`.item[data-id="${byType('fill-blank').id}"] .item-marks`, n => n.textContent);
  const oneHalf = await page.$eval(`.item[data-id="${byType('draw').id}"] .item-marks`, n => n.textContent);
  check('paper: ½ marks shown as "½" and "1½"', half.includes('½') && !half.includes('0.5') && oneHalf.includes('1½'), half + ' ' + oneHalf);
  const secMarks = await page.$$eval('.section-head .marks', n => n.map(x => x.textContent));
  check('paper: section marks with halves', secMarks[0].includes('4½') && secMarks[1].includes('5½'), secMarks.join(' / '));
  const img = await page.$eval('[data-testid=stimulus] img', n => ({ w: n.naturalWidth, src: n.src.slice(0, 26) })).catch(() => ({ w: 0 }));
  check('paper: stimulus picture loads (inlined data: URI)', img.w > 0 && img.src.startsWith('data:image/svg+xml'), JSON.stringify(img));
  const pd = await page.$eval('[data-testid=picture-description]', n => ({ t: n.textContent, s: getComputedStyle(n).fontStyle })).catch(() => ({}));
  check('paper: pictureDescription as an italic note', pd.t && pd.t.includes(byType('short').pictureDescription) && pd.s === 'italic', JSON.stringify(pd));
  // Topic tags can name the answer (e.g. "community"), so they appear only in checking mode.
  check('practice: no topic tags (they can give the answer away)', (await page.$$('[data-testid=topics]')).length === 0);
  const opts = await page.$$eval(`.item[data-id="${byType('mcq').id}"] .options li`, n => n.map(x => x.textContent));
  check('paper: MCQ options rendered', JSON.stringify(opts) === JSON.stringify(byType('mcq').options));
  check('paper: match table rendered', await count(`.item[data-id="${byType('match').id}"] .match-table tbody tr`) === byType('match').pairs.length);
  const mt = byType('match');
  const cells = await page.$$eval(`.item[data-id="${mt.id}"] .match-table tbody tr`, rs => rs.map(r => [...r.querySelectorAll('td')].map(td => td.textContent)));
  check('paper: match left column verbatim, right column in printed order', JSON.stringify(cells.map(c => c[0])) === JSON.stringify(mt.pairs.map(x => x.left)) && JSON.stringify(cells.map(c => c[1])) === JSON.stringify(mt.printedRight), JSON.stringify(cells));

  // Practice mode: nothing from checking mode in the DOM
  const html = await page.$eval('#screen-paper', n => n.outerHTML);
  const absent = ['answer-box', 'acceptable', 'rubric', 'model-answer', 'marking-guide', 'teacher-note', 'flag', 'answer-asset', 'checking-disclaimer'];
  const present = [];
  for (const id of absent) if (await count(`[data-testid=${id}]`)) present.push(id);
  check('practice: no answer/acceptable/rubric/teacherNote/⚑/answerAsset/disclaimer in the DOM', present.length === 0, present.join(','));
  const leaks = [DISCLAIMER, byType('mcq').teacherNote || items.find(i => i.teacherNote).teacherNote, 'Also accept', '⚑', byType('short').modelAnswer, 'shallow frying'].filter(s => html.includes(s));
  check('practice: no checking text in the paper HTML', leaks.length === 0, leaks.join(' | '));
  check('practice: no mark buttons', await count('.mark-btn') === 0);
  check('390px: no horizontal scroll (school paper)', await noHScroll());
  await page.screenshot({ path: path.join(SHOTS, 'task30-paper-390.png'), fullPage: true });

  // Desktop + dark + print
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.screenshot({ path: path.join(SHOTS, 'task30-paper-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.selectOption('#theme-select', 'dark');
  check('dark theme applied', await page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'dark'));
  await page.screenshot({ path: path.join(SHOTS, 'task30-paper-dark-390.png'), fullPage: true });
  await page.selectOption('#theme-select', 'light');
  await page.emulateMedia({ media: 'print' });
  const printOk = await page.evaluate(() => ['#practice-banner', '.paper-toolbar', '#topbar'].every(s => { const e = document.querySelector(s); return !e || getComputedStyle(e).display === 'none'; }));
  check('print: toolbar/banner/topbar hidden', printOk);
  await page.screenshot({ path: path.join(SHOTS, 'task30-paper-print.png'), fullPage: true });
  await page.emulateMedia({ media: 'screen' });

  // Unlock checking mode
  await page.click('#mode-toggle');
  await page.fill('#mode-code', CODE); await page.click('#mode-confirm');
  await page.waitForSelector('#check-tools:not([hidden])');
  const topics = await page.$$eval('[data-testid=topics] li', n => n.map(x => x.textContent));
  check('checking: topics as tags', topics.includes('cooking') && topics.includes('hygiene'), topics.length);
  const disc = await page.$$eval('[data-testid=checking-disclaimer]', n => n.map(x => x.textContent));
  check('checking: disclaimer line once, exact text', disc.length === 1 && disc[0] === DISCLAIMER, disc.join('|'));
  const flagged = items.filter(i => i.answerConfidence === 'check').map(i => i.id).sort();
  const flags = await page.$$eval('[data-testid=flag]', n => n.map(x => x.closest('.item').getAttribute('data-id')).sort());
  check('checking: ⚑ on each "check" item and nowhere else', JSON.stringify(flags) === JSON.stringify(flagged), flags.join(','));
  await page.click('#show-all-btn');
  check('checking: show all reveals every answer', await count('[data-testid=answer-box]') === items.length);
  const acc = await page.$$eval('[data-testid=acceptable]', n => n.map(x => x.textContent));
  check('checking: "Also accept: …" on items with acceptable', acc.length === items.filter(i => i.acceptable).length && acc.some(a => a.startsWith('Also accept:') && a.includes('shallow frying')), acc[0]);
  const rub = await page.$$eval('[data-testid=rubric] li', n => n.map(x => x.textContent));
  check('checking: rubric bands', rub.length === items.filter(i => i.rubric).reduce((a, i) => a + i.rubric.length, 0) && rub.some(r => r.includes('1½')), rub[0]);
  const ma = await page.$eval('[data-testid=model-answer]', n => n.textContent).catch(() => '');
  check('checking: model answer', ma.includes(byType('short').modelAnswer));
  const mg = await page.$eval('[data-testid=marking-guide]', n => n.textContent).catch(() => '');
  check('checking: marking guide', mg.includes(byType('draw').markingGuide));
  const tn = await page.$eval('[data-testid=teacher-note]', n => n.textContent).catch(() => '');
  check('checking: teacherNote', tn.includes(items.find(i => i.teacherNote).teacherNote));
  const aa = await page.$eval('[data-testid=answer-asset] img', n => n.naturalWidth).catch(() => 0);
  check('checking: answerAsset picture loads', aa > 0);
  const mcq2 = items.find(i => i.type === 'mcq' && Array.isArray(i.answer));
  const mcqAns = await page.$eval(`.item[data-id="${mcq2.id}"] [data-testid=answer-box]`, n => n.textContent);
  const letters = mcq2.answer.map(a => 'abcd'[mcq2.options.indexOf(a)] + '. ' + a);
  check('checking: MCQ answer matched by option text (letters follow the text)', letters.every(l => mcqAns.includes(l)), letters.join(', '));
  const correct = await page.$$eval(`.item[data-id="${mcq2.id}"] .options li.is-correct`, n => n.map(x => x.textContent));
  check('checking: correct options highlighted by text', JSON.stringify(correct) === JSON.stringify(mcq2.options.filter(o => mcq2.answer.includes(o))), correct.join(','));
  const matchAns = await page.$$eval(`.item[data-id="${byType('match').id}"] [data-testid=match-key] li`, n => n.map(x => x.textContent));
  check('checking: match key by text', matchAns.length === 4 && matchAns[0].includes('Idli') && matchAns[0].includes('Steaming'), matchAns[0]);
  check('390px: no horizontal scroll (checking)', await noHScroll());
  await page.screenshot({ path: path.join(SHOTS, 'task31-checking-390.png'), fullPage: true });

  // ½ marking
  const btnVals = await page.$$eval(`.item[data-id="${byType('draw').id}"] .mark-btn`, n => n.map(x => x.textContent));
  check('marks: ½ steps up to the item marks (0 ½ 1 1½)', JSON.stringify(btnVals) === JSON.stringify(['0', '½', '1', '1½']), btnVals.join(' '));
  const halfVals = await page.$$eval(`.item[data-id="${byType('fill-blank').id}"] .mark-btn`, n => n.map(x => x.textContent));
  check('marks: a ½-mark item offers 0 and ½', JSON.stringify(halfVals) === JSON.stringify(['0', '½']), halfVals.join(' '));
  await page.$$eval('.marks-row', rows => rows.forEach(r => { const b = r.querySelectorAll('.mark-btn'); b[b.length - 1].click(); }));
  let score = (await page.textContent('#score-value')).replace(/\s/g, '');
  check('marks: full marks = 10 / 10', score === '10/10', score);
  await page.click(`.item[data-id="${byType('mcq').id}"] [data-testid="mark-btn-0.5"]`);
  await page.click(`.item[data-id="${byType('draw').id}"] [data-testid="mark-btn-0.5"]`);
  score = (await page.textContent('#score-value')).replace(/\s/g, '');
  check('marks: award ½ on two items → 8½ / 10', score === '8½/10', score);
  check('marks: ½ button shows as pressed', await page.$eval(`.item[data-id="${byType('draw').id}"] [data-testid="mark-btn-0.5"]`, n => n.classList.contains('is-on') && n.getAttribute('aria-pressed') === 'true'));
  await page.screenshot({ path: path.join(SHOTS, 'task31-marked-390.png'), fullPage: false });
  await page.click('#result-btn');
  await page.waitForSelector('#screen-result:not([hidden])');
  const total = await page.$eval('#result-summary .stat .value', n => n.textContent);
  check('result: total shows "/ 10" (printed total)', /\/\s*10$/.test(total) && total.includes('8½'), total);
  const rows = await page.$$eval('#result-table tbody tr', trs => trs.map(tr => Array.from(tr.children).map(td => td.textContent)));
  check('result: section rows with ½ and the printed total', rows.length === 3 && rows[0][2] === '4½' && rows[1][2] === '5½' && rows[2][2] === '10' && rows[2][1] === '8½', JSON.stringify(rows));
  check('result: section titles verbatim', rows[0][0].includes(SP.sections[0].title));
  await page.screenshot({ path: path.join(SHOTS, 'task31-result-390.png'), fullPage: true });
  await page.click('#result-back');

  // Dark + print in checking mode
  await page.selectOption('#theme-select', 'dark');
  await page.screenshot({ path: path.join(SHOTS, 'task31-checking-dark-390.png'), fullPage: true });
  await page.selectOption('#theme-select', 'light');
  await page.emulateMedia({ media: 'print' });
  const printHides = await page.evaluate(() => Array.from(document.querySelectorAll('.item-check, [data-testid=checking-disclaimer]')).every(e => getComputedStyle(e).display === 'none'));
  check('print: checking UI hidden in print', printHides);
  await page.screenshot({ path: path.join(SHOTS, 'task31-checking-print.png'), fullPage: true });
  await page.emulateMedia({ media: 'screen' });

  // Re-lock: checking UI leaves the DOM
  await page.click('#mode-toggle');
  const left = [];
  for (const id of absent) if (await count(`[data-testid=${id}]`)) left.push(id);
  check('re-lock: checking UI removed from the DOM', left.length === 0 && await count('.mark-btn') === 0, left.join(','));

  // Marks survive reload; card shows progress
  await page.reload();
  await page.waitForSelector('#screen-chapters:not([hidden])');
  const prog = await page.$eval('[data-testid=school-card-sp98]', n => n.innerText);
  check('marks survive reload (school card shows 11 of 11)', prog.includes(`${items.length} of ${items.length}`), prog.replace(/\n/g, ' | '));

  // Chapter paper still renders as before
  await (await page.$$('[data-testid=paper-group-chapters] .chapter-card'))[2].click();
  await page.waitForSelector('#screen-paper:not([hidden])');
  check('chapter paper: 60 items, Section headings as before', await count('.item') === 60 && (await page.textContent('.section-head h2')).includes('Section A ·'));
  check('chapter paper: generic header/instructions kept', await count('.instructions') === 1 && await count('[data-testid=paper-header-line]') === 0);
  await page.click('#mode-toggle');
  await page.fill('#mode-code', CODE); await page.click('#mode-confirm');
  await page.waitForSelector('#check-tools:not([hidden])');
  check('chapter paper: whole-mark buttons only, no disclaimer/⚑', await count('[data-testid="mark-btn-0.5"]') === 0 && await count('[data-testid=checking-disclaimer]') === 0 && await count('[data-testid=flag]') === 0);
  check('no JavaScript errors in console', errors.length === 0, errors.join(' | ').slice(0, 300));

  await browser.close();
  server.close();
  fs.rmSync(OUT, { recursive: true, force: true });
  const failed = results.filter(r => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
