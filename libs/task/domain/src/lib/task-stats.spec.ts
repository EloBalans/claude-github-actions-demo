import { aTask } from './task-fixture';
import { formatCompletionRate, summarizeTasks } from './task-stats';

describe('summarizeTasks', () => {
  it('counts tasks per status', () => {
    const stats = summarizeTasks([
      aTask({ id: '1', status: 'todo' }),
      aTask({ id: '2', status: 'doing' }),
      aTask({ id: '3', status: 'done' }),
    ]);

    expect(stats.byStatus).toEqual({ todo: 1, doing: 1, done: 1 });
    expect(stats.total).toBe(3);
  });

  it('reports a zero completion rate for an empty list', () => {
    expect(summarizeTasks([]).completionRate).toBe(0);
  });
});

describe('formatCompletionRate', () => {
  it('renders whole percentages', () => {
    expect(formatCompletionRate(1 / 3)).toBe('33%');
  });
});
