import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createApi, Checkpoint } from '@/lib/api';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';

// Query: List pending checkpoints with real-time updates
export function useCheckpoints() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  // Subscribe to real-time checkpoint changes
  useEffect(() => {
    if (!userId || !supabase) return;

    const channel = supabase
      .channel('hitl-checkpoints')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'checkpoints',
        },
        () => {
          // Invalidate and refetch checkpoints when any change occurs
          queryClient.invalidateQueries({ queryKey: ['checkpoints'] });
          // Also refresh analyses as status may have changed
          queryClient.invalidateQueries({ queryKey: ['analyses'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return useQuery({
    queryKey: ['checkpoints'],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const api = createApi(userId);
      return api.listCheckpoints();
    },
    enabled: !!userId,
  });
}

// Mutation payload type
export interface ResolveCheckpointData {
  checkpointId: string;
  action: 'approve_all' | 'request_revision' | 'reject';
  comment?: string;
  adjustments?: Record<string, unknown>;
}

// Mutation: Resolve checkpoint
export function useResolveCheckpoint() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  
  return useMutation({
    mutationFn: async ({ checkpointId, action, comment, adjustments }: ResolveCheckpointData) => {
      if (!userId) throw new Error('User not authenticated');
      const api = createApi(userId);
      return api.resolveCheckpoint(checkpointId, { action, comment, adjustments });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkpoints'] });
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
    },
  });
}
