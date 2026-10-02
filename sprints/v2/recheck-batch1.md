# Coordinator re-check: batch 1 (sp05, sp07, sp01), 2026-10-02

Done by the coordinator, not delegated. For each paper: every ⚑ answer was re-derived against
`source/textbook-text/` and the question; every non-⚑ objective item was swept for a missed ⚑ or a
narrow `acceptable`; every drawn picture was viewed at 2× against the questions it serves.

| Paper | Items | ⚑ (intake est.) | Fallback | Corrections by coordinator |
|---|---|---|---|---|
| sp05 | 41 | 25 (~11) | 12 → **0** | Q8e `acceptable` widened (mid-day meal, evening tea, khana, …). The 12 fallbacks were caused by fidelity.js, not the paper (see below). |
| sp07 | 37 | 15 (~11) | 0 | None. Map states (Assam, Chhattisgarh, Sikkim) checked against the paper. Q.7 signboards kept because the printed picture has them. |
| sp01 | 37 | 20 → **22** (18) | 0 | Q4 panel (ii) redrawn: it read as a fan or leaf, and now shows toes and a web. Q8 pictures 4–5 accept the general class (insect; rodent/animal), consistent with picture 2 accepting "bird", and are now ⚑. |

## Textbook facts re-derived (sample)
- sp05 Q4a: jau roti in summer, jowar and bajra roti in winter (ch5 p.6 l.37–38) ✓. Q4e chef (ch5 p.14 l.5–9) ✓. Q1a Ugadi Pachadi ✓.
- sp01 Q2(i) "nature scientist" ✓. Q3(iv) tiger/fish both defensible ✓.
- sp07 Q3 TTESREL → LETTERS / SETTLER both accepted ✓. ROYFLAEV → flyover (misprint) ✓.

## Tool fixes found by this batch
- `scripts/fidelity.js`: the page-footer filter was being applied to the paper's own strings, so number-only options ("6", "7") could never match. Printed marks "6x1" also became one token. Both are fixed, with fixtures. Added `scripts/prune-fallback.js`.

## Under-flagging?
No systematic under-flagging. All three agents met or exceeded the intake ⚑ estimate. One consistency gap (sp01 Q8 generic names) was fixed. The brief is tightened in §9 for batch 2.

## Owner/parent attention
- sp07 Q. 6 picture 1: "nurse" is not in `acceptable` (the parent decides; the item is ⚑).
- sp05 Q9 roasting/grilling: both pairings are accepted.
- **Parent reads `sprints/v2/answer-review/sp05.md`, `sp07.md`, `sp01.md` before the child uses these papers.**
