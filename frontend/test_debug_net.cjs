const { chromium } = require('@playwright/test');
async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log('FAILED REQ:', response.url(), response.status());
      response.text().then(t => console.log('BODY:', t)).catch(()=>{});
    }
  });
  
  await page.goto('http://localhost:5173/admin/login');
  await page.fill('input[type=\"email\"]', 'kargaradmin@kargarfm.com');
  await page.fill('input[type=\"password\"]', 'Abhishek@2005');
  await page.click('button[type=\"submit\"]');
  await page.waitForTimeout(3000);
  
  await browser.close();
}
runTests();
