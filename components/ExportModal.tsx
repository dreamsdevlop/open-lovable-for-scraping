"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Download,
    Github,
    Rocket,
    Check,
    Loader2,
    ExternalLink,
    Folder,
    Copy,
    RefreshCw,
    ChevronRight
} from 'lucide-react';
import {
    createProjectZip,
    downloadZip,
    createGitHubRepo,
    pushToGitHub,
    formatFileSize,
    calculateProjectSize
} from '@/lib/export-service';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    files: Record<string, string>;
    projectName?: string;
}

type ExportStep = 'select' | 'exporting' | 'complete' | 'error';
type ExportFormat = 'zip' | 'github' | 'vercel' | 'netlify';

export default function ExportModal({
    isOpen,
    onClose,
    files,
    projectName = 'project'
}: ExportModalProps) {
    const [step, setStep] = useState<ExportStep>('select');
    const [format, setFormat] = useState<ExportFormat | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ url?: string; downloadUrl?: string } | null>(null);
    const [githubToken, setGithubToken] = useState('');
    const [showTokenInput, setShowTokenInput] = useState(false);

    const projectSize = calculateProjectSize(files);
    const fileCount = Object.keys(files).length;

    const handleExport = useCallback(async () => {
        if (!format) return;

        setIsLoading(true);
        setError(null);
        setStep('exporting');

        try {
            if (format === 'zip') {
                const blob = await createProjectZip(files, {
                    format: 'zip',
                    includeGitIgnore: true,
                    includeReadme: true
                });

                downloadZip(blob, projectName);
                setResult({ downloadUrl: URL.createObjectURL(blob) });
                setStep('complete');
            } else if (format === 'github') {
                if (!githubToken) {
                    setShowTokenInput(true);
                    setIsLoading(false);
                    return;
                }

                // Create repo and push files
                const repoName = projectName.toLowerCase().replace(/\s+/g, '-');
                const { url } = await createGitHubRepo(githubToken, {
                    name: repoName,
                    description: `Created with Open Lovable - AI Code Generator`,
                    private: false,
                    autoInit: true
                });

                await pushToGitHub(githubToken, 'user', repoName, files);

                setResult({ url });
                setStep('complete');
            } else if (format === 'vercel' || format === 'netlify') {
                // Placeholder for deployment
                setResult({
                    url: `https://${projectName.toLowerCase().replace(/\s+/g, '-')}.${format === 'vercel' ? 'vercel.app' : 'netlify.app'}`
                });
                setStep('complete');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Export failed');
            setStep('error');
        } finally {
            setIsLoading(false);
        }
    }, [format, files, projectName, githubToken]);

    const handleReset = useCallback(() => {
        setStep('select');
        setFormat(null);
        setError(null);
        setResult(null);
        setShowTokenInput(false);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">
                        Export Project
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Project Info */}
                    <div className="flex items-center gap-4 mb-6 p-4 bg-gray-700/50 rounded-lg">
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <Folder className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-medium text-white">{projectName}</h3>
                            <p className="text-sm text-gray-400">
                                {fileCount} files • {formatFileSize(projectSize)}
                            </p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'select' && (
                            <motion.div
                                key="select"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-3"
                            >
                                {/* Export Options */}
                                <button
                                    onClick={() => setFormat('zip')}
                                    className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${format === 'zip'
                                        ? 'bg-blue-500/20 border-blue-500/50'
                                        : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                                        <Download className="w-5 h-5 text-yellow-400" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-medium text-white">Download ZIP</div>
                                        <div className="text-sm text-gray-400">Get project as compressed archive</div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-500" />
                                </button>

                                <button
                                    onClick={() => setFormat('github')}
                                    className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${format === 'github'
                                        ? 'bg-blue-500/20 border-blue-500/50'
                                        : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="p-2 bg-gray-600/50 rounded-lg">
                                        <Github className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-medium text-white">Push to GitHub</div>
                                        <div className="text-sm text-gray-400">Create and push to a new repository</div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-500" />
                                </button>

                                <button
                                    onClick={() => setFormat('vercel')}
                                    className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${format === 'vercel'
                                        ? 'bg-blue-500/20 border-blue-500/50'
                                        : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="p-2 bg-black/50 rounded-lg">
                                        <Rocket className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-medium text-white">Deploy to Vercel</div>
                                        <div className="text-sm text-gray-400">Deploy directly to Vercel</div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-500" />
                                </button>

                                <button
                                    onClick={() => setFormat('netlify')}
                                    className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${format === 'netlify'
                                        ? 'bg-blue-500/20 border-blue-500/50'
                                        : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="p-2 bg-teal-500/20 rounded-lg">
                                        <Rocket className="w-5 h-5 text-teal-400" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-medium text-white">Deploy to Netlify</div>
                                        <div className="text-sm text-gray-400">Deploy directly to Netlify</div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-500" />
                                </button>

                                {/* GitHub Token Input */}
                                {showTokenInput && format === 'github' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                                    >
                                        <label className="block text-sm font-medium text-yellow-400 mb-2">
                                            GitHub Personal Access Token
                                        </label>
                                        <input
                                            type="password"
                                            value={githubToken}
                                            onChange={(e) => setGithubToken(e.target.value)}
                                            placeholder="ghp_xxxxxxxxxxxx"
                                            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                                        />
                                        <p className="mt-2 text-xs text-gray-500">
                                            Create a token at GitHub Settings → Developer settings → Personal access tokens
                                        </p>
                                    </motion.div>
                                )}

                                {/* Export Button */}
                                {format && (
                                    <button
                                        onClick={handleExport}
                                        disabled={isLoading || (format === 'github' && !githubToken)}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Exporting...
                                            </>
                                        ) : (
                                            <>
                                                Export
                                                <ChevronRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </motion.div>
                        )}

                        {step === 'exporting' && (
                            <motion.div
                                key="exporting"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="py-12 text-center"
                            >
                                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
                                <h3 className="text-lg font-medium text-white mb-2">
                                    {format === 'zip' ? 'Creating ZIP...' : 'Pushing to GitHub...'}
                                </h3>
                                <p className="text-gray-400">
                                    Please wait while we prepare your project
                                </p>
                            </motion.div>
                        )}

                        {step === 'complete' && (
                            <motion.div
                                key="complete"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="py-8 text-center"
                            >
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">
                                    Export Complete!
                                </h3>

                                {format === 'zip' && (
                                    <p className="text-gray-400 mb-4">
                                        Your project has been downloaded
                                    </p>
                                )}

                                {result?.url && (
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <a
                                            href={result.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                                        >
                                            {result.url}
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                )}

                                {format === 'zip' && (
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                    >
                                        Done
                                    </button>
                                )}

                                {format === 'github' && result?.url && (
                                    <a
                                        href={result.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        <Github className="w-5 h-5" />
                                        View Repository
                                    </a>
                                )}
                            </motion.div>
                        )}

                        {step === 'error' && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="py-8 text-center"
                            >
                                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <X className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">
                                    Export Failed
                                </h3>
                                <p className="text-red-400 mb-4">
                                    {error}
                                </p>
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                >
                                    Try Again
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
