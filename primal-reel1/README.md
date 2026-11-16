# Reel 1: "POV: You Wake Up 50,000 Years Ago"

**File:** `reel1_final.mp4` · 1080×1920 (9:16) · 30 fps · 48.9 s · H.264 + AAC

## Problems from your last reel, and the fix in this one
| Problem in the last reel | Fix |
|---|---|
| Opened on a static title card; 68% of people swiped away before 3 seconds | **Frame 1 is the moment itself**: three faces staring down at you, with "POV: YOU WAKE UP 50,000 YEARS AGO" already on screen |
| About 3 minutes long, average watch 5 seconds | **49 seconds**, and the story pays off by 0:30 |
| Looked like 16:9 boxes inside a vertical frame | **True 9:16**, characters fill the frame |
| Long stretches with nothing new on screen | **A cut every 2.5–6 seconds**, plus a pop-up (chip, stamp, counter) every 1–2 seconds inside each shot |
| Jokes without their setup | The story runs in order: wake up → phone → year → can't make fire → the kid does it → crypto → Neanderthal → 2% DNA → grandpa → the dark |
| Hard to follow with the sound off | **Burned-in captions** for every word, key words in orange, kept out of the Reels UI zones |
| No ending or call to action | Ends on "WOULD YOU SURVIVE THE FIRST NIGHT?" + "PART 2 →", over the same shot it opened with, so it **loops** |

## Posting it
- **Caption:** `You wake up 50,000 years ago. No signal. No fire. And three strangers staring at you. Would you survive the first night? 👇`
- **Hashtags (3–5):** `#history #prehistoric #whatif #animation #neanderthal`
- **Cover:** frame 0 (the faces plus the title)
- **First comment, pinned:** `Part 2: the first night. Coming tomorrow. Follow so you don't miss it.`
- **Post the same clean file** to Facebook Reels and TikTok, with no watermark.
- **Check at 24 hours:** 3-second views above 60%, average watch above 15 s. If those hit, make Part 2 straight away.

## Before you post
1. **Replace the voice** if you can. The current narrator is a free offline AI voice (Piper "ryan"). A human or ElevenLabs voiceover will keep more viewers. Re-run the build with your own WAVs in `audio/` (same file names), then run the steps below.
2. **Add music**: a light, curious track at about −24 dB under the voice. Use a track from Facebook's Sound Collection or TikTok's library, so it's licensed for that platform.

## How to rebuild
```bash
python3 build_timeline.py      # timing from audio + captions
node render.js stills           # one review frame per shot → stills/
node render.js video            # full render → video_noaudio.mp4
```
Then mux the video with `audio/final_mix.wav` using ffmpeg (the last step of the build).

## Facts used
- At least 4 kinds of humans ~50,000 years ago (sapiens, Neanderthals, Denisovans, *H. floresiensis*)
- Neanderthals made fire and tools and hunted
- ~1–2% Neanderthal DNA in people with non-African ancestry (the reel says "around 2%… may", with an on-screen footnote)
