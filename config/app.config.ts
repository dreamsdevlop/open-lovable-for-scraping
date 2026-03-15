// Application Configuration
// This file contains all configurable settings for the application

export const appConfig = {
  // Vercel Sandbox Configuration
  vercelSandbox: {
    // Sandbox timeout in minutes
    timeoutMinutes: 15,

    // Convert to milliseconds for Vercel Sandbox API
    get timeoutMs() {
      return this.timeoutMinutes * 60 * 1000;
    },

    // Development server port (Vercel Sandbox typically uses 3000 for Next.js/React)
    devPort: 3000,

    // Time to wait for dev server to be ready (in milliseconds)
    devServerStartupDelay: 7000,

    // Time to wait for CSS rebuild (in milliseconds)
    cssRebuildDelay: 2000,

    // Working directory in sandbox
    workingDirectory: '/app',

    // Default runtime for sandbox
    runtime: 'node22' // Available: node22, python3.13, v0-next-shadcn, cua-ubuntu-xfce
  },

  // E2B Sandbox Configuration
  e2b: {
    // Sandbox timeout in minutes
    timeoutMinutes: 30,

    // Convert to milliseconds for E2B API
    get timeoutMs() {
      return this.timeoutMinutes * 60 * 1000;
    },

    // Development server port (E2B uses 5173 for Vite)
    vitePort: 5173,

    // Time to wait for Vite dev server to be ready (in milliseconds)
    viteStartupDelay: 10000,

    // Working directory in sandbox
    workingDirectory: '/home/user/app',
  },

  // AI Model Configuration
  ai: {
    // Default AI model
    defaultModel: 'openrouter/nvidia/llama-3.1-nemotron-70b-instruct',

    // Available models (including OpenRouter free & cheap models)
    availableModels: [
      // OpenRouter FREE Models - Latest 2025
      'openrouter/meta-llama/llama-4-scout-17b-16e-instruct',  // NEW Llama 4
      'openrouter/meta-llama/llama-4-maverick-17b-8e-instruct',  // NEW Llama 4
      'openrouter/nvidia/llama-3.1-nemotron-70b-instruct',  // NEW NVIDIA
      'openrouter/nvidia/llama-3.3-nemotron-70b-instruct',  // NEW NVIDIA
      'openrouter/google/gemma-3-1b-it',  // NEW Gemma 3
      'openrouter/google/gemma-3-4b-it',  // NEW Gemma 3
      'openrouter/google/gemma-3-12b-it',  // NEW Gemma 3
      'openrouter/google/gemma-3-27b-it',  // NEW Gemma 3
      'openrouter/meta-llama/llama-3.1-8b-instruct',
      'openrouter/meta-llama/llama-3.1-70b-instruct',
      'openrouter/meta-llama/llama-3.3-70b-instruct',
      'openrouter/google/gemma-2-9b-it',
      'openrouter/google/gemma-2-27b-it',
      'openrouter/ai-anything/gpt-4o-mini',
      'openrouter/qwen/qwen-2.5-72b-instruct',
      'openrouter/qwen/qwen-2.5-32b-instruct',
      'openrouter/qwen/qwen-2.5-14b-instruct',
      'openrouter/cognition-labs/cognitive-llama-8b',
      'openrouter/mistralai/mistral-7b-instruct',
      'openrouter/mistralai/mistral-small-3.1-24b-instruct',
      'openrouter/NousResearch/hermes-3-llama-3.1-8b',
      'openrouter/01-ai/yi-1.5-34b-instruct',
      'openrouter/01-ai/yi-1.5-9b-instruct',
      // Reasoning (Free)
      'openrouter/openai/_reasoning-model',
      'openrouter/google/gemini-2.0-flash-exp:free',
      'openrouter/deepseek/deepseek-prover',  // NEW Reasoning
      // Cheap/Discounted
      'openrouter/amazon/nova-lite-v1',
      'openrouter/amazon/nova-micro-v1',
      'openrouter/deepseek/deepseek-chat',
      'openrouter/deepseek/deepseek-coder',
      // Paid Models
      'openai/gpt-5',
      'moonshotai/kimi-k2-instruct-0905',
      'anthropic/claude-sonnet-4-20250514',
      'google/gemini-3-pro-preview'
    ],

    // Model display names
    modelDisplayNames: {
      // NEW Llama 4
      'openrouter/meta-llama/llama-4-scout-17b-16e-instruct': '⚡ Llama 4 Scout 17B (Free)',
      'openrouter/meta-llama/llama-4-maverick-17b-8e-instruct': '⚡ Llama 4 Maverick 17B (Free)',
      // NEW NVIDIA
      'openrouter/nvidia/llama-3.1-nemotron-70b-instruct': '🟡 NVIDIA Nemotron 70B (Free)',
      'openrouter/nvidia/llama-3.3-nemotron-70b-instruct': '🟡 NVIDIA Nemotron 70B (Free)',
      // NEW Gemma 3
      'openrouter/google/gemma-3-1b-it': '🟡 Gemma 3 1B (Free)',
      'openrouter/google/gemma-3-4b-it': '🟡 Gemma 3 4B (Free)',
      'openrouter/google/gemma-3-12b-it': '🟡 Gemma 3 12B (Free)',
      'openrouter/google/gemma-3-27b-it': '🟡 Gemma 3 27B (Free)',
      // OpenRouter Free
      'openrouter/meta-llama/llama-3.1-8b-instruct': '🟡 Llama 3.1 8B (Free)',
      'openrouter/meta-llama/llama-3.1-70b-instruct': '🟡 Llama 3.1 70B (Free)',
      'openrouter/meta-llama/llama-3.3-70b-instruct': '🟡 Llama 3.3 70B (Free)',
      'openrouter/google/gemma-2-9b-it': '🟡 Gemma 2 9B (Free)',
      'openrouter/google/gemma-2-27b-it': '🟡 Gemma 2 27B (Free)',
      'openrouter/ai-anything/gpt-4o-mini': '🟡 GPT-4o Mini (Free)',
      'openrouter/qwen/qwen-2.5-72b-instruct': '🟡 Qwen 2.5 72B (Free)',
      'openrouter/qwen/qwen-2.5-32b-instruct': '🟡 Qwen 2.5 32B (Free)',
      'openrouter/qwen/qwen-2.5-14b-instruct': '🟡 Qwen 2.5 14B (Free)',
      'openrouter/cognition-labs/cognitive-llama-8b': '🟡 Cognitive Llama 8B (Free)',
      'openrouter/mistralai/mistral-7b-instruct': '🟡 Mistral 7B (Free)',
      'openrouter/mistralai/mistral-small-3.1-24b-instruct': '🟡 Mistral Small 24B (Free)',
      'openrouter/NousResearch/hermes-3-llama-3.1-8b': '🟡 Hermes 3 (Free)',
      'openrouter/01-ai/yi-1.5-34b-instruct': '🟡 Yi 1.5 34B (Free)',
      'openrouter/01-ai/yi-1.5-9b-instruct': '🟡 Yi 1.5 9B (Free)',
      // Reasoning
      'openrouter/openai/_reasoning-model': '🔵 OpenAI Reasoner (Free)',
      'openrouter/google/gemini-2.0-flash-exp:free': '🟡 Gemini 2 Flash (Free)',
      'openrouter/deepseek/deepseek-prover': '🔵 DeepSeek Prover (Free)',
      // Cheap
      'openrouter/amazon/nova-lite-v1': '🟢 Nova Lite (Cheap)',
      'openrouter/amazon/nova-micro-v1': '🟢 Nova Micro (Cheap)',
      'openrouter/deepseek/deepseek-chat': '🟢 DeepSeek Chat (Cheap)',
      'openrouter/deepseek/deepseek-coder': '🟢 DeepSeek Coder (Cheap)',
      // Paid
      'openai/gpt-5': '🔴 GPT-5 (Paid)',
      'moonshotai/kimi-k2-instruct-0905': '🟣 Kimi K2 (Groq)',
      'anthropic/claude-sonnet-4-20250514': '🔴 Sonnet 4 (Paid)',
      'google/gemini-3-pro-preview': '🔴 Gemini 3 Pro (Preview)'
    } as Record<string, string>,

    // Model provider info with details
    modelProviders: {
      // NEW Llama 4
      'openrouter/meta-llama/llama-4-scout-17b-16e-instruct': { provider: 'Meta (OpenRouter)', context: '200K', type: 'free' },
      'openrouter/meta-llama/llama-4-maverick-17b-8e-instruct': { provider: 'Meta (OpenRouter)', context: '200K', type: 'free' },
      // NEW NVIDIA
      'openrouter/nvidia/llama-3.1-nemotron-70b-instruct': { provider: 'NVIDIA (OpenRouter)', context: '128K', type: 'free' },
      'openrouter/nvidia/llama-3.3-nemotron-70b-instruct': { provider: 'NVIDIA (OpenRouter)', context: '128K', type: 'free' },
      // NEW Gemma 3
      'openrouter/google/gemma-3-1b-it': { provider: 'Google (OpenRouter)', context: '128K', type: 'free' },
      'openrouter/google/gemma-3-4b-it': { provider: 'Google (OpenRouter)', context: '128K', type: 'free' },
      'openrouter/google/gemma-3-12b-it': { provider: 'Google (OpenRouter)', context: '128K', type: 'free' },
      'openrouter/google/gemma-3-27b-it': { provider: 'Google (OpenRouter)', context: '128K', type: 'free' },
      // OpenRouter Models
      'openrouter/meta-llama/llama-3.1-8b-instruct': { provider: 'Meta (OpenRouter)', context: '128K', type: 'free' },
      'openrouter/meta-llama/llama-3.1-70b-instruct': { provider: 'Meta (OpenRouter)', context: '128K', type: 'free' },
      'openrouter/meta-llama/llama-3.3-70b-instruct': { provider: 'Meta (OpenRouter)', context: '128K', type: 'free' },
      'openrouter/google/gemma-2-9b-it': { provider: 'Google (OpenRouter)', context: '128K', type: 'free' },
      'openrouter/google/gemma-2-27b-it': { provider: 'Google (OpenRouter)', context: '128K', type: 'free' },
      'openrouter/ai-anything/gpt-4o-mini': { provider: 'OpenAI (OpenRouter)', context: '128K', type: 'free' },
      'openrouter/qwen/qwen-2.5-72b-instruct': { provider: 'Qwen (OpenRouter)', context: '128K', type: 'free' },
      'openrouter/qwen/qwen-2.5-32b-instruct': { provider: 'Qwen (OpenRouter)', context: '128K', type: 'free' },
      'openrouter/qwen/qwen-2.5-14b-instruct': { provider: 'Qwen (OpenRouter)', context: '128K', type: 'free' },
      'openrouter/cognition-labs/cognitive-llama-8b': { provider: 'Cognition Labs (OpenRouter)', context: '128K', type: 'free' },
      'openrouter/mistralai/mistral-7b-instruct': { provider: 'Mistral AI (OpenRouter)', context: '128K', type: 'free' },
      'openrouter/mistralai/mistral-small-3.1-24b-instruct': { provider: 'Mistral AI (OpenRouter)', context: '128K', type: 'free' },
      'openrouter/NousResearch/hermes-3-llama-3.1-8b': { provider: 'Nous Research (OpenRouter)', context: '128K', type: 'free' },
      'openrouter/01-ai/yi-1.5-34b-instruct': { provider: '01.AI (OpenRouter)', context: '128K', type: 'free' },
      'openrouter/01-ai/yi-1.5-9b-instruct': { provider: '01.AI (OpenRouter)', context: '128K', type: 'free' },
      // Reasoning
      'openrouter/openai/_reasoning-model': { provider: 'OpenAI (OpenRouter)', context: '200K', type: 'free' },
      'openrouter/google/gemini-2.0-flash-exp:free': { provider: 'Google (OpenRouter)', context: '1M', type: 'free' },
      'openrouter/deepseek/deepseek-prover': { provider: 'DeepSeek (OpenRouter)', context: '64K', type: 'free' },
      // Cheap
      'openrouter/amazon/nova-lite-v1': { provider: 'Amazon (OpenRouter)', context: '1M', type: 'cheap' },
      'openrouter/amazon/nova-micro-v1': { provider: 'Amazon (OpenRouter)', context: '128K', type: 'cheap' },
      'openrouter/deepseek/deepseek-chat': { provider: 'DeepSeek (OpenRouter)', context: '64K', type: 'cheap' },
      'openrouter/deepseek/deepseek-coder': { provider: 'DeepSeek (OpenRouter)', context: '64K', type: 'cheap' },
      // Direct API models
      'openai/gpt-5': { provider: 'OpenAI', context: '128K', type: 'paid' },
      'moonshotai/kimi-k2-instruct-0905': { provider: 'Moonshot (Groq)', context: '128K', type: 'cheap' },
      'anthropic/claude-sonnet-4-20250514': { provider: 'Anthropic', context: '200K', type: 'paid' },
      'google/gemini-3-pro-preview': { provider: 'Google', context: '1M', type: 'preview' }
    } as Record<string, { provider: string; context: string; type: 'free' | 'cheap' | 'paid' | 'preview' }>,

    // Model API configuration
    modelApiConfig: {
      'moonshotai/kimi-k2-instruct-0905': {
        provider: 'groq',
        model: 'moonshotai/kimi-k2-instruct-0905'
      }
    },

    // Temperature settings for non-reasoning models
    defaultTemperature: 0.7,

    // Max tokens for code generation
    maxTokens: 8000,

    // Max tokens for truncation recovery
    truncationRecoveryMaxTokens: 4000,
  },

  // Code Application Configuration
  codeApplication: {
    // Delay after applying code before refreshing iframe (milliseconds)
    defaultRefreshDelay: 2000,

    // Delay when packages are installed (milliseconds)
    packageInstallRefreshDelay: 5000,

    // Enable/disable automatic truncation recovery
    enableTruncationRecovery: false, // Disabled - too many false positives

    // Maximum number of truncation recovery attempts per file
    maxTruncationRecoveryAttempts: 1,
  },

  // UI Configuration
  ui: {
    // Show/hide certain UI elements
    showModelSelector: true,
    showStatusIndicator: true,

    // Animation durations (milliseconds)
    animationDuration: 200,

    // Toast notification duration (milliseconds)
    toastDuration: 3000,

    // Maximum chat messages to keep in memory
    maxChatMessages: 100,

    // Maximum recent messages to send as context
    maxRecentMessagesContext: 20,
  },

  // Development Configuration
  dev: {
    // Enable debug logging
    enableDebugLogging: true,

    // Enable performance monitoring
    enablePerformanceMonitoring: false,

    // Log API responses
    logApiResponses: true,
  },

  // Package Installation Configuration
  packages: {
    // Use --legacy-peer-deps flag for npm install
    useLegacyPeerDeps: true,

    // Package installation timeout (milliseconds)
    installTimeout: 60000,

    // Auto-restart Vite after package installation
    autoRestartVite: true,
  },

  // File Management Configuration
  files: {
    // Excluded file patterns (files to ignore)
    excludePatterns: [
      'node_modules/**',
      '.git/**',
      '.next/**',
      'dist/**',
      'build/**',
      '*.log',
      '.DS_Store'
    ],

    // Maximum file size to read (bytes)
    maxFileSize: 1024 * 1024, // 1MB

    // File extensions to treat as text
    textFileExtensions: [
      '.js', '.jsx', '.ts', '.tsx',
      '.css', '.scss', '.sass',
      '.html', '.xml', '.svg',
      '.json', '.yml', '.yaml',
      '.md', '.txt', '.env',
      '.gitignore', '.dockerignore'
    ],
  },

  // API Endpoints Configuration (for external services)
  api: {
    // Retry configuration
    maxRetries: 3,
    retryDelay: 1000, // milliseconds

    // Request timeout (milliseconds)
    requestTimeout: 30000,
  }
};

// Type-safe config getter
export function getConfig<K extends keyof typeof appConfig>(key: K): typeof appConfig[K] {
  return appConfig[key];
}

// Helper to get nested config values
export function getConfigValue(path: string): any {
  return path.split('.').reduce((obj, key) => obj?.[key], appConfig as any);
}

export default appConfig;