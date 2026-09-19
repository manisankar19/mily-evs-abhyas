# Source material

The PDFs themselves live in the Claude project "Mily Class IV EVS Exam" (not copied here
to keep the repo small). What was read, and how it was used:

## textbook/  — NCERT *Our Wondrous World* (The World Around Us), Class 4, Reprint 2026-27
| Project file | Chapter | Used for |
|---|---|---|
| deev101.pdf | Ch 1 Living Together (Unit 1 intro) | app/data/evs-ch1.json |
| deev102 EVS.pdf | Ch 2 Exploring Our Neighbourhood | app/data/evs-ch2.json |
| deev103 EVS.pdf | Ch 3 Nature Trail (Unit 2 intro) | app/data/evs-ch3.json |
| deev104.pdf | Ch 4 Growing up with Nature | app/data/evs-ch4.json |
| deev105.pdf | Ch 5 Food for Health (Unit 3 intro) | app/data/evs-ch5.json |

Text extraction of these five was clean; every question was written from the chapter text.

## samples/ — school worksheets (Atomic Energy Education Society, 2025-26)
| Project file | What it is | Readable? |
|---|---|---|
| 2.1.4 Worksheet_Class-4_TWAU_Sept25 HYE.pdf | September Half-Yearly worksheet, Ch 1–5, 80 marks: Observation & Reporting 25 / Identification & Classification 30 / Discovery of Facts 25 | Yes — this is the primary specification for the section blueprint and question styles |
| 2.1.1 class 4_twau_ch-3_ws.pdf | July worksheet, Lesson 3 Nature Trail, 40 marks, Sections A/B/C with the same three competencies | Yes — used for Ch 3 and for question-type wording |
| 2.1.2 EVS L5.pdf | Lesson 5 (Food) worksheet | No — PDF uses a custom font encoding; text extraction is unreadable |
| 2.1.5 L5 EVS.pdf | Lesson 5 worksheet | No — same encoding problem |
| 2.1.3 EVS L1 to 7.pdf | Despite the name, the readable fragments ("hundreds, tens, ones", "add / subtract", fractions) show this is a **Mathematics** worksheet, not EVS | No — mislabelled and garbled |

The two readable worksheets were sufficient to fix the format. If text versions of the
three unreadable PDFs become available, compare their questions against evs-ch5.json.
