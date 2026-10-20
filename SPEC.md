# attribution.now — v1 Spec

> Build spec for Claude Code. Goal: a first public version of **attribution.now**, a site that helps AI labs improve attribution on outbound links (HTTP referrer + UTM), starting with **ChatGPT, Gemini and Claude**.
> Content and data live on GitHub. The site is delivered by **AEM Edge Delivery Services (EDS)** behind **Cloudflare**, with GitHub content published via **BYOM** and some pages authored in **EDS + SourceBus**.

> **Decisions and deviations** are logged in [section 16](#16-decisions-log) at the end. Where they differ from the text above them, section 16 wins.

---

## 1. Purpose and tone

**Audience for v1: the AI labs** (product managers and engineers who own chat UIs and apps). Marketing and analytics teams are the secondary audience; their tooling (skill.md files, analysis guides) comes in v2.

The site is an **awareness campaign and a partnership**, not a scoreboard to shame anyone.

Tone rules (apply to all copy and generated text):
- Use "status" and "next improvement", never grades, rankings or "fail".
- Every lab page starts with what already works well.
- Shipped improvements get a dated thank-you in the changelog.
- Facts are dated and sourced; anything not verified first-hand is marked **Reported**, not **Verified**.
- Short sentences, plain words, no hype.

---

## 2. v1 scope

### Labs and surfaces

| Lab | Surfaces in scope |
| --- | --- |
| OpenAI ChatGPT | Web (desktop browser), web (mobile browser), iOS app, Android app, macOS app, Windows app |
| Google Gemini | Web, iOS app, Android app (incl. assistant entry points), Workspace (Gemini for business) |
| Anthropic Claude | claude.ai web, iOS app, Android app, macOS app, Windows app, Claude in Chrome |

Out of scope for v1 (data model must allow adding later): Google AI Mode / AI Overviews, Perplexity, Copilot, Meta AI, Grok, DeepSeek, Mistral, API/embedded contexts.

### Link locations (where a link is shown inside a surface)

Each surface is tested per **link location**. Candidate list (research step must confirm which exist per lab/surface):
- Inline citation in an answer
- Sources / citations panel
- Search result or link cards
- Shopping / product cards
- Map / place cards
- Deep research / research report
- Canvas / document / artifact view
- Bare URL written in answer text
- Link the user pasted, echoed back
- Shared conversation page (public share link)

---

## 3. Test catalog

Each test has a stable ID used everywhere (data, pages, prompts).

| ID | Test | Pass criteria |
| --- | --- | --- |
| `REF-01` | Referrer present | Request to the target carries `Referer` with the assistant's origin (e.g. `https://chatgpt.com/`) |
| `REF-02` | No full-URL leak | `Referer` is origin only; no conversation path or IDs |
| `REF-03` | Link markup (web only) | Citation links use `noopener` without `noreferrer`; page/link referrer policy is `origin` or `strict-origin-when-cross-origin` |
| `UTM-01` | UTM present | Landing URL contains `utm_source=<documented value>` |
| `UTM-02` | UTM consistent | Same `utm_source` value on every surface and link location |
| `UTM-03` | UTM documented | Value published in the lab's public docs/help |
| `MRG-01` | Keeps existing query | Target `?a=1&b=2` arrives with `a` and `b` intact |
| `MRG-02` | Keeps fragment | `#section` is preserved and the tag is inserted before it |
| `MRG-03` | No overwrite | Target with existing `utm_source=newsletter` keeps that value |
| `MRG-04` | Signed URLs untouched | Target with `signature`/`token`/`expires` params arrives byte-identical |
| `OPS-01` | Changelog | Lab publishes link-behavior changes (help page, release notes) |

A **result** = lab × surface × link location × test, with one status:

| Status | Meaning |
| --- | --- |
| `works` | Verified passing |
| `partial` | Passes on some link locations, not others |
| `missing` | Verified not passing |
| `reported` | Third-party report, not yet verified by us |
| `untested` | No data yet |
| `n/a` | Not applicable (e.g. `REF-03` on native apps) |

---

## 4. Repository structure (GitHub)

```
attribution-now/
├── SPEC.md
├── README.md
├── LICENSE                  # MIT for code
├── LICENSE-CONTENT          # CC BY 4.0 for content and data
├── data/
│   ├── tests.yaml           # test catalog (section 3)
│   ├── labs/
│   │   ├── openai-chatgpt.yaml
│   │   ├── google-gemini.yaml
│   │   └── anthropic-claude.yaml
│   ├── results/             # one file per test run, append-only
│   │   └── 2026-10-20-chatgpt-web-manual.yaml
│   └── changelog.yaml       # dated lab changes + thank-yous
├── content/                 # markdown sources for generated pages
│   ├── index.md
│   ├── why.md
│   ├── best-practices.md
│   ├── tests.md
│   └── contribute.md
├── prompts/
│   └── templates/
│       ├── fix-in-harness.md
│       └── file-a-ticket.md
├── build/                   # renders data + content → EDS-compatible HTML
│   ├── render.mjs
│   └── templates/
├── worker/                  # Cloudflare worker: AEM proxy + test logger
│   ├── src/index.mjs
│   └── wrangler.toml
├── test-kit/
│   ├── targets.md           # list of test URLs per test ID
│   └── manual-checklist.md  # step-by-step for a human tester
└── .github/workflows/
    ├── build-and-publish.yml
    └── validate-data.yml
```

### Data schemas

`data/labs/<lab>.yaml`
```yaml
id: openai-chatgpt
name: ChatGPT
company: OpenAI
documented_utm: chatgpt.com          # null if none documented
docs_url: https://help.openai.com/en/articles/12627856
contact: null                        # partner/publisher contact if known
what_works: >
  One or two sentences, positive, dated.
surfaces:
  - id: web-desktop
    name: Web (desktop browser)
    link_locations: [inline-citation, sources-panel, search-cards, shopping-cards, deep-research, canvas, bare-url, shared-conversation]
  - id: ios
    name: iOS app
    link_locations: [inline-citation, sources-panel]
work_items:
  - id: chatgpt-ios-ref
    title: Pass an attribution signal from the iOS app
    tests: [UTM-01]
    surfaces: [ios]
    status: open                      # open | in-progress | shipped | wont-do
    summary: One plain sentence on the gap.
    suggested_fix: One or two sentences.
```

`data/results/<date>-<lab>-<surface>-<method>.yaml`
```yaml
date: 2026-10-20
lab: openai-chatgpt
surface: web-desktop
method: manual            # manual | automated | community | reported
tester: cedric
client: "Chrome 141 / macOS 15"
source_url: null          # for method: reported
results:
  - location: inline-citation
    test: REF-01
    status: works
    evidence:
      referer: "https://chatgpt.com/"
      landing_url: "https://attribution.now/t/ref-01?utm_source=chatgpt.com"
      notes: ""
```

The current status per cell = the most recent result by date, with `verified` methods (manual/automated/community) taking precedence over `reported` on the same date.

`validate-data.yml` must schema-check all YAML on every PR.

---

## 5. Site pages (v1)

| Path | Source | Content |
| --- | --- | --- |
| `/` | SourceBus (authored) | Pitch in one screen, link to why/best practices, summary tiles per lab (what works + count of open improvements) |
| `/why` | SourceBus (authored) | Why attribution matters to brands — the empathy page (section 7) |
| `/best-practices` | GitHub `content/` | The five practices with technical detail (section 8) |
| `/labs/<lab>` | GitHub (generated) | Lab page (section 6) |
| `/tests` | GitHub (generated) | Test catalog + methodology + how to reproduce |
| `/t/<test-id>/...` | Worker + GitHub | Test target pages (section 10) |
| `/contribute` | GitHub `content/` | How to submit results (PR or form), how labs request a review |
| `/changelog` | GitHub (generated) | Dated lab changes, newest first, incl. thank-yous |

If SourceBus authoring isn't ready, render `/` and `/why` from `content/` too; the source split is configuration, not code.

---

## 6. Lab page layout (`/labs/<lab>`)

1. **What works today** — `what_works` text, dated.
2. **Status table** — rows = tests, columns = surfaces; cell = status chip. Clicking a cell shows per-location results, date, method, evidence.
3. **Next improvements** — one card per open work item:
   - Title, affected surfaces/tests, one-sentence summary, suggested fix
   - **Copy prompt: fix in your coding harness** (button copies generated text)
   - **Copy prompt: file a ticket** (button copies generated text)
4. **Shipped** — closed work items with dates and a thank-you line.
5. **Last verified** date and "Request a review" link (for the lab to correct an entry).

---

## 7. `/why` — pitch for labs (seed copy outline)

Start from the doc "Why AI Labs Should Improve Outbound Link Attribution". Sections:
- **The ask in one paragraph** — partnership, two signals, cheap to add.
- **Why it helps labs** — proof of value, relationships with publishers and brands, the "AI takes traffic" narrative, healthier ecosystem, fewer escalations.
- **Seeing it from both sides** — labs build chat experiences not websites; RFC 9110 §10.1.3 makes Referer optional; privacy defaults; apps and webviews; fast UI cycles. Marketers: Direct-traffic blind spot, unexplained swings, undercounted reporting, cleanup work.
- **What teams see today** — dark traffic ranges (vendor-sourced, directional), October 8–16, 2026 ChatGPT case written as shared learning, not blame.

---

## 8. `/best-practices` — content outline

1. **Send the origin as the referrer** — no `noreferrer` on citations; `noopener` alone; referrer policy `origin` / `strict-origin-when-cross-origin`; avoid `window.open(url,"_blank","noopener,noreferrer")`.
2. **One documented UTM** — single stable `utm_source` per product; optional `utm_medium=ai-assistant`; same value on all surfaces; publish it.
3. **Merge safely** — keep query and fragment; insert before `#`; never overwrite `utm_*`; skip signed/expiring URLs; encode correctly. Include a reference implementation (below) and test vectors.
4. **Per-surface options** — web, Android (Custom Tabs + `Intent.EXTRA_REFERRER`), iOS (UTM only), desktop apps (UTM only), AI browsers, API/embedded.
5. **Publish a changelog.**
6. **Side effects and how sites handle them** — indexed tagged URLs, CDN cache keys, duplicate pages, shared links keeping the tag, overwritten campaigns.

Reference implementation to include (JavaScript, with unit tests in `build/` or a `lib/` folder):

```js
const SIGNED = /^(signature|sig|token|expires|x-amz-|x-goog-)/i;

export function addAttribution(rawUrl, source, medium) {
  let url;
  try { url = new URL(rawUrl); } catch { return rawUrl; }
  if (!/^https?:$/.test(url.protocol)) return rawUrl;
  const keys = [...url.searchParams.keys()];
  if (keys.some((k) => SIGNED.test(k))) return rawUrl;          // MRG-04
  if (keys.some((k) => k.toLowerCase().startsWith('utm_'))) return rawUrl; // MRG-03
  url.searchParams.append('utm_source', source);                 // MRG-01, MRG-02 (URL keeps hash)
  if (medium) url.searchParams.append('utm_medium', medium);
  return url.toString();
}
```

Note in the copy: the "skip if any `utm_*` exists" rule is the conservative choice; discuss alternatives openly.

---

## 9. Copy-paste prompts

Generated per work item from `prompts/templates/*.md` with placeholders filled from data. Both must be self-contained (the reader has no other context).

### `fix-in-harness.md`
```
You are working in the codebase for {{lab_name}} ({{surface_names}}).

Goal: improve attribution on outbound links so websites can see visits came from {{lab_name}}.

Current behavior (as of {{last_verified}}, {{method}}):
{{gap_summary}}

Target behavior:
{{for each test}}- {{test_id}}: {{pass_criteria}}{{/for}}

Implementation guidance:
- Find where outbound links are rendered or opened for: {{link_locations}}.
- Web: remove `noreferrer` from citation links; keep `noopener`; set referrer policy to `origin` or `strict-origin-when-cross-origin`.
- Add `utm_source={{documented_utm_or_suggested}}` using safe merging: keep existing query and fragment, never overwrite existing utm_* params, skip signed/expiring URLs.
- Native apps: open links so the platform passes what it can (Android Custom Tabs with an app referrer); rely on the UTM where no referrer is possible.
- Add tests using these vectors: https://attribution.now/tests#vectors

Verify by opening https://attribution.now/t/check from each changed surface; the page shows the referrer and UTM it received.

Reference: https://attribution.now/best-practices
```

### `file-a-ticket.md`
```
Create a ticket in our tracker for the following.

Title: {{work_item_title}}
Component: {{surface_names}} — outbound links
Type: Improvement
Summary: {{gap_summary}}
Why it matters: Websites receiving visits from {{lab_name}} count them as "Direct" traffic when no referrer or UTM arrives, which hides the value {{lab_name}} sends to publishers and brands.
Acceptance criteria:
{{for each test}}- [ ] {{test_id}}: {{pass_criteria}}{{/for}}
Verification: open https://attribution.now/t/check from {{surface_names}} and confirm the referrer/UTM shown.
References: https://attribution.now/labs/{{lab_id}} · https://attribution.now/best-practices
```

---

## 10. Test targets and logging

### Test target pages
- `/t/check` — echo page: shows the visitor the `Referer` the server received, `document.referrer`, full query string, fragment, user agent. Also logs (below). This is the page labs and community testers use.
- `/t/<test-id>/<lab>/<surface>/<location>` — unique URL per test case so every hit is self-identifying.
- Variants for merge tests:
  - `MRG-01`: `/t/mrg-01?a=1&b=2`
  - `MRG-02`: `/t/mrg-02#section-2`
  - `MRG-03`: `/t/mrg-03?utm_source=newsletter&utm_medium=email`
  - `MRG-04`: `/t/mrg-04?expires=2099-01-01&signature=abc123`
- Pages must be indexable-safe: `noindex`, self-canonical without params.
- Content on test pages should be real, citable text (a short explainer per test) so assistants are willing to cite them.

### Logging (in the Cloudflare worker, before cache)
EDS requires query params to be forwarded and included in the cache key, and cached hits never reach origin, so **log in the worker** for `/t/*` on every request.

Record per hit: timestamp, path, `Referer` header, full query string, `User-Agent`, `Sec-Fetch-Site`, `Sec-Fetch-Dest`, Cloudflare country. **Do not store IP addresses.**

Store: Workers Analytics Engine or D1 (pick one; D1 if we want SQL exports). Plus a client beacon from `/t/*` pages posting `document.referrer`, `location.search` and `location.hash` (fragments never reach the server) to `/t/beacon`.

Provide `npm run export-hits -- --since 2026-10-20` producing CSV for analysis and for converting into `data/results/` entries.

### Who runs tests
- v1: manual testing by Cedric (web via Claude in Chrome; native apps on own devices or a device farm), recorded with `test-kit/manual-checklist.md`.
- Seeded `reported` results from the October 2026 research (with source URLs).
- Community submissions via PR in v1; a form in v2.

---

## 11. Hosting and delivery

### EDS project
- Create from `adobe/aem-boilerplate` in the same GitHub org (code repo, e.g. `attribution-now-site`). Content repo = `attribution-now` above (or one repo with both; decide in M1).
- Blocks needed: `status-table`, `work-item` (with copy-to-clipboard buttons), `lab-tiles`, `changelog`, `test-echo` (for `/t/check`).
- Keep pages fast and simple; no third-party scripts beyond EDS RUM.

### Content via BYOM
- Per aem.live docs, a BYOM source returns HTML for each previewed path; configured with `"type": "markup"` via `fstab.yaml` or the configuration service. BYOM can also be an **overlay** over another primary source.
- Plan: `build/render.mjs` renders `data/` + `content/` into EDS-compatible semantic HTML (blocks as `div` tables per EDS markup conventions), one file per path, published to a static host (GitHub Pages is fine) that acts as the BYOM endpoint.
- `build-and-publish.yml` on push to `main`: validate → render → deploy static HTML → call the EDS admin API to preview and publish changed paths.
- **SourceBus**: authored pages (`/`, `/why`) come from SourceBus as the primary content source, with GitHub BYOM as the overlay (or the reverse). **Claude Code: confirm SourceBus configuration and overlay precedence with Cedric before wiring; don't guess.**

### Cloudflare
- Domain `attribution.now` (Cedric buys it and moves DNS to Cloudflare).
- Follow aem.live "Cloudflare Setup (worker)": worker based on `adobe/aem-cloudflare-prod-worker`, origin `main--<repo>--<org>.aem.live`, route `attribution.now/*`, `www` → apex redirect.
- Push invalidation: configure `cdn.prod.type: cloudflare`, `cdn.prod.host`, `cdn.prod.zoneId`, `cdn.prod.apiToken` in the EDS site config.
- Extend the same worker with the `/t/*` logger (section 10). Keep the AEM proxy logic unchanged; add logging as a wrapper.
- Block non-standard ports if the plan allows.

Docs: https://www.aem.live/developer/byom · https://www.aem.live/docs/byo-cdn-cloudflare-worker-setup · https://www.aem.live/docs/byo-cdn-setup

---

## 12. Seed data (from October 2026 research — all `reported`)

Seed lab files and results with these, each with source URL and `method: reported`:

**ChatGPT**
- Documented `utm_source=chatgpt.com` (OpenAI Publishers FAQ).
- Web: Sources/citations pass `chatgpt.com` referrer; tag on sources and citations.
- iOS/Android/Mac/Windows apps: no referrer, tag carried (WISLR, Apr 2026).
- Oct 8–16, 2026: tag and referrer missing on most answers after a UI update; restored ~Oct 16 (Profound). After the fix, referrer reportedly still missing on many clicks.

**Gemini**
- `utm_source=gemini` (and `geminiforbusiness` for Workspace) first seen around Sept 28, 2026; not documented by Google (Search Engine Journal, Vizzybl).
- Web: referrer passes on chat links; Deep Research source links reported `noreferrer`.
- Apps: referrer rarely or never; UTM coverage on apps unconfirmed.

**Claude**
- claude.ai web: `claude.ai` referrer passes; no UTM (Ahrefs, Seer).
- iOS/Android/desktop apps: no referrer, no UTM (WISLR).
- UTM feature request (anthropics/claude-code #43398) closed as not planned.

Seed open work items accordingly (e.g. "Add a documented UTM tag" for Claude; "Document the UTM value" and "Confirm app coverage" for Gemini; "Restore referrer on all link locations" and "Publish a changelog" for ChatGPT). Wording positive and specific.

---

## 13. Milestones

| # | Milestone | Done when |
| --- | --- | --- |
| M1 | Repo + data + render | `data/` schemas validated in CI; `render.mjs` outputs all pages locally; prompts generate correctly for every work item |
| M2 | EDS project + BYOM | Generated pages preview and publish on `*.aem.page` / `*.aem.live` from GitHub |
| M3 | Domain + Cloudflare | `attribution.now` serves the site via the worker; push invalidation works |
| M4 | Test targets + logging | `/t/check` echoes correctly; hits logged without IPs; export script works |
| M5 | First verified results | Manual web results for all three labs recorded; lab pages show verified + reported statuses |
| M6 | Launch v1 | `/why` and `/best-practices` final; labs given a preview and a review contact before public announcement |

---

## 14. Acceptance criteria (v1)

- [ ] Every status cell links to its evidence and date; no undated claims.
- [ ] Every open work item has both copy prompts, and they read correctly with no unfilled placeholders.
- [ ] `/t/check` shows server referrer, `document.referrer`, query and fragment on desktop and mobile.
- [ ] No IPs or personal data stored; test pages are `noindex`.
- [ ] Lighthouse performance ≥ 95 on lab pages.
- [ ] Copy follows the tone rules in section 1 (review pass before launch).

---

## 15. Open questions (ask Cedric before deciding)

1. GitHub org and repo names; one repo or separate code/content repos?
2. SourceBus setup: which pages, and is it primary source or overlay?
3. Log store: Workers Analytics Engine or D1?
4. Branding: independent of Adobe branding? Who is listed as maintainer?
5. Licenses: MIT (code) + CC BY 4.0 (content/data) OK?
6. Known lab contacts for the pre-launch review?

---

## 16. Decisions log

**2026-10-19**

Answers to section 15:
1. **One repo**, `keepthebyte/attribution-now`, with the EDS boilerplate code at the root. Non-site folders are excluded from code delivery via `.hlxignore`.
2. **SourceBus is the primary content source**; GitHub BYOM (GitHub Pages) is the overlay. EDS fetches the overlay first and falls back to the primary on 404, so paths authored in SourceBus (`build/config.json` → `byom.authored_paths`, currently `/` and `/why`) are rendered locally but **not deployed** to the overlay. SourceBus connection details are still open.
3. **D1** for hits and beacons (`worker/migrations/`).
4. Not yet answered: branding and maintainer listing. The footer names no maintainer for now.
5. **Apache License 2.0** for the whole repository (code, content and data), one `LICENSE` file. No `LICENSE-CONTENT`.
6. Not yet answered: lab contacts (needed for M6).

Deviations from the text above, with reasons:
- **`fstab.yaml` is retired** for new EDS sites; BYOM and overlay are configured via the configuration service (overlays are config-service-only anyway). See README.
- **Reference implementation** appends the tag to the raw query string instead of `searchParams.append`, because `URLSearchParams` re-serializes the whole query (`%20` → `+`, `?a` → `?a=`), which breaks MRG-01 ("arrive intact") and could alter signed-looking URLs that don't match the skip list.
- **Prompt templates**: the vectors link points to `/tests#test-vectors` (EDS derives heading ids from heading text); loop items are joined one per line; a `{{utm_note}}` says whether the value is documented, observed or suggested; `{{site}}` replaces the hard-coded host.
- **Results schema**: `surface: "*"` is allowed for lab-wide tests (UTM-02, UTM-03, OPS-01) and `location: "*"` for results that cover every location on a surface. Result `status` holds the observed outcome (`works`/`partial`/`missing`/`n/a`); **Reported** is derived on the page from `method: reported`, so the reported finding isn't lost.
- **Surfaces** carry `platform: web | native` so web-only tests resolve to `n/a` automatically.
- **Seed data corrections** after checking sources (see `data/results/` notes):
  - Gemini UTM first seen **Sept 10, 2026**, 100% on Sept 28, briefly gone after Sept 29 (Vizzybl). SEJ (Oct 1) confirms it's undocumented but doesn't name `geminiforbusiness`.
  - Gemini Deep Research `noreferrer` applies to the "Researching websites" section and dates from May 2025 (Ahrefs).
  - ChatGPT web UTM is disputed: WISLR (Apr 2026) saw no UTM in desktop browsers; Ahrefs (2025) and Profound (Oct 2026) saw tags on cited links.
  - October incident: the decline began Oct 8 and steepened Oct 14; the fix landed Oct 15–16; the cause is attributed differently by different sources.
  - anthropics/claude-code#43398 was filed in the Claude Code repo and auto-closed by a bot as off-topic. It was not a product decision by Anthropic, so the site doesn't present it as one.
  - The "Why AI Labs Should Improve Outbound Link Attribution" doc wasn't found publicly; `/why` was drafted from the outline in section 7.
