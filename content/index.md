---
title: attribution.now
description: How ChatGPT, Gemini and Claude attribute the visits they send, for the analysts who measure them and the labs who can fix it.
---

<h1 id="ai-assistants-send-you-visitors">AI assistants send you visitors. For Gemini, 52% of those visits show up as <em>"Direct"</em>.<sup><a href="#how-we-know-gemini-tagged-its-links-for-11-days">1</a></sup></h1>

<div class="columns audiences"><div><div>
<p>For SEO, GEO and analytics teams</p>
<h2 id="your-ai-traffic-is-bigger-than-your-reports-show">Your AI traffic is bigger than your reports show</h2>
<p>ChatGPT, Gemini and Claude send people to your site every day. Many of those visits arrive with no referrer and no UTM tag, so your analytics file them under Direct. Find out how much AI traffic is hiding there, and set up your reports to catch every AI visit they can.</p>
<p><strong><a href="/reclaim-direct-traffic">Estimate your hidden AI traffic</a></strong></p>
<p><em><a href="#scorecard">See what each assistant sends</a></em></p>
</div><div>
<p>For teams at AI labs</p>
<h2 id="small-fixes-so-every-site-can-see-the-visits-you-send">Small fixes, so every site can see the visits you send</h2>
<p>When a link from your assistant arrives with no referrer or tag, the site can't give you credit. The fixes are small: send your origin as the referrer, and add one documented <code>utm_source</code> value. Each lab page shows what already works, what to fix next, and a prompt your team can paste into a coding assistant or a ticket.</p>
<p>See your status: <a href="/labs/openai-chatgpt">ChatGPT</a> · <a href="/labs/google-gemini">Gemini</a> · <a href="/labs/anthropic-claude">Claude</a></p>
<p><a href="/why">Why it matters</a> · <a href="/best-practices">Best practices</a></p>
</div></div></div>

---

## Scorecard

What arrives with a visit when someone clicks a link in each assistant: the assistant as the referrer, and a UTM tag.

{{block:scorecard-fragment}}

See [how we test](/tests).

---

<h2 id="how-we-know-gemini-tagged-its-links-for-11-days">How we know: Gemini tagged its links for 11 days</h2>

From Sep 18 to 28, 2026, Gemini added `utm_source=gemini` to the links people clicked. Visits with a gemini.google.com referrer held steady. Next to them, a second group appeared: tagged visits with no referrer at all, 52% of Gemini's visits in those 11 days. Without the tag, analytics count them as Direct. On Sep 29 the tag stopped, and they went back to looking like Direct traffic.

<p><a href="/widgets/gemini-utm/gemini-utm.html">/widgets/gemini-utm/gemini-utm.html</a></p>

- **76% were on mobile**, against 6% of referred Gemini visits. The referrer gets lost mainly in the apps.
- **59% clicked on the page**, against 58% of Google Search visitors. These are people, not bots.
- **84% landed on deep pages** that nobody types in.

The 52% is a floor: Gemini links that never carried the tag don't show up here at all.

---

## Check a link yourself

Ask any assistant to link to [attribution.now/t/check](/t/check), then open the link. The page shows the referrer and UTM tag it received.

<div class="section-metadata"><div><div>Style</div><div>card</div></div></div>
