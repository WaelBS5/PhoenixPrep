// Agent orchestration loop with LLM tool calling
// Implements the standard agentic loop: LLM -> Tool Calls -> Results -> LLM -> Response

import type { Message, ToolCall, ToolResult, ToolExecutionLog, MCPTool, MCPPrompt } from './types';
import { listTools, callTool, listPrompts, callPrompt } from './mcpClient';
import { dashboardToolSchemas, isDashboardTool, executeDashboardTool, DashboardUpdate } from './dashboardTools';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Cache for MCP discovery to avoid redundant API calls and confusing logs
let cachedTools: MCPTool[] | null = null;
let cachedPrompts: MCPPrompt[] | null = null;

/**
 * Run the agent loop: send message to LLM, execute tool calls, return final response
 */
export async function runAgentLoop(
    messages: Message[]
): Promise<{ message: Message; toolExecutions: ToolExecutionLog[]; dashboardUpdates: DashboardUpdate[] }> {
    const toolExecutions: ToolExecutionLog[] = [];
    const dashboardUpdates: DashboardUpdate[] = [];

    // Get available tools and convert to OpenAI function format
    const availableTools = await getToolSchemas();

    // Add system prompt
    const systemPrompt: Message = {
        role: 'system',
        content: `You are Phoenix Prep, a pre-call Sales Intelligence Agent for GitGuardian.
Your job is to help an Account Executive prepare for a sales meeting fast by generating a high-signal, actionable battlecard.

You MUST use HG Insights Phoenix MCP tools to gather evidence, then convert it into:
- what to say
- what to ask
- which GitGuardian product to push
- why now

Do NOT output long raw data dumps or JSON. Write natural, conversational markdown that reads like advice from a senior Account Executive.

# GitGuardian Context (What we sell)
GitGuardian helps companies prevent and remediate leaked secrets across code, Git platforms, and CI/CD.

Products:
1) Secrets Detection: detect/prevent secrets in repos, PRs, CI/CD, dev machines
2) Public Monitoring: detect secrets leaked in public repos and external exposure
3) NHI Governance: visibility/control over Non-Human Identities (tokens, service accounts, bots)

Core value:
Catch secrets BEFORE they become incidents. Reduce breach risk + improve auditability without slowing devs down.

# Research Workflow (Tool Policy)
Always prioritize MCP tools. Web search is last resort.

Always run these tools (in this order):
1) company_firmographic(domain) → size, industry, HQ, revenue band
2) company_technographic(domain) → tech stack (cloud, CI/CD, Git, security)
3) company_cloud_spend(domain) OR company_spend(domain) → budget signals

Optional tools (only if needed):
- company_fai(domain) if company is large or you need department-level targeting
- list_intent_topics only if user asks for buying signals
- company_contracts only if you want renewal/urgency signals
- search_companies only if the domain is unclear
- web_search only for recent news OR to find missing domain

# Interpretation Rules (turn tech into sales insight)
From technographics, infer risk + angle:
- CI/CD tools (Jenkins, GitHub Actions, GitLab CI) → secrets leak risk in pipelines/config/logs
- Git platforms (GitHub/GitLab/Bitbucket) → secrets leak risk in commits/PRs/history
- Kubernetes/microservices → NHI sprawl risk (service accounts/tokens)
- Cloud footprint (AWS/Azure/GCP) → large credential surface area
- Compliance industries (finance/public sector/healthcare) → audit + incident response pressure
- Secrets managers (Vault/Secrets Manager/Key Vault/CyberArk) ≠ secrets detection in code (position GitGuardian as missing layer)

If spend numbers look unreliable (e.g., OSS tools showing spend), label as Estimated and avoid overclaiming.

# Output Format (STRICT)
Return exactly these sections in Markdown:

## 1) Executive Summary (3 bullets max)
- Who they are + why they matter
- What we detected (2-3 key stack signals)
- Best GitGuardian wedge (which product to lead with)

## 2) GitGuardian Fit Score (0–100)
Provide a score + 3 reasons.
Score must be explainable: CI/CD + cloud + K8s + lack of secrets detection = high score.

## 3) What Their Stack Implies (5 bullets)
Interpretation only. No vendor list spam.

## 4) Top 3 Sales Plays (the WOW section)
For each play, include:
- Hypothesis
- Evidence (from MCP results)
- GitGuardian product to push
- Talk track (2 sentences max)

## 5) Competitive / Displacement Notes
If you detect Vault / Secrets Manager / Key Vault / CyberArk or code security tools:
- explain the gap (runtime storage vs code leak prevention)
- give 1 displacement angle

## 6) Discovery Questions (7 questions)
Must be tailored to the detected stack.
Include at least:
- prevention workflow (pre-commit / PR)
- Git history scanning
- secret incident response + rotation SLA
- public repo monitoring
- NHI ownership/lifecycle

## 7) Meeting Opener + Close
- Opener (1 sentence)
- Close (1 sentence asking for next step)

## 8) Evidence Appendix (Top 10 only)
A compact table:

| Signal | Vendor/Tool | Why it matters |
|---|---|---|

Keep it short. No more than 10 rows.

# Success Criteria
A good answer should feel like a senior AE wrote it:
- specific, not generic
- clear recommended product focus (Secrets Detection vs Public Monitoring vs NHI Governance)
- strong talk track + questions
- minimal fluff

# Dashboard Tools (IMPORTANT)
You have access to dashboard tools that let you DIRECTLY update the sales battlecard dashboard. Use these tools whenever:
1. The user asks to add, remove, or modify items on the dashboard
2. You generate new content that should appear on the dashboard (questions, opener, closer, etc.)

Available dashboard tools:
- dashboard_add_question: Add a discovery question (with category: technical/business/pain-point/timing/stakeholder)
- dashboard_remove_question: Remove a question by index or matching text
- dashboard_set_opener: Set the meeting opener
- dashboard_set_closer: Set the meeting closer
- dashboard_add_pain_point: Add a pain point
- dashboard_add_value_prop: Add a value proposition
- dashboard_add_objection: Add an objection with response
- dashboard_add_product_recommendation: Add a GitGuardian product recommendation
- dashboard_clear_section: Clear an entire section (discoveryQuestions, painPoints, valueProps, etc.)
- dashboard_set_competitive_intel: Set competitive intelligence

ALWAYS use these dashboard tools when generating battlecard content. For example:
- When generating discovery questions, call dashboard_add_question for each question
- When suggesting a meeting opener, call dashboard_set_opener
- When the user says "add a closing question", use dashboard_add_question
- When the user says "remove the pain points", use dashboard_clear_section with section="painPoints"`
};

    const conversationMessages = [systemPrompt, ...messages];

    // Initial LLM call
    let response = await callLLM(conversationMessages, availableTools);

    // Tool calling loop
    let iterations = 0;
    const maxIterations = 5; // Prevent infinite loops

    while (response.tool_calls && response.tool_calls.length > 0 && iterations < maxIterations) {
        iterations++;

        // Execute all tool calls - separate dashboard tools from MCP tools
        const toolResults: ToolResult[] = [];

        for (const toolCall of response.tool_calls) {
            const args = JSON.parse(toolCall.function.arguments);
            const startTime = Date.now();

            if (isDashboardTool(toolCall.function.name)) {
                // Execute dashboard tool locally
                const { result, update } = executeDashboardTool(toolCall.function.name, args);
                dashboardUpdates.push(update);

                toolExecutions.push({
                    id: toolCall.id,
                    toolName: toolCall.function.name,
                    arguments: args,
                    result: { success: true, message: result },
                    timestamp: startTime,
                    duration: Date.now() - startTime,
                });

                toolResults.push({
                    tool_call_id: toolCall.id,
                    role: 'tool',
                    name: toolCall.function.name,
                    content: JSON.stringify({ success: true, message: result }),
                });
            } else {
                // Execute MCP tool
                const execution = await executeToolCall(toolCall);
                toolExecutions.push(execution);

                toolResults.push({
                    tool_call_id: toolCall.id,
                    role: 'tool',
                    name: toolCall.function.name,
                    content: JSON.stringify(execution.result),
                });
            }
        }

        // Add assistant message with tool calls
        conversationMessages.push({
            role: 'assistant',
            content: response.content || '',
            toolCalls: response.tool_calls,
        });

        // Add tool results as separate messages
        for (const result of toolResults) {
            conversationMessages.push({
                role: 'tool' as any,
                content: result.content,
                tool_call_id: result.tool_call_id,
                name: result.name,
            } as any);
        }

        // Call LLM again with tool results
        response = await callLLM(conversationMessages, availableTools);
    }

    return {
        message: {
            role: 'assistant',
            content: response.content || 'I apologize, but I encountered an issue generating a response.',
            timestamp: Date.now(),
        },
        toolExecutions,
        dashboardUpdates,
    };
}

