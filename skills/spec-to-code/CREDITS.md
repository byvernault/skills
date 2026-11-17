# Credits

Two parts of this skill come from [Matt Pocock](https://github.com/mattpocock)'s [skills](https://github.com/mattpocock/skills):

- The orchestration — tickets as a **task graph** rather than a list of steps, the **frontier** of grabbable tickets, implementer and merger subagents, context pointers instead of duplicated briefs — is `implement-spec`, kept nearly intact. What is added here is the breakdown step, the worktree numbering, and the start check before the review.
- The ticket definition in [`TICKETS.md`](TICKETS.md) — the tracer-bullet rules, the expand–contract sequence for wide refactors, and both ticket templates — is `to-tickets`, condensed but close to its wording. `to-tickets` was a skill of its own; folding it in here removed a handoff and a skill from this repo.

`spec-to-code` does not depend on either skill: they aren't part of this repo, and a hard dependency would break standalone installs. This file is the attribution a dependency would otherwise have carried.
