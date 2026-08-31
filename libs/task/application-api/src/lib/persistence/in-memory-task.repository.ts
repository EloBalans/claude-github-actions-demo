import { randomUUID } from 'node:crypto';
import type { Task } from '@claude-actions/task/domain';
import type { SeededTaskRepository } from './seeded-task.repository';

const SEED: readonly Omit<Task, 'id'>[] = [
  {
    title: 'Ship the checkout redesign',
    status: 'done',
    createdAt: new Date('2026-02-02T09:00:00.000Z'),
    tags: ['checkout'],
  },
  {
    title: 'Add rate limiting to the search endpoint',
    status: 'done',
    createdAt: new Date('2026-02-05T11:20:00.000Z'),
    tags: ['api'],
  },
  {
    title: 'Upgrade the database driver',
    status: 'done',
    createdAt: new Date('2026-02-09T15:45:00.000Z'),
    tags: ['infra'],
  },
  {
    title: 'Ship the new pricing page',
    status: 'doing',
    createdAt: new Date('2026-02-12T08:30:00.000Z'),
    tags: ['web'],
  },
  {
    title: 'Shrink the vendor bundle below 200 kB',
    status: 'doing',
    createdAt: new Date('2026-02-16T10:05:00.000Z'),
    tags: ['perf'],
  },
  {
    title: 'Fix the flaky checkout test',
    status: 'doing',
    createdAt: new Date('2026-02-19T13:40:00.000Z'),
    tags: ['testing'],
  },
  {
    title: 'Share the on-call rotation with support',
    status: 'todo',
    createdAt: new Date('2026-02-23T09:15:00.000Z'),
    tags: ['ops'],
  },
  {
    title: 'Migrate uploads to object storage',
    status: 'todo',
    createdAt: new Date('2026-02-25T14:50:00.000Z'),
    tags: ['infra'],
  },
  {
    title: 'Document the release process',
    status: 'todo',
    createdAt: new Date('2026-02-27T16:10:00.000Z'),
    tags: ['docs'],
  },
];

export class InMemoryTaskRepository implements SeededTaskRepository {
  private tasks: Task[] = [];

  constructor() {
    this.reset();
  }

  reset(): void {
    this.tasks = SEED.map((task) => ({ ...task, id: randomUUID() }));
  }

  all(): readonly Task[] {
    return this.tasks.map((task) => ({ ...task }));
  }

  find(id: string): Task | undefined {
    const task = this.tasks.find((candidate) => candidate.id === id);

    return task ? { ...task } : undefined;
  }

  add(task: Task): void {
    this.tasks = [...this.tasks, { ...task }];
  }

  replace(task: Task): boolean {
    const index = this.tasks.findIndex((candidate) => candidate.id === task.id);
    if (index === -1) {
      return false;
    }

    this.tasks = [
      ...this.tasks.slice(0, index),
      { ...task },
      ...this.tasks.slice(index + 1),
    ];

    return true;
  }

  remove(id: string): boolean {
    const next = this.tasks.filter((task) => task.id !== id);
    const removed = next.length !== this.tasks.length;
    this.tasks = next;

    return removed;
  }
}
