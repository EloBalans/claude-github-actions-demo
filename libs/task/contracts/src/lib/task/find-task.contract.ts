import type { EntityId } from '../shared/entity-id';
import type { TaskDocumentDto } from './task.dto';

export const beFindTaskUrl = (taskId: EntityId): string =>
  `/api/tasks/${taskId}`;

export const beFindTaskUrlPattern = '/api/tasks/:taskId';

export type BeFindTaskResponse = TaskDocumentDto;

export type FindTaskResponse = BeFindTaskResponse;
