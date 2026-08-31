# contracts/task

`@claude-actions/task/contracts` — the HTTP contract between `apps/api` and the
front end.

```
lib/
  shared/          EntityId, BeErrorResponse, formatPercentage
  task/
    task.dto.ts                    TaskDocumentDto, TaskStatusDto, isTaskStatusDto
    list-tasks.contract.ts         GET    /api/tasks
    read-task-stats.contract.ts    GET    /api/tasks/stats
    find-task.contract.ts          GET    /api/tasks/:taskId
    add-task.contract.ts           POST   /api/tasks
    change-task-status.contract.ts PATCH  /api/tasks/:taskId
    discard-task.contract.ts       DELETE /api/tasks/:taskId
    reset-tasks.contract.ts        POST   /api/tasks/reset
```

One file per use case. Each holds everything needed to make that one request —
the URL, the query params, the request body, the response — and nothing else.
Open the file for a use case and you have read its whole contract.

Names follow one shape: `be<UseCase>Url` for the path, `Be<UseCase>QueryParams`
/ `RequestBody` / `Response` for the wire types, and an un-prefixed alias of
each for the front end to import. The alias is what lets the browser's view of
a payload drift from the backend's without editing call sites.

A document DTO used by more than one use case (`TaskDocumentDto`) lives in
`task.dto.ts`. Anything not tied to a request lives in `shared/`.

Tagged `type:contract`, so it may depend on nothing else. It holds no domain
logic and no framework imports; the domain model lives in
`@claude-actions/task/domain`.

## Running unit tests

`npx nx test task-contracts`
