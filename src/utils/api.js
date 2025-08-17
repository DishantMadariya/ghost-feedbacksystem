// ========================================
// Ghost Feedback System - API Configuration
// ========================================

// API Configuration based on environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ghost-feedbacksystem-backend.onrender.com';

// Base API endpoints
export const API_ENDPOINTS = {
  BASE: `${API_BASE_URL}/api`,
  SUGGESTIONS: `${API_BASE_URL}/api/suggestions`,
  AUTH: `${API_BASE_URL}/api/auth`,
  ADMIN: `${API_BASE_URL}/api/admin`
};

// Specific endpoint URLs
export const ENDPOINTS = {
  // Public endpoints
  CATEGORIES: `${API_ENDPOINTS.SUGGESTIONS}/categories`,
  SUBMIT_SUGGESTION: `${API_ENDPOINTS.SUGGESTIONS}/submit`,
  STATS: `${API_ENDPOINTS.SUGGESTIONS}/stats`,
  
  // Authentication
  LOGIN: `${API_ENDPOINTS.AUTH}/login`,
  VERIFY: `${API_ENDPOINTS.AUTH}/verify`,
  REFRESH: `${API_ENDPOINTS.AUTH}/refresh`,
  CHANGE_PASSWORD: `${API_ENDPOINTS.AUTH}/change-password`,
  
  // Admin endpoints
  ADMIN_SUGGESTIONS: `${API_ENDPOINTS.ADMIN}/suggestions`,
  ADMIN_DASHBOARD_STATS: `${API_ENDPOINTS.ADMIN}/dashboard/stats`,
  ADMIN_EXPORT: `${API_ENDPOINTS.ADMIN}/export`,
  ADMIN_ADMINS: `${API_ENDPOINTS.ADMIN}/admins`,
  ADMIN_ADMIN_NAMES: `${API_ENDPOINTS.ADMIN}/admins/names`,
  ADMIN_SUGGESTION_BY_ID: (id) => `${API_ENDPOINTS.ADMIN}/suggestions/${id}`,
  ADMIN_ADMIN_BY_ID: (id) => `${API_ENDPOINTS.ADMIN}/admins/${id}`
};

// API Configuration object
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Environment information
export const ENV_INFO = {
  apiBaseUrl: API_BASE_URL,
  enableDebug: process.env.REACT_APP_ENABLE_DEBUG_MODE === 'true'
};

// Debug logging (only in development)
export const logApiConfig = () => {
  if (ENV_INFO.enableDebug) {
    console.log('🌐 API Configuration:', {
      baseURL: API_BASE_URL,
      environment: process.env.NODE_ENV,
      endpoints: ENDPOINTS
    });
  }
};

// Export configuration for use in other files
export default {
  endpoints: ENDPOINTS,
  config: API_CONFIG,
  env: ENV_INFO
};
