

export function getApiBaseUrl() {
  if (typeof window === 'undefined') {
    return process.env.API_BACKEND_URL || process.env.API_BASE_URL || 'http://app:3000';
  }
  return window.ENV.API_BASE_URL || 'http://localhost:3000';
};