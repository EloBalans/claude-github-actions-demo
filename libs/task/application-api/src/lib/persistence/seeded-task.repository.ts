import type { TaskRepository } from '@claude-actions/task/domain';

export interface SeededTaskRepository extends TaskRepository {
  reset(): void;
}
