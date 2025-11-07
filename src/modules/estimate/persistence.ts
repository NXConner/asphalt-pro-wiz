import type { CustomService } from '@/components/CustomServices';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import type { Json, Database } from '@/integrations/supabase/types';
import type { CostBreakdown, Costs, ProjectInputs } from '@/lib/calculations';
import { logError, logEvent } from '@/lib/logging';
import { getCurrentUserId, resolveOrgId } from '@/lib/supabaseOrg';

// Job status type
export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'estimated';

// Type helpers for tables that may not be in generated types
type EstimateInsert = Database['public']['Tables']['estimates']['Insert'];
type EstimateLineItemInsert = Database['public']['Tables']['estimate_line_items']['Insert'];
type JobInsert = Database['public']['Tables']['jobs']['Insert'];

// Stub types for tables that may not exist in generated types
interface JobDocumentInsert {
  job_id: string;
  document_url: string;
  document_type: string;
  uploaded_by?: string;
}

interface JobPremiumServiceInsert {
  job_id: string;
  service_id: string;
  quantity?: number;
  price?: number;
  enabled?: boolean;
  metadata?: Record<string, any>;
}

interface JobPremiumServiceRow {
  id: string;
  job_id: string;
  service_id: string;
  quantity?: number;
  price?: number;
  enabled?: boolean;
  metadata?: Record<string, any>;
}

// Helper to satisfy Supabase Json type
const asJson = <T,>(v: T) => v as unknown as Json;

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

export type LineItemDraft = Partial<EstimateLineItemInsert> & {
  kind?: string;
  label?: string;
  amount?: number;
  metadata?: any;
};

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
              ? asJson({
                  services: customServices.map((svc) => ({
                    id: svc.id,
                    name: svc.name,
                    type: svc.type,
                    unitPrice: roundCurrency(svc.unitPrice || 0),
                    quantity: svc.quantity ?? null,
                  })),
                })
              : kind === 'material'
                ? asJson({
                    detail: breakdown
                      .filter((item) => item.item.toLowerCase().includes(label.split(' ')[0].toLowerCase()))
                      .slice(0, 3),
                  })
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

  return asJson({
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
  });
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

    const documentContent: Json = asJson({
      version: 1,
      generatedAt: new Date().toISOString(),
      docType: payload.docType,
      html: payload.htmlContent,
      markdown: payload.markdownContent,
      clientName: payload.clientName ?? null,
      schedule: payload.schedule ?? null,
      notes: payload.notes ?? null,
      priceSummary: payload.priceSummary ?? null,
    });

    const existing = await (supabase as any)
      .from('job_documents')
      .select('id')
      .eq('job_id', jobId)
      .eq('title', payload.title)
      .limit(1)
      .maybeSingle();

    if (existing.error) throw existing.error;

    const metadata: Json = asJson({
      docType: payload.docType,
      source: 'document_generator',
    });

    if ((existing as any).data) {
    const { error, data } = await (supabase as any)
      .from('job_documents')
      .update({
        kind: 'mission_document',
        content: documentContent,
        metadata,
        created_by: userId,
      })
      .eq('id', (existing as any).data.id)
      .select('id')
      .single();

      if (error) throw error;
      const docId = (data as any)?.id;
      if (!docId) throw new Error('Failed to update document');
      logEvent('estimate.document_updated', { documentId: docId, jobId });
      return docId;
    }

    const { error, data } = await (supabase as any)
      .from('job_documents')
      .insert({
        job_id: jobId,
        title: payload.title,
        kind: 'mission_document',
        content: documentContent,
        metadata,
        created_by: userId,
      })
      .select('id')
      .single();

    if (error) throw error;
    const docId = (data as any)?.id;
    if (!docId) throw new Error('Failed to create document');
    logEvent('estimate.document_created', { documentId: docId, jobId });
    return docId;
  } catch (error) {
    logError(error, { source: 'estimate.document', title: payload.title });
    throw error;
  }
}

