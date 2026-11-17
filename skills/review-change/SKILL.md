---
name: review-change
description: "Review a change on three axes — Agreement with the spec or request, Quality against the repo's standards and conventions, and Bugs — with one parallel reviewer per axis, then validate every finding against the code before reporting. Use to review a change, a branch or a pull request, and when another skill needs a change reviewed."
metadata:
  credits:
    skill: code-review
    author: Matt Pocock
    url: "https://github.com/mattpocock/skills"
---

The single source of truth for reviewing a change. `review-to-pr` calls this skill before it opens a merge request; reach for it directly for any other review.

Three reviewers run as parallel subagents, so no axis pollutes another's context, then this skill validates their findings and reports per axis. No file in the repository changes here.

The issue tracker should have been provided to you. If not, read `docs/agents/issue-tracker.md` in the repo; if that doesn't exist either, default to the local-markdown tracker (one file per issue under `.scratch/<feature-slug>/`) and say which you used.

## 1. Pin the change

- **Base**: the commit the caller gives, else `git merge-base HEAD origin/HEAD`. The change is `git diff <base>` plus untracked files (`git ls-files --others --exclude-standard`); for an existing pull request, its diff read with `gh`, `glab` or an MCP. Stop if the base does not resolve or the change is empty.
- **Agreement**, first source found: the caller's text (ticket, spec, requirement), a spec in the repo, the ticket the branch or commits name, the user's request in this conversation, the PR description. None: skip the Agreement reviewer and say so.
- **Instruction files**: every `AGENTS.md` and `CLAUDE.md` on the path of a changed file and the standards they link (`CONTRIBUTING.md`, `CODING_STANDARDS.md`…). The agreement overrides them.

The **brief** every reviewer gets: the agreement (or its path), the base, the diff command, the untracked files, the instruction files.

## 2. Review

Run the reviewers as parallel subagents in one message, on `model: "sonnet"`: all three, or those the caller names. Prompt: the brief, this paragraph verbatim, then the axis.

> Report only issues the change introduces: file and line, the defect, why. Drop anything you are unsure of, and these false positives: pre-existing issues, code that looks wrong but is correct, nitpicks a senior engineer would skip, what linters, formatters or type checkers enforce, what the code explicitly silences. Change no file. Under 400 words.

- **Agreement**: quoting the agreement line, what is missing or partial, what was not asked for, what is implemented wrongly.
- **Quality**, tagging each finding `rule`, `convention` or `design` (rules win over conventions, both over design):
  - `rule`: each changed file against the instructions scoped to it, quoting the rule. Scope and simplicity rules break most often: over-engineering, speculative or temporary code, workarounds, customising what the library does by default.
  - `convention`: departures from what the surrounding code sets (layering, naming, error handling, how similar features are built), pointing to that code.
  - `design`: anti-patterns, a pattern misapplied or missing, code that costs a reader (misleading names, multi-job functions, hidden side effects, deep nesting). Name the principle, show the simpler shape. The [smell baseline](SMELLS.md) applies here even when the repo documents nothing — paste it into this reviewer's prompt, since it has no other access to it.
- **Bugs**: from the diff and the code it needs, what will not compile, logic wrong for any input, broken behaviour, security issues introduced. No style, no unlikely inputs.

**Re-review after a fix**: when this conversation holds an earlier review of the same change whose findings were fixed since, re-run only the axes that had findings. Add their earlier findings and the fix diff (`git diff <reviewed commit>`); the reviewer confirms each fix and reports issues the fix introduces. Other axes carry forward. Without a usable reviewed commit, re-run those axes on the whole change.

## 3. Validate and report

Deduplicate, then read the code behind each finding. Keep it only if it is real, introduced by the change, not a false positive above, and, for `rule` or `convention`, the rule or convention applies to that file.

Report under `## Agreement`, `## Quality`, `## Bugs`, never reranked across axes. Per finding: `file:line`, defect or rule, impact, short fix. An empty axis names its scope. On a re-review, mark each axis `re-run` or `carried forward from <commit>`. Last line: findings per axis, findings rejected, reviewed commit (`git rev-parse HEAD`, noting uncommitted changes).

A confirmed Agreement or Bugs finding blocks: stop and hand back. Quality findings do not.

## Why the axes stay apart

A change can pass one axis and fail another: code that follows every standard but implements the wrong thing, code that does exactly what the ticket asked but breaks the project's conventions, code that is idiomatic and faithful and still wrong for an input. Reporting the axes separately, and never reranking across them, stops one from masking another. That separation is the reason for the parallel subagents, and the reason the report keeps three headings even when one is empty.
