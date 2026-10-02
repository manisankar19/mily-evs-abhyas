#!/usr/bin/env node
// Task 34: single-file CLI deploy. Source builds on Vercel are disabled (no secret there),
// the v1 split-deploy hash gate is retired, and a deploy dry run stages exactly the tested
// dist/index.html plus a static vercel.json. Zero dependencies.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
const check = (name, ok, why) => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : '  ' + (why || '')}`); };
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const root = JSON.parse(read('vercel.json'));
check('root vercel.json: Git deployments disabled', root.git && root.git.deploymentEnabled === false);
check('root vercel.json: a source build fails loudly instead of building without the secret', /exit 1/.test(root.buildCommand || ''), root.buildCommand);
check('v1 hash gate retired (deploy/check.js, deploy/expected.json removed)', !fs.existsSync(path.join(ROOT, 'deploy', 'check.js')) && !fs.existsSync(path.join(ROOT, 'deploy', 'expected.json')));
const stat = JSON.parse(read('deploy/vercel.json'));
check('deploy/vercel.json: static, no build, no rewrites to the old data projects', !stat.rewrites && stat.buildCommand === null && !/mily-evs-data/.test(read('deploy/vercel.json')));
check('deploy/vercel.json: no-cache + nosniff headers', /must-revalidate/.test(read('deploy/vercel.json')) && /nosniff/.test(read('deploy/vercel.json')));

const r = spawnSync('bash', [path.join(ROOT, 'scripts', 'deploy.sh'), '--dry-run'], { cwd: ROOT, encoding: 'utf8', env: { ...process.env, GANESH_EVS: process.env.GANESH_EVS || 'deploy-config-test-code' } });
check('deploy.sh --dry-run succeeds', r.status === 0, (r.stderr || r.stdout || '').slice(-300));
const files = fs.existsSync(path.join(ROOT, 'dist')) ? fs.readdirSync(path.join(ROOT, 'dist')).filter(f => f !== '.vercel').sort() : [];
check('staged dist/ is exactly index.html + vercel.json', JSON.stringify(files) === '["index.html","vercel.json"]', files.join(', '));
const secret = process.env.GANESH_EVS || 'deploy-config-test-code';
const html = fs.existsSync(path.join(ROOT, 'dist', 'index.html')) ? read('dist/index.html') : '';
check('staged index.html has the hash, not the plaintext code', html.includes(crypto.createHash('sha256').update(secret).digest('hex')) && !html.includes(secret));
check('dry run prints the SHA-256 it would verify after deploy', /sha256 [a-f0-9]{64}/.test(r.stdout || ''), (r.stdout || '').slice(-200));
check('dry run never contacts Vercel', !/vercel (deploy|link)/i.test((r.stdout || '').split('\n').filter(l => /^\+ /.test(l)).join('\n')));
console.log(`deploy-config: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
