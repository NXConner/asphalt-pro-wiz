/**
 * Utility functions for sanitizing user input and preventing XSS attacks
 */

/**
 * Sanitize HTML string by escaping dangerous characters
 */
export function sanitizeHTML(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Sanitize string for use in SQL queries (use with parameterized queries)
 */
export function sanitizeSQL(input: string): string {
  return input.replace(/['";\\]/g, '\\$&');
}

/**
 * Sanitize URL to prevent javascript: protocol and data: URIs
 */
export function sanitizeURL(url: string): string {
  const trimmed = url.trim().toLowerCase();
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  if (dangerousProtocols.some(protocol => trimmed.startsWith(protocol))) {
    return '';
  }

  // Ensure valid protocol
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    // If not absolute URL, check if relative
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return url;
    }
    return '';
  }
}

/**
 * Sanitize filename to prevent directory traversal
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^\.+/, '')
    .substring(0, 255);
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed) ? trimmed : '';
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^0-9+()-\s]/g, '');
}

/**
 * Remove all HTML tags from string
 */
export function stripHTML(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize object keys and values recursively
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeHTML(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeHTML(key);
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Validate and sanitize JSON input
 */
export function sanitizeJSON(input: string): string | null {
  try {
    const parsed = JSON.parse(input);
    const sanitized = sanitizeObject(parsed);
    return JSON.stringify(sanitized);
  } catch {
    return null;
  }
}
