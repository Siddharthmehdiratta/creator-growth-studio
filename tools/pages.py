"""Builds the Creator Growth Studio website pages (docs/*.html) from one shared header, footer and icon set.
Run: python3 tools/pages.py   (start.html, the app itself, is kept by hand; this script only refreshes its header and footer.)"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
SPRITE = (ROOT / "tools" / "sprite.html").read_text()
REPO = "https://github.com/Siddharthmehdiratta/creator-growth-studio"
ASK = REPO + "/discussions/new?category=q-a"
BUG = REPO + "/issues/new"
FONT_PRELOAD = '<link rel="preload" href="fonts/plus-jakarta-sans-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>\n<link rel="preload" href="fonts/plus-jakarta-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>'
FAVICON = "<link rel=\"icon\" href=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='9' fill='%236C47FF'/%3E%3Cpath d='M9 21v-3M14 21v-7M19 21v-10M24 21V8' stroke='%23fff' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E\">"
NAV = [("features.html", "Features"), ("how-it-works.html", "How it works"), ("growth-guide.html", "Growth guide"), ("faq.html", "FAQ")]


def head(title, desc, dark=False):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta name="theme-color" content="{'#0E0B26' if dark else '#ffffff'}">
{FONT_PRELOAD}
{FAVICON}
<link rel="stylesheet" href="style.css">
</head>
<body>
"""


def header(active="", dark=False):
    links = "".join(f'<a href="{h}"{" aria-current=\"page\"" if h == active else ""}>{t}</a>' for h, t in NAV)
    return f"""{SPRITE}
<a class="skip" href="#main">Skip to content</a>
<header class="top{' top-dark' if dark else ''}">
  <div class="wrap">
    <a class="logo" href="./"><svg aria-hidden="true"><use href="#i-logo"/></svg>Creator Growth Studio</a>
    <nav aria-label="Main">{links}</nav>
    <div class="right">
      <a class="btn {'ghost-light' if dark else 'ghost'} sm gh" href="{REPO}">GitHub</a>
      <a class="btn primary sm" href="start.html">Start free</a>
      <button class="menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mnav"><span></span><span></span><span></span></button>
    </div>
  </div>
  <nav class="mnav" id="mnav" aria-label="Mobile" hidden>{links}<a href="start.html" class="btn primary">Start free</a></nav>
</header>
"""


FOOT = f"""<footer class="site-foot">
  <div class="wrap">
    <div class="ft-brand"><a class="logo" href="./"><svg aria-hidden="true"><use href="#i-logo"/></svg>Creator Growth Studio</a><p>Free and open source (MIT), made by Siddharth Mehdiratta. Uses Instagram's official API, never sees your password, and stores nothing. Platform rules checked on 19 November 2026.</p></div>
    <div><b>Product</b><a href="start.html">Start free</a><a href="features.html">Features</a><a href="how-it-works.html">How it works</a><a href="sample-boardroom.html">Sample AI boardroom</a></div>
    <div><b>Learn</b><a href="growth-guide.html">Growth guide 2026</a><a href="growth-guide.html#instagram">Instagram</a><a href="growth-guide.html#youtube">YouTube</a><a href="growth-guide.html#twitch">Twitch</a></div>
    <div><b>Help</b><a href="faq.html">FAQ</a><a href="{ASK}">Ask a question</a><a href="{BUG}">Report a problem</a><a href="{REPO}">GitHub</a><a href="https://siddharthmehdiratta.github.io/founder-skill-plus/">Founder Plus</a></div>
  </div>
</footer>
<script src="site.js"></script>
</body>
</html>
"""


def page_hero(kicker, title, lead, crumbs=None):
    c = f'<p class="crumbs"><a href="./">Home</a><span>/</span>{crumbs}</p>' if crumbs else ""
    return f"""<section class="page-hero"><div class="wrap">{c}<span class="kicker">{kicker}</span><h1>{title}</h1><p class="lead">{lead}</p></div></section>"""


def cta(title="Ready to see your own report?", text="Pick Instagram, YouTube or Twitch. It takes under a minute and it's free."):
    return f"""<section class="cta-band"><div class="wrap"><div><h2>{title}</h2><p>{text}</p></div><a class="btn light lg" href="start.html">Start free</a></div></section>"""


def write(name, title, desc, body, active="", dark=False):
    html = head(title, desc, dark) + header(active, dark) + f'<main id="main">\n{body}\n</main>\n' + FOOT
    (DOCS / name).write_text(html)
    print("wrote", name, len(html))


# ---------------------------------------------------------------- home
PLATFORMS = """
<div class="pick" role="group" aria-label="Choose a platform">
  <a class="pick-card ig" href="start.html?p=instagram"><span class="pc-ic"><svg aria-hidden="true"><use href="#i-ig"/></svg></span><span><b>Instagram</b><small>Reels, posts and carousels</small></span><svg class="go" aria-hidden="true"><use href="#i-next"/></svg></a>
  <a class="pick-card yt" href="start.html?p=youtube"><span class="pc-ic"><svg aria-hidden="true"><use href="#i-play"/></svg></span><span><b>YouTube</b><small>Videos and Shorts</small></span><svg class="go" aria-hidden="true"><use href="#i-next"/></svg></a>
  <a class="pick-card tw" href="start.html?p=twitch"><span class="pc-ic"><svg aria-hidden="true"><use href="#i-live"/></svg></span><span><b>Twitch</b><small>Live streams</small></span><svg class="go" aria-hidden="true"><use href="#i-next"/></svg></a>
</div>"""

