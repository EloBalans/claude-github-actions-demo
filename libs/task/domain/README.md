# task/domain

`@claude-actions/task/domain` — the task domain: the model (`Task`,
`TaskStatus`, `TaskQuery`, `TaskStats`), the rules that operate on it
(`filterTasks`, `sortTasks`, `summarizeTasks`, `nextStatus`), the factory that
brings a task into existence (`createTask`, `isValidTitle`), the
`TaskRepository` port, and the mappers between the domain model and the HTTP
contract.

`createTask` takes its id and creation time as an argument rather than reaching
for `randomUUID` and `new Date()`, which is what keeps this library free of
Node built-ins and deterministic under test.

Tagged `type:domain` and `platform:agnostic`: it may depend only on
`type:domain` and `type:contract`, and only on other framework-free projects.
No Angular, no Express — both applications share it.

## Running unit tests

`npx nx test task-domain`
