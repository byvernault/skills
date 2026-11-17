#!/usr/bin/env python3
"""Validate every skill in this repo.

Checks each skill's frontmatter, that every relative link resolves, and that
nothing points at a skill that has been archived.

    python3 scripts/check-skills.py            # the repo's own skills/
    python3 scripts/check-skills.py path/to/skills

Exits non-zero and lists each problem, so it works as a pre-commit hook or a CI
step. Links inside fenced code blocks are examples, not links, and are skipped.
"""
import pathlib
import re
import sys

REPO = pathlib.Path(__file__).resolve().parent.parent
ROOT = pathlib.Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else REPO / "skills"
ARCHIVE = ROOT.parent / ".archive"

LINK = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
FENCE = re.compile(r"^\s*(```|~~~)")
NAME = re.compile(r"^name:\s*(\S+)", re.M)


def outside_fences(text):
    """Yield the lines that sit outside fenced code blocks, where examples live."""
    in_fence = False
    for line in text.splitlines():
        if FENCE.match(line):
            in_fence = not in_fence
            continue
        if not in_fence:
            yield line


def check_frontmatter(skill, problems):
    parts = skill.joinpath("SKILL.md").read_text().split("---")
    if len(parts) < 3:
        problems.append(f"{skill.name}/SKILL.md: no frontmatter block")
        return
    fm = parts[1]
    for key in ("name:", "description:"):
        if key not in fm:
            problems.append(f"{skill.name}/SKILL.md: frontmatter missing {key}")
    found = NAME.search(fm)
    if found and found.group(1).strip('"') != skill.name:
        problems.append(
            f"{skill.name}/SKILL.md: name is {found.group(1)}, folder is {skill.name}"
        )


def check_links(skill, problems):
    for md in skill.rglob("*.md"):
        body = "\n".join(outside_fences(md.read_text()))
        for target in LINK.findall(body):
            if target.startswith(("http://", "https://", "#", "mailto:")):
                continue
            path = target.split("#")[0]
            if path and not (md.parent / path).exists():
                problems.append(f"{md.relative_to(ROOT)}: broken link -> {target}")


def check_archived(problems):
    """A pointer to an archived skill sends the agent at something that is gone."""
    if not ARCHIVE.is_dir():
        return
    archived = sorted(d.name for d in ARCHIVE.iterdir() if d.is_dir())
    for md in ROOT.rglob("*.md"):
        text = md.read_text()
        for name in archived:
            if re.search(rf"/{re.escape(name)}\b|`{re.escape(name)}`", text):
                problems.append(
                    f"{md.relative_to(ROOT)}: references archived skill {name}"
                )
                break


def main():
    if not ROOT.is_dir():
        sys.exit(f"no skills directory at {ROOT}")

    problems = []
    skills = sorted(d for d in ROOT.iterdir() if d.is_dir())
    for skill in skills:
        if not (skill / "SKILL.md").exists():
            problems.append(f"{skill.name}: no SKILL.md")
            continue
        check_frontmatter(skill, problems)
        check_links(skill, problems)
    check_archived(problems)

    print(f"{len(skills)} skills checked")
    if problems:
        print(f"\n{len(problems)} problem(s):")
        for p in problems:
            print(f"  - {p}")
        return 1
    print("no problems")
    return 0


if __name__ == "__main__":
    sys.exit(main())
