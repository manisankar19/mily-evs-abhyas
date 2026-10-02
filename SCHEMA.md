# Paper JSON schema

Every paper is one JSON file in `app/data/`. `validate.js` checks it (`npm run validate`), and `tests/fixtures.js` proves each rule with a fixture that breaks it.

There are two kinds of paper:

- **Chapter papers**: `kind` is absent, `"chapter"`, or any value other than `"school"` (the half-yearly mock uses `"half-yearly"`). These are the six v1 papers `evs-ch1…ch5` and `evs-hy`. Their rules are exactly the v1 rules and must never be loosened.
- **School papers**: `"kind": "school"`. These are the teacher's printed worksheets (`app/data/evs-spNN.json`), copied exactly as printed. They have their own rules. The working contract is `sprints/v2/school-contract.md`, and this file agrees with it.

## 1. Paper fields

| Field | Type | Chapter | School |
|---|---|---|---|
| `schemaVersion` | string, must be `"2.0"` | required | required |
| `kind` | string | optional (`"half-yearly"` on the mock) | required, `"school"` |
| `subject` | string (`"evs"`) | required | required |
| `subjectDisplay` | string (`"EVS"`) | used by the app | used by the app |
| `grade` | number (`4`) | used by the app | used by the app |
| `chapter` | number (`0` for the mock) | used by the app and build | not used |
| `locale` | string (`"en"`) | required | required |
| `numerals` | string (`"latn"`) | required | required |
| `title` | string | required | required, the printed title verbatim |
| `subtitle` | string | required | required |
| `sourceRef` | string | optional | optional |
| `totalMarks` | number | required, must equal the item sum | required, must equal the item sum **and** the intake's `printedTotal` |
| `durationMinutes` | number or `null` | optional | optional (`null` when not printed) |
| `sections` | array of sections | required | required |
| `sp` † | string matching `^sp\d{2}$` | — | required, and must have an entry in the intake file |
| `sourceFile` † | string | — | required, must equal the intake entry's `sourceFile` |
| `shortLabel` † | string | — | required (the card label on the site) |
| `header` † | array of strings | — | optional, printed header lines verbatim |
| `chapters` † | array of numbers | — | optional, chapters the paper covers |
| `fallbackText` † | array (see §5) | — | optional; omit it when empty |

† School-only fields.

A "required" string must be present and not `""`. The raw file must not contain `TODO`, `TBD`, `lorem`, `[]`, `{}` or `[ ]` anywhere (the placeholder check applies to both kinds). So an empty list must be left out, not written as `[]`.

## 2. Section and block fields

| Field | Type | Rule |
|---|---|---|
| `section.code` | string | required. For a school paper without section letters, `"1"`, `"2"`, … |
| `section.title` | string | required. For a school paper, the printed heading verbatim |
| `section.heading` † | string | optional, the printed heading verbatim (school) |
| `section.competency` | string | optional (chapter papers) |
| `section.marks` | number | required, must equal the sum of its items' marks. School: must also equal the intake section's `marks`, and the section count must equal the intake's |
| `section.blocks` | array | the blocks of the section |
| `block.num` | string | required, the printed question number (`Q.1`, `Q1`) |
| `block.instruction` | string | the printed instruction verbatim |
| `block.passage` | string | optional, a printed passage verbatim |
| `block.stimulus` | object | optional: `asset` (must match `assets/<lowercase-name>.svg` (or `.png`, `.jpg`), so no path traversal, and must exist under `app/`; applies to every paper, and no existing paper has a stimulus), `caption` (required when there is an `asset`), `alt` |
| `block.items` | array | the items |

## 3. Item fields

| Field | Type | Chapter | School |
|---|---|---|---|
| `id` | string | `^[a-z]+-c\d+-s\d+-b\d+-i\d+$`, unique | `^evs-sp\d{2}-s\d+-b\d+-i\d+$`, unique, and the `spNN` part must equal the paper's `sp` |
| `label` | string | optional | optional, the printed `(a)` / `(i)` / `Q1` |
| `type` | string | one of `mcq multi-select true-false fill-blank match one-word short long numeric diagram-label draw handwriting activity` | the same, plus `transformation` |
| `q` | string | required, not blank | required, the printed question verbatim |
| `options` | array of strings | MCQ: 3–4 options | MCQ: at least 2 options |
| `marks` | number > 0 | required (whole numbers in practice) | required, a multiple of 0.5 |
| `answer` | string, or array of strings | required, not blank | required, not blank |
| `acceptable` | array of strings | optional | required (non-empty) on `fill-blank`, `one-word`, `transformation` |
| `answerPoints` | array of `{ point, marks }` | marks must sum to `marks` | marks must sum to `marks` (compared in half-units) |
| `markingGuide` | string | required on `draw`, `handwriting`, `activity`; items over 1 mark need `answerPoints` or `markingGuide` | same |
| `modelAnswer` | string | optional | optional |
| `rubric` | array of bands (see §4) | optional | required on judgement items |
| `pairs` | array of `{ left, right }` | match: at least 3 pairs, and pairs = marks | match: at least 2 pairs; see §3.2 |
| `topics` † | array of strings | — | optional, non-empty when present |
| `pictureDescription` † | string | — | optional; a text description of a decorative picture that is not drawn |
| `underline` † | array of `{ start, end }` | — | optional; see §3.3 |
| `answerSource` † | string | — | required, `"authored"` |
| `answerConfidence` † | string | — | required, `"sure"` or `"check"` (⚑) |
| `teacherNote` † | string | — | optional; explains a printed oddity (typo, duplicate option, two defensible answers, odd marks) |
| `sourceRef` | string | optional | optional, e.g. `"Ch 3 (deev103), p.N line/para"` |
| `skill` | string | optional | optional |
| `difficulty` | string | present on every v1 item, not enforced | required, `easy` / `medium` / `hard` |

