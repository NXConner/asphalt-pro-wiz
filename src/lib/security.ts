/**
 * Security utilities and helpers
 * Comprehensive security functions for the application
 */

import { logError } from './logging';

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: () => string;
}

/**
 * Simple in-memory rate limiter
 * For production, use Redis or a dedicated service
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * Check if request should be rate limited
   */
  isRateLimited(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const requests = this.requests.get(key) || [];

    // Filter requests within the time window
    const recentRequests = requests.filter((time) => time > windowStart);

    // Check if limit exceeded
    if (recentRequests.length >= config.maxRequests) {
      return true;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);

    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      this.cleanup(windowStart);
    }

    return false;
  }

  /**
   * Clean up old entries
   */
  private cleanup(windowStart: number): void {
    for (const [key, requests] of this.requests.entries()) {
      const recent = requests.filter((time) => time > windowStart);
      if (recent.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recent);
      }
    }
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string, config: RateLimitConfig): number {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const requests = this.requests.get(key) || [];
    const recentRequests = requests.filter((time) => time > windowStart);
    return Math.max(0, config.maxRequests - recentRequests.length);
  }
}

const rateLimiter = new RateLimiter();

/**
 * Create a rate-limited function
 */
export function withRateLimit<T extends (...args: unknown[]) => unknown>(
  fn: T,
  config: RateLimitConfig,
): T {
  return ((...args: Parameters<T>) => {
    const key = config.keyGenerator?.() || 'default';
    if (rateLimiter.isRateLimited(key, config)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    return fn(...args);
  }) as T;
}

/**
 * Check if request is rate limited
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const isLimited = rateLimiter.isRateLimited(key, config);
  const remaining = rateLimiter.getRemaining(key, config);
  const resetAt = Date.now() + config.windowMs;

  return {
    allowed: !isLimited,
    remaining,
    resetAt,
  };
}

/**
 * Security headers configuration
 */
export interface SecurityHeaders {
  'Content-Security-Policy'?: string;
  'X-Content-Type-Options'?: string;
  'X-Frame-Options'?: string;
  'X-XSS-Protection'?: string;
  'Strict-Transport-Security'?: string;
  'Referrer-Policy'?: string;
  'Permissions-Policy'?: string;
}

/**
 * Get default security headers
 */
export function getDefaultSecurityHeaders(): SecurityHeaders {
  return {
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://docs.opencv.org; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.openweathermap.org https://api.open-meteo.com https://tile.openstreetmap.org https://services.arcgisonline.com;",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), bluetooth=()',
  };
}

/**
 * Validate CSRF token
 * For production, implement proper CSRF token validation
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  // In a real application, compare token with session token
  // This is a simplified version
  return token === sessionToken && token.length > 0;
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Secure token storage
 */
export function storeSecureToken(key: string, value: string): void {
  try {
    sessionStorage.setItem(`secure_${key}`, value);
  } catch (error) {
    logError(error, { context: 'storeSecureToken', key });
  }
}

/**
 * Retrieve secure token
 */
export function getSecureToken(key: string): string | null {
  try {
    return sessionStorage.getItem(`secure_${key}`);
  } catch (error) {
    logError(error, { context: 'getSecureToken', key });
    return null;
  }
}

/**
 * Clear secure token
 */
export function clearSecureToken(key: string): void {
  try {
    sessionStorage.removeItem(`secure_${key}`);
  } catch (error) {
    logError(error, { context: 'clearSecureToken', key });
  }
}

/**
 * Validate session security
 */
export function validateSession(): {
  valid: boolean;
  reason?: string;
} {
  try {
    // Check if session storage is available
    if (typeof sessionStorage === 'undefined') {
      return { valid: false, reason: 'Session storage not available' };
    }

    // Check for session timeout (example: 24 hours)
    const sessionStart = sessionStorage.getItem('session_start');
    if (sessionStart) {
      const startTime = parseInt(sessionStart, 10);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (now - startTime > maxAge) {
        return { valid: false, reason: 'Session expired' };
      }
    }

    return { valid: true };
  } catch (error) {
    logError(error, { context: 'validateSession' });
    return { valid: false, reason: 'Session validation error' };
  }
}

/**
 * Initialize secure session
 */
export function initializeSecureSession(): void {
  try {
    sessionStorage.setItem('session_start', Date.now().toString());
    const csrfToken = generateCSRFToken();
    storeSecureToken('csrf', csrfToken);
  } catch (error) {
    logError(error, { context: 'initializeSecureSession' });
  }
}

/**
 * Secure data masking for sensitive information
 */
export function maskSensitiveData(data: string, visibleChars = 4): string {
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length);
  }
  const visible = data.slice(-visibleChars);
  const masked = '*'.repeat(data.length - visibleChars);
  return `${masked}${visible}`;
}

/**
 * Check if URL is safe
 */
export function isSafeURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    return safeProtocols.includes(parsed.protocol);
  } catch {
    // Relative URLs are considered safe
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  action: string;
  userId?: string;
  resource?: string;
  details?: Record<string, unknown>;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create audit log entry
 */
export function createAuditLog(entry: Omit<AuditLogEntry, 'timestamp'>): AuditLogEntry {
  return {
    ...entry,
    timestamp: Date.now(),
    ipAddress: typeof window !== 'undefined' ? undefined : undefined, // Would need server-side
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  };
}

/**
 * Security event types
 */
export type SecurityEventType =
  | 'authentication_failure'
  | 'authentication_success'
  | 'authorization_failure'
  | 'rate_limit_exceeded'
  | 'suspicious_activity'
  | 'data_access'
  | 'data_modification'
  | 'session_timeout'
  | 'csrf_validation_failure';

/**
 * Log security event
 */
export function logSecurityEvent(
  eventType: SecurityEventType,
  details?: Record<string, unknown>,
): void {
  const auditEntry = createAuditLog({
    action: eventType,
    details,
  });

  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'development') {
    console.warn('[Security Event]', auditEntry);
  }

  // Log to application logging system
  logError(new Error(`Security event: ${eventType}`), {
    securityEvent: true,
    ...auditEntry,
  });
}
