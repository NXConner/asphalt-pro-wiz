import { createContext } from 'react';

import type { MissionSchedulerHook } from '@/hooks/useMissionScheduler';

export const MissionSchedulerContext = createContext<MissionSchedulerHook | null>(null);
