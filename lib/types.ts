// Type definitions for HG Research Chat

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    toolCalls?: ToolCall[];
    timestamp?: number;
}

export interface ToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string; // JSON string
    };
}

export interface ToolResult {
    tool_call_id: string;
    role: 'tool';
    name: string;
    content: string;
}

export interface MCPTool {
    name: string;
    description: string;
    inputSchema: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
}

export interface MCPPrompt {
    name: string;
    description: string;
    arguments?: Array<{
        name: string;
        description: string;
        required: boolean;
    }>;
}

export interface ToolExecutionLog {
    id: string;
    toolName: string;
    arguments: Record<string, any>;
    result: any;
    timestamp: number;
    duration?: number;
}

export interface ChatRequest {
    messages: Message[];
}

export interface ChatResponse {
    message: Message;
    toolExecutions: ToolExecutionLog[];
}

export interface ResearchRuleParams {
    objective: string;
    targetAudience: string;
    includeIntentSignals?: boolean;
    spendAnalysis?: boolean;
    technologyFilters?: string[];
}
