// API Route: /api/chat
// Handles chat messages and orchestrates LLM + MCP tool calling

import { NextRequest, NextResponse } from 'next/server';
import { runAgentLoop } from '@/lib/agent';
import type { ChatRequest, ChatResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
    try {
        const body: ChatRequest = await request.json();
        const { messages } = body;

        if (!messages || messages.length === 0) {
            return NextResponse.json(
                { error: 'No messages provided' },
                { status: 400 }
            );
        }

        // Run the agent loop
        const result = await runAgentLoop(messages);

        const response: ChatResponse = {
            message: result.message,
            toolExecutions: result.toolExecutions,
        };

        return NextResponse.json(response);
    } catch (error: any) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
