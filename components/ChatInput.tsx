'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, ChevronDown, ChevronUp, GripHorizontal, X } from 'lucide-react';
import { ModelConfig } from '@/types/chat';

interface ChatInputProps {
  onSend: (message: string, systemPrompt: string, model: string) => void;
  disabled?: boolean;
  systemPrompts: Array<{ label: string; content: string }>;
  models: ModelConfig[];
  editingMessage?: string;
  onCancelEdit?: () => void;
}

export default function ChatInput({
  onSend,
  disabled,
  systemPrompts,
  models,
  editingMessage,
  onCancelEdit,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState(systemPrompts[0].content);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4.1-mini');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [containerHeight, setContainerHeight] = useState(250); // Default height for entire input block
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  // Populate message when editing
  useEffect(() => {
    if (editingMessage !== undefined) {
      setMessage(editingMessage);
    }
  }, [editingMessage]);

  // Group models by provider
  const openaiModels = models.filter(m => m.provider === 'openai');
  const geminiModels = models.filter(m => m.provider === 'gemini');
  
  // Determine if current model is Gemini
  const isGeminiModel = selectedModel.startsWith('gemini-');

  // Resize handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing.current && containerRef.current) {
        e.preventDefault();
        const containerRect = containerRef.current.getBoundingClientRect();
        const newHeight = containerRect.bottom - e.clientY;
        const clampedHeight = Math.max(150, Math.min(400, newHeight));
        setContainerHeight(clampedHeight);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startResizing = () => {
    isResizing.current = true;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  const handleApplyPrompt = () => {
    // Only apply prompt to message for Gemini models
    if (isGeminiModel) {
      const finalPrompt = customPrompt.trim() || selectedPrompt;
      setMessage(prev => prev ? `${finalPrompt}\n\n${prev}` : finalPrompt);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    onSend(message, selectedPrompt, selectedModel);
    
    // Only clear if not editing (editing is cleared by parent)
    if (!editingMessage) {
      setMessage('');
    }
    
    // Reset textarea height after submission
    const textarea = (e.target as HTMLFormElement).querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
    }
  };

  return (
    <div className="relative border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
      {/* Resize Handle */}
      <div 
        className="absolute top-0 left-0 right-0 h-2 hover:bg-blue-500 dark:hover:bg-blue-500 cursor-ns-resize flex items-center justify-center group transition-colors z-10"
        onMouseDown={startResizing}
      >
        <GripHorizontal size={16} className="text-gray-500 dark:text-gray-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content Container */}
      <div 
        ref={containerRef}
        className="overflow-y-auto p-3"
        style={{ height: `${containerHeight}px` }}
      >
        <div className="max-w-4xl mx-auto space-y-3 h-full flex flex-col">
          {/* Editing Mode Indicator */}
          {editingMessage !== undefined && (
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg flex-shrink-0">
              <span className="text-sm text-yellow-800 dark:text-yellow-200 flex-1">
                ✏️ Editing message - response will be regenerated
              </span>
              {onCancelEdit && (
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="p-1 hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded transition-colors"
                  title="Cancel editing"
                >
                  <X size={16} className="text-yellow-800 dark:text-yellow-200" />
                </button>
              )}
            </div>
          )}

          {/* Settings Toggle Button */}
          <div className="flex justify-between items-center flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {showSettings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              <span>Settings</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({selectedModel})
              </span>
            </button>
          </div>

          {/* Settings Row */}
          {showSettings && (
            <div className="flex gap-2 flex-wrap flex-shrink-0">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-700 dark:text-amber-300 mb-1">
                System Prompt
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedPrompt}
                  onChange={(e) => {
                    setSelectedPrompt(e.target.value);
                    setCustomPrompt('');
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-white dark:text-white focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {systemPrompts.map((prompt, index) => (
                    <option key={index} value={prompt.content}>
                      {prompt.label}
                    </option>
                  ))}
                </select>
                {isGeminiModel && (
                  <button
                    type="button"
                    onClick={handleApplyPrompt}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    Apply
                  </button>
                )}
              </div>
            </div>

            <div className="w-48">
              <label className="block text-xs font-medium text-white dark:text-emerald-500 mb-1">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-white dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <optgroup label="🤖 OpenAI Models">
                  {openaiModels.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="✨ Gemini Models">
                  {geminiModels.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setShowCustomPrompt(!showCustomPrompt)}
                className="px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showCustomPrompt ? 'Hide' : 'Custom Prompt'}
              </button>
            </div>
          </div>
          )}

          {/* Custom Prompt */}
          {showSettings && showCustomPrompt && (
            <div className="flex-shrink-0">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Type custom system prompt..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Message Input */}
          <form onSubmit={handleSubmit} className="flex gap-2 flex-1 min-h-0">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your message here..."
              disabled={disabled}
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-3xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black resize-none overflow-y-auto"
            />
            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className="px-3 py-1 bg-lime-800 text-white-500 rounded-2xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 self-end"
            >
              <Send size={10} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
