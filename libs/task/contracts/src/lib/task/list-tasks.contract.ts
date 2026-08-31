import type { TaskDocumentDto, TaskStatusDto } from './task.dto';

export const beListTasksUrl = '/api/tasks';

export type BeListTasksQueryParams = {
  search?: string;
  status?: TaskStatusDto;
};

export type ListTasksQueryParams = BeListTasksQueryParams;

export type BeListTasksResponse = readonly TaskDocumentDto[];

export type ListTasksResponse = BeListTasksResponse;
