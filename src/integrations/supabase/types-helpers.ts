/**
 * Type helpers for Supabase database types
 * This file provides convenient type exports that match the application's expectations
 */

import type { Database } from './types';

// Table row types
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type UserRoleRow = Database['public']['Tables']['user_roles']['Row'];
export type RoleRow = UserRoleRow; // Alias for compatibility

// Enum types  
export type RoleName = Database['public']['Enums']['app_role'];
export type UserRole = Database['public']['Enums']['user_role'];

// Job-related types
export type JobRow = Database['public']['Tables']['jobs']['Row'];
export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Stub types for tables that exist but may not be in generated types
export interface JobDocumentRow {
  id: string;
  job_id: string;
  document_url: string;
  document_type: string;
  uploaded_at: string;
  uploaded_by?: string;
}

export interface JobPremiumServiceRow {
  id: string;
  job_id: string;
  service_id: string;
  quantity: number;
  price: number;
}

export interface MissionTaskRow {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: string;
  assigned_to?: string;
  created_at: string;
}

export interface MissionCrewMemberRow {
  id: string;
  mission_id: string;
  user_id: string;
  role?: string;
  assigned_at: string;
}

export interface UserOrgMembershipRow {
  id: string;
  user_id: string;
  org_id: string;
  role?: string;
  joined_at: string;
}

// Generic Tables helper
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T];

// Re-export Database type
export type { Database };
