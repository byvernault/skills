---
name: grill-design
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
metadata:
  credits:
    skill: grilling
    author: Matt Pocock
    url: "https://github.com/mattpocock/skills"
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**, as few as possible. The **frontier** is every decision whose prerequisites are settled or covered by a default proposed in this same round. Put the whole frontier in one round, then wait for the user's reply.

Sort each frontier decision into one of two kinds:

- **Default**: you have a sound recommendation the user is likely to accept (a convention, the obvious choice in context, an easy-to-reverse call). State it as a decision, not a question.
- **Open question**: a real trade-off with no clear winner, a matter of the user's taste, priorities or constraints you cannot look up, or a hard-to-reverse choice. Ask these only, with your recommended answer.

Questions downstream of a default may go in the same round, assuming the default holds. When the user overrides a default, drop what was built on it and recompute.

Format a round like so:

```
**Defaults** (reply `ok` to accept them all, or override by number: `D2: <your choice>`)

- **D1** - **<decision>**: <the default, one line> (<why, a few words>)
- **D2** - ...

---

❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Word each open question so "yes" accepts your recommended answer. A reply of `ok` or `yes` accepts every default and every recommended answer of the round. Skip a section that has nothing in it; a round with only defaults is fine.

Each reply reshapes the tree: settled decisions push the frontier outward. Recompute it and run the next round. A question whose answer depends on another *open question* still unanswered in this round belongs to a later round.

Finding _facts_ is your job, never the user's. When a frontier decision needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the decisions downstream of it wait for the sub-agent to report; put the rest of the frontier to the user now. The _decisions_ are the user's, defaults included: put each to them and wait.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Close with the list of settled decisions, and do not act on it until the user confirms you have reached a shared understanding.

Then write the settled decisions to `~/.claude/grilling/<branch>.md`, `<branch>` being the branch the work will take (named by the rules in `~/.claude/CLAUDE.md`), so the decisions outlive the conversation and `review-change`'s Agreement reviewer reads them. Header: date, repositories, the request in one line. Body: one numbered line per decision, `D1`, `D2`…, in the user's words where they overrode a default. When a later session reopens a decision, update the file. Give the user its path.
