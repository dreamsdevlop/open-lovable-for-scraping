// Kilo Chat IDE Types
// Types for the multi-model AI chat interface

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

// Default supported models
export const SUPPORTED_MODELS: Model[] = [
    // New Llama 4
    { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B', provider: 'Meta', context_length: 200000 },
    { id: 'meta-llama/llama-4-maverick-17b-8e-instruct', name: 'Llama 4 Maverick 17B', provider: 'Meta', context_length: 200000 },
    // NVIDIA
    { id: 'nvidia/llama-3.1-nemotron-70b-instruct', name: 'NVIDIA Nemotron 70B', provider: 'NVIDIA', context_length: 128000 },
    { id: 'nvidia/llama-3.3-nemotron-70b-instruct', name: 'NVIDIA Nemotron 70B v2', provider: 'NVIDIA', context_length: 128000 },
    // Gemma 3
    { id: 'google/gemma-3-27b-it', name: 'Gemma 3 27B', provider: 'Google', context_length: 128000 },
    { id: 'google/gemma-3-12b-it', name: 'Gemma 3 12B', provider: 'Google', context_length: 128000 },
    { id: 'google/gemma-3-4b-it', name: 'Gemma 3 4B', provider: 'Google', context_length: 128000 },
    { id: 'google/gemma-3-1b-it', name: 'Gemma 3 1B', provider: 'Google', context_length: 128000 },
    // Llama 3.x
    { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'Meta', context_length: 128000 },
    { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta', context_length: 128000 },
    { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', provider: 'Meta', context_length: 128000 },
    // Other popular free models
    { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2 Flash', provider: 'Google', context_length: 1000000 },
    { id: 'ai-anything/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', context_length: 128000 },
    { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', provider: 'Alibaba', context_length: 128000 },
    { id: 'qwen/qwen-2.5-32b-instruct', name: 'Qwen 2.5 32B', provider: 'Alibaba', context_length: 128000 },
    { id: 'qwen/qwen-2.5-14b-instruct', name: 'Qwen 2.5 14B', provider: 'Alibaba', context_length: 128000 },
    { id: 'mistralai/mistral-small-3.1-24b-instruct', name: 'Mistral Small 24B', provider: 'Mistral', context_length: 128000 },
    { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B', provider: 'Mistral', context_length: 128000 },
    { id: 'cognition-labs/cognitive-llama-8b', name: 'Cognitive Llama 8B', provider: 'Cognition Labs', context_length: 128000 },
    { id: 'NousResearch/hermes-3-llama-3.1-8b', name: 'Hermes 3 Llama', provider: 'Nous Research', context_length: 128000 },
    { id: '01-ai/yi-1.5-34b-instruct', name: 'Yi 1.5 34B', provider: '01.AI', context_length: 128000 },
    { id: '01-ai/yi-1.5-9b-instruct', name: 'Yi 1.5 9B', provider: '01.AI', context_length: 128000 },
    { id: 'google/gemma-2-9b-it', name: 'Gemma 2 9B', provider: 'Google', context_length: 128000 },
    { id: 'google/gemma-2-27b-it', name: 'Gemma 2 27B', provider: 'Google', context_length: 128000 },
    // Reasoning models
    { id: 'openai/_reasoning-model', name: 'OpenAI Reasoner', provider: 'OpenAI', context_length: 200000 },
    { id: 'deepseek/deepseek-prover', name: 'DeepSeek Prover', provider: 'DeepSeek', context_length: 64000 },
    // Cheap models
    { id: 'amazon/nova-lite-v1', name: 'Nova Lite', provider: 'Amazon', context_length: 1000000 },
    { id: 'amazon/nova-micro-v1', name: 'Nova Micro', provider: 'Amazon', context_length: 128000 },
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek', context_length: 64000 },
    { id: 'deepseek/deepseek-coder', name: 'DeepSeek Coder', provider: 'DeepSeek', context_length: 64000 },
];

// Group models by provider for display
export const MODEL_GROUPS = {
    '⚡ Llama 4': SUPPORTED_MODELS.filter(m => m.id.includes('llama-4')),
    '🟡 NVIDIA': SUPPORTED_MODELS.filter(m => m.id.includes('nemotron')),
    '🟡 Gemma 3': SUPPORTED_MODELS.filter(m => m.id.includes('gemma-3')),
    '🟡 Llama 3.x': SUPPORTED_MODELS.filter(m => m.id.includes('llama-3') && !m.id.includes('llama-4')),
    '🟡 Other': SUPPORTED_MODELS.filter(m =>
        !m.id.includes('llama') &&
        !m.id.includes('gemma') &&
        !m.id.includes('nemotron') &&
        !m.id.includes('reasoning') &&
        !m.id.includes('prover') &&
        !m.id.includes('nova') &&
        !m.id.includes('deepseek')
    ),
    '🔵 Reasoning': SUPPORTED_MODELS.filter(m => m.id.includes('reasoning') || m.id.includes('prover')),
    '🟢 Cheap': SUPPORTED_MODELS.filter(m =>
        m.id.includes('nova') ||
        m.id.includes('deepseek-chat') ||
        m.id.includes('deepseek-coder')
    ),
};
