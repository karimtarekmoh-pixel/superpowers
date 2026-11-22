# Fable 5.2 reel: script v1 (Zack D. curiosity loop, about 36 s)

## Titles
1. Claude Code changed your model while you slept
2. The model setting you saved is not the one you're running
3. Why your Claude Code session feels different today

## Narration (about 92 words)
1. HOOK
You saved one Claude Code model as your default, and an update can quietly swap it for a different one.

2. CONTEXT
If you picked Fable 5.1 and saved it, you might assume it stays put.

3. MECHANISM
Here's the catch. On Pro and Max, a saved Fable 5.1 moves to the "fable" alias the first time you run version 2.1.321 or later. That alias now means Fable 5.2. And sessions start at 5.2's default effort, which is medium, unless you set a level yourself.

4. TWIST
It can also change what you pay with. Depending on your plan, Fable can bill to usage credits instead of your plan's included limits.

5. PAYOFF
So type slash model. Check which Fable you're on, and what effort it's on. The setting you saved isn't always the one you're running.

## Visual directions
1. Dark card: "/model" picker, "Fable 5.1 (saved)" row, lime cursor.
2. Same row fades, "Fable 5.2" replaces it. Small tag: "v2.1.321+".
3. Three mock-up cards in sequence: saved model -> "fable" alias -> 5.2. Then an effort pill: "medium".
4. Picker row with "Requires usage credits" label (as the docs describe).
5. Terminal: "/model" typed, picker opens. SAVE slab, follow card.

## Sources (official Claude Code docs, "Model configuration" page, code.claude.com/docs/en/model-config)
- fable alias resolves to Fable 5.2 except in Claude apps gateway sessions.
- Saved claude-fable-5-1 moves to the fable alias on Pro/Max at first run of v2.1.321+; Team/Enterprise follow org settings and may come later or not at all; Console accounts, third-party providers and project/local/managed settings keep 5.1.
- After the move, sessions start at Fable 5.2's default effort (medium).
- Fable usage can bill to usage credits depending on plan and seat tier; the picker shows "Requires usage credits".
- Fable 5.2 requires Claude Code v2.1.321 or later.

## Alternate hooks
1. Claude Code may be running a different model than the one you picked.
2. Your saved model setting just got overridden, and no one told you.
3. One update, and your Fable 5.1 default is gone.

## Not claimed (unverified): benchmarks, pricing, speed, "better than 5.1".
