// Kilo Chat IDE - Main Page
// Multi-model AI chat interface with streaming responses

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Send,
    Bot,
    User,
    Settings,
    Plus,
    Trash2,
    Code,
    Loader2,
    X,
    Sparkles,
    ChevronDown,
    Search,
    Copy,
    Check,
    Terminal,
    MessageSquare
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { Message, Model, SUPPORTED_MODELS, MODEL_GROUPS } from '../kilo-chat/types';
import { sendMessageToOpenRouterStream, fetchOpenRouterModels } from '../kilo-chat/openRouterService';

// Helper function to merge Tailwind classes
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

export default function ChatPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [messages, setMessages] = useState<Message[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('kilo_messages');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    const [input, setInput] = useState('');
    const [selectedModel, setSelectedModel] = useState<Model>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('kilo_selected_model');
            return saved ? JSON.parse(saved) : SUPPORTED_MODELS[0];
        }
        return SUPPORTED_MODELS[0];
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showModelSelector, setShowModelSelector] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('kilo_system_prompt') || 'You are a professional AI coding assistant. Provide concise, accurate, and high-quality code solutions.';
        }
        return 'You are a professional AI coding assistant. Provide concise, accurate, and high-quality code solutions.';
    });

    const [allModels, setAllModels] = useState<Model[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFetchingModels, setIsFetchingModels] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Get OpenRouter API key from environment
    const openRouterKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('kilo_messages', JSON.stringify(messages));
        }
    }, [messages]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('kilo_selected_model', JSON.stringify(selectedModel));
        }
    }, [selectedModel]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('kilo_system_prompt', systemPrompt);
        }
    }, [systemPrompt]);

    // Load models from OpenRouter on mount
    useEffect(() => {
        const loadModels = async () => {
            if (!openRouterKey) {
                console.warn('No OpenRouter API key found');
                return;
            }

            setIsFetchingModels(true);
            try {
                const models = await fetchOpenRouterModels(openRouterKey);
                // Filter for free models (pricing is 0)
                const freeModels = models.filter((m: any) =>
                    parseFloat(m.pricing?.prompt || '0') === 0 && parseFloat(m.pricing?.completion || '0') === 0
                );

                if (freeModels.length > 0) {
                    // Merge with our predefined models
                    const existingIds = new Set(SUPPORTED_MODELS.map(m => m.id));
                    const newModels = freeModels.filter((m: any) => !existingIds.has(m.id));
                    setAllModels([...SUPPORTED_MODELS, ...newModels.map((m: any) => ({
                        id: m.id,
                        name: m.name,
                        provider: m.provider,
                        context_length: m.context_length,
                        description: m.description
                    }))]);
                } else {
                    setAllModels(SUPPORTED_MODELS);
                }
            } catch (error) {
                console.error('Failed to load models:', error);
                setAllModels(SUPPORTED_MODELS);
            }
            setIsFetchingModels(false);
        };

        loadModels();
    }, [openRouterKey]);

    // Handle sidebar on resize
    useEffect(() => {
        const handleResize = () => {
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const filteredModels = allModels.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSend = async () => {
        if (!input.trim() || isLoading || !openRouterKey) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const chatHistory = [
            { id: 'system', role: 'system' as const, content: systemPrompt, timestamp: Date.now() },
            ...messages,
            userMessage
        ];

        const messageId = Date.now().toString();

        // Initialize empty message for the assistant
        setMessages(prev => [...prev, {
            id: messageId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            modelId: selectedModel.id,
            modelName: selectedModel.name
        }]);

        try {
            await sendMessageToOpenRouterStream(
                chatHistory,
                selectedModel.id,
                openRouterKey,
                (chunk) => {
                    setMessages(prev => prev.map(m =>
                        m.id === messageId ? { ...m, content: m.content + chunk } : m
                    ));
                },
                (error) => {
                    setMessages(prev => prev.map(m =>
                        m.id === messageId ? {
                            ...m,
                            content: `### ⚠️ Error\n\n${error.message}`
                        } : m
                    ));
                }
            );
        } catch (err) {
            setMessages(prev => prev.map(m =>
                m.id === messageId ? {
                    ...m,
                    content: `### ⚠️ Error\n\n${err instanceof Error ? err.message : 'Failed to get response'}`
                } : m
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('kilo_messages');
        }
    };

    const copyToClipboard = (content: string, id: string) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex">
            {/* Sidebar Overlay for Mobile */}
            <AnimatePresence>
                {isSidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {isSidebarOpen && (
                    <motion.aside
                        initial={{ x: -280, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -280, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed md:relative h-full w-[240px] bg-gray-900 border-r border-gray-800 flex flex-col z-50 shadow-2xl md:shadow-none"
                    >
                        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 font-bold text-white tracking-tight">
                                <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                                    <Terminal className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-base">Kilo IDE</span>
                            </div>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="md:hidden p-2 hover:bg-white/5 rounded-lg text-gray-400"
                                title="Close sidebar"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                            <div className="px-2 py-1.5 flex items-center justify-between">
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Sessions</span>
                                <button
                                    onClick={clearChat}
                                    className="p-1 hover:bg-white/5 rounded-md text-gray-500 hover:text-white transition-colors"
                                    title="New Chat"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                            {messages.length > 0 ? (
                                <div className="space-y-1">
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-orange-500/10 text-xs cursor-pointer border border-orange-500/20 text-white transition-all"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
                                        <span className="truncate flex-1 font-medium">Active Session</span>
                                        <div className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
                                    </motion.div>
                                    <div className="px-3 py-1 text-[9px] text-gray-700 font-mono">
                                        ID: {Math.random().toString(36).substring(7).toUpperCase()}
                                    </div>
                                </div>
                            ) : (
                                <div className="px-3 py-6 text-center text-[10px] text-gray-600 italic">
                                    No active sessions
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-800 space-y-2">
                            <button
                                onClick={clearChat}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-500/10 text-xs font-medium transition-all border border-transparent hover:border-red-500/20 group"
                            >
                                <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                                <span className="text-gray-400 group-hover:text-red-400 transition-colors">Clear History</span>
                            </button>
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 text-xs font-medium transition-all border border-transparent hover:border-white/5"
                            >
                                <Settings className="w-4 h-4 text-gray-400" />
                                <span>Preferences</span>
                            </button>
                            <div className="flex items-center gap-2.5 px-3 py-1.5 text-[10px] text-gray-500 font-mono">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span>SYSTEM ONLINE</span>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                title="Toggle sidebar"
                            >
                                <MessageSquare className="w-5 h-5 text-gray-400" />
                            </button>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-white">Kilo Chat IDE</h1>
                                <p className="text-xs text-gray-400">Multi-Model AI Assistant</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowModelSelector(!showModelSelector)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                            >
                                <Bot className="w-4 h-4 text-orange-500" />
                                <span className="text-sm text-white">{selectedModel.name}</span>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Model Selector Dropdown */}
                    {showModelSelector && (
                        <div className="absolute top-full left-0 right-0 bg-gray-800 border-b border-gray-700 p-2 max-h-64 overflow-y-auto">
                            {SUPPORTED_MODELS.slice(0, 10).map(model => (
                                <button
                                    key={model.id}
                                    onClick={() => {
                                        setSelectedModel(model);
                                        setShowModelSelector(false);
                                    }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${selectedModel.id === model.id
                                        ? 'bg-orange-500/20 text-orange-400'
                                        : 'hover:bg-gray-700 text-gray-300'
                                        }`}
                                >
                                    <Bot className="w-4 h-4" />
                                    <span className="text-sm">{model.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </header>

                {/* Main Content */}
                <main className="flex-1 pt-20 pb-24 px-4 max-w-4xl mx-auto">
                    {/* Welcome Message */}
                    {messages.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Welcome to Kilo Chat IDE</h2>
                            <p className="text-gray-400 mb-6">
                                Chat with multiple AI models simultaneously. Powered by OpenRouter.
                            </p>
                            <div className="flex flex-wrap justify-center gap-2">
                                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300">
                                    ⚡ Llama 4
                                </span>
                                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300">
                                    🟡 NVIDIA
                                </span>
                                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300">
                                    🟡 Gemma 3
                                </span>
                                <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300">
                                    🔵 Reasoning
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex gap-3",
                                    message.role === 'user' && "flex-row-reverse"
                                )}
                            >
                                {/* Avatar */}
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center",
                                    message.role === 'user'
                                        ? "bg-blue-500"
                                        : "bg-gradient-to-br from-orange-500 to-red-500"
                                )}>
                                    {message.role === 'user' ? (
                                        <User className="w-5 h-5 text-white" />
                                    ) : (
                                        <Bot className="w-5 h-5 text-white" />
                                    )}
                                </div>

                                {/* Message Content */}
                                <div className={cn(
                                    "flex-1 max-w-[80%]",
                                    message.role === 'user' && "text-right"
                                )}>
                                    <div className={cn(
                                        "inline-block p-4 rounded-2xl",
                                        message.role === 'user'
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-800 text-gray-100"
                                    )}>
                                        {message.role === 'assistant' ? (
                                            <div className="prose prose-invert prose-sm max-w-none">
                                                <ReactMarkdown
                                                    components={{
                                                        code({ className, children, ...props }: { className?: string; children?: React.ReactNode }) {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            const isInline = !match;

                                                            if (isInline) {
                                                                return <code className="bg-gray-700 px-1.5 py-0.5 rounded text-sm" {...props}>{children}</code>;
                                                            }

                                                            return (
                                                                <div className="relative group">
                                                                    <pre className="bg-gray-900 p-3 rounded-lg overflow-x-auto text-sm">
                                                                        <code {...props}>{children}</code>
                                                                    </pre>
                                                                    <button
                                                                        onClick={() => copyToClipboard(String(children), message.id)}
                                                                        className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        {copiedId === message.id ? (
                                                                            <Check className="w-4 h-4 text-green-400" />
                                                                        ) : (
                                                                            <Copy className="w-4 h-4 text-gray-300" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {message.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                        )}
                                    </div>

                                    {message.modelName && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {message.modelName}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div className="bg-gray-800 rounded-2xl px-4 py-3">
                                    <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </main>

                {/* Input Area */}
                <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-800 p-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={openRouterKey ? "Type your message..." : "Configure OPENROUTER_API_KEY to start chatting"}
                                disabled={!openRouterKey || isLoading}
                                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none disabled:opacity-50"
                                rows={2}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading || !openRouterKey}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5 text-white" />
                                )}
                            </button>
                        </div>

                        <div className="text-center mt-2">
                            <p className="text-xs text-gray-500">
                                AI can make mistakes. Please verify important information.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Click outside to close model selector */}
                {showModelSelector && (
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowModelSelector(false)}
                    />
                )}
            </div>
        </div>
    );
}