"use client";

import React, { useRef, useState, useCallback } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import {
    Copy,
    Check,
    Download,
    Maximize2,
    Minimize2,
    Save,
    RefreshCw,
    Loader2
} from 'lucide-react';

interface MonacoCodeEditorProps {
    value: string;
    language?: string;
    filename?: string;
    readOnly?: boolean;
    onChange?: (value: string | undefined) => void;
    onSave?: (value: string) => void;
    height?: string | number;
    showHeader?: boolean;
    theme?: 'vs-dark' | 'light' | 'hc-black';
}

export default function MonacoCodeEditor({
    value,
    language = 'typescript',
    filename,
    readOnly = false,
    onChange,
    onSave,
    height = '500px',
    showHeader = true,
    theme = 'vs-dark'
}: MonacoCodeEditorProps) {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleEditorMount: OnMount = (editor) => {
        editorRef.current = editor;
        setIsLoading(false);

        // Add keyboard shortcut for save
        editor.addCommand(
            // Ctrl/Cmd + S
            2048 | 49, // Monaco.KeyMod.CtrlCmd | Monaco.KeyCode.KeyS
            () => {
                if (onSave && !readOnly) {
                    handleSave();
                }
            }
        );

        // Focus the editor
        editor.focus();
    };

    const handleEditorChange: OnChange = (value) => {
        if (onChange) {
            onChange(value);
        }
    };

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(value);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [value]);

    const handleDownload = useCallback(() => {
        const blob = new Blob([value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'code.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [value, filename]);

    const handleSave = useCallback(async () => {
        if (!onSave || readOnly) return;

        setIsSaving(true);
        try {
            await onSave(value);
        } finally {
            setTimeout(() => setIsSaving(false), 500);
        }
    }, [onSave, value, readOnly]);

    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(prev => !prev);
    }, []);

    // Determine language from filename
    const getLanguage = (): string => {
        if (language && language !== 'typescript') return language;

        if (filename) {
            const ext = filename.split('.').pop()?.toLowerCase();
            switch (ext) {
                case 'js':
                case 'jsx':
                    return 'javascript';
                case 'ts':
                case 'tsx':
                    return 'typescript';
                case 'json':
                    return 'json';
                case 'css':
                    return 'css';
                case 'scss':
                case 'sass':
                    return 'scss';
                case 'html':
                    return 'html';
                case 'md':
                case 'markdown':
                    return 'markdown';
                case 'py':
                    return 'python';
                case 'go':
                    return 'go';
                case 'rs':
                    return 'rust';
                case 'java':
                    return 'java';
                case 'cpp':
                case 'cc':
                case 'cxx':
                    return 'cpp';
                case 'c':
                    return 'c';
                case 'xml':
                    return 'xml';
                case 'yaml':
                case 'yml':
                    return 'yaml';
                case 'sh':
                case 'bash':
                    return 'shell';
                default:
                    return 'plaintext';
            }
        }
        return language;
    };

    return (
        <div
            className={`relative border border-gray-700 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''
                }`}
            style={{ height: isFullscreen ? '100vh' : height }}
        >
            {/* Header */}
            {showHeader && (
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        {filename && (
                            <span className="text-sm font-medium text-gray-300">
                                {filename}
                            </span>
                        )}
                        <span className="text-xs text-gray-500 uppercase">
                            {getLanguage()}
                        </span>
                        {readOnly && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded">
                                Read Only
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Save Button */}
                        {!readOnly && onSave && (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white disabled:opacity-50"
                                title="Save (Ctrl+S)"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                            </button>
                        )}

                        {/* Copy Button */}
                        <button
                            onClick={handleCopy}
                            className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
                            title="Copy to clipboard"
                        >
                            {isCopied ? (
                                <Check className="w-4 h-4 text-green-500" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                        </button>

                        {/* Download Button */}
                        <button
                            onClick={handleDownload}
                            className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
                            title="Download file"
                        >
                            <Download className="w-4 h-4" />
                        </button>

                        {/* Fullscreen Toggle */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
                            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? (
                                <Minimize2 className="w-4 h-4" />
                            ) : (
                                <Maximize2 className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Editor */}
            <div className={isFullscreen ? 'h-[calc(100vh-45px)]' : `h-[calc(100%-45px)]`}>
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                )}
                <Editor
                    height="100%"
                    language={getLanguage()}
                    value={value}
                    theme={theme}
                    onChange={handleEditorChange}
                    onMount={handleEditorMount}
                    options={{
                        readOnly,
                        minimap: { enabled: true },
                        fontSize: 14,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                        lineNumbers: 'on',
                        roundedSelection: true,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: 'on',
                        padding: { top: 16, bottom: 16 },
                        smoothScrolling: true,
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        renderLineHighlight: 'all',
                        bracketPairColorization: { enabled: true },
                        formatOnPaste: true,
                        formatOnType: true,
                        suggest: {
                            showKeywords: true,
                            showSnippets: true,
                            showFunctions: true,
                            showVariables: true,
                        },
                    }}
                />
            </div>
        </div>
    );
}
