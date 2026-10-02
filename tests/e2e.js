// Acceptance click-through (BLUEPRINT §13, items 7–19, 23–25) against a local dev server.
// Usage: GANESH_EVS=<code> node tests/e2e.js   (server must be running on :4173)
const { chromium } = require(process.env.NPM_GLOBAL ? require.resolve('playwright', { paths: [process.env.NPM_GLOBAL] }) : 'playwright');
const fs = require('fs');
const URL = process.env.URL || 'http://localhost:4173/';
const CODE = process.env.GANESH_EVS || (fs.readFileSync(__dirname + '/../.env.local', 'utf8').match(/GANESH_EVS=(.*)/) || [])[1];
const path = require('path');
// Counts come from the paper data, never hard-coded (Task 33).
const DATA = path.join(__dirname, '..', 'app', 'data');
const PAPERS = fs.readdirSync(DATA).filter(f => /^evs-.*\.json$/.test(f)).map(f => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')));
const CHAPTERS = PAPERS.filter(p => p.kind !== 'school').sort((a, b) => (a.chapter || 99) - (b.chapter || 99));
const SCHOOL = PAPERS.filter(p => p.kind === 'school').sort((a, b) => a.sp.localeCompare(b.sp));
const itemsOf = (p) => p.sections.reduce((n, s) => n + s.blocks.reduce((m, b) => m + b.items.length, 0), 0);
const CH3 = CHAPTERS.find(p => p.chapter === 3);
const CH3_INDEX = CHAPTERS.indexOf(CH3), CH3_ITEMS = itemsOf(CH3);
const fmtTotal = (n) => String(n).replace('.5', '½');
const results = [];
function check(name, ok, extra) { results.push({ name, ok: !!ok, extra }); console.log((ok ? '✓ ' : '✗ ') + name + (extra ? '  (' + extra + ')' : '')); }

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(URL);
  // Login
  check('login screen visible', await page.isVisible('#screen-login'));
  await page.fill('#login-user', 'Mily'); await page.fill('#login-pass', 'wrong'); await page.click('#login-form button[type=submit]');
  check('wrong login shows error', await page.isVisible('#login-error'));
  await page.fill('#login-pass', '2026'); await page.click('#login-form button[type=submit]');
  await page.waitForSelector('#screen-chapters:not([hidden])');
  const cards = await page.$$('[data-testid=paper-group-chapters] .chapter-card');
  check(`chapter list has ${CHAPTERS.length} chapter papers`, cards.length === CHAPTERS.length, cards.length);
  const schoolCards = await page.$$('[data-testid=paper-group-school] .chapter-card');
  check(`School Papers group has ${SCHOOL.length} papers`, schoolCards.length === SCHOOL.length, schoolCards.length);
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'task33-01-paper-list.png'), fullPage: true });
  check('no horizontal scroll at 390px (chapters)', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));

  // Open chapter 3
  await cards[CH3_INDEX].click();
  await page.waitForSelector('#screen-paper:not([hidden])');
  const itemCount = await page.$$eval('.item', n => n.length);
  check(`paper renders ${CH3_ITEMS} items`, itemCount === CH3_ITEMS, itemCount);
  const visible = await page.$eval('#paper', n => n.innerText);
  check('practice mode: no answer text in rendered paper', !visible.includes('Model answer') && !/Mark split/.test(visible) && (await page.$$('.answer')).length === 0);
  check('practice mode: no reveal / mark buttons', (await page.$$('.item-check')).length === 0 && (await page.$$('.mark-btn')).length === 0);
  check('practice mode: score bar & result hidden', await page.isHidden('#check-tools') && await page.isHidden('#result-btn'));
  check('practice banner visible', await page.isVisible('#practice-banner'));
  check('no horizontal scroll at 390px (paper)', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));

  // Gate
  await page.click('#mode-toggle');
  check('dialog opens', await page.evaluate(() => document.getElementById('mode-dialog').open));
  await page.keyboard.press('Escape');
  check('Escape closes without unlocking', await page.evaluate(() => !document.getElementById('mode-dialog').open) && await page.isHidden('#check-tools'));
  await page.click('#mode-toggle'); await page.click('#mode-cancel');
  check('Cancel closes without unlocking', await page.evaluate(() => !document.getElementById('mode-dialog').open) && await page.isHidden('#check-tools'));
  await page.click('#mode-toggle');
  await page.mouse.click(5, 5);
  check('backdrop click closes without unlocking', await page.evaluate(() => !document.getElementById('mode-dialog').open) && await page.isHidden('#check-tools'));
  await page.click('#mode-toggle');
  await page.fill('#mode-code', 'nope'); await page.click('#mode-confirm');
  await page.waitForTimeout(200);
  check('wrong code shows error, stays locked', await page.isVisible('#mode-error') && await page.evaluate(() => document.getElementById('mode-dialog').open) && await page.isHidden('#check-tools'));
  await page.fill('#mode-code', CODE); await page.click('#mode-confirm');
  await page.waitForSelector('#check-tools:not([hidden])');
  check('correct code unlocks checking UI', (await page.$$('.mark-btn')).length > 0);

  // Reveal one
  const firstToggle = (await page.$$('.item-check .btn'))[0];
  await firstToggle.click();
  const firstAns = await page.$eval('.item-check .answer', n => n.textContent);
  check('per-question reveal shows the right answer', firstAns.includes('Pachmarhi'), firstAns.slice(0, 60));
  await firstToggle.click();
  check('reveal hides again', (await page.$$('.answer')).length === 0);
  await page.click('#show-all-btn');
  check('show all reveals every answer', (await page.$$('.answer')).length === CH3_ITEMS);
  await page.click('#show-all-btn');
  check('show all again hides all', (await page.$$('.answer')).length === 0);

  // Full marks everywhere
  await page.$$eval('.marks-row', rows => rows.forEach(r => { const b = r.querySelectorAll('.mark-btn'); b[b.length - 1].click(); }));
  const score = await page.textContent('#score-value');
  check(`full marks total exactly ${CH3.totalMarks}`, score.replace(/\s/g, '') === `${CH3.totalMarks}/${CH3.totalMarks}`, score);
  await page.click('#result-btn');
  await page.waitForSelector('#screen-result:not([hidden])');
  const rows = await page.$$eval('#result-table tbody tr', trs => trs.map(tr => Array.from(tr.children).map(td => td.textContent)));
  const wantRows = CH3.sections.map(s => String(s.marks)).concat(String(CH3.totalMarks));
  check('result section-wise figures', JSON.stringify(rows.map(r => r[1])) === JSON.stringify(wantRows), JSON.stringify(rows.map(r => r[1])));
  check('result: no unmarked warning', await page.isHidden('#result-warning'));
  await page.click('#result-back');

  // Re-lock
  await page.click('#mode-toggle');
  check('toggle off hides marks and answers', (await page.$$('.mark-btn')).length === 0 && (await page.$$('.answer')).length === 0 && await page.isHidden('#check-tools'));
  // Reload → practice mode, marks survive
  await page.reload();
  await page.waitForSelector('#screen-chapters:not([hidden])');
  check('reload returns to chapter list (session kept)', true);
  const prog = await page.$$eval('.chapter-card .progress', n => n.map(x => x.textContent));
  check(`marks survive reload (card shows ${CH3_ITEMS} of ${CH3_ITEMS})`, prog.some(p => p.includes(`${CH3_ITEMS} of ${CH3_ITEMS}`)), prog.join('|'));
  await (await page.$$('[data-testid=paper-group-chapters] .chapter-card'))[CH3_INDEX].click();
  await page.waitForSelector('#screen-paper:not([hidden])');
  check('paper opens in practice mode after reload', await page.isHidden('#check-tools') && (await page.$$('.mark-btn')).length === 0);

  // Secret not in page
  const src = await page.content();
  check('view-source has no plaintext code', !src.includes(CODE));
  check('64-hex hash present', /<script id="secret-hash"[^>]*>[a-f0-9]{64}<\/script>/.test(src));

  // Print CSS: emulate
  await page.emulateMedia({ media: 'print' });
  const printHidden = await page.evaluate(() => ['#practice-banner', '#mode-dialog', '.paper-toolbar', '#topbar'].every(s => { const e = document.querySelector(s); return !e || getComputedStyle(e).display === 'none'; }));
  check('print hides banner, toolbar, dialog, topbar', printHidden);
  await page.emulateMedia({ media: 'screen' });

  // Dark theme renders
  await page.selectOption('#theme-select', 'dark');
  check('dark theme applied', await page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'dark'));
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'task33-chapter-dark.png'), fullPage: false });
  await page.selectOption('#theme-select', 'light');
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'task33-chapter-light.png'), fullPage: false });

  // Other chapter papers open without errors
  for (let i = 0; i < CHAPTERS.length; i++) {
    await page.click('#paper-back'); await page.waitForSelector('#screen-chapters:not([hidden])');
    await (await page.$$('[data-testid=paper-group-chapters] .chapter-card'))[i].click(); await page.waitForSelector('#screen-paper:not([hidden])');
    const n = await page.$$eval('.item', x => x.length);
    if (n !== itemsOf(CHAPTERS[i])) check(`chapter paper ${i + 1} item count`, false, n);
  }
  check(`all ${CHAPTERS.length} chapter papers open with the right item counts`, true);

  // Every real school paper: practice (no answers in the DOM), checking (every answer), printed total
  for (const sp of SCHOOL) {
    const n = itemsOf(sp);
    await page.click('#paper-back'); await page.waitForSelector('#screen-chapters:not([hidden])');
    await page.click(`[data-testid=school-card-${sp.sp}]`); await page.waitForSelector('#screen-paper:not([hidden])');
    const shown = await page.$$eval('.item', x => x.length);
    const leaked = await page.$$eval('[data-testid=answer-box],[data-testid=acceptable],[data-testid=rubric],[data-testid=teacher-note],[data-testid=flag],[data-testid=answer-asset],[data-testid=checking-disclaimer],[data-testid=topics]', x => x.length);
    const noScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    await page.screenshot({ path: path.join(__dirname, 'screenshots', `task33-${sp.sp}-practice.png`) });
    await page.click('#mode-toggle'); await page.fill('#mode-code', CODE); await page.click('#mode-confirm');
    await page.waitForSelector('#check-tools:not([hidden])');
    await page.click('#show-all-btn');
    const boxes = await page.$$eval('[data-testid=answer-box]', x => x.length);
    const flags = await page.$$eval('[data-testid=flag]', x => x.length);
    const wantFlags = sp.sections.reduce((a, s) => a + s.blocks.reduce((b, bl) => b + bl.items.filter(i => i.answerConfidence === 'check').length, 0), 0);
    const disclaimer = await page.$$eval('[data-testid=checking-disclaimer]', x => x.length);
    await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
    const pics = await page.$$eval('[data-testid=stimulus] img, [data-testid=answer-asset] img', x => x.map(i => i.complete && i.naturalWidth > 0));
    const wantPics = sp.sections.reduce((a, s) => a + s.blocks.reduce((b, bl) => b + (bl.stimulus && bl.stimulus.asset ? 1 : 0) + bl.items.filter(i => i.answerAsset).length, 0), 0);
    check(`${sp.sp}: all ${wantPics} pictures and answer maps load`, pics.length === wantPics && pics.every(Boolean), `${pics.filter(Boolean).length}/${pics.length} loaded, want ${wantPics}`);
    await page.$$eval('.marks-row', rows => rows.forEach(r => { const b = r.querySelectorAll('.mark-btn'); b[b.length - 1].click(); }));
    const score = (await page.textContent('#score-value')).replace(/\s/g, '');
    await page.screenshot({ path: path.join(__dirname, 'screenshots', `task33-${sp.sp}-checking.png`) });
    check(`${sp.sp}: ${n} items, no answers in practice mode, ${n} answers + ${wantFlags} ⚑ in checking mode, full marks = ${fmtTotal(sp.totalMarks)}`,
      shown === n && leaked === 0 && noScroll && boxes === n && flags === wantFlags && disclaimer === 1 && score === `${fmtTotal(sp.totalMarks)}/${fmtTotal(sp.totalMarks)}`,
      `items ${shown}, leaked ${leaked}, scroll ${noScroll}, answers ${boxes}, flags ${flags}, disclaimer ${disclaimer}, score ${score}`);
    await page.click('#mode-toggle');
  }
  check('no JavaScript errors in console', errors.length === 0, errors.join(' | ').slice(0, 200));

  await browser.close();
  const failed = results.filter(r => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
