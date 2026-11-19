"""End-to-end test of the whole report in a real browser (Chrome), desktop and phone.
Run: python3 tests/e2e/report_flow.py http://localhost:8765/"""
import sys, asyncio
from playwright.async_api import async_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8765/creator-growth-studio/"
TABS = ["overview", "posts", "ideas", "plan", "board"]
fails = []
def check(c, msg):
    print(("ok  " if c else "FAIL"), msg)
    if not c: fails.append(msg)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome")
        ctx = await b.new_context(viewport={"width": 1366, "height": 900}, accept_downloads=True, permissions=["clipboard-read", "clipboard-write"])
        pg = await ctx.new_page(); errs = []
        # Outside sites (fonts, GitHub stats) may be blocked in a sandbox: ignore only those network refusals.
        pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: m.type == "error" and "ERR_TUNNEL_CONNECTION_FAILED" not in m.text and errs.append(m.text))
        await pg.goto(BASE)
        check(await pg.locator("h1").count() == 1, "home has one h1")
        check(await pg.locator("a[href$='start.html?p=instagram']").count() == 1 and await pg.locator("a[href$='start.html?p=youtube']").count() == 1, "home lets you pick a platform")
        check(await pg.locator("a.way").count() == 3 and await pg.locator("a.way[href$='profile-review/']").count() == 1, "home offers the free report, the profile review and the post review")
        check("lowping" not in (await pg.content()).lower(), "home never shows the sample account's name")
        PAGES = ["features/", "how-it-works/", "pricing/", "guide/", "growth-guide/", "faq/", "changelog/", "help/", "contact/", "about/", "open-source/", "privacy/", "terms/", "ads/", "growth-plan/", "algorithm/", "post-checker/", "planner/", "connect/", "claude/", "sample/", "experiments/", "profile-review/"]
        for page_ in PAGES:
            await pg.goto(BASE + page_); check(await pg.locator("h1").count() == 1 and await pg.locator("header.site-header nav[aria-label=Main]").count() == 1 and await pg.locator("footer").count() == 1, f"{page_} has a title, the menu and the footer")
        for old, new in [("features.html", "features/"), ("report.html", "contact/#report"), ("github.html", "open-source/")]:
            await pg.goto(BASE + old); await pg.wait_for_timeout(400); check(pg.url.endswith(new), f"old link {old} goes to {new}")
        await pg.goto(BASE + "help/"); await pg.click("button:has-text('Help')"); await pg.wait_for_timeout(300)
        check(await pg.get_by_role("menuitem", name="Report a problem").first.is_visible(), "Help menu opens and lists Report a problem")
        await pg.keyboard.press("Escape")
        await pg.goto(BASE + "contact/"); await pg.fill("#Problem-title", "Upload says no rows")
        async with ctx.expect_page() as newp:
            await pg.click("#report button[type=submit]")
        gh = await newp.value; u = gh.url; await gh.close()
        from urllib.parse import unquote_plus; u = unquote_plus(unquote_plus(u)); check("issues/new" in u and "Upload says no rows" in u, "Report form opens a filled-in GitHub issue")
        await pg.goto(BASE + "profile-review/"); await pg.wait_for_timeout(500)
        check("?" in await pg.text_content("aside"), "profile review shows no score before you answer")
        for cid in ["pro", "name", "bio", "cta", "link", "pinned"]: await pg.locator(f"input[name={cid}][value=yes]").check(force=True)
        await pg.locator("input[name=hook][value=no]").check(force=True); await pg.wait_for_timeout(300)
        side = await pg.text_content("aside"); check("/10" in side and "Fix this first" in side and "Cut the intro" in side, "profile review scores after 6 answers and names the first fix")
        await pg.fill("textarea", "x" * 160); await pg.wait_for_timeout(200); check("160 characters" in await pg.text_content("main"), "a bio over 150 characters is flagged")
        await pg.reload(); await pg.wait_for_timeout(600); check("Fix this first" in await pg.text_content("aside"), "profile review remembers answers after a refresh")
        await pg.goto(BASE + "faq/"); await pg.fill("#q", "password"); await pg.wait_for_timeout(300)
        vis = await pg.locator(".faq-group details").count()
        check(0 < vis < 8, f"FAQ search narrows the questions ({vis} shown)")
        await pg.goto(BASE + "start.html")
        check(await pg.is_visible("#w1") and await pg.locator("[data-plat]").count() == 3, "start page asks the platform first")
        await pg.click("[data-plat=instagram]"); check(await pg.is_visible("#lookup") and await pg.is_hidden("#w1"), "Instagram step shows the username box")
        await pg.click("#w-back"); check(await pg.is_visible("#w1"), "Back returns to the platform step")
        await pg.click("#w1 [data-sample]"); await pg.wait_for_selector("#app:not([hidden])")
        for t in TABS:
            await pg.click(f"#tab-{t}"); txt = await pg.text_content(f"#p-{t}")
            check(len(txt) > 200 and "undefined" not in txt and "NaN" not in txt and "[object" not in txt, f"tab {t} renders clean text")
        await pg.click("#tab-posts")
        rows = await pg.locator(".prow").count(); check(rows == 40, f"40 posts listed ({rows})")
        await pg.select_option("#pf", "top"); top = await pg.locator(".prow").count()
        check(0 < top < 40, f"filter 4 stars and up shows {top}")
        await pg.select_option("#pf", "all"); await pg.select_option("#ps", "best")
        first = await pg.locator(".prow .stars").first.get_attribute("aria-label"); check(first.startswith("10 out of 10"), "best first sorts 10/10 to top")
        await pg.locator(".prow").first.click(); det = await pg.text_content(".pdetail")
        check("Your usual" in det and ("Why it worked" in det or "About normal" in det), "post detail shows numbers vs usual and reasons")
        await pg.fill("#cm-text", "part 2 please\nhow much did this cost?\nfollow me for promo\nthis is fire\nworst video"); await pg.click("#cm-run")
        out = await pg.text_content("#cm-out")
        check(all(k in out for k in ["Requests", "Questions", "Spam", "Praise", "Criticism"]), "pasted comments are sorted into 5 kinds")
        await pg.click("#tab-plan")
        await pg.select_option("#g-goal", index=2); check(await pg.locator(".chartbox").count() == 1, "growth chart redraws after changing the goal")
        async with pg.expect_download() as d: await pg.click("#dl-ics")
        ics = open(await (await d.value).path()).read(); check(ics.count("BEGIN:VEVENT") >= 8 and ("Z\r\n" in ics or "Z\n" in ics), "calendar file has events in UTC")
        await pg.click("#tab-board"); await pg.click("#copy-board")
        clip = await pg.evaluate("navigator.clipboard.readText()"); check(len(clip) > 1500 and "@lowping.rohan" in clip, f"boardroom message copied ({len(clip)} chars)")
        await pg.click("#open-adjust"); await pg.select_option("#a-niche", "tech"); await pg.click("#adjust-save")
        await pg.click("#tab-ideas"); check("tech" in (await pg.text_content("#p-ideas")).lower(), "changing niche in Adjust updates ideas")
        await pg.focus("#tab-ideas"); await pg.keyboard.press("ArrowRight"); check(await pg.get_attribute("#tab-plan", "aria-selected") == "true", "arrow keys move between tabs")
        await pg.reload(); await pg.wait_for_selector("#app:not([hidden])"); check(True, "report survives a page reload")
        await pg.click("#new-file"); check(await pg.is_visible("#w1"), "New report returns to the platform step")
        # YouTube
        await pg.goto(BASE + "start.html?p=youtube"); check(await pg.is_visible("#drop-yt"), "YouTube step asks for the Studio export")
        await pg.click("[data-sample-yt]"); await pg.wait_for_selector("#app:not([hidden])")
        types = await pg.evaluate("[...new Set(CGS_APP.audit().reports.map(r => r.type))].sort().join(',')")
        check(types == "short,video", f"YouTube Shorts and videos rated separately ({types})")
        check("Typical views" in await pg.text_content("#p-overview"), "YouTube overview talks about views")
        await pg.click("#new-file")
        # Twitch, typed by hand
        await pg.goto(BASE + "start.html?p=twitch")
        rows = [("2026-11-01", "20:00", "Ranked night", "12", "3", "6", "400"), ("2026-11-03", "21:00", "Chill", "8", "2", "2", "150"), ("2026-11-07", "19:00", "Launch hype", "20", "4", "14", "900")]
        for i, r in enumerate(rows):
            for j, v in enumerate(r):
                await pg.locator("#tw-rows tr").nth(i).locator("input").nth(j).fill(v)
        await pg.click("#tw-go"); await pg.wait_for_selector("#app:not([hidden])")
        a = await pg.evaluate("CGS_APP.audit()")
        check(a["posts"] == 3 and a["reports"][0]["type"] == "stream", "Twitch streams typed by hand become a report")
        await pg.click("#tab-posts"); check("viewer-hours" in await pg.text_content("#p-posts"), "Twitch report uses viewer-hours, not reach")
        await pg.click("#new-file"); await pg.goto(BASE + "start.html?p=twitch"); await pg.click("[data-sample-tw]"); await pg.wait_for_selector("#app:not([hidden])")
        check((await pg.evaluate("CGS_APP.audit()"))["posts"] == 16, "Twitch sample streamer loads")
        check(not errs, f"no console errors on desktop: {errs[:3]}")
        # phone: nothing wider than the screen on any tab
        ph = await b.new_page(viewport={"width": 360, "height": 780}, is_mobile=True, has_touch=True); perr = []
        ph.on("pageerror", lambda e: perr.append(str(e)))
        for page_ in ["", "features/", "how-it-works/", "pricing/", "guide/", "growth-guide/", "faq/", "changelog/", "help/", "contact/", "about/", "open-source/", "privacy/", "start.html"]:
            await ph.goto(BASE + page_); wide = await ph.evaluate("document.documentElement.scrollWidth"); check(wide <= 360, f"{page_ or 'home'} fits a 360px phone ({wide})")
        await ph.goto(BASE); await ph.click("button[aria-label='Open the menu']"); await ph.wait_for_timeout(400)
        check(await ph.locator("nav[aria-label=Mobile] a").count() >= 17, "phone Menu lists every page")
        await ph.keyboard.press("Escape"); await ph.goto(BASE + "start.html")
        await ph.click("#w1 [data-sample]"); await ph.wait_for_selector("#app:not([hidden])")
        for t in TABS:
            await ph.evaluate(f"document.getElementById('tab-{t}').click()"); await ph.wait_for_timeout(100)
            wide = await ph.evaluate("document.documentElement.scrollWidth"); check(wide <= 360, f"phone tab {t} fits ({wide}px)")
        check(not perr, f"no errors on phone: {perr[:3]}")
        await b.close()
    print("\nFAILED: %d" % len(fails) if fails else "\nall report checks passed"); sys.exit(1 if fails else 0)
asyncio.run(main())
