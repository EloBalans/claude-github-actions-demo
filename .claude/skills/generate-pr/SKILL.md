---
name: generate-pr
description: >-
  Compose a PR title and description from the branch's diff, then create the PR — or update one whose
  description is thin. Use for opening a PR, raising a merge request, writing or filling in a PR body,
  or "make a PR". Not for reviewing others' PRs, merging, or commit messages.
---

# generate-pr

Turn a branch of work into a clean PR: a short **title** and a structured **description**, then write
it to the PR through the connected code-hosting MCP.

Core idea: **the diff is the source of truth.** What the PR does, and which parts of the system it
touches, is read off the changed files and the changes themselves — not off the commit messages. Commit
messages are unreliable: they may be terse, batched, reworded, or "wip". Read them only as a hint about
_why_ a change was made, never as the description of _what_ changed, and never assume any particular
message format or naming scheme.

Summarize a large diff by area, don't read it line by line.

**Audience: the team that owns this repo.** They know the product, the stack and where the branch
lands, so the body stays short and says only what the code doesn't already say. This is not an
open-source drive-by PR that has to introduce itself to a stranger.

**The one test that governs everything below: a human has to want to read it.** The body is a short
note to a colleague, in the register you'd use in a chat message. The moment it starts reading like
input for another program — an inventory of files with their mechanics, symbol names and line
references strung into prose, instructions telling the reader which invariants to go verify — the line
is crossed, and the fix is to delete, not to rephrase. Written for a machine is the failure mode of
this skill; when in doubt, cut it.

Length is the crudest but most reliable warning sign: if the body has outgrown the note you'd actually
type by hand, it has drifted. But short must still carry the essence — what was done and why, in
sentences. **Never a bullet list of changed files**; the diff already is that list, and prose about the
change is what the list can't give. Stay out of implementation detail unless a specific decision
genuinely needs explaining.

This skill is self-contained and assistant-agnostic — no vendor-specific tooling, just git, the
connected code-hosting MCP and the conventions below. The conventions it uses are at the bottom under
**Conventions used by this skill** — edit them there when you fork it. Values from the repo's own
instruction file (`CLAUDE.md`, `AGENTS.md`, or equivalent) win.

## Modes

- **create (the default) — no PR yet.** You have a branch of work; compose the title and body, then
  open the PR from it. This is the main path.
- **update — the PR already exists** with an empty or thin description. Read it, compose the body,
  update the PR in place.

If unclear, look for an open PR whose source branch is the current branch. None found → **create**.

**Consistency is the point** — the same tone and the same section order every time, never an ad-hoc
freeform description. Consistent structure, though, does not mean a fixed word count: the body scales
with the change.

## Scale the body to the change

Decide this before composing, from `--stat`. A trivial PR does not earn the full template — filling
three headings for a one-line change is noise, and the reviewer learns nothing from `## What` sitting
above a sentence that repeats the title.

- **Trivial** (a one-liner, a typo, a version bump, a copy tweak): no headings at all. One or two
  plain sentences — what and why — and nothing else.
- **Small** (one focused change, a handful of files): `What` and `Why`, a couple of sentences each, no
  `Notes` unless there's genuinely something to note. Drop `Why` too if the title already answers it.
- **Normal** (a feature or a refactor spanning several areas): the full template as below.

Never pad a section to justify its heading. If a heading's content would be one obvious sentence,
drop the heading and keep the sentence.

## Pipeline

### 1. Check the branch, the ticket, and the remote

Read the current branch name. Extract a ticket (`[A-Z][A-Z0-9]+-\d+` or `#123`) from it, and from
commit footers (`Refs:`/`Closes:`).

- **Ticket found** → it goes at the start of the title's description and into the body as a
  closing/reference line.
- **No ticket, and the branch doesn't follow the convention** → propose a compliant branch name
  (`<area>/<kebab-summary>`, or `<area>/<ticket>-<kebab-summary>` if a ticket surfaces) and offer to
  rename it, then continue. Don't block on it, and don't invent a ticket number.

