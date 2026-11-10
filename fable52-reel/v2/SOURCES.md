Claude Code docs, "Model configuration" -> "Automatic model fallback" (https://code.claude.com/docs/en/model-config):
- Fable models run with safety classifiers, which most often flag cybersecurity and biology content.
- Fable models and Opus 5.5: biology-flagged requests re-run on Opus 5; cybersecurity-flagged requests re-run on Opus 4.8.
- Claude Code re-runs the flagged request on the fallback model and shows a notice in the transcript (main conversation).
- After a fallback the session continues on the fallback model; run /model to return.
- Fallback can trigger on the first request because it carries workspace context (CLAUDE.md content, git status); a repository with security or biology material can trip the classifier on that alone. `claude --safe-mode` helps check customizations.
- /config "Switch models when a message is flagged" -> "Ask each time" asks before switching.
- Fable models are described as the most capable models in Claude Code; `fable` resolves to Fable 5.2.
Notes: the transcript notice text and the picker rows in the video are illustrative. "Wrong question" means a flagged request (false positives are possible). Voice is a free local placeholder (Kokoro am_michael), not Liam.
