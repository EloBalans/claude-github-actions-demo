import type { TaskDocumentDto } from '@claude-actions/task/contracts';
import { aTask } from './task-fixture';
import { toTask, toTaskDto } from './task.mapper';

const dto: TaskDocumentDto = {
  id: '1',
  title: 'Record the GIF',
  status: 'todo',
  createdAt: '2026-02-06T16:20:00.000Z',
  tags: ['demo'],
};

describe('toTask', () => {
  it('parses the ISO timestamp into a Date', () => {
    expect(toTask(dto).createdAt).toEqual(new Date('2026-02-06T16:20:00.000Z'));
  });
});

describe('toTaskDto', () => {
  it('round-trips a task through the wire format', () => {
    expect(toTaskDto(toTask(dto))).toEqual(dto);
  });

  it('serialises the date back to ISO-8601', () => {
    const task = aTask({
      id: '9',
      createdAt: new Date('2026-05-01T12:00:00.000Z'),
    });

    expect(toTaskDto(task).createdAt).toBe('2026-05-01T12:00:00.000Z');
  });
});
