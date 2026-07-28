import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

(async () => {
  console.log('Starting Playwright review submission test...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to http://localhost:5173/');
    await page.goto('http://localhost:5173/');

    console.log('Waiting for the page to load...');
    await page.waitForLoadState('networkidle');

    console.log('Clicking "Write a Review"...');
    await page.getByRole('button', { name: /Write a Review/i }).click();

    console.log('Waiting for modal to appear...');
    await page.waitForSelector('text=Submit Your Review', { timeout: 10000 });

    console.log('Filling out text inputs...');
    
    await page.getByPlaceholder(/John Doe/i).fill('Jane Doe CEO');
    await page.getByPlaceholder(/Acme Corp/i).fill('Example Corp');
    await page.getByPlaceholder(/john@example.com/i).fill('jane@example.com');
    await page.getByPlaceholder(/Summarize your experience/i).fill('Outstanding Facility Management!');
    await page.getByPlaceholder(/Tell us about your experience/i).fill('We used Kargar Facility Management and they were absolutely fantastic. The team was highly professional and left our building spotless.');

    const fileInputs = await page.locator('input[type="file"]').all();
    console.log('Found', fileInputs.length, 'file inputs');
    
    if (fileInputs.length >= 4) {
      const profilePath = path.resolve('C:/Users/nagar/.gemini/antigravity-ide/brain/ac627d23-6ca1-4883-80bd-2e6601130f9c/profile_photo_1785239489198.png');
      await fileInputs[0].setInputFiles(profilePath);
      console.log('Uploaded Profile Photo');
      
      const logoPath = path.resolve('C:/Users/nagar/.gemini/antigravity-ide/brain/ac627d23-6ca1-4883-80bd-2e6601130f9c/company_logo_1785239506691.png');
      await fileInputs[1].setInputFiles(logoPath);
      console.log('Uploaded Company Logo');
      
      const galleryPaths = [
        path.resolve('gallery_1.png'),
        path.resolve('gallery_2.png'),
        path.resolve('gallery_3.png'),
        path.resolve('gallery_4.png'),
        path.resolve('gallery_5.png')
      ];
      await fileInputs[2].setInputFiles(galleryPaths);
      console.log('Uploaded Gallery Images');
      
      const videoPath = path.resolve('sample_video.mp4');
      await fileInputs[3].setInputFiles(videoPath);
      console.log('Uploaded Video Testimonial');
    } else {
      throw new Error('Not all file inputs were found on the page');
    }

    console.log('Checking permission checkbox...');
    await page.locator('input[type="checkbox"]').check();

    console.log('Submitting form...');
    await page.getByRole('button', { name: /Submit Review/i }).click();

    console.log('Waiting for success toast...');
    await page.waitForSelector('text=Review submitted successfully', { timeout: 30000 });
    console.log('SUCCESS: Review submitted successfully!');

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await browser.close();
  }
})();
