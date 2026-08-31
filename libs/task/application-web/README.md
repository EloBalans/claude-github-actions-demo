# task/application-web

`@claude-actions/task/application-web` — the browser's application layer.
`TaskListStore` owns the signals behind the task board, debounces the search,
and flattens every request with `switchMap` so a stale response can never
overwrite a newer one. It also owns the board-stats poll. `TaskDataService` is the only file in the
browser that knows tasks arrive over HTTP: one method per endpoint, each
returning a cold observable and domain objects, never DTOs. No timers and no
shared state live there — that is the store's job.

Tagged `type:application` and `platform:web`: it may depend on
`type:application`, `type:domain` and `type:contract`, and only on
`platform:web` or `platform:agnostic` projects. It knows nothing about
components, which is why it may not depend on `type:ui`, and it cannot see
`application-api`.

## Running unit tests

`npx nx test task-application-web`
