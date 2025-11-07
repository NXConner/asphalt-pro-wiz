export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RoleName = 'viewer' | 'operator' | 'manager' | 'super_admin';
export type JobStatus = 'draft' | 'need_estimate' | 'estimated' | 'scheduled' | 'completed' | 'lost';

type GenericTable<Row extends Record<string, unknown> = Record<string, unknown>> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships?: Array<Record<string, unknown>>;
};

export interface RoleRow {
  name: RoleName;
  description: string;
  created_at: string;
}

export interface UserRoleRow {
  user_id: string;
  role_name: RoleName;
  granted_at: string;
}

export interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserOrgMembershipRow {
  user_id: string;
  org_id: string;
  role: RoleName;
  joined_at: string;
}

export interface JobRow {
  id: string;
  org_id: string;
  name: string;
  customer_name: string | null;
  customer_address: string | null;
  customer_latitude: number | null;
  customer_longitude: number | null;
  status: JobStatus;
  total_area_sqft: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EstimateRow {
  id: string;
  job_id: string;
  prepared_by: string | null;
  inputs: Json;
  costs: Json;
  subtotal: number;
  overhead: number;
  profit: number;
  total: number;
  created_at: string;
}

export interface EstimateLineItemRow {
  id: number;
  estimate_id: string;
  kind: string;
  label: string;
  amount: number;
  metadata: Json | null;
}

export interface JobDocumentRow {
  id: string;
  job_id: string;
  title: string;
  kind: string;
  content: Json | null;
  metadata: Json | null;
  created_by: string | null;
  created_at: string;
}

export interface JobPremiumServiceRow {
  job_id: string;
  service_id: string;
  enabled: boolean;
  price_override: number | null;
  metadata: Json | null;
  updated_at: string;
}

type PublicTables = {
  roles: {
    Row: RoleRow;
    Insert: { name: RoleName; description: string; created_at?: string };
    Update: Partial<RoleRow>;
    Relationships: [];
  };
  user_roles: {
    Row: UserRoleRow;
    Insert: { user_id: string; role_name: RoleName; granted_at?: string };
    Update: Partial<UserRoleRow>;
    Relationships: [];
  };
  profiles: {
    Row: ProfileRow;
    Insert: {
      id: string;
      email?: string | null;
      full_name?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
    Update: Partial<ProfileRow>;
    Relationships: [];
  };
  user_org_memberships: {
    Row: UserOrgMembershipRow;
    Insert: { user_id: string; org_id: string; role: RoleName; joined_at?: string };
    Update: Partial<UserOrgMembershipRow>;
    Relationships: [];
  };
  jobs: {
    Row: JobRow;
    Insert: {
      id?: string;
      org_id: string;
      name: string;
      customer_name?: string | null;
      customer_address?: string | null;
      customer_latitude?: number | null;
      customer_longitude?: number | null;
      status?: JobStatus;
      total_area_sqft?: number | null;
      created_by?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<JobRow>;
    Relationships: [];
  };
  estimates: {
    Row: EstimateRow;
    Insert: {
      id?: string;
      job_id: string;
      prepared_by?: string | null;
      inputs: Json;
      costs: Json;
      subtotal: number;
      overhead: number;
      profit: number;
      total: number;
      created_at?: string;
    };
    Update: Partial<EstimateRow>;
    Relationships: [];
  };
  estimate_line_items: {
    Row: EstimateLineItemRow;
    Insert: {
      id?: number;
      estimate_id: string;
      kind: string;
      label: string;
      amount: number;
      metadata?: Json | null;
    };
    Update: Partial<EstimateLineItemRow>;
    Relationships: [];
  };
  job_documents: {
    Row: JobDocumentRow;
    Insert: {
      id?: string;
      job_id: string;
      title: string;
      kind: string;
      content?: Json | null;
      metadata?: Json | null;
      created_by?: string | null;
      created_at?: string;
    };
    Update: Partial<JobDocumentRow>;
    Relationships: [];
  };
  job_premium_services: {
    Row: JobPremiumServiceRow;
    Insert: {
      job_id: string;
      service_id: string;
      enabled?: boolean;
      price_override?: number | null;
      metadata?: Json | null;
      updated_at?: string;
    };
    Update: Partial<JobPremiumServiceRow>;
    Relationships: [];
  };
} & {
  [table: string]: GenericTable;
};

export type Database = {
  public: {
    Tables: PublicTables;
    Views: Record<string, never>;
    Functions: Record<string, unknown>;
    Enums: {
      role_name: RoleName;
      job_status: JobStatus;
    };
  };
};

export type Tables = Database['public']['Tables'];
