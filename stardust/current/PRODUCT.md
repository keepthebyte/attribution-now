<!-- stardust:provenance writtenBy=stardust:extract writtenAt=2026-10-21T07:05:00Z userInput="extract https://attribution.now --pages /,/why,/labs/openai-chatgpt,/tests" readArtifacts=stardust/current/pages/*.json,content/*.md,data/labs/*.yaml,README.md synthesized=Users,Positioning,Product Principles (inferred from captured copy) -->
# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

_provenance: inferred — from the homepage hero copy captured 2026-10-21 (preview host)._

Two audiences, named on the homepage:

1. **SEO, GEO and analytics teams** who measure traffic from AI assistants and see much of it land in "Direct". They come to learn which assistant visits they can attribute today and how to estimate the rest.
2. **Teams at AI labs** (OpenAI, Google, Anthropic) who build the assistants. They arrive from a direct link sent by the site owner and need to see their own status, why it matters, and the small fix to ship.

## Product Purpose

Track, per assistant and per surface (web, mobile apps, desktop apps), whether outbound links carry two signals: the assistant's origin as HTTP referrer and one documented `utm_source` tag. Publish the evidence, propose the next fix as copy-paste prompts, and thank labs when it ships.

## Positioning

_provenance: inferred._ An evidence-first, partnership-toned status tracker: every status links to dated test data in a public repo, and every gap comes with a concrete, small fix rather than a complaint.

## Capabilities and Constraints

- Pages: homepage (split hero, scorecard, link check), `/why`, `/best-practices`, `/labs/<lab>` (status table + work items with prompts), `/tests` (test catalog + vectors), `/changelog`, `/t/check` (live echo of referrer/UTM), upcoming `/reclaim-direct-traffic`.
- Delivered by AEM Edge Delivery Services; `/` and `/why` authored in SourceBus, the rest generated from `data/` in the repo. Blocks: columns, scorecard, status-table, work-item, changelog, test-echo, fragment.
- Status vocabulary: Works, Partial, Missing, Reported (third-party, unverified), Untested, n/a.

## Brand Commitments

_provenance: observed._ No brand identity yet: the site runs the stock EDS boilerplate look (Roboto / Roboto Condensed, white ground, blue links, pill buttons, pastel status chips). Voice is plain, factual and courteous ("Thank you", "partnership"); register reads as **brand** (advocacy / editorial) with product-like data tables on lab and test pages.

## Evidence on Hand

- Captured pages: `stardust/current/pages/{index,why,labs-openai-chatgpt,tests}.json` and `.html`, screenshots under `stardust/current/assets/screenshots/`.
- Real data: `data/results/*.yaml` (dated test runs), `data/labs/*.yaml`, `data/changelog.yaml`.
- No photography, illustration, logo or testimonials exist. None may be fabricated.

## Product Principles

_provenance: inferred._

1. Evidence before opinion: every status links to its data.
2. Partnership, not blame: say what works first, then the next small fix.
3. Two audiences, one truth: analysts and lab teams read the same scorecard.
4. Small and concrete: fixes are framed as a few lines of code.

## Accessibility & Inclusion

Not specified by the owner; WCAG 2.2 AA assumed as the baseline.
