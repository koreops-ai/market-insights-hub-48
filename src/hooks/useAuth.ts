import { useState, useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';

interface UseAuthReturn {
  userId: string | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth(): UseAuthReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Get userId from user store
  const storeUserId = useUserStore((state) => state.userId);
  
  // Use store userId or fallback for testing
  const userId = storeUserId || 'test-user-123';

  useEffect(() => {
    // Simulate auth initialization
    // TODO: Replace with Supabase auth when integrated
    // const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    //   setUserId(session?.user?.id ?? null);
    //   setLoading(false);
    // });
    
    const initAuth = async () => {
      try {
        // For now, just simulate a brief loading state
        await new Promise(resolve => setTimeout(resolve, 100));
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Auth initialization failed'));
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return { userId, loading, error };
}
