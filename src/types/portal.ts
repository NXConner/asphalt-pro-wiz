/**
 * Portal snapshot domain types shared across the customer portal experience.
 */

export type PortalSnapshotLooseItem = {
  name?: string;
  item?: string;
  label?: string;
  description?: string;
  cost?: number;
  value?: number;
  amount?: number;
};

export interface PortalSnapshotItem {
  name: string;
  cost: number;
  notes?: string;
}

export interface PortalSnapshotCostSummary {
  subtotal?: number;
  tax?: number;
  total?: number;
  items?: PortalSnapshotLooseItem[];
}

export interface PortalSnapshot {
  id?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  jobName?: string;
  customerAddress?: string;
  customerItems?: PortalSnapshotLooseItem[];
  items?: PortalSnapshotLooseItem[];
  costs?: PortalSnapshotCostSummary | PortalSnapshotLooseItem[];
  metadata?: Record<string, unknown>;
}
