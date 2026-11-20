---
name: arc-lab-series
description: Produce an episode of Arc Lab, a science-and-experiments YouTube series, end to end - pick the topic, script it, package the title and thumbnail, render the video, write the description, chapters and Shorts, and log the episode so the series stays consistent. Use for "/arc-lab-series", "make the next Arc Lab episode", "Arc Lab episode about X", or any request to plan, script, produce or publish an Arc Lab video.
---

# Arc Lab Series

Arc Lab is a science and experiments explainer series. This skill runs one episode from idea to upload-ready files, and keeps every episode on-format by reading and updating two files next to this one:

- [series bible](references/series-bible.md): the format, voice, look and rules of the show. Its rules apply to every step.
- [episode log](references/episode-log.md): every episode made so far. Use it to avoid repeating topics and to set up callbacks and the next episode.

Read both before doing anything else.

## Arguments

`/arc-lab-series [topic] [--stage <stage>] [--short]`

- No topic: pick one in stage 1.
- `--stage` restarts a run already in the log at one stage (`topic`, `script`, `package`, `produce`, `publish`).
- `--short`: a standalone 45-60 s vertical episode instead of the main format.

## First run: finish the bible

If the bible still has `TODO` fields (channel handle, host or narrator voice, production engine, look), ask for all of them in one `AskUserQuestion` before stage 1. Offer the defaults already written in the bible as the recommended options. Write the answers into the bible so later runs don't ask again.

## Pipeline

Announce each stage in one line as it starts. Stop for the user's approval at the three gates marked **GATE**. Everything between gates runs without asking.

### 1. Topic

If the user gave a topic, check it against the log for repeats and go to stage 2.

Otherwise, find candidates:
1. If the vidIQ tools are connected (`mcp__vidIQ__*`, load with ToolSearch), use `vidiq_outliers` and `vidiq_keyword_research` on the niche terms in the bible, following the `yt-viral` skill's method: rank by how far each video beat its own channel, then name the formula.
2. Without vidIQ, use `yt-viral` with web search.

Drop anything already in the log or failing the bible's safety rules. Present 4-5 candidates, each with the question it answers, the on-screen demo or visual centerpiece, why it should work (outlier evidence), and the risk.

**GATE 1: the user picks a topic.**

### 2. Script

Run the `yt-script` skill on the chosen topic, with the bible's episode structure as the beat sheet:

- Score hook options with `yt-script`'s formulas, and open on the experiment's most surprising visual moment, not on an intro.
- Fill every beat in the bible's structure, at the bible's target length.
- Every claim gets a source. Put the sources in a list at the bottom of the script; they become the description's sources section later.
- Apply the safety rules: any experiment a viewer could copy gets the on-screen warning line, and nothing gives build steps for high-voltage, explosive or toxic setups.
- Write the end-of-episode tease for the next episode. If nothing is planned yet, tease the strongest leftover candidate from stage 1.

### 3. Package

Run `yt-package` on the script: three title and thumbnail pairings, linted, that follow the bible's packaging rules. If vidIQ is connected, score them with `vidiq_score_title`.

**GATE 2: the user approves the script and one pairing.** Apply edits and show only the changed parts again.

### 4. Produce

Use the engine named in the bible:

- **Stickman Director (this repo)**: invoke the skill in `skills/directing-stickman-videos/SKILL.md` and follow its contract exactly, with the bible's style choice (default B5 Character Explainer), ratio and voice. Hand it the approved script as the source. Its own setup gates and acceptance reviews still apply; don't skip them.
- **OpenMontage**: if `OpenMontage/` isn't next to this repo, clone `https://github.com/OpenMontageInc/OpenMontage` beside it. Read its `AGENT_GUIDE.md` and run the `animated-explainer` pipeline as that guide requires: preflight, provider menu, music plan, stage directors. Use the project id `arc-lab-<episode-number>-<slug>` and pass the approved script into the script stage, so it isn't rewritten.

Either way, apply the bible's look: palette, the title card, lower-thirds for each new term, and the end card.

If the engine is blocked (a missing API key, no renderer), say exactly what's missing and stop at this stage. Record the stage as `blocked` in the log; never fake a render.

**GATE 3: the user watches the render and approves or asks for fixes.**

### 5. Publish kit

Run these on the final script or render transcript, and write all outputs into the episode folder:

- `yt-seo`: description (with the sources list and safety note), tags.
- `yt-chapters`: chapters validated against YouTube's rules.
- `yt-shorts`: 2-3 Shorts cut from the episode, each self-contained.

Don't upload or publish anything. Uploading is the user's call; offer it once if vidIQ upload tools are connected.

### 6. Log

Add the episode to the log, with its number, date, topic, title, status per stage, files and next-episode tease. Then commit the episode folder and log update on the current branch, and tell the user what's left for them to do.

## Episode folder

Write all text deliverables to `arc-lab/episodes/<NN>-<slug>/` at the repo root:

```
script.md        approved script with sources
package.md       chosen title and thumbnail plus the rejected options
publish.md       description, tags, chapters
shorts.md        Shorts scripts and timecodes
```

Rendered media stays in the engine's own project folder (it's large and regenerable). `publish.md` records the path to the final MP4.
