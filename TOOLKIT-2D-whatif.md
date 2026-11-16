# Toolkit for 2D "what if" animation like Awaken's

What Awaken's first (2D) video is built from: **flat vector characters** (bean people), **flat vector sets** in a muted dusk palette, **animated infographics** (counters, chalkboards, maps, chips), **big burned-in captions**, and **fast cuts**. Below are the tools that produce each layer. I can't see which software Awaken itself uses; these are the tools that produce this exact look.

## Installed in this cloud workspace (working, used to make reel 1)
| Layer | Tool | Status |
|---|---|---|
| Vector character and set art | **Inkscape** | ✅ |
| 2D animation (rigged vector) | **Synfig Studio** | ✅ |
| 2D animation, Grease Pencil, 2.5D sets | **Blender** | ✅ |
| Frame-by-frame drawing and painting | **Krita** | ✅ |
| Infographic and math animation (counters, charts, maps) | **Manim** v0.22 | ✅ |
| Code-driven 2D animation renderer (what built the reel) | **SVG + Playwright + ffmpeg** pipeline in `primal-reel1/` | ✅ |
| Narration (free AI voices) | **Piper TTS**: ryan (US male), lessac, northern English male | ✅ |
| Auto captions with word timing | **faster-whisper** (small.en) | ✅ |
| Editing, mixing, encoding | **ffmpeg**, **MoviePy** | ✅ |
| OpenToonz, Glaxnimate | ❌ not available from this server's package source | |

This workspace is temporary. It's deleted when the session ends, so the real setup belongs on your Mac:

## Install on your Mac
Install Homebrew first (https://brew.sh), then:
```bash
brew install ffmpeg
```
```bash
brew install --cask blender inkscape krita synfig opentoonz davinci-resolve capcut figma
```
```bash
pip3 install manim piper-tts faster-whisper moviepy
```

## Paid tools worth it for this style
| Tool | What it's for | Why |
|---|---|---|
| **Adobe After Effects** (+ Illustrator) | The industry standard for flat-vector explainer animation | Character rigs (with the free **Duik** plugin), shape-layer infographics, camera moves |
| **Moho Pro** | 2D character rigging | The fastest way to animate bean characters with reusable rigs |
| **ElevenLabs** | Narration | Much more natural than free voices, which helps retention |
| **CapCut Pro** | Fast captions, editing, music | Animated captions and trending sounds in one place |

## Recommended workflow (one reel a day or more)
1. **Script** (≤130 words, the hook in line 1) → **voice** (ElevenLabs or Piper)
2. **Captions and timing** (faster-whisper or CapCut)
3. **Animate** by reusing a library of characters and sets (After Effects + Duik, Moho, or the code pipeline)
4. **Infographic pops** (After Effects shape layers or Manim)
5. **Edit and mix** (CapCut or DaVinci Resolve), music at about −24 dB under the voice
6. **Export** at 1080×1920, 30 fps, H.264, with no platform watermark
