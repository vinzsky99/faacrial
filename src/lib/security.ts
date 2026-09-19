/**
 * Modul Keamanan Facrial: Anti-XSS & SQL Injection Sanitizer
 * Dirancang untuk mengamankan input pencarian, pembuatan postingan, komentar, dan render konten.
 */

// Menghindari serangan Cross-Site Scripting (XSS) dengan encoding entitas HTML
export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Sanitasi query pencarian dari karakter berbahaya
export function sanitizeSearchQuery(query: string): string {
  if (!query) return '';
  // Menghilangkan script tags, SQL injection fragments, dan simbol berbahaya
  return query
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/['";\-\-]/g, '')
    .trim()
    .slice(0, 100); // Batasi panjang query maksimal 100 karakter
}

// Sanitasi link/URL untuk mencegah 'javascript:' pseudo-protocol XSS
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:')
  ) {
    return '#';
  }
  return trimmed;
}

// Deteksi serangan Cross-Site Scripting (XSS) secara ketat untuk memblokir input komentar berbahaya
export interface XSSCheckResult {
  isMalicious: boolean;
  detectedPattern?: string;
  reason?: string;
}

export function detectXSS(input: string): XSSCheckResult {
  if (!input || typeof input !== 'string') {
    return { isMalicious: false };
  }

  const normalized = input.toLowerCase();

  // Pola regex serangan skrip XSS
  const maliciousPatterns: { regex: RegExp; name: string }[] = [
    { regex: /<script[\s\S]*?>[\s\S]*?<\/script>/gi, name: 'Tag <script>' },
    { regex: /<script\b/gi, name: 'Pembuka tag <script>' },
    { regex: /javascript\s*:/gi, name: 'Protokol javascript:' },
    { regex: /vbscript\s*:/gi, name: 'Protokol vbscript:' },
    { regex: /data\s*:\s*text\/html/gi, name: 'data:text/html payload' },
    { regex: /on(error|load|click|mouseover|focus|blur|change|submit|keydown|keyup)\s*=/gi, name: 'Inline Event Handler (on*=' },
    { regex: /<iframe[\s\S]*?>/gi, name: 'Tag <iframe' },
    { regex: /<object[\s\S]*?>/gi, name: 'Tag <object' },
    { regex: /<embed[\s\S]*?>/gi, name: 'Tag <embed' },
    { regex: /<applet[\s\S]*?>/gi, name: 'Tag <applet' },
    { regex: /<svg[\s\S]*?onload/gi, name: 'SVG onload script injection' },
    { regex: /<img[\s\S]*?onerror/gi, name: 'Image onerror script injection' },
    { regex: /eval\s*\(/gi, name: 'Fungsi eval()' },
    { regex: /expression\s*\(/gi, name: 'CSS expression()' },
    { regex: /document\s*\.\s*(cookie|location|write)/gi, name: 'Akses properti document/cookie' },
    { regex: /window\s*\.\s*(location|open)/gi, name: 'Akses properti window' },
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.regex.test(input)) {
      return {
        isMalicious: true,
        detectedPattern: pattern.name,
        reason: `Peringatan Keamanan: Terdeteksi pola script berbahaya (${pattern.name}). Komentar diblokir otomatis oleh sistem anti-XSS Facrial.`,
      };
    }
  }

  // Cek karakter tag HTML terbuka berpotensi bahaya
  if (/<[a-z][\s\S]*>/i.test(input) && /(alert|prompt|confirm|fetch|xhr|exec)/i.test(normalized)) {
    return {
      isMalicious: true,
      detectedPattern: 'Potensi Eksekusi Script HTML',
      reason: 'Peringatan Keamanan: Terdeteksi tag HTML dengan perintah eksekusi kode terlarang.',
    };
  }

  return { isMalicious: false };
}

// Validasi slug agar hanya berisi alfanumerik dan tanda hubung
export function createSafeSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
