import type {
  Task,
  TaskRepository,
  TaskStatus,
} from '@claude-actions/task/domain';

export function changeTaskStatus(
  repository: TaskRepository,
  id: string,
  status: TaskStatus,
): Task | undefined {
  const task = repository.find(id);

  if (!task) {
    return undefined;
  }

  const updated: Task = { ...task, status };

  return repository.replace(updated) ? updated : undefined;
}
