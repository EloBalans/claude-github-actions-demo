import {
  filterTasks,
  sortTasks,
  type Task,
  type TaskQuery,
  type TaskRepository,
} from '@claude-actions/task/domain';

export function listTasks(
  repository: TaskRepository,
  query: TaskQuery,
): Task[] {
  return sortTasks(filterTasks(repository.all(), query));
}
