# Bug playbook

`main` is clean and idiomatic. This file is the menu of things to break, sorted
by how hard they are to catch. Each entry says what to change, what it does at
runtime, and whether the toolchain catches it.

The point of the article is tier 2 and tier 3: **everything there compiles,
lints, and passes the test suite.**

---

## Tier 1 — a linter would catch these

Use these for the first PR, the one that proves the workflow runs at all.
Nobody is impressed that Claude found them, and that is the point: it sets the
baseline before tier 2.

| #   | File                                | Change                                                       | Caught by                              |
| --- | ----------------------------------- | ------------------------------------------------------------ | -------------------------------------- |
| A1  | `features/task-list/task-list.ts`   | `candidate.id === updated.id` → `candidate.id == updated.id` | ESLint                                 |
| A2  | `core/task-api.ts`                  | `Observable<Task[]>` → `Observable<any>`                     | Nothing (strict allows explicit `any`) |
| A3  | `core/task-api.ts`                  | Inline `'/api/tasks'` instead of the `BASE_URL` constant     | Nothing                                |
| A4  | `features/task-list/task-list.html` | Drop `track task.id` from the `@for`                         | Angular compiler                       |
| A5  | `features/task-list/task-list.ts`   | Delete the `catchError` block                                | Nothing                                |

---

## Tier 2 — compiles, tests pass, breaks at runtime

This is the real material.

### B1. Subscription with no teardown

`apps/task-tracker/src/app/features/task-list/task-list.ts`, in `advance()`:

```diff
     this.taskData
       .updateStatus(task.id, NEXT_STATUS[task.status])
-      .pipe(takeUntilDestroyed(this.destroyRef))
       .subscribe({
```

**Runtime:** every click registers a subscription that outlives the component.
Navigate away mid-request and the callback still fires against a dead
component. Repeat a few hundred times and the tab's heap grows without bound.

**Caught by:** nothing in the toolchain. This is the headline bug.

**How to show it:** Chrome DevTools → Memory → take a heap snapshot, navigate
in and out of the route twenty times, snapshot again, filter by `TaskList`.

---

### B2. Nested subscribe instead of `switchMap`

Same file, in the constructor:

```diff
-        switchMap((query) =>
-          this.taskData.list(query).pipe(catchError(() => { /* … */ }))
-        ),
         takeUntilDestroyed()
       )
-      .subscribe((tasks) => {
-        this.tasksState.set(tasks);
-        this.loadingState.set(false);
+      .subscribe((query) => {
+        this.taskData.list(query).subscribe((tasks) => {
+          this.tasksState.set(tasks);
+          this.loadingState.set(false);
+        });
       });
```

**Runtime:** a race condition, and a reproducible one. `apps/api/src/app/latency.ts`
makes short queries _slower_ than long ones on purpose, so typing `ship` one
character at a time means the response for `s` lands after the response for
`ship`. The list ends up showing results for a query the user already
finished typing over.

**Caught by:** nothing. It looks fine, and on a fast local API it usually
behaves. That is what makes it worth writing about.

**How to show it:** type `ship` quickly in the search box. The list flashes the
right answer, then reverts to the full list.

---

### B3. Unthrottled keystroke stream

```diff
     const search$ = this.search.valueChanges.pipe(
       startWith(this.search.value),
-      debounceTime(SEARCH_DEBOUNCE_MS),
-      distinctUntilChanged()
     );
```

**Runtime:** one HTTP request per keystroke. Combined with B2 it turns into a
guaranteed race rather than an occasional one.

**Caught by:** nothing. Visible only in the Network tab.

---

### B4. `shareReplay` without `refCount`

`apps/task-tracker/src/app/core/task-api.ts`:

```diff
-    shareReplay({ bufferSize: 1, refCount: true })
+    shareReplay(1)
```

**Runtime:** the 10-second stats poll never stops. The last subscriber
unsubscribes, the timer keeps firing, and the app quietly polls the API for as
long as the tab is open.

