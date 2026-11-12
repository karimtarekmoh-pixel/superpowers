Claude Code docs, Worktrees (https://code.claude.com/docs/en/worktrees) and Common workflows (https://code.claude.com/docs/en/common-workflows):
- claude --worktree <name> creates an isolated worktree under .claude/worktrees/<name>/ on a new branch worktree-<name>.
- Default base: the repository's default branch on the remote (worktree.baseRef "fresh"); "head" branches from your current local HEAD, carrying unpushed commits.
- Add .claude/worktrees/ to .gitignore.
'Edits can collide' is the stated reason for worktrees ('so concurrent edits don't collide').
Voice: free local placeholder (Kokoro am_michael), not Liam.
