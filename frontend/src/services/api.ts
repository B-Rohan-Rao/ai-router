/**
 * API Service Layer
 * Handles all communication with the backend API
 */

// Get API base URL from environment variable
// In development, use the proxy (/api) which forwards to the backend
// In production, use the full backend URL from .env
const API_BASE_URL = import.meta.env.PROD && import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';

// Log backend URL configuration
console.log('🔗 Backend URL Configuration:');
console.log('  Environment:', import.meta.env.MODE);
console.log('  VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || '(not set, using proxy)');
console.log('  API_BASE_URL:', API_BASE_URL);
console.log('  Full Backend URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001 (via proxy)');

// Types for API responses
export interface ToolCategory {
  category: string;
  models: ModelInfo[];
}

export interface ModelInfo {
  name: string;
  logo: string;
  pros: string[];
  cons: string[];
  pricePerToken: number;
  price: string;
  description: string;
}

export interface GenerateRequest {
  category: string;
  model: string;
  prompt: string;
  additionalParams?: Record<string, any>;
}

export interface GenerateResponse {
  success: boolean;
  data?: any;
  cost?: number;
  requestId?: string;
  model?: string;
  category?: string;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch all tools and categories
 */
export async function fetchTools(): Promise<ToolCategory[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/tools`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<ToolCategory[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch tools');
    }
    
    return result.data || [];
  } catch (error: any) {
    console.error('Error fetching tools:', error);
    throw new Error(error.message || 'Failed to fetch tools from server');
  }
}

/**
 * Fetch tools for a specific category
 */
export async function fetchToolsByCategory(category: string): Promise<ModelInfo[]> {
  try {
    // Encode category name for URL
    const encodedCategory = encodeURIComponent(category);
    const response = await fetch(`${API_BASE_URL}/tools/${encodedCategory}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Category "${category}" not found`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<{ category: string; models: ModelInfo[] }> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch category tools');
    }
    
    return result.data?.models || [];
  } catch (error: any) {
    console.error(`Error fetching tools for category "${category}":`, error);
    throw new Error(error.message || `Failed to fetch tools for ${category}`);
  }
}

/**
 * Generate content using selected model
 */
export async function generateContent(request: GenerateRequest): Promise<GenerateResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      // Try to parse error response
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const result: GenerateResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Generation failed');
    }
    
    return result;
  } catch (error: any) {
    console.error('Error generating content:', error);
    throw new Error(error.message || 'Failed to generate content');
  }
}

/**
 * Helper function to check if server is reachable
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch('/health');
    return response.ok;
  } catch (error) {
    return false;
  }
}
