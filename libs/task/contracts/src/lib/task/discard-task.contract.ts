import type { EntityId } from '../shared/entity-id';

export const beDiscardTaskUrl = (taskId: EntityId): string =>
  `/api/tasks/${taskId}`;

export const beDiscardTaskUrlPattern = '/api/tasks/:taskId';

export type BeDiscardTaskResponse = void;

export type DiscardTaskResponse = BeDiscardTaskResponse;
