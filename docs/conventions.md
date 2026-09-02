# Team workflow conventions

**This file is the single source of truth** for the commit → PR → review → fix workflow. It lives in
`docs/` because it is a document, not a skill — a bare `.md` inside `.claude/skills/` is never loaded
by anything.

**The four skills don't depend on this file at runtime.** Each one — `git-commit`, `generate-pr`,
`code-review`, `fix-pr-comments` — is self-contained and carries its own `## Conventions used by this
skill` section at the bottom, holding just the slice it needs, so a skill stays portable when copied
into another repo. That slice is a _cache_ of this file, not a second authority: **when the two
disagree, this file wins, and the skill's section is the bug.** Changing a convention means changing
it here first, then in the skills that carry that slice. A project's `CLAUDE.md` still overrides both.

These conventions are provider-agnostic. They're used from an interactive Claude Code session with
whatever code-hosting MCP is connected. `generate-pr`, `code-review`, and `fix-pr-comments` read and
write PRs through that MCP (discovering its tools rather than hardcoding a provider's); `git-commit`
uses plain `git`. **The workflow is interactive by design** — every skill has a step where a human
picks, approves or overrides, so none of them is meant to run unattended in CI.

---

## Git MCP (pluggable)

The PR skills — `generate-pr`, `code-review`, `fix-pr-comments` — don't target a specific provider.
They run against **whatever git-hosting MCP is connected** (Bitbucket, GitHub, GitLab, …) by using its
tools for a small set of capabilities. **Discover the actual tool names from the connected MCP — never
hardcode one provider's.** `git-commit` needs no MCP; it uses plain `git`.

Capability contract (each provider's MCP exposes an equivalent — names differ, operations don't):

- **Read a PR** — metadata/description, changed-file list, and diff.
- **Read a branch's commits** — or fall back to `git log <base>..HEAD`.
- **Create a PR** from a branch; **update** a PR's title and body.
- **Post a review** with inline comments anchored to file + line, and **submit** it.
- **Read a PR's comments** (review + general), **reply** on a thread, and **resolve** a thread.
- **Create an issue** — optional. Only `fix-pr-comments` uses it, only for a real follow-up, and only
  with the user's go-ahead. Without it, a declined comment says "needs a follow-up" instead of
  claiming one exists.

Publishing a branch is **not** an MCP capability here — `generate-pr` pushes with plain `git`, and
only on an explicit yes.

If the connected MCP is missing a capability a skill needs, **say so and ask how to proceed** (switch
MCP, or do that step by hand) rather than guessing or silently skipping it.

## Commit types

Generic set — extend or trim per project, but keep it small and documented:

| type       | when                                                            |
| ---------- | --------------------------------------------------------------- |
| `feat`     | a new user-facing capability                                    |
| `fix`      | a bug fix                                                       |
| `refactor` | code change that neither fixes a bug nor adds a feature         |
| `perf`     | performance improvement                                         |
| `docs`     | documentation only                                              |
| `test`     | adding or correcting tests                                      |
| `build`    | build system, dependencies, packaging                           |
| `ci`       | CI configuration and scripts                                    |
| `chore`    | maintenance that doesn't touch src behaviour (tooling, configs) |
| `style`    | formatting/whitespace only, no behaviour change                 |
| `revert`   | reverts a previous commit                                       |

**Precedence** (used when a PR mixes types — pick the most user-facing for the PR title):
`feat > fix > perf > refactor > revert > build > ci > test > docs > style > chore`

## Commit message format

```
<type>(<scope>)!: <description>

<body — optional, the "why">

<footers — optional; ticket references, BREAKING CHANGE, etc.>
```

- **scope** (optional): the affected area/module, e.g. `auth`, `lang`, `api`. Lowercase.
- **`!`**: mark a breaking change. Also add a `BREAKING CHANGE: <what breaks + migration>` footer.
- **description**: imperative, lowercase start, no trailing period, ≤ ~72 chars.
  "add new language" — not "added" / "adds".
- **co-authorship**: a commit written with Claude Code keeps the
  `Co-Authored-By: Claude <noreply@anthropic.com>` trailer. It's honest attribution and it doesn't
  touch the subject line, so linters and changelog tools don't care. Decided once here — flip it in
  `git-commit`'s conventions section if the team wants it gone.

## Ticket references — **canonical location is the subject**

A ticket is **optional**. Company standard is to put it **in the subject**, right after the colon:

```
feat(lang): TICKET-100 add new language     # with ticket
feat(lang): add new language                # without — perfectly valid
```

Discover it from the branch name or the user; if none is found, **omit it — no placeholder.**

**Alternative (tooling-safer, team toggle).** A footer instead of the subject keeps `<description>`
clean for strict linters and changelog generators, which is where the Conventional Commits spec
expects references:

```
feat(lang): add new language

Refs: TICKET-100
```

Use `Closes: TICKET-100` / `Closes #123` when the commit fully resolves it, `Refs:` when it only
relates. Pick **one** style per repo. Default for this workflow: **subject**.

Ticket key pattern: `[A-Z][A-Z0-9]+-\d+` (e.g. `TICKET-100`, `PROJ-42`) or a GitHub `#123`.

**PR titles use the same placement as commit subjects** — one rule, not two
(`feat(api): TICKET-100 add v2 users endpoint`). The PR _body_ additionally carries a
`Closes #123` / tracker-key line at the top when the host can auto-close from it.

## Branch naming

```
<type>/<ticket>-<kebab-summary>     # when a ticket exists
<type>/<kebab-summary>              # when there is none
```

Examples: `feat/TICKET-100-add-language`, `fix/login-redirect`, `chore/bump-deps`.
The `<type>` matches the commit types above. This is what `generate-pr` proposes when the current
branch doesn't carry a ticket or doesn't follow the convention.

## Pull requests

Title: the commit-message format applied to the _aggregate_ change —
`<type>(<scope>)!: <ticket> <description>`, type chosen by the precedence above when the branch mixes
types, scope only when the commits share one, `!` when any commit is breaking.

Body: always the same five sections, in this order — **What / Why / How it was tested / Risks &
rollout / Review focus** — around 200–400 words. **Omit a section you can't fill from real signal**;
an empty or hand-wavy section is worse than a missing one, and never invent test steps or a rationale.
A body that can't be kept under ~400 words is a sign the PR should be split.

## Human gates (why none of this runs unattended)

Each step in the workflow has one point where a human decides, and the skills are written so that
nothing outward-facing happens before it:

| Step              | The gate                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `git-commit`      | the message is a proposal — discuss, then commit. No push.                                                                      |
| `generate-pr`     | title + body shown and approved before a PR is created or updated; a branch is pushed only on an explicit yes.                  |
| `code-review`     | findings are shown as a table; only what the user picks gets posted.                                                            |
| `fix-pr-comments` | conflicts are surfaced rather than silently resolved; the fixes are committed through `git-commit`, and pushed only when asked. |

## Verification

Before `fix-pr-comments` hands off to `git-commit`, the project's checks run over what was touched —
in this repo `npx nx affected -t lint test build`. Red means fix it before committing; a failure that
is pre-existing and unrelated is called out, not repaired in passing. If the checks can't run, say so
instead of implying they passed. A thin suite passing is not evidence a change is correct.

## Conflict rule (applies across the workflow)

When guidance conflicts — a reviewer comment vs. these standards, or two reviewer comments against
each other — **correctness and these documented standards win over style preference.** Do not
silently comply with a comment that contradicts a deliberate standard or another comment. Surface
the conflict to the human with the tradeoff, and follow the standard (replying with the rationale)
unless the human overrides. Never fabricate to smooth over a conflict.
