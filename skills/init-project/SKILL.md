---
name: init-project
description: "Set up a repo for this skill workflow: record which issue tracker holds its specs and tickets, and how to operate it. Use before the first spec or ticket in a repo, or when a skill reports it cannot find docs/agents/issue-tracker.md."
disable-model-invocation: true
---

Write `docs/agents/issue-tracker.md`, the one file the other skills read to know where a project's specs and tickets live. `spec-griller`, `spec-to-code`, `implement-ticket` and `code-review` all look for it, and fall back to local markdown when it's missing.

Run this once per repo. Re-run it to correct or extend what it says.

## 1. Find out what the repo already uses

Don't ask the user what you can look up:

- `git remote -v` — a `github.com` remote means `gh`, another host means `glab`. Confirm the CLI works (`gh repo view`, `glab repo view`) and record the project path it reports.
- Existing issues or merge requests, to see the conventions already in use: how titles are written, which labels exist (`gh label list`, `glab label list`), whether sub-issues or blocking links are used.
- `docs/`, `specs/`, `.scratch/` — where specs already live, if any.
- Any `AGENTS.md`, `CLAUDE.md` or `CONTRIBUTING.md` that already says where work is tracked.

Ask the user only what the repo cannot tell you, and propose a default for each: which tracker to use when there are several, whether specs go to the tracker or stay in the repo, who the default assignee is.

## 2. Write the file

Use the template below. Every operation an agent will need gets its exact command, tested once before you write it down — a command that doesn't run is worse than no file, because the next skill will trust it.

<template>

# Issue tracker

**Tracker:** GitHub / GitLab / local markdown
**Project:** `<owner/repo>` or the path specs live under
**CLI:** `gh` / `glab` / none

## Where specs and tickets go

Where a spec from `spec-griller` is published, and where `spec-to-code`'s tickets go. For local markdown: `.scratch/<feature-slug>/`, one file per issue.

## Operations

One line per operation, with the command that performs it:

- **Create an issue**
- **Read an issue, with its comments**
- **Label an issue** — and the labels this project uses, `ready-for-agent` among them
- **Link a ticket to its parent spec** — native sub-issue, blocking link, or a text reference
- **Close work** — whether it closes by merge, by command, or by hand
- **Find the issue a branch belongs to**

## Conventions

Title format, label vocabulary, who gets assigned, anything a human reviewer expects to see on an issue of this project.

</template>

## 3. Tell the user what's next

Say which tracker you recorded and what the repo told you versus what you asked. Then name what this file does not yet cover and could, as the project grows: the QA profile `verify` reads (`.claude/verify/`, which `verify` itself sets up), the project's own run skill, the coding standards `code-review` looks for.
