import { DEFAULT_FLAGS, FEATURE_FLAG_STORAGE_KEY } from '@/lib/featureFlags';

/**
 * Application constants
 */

export const APP_NAME = 'Pavement Performance Suite';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Professional asphalt maintenance estimating and project management';

// Storage keys
export const STORAGE_KEYS = {
  THEME: 'pps:theme',
  FLAGS: FEATURE_FLAG_STORAGE_KEY,
  DEVICE_ID: 'pps:deviceId',
  SESSION_ID: 'pps:sessionId',
  USER_PREFS: 'pps:userPrefs',
  LAST_JOB: 'pps:lastJob',
  LAYOUT_PRESET: 'pps:layoutPreset',
  WALLPAPER: 'pps:wallpaper',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  GEMINI_PROXY: '/functions/v1/gemini-proxy',
  LOG_BEACON: '/functions/v1/log-beacon',
} as const;

// Feature flags
export const DEFAULT_FEATURES = Object.freeze({ ...DEFAULT_FLAGS });

// Calculation defaults
export const CALCULATION_DEFAULTS = {
  LABOR_RATE: 25,
  MATERIAL_COST_PER_GALLON: 3.5,
  OVERHEAD_PERCENT: 15,
  PROFIT_MARGIN_PERCENT: 20,
  SQ_FT_PER_GALLON: 80,
  PREP_HOURS_PER_1000_SQFT: 0.5,
  APPLICATION_HOURS_PER_1000_SQFT: 1.5,
  STRIPING_RATE_PER_LINEAR_FOOT: 0.35,
} as const;

// Map settings
export const MAP_DEFAULTS = {
  CENTER_LAT: 39.8283,
  CENTER_LNG: -98.5795,
  ZOOM: 13,
  MAX_ZOOM: 20,
  MIN_ZOOM: 3,
} as const;

// UI settings
export const UI_SETTINGS = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 200,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 200,
} as const;

// Validation limits
export const LIMITS = {
  MAX_JOB_NAME_LENGTH: 100,
  MAX_ADDRESS_LENGTH: 200,
  MAX_AREA_SQFT: 1000000,
  MAX_CRACK_LENGTH_FT: 100000,
  MAX_STRIPING_LINES: 10000,
  MAX_CUSTOM_SERVICES: 20,
  MIN_NUM_COATS: 1,
  MAX_NUM_COATS: 5,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  CALCULATION_ERROR: 'Error calculating project costs.',
  SAVE_ERROR: 'Error saving data. Please try again.',
  LOAD_ERROR: 'Error loading data. Please refresh the page.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Saved successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  EXPORTED: 'Exported successfully',
  COPIED: 'Copied to clipboard',
} as const;
