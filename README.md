# claude-github-actions-demo

A deliberately small Nx monorepo built to demo **Claude Code GitHub Actions**:
automatic pull request review, `@claude` mentions, and Claude pushing fixes
back to a branch.

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

Each file is small on purpose: a diff has to fit in a screenshot to be worth
putting in an article.

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

## The demo

`main` is clean. [`docs/BUGS-PLAYBOOK.md`](docs/BUGS-PLAYBOOK.md) is the menu of
bugs to plant, in three tiers:

- **Tier 1** — a linter catches them. Proves the workflow runs.
- **Tier 2** — compile, lint, and test green; break at runtime. Leaks, races,
  stale state.
- **Tier 3** — the diff touches only `libs/task/contracts` or
  `libs/task/domain`. Both applications depend on them, so a reviewer who reads
  just the diff cannot see the damage.

One design decision worth knowing about: `apps/api/src/app/latency.ts` makes
**shorter** search queries respond **slower**. That inversion is what turns a
nested `subscribe` from a theoretical race into one you can reproduce on
camera every single time.

## The Claude setup

| File                                       | What it does                                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `CLAUDE.md`                                | Project rules. Claude reads it on every run. Delete it temporarily to show the difference it makes. |
| `.claude/skills/angular-review/SKILL.md`   | How to review, versioned with the code. The rules themselves live in `CLAUDE.md`.                   |
| `.github/workflows/claude.yml`             | Interactive: responds to `@claude` in comments and issues.                                          |
| `.github/workflows/claude-code-review.yml` | Automation: reviews every PR, no mention needed.                                                    |
| `.github/workflows/ci.yml`                 | `nx affected` lint/test/build.                                                                      |

Both Claude workflows expect a `CLAUDE_CODE_OAUTH_TOKEN` repository secret
(`claude setup-token`). To bill through the API instead, swap that input for
`anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}`.

Fastest path to a working setup: run `/install-github-app` from Claude Code in
this repo and let it open the PR for you.
