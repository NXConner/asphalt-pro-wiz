/**
 * Centralized type definitions and exports
 *
 * This file serves as the main entry point for all type definitions
 * used across the application.
 */

// Re-export commonly used types
export type { ThemePreferences, ThemeMode, ThemeName } from '@/lib/theme';
export type { LogLevel, WebVitalName } from '@/lib/logging';
export type {
  PortalSnapshot,
  PortalSnapshotCostSummary,
  PortalSnapshotItem,
  PortalSnapshotLooseItem,
} from './portal';

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// API response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Form types
export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormState<T> {
  values: T;
  errors: FormFieldError[];
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  'data-testid'?: string;
}

// Async operation types
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// Event handler types
export type EventHandler<T = unknown> = (event: T) => void;
export type AsyncEventHandler<T = unknown> = (event: T) => Promise<void>;

// Utility types for React
export type ReactComponent<T = Record<string, never>> = React.ComponentType<T>;
export type ReactElement = React.ReactElement;
export type ReactNode = React.ReactNode;
