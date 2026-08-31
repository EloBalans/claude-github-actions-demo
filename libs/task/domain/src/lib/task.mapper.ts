import type {
  AddTaskRequestBody,
  TaskDocumentDto,
  TaskStatsDocumentDto,
} from '@claude-actions/task/contracts';
import type { NewTask, Task } from './task';
import type { TaskStats } from './task-stats';

export function toTask(dto: TaskDocumentDto): Task {
  return {
    id: dto.id,
    title: dto.title,
    status: dto.status,
    createdAt: new Date(dto.createdAt),
    tags: [...dto.tags],
  };
}

export function toTaskDto(task: Task): TaskDocumentDto {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    createdAt: task.createdAt.toISOString(),
    tags: [...task.tags],
  };
}

export function toTaskStats(dto: TaskStatsDocumentDto): TaskStats {
  return {
    total: dto.total,
    byStatus: { ...dto.byStatus },
    completionRate: dto.completionRate,
  };
}

export function toTaskStatsDto(stats: TaskStats): TaskStatsDocumentDto {
  return {
    total: stats.total,
    byStatus: { ...stats.byStatus },
    completionRate: stats.completionRate,
  };
}

export function toAddTaskRequestBody(draft: NewTask): AddTaskRequestBody {
  return {
    title: draft.title,
    status: draft.status,
    tags: draft.tags,
  };
}
