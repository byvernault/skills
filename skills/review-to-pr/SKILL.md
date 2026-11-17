---
name: review-to-pr
description: "Close out a finished feature: review the change, write the merge request description, open the MR on GitLab or GitHub rebased on its target, and get its pipeline green, SonarQube included, after checking the app starts. Use when a feature is finished, to open a merge request or pull request, or to review a change and draft its MR description. Skip it for small changes (one-file edit, config tweak, rename): run lint, build and tests instead."
---

Review the change, write the description, open the merge request and get its pipeline green. The repository files stay untouched until step 3.

## 1. Review

Call the Skill tool for `review-change`, which owns the axes, the reviewers and the validation pass. Give it the base the caller named, else let it pin its own, and the agreement (ticket, spec or the user's request) when you have one.

A confirmed Agreement or Bugs finding blocks: stop and hand back. Quality findings do not.

Reviewing an existing pull request: show its description after step 2 and stop.

## 2. Write the description

Call the Skill tool for `pr-writer`, which owns the body template and each section's bar. Give it the change and the validated findings `review-change` reported, and the output path `$TMPDIR/review-to-pr-<branch>.md`.

A screenshot it could not attach leaves a `<!-- screenshot: <path> -->` placeholder, which step 3.8 hands to the user.

## 3. Open the merge request

1. **Commit**: off the default branch onto a feature branch, commit, with the conventions of `~/.claude/CLAUDE.md`.
2. **Sonar**: if SonarQube already has an analysis of this branch (`get_project_quality_gate_status` answers), run `sonar-fix` now, committing without pushing, and update any `file:line` its fixes move. Otherwise step 4 handles it.
3. **Forge**: `github.com` remote → `gh`; other hosts → `glab` if `glab repo view` works. Neither: stop, show the description, say which CLI to set up.
4. **Rebase**: `git fetch origin <target>`; if `git merge-base --is-ancestor origin/<target> HEAD` fails, `git rebase origin/<target>`. On conflict: `git rebase --abort`, stop, list the conflicting files.
5. **Start**: run the `verify` skill's start check on the rebased branch, so a missing variable, a migration that collides with the target's or a broken endpoint shows up here and not in QA. Skip it when this session already passed it on this same commit. Fix what the change caused, commit, and check again.
6. **Push**: `git push -u origin <branch>`, `--force-with-lease` after rewriting a pushed branch.
7. **Create or update** against the target, title in the repo's convention:
   - GitHub: `gh pr edit <branch> --body-file <file>` if `gh pr view <branch>` finds one, else `gh pr create --base <target> --head <branch> --title "<title>" --body-file <file>`.
   - GitLab: `glab mr update <branch> --description "$(cat <file>)"` if `glab mr view <branch>` finds one, else `glab mr create --source-branch <branch> --target-branch <target> --title "<title>" --description "$(cat <file>)" --yes`.
8. Placeholder left: ask the user to attach the screenshot.

## 4. Get the pipeline green

Wait for the pipeline, then fix one failure at a time: first real error, smallest fix, same check locally, commit, push, wait again. Stop after three rounds on the same job and hand back the error.

- **GitHub**: run `pstack:fix-ci`.
- **GitLab**: `glab ci status --branch <branch>` until done, `glab ci view` for failed jobs, `glab ci trace <job-id>` for logs. A job stuck `pending` or `created` is a runner problem: report it.
- **Sonar** job or quality gate failed: run `sonar-fix` on the MR now, unprompted.
- **Not caused by the change** (flaky, infrastructure, red on the target too): retry once (`glab ci retry <job-id>` / `gh run rerun --failed`), then report.

When green, recheck the branch is not behind its target (3.4); if it is, rebase, run the start check again (3.5), push and wait again.

Done: report the MR URL, pipeline status, the review line from step 1 and what `sonar-fix` fixed.
