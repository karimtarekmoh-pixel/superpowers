---
name: stickman-explainer
description: Makes a short animated explainer video over a voiceover in the stickman style (flat drawn scenes and navy diagram boards with a black stick figure in an orange jacket, real page screenshots framed as browser windows, quiet code-made sound effects), timed word by word to the voice. Use whenever the user sends a voiceover (MP3/WAV/M4A) or a script and wants the visuals, animation, b-roll or motion graphics for it in this style, or asks to change or redo such a video.
---

# Stickman explainer videos

The user records or generates a voiceover (Higgsfield, ElevenLabs...). You turn it into an animated video timed to every word.

## How it works

1. **Voice first.** Measure word times from the voice (faster-whisper, see Setup). Trim pauses over about 0.8 s if the user wants a target length. Time always comes from measurements, never guesses.
2. **A clean run makes the video.** One fresh folder, a short brief (`PROMPT.md`), the voice, the word timings, the style (`style/`). Run it with `scripts/run_sealed.py` (the newest Opus model at extra-high thinking, nothing from the user's own setup loaded). A focused model with a clean brief does better motion design than a long conversation patching frames. You never draw or edit the video yourself: a change is a new run carrying the user's exact words.
3. **Facts first.** Every command, number and claim shown on screen must match what the voice says and what the official sources say. Check them before the run and put the verified facts in the brief.

## Setup (once)

`python3 scripts/check_setup.py`. Needs ffmpeg, node, a Chrome/Chromium for rendering, the `claude` command signed in, and `faster-whisper` (`pip install faster-whisper`; download the `Systran/faster-whisper-small.en` model files into a folder; on this cloud machine use `curl --cacert /root/.ccr/ca-bundle.crt`). If faster-whisper's audio loader fails, decode with ffmpeg to 16 kHz mono float32 and pass the array.

## Make a video

`python3 scripts/make_run.py --voice <wav> --words <words.json> --script <text> --facts <facts.md> --name <topic> [--vertical] [--notes "<their exact wishes>"] [--change "<their exact words>" --last <previous run folder>]`

It makes `~/stickman-runs/<name>-<date>/` with `PROMPT.md`, `voiceover.wav`, `words.srt`, `script.txt`, `facts.md`, `reference/` (a copy of `style/`) and, for a redo, `last/`. Then:

1. Start `python3 scripts/run_sealed.py "<run>"` in the background.
2. Watch with `python3 scripts/watch_run.py "<run>"` (progress every 15 minutes, `STALLED`, `OVERAGE`, `LIMIT`). On `OVERAGE` stop and ask before any paid usage.
3. When it ends, check `broll.mp4` (size, length, frames at every number and command shown), then mux the voice: `ffmpeg -i broll.mp4 -i voiceover.wav -c:v copy -c:a aac -shortest preview.mp4`.
4. Look at the contact sheet against `style/BRAND.md` before showing anything. A clear failure is a redo with that fix as the change.

## Good to know

- Expect 35 to 60 minutes of run per 45 to 90 seconds of video and a large share of a Pro plan's 5-hour window. Never use paid extra usage without asking.
- Vertical Shorts follow the safe-zone rules in `style/BRAND.md`.
- Third-party video footage is never used. Real screenshots of public pages are fine when the source is named.
- To change the look for good, write it in the last section of `style/BRAND.md` in the user's words.
