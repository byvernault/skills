#!/usr/bin/env node
// Signs in to a web app as one user, opens a route, and saves a screenshot and an ARIA snapshot for each theme × width.
// Project settings come from the repository's .claude/verify/config.json (see templates/config.json). Usage, from the repo root:
//   node <verify>/scripts/shot.mjs --user admin --path /admin \
//     [--themes light,dark] [--widths 1440,375] [--wait 'h1'] [--steps <module.mjs>] [--element <selector>]
//     [--viewport] [--label <name>] [--out <dir>] [--front <url>] [--config <file>] [--headed]
// Prints one line per artifact. Exits 1 when the page is not the requested one (login failed, wrong route, error page).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright-core';

const { values: args } = parseArgs({
  options: {
    config: { type: 'string', default: '.claude/verify/config.json' },
    front: { type: 'string' },
    user: { type: 'string' },
    path: { type: 'string', default: '/' },
    themes: { type: 'string' },
    widths: { type: 'string' },
    wait: { type: 'string' },
    element: { type: 'string' },
    out: { type: 'string' },
    label: { type: 'string' },
    steps: { type: 'string' },
    viewport: { type: 'boolean', default: false },
    headed: { type: 'boolean', default: false },
  },
});

const config = existsSync(args.config) ? JSON.parse(readFileSync(args.config, 'utf8')) : {};
const front = args.front ?? config.front ?? 'http://localhost:4200';
const login = config.login ?? { type: 'none' };
const theme = config.theme ?? null; // { storageKey, darkClass, values: { light: 'light', dark: 'dark' } }
const themes = (args.themes ?? (theme ? 'light,dark' : 'default')).split(',');
const widths = (args.widths ?? (config.widths ?? [1440, 375]).join(',')).split(',').map(Number);
const errorPattern = config.errorPattern ? new RegExp(config.errorPattern, 'i') : null;
const user = args.user ?? login.defaultUser ?? 'anonymous';
const username = login.emailDomain && !user.includes('@') ? `${user}@${login.emailDomain}` : user;
const password = process.env.VERIFY_PASSWORD ?? login.password ?? '';

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const project = config.name ?? basename(process.cwd());
const out = args.out ?? join(process.env.TMPDIR ?? '/tmp', 'verify', project, stamp);
const label = args.label ?? (args.path.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home');
mkdirSync(out, { recursive: true });

async function signIn(page) {
  if (login.type !== 'form') return;
  // The sign-in form comes first in every new context when the app redirects to it.
  if (!new RegExp(login.urlMatch).test(page.url())) return;
  await page.fill(login.usernameSelector, username);
  await page.fill(login.passwordSelector, password);
  await page.click(login.submitSelector);
}

const browser = await chromium.launch({ headless: !args.headed });
let failed = false;
try {
  for (const t of themes) {
    for (const width of widths) {
      const context = await browser.newContext({
        viewport: { width, height: width < 768 ? 812 : 900 },
        locale: config.locale ?? 'en-US',
      });
      // Force the theme before the app's first render, when the app reads it from localStorage.
      if (theme?.storageKey && t !== 'default')
        await context.addInitScript(
          ([key, value]) => localStorage.setItem(key, value),
          [theme.storageKey, theme.values?.[t] ?? t],
        );
      const page = await context.newPage();
      await page.goto(new URL(args.path, front).href);
      await signIn(page);
      if (!page.url().startsWith(front))
        await page.waitForURL((url) => url.href.startsWith(front), { timeout: 20_000 }).catch(() => {
          throw new Error(`Stuck on ${page.url()}${login.hint ? `: ${login.hint}` : ''}`);
        });
      await page.waitForLoadState('networkidle');
      if (args.wait) await page.locator(args.wait).first().waitFor({ timeout: 15_000 });

      const base = join(out, `${label}_${user.split('@')[0]}_${t}_${width}`);
      const shot = async (name) => {
        await page.screenshot({ path: `${base}_${name}.png`, fullPage: !args.viewport });
        console.log(`step ${base}_${name}.png`);
      };
      if (args.steps)
        await (await import(pathToFileURL(resolve(args.steps)).href)).default(page, { theme: t, width, shot });

      const finalPath = new URL(page.url()).pathname;
      const title = await page.title();
      const heading =
        (await page.locator('h1').first().textContent({ timeout: 2_000 }).catch(() => ''))?.trim() ?? '';
      await page.screenshot({ path: `${base}.png`, fullPage: !args.viewport });
      writeFileSync(`${base}.aria.yml`, await page.locator('body').ariaSnapshot());

      const problems = [];
      if (theme?.darkClass && t !== 'default') {
        const dark = await page.evaluate((c) => document.documentElement.classList.contains(c), theme.darkClass);
        if (dark !== (t === 'dark')) problems.push(`${theme.darkClass}=${dark}`);
      }
      if (args.path !== '/' && !args.steps && finalPath !== new URL(args.path, front).pathname)
        problems.push(`landed on ${finalPath}`);
      if (errorPattern?.test(`${title} ${heading}`)) problems.push(`page "${heading || title}"`);

      if (args.element) {
        const el = page.locator(args.element).first();
        await el.screenshot({ path: `${base}_element.png` });
        const box = await el.boundingBox();
        console.log(`element ${base}_element.png  ${Math.round(box.width)}×${Math.round(box.height)} at ${Math.round(box.x)},${Math.round(box.y)}`);
      }

      failed ||= problems.length > 0;
      console.log(`${problems.length ? 'FAIL' : 'ok  '} ${base}.png  [${title}] ${problems.join(', ')}`);
      await context.close();
    }
  }
} finally {
  await browser.close();
}
console.log(`evidence: ${out}`);
process.exit(failed ? 1 : 0);
