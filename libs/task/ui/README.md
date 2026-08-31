# task/ui

`@claude-actions/task/ui` — presentational components for the task board:
`TaskItem`, `TaskFilterBar`, `TaskStatsBar`. Inputs in, outputs out, no
injected services and no state of their own.

Tagged `type:ui`: it may depend only on `type:ui` and `type:domain`. It is
typed with the domain model, never with a transport DTO — which is exactly
why `type:contract` is not on its allow list.

## Running unit tests

`npx nx test task-ui`
