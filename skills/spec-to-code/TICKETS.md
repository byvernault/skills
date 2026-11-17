# Ticket shape

A ticket is a **tracer bullet**: a narrow but complete path through every layer (schema, API, UI, tests), never a horizontal slice of one layer. A finished ticket is demoable on its own, and fits in one fresh context window. Prefactoring comes first — make the change easy, then make the easy change.

Each ticket declares its **blocking edges**: the tickets that must finish before it can start. A ticket with no blockers starts immediately.

**Wide refactors are the exception.** A mechanical change whose blast radius fans across the codebase (rename a column, retype a shared symbol) can't land green as a vertical slice. Sequence it as expand–contract instead: one ticket adds the new form beside the old, then one ticket per batch of call sites (per package, per directory) each blocked by the expand, then a final ticket deletes the old form once no caller remains, blocked by every batch. When even a batch can't stay green alone, let the batches share an integration branch and block a final integrate-and-verify ticket; green is promised only there.

Avoid file paths and code snippets in a ticket: they go stale fast. Exception: a snippet from a prototype that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape). Trim it to the decision, not a working demo.

## Local file

One file per ticket under `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` in dependency order. Never one combined file.

```markdown
# <NN>: <Ticket title>

**What to build:** the end-to-end behaviour this ticket makes work, from the user's perspective, not a layer-by-layer implementation list.

**Blocked by:** the numbers of the tickets that gate this one, or "None (can start immediately)".

**Status:** ready-for-agent

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2
```

## Real tracker

One issue per ticket, in dependency order, so each ticket's edges can name real identifiers. Use the tracker's native blocking relationship where it has one, else fill the **Blocked by** section. When the spec is itself an issue, make each ticket its sub-issue. Apply the `ready-for-agent` label: the tickets are agent-grabbable by construction.

```markdown
## Parent

The spec's issue, when the spec is one. Omit otherwise.

## What to build

The end-to-end behaviour this ticket makes work, from the user's perspective.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Blocked by

Each blocking ticket, or "None (can start immediately)". Omit when the edges are native.
```
