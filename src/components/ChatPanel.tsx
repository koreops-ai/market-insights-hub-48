import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { createApi } from '@/lib/api';
import type { ChatMessage, JsonBlocksResponse, ModelProvider } from '@/types/blocks';

interface ChatPanelProps {
  onBlocks: (data: JsonBlocksResponse) => void;
}

const MODEL_OPTIONS: Record<ModelProvider, string[]> = {
  openai: ['gpt-4o-mini', 'gpt-4o'],
  anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'],
  gemini: ['gemini-1.5-pro', 'gemini-1.5-flash'],
};

export function ChatPanel({ onBlocks }: ChatPanelProps) {
  const { toast } = useToast();
  const { userId } = useAuth();
  const [provider, setProvider] = useState<ModelProvider>('anthropic');
  const [model, setModel] = useState(MODEL_OPTIONS.anthropic[0]);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setModel(MODEL_OPTIONS[provider][0]);
  }, [provider]);

  const api = useMemo(() => (userId ? createApi(userId) : null), [userId]);

  const handleSend = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Enter a prompt', description: 'Please type a question to start.' });
      return;
    }
    if (!api) {
      toast({ title: 'Not authenticated', description: 'User ID is missing.' });
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: prompt.trim() },
    ];

    setIsLoading(true);
    setPrompt('');

    try {
      const result = await api.chatJsonBlocks({
        model_provider: provider,
        model,
        messages: nextMessages,
      });

      setMessages([
        ...nextMessages,
        { role: 'assistant', content: result.summary || 'Generated research output.' },
      ]);
      onBlocks(result);
    } catch (error) {
      toast({
        title: 'Chat failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Model Provider</div>
        <Select value={provider} onValueChange={(value) => setProvider(value as ModelProvider)}>
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="gemini">Gemini</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Model</div>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger>
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {MODEL_OPTIONS[provider].map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Prompt</div>
        <Textarea
          placeholder="Ask a research question..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
        />
      </div>

      <Button onClick={handleSend} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Research'}
      </Button>

      {messages.length > 0 && (
        <div className="text-xs text-muted-foreground space-y-2">
          {messages.slice(-6).map((msg, idx) => (
            <div key={`${msg.role}-${idx}`}>
              <span className="font-semibold uppercase">{msg.role}:</span> {msg.content}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
