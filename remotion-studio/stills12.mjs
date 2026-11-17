import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import fs from 'fs';
const TL = JSON.parse(fs.readFileSync('src/v12/timeline.json'));
const chrome = process.env.CHROME;
const serveUrl = await bundle({entryPoint: 'src/index.ts'});
const browser = await openBrowser('chrome', {browserExecutable: chrome, chromiumOptions: {gl: 'swangle'}});
const composition = await selectComposition({serveUrl, id: 'V12-Half', puppeteerInstance: browser});
fs.mkdirSync('out/v12stills', {recursive: true});
const picks = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
const seen = new Set();
for (const l of TL.lines) {
  const key = l.set + ':' + l.cam;
  if (picks ? !picks.includes(l.i) : seen.has(l.set)) continue;
  seen.add(l.set);
  const frame = Math.round((l.s + (l.e - l.s) * 0.55) * 24);
  await renderStill({serveUrl, composition, frame, output: `out/v12stills/${String(l.i).padStart(3, '0')}_${l.set}_${l.cam}.jpg`, imageFormat: 'jpeg', jpegQuality: 75, puppeteerInstance: browser});
}
await browser.close({silent: true});
console.log('done');
