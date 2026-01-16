import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createApi, Checkpoint } from '@/lib/api';
import { useAuth } from './useAuth';

// Query: List pending checkpoints
export function useCheckpoints() {
  const { userId } = useAuth();
  
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
