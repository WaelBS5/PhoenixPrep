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

export interface DashboardUpdate {
    action: 'add' | 'set' | 'remove' | 'clear';
    section: keyof SalesBriefData;
    data: any;
}

export interface ChatResponse {
    message: Message;
    toolExecutions: ToolExecutionLog[];
    dashboardUpdates?: DashboardUpdate[];
}

export interface ResearchRuleParams {
    objective: string;
    targetAudience: string;
    includeIntentSignals?: boolean;
    spendAnalysis?: boolean;
    technologyFilters?: string[];
}

// Sales Brief Dashboard Types - Supporting interfaces first
export interface CompanyOverview {
    name: string;
    domain: string;
    industry?: string;
    employeeCount?: number;
    revenue?: string;
    location?: string;
    description?: string;
}

export interface TechStackItem {
    name: string;
    vendor: string;
    category: string;
    intensity?: string;
    installCount?: number;
}

export interface SpendingAnalysis {
    totalSpend?: string;
    cloudSpend?: string;
    topVendors?: Array<{
        name: string;
        amount: string;
    }>;
    contracts?: Array<{
        vendor: string;
        status: string;
        renewalDate?: string;
    }>;
}

export interface SalesAngle {
    competitivePosition?: string;
    painPoints?: string[];
    opportunities?: string[];
    wedges?: string[];
}

export interface TalkingPoint {
    category: string;
    points: string[];
}

export interface DiscoveryQuestion {
    question: string;
    category: 'technical' | 'business' | 'pain-point' | 'timing' | 'stakeholder';
    rationale?: string;
}

export interface ProductRecommendation {
    product: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    talkingPoints?: string[];
}

export interface CompetitiveIntel {
    competitors?: string[];
    positioning?: string;
    differentiators?: string[];
}

export interface ObjectionHandler {
    objection: string;
    response: string;
    category?: string;
}

// Main interface that uses all the above
export interface SalesBriefData {
    companyOverview?: CompanyOverview;
    techStack?: TechStackItem[];
    spending?: SpendingAnalysis;
    angle?: SalesAngle;
    talkingPoints?: TalkingPoint[];
    discoveryQuestions?: DiscoveryQuestion[];
    productRecommendations?: ProductRecommendation[];
    meetingOpener?: string;
    meetingCloser?: string;
    competitiveIntel?: CompetitiveIntel;
    painPoints?: string[];
    valueProps?: string[];
    objectionHandling?: ObjectionHandler[];
}
