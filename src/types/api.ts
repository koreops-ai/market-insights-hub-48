// API Response wrapper
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Analysis status enum
export type AnalysisStatus = 
  | 'draft' 
  | 'running' 
  | 'paused' 
  | 'hitl_pending' 
  | 'completed' 
  | 'failed';

// Module status enum
export type ModuleStatus = 
  | 'pending' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'hitl_pending';

// HITL action enum
export type HITLAction = 
  | 'approve_all' 
  | 'request_revision' 
  | 'reject';

// HITL status enum
export type HITLStatus = 
  | 'pending' 
  | 'resolved';

// Module types
export type ModuleType = 
  | 'market_demand' 
  | 'revenue_intelligence' 
  | 'competitive_intelligence' 
  | 'social_sentiment' 
  | 'linkedin_contacts'
  | 'google_maps'
  | 'financial_modeling' 
  | 'risk_assessment' 
  | 'operational_feasibility';

// Social platforms
export type SocialPlatform = 
  | 'amazon_reviews' 
  | 'reddit' 
  | 'twitter' 
  | 'trustpilot' 
  | 'quora' 
  | 'youtube';

// Analysis entity
export type Analysis = {
  id: string;
  user_id: string;
  name: string;
  company_name: string;
  product_name: string | null;
  description: string | null;
  target_market: string | null;
  industry: string | null;
  target_markets: string[] | null;
  website_url: string | null;
  status: AnalysisStatus;
  progress: number;
  current_module: string | null;
  modules: ModuleType[];
  social_platforms: SocialPlatform[] | null;
  credits_estimated: number;
  credits_used: number;
  error_message: string | null;
  started_at: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

// Analysis Module entity
export type AnalysisModule = {
  id: string;
  analysis_id: string;
  module_type: ModuleType;
  status: ModuleStatus;
  progress: number;
  started_at: string | null;
  completed_at: string | null;
  cost: number;
  data: Record<string, unknown> | null;
  error: string | null;
};

// Preset entity
export type Preset = {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  team_id: string | null;
  is_system: boolean;
  modules: ModuleType[];
  social_platforms: SocialPlatform[] | null;
  created_at: string;
};

// HITL Checkpoint entity
export type HITLCheckpoint = {
  id: string;
  analysis_id: string;
  module_id: string;
  module_type: ModuleType;
  status: HITLStatus;
  data_snapshot: Record<string, unknown>;
  reviewer_id: string | null;
  reviewer_comment: string | null;
  action: HITLAction | null;
  adjustments: Record<string, unknown> | null;
  created_at: string;
  resolved_at: string | null;
};

// Input types for creating/updating entities

export type CreateAnalysisInput = {
  name: string;
  company_name: string;
  product_name?: string;
  description?: string;
  target_market?: string;
  selected_modules: ModuleType[];
  social_platforms?: SocialPlatform[];
  preset_id?: string;
};

export type UpdateAnalysisInput = Partial<Omit<CreateAnalysisInput, 'name'>> & {
  name?: string;
  status?: AnalysisStatus;
};

export type CreatePresetInput = {
  name: string;
  description?: string;
  team_id?: string;
  modules: ModuleType[];
  social_platforms?: SocialPlatform[];
};

export type UpdatePresetInput = {
  name?: string;
  description?: string;
  modules?: ModuleType[];
  social_platforms?: SocialPlatform[];
};

export type ResolveCheckpointInput = {
  action: HITLAction;
  comment?: string;
  adjustments?: Record<string, unknown>;
};

// Paginated response type
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

// List analyses response
export type ListAnalysesResponse = {
  analyses: Analysis[];
  total: number;
};
