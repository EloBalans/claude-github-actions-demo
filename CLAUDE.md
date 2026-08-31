# Project conventions

Nx monorepo. Both applications are shells: `apps/task-tracker` holds routes,
providers and global styles, `apps/api` picks a port and listens. Everything
either one does lives in a library under `libs/`.

## Architecture

Every project carries three tags in its `project.json`: `type:` (its layer),
`scope:` (the slice it belongs to) and `platform:` (what it can be bundled
into). The allowed dependency directions are enforced by
`@nx/enforce-module-boundaries` in the root `eslint.config.mjs` — an illegal
import is a lint error, not a review opinion.

| Library                       | Import path                              | Tag                                | Holds                                                                                                                                                                    |
| ----------------------------- | ---------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `libs/task/contracts`         | `@claude-actions/task/contracts`         | `type:contract`                    | The HTTP contract between `apps/api` and the front end. One file per use case under `src/lib/task/`.                                                                     |
| `libs/task/domain`            | `@claude-actions/task/domain`            | `type:domain`                      | The domain model (`Task`, `TaskStatus`, `TaskQuery`, `TaskStats`), its rules (`filterTasks`, `sortTasks`, `summarizeTasks`, `nextStatus`) and the DTO ↔ domain mappers. |
| `libs/task/application-web`   | `@claude-actions/task/application-web`   | `type:application` `platform:web`  | `TaskListStore` (screen state, every RxJS stream) and `TaskDataService`, a bare HTTP adapter with one method per endpoint.                                               |
| `libs/task/application-api`   | `@claude-actions/task/application-api`   | `type:application` `platform:node` | The whole Express service: use cases, the router, `InMemoryTaskRepository`, the composition root.                                                                        |
| `libs/task/ui`                | `@claude-actions/task/ui`                | `type:ui`                          | Presentational components. Inputs in, outputs out, no injected services.                                                                                                 |
| `libs/task/feature-task-list` | `@claude-actions/task/feature-task-list` | `type:feature`                     | The routed screen. Provides the store, composes the UI.                                                                                                                  |

Rules that follow from that layering:

- **One file per use case in `task/contracts`.** Every request the API can
  serve has exactly one file under `src/lib/task/`, named after the use case,
  holding everything needed to make that call and nothing else: the URL, the
  query params, the request body and the response. A file that does not
  describe a request does not belong there — shared primitives (`EntityId`,
  `BeErrorResponse`, `formatPercentage`) live in `src/lib/shared/`, and a
  document DTO shared by several use cases lives in `task/task.dto.ts`.
- **The `Be` prefix is the wire shape.** `BeAddTaskResponse` is what the
  backend actually returns; `AddTaskResponse` is the alias the front end
  imports. They are the same type today. The alias exists so the front end can
  diverge from the backend later without touching a single call site, so
  consumers import the un-prefixed name and the API side imports the `Be` one.
- **URLs are absolute and live in the contract.** `beListTasksUrl` is the whole
  path, used by both the Express router and the browser. A parameterised route
  exports a builder for the client (`beFindTaskUrl(taskId)`) and a pattern for
  the server (`beFindTaskUrlPattern`). No path is ever spelled out anywhere
  else.
- **contract vs domain.** `task/contracts` is the wire format — it is what
  `apps/api` serialises and the browser parses. `task/domain` is the model the
  code reasons with. They are deliberately different shapes (ISO string vs
  `Date`), and `task.mapper.ts` is the only place they meet.
- **The API is a library.** A route handler turns a request into arguments,
  calls exactly one use case, and turns the answer into a status code and a
  DTO. Filtering, sorting, ordering, defaults and validation belong to the use
  cases in `application-api` and to `task/domain` — never to a handler.
- **Persistence sits behind a port.** `TaskRepository` is declared in
  `task/domain`; `InMemoryTaskRepository` is the only implementation and the
  only file in the workspace that knows how tasks are stored.
- `type:contract` and `type:domain` must not import `@angular/*` or
  `express`. Both applications depend on them. They are also
  `platform:agnostic`, so the boundary rules stop them importing anything that
  is not.
- `platform:web` and `platform:node` cannot depend on each other. This is what
  keeps Express out of the browser bundle even though `type:feature` is
  allowed to depend on every layer.
- `type:ui` may depend on `type:ui` and `type:domain` only. A presentational
  component is typed with the domain model, never with a DTO.
- `type:application` must not depend on `type:ui`. Use cases know nothing
  about components.
- Everything is imported through its `@claude-actions/*` path, never through a
  relative path into `libs/`.
- Anything exported from `libs/task/contracts` is a contract between two
  packages. A change to a signature, a return type, or the meaning of a
  parameter must be checked against **every** consumer, not just the files in
  the diff.

## Angular

- Standalone components only. No `NgModule`.
- Every component uses `ChangeDetectionStrategy.OnPush`. The app is zoneless.
- State lives in signals. Update them immutably: `signal.update(list => [...])`,
  never `list.push(...)` on the current value. In-place mutation does not
  repaint under OnPush.
- Use `inject()` rather than constructor parameter injection.
- Templates use the built-in control flow (`@if`, `@for`, `@switch`), and every
  `@for` declares a stable `track` expression.
- Prefer `input()` / `output()` over the `@Input()` / `@Output()` decorators.

## RxJS

These are the rules that matter most in review:

- **Every** manual `.subscribe()` must be terminated. Use `takeUntilDestroyed()`
  in an injection context, or `takeUntilDestroyed(this.destroyRef)` elsewhere.
  A subscription with no teardown is a memory leak, even in a component that
  "only renders once".
- Never nest `.subscribe()` inside `.subscribe()`. Flatten with `switchMap`,
  `mergeMap`, `concatMap`, or `exhaustMap`, and pick the one that matches the
  intent. For a search field driven by user input the answer is `switchMap`:
  a stale response must never overwrite a newer one.
- Any stream fed by keystrokes needs `debounceTime` **and**
  `distinctUntilChanged` before it reaches the network.
- `shareReplay` must be called with `{ bufferSize: n, refCount: true }`. Without
  `refCount`, the source keeps running after the last subscriber leaves.
- Handle errors inside the inner observable with `catchError`, so a failed
  request does not tear down the outer stream.

## TypeScript

- No `any`. Use `unknown` plus a narrowing guard when the shape is unclear.
- Use `===`. Use `type` imports for types.
- No magic numbers or literal URLs in components. Name them as a constant.

## Testing

- Pure logic in `libs/task/contracts`, `libs/task/domain` and the use cases
  in `libs/task/application-api` is unit tested.
- Note that the current test suite is deliberately thin: passing tests are not
  evidence that a change is correct.

## Commands

- `npx nx serve task-tracker` starts the app and the API together.
- `npx nx run-many -t lint test build` is what CI runs.
- `npx nx affected -t lint test build` for a faster local check.

## Review expectations

When reviewing a pull request, prioritise in this order:

1. Correctness bugs that pass compilation and tests — leaks, races, stale
   state, broken cross-package contracts.
2. Violations of the RxJS and Angular rules above.
3. Type safety.
4. Naming and structure.

Say when a diff looks fine. Do not invent findings to fill a review.
