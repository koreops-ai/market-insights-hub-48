// API Configuration
// This is the base URL for the SAS Market Validation API
export const API_BASE_URL = 'https://sas-api-two.vercel.app';

// Helper to build API endpoints
export const apiEndpoints = {
  analyses: `${API_BASE_URL}/api/analyses`,
  reports: `${API_BASE_URL}/api/reports`,
  presets: `${API_BASE_URL}/api/presets`,
  team: `${API_BASE_URL}/api/team`,
  user: `${API_BASE_URL}/api/user`,
  hitl: `${API_BASE_URL}/api/hitl`,
} as const;
