export interface BusinessData {
  laborRate: number;
  employees: number;
  sealcoatPrice: number;
  sandPrice: number;
  fastDryPrice: number;
  prepSealPrice: number;
  crackFillerPrice: number;
  propanePrice: number;
  gasPrice: number;
  chevyMPG: number;
  dodgeMPG: number;
  sealCoatCoverage1: number;
  sealCoatCoverage2: number;
  sealCoatCoverage3: number;
  sandRatio: number;
  crackSealingSpeed: number;
  sealcoatingSpeed1: number;
  sealcoatingSpeed2: number;
  striping: {
    line: number;
    handicap: number;
    arrowLarge: number;
    arrowSmall: number;
    lettering: number;
    curb: number;
  };
}

export const defaultBusinessData: BusinessData = {
  laborRate: 20.00,
  employees: 3,
  sealcoatPrice: 3.65,
  sandPrice: 10.00,
  fastDryPrice: 50.00,
  prepSealPrice: 50.00,
  crackFillerPrice: 44.99,
  propanePrice: 10.00,
  gasPrice: 2.901,
  chevyMPG: 8,
  dodgeMPG: 15,
  sealCoatCoverage1: 0.0144,
  sealCoatCoverage2: 0.0111,
  sealCoatCoverage3: 0.0111,
  sandRatio: 2,
  crackSealingSpeed: 300,
  sealcoatingSpeed1: 5000,
  sealcoatingSpeed2: 12000,
  striping: {
    line: 4.50,
    handicap: 25.00,
    arrowLarge: 20.00,
    arrowSmall: 15.00,
    lettering: 5.00,
    curb: 2.00
  }
};

export interface ProjectInputs {
  jobName: string;
  customerAddress: string;
  totalArea: number;
  numCoats: number;
  sandAdded: boolean;
  polymerAdded: boolean;
  crackLength: number;
  crackWidth: number;
  crackDepth: number;
  stripingLines: number;
  stripingHandicap: number;
  stripingArrowsLarge: number;
  stripingArrowsSmall: number;
  stripingLettering: number;
  stripingCurb: number;
  prepHours: number;
  oilSpots: number;
  propaneTanks: number;
  jobDistanceMiles: number;
}

export interface CostBreakdown {
  item: string;
  value: string;
}

export interface Costs {
  labor: number;
  sealcoat: number;
  sand: number;
  additives: number;
  crackFiller: number;
  propane: number;
  primer: number;
  striping: number;
  travel: number;
  total: number;
}

export function calculateDistance(coords1: [number, number], coords2: [number, number]): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = (coords2[0] - coords1[0]) * Math.PI / 180;
  const dLon = (coords2[1] - coords1[1]) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coords1[0] * Math.PI / 180) * Math.cos(coords2[0] * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateProject(inputs: ProjectInputs, businessData: BusinessData): { costs: Costs; breakdown: CostBreakdown[] } {
  const costs: Costs = {
    labor: 0,
    sealcoat: 0,
    sand: 0,
    additives: 0,
    crackFiller: 0,
    propane: 0,
    primer: 0,
    striping: 0,
    travel: 0,
    total: 0
  };

  const breakdown: CostBreakdown[] = [];

  // Area
  breakdown.push({ item: 'Total Area', value: `${inputs.totalArea.toFixed(0)} sq ft` });

  // Travel costs
  const businessCoords: [number, number] = [36.7388, -80.2692];
  const supplierCoords: [number, number] = [36.3871, -79.9578];
  const supplierDist = calculateDistance(businessCoords, supplierCoords) * 2;
  const totalDist = supplierDist + inputs.jobDistanceMiles;
  costs.travel = ((totalDist / businessData.chevyMPG) + (inputs.jobDistanceMiles / businessData.dodgeMPG)) * businessData.gasPrice;
  breakdown.push({ item: 'Fuel Cost', value: `$${costs.travel.toFixed(2)}` });

  // Sealcoat
  const sealerGals = 
    (inputs.totalArea * businessData.sealCoatCoverage1) +
    (inputs.numCoats > 1 ? inputs.totalArea * businessData.sealCoatCoverage2 : 0) +
    (inputs.numCoats > 2 ? inputs.totalArea * businessData.sealCoatCoverage3 : 0);
  costs.sealcoat = sealerGals * businessData.sealcoatPrice;
  breakdown.push({ item: `Sealcoat (${inputs.numCoats} Coat/s)`, value: `${sealerGals.toFixed(1)} gal → $${costs.sealcoat.toFixed(2)}` });

  // Sand
  if (inputs.sandAdded) {
    const sandBags = Math.ceil((sealerGals * businessData.sandRatio) / 50);
    costs.sand = sandBags * businessData.sandPrice;
    breakdown.push({ item: 'Sand', value: `${sandBags} bags → $${costs.sand.toFixed(2)}` });
  }

  // Fast-dry additive
  if (inputs.polymerAdded) {
    const buckets = Math.ceil(sealerGals / 100);
    costs.additives = buckets * businessData.fastDryPrice;
    breakdown.push({ item: 'Fast-Dry Additive', value: `${buckets} bucket(s) → $${costs.additives.toFixed(2)}` });
  }

  // Crack filling
  if (inputs.crackLength > 0) {
    const boxes = Math.ceil((inputs.crackLength * 12 * inputs.crackWidth * inputs.crackDepth) / 3000);
    costs.crackFiller = boxes * businessData.crackFillerPrice;
    breakdown.push({ item: 'Crack Filler', value: `${boxes} box(es) → $${costs.crackFiller.toFixed(2)}` });

    costs.propane = inputs.propaneTanks * businessData.propanePrice;
    breakdown.push({ item: 'Propane Tanks', value: `${inputs.propaneTanks} → $${costs.propane.toFixed(2)}` });
  }

  // Striping
  costs.striping =
    inputs.stripingLines * businessData.striping.line +
    inputs.stripingHandicap * businessData.striping.handicap +
    inputs.stripingArrowsLarge * businessData.striping.arrowLarge +
    inputs.stripingArrowsSmall * businessData.striping.arrowSmall +
    inputs.stripingLettering * businessData.striping.lettering +
    inputs.stripingCurb * businessData.striping.curb;
  
  if (costs.striping > 0) {
    breakdown.push({ item: 'Striping', value: `$${costs.striping.toFixed(2)}` });
  }

  // Oil spot primer
  if (inputs.oilSpots > 0) {
    const buckets = Math.ceil(inputs.oilSpots / 50);
    costs.primer = buckets * businessData.prepSealPrice;
    breakdown.push({ item: 'Oil Spot Primer', value: `${buckets} bucket(s) → $${costs.primer.toFixed(2)}` });
  }

  // Labor
  let sealHours = 0;
  if (inputs.numCoats >= 1) sealHours += inputs.totalArea / businessData.sealcoatingSpeed1;
  if (inputs.numCoats >= 2) sealHours += inputs.totalArea / businessData.sealcoatingSpeed2;
  if (inputs.numCoats >= 3) sealHours += inputs.totalArea / businessData.sealcoatingSpeed2;
  
  const totalHours = inputs.prepHours + sealHours + (inputs.crackLength / businessData.crackSealingSpeed) + (inputs.jobDistanceMiles / 45);
  costs.labor = totalHours * businessData.employees * businessData.laborRate;
  breakdown.push({ item: 'Labor', value: `${totalHours.toFixed(1)} hrs → $${costs.labor.toFixed(2)}` });

  // Total
  costs.total = Object.values(costs).reduce((sum, val) => sum + val, 0);

  return { costs, breakdown };
}
