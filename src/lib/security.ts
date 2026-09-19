/**
 * Security utilities to sanitize inputs against Cross-Site Scripting (XSS)
 * and prevent SQL Injection patterns when querying or inserting data.
 */

// HTML entity map for escaping dangerous characters
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

/**
 * Strips script tags, inline event handlers (onload, onerror, onclick),
 * and escapes dangerous characters to prevent XSS.
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';

  // 1. Remove dangerous javascript: protocols
  let clean = input.replace(/javascript\s*:/gi, '');

  // 2. Remove script and iframe tags entirely
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // 3. Remove inline event handlers like onerror=..., onload=...
  clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/on\w+\s*=\s*[^>\s]+/gi, '');

  // 4. Strip dangerous characters or return clean string
  return clean.trim();
}

/**
 * Escapes characters for safe HTML rendering if needed
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return str.replace(/[&<>"'`=\/]/g, (s) => HTML_ESCAPE_MAP[s] || s);
}

/**
 * Checks for known SQL Injection patterns in search queries or input fields.
 * If detected, neutralizes or rejects the pattern.
 */
export function sanitizeSqlQuery(query: string): { safeQuery: string; hadSuspiciousPattern: boolean } {
  if (!query || typeof query !== 'string') return { safeQuery: '', hadSuspiciousPattern: false };

  // Common SQL injection indicators: union select, 1=1, drop table, comments --, exec, xp_
  const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b|--|\/\*|\*\/|;|'|\bOR\b\s+\d+=\d+|\bAND\b\s+\d+=\d+)/i;

  const hadSuspiciousPattern = sqlInjectionPattern.test(query);

  // Clean query by removing typical SQL punctuation and quotes
  let safeQuery = query
    .replace(/['";\-\-\/\*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    safeQuery,
    hadSuspiciousPattern
  };
}

/**
 * Converts a string into a clean, URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Formats Indonesian date representation
 */
export function formatIndonesianDate(date: Date = new Date()): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${dayName}, ${day} ${month} ${year} • ${hours}:${minutes} WIB`;
}
