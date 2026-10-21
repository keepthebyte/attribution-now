<!-- stardust:provenance
  writtenBy:        stardust:prototype/shape
  writtenAt:        2026-10-21T07:45:00Z
  page:             index
  pageUrl:          https://attribution.now/
  againstDirection: stardust/direction.md (Active 2026-10-21T07:35:00Z)
  consumedBy:       impeccable:craft
  readArtifacts:
    - stardust/current/pages/index.json
    - stardust/current/_brand-extraction.json
    - DESIGN.md
    - DESIGN.json
    - stardust/direction.md
  stardustVersion:  0.34.0
-->
---
slug: index
url: https://attribution.now/
register: brand
surprise: low
ia-fidelity: verbatim
---

# Page shape: index

## Sections (in render order)

1. **header** (system-component role: `header`). Two-dot mark + wordmark "attribution.now" left; nav right: Why, Best practices, Claude, Gemini, ChatGPT, Tests, Changelog; "Check a link" as the last item. Lab nav items (Claude, Gemini, ChatGPT) carry a small pink dot, so the colour code starts in the nav. Not sticky. Sits on the default haze ground. Below 700px: the stock hamburger pattern.
2. **audience split** (role: `audience-split`). First viewport. The H1 spans both fields at the top ("AI assistants send you visitors. Most of those visits show up as "Direct"."), set on the violet field's left edge, then two equal full-bleed fields side by side:
   - **Left, Report violet** (analysts): eyebrow "For SEO, GEO and analytics teams", H2 "Your AI traffic is bigger than your reports show", body paragraph, primary pill "Estimate your hidden AI traffic" (page pill, deep-violet text), arrow link "See what each assistant sends →" to `#scorecard`.
   - **Right, Link pink** (labs): eyebrow "For teams at AI labs", H2 "Small fixes, so every site can see the visits you send", body paragraph, "See your status:" followed by three arrow links (ChatGPT →, Gemini →, Claude →), then the quieter pair "Why it matters" · "Best practices".
   Below 1024px the fields stack, violet first; the H1 sits at the top of the violet field.
3. **scorecard** (role: `shared-evidence`). Default haze ground. H2 "Scorecard", the intro line, the takeaway sentence set large in the display face ("No assistant sends both signals yet, on any surface we have tested."), then one page-coloured card per lab (three-up at ≥ 1024px, one column below; never 2 + 1). Each card: lab name (link, with pink dot) + company, then a compact grid of rows Web / Mobile apps / Desktop apps / Documented UTM, each with two status marks (Referrer, UTM) linking to `/labs/<lab>#status-<test>`. Legend line about "Reported" and the "See how we test" link below the cards.
4. **check a link** (direction-authorized re-composition of the captured last section). On haze; a single page-coloured band card with H2 "Check a link yourself" and the sentence, the URL `attribution.now/t/check` set in the monospace as the link, followed by →. Deliberately quieter than the two main motions.
5. **footer** (role: `footer`). Source-ink field, page-coloured text: the two-dot mark (light variant), mission line, "Contribute · GitHub · Code, content and data under the Apache License 2.0."

## Layout strategy

