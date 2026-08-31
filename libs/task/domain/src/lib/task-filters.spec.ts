import { aTask } from './task-fixture';
import { filterTasks, sortTasks } from './task-filters';
import type { Task } from './task';

const tasks: Task[] = [
  aTask({ id: '1', title: 'Write the article', status: 'doing' }),
  aTask({ id: '2', title: 'Record the GIF', status: 'todo' }),
  aTask({ id: '3', title: 'Ship the workflow', status: 'done' }),
];

describe('filterTasks', () => {
  it('returns everything for an empty query', () => {
    expect(filterTasks(tasks, { search: '', status: null })).toHaveLength(3);
  });

  it('matches the title case-insensitively', () => {
    const result = filterTasks(tasks, { search: 'GIF', status: null });
    expect(result.map((t) => t.id)).toEqual(['2']);
  });

  it('filters by status', () => {
    const result = filterTasks(tasks, { search: '', status: 'done' });
    expect(result.map((t) => t.id)).toEqual(['3']);
  });
});

describe('sortTasks', () => {
  it('orders by workflow status', () => {
    expect(sortTasks(tasks).map((t) => t.status)).toEqual([
      'todo',
      'doing',
      'done',
    ]);
  });
});
