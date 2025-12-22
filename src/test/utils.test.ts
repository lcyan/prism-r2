import { describe, it, expect } from 'vitest';
import { formatSize } from '../types';

describe('formatSize', () => {
  it('should format bytes correctly', () => {
    expect(formatSize(0)).toBe('0 B');
    expect(formatSize(1024)).toBe('1.00 KB');
    expect(formatSize(1024 * 1024)).toBe('1.00 MB');
  });
});
