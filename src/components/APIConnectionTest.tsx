import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Loader2, RefreshCw, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE_URL } from '@/config/api';
import { createApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export function APIConnectionTest() {
  const { userId } = useAuth();
  const [testKey, setTestKey] = useState(0);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['api-connection-test', testKey],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const api = createApi(userId);
      const presets = await api.listPresets();
      return { success: true, count: presets.length };
    },
    enabled: !!userId,
    retry: false,
    staleTime: 0,
  });

  const handleRetry = () => {
    setTestKey((prev) => prev + 1);
    refetch();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wifi className="h-5 w-5" />
          API Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API URL */}
        <div className="rounded-md bg-muted p-3">
          <p className="text-xs text-muted-foreground mb-1">Testing endpoint:</p>
          <code className="text-sm font-mono break-all">{API_BASE_URL}/api/presets</code>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center py-6">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin" />
              <span className="text-sm">Testing connection...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-2 text-destructive">
              <XCircle className="h-10 w-10" />
              <span className="font-medium">Connection Failed</span>
              <p className="text-sm text-center text-muted-foreground max-w-xs">
                {error instanceof Error ? error.message : 'Unknown error occurred'}
              </p>
            </div>
          ) : data?.success ? (
            <div className="flex flex-col items-center gap-2 text-green-600 dark:text-green-500">
              <CheckCircle2 className="h-10 w-10" />
              <span className="font-medium">Connected</span>
              <p className="text-sm text-muted-foreground">
                API responded successfully
              </p>
            </div>
          ) : null}
        </div>

        {/* User ID Info */}
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground mb-1">Using User ID:</p>
          <code className="text-sm font-mono">{userId || 'Not authenticated'}</code>
        </div>

        {/* Retry Button */}
        <Button 
          onClick={handleRetry} 
          variant="outline" 
          className="w-full"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Testing...' : 'Retry Connection'}
        </Button>
      </CardContent>
    </Card>
  );
}