TILES = "".join(f'<div class="tile {k}"><svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="{d}"/></svg><span class="bdg"><i>★</i>{s}</span></div>'
                for k, d, s in [("k1", "M8 5v14l11-7z", "3"), ("k2", "M7 4h11a2 2 0 0 1 2 2v11M4 8h11a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z", "4"), ("k6", "M8 5v14l11-7z", "4"),
                                ("k5", "M7 4h11a2 2 0 0 1 2 2v11M4 8h11a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z", "3.5"), ("k3", "M8 5v14l11-7z", "2.5"), ("k4", "M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4", "1.5"),
                                ("k1", "M8 5v14l11-7z", "5"), ("k2", "M7 4h11a2 2 0 0 1 2 2v11M4 8h11a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z", "2.5"), ("k6", "M8 5v14l11-7z", "5")])

HOME = f"""
<section class="hero">
  <div class="glow g1" aria-hidden="true"></div><div class="glow g2" aria-hidden="true"></div>
  <div class="wrap">
    <div class="hero-copy">
      <span class="eyebrow-pill"><span class="dot"></span>Free for creators, built on official data</span>
      <h1>See which posts grow your account, and why.</h1>
      <p class="lead">Every post gets a star rating, a plain-English reason it worked or flopped, and a clear idea of what to post next. No forms to fill in.</p>
      <p class="pick-q">What do you want to grow?</p>
      {PLATFORMS}
      <p class="hero-alt"><a href="start.html?sample=1">Or see a sample report first</a></p>
    </div>
    <div class="visual preview" aria-label="Example report from a fictional sample account">
      <div class="phone" aria-hidden="true">
        <div class="ph-head"><span class="ph-av"><span>LR</span></span><div><b>lowping.rohan</b><span>2,282 followers</span></div></div>
        <div class="ph-stats"><div><b>40</b><span>posts</span></div><div><b>3.5</b><span>avg stars</span></div><div><b>Growing</b><span>level</span></div></div>
        <div class="ph-grid">{TILES}</div>
      </div>
      <div class="frame">
        <div class="bar"><b>Post report</b><span>20 Aug 2026</span><span class="pill good">Top post</span></div>
        <div class="body">
          <div style="display:flex;align-items:center;gap:10px"><span class="stars-txt" aria-label="5 out of 5 stars">★★★★★</span><span class="score">Score 255</span></div>
          <p class="cap">GTA 6 price in India</p>
          <div class="mrow"><span>Reach</span><span class="v">5,758<span class="ratio up">4.2x</span></span></div>
          <div class="mrow"><span>Average watch time</span><span class="v">16.9 s<span class="ratio flat">1.1x</span></span></div>
          <div class="mrow"><span>Sends per 1,000 reached</span><span class="v">33<span class="ratio up">3.1x</span></span></div>
          <div class="mrow"><span>Follows per 1,000 reached</span><span class="v">7<span class="ratio up">2.3x</span></span></div>
        </div>
      </div>
      <div class="chip chip-a" aria-hidden="true"><span class="ic"><svg><use href="#i-clock"/></svg></span><span><small>Best time to post</small><b>Afternoon, 12 to 5 pm</b></span></div>
      <div class="chip chip-b" aria-hidden="true"><span class="ic"><svg><use href="#i-upar"/></svg></span><span><small>What travels further</small><b>"Face to camera" hooks: +128% reach</b></span></div>
      <p class="note"><b>Example:</b> a fictional sample account, analysed by the real tool.</p>
    </div>
  </div>
</section>

<section class="works"><div class="wrap"><span>Works with</span><ul><li><svg aria-hidden="true"><use href="#i-ig"/></svg>Instagram</li><li><svg aria-hidden="true"><use href="#i-play"/></svg>YouTube</li><li><svg aria-hidden="true"><use href="#i-live"/></svg>Twitch</li><li><svg aria-hidden="true"><use href="#i-spark"/></svg>Reviewed by Claude</li></ul></div></section>

<section class="section">
  <div class="wrap">
    <div class="head center"><span class="kicker">Everything in one report</span><h2>A full growth team, free</h2><p>Each number is compared with your own typical post, so the advice fits an account of 80 followers or 80,000.</p></div>
    <div class="cards6">
      <a class="c6" href="features.html#stars"><span class="f-ic violet"><svg aria-hidden="true"><use href="#i-star"/></svg></span><h3>Every post rated</h3><p>1 to 5 stars from watch time, sends, follows, likes, saves and comments.</p><span class="more">See how</span></a>
      <a class="c6" href="features.html#why"><span class="f-ic pink"><svg aria-hidden="true"><use href="#i-chart"/></svg></span><h3>Why it worked</h3><p>Each number next to your usual, with a plain reason and what to do next time.</p><span class="more">See how</span></a>
      <a class="c6" href="features.html#next"><span class="f-ic orange"><svg aria-hidden="true"><use href="#i-bolt"/></svg></span><h3>What to post next</h3><p>Ideas from your own best posts, with the format, day and time that work for you.</p><span class="more">See how</span></a>
      <a class="c6" href="features.html#plan"><span class="f-ic teal"><svg aria-hidden="true"><use href="#i-cal"/></svg></span><h3>A 30-day plan</h3><p>A calendar of your best days that drops straight into Google Calendar.</p><span class="more">See how</span></a>
      <a class="c6" href="features.html#comments"><span class="f-ic sky"><svg aria-hidden="true"><use href="#i-msg"/></svg></span><h3>Comments sorted</h3><p>Questions, requests, praise, criticism and spam, in English and Hinglish.</p><span class="more">See how</span></a>
      <a class="c6" href="features.html#board"><span class="f-ic violet"><svg aria-hidden="true"><use href="#i-users"/></svg></span><h3>AI boardroom</h3><p>A CEO, growth, social, SEO, data and creative leads review your account in Claude.</p><span class="more">See how</span></a>
    </div>
  </div>
</section>

<section class="section alt">
  <div class="wrap">
    <div class="head center"><span class="kicker">Three platforms</span><h2>Bring the numbers you already have</h2><p>Pick your platform, then the easiest way in. You can always add more detail later.</p></div>
    <div class="plat3">
      <div class="pl"><span class="pc-ic ig"><svg aria-hidden="true"><use href="#i-ig"/></svg></span><h3>Instagram</h3><ul class="ticks"><li>Type a username for public numbers</li><li>Connect for reach, watch time and skips</li><li>Or upload a Meta Business Suite export</li></ul><a class="btn primary" href="start.html?p=instagram">Start with Instagram</a></div>
      <div class="pl"><span class="pc-ic yt"><svg aria-hidden="true"><use href="#i-play"/></svg></span><h3>YouTube</h3><ul class="ticks"><li>Upload your YouTube Studio export</li><li>Videos and Shorts rated separately</li><li>Watch time, click rate and subscribers</li></ul><a class="btn primary" href="start.html?p=youtube">Start with YouTube</a></div>
      <div class="pl"><span class="pc-ic tw"><svg aria-hidden="true"><use href="#i-live"/></svg></span><h3>Twitch</h3><ul class="ticks"><li>Type in your last few streams</li><li>Viewers, hours, follows and chat</li><li>Best days, times and stream length</li></ul><a class="btn primary" href="start.html?p=twitch">Start with Twitch</a></div>
    </div>
  </div>
</section>

<section class="facts-band">
  <div class="wrap">
    <div class="fb-head"><span class="kicker light">Built on the rules that matter in 2026</span><h2>Advice grounded in what the platforms actually reward</h2></div>
    <div class="fb-grid">
      <div><b>3 signals</b><p>Watch time, sends per reach and likes per reach are what Instagram's head names as most important. Your stars weigh them most.</p><a href="https://buffer.com/resources/instagram-algorithms/" target="_blank" rel="noopener">Source: Buffer</a></div>
      <div><b>3 to 5 posts</b><p>A week is the sweet spot in Buffer's study of 2 million Instagram posts: it more than doubled follower growth compared with 1 to 2.</p><a href="https://buffer.com/resources/how-often-to-post-on-instagram/" target="_blank" rel="noopener">Source: Buffer</a></div>
      <div><b>5 hashtags</b><p>Instagram caps hashtags at 5 per post since December 2025. Your plan never suggests more.</p><a href="https://www.businesstoday.in/technology/news/story/no-more-hashtag-stuffing-instagram-limits-hashtag-usage-to-just-5-per-reel-and-post-507444-2025-12-19" target="_blank" rel="noopener">Source: Business Today</a></div>
    </div>
    <p class="fb-more"><a href="growth-guide.html">Read the full 2026 growth guide</a></p>
  </div>
</section>

<section class="section" id="levels">
  <div class="wrap">
    <div class="head center"><span class="kicker">For every size</span><h2>Advice that fits where you are</h2><p>A creator with 80 followers needs different advice from one with 80,000. Your report adjusts to your level.</p></div>
    <div class="levels">
      <div class="lv l1"><b>Starter</b><span>Under 1,000</span><p>Find one niche and a first second that stops the scroll.</p></div>
      <div class="lv l2"><b>Growing</b><span>1,000 to 10,000</span><p>Double down on your two best formats and start series.</p></div>
      <div class="lv l3"><b>Established</b><span>10,000 to 100,000</span><p>Test new formats with trial reels and start brand deals.</p></div>
      <div class="lv l4"><b>Pro</b><span>100,000 and over</span><p>Build franchises, a team and more than one income stream.</p></div>
      <div class="lv l5"><b>Brands</b><span>Any size</span><p>Type a creator's username to check their engagement before you pay.</p></div>
    </div>
  </div>
</section>

<section class="section alt">
  <div class="wrap faq-wrap">
    <div class="head"><span class="kicker">Questions</span><h2>Good to know</h2><p>More answers on the <a href="faq.html">FAQ page</a>, or <a href="{ASK}">ask your own question</a>.</p></div>
    <div class="faq">
      <details><summary>Is it really free?</summary><p>Yes. It's open source under the MIT licence, and you can read every line on GitHub. There's nothing to buy and no account to create.</p></details>
      <details><summary>Do I need to give my password?</summary><p>No. Typing a username reads public numbers. Connect Instagram uses Instagram's own login page, so the tool never sees your password.</p></details>
      <details><summary>Does it work with a small account?</summary><p>Yes. Ratings compare each post with your own typical post, so they work from your first few posts. With fewer than 15 posts, the report says its patterns are early hints, not proof.</p></details>
      <details><summary>Which accounts can it read?</summary><p>Instagram Creator and Business accounts. Switching from a personal account is free and takes a minute in the Instagram app. YouTube and Twitch work from your own numbers.</p></details>
    </div>
  </div>
</section>
{cta()}
"""

