import asyncio, os, sys
from playwright.async_api import async_playwright

ROOT = "/home/claude/holidayinn-site"
OUT = "/home/claude/qa_shots_r3"
os.makedirs(OUT, exist_ok=True)

WIDTHS = [375, 768, 900, 1024, 1100, 1150, 1180, 1200, 1280, 1440]
PAGES = ["index.html", "amenities.html", "local-area.html", "events.html"]

async def block_external(route):
    if route.request.url.startswith("file://"):
        await route.continue_()
    else:
        await route.abort()

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
        report = []
        for pg in PAGES:
            for w in WIDTHS:
                page = await browser.new_page(viewport={"width": w, "height": 900})
                await page.route("**/*", block_external)
                url = "file://" + os.path.join(ROOT, pg)
                await page.goto(url)
                await page.wait_for_timeout(150)
                doc_w = await page.evaluate("document.documentElement.scrollWidth")
                win_w = await page.evaluate("window.innerWidth")
                overflow = doc_w > win_w
                # check nav wrap: are all main-nav links on one line?
                nav_wrap = await page.evaluate("""
                  () => {
                    const links = Array.from(document.querySelectorAll('.main-nav a'));
                    if (!links.length) return false;
                    const tops = new Set(links.map(a => Math.round(a.getBoundingClientRect().top)));
                    return tops.size > 1 && getComputedStyle(document.querySelector('.main-nav')).position !== 'fixed';
                  }
                """)
                cta_visible = await page.evaluate("""
                  () => {
                    const el = document.querySelector('.header-cta');
                    if (!el) return null;
                    return getComputedStyle(el).display !== 'none';
                  }
                """)
                bar_visible = await page.evaluate("""
                  () => {
                    const el = document.querySelector('.mobile-book-bar');
                    if (!el) return null;
                    return getComputedStyle(el).display !== 'none';
                  }
                """)
                toggle_visible = await page.evaluate("""
                  () => {
                    const el = document.querySelector('.nav-toggle');
                    if (!el) return null;
                    return getComputedStyle(el).display !== 'none';
                  }
                """)
                fname = os.path.join(OUT, "{}_{}.png".format(pg.replace('.html',''), w))
                await page.screenshot(path=fname, full_page=True)
                report.append((pg, w, overflow, nav_wrap, cta_visible, bar_visible, toggle_visible))
                await page.close()
        await browser.close()
        print("{:<16} {:>6} {:>10} {:>10} {:>12} {:>12} {:>14}".format(
            "page","width","overflow","nav_wrap","cta_visible","bar_visible","toggle_visible"))
        for r in report:
            print("{:<16} {:>6} {:>10} {:>10} {:>12} {:>12} {:>14}".format(*r))

asyncio.run(main())
