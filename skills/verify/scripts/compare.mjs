#!/usr/bin/env node
// Puts a mockup region and the same region of a capture side by side, with their difference, in one PNG.
//   node <verify>/scripts/compare.mjs --mockup design/admin@2x.png --scale 2 --region 0,64,1440,720 \
//     --capture $TMPDIR/verify/.../admin_admin_light_1440.png [--capture-region x,y,w,h] --out compare.png
// --region is in mockup pixels after --scale (1x); without it, the whole mockup. The capture takes the same region
// unless --capture-region is given. The third panel is the difference: black where both agree, bright where they don't.
import { readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright-core';

const { values: args } = parseArgs({
  options: {
    mockup: { type: 'string' },
    capture: { type: 'string' },
    region: { type: 'string' },
    'capture-region': { type: 'string' },
    scale: { type: 'string', default: '1' },
    out: { type: 'string', default: 'comparison.png' },
  },
});
if (!args.mockup || !args.capture) {
  console.error('Usage: compare.mjs --mockup <png> --capture <png> [--region x,y,w,h] [--capture-region x,y,w,h] [--scale n] [--out <png>]');
  process.exit(2);
}

const dataUri = (file) =>
  `data:image/${extname(file).slice(1).replace('jpg', 'jpeg')};base64,${readFileSync(resolve(file)).toString('base64')}`;
const region = (s) => (s ? s.split(',').map(Number) : null);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  await page.setContent('<body style="margin:0;background:#fff;font:14px sans-serif"></body>');
  const size = await page.evaluate(
    async ({ mockup, capture, scale, mRegion, cRegion }) => {
      const load = (src) => new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; });
      const [m, c] = await Promise.all([load(mockup), load(capture)]);
      const r = mRegion ?? [0, 0, m.naturalWidth / scale, m.naturalHeight / scale];
      const cr = cRegion ?? r;
      const [w, h] = [Math.round(r[2]), Math.round(r[3])];
      const crop = (img, [x, y, rw, rh], s) => {
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, x * s, y * s, rw * s, rh * s, 0, 0, w, h);
        return cv;
      };
      const a = crop(m, r, scale);
      const b = crop(c, cr, 1);
      const d = document.createElement('canvas');
      d.width = w; d.height = h;
      const ctx = d.getContext('2d');
      ctx.drawImage(a, 0, 0);
      ctx.globalCompositeOperation = 'difference';
      ctx.drawImage(b, 0, 0);
      const panel = (title, canvas) => {
        const fig = document.createElement('figure');
        fig.style.cssText = 'margin:0 8px;display:inline-block;vertical-align:top';
        const cap = document.createElement('figcaption');
        cap.textContent = title;
        cap.style.cssText = 'padding:4px 0;font-weight:600';
        canvas.style.cssText = 'display:block;outline:1px solid #888';
        fig.append(cap, canvas);
        return fig;
      };
      const row = document.createElement('div');
      row.style.cssText = 'white-space:nowrap;padding:8px 0';
      row.append(panel('Mockup', a), panel('Capture', b), panel('Difference', d));
      document.body.append(row);
      return { width: row.scrollWidth, height: row.scrollHeight, w, h };
    },
    {
      mockup: dataUri(args.mockup),
      capture: dataUri(args.capture),
      scale: Number(args.scale),
      mRegion: region(args.region),
      cRegion: region(args['capture-region']),
    },
  );
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.screenshot({ path: args.out, fullPage: true });
  console.log(`comparison ${resolve(args.out)}  region ${size.w}×${size.h}`);
} finally {
  await browser.close();
}
