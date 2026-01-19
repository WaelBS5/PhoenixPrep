// Agent orchestration loop with LLM tool calling
// Implements the standard agentic loop: LLM -> Tool Calls -> Results -> LLM -> Response

import type { Message, ToolCall, ToolResult, ToolExecutionLog, MCPTool, MCPPrompt } from './types';
import { listTools, callTool, listPrompts, callPrompt } from './mcpClient';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4-turbo';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Cache for MCP discovery to avoid redundant API calls and confusing logs
let cachedTools: MCPTool[] | null = null;
let cachedPrompts: MCPPrompt[] | null = null;

/**
 * Run the agent loop: send message to LLM, execute tool calls, return final response
 */
export async function runAgentLoop(
    messages: Message[]
): Promise<{ message: Message; toolExecutions: ToolExecutionLog[] }> {
    const toolExecutions: ToolExecutionLog[] = [];

    // Get available tools and convert to OpenAI function format
    const availableTools = await getToolSchemas();

    // Add system prompt
    const systemPrompt: Message = {
        role: 'system',
        content: `You are an elite Sales Intelligence Specialist powered by HG Insights Phoenix MCP. Your mission is to provide high-precision, data-driven research for sales teams.

### CRITICAL INSTRUCTION: TOOL PRIORITY
You have access to specialized Phoenix MCP tools and a general 'web_search' tool. 
- **NEVER use 'web_search' as your first choice for company research.**
- **ALWAYS prioritize specialized HG Insights tools** (like 'company_technographic', 'company_firmographic', 'company_fai') when the question involves account intelligence, technology stacks, or buying signals.
- Use 'web_search' ONLY as a last resort or to complement Phoenix data with recent news/PR.

### TOOL CATEGORIES
1. **Account Intelligence (PRIORITY 1)**:
   - 'company_technographic': Analyzing tech stacks and software usage.
   - 'company_firmographic': Employees, revenue, and basic company data.
   - 'company_fai': Departmental technology usage and intensity.
   - 'company_spend' / 'company_cloud_spend': IT and cloud budget analysis.
   - 'company_contracts': Vendor relationship and contract details.
2. **Buying Signals**:
   - 'list_intent_topics': Key interest areas for accounts.
3. **Prospecting & Market Analysis**:
   - 'search_companies': Finding accounts by specific criteria.
   - 'contact_search' / 'contact_enrich': Finding and detailing decision-makers.
4. **Product & Market Insights**:
   - 'get_product_information' / 'get_product_reviews' / 'list_vendors'.

### OPERATIONAL RULES
1. **Explain First**: State exactly which specialized HG tool you are calling.
2. **Technical Depth & Data Richness**: Provide a comprehensive breakdown of the results. Do not just summarize; list all major products, intensities, and categories discovered. Use Markdown tables for clarity when dealing with lists of products or companies.
3. **Precision Over Generalization**: High-confidence Phoenix data is always preferred over scraped web data.
4. **Actionable Insights**: Convert the raw JSON data into sales "wedges", discovery questions, and competitive angles.

Available Phoenix Tools: ${availableTools.map(t => t.function.name).join(', ')}`,
    };

    const conversationMessages = [systemPrompt, ...messages];

    // Initial LLM call
    let response = await callLLM(conversationMessages, availableTools);

    // Tool calling loop
    let iterations = 0;
    const maxIterations = 5; // Prevent infinite loops

    while (response.tool_calls && response.tool_calls.length > 0 && iterations < maxIterations) {
        iterations++;

        // Execute all tool calls
        const toolResults: ToolResult[] = [];

        for (const toolCall of response.tool_calls) {
            const execution = await executeToolCall(toolCall);
            toolExecutions.push(execution);

            toolResults.push({
                tool_call_id: toolCall.id,
                role: 'tool',
                name: toolCall.function.name,
                content: JSON.stringify(execution.result),
            });
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
            max_tokens: 4000,
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

    return [...sortedToolSchemas, ...promptSchemas];
}
