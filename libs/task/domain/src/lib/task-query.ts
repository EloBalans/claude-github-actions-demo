import type { TaskStatus } from './task';

export interface TaskQuery {
  readonly search: string;
  readonly status: TaskStatus | null;
}

export const EMPTY_TASK_QUERY: TaskQuery = {
  search: '',
  status: null,
};

export function isSameQuery(a: TaskQuery, b: TaskQuery): boolean {
  return a.search === b.search && a.status === b.status;
}
