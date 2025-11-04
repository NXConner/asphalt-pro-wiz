import { useState, useCallback } from 'react';

import { calculateDistance } from '@/lib/calculations';
import { makeJobKey, upsertJob, setJobStatus, type JobStatus } from '@/lib/idb';
import { BUSINESS_COORDS_FALLBACK } from '@/lib/locations';
import { logEvent } from '@/lib/logging';

export function useJobState() {
  const [jobName, setJobName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCoords, setCustomerCoords] = useState<[number, number] | null>(null);
  const [jobStatus, setJobStatusLocal] = useState<JobStatus>('need_estimate');
  const [jobCompetitor, setJobCompetitor] = useState('');
  const [mapRefreshKey, setMapRefreshKey] = useState(0);
  const [jobDistance, setJobDistance] = useState(0);

  const businessCoords: [number, number] = BUSINESS_COORDS_FALLBACK;

  const ensureJobPersisted = useCallback(
    (address: string, coords: [number, number] | null) => {
      const key = makeJobKey(jobName, address);
      void upsertJob({
        id: key,
        name: jobName || 'Job',
        address,
        coords: coords ?? undefined,
        status: jobStatus,
        competitor: jobCompetitor || undefined,
      }).then(() => setMapRefreshKey((v) => v + 1));
    },
    [jobName, jobStatus, jobCompetitor],
  );

  const handleAddressUpdate = useCallback(
    (coords: [number, number], address: string) => {
      setCustomerCoords(coords);
      setCustomerAddress(address);
      const distance = calculateDistance(businessCoords, coords) * 2;
      setJobDistance(distance);
      try {
        logEvent('job.address_updated', { address, distanceRtMiles: distance });
      } catch {}
      ensureJobPersisted(address, coords);
    },
    [businessCoords, ensureJobPersisted],
  );

  const updateJobStatus = useCallback(
    (status: JobStatus) => {
      setJobStatusLocal(status);
      const key = makeJobKey(jobName, customerAddress);
      void setJobStatus(key, status).then(() => setMapRefreshKey((v) => v + 1));
    },
    [jobName, customerAddress],
  );

  return {
    name: jobName,
    setName: setJobName,
    address: customerAddress,
    setAddress: setCustomerAddress,
    coords: customerCoords,
    status: jobStatus,
    setStatus: updateJobStatus,
    competitor: jobCompetitor,
    setCompetitor: setJobCompetitor,
    distance: jobDistance,
    mapRefreshKey,
    handleAddressUpdate,
  };
}
