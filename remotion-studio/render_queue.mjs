// Resumable render queue: renders each video in ~50 s chunks, skips chunks already on disk,
// then concatenates and muxes the mix. Safe to re-run after a container restart.
// Exits on its own after MAX_MIN minutes so it fits inside a background-task window.
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition, openBrowser} from '@remotion/renderer';
import fs from 'fs';
import {execFileSync} from 'child_process';

const QUEUE = [
  ['V10-30Days', 'v10', 'v10_30_days_ancient_humans'],
  ['V11-BroughtBack', 'v11', 'v11_brought_back_neanderthal'],
  ['V12-Half', 'v12', 'v12_50_percent_neanderthal'],
  ['V13-Africa', 'v13', 'v13_never_left_africa'],
  ['V14-IceAges', 'v14', 'v14_every_ice_age'],
];
const CHUNK = 1200, MAX_MIN = Number(process.env.MAX_MIN || 105), T0 = Date.now();
const chrome = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const dur = (f) => {try {return Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());} catch {return 0;}};
const left = () => MAX_MIN - (Date.now() - T0) / 60000;

const todo = QUEUE.filter(([, , out]) => !fs.existsSync(`out/${out}.mp4`));
if (!todo.length) {console.log('QUEUE EMPTY'); process.exit(0);}
const serveUrl = await bundle({entryPoint: 'src/index.ts'});
const browser = await openBrowser('chrome', {browserExecutable: chrome, chromiumOptions: {gl: 'swangle'}});
let stopped = false;
for (const [id, dir, out] of todo) {
  const composition = await selectComposition({serveUrl, id, puppeteerInstance: browser});
  const F = composition.durationInFrames, cdir = `out/chunks/${id}`;
  fs.mkdirSync(cdir, {recursive: true});
  const n = Math.ceil(F / CHUNK);
  for (let c = 0; c < n; c++) {
    const a = c * CHUNK, b = Math.min(F, a + CHUNK) - 1, file = `${cdir}/c${String(c).padStart(3, '0')}.mp4`;
    if (fs.existsSync(file) && Math.abs(dur(file) - (b - a + 1) / 24) < 0.2) continue;
    if (left() < 14) {stopped = true; break;}
    const t = Date.now();
    await renderMedia({serveUrl, composition, codec: 'h264', crf: 20, muted: true, frameRange: [a, b], outputLocation: file + '.part.mp4', concurrency: 4, puppeteerInstance: browser, logLevel: 'error'});
    fs.renameSync(file + '.part.mp4', file);
    console.log(`${id} chunk ${c + 1}/${n} done in ${((Date.now() - t) / 60000).toFixed(1)} min`);
  }
  if (stopped) break;
  const list = Array.from({length: n}, (_, c) => `file 'c${String(c).padStart(3, '0')}.mp4'`).join('\n');
  fs.writeFileSync(`${cdir}/list.txt`, list);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', `${cdir}/list.txt`, '-i', `public/${dir}/mix.wav`, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', `out/${out}.tmp.mp4`]);
  const d = dur(`out/${out}.tmp.mp4`);
  if (Math.abs(d - F / 24) > 1) {console.log(`${id} MUX LENGTH WRONG ${d} vs ${F / 24}`); process.exit(2);}
  fs.renameSync(`out/${out}.tmp.mp4`, `out/${out}.mp4`);
  fs.rmSync(cdir, {recursive: true, force: true});
  console.log(`VIDEO DONE ${out} ${d.toFixed(1)}s`);
}
await browser.close({silent: true});
fs.rmSync(serveUrl, {recursive: true, force: true});
console.log(stopped ? 'PAUSED (time window) — run again to resume' : 'QUEUE FINISHED');
