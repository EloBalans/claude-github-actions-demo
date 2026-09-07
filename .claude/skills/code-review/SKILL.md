---
name: code-review
description: >-
  Review a PR or the local diff, sort findings into Error / Warning / Info, show them in a table, and
  post the ones the user picks as inline PR comments. Use for reviewing a PR or branch, checking a
  diff, or feedback before merge. Optional PR number/URL. Not for writing PR descriptions, applying
  comments, or merging.
---

# code-review

Review changes, sort every finding into **Error / Warning / Info**, show them in a table,
let the user choose which to post, then post the chosen ones inline on the PR. The hard part of a good
review is calibrating what's worth saying — this skill's job is that calibration, then a clean
select-and-post loop.

**An invented finding costs more than a missed one**: it teaches the team to stop reading the review.
The bar for reporting is evidence (step 4), not suspicion — and a clean diff gets told it's clean.

This skill is self-contained. The skip-list, the categories, and the comment format live at the
bottom under **Conventions used by this skill** — edit them there when you fork it.

## Step 1 — Get the changes, and the rules they're judged against

The changes:

- **PR given** (a PR number or URL was passed): read it from the connected MCP — its context and
  description, the changed-file list, and the diff. Use the PR description for the _why_.
- **No PR given**: review the **current local changes** instead — `git diff` (unstaged),
  `git diff --cached` (staged), or `git diff <base>...HEAD` against the base branch, whichever the
  user means. This is the pre-push self-check path.

The rules: **read the repo's `CLAUDE.md` first, plus any nested one that covers a changed file** (a
nested `CLAUDE.md` is not loaded automatically — open it). Those are the project's rules, and this
skill doesn't restate them; it says how to weigh them. Where the project is silent, follow what the
surrounding code already does — **a diff that breaks the conventions of the file it lands in is a
finding even when no document names the rule.** If `CLAUDE.md` states a review priority order, that
order wins over the generic tiers below.

## Step 2 — Drop the files that aren't worth reviewing

Before reading diffs, filter out files a human reviewer wouldn't hand-review (see the skip-list at the
bottom): images, PDFs/office docs, lock files, generated/build output.

Config is **not** a blanket skip — skip it only when the change is cosmetic. A config change is
behavioural, and gets reviewed like code, when it moves any of these:

- **project/workspace config** (`project.json`, `nx.json`, `turbo.json`, …) — tags, targets and
  dependency boundaries live here; a changed tag can legalise an import the architecture forbids.
- **lint/compiler config** (`eslint.config.*`, `tsconfig*.json`) — a disabled rule or a loosened
  compiler flag is a change to every file in its scope.
- **dependencies** (`package.json` and friends) — anything added, removed or bumped.
- **CI, runtime and deploy config** — anything that changes what runs, where, or with which secret.

One exception the other way: if a _skipped_ file appears to contain a committed **secret**
(key/token/`.env`), surface that as an **Error** — that's the one thing worth catching in the noise.

## Step 3 — Follow each change to where it lands

The diff is the starting point, not the boundary. For each meaningful change, follow it out and then
stop:

- **A changed exported symbol is a change to every caller.** Find them and read them before judging
  the diff — a caller that still compiles can still be wrong. This is why a diff touching only a
  shared package can be more dangerous than a big one.
- **A changed import may cross a boundary the build enforces.** Read the project's own boundary
  configuration rather than guessing the layering.
- **A changed class or module is half the change** — open its template, its consumer, its test.
- **A new subscription, provider, handler or lifecycle hook**: read how the rest of the file already
  handles the same thing, and hold the change to that.

Stop when you can name the runtime consequence — or when you have established there is none. Read
unchanged code only to prove an affected path, never to review it.

## Step 4 — Categorize: the evidence bar

Sort each finding into exactly one tier:

- **Error** — must fix before merge: correctness bugs, security holes, data loss/corruption, breaking
  a public contract/API, crashes, race conditions, resource leaks.
- **Warning** — should fix: missing error handling, risky patterns, performance problems,
  maintainability traps, missing tests for new behaviour. Not an outright bug, but shouldn't ship as-is.
- **Info / Suggestion** — optional: naming, readability, structure, a better-but-optional approach.

What earns a comment at all:

| Evidence you have                                                           | What to do                                                                                     |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Reproduced behaviour, a failing test, compiler or lint output               | Report it.                                                                                     |
| The changed code plus the caller, consumer or template you actually opened  | Report it.                                                                                     |
| A pattern that is _usually_ a problem                                       | Keep digging until you can name the concrete failure in **this** code. If you cannot, drop it. |
| Style a formatter or linter already owns (whitespace, import order, quotes) | Never.                                                                                         |

**Unsure is not a tier.** A finding you can't back doesn't get demoted to a Warning to be safe — it
gets dropped. Post a `question:` only when the answer would change what the author should do. Code
that looks wrong is not automatically wrong: before reporting, check whether the project documents the
choice, or whether a name, a test or the PR description says it is deliberate.

Then keep the review readable: comment on a repeated issue **once** ("same applies elsewhere"),
consolidate nearby micro-comments, and pair every Error/Warning with a concrete fix.

## Step 5 — Show the findings table

Render the findings in the chat as a table, ordered Error → Warning → Info, and **within a tier by
blast radius, not by file position**:

| #   | Severity | File:line             | Finding                                       | Suggested fix                                        |
| --- | -------- | --------------------- | --------------------------------------------- | ---------------------------------------------------- |
| 1   | Error    | `src/api/users.ts:42` | `await` inside the loop makes requests serial | collect promises, `await Promise.all` after the loop |
| 2   | Warning  | `src/api/users.ts:19` | no error handling on the fetch                | wrap in try/catch, surface a typed error             |
| 3   | Info     | `src/api/users.ts:8`  | `d` is a vague name                           | rename to `userDelta`                                |

