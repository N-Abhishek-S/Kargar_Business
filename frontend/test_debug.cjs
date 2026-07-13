const { chromium } = require('@playwright/test');
async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:5173/admin/login');
  await page.fill('input[type=\"email\"]', 'kargaradmin@kargarfm.com');
  await page.fill('input[type=\"password\"]', 'Abhishek@2005');
  await page.click('button[type=\"submit\"]');
  await page.waitForTimeout(3000);
  
  const html = await page.content();
  const errorMatch = html.match(/<div[^>]*text-red[^>]*>(.*?)<\/div>/g);
  console.log('Errors on page:', errorMatch);
  console.log('Current URL:', page.url());
  
  await browser.close();
}
runTests();
