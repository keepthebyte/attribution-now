<!-- stardust:provenance writtenBy=stardust:direct writtenAt=2026-10-21T07:30:00Z userInput="Simple, colour-blocked, text-only site; background colours carry structure; delightful, clear, simple (--rebrand, anchor: nicepage research-strategy-and-design)" readArtifacts=stardust/current/PRODUCT.md,stardust/current/_brand-extraction.json,stardust/current/pages/*.json synthesized=Positioning,Product Principles (inferred from captured copy and confirmed answers) -->
# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, named on the homepage and colour-coded across the site:

1. **SEO, GEO and analytics teams** (the larger group, served first on small screens). They measure traffic and see visits from AI assistants land in "Direct". They want to know which assistant visits they can attribute today and how to estimate the rest (`/reclaim-direct-traffic`, upcoming).
2. **Teams at AI labs** (OpenAI, Google, Anthropic). They arrive from a link the site owner sent them, want their own status in seconds, and need the reason and the small fix in a form they can hand to a team.

## Product Purpose

Make the attribution gap visible and fixable: show, per assistant and per surface, whether visits arrive with a referrer and a documented UTM tag, and hand each lab the next small fix. Success is a lab shipping a fix and analysts seeing the visits come back out of "Direct".

## Positioning

<!-- _provenance: inferred — from captured hero and /why copy -->
The only public tracker that pairs dated, first-hand evidence for every status with a ready-to-paste fix, and speaks to both sides of the same link: the site that receives the visit and the lab that sends it.

## Capabilities and Constraints

- Edge Delivery Services site: sections map to EDS sections with section-level style classes; blocks are `columns`, `scorecard`, `status-table`, `work-item`, `changelog`, `test-echo`, `fragment`. No build step.
- No imagery of any kind: structure and delight come from type and background colour only.
- Status vocabulary is fixed: Works, Partial, Missing, Reported (third-party, unverified), Untested, n/a.
- Homepage copy is authored in SourceBus and stays verbatim through the redesign.

## Brand Commitments

- **Register:** brand (advocacy and editorial), with product-like data views on lab and test pages.
- **Personality:** clear, warm, evidence-led, partnership-minded, quietly playful in colour; `data-led`, `operationally-transparent`.
- **Signature:** a two-dot mark about reconnecting the website and the assistant that sent the visit; it is the logo and the favicon. The two dots carry the two audience colours.
- **Anchor reference:** nicepage "Research, strategy and design" template (full-bleed colour panels, heavy geometric display, a single arrow as each panel's affordance). Strategy is borrowed; palette and type are our own.
- **Anti-references:** generic 2026 SaaS landing silhouette (oversized hero + solid/outline button pair + sticky nav); stock dashboards with red/green walls; any photography, illustration or decorative imagery; cream "archival editorial" palettes; blame or outrage tone toward labs.

## Evidence on Hand

- Captured copy: `stardust/current/pages/{index,why,labs-openai-chatgpt,tests}.json`.
- Real status data: `data/results/*.yaml`, `data/labs/*.yaml`, `data/changelog.yaml` (the scorecard is generated from these).
- Absent and never to be fabricated: logos of labs or customers, testimonials, traffic numbers, percentages, quotes.

## Product Principles

1. **Lead with the reader's side of the link.** Every page first says which audience it serves, and colour confirms it.
2. **Evidence over adjectives.** Every status links to dated data; claims without data are not made.
3. **What works first, then the next fix.** Partnership tone, never a scoreboard of shame.
4. **One glance, then depth.** Scorecard first, details one click away.

## Accessibility & Inclusion

WCAG 2.2 AA: every text/ground pair is at least 4.5:1 (large display at least 3:1); status is never conveyed by colour alone (symbol + word + colour); full keyboard access to deep links and detail panels; respects `prefers-reduced-motion`.
