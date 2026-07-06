import { describe, it, expect } from 'vitest';
import {
  addDays,
  buildBusinessDateRange,
  formatDateID,
  formatDateInTimeZone,
  formatDateRangeID,
  getDateParts,
  getTodayID,
  isIsoCalendarDate,
} from '@/lib/admin/format/date';

describe('formatDateID', () => {
  it('formats ISO date to Indonesian format', () => {
    expect(formatDateID('2026-06-28')).toBe('28 Juni 2026');
    expect(formatDateID('2026-01-01')).toBe('1 Januari 2026');
  });
});

describe('formatDateRangeID', () => {
  it('formats same-month range', () => {
    expect(formatDateRangeID('2026-06-01', '2026-06-30')).toBe('1 - 30 Juni 2026');
  });
  it('formats cross-month range', () => {
    expect(formatDateRangeID('2026-06-28', '2026-07-05')).toBe('28 Juni - 5 Juli 2026');
  });
  it('formats cross-year range', () => {
    expect(formatDateRangeID('2025-12-30', '2026-01-02')).toBe('30 Desember 2025 - 2 Januari 2026');
  });
});

describe('getTodayID', () => {
  it('returns today in YYYY-MM-DD', () => {
    const today = getTodayID();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('resolves business date in a specific timezone', () => {
    const today = getTodayID({
      now: new Date('2026-07-05T17:30:00.000Z'),
      timeZone: 'Asia/Jakarta',
    });

    expect(today).toBe('2026-07-06');
  });
});

describe('getDateParts', () => {
  it('returns year and month based on business timezone', () => {
    const result = getDateParts({
      now: new Date('2026-12-31T18:30:00.000Z'),
      timeZone: 'Asia/Jakarta',
    });

    expect(result.year).toBe(2027);
    expect(result.month).toBe(1);
    expect(result.day).toBe(1);
    expect(result.isoDate).toBe('2027-01-01');
  });
});

describe('isIsoCalendarDate', () => {
  it('accepts canonical calendar dates only', () => {
    expect(isIsoCalendarDate('2026-07-05')).toBe(true);
    expect(isIsoCalendarDate('2026-02-31')).toBe(false);
    expect(isIsoCalendarDate('2026-7-5')).toBe(false);
    expect(isIsoCalendarDate('07/05/2026')).toBe(false);
  });
});

describe('buildBusinessDateRange', () => {
  it('builds offset-aware daily boundaries', () => {
    const result = buildBusinessDateRange('2026-07-05', 'Asia/Jakarta');

    expect(result.start).toBe('2026-07-05T00:00:00+07:00');
    expect(result.endExclusive).toBe('2026-07-06T00:00:00+07:00');
  });
});

describe('formatDateInTimeZone', () => {
  it('formats timestamps using the business timezone', () => {
    expect(formatDateInTimeZone('2026-07-05T17:30:00.000Z', 'Asia/Jakarta')).toBe('2026-07-06');
  });
});

describe('addDays', () => {
  it('shifts ISO dates safely in UTC', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
});
