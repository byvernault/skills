# <Project> verification profile

How to run and prove <project>'s UI with the `verify` skill. Read before driving the app, then the matching file in `features/`.

## Launch

<!-- Commands to start the front and its API on free ports, from which folder, and when each is ready.
     Say how to run several checkouts side by side (port per worktree, database per worktree) if the project allows it. -->

## Health

<!-- The checks that say the stack is up: health endpoints and their expected answer, the front URL, where each
     service writes its startup logs, and the start failures already met with their fix (missing variable,
     migration conflict…). The start check of the verify skill runs these. -->

## Doctor

<!-- A read-only check that the stack on those ports is this checkout's and is ready: `.claude/verify/doctor.sh <n>`,
     or the list of checks to run by hand. Every check must pass before driving. -->

## Users

<!-- The seeded users per role, their password (or where it comes from), and how sign-in works (`config.json` login). -->

## Baseline

<!-- The data state every feature file assumes: seeds, fixed ids, what a mutation must leave as found. -->

## Mockups

<!-- Where the mockups live (folder, Figma export, HTML file), their scale (@1x, @2x), their theme and width,
     and how a spec names a screen. An index of screen → PNG (and region) when the files are not self-explanatory. -->

## Conventions

<!-- Node runner (`node`, `volta run node`), the folder commands run from, locale, anything every command needs. -->

## Role matrix

<!-- Optional: who sees which menu entry or route. -->

## Gotchas

<!-- Project-specific traps: autosave timings, shared services not to stop, expected error states, flaky screens. -->
