import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import fs from 'fs';
const ids = (process.argv[2] || 'LAST,50K,30D,BACK,HALF,AFRICA,ICE').split(',');
const serveUrl = await bundle({entryPoint: 'src/index.ts'});
const browser = await openBrowser('chrome', {browserExecutable: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', chromiumOptions: {gl: 'swangle'}});
for (const n of ids) {
  const composition = await selectComposition({serveUrl, id: `TB-${n}`, puppeteerInstance: browser});
  await renderStill({serveUrl, composition, output: `out/bright/TB-${n}.png`, puppeteerInstance: browser});
  console.log('ok', n);
}
await browser.close({silent: true}); fs.rmSync(serveUrl, {recursive: true, force: true});
