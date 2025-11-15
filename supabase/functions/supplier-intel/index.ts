import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

const INPUT_SCHEMA = z.object({
  orgId: z.string().uuid().optional(),
  materials: z.array(z.string().min(1).max(64)).max(12).optional(),
  radiusMiles: z.number().min(0).max(500).optional(),
  includeAiSummary: z.boolean().optional(),
  jobLocation: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
});

type SupplierPriceInsight = {
  org_id: string;
  supplier_id: string;
  supplier_name: string;
  lead_time_days: number | null;
  coverage_radius_miles: number | null;
  reliability_score: number | null;
  supplier_metadata: Record<string, unknown> | null;
  supplier_contact: Record<string, unknown> | null;
  material_type: string;
  material_grade: string | null;
  unit_price: number;
  unit_of_measure: string;
  currency: string;
  effective_date: string;
  confidence: number | null;
  source: string | null;
  price_metadata: Record<string, unknown> | null;
  trailing_30_day_avg: number | null;
  price_7_day_baseline: number | null;
  sample_count: number;
};

type SupplierPriceHistoryRow = {
  supplier_id: string;
  material_type: string;
  unit_price: number;
  currency: string;
  effective_date: string;
};

interface SupplierInsight {
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

interface SupplierPriceHistoryPoint {
  effectiveDate: string;
  unitPrice: number;
  currency: string;
}

interface SupplierIntelResponse {
  orgId: string;
  materials: string[];
  generatedAt: string;
  insights: SupplierInsight[];
  bestOffers: Record<
    string,
    { supplierId: string; supplierName: string; unitPrice: number; currency: string; leadTimeDays: number | null }
  >;
  aiSummary: string | null;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status, headers: JSON_HEADERS });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

function toHistorySeries(rows: SupplierPriceHistoryRow[], supplierId: string, materialType: string): SupplierPriceHistoryPoint[] {
  return rows
    .filter((row) => row.supplier_id === supplierId && row.material_type === materialType)
    .sort((a, b) => new Date(a.effective_date).getTime() - new Date(b.effective_date).getTime())
    .map((row) => ({
      effectiveDate: row.effective_date,
      unitPrice: Number(row.unit_price),
      currency: row.currency,
    }));
}

function computeSevenDayChangePercent(latest: number, baseline: number | null): number | null {
  if (!baseline || baseline <= 0) return null;
  const delta = latest - baseline;
  return Number(((delta / baseline) * 100).toFixed(2));
}

async function resolveOrgId(userId: string, explicitOrgId?: string | null): Promise<string | null> {
  if (explicitOrgId) return explicitOrgId;
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("user_org_memberships")
    .select("org_id")
    .eq("user_id", userId)
    .order("joined_at", { ascending: true })
    .limit(1);
  if (error) {
    console.error("[supplier-intel] failed to resolve org memberships", error);
    return null;
  }
  return data?.[0]?.org_id ?? null;
}

async function fetchInsights(orgId: string, materials: string[] | undefined): Promise<SupplierPriceInsight[]> {
  if (!supabase) return [];
  let query = supabase
    .from("supplier_price_insights")
    .select("*")
    .eq("org_id", orgId);
  if (materials && materials.length > 0) {
    query = query.in("material_type", materials);
  }
  query = query.order("material_type", { ascending: true }).order("unit_price", { ascending: true });

  const { data, error } = await query;
  if (error) {
    console.error("[supplier-intel] failed to load insights", error);
    throw error;
  }
  return data ?? [];
}

