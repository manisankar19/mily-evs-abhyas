# Sprint v3 — Walkthrough (No answer hints in checking mode)

## Summary
In checking mode, every school-paper question showed small grey topic chips (for example `birds`, `claws`), and they often named the answer before the parent pressed "Show answer". The owner reported this from the live site on 2026-10-03. The chips are now never shown, in either mode. The `topics` data stays in every paper JSON, so no content was deleted, and all 12 papers stay on the site. The fix was test-locked locally and on production, then deployed.

- **Live:** https://mily-evs-abhyas.vercel.app (production deployment `mily-evs-abhyas-nrztjk6zq`, `index.html` sha256 `427324d133018b85…`)
- **Before:** v2 production (`856d8f9cf51df160…`) showed 41 chips on sp05 in checking mode, and 253 across the 6 school papers.
- **After:** 0 chips on every paper, in both modes, before and after "Show all answers".

## Architecture Overview
No new components. This is a render change in the existing single-file app.

```
app/data/evs-*.json  (topics kept, unchanged)
        │
        ▼
build.js ──► dist/index.html (one file, 1179 KB)
        │        app.js renderBody(): no ul.topics in any mode
        │        styles.css: .topics rules removed
        ▼
tests/e2e.js          ch3 + 6 school papers: 0 chips, before/after Show all
tests/e2e-school.js   fixture paper: 0 chips, practice + checking (before/after)
tests/walkthrough.js  v2 walkthrough must not claim tags show
        ▼
scripts/deploy.sh --prod ─► Vercel ─► verify-live.js (bytes) ─► tests/e2e-live.js (20/20)
```

## Files Created/Modified

### app/app.js
**Purpose**: The whole client app: login, paper list, paper rendering, practice and checking modes, marking.
**Key Functions/Components**:
- `renderBody(item)` builds a question's body: text, options, match table and picture note.

**How it works**:
v2 appended a list of the item's `topics` as chips, gated only on checking mode:

```js
// v2 (removed)
if (state.checking && Array.isArray(item.topics) && item.topics.length)
  body.appendChild(el('ul', { class: 'topics', 'data-testid': 'topics' }, item.topics.map(x => el('li', { text: x }))));
```

Checking mode is turned on before any answer is revealed, so the chips were visible next to an unanswered question, and on picture questions they were often the answer itself. The line is now a comment explaining why topics are never rendered. Nothing else reads `item.topics` at render time.

### app/styles.css
**Purpose**: All screen and print styles.
**Change**: the `.topics` / `.topics li` rules (screen) and the `.topics li` print override were deleted as dead CSS.

### tests/e2e.js
**Purpose**: The main Playwright suite. It covers login, modes, marking, the result page, every chapter paper and every school paper.
**Change**: after unlocking checking mode, ch3 asserts 0 chips. In the loop over every school paper, chips are counted before and after `#show-all-btn`, both must be 0, and a screenshot `task3-spNN-checking-no-chips.png` is taken. Result: 53/53 (v2: 46).

### tests/e2e-school.js
**Purpose**: Detailed checks on a fixture school paper.
**Change**: the v2 assertion "checking: topics as tags" (which required chips) is replaced by "no topic tags" checks in checking mode, before and after "Show all answers". The existing practice-mode check stays. Result: 59/59 (v2: 58).

### tests/e2e-live.js
**Purpose**: Real-browser check of production (ch3 and sp05, phone 390 px and desktop 1280 px).
**Change**: a new check after the checking-mode unlock and before `#show-all-btn`: `${viewport} ${paper}: checking — no topic chips before Show all`. On the old production it reported 18/20, with sp05 ✗ (41 chips) on both viewports. After the deploy it reported 20/20.

### tests/walkthrough.js
**Purpose**: Keeps `sprints/v2/WALKTHROUGH.md` consistent with the data.
**Change**: a new check that the v2 text no longer says the tags "appear only in checking mode" and marks the change "Superseded in v3". It failed first (208 passed, 1 failed), and now passes 209/209.

### sprints/v2/WALKTHROUGH.md
**Change**: two sentences corrected: the Architecture "App" bullet and the "Answer leak" item under Found and fixed. Both now say tags are never shown and point to `sprints/v3/`. All other v2 figures are unchanged.

### sprints/v3/PRD.md, sprints/v3/TASKS.md, tests/screenshots/
The sprint plan and task log, with the result recorded per task. The task30, task31, task33 and task35 screenshots were refreshed; there are no chips in any of them. The new task3 screenshots show each school paper in checking mode with no chips.

## Data Flow
1. Parent opens a paper and unlocks checking mode with the code.
2. `renderBody()` draws each question with its options, table and picture note. Topic chips are not drawn.
3. The answer box, ⚑, teacherNote and answer map appear only after "Show answer" or "Show all answers", as in v2.
4. Marks given (0 / ½ / 1 …) feed the score and result page as before.

## Test Coverage
| Suite | Result |
|---|---|
| `npm run validate` | 12 papers, 613 items (unchanged) |
| `npm run check:existing` | 6 chapter papers byte-identical |
| `npm run fidelity` | OK, 6 school papers |
| `npm run test:fixtures` | 36/36 + fidelity 22/22 |
| `test:assets` / `test:brief` / `test:build` / `test:deploy` | 78/78 · 51/51 · 24/24 · 10/10 |
| `npm run test:e2e` | e2e **53/53**, e2e-school **59/59** |
| `npm run test:walkthrough` | **209/209** |
| `npm run test:live` (production) | **20/20** |
| `verify-live.js` | production alias serves the tested `index.html` byte-for-byte, and so does the deployment URL with `--vercel-curl` |

**Red check:** with the old render line restored, the new checks failed with sp01 37, sp03 53, sp04 34, sp05 41, sp06 51 and sp07 37 chips. The revert was not committed.

## Security Measures
- An answer-leak class was closed: no answer-derived metadata is in the DOM before "Show answer", except the answer content that is already gated.
- `npm audit`: 0 vulnerabilities. semgrep (`--config auto`) found nothing new. The 5 existing findings (path-join warnings in `scripts/`, missing-integrity in `app/index.html`) are the ones v2 already reviewed, and none is in a file changed in v3.

## Known Limitations
- **Post-deploy verify timing:** `scripts/deploy.sh --prod` checks the live bytes immediately, which is before the production alias finishes switching. It reported `MISMATCH` (old hash `856d8f9…`), and a manual re-run about 20 s later reported OK. The script does not retry.
- Topics are kept in the data but are now unused by the app. Any future use, such as on the review sheets, needs a separate decision.
- The Hindi text and ⚑ on a real phone were not re-verified (same as v2: the build host has no Devanagari font).
- Phones that already have the old page open may need one refresh.

## What's Next
- Make `deploy.sh` retry `verify-live.js` for a short time before reporting a mismatch.
- Optionally show topics *after* "Show answer", if the parent finds them useful. That needs an owner decision.
