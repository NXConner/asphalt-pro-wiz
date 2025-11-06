import { useContext } from 'react';
import { useContext } from 'react';

import type { MissionSchedulerHook } from '@/hooks/useMissionScheduler';
import { MissionSchedulerContext } from '@/modules/scheduler/MissionSchedulerContext.constants';

export function useMissionSchedulerContext(): MissionSchedulerHook {
  const ctx = useContext(MissionSchedulerContext);
  if (!ctx) {
    throw new Error('useMissionSchedulerContext must be used within a MissionSchedulerProvider');
  }
  return ctx;
}
