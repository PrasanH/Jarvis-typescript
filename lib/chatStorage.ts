import { ChatSession, Message } from '@/types/chat';

// API-based storage (files stored in chat_history folder)
export const chatStorage = {
  // Get all chat sessions from server
  async getSessions(): Promise<ChatSession[]> {
    try {
      const response = await fetch('/api/storage');
      const data = await response.json();
      return data.sessions || [];
    } catch (error) {
      console.error('Error loading sessions:', error);
      return [];
    }
  },

  // Save a session to server
  async saveSession(session: ChatSession): Promise<void> {
    try {
      await fetch('/api/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });
    } catch (error) {
      console.error('Error saving session:', error);
    }
  },

  // Get a specific session
  async getSession(id: string): Promise<ChatSession | null> {
    const sessions = await this.getSessions();
    return sessions.find(s => s.id === id) || null;
  },

  // Create a new session
  async createSession(firstMessage?: Message): Promise<ChatSession> {
    const now = Date.now();
    const newSession: ChatSession = {
      id: `chat_${now}`,
      title: firstMessage?.content.slice(0, 50) || 'New Chat',
      messages: firstMessage ? [firstMessage] : [],
      createdAt: now,
      updatedAt: now,
    };
    
    await this.saveSession(newSession);
    return newSession;
  },

  // Update a session
  async updateSession(id: string, updates: Partial<ChatSession>): Promise<void> {
    const session = await this.getSession(id);
    if (session) {
      const updatedSession = {
        ...session,
        ...updates,
        updatedAt: Date.now(),
      };
      await this.saveSession(updatedSession);
    }
  },

  // Delete a session
  async deleteSession(id: string): Promise<void> {
    try {
      await fetch(`/api/storage?id=${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  },

  // Rename a session
  async renameSession(id: string, newTitle: string): Promise<void> {
    const session = await this.getSession(id);
    if (session) {
      await this.updateSession(id, { title: newTitle });
    }
  },

  // Add a message to a session
  async addMessage(sessionId: string, message: Message): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      session.messages.push(message);
      session.updatedAt = Date.now();
      await this.saveSession(session);
    }
  },
};
