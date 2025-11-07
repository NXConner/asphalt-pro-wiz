import { describe, expect, it } from 'vitest';

import type { CustomService } from '@/components/CustomServices';
import type { CostBreakdown, Costs } from '@/lib/calculations';
import {
  buildEstimateDocumentContent,
  buildLineItemDrafts,
  roundCurrency,
} from '@/modules/estimate/persistence';

describe('estimate persistence helpers', () => {
  const baseCosts: Costs = {
    labor: 1200,
    sealcoat: 800,
    sand: 120,
    additives: 60,
    crackFiller: 90,
    propane: 35,
    primer: 40,
    striping: 220,
    travel: 55,
    premiumServices: 300,
    customServices: 150,
    overhead: 400,
    profit: 450,
    subtotal: 2950,
    total: 3800,
  };

  const breakdown: CostBreakdown[] = [
    { item: 'Total Area', value: '42000 sq ft' },
    { item: 'Fuel Cost', value: '$55.00' },
  ];

  const customServices: CustomService[] = [
    {
      id: 'svc-1',
      name: 'Power Sweeping',
      type: 'flat',
      unitPrice: 150,
    },
    {
      id: 'svc-2',
      name: 'Playground Repaint',
      type: 'perSqFt',
      unitPrice: 0.08,
      quantity: undefined,
    },
  ];

  it('buildLineItemDrafts maps currency-based costs into line item drafts', () => {
    const drafts = buildLineItemDrafts(baseCosts, breakdown, customServices);

    expect(drafts.find((item) => item.kind === 'labor')).toMatchObject({
      label: 'Labor',
      amount: roundCurrency(baseCosts.labor),
    });

    const customDraft = drafts.find((item) => item.kind === 'custom');
    expect(customDraft?.metadata).toMatchObject({
      services: [
        expect.objectContaining({ id: 'svc-1', unitPrice: 150 }),
        expect.objectContaining({ id: 'svc-2', type: 'perSqFt' }),
      ],
    });

    expect(drafts.map((item) => item.label)).toContain('Profit');
  });

  it('buildEstimateDocumentContent produces mission document summary', () => {
    const content = buildEstimateDocumentContent(
      {
        inputs: {
          jobName: 'Grace Fellowship',
          customerAddress: '123 Mission Dr',
          totalArea: 42000,
          numCoats: 2,
          sandAdded: true,
          polymerAdded: true,
          crackLength: 120,
          crackWidth: 0.5,
          crackDepth: 0.5,
          stripingLines: 120,
          stripingHandicap: 6,
          stripingArrowsLarge: 4,
          stripingArrowsSmall: 2,
          stripingLettering: 10,
          stripingCurb: 40,
          stripingColors: ['White'],
          prepHours: 8,
          oilSpots: 4,
          propaneTanks: 2,
          jobDistanceMiles: 32,
          premiumEdgePushing: false,
          premiumWeedKiller: true,
          premiumCrackCleaning: false,
          premiumPowerWashing: true,
          premiumDebrisRemoval: false,
          includeCleaningRepair: true,
          includeSealcoating: true,
          includeStriping: true,
          sealerType: 'PMM',
          sandType: 'Black Beauty',
          waterPercent: 0,
          customServices: customServices.map((svc) => ({
            name: svc.name,
            type: svc.type,
            unitPrice: svc.unitPrice,
            quantity: svc.quantity,
          })),
        },
        costs: baseCosts,
        breakdown,
        customServices,
        premium: {
          edgePushing: false,
          weedKiller: true,
          crackCleaning: false,
          powerWashing: true,
          debrisRemoval: false,
        },
        job: {
          name: 'Grace Fellowship – Lot Renewal',
          address: '123 Mission Dr',
          coords: [37.0, -79.0],
          status: 'estimated',
          distance: 32,
        },
      },
      [
        { id: 'weed-killer', enabled: true },
        { id: 'power-washing', enabled: true },
      ],
    );

    expect(content).toMatchObject({
      summary: expect.objectContaining({
        total: roundCurrency(baseCosts.total),
      }),
      customServices: expect.any(Array),
      premiumSelections: [
        { id: 'weed-killer', enabled: true },
        { id: 'power-washing', enabled: true },
      ],
    });
  });
});
