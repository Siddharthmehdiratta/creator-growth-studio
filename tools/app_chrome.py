"""Gives the report app (start.html) and the sample boardroom a simple header and footer that match the website.
Run: python3 tools/app_chrome.py   (edits site/public/start.html and site/public/sample-boardroom.html in place)"""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
SPRITE = (ROOT / "tools" / "sprite.html").read_text()
HEADER = SPRITE + """
<a class="skip" href="#main">Skip to content</a>
<header class="top site-bar">
  <div class="wrap">
    <a class="logo" href="./"><svg aria-hidden="true"><use href="#i-logo"/></svg>Creator Growth Studio</a>
    <nav class="bar-nav" aria-label="Main"><a href="features/">Features</a><a href="guide/">Beginner's guide</a><a href="help/">Help</a><a href="contact/">Contact</a></nav>
    <div class="right"><a class="btn sm" href="help/">Help</a><a class="btn sm ghost" href="./">Back to site</a></div>
  </div>
</header>
"""
FOOTER = """<footer class="bar-foot"><div class="wrap"><span>Creator Growth Studio. Free and open source (MIT).</span><nav aria-label="Footer"><a href="./">Home</a><a href="faq/">FAQ</a><a href="contact/#report">Report a problem</a><a href="privacy/">Privacy</a></nav></div></footer>
"""
for name in ["start.html", "sample-boardroom.html"]:
    p = ROOT / "site" / "public" / name
    s = p.read_text()
    a, b = s.index("<!--HEADER-->") + 13, s.index("<!--/HEADER-->")
    s = s[:a] + "\n" + HEADER + s[b:]
    a, b = s.index("<!--FOOTER-->") + 13, s.index("<!--/FOOTER-->")
    s = s[:a] + "\n" + FOOTER + s[b:]
    p.write_text(s)
    print("updated", name)
