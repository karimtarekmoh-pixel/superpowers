# Verified facts and exact on-screen text (checked 2026-11-21 against official docs)

Show ONLY these. Spell commands exactly as written. Do not draw real company logos (no Claude, Ollama, Anthropic logos): use plain words in labels.

## Claims (all sourced)
1. Claude Code reads its server address from the `ANTHROPIC_BASE_URL` setting, so it can be pointed at another server that speaks Anthropic's API format. Source: Anthropic docs, "Connect Claude Code to an LLM gateway" (code.claude.com/docs/en/llm-gateway-connect).
2. Ollama documents using Claude Code with its models. Source: docs.ollama.com/integrations/claude-code.
3. The command is exactly: `ollama launch claude` (Ollama then lets you pick a model, and Claude Code opens running on that model).
4. A model running on your own computer costs nothing per message (you pay with your own hardware). Ollama's cloud models run on Ollama's servers and have usage limits. (Do not show any specific limit number or price: not verified.)
5. Anthropic's own docs say it "doesn't support routing Claude Code to non-Claude models through any gateway". Source: code.claude.com/docs/en/llm-gateway. Show it as a paraphrase: "Not supported by Anthropic".
6. The answers from other models are usually weaker than Claude's on big tasks (the voice says "usually"; keep it as a general statement, no benchmark numbers).

## Do NOT show
- Any price, token limit, rate limit number, model name that is not in this file, or a claim that it is "free forever".
- The word "Claude" as if the free models were Claude. The catch is: it is Claude Code (the tool) running a different model.

## Exact on-screen text allowed
- Command: `ollama launch claude`
- Labels (uppercase, short): CLAUDE CODE = TOOL, MODEL = BRAIN, SWAP THE MODEL, LOCAL: $0 PER MESSAGE, CLOUD: USAGE LIMITS, NOT SUPPORTED BY ANTHROPIC, WEAKER ON BIG TASKS, LEARN: OK, REAL WORK: CLAUDE, FOLLOW @axiomallai
- Handle at the end: @axiomallai (CLAUDE CODE WORKFLOWS)
