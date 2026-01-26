'use client';

import { Message } from '@/types/chat';
import { User, Bot } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ChatMessagesProps {
  messages: Message[];
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
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
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
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
            className={`max-w-[70%] rounded-lg p-4 ${
              message.role === 'user'
                ? 'bg-black text-white border border-red-400'
                : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
            }`}
          >
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
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
  );
}
