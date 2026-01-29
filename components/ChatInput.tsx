'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { ModelConfig } from '@/types/chat';

interface ChatInputProps {
  onSend: (message: string, systemPrompt: string, model: string) => void;
  disabled?: boolean;
  systemPrompts: Array<{ label: string; content: string }>;
  models: ModelConfig[];
}

export default function ChatInput({
  onSend,
  disabled,
  systemPrompts,
  models,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState(systemPrompts[0].content);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4.1-mini');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);

  // Group models by provider
  const openaiModels = models.filter(m => m.provider === 'openai');
  const geminiModels = models.filter(m => m.provider === 'gemini');

  const handleApplyPrompt = () => {
    const finalPrompt = customPrompt.trim() || selectedPrompt;
    setMessage(prev => prev ? `${finalPrompt}\n\n${prev}` : finalPrompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    onSend(message, '', selectedModel); // Send empty string for systemPrompt
    setMessage('');
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-black p-3">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Settings Row */}
        <div className="flex gap-2 flex-wrap">
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
              <button
                type="button"
                onClick={handleApplyPrompt}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Apply
              </button>
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

        {/* Custom Prompt */}
        {showCustomPrompt && (
          <div>
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
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type your message here... (Shift+Enter for new line)"
            rows={3}
            disabled={disabled}
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black resize-none"
          />
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="px-3 py-1 bg-lime-800 text-white-500 rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 self-end"
          >
            <Send size={10} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
