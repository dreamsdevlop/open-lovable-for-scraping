"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2,
    Sparkles,
    FileCode,
    Package,
    CheckCircle2,
    XCircle,
    Zap,
    Brain,
    Code2,
    Play,
    Clock
} from 'lucide-react';

export type GenerationStage =
    | 'idle'
    | 'thinking'
    | 'planning'
    | 'gathering'
    | 'generating'
    | 'applying'
    | 'installing'
    | 'verifying'
    | 'complete'
    | 'error';

interface StageInfo {
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

const STAGES: Record<GenerationStage, StageInfo> = {
    idle: {
        label: 'Ready',
        description: 'Waiting for input',
        icon: <Sparkles className="w-5 h-5" />,
        color: 'text-gray-400'
    },
    thinking: {
        label: 'Thinking',
        description: 'Analyzing your request',
        icon: <Brain className="w-5 h-5" />,
        color: 'text-purple-400'
    },
    planning: {
        label: 'Planning',
        description: 'Creating a plan for your project',
        icon: <FileCode className="w-5 h-5" />,
        color: 'text-blue-400'
    },
    gathering: {
        label: 'Gathering',
        description: 'Researching and gathering information',
        icon: <Zap className="w-5 h-5" />,
        color: 'text-yellow-400'
    },
    generating: {
        label: 'Generating',
        description: 'Writing code for your project',
        icon: <Code2 className="w-5 h-5" />,
        color: 'text-green-400'
    },
    applying: {
        label: 'Applying',
        description: 'Applying changes to sandbox',
        icon: <Play className="w-5 h-5" />,
        color: 'text-cyan-400'
    },
    installing: {
        label: 'Installing',
        description: 'Installing dependencies',
        icon: <Package className="w-5 h-5" />,
        color: 'text-orange-400'
    },
    verifying: {
        label: 'Verifying',
        description: 'Checking for errors',
        icon: <CheckCircle2 className="w-5 h-5" />,
        color: 'text-teal-400'
    },
    complete: {
        label: 'Complete',
        description: 'Your project is ready!',
        icon: <CheckCircle2 className="w-5 h-5" />,
        color: 'text-green-500'
    },
    error: {
        label: 'Error',
        description: 'Something went wrong',
        icon: <XCircle className="w-5 h-5" />,
        color: 'text-red-400'
    }
};

interface GenerationProgressProps {
    stage: GenerationStage;
    progress?: number; // 0-100
    currentFile?: string;
    message?: string;
    filesGenerated?: string[];
    packagesInstalled?: string[];
    error?: string;
    showDetails?: boolean;
    thinkingText?: string;
    thinkingDuration?: number;
}

export default function GenerationProgress({
    stage,
    progress,
    currentFile,
    message,
    filesGenerated = [],
    packagesInstalled = [],
    error,
    showDetails = true,
    thinkingText,
    thinkingDuration
}: GenerationProgressProps) {
    const stageInfo = STAGES[stage];
    const isProcessing = ['thinking', 'planning', 'generating', 'applying', 'installing', 'verifying', 'gathering'].includes(stage);
    const isComplete = stage === 'complete';
    const hasError = stage === 'error';

    // Calculate estimated time remaining if we have progress
    const estimatedTimeRemaining = React.useMemo(() => {
        if (!progress || progress === 0 || !isProcessing) return null;

        // Assume 10 seconds for 100% when fully loaded
        const estimatedTotal = 10000;
        const elapsed = (progress / 100) * estimatedTotal;
        const remaining = estimatedTotal - elapsed;

        if (remaining < 1000) return 'Just a moment...';
        if (remaining < 60000) return `${Math.ceil(remaining / 1000)}s remaining`;
        return `${Math.ceil(remaining / 60000)}m remaining`;
    }, [progress, isProcessing]);

    if (stage === 'idle') return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={stage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
            >
                {/* Main Progress Bar */}
                <div className="p-4">
                    <div className="flex items-center gap-4 mb-3">
                        {/* Stage Icon */}
                        <div className={`p-2 rounded-lg bg-gray-700 ${stageInfo.color}`}>
                            {stageInfo.icon}
                        </div>

                        {/* Stage Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className={`font-semibold ${stageInfo.color}`}>
                                    {stageInfo.label}
                                </h3>
                                {isProcessing && (
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                )}
                            </div>
                            <p className="text-sm text-gray-400">
                                {message || stageInfo.description}
                            </p>
                        </div>

                        {/* Progress Percentage */}
                        {progress !== undefined && isProcessing && (
                            <div className="text-right">
                                <span className="text-2xl font-bold text-gray-300">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    {progress !== undefined && (
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full ${hasError
                                        ? 'bg-red-500'
                                        : isComplete
                                            ? 'bg-green-500'
                                            : 'bg-blue-500'
                                    }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    )}

                    {/* Current File Being Processed */}
                    {currentFile && isProcessing && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                            <Code2 className="w-4 h-4" />
                            <span className="truncate">Processing: {currentFile}</span>
                        </div>
                    )}

                    {/* Thinking Animation */}
                    {stage === 'thinking' && (
                        <div className="mt-3">
                            {thinkingText && (
                                <div className="p-3 bg-gray-700/50 rounded-lg text-sm text-gray-300 italic">
                                    "{thinkingText}"
                                </div>
                            )}
                            {thinkingDuration && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    <span>Thinking for {thinkingDuration}ms</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error Message */}
                    {hasError && error && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                {showDetails && (filesGenerated.length > 0 || packagesInstalled.length > 0) && (
                    <div className="border-t border-gray-700 p-4 space-y-3">
                        {/* Files Generated */}
                        {filesGenerated.length > 0 && (
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                    Files Generated ({filesGenerated.length})
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                    {filesGenerated.slice(0, 10).map((file, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                                        >
                                            {file}
                                        </span>
                                    ))}
                                    {filesGenerated.length > 10 && (
                                        <span className="px-2 py-1 text-xs text-gray-500">
                                            +{filesGenerated.length - 10} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Packages Installed */}
                        {packagesInstalled.length > 0 && (
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                    Packages Installed ({packagesInstalled.length})
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                    {packagesInstalled.slice(0, 5).map((pkg, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 bg-orange-500/20 rounded text-xs text-orange-300"
                                        >
                                            {pkg}
                                        </span>
                                    ))}
                                    {packagesInstalled.length > 5 && (
                                        <span className="px-2 py-1 text-xs text-gray-500">
                                            +{packagesInstalled.length - 5} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Estimated Time */}
                {estimatedTimeRemaining && isProcessing && (
                    <div className="border-t border-gray-700 px-4 py-2 bg-gray-700/30">
                        <span className="text-xs text-gray-500">
                            {estimatedTimeRemaining}
                        </span>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
