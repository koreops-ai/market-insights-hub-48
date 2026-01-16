import { API_BASE_URL } from '@/config/api';
import { useUserStore } from '@/stores/userStore';

// Get userId from store (for use outside React components)
const getUserId = () => useUserStore.getState().userId;

// API response wrapper type
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const userId = getUserId();
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(userId && { 'X-User-Id': userId }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
  }

  const json: ApiResponse<T> = await response.json();
  
  if (!json.success) {
    throw new Error(json.error || 'API request failed');
  }

  return json.data;
}

// Analysis types
export interface Analysis {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'hitl_pending' | 'completed' | 'failed' | 'paused';
  progress: number;
  createdAt: string;
  updatedAt: string;
  type: string;
  description?: string;
  targetMarket?: string;
  competitors?: string;
}

export interface AnalysisModule {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
}

export interface Checkpoint {
  id: string;
  analysisId: string;
  analysisName: string;
  type: string;
  message: string;
  createdAt: string;
  status: 'pending' | 'resolved';
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  config: Record<string, unknown>;
  createdAt: string;
}

// API methods
export const api = {
  // Presets
  listPresets: () => 
    apiCall<Preset[]>('/api/presets'),

  // Analyses
  listAnalyses: (limit = 10, offset = 0, status?: string) => {
    const params = new URLSearchParams({ 
      limit: String(limit), 
      offset: String(offset) 
    });
    if (status) params.append('status', status);
    return apiCall<{ analyses: Analysis[]; total: number }>(`/api/analyses?${params}`);
  },

  getAnalysis: (id: string) => 
    apiCall<Analysis>(`/api/analyses/${id}`),

  createAnalysis: (data: Partial<Analysis>) => 
    apiCall<Analysis>('/api/analyses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAnalysis: (id: string, data: Partial<Analysis>) => 
    apiCall<Analysis>(`/api/analyses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteAnalysis: (id: string) => 
    apiCall<{ deleted: boolean }>(`/api/analyses/${id}`, {
      method: 'DELETE',
    }),

  startAnalysis: (id: string) => 
    apiCall<Analysis>(`/api/analyses/${id}/start`, {
      method: 'POST',
    }),

  getAnalysisModules: (id: string) => 
    apiCall<AnalysisModule[]>(`/api/analyses/${id}/modules`),

  // HITL Checkpoints
  listCheckpoints: () => 
    apiCall<Checkpoint[]>('/api/hitl'),

  resolveCheckpoint: (id: string, data: { decision: string; notes?: string }) => 
    apiCall<Checkpoint>(`/api/hitl/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export { apiCall };
