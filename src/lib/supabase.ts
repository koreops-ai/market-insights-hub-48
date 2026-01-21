/**
 * Supabase Client for Frontend
 * SAS Market Validation Platform
 *
 * Used for real-time subscriptions (activity streaming)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables not set. Real-time features will be disabled.'
  );
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type ActivityType =
  | 'search'
  | 'result'
  | 'agent_start'
  | 'agent_complete'
  | 'llm_call'
  | 'progress'
  | 'error'
  | 'hitl_pending';

export interface Activity {
  id: string;
  analysis_id: string;
  module_type: string | null;
  activity_type: ActivityType;
  message: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
