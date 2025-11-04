/**
 * API response types
 */

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface GeminiRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GeminiResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ImageAnalysisRequest {
  imageData: string;
  prompt?: string;
}

export interface ImageAnalysisResponse {
  analysis: string;
  detectedArea?: number;
  confidence?: number;
}

export interface WeatherData {
  temperature: number;
  conditions: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    conditions: string;
  }>;
}

export interface GeocodeResult {
  address: string;
  coords: [number, number];
  confidence: number;
}
