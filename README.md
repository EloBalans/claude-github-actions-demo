# Task tracker — Claude Code workflow skills

A deliberately small Nx monorepo used to demo the **Claude Code workflow skills**:
commit → PR → review → fix, driven from an interactive Claude Code session.
(The directory name is historical — there are no Claude GitHub Actions here.)

```
apps/task-tracker             Angular 22 shell: routes, providers, styles
apps/api                      15 lines: pick a port, listen

libs/task/contracts           type:contract     platform:agnostic  HTTP contract BE ↔ FE
libs/task/domain              type:domain       platform:agnostic  model, rules, factory, port
libs/task/application-web     type:application  platform:web       TaskListStore + TaskDataService
libs/task/application-api     type:application  platform:node      use cases + Express + persistence
libs/task/ui                  type:ui           platform:web       presentational components
libs/task/feature-task-list   type:feature      platform:web       the routed screen
```

Every project is tagged on two axes, and the allowed dependency directions are
enforced by `@nx/enforce-module-boundaries` in `eslint.config.mjs`. `type:`
sets the layering: `type:ui` cannot reach the contract, `type:application`
cannot reach a component. `platform:` sets what a project can be bundled into:
`platform:web` and `platform:node` cannot see each other, so Express can never
end up in the browser bundle and the domain has no way to stop being
framework-free. Breaking a layer fails `npm run lint`, not code review.

Each file is small on purpose: a diff should fit on one screen.

## Run it

```bash
npm ci
npm start          # serves the app on :4200 and the API on :3333
```

`nx serve task-tracker` starts the API first via `dependsOn`, and the dev
server proxies `/api` to it.

## Check it

```bash
npm run verify     # lint + test + build, the same as CI
npm run affected   # only what your branch touched
npx nx graph       # see the layers, and who depends on the shared libs
```

## One quirk worth knowing

`libs/task/application-api/src/lib/latency.ts` makes **shorter** search queries
respond **slower** — `searchDelayMs` subtracts from a fixed budget per
character. It's deliberate: it makes a stale-response race reproducible on
demand instead of once in fifty runs.

## The Claude setup

| File                                      | What it does                                                                                        |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `CLAUDE.md`                               | Project rules. Claude reads it on every run. Delete it temporarily to show the difference it makes. |
| `.claude/skills/git-commit/SKILL.md`      | Proposes a Conventional Commits message, discusses it, commits.                                     |
| `.claude/skills/generate-pr/SKILL.md`     | Turns a branch of commits into a PR title and a structured description.                             |
| `.claude/skills/code-review/SKILL.md`     | Reviews a PR or the local diff, categorizes findings, posts the ones you pick.                      |
| `.claude/skills/fix-pr-comments/SKILL.md` | Works through review comments — fix, or decline with reasons — then hands off to `git-commit`.      |
| `docs/conventions.md`                     | The commit / PR / branch standard the four skills encode. Single source of truth.                   |
| `.github/workflows/ci.yml`                | `nx affected` lint/test/build.                                                                      |

The four skills run **interactively**, from a Claude Code session in this repo
(`/code-review`, `/generate-pr`, …). Each one has a step where you approve,
pick or override, so **none of them is wired into CI** — this repo carries no
Claude GitHub Actions workflow, on purpose. PRs are read and written through
whatever code-hosting MCP is connected; `git-commit` uses plain `git`.
