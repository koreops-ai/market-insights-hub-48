import { API_BASE_URL } from '@/config/api';
import { createApiError } from '@/lib/api-errors';
import type { ChatRequest, JsonBlocksResponse } from '@/types/blocks';
import type { ModuleType, SocialPlatform } from '@/types/api';

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
    throw createApiError(new Error('User not authenticated'));
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-User-Id': userId,
    ...fetchOptions.headers,
  };

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw createApiError(
        new Error(errorData.error || `API error: ${response.status} ${response.statusText}`)
      );
    }

    const json: ApiResponse<T> = await response.json();
    
    if (!json.success) {
      throw createApiError(new Error(json.error || 'API request failed'));
    }

    return json.data;
  } catch (error) {
    // Re-throw if already formatted, otherwise format it
    if (error instanceof Error && error.name === 'ApiError') {
      throw error;
    }
    throw createApiError(error);
  }
}

// Analysis types
export interface Analysis {
  id: string;
  user_id: string;
  name: string;
  company_name: string;
  product_name: string | null;
  description: string | null;
  target_market: string | null;
  status: 'draft' | 'running' | 'hitl_pending' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  selected_modules: ModuleType[];
  social_platforms: SocialPlatform[] | null;
  preset_id: string | null;
  estimated_cost: number;
  actual_cost: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface AnalysisModule {
  id: string;
  analysis_id: string;
  module_type: ModuleType;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'hitl_pending' | 'approved' | 'revision_requested' | 'skipped';
  progress: number;
  started_at: string | null;
  completed_at: string | null;
  cost: number;
  data: Record<string, unknown> | null;
  error: string | null;
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

export interface CreateAnalysisInput {
  name: string;
  company_name: string;
  product_name?: string;
  description?: string;
  target_market?: string;
  selected_modules: ModuleType[];
  social_platforms?: SocialPlatform[];
  preset_id?: string;
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

  createAnalysis: (data: CreateAnalysisInput) => 
    apiCall<Analysis>('/api/analyses', {
      userId,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  suggestModules: (data: {
    decision_question?: string;
    company_name: string;
    product_name?: string;
    description?: string;
    target_market?: string;
  }) =>
    apiCall<{
      recommended_modules: string[];
      recommended_social_platforms?: string[];
      rationale: string;
    }>('/api/analyses/suggest-modules', {
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
    apiCall<{ modules: AnalysisModule[] }>(`/api/analyses/${id}/modules`, { userId }),

  getAnalysisSummary: (id: string) =>
    apiCall<{ summary: Record<string, unknown> | null }>(`/api/analyses/${id}/summary`, { userId }),

  // HITL Checkpoints
  listCheckpoints: () => 
    apiCall<Checkpoint[]>('/api/hitl/checkpoints', { userId }),

  resolveCheckpoint: (id: string, data: { 
    action: 'approve_all' | 'request_revision' | 'reject';
    comment?: string;
    adjustments?: Record<string, unknown>;
  }) => 
    apiCall<Checkpoint>(`/api/hitl/checkpoints/${id}/resolve`, {
      userId,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Multi-model chat (JSON blocks)
  chatJsonBlocks: (data: Omit<ChatRequest, 'output_format'>) =>
    apiCall<JsonBlocksResponse>('/api/chat', {
      userId,
      method: 'POST',
      body: JSON.stringify({
        ...data,
        output_format: 'json_blocks',
      }),
    }),
});

export { apiCall, createApi };
