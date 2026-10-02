#!/usr/bin/env node
// Post-deploy gate: the deployed index.html must be byte-identical to the tested local file.
// Usage: node scripts/verify-live.js <url> dist/index.html [--vercel-curl]
//   --vercel-curl fetches through the Vercel CLI (for previews behind Vercel Authentication).
'use strict';
const fs = require('fs');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const [url, file] = process.argv.slice(2);
if (!/^https:\/\/[a-z0-9.-]+\.vercel\.app\/?$/.test(String(url)) || !file) { console.error('usage: node scripts/verify-live.js https://<name>.vercel.app dist/index.html [--vercel-curl]'); process.exit(2); }
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const want = sha(fs.readFileSync(file));
(async () => {
  let body;
  if (process.argv.includes('--vercel-curl')) {
    // Run inside dist/ (linked by deploy.sh): `vercel curl` forwards unknown flags such as --cwd to curl.
    body = execFileSync('npx', ['-y', 'vercel', 'curl', '/', '--deployment', url, '-s'], { cwd: 'dist', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    // Previews (never production) get Vercel's feedback toolbar appended after </html>; strip exactly that tag.
    const s = body.toString('utf8');
    const m = s.match(/<script async data-explicit-opt-in="true" data-deployment-id="dpl_[A-Za-z0-9]+" src="https:\/\/vercel\.live\/_next-live\/feedback\/feedback\.js"><\/script>\s*$/);
    if (m) { body = Buffer.from(s.slice(0, m.index), 'utf8'); console.log('verify-live: preview toolbar script stripped before comparing'); }
  }
  else {
    const r = await fetch(url.replace(/\/?$/, '/'), { cache: 'no-store', redirect: 'follow' });
    if (!r.ok) { console.error(`verify-live: HTTP ${r.status} from ${url}`); process.exit(1); }
    body = Buffer.from(await r.arrayBuffer());
  }
  const got = sha(body);
  if (got !== want) { console.error(`verify-live: MISMATCH — live ${got.slice(0, 16)}… ≠ local ${want.slice(0, 16)}…`); process.exit(1); }
  console.log(`verify-live: OK — ${url} serves the tested index.html (sha256 ${want.slice(0, 16)}…)`);
})().catch(e => { console.error('verify-live:', e.message); process.exit(1); });
