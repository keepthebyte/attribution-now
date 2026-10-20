---
title: Best practices for outbound link attribution
description: Five practices that let websites attribute visits from an AI assistant, with code, per-platform notes and test vectors.
---

# Best practices for outbound link attribution

Five practices, in order of impact. Each maps to tests in the [test catalog](/tests).

---

## 1. Send the origin as the referrer

Tests: REF-01, REF-02, REF-03.

The referrer is the oldest attribution signal on the web, and every analytics tool reads it. Send the origin only, such as `https://chatgpt.com/`, never the conversation URL.

- Use `rel="noopener"` on outbound links. It keeps the security benefit of isolating the new tab.
- Don't add `noreferrer`. It removes the referrer and makes the visit look like Direct.
- Set the referrer policy to `strict-origin-when-cross-origin` (the browser default) or `origin`. Both send the origin to other sites and never the path.
- Avoid `window.open(url, "_blank", "noopener,noreferrer")`. Use `window.open(url, "_blank", "noopener")` instead.

```html
<meta name="referrer" content="strict-origin-when-cross-origin">
<a href="https://example.com/article" target="_blank" rel="noopener">Example</a>
```

---

## 2. One documented UTM value

Tests: UTM-01, UTM-02, UTM-03.

Apps, webviews and some browsers can't send a referrer. A `utm_source` parameter works everywhere.

- Pick one stable `utm_source` value per product, for example your main domain. Use it on every surface and every link location.
- Optionally add `utm_medium=ai-assistant` so sites can group assistants together.
- Publish the value in your help center or publisher docs, with the date it started.

---

## 3. Merge safely

Tests: MRG-01, MRG-02, MRG-03, MRG-04.

Adding a parameter to someone else's URL must never break it.

- Keep the existing query string exactly as it is, including its encoding.
- Insert the tag before the `#` fragment, so the page still jumps to the right section.
- Never overwrite existing `utm_*` parameters. They are the site's own campaign data.
- Skip signed or expiring URLs, such as those with `signature`, `token`, `expires`, `X-Amz-*` or `X-Goog-*` parameters.
- Only tag `http` and `https` links.

Reference implementation (JavaScript):

```js
const SIGNED = /^(signature|sig|token|expires|x-amz-|x-goog-)/i;

export function addAttribution(rawUrl, source, medium) {
  let url;
  try { url = new URL(rawUrl); } catch { return rawUrl; }
  if (!/^https?:$/.test(url.protocol)) return rawUrl;
  const keys = [...url.searchParams.keys()];
  if (keys.some((k) => SIGNED.test(k))) return rawUrl; // MRG-04
  if (keys.some((k) => k.toLowerCase().startsWith('utm_'))) return rawUrl; // MRG-03
  let tag = `utm_source=${encodeURIComponent(source)}`;
  if (medium) tag += `&utm_medium=${encodeURIComponent(medium)}`;
  // Append to the raw query: searchParams would re-encode existing parameters. MRG-01
  url.search = url.search ? `${url.search}&${tag}` : `?${tag}`;
  return url.toString(); // URL keeps the hash after the query. MRG-02
}
```

The [test vectors](/tests#test-vectors) cover each rule.

A note on choices: skipping the tag whenever any `utm_*` parameter exists is the conservative option. It never touches a site's campaign data, but it also means links that already carry, say, only `utm_campaign` get no source from you. An alternative is to add `utm_source` only when it is missing. We'd like to hear from labs and sites on which works better in practice.

---

## 4. Per-surface options

- **Web.** Referrer plus UTM, as above. Check every link component: inline citations, source panels, cards, research reports, canvas views and shared conversation pages.
- **Android.** Open links in a [Custom Tab](https://developer.chrome.com/docs/android/custom-tabs) and set `Intent.EXTRA_REFERRER` to `android-app://<your.package.name>`. The browser can then pass an app referrer. Add the UTM as well.
- **iOS.** Neither `SFSafariViewController` nor opening Safari passes a referrer you control. Rely on the UTM.
- **Desktop apps.** Links open in the default browser with no referrer. Rely on the UTM.
- **AI browsers and agents.** When the assistant navigates on the user's behalf, send the same referrer and tag as a click would.
- **API and embedded use.** Return links already tagged, and document the behavior, so products built on your API pass the signal on.

---

## 5. Publish a changelog

Test: OPS-01.

Link behavior changes with UI updates. A short, dated public note ("from October 20, links in research reports carry the referrer") lets websites tell a product change from a real change in traffic, and saves both sides a week of guessing.

---

## 6. Side effects and how sites handle them

Tagging links has small side effects that sites already know how to manage.

- **Indexed tagged URLs.** Search engines may find URLs with the tag. A canonical link without parameters handles it, and most sites already have one.
- **CDN cache keys.** Some CDNs include the full query in the cache key, so tagged URLs get their own cache entries. Sites can strip `utm_*` from the cache key.
- **Duplicate pages in analytics.** Most analytics tools strip `utm_*` from page reports by default.
- **Shared links keep the tag.** When a visitor copies a tagged URL and shares it, later visits carry the assistant's tag. This is a known limit of UTMs everywhere.
- **Overwritten campaigns.** The safe merge above never replaces existing `utm_*` values, so a site's own campaign links stay intact.
