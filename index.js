#!/usr/bin/env node

/**
 * Playwright CLI - Fast Firefox commands
 */

import { firefox } from 'playwright';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROFILE_DIR = path.join(__dirname, '.browser-profile');

const args = process.argv.slice(2);
const cmd = args[0];

// Clean profile if needed
function cleanProfile() {
  if (existsSync(PROFILE_DIR)) {
    try {
      rmSync(PROFILE_DIR, { recursive: true, force: true });
    } catch (e) {}
  }
  mkdirSync(PROFILE_DIR, { recursive: true });
}

async function run() {
  try {
    switch (cmd) {
      case 'navigate': case 'goto': {
        cleanProfile();
        const ctx = await firefox.launchPersistentContext(PROFILE_DIR, {
          headless: false,
          args: ['--no-sandbox', '--disable-dev-shm-usage']
        });
        const page = ctx.pages()[0] || await ctx.newPage();
        await page.goto(args[1], { waitUntil: 'domcontentloaded', timeout: 8000 });
        console.log(JSON.stringify({ success: true, url: page.url() }));
        // Browser stays open
        await new Promise(() => {});
        break;
      }
      
      case 'screenshot': case 'shot': {
        if (!existsSync(PROFILE_DIR)) {
          console.error(JSON.stringify({ error: 'Run navigate first' }));
          return;
        }
        const ctx = await firefox.launchPersistentContext(PROFILE_DIR, { headless: false });
        const page = ctx.pages()[0];
        if (!page) { console.error(JSON.stringify({ error: 'No page' })); return; }
        const file = args[1] || `screenshot-${Date.now()}.png`;
        await page.screenshot({ path: file });
        console.log(JSON.stringify({ success: true, path: file }));
        await new Promise(() => {});
        break;
      }
      
      case 'url': {
        if (!existsSync(PROFILE_DIR)) { console.log(''); return; }
        const ctx = await firefox.launchPersistentContext(PROFILE_DIR, { headless: false });
        const page = ctx.pages()[0];
        console.log(page?.url() || '');
        await new Promise(() => {});
        break;
      }
      
      case 'title': {
        if (!existsSync(PROFILE_DIR)) { console.log(''); return; }
        const ctx = await firefox.launchPersistentContext(PROFILE_DIR, { headless: false });
        const page = ctx.pages()[0];
        console.log(await page?.title() || '');
        await new Promise(() => {});
        break;
      }
      
      case 'click': {
        if (!existsSync(PROFILE_DIR)) {
          console.error(JSON.stringify({ error: 'Run navigate first' }));
          return;
        }
        const ctx = await firefox.launchPersistentContext(PROFILE_DIR, { headless: false });
        const page = ctx.pages()[0];
        if (args[2]) await page.goto(args[2], { waitUntil: 'domcontentloaded' });
        await page.click(args[1], { timeout: 5000 });
        console.log(JSON.stringify({ success: true }));
        await new Promise(() => {});
        break;
      }
      
      case 'fill': {
        if (!existsSync(PROFILE_DIR)) {
          console.error(JSON.stringify({ error: 'Run navigate first' }));
          return;
        }
        const ctx = await firefox.launchPersistentContext(PROFILE_DIR, { headless: false });
        const page = ctx.pages()[0];
        if (args[3]) await page.goto(args[3], { waitUntil: 'domcontentloaded' });
        await page.fill(args[1], args[2]);
        console.log(JSON.stringify({ success: true }));
        await new Promise(() => {});
        break;
      }
      
      case 'help': case '--help': case '-h':
        console.log(`pw - Playwright CLI

  navigate <url>       Go to URL (starts browser)
  screenshot [path]    Screenshot
  click <sel>          Click
  fill <sel> <text>   Fill
  url                 Current URL
  title               Page title`);
        break;
        
      default:
        if (!cmd) { console.log('pw - Playwright CLI'); return; }
        console.error(JSON.stringify({ error: `Unknown: ${cmd}` }));
        process.exit(1);
    }
  } catch (e) {
    console.error(JSON.stringify({ error: e.message }));
    process.exit(1);
  }
}

run();
