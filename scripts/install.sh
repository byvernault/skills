#!/bin/sh
# Link every skill of this repo into each agent's skills directory.
#
#   ./scripts/install.sh                   # ~/.claude/skills and ~/.agents/skills
#   ./scripts/install.sh --dry-run         # say what it would do, change nothing
#   ./scripts/install.sh --target <dir>    # that directory instead of the defaults
#
# Idempotent: run it after every rename, add or removal. It links what is new,
# repoints what moved, removes the links this repo left behind under a name it
# no longer has, and refuses to touch anything it did not create — a real
# directory, or a link into someone else's skills. Those it reports, and exits
# non-zero, because two skills answering to one name is a silent ambiguity.
set -eu

REPO=$(cd "$(dirname "$0")/.." && pwd)
SRC="$REPO/skills"
DRY=0
TARGETS=""

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY=1 ;;
    --target) shift; [ $# -gt 0 ] || { echo "--target needs a directory" >&2; exit 2; }
              TARGETS="$TARGETS $1" ;;
    -h|--help) sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
  shift
done

[ -d "$SRC" ] || { echo "no skills directory at $SRC" >&2; exit 1; }

# Wire the repo's own hooks, so a pull that renames a skill re-links by itself.
if [ -d "$REPO/hooks" ] && [ "$(git -C "$REPO" rev-parse --git-dir 2>/dev/null)" ]; then
  if [ "$(git -C "$REPO" config --get core.hooksPath 2>/dev/null)" != "hooks" ]; then
    [ "$DRY" -eq 1 ] && echo "would set core.hooksPath=hooks" \
                     || git -C "$REPO" config core.hooksPath hooks
  fi
fi
[ -n "$TARGETS" ] || TARGETS="$HOME/.claude/skills $HOME/.agents/skills"

say() { [ "$DRY" -eq 1 ] && printf '  would %s\n' "$*" || printf '  %s\n' "$*"; }
run() { [ "$DRY" -eq 1 ] || "$@"; }

conflicts=0

for target in $TARGETS; do
  printf '%s\n' "$target"
  run mkdir -p "$target"
  if [ ! -d "$target" ]; then
    [ "$DRY" -eq 1 ] && say "create the directory" || { say "skip: not a directory"; continue; }
  fi

  for dir in "$SRC"/*/; do
    name=$(basename "$dir")
    link="$target/$name"
    want="${dir%/}"

    if [ -L "$link" ]; then
      case "$(readlink "$link")" in
        "$want") continue ;;
        "$REPO"/*) say "repoint $name"; run ln -sfn "$want" "$link" ;;
        *) say "CONFLICT $name -> $(readlink "$link") (left alone)"; conflicts=$((conflicts + 1)) ;;
      esac
    elif [ -e "$link" ]; then
      say "CONFLICT $name is a real directory (left alone)"; conflicts=$((conflicts + 1))
    else
      say "link $name"; run ln -s "$want" "$link"
    fi
  done

  # A link this repo owns, under a name the repo no longer has: a rename left it.
  for link in "$target"/*; do
    [ -L "$link" ] || continue
    case "$(readlink "$link")" in "$SRC"/*) ;; *) continue ;; esac
    [ -d "$SRC/$(basename "$link")" ] && continue
    say "remove stale $(basename "$link")"
    run rm "$link"
  done
done

if [ "$conflicts" -gt 0 ]; then
  printf '\n%d conflict(s): another skill already answers to that name. Remove it, or rename this one.\n' "$conflicts"
  exit 1
fi
printf '\ndone\n'
