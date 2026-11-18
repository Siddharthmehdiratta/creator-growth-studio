---
name: growth-plan
description: Growth map and 30-day content calendar for Instagram, YouTube or Twitch, built from the creator's own audit, with a calendar file for Google Calendar or any calendar app. Use when someone asks what to post and when, wants a posting schedule, content pillars, or how long it will take to reach a follower goal.
---

# Growth plan

## 1. Growth map
```
python3 ../growth-audit/growth.py map --followers <n> --goal <g> --months <m> --posts <export.csv> --per-week <p>
```
Say:
- what the goal needs (new followers a day, % growth a month)
- the verdict: realistic, ambitious, or very hard without a viral hit
- what the current pace gets them, and how many times better each post must do

Offer 3 honest targets: steady (about 15% a month), ambitious (about 35%), and theirs. These are rules of thumb; their own data decides within 4 weeks.

## 2. Pillars and mix
- Choose 3 to 5 content pillars that serve one audience.
- Weight the format mix towards what the audit's all-else-equal results favour.
- Set posting days and the best time slot from the audit. If there's no data, use the audience's evening in their time zone and test.

## 3. Calendar (30 days)
For each post: date, time, format, pillar, hook idea, the psychology principle it uses, the closing ask (send, save, follow, comment), and hashtag guidance (at most 5). Rotate the closing ask. Plan real moments, for example GTA 6 launches on 19 November 2026 for gaming accounts.

Write `growth/plan.json` like this, then make the calendar file:
```json
{"tz": "Asia/Kolkata", "items": [{"date": "2026-11-19", "time": "21:00", "title": "Reel: GTA 6 launch day", "notes": "Hook: ... | End with: send this to..."}]}
```
```
python3 ../growth-audit/growth.py calendar --plan growth/plan.json --out growth/plan.ics
```
Tell them to open plan.ics with Google Calendar or Outlook, and to schedule the posts themselves in Meta Business Suite or YouTube Studio (free and official). Never ask for their password.

## 4. Check-in
After 7 and 28 days, rerun `/growth-audit` and compare against the plan. Keep what worked; change one thing at a time.
