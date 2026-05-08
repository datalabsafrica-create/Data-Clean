import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Bot, User, Trash2 } from 'lucide-react';
import { Dataset, ChatMessage } from '../types';
import { chatAboutDataset } from '../lib/gemini';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AIAssistantProps {
  dataset: Dataset;
  isOpen: boolean;
  onClose: () => void;
}

export default function AIAssistant({ dataset, isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'greeting',
      role: 'assistant',
      content: `Hi! I'm CleanFlow AI. I noticed your dataset "${dataset.name}" has ${dataset.stats.missingValues} missing values and a quality score of ${dataset.stats.qualityScore}/100. How can I help you analyze or clean it today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Small pause for realistic feel
      const response = await chatAboutDataset(dataset, messages, userMsg.content);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: `Chat history cleared. How else can I help with "${dataset.name}"?`,
      timestamp: new Date()
    }]);
  };

  return (
    <div className={cn(
      "fixed inset-y-0 right-0 w-80 md:w-96 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 shadow-xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-1.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm">
            <Sparkles size={16} />
          </div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-tight">AI Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleClear} className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors" title="Clear Chat">
            <Trash2 size={16} />
          </button>
          <button onClick={onClose} className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors" title="Close Panel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
            <div className={cn(
              "w-8 h-8 rounded border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center shrink-0",
              msg.role === 'user' ? "bg-white dark:bg-slate-700" : "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400"
            )}>
              {msg.role === 'user' ? <User size={14} className="text-slate-600 dark:text-slate-300" /> : <Bot size={14} />}
            </div>
            <div className={cn(
              "px-3 py-2 rounded border max-w-[80%] text-xs shadow-sm",
              msg.role === 'user' 
                ? "bg-slate-800 text-white border-slate-800 dark:bg-slate-600 dark:border-slate-600" 
                : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 flex-row">
            <div className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Bot size={14} />
            </div>
            <div className="px-3 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI about this dataset..."
            className="w-full pl-3 pr-10 py-2 text-xs rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white placeholder:text-slate-400 shadow-sm"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-slate-800 dark:bg-slate-600 text-white rounded disabled:opacity-50 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