# ---------------------------------------------------------------- features
FEATURES = page_hero("Features", "Everything your report tells you", "One report that does the work of a growth team: it rates every post, explains why, tells you what to post next and plans your month.", "Features") + """
<nav class="subnav" aria-label="On this page"><div class="wrap"><a href="#stars">Star ratings</a><a href="#why">Why it worked</a><a href="#next">What to post</a><a href="#plan">30-day plan</a><a href="#comments">Comments</a><a href="#board">AI boardroom</a><a href="#health">Audience health</a></div></nav>
<section class="section"><div class="wrap">
  <div class="feature" id="stars">
    <div class="f-copy"><span class="f-ic violet"><svg aria-hidden="true"><use href="#i-star"/></svg></span><h2 class="h3">A star rating for every post</h2>
      <p>One to five stars, based on the signals Instagram says matter most: watch time, sends and likes per person reached, plus follows, saves and comments.</p>
      <ul class="ticks"><li>3.5 stars is a normal post for you</li><li>5 stars means about twice as good as usual</li><li>Sort by best, worst, newest or most reach, and filter by format</li></ul></div>
    <div class="f-vis tint-violet" aria-hidden="true"><div class="mini-list">
      <div class="mi"><span class="th t1"></span><span class="tx"><b>GTA 6 price in India</b><small>Reel, 20 Aug</small></span><span class="st">★★★★★</span><span class="sc up">255</span></div>
      <div class="mi"><span class="th t2"></span><span class="tx"><b>Stream highlight</b><small>Reel, 9 Nov</small></span><span class="st">★★★★<i>★</i></span><span class="sc up">138</span></div>
      <div class="mi"><span class="th t3"></span><span class="tx"><b>BGMI clutch</b><small>Carousel, 5 Nov</small></span><span class="st">★★★<i>★★</i></span><span class="sc">104</span></div>
      <div class="mi"><span class="th t4"></span><span class="tx"><b>Funny fail compilation</b><small>Reel, 28 Oct</small></span><span class="st">★<i>★★★★</i></span><span class="sc down">31</span></div></div></div>
  </div>
  <div class="feature rev" id="why">
    <div class="f-copy"><span class="f-ic pink"><svg aria-hidden="true"><use href="#i-chart"/></svg></span><h2 class="h3">Know exactly why it worked</h2>
      <p>Open any post to see views, reach, watch time, skip rate, sends, saves, follows and comments next to your usual, then a plain reason and what to do next time.</p>
      <ul class="ticks"><li>Patterns are checked like with like, so luck isn't sold as a rule</li><li>Each finding says how strong the evidence is</li></ul></div>
    <div class="f-vis tint-pink" aria-hidden="true"><div class="mini-card">
      <div class="mc-row"><span>Reach</span><b>5,758</b><em class="up">4.2x</em></div><div class="mc-row"><span>Sends per 1,000 reached</span><b>33</b><em class="up">3.1x</em></div>
      <div class="mc-row"><span>Follows per 1,000 reached</span><b>7</b><em class="up">2.3x</em></div><div class="mc-row"><span>Average watch time</span><b>16.9 s</b><em>1.1x</em></div>
      <div class="mc-why"><b>Why it worked</b><span>People sent it to friends 3x more than usual. Repeat the angle.</span></div></div></div>
  </div>
  <div class="feature" id="next">
    <div class="f-copy"><span class="f-ic orange"><svg aria-hidden="true"><use href="#i-bolt"/></svg></span><h2 class="h3">Know what to post next</h2>
      <p>Ideas built from your own best posts, your niche (read from your captions) and proven hook angles, each with the format, day and time that work for your audience.</p>
      <ul class="ticks"><li>Part 2s of your winners while interest is fresh</li><li>Trial reels to test new angles without hurting your grid</li><li>A "do more" and "do less" list from your own numbers</li></ul></div>
    <div class="f-vis tint-orange" aria-hidden="true"><div class="mini-ideas">
      <div class="idea-c"><small>Make a part 2 of your best post</small><b>Part 2: GTA 6 price in India</b><span class="tags"><i>Reel, 31-60 s</i><i>Saturday, 1 pm</i><i>Open loop</i></span></div>
      <div class="idea-c"><small>A post built to be sent</small><b>This GTA 6 detail changes how you'll play the first mission.</b><span class="tags"><i>Reel</i><i>Share trigger</i></span></div></div></div>
  </div>
  <div class="feature rev" id="plan">
    <div class="f-copy"><span class="f-ic teal"><svg aria-hidden="true"><use href="#i-cal"/></svg></span><h2 class="h3">A growth goal and a 30-day plan</h2>
      <p>Pick a goal from a dropdown. The report says whether it's realistic at your current pace, then builds a posting calendar on your best days that downloads to Google Calendar.</p>
      <ul class="ticks"><li>Realistic, ambitious or very hard, worked out from your real follows per post</li><li>Each day has a hook, an angle, a closing line and up to 5 hashtags</li></ul></div>
    <div class="f-vis tint-teal" aria-hidden="true"><div class="mini-cal"><div class="mc-h"><b>Your next 2 weeks</b><span>4 posts a week</span></div>
      <div class="cal-g"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span><i></i><i class="p"></i><i></i><i class="s"></i><i></i><i class="p"></i><i></i><i class="p"></i><i class="p"></i><i></i><i class="p"></i><i></i><i class="p"></i><i></i></div></div></div>
  </div>
  <div class="feature" id="comments">
    <div class="f-copy"><span class="f-ic sky"><svg aria-hidden="true"><use href="#i-msg"/></svg></span><h2 class="h3">Your comments, sorted</h2>
      <p>When you connect Instagram, comments are read automatically. You can also paste comments from any post. They're sorted so you know what to answer and what to make next.</p>
      <ul class="ticks"><li>Questions and requests become free post ideas</li><li>Works in English and Hinglish</li><li>Spam is flagged so you can hide it</li></ul></div>
    <div class="f-vis tint-sky" aria-hidden="true"><div class="mini-card">
      <div class="mc-row"><span>Requests: "part 2 please"</span><b>12</b><em class="up">Make next</em></div><div class="mc-row"><span>Questions: "kaunsa phone hai?"</span><b>9</b><em class="up">Reply video</em></div>
      <div class="mc-row"><span>Praise</span><b>31</b><em>Pin one</em></div><div class="mc-row"><span>Spam</span><b>4</b><em>Hide</em></div></div></div>
  </div>
  <div class="feature rev" id="board">
    <div class="f-copy"><span class="f-ic violet"><svg aria-hidden="true"><use href="#i-users"/></svg></span><h2 class="h3">An AI boardroom in Claude</h2>
      <p>One message, copied from your report, gets Claude to review your account like a full team: a CEO, a growth lead, a social media expert, an SEO lead, a data analyst and a creative director, plus an AI audience that reacts like real viewers.</p>
      <ul class="ticks"><li>Advisers disagree out loud, then the CEO decides</li><li>Works on the free Claude plan</li></ul>
      <p><a href="sample-boardroom.html">Read a sample boardroom result</a></p></div>
    <div class="f-vis tint-violet" aria-hidden="true"><div class="mini-cal"><div class="mc-h"><b>Boardroom verdict</b><span>7 advisers</span></div>
      <div class="board"><span class="a1">CEO</span><span class="a2">GR</span><span class="a3">SM</span><span class="a4">SEO</span><span class="a5">DA</span><small>and 20 AI viewers</small></div>
      <div class="mc-why" style="background:var(--brand-50)"><b style="color:var(--brand)">CEO</b><span>The idea is good. Test the claim before you post, then post with subtitles.</span></div></div></div>
  </div>
  <div class="feature" id="health">
    <div class="f-copy"><span class="f-ic pink"><svg aria-hidden="true"><use href="#i-shield"/></svg></span><h2 class="h3">Audience health check</h2>
      <p>What a brand sees before paying for a post: engagement compared with accounts of the same size, comments per like, and patterns that suggest bought likes. Type any creator's username to check them.</p>
      <ul class="ticks"><li>Benchmarks by account size</li><li>Says plainly what no tool can see, like another account's audience ages</li></ul></div>
    <div class="f-vis tint-pink" aria-hidden="true"><div class="mini-card">
      <div class="mc-row"><span>Engagement</span><b>3.9%</b><em class="up">Normal</em></div><div class="mc-row"><span>Comments per 100 likes</span><b>6.1</b><em class="up">Real talk</em></div>
      <div class="mc-row"><span>Likes on every post</span><b>Vary</b><em class="up">Healthy</em></div><div class="mc-why"><b>Looks healthy</b><span>Ask for an Insights screenshot before paying.</span></div></div></div>
  </div>
</div></section>
""" + cta()

