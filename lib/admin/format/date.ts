const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

type TodayOptions = {
  now?: Date;
  timeZone?: string;
};

function parseDate(input: string): Date {
  const [y, m, d] = input.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatSingleDate(date: Date): string {
  return `${date.getDate()} ${MONTHS_ID[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateID(input: string): string {
  return formatSingleDate(parseDate(input));
}

export function formatDateRangeID(start: string, end: string): string {
  const s = parseDate(start);
  const e = parseDate(end);
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${s.getDate()} - ${e.getDate()} ${MONTHS_ID[s.getMonth()]} ${s.getFullYear()}`;
  }
  if (s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} ${MONTHS_ID[s.getMonth()]} - ${e.getDate()} ${MONTHS_ID[e.getMonth()]} ${s.getFullYear()}`;
  }
  return `${formatSingleDate(s)} - ${formatSingleDate(e)}`;
}

export function getDateParts(options?: TodayOptions) {
  const now = options?.now ?? new Date();

  if (!options?.timeZone) {
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      isoDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    };
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: options.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const year = Number(parts.find((part) => part.type === 'year')?.value ?? '0');
  const month = Number(parts.find((part) => part.type === 'month')?.value ?? '0');
  const day = Number(parts.find((part) => part.type === 'day')?.value ?? '0');

  return {
    year,
    month,
    day,
    isoDate: `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  };
}

export function getTodayID(options?: TodayOptions): string {
  return getDateParts(options).isoDate;
}

function getTimeZoneOffset(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
    hour: '2-digit',
  }).formatToParts(date);
  const tzName = parts.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT+0';
  const match = tzName.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
  if (!match) {
    return '+00:00';
  }

  const [, sign, hours, minutes] = match;
  return `${sign}${hours.padStart(2, '0')}:${(minutes ?? '00').padStart(2, '0')}`;
}

export function addDays(dateString: string, days: number): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function isIsoCalendarDate(input: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return false;
  }

  const [year, month, day] = input.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function buildBusinessDateRange(dateString: string, timeZone: string) {
  const offset = getTimeZoneOffset(new Date(`${dateString}T12:00:00Z`), timeZone);
  const nextDate = addDays(dateString, 1);

  return {
    start: `${dateString}T00:00:00${offset}`,
    endExclusive: `${nextDate}T00:00:00${offset}`,
  };
}

export function formatDateInTimeZone(input: string | Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(typeof input === 'string' ? new Date(input) : input);
}
