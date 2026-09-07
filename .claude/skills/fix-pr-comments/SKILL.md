---
name: fix-pr-comments
description: >-
  Work through a PR's review comments: judge each on merit, fix what's worth fixing, reply with
  reasons when it isn't, verify, then hand off to git-commit. Use for addressing PR feedback,
  resolving review comments, "apply the review", or fixing what a reviewer flagged. Not for doing the
  review, the PR description, or merging.
---

# fix-pr-comments

Take a PR's review comments and act on **all** of them — but act _thoughtfully_. For each comment the
skill decides whether the change is worth making, then either makes the best possible fix or declines
with a reasoned reply on the thread. When code changes are done, it verifies them and hands off to
`git-commit`.

The point isn't to blindly obey every comment. A good contributor weighs feedback. So does this skill.
The decision axes and conflict rule are captured at the bottom under **Conventions used by this
skill** — edit them there when you fork it.

## Workflow

### 1. Collect all comments

Takes an **optional PR number/URL**. If given, work on that PR; if not, resolve the PR from the current
branch, or ask which PR. Then read every open review comment (inline, line-anchored) and general PR
comment from the connected MCP. Keep each comment's file/line, its Conventional-Comments label if it
has one, and its thread. Group related comments so you don't fix the same thing twice.

**Skip what's already handled** — this skill is re-run on the same PR all the time (a second round of
review, a resumed session). A thread that is already resolved, or whose last reply is yours and
answers it, is done: don't re-fix it and don't post a second reply. Work the rest.

### 2. Check each comment against the current code

A comment describes the code **as it was when the reviewer wrote it**. Before deciding anything, open
the file at its current state and confirm the comment still applies. Three outcomes:

