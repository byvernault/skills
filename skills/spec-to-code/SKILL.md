---
name: spec-to-code
description: "Take a published spec all the way to code: break it into a graph of tracer-bullet tickets, implement them in parallel worktrees, and land the lot on one integration branch."
disable-model-invocation: true
metadata:
  credits:
    skill: implement-spec, to-tickets
    author: Matt Pocock
    url: "https://github.com/mattpocock/skills"
---

You have been given a spec, from `spec-griller` or elsewhere. This skill breaks it into tickets and implements every one of them.

The issue tracker should have been provided to you. If not, read `docs/agents/issue-tracker.md` in the repo; if that doesn't exist either, default to the local-markdown tracker (one file per issue under `.scratch/<feature-slug>/`) and say which you used.

The goal is the entire spec implemented on a single **integration branch**, with every ticket resolved the way the issue tracker closes work.

The tickets are not a list of steps. They are a **task graph** with blocking relationships between them, so there is always a **frontier** of tickets ready to be grabbed.

Communication to and from subagents should be sparse. Communicate primarily through **context pointers**: to the spec, tickets, research notes, and previous commits. Don't duplicate information already available via pointers.

**Implementer subagents** should be run in the background where possible for maximum concurrency.

## Steps

1. Read the spec. If it already has tickets on the tracker, read them and go to step 3.

2. Break the spec into tickets, following [TICKETS.md](TICKETS.md) for what a ticket is and how it's published. Ticket titles and descriptions use the project's domain glossary vocabulary and respect the ADRs in the area you're touching. Present the breakdown as a numbered list — title, blocked by, what it delivers — and ask whether the granularity and the blocking edges are right. Iterate until the user approves, then publish, blockers first. Never close or modify the spec's own issue.

3. (optional) Use an **exploration subagent** to conduct any exploration the tickets require — relevant codebase files or external documentation. Ensure it can save files: its markdown notes go in a directory outside the repo, accessible by all future subagents. This lets **implementer subagents** focus on implementation rather than exploration.

4. Create the integration branch. If the issue tracker closes work through PRs, or the user asks for one, open a draft PR after the first merge in step 6 (a branch with no commits ahead of main can't open one), marked as closing the spec and tickets.

5. Use **implementer subagents** to implement each ticket, each in its own worktree on its own branch, numbered and ported by the worktree rules in `~/.claude/CLAUDE.md` so several can be started and QA'd at once. Each implementer subagent:
   - confirms its worktree is based on the integration branch before starting, and resets onto it if not;
   - calls the Skill tool with `tdd` to build the ticket;
   - merges the integration branch tip into its own branch before reporting done

6. Once an **implementer subagent** completes, merge its work to the integration branch with a **merger subagent**.

7. If this changes the **frontier** of available tickets, kick off more **implementer subagents** to work on the new tickets. This allows for maximum concurrency.

8. Once all tickets are complete, call the Skill tool with `verify` and run its start check on the integration branch: the whole spec has to start, not just each ticket in isolation. Then call the Skill tool with `review-change` on the integration branch. Fix all issues raised in a single **implementer subagent**.

9. If a draft PR exists, mark it ready for review. Otherwise, resolve each ticket the way the issue tracker closes work, and report the integration branch.

10. Clean up all **implementer subagent** worktrees, and the database and consumer group each one created.
