import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  page.on('response', async (response) => {
    if (!response.ok() && response.status() >= 400 && response.status() !== 401 && response.status() !== 403) {
      const req = response.request();
      if (req.url().includes('supabase')) {
        console.log(`\n[FAILED REQUEST] ${req.method()} ${req.url()} (Status: ${response.status()})`);
        
        const postData = req.postData();
        if (postData) {
          console.log(`[REQUEST PAYLOAD] ${postData.substring(0, 1000)}`);
        }

        try {
          const body = await response.text();
          console.log(`[RESPONSE BODY] ${body.substring(0, 1000)}`);
        } catch (e) {
          console.log(`[RESPONSE BODY] Could not read body`);
        }
      }
    }
  });

  try {
    console.log("Navigating to http://localhost:5173");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    
    // Fill the form
    console.log("Filling out the form...");
    await page.fill('input[name="customerName"]', 'John Doe');
    await page.fill('input[name="companyName"]', 'Acme Corp');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.fill('input[name="location"]', 'New York');
    
    // We need to wait for services to load in the select
    await page.waitForSelector('select[name="serviceId"] option:not([value=""])', { timeout: 10000 });
    
    // Select the first valid option
    const firstOption = await page.$eval('select[name="serviceId"] option:not([value=""])', el => el.value);
    await page.selectOption('select[name="serviceId"]', firstOption);
    console.log("Selected serviceId:", firstOption);

    await page.fill('input[name="reviewTitle"]', 'Great service overall');
    await page.fill('textarea[name="reviewText"]', 'The service was absolutely fantastic. They did a really great job and I highly recommend them to anyone looking for this kind of work. Extremely professional and courteous.');
    
    console.log("Clicking submit...");
    await page.click('button:has-text("Submit Review")');
    
    // Wait for requests to settle
    await page.waitForTimeout(5000);
    console.log("Finished waiting for requests.");
    
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
