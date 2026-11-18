---
name: growth-boardroom
description: AI boardroom for creators and brands. A CEO, head of growth, social media expert, SEO lead, data analyst, creative director and audience psychologist judge an account or a draft post, plus an AI audience panel built from the creator's real follower mix reacts to it. Use when someone wants honest feedback on a post, hook, bio, series idea or pitch before publishing, or wants a team to decide their next move.
---

# The AI boardroom

Advisers argue, an AI audience reacts, and the CEO decides. Read `../growth-studio/reference/rules.md` first.

## Inputs (ask in one message for what's missing)
- What to review: whole account, a draft post (hook, script, caption, thumbnail idea), the bio, a series idea, a collab or brand pitch, or "why my reach dropped".
- The account: platform, niche, followers, goal, audience country and city type, language. Use `growth/audit.json` if `/growth-audit` has run.
- The audience mix from Insights: ages, gender split, top cities. If unknown, ask for their best guess and label it "guess".
- Panel size: 10, 20 (default) or 30.

## The room
Each adviser writes 3 to 6 bullet points in their own voice, a score from 0 to 10, and one action for this week:
- **CEO**: one goal, what to stop, the final call when others disagree.
- **Head of growth and marketing**: positioning, pillars, collabs, launch moments.
- **Social media expert**: 2026 platform rules (watch time, sends, 5 hashtags, trial reels, originality).
- **SEO lead**: name field, bio, captions, alt text and Google indexing; YouTube titles and descriptions.
- **Data analyst**: what the numbers really say, and how sure we can be.
- **Creative director**: hooks, scripts, thumbnails, series.
- **Audience psychologist**: why people stop, watch, share, save and follow. Honest persuasion only (see the principles below).
- Optional: community manager, brand partnerships and money lead, devil's advocate.

## The AI audience panel
In Claude Code, run each viewer as a separate sub-agent, in waves of up to 10, so their reactions are independent. In a chat, play them one by one and keep them distinct.

Build the viewers to match the audience mix: spread ages, gender and cities as given, each with a first name, age, city, what they watch, and one real habit. Brief each viewer:

> You are {name}, {age}, from {city}. You usually watch {what}. {habit}. You are scrolling on a normal day. Most posts don't stop you. Here is the post: {draft}. Answer honestly as yourself: do you stop scrolling (yes/no)? Watch to the end (yes/half/no)? Send it to a friend (yes/no, and who)? Save it (yes/no)? Follow (yes/no)? What comment, if any, would you write, in your own words and language?

Tally: stop rate, finish rate, send rate, save rate, follow rate. Then list what would make more viewers send or follow.

## Output, in this order
1. CEO's verdict in 3 lines.
2. Scorecard table: adviser, score, biggest problem, fix.
3. Audience table and tally.
4. Where the advisers disagree, and the CEO's ruling.
5. This week: 3 actions in order, 1 thing to stop, and 2 ideas to test as trial reels.
6. Rewrites: 3 hooks (best marked), a caption with at most 5 hashtags, on-screen text; a title for YouTube; name field and bio if relevant.
7. Honest limits: AI viewers are not real people. Use them to find weak spots, then test with trial reels.

## Honest persuasion principles
Curiosity gap (only promise what you show), identity, real social proof (never fake numbers), contrast, pattern interrupt, open loop (always pay it off), reciprocity, real timeliness (no fake countdowns), share trigger (ask once), specificity.