# ---------------------------------------------------------------- how it works
HOW = page_hero("How it works", "From your numbers to a plan in under a minute", "Pick your platform, bring your numbers, read your report. Here's exactly what happens at each step, and how the stars are worked out.", "How it works") + """
<section class="section"><div class="wrap">
  <ol class="steps3 big">
    <li><span class="n">1</span><h3>Pick your platform</h3><p>Instagram, YouTube or Twitch. The next step changes to fit it.</p></li>
    <li><span class="n">2</span><h3>Bring your numbers</h3><p>Type a username, connect, upload an export or type in your streams. Use whichever is easiest.</p></li>
    <li><span class="n">3</span><h3>Read your report</h3><p>Stars for every post, why each worked, what to post next and a 30-day plan.</p></li>
  </ol>
</div></section>

<section class="section alt" id="ways"><div class="wrap">
  <div class="head"><span class="kicker">Step 2 in detail</span><h2>Every way to bring your numbers</h2></div>
  <div class="table-card"><table class="table">
    <thead><tr><th>Platform</th><th>How</th><th>What it reads</th><th>Time</th></tr></thead>
    <tbody>
      <tr><td><b>Instagram</b></td><td>Type a username or profile link</td><td>Followers, and likes, comments and Reel views on the last 50 posts</td><td>Seconds</td></tr>
      <tr><td><b>Instagram</b></td><td>Connect Instagram (official login)</td><td>All of the above plus reach, views, watch time, skip rate, sends, saves, follows, profile visits and comments</td><td>1 minute</td></tr>
      <tr><td><b>Instagram</b></td><td>Upload a Meta Business Suite export</td><td>Reach, views, likes, comments, shares, saves and follows for up to 90 days</td><td>2 minutes</td></tr>
      <tr><td><b>YouTube</b></td><td>Upload a YouTube Studio export</td><td>Views, watch time, average view duration, click rate, subscribers, likes, comments and shares</td><td>2 minutes</td></tr>
      <tr><td><b>Twitch</b></td><td>Type in your last streams</td><td>Average viewers, hours, followers gained and chat messages</td><td>3 minutes</td></tr>
    </tbody></table></div>
</div></section>

<section class="section" id="stars"><div class="wrap">
  <div class="split">
    <div><span class="kicker">The method</span><h2>How the stars are worked out</h2>
      <p class="muted">Each post gets a score where 100 means a normal post for you. The score blends how many people a post reached with how strongly those people reacted.</p>
      <ol class="nums"><li><b>Per person reached.</b> Sends, follows, likes, saves and comments are divided by reach, so a big post doesn't win just for being big.</li>
      <li><b>Compared with you.</b> Each signal is compared with your own typical post, not with other accounts.</li>
      <li><b>Weighted by what matters.</b> Watch time and sends count most, because Instagram's head names them as top signals.</li>
      <li><b>Turned into stars.</b> 3.5 stars is your normal. 5 stars is about twice as good as usual. 1 star is well below.</li></ol></div>
    <div class="table-card"><table class="table"><thead><tr><th>Signal</th><th style="text-align:right">Weight</th></tr></thead><tbody>
      <tr><td>Average watch time</td><td style="text-align:right">30%</td></tr><tr><td>Sends per 1,000 reached</td><td style="text-align:right">30%</td></tr>
      <tr><td>Follows per 1,000 reached</td><td style="text-align:right">25%</td></tr><tr><td>Likes per 1,000 reached</td><td style="text-align:right">15%</td></tr>
      <tr><td>Saves per 1,000 reached</td><td style="text-align:right">15%</td></tr><tr><td>Comments per 1,000 reached</td><td style="text-align:right">15%</td></tr>
      <tr><td>Hold rate (people who didn't skip)</td><td style="text-align:right">15%</td></tr></tbody></table>
      <p class="small muted" style="padding:12px 16px 4px;margin:0">Weights are shared out again when a signal is missing, for example when an export has no watch time.</p></div>
  </div>
</div></section>

<section class="section alt" id="patterns"><div class="wrap">
  <div class="split">
    <div><span class="kicker">Honest statistics</span><h2>How patterns are found</h2>
      <p class="muted">Simple averages fool people. If your night posts were all GTA 6 posts, night looks great even when the topic did the work. So the report compares like with like.</p></div>
    <ul class="ticks"><li>Format, time, day, hook, topic, length and hashtags are tested together, so each one is judged with the others held equal</li>
      <li>A time trend is included, so a growing account doesn't make recent habits look magic</li>
      <li>Only findings that pass a strict test are shown, labelled strong or good evidence</li>
      <li>On pure random data, fewer than 1 in 10 runs shows a false pattern</li>
      <li>Groups with fewer than 3 posts are marked thin and never shown as rules</li></ul>
  </div>
</div></section>

<section class="section" id="privacy"><div class="wrap">
  <div class="head"><span class="kicker">Privacy</span><h2>Where your data goes</h2></div>
  <div class="cards3">
    <div class="c6 static"><span class="f-ic teal"><svg aria-hidden="true"><use href="#i-lock"/></svg></span><h3>Worked out in your browser</h3><p>The report is calculated on your own device. Uploaded files never leave it.</p></div>
    <div class="c6 static"><span class="f-ic violet"><svg aria-hidden="true"><use href="#i-shield"/></svg></span><h3>Official API only</h3><p>Instagram numbers come through Meta's official API. No scraping, no bots, no passwords.</p></div>
    <div class="c6 static"><span class="f-ic orange"><svg aria-hidden="true"><use href="#i-check"/></svg></span><h3>Nothing stored</h3><p>The connector keeps nothing. Your login token stays in your browser tab until you close it.</p></div>
  </div>
</div></section>
""" + cta()

