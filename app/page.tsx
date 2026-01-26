'use client';

import { useState, useEffect } from 'react';
import ChatSidebar from '@/components/ChatSidebar';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';
import { ChatSession, Message } from '@/types/chat';
import { chatStorage } from '@/lib/chatStorage';
import { SYSTEM_PROMPTS, MODELS } from '@/lib/constants';

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      const loadedSessions = await chatStorage.getSessions();
      setSessions(loadedSessions);
      
      // Auto-select first session if available
      if (loadedSessions.length > 0 && !currentSessionId) {
        setCurrentSessionId(loadedSessions[0].id);
      }
    };
    loadSessions();
  }, []);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const handleNewChat = async () => {
    const newSession = await chatStorage.createSession();
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
  };

  const handleDeleteSession = async (id: string) => {
    await chatStorage.deleteSession(id);
    const updatedSessions = sessions.filter(s => s.id !== id);
    setSessions(updatedSessions);
    
    if (currentSessionId === id) {
      setCurrentSessionId(updatedSessions[0]?.id || null);
    }
  };

  const handleSendMessage = async (
    message: string,
    systemPrompt: string,
    model: string
  ) => {
    if (!message.trim()) return;

    // Create new session if none exists
    let sessionId = currentSessionId;
    if (!sessionId) {
      const userMessage: Message = {
        role: 'user',
        content: `${systemPrompt}. ${message}`,
        timestamp: Date.now(),
      };
      const newSession = await chatStorage.createSession(userMessage);
      setSessions([newSession, ...sessions]);
      sessionId = newSession.id;
      setCurrentSessionId(sessionId);
    } else {
      // Add user message to existing session
      const userMessage: Message = {
        role: 'user',
        content: `${systemPrompt}. ${message}`,
        timestamp: Date.now(),
      };
      await chatStorage.addMessage(sessionId, userMessage);
    }

    // Refresh sessions to show user message
    const updatedSessions = await chatStorage.getSessions();
    setSessions(updatedSessions);

    setIsLoading(true);

    try {
      // Get current session messages
      const session = await chatStorage.getSession(sessionId);
      if (!session) return;

      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: session.messages,
          model,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add assistant message
      await chatStorage.addMessage(sessionId, data.message);
      
      // Update title if it's the first exchange
      if (session.messages.length === 1) {
        await chatStorage.updateSession(sessionId, {
          title: message.slice(0, 50),
        });
      }

      // Refresh sessions
      const finalSessions = await chatStorage.getSessions();
      setSessions(finalSessions);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-black dark:bg-black text-white">
      {/* Sidebar */}
      {isSidebarOpen && (
        <ChatSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h1 className="text-xl font-bold">🤖 JARVIS Chat</h1>
            </div>
            {currentSession && (
              <p className="text-sm text-gray-500">
                {currentSession.messages.length} messages
              </p>
            )}
          </div>
        </div>

        {/* Messages */}
        <ChatMessages messages={currentSession?.messages || []} />

        {/* Input */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading}
          systemPrompts={SYSTEM_PROMPTS}
          models={MODELS}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Thinking...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
