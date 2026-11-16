# Primal Studios: prehistoric "what if" production kit

Everything for the Primal channel (YouTube @primal_studios8 and the Facebook page), built with **Remotion + three.js** and free, open-source voice and audio tools.

## Where things are
| Folder | What it holds |
|---|---|
| `30-day-content-plan.md` | The 30-day content plan, with ★ ideas first |
| `awaken-studios-analysis.md`, `primal-growth-plan.md`, `TOOLKIT-2D-whatif.md` | Channel research and the growth plan |
| `remotion-studio/` | The Remotion project: 3D scene kit (`src/v01/kit.tsx`), Neanderthal sets (`src/v07/`), Ifverse-style thumbnails (`src/thumbs/`), rendered thumbnails (`out/*.png`) |
| `v07-neanderthal/` | **"What If You Were the Last Neanderthal?"** (v3): script, voices, timeline, audio mix, publishing kit (`PUBLISH.md`), thumbnails, research |
| `v01-1280/`, `v02-500iq/`, `v04-50k/` | Publishing kits, scripts and thumbnails for the other ★ videos |
| `primal-video1/`, `primal-video2/`, `primal-reel1/`, `a6-gap/` | Earlier scripts, reels and plans |

## Last Neanderthal v3: what's in it
- **Script:** Ifverse format, beat for beat. 1,097 words and 66 speaker changes, at 110 wpm overall.
- **Voices:** Kokoro TTS. Michael narrates, plus 8 character voices.
- **Sound:** a soft, continuous score that changes by story section, with music drops on the 2 big beats. No ambience beds; sound effects only on visible events.
- **Visuals:** close-ups that face each character's actual direction, brighter night and cave scenes, a new burial camera.
- **Length:** 9:58 at 1080p, −16 LUFS.

The final MP4s are too large for GitHub (over 100 MB). They were sent through the Claude app.

## Rebuild the Neanderthal video
```
cd v07-neanderthal
python3 voice_kokoro.py am_michael   # voices  (pip install --no-deps kokoro misaki; apt install espeak-ng)
python3 words.py                     # word timings (faster-whisper)
python3 build_timeline.py 1.6        # timeline → remotion-studio/src/v07/timeline.json
python3 audio.py                     # music + SFX + voice mix → remotion-studio/public/v07/mix.wav
cd ../remotion-studio && npm install
npx remotion render src/index.ts V07-Neanderthal out/v07.mp4 --gl=swangle
npx remotion still src/index.ts T-NEA-F out/T-NEA-F.png --gl=swangle   # thumbnail F
```
