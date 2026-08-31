export const TASK_STATUSES = ['todo', 'doing', 'done'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly status: TaskStatus;
  readonly createdAt: Date;
  readonly tags: readonly string[];
}

export interface NewTask {
  readonly title: string;
  readonly status?: TaskStatus;
  readonly tags?: readonly string[];
}

const NEXT_STATUS: Readonly<Record<TaskStatus, TaskStatus>> = {
  todo: 'doing',
  doing: 'done',
  done: 'todo',
};

export function nextStatus(status: TaskStatus): TaskStatus {
  return NEXT_STATUS[status];
}

export function statusRank(status: TaskStatus): number {
  return TASK_STATUSES.indexOf(status);
}
