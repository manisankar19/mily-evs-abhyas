# Chapter Exam Practice Site — Blueprint (EVS instance)

This repo follows the generalised blueprint that came out of the Class IV Hindi site
(`Hindi EXAM-PRACTICE-SITE-BLUEPRINT.md` in the Claude project). The full text is kept
there; this file records only what this EVS instance decided or deviated on.

## Project Card
See `PROJECT-CARD.yml` — filled in from the real sample papers, not guessed.

## Decisions specific to EVS

1. **Chapters = 5, plus one mock.** The Half-Yearly portion is Chapters 1–5 of NCERT
   *Our Wondrous World*. Five chapter papers were counted from the textbook PDFs in the
   project. A sixth paper, `evs-hy.json` (chapter 0, kind `half-yearly`), mirrors the
   school's September worksheet across all five chapters — the sample paper the school
   actually set. Ids for it use `evs-c0-…`.
2. **Section blueprint (six sections, 100 marks)** keeps the school's three competency
   headings — Observation and Reporting (30), Identification and Classification (40),
   Discovery of Facts (30) — scaled from 25/30/25 of 80, each split in two so no section
   is longer than a phone screen. Every paper has exactly 60 items.
3. **No image assets.** The school worksheets use pictures (currency note, birds, cooking
   methods, map of India). Per §5.5 those were rewritten as situation-based "observe and
   answer" questions or "draw and label" tasks rather than depending on images that were
   not produced. `app/assets/` and the asset-inlining code path exist for later.
4. **Odd-one-out and fill-in-with-options** are stored as `mcq` (3–4 options, answer in
   options) so the validator can check them. `match` is one 5-mark item with `pairs`.
5. **Section objects carry `competency`** in addition to `code`/`title` — rendered as a
   small caption above the section title. The validator ignores it.
6. **Deployment is a pre-built static upload** (`dist/index.html`) because the Vercel
   environment variable could not be set from the build agent. `vercel.json` still
   supports a source deployment once `GANESH_EVS` is set in the Vercel project.
7. **Sample-paper intake:** three of the five worksheet PDFs were unreadable (custom font
   encoding; one is a Maths sheet mislabelled as EVS). Recorded in `source/README.md`
   rather than guessed at (§3.4).
