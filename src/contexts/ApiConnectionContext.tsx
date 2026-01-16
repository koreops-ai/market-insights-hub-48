import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

type ConnectionStatus = 'idle' | 'checking' | 'connected' | 'failed';

interface ApiConnectionContextValue {
  status: ConnectionStatus;
  error: string | null;
  retry: () => void;
  lastChecked: Date | null;
}

const ApiConnectionContext = createContext<ApiConnectionContextValue | null>(null);

export function useApiConnection() {
  const context = useContext(ApiConnectionContext);
  if (!context) {
    throw new Error('useApiConnection must be used within ApiConnectionProvider');
  }
  return context;
}

interface ApiConnectionProviderProps {
  children: ReactNode;
}

export function ApiConnectionProvider({ children }: ApiConnectionProviderProps) {
  const { userId } = useAuth();
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [hasShownError, setHasShownError] = useState(false);

  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['api-connection-check'],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const api = createApi(userId);
      await api.listPresets();
      setLastChecked(new Date());
      return { connected: true };
    },
    enabled: !!userId,
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Determine status
  const status: ConnectionStatus = isLoading 
    ? 'checking' 
    : isError 
      ? 'failed' 
      : data?.connected 
        ? 'connected' 
        : 'idle';

  // Show toast on error (only once per failure)
  useEffect(() => {
    if (isError && !hasShownError) {
      setHasShownError(true);
      toast({
        variant: 'destructive',
        title: 'API Connection Failed',
        description: error instanceof Error ? error.message : 'Unable to connect to the API server',
        action: (
          <button
            onClick={() => refetch()}
            className="rounded bg-destructive-foreground px-3 py-1.5 text-xs font-medium text-destructive hover:opacity-90"
          >
            Retry
          </button>
        ),
      });
    }
  }, [isError, error, hasShownError, refetch]);

  // Reset error flag on successful connection
  useEffect(() => {
    if (data?.connected) {
      setHasShownError(false);
    }
  }, [data?.connected]);

  const retry = useCallback(() => {
    setHasShownError(false);
    refetch();
  }, [refetch]);

  const value: ApiConnectionContextValue = {
    status,
    error: isError && error instanceof Error ? error.message : null,
    retry,
    lastChecked,
  };

  return (
    <ApiConnectionContext.Provider value={value}>
      {children}
    </ApiConnectionContext.Provider>
  );
}
