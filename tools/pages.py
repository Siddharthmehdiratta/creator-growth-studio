"""Builds the Creator Growth Studio website pages (docs/*.html) from one shared header, footer and icon set.
Run: python3 tools/pages.py   (start.html, the app itself, is kept by hand; this script only refreshes its header and footer.)"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
SPRITE = (ROOT / "tools" / "sprite.html").read_text()
REPO = "https://github.com/Siddharthmehdiratta/creator-growth-studio"
ASK = REPO + "/discussions/new?category=q-a"
BUG = REPO + "/issues/new"
FONT_PRELOAD = '<link rel="preload" href="fonts/plus-jakarta-sans-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>\n<link rel="preload" href="fonts/plus-jakarta-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>'
FAVICON = "<link rel=\"icon\" href=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='9' fill='%236C47FF'/%3E%3Cpath d='M9 21v-3M14 21v-7M19 21v-10M24 21V8' stroke='%23fff' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E\">"
FP_URL = "https://siddharthmehdiratta.github.io/founder-skill-plus/"
# One menu, used by the desktop dropdowns, the phone menu sheet and the footer.
MENU = [
    ("Product", [("start.html", "i-rocket", "Start free", "Pick a platform, get your report"),
                 ("features.html", "i-star", "Features tour", "7 features, one slide at a time"),
                 ("how-it-works.html", "i-sliders", "How it works", "The steps, the stars, your privacy"),
                 ("start.html?sample=1", "i-chart", "Sample report", "A fictional account, the real tool"),
                 ("sample-boardroom.html", "i-users", "Sample AI boardroom", "What the Claude review looks like")]),
    ("Learn", [("guide.html", "i-book", "Beginner's guide", "Your first report in 7 steps"),
               ("growth-guide.html", "i-target", "Growth guide 2026", "What the platforms reward, with sources"),
               ("faq.html", "i-search", "FAQ", "Search quick answers")]),
    ("Help", [("help.html", "i-help", "Help centre", "Every way to get help"),
              (ASK, "i-msg", "Ask a question", "Public questions and answers on GitHub"),
              ("report.html", "i-flag", "Report a problem", "Tell us what broke"),
              ("feedback.html", "i-heart", "Give feedback", "What to keep, what to change")]),
    ("Project", [("github.html", "i-code", "GitHub project", "Stars, licence, run it yourself"),
                 (REPO, "i-gh", "Code on GitHub", "Read every line"),
                 (FP_URL, "i-spark", "Founder Plus", "Our sister project for founders")]),
]


def _item(h, ic, t, sub, active=""):
    cur = ' aria-current="page"' if h == active else ""
    ext = ' rel="noopener"' if h.startswith("http") else ""
    return f'<a href="{h}"{cur}{ext}><span class="mi-ic"><svg aria-hidden="true"><use href="#{ic}"/></svg></span><span><b>{t}</b><small>{sub}</small></span></a>'


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
<body data-app="start.html">
"""


def header(active="", dark=False):
    """Desktop: Home, three dropdowns and GitHub. Phone: a labelled tab bar at the bottom plus a full menu sheet."""
    groups = {n: items for n, items in MENU}
    def dd(name):
        on = any(h == active for h, *_ in groups[name])
        return (f'<div class="dd"><button class="dd-btn{" on" if on else ""}" type="button" aria-expanded="false">{name}<svg aria-hidden="true"><use href="#i-down-c"/></svg></button>'
                f'<div class="dd-menu">{"".join(_item(*i, active) for i in groups[name])}</div></div>')
    home_cur = ' aria-current="page"' if active == "index.html" else ""
    gh_cur = ' aria-current="page"' if active == "github.html" else ""
    sheet = "".join(f'<div class="sheet-group"><h3>{n}</h3>{"".join(_item(*i, active) for i in items)}</div>' for n, items in MENU)
    tab = lambda h, ic, t: f'<a href="{h}"{" aria-current=\"page\"" if h == active else ""}><svg aria-hidden="true"><use href="#{ic}"/></svg><span>{t}</span></a>'
    return f"""{SPRITE}
<a class="skip" href="#main">Skip to content</a>
<header class="top{' top-dark' if dark else ''}">
  <div class="wrap">
    <a class="logo" href="./"><svg aria-hidden="true"><use href="#i-logo"/></svg>Creator Growth Studio</a>
    <nav class="dnav" aria-label="Main"><a href="./"{home_cur}>Home</a>{dd("Product")}{dd("Learn")}{dd("Help")}<a href="github.html"{gh_cur}>GitHub</a></nav>
    <div class="right"><a class="btn primary sm" href="start.html">Start free</a></div>
  </div>
</header>
<nav class="tabbar" aria-label="Quick links">{tab("./", "i-home", "Home") if active != "index.html" else tab("index.html", "i-home", "Home")}{tab("start.html", "i-rocket", "Start")}{tab("guide.html", "i-book", "Guide")}{tab("help.html", "i-help", "Help")}<button type="button" data-sheet-open aria-controls="sheet" aria-expanded="false"><svg aria-hidden="true"><use href="#i-menu"/></svg><span>Menu</span></button></nav>
<div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-label="Menu" hidden>
  <div class="sheet-card">
    <div class="sheet-head"><b>Menu</b><button type="button" class="sheet-x" data-sheet-close aria-label="Close menu"><svg aria-hidden="true"><use href="#i-x"/></svg></button></div>
    <a class="sheet-home" href="./"><svg aria-hidden="true"><use href="#i-home"/></svg>Home</a>
    {sheet}
    <a class="btn primary lg sheet-cta" href="start.html">Start free</a>
  </div>
</div>
"""


