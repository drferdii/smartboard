export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
  };
};

export function sanitizeCsvCell(value: string | number | null | undefined) {
  if (value === null || value === undefined) return '';

  const text = String(value);
  if (/^\s*[=+\-@]/.test(text)) {
    return `'${text}`;
  }

  return text;
}

export function escapeCsv(value: string | number | null | undefined) {
  const sanitized = sanitizeCsvCell(value);
  if (/[",\n]/.test(sanitized)) {
    return `"${sanitized.replace(/"/g, '""')}"`;
  }

  return sanitized;
}

export function safeUiErrorMessage() {
  return 'Sistem kami mengalami kendala teknis. Kami memohon maaf atas ketidaknyamanan ini.';
}
