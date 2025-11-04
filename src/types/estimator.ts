/**
 * Centralized type definitions for estimator module
 */

export type AreaShape = 'rectangle' | 'triangle' | 'circle' | 'drawn' | 'manual' | 'image';

export type JobStatus = 'pending' | 'inProgress' | 'completed' | 'archived';

export type StripingColor = 'White' | 'Blue' | 'Yellow' | 'Red' | 'Green';

export type SealerType = 'Acrylic' | 'Asphalt Emulsion' | 'Coal Tar' | 'PMM' | 'Other';

export type SandType = 'Black Beauty' | 'Black Diamond' | 'Other';

export interface AreaItem {
  id: number;
  shape: AreaShape;
  area: number;
}

export interface JobData {
  name: string;
  address: string;
  coords: [number, number] | null;
  status: JobStatus;
  competitor: string;
  distance: number;
  supplierDistance: number;
  businessAddress: string;
  supplierAddress: string;
  businessCoords: [number, number];
  supplierCoords: [number, number];
}

export interface MaterialData {
  numCoats: number;
  sandAdded: boolean;
  polymerAdded: boolean;
  sealerType: SealerType;
  sandType: SandType;
  waterPercent: number;
}

export interface CrackData {
  length: number;
  width: number;
  depth: number;
  fillerProduct: string;
}

export interface StripingData {
  lines: number;
  handicap: number;
  arrowsLarge: number;
  arrowsSmall: number;
  lettering: number;
  curb: number;
  color: StripingColor;
}

export interface PremiumServices {
  edgePushing: boolean;
  weedKiller: boolean;
  crackCleaning: boolean;
  powerWashing: boolean;
  debrisRemoval: boolean;
}

export interface ServiceFlags {
  includeCleaningRepair: boolean;
  includeSealcoating: boolean;
  includeStriping: boolean;
}

export interface CustomService {
  id: string;
  name: string;
  price: number;
  category?: string;
}

export interface CostBreakdown {
  item: string;
  value: string;
}

export interface Costs {
  labor: number;
  materials: number;
  sealcoat: number;
  striping: number;
  crack: number;
  travel: number;
  premiums: number;
  custom: number;
  subtotal: number;
  overhead: number;
  profit: number;
  total: number;
}

export interface ProjectCalculation {
  costs: Costs | null;
  breakdown: CostBreakdown[];
  showResults: boolean;
}
