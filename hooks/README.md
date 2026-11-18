# Hooks

`post-merge`, `post-checkout` and `post-rewrite` re-run `scripts/install.sh`, so a pull, a branch switch or a rebase that adds, renames or removes a skill fixes this machine's links by itself.

They are wired by `scripts/install.sh`, which sets `core.hooksPath` to this directory when it runs inside the repo. Nothing to do on a fresh clone beyond running the install once.

A re-link is only needed when the *set* of skills changes. Editing a skill's text needs none: the install is symlinks, so an edit is live in every agent immediately.

## Why they stand down mid-operation

A rebase checks out every intermediate commit on its way, and `post-checkout` fires on each. Left alone, the hook links whichever tree it lands on — so a rebase that replays a rename can finish with the install describing a commit that no longer exists. That happened here: a rebase across the `code-review` → `review-change` rename left the old link in place and the new one gone.

So all three hooks exit early while a rebase, merge, cherry-pick, revert or bisect is in flight, and `post-rewrite` catches the end of a rebase, which is the point where the set of skills has settled.
