#!/usr/bin/env node
// Builds dist/, serves it on :4173 and runs both browser suites (tests/e2e.js on the real
// data, tests/e2e-school.js on the school fixture). Usage: npm run test:e2e
// The checking code comes from GANESH_EVS or .env.local (read by build.js); it is never printed.
'use strict';
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const node = process.execPath;

const build = spawnSync(node, [path.join(ROOT, 'build.js')], { cwd: ROOT, stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status || 1);
const server = spawn(node, [path.join(ROOT, 'dev-server.js')], { cwd: ROOT, stdio: 'ignore' });
let code = 0;
setTimeout(() => {
  for (const suite of ['e2e.js', 'e2e-school.js']) {
    console.log(`\n== tests/${suite}`);
    const r = spawnSync(node, [path.join(__dirname, suite)], { cwd: ROOT, stdio: 'inherit' });
    if (r.status !== 0) code = 1;
  }
  server.kill();
  process.exit(code);
}, 800);
