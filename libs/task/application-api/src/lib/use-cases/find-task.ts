import type { Task, TaskRepository } from '@claude-actions/task/domain';

export function findTask(
  repository: TaskRepository,
  id: string,
): Task | undefined {
  return repository.find(id);
}
