#!/usr/bin/env node

import { firefox } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROFILE_DIR = path.join(__dirname, '.browser-profile');
const PID_FILE = path.join(__dirname, '.browser.pid');

async function main() {
  // Check if already running
  if (existsSync(PID_FILE)) {
    const pid = parseInt(readFileSync(PID_FILE, 'utf8'));
    try {
      process.kill(pid, 0);
      console.log('Browser already running with PID:', pid);
      process.exit(0);
    } catch (e) {}
  }
  
  // Clean up
  if (existsSync(PROFILE_DIR)) {
    const { rmSync } = await import('fs');
    rmSync(PROFILE_DIR, { recursive: true, force: true });
  }
  mkdirSync(PROFILE_DIR, { recursive: true });
  
  // Launch browser
  const browser = await firefox.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport: { width: 1280, height: 800 }
  });
  
  // Save PID
  writeFileSync(PID_FILE, process.pid.toString());
  
  console.log('Browser started with PID:', process.pid);
  
  // Keep alive
  await new Promise(() => {});
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
