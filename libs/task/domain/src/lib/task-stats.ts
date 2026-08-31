import { formatPercentage } from '@claude-actions/task/contracts';
import type { Task, TaskStatus } from './task';
import { TASK_STATUSES } from './task';

export interface TaskStats {
  readonly total: number;
  readonly byStatus: Readonly<Record<TaskStatus, number>>;
  readonly completionRate: number;
}

export function summarizeTasks(tasks: readonly Task[]): TaskStats {
  const byStatus = TASK_STATUSES.reduce<Record<TaskStatus, number>>(
    (acc, status) => ({ ...acc, [status]: 0 }),
    { todo: 0, doing: 0, done: 0 },
  );

  for (const task of tasks) {
    byStatus[task.status] += 1;
  }

  const total = tasks.length;

  return {
    total,
    byStatus,
    completionRate: total === 0 ? 0 : byStatus.done / total,
  };
}

export function formatCompletionRate(rate: number): string {
  return formatPercentage(rate);
}