Keep the "Finding" and "Suggested fix" cells to one line each; detail goes in the posted comment.

**Nothing found is a result.** Say the diff looks fine, name what you checked and followed, and stop.
Don't pad the table to look thorough.

## Step 6 — Let the user choose, then post

Ask which findings to post and which to drop — e.g. "Post all, none, or specific numbers?" (an
`AskUserQuestion` multi-select works well; offer _All errors+warnings_, _All_, _Pick_, _None_). Default
nothing to posted until they choose.

Then **post the selected findings automatically** as inline PR comments (PR mode only):

- Create one PR review, attach each selected finding to its file + line (right side of the diff for
  added lines), then submit — so they land as one coherent review, not a scattered stream.
- Format each comment in Conventional Comments style, mapped from its tier (see bottom). Each comment
  says: what is wrong · what it does at runtime · the corrected snippet.
- Submit event: `REQUEST_CHANGES` if any posted finding is an **Error**, else `COMMENT`. Leave
  `APPROVE` to a human.
- **Reviewing your own PR falls back to `COMMENT`.** The host rejects both `APPROVE` and
  `REQUEST_CHANGES` from a PR's own author, and this repo's flow (`generate-pr`, then `code-review`
  on the same branch) puts the author in the reviewer seat by default. Submit the findings as a
  `COMMENT` review and say in the summary that the Error tier could not be recorded as a blocking
  event — never let the whole review fail to post over the event name.

If you were reviewing **local changes** (no PR), there's nowhere to post — present the table and note
that posting will be available once a PR exists (hand off to `generate-pr` if they want one).

## Guardrails

- **Evidence, not suspicion.** If you can't name the runtime consequence, drop the finding.
- **Say when the diff is fine.** Never invent a finding to fill a review.
- **Concrete, not vague.** Every Error/Warning names what and why, with a fix.
- **Respect the skip-list and deliberate decisions.** Don't re-review lock files; don't relitigate a
  choice the PR description or `CLAUDE.md` already justifies.
- **No praise, no restating the diff, no speculation about intent.** The review is a defect report.
- **Only post what the user selected.** No surprise comments.
- **Don't fix, don't merge.** Applying comments is `fix-pr-comments`.

## Conventions used by this skill

Edit this section when adapting the skill to a repo.

**Input:** optional PR number/URL. Given → review that PR via the connected MCP. Absent → review current
local changes (`git diff` / `--cached` / `<base>...HEAD`).

**Rules source:** the repo's `CLAUDE.md` + any nested `CLAUDE.md` covering a changed file, then the
conventions of the surrounding code. A review priority order stated in `CLAUDE.md` outranks the tiers
below.

**Skip-list (don't hand-review):**

- Images: `*.png *.jpg *.jpeg *.gif *.svg *.webp *.ico`
- Docs/binaries: `*.pdf *.doc *.docx *.xls *.xlsx *.ppt *.pptx`
- Lock files: `package-lock.json yarn.lock pnpm-lock.yaml Cargo.lock poetry.lock composer.lock`
- Generated/build: `dist/ build/ *.min.* *.map` and other generated output
- Config: skip only when cosmetic. **Always review** `project.json` / `nx.json` (tags, targets,
  boundaries), `eslint.config.*` and `tsconfig*.json` (rules, compiler strictness), `package.json`
  (dependencies), and CI/runtime/deploy config.
- **Exception:** a committed secret in any file → surface as an Error.

**Evidence bar:** report only what you can back with reproduced behaviour, tool output, or a caller /
consumer / template you actually opened. A pattern that is usually a problem is a lead, not a finding —
name the concrete failure in this code or drop it. Unsure ⇒ dropped, not downgraded.

**Categories:** `Error` (must fix — correctness/security/data-loss/contract/crash),
`Warning` (should fix — error handling/perf/maintainability/missing tests),
`Info / Suggestion` (optional — naming/readability/structure). No praise tier.

**Table columns:** `# | Severity | File:line | Finding | Suggested fix`, ordered Error → Warning → Info,
and by blast radius within a tier.

**Posted comment format** (Conventional Comments, mapped from tier):

- Error → `issue (blocking): …`
- Warning → `suggestion (non-blocking): …` (or `issue (non-blocking):` when it's a real but non-urgent defect)
- Info → `nitpick: …` / `suggestion: …` / `note: …`
- Genuine open question → `question: …` (only when the answer changes what the author should do)

**Submit event:** `REQUEST_CHANGES` if any posted finding is an Error, else `COMMENT`; `APPROVE` left to a human. On your own PR the host rejects both `APPROVE` and `REQUEST_CHANGES`, so fall back to `COMMENT` and say the Error tier couldn't be recorded as a blocking event.

**Selection:** user chooses which findings post; nothing is posted without an explicit choice.

**Tool declaration:** this skill deliberately declares no `allowed-tools`. It drives the connected
code-hosting MCP, whose tool names differ per provider — pinning one provider's names would silently
break the skill in every other repo, and a wildcard would grant more than it needs. Scope is enforced
by the guardrails above instead. `git-commit`, whose whole toolset is local git, does declare one.

**Git MCP operations used** (discover the tools from the connected MCP — Bitbucket/GitHub/GitLab): read PR context, changed-files and diff; create a review with inline comments anchored to file+line, and submit it.
