import type { CustomService } from '@/components/CustomServices';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import type {
  JobDocumentRow,
  JobPremiumServiceRow,
  JobRow,
  JobStatus,
  Tables,
} from '@/integrations/supabase/types';
import type { Json } from '@/integrations/supabase/types';
import type { CostBreakdown, Costs, ProjectInputs } from '@/lib/calculations';
import { logError, logEvent } from '@/lib/logging';
import { getCurrentUserId, resolveOrgId } from '@/lib/supabaseOrg';

type EstimateInsert = Tables['estimates']['Insert'];
type EstimateLineItemInsert = Tables['estimate_line_items']['Insert'];
type JobInsert = Tables['jobs']['Insert'];
type JobDocumentInsert = Tables['job_documents']['Insert'];
type JobPremiumServiceInsert = Tables['job_premium_services']['Insert'];

export interface PersistEstimateParams {
  inputs: ProjectInputs;
  costs: Costs;
  breakdown: CostBreakdown[];
  customServices: CustomService[];
  premium: {
    edgePushing: boolean;
    weedKiller: boolean;
    crackCleaning: boolean;
    powerWashing: boolean;
    debrisRemoval: boolean;
  };
  job: {
    name: string;
    address: string;
    coords: [number, number] | null;
    status: JobStatus;
    customerName?: string;
    competitor?: string;
    distance: number;
  };
}

export interface PersistEstimateResult {
  jobId?: string;
  estimateId?: string;
  documentId?: string;
}

export interface DocumentPayload {
  jobName: string;
  customerAddress: string;
  title: string;
  docType: string;
  htmlContent: string;
  markdownContent: string;
  schedule?: string;
  clientName?: string;
  notes?: string;
  priceSummary?: string;
}

const PREMIUM_SERVICE_IDS: Record<
  keyof PersistEstimateParams['premium'],
  JobPremiumServiceRow['service_id']
> = {
  edgePushing: 'edge-pushing',
  weedKiller: 'weed-killer',
  crackCleaning: 'crack-cleaning',
  powerWashing: 'power-washing',
  debrisRemoval: 'debris-removal',
};

export type LineItemDraft = Omit<EstimateLineItemInsert, 'estimate_id' | 'id'>;

const CURRENCY_KEYS: Array<{
  key: keyof Costs;
  kind: string;
  label: string;
}> = [
  { key: 'labor', kind: 'labor', label: 'Labor' },
  { key: 'sealcoat', kind: 'material', label: 'Sealcoat' },
  { key: 'sand', kind: 'material', label: 'Sand' },
  { key: 'additives', kind: 'material', label: 'Additives' },
  { key: 'crackFiller', kind: 'material', label: 'Crack Filler' },
  { key: 'propane', kind: 'logistics', label: 'Propane' },
  { key: 'primer', kind: 'material', label: 'Primer / Prep' },
  { key: 'striping', kind: 'striping', label: 'Striping' },
  { key: 'travel', kind: 'logistics', label: 'Travel' },
  { key: 'premiumServices', kind: 'premium', label: 'Premium Services' },
  { key: 'customServices', kind: 'custom', label: 'Custom Services' },
  { key: 'overhead', kind: 'overhead', label: 'Overhead' },
  { key: 'profit', kind: 'profit', label: 'Profit' },
];

export const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function buildLineItemDrafts(
  costs: Costs,
  breakdown: CostBreakdown[],
  customServices: CustomService[],
): LineItemDraft[] {
  const drafts: LineItemDraft[] = [];

  for (const { key, kind, label } of CURRENCY_KEYS) {
    const amount = costs[key];
    if (!amount || Math.abs(amount) < 0.01) continue;
    drafts.push({
      kind,
      label,
      amount: roundCurrency(amount),
      metadata:
        key === 'customServices'
          ? {
              services: customServices.map((svc) => ({
                id: svc.id,
                name: svc.name,
                type: svc.type,
                unitPrice: roundCurrency(svc.unitPrice || 0),
                quantity: svc.quantity ?? null,
              })),
            }
          : kind === 'material'
            ? {
                detail: breakdown
                  .filter((item) =>
                    item.item.toLowerCase().includes(label.split(' ')[0].toLowerCase()),
                  )
                  .slice(0, 3),
              }
            : null,
    });
  }

  return drafts;
}

