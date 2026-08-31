import type { TaskDocumentDto, TaskStatusDto } from './task.dto';

export const beAddTaskUrl = '/api/tasks';

export interface BeAddTaskRequestBody {
  title: string;
  status?: TaskStatusDto;
  tags?: readonly string[];
}

export type AddTaskRequestBody = BeAddTaskRequestBody;

export type BeAddTaskResponse = TaskDocumentDto;

export type AddTaskResponse = BeAddTaskResponse;