# ---------------------------------------------------------------- growth guide
def src(url, name):
    return f'<a class="src" href="{url}" target="_blank" rel="noopener">{name}</a>'

GUIDE = page_hero("Growth guide 2026", "How to grow on Instagram, YouTube and Twitch", "What the platforms and the biggest studies actually say, turned into steps. Every fact has a source you can check. Updated 19 November 2026.", "Growth guide") + f"""
<div class="wrap doc-grid">
  <aside class="toc" aria-label="On this page"><b>On this page</b>
    <a href="#instagram">Instagram</a><a href="#ig-signals" class="sub">What the algorithm rewards</a><a href="#ig-rhythm" class="sub">How often to post</a><a href="#ig-hooks" class="sub">Hooks and length</a><a href="#ig-reach" class="sub">Reaching new people</a><a href="#ig-profile" class="sub">Profile and search</a>
    <a href="#youtube">YouTube</a><a href="#twitch">Twitch</a><a href="#money">Brand deals and money</a><a href="#plan">Your first 30 days</a></aside>
  <article class="guide">
    <h2 id="instagram"><span class="pc-ic ig sm"><svg aria-hidden="true"><use href="#i-ig"/></svg></span>Instagram</h2>

    <h3 id="ig-signals">What the algorithm rewards</h3>
    <p>Instagram's head, Adam Mosseri, has named three signals as the most important for reach: <b>watch time</b>, <b>sends per reach</b> (how often people send your post to a friend) and <b>likes per reach</b>. {src("https://buffer.com/resources/instagram-algorithms/", "Buffer")}</p>
    <div class="do"><b>Do this</b><ul><li>Make the first second earn the second: movement, a face, or the result first.</li><li>Give people a reason to send it: "send this to the friend who..." works because it names the friend.</li><li>Post original work. Instagram ranks original content above reposts and aggregator accounts. {src("https://buffer.com/resources/instagram-algorithms/", "Buffer")}</li></ul></div>

    <h3 id="ig-rhythm">How often to post</h3>
    <p>Buffer studied 2 million Instagram posts. Posting 3 to 5 times a week more than doubled follower growth compared with 1 to 2 times, and gave about 12% more reach per post. Posting more still helps, but less each time. {src("https://buffer.com/resources/how-often-to-post-on-instagram/", "Buffer")}</p>
    <div class="stat-row"><div><b>1-2</b><span>posts a week: the minimum</span></div><div><b>3-5</b><span>posts a week: the sweet spot</span></div><div><b>6+</b><span>more growth, more effort</span></div></div>
    <div class="do"><b>Do this</b><ul><li>Pick a number you can keep for 3 months. Consistency beats a burst then silence.</li><li>Use the 30-day plan in your report: it puts posts on your best days and times.</li></ul></div>

    <h3 id="ig-hooks">Hooks and length</h3>
    <p>Reels can now be up to 3 minutes long, up from 90 seconds, since January 2025. {src("https://www.businesstoday.in/technology/news/story/instagram-head-announces-big-changes-3-minute-reels-and-new-look-for-profile-grid-461527-2025-01-21", "Business Today")} Longer is allowed, not required: length should follow the story.</p>
    <div class="do"><b>Do this</b><ul><li>Check your report's "Reels by length" result. It shows which length holds your audience.</li><li>Cut anything that doesn't move the story. If the skip rate is high, the opening is the problem.</li><li>Test one hook style at a time: face to camera, result first, or a question.</li></ul></div>

    <h3 id="ig-reach">Reaching new people</h3>
    <p>Trial reels are shown only to people who don't follow you, and stay off your grid until you choose to share them. {src("https://techcrunch.com/2024/12/10/instagram-rolls-out-trial-reels-that-arent-shown-to-a-creators-followers", "TechCrunch")} Instagram also caps hashtags at 5 per post since December 2025. {src("https://www.businesstoday.in/technology/news/story/no-more-hashtag-stuffing-instagram-limits-hashtag-usage-to-just-5-per-reel-and-post-507444-2025-12-19", "Business Today")}</p>
    <div class="do"><b>Do this</b><ul><li>Test risky ideas as trial reels first. Keep the winners.</li><li>Use 3 to 5 specific hashtags that describe the post, not generic ones.</li><li>Collab with creators your size: the post shows to both audiences.</li></ul></div>

    <h3 id="ig-profile">Profile and search</h3>
    <p>Since 10 July 2025, public posts from professional accounts can appear in Google search. {src("https://metricool.com/instagram-indexing-on-google/", "Metricool")}</p>
    <div class="do"><b>Do this</b><ul><li>Put your main keyword in your name field, for example "Rohan | GTA and BGMI tips".</li><li>Write captions that say what the post is about in plain words, because search reads them.</li><li>Pin your 3 best posts so new visitors see why to follow.</li></ul></div>

    <h2 id="youtube"><span class="pc-ic yt sm"><svg aria-hidden="true"><use href="#i-play"/></svg></span>YouTube</h2>
    <p>Shorts can be up to 3 minutes long since 15 October 2024, for square or vertical videos. {src("https://blog.youtube/news-and-events/tall-updates-coming-to-shorts/", "YouTube blog")} YouTube Studio's Test and Compare lets creators test up to three thumbnails, and now titles too, and picks the winner by watch time, not clicks. {src("https://www.tubefilter.com/2025/07/16/youtube-feature-test-and-compare-titles-thumbnails/", "Tubefilter")}</p>
    <div class="do"><b>Do this</b><ul><li>Use Shorts to be found and long videos to be watched. Your report rates them separately.</li><li>Test thumbnails with Test and Compare when it's available on your channel.</li><li>Watch average view duration more than views: it shows whether people stayed.</li></ul></div>
    <p>To earn from ads in the YouTube Partner Program, you need 1,000 subscribers plus 4,000 watch hours in a year, or 10 million Shorts views in 90 days. Fan funding opens earlier, at 500 subscribers. {src("https://www.tubefilter.com/2026/08/10/youtube-partner-program-ad-eligibility-requirements-shorts/amp/", "Tubefilter")}</p>

    <h2 id="twitch"><span class="pc-ic tw sm"><svg aria-hidden="true"><use href="#i-live"/></svg></span>Twitch</h2>
    <p>Twitch Affiliate needs 25 followers, 4 hours streamed, 4 broadcast days and 3 average viewers within 30 days. Check Twitch Help for the latest. {src("https://streamer.guide/guides/twitch-affiliate-requirements", "Streamer Guide")}</p>
    <div class="do"><b>Do this</b><ul><li>Stream on a fixed schedule so people know when to come back.</li><li>Clip your best moments and post them as Reels and Shorts to bring new viewers in.</li><li>Use your report to see which days, start times and stream lengths bring the most follows.</li></ul></div>

    <h2 id="money"><span class="pc-ic mo sm"><svg aria-hidden="true"><use href="#i-target"/></svg></span>Brand deals and money</h2>
    <p>In India, ASCI requires a clear, upfront ad label on paid influencer posts, and brands share responsibility. In its February 2025 study, 69% of top digital stars broke the rules. {src("https://www.ascionline.in/wp-content/uploads/2025/02/Press-Release-Influencer-Disclosure-Guidelines-ASCI-Report.pdf", "ASCI")}</p>
    <div class="do"><b>Do this</b><ul><li>Label every paid post at the start: "Ad" or "Paid partnership".</li><li>Before pitching, run the audience health check in your report. Brands look at the same numbers.</li><li>Price from your real reach, not your follower count.</li></ul></div>

    <h2 id="plan"><span class="pc-ic mo sm"><svg aria-hidden="true"><use href="#i-cal"/></svg></span>Your first 30 days</h2>
    <ol class="nums"><li><b>Week 1.</b> Get your report. Write down your 2 best formats and your best posting time.</li>
      <li><b>Week 2.</b> Post 3 to 5 times. Make a part 2 of your best post. Test one new hook as a trial reel.</li>
      <li><b>Week 3.</b> Reply to every comment in the first hour. Turn the top question into a post.</li>
      <li><b>Week 4.</b> Run your report again. Keep what moved up, drop what moved down, and change one thing at a time.</li></ol>
    <div class="callout info"><svg aria-hidden="true"><use href="#i-info"/></svg><p>No tool can guarantee followers. Anyone who promises that is selling bots, which Instagram removes. Growth comes from posting what your audience sends to friends, often enough to learn what that is.</p></div>
  </article>
</div>
""" + cta("Find out what works for your account", "The guide says what works in general. Your report says what works for you.")

