---
title: attribution.now
description: How ChatGPT, Gemini and Claude attribute the visits they send, for the analysts who measure them and the labs who can fix it.
---

# AI assistants send you visitors. Most of those visits show up as *"Direct"*.

<div class="columns audiences"><div><div>
<p>For SEO, GEO and analytics teams</p>
<h2 id="your-ai-traffic-is-bigger-than-your-reports-show">Your AI traffic is bigger than your reports show</h2>
<p>ChatGPT, Gemini and Claude send people to your site every day. Many of those visits arrive with no referrer and no UTM tag, so your analytics file them under Direct, next to bookmarks and typed URLs. We test each assistant on web, mobile and desktop, so you know which of its visits you can see and which you can't.</p>
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

## Check a link yourself

Ask any assistant to link to [attribution.now/t/check](/t/check), then open the link. The page shows the referrer and UTM tag it received.

<div class="section-metadata"><div><div>Style</div><div>card</div></div></div>
