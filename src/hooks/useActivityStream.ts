/**
 * Activity Stream Hook
 * SAS Market Validation Platform
 *
 * Real-time activity updates using Server-Sent Events (SSE).
 * Falls back to polling for completed analyses.
 * Displays live updates as modules are processed (Claude Code/Cursor style).
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from './useAuth';
import { createApi } from '@/lib/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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

interface UseActivityStreamOptions {
  /** Auto-scroll to latest activity */
  autoScroll?: boolean;
  /** Maximum activities to keep in memory */
  maxActivities?: number;
  /** Enable streaming */
  enabled?: boolean;
  /** Use SSE streaming (default: true for running analyses) */
  useSSE?: boolean;
  /** Polling interval in ms for fallback (default: 2000) */
  pollingInterval?: number;
}

interface UseActivityStreamReturn {
  /** All activities for the analysis */
  activities: Activity[];
  /** Grouped activities by module */
  activitiesByModule: Record<string, Activity[]>;
  /** Whether SSE/polling is active */
  isConnected: boolean;
  /** Whether currently streaming via SSE */
  isStreaming: boolean;
  /** Connection error if any */
  error: Error | null;
  /** Clear all activities */
  clearActivities: () => void;
  /** Get the latest activity for a module */
  getLatestForModule: (moduleType: string) => Activity | undefined;
  /** Check if a module is currently processing */
  isModuleProcessing: (moduleType: string) => boolean;
  /** Manually reconnect SSE */
  reconnect: () => void;
}

