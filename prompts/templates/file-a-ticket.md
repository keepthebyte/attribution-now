Create a ticket in our tracker for the following.

Title: {{work_item_title}}
Component: {{surface_names}} — outbound links
Type: Improvement
Summary: {{gap_summary}}
Current behavior: as of {{last_verified}} ({{method}}).
Why it matters: Websites receiving visits from {{lab_name}} count them as "Direct" traffic when no referrer or UTM arrives, which hides the value {{lab_name}} sends to publishers and brands.
Acceptance criteria:
{{for each test}}- [ ] {{test_id}}: {{pass_criteria}}{{/for}}
Verification: open {{site}}/t/check from {{surface_names}} and confirm the referrer/UTM shown.
References: {{site}}/labs/{{lab_id}} · {{site}}/best-practices