FOOT = f"""<footer class="site-foot">
  <div class="wrap">
    <div class="ft-brand"><a class="logo" href="./"><svg aria-hidden="true"><use href="#i-logo"/></svg>Creator Growth Studio</a><p>Free and open source (MIT), made by Siddharth Mehdiratta. Uses Instagram's official API, never sees your password, and stores nothing. Platform rules checked on 19 November 2026.</p></div>
    {"".join(f'<div><b>{n}</b>' + "".join(f'<a href="{h}">{t}</a>' for h, _, t, _ in items) + '</div>' for n, items in MENU)}
  </div>
</footer>
<script src="site.js"></script>
</body>
</html>
"""


def page_hero(kicker, title, lead, crumbs=None, compact=False):
    c = f'<p class="crumbs"><a href="./">Home</a><span>/</span>{crumbs}</p>' if crumbs else ""
    return f"""<section class="page-hero{' compact' if compact else ''}"><div class="wrap">{c}<span class="kicker">{kicker}</span><h1>{title}</h1><p class="lead">{lead}</p></div></section>"""


def cta(title="Ready to see your own report?", text="Pick Instagram, YouTube or Twitch. It takes under a minute and it's free."):
    return f"""<section class="cta-band"><div class="wrap"><div><h2>{title}</h2><p>{text}</p></div><a class="btn light lg" href="start.html">Start free</a></div></section>"""


def deck(label, slides, done=("start.html", "Start free")):
    """A slide deck: one card at a time, Back and Next buttons, dots, a counter, swipe and arrow keys."""
    n = len(slides)
    items = "".join(f'<div class="deck-slide" id="{i}" data-title="{t}" role="group" aria-roledescription="slide" aria-label="{k + 1} of {n}: {t}">{h}</div>'
                    for k, (i, t, h) in enumerate(slides))
    back = '<button class="deck-prev btn" type="button"><svg aria-hidden="true"><use href="#i-back"/></svg>Back</button>'
    nxt = '<button class="deck-next btn primary" type="button">Next<svg aria-hidden="true"><use href="#i-next"/></svg></button>'
    fin = f'<a class="btn primary deck-done" href="{done[0]}" hidden>{done[1]}</a>'
    return f"""<section class="deck-sec"><div class="wrap">
<div class="deck" aria-roledescription="carousel" aria-label="{label}" tabindex="0">
  <div class="deck-bar">{back}<div class="deck-mid"><span class="deck-count" aria-live="polite">1 of {n}</span><b data-deck-label>{slides[0][1]}</b><div class="deck-dots"></div></div>{nxt}{fin}</div>
  <div class="deck-track">{items}</div>
  <div class="deck-foot">{back}{nxt}{fin}</div>
</div></div></section>"""


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

def next_btn(label):
    return f'<button class="next-slide" type="button" data-next>Next: {label}<svg aria-hidden="true"><use href="#i-down-c"/></svg></button>'


