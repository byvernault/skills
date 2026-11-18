---
name: implement-ticket
description: "Implement one ticket or one piece of work in its own worktree, test-first, then leave it running for QA. Use to implement a single ticket, spec section or described change; for a whole spec with several tickets, use spec-to-code."
disable-model-invocation: true
metadata:
  credits:
    skill: implement
    author: Matt Pocock
    url: "https://github.com/mattpocock/skills"
---

Implement the work the user describes — one ticket, one spec section, one change — in a worktree of its own, and hand it back ready to QA.

If the user passes a ticket reference, fetch it from the issue tracker and state its title before starting. If the reference is ambiguous, ask. The issue tracker should have been provided to you; if not, read `docs/agents/issue-tracker.md` in the repo.

## 1. Take a worktree

Follow the worktree rules in `~/.claude/CLAUDE.md`: take the lowest slot `n` no running worktree holds, create the worktree at `~/.t3/worktrees/<repo>/<branch>` on a branch named after the ticket, and give that slot its own ports, its own database copied from the main checkout's, and its own consumer group. Pass every port and id through the settings the project already reads — never by editing a committed config.

Already working in a worktree the user put you in: keep it, and take its slot's ports.

## 2. Build it

Call the Skill tool with `test-first` where possible, at the seams the spec or ticket already agreed. Where the spec named no seam, agree one with the user before writing the first test.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

## 3. Prove it starts

Call the Skill tool with `verify` and run its start check on this worktree's slot: the stack starts, health passes, the startup logs are clean, and every endpoint the change touches answers. Fix what fails before going on — the work is not done while the app does not start.

A visual change also goes through `check-mockup` when the ticket names a mockup.

## 4. Review and commit

Call the Skill tool with `review-change` to review the work, and fix what it confirms.

Commit to the worktree's branch with the commit convention in `~/.claude/CLAUDE.md`.

## 5. Hand it over for QA

Leave the stack running and report, in this order: the worktree path, the branch, the URLs with their ports, and the command to start it again. Then say what the start check covered and what `review-change` found.
