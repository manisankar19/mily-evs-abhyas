/* EVS Practice — application logic. No framework, no dependencies.
   Data (UI strings, papers, config) is inlined by build.js as window.__EVS__. */
(function () {
  'use strict';

  const DATA = window.__EVS__;
  if (!DATA || !DATA.ui || !(DATA.papers || DATA.paperFiles)) {
    document.body.innerHTML = '<p style="padding:2rem;font-family:sans-serif">This page must be built with <code>node build.js</code> before it can run.</p>';
    return;
  }
  const UI = DATA.ui;
  const CFG = DATA.config;
  let PAPERS = [];
  function setPapers(list) {
    PAPERS = list.slice().sort((a, b) => {
      const ka = a.chapter === 0 ? 999 : a.chapter, kb = b.chapter === 0 ? 999 : b.chapter;
      return ka - kb;
    });
  }
  // Papers are normally inlined (single-file build). A split build ships them as
  // data/*.json next to the page and lists them in DATA.paperFiles instead.
  async function loadPapers() {
    if (Array.isArray(DATA.papers)) return DATA.papers;
    const files = DATA.paperFiles || [];
    const papers = await Promise.all(files.map(f => fetch('data/' + f, { cache: 'no-cache' }).then(r => {
      if (!r.ok) throw new Error(f + ' → HTTP ' + r.status);
      return r.json();
    })));
    // Sanity check on remotely loaded papers: totals and ids must be intact.
    papers.forEach((p, i) => {
      const ids = new Set();
      let sum = 0;
      p.sections.forEach(s => s.blocks.forEach(b => b.items.forEach(it => { sum += it.marks; ids.add(it.id); })));
      if (sum !== p.totalMarks || ids.size === 0) throw new Error(files[i] + ' is damaged (marks ' + sum + '/' + p.totalMarks + ')');
    });
    return papers;
  }

  // ---------- helpers ----------
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const DEVA = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  function fmt(n) {
    const s = String(n);
    return CFG.numerals === 'deva' ? s.replace(/\d/g, d => DEVA[+d]) : s;
  }
  function t(key, params) {
    if (!(key in UI)) throw new Error('Missing UI string: ' + key);
    let s = UI[key];
    if (params) {
      for (const k of Object.keys(params)) {
        const v = params[k];
        s = s.split('{' + k + '}').join(typeof v === 'number' ? fmt(v) : v);
      }
    }
    return s;
  }
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) for (const k of Object.keys(attrs)) {
      const v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : v);
    }
    if (children) for (const c of [].concat(children)) {
      if (c === null || c === undefined || c === false) continue;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return node;
  }
  function store(key, val) {
    try {
      if (val === undefined) { const v = localStorage.getItem(key); return v === null ? null : JSON.parse(v); }
      if (val === null) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
    return val;
  }
  async function sha256Hex(text) {
    if (!(window.crypto && crypto.subtle && crypto.subtle.digest)) return null;
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  function paperKey(p) { return p.chapter === 0 ? (p.kind || 'mock') : 'ch' + p.chapter; }
  function paperItems(p) {
    const out = [];
    p.sections.forEach(s => s.blocks.forEach(b => b.items.forEach(i => out.push(i))));
    return out;
  }

  // ---------- state ----------
  const state = {
    user: store('evs.session'),
    paper: null,
    checking: false,          // memory only — never persisted (BLUEPRINT §7.3)
    revealed: new Set(),
    marks: {}
  };
  const SECRET_HASH = ($('#secret-hash') && $('#secret-hash').textContent.trim()) || '';

  // ---------- static UI strings ----------
  function applyStaticStrings() {
    $$('[data-ui]').forEach(node => { node.textContent = t(node.getAttribute('data-ui')); });
    document.title = t('app.title') + ' · ' + t('app.tagline');
  }

  // ---------- theme ----------
  function applyTheme(val) {
    if (val === 'light' || val === 'dark') document.documentElement.setAttribute('data-theme', val);
    else document.documentElement.removeAttribute('data-theme');
    $('#theme-select').value = val || 'system';
  }

  // ---------- screens ----------
  const screens = ['login', 'chapters', 'paper', 'result'];
  function show(name) {
    screens.forEach(s => { $('#screen-' + s).hidden = s !== name; });
    $('#topbar').hidden = name === 'login';
    window.scrollTo(0, 0);
  }

  // ---------- login ----------
  function initLogin() {
    const form = $('#login-form'), err = $('#login-error');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const u = $('#login-user').value.trim(), p = $('#login-pass').value;
      if (u.toLowerCase() === CFG.login.user.toLowerCase() && p === CFG.login.pass) {
        state.user = CFG.login.user;
        store('evs.session', state.user);
        err.hidden = true;
        $('#login-pass').value = '';
        renderChapters();
        show('chapters');
      } else {
        err.textContent = t('login.error');
        err.hidden = false;
        $('#login-pass').value = '';
        $('#login-pass').focus();
      }
    });
    $('#logout-btn').addEventListener('click', () => {
      leavePaper();
      state.user = null;
      store('evs.session', null);
      show('login');
      $('#login-user').focus();
    });
  }

  // ---------- chapter list ----------
  function renderChapters() {
    $('#chapters-greeting').textContent = t('chapters.greeting', { name: state.user || CFG.login.user });
    $('#chapters-subtitle').textContent = t('chapters.subtitle', { marks: CFG.totalMarks, minutes: CFG.durationMinutes });
    const grid = $('#chapter-grid');
    grid.innerHTML = '';
    PAPERS.forEach(p => {
      const items = paperItems(p);
      const marks = store('evs.marks.' + paperKey(p)) || {};
      const done = items.filter(i => marks[i.id] !== undefined).length;
      const isMock = p.chapter === 0;
      const card = el('button', { type: 'button', class: 'chapter-card' + (isMock ? ' is-mock' : ''), onclick: () => openPaper(p) }, [
        el('span', { class: 'chip', text: isMock ? t('chapters.mockLabel') : t('chapters.chapterLabel', { n: p.chapter }) }),
        el('h2', { text: p.title }),
        el('span', { class: 'meta', text: t('chapters.cardMeta', { items: items.length, marks: p.totalMarks }) }),
        done ? el('span', { class: 'progress', text: t('chapters.marked', { done, total: items.length }) }) : null
      ]);
      grid.appendChild(card);
    });
  }

  // ---------- paper ----------
  function openPaper(p) {
    state.paper = p;
    state.checking = false;
    state.revealed = new Set();
    state.marks = store('evs.marks.' + paperKey(p)) || {};
    renderPaper();
    updateModeUI();
    show('paper');
  }
  function leavePaper() {
    state.checking = false;
    state.revealed = new Set();
    state.paper = null;
  }

  function renderPaper() {
    const p = state.paper;
    const root = $('#paper');
    root.innerHTML = '';
    const portion = p.chapter === 0 ? p.subtitle.split('—').pop().trim() : t('chapters.chapterLabel', { n: p.chapter }) + ' — ' + p.title;

    root.appendChild(el('header', { class: 'paper-head' }, [
      el('div', { class: 'school-hi', text: 'परमाणु ऊर्जा शिक्षण संस्था' }),
      el('div', { class: 'school', text: t('app.school') }),
      el('h1', { text: p.title }),
      el('div', { class: 'subtitle', text: p.subtitle }),
      el('div', { class: 'paper-meta' }, [
        el('div', { text: t('paper.headerSubject') }),
        el('div', { text: t('paper.headerClass') }),
        el('div', { text: t('paper.headerMarks', { marks: p.totalMarks }) }),
        el('div', { text: t('paper.headerTime', { minutes: p.durationMinutes || CFG.durationMinutes }) }),
        el('div', { class: 'span2', text: t('paper.headerPortion', { portion }) }),
        el('div', { text: t('paper.headerName') }),
        el('div', { text: t('paper.headerRoll') })
      ])
    ]));
    root.appendChild(el('div', { class: 'instructions' }, [
      el('strong', { text: t('paper.instructionsTitle') }),
      t('paper.instructions')
    ]));

    p.sections.forEach((sec, si) => {
      const secEl = el('section', { class: 'section', 'data-section': sec.code });
      secEl.appendChild(el('div', { class: 'section-head' }, [
        el('h2', {}, [
          sec.competency ? el('span', { class: 'competency', text: sec.competency }) : null,
          'Section ' + sec.code + ' · ' + sec.title
        ]),
        el('span', { class: 'marks', text: t('paper.sectionMarks', { marks: sec.marks }) })
      ]));
      sec.blocks.forEach(blk => secEl.appendChild(renderBlock(blk)));
      root.appendChild(secEl);
    });
    root.appendChild(el('div', { class: 'print-footer', text: t('print.footer', { title: p.title }) }));
  }

  function blockMarksText(blk) {
    const items = blk.items;
    const total = items.reduce((a, i) => a + i.marks, 0);
    const same = items.every(i => i.marks === items[0].marks);
    if (items.length > 1 && same) {
      return fmt(items.length) + ' × ' + fmt(items[0].marks) + ' = ' + fmt(total);
    }
    return fmt(total);
  }

  function renderBlock(blk) {
    const b = el('div', { class: 'block' });
    b.appendChild(el('div', { class: 'block-head' }, [
      el('span', { class: 'block-num', text: blk.num }),
      el('span', { class: 'block-instruction', text: blk.instruction }),
      el('span', { class: 'block-marks', text: '(' + blockMarksText(blk) + ')' })
    ]));
    if (blk.stimulus) {
      const st = blk.stimulus;
      const fig = el('figure', { class: 'stimulus' });
      if (st.asset) fig.appendChild(el('img', { src: st.asset, alt: st.caption || t('paper.figure') }));
      if (st.text) fig.appendChild(el('div', { class: 'stimulus-text', text: st.text }));
      if (st.caption) fig.appendChild(el('figcaption', { text: st.caption }));
      b.appendChild(fig);
    }
    blk.items.forEach(item => b.appendChild(renderItem(item)));
    return b;
  }

  function renderQuestion(item) {
    const body = el('div', { class: 'item-body' });
    if (item.type === 'long' && /\nOR\n/.test(item.q)) {
      const parts = item.q.split(/\nOR\n/);
      body.appendChild(el('p', { class: 'item-q', text: parts[0] }));
      body.appendChild(el('div', { class: 'or-line', text: t('paper.or') }));
      body.appendChild(el('p', { class: 'item-q', text: parts[1] }));
    } else {
      body.appendChild(el('p', { class: 'item-q', text: item.q }));
    }
    if (item.type === 'mcq' && item.options) {
      const letters = 'abcd';
      body.appendChild(el('ul', { class: 'options' }, item.options.map((o, i) => el('li', { 'data-letter': letters[i], text: o }))));
    }
    if (item.type === 'match' && item.pairs) {
      // Right column shown in a fixed shuffled order (deterministic per item so the paper is stable).
      const rights = item.pairs.map(p => p.right);
      const order = rights.map((_, i) => i).sort((a, b) => ((a * 7 + 3) % rights.length) - ((b * 7 + 3) % rights.length));
      const rows = item.pairs.map((p, i) => el('tr', {}, [
        el('td', { text: fmt(i + 1) + ') ' + p.left }),
        el('td', { text: String.fromCharCode(97 + i) + ') ' + rights[order[i]] })
      ]));
      body.appendChild(el('div', { class: 'table-scroll' }, [
        el('table', { class: 'match-table' }, [
          el('thead', {}, el('tr', {}, [el('th', { text: t('paper.columnA') }), el('th', { text: t('paper.columnB') })])),
          el('tbody', {}, rows)
        ])
      ]));
    }
    return body;
  }

  function renderItem(item) {
    const row = el('div', { class: 'item', 'data-id': item.id });
    row.appendChild(el('span', { class: 'item-label', text: item.label || '' }));
    row.appendChild(renderQuestion(item));
    row.appendChild(el('span', { class: 'item-marks', text: t('paper.itemMarks', { marks: item.marks }) }));
    if (state.checking) row.appendChild(renderCheck(item));
    if (state.marks[item.id] !== undefined) row.classList.add('is-marked');
    return row;
  }

  function renderAnswer(item) {
    const box = el('div', { class: 'answer' });
    box.appendChild(el('span', { class: 'tag', text: t('answer.tag') }));
    box.appendChild(el('div', { text: Array.isArray(item.answer) ? item.answer.join(', ') : item.answer }));
    if (Array.isArray(item.answerPoints) && item.answerPoints.length > 1) {
      box.appendChild(el('div', { class: 'tiny muted', text: t('answer.points') }));
      box.appendChild(el('ul', {}, item.answerPoints.map(ap => el('li', { text: ap.point + ' — ' + fmt(ap.marks) }))));
    }
    if (item.markingGuide) box.appendChild(el('div', { class: 'guide', text: t('answer.guide') + ': ' + item.markingGuide }));
    return box;
  }

  function renderCheck(item) {
    const wrap = el('div', { class: 'item-check no-print' });
    const revealed = state.revealed.has(item.id);
    const toggle = el('button', { type: 'button', class: 'btn btn-ghost btn-small', text: revealed ? t('answer.hide') : t('answer.show') });
    const ansHolder = el('div', { hidden: !revealed }, revealed ? renderAnswer(item) : null);
    toggle.addEventListener('click', () => {
      if (state.revealed.has(item.id)) {
        state.revealed.delete(item.id);
        ansHolder.hidden = true; ansHolder.innerHTML = '';
        toggle.textContent = t('answer.show');
      } else {
        state.revealed.add(item.id);
        ansHolder.innerHTML = ''; ansHolder.appendChild(renderAnswer(item));
        ansHolder.hidden = false;
        toggle.textContent = t('answer.hide');
      }
      updateShowAllLabel();
    });
    wrap.appendChild(toggle);
    wrap.appendChild(ansHolder);

    const marksRow = el('div', { class: 'marks-row', role: 'group', 'aria-label': t('marks.label') });
    marksRow.appendChild(el('span', { class: 'marks-label', text: t('marks.label') }));
    const current = state.marks[item.id];
    const btns = [];
    for (let m = 0; m <= item.marks; m++) {
      const b = el('button', { type: 'button', class: 'mark-btn' + (current === m ? ' is-on' : ''), text: fmt(m), 'aria-pressed': current === m ? 'true' : 'false' });
      b.addEventListener('click', () => setMark(item, m, btns));
      btns.push(b);
      marksRow.appendChild(b);
    }
    const clear = el('button', { type: 'button', class: 'mark-clear', text: t('marks.clear') });
    clear.addEventListener('click', () => setMark(item, undefined, btns));
    marksRow.appendChild(clear);
    wrap.appendChild(marksRow);
    return wrap;
  }

  function setMark(item, value, btns) {
    if (value === undefined) delete state.marks[item.id]; else state.marks[item.id] = value;
    store('evs.marks.' + paperKey(state.paper), state.marks);
    btns.forEach((b, i) => { b.classList.toggle('is-on', value === i); b.setAttribute('aria-pressed', value === i ? 'true' : 'false'); });
    const row = $('.item[data-id="' + item.id + '"]');
    if (row) row.classList.toggle('is-marked', value !== undefined);
    updateScore();
  }

  function computeScore() {
    const p = state.paper;
    const bySection = p.sections.map(sec => {
      let got = 0, max = 0, done = 0, count = 0;
      sec.blocks.forEach(b => b.items.forEach(i => {
        max += i.marks; count++;
        if (state.marks[i.id] !== undefined) { got += state.marks[i.id]; done++; }
      }));
      return { code: sec.code, title: sec.title, got, max, done, count };
    });
    const total = bySection.reduce((a, s) => ({ got: a.got + s.got, max: a.max + s.max, done: a.done + s.done, count: a.count + s.count }), { got: 0, max: 0, done: 0, count: 0 });
    return { bySection, total };
  }

  function updateScore() {
    if (!state.paper) return;
    const { total } = computeScore();
    $('#score-value').textContent = t('score.of', { got: total.got, total: total.max });
    $('#score-checked').textContent = t('score.items', { done: total.done, total: total.count });
  }

  function updateShowAllLabel() {
    const items = paperItems(state.paper);
    const all = items.every(i => state.revealed.has(i.id));
    $('#show-all-btn').textContent = all ? t('answer.hideAll') : t('answer.showAll');
  }

  // ---------- modes ----------
  function updateModeUI() {
    const on = state.checking;
    $('#mode-toggle').textContent = on ? t('mode.unlock') : t('mode.lock');
    $('#mode-toggle').classList.toggle('is-on', on);
    $('#mode-toggle').setAttribute('aria-pressed', on ? 'true' : 'false');
    $('#practice-banner').hidden = on;
    $('#checking-banner').hidden = !on;
    $('#check-tools').hidden = !on;
    if (on) { updateScore(); updateShowAllLabel(); }
  }
  function setChecking(on) {
    state.checking = on;
    if (!on) state.revealed = new Set();
    renderPaper();       // re-render so checking UI is added/removed from the DOM entirely
    updateModeUI();
  }

  function initModeDialog() {
    const dlg = $('#mode-dialog'), form = $('#mode-form'), code = $('#mode-code'), err = $('#mode-error');
    $('#mode-toggle').addEventListener('click', () => {
      if (state.checking) { setChecking(false); return; }
      err.hidden = true; code.value = '';
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
      code.focus();
    });
    $('#mode-cancel').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });   // backdrop click
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const entered = code.value.trim();
      const hash = await sha256Hex(entered);
      if (hash === null) { err.textContent = t('mode.insecure'); err.hidden = false; return; }
      if (entered && hash === SECRET_HASH) {
        dlg.close();
        setChecking(true);
      } else {
        err.textContent = t('mode.wrongCode'); err.hidden = false;
        code.value = ''; code.focus();
      }
    });
  }

  // ---------- paper toolbar ----------
  function initPaperToolbar() {
    $('#paper-back').addEventListener('click', () => { leavePaper(); renderChapters(); show('chapters'); });
    $('#paper-print').addEventListener('click', () => window.print());
    $('#show-all-btn').addEventListener('click', () => {
      const items = paperItems(state.paper);
      const all = items.every(i => state.revealed.has(i.id));
      state.revealed = all ? new Set() : new Set(items.map(i => i.id));
      renderPaper();
      updateShowAllLabel();
    });
    $('#clear-all-btn').addEventListener('click', () => {
      if (!window.confirm(t('marks.clearAllConfirm'))) return;
      state.marks = {};
      store('evs.marks.' + paperKey(state.paper), null);
      renderPaper();
      updateScore();
    });
    $('#result-btn').addEventListener('click', renderResult);
    $('#result-back').addEventListener('click', () => show('paper'));
    $('#result-chapters').addEventListener('click', () => { leavePaper(); renderChapters(); show('chapters'); });
  }

  // ---------- result ----------
  function gradeFor(pct) {
    if (pct >= 90) return t('grade.aplus');
    if (pct >= 75) return t('grade.a');
    if (pct >= 60) return t('grade.b');
    if (pct >= 40) return t('grade.c');
    return t('grade.d');
  }
  function renderResult() {
    const p = state.paper;
    const { bySection, total } = computeScore();
    const pct = total.max ? Math.round((total.got / total.max) * 100) : 0;
    $('#result-paper-title').textContent = t('result.paper', { title: p.title + ' · ' + p.subtitle });
    const summary = $('#result-summary');
    summary.innerHTML = '';
    summary.appendChild(el('div', { class: 'stat' }, [el('div', { class: 'label', text: t('result.total') }), el('div', { class: 'value', text: fmt(total.got) + ' / ' + fmt(total.max) })]));
    summary.appendChild(el('div', { class: 'stat' }, [el('div', { class: 'label', text: t('result.percent') }), el('div', { class: 'value', text: fmt(pct) + '%' })]));
    summary.appendChild(el('div', { class: 'stat' }, [el('div', { class: 'label', text: t('result.grade') }), el('div', { class: 'value grade', text: gradeFor(pct) })]));
    const unmarked = total.count - total.done;
    const warn = $('#result-warning');
    warn.hidden = unmarked === 0;
    if (unmarked) warn.textContent = t('result.unmarkedWarning', { count: unmarked });
    const table = $('#result-table');
    table.innerHTML = '';
    table.appendChild(el('thead', {}, el('tr', {}, [
      el('th', { text: t('result.section') }), el('th', { class: 'num', text: t('result.obtained') }), el('th', { class: 'num', text: t('result.max') }), el('th', { class: 'num', text: t('score.checked') })
    ])));
    const tb = el('tbody');
    bySection.forEach(s => tb.appendChild(el('tr', {}, [
      el('td', { text: s.code + ' · ' + s.title }), el('td', { class: 'num', text: fmt(s.got) }), el('td', { class: 'num', text: fmt(s.max) }), el('td', { class: 'num', text: fmt(s.done) + ' / ' + fmt(s.count) })
    ])));
    tb.appendChild(el('tr', { class: 'total' }, [
      el('td', { text: t('result.total') }), el('td', { class: 'num', text: fmt(total.got) }), el('td', { class: 'num', text: fmt(total.max) }), el('td', { class: 'num', text: fmt(total.done) + ' / ' + fmt(total.count) })
    ]));
    table.appendChild(tb);
    show('result');
  }

  // ---------- boot ----------
  async function boot() {
    try { setPapers(await loadPapers()); }
    catch (e) {
      document.body.innerHTML = '<p style="padding:2rem;font-family:sans-serif">Could not load the practice papers (' + String(e.message || e) + '). Please check your connection and reload.</p>';
      return;
    }
    applyStaticStrings();
    applyTheme(store('evs.theme') || 'system');
    $('#theme-select').addEventListener('change', e => { store('evs.theme', e.target.value); applyTheme(e.target.value); });
    initLogin();
    initModeDialog();
    initPaperToolbar();
    if (state.user) { renderChapters(); show('chapters'); } else { show('login'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
