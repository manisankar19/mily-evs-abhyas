# Sprint v3 — PRD: No answer hints in checking mode (`mily-evs-abhyas`)

**Owner:** Manisankar · **Reported:** 2026-10-03, from the live site (screenshot: sp item "Identify the following pictures and name them" showing chips `birds`, `claws`)

## Overview
In checking mode, every school-paper question shows small grey topic chips under the question
(e.g. `birds`, `claws`). These usually name or strongly hint the answer, and they are visible
**before** the parent presses "Show answer". v2 already hid them in practice mode; this sprint
removes them from the page in checking mode too, re-verifies, and redeploys. No paper content changes.

## Goals
- No topic chip (`[data-testid=topics]` / `.topics`) is rendered for any item of any of the 12 papers, in practice or checking mode, before or after "Show answer".
- The `topics` field stays in the paper JSONs and in `SCHEMA.md`. It is metadata only, so no data is deleted and `npm run validate` is unchanged (12 papers, 613 items).
- `npm run test:e2e` asserts the chips are absent in checking mode (it currently asserts they are present).
- `tests/e2e-live.js` also checks for chips in checking mode, so production is verified.
- Production is redeployed with `scripts/deploy.sh --prod`, and `verify-live.js` confirms that the live bytes match the tested build.

## User Stories
- As the **parent**, I want checking mode to show only the question and the marking controls until I press "Show answer", so Mily can't read a hint off the screen while I check her answers.
- As **Mily**, I want to answer from what I know, not from a chip that names the answer.
- As the **owner**, I want the topic metadata kept in the data, so it can be used later (for example in a review sheet) without re-authoring.

## Technical Architecture
No new components. This is a render change in the existing single-file app.

```
app/data/evs-*.json (topics kept) ─► build.js ─► dist/index.html
                                                   │
app/app.js renderBody(): topic <ul> no longer built (any mode)
app/styles.css: .topics rules removed (dead CSS)
                                                   ▼
tests/e2e-school.js  checking: no [data-testid=topics]
tests/e2e-live.js    checking: no [data-testid=topics]  (production)
                                                   ▼
scripts/deploy.sh --prod ─► Vercel ─► scripts/verify-live.js (byte-for-byte)
```

**Status at PRD time:** the `app/app.js`, `app/styles.css` and `tests/e2e-school.js` changes are already made in the working tree, and they pass `validate` (12/613), `build` (1179 KB), `test:e2e` (58/58), `test:build` (24/24) and `test:deploy` (10/10). They are **not yet committed or deployed**. Still to do: the live-test assertion for checking mode, a production deploy after owner approval, the live check, and the v2 WALKTHROUGH note ("Topic tags appear only in checking mode" is now outdated).

## Out of Scope
- Removing or editing the `topics` field in any paper JSON or in `SCHEMA.md`.
- Showing the topics after "Show answer". If that is wanted later, it is a separate decision.
- Any other change to answers, pictures, marking or papers. All 12 papers stay as they are.
- Changes to the v1 chapter papers' rules.

## Dependencies
- Sprint v2 is complete and live at https://mily-evs-abhyas.vercel.app.
- The Vercel CLI is logged in for `scripts/deploy.sh --prod`. The production deploy needs the owner's go-ahead.
