// OpenRouter API Service for Kilo Chat IDE
// Handles model fetching and streaming chat responses

import { Message } from './types';

export async function fetchOpenRouterModels(apiKey?: string) {
    try {
        const finalApiKey = apiKey || '';
        if (!finalApiKey) {
            console.warn('No OpenRouter API key provided');
            return [];
        }

        const response = await fetch('https://openrouter.ai/api/v1/models', {
            headers: {
                'Authorization': `Bearer ${finalApiKey}`,
            }
        });
        if (!response.ok) throw new Error('Failed to fetch models');
        const data = await response.json();
        if (!data.data || !Array.isArray(data.data)) return [];

        return data.data.map((m: any) => ({
            id: m.id,
            name: m.name,
            provider: m.id.split('/')[0],
            context_length: m.context_length,
            description: m.description,
            pricing: m.pricing
        }));
    } catch (error) {
        console.error('Error fetching models:', error);
        return [];
    }
}

export async function sendMessageToOpenRouterStream(
    messages: Message[],
    modelId: string,
    apiKey: string,
    onChunk: (chunk: string) => void,
    onError?: (error: Error) => void
): Promise<string> {
    const finalApiKey = apiKey || '';

    if (!finalApiKey) {
        throw new Error('OpenRouter API key is missing.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${finalApiKey}`,
                'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
                'X-Title': 'Kilo Chat IDE',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: modelId,
                messages: messages.map(({ role, content }) => ({ role, content })),
                stream: true,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('Response body is null');

        let fullContent = '';
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');

            // Keep the last partial line in the buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

                const data = trimmedLine.slice(6);
                if (data === '[DONE]') continue;

                try {
                    const parsed = JSON.parse(data);

                    // Check for errors returned in the stream
                    if (parsed.error) {
                        throw new Error(parsed.error.message || 'Stream error');
                    }

                    const content = parsed.choices?.[0]?.delta?.content || '';
                    if (content) {
                        fullContent += content;
                        onChunk(content);
                    }
                } catch (e) {
                    // Only rethrow if it's our custom error
                    if (e instanceof Error && e.message.includes('Stream error')) {
                        throw e;
                    }
                    // Otherwise ignore parse errors for incomplete/malformed chunks
                }
            }
        }

        return fullContent;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timed out after 2 minutes.');
        }
        if (onError && error instanceof Error) {
            onError(error);
        }
        throw error;
    }
}

// Fetch available models from OpenRouter with pricing info
export async function getFreeModelsFromOpenRouter(apiKey: string) {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            }
        });

        if (!response.ok) return [];

        const data = await response.json();
        if (!data.data || !Array.isArray(data.data)) return [];

        // Filter for free models (pricing is 0)
        const freeModels = data.data.filter((m: any) =>
            parseFloat(m.pricing?.prompt || '0') === 0 &&
            parseFloat(m.pricing?.completion || '0') === 0
        );

        return freeModels.map((m: any) => ({
            id: m.id,
            name: m.name,
            provider: m.id.split('/')[0],
            context_length: m.context_length,
            description: m.description,
            pricing: m.pricing
        }));
    } catch (error) {
        console.error('Error fetching free models:', error);
        return [];
    }
}
