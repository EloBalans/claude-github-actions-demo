import {
  DestroyRef,
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  EMPTY,
  Observable,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import {
  EMPTY_TASK_QUERY,
  formatCompletionRate,
  isSameQuery,
  nextStatus,
  summarizeTasks,
  type Task,
  type TaskQuery,
  type TaskStats,
  type TaskStatus,
} from '@claude-actions/task/domain';
import { TaskDataService } from './task-data.service';

const SEARCH_DEBOUNCE_MS = 250;
const STATS_POLL_INTERVAL_MS = 10_000;
const LOAD_ERROR = 'Could not load tasks. Is the API running?';

@Injectable()
export class TaskListStore {
  private readonly taskData = inject(TaskDataService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly search = signal(EMPTY_TASK_QUERY.search);
  private readonly status = signal<TaskStatus | null>(EMPTY_TASK_QUERY.status);
  private readonly tag = signal<string | null>(EMPTY_TASK_QUERY.tag);
  private readonly tasksState = signal<readonly Task[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly boardStatsState = signal<TaskStats | null>(null);

  private readonly boardStats$: Observable<TaskStats> = timer(
    0,
    STATS_POLL_INTERVAL_MS,
  ).pipe(
    switchMap(() => this.taskData.stats().pipe(catchError(() => EMPTY))),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly tasks = this.tasksState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly statusFilter = this.status.asReadonly();
  readonly tagFilter = this.tag.asReadonly();

  readonly stats = computed(() => summarizeTasks(this.tasks()));
  readonly boardTotal = computed(() => this.boardStatsState()?.total ?? null);
  readonly completion = computed(() =>
    formatCompletionRate(this.stats().completionRate),
  );

  constructor() {
    const search$ = toObservable(this.search).pipe(
      debounceTime(SEARCH_DEBOUNCE_MS),
      distinctUntilChanged(),
    );

    combineLatest([search$, toObservable(this.status), toObservable(this.tag)])
      .pipe(
        map(([search, status, tag]): TaskQuery => ({ search, status, tag })),
        distinctUntilChanged(isSameQuery),
        tap(() => {
          this.loadingState.set(true);
          this.errorState.set(null);
        }),
        switchMap((query) =>
          this.taskData.list(query).pipe(
            catchError(() => {
              this.errorState.set(LOAD_ERROR);
              return of<Task[]>([]);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((tasks) => {
        this.tasksState.set(tasks);
        this.loadingState.set(false);
      });

    this.boardStats$
      .pipe(takeUntilDestroyed())
      .subscribe((stats) => this.boardStatsState.set(stats));
  }

  setSearch(value: string): void {
    this.search.set(value);
  }

  setStatusFilter(status: TaskStatus | null): void {
    this.status.set(status);
  }

  setTagFilter(tag: string | null): void {
    this.tag.set(tag);
  }

  advance(task: Task): void {
    this.taskData
      .updateStatus(task.id, nextStatus(task.status))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) =>
          this.tasksState.update((tasks) =>
            tasks.map((candidate) =>
              candidate.id === updated.id ? updated : candidate,
            ),
          ),
        error: () => this.errorState.set(`Could not move "${task.title}".`),
      });
  }

  remove(task: Task): void {
    this.taskData
      .remove(task.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () =>
          this.tasksState.update((tasks) =>
            tasks.filter((candidate) => candidate.id !== task.id),
          ),
        error: () => this.errorState.set(`Could not delete "${task.title}".`),
      });
  }
}
