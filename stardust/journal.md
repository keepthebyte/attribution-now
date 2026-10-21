# Journal — attribution.now redesign

Chronological log of every prompt execution. Most recent at the bottom.
See `skills/stardust/reference/journal-format.md` for entry format.

---

## 2026-10-21T07:00:00Z — extract + direct — design language from a colour-field anchor

**Prompt:** Create a design language inspired by the nicepage "Research, strategy and design" template: simple, background colours carry structure, no images, delightful and clear. Design a two-dot "reconnecting" SVG logo that doubles as favicon. Prototype the homepage with the current text.

**Decisions:**
- Extracted 4 pages (/, /why, /labs/openai-chatgpt, /tests) from the EDS preview host, because the new homepage copy is in preview only.
- Rebrand mode: the current look is the stock aem-boilerplate (thin signal).
- Owner answers: own palette with the anchor's strategy; colour-code the two audiences site-wide.
- Palette: Report violet (analysts), Link pink (labs), Direct haze (shared), Page, Source ink; status colours only in marks with symbols. All text pairs AA-validated numerically.
- Type: Bricolage Grotesque (display) + Hanken Grotesk (body), system mono.
- ia-fidelity verbatim (copy + section order); density balanced.

**Artifacts touched:**
- stardust/current/* — created (extract)
- PRODUCT.md, DESIGN.md, DESIGN.json — created (target)
- stardust/direction.md, stardust/state.json — created / updated
- package.json — playwright, pixelmatch, pngjs, cheerio added as devDependencies (extract setup)
- .hlxignore — `stardust/*` added so prototypes are never served; .gitignore — stardust .env block

**Findings worth flagging:**
- The anchor's white body text on #B47AEC (≈3.1:1) and #FF705A (≈2.6:1) fails AA; coral also collides with the Missing status red. Hence pink with dark text.
- The anchor's tablet layout leaves a 2+1 orphan cell; the system forbids 2+1.

**Open questions:**
- Logo concept pick (sheet comes with the prototype).

**Next:** `$stardust prototype /` plus the logo concept sheet.

---

## render — homepage prototype + logo C (2026-10-21)

**Prompt:** Prototype https://attribution.now/ with the current text; logo concept C "Overlap" (owner pick).

**Decisions:**
- `stardust/prototypes/index-proposed.html`, code-led via impeccable craft against `index-shape.md`. Copy verbatim from `current/pages/index.html`; scorecard cards generated from the captured table.
- Deviations from the brief, recorded in DESIGN.md: H1 on shared haze above the split; audience line is the first line of each H2 (no labels above headings); nav collapses below 1024px (eight items + mark need ~1000px).
- One authored motion: the header mark's pink dot slides into overlap on load; off under reduced motion.

**Gates:**
- Detector: two cramped-padding hits on `.field` were false positives (computed padding 32/20px at 360), ignored for this file; brand-review.html findings ignored (extract artifact).
- Finish review: AA passes on every pair; focus visible on violet, pink and ink. Fixes applied: logo class collision with status pills (P1), audience line no longer an eyebrow (P1), neutral status pills with colour only in the symbol (P2), 2-column marks at 600–1023px (P2), named scorecard tables (P2), lab links above the fold at 1440×900 (P2), check-link arrow + nowrap nav (P3), DESIGN.md/json synced (P3). No P0/P1 open.
- Captures: `.impeccable/review/v2-{1440,1024,768,390}.png`, no overflow, no console errors.

**Artifacts touched:** stardust/prototypes/index-proposed.html, DESIGN.md, DESIGN.json, .hlxignore (`.impeccable/*`), .impeccable/config.json (detector ignores).

**Next:** owner review; approve or iterate.
