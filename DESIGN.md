---
name: attribution.now
description: Colour fields carry the structure; two dots carry the meaning.
colors:
  page: "oklch(0.985 0.006 290)"
  direct-haze: "oklch(0.945 0.035 295)"
  report-violet: "oklch(0.46 0.215 290)"
  report-violet-deep: "oklch(0.36 0.18 290)"
  link-pink: "oklch(0.78 0.13 355)"
  link-pink-deep: "oklch(0.52 0.19 355)"
  source-ink: "oklch(0.21 0.035 290)"
  source-ink-soft: "oklch(0.40 0.03 290)"
  haze-ink: "oklch(0.40 0.20 292)"
  works: "oklch(0.52 0.13 150)"
  partial: "oklch(0.52 0.11 70)"
  missing: "oklch(0.53 0.19 27)"
typography:
  display:
    fontFamily: "'Bricolage Grotesque', 'Hanken Grotesk', system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.6rem + 3.6vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "'Bricolage Grotesque', 'Hanken Grotesk', system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1.35rem + 1.6vw, 2.75rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.015em"
  subheading:
    fontFamily: "'Bricolage Grotesque', 'Hanken Grotesk', system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "'Hanken Grotesk', system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "'Hanken Grotesk', system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 500
    lineHeight: 1.45
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.92em"
    fontWeight: 400
rounded:
  field: "0"
  card: "14px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  section-desktop: "64px"
  section-tablet: "48px"
  section-mobile: "32px"
  gutter-mobile: "20px"
components:
  button-primary:
    backgroundColor: "{colors.source-ink}"
    textColor: "{colors.page}"
    rounded: "{rounded.pill}"
    padding: "14px 26px"
  button-on-violet:
    backgroundColor: "{colors.page}"
    textColor: "{colors.report-violet-deep}"
    rounded: "{rounded.pill}"
    padding: "14px 26px"
  arrow-link:
    textColor: "currentColor"
    typography: "{typography.subheading}"
  status-mark:
    backgroundColor: "{colors.page}"
    textColor: "{colors.source-ink}"
    rounded: "{rounded.pill}"
    padding: "3px 10px 3px 6px"
  card:
    backgroundColor: "{colors.page}"
    textColor: "{colors.source-ink}"
    rounded: "{rounded.card}"
    padding: "24px"
  link:
    textColor: "currentColor"
---

## Overview

attribution.now is a text-only site whose structure is drawn in background colour. Each section is a full-bleed colour field, and the field tells you who the content is for: **Report violet** is the analysts' side (the website receiving the visit), **Link pink** is the labs' side (the assistant sending it), and **Direct haze** is shared ground where both read the same evidence. Heavy, friendly display type does the talking; there are no images. The single signature is the two-dot mark: one violet dot, one pink dot, reconnected. In the header, a hand-written "fix" in `mark-pink` sits between the mark and the name, tilted with two quick underlines, like a teacher's correction (Gochi Hand, outlined to SVG; the name itself never changes). It is the only hand-drawn element on the site.

Anchor: the nicepage "Research, strategy and design" template (equal full-bleed colour panels, bold geometric display, one arrow per panel). We borrow its strategy (deep saturated + pale tint + warm accent, colour as structure, the arrow as the affordance) and fix its flaws: white body text on mid-tone colour (fails AA) and an orphaned cell at tablet width.

## Colors

### Report violet (analysts)
`oklch(0.46 0.215 290)`, a deep violet field with `page` text (7.6:1). Marks everything addressed to SEO, GEO and analytics teams: the left hero field, `/reclaim-direct-traffic`, analyst calls to action. `report-violet-deep` is its pressed state and the text colour of buttons on violet.

### Link pink (labs)
`oklch(0.78 0.13 355)`, a light warm pink field with `source-ink` text (8.4:1). Marks everything addressed to AI lab teams: the right hero field, lab pages, lab calls to action. `link-pink-deep` (5.9:1 on page) is the pink used as text or rule on light grounds.

### Direct haze (shared)
`oklch(0.945 0.035 295)`, a pale lavender. Shared ground for content both audiences read: the scorecard, tests, changelog. Text is `source-ink` (15:1); `haze-ink` (8.6:1) for emphasis.