async function fetchHistory(orgId: string, materials: string[] | undefined): Promise<SupplierPriceHistoryRow[]> {
  if (!supabase) return [];
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  let query = supabase
    .from("supplier_pricing_snapshots")
    .select("supplier_id, material_type, unit_price, currency, effective_date")
    .eq("org_id", orgId)
    .gte("effective_date", since);
  if (materials && materials.length > 0) {
    query = query.in("material_type", materials);
  }
  query = query.order("effective_date", { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error("[supplier-intel] failed to load price history", error);
    throw error;
  }
  return data ?? [];
}

async function generateAiSummary(
  orgId: string,
  insights: SupplierInsight[],
  bestOffers: SupplierIntelResponse["bestOffers"],
  includeAiSummary: boolean,
): Promise<string | null> {
  if (!includeAiSummary || !geminiApiKey || insights.length === 0) {
    return null;
  }

  try {
    const topLines = insights
      .slice(0, 5)
      .map((insight) => ({
        supplier: insight.supplierName,
        material: insight.materialType,
        price: insight.unitPrice,
        currency: insight.currency,
        leadTimeDays: insight.leadTimeDays,
        sevenDayChangePercent: insight.sevenDayChangePercent,
        trailing30DayAverage: insight.trailing30DayAverage,
      }));

    const prompt = [
      `You are the supplier intelligence copilot for Pavement Performance Suite supporting church parking-lot maintenance crews.`,
      `Summarize supplier pricing for organization ${orgId}.`,
      `Highlight the best offer for each material, recent price movement, and any risk indicators (low confidence, limited samples, long lead time).`,
      `Keep the tone tactical and concise with bullet recommendations.`,
      `Data snapshot: ${JSON.stringify({
        topLines,
        bestOffers,
      })}`,
    ].join("\n");

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent" +
        `?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      console.warn("[supplier-intel] gemini summary request failed", response.status, body);
      return null;
    }
    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text === "string" && text.trim().length > 0) {
      return text.trim();
    }
  } catch (error) {
    console.warn("[supplier-intel] gemini summary error", error);
  }

  return null;
}

/**
 * @openapi
 * /supplier-intel:
 *   post:
 *     tags:
 *       - Intelligence
 *     summary: Generate supplier pricing intelligence
 *     description: |
 *       Aggregates recent supplier pricing snapshots, computes best offers per material,
 *       and optionally produces a Gemini-authored summary to guide estimators and schedulers.
 *       Requires a Supabase JWT in the `Authorization` header; the service resolves the caller's
 *       organization automatically when `orgId` is not supplied.
 *     operationId: postSupplierIntel
 *     security:
 *       - supabaseBearer: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupplierIntelRequest'
 *     responses:
 *       '200':
 *         description: Supplier intelligence generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupplierIntelResponse'
 *       '400':
 *         description: Missing org context or invalid radius/material filter
 *       '401':
 *         description: Missing or invalid Supabase JWT
 *       '422':
 *         description: Request validation failed
 *       '500':
 *         description: Unexpected error while computing insights or contacting Gemini
 */
serve(async (req) => {
  if (req.method !== "POST") {
    return errorResponse("Method Not Allowed", 405);
  }

  if (!supabase) {
    return errorResponse("Supabase client not configured", 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return errorResponse("Unauthorized", 401);
  }
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  let bodyJson: unknown;
  try {
    bodyJson = await req.json();
  } catch {
    return errorResponse("Invalid JSON payload", 400);
  }

  const parseResult = INPUT_SCHEMA.safeParse(bodyJson);
  if (!parseResult.success) {
    return jsonResponse({ error: "Validation failed", details: parseResult.error.flatten() }, 422);
  }
  const input = parseResult.data;

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user?.id) {
    return errorResponse("Unauthorized", 401);
  }
  const userId = userData.user.id;

  const orgId = await resolveOrgId(userId, input.orgId ?? null);
  if (!orgId) {
    return errorResponse("Unable to resolve organization context", 400);
  }

  let materials = input.materials;
  const includeAiSummary = input.includeAiSummary ?? true;

  try {
    if (!materials || materials.length === 0) {
      const distinctQuery = await supabase
        .from("supplier_price_insights")
        .select("material_type")
        .eq("org_id", orgId)
        .limit(8);
      if (distinctQuery.error) {
        throw distinctQuery.error;
      }
      materials = Array.from(
        new Set((distinctQuery.data ?? []).map((row) => row.material_type).filter((value) => typeof value === "string" && value.length)),
      );
    }

    const [insightRows, historyRows] = await Promise.all([fetchInsights(orgId, materials), fetchHistory(orgId, materials)]);

    if (insightRows.length === 0) {
      return jsonResponse({
        orgId,
        materials,
        generatedAt: new Date().toISOString(),
        insights: [],
        bestOffers: {},
        aiSummary: null,
      } satisfies SupplierIntelResponse);
    }

    const filteredInsights = insightRows.filter((insight) => {
      if (!input.radiusMiles) return true;
      const coverage = insight.coverage_radius_miles ?? null;
      if (!coverage) return true;
      return coverage >= input.radiusMiles;
    });

    const insights: SupplierInsight[] = filteredInsights.map((row) => {
      const sevenDayChangePercent = computeSevenDayChangePercent(Number(row.unit_price), row.price_7_day_baseline ? Number(row.price_7_day_baseline) : null);
      return {
        supplierId: row.supplier_id,
        supplierName: row.supplier_name,
        materialType: row.material_type,
        materialGrade: row.material_grade,
        unitPrice: Number(row.unit_price),
        unitOfMeasure: row.unit_of_measure,
        currency: row.currency,
        effectiveDate: row.effective_date,
        confidence: row.confidence ? Number(row.confidence) : null,
        source: row.source,
        trailing30DayAverage: row.trailing_30_day_avg ? Number(row.trailing_30_day_avg) : null,
        sevenDayChangePercent,
        sampleCount: Number(row.sample_count ?? 0),
        leadTimeDays: row.lead_time_days,
        coverageRadiusMiles: row.coverage_radius_miles,
        reliabilityScore: row.reliability_score ? Number(row.reliability_score) : null,
        contact: row.supplier_contact as Record<string, unknown> | null,
        metadata: row.supplier_metadata as Record<string, unknown> | null,
        priceHistory: toHistorySeries(historyRows, row.supplier_id, row.material_type),
      };
    });

    const bestOffers = insights.reduce<SupplierIntelResponse["bestOffers"]>((acc, insight) => {
      const current = acc[insight.materialType];
      if (!current || insight.unitPrice < current.unitPrice) {
        acc[insight.materialType] = {
          supplierId: insight.supplierId,
          supplierName: insight.supplierName,
          unitPrice: insight.unitPrice,
          currency: insight.currency,
          leadTimeDays: insight.leadTimeDays,
        };
      }
      return acc;
    }, {});

    const aiSummary = await generateAiSummary(orgId, insights, bestOffers, includeAiSummary);

    const payload: SupplierIntelResponse = {
      orgId,
      materials: materials ?? [],
      generatedAt: new Date().toISOString(),
      insights,
      bestOffers,
      aiSummary,
    };

    return jsonResponse(payload);
  } catch (error) {
    console.error("[supplier-intel] unexpected error", error);
    return errorResponse("Failed to compute supplier intelligence", 500);
  }
});
