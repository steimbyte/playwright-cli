import { firefox } from 'playwright';

const browser = await firefox.launch({ headless: false });
console.log('Browser launched, PID:', browser.process().pid);

const page = await browser.newPage();
await page.goto('https://github.com/login');
console.log('Page loaded:', page.url());

// Keep browser alive
console.log('Browser is running. Close terminal to exit.');
await new Promise(() => {});