Then check the branch actually exists on the remote — `git rev-parse --abbrev-ref @{upstream}` or
`git ls-remote --heads origin <branch>`. **A PR cannot be created from a branch the host can't see.**
Not pushed → say so and ask whether to push (`git push -u origin <branch>`); push only on a yes.
Pushed but behind local HEAD → point that out too, so the PR doesn't describe changes nobody can read.

### 2. Read the diff

This is the main investigation step.

- Start with the changed-file summary — `git diff --stat <base>...HEAD` against the base branch
  (`main`/`master`, or whatever the repo's default is). It tells you the size of the change and which
  areas it touches, and it decides the body scale.
- Then read the actual diff — `git diff <base>...HEAD` locally, or the PR's diff from the MCP in
  **update** mode — and work out what the change _does_: new behaviour, changed behaviour, removed
  code, contracts and public signatures that moved, config and dependency changes. Group it by area
  rather than by file; skim the mechanical hunks (renames, formatting, generated files) and spend the
  attention on the hunks that change behaviour.
- Summarize big diffs by area; reading 2000 lines verbatim helps no one.
- **Trivial change → stop at `--stat`** plus a glance at the single hunk. Don't run the full pipeline
  on a typo fix.
- The aggregate branch diff comes from local git, so **create** mode needs no PR to read it. Never
  open a throwaway draft PR just to get at a diff.

> MCP note: use whatever operations the connected code-hosting MCP exposes for reading a PR — its
> metadata, changed-file list, and diff. Don't hardcode one provider's tool names; discover them from
> the available tools. GitHub, GitLab and Bitbucket MCPs all provide equivalents.

### 3. Look for the "why"

The diff says what changed; it rarely says why. Sources for that, in order: the ticket, the commit
message bodies (`git log <base>..HEAD`), comments and docs touched by the diff itself, and what the
user tells you. Take the intent, not the wording, and ignore the shape of the messages entirely — a
branch of `wip` commits and a branch of carefully written ones should produce the same PR body.

No real signal anywhere → omit the "Why", and say so when you show the draft. Never invent a
motivation.

### 4. Compose the title

One short imperative line describing the aggregate change, read off the diff: lowercase start, no
trailing period, ≤ ~70 chars, ticket first when there is one. Optionally prefix the area it touches
when that makes it clearer (`task list: ...`). Don't copy a single commit's subject — the title
summarizes the whole branch.

Example: a branch that adds a v2 users endpoint and deletes the v1 one → `add v2 users endpoint and
remove v1`. If the change is breaking, that belongs in **Notes**, not in title punctuation.

### 5. Compose the body — use this template

This is the **normal**-size shape — for trivial and small changes use the reduced forms above. Three
sections, two of them usually short. **Omit any section you can't fill** — an empty or hand-wavy
section is worse than none. ~100–200 words is a ceiling, not a target.

```markdown
<Closes #123 — only if a ticket was found in step 1, else absent>

## What

<2–4 sentences: the aggregate change, which modules/behaviours changed. Straight from the diff.>

## Why

<The problem, motivation, decision — from step 3. No real signal → omit.>

## Notes

<Optional, and usually 1–3 bullets or nothing at all. Only things a reviewer cannot read off the diff:
a decision that isn't visible in the code, a deliberately deferred follow-up, an alternative that was
rejected and why, a breaking change or migration step, a dependency on another PR. Nothing like that
→ omit the section entirely.>
```

Prose over cryptic fragments; reviewers read this like a short note.

**What does not go in the body:**

- **No test report.** The reviewer assumes the author ran what there was to run, and CI says the rest.
  If a change has a fragile edge, the answer is a unit test in the diff — not a paragraph asking
  someone to check it by hand.
- **No "risks & rollout" boilerplate.** The team knows where this branch lands. A real migration or
  breaking change is one bullet under **Notes**; anything else is filler that gets skimmed.
- **No code tour under a "review focus" heading.** Don't narrate a file's algorithm, point at loop
  bounds, or ask the reviewer to double-check arithmetic — that's a reviewer's job and they can see
  the diff. If you're not sure the code is right, fix it or test it before opening the PR.

If the PR is too big to keep the body under ~200 words, say so — that's a signal the PR itself should
be split.

### 6. Show it, then write it to the PR

**Show the final title and body in chat first and get a yes.** A PR is outward-facing — teammates get
notified, CI starts, and a bad description is what everyone reads first. Same human-in-the-loop gate
`git-commit` has: propose, discuss, then write. If a section was omitted for lack of signal
(especially "Why"), say so in one line so the user can add context — but don't block on it.

Once they're happy:

- **update**: update the PR's title and body through the MCP.
- **create**: create the PR from the current branch onto the base branch with the composed title and
  body (as a draft if the user wishes).

Then link the PR.

## Guardrails

- **The diff decides what the PR says.** Don't describe a change because a commit message claims it;
  describe what the diff does. A commit that says one thing and changes another → trust the diff, and
  mention the mismatch to the user if it looks like a mistake.
- **Never fabricate** — no invented tickets, test steps, or rationale. Missing signal → omit.
- **Write for a teammate, not a stranger.** No product introductions, no restating the stack, no
  explaining conventions the repo already documents. Short is the goal, not a compromise.
- **A human has to want to read it.** Prose in a colleague's register; no file inventories, no
  symbol-and-line walkthroughs, no "go check that X holds". If it reads like input for another
  program, cut it.
- **Match the body to the size of the change** — a trivial PR gets one or two sentences and no
  headings. Never fill a heading just because the template has one.
- **Diff discipline** — `--stat` first to size the change, then the hunks that matter; summarize large
  diffs by area.
- **Nothing outward-facing without a yes** — no pushing a branch, no creating or editing a PR before
  the user has seen the title and body.
- **Don't merge or review** — this skill writes the PR's own title and description only.
- Respect an existing PR template in the repo (e.g. a `pull_request_template.md`) if the user asks:
  fetch it and fill _its_ sections, same "omit empty / no fabrication" rules.

## Conventions used by this skill

Edit this section when adapting the skill to a repo.

**Title:** a single short imperative line summarizing the _aggregate_ change as read from the diff —
lowercase start, no trailing period, ≤ ~70 chars, optional `<area>: ` prefix, ticket first when there
is one (`TICKET-100 add v2 users endpoint`). Not a copy of one commit's subject, and no message-format
scheme imposed on it.

**Source of the summary:** the branch diff against the base. Commit messages are a hint for the "Why"
only, in whatever form they happen to take.

**Ticket (optional):** extracted from branch name / commit footers, pattern `[A-Z][A-Z0-9]+-\d+` or
`#123`. Placed at the start of the title, plus a `Closes #123` / tracker-key line at the top of the
body when the host can auto-close from it. None found → omit both, never invent.

**Branch naming:** `<area>/<ticket>-<kebab-summary>` or `<area>/<kebab-summary>` — proposed when the
current branch doesn't conform.

**Remote precondition:** the branch must exist on the remote before a PR can be created. Push only
with the user's explicit go-ahead.

**Approval gate:** title and body are shown in chat and approved before anything is created or updated.

**Audience:** the repo's own team. Internal PRs, not open-source contributions — no onboarding prose.

**PR body template:** What / Why / Notes (optional), ~100–200 words as a ceiling, omit sections you
can't fill. No test report, no risk/rollout section, no walkthrough of the code the diff already
shows, no bullet list of changed files.

**Body scaled to the change:** trivial → one or two sentences, no headings; small → `What` + `Why`;
normal → the full template. Never pad a section to justify its heading.

**Readability test:** the body reads as a short note to a colleague. Prose about what and why, minimal
implementation detail unless a decision needs explaining. Reads like input for another program → cut.

**Tool declaration:** this skill deliberately declares no `allowed-tools`. It drives the connected
code-hosting MCP, whose tool names differ per provider — pinning one provider's names would silently
break the skill in every other repo, and a wildcard would grant more than it needs. Scope is enforced
by the guardrails above instead. `git-commit`, whose whole toolset is local git, does declare one.

**Git MCP operations used** (discover the tools from the connected MCP — Bitbucket/GitHub/GitLab): read
PR metadata, commits, changed-files and diff; create a PR from the branch; update a PR's title and body.

**Conflict rule:** correctness and documented standards win over preference; surface genuine conflicts.