HOME = f"""
<section class="slide dark hero" id="s-home" data-title="Home">
  <div class="glow g1" aria-hidden="true"></div><div class="glow g2" aria-hidden="true"></div>
  <div class="wrap">
    <div class="hero-copy">
      <span class="eyebrow-pill"><span class="dot"></span>Free for creators, built on official data</span>
      <h1>See which posts grow your account, and why.</h1>
      <p class="lead">A star rating for every post, the reason it worked or flopped, and what to post next. No forms to fill in.</p>
      <p class="pick-q">What do you want to grow?</p>
      {PLATFORMS}
      <p class="hero-alt"><a href="start.html?sample=1">Or see a sample report first</a></p>
    </div>
    <div class="visual preview tilt" aria-label="Example report from a fictional sample account">
      <div class="phone" aria-hidden="true">
        <div class="ph-head"><span class="ph-av"><span>LR</span></span><div><b>lowping.rohan</b><span>2,282 followers</span></div></div>
        <div class="ph-stats"><div><b>40</b><span>posts</span></div><div><b>3.5</b><span>avg stars</span></div><div><b>Growing</b><span>level</span></div></div>
        <div class="ph-grid">{TILES}</div>
      </div>
      <div class="frame">
        <div class="bar"><b>Post report</b><span>Example account</span><span class="pill good">Top post</span></div>
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
    </div>
  </div>
  {next_btn("How it works")}
</section>

<section class="slide" id="s-how" data-title="How it works">
  <div class="wrap">
    <div class="head center"><h2>Three steps, under a minute</h2><p>Nothing to install and no account to create.</p></div>
    <ol class="steps-row">
      <li><span class="n">1</span><span class="st-ic"><svg aria-hidden="true"><use href="#i-target"/></svg></span><h3>Pick your platform</h3><p>Instagram, YouTube or Twitch.</p></li>
      <li><span class="n">2</span><span class="st-ic"><svg aria-hidden="true"><use href="#i-up"/></svg></span><h3>Bring your numbers</h3><p>Type a username, upload an export, or type in your streams.</p></li>
      <li><span class="n">3</span><span class="st-ic"><svg aria-hidden="true"><use href="#i-star"/></svg></span><h3>Read your report</h3><p>Stars for every post, why, and what to post next.</p></li>
    </ol>
    <p class="slide-links"><a class="btn" href="guide.html">Read the beginner's guide</a><a class="btn ghost" href="how-it-works.html">How the stars work</a></p>
  </div>
  {next_btn("What you get")}
</section>

<section class="slide alt" id="s-get" data-title="What you get">
  <div class="wrap">
    <div class="head center"><h2>A growth team in one report</h2><p>Every number is compared with your own typical post, so it fits 80 followers or 80,000.</p></div>
    <div class="cards6 compact">
      <a class="c6" href="features.html#stars"><span class="f-ic violet"><svg aria-hidden="true"><use href="#i-star"/></svg></span><h3>Every post rated</h3><p>1 to 5 stars from watch time, sends and follows.</p></a>
      <a class="c6" href="features.html#why"><span class="f-ic pink"><svg aria-hidden="true"><use href="#i-chart"/></svg></span><h3>Why it worked</h3><p>Each number next to your usual, in plain words.</p></a>
      <a class="c6" href="features.html#next"><span class="f-ic orange"><svg aria-hidden="true"><use href="#i-bolt"/></svg></span><h3>What to post next</h3><p>Ideas from your own best posts.</p></a>
      <a class="c6" href="features.html#plan"><span class="f-ic teal"><svg aria-hidden="true"><use href="#i-cal"/></svg></span><h3>A 30-day plan</h3><p>Your best days, ready for Google Calendar.</p></a>
      <a class="c6" href="features.html#comments"><span class="f-ic sky"><svg aria-hidden="true"><use href="#i-msg"/></svg></span><h3>Comments sorted</h3><p>Questions, requests, praise and spam.</p></a>
      <a class="c6" href="features.html#board"><span class="f-ic violet"><svg aria-hidden="true"><use href="#i-users"/></svg></span><h3>AI boardroom</h3><p>Six expert advisers review you in Claude.</p></a>
    </div>
    <p class="slide-links"><a class="btn primary" href="features.html">Take the features tour</a></p>
  </div>
  {next_btn("Why trust it")}
</section>

<section class="slide dark facts" id="s-trust" data-title="Why trust it">
  <div class="wrap">
    <div class="head center"><h2>Built on what the platforms reward in 2026</h2><p>Every rule has a source you can check.</p></div>
    <div class="fb-grid">
      <div><b>3 signals</b><p>Watch time, sends and likes per person reached are what Instagram's head names as most important. Your stars weigh them most.</p><a href="https://buffer.com/resources/instagram-algorithms/" target="_blank" rel="noopener">Source: Buffer</a></div>
      <div><b>3 to 5 posts</b><p>A week more than doubled follower growth against 1 to 2, in Buffer's study of 2 million posts.</p><a href="https://buffer.com/resources/how-often-to-post-on-instagram/" target="_blank" rel="noopener">Source: Buffer</a></div>
      <div><b>5 hashtags</b><p>Instagram caps hashtags at 5 per post since December 2025. Your plan never suggests more.</p><a href="https://www.businesstoday.in/technology/news/story/no-more-hashtag-stuffing-instagram-limits-hashtag-usage-to-just-5-per-reel-and-post-507444-2025-12-19" target="_blank" rel="noopener">Source: Business Today</a></div>
    </div>
    <ul class="trust-row"><li><svg aria-hidden="true"><use href="#i-lock"/></svg>Never asks for your password</li><li><svg aria-hidden="true"><use href="#i-shield"/></svg>Official API only, no scraping</li><li><svg aria-hidden="true"><use href="#i-code"/></svg>Open source, MIT licence</li></ul>
  </div>
  {next_btn("Get started")}
</section>

<section class="slide" id="s-start" data-title="Get started">
  <div class="wrap">
    <div class="head center"><h2>Ready? Pick a platform.</h2><p>Or find help first. Everything is one tap away.</p></div>
    {PLATFORMS.replace('class="pick"', 'class="pick light"')}
    <div class="help-grid">
      <a href="guide.html"><svg aria-hidden="true"><use href="#i-book"/></svg><b>Beginner's guide</b></a>
      <a href="faq.html"><svg aria-hidden="true"><use href="#i-search"/></svg><b>FAQ</b></a>
      <a href="{ASK}"><svg aria-hidden="true"><use href="#i-msg"/></svg><b>Ask a question</b></a>
      <a href="report.html"><svg aria-hidden="true"><use href="#i-flag"/></svg><b>Report a problem</b></a>
      <a href="feedback.html"><svg aria-hidden="true"><use href="#i-heart"/></svg><b>Give feedback</b></a>
      <a href="github.html"><svg aria-hidden="true"><use href="#i-gh"/></svg><b>GitHub project</b></a>
    </div>
  </div>
</section>
"""

