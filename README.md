# skills

My set of skills to develop all my projects.

## The workflow

| | Skill | What it does |
|---|---|---|
| 0 | `init-project` | Records which issue tracker holds a repo's specs and tickets, in `docs/agents/issue-tracker.md`. Once per repo. |
| 1 | `spec-griller` | Grills me about a feature until the design is settled, writes the spec, publishes it to the tracker with the `ready-for-agent` label. |
| 2 | `spec-to-code` | Breaks a spec into a graph of tracer-bullet tickets and implements every one of them, in parallel worktrees, onto one integration branch. |
| 2′ | `implement-ticket` | One ticket in its own worktree, test-first, left running for QA. |
| 3 | `review-change` | Reviews a change on three axes (Agreement, Quality, Bugs), one parallel reviewer each, every finding validated against the code. |
| 4 | `pr-writer` | Writes the body of the merge request. |
| 5 | `review-to-pr` | Reviews, writes the description, opens the MR rebased on its target, gets the pipeline green. |

Supporting: `verify` (drives the app in a browser, and owns the start check), `check-mockup` (compares a screen with its mockup), `sonar-fix` (clears a SonarQube quality gate).

Who calls whom: `review-to-pr` → `review-change` → `pr-writer`; `implement-ticket` and `spec-to-code` → `verify` and `review-change`; `verify` → `check-mockup`. A skill called by another skill must stay model-invokable, so `review-change`, `pr-writer`, `verify` and `check-mockup` carry no `disable-model-invocation`.

## What lives here, and what doesn't

Only skills I maintain. Someone else's skill stays theirs: installed from their own repo at their own version, never copied in here, so an upstream fix reaches me instead of rotting in a fork.

Two of mine call upstream skills that have to be installed separately: `spec-griller` calls `grilling`, and `spec-to-code` and `implement-ticket` call `tdd` — both from [mattpocock/skills](https://github.com/mattpocock/skills).

Where one of my skills reproduces someone else's text, it says so: `metadata.credits` in the frontmatter, and a `CREDITS.md` naming what was copied and from where. Four skills carry one today.

## Install

```sh
./scripts/install.sh
```

Links every skill into `~/.claude/skills` (Claude Code) and `~/.agents/skills` (the shared agents directory). `--dry-run` says what it would do and changes nothing; `--target <dir>` points it somewhere else.

It is idempotent, so it is the one command to run after any change to the *set* of skills. It links what is new, repoints what moved, removes the link a rename left behind, and refuses to touch a name it does not own — a real directory, or a link into someone else's skills — reporting those and exiting non-zero, because two skills answering to one name is a silent ambiguity.

Editing a skill needs no re-install: the install is symlinks, so an edit is live in every agent immediately.

### Automatically

The install wires `core.hooksPath` to [`hooks/`](hooks/README.md) on its first run, so `post-merge` and `post-checkout` re-link by themselves: a pull or a branch switch that adds, renames or removes a skill fixes this machine without being asked.

For a machine where this repo is only consumed, not edited, add it to the shell profile or to a `SessionStart` hook in `~/.claude/settings.json` instead.

## Check

```sh
python3 scripts/check-skills.py
```

Frontmatter, every relative link, and any pointer to a skill that no longer exists. Exits non-zero with the list, so it works as a pre-commit hook or a CI step.