# ---------------------------------------------------------------- faq
FAQS = [
    ("Getting started", [
        ("Is it really free?", "Yes. It's open source under the MIT licence, and you can read every line on GitHub. There's nothing to buy and no account to create."),
        ("What do I need to start?", "Just your platform. For Instagram, type your username. For YouTube, download your YouTube Studio export. For Twitch, have your last few streams' numbers ready."),
        ("Does it work with a small account?", "Yes. Ratings compare each post with your own typical post, so they work from your first few posts. With fewer than 15 posts, the report says its patterns are early hints, not proof."),
        ("Can I try it without my own account?", "Yes. Press See a sample report. The sample is a fictional gaming creator with 40 posts, analysed by the real tool."),
    ]),
    ("Instagram connection", [
        ("Can I just type my Instagram link?", "Yes. Type a username or paste a profile link, and the tool reads that account's public numbers through Instagram's official API: followers, likes, comments and Reel views for the last 50 posts."),
        ("Why doesn't my account show up?", "Instagram only lets apps read Creator and Business accounts. In the Instagram app, open Settings, then Account type and tools, then Switch to professional account. It's free, takes a minute, and you can switch back."),
        ("What does Connect Instagram add?", "Reach, views, average watch time, skip rate, sends, saves, follows, profile visits and your comments. Instagram only shares these with the account owner, after they log in through Instagram's own page."),
        ("Is the username box working yet?", "Username lookup and Connect Instagram switch on once the site's Meta app is set up and approved. Until then, uploading your export gives the same detail and takes about 2 minutes."),
    ]),
    ("Stars and scores", [
        ("How are the stars worked out?", "Each post gets a score where 100 is your typical post. It blends reach with quality signals per person reached: watch time and sends count most, then follows, then likes, saves, comments and hold rate. 3.5 stars is a typical post; 5 stars is about twice as good as usual."),
        ("Why did a post with lots of views get few stars?", "Stars look at how strongly people reacted, not just how many saw it. A post can reach many people but get few sends, follows or a short watch time. The post's detail shows which signal held it back."),
        ("How sure are the patterns?", "Only patterns that pass a strict statistical test are shown, compared like with like. Each one says whether the evidence is strong or good. Thin groups are never shown as rules."),
    ]),
    ("YouTube and Twitch", [
        ("How do I get my YouTube export?", "Open YouTube Studio, then Analytics, then Advanced mode. Pick the last 90 days, press the download icon and choose CSV. Upload the file called Table data.csv."),
        ("Are Shorts and long videos mixed up?", "No. Videos of 60 seconds or less are treated as Shorts and rated against each other, separately from long videos."),
        ("How does Twitch work without a login?", "You type in your last few streams: date, start time, average viewers, hours, followers gained and chat messages. The report then finds your best days, times and stream lengths."),
    ]),
    ("Privacy and safety", [
        ("Is my data stored anywhere?", "No. Your report is worked out inside your own browser. Username lookups and Connect Instagram pass through a small connector that asks Instagram for the numbers and stores nothing. Uploaded files never leave your browser."),
        ("Do you need my password?", "Never. Connect Instagram uses Instagram's own login page. The tool never sees your password."),
        ("Can it guarantee followers?", "No. No honest tool can. It tells you what works for your audience so you can do more of it."),
    ]),
    ("Brands and agencies", [
        ("Can I check a creator before paying them?", "Yes. Type their username. The audience health check compares their engagement with accounts of the same size and flags patterns that suggest bought likes."),
        ("Can it show a creator's audience ages and cities?", "No tool can see another account's private audience data. Ask the creator for an Insights screenshot before you pay."),
    ]),
]
faq_html = "".join(
    f'<section class="faq-group" data-group><h2 id="g{i}">{name}</h2><div class="faq">' +
    "".join(f'<details><summary>{q}</summary><p>{a}</p></details>' for q, a in items) + "</div></section>"
    for i, (name, items) in enumerate(FAQS))
