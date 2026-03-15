"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    Check,
    Sparkles,
    FileCode,
    Box,
    Palette,
    Layers
} from 'lucide-react';
import { SANDBOX_TEMPLATES, type SandboxTemplate } from '@/lib/sandbox-templates';

interface TemplateSelectorProps {
    selectedTemplate: string | null;
    onSelectTemplate: (templateId: string) => void;
    disabled?: boolean;
}

export default function TemplateSelector({
    selectedTemplate,
    onSelectTemplate,
    disabled = false
}: TemplateSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

    const selected = SANDBOX_TEMPLATES.find(t => t.id === selectedTemplate);

    const getFrameworkIcon = (framework: string) => {
        switch (framework) {
            case 'react':
                return <span className="text-2xl">⚛️</span>;
            case 'nextjs':
                return <span className="text-2xl">▲</span>;
            case 'vue':
                return <span className="text-2xl">💚</span>;
            case 'vanilla':
                return <span className="text-2xl">📦</span>;
            default:
                return <Box className="w-6 h-6" />;
        }
    };

    return (
        <div className="relative">
            {/* Dropdown Trigger */}
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${disabled
                        ? 'bg-gray-800 border-gray-700 cursor-not-allowed opacity-50'
                        : 'bg-gray-800 border-gray-600 hover:border-gray-500 cursor-pointer'
                    }`}
            >
                {selected ? (
                    <>
                        {getFrameworkIcon(selected.framework)}
                        <div className="text-left">
                            <div className="text-sm font-medium text-white">
                                {selected.name}
                            </div>
                            <div className="text-xs text-gray-400">
                                {selected.description}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <Sparkles className="w-6 h-6 text-purple-400" />
                        <div className="text-left">
                            <div className="text-sm font-medium text-white">
                                Choose a template
                            </div>
                            <div className="text-xs text-gray-400">
                                Or start from scratch
                            </div>
                        </div>
                    </>
                )}
                <ChevronDown className={`w-5 h-5 text-gray-400 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''
                    }`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-4 py-2 border-b border-gray-700 bg-gray-800">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Project Templates
                            </h3>
                        </div>

                        {/* Templates Grid */}
                        <div className="grid grid-cols-1 gap-1 p-2 max-h-[400px] overflow-y-auto">
                            {SANDBOX_TEMPLATES.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => {
                                        onSelectTemplate(template.id);
                                        setIsOpen(false);
                                    }}
                                    onMouseEnter={() => setHoveredTemplate(template.id)}
                                    onMouseLeave={() => setHoveredTemplate(null)}
                                    className={`flex items-start gap-3 p-3 rounded-lg transition-all text-left ${selectedTemplate === template.id
                                            ? 'bg-blue-500/20 border border-blue-500/50'
                                            : hoveredTemplate === template.id
                                                ? 'bg-gray-700 border border-gray-600'
                                                : 'border border-transparent hover:bg-gray-700/50'
                                        }`}
                                >
                                    {getFrameworkIcon(template.framework)}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">
                                                {template.name}
                                            </span>
                                            {selectedTemplate === template.id && (
                                                <Check className="w-4 h-4 text-blue-400" />
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-400 truncate">
                                            {template.description}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500">
                                                {template.language.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-gray-600">•</span>
                                            <span className="text-xs text-gray-500">
                                                {template.buildTool.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2 border-t border-gray-700 bg-gray-800/50">
                            <p className="text-xs text-gray-500">
                                Tip: You can also describe what you want to build and let AI choose the best template
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}

// Compact version for sidebar
export function TemplateBadge({ templateId }: { templateId: string }) {
    const template = SANDBOX_TEMPLATES.find(t => t.id === templateId);

    if (!template) return null;

    const getIcon = () => {
        switch (template.framework) {
            case 'react':
                return '⚛️';
            case 'nextjs':
                return '▲';
            case 'vue':
                return '💚';
            default:
                return '📦';
        }
    };

    return (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-700 rounded text-xs">
            <span>{getIcon()}</span>
            <span className="text-gray-300">{template.name}</span>
        </div>
    );
}
