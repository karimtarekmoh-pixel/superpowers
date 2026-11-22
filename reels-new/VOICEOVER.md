# Voiceover scripts (read exactly as written)

How to record: one file per reel, one take, calm and clear, a little slower than normal speech. Leave about half a second of silence between the paragraphs (each paragraph is one section; I cut on those pauses). Say commands as words: 'slash rewind', not a symbol. Keep the words exactly as written, because I align the video to your audio word by word. Any format (mp3, wav, m4a) is fine. Send the three files back named rewind, worktree, permissions.


## Reel 1: /rewind  (about 117 words)

Claude Code just edited your files in the wrong direction. You don't have to undo it by hand.

Claude Code tracks every edit it makes with its file tools. Type slash rewind, or press escape twice, to open the menu.

Pick a point in the session, then restore the code, the conversation, or both. Or summarize from there to free up context.

But there's a catch. If a file was changed only by a shell command, rewind doesn't track it. Edits made by subagents usually aren't captured either.

So rewind is not a replacement for git. For those changes, git is what brings them back.

Save this for your next session. Follow for more Claude Code workflows.


## Reel 2: worktrees  (about 98 words)

Two Claude Code sessions in the same folder can step on each other's edits.

The fix is a git worktree: a separate checkout, on its own branch. Start Claude with the worktree flag, and a name.

Claude puts it in your worktrees folder, on a new branch named after it.

Here's the catch. By default, a new worktree branches from your default branch, not your current work. Your unpushed commits aren't in it.

To start from your current work instead, set the baseRef setting to head.

Save this for your next session. Follow for more Claude Code workflows.


## Reel 3: /fewer-permission-prompts  (about 88 words)

Claude Code can read your own history, and write your permission list for you.

It's a built-in skill, slash fewer permission prompts.

It scans your past transcripts for common read-only commands and tool calls, then builds a prioritized allowlist.

Then it adds the list to your project's settings file. That file lives in your project, so read the list before you keep it.

The result is fewer prompts for read-only calls. Just check the list first.

Save this for your next session. Follow for more Claude Code workflows.
