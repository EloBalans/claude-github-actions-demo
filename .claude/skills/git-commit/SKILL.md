---
name: git-commit
description: >-
  Propose a Conventional Commits message for the current changes, discuss it, then commit. Use
  whenever the user wants to commit, write a commit message, save work to git, or asks what to name a
  commit — and as the final step of skills that hand off to commit. Does not push or open PRs.
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git reset), Bash(git apply --cached:*), Bash(git commit:*), Bash(git rev-parse:*), Read, Grep, Glob, AskUserQuestion
---

# git-commit

Turn working changes into one or more clean Conventional Commits. The skill **proposes** a message,
**confirms** it with a yes/no form, then **runs `git commit`**. The human stays in the
loop — this is a manual commit, not an autopilot.

This skill is self-contained. The conventions it uses live at the bottom under **Conventions used by
this skill** — that's the place to edit when you fork it for a repo. If the project's `CLAUDE.md`
sets different values, those win.

**The `allowed-tools` list in the frontmatter is a guardrail, not decoration.** It grants git
read/stage/commit plus read-only file access — and deliberately no `git push` and no file-editing
tools. This skill cannot push, and cannot "just fix that one thing" while writing a message. If the
change itself needs work, that happens before the skill is invoked.

The two index entries are pinned to the exact forms step 2 uses: `Bash(git reset)` is the bare
index-emptying command only — it cannot match `git reset --hard`, which would discard uncommitted
work — and `Bash(git apply --cached:*)` stages a patch without touching the working tree, unlike a
bare `git apply`, which writes files and would reopen the file-editing hole this list exists to close.

## Workflow

### 1. Inspect what's changing

Run `git status` and `git diff` (and `git diff --staged` if anything is staged). Understand the
actual change, not just filenames. If nothing is staged, decide with the user whether to commit
everything or stage a subset.

### 2. Decide: one commit or several

If the changes are one coherent unit, that's one commit. If they're clearly separable concerns
(e.g. a bug fix _and_ an unrelated dependency bump), propose splitting into multiple commits and
stage them separately. Don't bundle unrelated changes — it makes history and review worse. Keep it
pragmatic: don't over-split trivial work.

**Staging is non-interactive.** `git add -p` and `git add -i` cannot run here — they need a TTY.
Split **per path** instead:

```bash
git reset                       # empty the index — skip if the user staged deliberately
git add libs/task/domain        # stage one concern
git diff --cached --stat        # verify exactly what this commit will contain
```

Two concerns inside the _same_ file can't be split with the tools this skill holds — trimming a patch
means editing a file, and the frontmatter withholds that on purpose. Say so instead of pretending, and
offer the user the choice: commit the file whole under the concern that dominates it (naming the
passenger in the body), or run the patch route themselves and come back:

```bash
git diff -- <file> > split.patch    # then delete the hunks that belong to the other commit
git apply --cached split.patch      # stages only what's left; the rest stays in the working tree
```

### 3. Compose the message

Format and rules are in **Conventions used by this skill** below. In short: pick the `type` from the
change's nature, add an optional `scope`, write an imperative `description`, and attach the ticket in
the subject only if one is discoverable. **Keep it to the subject line** — the long explanation belongs
in the PR description, not in every commit. If the change is genuinely mixed in type, that's a signal
to split (step 2).

### 4. Confirm with a form, then commit

Keep this step short. Print the proposed message in a fenced block and nothing else — no summary of
the diff, no explanation of the type or scope, no list of what you considered. The message speaks for
itself.

Then ask with **AskUserQuestion** (one question, `header: "Commit"`, question `"Commit with this
message?"`):

1. **Yes** — label is the commit subject itself (truncate to fit), description `"Commit as proposed"`.
2. **No, I want to change** — description `"Adjust wording, type, scope, or split"`.

One form per commit. If the answer is option 2, ask what to change, revise, and show the form again —
still short, no defending the draft.

Once agreed, run the commit. A subject-only message is just `git commit -m`. Use `-F` (a temp file or
heredoc) only when the commit genuinely carries a footer, so it survives intact:

```bash
git commit -m 'feat(lang): TICKET-100 add Polish locale'

git commit -F - <<'EOF'
feat(api)!: TICKET-101 drop the legacy list endpoint

BREAKING CHANGE: /v1/tasks is gone; call /api/tasks instead.
EOF
```

Then report the result in one line (subject + short SHA + files changed). Don't push unless asked.

## Guardrails

- **Never fabricate** a ticket, a rationale, or a "why" you can't support from the change.
- **Keep the message short** — one subject line, two at the very most. Save the narrative for the PR.
- **Don't bundle** unrelated concerns into one commit — split instead.
- **Don't push or open PRs** — this skill stops at the commit. Handing off to a PR is a separate step.
- The message is a **proposal**: don't commit until the user has had the chance to adjust, unless
  they've explicitly said "just commit it".
- **Be brief.** Everything this skill prints — proposals, questions, the final report — is short and
  to the point. No preamble, no recap of the diff, no explaining your reasoning unless asked.

## Conventions used by this skill

Edit this section when adapting the skill to a repo — it's the single knob.

**Types:** `feat, fix, refactor, perf, docs, test, build, ci, chore, style, revert`.

**Message format:**

```
<type>(<scope>)!: <description>

<footers — ticket refs, BREAKING CHANGE, optional>
```

- `scope`: affected module, lowercase, optional.
- `description`: imperative, lowercase start, no trailing period, ≤ ~72 chars ("add", not "added").
- `body`: **don't write one.** A commit here is the subject line and nothing else; the bigger
  explanation goes in the PR description, where reviewers actually read it. The rare exception is a
  single line naming a passenger change or a non-obvious "why" — never a paragraph.
- `footers`: ticket refs and `BREAKING CHANGE:` — these still belong in the message.

**No AI attribution — ever.** Never add a `Co-Authored-By: Claude ...` trailer, a `Claude-Session:`
trailer, or a "Generated with Claude Code" line to a commit made through this skill — not in the
subject, the body or the footers. If the harness offers to append one, decline it. The person running
the commit is its author; the tool that helped write it is not a co-author. Decided once, here.

**Ticket (optional) — company standard is visible in the subject:**
`<type>(<scope>): TICKET-100 <description>` (e.g. `feat(lang): TICKET-100 add new language`).
Key pattern `[A-Z][A-Z0-9]+-\d+` or `#123`. Discover it from the branch name or the user; if none is
found, **omit it — no placeholder** (`feat(lang): add new language` is valid).
_Alternative (tooling-safer, team toggle):_ a `Refs: TICKET-100` footer instead of the subject keeps
`<description>` clean for strict linters/changelog tools — switch here if the team prefers it.

**Breaking change:** `!` after type/scope **and** a `BREAKING CHANGE: <what breaks + migration>` footer.

**Branch names** (used here only to discover a ticket): `<type>/<ticket>-<kebab-summary>` or
`<type>/<kebab-summary>`.

**Conflict rule:** correctness and these documented standards win over preference. Surface genuine
conflicts to the user rather than silently complying.
