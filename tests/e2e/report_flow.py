"""End-to-end test of the whole report in a real browser (Chrome), desktop and phone.
Run: python3 tests/e2e/report_flow.py http://localhost:8765/"""
import sys, asyncio
from playwright.async_api import async_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8765/"
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
        pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: m.type == "error" and errs.append(m.text))
        await pg.goto(BASE)
        check(await pg.locator("h1").count() == 1, "home has one h1")
        check(await pg.locator(".hero .pick-card").count() == 3, "home asks which platform to grow")
        check(await pg.locator(".slide").count() == 5 and await pg.locator(".slide-dots a").count() == 5, "home is 5 full-screen slides with dots")
        await pg.click("#s-home .next-slide"); await pg.wait_for_timeout(900)
        check(await pg.evaluate("document.querySelector('.slide-count').textContent") == "2 / 5", "Next button moves to slide 2")
        PAGES = ["features.html", "how-it-works.html", "guide.html", "growth-guide.html", "faq.html", "help.html", "feedback.html", "report.html", "github.html", "sample-boardroom.html"]
        for page_ in PAGES:
            await pg.goto(BASE + page_); check(await pg.locator("h1").count() == 1 and await pg.locator("header.top .dd").count() == 3, f"{page_} has a title and the shared menu")
        await pg.goto(BASE + "help.html"); await pg.hover(".dd:nth-of-type(3) .dd-btn")
        check(await pg.locator(".dd-menu a").filter(has_text="Report a problem").first.is_visible(), "Help menu opens and lists Report a problem")
        for page_, n in [("features.html", 7), ("how-it-works.html", 5), ("guide.html", 7)]:
            await pg.goto(BASE + page_); check(await pg.locator(".deck-slide").count() == n, f"{page_} is a {n}-slide deck")
            await pg.click(".deck-bar .deck-next"); await pg.wait_for_timeout(700)
            check(await pg.text_content(".deck-count") == f"2 of {n}", f"{page_}: Next goes to slide 2")
        await pg.goto(BASE + "guide.html#b7"); await pg.wait_for_timeout(500)
        check(await pg.is_visible(".deck-bar .deck-done"), "last guide slide offers Start my report")
        await pg.goto(BASE + "report.html"); await pg.fill("#f-title", "Upload says no rows"); 
        async with ctx.expect_page() as newp:
            await pg.click(".gh-form button[type=submit]")
        gh = await newp.value; u = gh.url; await gh.close()
        from urllib.parse import unquote_plus; u = unquote_plus(unquote_plus(u)); check("issues/new" in u and "Upload says no rows" in u, "Report form opens a filled-in GitHub issue")
        await pg.goto(BASE + "faq.html"); await pg.fill("#q", "password"); await pg.wait_for_timeout(100)
        vis = await pg.evaluate("[...document.querySelectorAll('.faq-group details')].filter(d => !d.hidden).length")
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
        first = await pg.locator(".prow .stars").first.get_attribute("aria-label"); check(first.startswith("5"), "best first sorts 5 stars to top")
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
        for page_ in ["", "features.html", "how-it-works.html", "guide.html", "growth-guide.html", "faq.html", "help.html", "feedback.html", "report.html", "github.html", "start.html"]:
            await ph.goto(BASE + page_); wide = await ph.evaluate("document.documentElement.scrollWidth"); check(wide <= 360, f"{page_ or 'home'} fits a 360px phone ({wide})")
        check(await ph.is_visible(".tabbar") and await ph.locator(".tabbar span").count() == 5, "phone shows a labelled tab bar")
        await ph.click(".tabbar [data-sheet-open]"); check(await ph.is_visible("#sheet") and await ph.locator("#sheet .sheet-group a").count() >= 14, "phone Menu opens every destination")
        await ph.click("[data-sheet-close]"); check(await ph.is_hidden("#sheet"), "phone menu closes")
        await ph.click("#w1 [data-sample]"); await ph.wait_for_selector("#app:not([hidden])")
        for t in TABS:
            await ph.evaluate(f"document.getElementById('tab-{t}').click()"); await ph.wait_for_timeout(100)
            wide = await ph.evaluate("document.documentElement.scrollWidth"); check(wide <= 360, f"phone tab {t} fits ({wide}px)")
        check(not perr, f"no errors on phone: {perr[:3]}")
        await b.close()
    print("\nFAILED: %d" % len(fails) if fails else "\nall report checks passed"); sys.exit(1 if fails else 0)
asyncio.run(main())