export function useActivityStream(
  analysisId: string | null,
  options: UseActivityStreamOptions = {}
): UseActivityStreamReturn {
  const {
    maxActivities = 500,
    enabled = true,
    useSSE = true,
    pollingInterval = 2000,
  } = options;
  const { userId } = useAuth();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDone, setIsDone] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Group activities by module
  const activitiesByModule = useMemo(() => {
    return activities.reduce<Record<string, Activity[]>>((acc, activity) => {
      const key = activity.module_type || 'general';
      if (!acc[key]) acc[key] = [];
      acc[key].push(activity);
      return acc;
    }, {});
  }, [activities]);

  // Clear all activities
  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  // Get latest activity for a module
  const getLatestForModule = useCallback(
    (moduleType: string): Activity | undefined => {
      const moduleActivities = activitiesByModule[moduleType];
      return moduleActivities?.[moduleActivities.length - 1];
    },
    [activitiesByModule]
  );

  // Check if a module is currently processing
  const isModuleProcessing = useCallback(
    (moduleType: string): boolean => {
      const latest = getLatestForModule(moduleType);
      if (!latest) return false;
      // Module is processing if last activity is not completion/error
      return !['agent_complete', 'error', 'hitl_pending'].includes(
        latest.activity_type
      );
    },
    [getLatestForModule]
  );

  // Add activities with deduplication and limiting
  const addActivities = useCallback(
    (newActivities: Activity[]) => {
      setActivities((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const unique = newActivities.filter((a) => !existingIds.has(a.id));
        if (unique.length === 0) return prev;

        const combined = [...prev, ...unique];
        // Sort by created_at and limit
        return combined
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
          .slice(-maxActivities);
      });
    },
    [maxActivities]
  );

  // Close SSE connection
  const closeConnection = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Connect to SSE endpoint
  const connectSSE = useCallback(() => {
    if (!analysisId || !userId || !useSSE || isDone) return;

    closeConnection();

    const url = `${API_BASE_URL}/api/analyses/${analysisId}/stream`;
    const eventSource = new EventSource(
      `${url}?userId=${encodeURIComponent(userId)}`
    );
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setIsStreaming(true);
      setError(null);
      reconnectAttemptRef.current = 0;
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setIsStreaming(false);

      // Only retry if not done and under max attempts
      if (!isDone && reconnectAttemptRef.current < 5) {
        reconnectAttemptRef.current += 1;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 30000);
        reconnectTimeoutRef.current = setTimeout(connectSSE, delay);
      } else if (reconnectAttemptRef.current >= 5) {
        setError(new Error('Connection failed after 5 attempts'));
      }
    };

    // Handle connected event
    eventSource.addEventListener('connected', () => {
      setIsConnected(true);
      setIsStreaming(true);
    });

    // Handle batch of activities (initial load)
    eventSource.addEventListener('activities_batch', (event) => {
      try {
        const data = JSON.parse(event.data) as Activity[];
        addActivities(data);
      } catch (err) {
        console.error('Error parsing activities_batch:', err);
      }
    });

    // Handle single activity
    eventSource.addEventListener('activity', (event) => {
      try {
        const activity = JSON.parse(event.data) as Activity;
        addActivities([activity]);
      } catch (err) {
        console.error('Error parsing activity:', err);
      }
    });

    // Handle done event
    eventSource.addEventListener('done', () => {
      setIsDone(true);
      setIsStreaming(false);
      closeConnection();
    });

    // Handle error event from server
    eventSource.addEventListener('error', (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data);
        setError(new Error(data.message || 'Stream error'));
      } catch {
        // Ignore parse errors for connection errors
      }
    });
  }, [analysisId, userId, useSSE, isDone, closeConnection, addActivities]);

  // Fetch activities via API (fallback)
  const fetchActivities = useCallback(async () => {
    if (!analysisId || !userId) return;

    try {
      const api = createApi(userId);
      const data = await api.getActivityLogs(analysisId);

      if (Array.isArray(data)) {
        // Sort by created_at and limit
        const sorted = data
          .sort(
            (a: Activity, b: Activity) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
          .slice(-maxActivities);

        setActivities(sorted);
        setIsConnected(true);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(
        err instanceof Error ? err : new Error('Failed to fetch activities')
      );
      setIsConnected(false);
    }
  }, [analysisId, userId, maxActivities]);

  // Reconnect function for manual retry
  const reconnect = useCallback(() => {
    setIsDone(false);
    reconnectAttemptRef.current = 0;
    setError(null);
    if (useSSE) {
      connectSSE();
    } else {
      fetchActivities();
    }
  }, [useSSE, connectSSE, fetchActivities]);

  // Main effect: connect SSE or start polling
  useEffect(() => {
    if (!analysisId || !userId || !enabled) {
      closeConnection();
      setIsConnected(false);
      setIsStreaming(false);
      return;
    }

    if (useSSE && !isDone) {
      // Use SSE for real-time streaming
      connectSSE();
    } else {
      // Fallback to polling
      fetchActivities();
      const intervalId = setInterval(fetchActivities, pollingInterval);
      return () => clearInterval(intervalId);
    }

    return () => {
      closeConnection();
    };
  }, [
    analysisId,
    userId,
    enabled,
    useSSE,
    isDone,
    pollingInterval,
    connectSSE,
    fetchActivities,
    closeConnection,
  ]);

  return {
    activities,
    activitiesByModule,
    isConnected,
    isStreaming,
    error,
    clearActivities,
    getLatestForModule,
    isModuleProcessing,
    reconnect,
  };
}

/**
 * Get icon for activity type
 */
export function getActivityIcon(type: ActivityType): string {
  const icons: Record<ActivityType, string> = {
    search: '🔍',
    result: '✓',
    agent_start: '🤖',
    agent_complete: '✅',
    llm_call: '💭',
    progress: '⏳',
    error: '❌',
    hitl_pending: '👤',
  };
  return icons[type] || '•';
}

/**
 * Get CSS class for activity type
 */
export function getActivityColorClass(type: ActivityType): string {
  const classes: Record<ActivityType, string> = {
    search: 'text-blue-500',
    result: 'text-green-500',
    agent_start: 'text-purple-500',
    agent_complete: 'text-green-600',
    llm_call: 'text-amber-500',
    progress: 'text-gray-500',
    error: 'text-red-500',
    hitl_pending: 'text-orange-500',
  };
  return classes[type] || 'text-gray-400';
}
