"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Terminal as TerminalIcon,
    ChevronUp,
    ChevronDown,
    X,
    RefreshCw,
    Copy,
    Check,
    Maximize2,
    Minimize2,
    Trash2,
    Play,
    Square
} from 'lucide-react';

interface TerminalOutput {
    id: string;
    type: 'input' | 'output' | 'error' | 'success' | 'system';
    content: string;
    timestamp: Date;
}

interface TerminalProps {
    output: TerminalOutput[];
    onRunCommand?: (command: string) => void;
    onClear?: () => void;
    isLoading?: boolean;
    height?: string | number;
    maxLines?: number;
}

export default function Terminal({
    output,
    onRunCommand,
    onClear,
    isLoading = false,
    height = '300px',
    maxLines = 500
}: TerminalProps) {
    const [input, setInput] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const outputRef = useRef<HTMLDivElement>(null);

    const visibleOutput = showAll ? output : output.slice(-maxLines);

    useEffect(() => {
        // Auto-scroll to bottom when new output arrives
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && onRunCommand) {
            onRunCommand(input.trim());
            setInput('');
        }
    }, [input, onRunCommand]);

    const handleCopy = useCallback(async () => {
        const text = output.map(o => {
            const prefix = o.type === 'input' ? '$ ' : o.type === 'error' ? '❌ ' : o.type === 'success' ? '✅ ' : '';
            return `${prefix}${o.content}`;
        }).join('\n');

        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [output]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'c' && e.ctrlKey) {
            // Ctrl+C to interrupt
            if (isLoading) {
                // This would typically trigger an abort
            }
        }
        if (e.key === 'l' && e.ctrlKey) {
            e.preventDefault();
            if (onClear) onClear();
        }
        if (e.key === 'k' && e.ctrlKey) {
            e.preventDefault();
            setInput('');
            inputRef.current?.focus();
        }
    }, [isLoading, onClear]);

    const getOutputColor = (type: TerminalOutput['type']): string => {
        switch (type) {
            case 'input':
                return 'text-green-400';
            case 'error':
                return 'text-red-400';
            case 'success':
                return 'text-green-400';
            case 'system':
                return 'text-blue-400';
            default:
                return 'text-gray-300';
        }
    };

    const getOutputPrefix = (type: TerminalOutput['type']): string => {
        switch (type) {
            case 'input':
                return '$ ';
            case 'error':
                return '❌ ';
            case 'success':
                return '✅ ';
            case 'system':
                return 'ℹ️ ';
            default:
                return '';
        }
    };

    return (
        <div
            className={`flex flex-col bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${isExpanded ? 'fixed inset-0 z-50 m-4' : ''
                }`}
            style={{ height: isExpanded ? 'calc(100vh - 32px)' : height }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">Terminal</span>
                    {isLoading && (
                        <span className="flex items-center gap-1 text-xs text-yellow-400">
                            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                            Running...
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {/* Clear Button */}
                    {onClear && (
                        <button
                            onClick={onClear}
                            className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
                            title="Clear terminal"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}

                    {/* Copy Button */}
                    <button
                        onClick={handleCopy}
                        className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
                        title="Copy output"
                    >
                        {isCopied ? (
                            <Check className="w-4 h-4 text-green-500" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </button>

                    {/* Toggle Expand */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
                        title={isExpanded ? 'Exit fullscreen' : 'Fullscreen'}
                    >
                        {isExpanded ? (
                            <Minimize2 className="w-4 h-4" />
                        ) : (
                            <Maximize2 className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Output Area */}
            <div
                ref={outputRef}
                className="flex-1 overflow-auto p-4 font-mono text-sm"
                onClick={() => inputRef.current?.focus()}
            >
                {visibleOutput.map((line) => (
                    <div
                        key={line.id}
                        className={`whitespace-pre-wrap break-all ${getOutputColor(line.type)}`}
                    >
                        {getOutputPrefix(line.type)}{line.content}
                    </div>
                ))}
                {output.length > maxLines && !showAll && (
                    <button
                        onClick={() => setShowAll(true)}
                        className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                    >
                        Show {output.length - maxLines} more lines...
                    </button>
                )}
                {output.length === 0 && !isLoading && (
                    <div className="text-gray-500">
                        Terminal ready. Type a command to run.
                    </div>
                )}
            </div>

            {/* Input Area */}
            {onRunCommand && (
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-t border-gray-700"
                >
                    <span className="text-green-400 font-mono">$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        placeholder="Enter command..."
                        className="flex-1 bg-transparent text-gray-300 font-mono text-sm outline-none placeholder:text-gray-600 disabled:opacity-50"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors text-white"
                    >
                        {isLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Play className="w-4 h-4" />
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
