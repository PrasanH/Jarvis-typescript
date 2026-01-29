// Types for our chat application
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface SystemPrompt {
  label: string;
  content: string;
}

export type ModelProvider = 'openai' | 'gemini';

export interface ModelConfig {
  value: string;
  label: string;
  provider: ModelProvider;
}
