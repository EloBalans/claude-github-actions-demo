import type { TaskRepository } from '@claude-actions/task/domain';

export function discardTask(repository: TaskRepository, id: string): boolean {
  return repository.remove(id);
}
