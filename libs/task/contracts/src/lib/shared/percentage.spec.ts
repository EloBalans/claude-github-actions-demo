import { formatPercentage } from './percentage';

describe('formatPercentage', () => {
  it('rounds to a whole percent', () => {
    expect(formatPercentage(0.333)).toBe('33%');
  });

  it('formats the bounds', () => {
    expect(formatPercentage(0)).toBe('0%');
    expect(formatPercentage(1)).toBe('100%');
  });
});
