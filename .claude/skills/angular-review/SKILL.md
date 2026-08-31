---
name: angular-review
description: Review a pull request against the conventions the project states about itself. Use when reviewing a diff, a branch, or an open pull request.
allowed-tools: Bash(git diff:*), Bash(git log:*), Bash(npx nx:*), Read, Grep, Glob, mcp__github_inline_comment__create_inline_comment
---

# Pull request review

Post one inline comment per finding, at the line it applies to. If the diff is
clean, say so in a single summary comment.

## Where the rules come from

Read `CLAUDE.md` first, plus any nested one that covers a changed file. Those
are the project's rules; this skill does not restate them. Where the project is
silent, follow what the surrounding code already does — a diff that breaks the
conventions of the file it lands in is a finding even when no document names
the rule.

## The diff is the starting point, not the boundary

Follow each change to where it actually lands, then stop:

- A changed exported symbol is a change to every caller. Find them and read
  them before judging the diff. A caller that still compiles can still be
  wrong.
- A changed import may cross a boundary the build enforces. Read the project's
  own boundary configuration rather than guessing the layering.
- A changed component class is half the change. Open its template.
- A new subscription, provider, or lifecycle hook: read how the rest of the
  file already handles the same thing, and hold the change to that.

Stop when you can name the runtime consequence — or when you have established
there is none.

## What earns a comment

| Evidence you have                                                           | What to do                                                                                   |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Reproduced behaviour, a failing test, compiler or lint output               | Report it.                                                                                   |
| The changed code plus the caller, consumer, or template you actually opened | Report it.                                                                                   |
| A pattern that is usually a problem                                         | Keep digging until you can name the concrete failure in _this_ code. If you cannot, drop it. |
| Style a formatter or linter already owns                                    | Never.                                                                                       |

Code that looks wrong is not automatically wrong. Before reporting, check
whether the project documents the choice, or whether a name or test says it is
deliberate. Read unchanged code only to prove an affected path — never to
review it.

An invented finding costs more than a missed one: it teaches the team to stop
reading the review.

## Each comment

What is wrong · what it does at runtime · the corrected snippet.

Open with a severity marker:

- **blocking** — data loss, a leak, a race, a broken cross-package contract.
- **should-address** — a real defect with a bounded blast radius.
- **optional** — a genuine improvement the author may decline.

Order findings by blast radius, not by file position. No praise, no restating
the diff, no speculation about intent.
