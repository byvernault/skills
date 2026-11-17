# Hooks

`post-merge` and `post-checkout` re-run `scripts/install.sh`, so a pull or a branch switch that adds, renames or removes a skill fixes this machine's links by itself.

They are wired by `scripts/install.sh`, which sets `core.hooksPath` to this directory when it runs inside the repo. Nothing to do on a fresh clone beyond running the install once.

A re-link is only needed when the *set* of skills changes. Editing a skill's text needs none: the install is symlinks, so an edit is live in every agent immediately.
