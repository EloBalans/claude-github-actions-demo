import type { EntityId } from '../shared/entity-id';
import type { TaskDocumentDto, TaskStatusDto } from './task.dto';

export const beChangeTaskStatusUrl = (taskId: EntityId): string =>
  `/api/tasks/${taskId}`;

export const beChangeTaskStatusUrlPattern = '/api/tasks/:taskId';

export interface BeChangeTaskStatusRequestBody {
  status: TaskStatusDto;
}

export type ChangeTaskStatusRequestBody = BeChangeTaskStatusRequestBody;

export type BeChangeTaskStatusResponse = TaskDocumentDto;

export type ChangeTaskStatusResponse = BeChangeTaskStatusResponse;
