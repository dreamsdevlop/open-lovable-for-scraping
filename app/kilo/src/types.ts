export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  modelId?: string;
  modelName?: string;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  context_length?: number;
  description?: string;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

export const SUPPORTED_MODELS: Model[] = [
  { id: 'google/gemini-2.0-flash-lite-preview-02-05:free', name: 'Gemini 2.0 Lite (Fast)', provider: 'Google' },
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash (Fast)', provider: 'Google' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)', provider: 'Meta' },
  { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B (Lightning)', provider: 'Meta' },
  { id: 'deepseek/deepseek-chat:free', name: 'DeepSeek Chat (Fast)', provider: 'DeepSeek' },
  { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B (Free)', provider: 'Alibaba' },
  { id: 'qwen/qwen-2.5-7b-instruct:free', name: 'Qwen 2.5 7B (Lightning)', provider: 'Alibaba' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Lightning)', provider: 'Mistral' },
  { id: 'google/gemini-2.0-pro-exp-02-05:free', name: 'Gemini 2.0 Pro (Free)', provider: 'Google' },
];
