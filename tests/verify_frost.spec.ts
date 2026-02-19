import { test, expect } from '@playwright/test';

test('frosted header scroll effect', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Give it a moment to load and for JS to initialize
  await page.waitForTimeout(1000);

  // Take screenshot at top (should be clear)
  await page.screenshot({ path: 'header-top.png' });

  // Scroll down
  await page.evaluate(() => window.scrollTo(0, 500));

  // Wait for transition/scroll to settle
  await page.waitForTimeout(500);

  // Take screenshot scrolled down (should be frosted)
  await page.screenshot({ path: 'header-scrolled.png' });

  // Verify CSS variables on the header
  const header = page.locator('.site-header');
  const alpha = await header.evaluate((el) => getComputedStyle(el).getPropertyValue('--frost-alpha'));
  const blur = await header.evaluate((el) => getComputedStyle(el).getPropertyValue('--frost-blur'));

  console.log(`Scrolled alpha: ${alpha}`);
  console.log(`Scrolled blur: ${blur}`);

  expect(parseFloat(alpha)).toBeGreaterThan(0.8);
  expect(blur).toBe('20.00px');
});
