'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    MessageSquare,
    Code,
    Terminal,
    Download,
    Plus,
    Send,
    Loader2,
    Sparkles,
    Settings,
    RefreshCw,
    Play,
    FolderOpen,
    FileCode,
    PanelLeftClose,
    PanelLeftOpen,
    PanelRightClose,
    PanelRightOpen,
    X,
    ChevronRight,
    ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import new components
import MonacoCodeEditor from '@/components/MonacoCodeEditor';
import CodeEditorPanel from '@/components/CodeEditorPanel';
import TerminalPanel from '@/components/TerminalPanel';
import GenerationProgress from '@/components/GenerationProgress';
import TemplateSelector from '@/components/TemplateSelector';
import ExportModal from '@/components/ExportModal';
import CodeBlock from '@/components/CodeBlock';
import { SANDBOX_TEMPLATES } from '@/lib/sandbox-templates';
import { appConfig } from '@/config/app.config';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    files?: Record<string, string>;
}

interface TerminalLine {
    id: string;
    type: 'input' | 'output' | 'error' | 'system' | 'success';
    content: string;
    timestamp: Date;
}

// Default template
const DEFAULT_TEMPLATE = SANDBOX_TEMPLATES[0];

export default function IDEPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // UI State
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [activeLeftTab, setActiveLeftTab] = useState<'files' | 'chat'>('chat');
    const [activeRightTab, setActiveRightTab] = useState<'preview' | 'terminal'>('preview');

    // Project State
    const [projectName, setProjectName] = useState('My Project');
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(DEFAULT_TEMPLATE.id);
    const [files, setFiles] = useState<Record<string, string>>({});
    const [fileStructure, setFileStructure] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [sandboxUrl, setSandboxUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [generationStage, setGenerationStage] = useState<string>('idle');
    const [generationProgress, setGenerationProgress] = useState(0);

    // Chat State
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'system',
            content: 'Welcome to the AI Code Generator! Describe what you want to build and I\'ll create it for you.\n\nYou can also select a template from the left panel to get started quickly.',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);

    // Terminal State
    const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
        {
            id: '1',
            type: 'system',
            content: 'Terminal ready. Type commands or use the chat to generate code.',
            timestamp: new Date()
        }
    ]);

    // Export Modal
    const [showExportModal, setShowExportModal] = useState(false);

    // Model selection
    const [selectedModel, setSelectedModel] = useState(appConfig.ai.defaultModel);

    // Initialize with template files
    useEffect(() => {
        if (selectedTemplate) {
            const template = SANDBOX_TEMPLATES.find(t => t.id === selectedTemplate);
            if (template) {
                setFiles(template.starterFiles);
                setProjectName(template.name);
            }
        }
    }, [selectedTemplate]);

    // Handle message send
    const handleSendMessage = useCallback(async () => {
        if (!input.trim() || isStreaming) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsStreaming(true);
        setGenerationStage('thinking');

        try {
            // Simulate AI response - in production, this would call the actual API
            await new Promise(resolve => setTimeout(resolve, 1500));
            setGenerationStage('generating');

            // Add AI response
            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `I've generated a new React + TypeScript project based on your request! The project includes:\n\n- A main App component\n- Styling with CSS\n- TypeScript configuration\n- Vite build setup\n\nYou can preview it on the right panel.`,
                timestamp: new Date(),
                files: {
                    'src/App.tsx': `import { useState } from 'react';\n\nfunction App() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div className="app">\n      <h1>Hello World</h1>\n      <p>You clicked {count} times</p>\n      <button onClick={() => setCount(count + 1)}>\n        Click me\n      </button>\n    </div>\n  );\n}\n\nexport default App;`,
                    'src/main.tsx': `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App.tsx';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`
                }
            };

            setMessages(prev => [...prev, aiMessage]);

            // Update files if AI provided new ones
            if (aiMessage.files) {
                setFiles(prev => ({ ...prev, ...aiMessage.files }));
            }

            setGenerationStage('complete');
            setGenerationProgress(100);

            // Add terminal output
            setTerminalLines(prev => [...prev, {
                id: Date.now().toString(),
                type: 'system',
                content: 'Project generated successfully!',
                timestamp: new Date()
            }]);

        } catch (error) {
            setGenerationStage('error');
            setTerminalLines(prev => [...prev, {
                id: Date.now().toString(),
                type: 'error',
                content: `Error: ${error instanceof Error ? error.message : 'Failed to generate code'}`,
                timestamp: new Date()
            }]);
        } finally {
            setIsStreaming(false);
            setTimeout(() => setGenerationStage('idle'), 2000);
        }
    }, [input, isStreaming]);

    // Handle terminal command
    const handleTerminalCommand = useCallback((command: string) => {
        const inputLine: TerminalLine = {
            id: Date.now().toString(),
            type: 'input',
            content: command,
            timestamp: new Date()
        };

        setTerminalLines(prev => [...prev, inputLine]);

        // Simulate command execution
        if (command === 'npm install') {
            setTerminalLines(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                type: 'system',
                content: 'Installing dependencies...',
                timestamp: new Date()
            }]);

            setTimeout(() => {
                setTerminalLines(prev => [...prev, {
                    id: (Date.now() + 2).toString(),
                    type: 'success',
                    content: 'Dependencies installed successfully!',
                    timestamp: new Date()
                }]);
            }, 2000);
        } else if (command.startsWith('npm run')) {
            setTerminalLines(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                type: 'output',
                content: `Running ${command}...`,
                timestamp: new Date()
            }]);
        } else {
            setTerminalLines(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                type: 'output',
                content: `Command not found: ${command}`,
                timestamp: new Date()
            }]);
        }
    }, []);

    // Handle file selection
    const handleFileSelect = useCallback((path: string) => {
        setSelectedFile(path);
    }, []);

    // Handle file change
    const handleFileChange = useCallback((path: string, content: string) => {
        setFiles(prev => ({ ...prev, [path]: content }));
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-semibold text-white">{projectName}</h1>
                    {selectedTemplate && (
                        <TemplateSelector
                            selectedTemplate={selectedTemplate}
                            onSelectTemplate={setSelectedTemplate}
                        />
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Model Selector */}
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
                    >
                        {appConfig.ai.availableModels.slice(0, 10).map(model => (
                            <option key={model} value={model}>
                                {model.split('/').pop()}
                            </option>
                        ))}
                    </select>

                    {/* Export Button */}
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel - Chat / Files */}
                <AnimatePresence>
                    {leftPanelOpen && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 400, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="flex flex-col border-r border-gray-700 bg-gray-800"
                        >
                            {/* Tab Headers */}
                            <div className="flex border-b border-gray-700">
                                <button
                                    onClick={() => setActiveLeftTab('chat')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeLeftTab === 'chat'
                                        ? 'text-white bg-gray-700 border-b-2 border-blue-500'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Chat
                                </button>
                                <button
                                    onClick={() => setActiveLeftTab('files')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeLeftTab === 'files'
                                        ? 'text-white bg-gray-700 border-b-2 border-blue-500'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <FolderOpen className="w-4 h-4" />
                                    Files
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-hidden">
                                {activeLeftTab === 'chat' ? (
                                    /* Chat Panel */
                                    <div className="flex flex-col h-full">
                                        {/* Messages */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                            {messages.map(msg => (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[85%] rounded-lg p-3 ${msg.role === 'user'
                                                        ? 'bg-blue-600 text-white'
                                                        : msg.role === 'system'
                                                            ? 'bg-yellow-500/20 text-yellow-300'
                                                            : 'bg-gray-700 text-gray-100'
                                                        }`}>
                                                        {msg.role === 'assistant' && msg.files && (
                                                            <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
                                                                <FileCode className="w-3 h-3" />
                                                                Generated {Object.keys(msg.files).length} files
                                                            </div>
                                                        )}
                                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {isStreaming && (
                                                <div className="flex justify-start">
                                                    <div className="bg-gray-700 rounded-lg p-3">
                                                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Input */}
                                        <div className="p-4 border-t border-gray-700">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={input}
                                                    onChange={(e) => setInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                                    placeholder="Describe what you want to build..."
                                                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                                    disabled={isStreaming}
                                                />
                                                <button
                                                    onClick={handleSendMessage}
                                                    disabled={!input.trim() || isStreaming}
                                                    className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                                                >
                                                    {isStreaming ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <Send className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Files Panel */
                                    <CodeEditorPanel
                                        files={files}
                                        fileStructure={fileStructure}
                                        selectedFile={selectedFile}
                                        onSelectFile={handleFileSelect}
                                        onFileChange={handleFileChange}
                                        isLoading={isLoading}
                                        sandboxUrl={sandboxUrl}
                                    />
                                )}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Toggle Left Panel */}
                <button
                    onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                    className="p-2 hover:bg-gray-700 text-gray-400 transition-colors"
                    title={leftPanelOpen ? 'Close panel' : 'Open panel'}
                >
                    {leftPanelOpen ? (
                        <PanelLeftClose className="w-5 h-5" />
                    ) : (
                        <PanelLeftOpen className="w-5 h-5" />
                    )}
                </button>

                {/* Center - Editor / Preview */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Editor Area */}
                    <div className="flex-1 overflow-hidden">
                        {selectedFile && files[selectedFile] ? (
                            <MonacoCodeEditor
                                value={files[selectedFile]}
                                filename={selectedFile}
                                onChange={(value) => handleFileChange(selectedFile, value || '')}
                                height="100%"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <div className="text-center">
                                    <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">Select a file to edit</p>
                                    <p className="text-sm mt-2">Or generate code using the chat</p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {/* Toggle Right Panel */}
                <button
                    onClick={() => setRightPanelOpen(!rightPanelOpen)}
                    className="p-2 hover:bg-gray-700 text-gray-400 transition-colors"
                    title={rightPanelOpen ? 'Close panel' : 'Open panel'}
                >
                    {rightPanelOpen ? (
                        <PanelRightClose className="w-5 h-5" />
                    ) : (
                        <PanelRightOpen className="w-5 h-5" />
                    )}
                </button>

                {/* Right Panel - Preview / Terminal */}
                <AnimatePresence>
                    {rightPanelOpen && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 450, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="flex flex-col border-l border-gray-700 bg-gray-800"
                        >
                            {/* Tab Headers */}
                            <div className="flex border-b border-gray-700">
                                <button
                                    onClick={() => setActiveRightTab('preview')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeRightTab === 'preview'
                                        ? 'text-white bg-gray-700 border-b-2 border-green-500'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <Play className="w-4 h-4" />
                                    Preview
                                </button>
                                <button
                                    onClick={() => setActiveRightTab('terminal')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeRightTab === 'terminal'
                                        ? 'text-white bg-gray-700 border-b-2 border-yellow-500'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <Terminal className="w-4 h-4" />
                                    Terminal
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-hidden">
                                {activeRightTab === 'preview' ? (
                                    /* Preview Panel */
                                    <div className="h-full flex flex-col">
                                        {/* Preview Header */}
                                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                                            <span className="text-sm text-gray-400">Live Preview</span>
                                            {sandboxUrl && (
                                                <a
                                                    href={sandboxUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-400 hover:text-blue-300"
                                                >
                                                    Open in new tab
                                                </a>
                                            )}
                                        </div>

                                        {/* Preview Frame */}
                                        <div className="flex-1 bg-white">
                                            {sandboxUrl ? (
                                                <iframe
                                                    src={sandboxUrl}
                                                    className="w-full h-full"
                                                    title="Preview"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-500">
                                                    <div className="text-center">
                                                        <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                        <p>No preview available</p>
                                                        <p className="text-sm mt-1">Generate code to see preview</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* Terminal Panel */
                                    <TerminalPanel
                                        output={terminalLines}
                                        onRunCommand={handleTerminalCommand}
                                        isLoading={isLoading}
                                        height="100%"
                                    />
                                )}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>

            {/* Generation Progress Overlay */}
            {generationStage !== 'idle' && generationStage !== 'complete' && (
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50">
                    <GenerationProgress
                        stage={generationStage as any}
                        progress={generationProgress}
                        message={generationStage === 'thinking' ? 'AI is thinking...' :
                            generationStage === 'generating' ? 'Generating code...' :
                                'Processing...'}
                    />
                </div>
            )}

            {/* Export Modal */}
            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                files={files}
                projectName={projectName}
            />
        </div>
    );
}
