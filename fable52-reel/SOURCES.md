All from the official Claude Code docs, "Model configuration" (https://code.claude.com/docs/en/model-config):
- The `fable` alias resolves to Fable 5.2 everywhere except Claude apps gateway sessions (Fable 5).
- Pro/Max: a saved claude-fable-5-1 moves to the `fable` alias the first time you run v2.1.321+. Team/Enterprise follow organization settings (later or not at all). Console accounts, third-party providers, project/local/managed settings keep 5.1.
- After the move, sessions start at Fable 5.2's default effort (medium) unless a level is set.
- Fable usage can bill to usage credits depending on plan and seat tier; the picker shows "Requires usage credits".
- Fable 5.2 requires Claude Code v2.1.321 or later.
Not claimed: benchmarks, pricing, speed.
Note: the docs say the startup model line can show "(auto-updated)" once on Pro/Max in the terminal, so "quietly" means easy to miss, not unannounced.
Picker rows and the "SWAPPED" tag in the video are illustrative.
