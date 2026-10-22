---
title: Estimate hidden AI traffic from ChatGPT, Gemini, Claude, Copilot and Perplexity
description: "For SEO, GEO and analytics teams: count ChatGPT by its tag, multiply Gemini referrals by 2.1 to 2.5, add Perplexity's tag to its referrer, treat Claude and Copilot as floors."
template: guide
---

# Estimate your hidden AI traffic

Each assistant leaves different traces on the visits it sends: a referrer, a UTM tag, both or neither. So count them one assistant at a time. Start with what you can see, then add what we know is hidden. These steps reflect our tests as of October 2026; the [scorecard](/#scorecard) shows the current state.

<div class="toc"><div><div><ul><li><a href="#chatgpt-start-with-the-tag">ChatGPT</a></li><li><a href="#gemini-the-referrer-then-the-hidden-share">Gemini</a></li><li><a href="#claude-the-referrer-as-a-floor">Claude</a></li><li><a href="#copilot-the-referrer-now-the-tag-is-fading">Copilot</a></li><li><a href="#perplexity-the-referrer-plus-the-tag">Perplexity</a></li><li><a href="#set-up-your-reports-so-they-keep-counting">Set up your reports</a></li></ul></div></div></div>


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

Visits with a claude.ai referrer fell by about two thirds between June and September 2026. We can't tell yet whether Claude sent fewer visits or sent more of them without a referrer, through its citation chips or its apps.

<p><a href="/widgets/ai-traffic/ai-traffic.html?assistant=claude">/widgets/ai-traffic/ai-traffic.html?assistant=claude</a></p>


## Copilot: the referrer, now the tag is fading

Microsoft Copilot sends a referrer from each of its sites: `copilot.com` and `copilot.microsoft.com` for consumers, `copilot.cloud.microsoft` and `m365copilotapp.svc.cloud.microsoft` for Microsoft 365. Links from copilot.microsoft.com also carried `utm_source=copilot.com`, but Copilot is moving its users to copilot.com, whose links carry no tag.

1. Count visits with a referrer from any of the four Copilot sites.
2. Add visits tagged `utm_source=copilot.com` that arrived with no referrer. Match values that start with `copilot.com`: some links arrive as `utm_source=copilot.com?form=MG0AUO`.
3. Treat the total as a floor, especially on mobile. On sites measured by AEM Operational Telemetry in the 8 weeks to October 18, 2026, 93% of tagged mobile visits came with no referrer, so as the tag fades, those visits move to Direct.

The tag is fading fast: 85% of Copilot visits carried it in late April 2026, 17% by mid-October, as copilot.com (from mid-August) and Microsoft 365 Copilot took over from copilot.microsoft.com.

<p><a href="/widgets/ai-traffic/ai-traffic.html?assistant=copilot">/widgets/ai-traffic/ai-traffic.html?assistant=copilot</a></p>


## Perplexity: the referrer plus the tag

Perplexity on the web sends `https://www.perplexity.ai/` as the referrer, and no tag. Its apps do the opposite: they tag links `utm_source=perplexity` and send no referrer. On sites measured by AEM Operational Telemetry, August 24 to October 18, 2026, no visit carried both.

1. Count visits with a `perplexity.ai` referrer.
2. Add visits tagged `utm_source=perplexity`.

Skip the second step and you miss more than a third of Perplexity's visits, nearly all of them on mobile. That share has held steady since April 2026.

<p><a href="/widgets/ai-traffic/ai-traffic.html?assistant=perplexity">/widgets/ai-traffic/ai-traffic.html?assistant=perplexity</a></p>


## Set up your reports so they keep counting

1. Create one channel for AI assistants and put it above Referral and Organic Search, so it wins.
2. Match a visit when its source is `chatgpt.com`, `gemini.google.com`, `gemini`, `geminiforbusiness`, `claude.ai`, `copilot.com`, `copilot.microsoft.com`, `copilot.cloud.microsoft`, `m365copilotapp.svc.cloud.microsoft`, `perplexity.ai` or `perplexity`, whether that source came from the referrer or from `utm_source`.
3. Keep the Google exception from the ChatGPT steps: a `utm_source=chatgpt.com` visit with a Google referrer stays in Organic Search.
4. Check a link yourself now and then: ask an assistant to link to [attribution.now/t/check](/t/check) and see what arrives. Assistants change their links without notice.
