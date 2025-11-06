import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import { createSupabaseModuleMock } from './tests/utils/supabaseMock';

vi.mock('@/integrations/supabase/client', () => createSupabaseModuleMock());

vi.mock('@/lib/logging', () => {
  const logEvent = vi.fn();
  return {
    logEvent,
    logError: vi.fn(),
    logVital: vi.fn(),
    setLogContext: vi.fn(),
  };
});
