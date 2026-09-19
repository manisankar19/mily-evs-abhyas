// Tiny static server for dist/ on http://localhost:4173 (crypto.subtle needs localhost or https).
const http = require('http'); const fs = require('fs'); const path = require('path');
const dir = path.join(__dirname, process.env.DIR || 'dist');   // DIR=dist-packed to test the packed build
const port = process.env.PORT || 4173;
http.createServer((req, res) => {
  const name = (req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]).replace(/[^a-zA-Z0-9._\/-]/g, '');
  const file = path.join(dir, name);
  if (!file.startsWith(dir) || !fs.existsSync(file)) { res.writeHead(404); res.end('Not found — run node build.js first'); return; }
  res.writeHead(200, { 'content-type': name.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log('dev: http://localhost:' + port + '  (' + dir + ')'));
