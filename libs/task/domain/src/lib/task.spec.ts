import { nextStatus, statusRank } from './task';

describe('nextStatus', () => {
  it('walks the workflow forward', () => {
    expect(nextStatus('todo')).toBe('doing');
    expect(nextStatus('doing')).toBe('done');
  });

  it('wraps around from done', () => {
    expect(nextStatus('done')).toBe('todo');
  });
});

describe('statusRank', () => {
  it('ranks statuses in workflow order', () => {
    expect(statusRank('todo')).toBeLessThan(statusRank('doing'));
    expect(statusRank('doing')).toBeLessThan(statusRank('done'));
  });
});
