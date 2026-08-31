import { InMemoryTaskRepository } from '../persistence/in-memory-task.repository';
import { addTask } from './add-task';
import { changeTaskStatus } from './change-task-status';
import { discardTask } from './discard-task';

const identity = () => ({
  id: 'new-1',
  createdAt: new Date('2026-04-01T00:00:00.000Z'),
});

describe('addTask', () => {
  it('refuses a draft with a blank title', () => {
    const repository = new InMemoryTaskRepository();
    const before = repository.all().length;

    expect(addTask(repository, identity, { title: '   ' })).toBeNull();
    expect(repository.all()).toHaveLength(before);
  });

  it('stores a task built by the domain', () => {
    const repository = new InMemoryTaskRepository();

    const task = addTask(repository, identity, { title: '  Ship it  ' });

    expect(task).toEqual({
      id: 'new-1',
      title: 'Ship it',
      status: 'todo',
      createdAt: new Date('2026-04-01T00:00:00.000Z'),
      tags: [],
    });
    expect(repository.find('new-1')).toEqual(task);
  });
});

describe('changeTaskStatus', () => {
  it('reports a missing task', () => {
    expect(
      changeTaskStatus(new InMemoryTaskRepository(), 'nope', 'done'),
    ).toBeUndefined();
  });
});

describe('discardTask', () => {
  it('reports a missing task', () => {
    expect(discardTask(new InMemoryTaskRepository(), 'nope')).toBe(false);
  });
});
