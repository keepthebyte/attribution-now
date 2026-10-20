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
| `blocks/`, `scripts/`, `styles/`, `head.html` | EDS site code (from `adobe/aem-boilerplate`). Blocks: `status-table`, `work-item`, `lab-tiles`, `changelog`, `test-echo`. |
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

## Setup still to do (M2–M4)

These steps need accounts and decisions, so they aren't automated yet.

1. **GitHub**: push to `keepthebyte/attribution-now`. Enable Pages with source **GitHub Actions**. Install the [AEM Code Sync app](https://github.com/apps/aem-code-sync) on the repo.
2. **EDS site config** (configuration service; `fstab.yaml` is retired). With SourceBus as primary and this repo as overlay:
   ```json
   "content": {
     "source":  { "url": "<SourceBus content source URL>", "type": "<SourceBus type>" },
     "overlay": { "url": "https://keepthebyte.github.io/attribution-now", "type": "markup", "suffix": ".html" }
   }
   ```
   Until SourceBus is ready, set `byom.authored_paths` to `[]` in `build/config.json` and use the overlay URL as the `source`.
   Add the `cdn.prod` settings (`type: cloudflare`, `host: attribution.now`, `zoneId`, `apiToken`) for push invalidation.
3. **Secrets**: `AEM_ADMIN_TOKEN` (admin API key for `keepthebyte/attribution-now`) in the repo's Actions secrets.
4. **Cloudflare**: add the `attribution.now` zone. Then:
   ```sh
   cd worker && npm install
   npx wrangler d1 create attribution-now-hits      # put the id in wrangler.toml
   npm run migrate
   npm run deploy
   ```
   Set `account_id` in `wrangler.toml`. Add a proxied DNS record for `www` so the redirect route fires.
5. **Export hits**: `npm run export-hits -- --since 2026-10-20 --out exports/hits.csv`.

## Privacy

The worker logs `/t/*` requests only: time, path, query, `Referer`, user agent, `Sec-Fetch-*`, `Sec-Purpose`, country. It never stores IP addresses. Test pages are `noindex` (metadata and `X-Robots-Tag`) and `no-store`.

## License

[Apache License 2.0](LICENSE) for code, content and data. `worker/src/aem-proxy.mjs` is © Adobe, also Apache-2.0.
