# Publish text for the 3 reels (build-only; you post)

## rewind
File: rewind/out/rewind-reel.mp4

### Instagram / TikTok caption
Claude Code just edited your files in the wrong direction. You do not have to undo it by hand.

Claude Code tracks the edits it makes with its file tools. Type /rewind, or press Esc twice on an empty prompt, to open the menu. Pick a point, then restore the code, the conversation, or both, or summarize from there to free up context.

The catch: if a file was changed only by a shell command, /rewind does not track it, and subagent edits usually are not captured. For those, use git.

Details are in the pinned comment.

Save this for your next session.
Follow for more Claude Code workflows.
#claudecode #claudeai #aitools #aicoding #developertools #aiworkflow #codingtips

### YouTube
Title: /rewind: undo Claude Code's mistakes (and where it stops) #Shorts
Tags: claude code, /rewind, claude code rewind, undo claude code, checkpoints, ai coding, developer tools
Description: the caption above plus the source line, then hashtags #claudecode #aicoding #claudeai #developertools #shorts

### Pinned comment
Open the menu: /rewind (or press Esc twice with an empty prompt)
Actions: Restore code and conversation / Restore conversation / Restore code / Summarize from here
Not tracked: files changed only by Bash commands, and usually subagent edits. Use git for those.

Source: Claude Code docs, Checkpointing (code.claude.com/docs/en/checkpointing)

## worktree
File: worktree/out/worktree-reel.mp4

### Instagram / TikTok caption
Two Claude Code sessions in the same folder can step on each other's edits.

The fix is a git worktree: a separate checkout, on its own branch. Start Claude with claude --worktree and a name, for example claude --worktree feature-auth. It is created under .claude/worktrees/ on a new branch named worktree-<name>.

The catch: by default a new worktree branches from your repository's default branch, not your current work, so your unpushed commits are not in it. To start from your current work, set worktree.baseRef to "head" in your settings.

Details are in the pinned comment.

Save this for your next session.
Follow for more Claude Code workflows.
#claudecode #claudeai #aitools #aicoding #developertools #aiworkflow #codingtips

### YouTube
Title: Claude Code worktrees: parallel sessions without collisions #Shorts
Tags: claude code, git worktree, claude worktree, parallel sessions, baseRef, ai coding, developer tools
Description: the caption above plus the source line, then hashtags #claudecode #aicoding #claudeai #developertools #shorts

### Pinned comment
claude --worktree feature-auth

Branch new worktrees from your current work (settings.json):
{
  "worktree": {
    "baseRef": "head"
  }
}

Tip from the docs: add .claude/worktrees/ to your .gitignore.
Source: Claude Code docs, Worktrees (code.claude.com/docs/en/worktrees)

## permissions
File: permissions/out/permissions-reel.mp4

### Instagram / TikTok caption
Claude Code can read your own history, and write your permission list for you.

/fewer-permission-prompts is a built-in skill. It scans your past transcripts for common read-only commands and tool calls, then builds a prioritized allowlist and adds it to your project's .claude/settings.json.

That file lives in your project, so read the list before you keep it. The result is fewer prompts for read-only calls.

Details are in the pinned comment.

Save this for your next session.
Follow for more Claude Code workflows.
#claudecode #claudeai #aitools #aicoding #developertools #aiworkflow #codingtips

### YouTube
Title: Claude Code can write your permission list for you #Shorts
Tags: claude code, fewer-permission-prompts, claude code permissions, allowlist, settings.json, ai coding, developer tools
Description: the caption above plus the source line, then hashtags #claudecode #aicoding #claudeai #developertools #shorts

### Pinned comment
Run it: /fewer-permission-prompts
It scans your transcripts for common read-only Bash and MCP tool calls and adds a prioritized allowlist to project .claude/settings.json.
Review the list before you keep it.

Source: Claude Code docs, Commands (code.claude.com/docs/en/commands)
