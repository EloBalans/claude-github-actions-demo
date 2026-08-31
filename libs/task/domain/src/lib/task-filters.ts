import type { Task } from './task';
import { statusRank } from './task';
import type { TaskQuery } from './task-query';

export function filterTasks(tasks: readonly Task[], query: TaskQuery): Task[] {
  const needle = query.search.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesStatus = query.status === null || task.status === query.status;
    const matchesSearch =
      needle === '' || task.title.toLowerCase().includes(needle);

    return matchesStatus && matchesSearch;
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
