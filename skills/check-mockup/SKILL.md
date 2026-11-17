---
name: check-mockup
description: "Compare a screen of the running front end with its mockup, element by element, and fix what differs. Use when a ticket or spec gives a mockup for a screen, to check a UI change against its design, or before asking the user to QA a visual change."
---

Prove a screen matches its mockup, on the running app, before handing back. Run it for every visual change that has a mockup; a change with none is `verify`'s job alone.

## 1. Find the mockup

The mockup the spec or ticket names: a PNG and, when given, a region `x,y,w,h` of it. None named: look in the *Mockups* section of the project's verify profile (`.claude/verify/README.md`). Still none: say so, run `verify` on the screen and stop here — there is nothing to compare against, and saying "matches" without an image is the failure this skill exists to prevent.

Note the mockup's width and theme. Those, not your defaults, are what you capture at.

## 2. Capture the screen

Call the Skill tool with `verify` to launch the stack and drive the real user path to the screen, capturing at the mockup's width in the mockup's theme, with `--viewport` when the mockup shows one screen. For an exact size — a modal, a card — capture that element alone with `--element <selector>` and note the size it prints.

## 3. Build the comparison

`<verify>` below is the `verify` skill's folder, next to this one.

```sh
node <verify>/scripts/compare.mjs --mockup <mockup.png> [--region x,y,w,h] --capture <capture.png> \
  [--capture-region x,y,w,h] [--scale 2] --out <comparison.png>
```

It writes mockup, capture and their difference side by side. `--region` crops the mockup; the capture takes the same region unless `--capture-region` is given; `--scale` divides an `@2x` mockup.

## 4. Read it, element by element

Read the comparison image and check, in this order:

- **Colours**: buttons, text, backgrounds, borders.
- **Alignment and spacing**.
- **Sizes**: modals, buttons, inputs — against the size step 2 printed, not against your eye.
- **Labels**: exact wording, case, punctuation.
- **Icons**.
- **States shown**: hover, disabled, error, empty.

## 5. Fix and re-compare

Fix each difference that is a bug, capture again, compare again. Stop when what remains is deliberate.

Hand back the comparison image of each screen and the list of remaining differences, each with why it stays: the data differs, it's out of scope, or the mockup is outdated. Never write "matches" without having read both images.
