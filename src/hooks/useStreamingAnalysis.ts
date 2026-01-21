/**
 * Streaming Analysis Hook
 * Progressive rendering of analysis execution via SSE
 *
 * Provides real-time updates as modules execute:
 * - Activity stream (search, result, progress events)
 * - Module status updates
 * - Module output data as it completes
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/hooks/useAuth';
import type { ModuleType } from '@/types/api';

// Activity types from backend
export type ActivityType =
  | 'search'
  | 'result'
  | 'agent_start'
  | 'agent_complete'
  | 'llm_call'
  | 'progress'
  | 'error'
  | 'hitl_pending';

export interface StreamActivity {
  id: string;
  analysis_id: string;
  module_type: string | null;
  activity_type: ActivityType;
  message: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ModuleStatus {
  module: ModuleType;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'hitl_pending';
  hasOutput: boolean;
}

export interface ModuleOutput {
  module: ModuleType;
  output: Record<string, unknown>;
}

export type AnalysisStatus =
  | 'draft'
  | 'running'
  | 'hitl_pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface StreamingState {
  // Connection state
  isConnected: boolean;
  isStreaming: boolean;
  error: Error | null;

  // Analysis state
  analysisStatus: AnalysisStatus | null;
  progress: number;

  // Activities (real-time)
  activities: StreamActivity[];
  activitiesByModule: Record<string, StreamActivity[]>;

  // Module states
  moduleStatuses: Record<string, ModuleStatus>;
  moduleOutputs: Record<string, ModuleOutput>;

  // Helpers
  activeModules: ModuleType[];
  completedModules: ModuleType[];
}

interface UseStreamingAnalysisOptions {
  enabled?: boolean;
  maxActivities?: number;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  onModuleComplete?: (module: ModuleType, output: Record<string, unknown>) => void;
}

export function useStreamingAnalysis(
  analysisId: string | null,
  options: UseStreamingAnalysisOptions = {}
): StreamingState & { reconnect: () => void } {
  const {
    enabled = true,
    maxActivities = 500,
    onComplete,
    onError,
    onModuleComplete,
  } = options;

  const { userId } = useAuth();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus | null>(null);
  const [progress, setProgress] = useState(0);
  const [activities, setActivities] = useState<StreamActivity[]>([]);
  const [moduleStatuses, setModuleStatuses] = useState<Record<string, ModuleStatus>>({});
  const [moduleOutputs, setModuleOutputs] = useState<Record<string, ModuleOutput>>({});

  // Derived state
  const activitiesByModule = activities.reduce<Record<string, StreamActivity[]>>(
    (acc, activity) => {
      const key = activity.module_type || 'general';
      if (!acc[key]) acc[key] = [];
      acc[key].push(activity);
      return acc;
    },
    {}
  );

  const activeModules = Object.entries(moduleStatuses)
    .filter(([, status]) => status.status === 'running')
    .map(([module]) => module as ModuleType);

  const completedModules = Object.entries(moduleStatuses)
    .filter(([, status]) => status.status === 'completed')
    .map(([module]) => module as ModuleType);

  // Connect to SSE stream
  const connect = useCallback(() => {
    if (!analysisId || !userId || !enabled) {
      console.log('[SSE] Skipping connection:', { analysisId, userId, enabled });
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const url = `${API_BASE_URL}/api/analyses/${analysisId}/stream`;
    console.log('[SSE] Connecting to:', url);

    // Create EventSource with custom headers via URL params
    // Note: EventSource doesn't support custom headers natively
    // We use a workaround by sending userId as query param
    const eventSource = new EventSource(`${url}?userId=${encodeURIComponent(userId)}`);
    eventSourceRef.current = eventSource;

    // Connection opened
    eventSource.onopen = () => {
      console.log('[SSE] Connection opened');
      setIsConnected(true);
      setError(null);
      reconnectAttemptsRef.current = 0;
    };

    // Handle events
    eventSource.addEventListener('connected', (e: MessageEvent) => {
      console.log('[SSE] Event: connected', e.data);
      const data = JSON.parse(e.data);
      setAnalysisStatus(data.status);
      setProgress(data.progress);
      setIsStreaming(data.status === 'running');
    });

    eventSource.addEventListener('activities_batch', (e: MessageEvent) => {
      console.log('[SSE] Event: activities_batch', JSON.parse(e.data).length, 'items');
      const batch: StreamActivity[] = JSON.parse(e.data);
      setActivities((prev) => {
        const combined = [...prev, ...batch];
        return combined.slice(-maxActivities);
      });
    });

    eventSource.addEventListener('activity', (e: MessageEvent) => {
      console.log('[SSE] Event: activity', e.data);
      const activity: StreamActivity = JSON.parse(e.data);
      setActivities((prev) => {
        const updated = [...prev, activity];
        return updated.slice(-maxActivities);
      });
    });

    eventSource.addEventListener('module_status', (e: MessageEvent) => {
      console.log('[SSE] Event: module_status', e.data);
      const data: ModuleStatus = JSON.parse(e.data);
      setModuleStatuses((prev) => ({
        ...prev,
        [data.module]: data,
      }));
    });

    eventSource.addEventListener('module_output', (e: MessageEvent) => {
      console.log('[SSE] Event: module_output', e.data);
      const data: ModuleOutput = JSON.parse(e.data);
      setModuleOutputs((prev) => ({
        ...prev,
        [data.module]: data,
      }));
      onModuleComplete?.(data.module, data.output);
    });

    eventSource.addEventListener('analysis_status', (e: MessageEvent) => {
      console.log('[SSE] Event: analysis_status', e.data);
      const data = JSON.parse(e.data);
      setAnalysisStatus(data.status);
      setProgress(data.progress);
      setIsStreaming(data.status === 'running');
    });

    eventSource.addEventListener('progress', (e: MessageEvent) => {
      console.log('[SSE] Event: progress', e.data);
      const data = JSON.parse(e.data);
      setProgress(data.progress);
    });

    eventSource.addEventListener('done', (e: MessageEvent) => {
      console.log('[SSE] Event: done', e.data);
      const data = JSON.parse(e.data);
      setAnalysisStatus(data.status);
      setIsStreaming(false);
      onComplete?.();
      eventSource.close();
    });

    eventSource.addEventListener('error', (e: MessageEvent) => {
      console.log('[SSE] Event: error', e);
      try {
        const data = JSON.parse(e.data);
        const err = new Error(data.message || 'Stream error');
        setError(err);
        onError?.(err);
      } catch {
        // Not a data error, might be connection error
      }
    });

    // Connection error
    eventSource.onerror = (e) => {
      console.error('[SSE] Connection error:', e);
      setIsConnected(false);

      // Attempt reconnection with exponential backoff
      const attempts = reconnectAttemptsRef.current;
      if (attempts < 5) {
        const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else {
        const err = new Error('Failed to connect after multiple attempts');
        setError(err);
        onError?.(err);
      }
    };
  }, [analysisId, userId, enabled, maxActivities, onComplete, onError, onModuleComplete]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  // Connect on mount / changes
  useEffect(() => {
    if (enabled && analysisId && userId) {
      connect();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect, enabled, analysisId, userId]);

  return {
    isConnected,
    isStreaming,
    error,
    analysisStatus,
    progress,
    activities,
    activitiesByModule,
    moduleStatuses,
    moduleOutputs,
    activeModules,
    completedModules,
    reconnect,
  };
}

export default useStreamingAnalysis;
