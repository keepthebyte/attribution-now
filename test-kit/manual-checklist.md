# Manual test checklist

For a human tester recording results in `data/results/`. One session = one lab × one surface × one client.

## Before you start

- [ ] Note the client: browser + version + OS, or app version + device + OS (`client` field).
- [ ] Use a fresh conversation. Logged-in state is fine; note the plan (free/paid) in `notes` if it matters.
- [ ] Open `https://attribution.now/t/check` directly once and confirm it shows `Referer (server): (none)`. This is your baseline.

## For each link location on the surface

Locations are listed per surface in `test-kit/targets.md`. Skip a location that doesn't exist on the surface and say so in the result (`status: n/a`, with a note), so we can correct the lab file.

1. Ask the assistant to cite the self-identifying URL for the location, e.g.
   `https://attribution.now/t/ref-01/<lab>/<surface>/<location>`.
   Prompt that tends to work: *"Summarize this page and cite it as a source: <url>"*.
   For the link-pasted location, paste the URL yourself; for bare URL, ask it to write the URL in the answer.
2. Click the link from the place you're testing (inline citation, sources panel, card, …).
3. On the page that opens, record:
   - `Referer (server)` → `evidence.referer`
   - `document.referrer` → `evidence.document_referrer`
   - the full address bar URL → `evidence.landing_url`
4. Decide per test:
   - **REF-01** works if the server referer is the assistant's origin.
   - **REF-02** works if that referer has no path beyond `/`.
   - **REF-03** (web only): in DevTools, inspect the link. Works if `rel` has no `noreferrer` and the referrer policy is `origin` or `strict-origin-when-cross-origin`.
   - **UTM-01** works if `utm_source` is the documented (or observed) value.
5. For the merge tests, repeat with the merge targets (only where UTM-01 works, otherwise `n/a`):
   - **MRG-01** `…/t/mrg-01/<lab>/<surface>/<location>?a=1&b=2` → `a` and `b` intact.
   - **MRG-02** `…/t/mrg-02/<lab>/<surface>/<location>#section-2` → fragment intact, tag before `#`.
   - **MRG-03** `…/t/mrg-03/<lab>/<surface>/<location>?utm_source=newsletter&utm_medium=email` → unchanged.
   - **MRG-04** `…/t/mrg-04/<lab>/<surface>/<location>?expires=2099-01-01&signature=abc123` → byte-identical.

## Lab-wide (once per lab)

- **UTM-02**: same `utm_source` on every surface and location you tested.
- **UTM-03**: find the value in the lab's public docs; put the URL in `notes`.
- **OPS-01**: find a public changelog or release note covering link behavior.

Record lab-wide results in a file with `surface: "*"` and `location: "*"`.

## Record

Create `data/results/<date>-<lab-short>-<surface>-manual.yaml` (copy an existing file), then run:

```sh
npm run validate && npm run render && npm run preview
```

Check the lab page at http://localhost:3000/labs/<lab>, then open a pull request. Server logs for the session can be exported with `npm run export-hits -- --since <date>`.
