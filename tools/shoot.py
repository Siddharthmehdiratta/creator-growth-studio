"""Re-shoots the report screenshots with a neutral account name (the sample name stays inside the sample report only)."""
import asyncio, sys
from playwright.async_api import async_playwright
from PIL import Image
BASE="http://localhost:8765/creator-growth-studio/"; OUT=sys.argv[1]
SWAP="""()=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){n.nodeValue=n.nodeValue.replace(/@?lowping\\.rohan/gi,'@your.account').replace(/, fictional sample/,'')}
document.querySelectorAll('.ah-av, .acct-av, #acct-av').forEach(e=>{if(e.textContent.trim()==='L')e.textContent='Y'});
document.querySelectorAll('span,div,b,i').forEach(e=>{if(e.children.length===0&&e.textContent.trim()==='L')e.textContent='Y'; if(e.children.length===0&&e.textContent.trim()==='Fictional sample')e.remove()})}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome")
        for suffix,vp in (("",{"width":1280,"height":800}),("-phone",{"width":390,"height":844})):
            ctx=await b.new_context(viewport=vp,device_scale_factor=2); pg=await ctx.new_page()
            await pg.goto(BASE+"start.html?sample=1"); await pg.wait_for_selector("#app:not([hidden])"); await pg.wait_for_timeout(1200)
            for tab in ["overview","posts","ideas","plan","board"]:
                await pg.click(f"#tab-{tab}"); await pg.wait_for_timeout(700); await pg.evaluate(SWAP); await pg.evaluate("window.scrollTo(0,0)")
                f=f"{OUT}/{tab}{suffix}.png"; await pg.screenshot(path=f)
                if tab=="posts":
                    await pg.select_option("#ps","best"); await pg.locator(".prow").first.click(); await pg.wait_for_timeout(700); await pg.evaluate(SWAP)
                    await pg.screenshot(path=f"{OUT}/post{suffix}.png")
                    await pg.locator(".prow").first.click(); await pg.select_option("#ps",index=0)
            txt=(await pg.content()).lower(); print(suffix or "desktop","lowping left in page:", "lowping" in txt)
            await ctx.close()
        await b.close()
    import glob
    for f in glob.glob(OUT+"/*.png"):
        im=Image.open(f).convert("RGB"); im.save(f,optimize=True); im.save(f[:-4]+".webp",quality=82,method=6); print(f.split("/")[-1],im.size)
asyncio.run(main())