A `true-false` answer must start with `True` or `False` (both kinds).

### 3.1 Half marks (school)
Marks are multiples of 0.5. Every comparison (item vs `answerPoints`, rubric `full` band vs item, section sum vs section marks, paper sum vs `totalMarks`, `totalMarks` vs intake, section marks vs intake) is done in integer half-units, `Math.round(marks * 2)`, so floating-point sums never matter. A mark such as `0.3` is reported as `marks 0.3 is not a multiple of 0.5`. When that happens the section and paper sum checks are skipped, so that error is the only one shown.

### 3.2 MCQ and match on printed papers (school)
- **MCQ.** At least 2 options. A string `answer` must be one of the options. When a printed MCQ has two defensible options, `answer` is an array listing each of them (each element must be an option), and a `teacherNote` says why.
- **Match.** `pairs.length` may differ from `marks` only when `marks = pairs × k` for a ½-step `k` (for example 4 pairs for 2 marks, ½ each), or when the item has a `teacherNote` explaining the printed marks.

### 3.3 Underline spans (school)
`underline` is a list of `{ "start": s, "end": e }` character offsets into `q` (UTF-16 code units, the JavaScript `String` index): integers with `0 ≤ start < end ≤ q.length`. The underlined text is `q.slice(start, end)`.

## 4. Rubrics (band marking)
A rubric is a list of bands: `{ "band": "full" | "partial" | "none" | …, "marks": n, "descriptor": "…" }`. Each band needs a name, a descriptor, and ½-step marks between 0 and the item's marks. There must be exactly one `full` band, and its marks must equal the item's marks.

**Judgement items** need a rubric: `short`, `long`, `draw` and `activity` items, and any item with `answerConfidence: "check"` and marks > 1.

## 5. `fallbackText` (school)
Used where the PDF text layer can't be matched (drawn-line blanks, mangled text). The fidelity check (`scripts/fidelity.js`) reports each entry.
```json
{ "where": "evs-sp01-s1-b2-i3 | s1 | s1-b2", "field": "q | instruction | heading | option | passage", "text": "…", "reason": "drawn-line blank" }
```
`where` must name an existing item id, section (`sN`, 1-based) or block (`sN-bM`, 1-based). `field`, `text` and `reason` are required. `fidelity.js` checks that `text` equals the JSON string.

## 6. Checks that apply to every paper

### 6.1 The caption or alt text must not give away the answer
An item is **picture-dependent** when its block has a `stimulus`, or the item has a `pictureDescription`. For such an item, these texts are checked:

- the block's `stimulus.caption` and `stimulus.alt`
- the item's `pictureDescription`

None of them may contain any of these **needles** as a whole word or phrase, case-insensitively:

- the item's `answer` (each element when it is an array)
- every `acceptable` string

"Whole word" means the needle is not preceded or followed by a Unicode letter or digit. So `"cow"` matches `"A cow."` but not `"cowshed"`. Needles shorter than 2 characters are ignored. `true-false` items (the answer is True/False) and `match` items (the answer is the pairing, which the pairs already show) are skipped.

## 7. Intake and review sheet (school)
- **Intake.** `source/intake.json` (`{ "papers": [ … ] }`) by default. Override it with `node validate.js --intake <path> …` or the `EVS_INTAKE` env var (fixtures use `tests/fixtures/school/intake.json`). A school paper whose `sp` has no intake entry is an error. Only `sp`, `sourceFile`, `printedTotal` and `sections[].marks` are read here. The rest of the intake is described in `sprints/v2/school-contract.md`.
- **Review sheet.** `validate.js` loads `scripts/review-sheet.js` only when it validates a school paper. It calls `renderSheet(paper, rawJsonText)` and compares the result with `sprints/v2/answer-review/<sp>.md` (override the directory with `EVS_REVIEW_DIR`). A missing or different file is an error. Regenerate the sheet with `node scripts/review-sheet.js <sp>`.

## 8. Chapter-only checks (unchanged from v1)
45–60 items per paper; MCQ 3–4 options; match pairs = marks with at least 3 pairs; the chapter id regex; sums compared as plain numbers. School papers have no item-count limits.

## Decisions

Before any new all-paper check was added, it was run against the 6 existing papers. A check was applied to every paper only if all 6 already passed it. Otherwise it was gated to `kind: "school"`. The existing papers are byte-identical (`node scripts/hash-existing.js --check`), and `npm run validate` gives the same output as before.

| Check | Result on existing papers | Applied to |
|---|---|---|
| `acceptable` on fill-blank / one-word / transformation | **Gated to school** because every existing paper fails it: evs-ch1, ch2, ch3, ch4, ch5 and hy each have 19 `one-word` items without `acceptable` (114 items). | school only |
| Band rubric on judgement items | **Gated to school** because every existing paper fails it: evs-ch1, ch2, ch3, ch4, ch5 and hy each have 20 judgement items without `rubric` (16 short, 3 long, 1 draw; 120 items). They use `answerPoints` / `markingGuide`. | school only |
| Caption/alt-text/pictureDescription gives away the answer | All 6 pass (no existing item is picture-dependent). | **all papers** (proved by `tests/fixtures/chapter/bad-caption.json`) |
| Half-unit arithmetic, ½-step marks | Not a new all-paper check (school rule). Chapter sums stay exact-number comparisons. | school only |
| `difficulty` easy/medium/hard | School rule by spec. All 6 existing papers already carry it, but the chapter rules are left exactly as in v1. | school only |
| `answerSource`, `answerConfidence`, `sp`, `sourceFile`, `shortLabel`, intake totals, underline, `fallbackText`, review sheet | School-only fields. | school only |
