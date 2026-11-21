---
name: stickman-explainer
description: Makes a video over a voiceover that mixes footage made fresh for each video (screen captures of real public pages, code-built app and terminal scenes, optional AI-generated clips cut fast to the words with short labels) with stickman explainer animation (flat drawn scenes and navy diagram boards with a black stick figure in an orange jacket), timed word by word to the voice. Use whenever the user sends a voiceover (MP3/WAV/M4A) or a script and wants the edit, visuals, footage, b-roll or motion graphics for it, or asks to change or redo such a video.
---

# Stickman explainer videos

The user records or generates a voiceover (Higgsfield, ElevenLabs...). You turn it into an animated video timed to every word.

## How it works

0. **The format: half footage, half stickman.** Footage where the voice talks about the real thing (an app, a page, a result), cut fast (a shot every 1 to 2.5 s) with short bold labels; stickman scenes and navy boards where it explains (steps, comparisons, numbers, limits). Switch every few seconds. You make the footage for every new video (Step 3); no footage is ever reused from another video or taken from someone else's video.
1. **Voice first.** Measure word times from the voice (faster-whisper, see Setup). Trim pauses over about 0.8 s if the user wants a target length. Time always comes from measurements, never guesses.
2. **A clean run makes the video.** One fresh folder, a short brief (`PROMPT.md`), the voice, the word timings, the style (`style/`). Run it with `scripts/run_sealed.py` (the newest Opus model at extra-high thinking, nothing from the user's own setup loaded). A focused model with a clean brief does better motion design than a long conversation patching frames. You never draw or edit the video yourself: a change is a new run carrying the user's exact words.
3. **Facts first.** Every command, number and claim shown on screen must match what the voice says and what the official sources say. Check them before the run and put the verified facts in the brief.

## Setup (once)

`python3 scripts/check_setup.py`. Needs ffmpeg, node, a Chrome/Chromium for rendering, the `claude` command signed in, and `faster-whisper` (`pip install faster-whisper`; download the `Systran/faster-whisper-small.en` model files into a folder; on this cloud machine use `curl --cacert /root/.ccr/ca-bundle.crt`). If faster-whisper's audio loader fails, decode with ffmpeg to 16 kHz mono float32 and pass the array.

## Step 3. Make the footage for this video (before the run)

Write `footage/plan.md` (one line per clip: name, what it shows, the words it fits, length) and make about 15 to 30 short clips per 45 seconds in `footage/`, then check each one frame by frame (a contact sheet) and write `footage/README.md` for the run. Ways to make clips, cheapest first:
1. **Screen captures of real public pages** (docs, product pages, articles): headless Chrome with puppeteer-core, scroll or zoom to the exact line, record as numbered frames, encode to mp4. Name the page in the README. Never capture logged-in or private pages.
2. **Code-built scenes**: a terminal typing a command, a chat window, a dashboard, drawn in HTML/canvas and rendered the same way. Only show output you have verified is real; anything illustrative is labelled ILLUSTRATION on screen and in the README.
3. **AI-generated clips** (Higgsfield or similar): only when the first two cannot show the idea. Show the credit cost first and wait for the user's go. Never real people, real brands or real logos.
Never use video taken from other creators or companies, and nothing with watermarks or other logos.

## Make a video

`python3 scripts/make_run.py --voice <wav> --words <words.json> --script <text> --facts <facts.md> --name <topic> [--vertical] [--footage <folder>] [--notes "<their exact wishes>"] [--change "<their exact words>" --last <previous run folder>]`

It makes `~/stickman-runs/<name>-<date>/` with `PROMPT.md`, `voiceover.wav`, `words.srt`, `script.txt`, `facts.md`, `footage/` (the clips and README from Step 3), `reference/` (a copy of `style/`) and, for a redo, `last/`. Then:

1. Start `python3 scripts/run_sealed.py "<run>"` in the background.
2. Watch with `python3 scripts/watch_run.py "<run>"` (progress every 15 minutes, `STALLED`, `OVERAGE`, `LIMIT`). On `OVERAGE` stop and ask before any paid usage.
3. When it ends, check `broll.mp4` (size, length, frames at every number and command shown), then mux the voice: `ffmpeg -i broll.mp4 -i voiceover.wav -c:v copy -c:a aac -shortest preview.mp4`.
4. Look at the contact sheet against `style/BRAND.md` before showing anything. A clear failure is a redo with that fix as the change.

## Good to know

- Expect 35 to 60 minutes of run per 45 to 90 seconds of video and a large share of a Pro plan's 5-hour window. Never use paid extra usage without asking.
- Wide 16:9 (the default) has thin letterbox bars; vertical Shorts have none and follow the safe-zone rules in `style/BRAND.md`.
- Footage is made fresh for each video (Step 3). Third-party video is never used. Real screenshots of public pages are fine when the source is named.
- To change the look for good, write it in the last section of `style/BRAND.md` in the user's words.
