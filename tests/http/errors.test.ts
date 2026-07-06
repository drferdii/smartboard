import { describe, expect, it } from 'vitest';
import { escapeCsv, sanitizeCsvCell, safeUiErrorMessage } from '@/lib/http/errors';

describe('sanitizeCsvCell', () => {
  it('prefixes formula-like input with an apostrophe', () => {
    expect(sanitizeCsvCell('=SUM(A1:A2)')).toBe("'=SUM(A1:A2)");
    expect(sanitizeCsvCell('+cmd')).toBe("'+cmd");
    expect(sanitizeCsvCell(' -danger')).toBe("' -danger");
    expect(sanitizeCsvCell('@memo')).toBe("'@memo");
    expect(sanitizeCsvCell('\n=SUM(A1:A2)')).toBe("'\n=SUM(A1:A2)");
  });

  it('keeps regular content unchanged', () => {
    expect(sanitizeCsvCell('Semayot')).toBe('Semayot');
    expect(sanitizeCsvCell(12000)).toBe('12000');
  });
});

describe('escapeCsv', () => {
  it('quotes values that contain CSV control characters after sanitization', () => {
    expect(escapeCsv('="bad",entry')).toBe('"\'=""bad"",entry"');
  });
});

describe('safeUiErrorMessage', () => {
  it('returns a generic public-safe error message', () => {
    expect(safeUiErrorMessage()).toContain('kendala teknis');
  });
});
