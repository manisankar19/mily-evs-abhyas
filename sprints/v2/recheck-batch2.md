# Coordinator re-check: batch 2 (sp04, sp03, sp06) and final cross-paper sweep, 2026-10-02

Done by the coordinator, not delegated (Tasks 26 and 28).

| Paper | Items | Marks | ⚑ (intake est.) | Fallback | Corrections by coordinator |
|---|---|---|---|---|---|
| sp04 | 34 | 40 | 30 (~15) | 64 (100%, garbled text layer) | None. **All 54 strings compared against the 4 page images: all match**, then 10 match-pair entries added (checked against page 2). Answers re-derived against ch4: Jenu Kurubas, Hari Jiroti, Palash, Gond art, painting on cloth (True, ch4 p.4), and the trip wording (both readings accepted). |
| sp03 | 53 | 80 | 40 (~16) | 0 | Word-search grid compared row by row with page 7. Word list independently re-searched (10 words plus the POTATO example; UPMA and NAAN also found and accepted). Map states match Q15. |
| sp06 | 51 | 80 | 39 (12) | 6 | Q6b: ragi removed (not a round grey grain). Fallback 9 → 6 after the fidelity fix. The remaining 6 are authored "Picture N" labels for unlabelled printed pictures. Hornbill redrawn by the agent. |

## Tool and app fixes found in this batch
- **Match items** were not shown as printed: the app added "1)"/"a)" prefixes and its own order. A new field `printedRight` gives the printed order, and the app shows school match tables verbatim. The chapter-paper shuffle for n=5 is unchanged; it now rotates when the shuffle would equal the answer order (n=7). **Pair texts are now fidelity-checked.** sp01's left texts went back to the printed "i." / "ii" / "iii." (the "(picture i)" text was authored, not printed).
- **fidelity.js**: "5M" is now read as "5 M" (digits glued to a letter).

## Cross-paper sweep (Task 28)
Every question that appears in more than one paper was compared, by identical text, type and marks, and by answer:
- sp03 and sp06 share 26 questions. Where the answers agree, the `acceptable` lists were merged so that both papers accept the same answers (public places, Indian tribes, the bank, the leader, grasshopper, bajra, frog, Palash, Ugadi Pachadi, Khetala). Where one paper flagged the question, both are now ⚑ ("Public places" in sp06).
- **Not merged, on purpose:** "What is the value of the note?" (₹100 vs ₹500) and "How many languages…?" (sp03 shows only the front of the note → 2; sp06 shows both sides → 17; both accept 2 / 15 / 17).
- A first merge attempt wrongly merged items whose answers differ. It was caught by `validate.js` (a caption-giveaway error) and by the coordinator, reverted, and redone with an answer-equality rule.
- Map answer keys checked against the printed state lists: sp03 (MP, KA, UT, AP, TR), sp04 (UT, KA, MH), sp05 (AP, KA, TG), sp06 (MP, KA, UT, AP, TR), sp07 (AS, CT, SK).

## Under-flagging?
None. All agents flagged at or above the intake estimate. Total: 171 ⚑ of 253 items.

## Known limitations (for the walkthrough)
- sp03 Q10: the printed underline is on words in the block instruction. The schema supports underline spans only on item `q`, so this is recorded in a teacherNote.
- Map, encircle, drawing and word-search items are paper-based (Gate 0b).

**Parent reads `sprints/v2/answer-review/sp03.md`, `sp04.md` and `sp06.md` (and sp01, sp05, sp07) before the child uses these papers.**

## Owner review
2026-10-02: the owner reviewed the answers and confirmed: "answers are correct". The open ₹500 language-count question is settled as authored (2 / 15 / 17 accepted, ⚑).
