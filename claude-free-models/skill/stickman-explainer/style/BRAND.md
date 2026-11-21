# Brand rules for this style

This is the **stickman explainer** style: short videos made over a voiceover, mixing

1. **Explainer animation**: clean flat vector scenes and navy diagram boards with the channel's stick figure. The stills in `frames/` and `sheets/` show the drawn look. Copy how it looks and moves, with your own scenes, characters and diagrams. Never copy their titles, channel name, logos or end card.
2. **Real screenshots** of real pages (docs, product pages, articles) framed as a browser window and zoomed into the part the voice talks about, with key words outlined in coral. No video footage from third parties.

Switch between scenes and boards every few seconds so the video stays varied.

## The helper code

`approved-look/code/` has reusable drawing code from an earlier approved video: `core.js` (easing, gradients, camera, text, boards), `char.js` (the stick-figure rig: poses, walk, faces, outfits), `scenery.js`, `geo.js`, `props.js`, `ui.js`, plus `render.mjs` (renders every frame in headless Chrome) and `sfx.py` (quiet sound effects). Start from it. Its sizes are landscape (1920x1080); for a vertical Short set W=1080, H=1920, BAR=0 and lay every shot out for the tall frame. Make new scenes for your own words.

## Scenes or boards?

- **Drawn scenes** where the voice talks about a person's situation or a feeling: the stick figure at a desk, on a couch, in front of a screen, with a prop for the moment.
- **Navy boards** where the voice explains: steps, commands, comparisons, numbers, limits, "this vs that", a flow from A to B to C.
- **Real page screenshots** when the voice names a real source (a docs page): framed as a browser window, zoomed into the exact line, key words outlined in coral.
- Never stay on one kind of shot for more than about 6 seconds without a reason.

## The channel character

- Whenever a human is shown, it is the channel's own stick figure: a solid black body and round black head, simple white eyes and mouth that show emotion (smile, surprise, worry, squint, deadpan), black hands, and a thin warm rim light (peach or orange) along its edges.
- Its signature clothes: an **orange jacket**, dark gray trousers and white sneakers. Keep this the same in every video so it becomes the channel's face. It can add a prop for the moment (a laptop, a cap, a coffee, a backpack).
- Other people are black stick figures told apart by one or two pieces of colored clothing.
- Never draw real people or real characters.

## Two kinds of drawn shots

**1. Drawn scenes.** Flat vector illustration with soft gradients and gentle shadows, no outlines: rounded shapes, simple rooms (a desk, a living room), simple buildings and skies. Friendly pastel daylight or warm night scenes. Soft depth of field: the background blurs when something is close to the camera. Scenes are built in layers that move at different speeds for depth.

**2. Navy diagram boards.** A deep navy background (about `#232c4b` at the edges, lifting to about `#2e3c61` in the middle, like a soft spotlight) with thin white line drawings: laptops, terminals as plain outlines, arrows, clocks, price tags, bars, speech bubbles. Accent color is a warm coral red (about `#e8574e`). Numbers count up, bars fill, lines draw themselves on, items are crossed out in coral, and labels appear one by one in time with the voice. Never draw real company logos; use plain words or simple generic shapes.

## Camera and motion

- Smooth, simple 2D motion: slow pushes in, pans, characters gesturing, objects that pop in with a small bounce.
- Mostly clean cuts on the voice's beats; quick wipes or zooms between shots.

## Text

- Short bold uppercase labels in a clean geometric sans serif (Montserrat Bold or ExtraBold) with a little letter spacing: white, with coral for the key word or number.
- Only key words, numbers, units and commands, never full sentences. Commands shown on screen must be exactly what the voice and the verified sources say.

## Vertical Shorts (9:16, 1080x1920)

- No letterbox bars.
- **Safe zone (design rule, not an official spec):** keep ALL content, captions included, inside x 60-880 and y 300-1420. The right 200 px stays clear for the like/comment/share rail, the top 300 px for tabs, the bottom 500 px for the account name, caption and audio bar. Only the background may sit outside it.
- Captions (key words only) sit in the lower part of the safe zone.

## Other

- This is a faceless channel: no face cam.
- Quiet, simple sound effects (pops, whooshes, ticks, clicks, soft hits) under the voice, made in code, about a fifth of normal volume. No music.

## The channel's own rules

- Channel: Axiom (@axiomallai), Claude Code workflows.
- Keep the orange jacket (the user chose to keep it, 2026-11-21).
- Vertical 9:16 Shorts with the safe zone above.
