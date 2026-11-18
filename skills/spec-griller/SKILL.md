---
name: spec-griller
description: "Grill the user about a feature until the design is settled, then write the spec and publish it to the project issue tracker. Use to turn a vague feature idea into a spec someone can implement."
disable-model-invocation: true
metadata:
  credits:
    skill: to-spec
    author: Matt Pocock
    url: "https://github.com/mattpocock/skills"
---

Interview the user about the feature until nothing is left silently assumed, then write the spec and publish it. Works with an existing codebase or on a greenfield feature.

The issue tracker should have been provided to you. If not, read `docs/agents/issue-tracker.md` in the repo; if that doesn't exist either, default to the local-markdown tracker (one file per issue under `.scratch/<feature-slug>/`) and say which you used.

## Process

1. Explore the repo to understand the current state of the codebase, unless there is none to explore. Note the domain glossary vocabulary and the ADRs that bind the area you're touching: both constrain the design you're about to grill, and the spec has to speak that vocabulary.

2. Grill the user: call the Skill tool with `grill-design`, briefed with the feature and what step 1 found. Let it run until its frontier is empty — a feature the user has already decided in full is the only case for skipping it, and then say so. Facts about the codebase are yours to find, never the user's to supply.

3. Sketch out the seams at which you're going to test the feature. Existing seams should be preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better - the ideal number is one.

Check with the user that these seams match their expectations.

4. Write the spec using the template below, from the decisions step 2 settled, then publish it to the project issue tracker. Apply the `ready-for-agent` label — no further triage is needed, since the spec is written to be worked straight away.

**Create the label first if the repo doesn't have it.** Don't assume it exists; a fresh repo won't have it, and labelling fails if it's missing.

- **GitHub**: `gh label create ready-for-agent --color 0E8A16 --description "Ready for an agent to pick up" --force`. `--force` updates the label instead of failing when it already exists, so this is safe to run every time.
- **GitLab**: `glab label create --name ready-for-agent --color '#0E8A16' --description "Ready for an agent to pick up"`. This errors when the label already exists; that error is expected, so ignore it and carry on.
- **Local markdown**: no label to create. Record it as `**Status:** ready-for-agent` near the top of the spec file.
- **Other tracker**: apply the equivalent from `docs/agents/issue-tracker.md`, or skip the label if that tracker has no such concept.

<spec-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this spec.

## Further Notes

Any further notes about the feature.

</spec-template>
