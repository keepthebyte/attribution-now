<!-- stardust:provenance
  writtenBy:        stardust:prototype/shape
  writtenAt:        2026-10-23T21:40:00Z
  page:             reclaim-direct-traffic
  pageUrl:          https://attribution.now/reclaim-direct-traffic
  againstDirection: stardust/direction.md (Active 2026-10-21T07:35:00Z)
  consumedBy:       impeccable:craft
  readArtifacts:
    - stardust/current/pages/reclaim-direct-traffic.json
    - DESIGN.md
    - DESIGN.json
    - stardust/direction.md
    - .impeccable/critique/2026-10-23T21-25-37Z__attribution-now-reclaim-direct-traffic.md
  stardustVersion:  0.34.0
-->
---
slug: reclaim-direct-traffic
url: https://attribution.now/reclaim-direct-traffic
register: brand (Read mode: a guide for analysts)
surprise: low
ia-fidelity: verbatim
dominantDimension: composition/operator-recipe
---

# Page shape: reclaim-direct-traffic

Refinement, not a redesign. Every captured sentence stays visible and in order (owner: "Nothing hidden"); ChatGPT stays first. What's added is a visual layer that restates the rules the prose already gives, so readers can see each formula before they read it.

## Sections (in render order)

1. **header** (system-component role: `header`). Site-wide, unchanged.
2. **intro on Report violet** (system role: `audience-field`). H1 "Estimate your hidden AI traffic" with the audience line "For SEO, GEO and analytics teams" as the first line of the heading (heading face at half size, 700, lighter violet tone, per DESIGN.md § Hierarchy). Intro paragraph verbatim. Fixes the critique's P2: this page is marked violet in DESIGN.md but renders on haze today.
3. **at a glance** (new; replaces the TOC pills, keeps the same anchors). On the violet field, below the intro: a page-coloured card holding six rows, one per assistant plus "Set up your reports". Each row is a link: assistant name (subheading, 700) followed by its formula in the same operator notation as the recipes, e.g.
   - ChatGPT `= tag + referrers − Google − ad clicks`
   - Gemini `= referrer × 2.1–2.5`
   - Claude `≥ referrer`
   - Copilot `≥ referrer + tag`
   - Perplexity `= referrer + tag`
   - Set up your reports →
   At ≥ 700px: two columns (name | formula). Below: name above formula. It stays a `<nav aria-label="On this page">` so the TOC semantics remain.
4. **per-assistant sections** ×5 (ChatGPT, Gemini, Claude, Copilot, Perplexity), each on Direct haze, one field per assistant separated by a 1px `line-color` rule (no substrate change: all haze). Fixed order inside each:
   a. H2 (verbatim).
   b. **recipe card** (new block `recipe`): page-coloured card, 14px radius. Header row: "How to count" (small, 500) left, **result pill** right: status-mark shape, haze ground, ink text, never a status colour: "Full count" (ChatGPT, Perplexity), "Estimate: × 2.1–2.5" (Gemini), "Floor" (Claude, Copilot). Body: an `<ol>`, one row per operation, in a `2.5rem 1fr` grid:
      - column 1: operator glyph in Bricolage 800 at 1.375rem (`+` `−` `×` `≥` `→` `=`), `aria-hidden`, with a visually hidden verb ("Add", "Subtract", "Multiply by", "At least", "Send to Paid", "Total").
      - column 2: signal label (small, 500: **Referrer**, **Tag**, **Click ID**, **Factor**) preceded by a 18px-wide rule mark matching the charts: referrer = 3px dashed `link-pink-deep`, tag = 3px solid `report-violet`, click ID = 3px solid `source-ink-soft`. Then the value(s) as code chips, each chip on its own line when it's longer than 24 characters. A short qualifier in `source-ink-soft` small (e.g. "no tag", "starts with").
      - Subtractions/exclusions indent one level under the row they modify (Google under Tag).
      - Total row after a 1px rule: `=` "Count each visit once" (ChatGPT) or the result restated.
   c. The captured `<ol>` steps and paragraphs, verbatim, unchanged order.
   d. The chart widget(s), unchanged, except the mobile fixes below.
   e. "↑ All assistants" arrow link back to `#at-a-glance` (small, 500).
5. **set up your reports** (haze). H2, the captured lead-in sentence with links to the GA4 / AA / CJA guides, then a **match table** (new): columns Assistant / Referrer / `utm_source` / Leave out. Rows from the values already on the page:
   - ChatGPT · `chatgpt.com`, `android-app://com.openai.chatgpt/` · `chatgpt.com` · Google referrer → Organic Search; `oppref`/`olref` → Paid
   - Gemini · `gemini.google.com` · `gemini`, `geminiforbusiness` · –
   - Claude · `claude.ai` · none · –
   - Copilot · `copilot.com`, `copilot.microsoft.com`, `copilot.cloud.microsoft`, `m365copilotapp.svc.cloud.microsoft` · starts with `copilot.com` · –
   - Perplexity · `perplexity.ai` · `perplexity` · –
   Then a one-line **precedence strip**: `Paid → AI assistants → Referral → Organic Search`, four pills joined by arrows, wrapping at 390px. Then the captured steps verbatim.
   At < 700px the table becomes a stacked definition list per assistant (no horizontal scroll).
6. **footer** (system-component role: `footer`). Site-wide, unchanged.

## Layout strategy