- Density: balanced. Section padding 64 / 48 / 32px; content measure 1200px; 20px mobile gutter.
- Audience split: CSS grid `1fr 1fr` at ≥ 1024px with the fields bleeding to the viewport edges (each field's inner padding aligns its text to the 1200px measure). Body copy in each field capped at 34rem.
- Scorecard: `repeat(3, 1fr)` at ≥ 1024px, `1fr` below. Inside each card, a 3-column mini-grid (row label · Referrer · UTM) that holds at 320px.
- Breakpoints: 700px (nav collapse, gutters) and 1024px (split and three-up).

## Key states

- Default: as above, with the scorecard values captured on 2026-10-21.
- Takeaway variant: when any lab and surface has both signals verified, the generator writes a different sentence; the card treatment is unchanged.
- Hover/focus: arrow links nudge the arrow 3px right (reduced motion: no nudge); 2px ink focus ring with offset on every interactive element, a page-coloured ring on violet and ink fields.

## Interaction model

- "Estimate your hidden AI traffic" → `/reclaim-direct-traffic` (page not yet published; link kept as captured).
- "See what each assistant sends" → `#scorecard`.
- Lab arrows → `/labs/openai-chatgpt`, `/labs/google-gemini`, `/labs/anthropic-claude`.
- Status marks → `/labs/<lab>#status-ref-01`, `#status-utm-01`, `#status-utm-03` (rows exist on the live lab pages).
- No JS needed except the hamburger toggle.

## Data attributes

- `header[data-section="site-header"][data-intent="navigate"][data-layout="contained"]`
- `section[data-section="audience-split"][data-intent="route each audience to its next step"][data-layout="split-fields"][data-items="2"][data-media="none"]`
- `section[data-section="scorecard"][data-intent="show what arrives, per lab and surface"][data-layout="grid"][data-items="3"][data-media="none"]`
- `section[data-section="check-a-link"][data-intent="let anyone test a link"][data-layout="contained"][data-media="none"]`
- `footer[data-section="site-footer"][data-intent="navigate"][data-layout="full-bleed"]`

## Unsourced content (placeholder list)

None. Every literal comes from `stardust/current/pages/index.json` (copy and scorecard values) or `_brand-extraction.json` (nav, footer). The logo is a direction-authorized brand asset, not content.

## Open questions for craft

- Takeaway sentence: display face at heading size, or body bold? Proposed: heading size, haze-ink colour.
- Pink dots in the nav for lab items: keep, or reserve dots for the logo only? Proposed: keep; it teaches the colour code before the hero.

## _provenance (validator record)

```yaml
capturedSourceLineage:
  - section: header
    source: _brand-extraction.json#systemComponents[name=site header]
  - section: audience-split
    source: pages/index.json section 1 (H1 + columns block: two audience cells)
  - section: scorecard
    source: pages/index.json section 2 (H2 "Scorecard" + scorecard fragment table)
  - section: check-a-link
    source: pages/index.json section 3 (H2 "Check a link yourself")
  - section: footer
    source: _brand-extraction.json#systemComponents[name=site footer]
antiTemplatePass:
  - pattern: hero composition
    defaultReflex: centered-stack hero with two-button CTA pair
    alternatives: [centered stack + pill pair, single field with two cards, two full-bleed audience fields side by side]
    picked: two full-bleed audience fields
    rationale: captured hero is already a two-audience split; the anchor's colour panels make the audience visible; the CTA pair becomes pill + arrow link
  - pattern: scorecard table
    defaultReflex: wide data table with coloured cells
    alternatives: [wide table with horizontal scroll, per-lab cards with mini-grid, one row per lab as a strip]
    picked: per-lab cards with mini-grid
    rationale: captured table scrolls sideways at 390px; cards let a lab reader land on their own card and hold at phone width
  - pattern: secondary section ("Check a link")
    defaultReflex: another full-bleed band
    alternatives: [full-bleed band, card on haze, footer pre-line]
    picked: card on haze
    rationale: owner said it is not a main motion; a card keeps it present but quieter and keeps the substrate count at 2
surprise: low
signatureElements:
  - kind: brand-mark
    capturedSource: none (new; direction.md Brand Commitments: two-dot mark)
    mechanism: inline SVG in header and footer
    fallback: wordmark text
substrateTransitions:
  default: direct-haze
  exceptions:
    - audience-split: report-violet | link-pink (names who each half is for)
    - footer: source-ink (system chrome)
voiceClassification:
  - section: header
    classification: captured-verbatim
  - section: audience-split
    classification: captured-verbatim
  - section: scorecard
    classification: captured-verbatim
  - section: check-a-link
    classification: captured-verbatim
  - section: footer
    classification: captured-verbatim
```
