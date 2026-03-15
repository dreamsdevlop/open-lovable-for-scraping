"use client";

import React, { useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    Copy,
    Check,
    ChevronDown,
    ChevronUp,
    Code2,
    WrapText
} from 'lucide-react';

interface CodeBlockProps {
    code: string;
    language?: string;
    showLineNumbers?: boolean;
    highlightLines?: number[];
    filename?: string;
    theme?: 'dark' | 'light';
}

const LANGUAGE_MAP: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    sh: 'bash',
    bash: 'bash',
    shell: 'bash',
    zsh: 'bash',
    yaml: 'yaml',
    yml: 'yaml',
    json: 'json',
    xml: 'xml',
    html: 'markup',
    css: 'css',
    scss: 'scss',
    less: 'less',
    sql: 'sql',
    graphql: 'graphql',
    md: 'markdown',
    markdown: 'markdown',
    dockerfile: 'docker',
    text: 'text',
    plain: 'text'
};

export default function CodeBlock({
    code,
    language = 'typescript',
    showLineNumbers = true,
    highlightLines = [],
    filename,
    theme = 'dark'
}: CodeBlockProps) {
    const [isCopied, setIsCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isWrapped, setIsWrapped] = useState(true);

    const normalizedLanguage = LANGUAGE_MAP[language.toLowerCase()] || language;

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(code);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [code]);

    // Check if code is too long
    const lines = code.split('\n');
    const isTooLong = lines.length > 20;
    const displayCode = isExpanded || !isTooLong ? code : lines.slice(0, 20).join('\n');

    // Base style for the code block
    const baseStyle: React.CSSProperties = {
        margin: 0,
        padding: '1rem',
        fontSize: '0.875rem',
        lineHeight: '1.5',
        background: 'transparent'
    };

    // Style for highlighted lines
    const getLineStyle = (lineNumber: number) => {
        if (highlightLines.includes(lineNumber)) {
            return {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                display: 'block',
                marginLeft: '-1rem',
                marginRight: '-1rem',
                paddingLeft: '1rem',
                paddingRight: '1rem'
            };
        }
        return {};
    };

    return (
        <div className={`rounded-lg overflow-hidden border ${theme === 'dark' ? 'border-gray-700 bg-[#1e1e1e]' : 'border-gray-200 bg-gray-50'
            }`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-3 py-2 ${theme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-100 border-b border-gray-200'
                }`}>
                <div className="flex items-center gap-3">
                    {/* Language Badge */}
                    <div className="flex items-center gap-1.5">
                        <Code2 className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={`text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            {normalizedLanguage}
                        </span>
                    </div>

                    {/* Filename */}
                    {filename && (
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            {filename}
                        </span>
                    )}

                    {/* Line count */}
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                        {lines.length} lines
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    {/* Wrap Toggle */}
                    <button
                        onClick={() => setIsWrapped(!isWrapped)}
                        className={`p-1.5 rounded transition-colors ${theme === 'dark'
                            ? 'hover:bg-gray-700 text-gray-400'
                            : 'hover:bg-gray-200 text-gray-600'
                            }`}
                        title={isWrapped ? 'Disable word wrap' : 'Enable word wrap'}
                    >
                        <WrapText className="w-4 h-4" />
                    </button>

                    {/* Expand/Collapse (only for long code) */}
                    {isTooLong && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`p-1.5 rounded transition-colors ${theme === 'dark'
                                ? 'hover:bg-gray-700 text-gray-400'
                                : 'hover:bg-gray-200 text-gray-600'
                                }`}
                            title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                            {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </button>
                    )}

                    {/* Copy Button */}
                    <button
                        onClick={handleCopy}
                        className={`p-1.5 rounded transition-colors ${theme === 'dark'
                            ? 'hover:bg-gray-700 text-gray-400'
                            : 'hover:bg-gray-200 text-gray-600'
                            }`}
                        title="Copy to clipboard"
                    >
                        {isCopied ? (
                            <Check className="w-4 h-4 text-green-500" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Code Content */}
            <div className={isWrapped ? 'overflow-x-auto' : 'whitespace-pre'}>
                <SyntaxHighlighter
                    language={normalizedLanguage}
                    style={theme === 'dark' ? vscDarkPlus : vs}
                    showLineNumbers={showLineNumbers}
                    wrapLines={isWrapped}
                    customStyle={baseStyle}
                    lineNumberStyle={{
                        minWidth: '2.5em',
                        paddingRight: '1em',
                        color: theme === 'dark' ? '#6e7681' : '#999',
                        textAlign: 'right'
                    }}
                >
                    {displayCode}
                </SyntaxHighlighter>
            </div>

            {/* Show more indicator */}
            {isTooLong && !isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className={`w-full py-2 text-center text-sm ${theme === 'dark'
                        ? 'bg-gray-800 text-gray-400 hover:text-white'
                        : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Show {lines.length - 20} more lines
                </button>
            )}
        </div>
    );
}
