import { describe, expect, it } from "vitest";

import {
  calculateCommandCenterMetrics,
  type CrewAssignmentRecord,
  type EstimateRecord,
  type JobRecord,
} from "@/modules/analytics/commandCenter";

const jobs: JobRecord[] = [
  {
    id: "job-1",
    status: "need_estimate",
    total_area_sqft: 4200,
    created_at: "2024-10-01T12:00:00.000Z",
  },
  {
    id: "job-2",
    status: "completed",
    total_area_sqft: 8800,
    created_at: "2024-09-15T15:00:00.000Z",
  },
  {
    id: "job-3",
    status: "lost",
    total_area_sqft: null,
    created_at: "2024-09-20T18:00:00.000Z",
  },
];

const estimates: EstimateRecord[] = [
  {
    id: "est-1",
    job_id: "job-1",
    total: 12500,
    created_at: "2024-10-02T10:00:00.000Z",
  },
  {
    id: "est-2",
    job_id: "job-2",
    total: 28950,
    created_at: "2024-09-17T09:00:00.000Z",
  },
  {
    id: "est-3",
    job_id: "job-2",
    total: 30500,
    created_at: "2024-09-18T11:00:00.000Z",
  },
];

const assignments: CrewAssignmentRecord[] = [
  {
    id: "assign-1",
    job_id: "job-1",
    shift_start: "2024-10-05T12:00:00.000Z",
    shift_end: "2024-10-05T20:00:00.000Z",
  },
  {
    id: "assign-2",
    job_id: "job-2",
    shift_start: "2024-09-19T12:00:00.000Z",
    shift_end: "2024-09-19T20:00:00.000Z",
  },
];

describe("calculateCommandCenterMetrics", () => {
  it("summarizes totals and efficiency", () => {
    const metrics = calculateCommandCenterMetrics(jobs, estimates, assignments);

    expect(metrics.totals.jobs).toBe(3);
    expect(metrics.totals.activeJobs).toBe(1);
    expect(metrics.totals.completedJobs).toBe(1);
    expect(metrics.totals.lostJobs).toBe(1);
    expect(metrics.totals.totalAreaSqft).toBe(13000);
    expect(metrics.totals.totalRevenue).toBe(71950);

    expect(metrics.efficiency.scheduledJobs).toBe(2);
    expect(metrics.efficiency.averageTurnaroundDays).toBeCloseTo(1.5, 1);
  });

  it("groups revenue by month", () => {
    const metrics = calculateCommandCenterMetrics(jobs, estimates, assignments);
    expect(metrics.revenueByMonth).toEqual([
      { month: "2024-09", total: 59450 },
      { month: "2024-10", total: 12500 },
    ]);
  });

  it("handles empty arrays", () => {
    const metrics = calculateCommandCenterMetrics([], [], []);
    expect(metrics.totals).toEqual({
      jobs: 0,
      activeJobs: 0,
      completedJobs: 0,
      lostJobs: 0,
      totalAreaSqft: 0,
      totalRevenue: 0,
    });
    expect(metrics.efficiency).toEqual({ averageTurnaroundDays: null, scheduledJobs: 0 });
    expect(metrics.revenueByMonth).toEqual([]);
  });
});
