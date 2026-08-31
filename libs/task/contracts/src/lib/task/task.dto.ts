import type { EntityId } from '../shared/entity-id';

export const TASK_STATUS_VALUES = ['todo', 'doing', 'done'] as const;

export type TaskStatusDto = (typeof TASK_STATUS_VALUES)[number];

export interface TaskDocumentDto {
  id: EntityId;
  title: string;
  status: TaskStatusDto;
  createdAt: string;
  tags: readonly string[];
}

export function isTaskStatusDto(value: unknown): value is TaskStatusDto {
  return (
    typeof value === 'string' &&
    (TASK_STATUS_VALUES as readonly string[]).includes(value)
  );
}
