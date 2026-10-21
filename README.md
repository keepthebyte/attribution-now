# attribution.now

A site that helps AI labs improve attribution on outbound links (HTTP referrer + UTM), starting with ChatGPT, Gemini and Claude. See [SPEC.md](SPEC.md) and its decisions log.

Delivered by AEM Edge Delivery Services behind a Cloudflare worker. Data and generated pages come from this repo through BYOM; `/` and `/why` are authored in SourceBus.

## Layout

| Path | What |
| --- | --- |
| `data/` | Test catalog, link locations, labs, results (append-only), changelog. JSON schemas in `data/schemas/`. |
| `content/` | Markdown for hand-written pages. `---` separates sections; `{{block:name}}` inserts a generated block. |
| `prompts/templates/` | Copy-paste prompt templates, filled per work item. |
| `lib/` | Data loading, status resolution, prompt rendering, and the reference `addAttribution()` with test vectors. |
| `build/` | `validate.mjs`, `render.mjs` (→ `dist/`), `preview.mjs` (local server), `sourcebus.mjs` (push pages to SourceBus + preview), `publish.mjs` (AEM Admin API), `config.json`. |
| `blocks/`, `scripts/`, `styles/`, `head.html` | EDS site code (from `adobe/aem-boilerplate`). Blocks: `status-table`, `work-item`, `scorecard`, `lab-tiles`, `changelog`, `test-echo`, and `columns (audiences)` for the homepage split. Design system in `DESIGN.md`. Section metadata `Style`: `card` sets a section on a page-coloured card; `analysts` (violet) and `labs` (pink) colour a whole section by audience. `columns (audiences)` puts analysts first; add `labs-first` to swap. |
| `worker/` | Cloudflare worker: Adobe's AEM proxy (unchanged, `src/aem-proxy.mjs`) wrapped with the `/t/*` logger, D1 migrations, `export-hits`. |
| `test-kit/` | Target URLs and the manual checklist. |

## Local

```sh
npm install
npm run validate     # schemas + cross-references + every prompt renders
npm test             # reference implementation vectors, status rules, prompts, worker logger
npm run render       # dist/<path>.html for every page (add -- --byom to skip SourceBus paths)
npm run preview      # http://localhost:3000 with blocks, nav/footer and a simulated /t/* echo
npm run lint
```

## How status is computed

Per lab × surface × link location × test: newest result by date; on the same date a verified method (manual, automated, community) beats `reported`; then an exact surface/location beats `*`. A surface cell aggregates its locations (all works → Works, all missing → Missing, mixed → Partial), using verified results where any exist. When only reported results exist, the cell reads **Reported: <finding>**. Web-only tests are `n/a` on native surfaces.

## Push pages to SourceBus

The site's content source is SourceBus (`https://api.aem.live/keepthebyte/sites/attribution-now/source/`). To push rendered pages and preview them (add `--publish` to go live):

```sh
npm run render
AEM_TOKEN=<IMS token> node build/sourcebus.mjs /nav /footer / /why
```

This overwrites the SourceBus document at each path. Once `/` and `/why` are edited in SourceBus, don't push them again.

## Infrastructure

Set up per [Cloudflare Setup (worker)](https://www.aem.live/docs/byo-cdn-cloudflare-worker-setup).

- **Domain**: registered at Gandi, nameservers delegated to Cloudflare.
- **Cloudflare** (zone `attribution.now`, Free plan): proxied CNAMEs for `@` and `www` to the `aem.live` origin, Always Use HTTPS, Browser Cache TTL "Respect Existing Headers", one cache rule (hostname contains `attribution.now` → eligible for cache, browser TTL from origin). The worker routes `attribution.now/*` and `www.attribution.now/*`.
- **EDS site config** (configuration service; `fstab.yaml` is retired):
  - `content.source`: SourceBus, `https://api.aem.live/keepthebyte/sites/attribution-now/source`
  - `content.overlay`: `https://keepthebyte.github.io/attribution-now` (`markup`, suffix `.html`), deployed by the Build and publish workflow
  - `cdn.prod`: `cloudflare`, `plan: free`, so every publish purges the whole zone
- **Secrets**: `AEM_ADMIN_TOKEN` (admin API key) in the repo's Actions secrets.

Code reaches EDS through the AEM Code Sync GitHub app on every push. To check it, fetch a changed file from `https://main--attribution-now--keepthebyte.aem.page/` (or `{branch}--…`) and look for the change. If sync stalls (seen in October 2026: merges served old code for 15+ minutes and new branches returned 404), push to the branch again, or sync by hand with `curl -X POST -H "Authorization: Bearer $AEM_TOKEN" "https://admin.hlx.page/code/keepthebyte/attribution-now/main/*"`. Don't publish content that needs new block code until the code is live.

Deploy worker changes with `cd worker && npm run deploy`; schema changes with `npm run migrate`. Export hits with `npm run export-hits -- --since 2026-10-20 --out exports/hits.csv`.

## Privacy

The worker logs `/t/*` requests only: time, path, query, `Referer`, user agent, `Sec-Fetch-*`, `Sec-Purpose`, country. It never stores IP addresses. Test pages are `noindex` (metadata and `X-Robots-Tag`) and `no-store`.

## License

[Apache License 2.0](LICENSE) for code, content and data. `worker/src/aem-proxy.mjs` is © Adobe, also Apache-2.0.
