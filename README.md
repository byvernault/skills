# skills

My set of skills to develop all my projects.

## The workflow

| | Skill | What it does |
|---|---|---|
| 0 | `init-project` | Records which issue tracker holds a repo's specs and tickets, in `docs/agents/issue-tracker.md`. Once per repo. |
| 1 | `spec-griller` | Grills me about a feature until the design is settled, writes the spec, publishes it to the tracker with the `ready-for-agent` label. |
| 2 | `spec-to-code` | Breaks a spec into a graph of tracer-bullet tickets and implements every one of them, in parallel worktrees, onto one integration branch. |
| 2′ | `implement-ticket` | One ticket in its own worktree, test-first, left running for QA. |
| 3 | `code-review` | Reviews a change on three axes (Agreement, Quality, Bugs), one parallel reviewer each, every finding validated against the code. |
| 4 | `pr-writer` | Writes the body of the merge request. |
| 5 | `review-to-pr` | Reviews, writes the description, opens the MR rebased on its target, gets the pipeline green. |

Supporting: `verify` (drives the app in a browser, and owns the start check), `check-mockup` (compares a screen with its mockup), `sonar-fix` (clears a SonarQube quality gate).

Who calls whom: `review-to-pr` → `code-review` → `pr-writer`; `implement-ticket` and `spec-to-code` → `verify` and `code-review`; `verify` → `check-mockup`. A skill called by another skill must stay model-invokable, so `code-review`, `pr-writer`, `verify` and `check-mockup` carry no `disable-model-invocation`.

## What lives here, and what doesn't

Only skills I maintain. Someone else's skill stays theirs: installed from their own repo at their own version, never copied in here, so an upstream fix reaches me instead of rotting in a fork.

Two of mine call upstream skills that have to be installed separately: `spec-griller` calls `grilling`, and `spec-to-code` and `implement-ticket` call `tdd` — both from [mattpocock/skills](https://github.com/mattpocock/skills).

Where one of my skills reproduces someone else's text, it says so: `metadata.credits` in the frontmatter, and a `CREDITS.md` naming what was copied and from where. Four skills carry one today.

## Install

```sh
for s in skills/*/; do ln -sfn "$PWD/$s" ~/.claude/skills/"$(basename "$s")"; done
```

## Check

```sh
python3 scripts/check-skills.py
```

Frontmatter, every relative link, and any pointer to a skill that no longer exists. Exits non-zero with the list, so it works as a pre-commit hook or a CI step.
