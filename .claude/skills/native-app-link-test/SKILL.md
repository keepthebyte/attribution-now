---
name: native-app-link-test
description: Run the attribution test plan against a native assistant desktop app (ChatGPT, Claude or Gemini on macOS/Windows) with computer use, then record the results in data/results/ and open a PR. Use when asked to test links, referrers or UTM tags in a desktop app, e.g. "test the ChatGPT Mac app", "run the link tests on the Claude desktop app".
---

# Native app link test

Runs `test-kit/manual-checklist.md` on a native desktop surface (`macos` or `windows` in `data/labs/<lab>.yaml`) and writes the results back to the site. Read the checklist first; this skill only adds what is different when Claude drives the app.

## Prerequisites

- The session runs in the **Claude desktop app with Computer use turned on**. Load the `computer-use` skill and follow its access flow. Request the assistant app under test (e.g. "ChatGPT") and the person's default browser. The browser is read-only (screenshots only).
- Load the computer-use tools with one ToolSearch call: `{ query: "computer", max_results: 40 }`. If no computer-use tools are present, stop and say so.
- `npx wrangler login` has been run once (for `npm run export-hits`). If it hasn't, ask the person to run `! npx wrangler login` and use the `/t/check` screenshots as a fallback.
- Mobile apps (`ios`, `android`) are out of scope; computer use can't reach a phone.

## Who clicks

The computer-use rules forbid Claude from clicking web links in native apps, and that rule applies here too. Opening the URL in Chrome instead would test Chrome, not the app. So for every link:

1. Claude gets the link into place in the app and checks its hover target or link text matches the expected `https://attribution.now/t/...` URL.
2. Claude tells the person exactly which element to click (location, label, position) and waits for them to say they clicked it.
3. Claude reads the outcome itself (see Evidence below).

Batch the clicks: set up one conversation that cites every URL for a location, then ask for all the clicks in one message, in a numbered list.

## Testing Claude Desktop

When the app under test is Claude itself, never type test prompts into the window running this session. Run the session in one Claude window and test in another: a second instance (e.g. the person's `Claude Work` or `Claude Private` launcher) or a separate window with a fresh conversation. Before the first prompt, confirm with a screenshot which window is the test target, and say which one it is in the result's top comment.

If computer use won't grant access to the Claude app, stop and say so; don't fall back to links in this session's own replies. Those would test the session, not a normal conversation.

## Run

1. **Client**: read the app version from its About window, and the OS version (`sw_vers` on macOS via Bash). Record the default browser too, since it receives the click: `client: "ChatGPT 1.2026.xxx (macOS app) → Chrome 155 / macOS 27.2"`.
2. **Baseline**: ask the person to open `https://attribution.now/t/check` directly once; screenshot it and confirm `Referer (server): (none)`.
3. **Locations**: take them from `data/labs/<lab>.yaml` for the surface (they are candidates until confirmed). For each one, use a fresh conversation and the self-identifying URLs from `test-kit/targets.md`:
   `https://attribution.now/t/<test>/<lab>/<surface>/<location>`.
   Type prompts with the computer-use `type` action. The checklist's prompt usually works: *"Summarize this page and cite it as a source: <url>"*. For `bare-url`, ask for the URL to be written in the answer; for `pasted-link`, the URL in the prompt is the link. If a location can't be produced after two tries (e.g. no shopping cards for our URLs), record `status: n/a` with a note instead of looping.
4. **Merge tests** (MRG-01…04): only where UTM-01 works, as in the checklist.
5. **REF-03** is web-only: `n/a` on native surfaces, as `data/tests.yaml` says. Leave it out.

## Evidence

Prefer the server log; it's what a site's analytics would see.

- After a batch of clicks: `npm run export-hits -- --since <today> --out exports/hits.csv`, then match rows by `path` (the CSV splits out `test`, `lab`, `surface`, `location`). Use `referer`, `document_referrer`, `query`/`utm_source` and `user_agent`. The UA shows whether the app opened an in-app web view or the default browser; note which in `notes`.
- Fallback / cross-check: screenshot the landing page in the browser (read tier). It shows `Referer (server)`, `document.referrer` and the address bar.
- No row for a click means it never reached the worker (blocked, prefetch only, or a misclick). Ask the person to click again once before recording anything.

Decide each test as the checklist says. A native app has no web origin, so for REF-01 note what arrived: an app referrer such as `android-app://…` or `https://chatgpt.com/`, or nothing.

## Record

1. Branch from `main`: `git switch -c results/<date>-<lab-short>-<surface>`.
2. Write `data/results/<date>-<lab-short>-<surface>-manual.yaml`. Copy the shape of an existing manual file, e.g. `2026-10-20-chatgpt-web-desktop-manual.yaml`. Set `tester: <person> (via Claude computer use)`. Add a top comment with the account plan, the model/mode used and how links open (web view or browser). Put `referer`, `document_referrer` and `landing_url` in `evidence` exactly as logged.
3. If the run shows a location doesn't exist on the surface, or a new one does, update `link_locations` in `data/labs/<lab>.yaml` in the same PR.
4. `npm run validate && npm run render`, then `npm run preview` and check `http://localhost:3000/labs/<lab>`.
5. Commit, push, and open a PR. The description must include `https://<branch-with-slashes-as-dashes>--attribution-now--keepthebyte.aem.page/labs/<lab>`. Merging ships the rendered data; anything authored in SourceBus publishes separately.

Don't touch `changelog.yaml` or `work_items` unless the person asks; summarise what changed vs the previous results in the PR instead.
