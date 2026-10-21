<!-- stardust:provenance writtenBy=stardust:extract writtenAt=2026-10-21T07:10:00Z readArtifacts=stardust/current/_brand-extraction.json,stardust/current/_computed-styles.json,styles/styles.css synthesized=none (descriptive) -->
---
name: attribution.now (current)
description: Stock EDS boilerplate look, as captured 2026-10-21.
colors:
  text: "#131313"
  link: "#3b63fb"
  link-hover: "#1d3ecf"
  border: "#dadada"
  surface: "#eeeeee"
  background: "#ffffff"
  status-works: "#d6f0dc"
  status-partial: "#fbeec2"
  status-missing: "#f6dcd6"
  status-reported: "#e3e7f7"
typography:
  heading:
    fontFamily: "roboto-condensed, roboto-condensed-fallback, sans-serif"
    fontWeight: 700
  body:
    fontFamily: "roboto, roboto-fallback, sans-serif"
    fontSize: "22px"
    fontWeight: 400
rounded:
  pill: "999px"
  card: "12px"
spacing:
  section: "40px 24px"
components:
  button-primary:
    backgroundColor: "{colors.text}"
    textColor: "{colors.background}"
    rounded: "{rounded.pill}"
---

## Overview

Descriptive snapshot. attribution.now runs the unmodified aem-boilerplate visual system: white ground, near-black Roboto text, Roboto Condensed headings, blue links, pill buttons. The only site-specific styling is the pastel status-chip set (works / partial / missing / reported / untested) used by the scorecard and lab status tables. No logo, no imagery, no brand colour.

## Colors

One neutral ground (`#ffffff`), one ink (`#131313`), one link blue (`#3b63fb`). Colour carries meaning only in status chips; sections are not distinguished by colour.

## Typography

Roboto Condensed 700 for headings (55 / 44 / 34px at 390px), Roboto 400 for body at 22px. Ad-hoc scale.

## Layout

Single 1200px column; the homepage hero is a two-column `columns` block that stacks below 900px. Wide tables scroll horizontally inside their block.

## Shapes

Pills (999px) for buttons and chips; 12px radius bordered cards for lab tiles and work items.

## Components

Pill buttons (filled primary, outlined secondary), status chips, data tables with a detail panel, work-item cards with copy-to-clipboard prompts.
