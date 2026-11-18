# Creator Growth Studio

**See what's holding your Instagram back, and fix it.** A free growth studio for creators, streamers, brands and agencies. It covers Instagram first, then YouTube and Twitch.

### [Open the studio](https://siddharthmehdiratta.github.io/creator-growth-studio/) · [How to use it](https://siddharthmehdiratta.github.io/creator-growth-studio/guide.html)

No install and no login. Your numbers stay in your browser.

## What you get

| | |
|---|---|
| **Diagnosis** | Every post scored against your own typical post. It shows what really moves your reach *all else equal* (format, time, hook, topic, length), your 5 best and 5 weakest posts and why, plus a profile check. |
| **Growth signals** | Live meters for sends, follows, likes, saves and comments per reach. These follow the signals Instagram says matter most. |
| **Growth map** | What your goal really takes, what your current pace gets you, 3 honest targets, and the levers that close the gap. |
| **30-day plan** | A calendar built from what works for you, with a hook idea, psychology principle, closing ask and hashtags (5 max) for every post. It downloads to Google Calendar. |
| **AI boardroom** | A CEO, head of growth, social media expert, SEO lead, data analyst, creative director and audience psychologist judge your account or your next post. An **AI audience** built from your real follower mix reacts before you publish. |
| **For brands** | An influencer check: engagement against their tier, bought-like patterns, paid-post share, and missing ad labels (ASCI and FTC). |

## Built to be honest
- It reads only exports you download yourself (Meta Business Suite, YouTube Studio) or numbers you type. **No scraping, no bots, no passwords.**
- Instagram never shows anyone their followers' income, or exactly who each follower is. The studio says so. Where it estimates spending power from city type and age, it labels the result "estimate".
- Patterns are not proof. Every finding says how strong the evidence is and names what it's compared with.
- Platform rules are dated and sourced: the 5-hashtag cap, trial reels, Google indexing, YouTube's 2027 Partner Program change and Twitch's lower Affiliate bar. See [skills/growth-studio/reference/rules.md](skills/growth-studio/reference/rules.md).

## The full way: Claude Code skills
Install in Claude Code: paste `https://github.com/Siddharthmehdiratta/creator-growth-studio` and say "install this skill pack". Then type:

| Command | What it does |
|---|---|
| `/growth-studio` | The whole studio, start to finish |
| `/growth-audit` | Post-by-post audit from your export |
| `/growth-plan` | Growth map, 30-day calendar and a calendar file |
| `/growth-boardroom` | Advisers plus an AI audience panel (one sub-agent per viewer) |
| `/growth-write` | Hooks, scripts, captions, titles and bios, in English, Hinglish or Hindi |
| `/growth-seo` | Be found on Instagram search, Google and YouTube |
| `/growth-money` | Monetization readiness, a rate card from your own reach, and a brand pitch |
| `/brand-scout` | Vet influencers before paying them |

The engine is `skills/growth-audit/growth.py`: standard-library Python 3.8+, nothing to install. The website runs the same maths in `docs/engine.js`, and a test checks that both give identical numbers.

## Tests
```
python3 -m unittest discover -s tests
node tests/js/parity.js     # browser engine = Python engine
node tests/js/app.js        # whole website, headless (needs jsdom)
```
The sample account in `docs/data/` is **fictional**. It was generated with known patterns (GTA 6 topics travel further, night posts win, face-to-camera hooks get about twice the sends), and the tests check that the audit finds them.

Made by Siddharth Mehdiratta. MIT licence. Sister project: [Founder Plus](https://github.com/Siddharthmehdiratta/founder-skill-plus), which tests a business idea on AI customers.
