---
title: Tests and methodology
description: The tests attribution.now runs on AI assistant outbound links, how results are recorded, and how to reproduce them.
---

# Tests and methodology

We test each **surface** (for example the web app or the iOS app) at each **link location** where a link can appear (inline citations, the sources panel, cards, deep research reports and more). Each test has a stable ID used in the data, on lab pages and in the prompts.

## Statuses

- **Works**: verified passing.
- **Partial**: passes on some link locations, not others.
- **Missing**: verified not passing.
- **Reported**: from a public third-party report, not yet verified by us.
- **Untested**: no data yet.
- **n/a**: does not apply, for example link markup on a native app.

The status shown for a cell is the most recent result by date. On the same date, a verified result (manual, automated or community) takes precedence over a reported one. Every cell links to its evidence.

## How to reproduce

1. Ask the assistant to cite or link one of the target pages below. For a self-identifying link use `/t/<test>/<lab>/<surface>/<location>`, for example `/t/ref-01/openai-chatgpt/web-desktop/inline-citation`.
2. Open the link from the answer.
3. The page shows the server-side `Referer`, `document.referrer`, the query string and the fragment. The visit is also logged (without IP addresses).
4. Record the result as described on [Contribute](/contribute).

---

## Test catalog

{{block:test-catalog}}

---

## Test vectors

Use these input and output pairs to test a link-tagging function. They match the reference implementation on [best practices](/best-practices). Each one runs as a unit test in our build.

{{block:test-vectors}}
