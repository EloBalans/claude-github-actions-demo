# task/application-api

`@claude-actions/task/application-api` — everything the Express API does.
`apps/api` only chooses a port; this library is the whole service.

```
lib/
  task-api.app.ts          composition root: which adapters the API runs with
  tasks.router.ts          the HTTP adapter, and nothing else
  latency.ts               the deliberate search latency, see below
  task-identity.ts         where a new task's id and clock come from
  persistence/             InMemoryTaskRepository, the only file that knows
                           how tasks are stored
  use-cases/               one file per thing the API can be asked to do
```

Each route handler does exactly three things: turn a request into arguments a
use case understands, call one use case, turn the answer into a status code and
a DTO. Filtering, sorting, ordering and validation live in the use cases and in
`@claude-actions/task/domain`; none of them can see Express.

Tagged `type:application` and `platform:node`: it cannot reach `type:ui`, and
it cannot see anything tagged `platform:web`.

## Running unit tests

`npx nx test task-application-api`
