---
title: Why AI labs should send a referrer and a UTM tag
description: "For teams at AI labs: send your origin as the referrer and one documented utm_source, and every site can count and credit your visits, without exposing chats."
---

# Why outbound link attribution matters

## The ask in one paragraph

We'd like to work with AI labs on two signals that tell a website a visit came from their assistant: the assistant's origin as the HTTP referrer, and one documented `utm_source` value on outbound links. Both are cheap to add, they don't expose anything about the user or the conversation, and together they cover the web, mobile apps and desktop apps. This is a partnership. We track status so everyone can see progress, and we say thank you when it ships.

---

## Why it helps labs

- **Proof of value.** Every attributed visit is evidence that the assistant sends real people to real sites. Unattributed visits can't be counted, so they can't be credited either.
- **Better relationships with publishers and brands.** Sites that can see assistant traffic can measure it, report it and invest in it. Sites that can't are left to guess.
- **A fairer story about traffic.** The common claim that "AI takes traffic" is harder to answer when the traffic AI sends is invisible. Attribution lets the numbers speak.
- **A healthier ecosystem.** When sites can see which content gets cited and clicked, they can make more of it.
- **Fewer escalations.** A documented, stable signal means fewer support threads, fewer press stories about sudden drops, and fewer one-off questions from partners.

<div class="section-metadata"><div><div>Style</div><div>labs</div></div></div>

---

## Seeing it from both sides

<div class="columns audiences labs-first"><div><div>

### For the teams who build assistants

- Labs build chat experiences, not websites. Outbound links are a small part of a large surface that changes every week.
- The referrer is optional by design. [RFC 9110 §10.1.3](https://www.rfc-editor.org/rfc/rfc9110#section-10.1.3) lets clients leave it out, and privacy-minded defaults such as `noreferrer` are easy to reach for.
- Privacy matters. Sending the full conversation URL would be wrong. Sending the origin is not.
- Apps and webviews often can't send a referrer at all. A UTM tag is the only signal that survives there.
- UI cycles are fast. A refactor of a link component can remove both signals without anyone noticing.

</div><div>

### For the teams who run websites

- Visits without a referrer or tag land in **Direct**, next to bookmarks and typed URLs.
- Reports swing for no visible reason when a product update changes link behavior.
- Assistant traffic is undercounted in every report that reaches leadership.
- Analysts spend time on cleanup rules and guesswork instead of on the content people actually came for.

</div></div></div>

---

## What teams see today

Vendor studies, each from their own data, suggest a large share of assistant visits is not attributed. Treat these numbers as directional.

- One analytics vendor found that about 70% of AI visits in its data landed as Direct ([Loamly, updated February 2026](https://www.loamly.ai/blog/ai-traffic-attribution-crisis)).
- A study of one US ecommerce site in August 2026 found GA4 missed about 67% of Gemini visitors and about 95% of Claude visitors, while ChatGPT, which tags its links, was counted within about 3% ([WISLR, September 2026](https://www.wislr.com/articles/ai-assistant-traffic-ga4-blind-spots/)).

<div class="section-metadata"><div><div>Style</div><div>analysts</div></div></div>

---

### A shared lesson: October 8–16, 2026

Starting October 8, a growing share of ChatGPT links arrived without the `utm_source=chatgpt.com` tag and without a referrer, after a UI update. Many sites saw ChatGPT traffic drop and Direct rise, and spent days working out whether people had stopped clicking. By October 16 the tag was back on about 99% of answers with cited links ([Profound](https://www.tryprofound.com/blog/chatgpt-missing-utm-tags), [Search Engine Journal](https://www.searchenginejournal.com/chatgpt-traffic-drop-appears-to-be-a-tracking-problem/593157/)).

It was fixed quickly, and that is worth a thank-you. It also shows how easily link handling changes in a fast UI cycle. A regression test per link location and a short public changelog would have turned a week of guessing into a one-line note. Both are on our [best practices](/best-practices) list.
