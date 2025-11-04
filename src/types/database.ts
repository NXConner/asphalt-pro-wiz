/**
 * Common database types and interfaces
 */

export interface BaseRecord {
  id: string | number;
  created_at?: string;
  updated_at?: string;
}

export interface UserRecord extends BaseRecord {
  user_id: string;
}

export interface TimestampedRecord extends BaseRecord {
  created_at: string;
  updated_at: string;
}

export interface QueryFilter {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
  value: any;
}

export interface QueryOptions {
  select?: string;
  filters?: QueryFilter[];
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}
