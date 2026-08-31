import type { Task } from './task';

export interface TaskRepository {
  all(): readonly Task[];
  find(id: string): Task | undefined;
  add(task: Task): void;
  replace(task: Task): boolean;
  remove(id: string): boolean;
}
