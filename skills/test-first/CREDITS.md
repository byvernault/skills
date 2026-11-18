# Credits

This skill is [Matt Pocock](https://github.com/mattpocock)'s [`tdd`](https://github.com/mattpocock/skills), copied word for word and renamed, [`tests.md`](tests.md) and [`mocking.md`](mocking.md) included. The red-green-refactor loop, the integration-test bias, the seam reasoning and the mocking rules are his.

One line changed: where the original reaches for `codebase-design`, this one reaches for [`deep-modules`](../deep-modules/SKILL.md), the copy that lives beside it in this repo.

It is vendored rather than pointed at so this repo stands on its own: `implement-ticket` and `spec-to-code` both call it, and without it they lose test-first entirely. A copy under my own name is mine to maintain; the attribution a dependency would have carried lives here instead.
