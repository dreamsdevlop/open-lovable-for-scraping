"use client";

import React, { useState } from 'react';
import {
    MessageSquare,
    Plus,
    Trash2,
    Settings,
    Terminal,
    X,
    Send,
    Bot,
    User,
    Sparkles,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, Model, SUPPORTED_MODELS } from '@/app/kilo-chat/types';
import { sendMessageToOpenRouterStream } from '@/app/kilo-chat/openRouterService';

interface KiloSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    className?: string;
}

export default function KiloSidebar({ isOpen, onToggle, className = '' }: KiloSidebarProps) {
    const [messages, setMessages] = useState<Message[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('kilo_sidebar_messages');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    const [input, setInput] = useState('');
    const [selectedModel, setSelectedModel] = useState<Model>(SUPPORTED_MODELS[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('kilo_sidebar_system_prompt') || 'You are a professional AI coding assistant. Provide concise, accurate, and high-quality code solutions.';
        }
        return 'You are a professional AI coding assistant. Provide concise, accurate, and high-quality code solutions.';
    });

    const openRouterKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';

    // Save messages to localStorage
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('kilo_sidebar_messages', JSON.stringify(messages));
        }
    }, [messages]);

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('kilo_sidebar_system_prompt', systemPrompt);
        }
    }, [systemPrompt]);

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
                        m.id === messageId ? { ...m, content: `### ⚠️ Error\n\n${error.message}` } : m
                    ));
                }
            );
        } catch (err) {
            setMessages(prev => prev.map(m =>
                m.id === messageId ? { ...m, content: `### ⚠️ Error\n\n${err instanceof Error ? err.message : 'Failed to get response'}` } : m
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('kilo_sidebar_messages');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={onToggle}
                className={`fixed right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-gray-900 hover:bg-gray-800 rounded-lg shadow-lg border border-gray-700 transition-all ${className}`}
                title="Open Kilo Chat"
            >
                <MessageSquare className="w-5 h-5 text-orange-500" />
            </button>
        );
    }

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={onToggle}
            />

            {/* Sidebar */}
            <motion.aside
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-[320px] bg-[#0d0d0d] border-l border-[#222] flex flex-col z-50 shadow-2xl"
            >
                {/* Header */}
                <div className="p-3 border-b border-[#222] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                            <Terminal className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-white text-sm">Kilo Chat</span>
                    </div>
                    <button
                        onClick={onToggle}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400"
                        title="Close sidebar"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Model Selector */}
                <div className="px-3 py-2 border-b border-[#222]">
                    <select
                        value={selectedModel.id}
                        onChange={(e) => {
                            const model = SUPPORTED_MODELS.find(m => m.id === e.target.value);
                            if (model) setSelectedModel(model);
                        }}
                        className="w-full bg-[#1a1a1a] text-white text-xs px-2 py-1.5 rounded border border-[#333] focus:outline-none focus:border-orange-500"
                    >
                        {SUPPORTED_MODELS.slice(0, 10).map(model => (
                            <option key={model.id} value={model.id}>
                                {model.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {messages.length === 0 ? (
                        <div className="text-center py-8">
                            <Sparkles className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                            <p className="text-gray-500 text-xs">Start chatting with AI</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-500' : 'bg-orange-500'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        <User className="w-3.5 h-3.5 text-white" />
                                    ) : (
                                        <Bot className="w-3.5 h-3.5 text-white" />
                                    )}
                                </div>
                                <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                                    <div className={`inline-block p-2 rounded-lg text-xs ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-[#1a1a1a] text-gray-200'
                                        }`}>
                                        <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                                <Bot className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="bg-[#1a1a1a] rounded-lg px-3 py-2">
                                <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <div className="p-3 border-t border-[#222] bg-[#151515]">
                        <label className="text-xs text-gray-400 mb-1 block">System Prompt</label>
                        <textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="w-full bg-[#1a1a1a] text-white text-xs px-2 py-1.5 rounded border border-[#333] focus:outline-none focus:border-orange-500 resize-none"
                            rows={3}
                        />
                    </div>
                )}

                {/* Footer Actions */}
                <div className="p-2 border-t border-[#222] flex gap-2">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400"
                        title="Settings"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                    <button
                        onClick={clearChat}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400"
                        title="Clear Chat"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={openRouterKey ? "Type message..." : "Configure API key"}
                            disabled={!openRouterKey || isLoading}
                            className="w-full bg-[#1a1a1a] text-white text-xs px-3 py-2 pr-10 rounded border border-[#333] focus:outline-none focus:border-orange-500 disabled:opacity-50"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading || !openRouterKey}
                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 rounded transition-colors"
                        >
                            <Send className="w-3.5 h-3.5 text-white" />
                        </button>
                    </div>
                </div>
            </motion.aside>
        </>
    );
}
