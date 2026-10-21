# Test targets

Generated from `data/tests.yaml`. Every request to `/t/*` is logged by the worker (no IPs). Pages are `noindex`.

## Echo page

- https://attribution.now/t/check — shows server `Referer`, `document.referrer`, query, fragment, user agent.

## Per test

| Test | Name | Target URL |
| --- | --- | --- |
| REF-01 | Referrer present | `https://attribution.now/t/ref-01` |
| REF-02 | No full-URL leak | `https://attribution.now/t/ref-02` |
| REF-03 | Link markup (web only) | `https://attribution.now/t/ref-03` |
| UTM-01 | UTM present | `https://attribution.now/t/utm-01` |
| UTM-02 | UTM consistent | `https://attribution.now/t/utm-02` |
| UTM-03 | UTM documented | `https://attribution.now/t/utm-03` |
| MRG-01 | Keeps existing query | `https://attribution.now/t/mrg-01?a=1&b=2` |
| MRG-02 | Keeps fragment | `https://attribution.now/t/mrg-02#section-2` |
| MRG-03 | No overwrite | `https://attribution.now/t/mrg-03?utm_source=newsletter&utm_medium=email` |
| MRG-04 | Signed URLs untouched | `https://attribution.now/t/mrg-04?expires=2099-01-01&signature=abc123` |
| OPS-01 | Changelog | `https://attribution.now/t/ops-01` |

## Self-identifying URLs

Use `/t/<test>/<lab>/<surface>/<location>`; the worker serves the `/t/<test>` page and logs the full path. Merge-test parameters go after the path, e.g. `https://attribution.now/t/mrg-01/openai-chatgpt/ios/inline-citation?a=1&b=2`.

### Claude

- **claude.ai web** (`web`): `inline-citation`, `sources-panel`, `deep-research`, `canvas`, `bare-url`, `pasted-link`, `shared-conversation`
- **iOS app** (`ios`): `inline-citation`, `sources-panel`, `deep-research`, `bare-url`, `pasted-link`
- **Android app** (`android`): `inline-citation`, `sources-panel`, `deep-research`, `bare-url`, `pasted-link`
- **macOS app** (`macos`): `inline-citation`, `sources-panel`, `deep-research`, `canvas`, `bare-url`, `pasted-link`
- **Windows app** (`windows`): `inline-citation`, `sources-panel`, `deep-research`, `canvas`, `bare-url`, `pasted-link`
- **Claude in Chrome** (`chrome`): `inline-citation`, `bare-url`, `pasted-link`

### Gemini

- **Web** (`web`): `inline-citation`, `sources-panel`, `search-cards`, `shopping-cards`, `map-cards`, `deep-research`, `canvas`, `bare-url`, `pasted-link`, `shared-conversation`
- **iOS app** (`ios`): `inline-citation`, `sources-panel`, `search-cards`, `map-cards`, `deep-research`, `bare-url`, `pasted-link`
- **Android app (incl. assistant)** (`android`): `inline-citation`, `sources-panel`, `search-cards`, `map-cards`, `deep-research`, `bare-url`, `pasted-link`
- **Workspace** (`workspace`): `inline-citation`, `sources-panel`, `deep-research`, `canvas`, `bare-url`, `pasted-link`

### ChatGPT

- **Web** (`web-desktop`): `inline-citation`, `sources-panel`, `search-cards`, `shopping-cards`, `map-cards`, `deep-research`, `canvas`, `bare-url`, `pasted-link`, `shared-conversation`
- **iOS app** (`ios`): `inline-citation`, `sources-panel`, `search-cards`, `shopping-cards`, `map-cards`, `deep-research`, `bare-url`, `pasted-link`
- **Android app** (`android`): `inline-citation`, `sources-panel`, `search-cards`, `shopping-cards`, `map-cards`, `deep-research`, `bare-url`, `pasted-link`
- **macOS app** (`macos`): `inline-citation`, `sources-panel`, `search-cards`, `deep-research`, `canvas`, `bare-url`, `pasted-link`
- **Windows app** (`windows`): `inline-citation`, `sources-panel`, `search-cards`, `deep-research`, `canvas`, `bare-url`, `pasted-link`

