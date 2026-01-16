import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createApi, Preset } from '@/lib/api';
import { useAuth } from './useAuth';

// Query: List all presets
export function usePresets() {
  const { userId } = useAuth();
  
  return useQuery({
    queryKey: ['presets'],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const api = createApi(userId);
      return api.listPresets();
    },
    enabled: !!userId,
  });
}

// Query: Get single preset by ID
export function usePreset(id: string) {
  const { userId } = useAuth();
  
  return useQuery({
    queryKey: ['preset', id],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const api = createApi(userId);
      return api.getPreset(id);
    },
    enabled: !!userId && !!id,
  });
}

// Mutation: Create new preset
export function useCreatePreset() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  
  return useMutation({
    mutationFn: async (data: Partial<Preset>) => {
      if (!userId) throw new Error('User not authenticated');
      const api = createApi(userId);
      return api.createPreset(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] });
    },
  });
}

// Mutation: Update existing preset
export function useUpdatePreset() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Preset> }) => {
      if (!userId) throw new Error('User not authenticated');
      const api = createApi(userId);
      return api.updatePreset(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['presets'] });
      queryClient.invalidateQueries({ queryKey: ['preset', variables.id] });
    },
  });
}

// Mutation: Delete preset
export function useDeletePreset() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error('User not authenticated');
      const api = createApi(userId);
      return api.deletePreset(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] });
    },
  });
}