# ---------------------------------------------------------------- features
FEATURE_ROWS = """
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
"""
FEAT_TITLES = {"stars": "Star ratings", "why": "Why it worked", "next": "What to post next", "plan": "30-day plan", "comments": "Comments sorted", "board": "AI boardroom", "health": "Audience health"}
_rows = [r.strip() for r in re.split(r'(?=<div class="feature)', FEATURE_ROWS) if r.strip()]
FEATURES = page_hero("Features tour", "Everything your report tells you, one feature at a time", "Press Next or swipe. Seven features, about a minute.", "Features", compact=True) + deck(
    "Feature tour", [(re.search(r'id="(\w+)"', r).group(1), FEAT_TITLES[re.search(r'id="(\w+)"', r).group(1)], re.sub(r'^<div class="feature( rev)?" id="\w+">', '<div class="feature">', r)) for r in _rows]) + cta()


# ---------------------------------------------------------------- how it works
HOW = page_hero("How it works", "From your numbers to a plan in under a minute", "Five short slides: the steps, every way in, how the stars work, how patterns are tested, and where your data goes.", "How it works", compact=True) + deck("How it works", [
    ("steps", "The 3 steps", """<div class="dk-head"><h2>The 3 steps</h2><p>Pick, bring, read. That's all.</p></div>
  <ol class="steps-row">
    <li><span class="n">1</span><span class="st-ic"><svg aria-hidden="true"><use href="#i-target"/></svg></span><h3>Pick your platform</h3><p>Instagram, YouTube or Twitch. The next step changes to fit it.</p></li>
    <li><span class="n">2</span><span class="st-ic"><svg aria-hidden="true"><use href="#i-up"/></svg></span><h3>Bring your numbers</h3><p>Type a username, connect, upload an export or type in your streams.</p></li>
    <li><span class="n">3</span><span class="st-ic"><svg aria-hidden="true"><use href="#i-star"/></svg></span><h3>Read your report</h3><p>Stars for every post, why each worked, what to post next and a 30-day plan.</p></li>
  </ol>"""),
    ("ways", "Every way in", """<div class="dk-head"><h2>Every way to bring your numbers</h2><p>Use whichever is easiest. You can add more detail later.</p></div>
  <div class="ways">
    <div class="way"><span class="pc-ic ig sm"><svg aria-hidden="true"><use href="#i-ig"/></svg></span><div><b>Type a username or profile link</b><p>Followers, and likes, comments and Reel views on the last 50 posts.</p></div><span class="t">Seconds</span></div>
    <div class="way"><span class="pc-ic ig sm"><svg aria-hidden="true"><use href="#i-ig"/></svg></span><div><b>Connect Instagram (official login)</b><p>Also reach, watch time, skip rate, sends, saves, follows, profile visits and comments.</p></div><span class="t">1 minute</span></div>
    <div class="way"><span class="pc-ic ig sm"><svg aria-hidden="true"><use href="#i-ig"/></svg></span><div><b>Upload a Meta Business Suite export</b><p>Reach, views, likes, comments, shares, saves and follows for up to 90 days.</p></div><span class="t">2 minutes</span></div>
    <div class="way"><span class="pc-ic yt sm"><svg aria-hidden="true"><use href="#i-play"/></svg></span><div><b>Upload a YouTube Studio export</b><p>Views, watch time, view duration, click rate, subscribers, likes, comments and shares.</p></div><span class="t">2 minutes</span></div>
    <div class="way"><span class="pc-ic tw sm"><svg aria-hidden="true"><use href="#i-live"/></svg></span><div><b>Type in your last Twitch streams</b><p>Average viewers, hours, followers gained and chat messages.</p></div><span class="t">3 minutes</span></div>
  </div>"""),
    ("stars", "How stars work", """<div class="split">
    <div><h2>How the stars are worked out</h2>
      <p class="muted">Each post gets a score where 100 means a normal post for you.</p>
      <ol class="nums"><li><b>Per person reached.</b> A big post doesn't win just for being big.</li>
      <li><b>Compared with you.</b> Not with other accounts.</li>
      <li><b>Weighted by what matters.</b> Watch time and sends count most.</li>
      <li><b>Turned into stars.</b> 3.5 is your normal. 5 is about twice as good.</li></ol></div>
    <div class="table-card"><table class="table"><thead><tr><th>Signal</th><th style="text-align:right">Weight</th></tr></thead><tbody>
      <tr><td>Average watch time</td><td style="text-align:right">30%</td></tr><tr><td>Sends per 1,000 reached</td><td style="text-align:right">30%</td></tr>
      <tr><td>Follows per 1,000 reached</td><td style="text-align:right">25%</td></tr><tr><td>Likes per 1,000 reached</td><td style="text-align:right">15%</td></tr>
      <tr><td>Saves per 1,000 reached</td><td style="text-align:right">15%</td></tr><tr><td>Comments per 1,000 reached</td><td style="text-align:right">15%</td></tr>
      <tr><td>Hold rate (didn't skip)</td><td style="text-align:right">15%</td></tr></tbody></table>
      <p class="small muted" style="padding:12px 16px 4px;margin:0">When a signal is missing, its weight is shared out again.</p></div>
  </div>"""),
    ("patterns", "Honest patterns", """<div class="split">
    <div><h2>How patterns are found</h2>
      <p class="muted">Simple averages fool people. If your night posts were all GTA 6 posts, night looks great even when the topic did the work. So the report compares like with like.</p></div>
    <ul class="ticks"><li>Format, time, day, hook, topic, length and hashtags are tested together</li>
      <li>A time trend is included, so growth doesn't make recent habits look magic</li>
      <li>Only findings that pass a strict test are shown, labelled strong or good evidence</li>
      <li>On pure random data, fewer than 1 in 10 runs shows a false pattern</li>
      <li>Groups with fewer than 3 posts are marked thin and never shown as rules</li></ul>
  </div>"""),
    ("privacy", "Your privacy", """<div class="dk-head"><h2>Where your data goes</h2><p>Short answer: nowhere.</p></div>
  <div class="cards3">
    <div class="c6 static"><span class="f-ic teal"><svg aria-hidden="true"><use href="#i-lock"/></svg></span><h3>Worked out in your browser</h3><p>The report is calculated on your own device. Uploaded files never leave it.</p></div>
    <div class="c6 static"><span class="f-ic violet"><svg aria-hidden="true"><use href="#i-shield"/></svg></span><h3>Official API only</h3><p>Instagram numbers come through Meta's official API. No scraping, no bots, no passwords.</p></div>
    <div class="c6 static"><span class="f-ic orange"><svg aria-hidden="true"><use href="#i-check"/></svg></span><h3>Nothing stored</h3><p>The connector keeps nothing. Your login token stays in your browser tab until you close it.</p></div>
  </div>"""),
]) + cta()

