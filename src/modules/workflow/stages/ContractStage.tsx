import { FileSignature, Printer, WalletMinimal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CustomerInvoice } from '@/components/CustomerInvoice';
import { DocumentGenerator } from '@/components/DocumentGenerator';
import type { EstimatorState } from '@/modules/estimate/useEstimatorState';

import { StagePanel } from '../components/StagePanel';

interface ContractStageProps {
  estimator: EstimatorState;
}

export function ContractStage({ estimator }: ContractStageProps) {
  return (
    <StagePanel
      title="Contract & Invoice"
      eyebrow="Step 06"
      subtitle="Generate proposals, attach compliance exhibits, collect signatures, and sync invoices to accounting systems."
      tone="var(--stage-contract)"
      toolbar={
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Print packet
          </Button>
          <Button type="button" className="gap-2">
            <FileSignature className="h-4 w-4" />
            Request signature
          </Button>
        </div>
      }
    >
      <DocumentGenerator estimator={estimator} />
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Payment preferences</p>
            <p className="text-xs text-white/60">
              ACH, card, or check — synced to {import.meta.env.VITE_INVOICE_PREFIX ?? 'PPS'} series.
            </p>
          </div>
          <Button type="button" variant="secondary" className="gap-2">
            <WalletMinimal className="h-4 w-4" />
            Collect deposit
          </Button>
        </div>
      </div>
      <CustomerInvoice estimator={estimator} />
    </StagePanel>
  );
}