export function buildEstimateDocumentContent(
  params: PersistEstimateParams,
  premiumSelections: Array<{ id: string; enabled: boolean }>,
): Json {
  const {
    inputs,
    costs,
    breakdown,
    customServices,
    job: { name, address },
  } = params;
  const generatedAt = new Date().toISOString();

  return {
    version: 1,
    generatedAt,
    job: {
      name,
      address,
      totalArea: inputs.totalArea,
      coatCount: inputs.numCoats,
    },
    summary: {
      subtotal: roundCurrency(costs.subtotal),
      overhead: roundCurrency(costs.overhead),
      profit: roundCurrency(costs.profit),
      total: roundCurrency(costs.total),
    },
    breakdown,
    premiumSelections,
    customServices: customServices.map((svc) => ({
      id: svc.id,
      name: svc.name,
      type: svc.type,
      unitPrice: roundCurrency(svc.unitPrice),
      quantity: svc.quantity ?? null,
    })),
    inputs,
    costs,
  };
}

export async function persistEstimateResult(
  params: PersistEstimateParams,
): Promise<PersistEstimateResult> {
  if (!isSupabaseConfigured) {
    return {};
  }

  try {
    const userId = await getCurrentUserId();
    const orgId = await resolveOrgId();
    if (!orgId) {
      throw new Error('Unable to determine an organization for the current user.');
    }

    const job = await upsertJob(orgId, userId, params);
    const estimate = await insertEstimate(job.id, userId, params);
    await syncLineItems(estimate.id, params);
    const documentId = await upsertEstimateDocument(job.id, userId, params, estimate.id);
    await syncPremiumSelections(job.id, params);

    logEvent('estimate.persisted', {
      jobId: job.id,
      estimateId: estimate.id,
      total: params.costs.total,
    });

    return { jobId: job.id, estimateId: estimate.id, documentId };
  } catch (error) {
    logError(error, { source: 'estimate.persist', inputs: params.inputs?.jobName });
    throw error;
  }
}

export async function saveEstimateDocument(payload: DocumentPayload): Promise<string | undefined> {
  if (!isSupabaseConfigured) {
    return undefined;
  }

  try {
    const userId = await getCurrentUserId();
    const orgId = await resolveOrgId();
    if (!orgId) throw new Error('Unable to resolve organization for document upload.');

    const jobId = await findJobId(orgId, payload.jobName, payload.customerAddress);
    if (!jobId) throw new Error('No matching job found for document upload.');

    const documentContent: Json = {
      version: 1,
      generatedAt: new Date().toISOString(),
      docType: payload.docType,
      html: payload.htmlContent,
      markdown: payload.markdownContent,
      clientName: payload.clientName ?? null,
      schedule: payload.schedule ?? null,
      notes: payload.notes ?? null,
      priceSummary: payload.priceSummary ?? null,
    };

    const existing = await supabase
      .from('job_documents')
      .select<'job_documents', JobDocumentRow>('id')
      .eq('job_id', jobId)
      .eq('title', payload.title)
      .limit(1)
      .maybeSingle();

    if (existing.error) throw existing.error;

    const metadata: Json = {
      docType: payload.docType,
      source: 'document_generator',
    };

    if (existing.data) {
      const { error, data } = await supabase
        .from('job_documents')
        .update({
          kind: 'mission_document',
          content: documentContent,
          metadata,
          created_by: userId,
        })
        .eq('id', existing.data.id)
        .select<'job_documents', JobDocumentRow>('id')
        .single();

      if (error) throw error;
      logEvent('estimate.document_updated', { documentId: data.id, jobId });
      return data.id;
    }

    const { error, data } = await supabase
      .from('job_documents')
      .insert<JobDocumentInsert>({
        job_id: jobId,
        title: payload.title,
        kind: 'mission_document',
        content: documentContent,
        metadata,
        created_by: userId,
      })
      .select<'job_documents', JobDocumentRow>('id')
      .single();

    if (error) throw error;
    logEvent('estimate.document_created', { documentId: data.id, jobId });
    return data.id;
  } catch (error) {
    logError(error, { source: 'estimate.document', title: payload.title });
    throw error;
  }
}

async function findJobId(orgId: string, name: string, address: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select<'jobs', Pick<JobRow, 'id'>>('id')
    .eq('org_id', orgId)
    .eq('name', name || '')
    .eq('customer_address', address || null)
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return data?.id ?? null;
}

