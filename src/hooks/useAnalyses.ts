import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createApi, Analysis } from '@/lib/api';
import { useAuth } from './useAuth';

// Hook to get authenticated API client
function useApiClient() {
  const { userId } = useAuth();
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return createApi(userId);
}

// Query: List analyses with pagination and optional status filter
export function useAnalyses(limit = 10, offset = 0, status?: string) {
  const { userId } = useAuth();
  
  return useQuery({
    queryKey: ['analyses', { limit, offset, status }],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const api = createApi(userId);
      return api.listAnalyses(limit, offset, status);
    },
    enabled: !!userId,
  });
}

// Query: Get single analysis by ID
export function useAnalysis(id: string) {
  const { userId } = useAuth();
  
  return useQuery({
    queryKey: ['analysis', id],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const api = createApi(userId);
      return api.getAnalysis(id);
    },
    enabled: !!userId && !!id,
  });
}

// Mutation: Create new analysis
export function useCreateAnalysis() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  
  return useMutation({
    mutationFn: async (data: Partial<Analysis>) => {
      if (!userId) throw new Error('User not authenticated');
      const api = createApi(userId);
      return api.createAnalysis(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
    },
  });
}

// Mutation: Update existing analysis
export function useUpdateAnalysis() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Analysis> }) => {
      if (!userId) throw new Error('User not authenticated');
      const api = createApi(userId);
      return api.updateAnalysis(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
      queryClient.invalidateQueries({ queryKey: ['analysis', variables.id] });
    },
  });
}

// Mutation: Delete analysis
export function useDeleteAnalysis() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error('User not authenticated');
      const api = createApi(userId);
      return api.deleteAnalysis(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
    },
  });
}

// Mutation: Start analysis
export function useStartAnalysis() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error('User not authenticated');
      const api = createApi(userId);
      return api.startAnalysis(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
      queryClient.invalidateQueries({ queryKey: ['analysis', id] });
    },
  });
}
