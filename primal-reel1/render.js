// Usage: node render.js [stills|video]  — stills writes one frame per shot for review.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const FPS = 30;
(async () => {
  const mode = process.argv[2] || 'stills';
  const tl = JSON.parse(fs.readFileSync('timeline.json'));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await p.goto('file://' + process.cwd() + '/scene.html');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  await p.evaluate(t => window.setTL(t), tl);
  if (mode === 'stills') {
    fs.mkdirSync('stills', { recursive: true });
    for (const s of tl.shots) {
      const at = s.s + (s.e - s.s) * 0.72;
      await p.evaluate(T => draw(T), at);
      await p.screenshot({ path: `stills/${s.id}.jpg`, type: 'jpeg', quality: 80 });
    }
    // frame 0 (the hook frame)
    await p.evaluate(() => draw(0.0)); await p.screenshot({ path: 'stills/_frame0.jpg', type: 'jpeg', quality: 80 });
  } else {
    const n = Math.ceil(tl.total * FPS);
    const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', 'video_noaudio.mp4']);
    ff.stderr.pipe(process.stderr);
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      await p.evaluate(T => draw(T), i / FPS);
      const buf = await p.screenshot({ type: 'jpeg', quality: 92 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 150 === 0) console.log(`frame ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  await b.close();
})();
