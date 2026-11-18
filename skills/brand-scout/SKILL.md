---
name: brand-scout
description: For brands and agencies - vet Instagram or YouTube influencers before paying them. Checks engagement against their tier, comment-to-like patterns, view reach, paid-post share and whether ads are labelled (ASCI and FTC), then judges audience fit with the brand. Use when someone asks if an influencer is real, worth the money, or a good fit, or wants a shortlist compared.
---

# Brand scout

Uses public numbers only: followers, following, and likes, comments and views on the last 12 posts, plus which posts are paid and labelled. No scraping and no logins. The brand or agency types the numbers in from the profile, or the creator shares them.

## Run
Write `influencer.json`:
```json
{"handle": "@creator", "followers": 48000, "following": 900,
 "posts": [{"likes": 1900, "comments": 64, "views": 21000, "paid": false, "disclosed": false}],
 "follower_history": [{"date": "2026-09-01", "followers": 41000}, {"date": "2026-10-01", "followers": 48000}]}
```
```
python3 ../growth-audit/growth.py check --profile influencer.json
```

## Explain
- **Signals, not verdicts.** Low engagement for the tier, very few comments per like, identical like counts on every post, sudden follower jumps, and following far more accounts than follow back are reasons to ask questions, not proof of fraud.
- **Paid share.** If more than half the feed is paid, followers may trust recommendations less. Compare likes on paid and organic posts.
- **Disclosure.** In India, ASCI requires an upfront ad label and brands share responsibility. Flag every unlabelled paid post.
- **Before paying:** ask for an Insights screenshot showing age, gender and top cities, and for results from past campaigns. Only the creator can see their real audience.

## Fit
Score fit from 0 to 10 on audience match (age, city, language), content match, values and tone, and whether they've promoted competitors. Then suggest a test: a small paid post with a tracked link or code before a bigger deal.

## Shortlist
For several creators, make a table: handle, tier, engagement, flags, paid share, labels OK, fit score, and recommended next step.
