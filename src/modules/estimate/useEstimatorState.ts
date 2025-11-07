import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import type { CustomService } from '@/components/CustomServices';
import {
  calculateDistance,
  calculateProject,
  defaultBusinessData,
  type BusinessData,
  type CostBreakdown,
  type Costs,
  type ProjectInputs,
} from '@/lib/calculations';
import { isEnabled, setFlag, type FeatureFlag } from '@/lib/flags';
import { makeJobKey, setJobStatus, upsertJob, type JobStatus } from '@/lib/idb';
import {
  BUSINESS_ADDRESS,
  BUSINESS_COORDS_FALLBACK,
  SUPPLIER_ADDRESS,
  SUPPLIER_COORDS_FALLBACK,
} from '@/lib/locations';
import { logEvent } from '@/lib/logging';
import { getServiceById } from '@/lib/serviceCatalog';

export type AreaShape = 'rectangle' | 'triangle' | 'circle' | 'drawn' | 'manual' | 'image';

export interface AreaItem {
  id: number;
  shape: AreaShape;
  area: number;
}

export type StripingColor = 'White' | 'Blue' | 'Yellow' | 'Red' | 'Green';

interface JobState {
  name: string;
  setName: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  coords: [number, number] | null;
  status: JobStatus;
  setStatus: (status: JobStatus) => void;
  competitor: string;
  setCompetitor: (value: string) => void;
  distance: number;
  supplierDistance: number;
  businessAddress: string;
  supplierAddress: string;
  businessCoords: [number, number];
  supplierCoords: [number, number];
  mapRefreshKey: number;
  handleAddressUpdate: (coords: [number, number], address: string) => void;
}

interface AreaState {
  items: AreaItem[];
  total: number;
  shapeType: Exclude<AreaShape, 'drawn' | 'image'>;
  setShapeType: (shape: Exclude<AreaShape, 'drawn' | 'image'>) => void;
  manualInput: string;
  setManualInput: (value: string) => void;
  addEmpty: () => void;
  addManual: () => void;
  update: (id: number, area: number) => void;
  remove: (id: number) => void;
  handleAreaDrawn: (area: number) => void;
  handleImageAreaDetected: (area: number) => void;
}

interface CrackState {
  length: number;
  setLength: (value: number) => void;
  width: number;
  setWidth: (value: number) => void;
  depth: number;
  setDepth: (value: number) => void;
  fillerProduct: string;
  handleCrackLengthDrawn: (length: number) => void;
}

interface MaterialState {
  numCoats: number;
  setNumCoats: (value: number) => void;
  sandAdded: boolean;
  setSandAdded: (value: boolean) => void;
  polymerAdded: boolean;
  setPolymerAdded: (value: boolean) => void;
  sealerType: 'Acrylic' | 'Asphalt Emulsion' | 'Coal Tar' | 'PMM' | 'Other';
  setSealerType: (value: 'Acrylic' | 'Asphalt Emulsion' | 'Coal Tar' | 'PMM' | 'Other') => void;
  sandType: 'Black Beauty' | 'Black Diamond' | 'Other';
  setSandType: (value: 'Black Beauty' | 'Black Diamond' | 'Other') => void;
  waterPercent: number;
  setWaterPercent: (value: number) => void;
}

interface StripingState {
  lines: number;
  setLines: (value: number) => void;
  handicap: number;
  setHandicap: (value: number) => void;
  arrowsLarge: number;
  setArrowsLarge: (value: number) => void;
  arrowsSmall: number;
  setArrowsSmall: (value: number) => void;
  lettering: number;
  setLettering: (value: number) => void;
  curb: number;
  setCurb: (value: number) => void;
  colors: StripingColor[];
  toggleColor: (color: StripingColor, checked: boolean) => void;
}

interface PremiumState {
  edgePushing: boolean;
  setEdgePushing: (value: boolean) => void;
  weedKiller: boolean;
  setWeedKiller: (value: boolean) => void;
  crackCleaning: boolean;
  setCrackCleaning: (value: boolean) => void;
  powerWashing: boolean;
  setPowerWashing: (value: boolean) => void;
  debrisRemoval: boolean;
  setDebrisRemoval: (value: boolean) => void;
  handlePremiumServiceChange: (service: string, value: boolean) => void;
}

