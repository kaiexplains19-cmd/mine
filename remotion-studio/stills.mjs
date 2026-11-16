import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'fs';
const TL = JSON.parse(fs.readFileSync('src/v01/timeline.json'));
const chrome = process.env.CHROME;
const serveUrl = await bundle({entryPoint: 'src/index.ts'});
const composition = await selectComposition({serveUrl, id: 'V01-1280', browserExecutable: chrome, chromiumOptions: {gl: 'swangle'}});
fs.mkdirSync('out/v01stills', {recursive: true});
const only = process.argv[2] ? process.argv[2].split(',') : null;
for (const s of TL.shots) {
  if (only && !only.includes(s.id)) continue;
  const frame = Math.round((s.s + (s.e - s.s) * 0.6) * 24);
  await renderStill({serveUrl, composition, frame, output: `out/v01stills/${s.id}.jpg`, imageFormat: 'jpeg', jpegQuality: 80, browserExecutable: chrome, chromiumOptions: {gl: 'swangle'}});
  console.log('still', s.id, frame);
}
