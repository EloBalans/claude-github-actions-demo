import {
  createTask,
  isValidTitle,
  type NewTask,
  type Task,
  type TaskRepository,
} from '@claude-actions/task/domain';
import type { TaskIdentityFactory } from '../task-identity';

export function addTask(
  repository: TaskRepository,
  newIdentity: TaskIdentityFactory,
  draft: NewTask,
): Task | null {
  if (!isValidTitle(draft.title)) {
    return null;
  }

  const task = createTask(draft, newIdentity());
  repository.add(task);

  return task;
}