- Measure: text and recipe cards at 46rem (≈ 65ch body); charts keep their width but start at the same left edge so the column doesn't jump (critique minor note).
- Recipe grid holds at 320px: operator column 2.5rem, content 1fr; code chips `overflow-wrap: anywhere` is replaced by `word-break: normal` plus `<wbr>` after `.` and `/` inside long values, so tokens break at dots and slashes, not mid-word.
- Mobile fixes inside widgets: ChatGPT legend item 3 text wrapped in one span (no flex columns); "Weekly numbers" tables inside an `overflow-x: auto` wrapper with a visible scroll hint, so the page itself never scrolls sideways.
- Breakpoints: 700px and 1024px (system).

## Key states

- Default: as above, content as captured on 2026-10-23.
- Focus: 2px ink focus ring on every link (page ring on violet).
- Reduced motion: no motion is added.

## Interaction model

- At-a-glance rows → `#chatgpt-start-with-the-tag` etc. (captured anchors kept).
- "↑ All assistants" → `#at-a-glance`.
- No JS beyond what the widgets already use.

## Data attributes

- `header[data-section="site-header"][data-intent="navigate"][data-layout="contained"]`
- `section[data-section="intro"][data-intent="orient"][data-layout="audience-field-violet"]`
- `nav[data-section="at-a-glance"][data-intent="navigate"][data-layout="formula-list"][data-items="6"]`
- `section[data-section="assistant-chatgpt"][data-intent="instruct"][data-layout="recipe-then-prose"]` (likewise `assistant-gemini`, `assistant-claude`, `assistant-copilot`, `assistant-perplexity`)
- `ol[data-component="recipe"][data-result="full|estimate|floor"]`
- `section[data-section="setup"][data-intent="instruct"][data-layout="match-table-then-steps"]`
- `footer[data-section="footer"][data-intent="navigate"][data-layout="contained-ink"]`

## Unsourced content

(none). Every value in the recipes, the formulas and the match table restates a value already on the captured page. The labels "How to count", "Full count", "Estimate", "Floor", "Leave out", "↑ All assistants", "For SEO, GEO and analytics teams" are direction-authorized chrome (the audience line is captured from the page's meta description).

## _provenance

```yaml
capturedSourceLineage:
  - { section: header, source: "site-wide system-component (captured header)" }
  - { section: intro, source: "pages/reclaim-direct-traffic.json#headings[h1] + body[0]; audience line from #description" }
  - { section: at-a-glance, source: "consolidates captured TOC block + each section's steps; direction-authorized new presentation (critique P1: no summary)" }
  - { section: assistant-*, source: "pages/reclaim-direct-traffic.json#headings[h2] + following ol/p/widget, verbatim; recipe = direction-authorized restatement" }
  - { section: setup, source: "captured 'Set up your reports' section; match table consolidates values from sections 1–5" }
  - { section: footer, source: "site-wide system-component (captured footer)" }
antiTemplatePass:
  - pattern: "per-assistant rule presentation"
    defaultReflex: "callout box / admonition with an info icon"
    alternatives: ["formula line in display type above prose", "decision flowchart", "operator-spine recipe card"]
    picked: "operator-spine recipe card"
    rationale: "rules are arithmetic (add, subtract, multiply, floor); a spine of operators is the literal shape of the content, uses type only (no icons, per PRODUCT.md), and reuses the charts' dashed/solid encoding"
  - pattern: "table of contents"
    defaultReflex: "pill row of section names"
    alternatives: ["sticky side rail (rejected: DESIGN.md no sticky)", "formula list that doubles as TOC"]
    picked: "formula list that doubles as TOC"
    rationale: "removes the recall problem (critique heuristic 6) without adding a second navigation element"
  - pattern: "reference values"
    defaultReflex: "long inline sentence listing every value"
    alternatives: ["code block regex", "match table → stacked list on mobile"]
    picked: "match table → stacked list on mobile"
    rationale: "tool-neutral (regex belongs on the GA4 guide); stacking avoids horizontal scroll at 390px"
substrateTransitions:
  default: direct-haze
  exceptions:
    - { section: intro + at-a-glance, ground: report-violet, purpose: "audience marker per DESIGN.md: this page is the analysts' page" }
voiceClassification:
  - { section: header, classification: captured-verbatim }
  - { section: intro, classification: captured-verbatim, note: "audience line from meta description" }
  - { section: at-a-glance, classification: direction-authorized rewrite, source: "restates captured steps" }
  - { section: assistant-*, classification: captured-verbatim, note: "recipe rows are direction-authorized rewrite of the captured steps" }
  - { section: setup, classification: captured-verbatim, note: "match table and precedence strip are direction-authorized rewrite of captured values" }
  - { section: footer, classification: captured-verbatim }
  - { section: chrome-labels, classification: "direction-authorized chrome (per friction #3)" }
signatureElements:
  - { kind: site-wide-motif, capturedSource: "two-dot mark in header", mechanism: "unchanged header", fallback: n/a }
  - { kind: chart-encoding, capturedSource: "widgets: violet solid = tag, pink dashed = referrer", mechanism: "same marks reused in recipe rows", fallback: "words Referrer/Tag always next to the mark" }
```

## Open questions for craft

- Result pill wording for Copilot: "Floor" alone, or "Floor, especially on mobile"? Brief picks "Floor" (the qualifier is in the prose).
- Should the at-a-glance card sit on the violet field (picked) or on haze directly under it?
