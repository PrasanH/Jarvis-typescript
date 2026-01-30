import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Helper to determine provider from model name
function getModelProvider(model: string): 'openai' | 'gemini' {
  if (model.startsWith('gpt-') || model.startsWith('chatgpt-')) {
    return 'openai';
  }
  return 'gemini';
}

// Handle OpenAI API
async function handleOpenAI(messages: any[], model: string) {
  // GPT-5-mini and GPT-5-nano don't support temperature and max_tokens parameters
  const isGpt5MiniOrNano = model === 'gpt-5-mini' || model === 'gpt-5-nano';
  
  const completionParams: any = {
    model,
    messages: messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    })),
  };

  // Only add temperature and max_tokens for models that support them
  if (!isGpt5MiniOrNano) {
    completionParams.temperature = 0.7;
    completionParams.max_tokens = 15000;
  }

  const completion = await openai.chat.completions.create(completionParams);

  return {
    message: {
      role: 'assistant',
      content: completion.choices[0].message.content || '',
      timestamp: Date.now(),
    },
  };
}

// Handle Gemini API
async function handleGemini(messages: any[], model: string) {
  const genModel = genAI.getGenerativeModel({ model });

  // Convert messages to Gemini format
  // Gemini expects a conversation history
  const history = messages.slice(0, -1).map((msg: any) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const lastMessage = messages[messages.length - 1];

  // Start chat with history
  const chat = genModel.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 15000,
      temperature: 0.7,
    },
  });

  // Send the last message and get response
  const result = await chat.sendMessage(lastMessage.content);
  const response = await result.response;
  const text = response.text();

  return {
    message: {
      role: 'assistant',
      content: text,
      timestamp: Date.now(),
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'gemini-2.0-flash-exp' } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Determine provider
    const provider = getModelProvider(model);

    let result;

    if (provider === 'openai') {
      result = await handleOpenAI(messages, model);
    } else {
      result = await handleGemini(messages, model);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get response from AI' },
      { status: 500 }
    );
  }
}
