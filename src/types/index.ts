/**
 * Centralized type definitions and utility types
 * Comprehensive type system for the entire application
 */

// Re-export all existing types
export * from './api';
export * from './database';
export * from './estimator';

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make a type nullable
 */
export type Nullable<T> = T | null;

/**
 * Make a type optional
 */
export type Optional<T> = T | undefined;

/**
 * Make a type nullable and optional
 */
export type Maybe<T> = T | null | undefined;

/**
 * Extract the promise return type
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific properties optional
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Extract function parameters
 */
export type Parameters<T extends (...args: unknown[]) => unknown> = T extends (
  ...args: infer P
) => unknown
  ? P
  : never;

/**
 * Extract function return type
 */
export type ReturnType<T extends (...args: unknown[]) => unknown> = T extends (
  ...args: unknown[]
) => infer R
  ? R
  : never;

// ============================================================================
// Form State Types
// ============================================================================

export interface FormFieldState {
  value: string;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export interface FormState {
  fields: Record<string, FormFieldState>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
}

// ============================================================================
// Async Operation Types
// ============================================================================

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
}

export interface AsyncOperation<T> {
  execute: () => Promise<T>;
  cancel: () => void;
  status: AsyncStatus;
  result: T | null;
  error: Error | null;
}

// ============================================================================
// Component Prop Types
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export interface LoadingProps {
  isLoading?: boolean;
  loadingText?: string;
}

export interface ErrorProps {
  error?: Error | string | null;
  onRetry?: () => void;
}

export interface EmptyStateProps {
  isEmpty?: boolean;
  emptyText?: string;
  emptyIcon?: React.ReactNode;
}

// ============================================================================
// API Response Types (Enhanced)
// ============================================================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    stack?: string;
  };
}

export type ApiResult<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================================================
// Event Handler Types
// ============================================================================

export type EventHandler<T = unknown> = (event: T) => void | Promise<void>;

export type AsyncEventHandler<T = unknown> = (event: T) => Promise<void>;

export type FormSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>;

export type ChangeHandler<T = string> = (value: T) => void;

export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationRule<T = unknown> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ============================================================================
// Theme & UI Types
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemePreset = 'default' | 'tactical' | 'professional' | 'minimal';

export interface ThemeConfig {
  mode: ThemeMode;
  preset: ThemePreset;
  primaryColor: string;
  accentColor: string;
  wallpaper?: string;
}

// ============================================================================
// Portal & Customer Types
// ============================================================================

export interface PortalSnapshot {
  jobName?: string;
  customerAddress?: string;
  costs?: {
    total?: number;
    subtotal?: number;
    labor?: number;
    materials?: number;
  };
  customerItems?: Array<{
    item: string;
    value: string | number;
  }>;
}

// ============================================================================
// Error Types (Enhanced)
// ============================================================================

export interface AppError extends Error {
  code: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  recoverable?: boolean;
}

export interface ErrorContext {
  error: AppError;
  timestamp: number;
  componentStack?: string;
  userActions?: string[];
}

// ============================================================================
// Performance Types
// ============================================================================

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

export interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    average: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  };
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface AnalyticsEvent {
  name: string;
  category: string;
  properties?: Record<string, unknown>;
  timestamp: number;
  userId?: string;
}

export interface UserBehavior {
  userId: string;
  sessionId: string;
  events: AnalyticsEvent[];
  startTime: number;
  endTime?: number;
}
