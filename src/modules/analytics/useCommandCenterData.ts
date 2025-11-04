import { useQuery } from "@tanstack/react-query";

import { getBrowserClient } from "@/lib/supabase";
import { logError } from "@/lib/logging";

import {
  calculateCommandCenterMetrics,
  type CommandCenterMetrics,
  type CrewAssignmentRecord,
  type EstimateRecord,
  type JobRecord,
} from "./commandCenter";

export interface CommandCenterQueryResult {
  status: "disabled" | "error" | "ready" | "loading";
  metrics: CommandCenterMetrics | null;
  errorMessage?: string;
}

async function fetchCommandCenterData(): Promise<CommandCenterMetrics> {
  const client = getBrowserClient();
  if (!client) {
    throw new Error(
      "Supabase client not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable the command center.",
    );
  }

  const [jobsRes, estimatesRes, assignmentsRes] = await Promise.all([
    client.from("jobs").select("id,status,total_area_sqft,created_at,updated_at").limit(500),
    client.from("estimates").select("id,job_id,total,created_at").limit(500),
    client
      .from("crew_assignments")
      .select("id,job_id,shift_start,shift_end")
      .limit(500),
  ]);

  const errors = [jobsRes.error, estimatesRes.error, assignmentsRes.error].filter(Boolean);
  if (errors.length) {
    throw errors[0]!;
  }

  return calculateCommandCenterMetrics(
    jobsRes.data ?? [],
    estimatesRes.data ?? [],
    assignmentsRes.data ?? [],
  );
}

export function useCommandCenterData(): CommandCenterQueryResult {
  const client = getBrowserClient();

  const query = useQuery({
    queryKey: ["command-center-metrics"],
    queryFn: fetchCommandCenterData,
    enabled: !!client,
    staleTime: 1000 * 60 * 5,
  });

  if (!client) {
    return {
      status: "disabled",
      metrics: null,
      errorMessage:
        "Supabase credentials missing. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable the Executive Command Center.",
    };
  }

  if (query.isLoading) {
    return { status: "loading", metrics: null };
  }

  if (query.isError) {
    logError(query.error, { source: "command_center" });
    return {
      status: "error",
      metrics: null,
      errorMessage: query.error instanceof Error ? query.error.message : "Unknown error",
    };
  }

  if (!query.data) {
    return { status: "error", metrics: null, errorMessage: "No metrics available." };
  }

  return { status: "ready", metrics: query.data };
}
