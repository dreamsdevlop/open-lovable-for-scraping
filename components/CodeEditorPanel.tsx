"use client";

import React, { useState, useCallback, useEffect } from 'react';
import MonacoCodeEditor from './MonacoCodeEditor';
import {
    X,
    Plus,
    File,
    Folder,
    FolderOpen,
    ChevronRight,
    ChevronDown,
    FileCode,
    FileJson,
    FileText,
    Image,
    Loader2,
    RefreshCw,
    Save,
    Trash2
} from 'lucide-react';

interface FileNode {
    path: string;
    name: string;
    type: 'file' | 'folder';
    content?: string;
    children?: FileNode[];
    isExpanded?: boolean;
}

interface CodeEditorPanelProps {
    files: Record<string, string>;
    fileStructure?: string;
    selectedFile: string | null;
    onSelectFile: (path: string) => void;
    onFileChange?: (path: string, content: string) => void;
    onSaveFile?: (path: string, content: string) => void;
    onCloseFile?: (path: string) => void;
    onRefreshFiles?: () => void;
    isLoading?: boolean;
    sandboxUrl?: string;
}

export default function CodeEditorPanel({
    files,
    fileStructure,
    selectedFile,
    onSelectFile,
    onFileChange,
    onSaveFile,
    onCloseFile,
    onRefreshFiles,
    isLoading = false,
    sandboxUrl
}: CodeEditorPanelProps) {
    const [openFiles, setOpenFiles] = useState<string[]>([]);
    const [modifiedFiles, setModifiedFiles] = useState<Set<string>>(new Set());
    const [fileTree, setFileTree] = useState<FileNode[]>([]);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState<string | null>(null);

    // Parse file structure into tree
    useEffect(() => {
        if (!fileStructure) {
            // Create tree from file paths
            const tree: FileNode[] = [];
            const pathMap = new Map<string, FileNode>();

            Object.keys(files).sort().forEach(path => {
                const parts = path.split('/');
                let currentPath = '';

                parts.forEach((part, index) => {
                    const isFile = index === parts.length - 1;
                    currentPath = currentPath ? `${currentPath}/${part}` : part;

                    if (isFile) {
                        if (!pathMap.has(currentPath)) {
                            const node: FileNode = {
                                path: currentPath,
                                name: part,
                                type: 'file',
                                content: files[path]
                            };
                            pathMap.set(currentPath, node);
                        }
                    } else {
                        if (!pathMap.has(currentPath)) {
                            const node: FileNode = {
                                path: currentPath,
                                name: part,
                                type: 'folder',
                                children: [],
                                isExpanded: expandedFolders.has(currentPath)
                            };
                            pathMap.set(currentPath, node);
                        }
                    }
                });
            });

            // Build tree structure
            pathMap.forEach((node, path) => {
                const lastSlash = path.lastIndexOf('/');
                if (lastSlash > 0) {
                    const parentPath = path.substring(0, lastSlash);
                    const parent = pathMap.get(parentPath);
                    if (parent && parent.children) {
                        parent.children.push(node);
                        parent.children.sort((a, b) => {
                            if (a.type === b.type) return a.name.localeCompare(b.name);
                            return a.type === 'folder' ? -1 : 1;
                        });
                    }
                } else {
                    tree.push(node);
                }
            });

            setFileTree(tree.sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'folder' ? -1 : 1;
            }));
        } else {
            // Parse from structure string
            try {
                const lines = fileStructure.split('\n');
                const tree: FileNode[] = [];

                lines.forEach(line => {
                    const match = line.match(/^(\s*)(.+)/);
                    if (match) {
                        const indent = match[1].length;
                        const name = match[2].replace(/[📁📄]/g, '').trim();

                        if (name && !name.startsWith('=')) {
                            const isFolder = name.endsWith('/') || line.includes('📁');
                            const node: FileNode = {
                                path: name,
                                name: isFolder ? name.replace('/', '') : name,
                                type: isFolder ? 'folder' : 'file',
                                content: isFolder ? undefined : files[name]
                            };

                            if (indent === 0) {
                                tree.push(node);
                            }
                        }
                    }
                });

                setFileTree(tree);
            } catch (e) {
                console.error('Failed to parse file structure:', e);
            }
        }
    }, [files, fileStructure, expandedFolders]);

    // Open file when selected
    useEffect(() => {
        if (selectedFile && !openFiles.includes(selectedFile)) {
            setOpenFiles(prev => [...prev, selectedFile]);
        }
        setActiveTab(selectedFile);
    }, [selectedFile]);

    const handleTabClose = useCallback((e: React.MouseEvent, path: string) => {
        e.stopPropagation();
        setOpenFiles(prev => prev.filter(f => f !== path));
        if (activeTab === path) {
            setActiveTab(openFiles.find(f => f !== path) || null);
        }
        setModifiedFiles(prev => {
            const next = new Set(prev);
            next.delete(path);
            return next;
        });
        if (onCloseFile) onCloseFile(path);
    }, [activeTab, openFiles, onCloseFile]);

    const handleEditorChange = useCallback((value: string | undefined) => {
        if (activeTab && value !== undefined) {
            if (onFileChange) {
                onFileChange(activeTab, value);
            }
            setModifiedFiles(prev => new Set(prev).add(activeTab));
        }
    }, [activeTab, onFileChange]);

    const handleSave = useCallback(async () => {
        if (!activeTab || !onSaveFile) return;

        const content = files[activeTab];
        setIsSaving(activeTab);
        try {
            await onSaveFile(activeTab, content);
            setModifiedFiles(prev => {
                const next = new Set(prev);
                next.delete(activeTab);
                return next;
            });
        } finally {
            setIsSaving(null);
        }
    }, [activeTab, files, onSaveFile]);

    const toggleFolder = useCallback((path: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    }, []);

    const getFileIcon = (path: string) => {
        const ext = path.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'js':
            case 'jsx':
            case 'ts':
            case 'tsx':
                return <FileCode className="w-4 h-4 text-yellow-500" />;
            case 'json':
                return <FileJson className="w-4 h-4 text-green-500" />;
            case 'md':
            case 'txt':
                return <FileText className="w-4 h-4 text-gray-400" />;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'svg':
                return <Image className="w-4 h-4 text-purple-500" />;
            default:
                return <File className="w-4 h-4 text-gray-400" />;
        }
    };

    const renderFileTree = (nodes: FileNode[], depth = 0): React.ReactNode => {
        return nodes.map(node => (
            <div key={node.path}>
                <div
                    className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-gray-700/50 ${selectedFile === node.path ? 'bg-blue-500/20 text-blue-400' : 'text-gray-300'
                        }`}
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                    onClick={() => {
                        if (node.type === 'folder') {
                            toggleFolder(node.path);
                        } else {
                            onSelectFile(node.path);
                            setActiveTab(node.path);
                            if (!openFiles.includes(node.path)) {
                                setOpenFiles(prev => [...prev, node.path]);
                            }
                        }
                    }}
                >
                    {node.type === 'folder' ? (
                        <>
                            {expandedFolders.has(node.path) ? (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                            {expandedFolders.has(node.path) ? (
                                <FolderOpen className="w-4 h-4 text-yellow-500" />
                            ) : (
                                <Folder className="w-4 h-4 text-yellow-500" />
                            )}
                        </>
                    ) : (
                        <span className="w-4" />
                    )}
                    <span className="text-sm truncate">{node.name}</span>
                </div>
                {node.type === 'folder' && node.children && expandedFolders.has(node.path) && (
                    renderFileTree(node.children, depth + 1)
                )}
            </div>
        ));
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-300">Files</span>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
                </div>
                <div className="flex items-center gap-1">
                    {onRefreshFiles && (
                        <button
                            onClick={onRefreshFiles}
                            className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
                            title="Refresh files"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                </div>
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-auto py-2">
                {fileTree.length > 0 ? (
                    renderFileTree(fileTree)
                ) : (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span>Loading files...</span>
                            </div>
                        ) : (
                            <span>No files yet. Generate code to see files here.</span>
                        )}
                    </div>
                )}
            </div>

            {/* Editor Tabs */}
            {openFiles.length > 0 && (
                <div className="border-t border-gray-700">
                    <div className="flex items-center overflow-x-auto bg-gray-800">
                        {openFiles.map(path => (
                            <div
                                key={path}
                                className={`flex items-center gap-2 px-3 py-2 border-r border-gray-700 cursor-pointer min-w-0 ${activeTab === path
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-400 hover:bg-gray-700'
                                    }`}
                                onClick={() => {
                                    setActiveTab(path);
                                    onSelectFile(path);
                                }}
                            >
                                {getFileIcon(path)}
                                <span className="text-sm truncate max-w-[120px]">{path.split('/').pop()}</span>
                                {modifiedFiles.has(path) && (
                                    <span className="w-2 h-2 rounded-full bg-yellow-500" title="Unsaved changes" />
                                )}
                                <button
                                    onClick={(e) => handleTabClose(e, path)}
                                    className="p-0.5 hover:bg-gray-600 rounded"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Editor */}
                    {activeTab && (
                        <MonacoCodeEditor
                            value={files[activeTab] || ''}
                            filename={activeTab}
                            onChange={handleEditorChange}
                            onSave={handleSave}
                            height="400px"
                            theme="vs-dark"
                        />
                    )}
                </div>
            )}
        </div>
    );
}
