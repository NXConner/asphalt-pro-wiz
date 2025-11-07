import type { ReactNode } from 'react';

import { useMissionScheduler } from '@/hooks/useMissionScheduler';
import { MissionSchedulerContext } from '@/modules/scheduler/MissionSchedulerContext.constants';

export function MissionSchedulerProvider({ children }: { children: ReactNode }) {
  const scheduler = useMissionScheduler();
  return (
    <MissionSchedulerContext.Provider value={scheduler}>
      {children}
    </MissionSchedulerContext.Provider>
  );
}
