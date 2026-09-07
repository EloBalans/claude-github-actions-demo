import { aTask } from './task-fixture';
import { filterTasks, sortTasks } from './task-filters';
import { EMPTY_TASK_QUERY } from './task-query';
import type { Task } from './task';

const tasks: Task[] = [
  aTask({
    id: '1',
    title: 'Write the article',
    status: 'doing',
    tags: ['docs'],
  }),
  aTask({
    id: '2',
    title: 'Record the GIF',
    status: 'todo',
    tags: ['Docs', 'demo'],
  }),
  aTask({ id: '3', title: 'Ship the workflow', status: 'done' }),
];

describe('filterTasks', () => {
  it('returns everything for an empty query', () => {
    expect(filterTasks(tasks, EMPTY_TASK_QUERY)).toHaveLength(3);
  });

  it('matches the title case-insensitively', () => {
    const result = filterTasks(tasks, { ...EMPTY_TASK_QUERY, search: 'GIF' });
    expect(result.map((t) => t.id)).toEqual(['2']);
  });

  it('filters by status', () => {
    const result = filterTasks(tasks, { ...EMPTY_TASK_QUERY, status: 'done' });
    expect(result.map((t) => t.id)).toEqual(['3']);
  });

  it('filters by tag, case-insensitively', () => {
    const result = filterTasks(tasks, { ...EMPTY_TASK_QUERY, tag: 'DOCS' });
    expect(result.map((t) => t.id)).toEqual(['1', '2']);
  });

  it('combines the tag with the other criteria', () => {
    const result = filterTasks(tasks, {
      ...EMPTY_TASK_QUERY,
      status: 'todo',
      tag: 'docs',
    });
    expect(result.map((t) => t.id)).toEqual(['2']);
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
