# Creator Growth Studio

**Type your Instagram username. Get a star rating for every post, the reason it worked or flopped, and what to post next.** Free, for any account from 1 follower to 1 million. Instagram first, then YouTube and Twitch.

### [Start free](https://siddharthmehdiratta.github.io/creator-growth-studio/start.html) · [Features](https://siddharthmehdiratta.github.io/creator-growth-studio/features.html) · [Growth guide 2026](https://siddharthmehdiratta.github.io/creator-growth-studio/growth-guide.html) · [FAQ](https://siddharthmehdiratta.github.io/creator-growth-studio/faq.html)

No forms, no install and no password. The report is worked out in your browser.

## Pick your platform, then how to bring your numbers
| Way | What it reads |
|---|---|
| **Type a username or paste a profile link** | Any public Creator or Business account: followers, and likes, comments and Reel views for the last 50 posts |
| **Connect Instagram** (official login) | Your own account: also reach, views, average watch time, skip rate, sends, saves, follows, profile visits and comments |
| **Upload an export** | A CSV from Meta Business Suite. Works with no setup at all |
| **YouTube** | Upload the Table data.csv from YouTube Studio. Shorts and videos are rated separately |
| **Twitch** | Type in your last few streams (viewers, hours, new followers, chat) |

Both Instagram options use Meta's official API through a small free helper that stores nothing. To switch them on for your own copy, follow [CONNECT-INSTAGRAM.md](CONNECT-INSTAGRAM.md).

## What you get
| | |
|---|---|
| **Every post, rated** | 1 to 5 stars against your own typical post. Each post shows views, reach, watch time, skips, likes, comments, sends, saves, follows and profile visits next to your usual, then why it worked, what held it back and what to do next time. |
| **What changes your results** | What really moves reach, sends, watch time and follows *all else equal* (format, time, hook, topic, length, hashtags). Only findings that pass a strict test are shown. |
| **Comments** | Sorted into questions, requests, praise, criticism and spam, in English and Hinglish. They're read automatically when you connect. |
| **What to post next** | Ideas built from your own best posts, your niche (detected from your captions) and proven hook angles. |
| **Plan** | What your follower goal really takes, and a 30-day calendar that downloads to Google Calendar. |
| **AI boardroom** | A CEO, head of growth, social media expert, SEO lead, data analyst, creative director and audience psychologist review your account in Claude. An AI audience reacts like real viewers. |
| **Audience health check** | What a brand sees before paying: engagement against accounts of the same size, comments per like, and patterns that suggest bought likes. Type any creator's username to check them. |

## Built to be honest
- It reads only Instagram's official API or exports you download yourself. **No scraping, no bots, no passwords.** Personal and private accounts can't be read, by Instagram's rules.
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

## Website pages
The site pages are built by `python3 tools/pages.py` from one shared header, footer and icon set. The app itself is `docs/start.html`.

## Tests
```
python3 -m unittest discover -s tests
node tests/js/parity.js     # browser engine = Python engine
node tests/js/worker.mjs    # Instagram connector, with a fake Instagram
python3 tests/e2e/report_flow.py http://localhost:8765/   # whole site in Chrome, desktop and phone
python3 tests/e2e/connect_flow.py http://localhost:8765/  # username lookup and Connect, with a fake connector
```
The sample account in `docs/data/` is **fictional**. It was generated with known patterns (GTA 6 topics travel further, night posts win, face-to-camera hooks get about twice the sends), and the tests check that the audit finds them.

Made by Siddharth Mehdiratta. MIT licence. Sister project: [Founder Plus](https://github.com/Siddharthmehdiratta/founder-skill-plus), which tests a business idea on AI customers.
