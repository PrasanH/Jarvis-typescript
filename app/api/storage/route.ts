import { NextRequest, NextResponse } from 'next/server';
import { ChatSession } from '@/types/chat';
import fs from 'fs';
import path from 'path';

const CHAT_HISTORY_DIR = path.join(process.cwd(), 'chat_history');

// Ensure chat_history directory exists
function ensureChatHistoryDir() {
  if (!fs.existsSync(CHAT_HISTORY_DIR)) {
    fs.mkdirSync(CHAT_HISTORY_DIR, { recursive: true });
  }
}

// Get all chat sessions
export async function GET() {
  try {
    ensureChatHistoryDir();
    
    const files = fs.readdirSync(CHAT_HISTORY_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const sessions: ChatSession[] = [];
    
    for (const file of jsonFiles) {
      const filePath = path.join(CHAT_HISTORY_DIR, file);
      const data = fs.readFileSync(filePath, 'utf-8');
      const session = JSON.parse(data);
      sessions.push(session);
    }
    
    // Sort by updatedAt (newest first)
    sessions.sort((a, b) => b.updatedAt - a.updatedAt);
    
    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error('Error loading sessions:', error);
    return NextResponse.json(
      { error: 'Failed to load sessions', sessions: [] },
      { status: 500 }
    );
  }
}

// Create or update a chat session
export async function POST(request: NextRequest) {
  try {
    ensureChatHistoryDir();
    
    const session: ChatSession = await request.json();
    const filePath = path.join(CHAT_HISTORY_DIR, `${session.id}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(session, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    console.error('Error saving session:', error);
    return NextResponse.json(
      { error: 'Failed to save session' },
      { status: 500 }
    );
  }
}

// Delete a chat session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    const filePath = path.join(CHAT_HISTORY_DIR, `${sessionId}.json`);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
