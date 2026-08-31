import {
  summarizeTasks,
  type TaskRepository,
  type TaskStats,
} from '@claude-actions/task/domain';

export function readTaskStats(repository: TaskRepository): TaskStats {
  return summarizeTasks(repository.all());
}