# ---------------------------------------------------------------- beginner's guide
def bstep(h2, lead, do, tip=""):
    t = f'<div class="callout info"><svg aria-hidden="true"><use href="#i-info"/></svg><p>{tip}</p></div>' if tip else ""
    return f'<div class="dk-head"><h2>{h2}</h2><p>{lead}</p></div><div class="do"><b>Do this</b><ol>{"".join(f"<li>{x}</li>" for x in do)}</ol></div>{t}'

BEGIN = page_hero("Beginner's guide", "Your first report in 7 steps", "New to all this? Go one step at a time. Each step takes 1 to 3 minutes. Press Next when you're done.", "Beginner's guide", compact=True) + deck("Beginner's guide", [
    ("b1", "What you'll get", bstep("What you'll get", "A report that tells you which posts grew your account, why, and what to post next. About 10 minutes in total.",
        ["Have your phone or computer ready.", "Know which platform you want to grow: Instagram, YouTube or Twitch.", "That's it. No account, no password, no payment."],
        "Want to look first? <a href=\"start.html?sample=1\">Open the sample report</a>. It's a fictional account analysed by the real tool.")),
    ("b2", "Get your account ready", bstep("Get your account ready", "Only Instagram needs a setting changed. YouTube and Twitch need nothing.",
        ["<b>Instagram:</b> open the Instagram app, go to Settings, then Account type and tools, then Switch to professional account. Pick Creator. It's free and you can switch back.",
         "<b>YouTube:</b> nothing to do yet.", "<b>Twitch:</b> nothing to do yet."],
        "Instagram only lets tools read Creator and Business accounts. That's Instagram's rule, not ours.")),
    ("b3", "Pick your platform", bstep("Pick your platform", "Open the tool and choose where you post.",
        ["Press <a href=\"start.html\">Start free</a>.", "Press Instagram, YouTube or Twitch.", "The next screen shows only the options for that platform."])),
    ("b4", "Bring your numbers", bstep("Bring your numbers", "Pick the easiest way for you. Each one is explained on screen.",
        ["<b>Instagram:</b> type your username, or press Connect Instagram, or upload an export from Meta Business Suite.",
         "<b>YouTube:</b> in YouTube Studio open Analytics, then Advanced mode. Pick the last 90 days, press the download icon, choose CSV, and upload the file called Table data.csv.",
         "<b>Twitch:</b> type in your last 5 to 10 streams: date, start time, average viewers, hours, new followers and chat messages."],
        "Username lookup and Connect Instagram switch on once the site's Meta app is approved. Until then, the export upload gives the same detail.")),
    ("b5", "Read your stars", bstep("Read your stars", "Every post gets 1 to 5 stars, compared with your own typical post.",
        ["3.5 stars means a normal post for you.", "5 stars means about twice as good as usual. 1 star means well below.", "Sort by Best first to see your top posts, then Worst first."])),
    ("b6", "See why", bstep("See why each post worked", "Open any post. Each number sits next to your usual, with a plain reason.",
        ["Look for the biggest green number. That's what made it work.", "Look for the red one. That's what held it back.", "Read the Next time line and write it down."])),
    ("b7", "Act, then check again", bstep("Act on it, then check again", "Growth comes from repeating what works and changing one thing at a time.",
        ["Open What to post next and pick one idea.", "Open Plan and add the 30-day calendar to Google Calendar.", "Post 3 to 5 times a week for 4 weeks.", "Run your report again and compare."],
        "Stuck? <a href=\"help.html\">Open the Help centre</a>. Questions are answered in public so the next person learns too.")),
], done=("start.html", "Start my report")) + cta()

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
FAQ = page_hero("FAQ", "Frequently asked questions", "Quick answers about getting started, connecting Instagram, how the stars work, privacy, and YouTube and Twitch.", "FAQ") + f"""
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

# ---------------------------------------------------------------- help centre, feedback, report, github
_popular = [FAQS[0][1][1], FAQS[1][1][1], FAQS[2][1][0], FAQS[4][1][0]]
HELP = page_hero("Help centre", "How can we help?", "Pick what you need. Every option is free and answered in public, so the next person learns too.", "Help centre") + f"""
<section class="section tight"><div class="wrap">
  <form class="faq-search big" action="faq.html" method="get" role="search"><svg aria-hidden="true"><use href="#i-search"/></svg><label for="hq" class="sr">Search the questions</label><input id="hq" name="q" type="search" placeholder="Search answers, for example: password" autocomplete="off"><button class="btn primary" type="submit">Search</button></form>
  <div class="hub">
    {"".join(f'<a class="hub-c" href="{h}"><span class="mi-ic"><svg aria-hidden="true"><use href="#{ic}"/></svg></span><b>{t}</b><small>{sub}</small></a>' for h, ic, t, sub in [
        ("guide.html", "i-book", "Beginner's guide", "Your first report in 7 steps"),
        ("faq.html", "i-search", "FAQ", "21 quick answers, searchable"),
        (ASK, "i-msg", "Ask a question", "Post it in our public Q and A"),
        ("report.html", "i-flag", "Report a problem", "Something broke or looks wrong"),
        ("feedback.html", "i-heart", "Give feedback", "Tell us what to keep or change"),
        ("github.html", "i-code", "GitHub project", "Code, licence and how to help build it"),
        ("growth-guide.html", "i-target", "Growth guide 2026", "What the platforms reward, with sources"),
        ("how-it-works.html", "i-sliders", "How it works", "How the stars and patterns work")])}
  </div>
  <div class="split help-split">
    <div><h2>Popular questions</h2><div class="faq">{"".join(f'<details><summary>{q}</summary><p>{x}</p></details>' for q, x in _popular)}</div><p><a href="faq.html">See all questions</a></p></div>
    <div class="note-card"><h3>How replies work</h3><ol class="nums"><li><b>You post</b> a question, problem or idea on GitHub.</li><li><b>We reply there</b>, in public, usually within a few days.</li><li><b>You get an email</b> from GitHub when someone answers.</li></ol><p class="small muted">A free GitHub account is needed to post. Nothing is sent until you press the final button on GitHub.</p></div>
  </div>
