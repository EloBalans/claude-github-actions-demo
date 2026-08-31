import type { TaskStatusDto } from './task.dto';

export const beReadTaskStatsUrl = '/api/tasks/stats';

export interface TaskStatsDocumentDto {
  total: number;
  byStatus: Readonly<Record<TaskStatusDto, number>>;
  completionRate: number;
}

export type BeReadTaskStatsResponse = TaskStatsDocumentDto;

export type ReadTaskStatsResponse = BeReadTaskStatsResponse;
