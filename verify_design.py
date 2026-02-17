from playwright.sync_api import sync_playwright

def capture():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 800})

        # Home Page
        page.goto("http://localhost:5173")
        page.wait_for_timeout(1000)
        page.screenshot(path="verification_screenshots/home_dark.png")

        # Light theme Home
        page.evaluate("document.documentElement.classList.remove('dark')")
        page.wait_for_timeout(1000)
        page.screenshot(path="verification_screenshots/home_light.png")

        # Events Page
        page.goto("http://localhost:5173/events")
        page.wait_for_timeout(1000)
        page.screenshot(path="verification_screenshots/events_light.png")

        # Dark theme Events
        page.evaluate("document.documentElement.classList.add('dark')")
        page.wait_for_timeout(1000)
        page.screenshot(path="verification_screenshots/events_dark.png")

        browser.close()

if __name__ == "__main__":
    import os
    if not os.path.exists("verification_screenshots"):
        os.makedirs("verification_screenshots")
    capture()