</div></section>
"""


def form_page(kind, intro, fields, button):
    return f"""<section class="section tight"><div class="wrap narrow">
  <form class="gh-form card" data-gh-issue="{BUG}" data-kind="{kind}">
    <p class="muted">{intro}</p>
    {fields}
    <button class="btn primary lg" type="submit">{button}</button>
    <p class="small muted">This opens GitHub in a new tab with your words filled in. Press <b>Create</b> there to send it. A free GitHub account is needed. Nothing is sent until you press it.</p>
    <p class="form-ok callout good" hidden>GitHub is open in a new tab. Press Create there to send. Thank you.</p>
  </form>
</div></section>"""


def fld(label, name, kind="text", opts=None, req=False, hint=""):
    r = " required" if req else ""
    h = f'<small>{hint}</small>' if hint else ""
    fid = "f-" + "".join(c for c in name.lower() if c.isalnum())
    if kind == "area":
        ctl = f'<textarea id="{fid}" name="{name}" rows="4"{r}></textarea>'
    elif kind == "select":
        ctl = f'<select id="{fid}" name="{name}"{r}><option value="">Choose one</option>' + "".join(f"<option>{o}</option>" for o in opts) + "</select>"
    elif kind == "stars":
        return f'<fieldset class="fld rate"><legend>{label}</legend>' + "".join(f'<label><input type="radio" name="{name}" value="{v} of 5"{r if v == 1 else ""}><span>{v}</span></label>' for v in range(1, 6)) + f'<small>1 is very hard, 5 is very easy</small></fieldset>'
    else:
        ctl = f'<input id="{fid}" name="{name}" type="text"{r}>'
    return f'<div class="fld"><label for="{fid}">{label}</label>{h}{ctl}</div>'


PARTS = ["Home page", "Instagram report", "YouTube report", "Twitch report", "Beginner's guide", "Growth guide", "Something else"]
FEEDBACK = page_hero("Give feedback", "Tell us what to keep and what to change", "Two minutes. Every message is read, and the best ideas get built.", "Give feedback") + form_page("Feedback",
    "Be as blunt as you like. Short answers are fine.",
    fld("In one line, what's your feedback?", "title", req=True) + fld("Which part did you use?", "Part used", "select", PARTS) + fld("How easy was it?", "Ease", "stars")
    + fld("What worked well?", "What worked", "area") + fld("What should change?", "What to change", "area"), "Send feedback on GitHub")
REPORT = page_hero("Report a problem", "Something broke? Tell us.", "The more exact you are, the faster it gets fixed. Please don't include passwords or private numbers.", "Report a problem") + form_page("Problem",
    "Answer what you can. Skip what you don't know.",
    fld("What went wrong, in one line?", "title", req=True, hint="For example: the YouTube upload says no rows found") + fld("Which part?", "Part", "select", PARTS)
    + fld("What did you do?", "Steps", "area", hint="The buttons you pressed, in order") + fld("What happened?", "What happened", "area") + fld("What did you expect?", "Expected", "area")
    + fld("Device", "Device", "select", ["Phone", "Computer", "Tablet"]) + fld("Browser", "Browser", hint="For example: Chrome on Android"), "Send report on GitHub")

GITHUB = page_hero("GitHub project", "Free, open source and yours to copy", "Every line of code is public under the MIT licence. Use it, change it, or help build it.", "GitHub project") + f"""
<section class="section tight"><div class="wrap">
  <div class="gh-stats" data-gh-repo="Siddharthmehdiratta/creator-growth-studio">
    <div><b data-gh="stars">…</b><span>Stars</span></div><div><b data-gh="forks">…</b><span>Copies (forks)</span></div><div><b data-gh="issues">…</b><span>Open issues</span></div><div><b data-gh="updated">…</b><span>Last update</span></div><div><b data-gh="license">…</b><span>Licence</span></div>
  </div>
  <p class="gh-actions"><a class="btn primary lg" href="{REPO}"><svg aria-hidden="true"><use href="#i-gh"/></svg>Open on GitHub</a><a class="btn lg" href="{REPO}/stargazers">Give it a star</a></p>
  <div class="split">
    <div><h2>What's inside</h2>
      <ul class="tree"><li><b>docs/</b><span>This website and the report tool. Plain HTML, CSS and JavaScript.</span></li>
        <li><b>connect/</b><span>The small Instagram connector (a free Cloudflare Worker). Stores nothing.</span></li>
        <li><b>skills/</b><span>Claude Code skills: the Python engine, the AI boardroom and the platform rules.</span></li>
        <li><b>tests/</b><span>Automatic checks for the maths, the connector and every page.</span></li></ul></div>
    <div><h2>Run your own copy</h2>
      <ol class="nums"><li><b>Fork it.</b> Press Fork on GitHub. It's free.</li><li><b>Turn on Pages.</b> Settings, then Pages, then branch main and folder /docs.</li><li><b>Open your site.</b> It works straight away with uploads. For username lookup, follow CONNECT-INSTAGRAM.md.</li></ol>
      <pre class="code"><code>git clone {REPO}.git
