// Vercel build step for the main project: refuses to go live unless the uploaded
// index.html and every remote paper file are byte-for-byte what was built locally.
// (The upload path re-types files; this gate makes a transcription slip fail the build.)
const fs = require('fs'), crypto = require('crypto');
const EXPECT = JSON.parse(fs.readFileSync('expected.json', 'utf8'));
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
(async () => {
  const local = sha(fs.readFileSync('index.html'));
  if (local !== EXPECT['index.html']) { console.error('index.html hash mismatch', local); process.exit(1); }
  const base = process.env.DATA_BASE || '';
  for (const [file, want] of Object.entries(EXPECT.data)) {
    const url = (base || want.url);
    const r = await fetch(base ? base + '/' + file : want.url, { cache: 'no-store' });
    if (!r.ok) { console.error('fetch failed', file, r.status); process.exit(1); }
    const got = sha(Buffer.from(await r.arrayBuffer()));
    if (got !== want.sha256) { console.error('hash mismatch', file, got, 'want', want.sha256); process.exit(1); }
    console.log('ok', file);
  }
  fs.mkdirSync('public', { recursive: true });
  fs.copyFileSync('index.html', 'public/index.html');
  console.log('verified', Object.keys(EXPECT.data).length, 'papers; index.html', local.slice(0, 12));
})().catch(e => { console.error(e); process.exit(1); });
