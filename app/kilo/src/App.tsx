import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Settings, 
  ChevronDown, 
  Plus, 
  MessageSquare, 
  Trash2, 
  Terminal,
  Code,
  Cpu,
  Sparkles,
  Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Message, Model, SUPPORTED_MODELS } from './types';
import { sendMessageToOpenRouterStream, fetchOpenRouterModels } from './services/openRouterService';
import { sendMessageToGeminiStream } from './services/geminiService';
import { CodeBlock } from './components/CodeBlock';
import { Search, X } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('kilo_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [selectedModels, setSelectedModels] = useState<Model[]>(() => {
    const saved = localStorage.getItem('kilo_selected_models');
    return saved ? JSON.parse(saved) : [SUPPORTED_MODELS[0]];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(() => {
    return localStorage.getItem('kilo_system_prompt') || 'You are a professional AI coding assistant. Provide concise, accurate, and high-quality code solutions.';
  });
  
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [collaborativeMode, setCollaborativeMode] = useState(true);

  const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem('kilo_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('kilo_selected_models', JSON.stringify(selectedModels));
  }, [selectedModels]);

  useEffect(() => {
    localStorage.setItem('kilo_system_prompt', systemPrompt);
  }, [systemPrompt]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      setIsFetchingModels(true);
      const models = await fetchOpenRouterModels(openRouterKey);
      // Filter for free models (pricing is 0)
      const freeModels = models.filter((m: any) => 
        parseFloat(m.pricing?.prompt || '0') === 0 && parseFloat(m.pricing?.completion || '0') === 0
      );
      setAllModels(freeModels);
      setIsFetchingModels(false);
    };
    loadModels();
  }, []);

  const filteredModels = allModels.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleModel = (model: Model) => {
    setSelectedModels(prev => {
      const isSelected = prev.find(m => m.id === model.id);
      
      // If not in collaborative mode, clicking a model makes it the ONLY selected model
      if (!collaborativeMode) {
        return [model];
      }

      // In collaborative mode, toggle selection
      if (isSelected) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(m => m.id !== model.id);
      }
      return [...prev, model];
    });
  };

  const clearSelectedModels = () => {
    if (SUPPORTED_MODELS.length > 0) {
      setSelectedModels([SUPPORTED_MODELS[0]]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

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

    const agentsToRun = selectedModels.length > 0 
      ? (selectedModels.length > 1 && collaborativeMode ? selectedModels : [selectedModels[0]])
      : [SUPPORTED_MODELS[0]];

    // Run agents in parallel with real-time streaming updates
    await Promise.all(agentsToRun.map(async (model, idx) => {
      const messageId = (Date.now() + idx + 100).toString();
      
      // Initialize empty message for this agent
      setMessages(prev => [...prev, {
        id: messageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        modelId: model.id,
        modelName: model.name
      }]);

      try {
        if (model.id.includes('native')) {
          await sendMessageToGeminiStream(
            chatHistory,
            (chunk) => {
              setMessages(prev => prev.map(m => 
                m.id === messageId ? { ...m, content: m.content + chunk } : m
              ));
            }
          );
        } else {
          await sendMessageToOpenRouterStream(
            chatHistory,
            model.id,
            openRouterKey || '',
            (chunk) => {
              setMessages(prev => prev.map(m => 
                m.id === messageId ? { ...m, content: m.content + chunk } : m
              ));
            }
          );
        }
      } catch (err) {
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { 
            ...m, 
            content: `### ⚠️ Agent Error (${model.name})\n\n${err instanceof Error ? err.message : 'Failed to get response'}` 
          } : m
        ));
      }
    }));

    setIsLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the entire chat history?')) {
      setMessages([]);
      localStorage.removeItem('kilo_messages');
    }
  };

  return (
    <div className="flex h-screen bg-[#0d0d0d] text-[#e1e1e1] font-sans overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
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
            className="fixed md:relative h-full w-[240px] bg-[#111] border-r border-[#222] flex flex-col z-40 shadow-2xl md:shadow-none"
          >
            <div className="p-4 border-b border-[#222] flex items-center justify-between">
              <div className="flex items-center gap-2.5 font-bold text-white tracking-tight">
                <div className="w-7 h-7 bg-gradient-to-br from-[#007acc] to-[#00a2ff] rounded-lg flex items-center justify-center shadow-lg shadow-[#007acc]/20">
                  <Terminal size={14} className="text-white" />
                </div>
                <span className="text-base">Kilo IDE</span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-2 hover:bg-white/5 rounded-lg text-zinc-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
              <div className="px-2 py-1.5 flex items-center justify-between">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Sessions</span>
                <button 
                  onClick={clearChat}
                  className="p-1 hover:bg-white/5 rounded-md text-zinc-500 hover:text-white transition-colors"
                  title="New Chat"
                >
                  <Plus size={12} />
                </button>
              </div>
              {messages.length > 0 ? (
                <div className="space-y-1">
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#007acc]/10 text-xs cursor-pointer border border-[#007acc]/20 text-white transition-all"
                  >
                    <MessageSquare size={14} className="text-[#007acc]" />
                    <span className="truncate flex-1 font-medium">Active Session</span>
                    <div className="w-1 h-1 rounded-full bg-[#007acc] animate-pulse" />
                  </motion.div>
                  <div className="px-3 py-1 text-[9px] text-zinc-700 font-mono">
                    ID: {Math.random().toString(36).substring(7).toUpperCase()}
                  </div>
                </div>
              ) : (
                <div className="px-3 py-6 text-center text-[10px] text-zinc-600 italic">
                  No active sessions
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#222] space-y-2">
              <button 
                onClick={clearChat}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-500/10 text-xs font-medium transition-all border border-transparent hover:border-red-500/20 group"
              >
                <Trash2 size={16} className="text-zinc-400 group-hover:text-red-400 transition-colors" />
                <span className="text-zinc-400 group-hover:text-red-400 transition-colors">Clear History</span>
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 text-xs font-medium transition-all border border-transparent hover:border-white/5"
              >
                <Settings size={16} className="text-zinc-400" />
                <span>Preferences</span>
              </button>
              <div className="flex items-center gap-2.5 px-3 py-1.5 text-[10px] text-zinc-500 font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span>SYSTEM ONLINE</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-[#0d0d0d] to-[#111]">
        {/* Header */}
        <header className="h-12 border-b border-[#252525] glass flex items-center justify-between px-4 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-zinc-400 hover:text-white"
            >
              <MessageSquare size={18} />
            </button>
            <div className="h-4 w-px bg-[#252525]" />
            <div className="relative">
              <button 
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-white/5 text-xs font-semibold transition-all border border-transparent hover:border-white/10"
              >
                <Cpu size={14} className="text-[#007acc] shrink-0" />
                <span className="text-white truncate max-w-[80px] sm:max-w-none">
                  {selectedModels.length === 1 ? selectedModels[0].name : `${selectedModels.length} Agents`}
                </span>
                <div className="hidden sm:block px-1 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-bold text-emerald-400 uppercase tracking-tight">
                  {selectedModels.length > 1 ? (collaborativeMode ? 'Collab' : 'Single') : 'Single'}
                </div>
                <ChevronDown size={12} className={cn("transition-transform text-zinc-500 shrink-0", showModelSelector && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showModelSelector && (
                  <>
                    <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowModelSelector(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-3 w-[calc(100vw-2rem)] sm:w-[450px] bg-[#1a1a1a] border border-[#252525] rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl flex flex-col max-h-[80vh] sm:max-h-[600px]"
                    >
                      <div className="p-4 border-b border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                              Agent Marketplace
                            </span>
                            <span className="text-[9px] text-zinc-600">Select multiple models for collaborative coding</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={clearSelectedModels}
                              className="px-2 py-1 rounded text-[9px] font-bold bg-white/5 border border-white/10 text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                            >
                              RESET
                            </button>
                            <button 
                              onClick={() => setCollaborativeMode(!collaborativeMode)}
                              className={cn(
                                "px-2 py-1 rounded text-[9px] font-bold transition-all border",
                                collaborativeMode ? "bg-[#007acc]/20 border-[#007acc] text-white" : "bg-white/5 border-white/10 text-zinc-500"
                              )}
                            >
                              COLLAB: {collaborativeMode ? 'ON' : 'OFF'}
                            </button>
                          </div>
                        </div>
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                          <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search agents..."
                            className="w-full bg-[#111] border border-[#252525] rounded-lg py-2 pl-9 pr-4 text-xs text-zinc-300 focus:border-[#007acc] outline-none transition-all"
                          />
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                        {filteredModels.length > 0 ? (
                          filteredModels.map((model) => {
                            const isSelected = selectedModels.find(m => m.id === model.id);
                            return (
                              <button
                                key={model.id}
                                onClick={() => toggleModel(model)}
                                className={cn(
                                  "w-full flex flex-col items-start px-5 py-4 hover:bg-[#007acc]/10 transition-all text-left group relative border-b border-white/[0.02]",
                                  isSelected && "bg-[#007acc]/10"
                                )}
                              >
                                {isSelected && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#007acc]" />
                                )}
                                <div className="flex items-center justify-between w-full mb-1">
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                      isSelected ? "bg-[#007acc] border-[#007acc]" : "border-zinc-700 bg-transparent"
                                    )}>
                                      {isSelected && <Plus size={10} className="text-white rotate-45" />}
                                    </div>
                                    <span className={cn("text-sm font-bold transition-colors", isSelected ? "text-white" : "text-zinc-400 group-hover:text-white")}>
                                      {model.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="hidden sm:block text-[9px] font-mono text-zinc-600">
                                      {(model.context_length || 0) / 1000}k
                                    </span>
                                    <div className="px-1 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-bold text-emerald-400 uppercase">
                                      Free
                                    </div>
                                  </div>
                                </div>
                                <p className="text-[10px] text-zinc-500 line-clamp-1 mb-1 leading-relaxed">
                                  {model.description || 'No description available for this agent.'}
                                </p>
                                <span className="text-[8px] text-zinc-700 uppercase font-mono truncate w-full">
                                  {model.id}
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-5 py-8 text-center text-xs text-zinc-600 italic">
                            {isFetchingModels ? 'Fetching live models...' : 'No agents matching your search'}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Sparkles size={12} className="text-amber-500 animate-pulse" />
              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-tighter">Lightning Speed</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
              <Cpu size={12} className="text-[#007acc]" />
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Pro</span>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6 scroll-smooth custom-scrollbar">
          {/* Context Line - Responsive */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-4 px-3 py-1.5 sm:py-2 bg-white/5 rounded-lg border border-white/5 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex -space-x-1.5">
                {selectedModels.map((m, i) => (
                  <div key={m.id} className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#1a1a1a] border border-[#252525] flex items-center justify-center text-[6px] sm:text-[7px] font-bold text-[#007acc] shadow-lg" style={{ zIndex: selectedModels.length - i }}>
                    {m.name[0]}
                  </div>
                ))}
              </div>
              <div className="h-3 w-px bg-[#252525] hidden sm:block" />
              <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter sm:hidden">
                {selectedModels.length > 1 ? (collaborativeMode ? 'Collab Active' : 'Single Mode') : 'Single Agent'}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 flex-1">
              {selectedModels.map(m => (
                <span key={m.id} className="text-[7px] sm:text-[8px] font-mono text-zinc-500 flex items-center gap-1 bg-white/5 px-1 py-0.5 rounded">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  {m.name}
                </span>
              ))}
            </div>
            <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter hidden sm:block">
              {selectedModels.length > 1 ? (collaborativeMode ? 'Collaborative' : 'Single Agent') : 'Single Agent'}
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-xl mx-auto px-4">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#007acc] to-[#00a2ff] rounded-xl sm:rounded-2xl flex items-center justify-center text-white mb-2 sm:mb-4 shadow-2xl shadow-[#007acc]/30 rotate-12"
              >
                <Terminal size={24} className="sm:size-32" />
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tighter mb-1 sm:mb-2">KILO <span className="text-[#007acc]">CODE</span></h1>
                <p className="text-zinc-500 text-xs sm:text-sm font-medium leading-relaxed">
                  The ultimate multi-agent collaborative coding environment. <br className="hidden sm:block" />
                  Select multiple models to analyze and code together.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full pt-4 sm:pt-6"
              >
                {[
                  { icon: <Cpu size={14} />, title: 'Multi-Agent', desc: 'Parallel LLM streams' },
                  { icon: <Sparkles size={14} />, title: 'Pro Context', desc: '128k context support' },
                  { icon: <Code size={14} />, title: 'Clean Code', desc: 'Optimized for React' },
                  { icon: <Terminal size={14} />, title: 'Live Models', desc: 'OpenRouter search' }
                ].map((item, i) => (
                  <div key={i} className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/5 text-left hover:bg-white/[0.08] transition-all cursor-pointer group">
                    <div className="text-[#007acc] mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
                    <div className="text-[11px] sm:text-xs font-bold text-white mb-0.5">{item.title}</div>
                    <div className="text-[9px] sm:text-[10px] text-zinc-500 leading-relaxed">{item.desc}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full space-y-4 sm:space-y-6 pb-6">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={cn(
                    "flex gap-2.5 sm:gap-4 message-bubble-in",
                    message.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 sm:w-8 sm:h-8 rounded-lg shrink-0 flex items-center justify-center shadow-lg transition-transform hover:scale-110",
                    message.role === 'user' ? "bg-[#2d2d2d] text-zinc-400" : "bg-[#1a1a1a] border border-[#252525] text-[#007acc]"
                  )}>
                    {message.role === 'user' ? <User size={14} className="sm:size-16" /> : <Bot size={14} className="sm:size-16" />}
                  </div>
                  <div className={cn(
                    "flex-1 space-y-1 min-w-0",
                    message.role === 'user' ? "items-end text-right" : "items-start text-left"
                  )}>
                    <div className={cn(
                      "flex items-center gap-2 mb-0.5",
                      message.role === 'user' && "flex-row-reverse"
                    )}>
                      <span className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest truncate">
                        {message.role === 'user' ? 'Operator' : (message.modelName || 'Assistant')}
                      </span>
                      <span className="text-[8px] sm:text-[9px] text-zinc-600 font-mono shrink-0">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={cn(
                      "px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm markdown-body shadow-sm leading-relaxed overflow-x-auto",
                      message.role === 'user' 
                        ? "bg-[#1a1a1a] border border-white/5 text-zinc-200" 
                        : "bg-[#151515] border border-white/[0.03] text-zinc-300"
                    )}>
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <CodeBlock
                                language={match[1]}
                                value={String(children).replace(/\n$/, '')}
                              />
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={12} className="text-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Lightning Multi-Agent Stream</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {selectedModels.map((m, i) => (
                      <motion.div 
                        key={`loading-${m.id}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-white/5 border border-white/5"
                      >
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[#1a1a1a] border border-[#252525] flex items-center justify-center">
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-amber-500 animate-ping" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] sm:text-[10px] font-bold text-zinc-300 truncate">{m.name}</span>
                          <span className="text-[8px] sm:text-[9px] text-amber-500/60 font-mono animate-pulse">Streaming...</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 border-t border-[#252525] bg-[#0d0d0d]/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto relative">
            <div className="relative flex items-end gap-2 bg-[#151515] border border-[#252525] rounded-xl p-1.5 sm:p-2 focus-within:border-[#007acc]/50 focus-within:ring-2 focus-within:ring-[#007acc]/10 transition-all shadow-xl">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Command the AI..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-xs sm:text-sm py-1.5 px-2 sm:px-3 resize-none max-h-32 sm:max-h-48 min-h-[32px] sm:min-h-[36px] outline-none text-zinc-200 placeholder:text-zinc-600 custom-scrollbar"
                rows={1}
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "p-2 rounded-lg transition-all shadow-lg shrink-0",
                  input.trim() && !isLoading 
                    ? "bg-[#007acc] text-white hover:bg-[#0062a3] hover:scale-105 active:scale-95" 
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-1.5 text-white animate-pulse">
                    <Sparkles size={14} className="animate-spin" />
                  </div>
                ) : (
                  <Send size={16} className="sm:size-18" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between mt-1.5 sm:mt-2 px-1.5 sm:px-2">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <button className="text-zinc-600 hover:text-[#007acc] transition-colors flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                  <Code size={10} className="sm:size-12" />
                  <span className="hidden sm:inline">Snippet</span>
                </button>
                <div className="h-2.5 w-px bg-[#252525]" />
                <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-zinc-600 font-mono">
                  <div className="w-1 h-1 rounded-full bg-emerald-500" />
                  <span>READY</span>
                </div>
              </div>
              <div className="text-[8px] sm:text-[9px] text-zinc-600 font-medium">
                <span className="opacity-50 hidden sm:inline">SHIFT + ENTER for new line</span>
                <span className="opacity-50 sm:hidden">Enter to send</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#1a1a1a] border border-[#252525] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-[#252525] flex items-center justify-between bg-[#151515]">
                <div className="flex items-center gap-2.5">
                  <Settings className="text-[#007acc]" size={18} />
                  <h2 className="text-lg font-bold text-white">Preferences</h2>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-colors"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">System Instructions</label>
                  <textarea 
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="w-full h-28 bg-[#111] border border-[#252525] rounded-lg p-3 text-xs text-zinc-300 focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] outline-none transition-all resize-none"
                    placeholder="Set the AI's personality and rules..."
                  />
                  <p className="text-[9px] text-zinc-600 italic">This prompt guides the AI's behavior across all conversations.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">API Configuration</label>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-400">OpenRouter Key</span>
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", openRouterKey ? "bg-emerald-500/20 text-emerald-500" : "bg-yellow-500/20 text-yellow-500")}>
                        {openRouterKey ? 'DETECTED' : 'MISSING'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-400">Native Gemini</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500">ACTIVE</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full py-3 bg-[#007acc] text-white rounded-xl font-bold text-sm hover:bg-[#0062a3] transition-all shadow-lg shadow-[#007acc]/20 active:scale-[0.98]"
                >
                  Save & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


