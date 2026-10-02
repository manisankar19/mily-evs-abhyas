#!/usr/bin/env bash
# Single-file CLI deploy (sprint v2). Validates, builds and stages dist/ locally (index.html +
# the static deploy/vercel.json) and uploads those prebuilt files; Vercel never builds this
# project, so the checking-code secret never leaves this machine. After a deploy the live
# index.html is fetched and its SHA-256 must equal the tested local file.
# Usage: scripts/deploy.sh --dry-run | --preview | --prod      (VERCEL_SCOPE overrides the team)
set -euo pipefail
cd "$(dirname "$0")/.."
MODE="${1:-}"
case "$MODE" in --dry-run|--preview|--prod) ;; *) echo "usage: scripts/deploy.sh --dry-run|--preview|--prod" >&2; exit 2 ;; esac
PROJECT=mily-evs-abhyas
SCOPE="${VERCEL_SCOPE:-mani125slm}"
LIVE_URL="https://mily-evs-abhyas.vercel.app"

node validate.js >/dev/null
node scripts/hash-existing.js --check
rm -rf dist
node build.js
cp deploy/vercel.json dist/vercel.json
files="$(ls -A dist | sort | tr '\n' ' ')"
[ "$files" = "index.html vercel.json " ] || { echo "deploy: unexpected files in dist/: $files" >&2; exit 1; }
SHA="$(sha256sum dist/index.html | cut -c1-64)"
echo "deploy: staged dist/ — index.html sha256 $SHA"
if [ "$MODE" = --dry-run ]; then echo "deploy: dry run, nothing sent to Vercel"; exit 0; fi

npx -y vercel link --yes --project "$PROJECT" --scope "$SCOPE" --cwd dist >/dev/null
ARGS=(deploy --yes --cwd dist --scope "$SCOPE")
[ "$MODE" = --prod ] && ARGS+=(--prod)
OUT="$(npx -y vercel "${ARGS[@]}")"
# Non-interactive CLI prints JSON ({ deployment: { url } }); an interactive one prints the URL.
URL="$(printf '%s' "$OUT" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).deployment.url)}catch(e){console.log(s.trim().split("\n").pop())}})')"
[[ "$URL" =~ ^https://[a-z0-9.-]+\.vercel\.app$ ]] || { echo "deploy: could not read the deployment URL" >&2; exit 1; }
echo "deploy: $URL"
if [ "$MODE" = --prod ]; then
  node scripts/verify-live.js "$LIVE_URL" dist/index.html
else
  node scripts/verify-live.js "$URL" dist/index.html --vercel-curl
fi
