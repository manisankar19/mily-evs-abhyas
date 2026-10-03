// Live check (sprint v2, Task 35): one chapter paper and one school paper (sp05), practice and
// checking mode, on a phone-sized and a desktop-sized viewport, against the deployed site.
// Usage: node tests/e2e-live.js [url]   (default https://mily-evs-abhyas.vercel.app)
// The checking code comes from GANESH_EVS or .env.local and is never printed.
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const URL = process.argv[2] || 'https://mily-evs-abhyas.vercel.app/';
const CODE = process.env.GANESH_EVS || (fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').match(/GANESH_EVS=(.*)/) || [])[1];
const SHOTS = path.join(__dirname, 'screenshots');
const load = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'app', 'data', f), 'utf8'));
const itemsOf = (p) => p.sections.reduce((n, s) => n + s.blocks.reduce((m, b) => m + b.items.length, 0), 0);
const CH3 = load('evs-ch3.json'), SP05 = load('evs-sp05.json');
const results = [];
const check = (name, ok, extra) => { results.push(ok); console.log((ok ? '✓ ' : '✗ ') + name + (extra !== undefined && extra !== '' ? '  (' + extra + ')' : '')); };

async function run(browser, label, viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL, { waitUntil: 'load' });
  await page.fill('#login-user', 'Mily'); await page.fill('#login-pass', '2026'); await page.click('#login-form button[type=submit]');
  await page.waitForSelector('#screen-chapters:not([hidden])');
  const school = await page.$$('[data-testid=paper-group-school] .chapter-card');
  check(`${label}: School Papers group has 6 papers`, school.length === 6, school.length);
  await page.screenshot({ path: path.join(SHOTS, `task35-${label}-01-list.png`), fullPage: false });

  for (const [paper, open, key] of [[CH3, async () => (await page.$$('[data-testid=paper-group-chapters] .chapter-card'))[2].click(), 'ch3'],
                                    [SP05, () => page.click('[data-testid=school-card-sp05]'), 'sp05']]) {
    const n = itemsOf(paper);
    await open(); await page.waitForSelector('#screen-paper:not([hidden])');
    const shown = await page.$$eval('.item', x => x.length);
    const leaked = await page.$$eval('.answer,[data-testid=answer-box],[data-testid=flag],[data-testid=topics],[data-testid=checking-disclaimer]', x => x.length);
    const noScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    check(`${label} ${key}: practice — ${n} items, no answers, no sideways scroll`, shown === n && leaked === 0 && noScroll, `items ${shown}, leaked ${leaked}, scroll ok ${noScroll}`);
    await page.screenshot({ path: path.join(SHOTS, `task35-${label}-${key}-practice.png`) });
    await page.click('#mode-toggle'); await page.fill('#mode-code', CODE); await page.click('#mode-confirm');
    await page.waitForSelector('#check-tools:not([hidden])');
    // Topic chips hint the answer, so checking mode must not show them before "Show all answers".
    const chips = await page.$$eval('[data-testid=topics],.topics', x => x.length);
    check(`${label} ${key}: checking — no topic chips before Show all`, chips === 0, `chips ${chips}`);
    await page.click('#show-all-btn');
    const answers = await page.$$eval('.answer', x => x.length);
    await page.$$eval('.marks-row', rows => rows.forEach(r => { const b = r.querySelectorAll('.mark-btn'); b[b.length - 1].click(); }));
    const score = (await page.textContent('#score-value')).replace(/\s/g, '');
    check(`${label} ${key}: checking — ${n} answers, full marks ${paper.totalMarks}/${paper.totalMarks}`, answers === n && score === `${paper.totalMarks}/${paper.totalMarks}`, `answers ${answers}, score ${score}`);
    if (key === 'sp05') {
      await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
      const maps = await page.$$eval('[data-testid=answer-asset] img', x => x.map(i => i.naturalWidth > 0));
      check(`${label} sp05: answer maps load`, maps.length === 3 && maps.every(Boolean), maps.join(','));
      await (await page.$('[data-testid=answer-asset]')).scrollIntoViewIfNeeded();
    }
    await page.screenshot({ path: path.join(SHOTS, `task35-${label}-${key}-checking.png`) });
    await page.click('#mode-toggle');
    await page.click('#paper-back'); await page.waitForSelector('#screen-chapters:not([hidden])');
  }
  const src = await page.content();
  check(`${label}: page source has no plaintext code`, !src.includes(CODE));
  check(`${label}: no console errors`, errors.length === 0, errors.join(' | ').slice(0, 160));
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  await run(browser, 'phone', { width: 390, height: 844 });
  await run(browser, 'desktop', { width: 1280, height: 900 });
  await browser.close();
  const failed = results.filter(r => !r).length;
  console.log(`\n${results.length - failed}/${results.length} live checks passed (${URL})`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(String(e).slice(0, 300)); process.exit(1); });
