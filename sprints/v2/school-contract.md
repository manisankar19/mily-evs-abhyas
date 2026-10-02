# v2 shared contract: intake, school-paper JSON, fidelity, review sheets

This is the working agreement for the agents that run in parallel during Phases 1–3. `SCHEMA.md` (Task 9) is the final user-facing schema document and must agree with this file.

## Paths
| What | Path |
|---|---|
| Source PDFs (read-only) | `source/school-papers/*.pdf`, mapped to sp01…sp07 in `ls` order |
| Text cache (`pdftotext -layout`) | `source/text-cache/spNN.txt` (committed) |
| Page images | `source/page-images/spNN-P.png` (100 dpi) and `spNN-hi-P.png` (200 dpi), gitignored |
| Per-paper intake fragment | `source/intake/spNN.json` + `source/intake/spNN.md` |
| Merged intake | `source/intake.json` (`{ "papers": [ … ] }`, in sp order) + `source/SCHOOL-PAPERS-INTAKE.md` |
| School paper | `app/data/evs-spNN.json` |
| Review sheet | `sprints/v2/answer-review/spNN.md` |

## Intake entry (`source/intake/spNN.json`)
```json
{
  "sp": "sp01",
  "sourceFile": "2.1.1 class 4_twau_ch-3_ws.pdf",
  "sha256": "<64 hex>",
  "pdfPages": 4,
  "printedPages": 4,
  "textLayer": "usable | garbled",
  "header": ["each printed header line, verbatim (English parts; Hindi lines verbatim too)"],
  "printedTitle": "verbatim title line(s)",
  "shortLabel": "Worksheet: Chapter 3",
  "printedTotal": 20,
  "duration": "verbatim or null",
  "chapters": [3],
  "chaptersBeyond5": false,
  "sections": [
    { "code": "A", "heading": "verbatim section heading", "marks": 10,
      "blocks": [
        { "label": "Q1", "instruction": "verbatim instruction incl. printed marks e.g. (5×1=5)",
          "pattern": "fill-blank | mcq | true-false | match | one-word | short | long | diagram-label | draw | odd-one-out | classify | table | activity | other",
          "items": 5, "marksEach": 1, "marks": 5,
          "pictures": [ { "page": 2, "what": "what is drawn", "need": "label | answer-from | describe | decorative" } ],
          "notes": "anything odd: typo, duplicate option, bad numbering, missing marks" }
      ] }
  ],
  "markArithmetic": "do printed section marks sum to printed total? give the arithmetic",
  "flagEstimate": 6,
  "issues": ["anything the owner must decide"],
  "pagesViewed": [1, 2, 3, 4]
}
```
If the paper has no section letters, `code` is `"1"`, `"2"`, …, and `heading` is the printed heading (or `""` if there is none).

## School paper JSON (`app/data/evs-spNN.json`)
These are the paper fields used by chapter papers, plus the school-only fields marked †:
```json
{
  "schemaVersion": "2.0", "kind": "school"†, "sourceFile": "<as intake>"†, "sp": "sp01"†,
  "subject": "evs", "subjectDisplay": "EVS", "grade": 4, "locale": "en", "numerals": "latn",
  "title": "<printed title verbatim>", "shortLabel": "<intake shortLabel>"†, "subtitle": "…",
  "header": ["…"]†, "totalMarks": 20, "durationMinutes": null, "chapters": [3]†,
  "fallbackText": [ { "where": "<item id | s1 | s1-b2>", "field": "q|instruction|heading|option|passage", "text": "…", "reason": "garbled text layer | drawn-line blank | …" } ]†,
  "sections": [ { "code": "A", "title": "<printed heading verbatim>", "heading": "…"†, "marks": 10,
    "blocks": [ { "num": "Q1", "instruction": "<verbatim>", "passage": "<verbatim, optional>",
      "stimulus": { "asset": "assets/sp01-q3.svg", "caption": "…", "alt": "…" },
      "items": [ {
        "id": "evs-sp01-s1-b1-i1", "label": "(a)", "type": "fill-blank", "q": "<verbatim>",
        "options": ["…"], "marks": 0.5, "answer": "…", "acceptable": ["…"],
        "answerPoints": [ { "point": "…", "marks": 0.5 } ], "markingGuide": "…", "modelAnswer": "…",
        "rubric": [ { "band": "full", "marks": 2, "descriptor": "…" }, { "band": "partial", "marks": 1, "descriptor": "…" }, { "band": "none", "marks": 0, "descriptor": "…" } ],
        "topics": ["…"]†, "pictureDescription": "…"†, "underline": [ { "start": 4, "end": 9 } ]†,
        "answerSource": "authored"†, "answerConfidence": "sure | check"†, "teacherNote": "…"†,
        "sourceRef": "Ch 3 (deev103), p.N line/para", "skill": "…", "difficulty": "easy|medium|hard"
      } ] } ] } ]
}
```
- Id regex (school): `^evs-sp\d{2}-s\d+-b\d+-i\d+$`. The chapter regex is unchanged.
- Marks are multiples of 0.5. All sums are compared as integer half-units (`Math.round(m*2)`).
- `totalMarks` must equal `intake.printedTotal`. The section count and each section's marks must equal the intake.
- Judgement items (`short`, `long`, `draw`, `activity`, and any item with `answerConfidence: "check"` and marks > 1) need a `rubric` whose `full` band equals the item's marks.
- `acceptable` (non-empty array) is required on `fill-blank`, `one-word` and `transformation` items.
- `underline` spans are character offsets into `q`, with `0 ≤ start < end ≤ q.length`.
- Every `fallbackText` entry is listed by the fidelity report.

## Fidelity (`scripts/fidelity.js`)
- Normalise: NFC; curly→straight quotes; dashes → `-`; join hyphenated line-breaks; collapse whitespace; drop page footers, page numbers and Devanagari-only lines; lowercase; strip blank runs (`____`, `……`, `( )`).
- Every normalised `title`, `instruction`, `passage`, `q` and `options[]` string (blanks removed) must be a substring of the normalised text cache, **unless** a `fallbackText` entry covers that `where` and `field`. A `fallbackText` entry's `text` must equal the JSON string, and it is reported.
- The total, section count and section marks must match `source/intake.json`.
- Exit 1 on any mismatch. Print `spNN: X/Y strings matched, F fallback (P%)`.

## Review sheet (`scripts/review-sheet.js spNN`)
Generated from the JSON alone, deterministic, and starting with a line containing the JSON's SHA-256: `<!-- generated from app/data/evs-spNN.json sha256:<hex> — do not edit -->`. ⚑ items come first, then the rest in section order. `validate.js` regenerates the sheet in memory and fails if the file on disk differs.
