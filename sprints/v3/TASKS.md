# Sprint v3 — Tasks: No answer hints in checking mode

## Status: In progress

**STOP** marks a gate: report and wait for the owner before continuing.
Never change any `app/data/evs-*.json`. All 12 papers stay on the site, and `topics` stays in the data.

- [x] Task 1: Project setup: confirm the starting point. The working tree already has the v3 render change (`app/app.js`, `app/styles.css`, `tests/e2e-school.js`) and two Task 35 screenshots that were re-captured. Run `npm run validate` and `npm run check:existing`, then commit `sprints/v3/` (P0)
  - Acceptance: validate passes (12 papers, 613 items); `check:existing` exits 0; `git diff --stat app/data` is empty; `sprints/v3/PRD.md` and `TASKS.md` are committed
  - Files: sprints/v3/PRD.md, sprints/v3/TASKS.md
  - Completed: 2026-10-03 — validate OK (12 papers, 613 items); check:existing OK (6 papers byte-identical); app/data unchanged
- [ ] Task 2: Never render topic chips. `renderBody()` in `app/app.js` builds no `ul.topics` in any mode, and the dead `.topics` rules are removed from `app/styles.css` (screen and print). This change is already in the working tree; review it and commit it (P0)
  - Acceptance: `grep -n "topics" app/app.js` matches only the explanatory comment; `grep -n "\.topics" app/styles.css` returns nothing; `npm run build` succeeds and the page stays under 1.5 MB
  - Files: app/app.js, app/styles.css
- [ ] Task 3: Local browser test: `tests/e2e-school.js` asserts that there are no `[data-testid=topics]` / `.topics` in checking mode, both before and after "Show all answers". Also add an all-papers check to `tests/e2e.js`: for every paper in checking mode, the topic chip count is 0 (P0)
  - Acceptance: `npm run test:e2e` passes. A temporary revert of the Task 2 change makes the new checks fail, and that revert is not committed
  - Files: tests/e2e-school.js, tests/e2e.js
- [ ] Task 4: Live browser test: in `tests/e2e-live.js`, after the checking-mode unlock and **before** `#show-all-btn`, assert that ch3 and sp05 have zero `[data-testid=topics]` (phone and desktop) (P0)
  - Acceptance: `node --check tests/e2e-live.js` passes; the new check appears in the run output with a ✓ or ✗ line for each viewport and paper
  - Files: tests/e2e-live.js
- [ ] Task 5: Full local regression: run `test:fixtures`, `test:assets`, `test:brief`, `test:build`, `test:deploy`, `test:e2e`, `fidelity` and `npm audit` (P0)
  - Acceptance: every suite passes with counts at least the v2 counts; `npm audit` shows 0 vulnerabilities; results are recorded in this file
  - Files: sprints/v3/TASKS.md
- [ ] Task 6: **STOP**: ask the owner to approve the production deploy. Show the diff summary and test results (P0)
  - Acceptance: the owner's written go-ahead is recorded here with the date
  - Files: sprints/v3/TASKS.md
- [ ] Task 7: Production deploy and live check: `scripts/deploy.sh --prod`, then `node scripts/verify-live.js`, then `npm run test:live` (P0)
  - Acceptance: live bytes match `dist/index.html`; `test:live` shows every check passing, including the Task 4 no-chips checks; the deployment id and `index.html` sha256 are recorded
  - Files: tests/screenshots/task35-*.png, sprints/v3/TASKS.md
- [ ] Task 8: Docs: in `sprints/v2/WALKTHROUGH.md`, correct the two outdated lines that say topic tags appear in checking mode (the Architecture "App" bullet and the "Answer leak" fix), noting that v3 supersedes them. Then confirm `node tests/walkthrough.js` still passes (P1)
  - Acceptance: no line in the v2 walkthrough claims that topic tags are shown; `test:walkthrough` passes
  - Files: sprints/v2/WALKTHROUGH.md
- [ ] Task 9: Sprint v3 walkthrough (`/walkthrough`) (P2)
  - Acceptance: `sprints/v3/WALKTHROUGH.md` records what changed, the test results, the live deployment and what was not verified
  - Files: sprints/v3/WALKTHROUGH.md
