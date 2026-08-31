import { createTask, isValidTitle, normalizeTitle } from './task.factory';

const identity = { id: '1', createdAt: new Date('2026-01-01T00:00:00.000Z') };

describe('isValidTitle', () => {
  it('rejects a blank title', () => {
    expect(isValidTitle('   ')).toBe(false);
    expect(isValidTitle('')).toBe(false);
  });

  it('accepts a title with content', () => {
    expect(isValidTitle('  Ship it ')).toBe(true);
  });
});

describe('createTask', () => {
  it('trims the title', () => {
    expect(createTask({ title: '  Ship it  ' }, identity).title).toBe(
      'Ship it',
    );
  });

  it('starts a task in the first workflow status', () => {
    expect(createTask({ title: 'Ship it' }, identity).status).toBe('todo');
  });

  it('defaults the tag list to empty', () => {
    expect(createTask({ title: 'Ship it' }, identity).tags).toEqual([]);
  });

  it('keeps an explicit status', () => {
    expect(
      createTask({ title: 'Ship it', status: 'doing' }, identity).status,
    ).toBe('doing');
  });
});

describe('normalizeTitle', () => {
  it('strips surrounding whitespace', () => {
    expect(normalizeTitle('\tShip it\n')).toBe('Ship it');
  });
});
