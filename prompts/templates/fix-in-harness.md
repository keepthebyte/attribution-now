You are working in the codebase for {{lab_name}} ({{surface_names}}).

Goal: improve attribution on outbound links so websites can see visits came from {{lab_name}}.

Current behavior (as of {{last_verified}}, {{method}}):
{{gap_summary}}

Target behavior:
{{for each test}}- {{test_id}}: {{pass_criteria}}{{/for}}

Implementation guidance:
- Find where outbound links are rendered or opened for: {{link_locations}}.
- Web: remove `noreferrer` from citation links; keep `noopener`; set referrer policy to `origin` or `strict-origin-when-cross-origin`. Avoid `window.open(url, "_blank", "noopener,noreferrer")`.
- Add `utm_source={{documented_utm_or_suggested}}`{{utm_note}} using safe merging: keep existing query and fragment, never overwrite existing utm_* params, skip signed/expiring URLs.
- Native apps: open links so the platform passes what it can (Android Custom Tabs with an app referrer); rely on the UTM where no referrer is possible.
- Add tests using these vectors: {{site}}/tests#test-vectors

Verify by opening {{site}}/t/check from each changed surface; the page shows the referrer and UTM it received.

Reference: {{site}}/best-practices
