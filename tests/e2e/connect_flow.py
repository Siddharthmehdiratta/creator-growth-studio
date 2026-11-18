"""End-to-end test of the Instagram flows with a fake connector (no network).
Run: python3 tests/e2e/connect_flow.py http://localhost:8765/   (the built site, served under /creator-growth-studio/)"""
import sys, json, csv, asyncio, re, urllib.parse
from pathlib import Path
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8765/creator-growth-studio/"
API = "https://connector.test"
rows = list(csv.DictReader(open(Path(__file__).parents[2] / "docs/data/sample-instagram-export.csv", encoding="utf-8-sig")))
def iso(t):  # "08/20/2026 16:00" in IST -> Instagram's UTC timestamp
    from datetime import datetime, timedelta
    d = datetime.strptime(t, "%m/%d/%Y %H:%M") - timedelta(hours=5, minutes=30)
    return d.strftime("%Y-%m-%dT%H:%M:%S+0000")
def n(x):
    try: return float(x)
    except: return None
media = [{"id": str(1000 + i), "caption": r["Description"], "type": "VIDEO" if r["Post type"].lower().startswith("reel") else "IMAGE",
          "product": "REELS" if r["Post type"].lower().startswith("reel") else "FEED", "time": iso(r["Publish time"]),
          "link": "https://www.instagram.com/p/x%d/" % i, "thumb": "", "likes": int(n(r["Likes"]) or 0), "comments": int(n(r["Comments"]) or 0),
          "views": int(n(r["Views"]) or 0) if r["Post type"].lower().startswith("reel") else None} for i, r in enumerate(rows)]
ins = {m["id"]: {"reach": n(r["Reach"]), "views": n(r["Views"]), "likes": n(r["Likes"]), "comments": n(r["Comments"]), "shares": n(r["Shares"]),
                 "saved": n(r["Saves"]), "follows": n(r["Follows"]), "ig_reels_avg_watch_time": (n(r["Average watch time (sec)"]) or 0) * 1000 or None,
                 "reels_skip_rate": n(r["Skip rate (%)"])} for m, r in zip(media, rows)}
account = {"username": "lowping.rohan", "name": "Rohan", "followers": 2282, "following": 310, "posts": len(media), "picture": ""}
seen = []

async def handle(route):
    u = urllib.parse.urlparse(route.request.url); q = urllib.parse.parse_qs(u.query); seen.append(u.path)
    auth = route.request.headers.get("authorization", "")
    def ok(b, s=200): return route.fulfill(status=s, content_type="application/json", headers={"access-control-allow-origin": "*"}, body=json.dumps(b))
    if u.path == "/lookup":
        if q["u"][0] == "private.person": return await ok({"error": "We couldn't read @private.person. Only public Creator and Business accounts can be looked up."}, 404)
        return await ok({"mode": "public", "account": account, "media": media})
    if not auth.startswith("Bearer "): return await ok({"error": "Not connected."}, 401)
    if u.path == "/account": return await ok({"mode": "connected", "account": account, "media": media})
    if u.path == "/insights":
        ids = [x.split(":")[0] for x in q["ids"][0].split(",")]
        assert len(ids) <= 20
        return await ok({"rows": [{"id": i, "v": ins[i]} for i in ids]})
    if u.path == "/comments":
        return await ok({"comments": {media[0]["id"]: ["part 2 please!", "how did you get this price?", "fire 🔥", "follow me for promo"]}})
    return await ok({"error": "?"}, 404)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome")
        fails = []
        async def page():
            pg = await b.new_page(viewport={"width": 1280, "height": 900}, timezone_id="Asia/Kolkata")
            errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.route("**/config.js", lambda r: r.fulfill(content_type="text/javascript", body=f'window.CGS_CONFIG={{connectUrl:"{API}"}};'))
            await pg.route(API + "/**", handle)
            return pg, errs
        def check(c, msg):
            print(("ok  " if c else "FAIL"), msg)
            if not c: fails.append(msg)

        # 1. public lookup from a pasted link
        pg, errs = await page(); await pg.goto(BASE + "start.html?p=instagram")
        await pg.fill("#handle", "https://www.instagram.com/lowping.rohan/"); await pg.click("#lookup button"); await pg.wait_for_selector("#app:not([hidden])", timeout=5000)
        meta = await pg.text_content("#acct-meta"); check("public numbers" in meta, "public lookup opens report: " + meta)
        ov = await pg.text_content("#p-overview")
        check("Typical likes" in ov and "Typical reach" not in ov, "public overview shows likes, not reach")
        check("Public numbers only" in ov, "public honesty note shown")
        check("Audience health check" in ov, "audience health check shown")
        await pg.click("#tab-posts"); await pg.click(".prow")
        det = await pg.text_content(".pdetail")
        check("per 1,000 followers" in det and "Reach" not in det.split("Why")[0][:40], "public detail relabels per follower")
        check(not errs, "no page errors (public): %s" % errs); await pg.close()

        # 2. connected flow via the login redirect fragment
        seen.clear(); pg, errs = await page(); await pg.goto(BASE + "#ig=TESTTOKEN")
        await pg.wait_for_selector("#app:not([hidden])", timeout=8000)
        check(seen.count("/insights") == 2, "insights fetched in batches of 20: %d calls" % seen.count("/insights"))
        check("live from Instagram" in (await pg.text_content("#acct-meta")), "connected label")
        check(await pg.evaluate("location.hash.indexOf('TESTTOKEN') < 0"), "token removed from the address bar")
        check(await pg.evaluate("location.pathname.endsWith('start.html')"), "login from the home page lands on the start page")
        a = await pg.evaluate("CGS_APP.audit()")
        check(a["posts"] == 40 and any(r["post"]["avg_watch"] for r in a["reports"]), "40 posts with watch time")
        tz = await pg.evaluate("Intl.DateTimeFormat().resolvedOptions().timeZone")
        first = await pg.evaluate("CGS_APP.audit().reports.map(r => r.time).sort()[0]")
        check(first.startswith("2026-08-20"), f"UTC timestamps turned into local time ({tz}): {first}")
        await pg.click("#tab-posts"); pt = await pg.text_content("#p-posts")
        check("What your comments say" in pt and "Requests" in pt, "comments read automatically and sorted")
        check(not errs, "no page errors (connected): %s" % errs); await pg.close()

        # 3. errors are explained, not swallowed
        pg, errs = await page(); await pg.goto(BASE + "start.html?p=instagram")
        await pg.fill("#handle", "private.person"); await pg.click("#lookup button"); await pg.wait_for_selector("#load-err:not([hidden])")
        check("Only public Creator and Business" in await pg.text_content("#load-err"), "private account explained")
        await pg.fill("#handle", "instagram.com/p/ABC"); await pg.click("#lookup button")
        check("Type an Instagram username" in await pg.text_content("#load-err"), "post link rejected with help")
        check(await pg.is_hidden("#busy"), "loading overlay closed after errors")
        await pg.close()

        # 4. without a connector, the box explains what to do instead
        pg = await b.new_page(); await pg.goto(BASE + "start.html?p=instagram")
        await pg.fill("#handle", "natgeo"); await pg.click("#lookup button")
        check("being switched on" in await pg.text_content("#load-err") and await pg.is_visible("#export-help"), "no connector: points to the export")
        await b.close()
        print("\nFAILED: %d" % len(fails) if fails else "\nall connect-flow checks passed"); sys.exit(1 if fails else 0)
asyncio.run(main())
