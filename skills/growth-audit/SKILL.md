---
name: growth-audit
description: Post-by-post audit of an Instagram, YouTube or Twitch account from the creator's own export (Meta Business Suite CSV, YouTube Studio CSV, or typed numbers). Use when someone asks why a post did well or badly, which formats, hooks, topics or times work, or for a full content report.
---

# Growth audit

Reads the creator's own export and tells them, post by post, what worked and why. Standard library Python, no network.

## Run
```
python3 growth.py audit --posts <export.csv> --followers <followers now> --out growth
```
It writes `growth/audit.md` (to read) and `growth/audit.json` (for other skills).

Columns it understands (any order, case doesn't matter): Publish time, Post type, Description or Caption, Reach, Views, Likes, Comments, Shares, Saves, Follows, Duration (sec), Permalink, plus optional **Hook** and **Topic** columns the creator fills in. YouTube Studio exports work too (Views stand in for Reach, Subscribers for Follows).

## What it computes
- Per 1,000 people reached: sends, follows, likes, saves, comments. These follow Instagram's own stated signals (see `../growth-studio/reference/rules.md`).
- A **score** per post: 100 = the account's typical post. It is half how far the post travelled, half how people reacted.
- **All else equal**: a small ridge regression of reach (and of sends, and follows) on format, time slot, reel length, hook, topic and common hashtags. Each result names its comparison ("vs reels") and says strong, medium or weak evidence.
- Simple group averages, with groups under 3 posts marked thin.
- The 5 best and 5 weakest posts, each with plain reasons.

## How to explain it
1. Start with the all-else-equal findings. Translate them: "Photos reach 53% fewer people than reels, comparing like with like."
2. Warn when simple averages disagree with all-else-equal results, and explain why (mixed formats and topics).
3. For each best and weakest post, say what to repeat or avoid.
4. End with one test per finding: change one thing for 2 weeks, then rerun the audit.
5. Never claim cause from a pattern. Say "in your posts, X went with Y".
