import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePresets } from '@/hooks/usePresets';
import { useAnalyses } from '@/hooks/useAnalyses';
import { createApi } from '@/lib/api';
import { formatApiError } from '@/lib/api-errors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
}

const TestPage = () => {
  const { userId, loading: authLoading } = useAuth();
  const { data: presets, isLoading: presetsLoading, error: presetsError, refetch: refetchPresets } = usePresets();
  const { data: analysesData, isLoading: analysesLoading, error: analysesError, refetch: refetchAnalyses } = useAnalyses();

  const [directApiResult, setDirectApiResult] = useState<TestResult>({
    name: 'Direct API Call',
    status: 'pending',
    message: 'Not tested yet',
  });
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [chatResult, setChatResult] = useState<TestResult>({
    name: 'Chat API Call',
    status: 'pending',
    message: 'Not tested yet',
  });
  const [isTestingChat, setIsTestingChat] = useState(false);
  const [chatPreview, setChatPreview] = useState<string>('');

  const testDirectApi = async () => {
    if (!userId) {
      setDirectApiResult({
        name: 'Direct API Call',
        status: 'error',
        message: 'No userId available',
      });
      return;
    }

    setIsTestingApi(true);
    setDirectApiResult({
      name: 'Direct API Call',
      status: 'pending',
      message: 'Testing...',
    });

    try {
      const api = createApi(userId);
      const result = await api.listPresets();
      console.log('Direct API listPresets() result:', result);
      setDirectApiResult({
        name: 'Direct API Call',
        status: 'success',
        message: `Success! Got ${result.length} presets`,
      });
    } catch (error) {
      const errorMessage = formatApiError(error);
      console.error('Direct API listPresets() error:', error);
      setDirectApiResult({
        name: 'Direct API Call',
        status: 'error',
        message: errorMessage,
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  const testChatApi = async () => {
    if (!userId) {
      setChatResult({
        name: 'Chat API Call',
        status: 'error',
        message: 'No userId available',
      });
      return;
    }

    setIsTestingChat(true);
    setChatResult({
      name: 'Chat API Call',
      status: 'pending',
      message: 'Testing...',
    });

    try {
      const api = createApi(userId);
      const result = await api.chatJsonBlocks({
        model_provider: 'anthropic',
        messages: [
          { role: 'user', content: 'Summarize the Singapore fintech market in 3 bullets.' },
        ],
      });

      console.log('Chat API result:', result);
      setChatPreview(JSON.stringify(result.blocks?.slice(0, 3) || [], null, 2));
      setChatResult({
        name: 'Chat API Call',
        status: 'success',
        message: `Success! Got ${result.blocks?.length ?? 0} blocks`,
      });
    } catch (error) {
      const errorMessage = formatApiError(error);
      console.error('Chat API error:', error);
      setChatResult({
        name: 'Chat API Call',
        status: 'error',
        message: errorMessage,
      });
    } finally {
      setIsTestingChat(false);
    }
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />;
    }
  };

  const tests: TestResult[] = [
    {
      name: 'useAuth Hook',
      status: authLoading ? 'pending' : userId ? 'success' : 'error',
      message: authLoading ? 'Loading...' : userId ? `userId: ${userId}` : 'No userId found',
    },
    {
      name: 'usePresets Hook',
      status: presetsLoading ? 'pending' : presetsError ? 'error' : 'success',
      message: presetsLoading
        ? 'Loading...'
        : presetsError
        ? formatApiError(presetsError)
        : `Found ${presets?.length ?? 0} presets`,
    },
    {
      name: 'useAnalyses Hook',
      status: analysesLoading ? 'pending' : analysesError ? 'error' : 'success',
      message: analysesLoading
        ? 'Loading...'
        : analysesError
        ? formatApiError(analysesError)
        : `Found ${analysesData?.analyses?.length ?? 0} analyses (total: ${analysesData?.total ?? 0})`,
    },
    directApiResult,
    chatResult,
  ];

  // Log results to console
  console.log('=== Integration Test Results ===');
  console.log('Auth:', { userId, isLoading: authLoading });
  console.log('Presets:', { data: presets, isLoading: presetsLoading, error: presetsError });
  console.log('Analyses:', { data: analysesData, isLoading: analysesLoading, error: analysesError });
  console.log('================================');

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Integration Test Results</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchPresets();
                refetchAnalyses();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tests.map((test, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card"
            >
              <div className="mt-0.5">{getStatusIcon(test.status)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{test.name}</p>
                <p
                  className={`text-sm break-all ${
                    test.status === 'error' ? 'text-red-500' : 'text-muted-foreground'
                  }`}
                >
                  {test.message}
                </p>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t">
            <Button
              onClick={testDirectApi}
              disabled={isTestingApi || !userId}
              className="w-full"
            >
              {isTestingApi ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing Direct API...
                </>
              ) : (
                'Test api.listPresets() Directly'
              )}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={testChatApi}
              disabled={isTestingChat || !userId}
              className="w-full"
              variant="outline"
            >
              {isTestingChat ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing Chat API...
                </>
              ) : (
                'Test /api/chat (JSON blocks)'
              )}
            </Button>
            {chatPreview && (
              <pre className="mt-3 text-xs bg-muted p-3 rounded-lg overflow-auto max-h-48">
                {chatPreview}
              </pre>
            )}
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Raw Data (check console)</h3>
            <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-48">
              {JSON.stringify(
                {
                  userId,
                  presetsCount: presets?.length ?? 0,
                  analysesCount: analysesData?.analyses?.length ?? 0,
                  analysesTotal: analysesData?.total ?? 0,
                },
                null,
                2
              )}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestPage;
