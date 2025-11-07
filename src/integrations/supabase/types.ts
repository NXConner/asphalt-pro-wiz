export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RoleName = 'viewer' | 'operator' | 'manager' | 'super_admin';

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
    };
  };
};

export type Tables = Database['public']['Tables'];
