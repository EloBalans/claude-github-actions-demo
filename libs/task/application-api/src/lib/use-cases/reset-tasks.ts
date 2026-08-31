import type { Task } from '@claude-actions/task/domain';
import type { SeededTaskRepository } from '../persistence/seeded-task.repository';

export function resetTasks(repository: SeededTaskRepository): readonly Task[] {
  repository.reset();

  return repository.all();
}
