export type JsonBlock =
  | { type: 'title' | 'section' | 'paragraph'; text: string }
  | { type: 'bullets'; title?: string; items: string[] }
  | { type: 'table'; title?: string; columns: string[]; rows: string[][] }
  | {
      type: 'chart';
      title?: string;
      chart_type: 'bar' | 'line' | 'pie';
      labels: string[];
      series: Array<{ name: string; data: number[] }>;
    }
  | {
      type: 'image';
      title?: string;
      description?: string;
      prompt?: string;
      url?: string;
    };

export interface JsonBlocksResponse {
  blocks: JsonBlock[];
  summary?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type ModelProvider = 'openai' | 'anthropic' | 'gemini';

export interface ChatRequest {
  model_provider: ModelProvider;
  model?: string;
  output_format: 'json_blocks';
  messages: ChatMessage[];
}