- **Still applies** → carry on to step 3.
- **Already fixed** (by a later commit, or by another comment's fix) → don't touch the code; reply
  saying it's addressed and where, and resolve the thread.
- **The line moved or the code around it changed** → re-anchor to what the reviewer actually meant
  before fixing; never apply a fix at a stale line number.

Never trust a line number over the file. If a comment is unreadable out of context, say so and ask
rather than guessing at the intent.

### 3. For each comment, decide: is the fix worth it?

Weigh it on the decision axes below (impact, validity, cost/scope-creep, conflict). A comment's label
is a strong hint but not the verdict: `(blocking)`/`issue` lean fix; `nitpick`/`thought`/`note` lean
optional — but judge the substance, not just the tag.

### 4a. If it's worth fixing → make the best fix

Not the most literal fix — the best one. Understand what the reviewer is protecting against and solve
that, cleanly, in keeping with the surrounding code and the team standards. If the comment suggested a
specific approach but a better one exists, do the better one and note briefly why on the thread.

**Reply on the comment thread explaining how it was resolved** — what changed and why that addresses
the concern. Resolve the thread if your tooling supports it and the fix is complete.

### 4b. If it's _not_ worth fixing → decline with reasons

**Reply on the comment thread stating why it isn't worth doing** (not just to the user) — the
pros/cons you weighed, honestly. Offer the alternative when there is one. A
Conventional-Comments-style reply fits well (`thought:`, `note:`). Never silently ignore a comment —
every thread gets an answer.

**Don't claim a follow-up you haven't created.** "Out of scope for this PR" is a complete answer;
"filed as a follow-up" is only true once the issue exists. If a follow-up is the right call, either
create it through the connected MCP (ask the user first — it's outward-facing) and reply with the real
link, or say plainly that it needs one and leave it to the author.

### 5. When conflicts arise

If a comment contradicts a team standard, a deliberate decision, or another reviewer's comment:
**correctness and documented standards win over preference.** Don't silently comply. Surface the
conflict to the user with the tradeoff, and by default follow the standard — replying to the comment
with the rationale — unless the user overrides.

### 6. Verify before handing off

Review fixes are edits made under someone else's framing, in files you didn't write — the class of
change most likely to break something quietly. Run the project's checks over what you touched (the
command is in **Conventions used by this skill**; `CLAUDE.md` wins if it names a different one) and
read the output.

- **Green** → carry on to step 7.
- **Red** → fix what you broke before committing. If a failure is pre-existing and unrelated, say so
  explicitly rather than fixing it here; that's scope creep.
- **Can't run them** (no deps installed, no such target) → say so plainly and hand off unverified.
  Don't imply checks passed.

### 7. Hand off to git-commit

Once the worth-fixing changes are made and verified, invoke the **`git-commit`** skill to commit them.
That skill proposes a Conventional Commits message and discusses it with the user before committing —
let it do its job rather than committing here. Typical shape:
`fix(<scope>): address review feedback` with a body summarizing what changed, or split into logical
commits if the fixes are separable.

`git-commit` stops at the commit — it does not push. **The reviewer sees nothing until the branch is
pushed**, so ask the user whether to push (and push only if they say yes).

Then summarize for the user: what was fixed, what was declined and why, what needs a follow-up, which
threads were already handled, the verification result, and any conflicts you surfaced.

## Guardrails

- **Act on every comment** — fix, decline-with-reasons, or defer-with-a-note. Nothing gets dropped
  silently, nothing gets answered twice.
- **Check the code, not the comment.** A comment can be stale; the file is the truth.
- **Best fix, not literal fix** — solve the underlying concern, don't just pattern-match the wording.
- **Guard scope** — don't let review feedback balloon the PR; push genuinely separate work to
  follow-ups, and don't repair unrelated pre-existing failures.
- **Don't fabricate** agreement, rationale, a created follow-up, or a passing check. If you're unsure
  whether a fix is right, say so and ask.
- **Don't merge.** Committing the fixes (via `git-commit`) is the end of this skill's job; pushing
  happens only when the user asks.

## Conventions used by this skill

Edit this section when adapting the skill to a repo.

**Decision axes (is the fix worth it?):**

- **Impact** — correctness, security, data integrity, contract. High impact → almost always fix.
- **Validity** — is the comment actually right, or missing context?
- **Cost / scope creep** — does the fix stay within this PR's purpose, or drag in unrelated work?
  A good idea that belongs in a follow-up _is_ a follow-up.
- **Conflict** — does it contradict a deliberate decision, a standard, or another comment?

**Staleness check:** every comment is validated against the current file before acting — still
applies / already fixed / re-anchor. A line number is never trusted over the file.

**Idempotency:** threads that are resolved, or whose last reply is yours and answers the comment, are
skipped — no second fix, no second reply.

**Label hints:** `(blocking)` / `issue` lean fix; `nitpick` / `thought` / `note` lean optional. The
label informs but doesn't decide — weigh the substance.

**Every comment gets one of:** a fix, a decline-with-reasons reply on the thread, or a
defer-with-a-note. Never dropped silently. A follow-up is only called "filed" once it exists.

**Verification command** (run after the fixes, before the hand-off): `npx nx affected -t lint test build`.
Swap this for the repo's own check command when you fork the skill; `CLAUDE.md` wins over this line.
Note that a thin test suite passing is not evidence a change is correct — read the diff too.

**Conflict rule:** correctness and documented standards win over preference. Surface genuine
conflicts to the user; follow the standard by default (replying with the rationale) unless overridden.

**Tool declaration:** this skill deliberately declares no `allowed-tools`. It drives the connected
code-hosting MCP, whose tool names differ per provider — pinning one provider's names would silently
break the skill in every other repo, and a wildcard would grant more than it needs. Scope is enforced
by the guardrails above instead. `git-commit`, whose whole toolset is local git, does declare one.

**Git MCP operations used** (discover the tools from the connected MCP — Bitbucket/GitHub/GitLab): read a PR's review + general comments; reply on a comment thread; resolve a thread; optionally create a follow-up issue (only with the user's go-ahead).

**Hand-off:** commit via the `git-commit` skill, which proposes and discusses the message. This skill
does not commit directly, does not push without being asked, and does not merge.