interface CustomServicesState {
  items: CustomService[];
  setItems: (services: CustomService[]) => void;
  addFromCatalog: (serviceId: string) => void;
  addedNames: string[];
}

interface LogisticsState {
  oilSpots: number;
  setOilSpots: (value: number) => void;
  propaneTanks: number;
  setPropaneTanks: (value: number) => void;
  prepHours: number;
  setPrepHours: (value: number) => void;
}

interface OptionsState {
  includeCleaningRepair: boolean;
  setIncludeCleaningRepair: (value: boolean) => void;
  includeSealcoating: boolean;
  setIncludeSealcoating: (value: boolean) => void;
  includeStriping: boolean;
  setIncludeStriping: (value: boolean) => void;
}

interface CalculationState {
  showResults: boolean;
  costs: Costs | null;
  breakdown: CostBreakdown[];
  handleCalculate: () => void;
  handlePrint: () => void;
}

interface FeatureFlagState {
  values: Record<FeatureFlag, boolean> & { ownerMode: boolean };
  ownerMode: boolean;
  setOwnerMode: (enabled: boolean) => void;
  toggleFlag: (flag: FeatureFlag, enabled: boolean) => void;
  isEnabled: (flag: FeatureFlag) => boolean;
}

export interface EstimatorState {
  business: {
    data: BusinessData;
    setData: (data: BusinessData) => void;
  };
  job: JobState;
  areas: AreaState;
  cracks: CrackState;
  materials: MaterialState;
  striping: StripingState;
  logistics: LogisticsState;
  options: OptionsState;
  premium: PremiumState;
  customServices: CustomServicesState;
  calculation: CalculationState;
  featureFlags: FeatureFlagState;
}