/**
 * Call the LLM with tool schemas
 */
async function callLLM(messages: Message[], tools: any[]): Promise<any> {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY not configured');
    }

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://hg-research-chat.local',
            'X-Title': 'HG Research Chat',
        },
        body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages: messages.map(m => {
                const msg: any = {
                    role: m.role,
                    content: m.content,
                };

                // Add tool_calls for assistant messages
                if (m.toolCalls) {
                    msg.tool_calls = m.toolCalls;
                }

                // Add tool_call_id and name for tool messages
                if ((m as any).tool_call_id) {
                    msg.tool_call_id = (m as any).tool_call_id;
                    msg.name = (m as any).name;
                }

                return msg;
            }),
            tools: tools.length > 0 ? tools : undefined,
            tool_choice: tools.length > 0 ? 'auto' : undefined,
            temperature: 0.1, // Lower temperature for more consistent data reporting
            max_tokens: 1500,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`LLM API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message;
}

/**
 * Execute a single tool call
 */
async function executeToolCall(toolCall: ToolCall): Promise<ToolExecutionLog> {
    const startTime = Date.now();
    const args = JSON.parse(toolCall.function.arguments);

    try {
        let result: any;

        // Ensure prompts are cached/available
        if (!cachedPrompts) {
            cachedPrompts = await listPrompts();
        }

        const isPrompt = cachedPrompts.some(p => p.name === toolCall.function.name);

        if (isPrompt) {
            result = await callPrompt(toolCall.function.name, args);
        } else {
            result = await callTool(toolCall.function.name, args);
        }

        return {
            id: toolCall.id,
            toolName: toolCall.function.name,
            arguments: args,
            result,
            timestamp: startTime,
            duration: Date.now() - startTime,
        };
    } catch (error: any) {
        return {
            id: toolCall.id,
            toolName: toolCall.function.name,
            arguments: args,
            result: { error: error.message },
            timestamp: startTime,
            duration: Date.now() - startTime,
        };
    }
}

/**
 * Get tool schemas in OpenAI function format
 */
async function getToolSchemas(): Promise<any[]> {
    if (!cachedTools) {
        cachedTools = await listTools();
    }
    if (!cachedPrompts) {
        cachedPrompts = await listPrompts();
    }

    const toolSchemas = cachedTools.map(tool => ({
        type: 'function',
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema,
        },
    }));

    const promptSchemas = cachedPrompts.map(prompt => ({
        type: 'function',
        function: {
            name: prompt.name,
            description: prompt.description,
            parameters: {
                type: 'object',
                properties: prompt.arguments?.reduce((acc, arg) => {
                    acc[arg.name] = {
                        type: 'string',
                        description: arg.description,
                    };
                    return acc;
                }, {} as Record<string, any>) || {},
                required: prompt.arguments?.filter(a => a.required).map(a => a.name) || [],
            },
        },
    }));

    // Sort to ensure web_search is not first, prioritizing Phoenix tools
    const sortedToolSchemas = [...toolSchemas].sort((a, b) => {
        if (a.function.name === 'web_search') return 1;
        if (b.function.name === 'web_search') return -1;
        return 0;
    });

    // Add dashboard tools for direct dashboard manipulation
    return [...sortedToolSchemas, ...promptSchemas, ...dashboardToolSchemas];
}