async function findJobId(orgId: string, name: string, address: string) {
  const { data, error } = await (supabase
    .from('jobs') as any)
    .select('id')
    .eq('org_id', orgId)
    .eq('name', name || '')
    .eq('customer_address', address || null)
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return (data as any)?.id ?? null;
}

async function upsertJob(orgId: string, userId: string | null, params: PersistEstimateParams) {
  const existingId = await findJobId(orgId, params.job.name, params.job.address);

  const payload: any = {
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
    const { error } = await (supabase.from('jobs') as any).update(payload).eq('id', existingId);
    if (error) throw error;
    return { id: existingId };
  }

  const { data, error } = await (supabase
    .from('jobs') as any)
    .insert(payload)
    .select('id')
    .single();

  if (error) throw error;
  return { id: (data as any).id };
}

async function insertEstimate(jobId: string, userId: string | null, params: PersistEstimateParams) {
  const estimatePayload: any = {
    job_id: jobId,
    prepared_by: userId,
    inputs: asJson(params.inputs),
    costs: asJson(params.costs),
    subtotal: roundCurrency(params.costs.subtotal),
    overhead: roundCurrency(params.costs.overhead),
    profit: roundCurrency(params.costs.profit),
    total: roundCurrency(params.costs.total),
    created_at: new Date().toISOString(),
  };

  const { data, error } = await (supabase
    .from('estimates') as any)
    .insert(estimatePayload)
    .select('id')
    .single();

  if (error) throw error;
  return { id: (data as any).id as string };
}

async function syncLineItems(estimateId: string, params: PersistEstimateParams) {
  const drafts = buildLineItemDrafts(params.costs, params.breakdown, params.customServices);
  if (drafts.length === 0) return;

  const rows: any[] = drafts.map((draft) => ({
    estimate_id: estimateId,
    item_name: draft.label || 'Item',
    quantity: 1,
    unit: 'unit',
    unit_cost: draft.amount || 0,
    line_total: draft.amount || 0,
    ...draft,
  }));

  const { error } = await (supabase.from('estimate_line_items') as any).insert(rows);
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

    const { data: existing, error: existingError } = await (supabase as any)
      .from('job_documents')
    .select('id')
    .eq('job_id', jobId)
    .eq('kind', 'estimate_summary')
    .limit(1)
    .maybeSingle();

  if (existingError && existingError.code !== 'PGRST116') throw existingError;

  const metadata: Json = {
    version: 1,
    estimateId,
  };

  if ((existing as any)?.id) {
    const { error, data } = await (supabase as any)
      .from('job_documents')
      .update({
        title: `Estimate Summary - ${params.job.name || 'Mission'}`,
        content,
        metadata,
        created_by: userId,
      })
      .eq('id', (existing as any).id)
      .select('id')
      .single();

    if (error) throw error;
    return (data as any).id;
  }

  const { data, error } = await (supabase as any)
    .from('job_documents')
    .insert({
      job_id: jobId,
      title: `Estimate Summary - ${params.job.name || 'Mission'}`,
      kind: 'estimate_summary',
      content,
      metadata,
      created_by: userId,
    })
    .select('id')
    .single();

  if (error) throw error;
  return (data as any).id;
}

async function syncPremiumSelections(jobId: string, params: PersistEstimateParams) {
  const rows: JobPremiumServiceInsert[] = (
    Object.keys(params.premium) as Array<keyof PersistEstimateParams['premium']>
  ).map((key) => ({
    job_id: jobId,
    service_id: PREMIUM_SERVICE_IDS[key],
    enabled: params.premium[key],
    quantity: 1,
    price: 0,
    metadata: {
      updatedAt: new Date().toISOString(),
      source: 'estimator',
    },
  }));

  if (rows.length === 0) return;

  const { error } = await (supabase as any)
    .from('job_premium_services')
    .upsert(rows, { onConflict: 'job_id,service_id' });

  if (error) throw error;
}