export function useEstimatorState(): EstimatorState {
  const [businessData, setBusinessData] = useState<BusinessData>(defaultBusinessData);
  const [jobName, setJobName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCoords, setCustomerCoords] = useState<[number, number] | null>(null);
  const [jobStatus, setJobStatusLocal] = useState<JobStatus>('need_estimate');
  const [jobCompetitor, setJobCompetitor] = useState('');
  const [mapRefreshKey, setMapRefreshKey] = useState(0);
  const [areas, setAreas] = useState<AreaItem[]>([]);
  const [nextAreaId, setNextAreaId] = useState(1);
  const [shapeType, setShapeType] = useState<Exclude<AreaShape, 'drawn' | 'image'>>('rectangle');
  const [manualAreaInput, setManualAreaInput] = useState<string>('');

  const [numCoats, setNumCoats] = useState(2);
  const [sandAdded, setSandAdded] = useState(false);
  const [polymerAdded, setPolymerAdded] = useState(false);

  const [crackLength, setCrackLength] = useState(0);
  const [crackWidth, setCrackWidth] = useState(0.5);
  const [crackDepth, setCrackDepth] = useState(0.5);

  const [stripingLines, setStripingLines] = useState(0);
  const [stripingHandicap, setStripingHandicap] = useState(0);
  const [stripingArrowsLarge, setStripingArrowsLarge] = useState(0);
  const [stripingArrowsSmall, setStripingArrowsSmall] = useState(0);
  const [stripingLettering, setStripingLettering] = useState(0);
  const [stripingCurb, setStripingCurb] = useState(0);
  const [stripingColors, setStripingColors] = useState<StripingColor[]>([]);

  const [oilSpots, setOilSpots] = useState(0);
  const [propaneTanks, setPropaneTanks] = useState(1);
  const [prepHours, setPrepHours] = useState(1);

  const [premiumEdgePushing, setPremiumEdgePushing] = useState(false);
  const [premiumWeedKiller, setPremiumWeedKiller] = useState(false);
  const [premiumCrackCleaning, setPremiumCrackCleaning] = useState(false);
  const [premiumPowerWashing, setPremiumPowerWashing] = useState(false);
  const [premiumDebrisRemoval, setPremiumDebrisRemoval] = useState(false);

  const [customServices, setCustomServices] = useState<CustomService[]>([]);

  const [includeCleaningRepair, setIncludeCleaningRepair] = useState(true);
  const [includeSealcoating, setIncludeSealcoating] = useState(true);
  const [includeStriping, setIncludeStriping] = useState(true);

  const [waterPercent, setWaterPercent] = useState(0);
  const [sealerType, setSealerType] = useState<
    'Acrylic' | 'Asphalt Emulsion' | 'Coal Tar' | 'PMM' | 'Other'
  >('PMM');
  const [sandType, setSandType] = useState<'Black Beauty' | 'Black Diamond' | 'Other'>(
    'Black Beauty',
  );

  const crackFillerProduct = 'CrackMaster Parking Lot LP hot pour (30 lb box)';

  const [showResults, setShowResults] = useState(false);
  const [costs, setCosts] = useState<Costs | null>(null);
  const [breakdown, setBreakdown] = useState<CostBreakdown[]>([]);
  const [jobDistance, setJobDistance] = useState(0);

  const businessCoords: [number, number] = BUSINESS_COORDS_FALLBACK;
  const supplierCoords: [number, number] = SUPPLIER_COORDS_FALLBACK;
  const supplierDist = useMemo(
    () => calculateDistance(businessCoords, supplierCoords) * 2,
    [businessCoords, supplierCoords],
  );

  const totalArea = useMemo(() => areas.reduce((sum, item) => sum + item.area, 0), [areas]);

  const addedServiceNames = useMemo(
    () => customServices.map((service) => service.name),
    [customServices],
  );

  const [flagVersion, setFlagVersion] = useState(0);
  const [ownerMode, setOwnerModeInternal] = useState<boolean>(isEnabled('ownerMode'));

  useEffect(() => {
    // Sync local owner mode with persisted flag changes (e.g., across tabs)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'pps:flags') {
        setOwnerModeInternal(isEnabled('ownerMode'));
        setFlagVersion((version) => version + 1);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const ensureJobPersisted = (address: string, coords: [number, number] | null) => {
    const key = makeJobKey(jobName, address);
    void upsertJob({
      id: key,
      name: jobName || 'Job',
      address,
      coords: coords ?? undefined,
      status: jobStatus,
      competitor: jobCompetitor || undefined,
    }).then(() => setMapRefreshKey((value) => value + 1));
  };

  const handleAddressUpdate = (coords: [number, number], address: string) => {
    setCustomerCoords(coords);
    setCustomerAddress(address);
    const distance = calculateDistance(businessCoords, coords) * 2;
    setJobDistance(distance);
    try {
      logEvent('job.address_updated', { address, distanceRtMiles: distance });
    } catch {}
    ensureJobPersisted(address, coords);
  };

  const handleAreaDrawn = (area: number) => {
    setAreas((prev) => [...prev, { id: nextAreaId, shape: 'drawn', area }]);
    setNextAreaId((prev) => prev + 1);
    try {
      toast.success(`Added ${area.toFixed(1)} sq ft from map drawing`);
    } catch {}
  };

  const handleImageAreaDetected = (area: number) => {
    setAreas((prev) => [...prev, { id: nextAreaId, shape: 'image', area }]);
    setNextAreaId((prev) => prev + 1);
  };

  const addEmptyArea = () => {
    setAreas((prev) => [...prev, { id: nextAreaId, shape: shapeType, area: 0 }]);
    setNextAreaId((prev) => prev + 1);
  };

  const addManualArea = () => {
    const parsed = parseFloat(manualAreaInput);
    if (!parsed || parsed <= 0) {
      toast.error('Enter a valid area in sq ft');
      return;
    }
    setAreas((prev) => [...prev, { id: nextAreaId, shape: 'manual', area: parsed }]);
    setNextAreaId((prev) => prev + 1);
    setManualAreaInput('');
    try {
      logEvent('area.add_manual', { areaSqFt: parsed });
    } catch {}
    toast.success(`Added ${parsed.toFixed(1)} sq ft`);
  };

  const updateAreaValue = (id: number, area: number) => {
    setAreas((prev) => prev.map((item) => (item.id === id ? { ...item, area } : item)));
  };

  const removeArea = (id: number) => {
    setAreas((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCrackLengthDrawn = (length: number) => {
    setCrackLength((prev) => prev + length);
    toast.success(`Added ${length.toFixed(1)} ft to crack length`);
  };

  const toggleStripingColor = (color: StripingColor, checked: boolean) => {
    setStripingColors((prev) =>
      checked ? Array.from(new Set([...prev, color])) : prev.filter((value) => value !== color),
    );
  };

  const handlePremiumServiceChange = (service: string, value: boolean) => {
    switch (service) {
      case 'premiumEdgePushing':
        setPremiumEdgePushing(value);
        break;
      case 'premiumWeedKiller':
        setPremiumWeedKiller(value);
        break;
      case 'premiumCrackCleaning':
        setPremiumCrackCleaning(value);
        break;
      case 'premiumPowerWashing':
        setPremiumPowerWashing(value);
        break;
      case 'premiumDebrisRemoval':
        setPremiumDebrisRemoval(value);
        break;
      default:
        break;
    }
  };

  const addPremiumCustomService = (serviceId: string) => {
    const service = getServiceById(serviceId);
    if (!service) return;
    if (customServices.some((item) => item.name === service.name)) return;
    const newService: CustomService = {
      id: crypto.randomUUID(),
      name: service.name,
      type: service.unitType,
      unitPrice: service.defaultUnitPrice,
      quantity: service.unitType === 'perUnit' ? 1 : undefined,
    };
    setCustomServices((prev) => [...prev, newService]);
  };

  const handleCalculate = () => {
    if (totalArea <= 0) {
      toast.error('Please add an area measurement');
      return;
    }

    const inputs: ProjectInputs = {
      jobName,
      customerAddress,
      totalArea,
      numCoats,
      sandAdded,
      polymerAdded,
      crackLength,
      crackWidth,
      crackDepth,
      stripingLines,
      stripingHandicap,
      stripingArrowsLarge,
      stripingArrowsSmall,
      stripingLettering,
      stripingCurb,
      stripingColors,
      prepHours,
      oilSpots,
      propaneTanks,
      jobDistanceMiles: jobDistance,
      premiumEdgePushing,
      premiumWeedKiller,
      premiumCrackCleaning,
      premiumPowerWashing,
      premiumDebrisRemoval,
      includeCleaningRepair,
      includeSealcoating,
      includeStriping,
      sealerType,
      sandType,
      waterPercent,
      crackFillerProduct,
      customServices: customServices.map((service) => ({
        name: service.name,
        type: service.type,
        unitPrice: service.unitPrice,
        quantity: service.quantity,
      })),
    };

    const result = calculateProject(inputs, businessData);
    setCosts(result.costs);
    setBreakdown(result.breakdown);
    setShowResults(true);
    try {
      logEvent('estimate.calculated', {
        jobName: jobName || 'Job',
        totalArea,
        crackLength,
        includeSealcoating,
        includeStriping,
        includeCleaningRepair,
        numCustomServices: customServices.length,
        total: result.costs.total,
      });
    } catch {}

    const key = makeJobKey(jobName, customerAddress);
    void setJobStatus(key, 'estimated').then(() => setMapRefreshKey((value) => value + 1));
  };

  const handlePrint = () => {
    window.print();
  };

  const setOwnerMode = (enabled: boolean) => {
    setOwnerModeInternal(enabled);
    setFlag('ownerMode', enabled);
    setFlagVersion((version) => version + 1);
    try {
      logEvent('flags.ownerMode_toggled', { enabled });
    } catch {}
  };

  const toggleFeatureFlag = (flag: FeatureFlag, enabled: boolean) => {
    if (flag === 'ownerMode') {
      setOwnerMode(enabled);
      return;
    }
    setFlag(flag, enabled);
    setFlagVersion((version) => version + 1);
    try {
      logEvent('flags.toggle', { flag, enabled });
    } catch {}
  };

  const featureFlagValues = useMemo(
    () => ({
      imageAreaAnalyzer: isEnabled('imageAreaAnalyzer'),
      aiAssistant: isEnabled('aiAssistant'),
      pwa: isEnabled('pwa'),
      i18n: isEnabled('i18n'),
      receipts: isEnabled('receipts'),
      scheduler: isEnabled('scheduler'),
      optimizer: isEnabled('optimizer'),
      customerPortal: isEnabled('customerPortal'),
      observability: isEnabled('observability'),
      commandCenter: isEnabled('commandCenter'),
      tacticalMapV2: isEnabled('tacticalMapV2'),
      ownerMode,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flagVersion, ownerMode],
  );

  const business = {
    data: businessData,
    setData: setBusinessData,
  };

  const job: JobState = {
    name: jobName,
    setName: setJobName,
    address: customerAddress,
    setAddress: (value: string) => {
      setCustomerAddress(value);
      ensureJobPersisted(value, customerCoords);
    },
    coords: customerCoords,
    status: jobStatus,
    setStatus: (status: JobStatus) => {
      setJobStatusLocal(status);
      const key = makeJobKey(jobName, customerAddress);
      void setJobStatus(key, status).then(() => setMapRefreshKey((value) => value + 1));
    },
    competitor: jobCompetitor,
    setCompetitor: setJobCompetitor,
    distance: jobDistance,
    supplierDistance: supplierDist,
    businessAddress: BUSINESS_ADDRESS,
    supplierAddress: SUPPLIER_ADDRESS,
    businessCoords,
    supplierCoords,
    mapRefreshKey,
    handleAddressUpdate,
  };

  const areaState: AreaState = {
    items: areas,
    total: totalArea,
    shapeType,
    setShapeType,
    manualInput: manualAreaInput,
    setManualInput: setManualAreaInput,
    addEmpty: addEmptyArea,
    addManual: addManualArea,
    update: updateAreaValue,
    remove: removeArea,
    handleAreaDrawn,
    handleImageAreaDetected,
  };

  const crackState: CrackState = {
    length: crackLength,
    setLength: setCrackLength,
    width: crackWidth,
    setWidth: setCrackWidth,
    depth: crackDepth,
    setDepth: setCrackDepth,
    fillerProduct: crackFillerProduct,
    handleCrackLengthDrawn,
  };

  const materialState: MaterialState = {
    numCoats,
    setNumCoats,
    sandAdded,
    setSandAdded,
    polymerAdded,
    setPolymerAdded,
    sealerType,
    setSealerType,
    sandType,
    setSandType,
    waterPercent,
    setWaterPercent,
  };

  const stripingState: StripingState = {
    lines: stripingLines,
    setLines: setStripingLines,
    handicap: stripingHandicap,
    setHandicap: setStripingHandicap,
    arrowsLarge: stripingArrowsLarge,
    setArrowsLarge: setStripingArrowsLarge,
    arrowsSmall: stripingArrowsSmall,
    setArrowsSmall: setStripingArrowsSmall,
    lettering: stripingLettering,
    setLettering: setStripingLettering,
    curb: stripingCurb,
    setCurb: setStripingCurb,
    colors: stripingColors,
    toggleColor: toggleStripingColor,
  };

  const logisticsState: LogisticsState = {
    oilSpots,
    setOilSpots,
    propaneTanks,
    setPropaneTanks,
    prepHours,
    setPrepHours,
  };

  const optionsState: OptionsState = {
    includeCleaningRepair,
    setIncludeCleaningRepair,
    includeSealcoating,
    setIncludeSealcoating,
    includeStriping,
    setIncludeStriping,
  };

  const premiumState: PremiumState = {
    edgePushing: premiumEdgePushing,
    setEdgePushing: setPremiumEdgePushing,
    weedKiller: premiumWeedKiller,
    setWeedKiller: setPremiumWeedKiller,
    crackCleaning: premiumCrackCleaning,
    setCrackCleaning: setPremiumCrackCleaning,
    powerWashing: premiumPowerWashing,
    setPowerWashing: setPremiumPowerWashing,
    debrisRemoval: premiumDebrisRemoval,
    setDebrisRemoval: setPremiumDebrisRemoval,
    handlePremiumServiceChange,
  };

  const customServicesState: CustomServicesState = {
    items: customServices,
    setItems: setCustomServices,
    addFromCatalog: addPremiumCustomService,
    addedNames: addedServiceNames,
  };

  const calculationState: CalculationState = {
    showResults,
    costs,
    breakdown,
    handleCalculate,
    handlePrint,
  };

  const featureFlags: FeatureFlagState = {
    values: featureFlagValues,
    ownerMode,
    setOwnerMode,
    toggleFlag: toggleFeatureFlag,
    isEnabled: (flag: FeatureFlag) =>
      flag === 'ownerMode' ? ownerMode : featureFlagValues[flag as keyof typeof featureFlagValues],
  };

  return {
    business,
    job,
    areas: areaState,
    cracks: crackState,
    materials: materialState,
    striping: stripingState,
    logistics: logisticsState,
    options: optionsState,
    premium: premiumState,
    customServices: customServicesState,
    calculation: calculationState,
    featureFlags,
  };
}
