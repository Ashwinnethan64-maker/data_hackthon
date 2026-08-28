export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

// Temporary extraction utility
export function extractLogo() {
  // no-op
}

export function sanitizeSearchQuery(q: unknown, max = 100): string {
  if (typeof q !== 'string') return '';
  return q.slice(0, max).replace(/[\x00-\x1F\x7F]/g, '').trim();
}

export function sanitizeFirNumber(fir: unknown): string {
  if (typeof fir !== 'string') return '';
  return fir.trim().slice(0, 32).replace(/[^a-zA-Z0-9\-_/]/g, '');
}

export function sanitizeId(id: unknown): string {
  if (typeof id !== 'string') return '';
  return id.trim().slice(0, 64).replace(/[^a-zA-Z0-9\-_]/g, '');
}

export function sanitizeCsvField(field: unknown): string {
  if (field === null || field === undefined) return '';
  const str = String(field).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

export function sanitizeRedirectPath(path: unknown, fallback = '/'): string {
  if (typeof path !== 'string') return fallback;
  const trimmed = path.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('\\')) {
    return trimmed;
  }
  return fallback;
}


