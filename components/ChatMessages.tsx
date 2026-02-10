'use client';

import { Message } from '@/types/chat';
import { User, Bot, Copy, Check, Edit } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface ChatMessagesProps {
  messages: Message[];
  onEditMessage?: (index: number) => void;
  editingIndex?: number;
}

const CopyButton = ({ content, isUser }: { content: string; isUser: boolean }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 rounded-md transition-all duration-200 ${
        isUser
          ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
          : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
      }`}
      title="Copy"
    >
      {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
};

export default function ChatMessages({ messages, onEditMessage, editingIndex }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter out system messages as they shouldn't be displayed to the user
  const displayMessages = messages.filter(msg => msg.role !== 'system');
  
  // Find the index of the last user message
  const lastUserMessageIndex = displayMessages.reduce((lastIndex, msg, index) => {
    return msg.role === 'user' ? index : lastIndex;
  }, -1);

  if (displayMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Bot size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl font-semibold mb-2">Welcome to JARVIS Chat</p>
          <p className="text-sm">Start a conversation by typing a message below</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {displayMessages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center flex-shrink-0">
                <Bot size={20} className="text-white" />
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-lg p-4 relative group ${
                message.role === 'user'
                  ? 'bg-black text-white border border-red-400'
                  : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
              } ${
                editingIndex !== undefined && index === editingIndex
                  ? 'ring-2 ring-yellow-400 ring-offset-2 dark:ring-offset-black'
                  : ''
              }`}
            >
            {/* Action Buttons */}
            <div className="absolute bottom-2 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton content={message.content} isUser={message.role === 'user'} />
              {message.role === 'user' && onEditMessage && index === lastUserMessageIndex && (
                <button
                  onClick={() => onEditMessage(index)}
                  className="p-1.5 rounded-md transition-all duration-200 hover:bg-gray-800 text-gray-400 hover:text-yellow-400"
                  title="Edit and regenerate"
                >
                  <Edit size={14} />
                </button>
              )}
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  code: ({ inline, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <pre className="bg-gray-900 dark:bg-gray-950 rounded-md p-3 overflow-x-auto my-2">
                        <code {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                  table: ({ children, ...props }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 border border-gray-300 dark:border-gray-600" {...props}>
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children, ...props }) => (
                    <thead className="bg-gray-100 dark:bg-gray-800" {...props}>
                      {children}
                    </thead>
                  ),
                  th: ({ children, ...props }) => (
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600 last:border-r-0" {...props}>
                      {children}
                    </th>
                  ),
                  td: ({ children, ...props }) => (
                    <td className="px-4 py-2 text-sm border-r border-gray-300 dark:border-gray-600 last:border-r-0" {...props}>
                      {children}
                    </td>
                  ),
                  tr: ({ children, ...props }) => (
                    <tr className="border-b border-gray-300 dark:border-gray-600 last:border-b-0" {...props}>
                      {children}
                    </tr>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>

          {message.role === 'user' && (
            <div className="w-8 h-8 rounded-full bg-red-400 flex items-center justify-center flex-shrink-0">
              <User size={20} className="text-white" />
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
