import type { Task } from './task';

export const aTask = (over: Partial<Task> & Pick<Task, 'id'>): Task => ({
  title: 'Untitled',
  status: 'todo',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  tags: [],
  ...over,
});
