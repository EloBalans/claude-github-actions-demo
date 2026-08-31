import type { NewTask, Task, TaskStatus } from './task';

export const DEFAULT_TASK_STATUS: TaskStatus = 'todo';

export interface TaskIdentity {
  readonly id: string;
  readonly createdAt: Date;
}

export function isValidTitle(title: string): boolean {
  return title.trim().length > 0;
}

export function normalizeTitle(title: string): string {
  return title.trim();
}

export function createTask(draft: NewTask, identity: TaskIdentity): Task {
  return {
    id: identity.id,
    title: normalizeTitle(draft.title),
    status: draft.status ?? DEFAULT_TASK_STATUS,
    createdAt: identity.createdAt,
    tags: draft.tags ?? [],
  };
}
