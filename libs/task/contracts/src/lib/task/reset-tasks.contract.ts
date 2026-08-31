import type { TaskDocumentDto } from './task.dto';

export const beResetTasksUrl = '/api/tasks/reset';

export type BeResetTasksResponse = readonly TaskDocumentDto[];

export type ResetTasksResponse = BeResetTasksResponse;
