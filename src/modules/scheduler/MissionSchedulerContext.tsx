import { createContext, useContext, type ReactNode } from 'react';

import { useMissionScheduler, type MissionSchedulerHook } from '@/hooks/useMissionScheduler';

const MissionSchedulerContext = createContext<MissionSchedulerHook | null>(null);

export function MissionSchedulerProvider({ children }: { children: ReactNode }) {
  const scheduler = useMissionScheduler();
  return <MissionSchedulerContext.Provider value={scheduler}>{children}</MissionSchedulerContext.Provider>;
}

export function useMissionSchedulerContext(): MissionSchedulerHook {
  const ctx = useContext(MissionSchedulerContext);
  if (!ctx) {
    throw new Error('useMissionSchedulerContext must be used within a MissionSchedulerProvider');
  }
  return ctx;
}

