const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:5173/');
  
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  
  // Wait a bit for React Query to load
  await new Promise(r => setTimeout(r, 4000));

  const data = await page.evaluate(() => {
    const swiperSlides = document.querySelectorAll('.swiper-slide');
    const visibleSlides = document.querySelectorAll('.swiper-slide-visible');
    const activeSlides = document.querySelectorAll('.swiper-slide-active');
    
    return {
      totalSlides: swiperSlides.length,
      visibleSlides: visibleSlides.length,
      activeSlides: activeSlides.length,
    };
  });

  console.log("DOM INSPECTION RESULT:", data);

  await browser.close();
})();
