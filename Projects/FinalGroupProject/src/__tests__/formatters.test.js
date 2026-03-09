import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatCompact,
  formatPercent,
  formatDate,
  formatRelativeTime,
  getPriceClass,
} from '../utils/formatters.js';

describe('formatCurrency', () => {
  it('formats a positive number as USD', () => {
    expect(formatCurrency(178.45)).toBe('$178.45');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('returns N/A for null', () => {
    expect(formatCurrency(null)).toBe('N/A');
  });

  it('returns N/A for undefined', () => {
    expect(formatCurrency(undefined)).toBe('N/A');
  });

  it('returns N/A for NaN', () => {
    expect(formatCurrency(NaN)).toBe('N/A');
  });
});

describe('formatCompact', () => {
  it('formats billions', () => {
    expect(formatCompact(2_780_000_000_000)).toMatch(/T/);
  });

  it('formats millions', () => {
    expect(formatCompact(56_800_000)).toMatch(/M/);
  });

  it('returns N/A for null', () => {
    expect(formatCompact(null)).toBe('N/A');
  });
});

describe('formatPercent', () => {
  it('prepends + for positive values', () => {
    expect(formatPercent(1.33)).toBe('+1.33%');
  });

  it('uses - for negative values without double sign', () => {
    expect(formatPercent(-0.30)).toBe('-0.30%');
  });

  it('formats zero', () => {
    expect(formatPercent(0)).toBe('+0.00%');
  });

  it('returns N/A for null', () => {
    expect(formatPercent(null)).toBe('N/A');
  });
});

describe('getPriceClass', () => {
  it('returns positive for value > 0', () => {
    expect(getPriceClass(2.5)).toBe('positive');
  });

  it('returns negative for value < 0', () => {
    expect(getPriceClass(-1.2)).toBe('negative');
  });

  it('returns neutral for zero', () => {
    expect(getPriceClass(0)).toBe('neutral');
  });
});

describe('formatDate', () => {
  it('returns N/A for falsy input', () => {
    expect(formatDate(null)).toBe('N/A');
    expect(formatDate('')).toBe('N/A');
  });

  it('formats a valid date string', () => {
    const result = formatDate('2024-01-15');
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2024/);
  });
});

describe('formatRelativeTime', () => {
  it('returns empty string for falsy input', () => {
    expect(formatRelativeTime(null)).toBe('');
  });

  it('returns "just now" for very recent timestamps', () => {
    expect(formatRelativeTime(new Date().toISOString())).toBe('just now');
  });

  it('returns minutes for times within the last hour', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinAgo)).toBe('5m ago');
  });
});
