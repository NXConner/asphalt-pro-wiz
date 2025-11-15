export interface SupplierIntelRequest {
  materials?: string[];
  radiusMiles?: number;
  jobLocation?: { lat: number; lng: number };
  includeAiSummary?: boolean;
}

export interface SupplierPriceHistoryPoint {
  effectiveDate: string;
  unitPrice: number;
  currency: string;
}

export interface SupplierInsight {
  supplierId: string;
  supplierName: string;
  materialType: string;
  materialGrade: string | null;
  unitPrice: number;
  unitOfMeasure: string;
  currency: string;
  effectiveDate: string;
  confidence: number | null;
  source: string | null;
  trailing30DayAverage: number | null;
  sevenDayChangePercent: number | null;
  sampleCount: number;
  leadTimeDays: number | null;
  coverageRadiusMiles: number | null;
  reliabilityScore: number | null;
  contact: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  priceHistory: SupplierPriceHistoryPoint[];
}

export interface SupplierBestOffer {
  supplierId: string;
  supplierName: string;
  unitPrice: number;
  currency: string;
  leadTimeDays: number | null;
}

export interface SupplierIntelResponse {
  orgId: string;
  materials: string[];
  generatedAt: string;
  insights: SupplierInsight[];
  bestOffers: Record<string, SupplierBestOffer>;
  aiSummary: string | null;
}

export interface SupplierIntelHookParams extends SupplierIntelRequest {
  enabled?: boolean;
}
