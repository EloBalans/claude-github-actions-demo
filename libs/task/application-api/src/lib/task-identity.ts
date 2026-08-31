import { randomUUID } from 'node:crypto';
import type { TaskIdentity } from '@claude-actions/task/domain';

export type TaskIdentityFactory = () => TaskIdentity;

export const systemTaskIdentity: TaskIdentityFactory = () => ({
  id: randomUUID(),
  createdAt: new Date(),
});
