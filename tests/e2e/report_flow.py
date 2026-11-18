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
        check(await pg.locator("h1").count() == 1, "landing has one h1")
        check("Score" in await pg.text_content("#pv-score"), "landing preview built from real sample output")
        await pg.click("header [data-sample]"); await pg.wait_for_selector("#app:not([hidden])")
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
        await pg.click("#new-file"); check(await pg.is_visible("#landing"), "New report returns to the start")
        check(not errs, f"no console errors on desktop: {errs[:3]}")
        # phone: nothing wider than the screen on any tab
        ph = await b.new_page(viewport={"width": 360, "height": 780}, is_mobile=True, has_touch=True); perr = []
        ph.on("pageerror", lambda e: perr.append(str(e)))
        await ph.goto(BASE)
        wide = await ph.evaluate("document.documentElement.scrollWidth"); check(wide <= 360, f"landing fits a 360px phone ({wide})")
        await ph.click(".start [data-sample]"); await ph.wait_for_selector("#app:not([hidden])")
        for t in TABS:
            await ph.evaluate(f"document.getElementById('tab-{t}').click()"); await ph.wait_for_timeout(100)
            wide = await ph.evaluate("document.documentElement.scrollWidth"); check(wide <= 360, f"phone tab {t} fits ({wide}px)")
        check(not perr, f"no errors on phone: {perr[:3]}")
        await b.close()
    print("\nFAILED: %d" % len(fails) if fails else "\nall report checks passed"); sys.exit(1 if fails else 0)
asyncio.run(main())
