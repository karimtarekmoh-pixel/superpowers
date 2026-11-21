#!/usr/bin/env python3
"""make_run.py: make one run folder with its PROMPT.md. See SKILL.md for usage."""
import argparse, json, shutil, subprocess
from datetime import date
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
RUNS = Path.home() / "stickman-runs"
BULKY = {"node_modules", "build", "out", "render", ".frames", "frames"}

def dur(p):
    return float(json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(p)]))["format"]["duration"])

def ts(x):
    ms = int(round(x * 1000)); return f"{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d},{ms%1000:03d}"

def main():
    a = argparse.ArgumentParser()
    a.add_argument("--voice", required=True); a.add_argument("--words", required=True)
    a.add_argument("--script", required=True); a.add_argument("--facts", required=True)
    a.add_argument("--name", required=True); a.add_argument("--vertical", action="store_true")
    a.add_argument("--notes", default=""); a.add_argument("--change", default=""); a.add_argument("--last", default="")
    o = a.parse_args()
    run = RUNS / f"{o.name}-{date.today().isoformat()}"; n = 2
    while run.exists():
        run = RUNS / f"{o.name}-{date.today().isoformat()}-{n}"; n += 1
    run.mkdir(parents=True)
    shutil.copy(o.voice, run / "voiceover.wav")
    L = dur(run / "voiceover.wav"); frames = round(L * 30); L = frames / 30
    W = json.load(open(o.words))
    (run / "words.srt").write_text("".join(f"{i+1}\n{ts(w['s'])} --> {ts(w['e'])}\n{w['w']}\n\n" for i, w in enumerate(W)))
    shutil.copy(o.script, run / "script.txt"); shutil.copy(o.facts, run / "facts.md")
    ignore = shutil.ignore_patterns(*BULKY, "*.mp4", "*.wav")
    shutil.copytree(SKILL / "style", run / "reference", ignore=ignore)
    last = ""
    if o.last:
        shutil.copytree(o.last, run / "last", ignore=ignore, dirs_exist_ok=True)
        last = f"\nChanges the channel owner wants: \"{o.change}\"\nThe last/ folder has the code and notes of the last version (never its video). Start from that code. Change only what they asked for, keep everything else exactly the same.\n"
    size = "1080x1920 (vertical, 9:16), with no letterbox bars, and every element inside the safe zone in reference/BRAND.md" if o.vertical else "1920x1080"
    notes = f"\nThe channel owner's own wishes, in their words: \"{o.notes}\"\n" if o.notes else ""
    prompt = f"""Make a {L:.1f}-second animated explainer video to play over a voiceover, in exactly the same style as the reference. Go all out: show what an incredible motion designer you are.

The reference/ folder has stills from the reference video (frames/, each file name is the second it comes from), contact sheets of those stills (sheets/), the channel's rules (BRAND.md) and reusable drawing code (approved-look/code/). Read BRAND.md first. Study the stills closely before you start: how the characters and objects are drawn, the line thickness, the colors, the background, how text shows up, how scenes change, the pace, and how each picture matches the words said at that moment. Make yours look and move the same way, with your own drawings. Never copy the reference channel's logos, channel name, watermark or on-screen text. Never draw real company logos.

The voiceover is voiceover.wav in this folder, {L:.1f} seconds long. What is said and when: script.txt and words.srt (word by word). Every picture must match what is being said at that moment, and change when the idea changes. facts.md lists the verified facts and the exact commands: show only those, spelled exactly like that.
{notes}{last}
No music. Sound effects only where they help, made in code and quiet (about one fifth of the volume you would normally use), so the voice stays clear. Do not put the voiceover itself in the video; it is added later.

Before you finish, compare stills from your video with the reference stills side by side and fix anything that does not match the style. Check frames at every moment with a command, number or date and make sure each shows exactly the verified value.

Deliver in this folder: broll.mp4, {size}, 30 frames a second, exactly {L:.1f} seconds long ({frames} frames), plus a short HOW-I-MADE-IT.md. Keep the code you used in a folder named work/ here.
Finish the render before you stop: this session ends when you stop, and anything still running in the background is lost.
"""
    (run / "PROMPT.md").write_text(prompt)
    print(run)

main()
