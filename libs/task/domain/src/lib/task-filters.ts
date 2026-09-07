import type { Task } from './task';
import { statusRank } from './task';
import type { TaskQuery } from './task-query';

export function filterTasks(tasks: readonly Task[], query: TaskQuery): Task[] {
  const needle = query.search.trim().toLowerCase();
  const wantedTag = query.tag?.trim().toLowerCase() ?? '';

  return tasks.filter((task) => {
    const matchesStatus = query.status === null || task.status === query.status;
    const matchesSearch =
      needle === '' || task.title.toLowerCase().includes(needle);
    const matchesTag =
      wantedTag === '' ||
      task.tags.some((tag) => tag.toLowerCase() === wantedTag);

    return matchesStatus && matchesSearch && matchesTag;
  });
}

export function sortTasks(tasks: readonly Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const byStatus = statusRank(a.status) - statusRank(b.status);
    if (byStatus !== 0) {
      return byStatus;
    }

    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}
