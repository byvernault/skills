---
name: pr-writer
description: "Write the body of a pull or merge request: the template, each section's bar, and the visual that carries the change. Use when writing or updating a PR or MR description, and when another skill needs the body template."
metadata:
  credits:
    skill: show-me
    author: Dex Horthy
    organisation: Humanlayer
    url: "https://github.com/humanlayer/skills/blob/main/plugins/show-me/skills/show-me/SKILL.md"
---

The single source of truth for the body of a pull or merge request. `review-to-pr` calls this skill for its description step; reach for it directly for any other PR body.

## Input

The caller gives you the change (a base commit, a diff, or a pull request), and may give you review findings to fold in and an output path. Write to that path when there is one, else print the body. Nothing else in the repository changes here.

Short, in the project's domain language (`GLOSSARY.md`). Every section is filled or says `None` and why. Every `file:line` points into the change.

## Template

```markdown
## Summary
<two or three sentences: what and why, linked to the ticket or spec>

## What to review
- `path/file.ts:42`: <why it needs a careful look>

## Architecture
<visual and/or screenshot>

## Tests added
- `path/test_file`: `<test name>`: <behaviour it proves>

## Blast radius
**Door:** <one-way or two-way>: <why>
- <what outside the diff this can affect, and how>
```

## Summary

What the change does and why, linked to the ticket or spec. Skip the preamble.

## What to review

Three to six places that reward a careful look: core logic, a non-obvious decision, an edge case, a migration, a security boundary. Put mechanical changes on one line.

## Architecture

Pick the smallest view that makes the key point clear. [`VISUALS.md`](VISUALS.md) holds the menu: pseudocode, call tree, component tree, file tree, Mermaid, diff, whole block, with the shape to match each topic and where to place it.

- **Backend or structural change**: a Mermaid diagram (`flowchart`, `sequenceDiagram`, `classDiagram` or `erDiagram`) of the touched nodes and their neighbours, marked with `classDef added fill:#d4f8d4` / `classDef changed fill:#fff3c4` and a one-line legend.
- **Frontend change**: a screenshot, before and after when cheap, taken with the project's own run skill, else by driving the app with `verify`. Upload it through the forge, else save it under `$TMPDIR` and leave a `<!-- screenshot: <path> -->` placeholder for the caller to attach. App won't launch: say so and keep the placeholder.

## Tests added

Name the behaviour each test proves. Run them and state `N passed`. No tests: `None` with the reason, or flag the gap.

Execution-based evidence belongs here: the exact test that fails before and passes after. A screenshot of a visual change is stronger still, and belongs in **Architecture**.

## Blast radius

**Door** is how reversible the merge is. A two-way door is undone by a revert. A one-way door is not: a destructive migration, a published API, a data rewrite.

Then what the change can reach outside its own diff, most likely first. Search for:

- callers of changed signatures, endpoints, events, schemas or shared components
- data: migrations, stored formats, cache keys
- config, flags, env vars, dependencies
- for UI, other screens using the touched components, and small screens
