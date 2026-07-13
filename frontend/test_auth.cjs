const { chromium } = require('@playwright/test');

async function runTests() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const frontendUrl = 'http://localhost:5173';
  let passed = true;

  try {
    // 1. Navigate to Login Page
    console.log('1. Navigating to login page...');
    await page.goto(`${frontendUrl}/admin/login`);
    await page.waitForLoadState('networkidle');

    // 2. Test Non-Admin Login
    console.log('2. Testing non-admin login...');
    await page.fill('input[type="email"]', 'nonadmin@kargarfm.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // Wait for either a redirect or an error message
    await page.waitForTimeout(2000);
    const currentUrlAfterNonAdmin = page.url();
    if (currentUrlAfterNonAdmin.includes('/admin/login')) {
      console.log('✅ Non-admin login correctly denied (stayed on login page).');
    } else {
      console.error('❌ Non-admin login unexpectedly succeeded! URL:', currentUrlAfterNonAdmin);
      passed = false;
    }

    // 3. Test Admin Login
    console.log('3. Testing admin login...');
    await page.goto(`${frontendUrl}/admin/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'kargaradmin@kargarfm.com');
    await page.fill('input[type="password"]', 'Abhishek@2005');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForNavigation({ url: '**/admin', timeout: 5000 }).catch(() => {});
    const currentUrlAfterAdmin = page.url();
    if (currentUrlAfterAdmin === `${frontendUrl}/admin` || currentUrlAfterAdmin === `${frontendUrl}/admin/`) {
      console.log('✅ Admin login succeeded (redirected to dashboard).');
    } else {
      console.error('❌ Admin login failed! URL:', currentUrlAfterAdmin);
      passed = false;
    }

    // 4. Test Session Persistence
    console.log('4. Testing session persistence on refresh...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const currentUrlAfterRefresh = page.url();
    if (currentUrlAfterRefresh === `${frontendUrl}/admin` || currentUrlAfterRefresh === `${frontendUrl}/admin/`) {
      console.log('✅ Session persisted after refresh.');
    } else {
      console.error('❌ Session did NOT persist! URL:', currentUrlAfterRefresh);
      passed = false;
    }

    // 5. Test Logout
    console.log('5. Testing logout...');
    // Look for logout button (e.g., text "Logout" or something similar)
    const logoutBtn = await page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign Out")').first();
    if (await logoutBtn.count() > 0) {
      await logoutBtn.click();
      await page.waitForNavigation({ url: '**/admin/login', timeout: 5000 }).catch(() => {});
      const urlAfterLogout = page.url();
      if (urlAfterLogout.includes('/admin/login')) {
        console.log('✅ Logout succeeded (redirected to login page).');
      } else {
        console.error('❌ Logout failed! URL:', urlAfterLogout);
        passed = false;
      }
    } else {
      console.error('❌ Logout button not found!');
      passed = false;
    }

    // 6. Test Password Reset UI
    console.log('6. Testing Password Reset UI...');
    await page.goto(`${frontendUrl}/admin/login`);
    await page.waitForLoadState('networkidle');
    const forgotPwdBtn = await page.locator('text="Forgot password?"').first();
    if (await forgotPwdBtn.count() > 0) {
      await forgotPwdBtn.click();
      await page.waitForTimeout(1000);
      await page.fill('input[type="email"]', 'kargaradmin@kargarfm.com');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      console.log('✅ Password Reset UI submitted successfully without crashing.');
    } else {
      console.error('❌ Forgot Password link not found!');
      passed = false;
    }

  } catch (err) {
    console.error('❌ Test script threw an error:', err);
    passed = false;
  } finally {
    await browser.close();
    if (passed) {
      console.log('🎉 ALL TESTS PASSED!');
    } else {
      console.log('⚠️ SOME TESTS FAILED.');
      process.exit(1);
    }
  }
}

runTests();
