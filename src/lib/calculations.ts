export interface BusinessData {
  laborRate: number;
  employees: number;
  overheadPercent: number;
  profitPercent: number;
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
  premiumServices: {
    edgePushing: number;
    weedKiller: number;
    crackCleaning: number;
    powerWashing: number;
    debrisRemoval: number;
  };
}

export const defaultBusinessData: BusinessData = {
  laborRate: 25.00,
  employees: 3,
  overheadPercent: 25,
  profitPercent: 25,
  sealcoatPrice: 3.65,
  sandPrice: 10.00,
  fastDryPrice: 140.00,
  prepSealPrice: 50.00,
  crackFillerPrice: 44.95,
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
  },
  premiumServices: {
    edgePushing: 150.00,
    weedKiller: 75.00,
    crackCleaning: 100.00,
    powerWashing: 200.00,
    debrisRemoval: 125.00,
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
  oilSpots: number;
  propaneTanks: number;
  jobDistanceMiles: number;
  premiumEdgePushing: boolean;
  premiumWeedKiller: boolean;
  premiumCrackCleaning: boolean;
  premiumPowerWashing: boolean;
  premiumDebrisRemoval: boolean;
  includeCleaningRepair: boolean;
  includeSealcoating: boolean;
  includeStriping: boolean;
  customServices?: Array<{
    name: string;
    type: 'flat' | 'perUnit' | 'perSqFt' | 'perLinearFt';
    unitPrice: number;
    quantity?: number;
  }>;
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
  premiumServices: number;
  customServices: number;
  subtotal: number;
  overhead: number;
  profit: number;
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
    premiumServices: 0,
    customServices: 0,
    subtotal: 0,
    overhead: 0,
    profit: 0,
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

  // Sealcoat (only if includeSealcoating is true)
  if (inputs.includeSealcoating) {
    const sealerGals = 
      (inputs.totalArea * businessData.sealCoatCoverage1) +
      (inputs.numCoats > 1 ? inputs.totalArea * businessData.sealCoatCoverage2 : 0) +
      (inputs.numCoats > 2 ? inputs.totalArea * businessData.sealCoatCoverage3 : 0);
    costs.sealcoat = sealerGals * businessData.sealcoatPrice;
    breakdown.push({ item: `Sealcoat (${inputs.numCoats} Coat/s)`, value: `${sealerGals.toFixed(1)} gal → $${costs.sealcoat.toFixed(2)}` });
  }

  // Sand
  if (inputs.includeSealcoating && inputs.sandAdded) {
    const sealerGals = 
      (inputs.totalArea * businessData.sealCoatCoverage1) +
      (inputs.numCoats > 1 ? inputs.totalArea * businessData.sealCoatCoverage2 : 0) +
      (inputs.numCoats > 2 ? inputs.totalArea * businessData.sealCoatCoverage3 : 0);
    const sandBags = Math.ceil((sealerGals * businessData.sandRatio) / 50);
    costs.sand = sandBags * businessData.sandPrice;
    breakdown.push({ item: 'Sand', value: `${sandBags} bags → $${costs.sand.toFixed(2)}` });
  }

  // Fast-dry additive
  if (inputs.includeSealcoating && inputs.polymerAdded) {
    const sealerGals = 
      (inputs.totalArea * businessData.sealCoatCoverage1) +
      (inputs.numCoats > 1 ? inputs.totalArea * businessData.sealCoatCoverage2 : 0) +
      (inputs.numCoats > 2 ? inputs.totalArea * businessData.sealCoatCoverage3 : 0);
    const buckets = Math.ceil(sealerGals / 100);
    costs.additives = buckets * businessData.fastDryPrice;
    breakdown.push({ item: 'Fast-Dry Additive', value: `${buckets} bucket(s) → $${costs.additives.toFixed(2)}` });
  }

  // Crack filling (only if includeCleaningRepair is true)
  if (inputs.includeCleaningRepair && inputs.crackLength > 0) {
    const boxes = Math.ceil((inputs.crackLength * 12 * inputs.crackWidth * inputs.crackDepth) / 3000);
    costs.crackFiller = boxes * businessData.crackFillerPrice;
    breakdown.push({ item: 'Crack Filler', value: `${boxes} box(es) → $${costs.crackFiller.toFixed(2)}` });

    costs.propane = inputs.propaneTanks * businessData.propanePrice;
    breakdown.push({ item: 'Propane Tanks', value: `${inputs.propaneTanks} → $${costs.propane.toFixed(2)}` });
  }

  // Striping (only if includeStriping is true)
  if (inputs.includeStriping) {
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
  }

  // Oil spot primer (only if includeSealcoating is true)
  if (inputs.includeSealcoating && inputs.oilSpots > 0) {
    const buckets = Math.ceil(inputs.oilSpots / 50);
    costs.primer = buckets * businessData.prepSealPrice;
    breakdown.push({ item: 'Oil Spot Primer', value: `${buckets} bucket(s) → $${costs.primer.toFixed(2)}` });
  }

  // Premium Services
  if (inputs.premiumEdgePushing) {
    costs.premiumServices += businessData.premiumServices.edgePushing;
    breakdown.push({ item: 'Edge Pushing', value: `$${businessData.premiumServices.edgePushing.toFixed(2)}` });
  }
  if (inputs.premiumWeedKiller) {
    costs.premiumServices += businessData.premiumServices.weedKiller;
    breakdown.push({ item: 'Weed Killer Application', value: `$${businessData.premiumServices.weedKiller.toFixed(2)}` });
  }
  if (inputs.premiumCrackCleaning) {
    costs.premiumServices += businessData.premiumServices.crackCleaning;
    breakdown.push({ item: 'Professional Crack Cleaning', value: `$${businessData.premiumServices.crackCleaning.toFixed(2)}` });
  }
  if (inputs.premiumPowerWashing) {
    costs.premiumServices += businessData.premiumServices.powerWashing;
    breakdown.push({ item: 'Power Washing', value: `$${businessData.premiumServices.powerWashing.toFixed(2)}` });
  }
  if (inputs.premiumDebrisRemoval) {
    costs.premiumServices += businessData.premiumServices.debrisRemoval;
    breakdown.push({ item: 'Debris Removal', value: `$${businessData.premiumServices.debrisRemoval.toFixed(2)}` });
  }

  // Custom Services
  if (inputs.customServices && inputs.customServices.length > 0) {
    for (const svc of inputs.customServices) {
      let qty = 1;
      switch (svc.type) {
        case 'flat':
          qty = 1;
          break;
        case 'perUnit':
          qty = Math.max(0, svc.quantity ?? 0);
          break;
        case 'perSqFt':
          qty = inputs.totalArea;
          break;
        case 'perLinearFt':
          qty = inputs.crackLength;
          break;
      }
      const cost = svc.unitPrice * qty;
      costs.customServices += cost;
      breakdown.push({ item: `Custom: ${svc.name}`, value: `$${cost.toFixed(2)}` });
    }
  }

  // Labor
  let sealHours = 0;
  if (inputs.includeSealcoating) {
    if (inputs.numCoats >= 1) sealHours += inputs.totalArea / businessData.sealcoatingSpeed1;
    if (inputs.numCoats >= 2) sealHours += inputs.totalArea / businessData.sealcoatingSpeed2;
    if (inputs.numCoats >= 3) sealHours += inputs.totalArea / businessData.sealcoatingSpeed2;
  }

  // Automatic preparation time per selected service
  // Crack repair prep: at least 1 hr if any crack work, scale with length (~600 ft/hr prep rate)
  const crackPrepHours = (inputs.includeCleaningRepair && inputs.crackLength > 0)
    ? Math.max(1, inputs.crackLength / 600)
    : 0;
  // Sealcoating prep: at least 1 hr for staging/blowing/edges, scale with area (~10k sq ft/hr prep rate)
  const sealPrepHours = inputs.includeSealcoating
    ? Math.max(1, inputs.totalArea / 10000)
    : 0;
  // Striping prep: at least 1 hr if any striping items selected (layout, chalking, cleaning)
  const totalStripingItems = inputs.stripingLines + inputs.stripingHandicap + inputs.stripingArrowsLarge + inputs.stripingArrowsSmall + inputs.stripingLettering + (inputs.stripingCurb > 0 ? 1 : 0);
  const stripingPrepHours = inputs.includeStriping && totalStripingItems > 0
    ? 1
    : 0;
  const prepLaborHours = crackPrepHours + sealPrepHours + stripingPrepHours;

  // Only count crack repair labor when that category is selected
  const crackLaborHours = inputs.includeCleaningRepair
    ? (inputs.crackLength / businessData.crackSealingSpeed)
    : 0;

  // Simple assumption: average 45 mph for travel time to/from job
  const travelHours = inputs.jobDistanceMiles / 45;

  const totalHours = prepLaborHours + sealHours + crackLaborHours + travelHours;
  costs.labor = totalHours * businessData.employees * businessData.laborRate;
  breakdown.push({
    item: `Labor (${businessData.employees} employees @ $${businessData.laborRate}/hr)`,
    value: `${totalHours.toFixed(1)} hrs (Prep: ${prepLaborHours.toFixed(1)} [C:${crackPrepHours.toFixed(1)} S:${sealPrepHours.toFixed(1)} L:${stripingPrepHours.toFixed(1)}], Seal: ${sealHours.toFixed(1)}, Crack: ${crackLaborHours.toFixed(1)}, Travel: ${travelHours.toFixed(1)}) → $${costs.labor.toFixed(2)}`
  });

  // Subtotal (before overhead and profit)
  costs.subtotal = costs.labor + costs.sealcoat + costs.sand + costs.additives + costs.crackFiller + costs.propane + costs.primer + costs.striping + costs.travel + costs.premiumServices + costs.customServices;
  
  // Overhead
  costs.overhead = costs.subtotal * (businessData.overheadPercent / 100);
  breakdown.push({ item: `Overhead (${businessData.overheadPercent}%)`, value: `$${costs.overhead.toFixed(2)}` });
  
  // Profit
  costs.profit = costs.subtotal * (businessData.profitPercent / 100);
  breakdown.push({ item: `Profit Margin (${businessData.profitPercent}%)`, value: `$${costs.profit.toFixed(2)}` });

  // Total
  costs.total = costs.subtotal + costs.overhead + costs.profit;

  return { costs, breakdown };
}
