const { normalizeCoord } = require('../../src/utils/coordinates');

describe('normalizeCoord', () => {
  it('should round to 6 decimal places', () => {
    expect(normalizeCoord(28.675241470336914)).toBe("28.675241");
    expect(normalizeCoord(77.1682357788086)).toBe("77.168236");
  });

  it('should handle already short decimals', () => {
    expect(normalizeCoord(28.123)).toBe("28.123000");
  });
});