chips = "".join(f'<a href="#g{i}">{name}</a>' for i, (name, _) in enumerate(FAQS))
FAQ = page_hero("Help centre", "Frequently asked questions", "Quick answers about getting started, connecting Instagram, how the stars work, privacy, and YouTube and Twitch.", "FAQ") + f"""
<section class="section tight"><div class="wrap narrow">
  <div class="faq-search"><svg aria-hidden="true"><use href="#i-search"/></svg><label for="q" class="sr">Search the questions</label><input id="q" type="search" placeholder="Search the questions, for example: password" autocomplete="off"></div>
  <nav class="chips" aria-label="Topics">{chips}</nav>
  <p class="small muted" id="faq-none" hidden>No question matches that. Try another word, or ask below.</p>
  {faq_html}
  <div class="ask" id="ask">
    <div><span class="f-ic violet"><svg aria-hidden="true"><use href="#i-help"/></svg></span><h2>Still have a question?</h2><p>Ask in our public Q and A on GitHub. Answers stay there for the next person. A free GitHub account is needed to post.</p></div>
    <div class="ask-actions"><a class="btn primary lg" href="{ASK}">Ask a question</a><a class="btn lg" href="{BUG}">Report a problem</a></div>
  </div>
</div></section>
"""

if __name__ == "__main__":
    write("index.html", "Creator Growth Studio: see which posts grow your account, and why", "Free. Pick Instagram, YouTube or Twitch and get a star rating for every post, why it worked, what to post next and a 30-day plan.", HOME, "", dark=True)
    write("features.html", "Features: Creator Growth Studio", "Star ratings for every post, why each worked, what to post next, a 30-day plan, comments sorted, an AI boardroom and an audience health check.", FEATURES, "features.html")
    write("how-it-works.html", "How it works: Creator Growth Studio", "How your numbers become a report: every way to bring data, how the stars are worked out, how patterns are tested, and where your data goes.", HOW, "how-it-works.html")
    write("growth-guide.html", "Growth guide 2026: Instagram, YouTube and Twitch", "What the platforms and the biggest studies say about growing in 2026, with sources and steps.", GUIDE, "growth-guide.html")
    write("faq.html", "FAQ: Creator Growth Studio", "Answers about getting started, Instagram connection, star ratings, YouTube, Twitch, privacy and brand checks.", FAQ, "faq.html")
    (DOCS / "guide.html").write_text('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Moved: How it works</title><meta http-equiv="refresh" content="0; url=how-it-works.html"><link rel="canonical" href="how-it-works.html"></head><body><p><a href="how-it-works.html">This page moved to How it works.</a></p></body></html>')
    # refresh shared header and footer on hand-made pages
    for name in ["start.html", "sample-boardroom.html"]:
        p = DOCS / name
        if not p.exists():
            continue
        s = p.read_text()
        if "<!--HEADER-->" in s and "<!--/HEADER-->" in s:
            a, b = s.index("<!--HEADER-->") + 13, s.index("<!--/HEADER-->")
            s = s[:a] + "\n" + header("") + s[b:]
        if "<!--FOOTER-->" in s and "<!--/FOOTER-->" in s:
            a, b = s.index("<!--FOOTER-->") + 13, s.index("<!--/FOOTER-->")
            s = s[:a] + "\n" + FOOT.replace('<script src="site.js"></script>\n</body>\n</html>\n', '') + s[b:]
        p.write_text(s)
        print("refreshed", name)
