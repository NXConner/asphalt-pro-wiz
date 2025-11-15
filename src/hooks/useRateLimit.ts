/**
 * React hook for rate limiting
 */

import { useCallback, useRef } from 'react';

import { checkRateLimit, type RateLimitConfig } from '@/lib/security';

/**
 * Use rate limiting hook
 */
export function useRateLimit(config: RateLimitConfig, key?: string) {
  const keyRef = useRef(key || 'default');

  const isAllowed = useCallback(() => {
    const result = checkRateLimit(keyRef.current, config);
    return result.allowed;
  }, [config]);

  const getRemaining = useCallback(() => {
    const result = checkRateLimit(keyRef.current, config);
    return result.remaining;
  }, [config]);

  const getResetAt = useCallback(() => {
    const result = checkRateLimit(keyRef.current, config);
    return result.resetAt;
  }, [config]);

  return {
    isAllowed,
    getRemaining,
    getResetAt,
    checkLimit: () => checkRateLimit(keyRef.current, config),
  };
}
