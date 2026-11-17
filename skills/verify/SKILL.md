---
name: verify
description: "Drive a project's web app in a real browser, signed in as any role, and capture screenshots and ARIA snapshots per theme and width. Use to prove a UI change works, to check the app starts with a change, for the screenshot of a merge request, or before asking the user for QA."
---

Prove a UI change on the running app. The process and the browser harness are generic; everything about one project lives in its **profile**, `.claude/verify/` at the repository root.

## 1. Load the profile

From the repository root, read `.claude/verify/README.md`, then the feature file of the screen you changed (`.claude/verify/features/`). The README says how to launch the stack, check it, sign in, and where the mockups are; `config.json` drives the harness.

No profile: set one up first (see *Setting up a profile*), then go on.

## 2. Harness

The scripts live next to this skill, in `scripts/`. Below, `<verify>` is this skill's folder (`~/.claude/skills/verify`). Once per machine:

```sh
npm --prefix <verify>/scripts ci && (cd <verify>/scripts && npx playwright-core install chromium-headless-shell)
```

Use the node runner the profile names (for example `volta run node`); plain `node` otherwise.

## 3. Launch and check

Follow the profile's *Launch* and *Doctor* sections. Run the doctor before driving and whenever a capture looks wrong: every line must pass. Never drive a port or a database that belongs to another checkout.

## Start check

Proves the app starts with the change, before anyone else runs it. `/implement-ticket` and `/review-to-pr` call it; run it alone after any change to configuration, migrations, security or endpoints.

1. **Start** the stack as the profile's *Launch* says, on a free slot. An instance already running from this checkout started before the last change does not count: restart it.
2. **Health**: wait for every health check the profile lists (API health endpoint, front served), then run the doctor.
3. **Logs**: read the startup logs of each service, even when health passes. Any error or failed startup step is a finding: a missing environment variable or property, a failed or conflicting migration, a bean or module that does not load, a refused identity provider configuration.
4. **Endpoints**: call each endpoint the change adds or modifies once, through the front's proxy when there is one, with a token of a role allowed to use it. A 404, 405 or 5xx is a finding; a 401 or 403 only when that role should pass.
5. **Fix** each finding the change caused, restart and check again. A new variable gets a working local default and lands everywhere the project declares its configuration (`.env.example`, compose, the start script); a migration whose version collides with one on the target branch is renumbered above the target's highest. A failure the change did not cause (also failing on the target branch, a shared service down): report it, don't fix it.

Done when every check passes. Leave the stack running when verification follows, else stop what you started (*Clean up*). Report what was started, the checks run, and what was fixed.

No profile: find the start command and the health endpoints in the repository (README, compose, start scripts), run the same checks, and propose recording them in a profile.

## 4. Drive

```sh
node <verify>/scripts/shot.mjs --user <role> --path <route> [--wait <selector>] [--themes light,dark] \
  [--widths 1440,375] [--steps <module.mjs>] [--element <selector>] [--viewport] [--label <name>] [--out <dir>] \
  [--front <url>] [--config .claude/verify/config.json]
```

- Signs in as `--user` the way `config.json` says, opens `--path`, captures each theme × width as `<label>_<user>_<theme>_<width>.png` plus `.aria.yml`, and prints each path.
- Exits 1 with a `FAIL` line when the page is not the one asked for (redirect, an error page matching `errorPattern`, theme not applied). For an access check, that failure is the proof.
- `--steps`: a module whose default export receives the Playwright page and `{ theme, width, shot }`; `shot(name)` saves an intermediate capture. Use roles and accessible names (read the `.aria.yml` of a first capture). Put a project's recipes in `.claude/verify/steps/`.
- `--element`: also captures that element alone (a modal, a card) and prints its size, to check dimensions against the mockup.
- To check API calls, listen in the steps: `page.on('response', …)` and log the failing ones.

## 5. Prove

A proof:

- drives the real user path (the menu link or the button, not a URL the user never types, unless the feature is a direct link);
- captures before and after the action, and reads the result back from a second view (reload, the screen that lists it, or the API);
- covers the roles the change concerns, including one that must *not* see it;
- leaves the data as found: undo mutations in a `finally`, and check the start state at the top of the steps.

Read every PNG you report on.

## 6. Compare with the mockup

For every visual change that has one, before handing back: call the Skill tool with `check-mockup`, which owns the comparison and the bar it has to clear. No mockup for the screen: say so in the report.

## 7. Clean up

Stop what you started, by the PID listening on the port you launched, never by process name. Leave shared services (database, identity provider) running unless the profile says otherwise. The evidence stays in `$TMPDIR/verify/`.

## Gotchas

- A full-page capture keeps fixed elements where the first viewport put them (sidebars, mobile bottom bars): use `--viewport` to see what a user sees.
- Wait for the network response of a save (`page.waitForResponse`, started before the action), not for a "saved" text that may show earlier.
- Each capture starts a fresh browser context: `localStorage` is at its defaults unless the config or the steps set it.
- Right after a route change, wait for a heading of the new page before capturing, or a transition gets caught.

## Setting up a profile

When a repository has no `.claude/verify/`, create it with the user, from `templates/` in this skill:

- `README.md`: Launch, Health, Doctor, Users, Baseline, Mockups, Conventions, Role matrix, Gotchas. Find what you can in the repository (README, compose files, scripts, seeds, CI) and ask only what you cannot find, proposing a default for each.
- `config.json`: the harness settings (front URL, sign-in, theme, locale, error pattern).
- `features/`: one file per user-facing feature, written the first time you verify it: sub-features, how a user gets there, the `shot.mjs` commands that prove it, gotchas. `features/README.md` lists them.
- Optional: `doctor.sh` (a read-only check of the stack) and `steps/` (reusable recipes).

Commit the profile with the repository: the team shares it, and it grows with each feature verified.