cd creator-growth-studio/docs
python3 -m http.server 8000</code></pre></div>
  </div>
  <h2>Help build it</h2>
  <div class="cards3">
    <a class="c6" href="{REPO}/stargazers"><span class="f-ic orange"><svg aria-hidden="true"><use href="#i-star"/></svg></span><h3>Star the repo</h3><p>It helps other creators find it.</p></a>
    <a class="c6" href="report.html"><span class="f-ic pink"><svg aria-hidden="true"><use href="#i-flag"/></svg></span><h3>Report a problem</h3><p>Bugs get fixed faster with exact steps.</p></a>
    <a class="c6" href="{REPO}/pulls"><span class="f-ic violet"><svg aria-hidden="true"><use href="#i-code"/></svg></span><h3>Send a change</h3><p>Open a pull request. Tests run on every change.</p></a>
  </div>
</div></section>
"""

if __name__ == "__main__":
    write("index.html", "Creator Growth Studio: see which posts grow your account, and why", "Free. Pick Instagram, YouTube or Twitch and get a star rating for every post, why it worked, what to post next and a 30-day plan.", HOME, "index.html", dark=True)
    write("features.html", "Features tour: Creator Growth Studio", "Star ratings for every post, why each worked, what to post next, a 30-day plan, comments sorted, an AI boardroom and an audience health check.", FEATURES, "features.html")
    write("how-it-works.html", "How it works: Creator Growth Studio", "How your numbers become a report: every way to bring data, how the stars are worked out, how patterns are tested, and where your data goes.", HOW, "how-it-works.html")
    write("guide.html", "Beginner's guide: your first report in 7 steps", "New to growth tools? Get your first report in 7 short steps, one at a time.", BEGIN, "guide.html")
    write("growth-guide.html", "Growth guide 2026: Instagram, YouTube and Twitch", "What the platforms and the biggest studies say about growing in 2026, with sources and steps.", GUIDE, "growth-guide.html")
    write("faq.html", "FAQ: Creator Growth Studio", "Answers about getting started, Instagram connection, star ratings, YouTube, Twitch, privacy and brand checks.", FAQ, "faq.html")
    write("help.html", "Help centre: Creator Growth Studio", "Every way to get help: beginner's guide, FAQ, ask a question, report a problem, give feedback.", HELP, "help.html")
    write("feedback.html", "Give feedback: Creator Growth Studio", "Tell us what to keep and what to change.", FEEDBACK, "feedback.html")
    write("report.html", "Report a problem: Creator Growth Studio", "Something broke? Tell us exactly what happened.", REPORT, "report.html")
    write("github.html", "GitHub project: Creator Growth Studio", "Free and open source under MIT. Stars, licence, what's inside and how to run your own copy.", GITHUB, "github.html")
    # refresh shared header and footer on hand-made pages
    for name in ["start.html", "sample-boardroom.html"]:
        p = DOCS / name
        if not p.exists():
            continue
        s = p.read_text()
        if "<!--HEADER-->" in s and "<!--/HEADER-->" in s:
            a, b = s.index("<!--HEADER-->") + 13, s.index("<!--/HEADER-->")
            s = s[:a] + "\n" + header(name if name == "start.html" else "") + s[b:]
        if "<!--FOOTER-->" in s and "<!--/FOOTER-->" in s:
            a, b = s.index("<!--FOOTER-->") + 13, s.index("<!--/FOOTER-->")
            s = s[:a] + "\n" + FOOT.replace('<script src="site.js"></script>\n</body>\n</html>\n', '') + s[b:]
        p.write_text(s)
        print("refreshed", name)
