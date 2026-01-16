import { API_BASE_URL } from '@/config/api';

// API response wrapper type
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface ApiCallOptions extends RequestInit {
  userId?: string | null;
}

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: ApiCallOptions = {}
): Promise<T> {
  const { userId, ...fetchOptions } = options;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-User-Id': userId,
    ...fetchOptions.headers,
  };

  const response = await fetch(url, {
    ...fetchOptions,
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

// Helper to create API methods with userId
const createApi = (userId: string) => ({
  // Presets
  listPresets: () => 
    apiCall<Preset[]>('/api/presets', { userId }),

  getPreset: (id: string) => 
    apiCall<Preset>(`/api/presets/${id}`, { userId }),

  createPreset: (data: Partial<Preset>) => 
    apiCall<Preset>('/api/presets', {
      userId,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePreset: (id: string, data: Partial<Preset>) => 
    apiCall<Preset>(`/api/presets/${id}`, {
      userId,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deletePreset: (id: string) => 
    apiCall<{ deleted: boolean }>(`/api/presets/${id}`, {
      userId,
      method: 'DELETE',
    }),

  // Analyses
  listAnalyses: (limit = 10, offset = 0, status?: string) => {
    const params = new URLSearchParams({ 
      limit: String(limit), 
      offset: String(offset) 
    });
    if (status) params.append('status', status);
    return apiCall<{ analyses: Analysis[]; total: number }>(`/api/analyses?${params}`, { userId });
  },

  getAnalysis: (id: string) => 
    apiCall<Analysis>(`/api/analyses/${id}`, { userId }),

  createAnalysis: (data: Partial<Analysis>) => 
    apiCall<Analysis>('/api/analyses', {
      userId,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAnalysis: (id: string, data: Partial<Analysis>) => 
    apiCall<Analysis>(`/api/analyses/${id}`, {
      userId,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteAnalysis: (id: string) => 
    apiCall<{ deleted: boolean }>(`/api/analyses/${id}`, {
      userId,
      method: 'DELETE',
    }),

  startAnalysis: (id: string) => 
    apiCall<Analysis>(`/api/analyses/${id}/start`, {
      userId,
      method: 'POST',
    }),

  getAnalysisModules: (id: string) => 
    apiCall<AnalysisModule[]>(`/api/analyses/${id}/modules`, { userId }),

  // HITL Checkpoints
  listCheckpoints: () => 
    apiCall<Checkpoint[]>('/api/hitl', { userId }),

  resolveCheckpoint: (id: string, data: { decision: string; notes?: string }) => 
    apiCall<Checkpoint>(`/api/hitl/${id}/resolve`, {
      userId,
      method: 'POST',
      body: JSON.stringify(data),
    }),
});

export { apiCall, createApi };
