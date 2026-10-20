// Reference implementation for adding a UTM tag to an outbound link (SPEC §8.3).
// Test vectors: lib/vectors.json (published on /tests#test-vectors).

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
  // Append to the raw query instead of using searchParams, which would re-encode
  // existing parameters (e.g. `%20` → `+`, `?a` → `?a=`). MRG-01
  url.search = url.search ? `${url.search}&${tag}` : `?${tag}`;
  return url.toString(); // URL keeps the hash after the query. MRG-02
}