### Page and Source ink
`page` is a cool near-white (not cream: it leans blue). `source-ink` is a violet-black used for body text on light grounds and as the footer field. Never pure black or white.

### Status marks
`works`, `partial`, `missing` (each 5+:1 on page) (each a filled symbol). Used **only** as the symbol inside status marks, never as a section field.

### Named Rules
- **Fields are for audiences, marks are for status.** A background colour never means works or missing; a status colour never fills a section.
- **One audience per field.** A field is violet, pink or haze, never a mix; a split hero is two fields side by side.
- **Dark text on light fields, light text on dark fields.** No white text on a mid-tone.

## Typography

**Bricolage Grotesque** (800/700) for display and headings: a heavy grotesque with optical quirks that keeps the anchor's bold geometric voice but feels warmer and less templated than Montserrat. **Hanken Grotesk** (400/500/700) for body and UI: open, even, very legible at 18px. Code and UTM values in the system monospace, never a webfont.

### Hierarchy
Ratio 1.25 (committed). Display `clamp(2.5rem → 4.5rem)`, heading `clamp(1.75rem → 2.75rem)`, subheading 1.375rem, body 1.125rem / 1.6, small 0.9rem. No labels above headings: an audience line ("For teams at AI labs") is the first line of its heading, in the heading face and a second tone of the field.

### Named Rules
- **Headlines carry the message; body never exceeds 65ch.**
- **Two families only.** Mono is the system stack.

## Layout

Full-bleed fields stacked vertically; content inside a 1200px measure with 20px mobile gutters. Section padding 64px desktop, 48px tablet, 32px mobile (balanced; multi-audience floor). Two breakpoints: 700px (gutters and section padding) and 1024px (split and three-up fields, and the nav, which collapses to a menu button below 1024px because eight items plus the mark need about 1000px).

- **Split fields** (two audiences side by side) are two equal columns at ≥ 1024px and stack below it, analysts first. At tablet width they stack rather than leaving an orphaned cell.
- **Three-up fields** (one per lab) are three columns at ≥ 1024px, and one column below it: never 2 + 1.
- The H1 speaks to both audiences, so it sits on shared `direct-haze` above the split fields, not inside either.
- The header is not sticky. The page reads top to bottom: who it is for, what is true now, what to do next.

## Elevation & Depth

Flat. Depth comes from colour change between fields, never shadows. The only elevation is a 2px `source-ink` focus ring.

## Shapes

Dots are the atom. Fields have square edges (`rounded.field: 0`); interactive and status elements are round (`pill`), cards inside fields use 14px. The arrow (→) is the one glyph, used as the affordance on links that move you forward.

## Components

### Buttons
One primary per field: `button-primary` (ink pill on light fields), `button-on-violet` (page pill with deep-violet text on violet). The secondary action is an **arrow link** (text + →), never an outlined button.

### Status marks
A neutral pill (haze on page cards) holding an authored SVG symbol in the status colour (check works, half circle partial, cross missing) and the verbatim words, e.g. "Referrer: Partial". Reported results sit on page with a dashed `source-ink-soft` outline and the word "Reported". Colour lives only in the symbol, so a column of misses never becomes a red wall.

### Cards / Containers
Cards are page-coloured on haze or pink fields, 14px radius, no border, no shadow.

### Links
Inherit the field's text colour, underlined at 0.12em offset 0.2em; hover thickens the underline.

### Citations and charts
A number claimed in a heading carries a citation marker: a small `pink-deep` pill with the footnote number in page colour, linking to the evidence further down the page. Evidence charts are widgets (`/widgets/<name>/`) drawn with Chart.js on a page-coloured card: report violet for what analytics can see, `mark-pink` for what it can't, haze for an annotated window. No gridlines on the x-axis, a `line-color` grid on y, the legend and source written as HTML around the canvas, and a "Daily numbers" table for screen readers and anyone who wants the data.

## Do's and Don'ts

- Do say which audience a section serves before saying anything else.
- Do pair every status colour with a symbol and a word.
- Do let a field run full-bleed; don't box it.
- Don't add images, icons-as-illustration, gradients, shadows or glass.
- Don't put white text on pink or on mid-tone violet tints.
- Don't use red or green outside status marks.
