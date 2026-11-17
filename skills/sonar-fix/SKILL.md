---
name: sonar-fix
description: "Fix the open SonarQube findings (bugs, vulnerabilities, code smells, security hotspots, coverage gaps) of a merge request, branch or project, then verify and push. Use for /sonar-fix, a sonar.takima.tech URL, 'fix the sonar report', 'the quality gate fails', or after a pipeline whose sonar job fails."
---

Fix what SonarQube reports on one analysis, in the repository it analyses, with the stack's own best practices.

## 1. Pin the analysis

- **Project key**: from the URL's `id=`, else `sonar.projectKey` in `sonar-project.properties`, `build.gradle.kts` or the CI file, else the repo's `CLAUDE.md`. Never guess one: a wrong key silently returns another project.
- **Context**: a URL with `pullRequest=<n>` → that pull request key. A merge request without a URL → `list_pull_requests` on the project and take the one whose branch is the current branch. Otherwise the current git branch, or the main branch when asked for "the project".
- **Repository**: the local checkout (or worktree) of that project and branch. Check `git status` is clean and the branch matches before editing; on a mismatch, stop and say which checkout you expected.
- **Stack**: read it from the repo (`build.gradle.kts` → Kotlin/Spring, `angular.json` → Angular/TypeScript, …). Fix with that stack's practices and the repo's `CLAUDE.md`, whatever a pasted prompt says.

If a SonarQube call answers "Insufficient privileges", stop and tell the user their token lacks Browse on the project. Don't fall back to guessing from the code.

## 2. Collect

In parallel: `get_project_quality_gate_status` (which conditions fail), `search_sonar_issues_in_projects` with statuses `OPEN,CONFIRMED`, `search_security_hotspots` with status `TO_REVIEW`, and for a failing coverage condition `search_files_by_coverage` on the new code. Read `show_rule` for each distinct rule you have not fixed before.

## 3. Fix

For each issue, read the code around it, then:

- **Real defect or smell**: fix it in the smallest change that keeps behaviour. Group issues by rule and fix a rule across all its files at once.
- **Rule that does not fit the project's design** (the code is right by the repo's conventions): don't contort the code. Propose excluding the rule for the project in `sonar-project.properties` (`sonar.issue.ignore.multicriteria`, with a comment saying why), and ask before adding it. Never mark issues one by one as false positive or won't fix.
- **Security hotspot**: decide safe or fix. A safe one gets a one-line justification for the user, who marks it in SonarQube; don't change hotspot status yourself.
- **Coverage on new code**: add tests for the uncovered behaviour that matters (branches, error paths), not for getters or wiring. A file that should never count (generated code, config, bootstrap) goes in `sonar.coverage.exclusions`, kept in sync with the build's own coverage exclusions.

## 4. Verify

Run the repo's lint, tests and build (the commands in its `CLAUDE.md`). All green before committing. Show `git diff --stat` and, for each rule, how many issues the change fixes.

## 5. Report and push

Commit with the branch convention of `~/.claude/CLAUDE.md` (`[branch] fix(sonar): …`). Push when the analysis is a merge request or branch the user owns and asked to fix; otherwise ask. Report as a table: rule, count, fix or reason left, plus the hotspots to mark safe and the exclusions proposed. The next pipeline re-runs the analysis; say which quality gate conditions should now pass.