**Caught by:** nothing. `shareReplay(1)` is the form most tutorials show, which
is exactly why it is a good test of whether the reviewer knows the operator or
just recognises it.

---

### B5. Mutation under OnPush

In `advance()`:

```diff
-        next: (updated) =>
-          this.tasks.update((tasks) =>
-            tasks.map((c) => (c.id === updated.id ? updated : c))
-          ),
+        next: (updated) => {
+          const tasks = this.tasks() as Task[];
+          const index = tasks.findIndex((c) => c.id === updated.id);
+          tasks[index] = updated;
+          this.tasksState.set(tasks);
+        },
```

**Runtime:** the signal is set to the same array reference, so it does not
notify. The app is zoneless with `OnPush`, so the row never repaints. The
status _did_ change on the server — reload and it is correct. A classic
"works after refresh" bug report.

**Caught by:** nothing. Note the `as Task[]` cast is required to get past the
`readonly` type, which is itself a review signal worth pointing out.

---

## Tier 3 — the monorepo-only bugs

These are the ones a single-repo demo cannot show. The diff touches
`libs/shared-tasks` and nothing else. A reviewer who reads only the diff has no
way to see the damage.

### C1. Silent unit change in a shared function

`libs/shared-tasks/src/lib/task-stats.ts`:

```diff
-    completionRate: total === 0 ? 0 : byStatus.done / total,
+    completionRate: total === 0 ? 0 : (byStatus.done / total) * 100,
```

**Runtime:** the app calls `formatCompletionRate`, which multiplies by 100
again. The UI reads `3333% complete`.

**Caught by:** nothing — and this is the detail worth putting in the article.
`libs/shared-tasks/src/lib/task-filters.spec.ts` asserts on `byStatus` but
never on `completionRate`. The suite stays green. Green tests are not evidence.

---

### C2. Reversed sort inside a shared helper

`libs/shared-tasks/src/lib/task-filters.ts`:

```diff
-    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
+    return Date.parse(a.createdAt) - Date.parse(b.createdAt);
```

**Runtime:** within each status group, oldest tasks now sort first instead of
newest. Both the API response and the app's rendering change. Nothing errors.

**Caught by:** nothing. The existing test only asserts the status grouping, not
the ordering inside a group.

---

### C3. Validation guard loosened

`libs/shared-tasks/src/lib/task.model.ts`:

```diff
 export function isTaskStatus(value: unknown): value is TaskStatus {
-  return typeof value === 'string' && (TASK_STATUSES as readonly string[]).includes(value);
+  return typeof value === 'string';
 }
```

**Runtime:** the API stops rejecting a bad `status` on `PATCH /api/tasks/:id`.
A task can be stored with `status: "banana"`, and every consumer that indexes
`byStatus` or `NEXT_STATUS` by that value gets `undefined`.

**Caught by:** nothing. The type predicate still type-checks. This one is worth
including because the fix lives in a different file from the symptom.

---

## Suggested PR sequence

| PR  | Contains                                                | What you are demonstrating                             |
| --- | ------------------------------------------------------- | ------------------------------------------------------ |
| 1   | A1, A4, A5                                              | The workflow fires and Claude comments inline          |
| 2   | B1, B3                                                  | It knows the project's RxJS rules from `CLAUDE.md`     |
| 3   | B2 + B5                                                 | It reasons about runtime behaviour, not just patterns  |
| 4   | C1                                                      | It leaves the diff and greps the consumers             |
| 5   | B4 only, `CLAUDE.md` temporarily removed, then restored | The before/after that proves context is the whole game |

PR 5 is the one to build the article around.

## Running the demo

```bash
git checkout -b demo/obvious-mistakes main
# apply tier 1, commit, push, open a PR
```

To reset the API fixture without restarting the server:

```bash
curl -X POST localhost:3333/api/tasks/reset
```
