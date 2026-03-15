# Open Lovable - OpenRouter Integration Guide

This guide explains how to configure OpenRouter as an alternative LLM provider in the Open Lovable application.

## Table of Contents
1. [What is OpenRouter?](#what-is-openrouter)
2. [Getting Your OpenRouter API Key](#getting-your-openrouter-api-key)
3. [Environment Configuration](#environment-configuration)
4. [Configuration Files Modified](#configuration-files-modified)
5. [Available Models](#available-models)
6. [How to Use OpenRouter Models](#how-to-use-openrouter-models)
7. [Troubleshooting](#troubleshooting)

---

## What is OpenRouter?

OpenRouter is a unified API gateway that provides access to 300+ AI models from various providers (OpenAI, Anthropic, Google, Meta, etc.) through a single API. It offers:
- **Free credits** for new users
- **Competitive pricing** on paid models
- **Access to models** that require separate API keys

---

## Getting Your OpenRouter API Key

### Step 1: Sign Up
1. Go to [https://openrouter.ai/](https://openrouter.ai/)
2. Click "Sign Up" and create an account
3. Verify your email address

### Step 2: Get API Key
1. Log in to your OpenRouter dashboard
2. Click on "API Keys" in the sidebar
3. Click "Create Key"
4. Copy the key (it starts with `sk-or-`)

### Step 3: Get Free Credits
- New accounts receive free credits (typically $1-5)
- Visit the "Credits" page to see your balance

---

## Environment Configuration

### Required Environment Variable

Add the following to your `.env.local` file:

```env
# OpenRouter API Key (get from https://openrouter.ai/keys)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Other Environment Variables

Your `.env.local` should contain:

```env
# Required
FIRECRAWL_API_KEY=your_firecrawl_api_key

# OpenRouter (for free/cheap AI)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxx

# Sandbox Provider
SANDBOX_PROVIDER=vercel

# Vercel (for sandbox)
VERCEL_OIDC_TOKEN=your_vercel_oidc_token

# Optional: Other AI providers (if needed)
# GEMINI_API_KEY=your_gemini_key
# ANTHROPIC_API_KEY=your_anthropic_key
```

---

## Configuration Files Modified

The following files have been modified to support OpenRouter:

### 1. `app/api/generate-ai-code-stream/route.ts`
- Added OpenRouter client initialization
- Added model detection for `openrouter/` prefix
- Added model routing logic

### 2. `app/api/analyze-edit-intent/route.ts`
- Added OpenRouter client initialization
- Added model detection for edit intent analysis

### 3. `config/app.config.ts`
- Added 20+ OpenRouter models to `availableModels`
- Added display names for all models
- Set default model to `openrouter/meta-llama/llama-3.1-8b-instruct`

### 4. `app/generation/page.tsx`
- Made model selector searchable with datalist

---

## Available Models

### Free Models (Recommended for Code Generation)

| Model ID | Display Name | Best For |
|----------|--------------|----------|
| `openrouter/meta-llama/llama-3.1-8b-instruct` | Llama 3.1 8B (Free) | Fast, general coding |
| `openrouter/meta-llama/llama-3.1-70b-instruct` | Llama 3.1 70B (Free) | Better quality |
| `openrouter/meta-llama/llama-3.3-70b-instruct` | Llama 3.3 70B (Free) | Latest Llama |
| `openrouter/google/gemma-2-9b-it` | Gemma 2 9B (Free) | Google's model |
| `openrouter/google/gemma-2-27b-it` | Gemma 2 27B (Free) | Larger Gemma |
| `openrouter/ai-anything/gpt-4o-mini` | GPT-4o Mini (Free) | Mini GPT-4 |
| `openrouter/qwen/qwen-2.5-72b-instruct` | Qwen 2.5 72B (Free) | Alibaba's model |
| `openrouter/mistralai/mistral-7b-instruct` | Mistral 7B (Free) | Mistral's model |
| `openrouter/NousResearch/hermes-3-llama-3.1-8b` | Hermes 3 (Free) | Enhanced Llama |

### Cheap/Discounted Models

| Model ID | Display Name | Price |
|----------|--------------|-------|
| `openrouter/amazon/nova-lite-v1` | Nova Lite (Cheap) | Very cheap |
| `openrouter/amazon/nova-micro-v1` | Nova Micro (Cheap) | Cheapest |
| `openrouter/deepseek/deepseek-chat` | DeepSeek Chat (Cheap) | Good value |
| `openrouter/deepseek/deepseek-coder` | DeepSeek Coder (Cheap) | Code specialized |

### Paid Models (Higher Quality)

| Model ID | Display Name |
|----------|--------------|
| `openai/gpt-5` | GPT-5 (Paid) |
| `anthropic/claude-sonnet-4-20250514` | Sonnet 4 (Paid) |
| `google/gemini-3-pro-preview` | Gemini 3 Pro |

---

## How to Use OpenRouter Models

### Method 1: Using the Dropdown
1. Open the app at http://localhost:3000
2. Look for the model selector dropdown
3. Select any model with "(Free)" or "(Cheap)" suffix

### Method 2: Search/Filter Models
1. Click on the model selector
2. Type to filter (e.g., "llama", "gemma")
3. Select from filtered results

### Method 3: Custom Model (Advanced)
1. Click on the model selector
2. Type a custom OpenRouter model ID directly:
   - Example: `openrouter/anthropic/claude-3-opus`
   - Example: `openrouter/google/gemini-pro-1.5`

---

## Troubleshooting

### Issue: "OpenRouter is not enabled"
**Solution:** Make sure `OPENROUTER_API_KEY` is set in `.env.local`

### Issue: "Model not found" error
**Solution:** Check that the model ID is correct. Visit [OpenRouter's model list](https://openrouter.ai/models) for valid model IDs.

### Issue: "Quota exceeded" or "Insufficient credits"
**Solution:** 
- Check your OpenRouter credits at https://openrouter.ai/credits
- Switch to a different free model
- Wait for daily quota reset
- Add more credits to your account

### Issue: "Rate limit exceeded"
**Solution:**
- Wait a few seconds and retry
- Switch to a different free model (some have higher limits)
- Reduce the frequency of requests

### Issue: "Sandbox not listening"
**Solution:** This is a Vercel sandbox issue. Try:
1. Click the refresh button in the app
2. Or create a new sandbox

### Issue: Still using wrong provider
**Solution:** 
1. Check `.env.local` has correct API keys
2. Make sure the model starts with `openrouter/` prefix
3. Restart the dev server: `Ctrl+C` then `npm run dev`

### Issue: Model returns empty response
**Solution:**
1. Try a different model (some models are better for code generation)
2. Check if the model supports the task
3. Try "Llama 3.1 70B" or "GPT-4o Mini" for better results

### Common Error Messages & Solutions

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Insufficient credits" | No credits left | Add credits at openrouter.ai |
| "Rate limit exceeded" | Too many requests | Wait and retry, or switch model |
| "Model not found" | Invalid model ID | Check model ID at openrouter.ai/models |
| "API key invalid" | Wrong API key | Verify key in OpenRouter dashboard |
| "Context length exceeded" | Input too long | Simplify your prompt |
| "Service unavailable" | Provider down | Try different model or wait |

---

## Best Practices

1. **Use Free Models First** - Start with `Llama 3.1 8B (Free)` for development
2. **Monitor Credits** - Check your OpenRouter dashboard regularly
3. **Set Budgets** - OpenRouter allows setting spending limits
4. **Test Different Models** - Different models have different strengths
5. **Check Model Capabilities** - Some models are better for code generation

---

## Related Documentation

- [OpenRouter Official Docs](https://openrouter.ai/docs)
- [OpenRouter Model List](https://openrouter.ai/models)
- [OpenRouter Pricing](https://openrouter.ai/pricing)
