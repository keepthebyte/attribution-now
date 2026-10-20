---
title: Contribute
description: How to submit test results to attribution.now, and how labs can request a review of their entry.
---

# Contribute

All data lives in a public GitHub repository. Every status on this site comes from a file in `data/results/`, and every file names its date, method and source.

## Submit a test result

1. Open [attribution.now/t/check](/t/check) (or a specific test target from the [test catalog](/tests)) from a link in an assistant.
2. Note what the page shows: the server referrer, `document.referrer`, the query string and the fragment.
3. Add a new file to `data/results/` named `<date>-<lab>-<surface>-<method>.yaml`, using `method: community`. Copy the format from an existing file. Results files are append-only: add a new file instead of editing an old one.
4. Open a pull request. Automated checks validate the file.

The step-by-step checklist is in [test-kit/manual-checklist.md](https://github.com/keepthebyte/attribution-now/blob/main/test-kit/manual-checklist.md). A web form is planned.

## Report a third-party finding

If you've seen a public report we don't list, open an issue with the link. We record it as **Reported** until we verify it.

## For labs: request a review

If you work on one of the assistants and something is out of date or wrong, use the **Request a review** link on your lab page, or open an issue. We update entries quickly, and we're happy to add a contact so you hear from us first about anything new.

## What we store

The test pages under `/t/` log each visit: time, path, `Referer`, query string, user agent, `Sec-Fetch-*` headers and country. **We don't store IP addresses.** The pages are `noindex`.
