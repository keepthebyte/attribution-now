---
title: Estimate hidden AI traffic from ChatGPT, Gemini and Claude
description: "For SEO, GEO and analytics teams: count ChatGPT by its utm_source tag, multiply Gemini referrals by 2.1 to 2.5, and treat Claude's referrer as a floor."
template: guide
---

# Estimate your hidden AI traffic

Each assistant leaves different traces on the visits it sends: a referrer, a UTM tag, both or neither. So count them one assistant at a time. Start with what you can see, then add what we know is hidden. These steps reflect our tests as of October 2026; the [scorecard](/#scorecard) shows the current state.


## ChatGPT: start with the tag

ChatGPT adds `utm_source=chatgpt.com` to the links it sends, and OpenAI documents that value. On most surfaces it sends no referrer, so the tag is your main signal.

1. Count visits with `utm_source=chatgpt.com`.
2. Remove the ones whose referrer is a Google domain. Google lists some pages with ChatGPT's tag still in the URL, so those visits came from search, not from ChatGPT.
3. Add visits with a `chatgpt.com` referrer and no tag. There are few, but they are ChatGPT's.

Count a visit with both the tag and the referrer once.

Why the tag first: over the past year, tagged ChatGPT visits more than quadrupled on sites measured by AEM Operational Telemetry, while visits with a chatgpt.com referrer fell by 95%. By October 2026, only 0.7% of tagged visits still carried the referrer.

<p><a href="/widgets/chatgpt-utm/chatgpt-utm.html">/widgets/chatgpt-utm/chatgpt-utm.html</a></p>

So expect little of ChatGPT's traffic in Direct. OpenAI tags most of the links ChatGPT generates, so unlike Gemini, there is no hidden share to add on top.


## Gemini: the referrer, then the hidden share

Gemini on the web sends `https://gemini.google.com/` as the referrer, and no tag. Its apps send neither, so those visits land in Direct.

1. Count visits with a `gemini.google.com` referrer.
2. Multiply by 2.1 to 2.5.
   - 2.1 is measured. From Sep 18 to 28, 2026, Gemini tagged its links: for every 100 visits with the referrer, 108 more arrived with only the tag. The chart below shows that window.
   - 2.5 adds an estimate for the links that weren't tagged and arrived with no referrer either.

<p><a href="/widgets/gemini-utm/gemini-utm.html">/widgets/gemini-utm/gemini-utm.html</a></p>

Use 2.1 when you need a number nobody can dispute, and 2.5 as your best estimate. Workspace accounts tagged links `utm_source=geminiforbusiness` in the same window.

## Claude: the referrer, as a floor

Links in Claude's answers on claude.ai send `https://claude.ai/` as the referrer. Its citation chips and its apps send no referrer, and Claude adds no tag.

1. Count visits with a `claude.ai` referrer.
2. Treat that number as a floor. Claude has never tagged its links, so we have no measured share for its hidden visits yet. We'll add one here when we can measure it.


## Set up your reports so they keep counting

1. Create one channel for AI assistants and put it above Referral and Organic Search, so it wins.
2. Match a visit when its source is `chatgpt.com`, `gemini.google.com`, `gemini`, `geminiforbusiness` or `claude.ai`, whether that source came from the referrer or from `utm_source`.
3. Keep the Google exception from the ChatGPT steps: a `utm_source=chatgpt.com` visit with a Google referrer stays in Organic Search.
4. Check a link yourself now and then: ask an assistant to link to [attribution.now/t/check](/t/check) and see what arrives. Assistants change their links without notice.