async function upsertJob(orgId: string, userId: string | null, params: PersistEstimateParams) {
  const existingId = await findJobId(orgId, params.job.name, params.job.address);

  const payload: JobInsert = {
    org_id: orgId,
    name: params.job.name || 'Untitled Mission',
    customer_name: params.job.customerName ?? null,
    customer_address: params.job.address || null,
    customer_latitude: params.job.coords?.[0] ?? null,
    customer_longitude: params.job.coords?.[1] ?? null,
    status: params.job.status ?? 'estimated',
    total_area_sqft: params.inputs.totalArea,
    created_by: userId,
    updated_at: new Date().toISOString(),
  };

  if (existingId) {
    const { error } = await supabase.from('jobs').update(payload).eq('id', existingId);
    if (error) throw error;
    return { id: existingId };
  }

  const { data, error } = await supabase
    .from('jobs')
    .insert(payload)
    .select<'jobs', Pick<JobRow, 'id'>>('id')
    .single();

  if (error) throw error;
  return { id: data.id };
}

async function insertEstimate(jobId: string, userId: string | null, params: PersistEstimateParams) {
  const estimatePayload: EstimateInsert = {
    job_id: jobId,
    prepared_by: userId,
    inputs: params.inputs,
    costs: params.costs,
    subtotal: roundCurrency(params.costs.subtotal),
    overhead: roundCurrency(params.costs.overhead),
    profit: roundCurrency(params.costs.profit),
    total: roundCurrency(params.costs.total),
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('estimates')
    .insert(estimatePayload)
    .select<'estimates', Pick<EstimateInsert, 'id'>>('id')
    .single();

  if (error) throw error;
  return { id: data.id as string };
}

async function syncLineItems(estimateId: string, params: PersistEstimateParams) {
  const drafts = buildLineItemDrafts(params.costs, params.breakdown, params.customServices);
  if (drafts.length === 0) return;

  const rows: EstimateLineItemInsert[] = drafts.map((draft) => ({
    ...draft,
    estimate_id: estimateId,
  }));

  const { error } = await supabase.from('estimate_line_items').insert(rows);
  if (error) throw error;
}

async function upsertEstimateDocument(
  jobId: string,
  userId: string | null,
  params: PersistEstimateParams,
  estimateId: string,
) {
  const premiumSelections = Object.entries(params.premium).map(([key, enabled]) => ({
    id: PREMIUM_SERVICE_IDS[key as keyof typeof PREMIUM_SERVICE_IDS],
    enabled,
  }));

  const content = buildEstimateDocumentContent(params, premiumSelections);

  const { data: existing, error: existingError } = await supabase
    .from('job_documents')
    .select<'job_documents', Pick<JobDocumentRow, 'id'>>('id')
    .eq('job_id', jobId)
    .eq('kind', 'estimate_summary')
    .limit(1)
    .maybeSingle();

  if (existingError && existingError.code !== 'PGRST116') throw existingError;

  const metadata: Json = {
    version: 1,
    estimateId,
  };

  if (existing?.id) {
    const { error, data } = await supabase
      .from('job_documents')
      .update({
        title: `Estimate Summary - ${params.job.name || 'Mission'}`,
        content,
        metadata,
        created_by: userId,
      })
      .eq('id', existing.id)
      .select<'job_documents', Pick<JobDocumentRow, 'id'>>('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  const { data, error } = await supabase
    .from('job_documents')
    .insert<JobDocumentInsert>({
      job_id: jobId,
      title: `Estimate Summary - ${params.job.name || 'Mission'}`,
      kind: 'estimate_summary',
      content,
      metadata,
      created_by: userId,
    })
    .select<'job_documents', Pick<JobDocumentRow, 'id'>>('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function syncPremiumSelections(jobId: string, params: PersistEstimateParams) {
  const rows: JobPremiumServiceInsert[] = (
    Object.keys(params.premium) as Array<keyof PersistEstimateParams['premium']>
  ).map((key) => ({
    job_id: jobId,
    service_id: PREMIUM_SERVICE_IDS[key],
    enabled: params.premium[key],
    metadata: {
      updatedAt: new Date().toISOString(),
      source: 'estimator',
    },
  }));

  if (rows.length === 0) return;

  const { error } = await supabase
    .from('job_premium_services')
    .upsert(rows, { onConflict: 'job_id,service_id' });

  if (error) throw error;
}
