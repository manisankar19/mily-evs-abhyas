#!/usr/bin/env node
// Packs dist/index.html into dist-packed/{index.html, app.bin} — a tiny loader plus a
// gzip payload — for deployments where the full 170 KB page cannot be uploaded in one
// piece (the Vercel MCP upload path). The browser inflates app.bin with
// DecompressionStream and writes the page in place; behaviour is identical to dist/.
'use strict';
const fs = require('fs'); const path = require('path'); const zlib = require('zlib');
const src = path.join(__dirname, 'dist', 'index.html');
if (!fs.existsSync(src)) { console.error('pack: run node build.js first'); process.exit(1); }
const html = fs.readFileSync(src);
const out = path.join(__dirname, 'dist-packed');
fs.mkdirSync(out, { recursive: true });
const gz = zlib.gzipSync(html, { level: 9 });
fs.writeFileSync(path.join(out, 'app.bin'), gz);
const sha = require('crypto').createHash('sha256').update(gz).digest('hex');
const loader = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#1e3a5f"><title>EVS Practice · Class 4</title>
<style>body{margin:0;font-family:system-ui,sans-serif;background:#f4f7f4;color:#15202b;display:grid;place-items:center;min-height:100vh}p{padding:1rem;text-align:center}</style></head>
<body><p id="m">Loading EVS Practice…</p>
<script>
(async()=>{try{
  if(typeof DecompressionStream!=='function')throw new Error('This browser is too old. Please use an updated Chrome, Safari or Firefox.');
  const r=await fetch('app.bin?v=${sha.slice(0,8)}',{cache:'force-cache'});
  if(!r.ok)throw new Error('app.bin '+r.status);
  const t=await new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).text();
  document.open();document.write(t);document.close();
}catch(e){document.getElementById('m').textContent='Could not load the practice papers: '+e.message;}})();
</script></body></html>
`;
fs.writeFileSync(path.join(out, 'index.html'), loader);
fs.writeFileSync(path.join(out, 'app.bin.b64'), gz.toString('base64'));
console.log(`pack: dist-packed/app.bin ${(gz.length/1024).toFixed(1)} KB (sha256 ${sha.slice(0,12)}…), loader ${(loader.length/1024).toFixed(1)} KB, base64 ${(gz.length*4/3/1024).toFixed(1)} KB`);
