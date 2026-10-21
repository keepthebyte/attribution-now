<!-- stardust:provenance
  writtenBy: stardust:direct
  writtenAt: 2026-10-21T07:35:00Z
  readArtifacts:
    - stardust/state.json
    - stardust/current/_brand-extraction.json
    - stardust/current/PRODUCT.md
    - stardust/current/brand-review.html
  synthesizedInputs: [palette (derived from anchor strategy, AA-validated), type scale]
  stardustVersion: 0.34.0
-->
---
title: "Simple, colour-blocked, text-only site; background colours carry structure; delightful, clear, simple"
resolvedAt: 2026-10-21T07:35:00Z
toolkitVersion: "v1.0 (stardust v2)"
schemaVersion: 1
---

# Active direction (2026-10-21T07:35:00Z)

## Phrase

> Create a design language for this site that takes inspiration from https://nicepage.com/website-templates/preview/research-strategy-and-design-2341480 … simple site design that does play with background colors to help with understanding of structure. … I won't use images — I want to rely on text and background colors to help make this page delightful, clear and simple to understand. Logo: reconnecting two dots, also the favicon.

## Restatement

- register: brand (advocacy/editorial), with product-like data views on lab and test pages
- expressive axis: restrained → **committed** (full-bleed colour fields carry structure)
- tone: neutral → **warm, clear, quietly playful**
- density: **balanced** (named assumption: multi-audience hard floor fires, 2 audience tracks; section padding 64/48/32)
- distinctiveness: familiar (stock boilerplate) → **distinctive** (colour fields + two-dot signature)
- audience: SEO/GEO/analytics teams (primary, first on mobile) + AI lab teams
- constraints: no imagery; current homepage copy verbatim; WCAG AA; status semantics readable; EDS section-class compatible

## Movements

- expressive: restrained → committed (moved by phrase: "play with background colors")
- distinctiveness: familiar → distinctive (moved by phrase + logo signature)
- tone: neutral → warm (moved by "delightful")
- density: balanced (named assumption — not asked; multi-audience floor)
- ia-fidelity: **verbatim** (auto-pinned by "with the current text"; copy and section order stay, surface changes)
- audience: two tracks, colour-coded site-wide (user answer Q2)

## Gaps and questions

1. Palette closeness to the anchor → **own palette, same strategy** (deep saturated + pale tint + warm accent), avoiding status-colour collisions, AA.
2. Colour-code the audiences → **yes**, site-wide.

## Anchor references

- nicepage "Research, strategy and design" (user-provided; studied live in Chrome 2026-10-21 at 1440 / 768 / 390). Borrowed: colour fields as structure, deep + tint + warm strategy, heavy geometric display, arrow affordance. Rejected: white body text on mid-tones (≈3.1:1 and ≈2.6:1), 2+1 orphan cell at tablet, Montserrat/Open Sans.

## Anti-references

- Generic 2026 SaaS silhouette (oversized hero + solid/outline CTA pair + sticky nav)
- Red/green dashboard walls; colour-only status
- Any photography, illustration, decorative icons, gradients, shadows
- Cream "archival editorial" palettes
- Blame or outrage tone toward labs

## Divergence inputs

- mode: **rebrand** (`--rebrand`; captured brand is stock aem-boilerplate, signal thin)
- seed: 2025-now × flat colour-field print × civic-advocacy explainer × monochrome-tint (cool violet) — picked_by: anchor-reference
- font deck: off-deck, justified — Bricolage Grotesque (display; substitute for geometric-sans display) + Hanken Grotesk (body; substitute for Inter); system mono for code
- palette: derived — Report violet `oklch(0.46 0.215 290)` (analysts), Link pink `oklch(0.78 0.13 355)` (labs), Direct haze `oklch(0.945 0.035 295)` (shared), Page / Source ink; status marks works / partial / missing. All text pairs ≥ 4.5:1 (table in DESIGN.json `extensions.contrastChecks`).
- anti-toolbox: 1 partial hit (SaaS silhouette) neutralised — no sticky header, arrow-link secondary, display capped at 4.5rem.
- motion register: live-systems (selected only; static prototype)

## Command sequence (proposed)

1. `$stardust prototype /` — shape brief → `$impeccable craft` → critique / audit / adapt → `$impeccable polish`; validation at 1440 / 768 / 390.
2. Logo: 2–3 two-dot concepts on one sheet, checked at 16 / 32px, owner picks; becomes header mark + SVG favicon.

## User confirmation

Plan shown 2026-10-21; owner answered both questions (own palette; colour-code audiences), which confirms the plan.

## Pages in scope

- `/` (index) — prototype now
- `/why`, `/labs/openai-chatgpt`, `/tests` — directed, not prototyped in this pass
