// MCP Client for Phoenix/HG Insights
// Implements a minimal MCP protocol client with fallback mocked responses

import type { MCPTool, MCPPrompt } from './types';

const MCP_ENDPOINT = process.env.MCP_ENDPOINT || '';

// TODO: Replace with actual MCP endpoint once configured
// Use mocked responses if endpoint not configured or contains placeholder
const USE_MOCK = !MCP_ENDPOINT || MCP_ENDPOINT.includes('YOUR_API_KEY');

/**
 * List available MCP tools using JSON-RPC 2.0 protocol
 */
export async function listTools(): Promise<MCPTool[]> {
    if (USE_MOCK) {
        console.log('🔧 Using mocked tools (MCP_ENDPOINT not configured or contains placeholder)');
        return getMockedTools();
    }

    try {
        console.log(`🔍 Discovering available Phoenix MCP tools...`);
        const requestBody = {
            jsonrpc: '2.0',
            method: 'tools/list',
            params: {},
            id: Date.now(),
        };

        // Phoenix MCP requires both application/json and text/event-stream
        const response = await fetch(MCP_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/event-stream',
            },
            body: JSON.stringify(requestBody),
        });

        console.log(`🔧 MCP Response Status: ${response.status}`);

        if (!response.ok) {
            console.warn(`MCP endpoint returned ${response.status}, using mocked tools`);
            return getMockedTools();
        }

        const text = await response.text();
        // Silenced raw response logs to avoid confusion with tool calls


        // Check if response is HTML (common error response)
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            console.warn('MCP endpoint returned HTML instead of JSON, using mocked tools');
            return getMockedTools();
        }

        // Parse SSE (Server-Sent Events) format
        // Phoenix MCP returns: "event: message\ndata: {...}\n\n"
        let jsonText = text;
        if (text.startsWith('event:')) {
            const lines = text.split('\n');
            const dataLine = lines.find(line => line.startsWith('data: '));
            if (dataLine) {
                jsonText = dataLine.substring(6); // Remove "data: " prefix
            }
        }

        const data = JSON.parse(jsonText);
        // Silenced parsed response logs


        // MCP JSON-RPC response format
        if (data.result && data.result.tools) {
            console.log(`✅ Got ${data.result.tools.length} real tools from Phoenix MCP`);
            return data.result.tools;
        }

        if (data.error) {
            console.error('❌ MCP Error:', data.error);
        }

        console.warn('⚠️ Unexpected MCP response format, using mocked tools');
        return getMockedTools();

    } catch (error) {
        console.error('❌ Error listing tools:', error);
        return getMockedTools();
    }
}

/**
 * Call an MCP tool using JSON-RPC 2.0 protocol
 */
export async function callTool(name: string, args: Record<string, any>): Promise<any> {
    if (USE_MOCK) {
        return getMockedToolResult(name, args);
    }

    try {
        console.log(`🚀 EXECUTING TOOL: ${name}`);
        console.log(`📥 Arguments:`, JSON.stringify(args, null, 2));

        // Phoenix MCP requires both application/json and text/event-stream
        const response = await fetch(MCP_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/event-stream',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'tools/call',
                params: {
                    name: name,
                    arguments: args,
                },
                id: Date.now(),
            }),
        });

        if (!response.ok) {
            console.warn(`MCP tool call failed with ${response.status}, using mocked result`);
            return getMockedToolResult(name, args);
        }

        const text = await response.text();

        // Check if response is HTML
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            console.warn('MCP endpoint returned HTML, using mocked result');
            return getMockedToolResult(name, args);
        }

        // Parse SSE format
        let jsonText = text;
        if (text.startsWith('event:')) {
            const lines = text.split('\n');
            const dataLine = lines.find(line => line.startsWith('data: '));
            if (dataLine) {
                jsonText = dataLine.substring(6);
            }
        }

        const data = JSON.parse(jsonText);

        // MCP JSON-RPC response format
        if (data.result) {
            console.log(`✅ TOOL SUCCESS: ${name}`);
            return data.result.content || data.result;
        }

        return getMockedToolResult(name, args);
    } catch (error) {
        console.error(`Error calling tool ${name}:`, error);
        return getMockedToolResult(name, args);
    }
}

/**
 * List available MCP prompts using JSON-RPC 2.0 protocol
 */
export async function listPrompts(): Promise<MCPPrompt[]> {
    if (USE_MOCK) {
        return getMockedPrompts();
    }

    try {
        // Phoenix MCP requires both application/json and text/event-stream
        const response = await fetch(MCP_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/event-stream',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'prompts/list',
                params: {},
                id: Date.now(),
            }),
        });

        if (!response.ok) {
            console.warn(`MCP prompts endpoint returned ${response.status}, using mocked prompts`);
            return getMockedPrompts();
        }

        const text = await response.text();

        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            console.warn('MCP endpoint returned HTML, using mocked prompts');
            return getMockedPrompts();
        }

        // Parse SSE format
        let jsonText = text;
        if (text.startsWith('event:')) {
            const lines = text.split('\n');
            const dataLine = lines.find(line => line.startsWith('data: '));
            if (dataLine) {
                jsonText = dataLine.substring(6);
            }
        }

        const data = JSON.parse(jsonText);

        // MCP JSON-RPC response format
        if (data.result && data.result.prompts) {
            return data.result.prompts;
        }

        return getMockedPrompts();
    } catch (error) {
        console.error('Error listing prompts:', error);
        return getMockedPrompts();
    }
}

/**
 * Call an MCP prompt using JSON-RPC 2.0 protocol
 */
export async function callPrompt(name: string, args: Record<string, any>): Promise<any> {
    if (USE_MOCK) {
        return getMockedPromptResult(name, args);
    }

    try {
        // Phoenix MCP requires both application/json and text/event-stream
        const response = await fetch(MCP_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/event-stream',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'prompts/get',
                params: {
                    name: name,
                    arguments: args,
                },
                id: Date.now(),
            }),
        });

        if (!response.ok) {
            console.warn(`MCP prompt call failed with ${response.status}, using mocked result`);
            return getMockedPromptResult(name, args);
        }

        const text = await response.text();

        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            console.warn('MCP endpoint returned HTML, using mocked result');
            return getMockedPromptResult(name, args);
        }

        // Parse SSE format
        let jsonText = text;
        if (text.startsWith('event:')) {
            const lines = text.split('\n');
            const dataLine = lines.find(line => line.startsWith('data: '));
            if (dataLine) {
                jsonText = dataLine.substring(6);
            }
        }

        const data = JSON.parse(jsonText);

        // MCP JSON-RPC response format
        if (data.result) {
            return data.result.messages || data.result;
        }

        return getMockedPromptResult(name, args);
    } catch (error) {
        console.error(`Error calling prompt ${name}:`, error);
        return getMockedPromptResult(name, args);
    }
}

// ============================================================================
// MOCKED RESPONSES (for development without real MCP endpoint)
// ============================================================================

function getMockedTools(): MCPTool[] {
    return [
        {
            name: 'company_firmographic',
            description: 'Get firmographic data about a company (size, revenue, industry, location)',
            inputSchema: {
                type: 'object',
                properties: {
                    domain: { type: 'string', description: 'Company domain (e.g., microsoft.com)' },
                    company_name: { type: 'string', description: 'Company name' },
                },
            },
        },
        {
            name: 'company_technographic',
            description: 'Analyze a company\'s technology stack and usage patterns',
            inputSchema: {
                type: 'object',
                properties: {
                    domain: { type: 'string', description: 'Company domain' },
                },
                required: ['domain'],
            },
        },
        {
            name: 'company_search',
            description: 'Search for companies by criteria (industry, size, location, technologies)',
            inputSchema: {
                type: 'object',
                properties: {
                    industry: { type: 'string', description: 'Industry filter' },
                    employee_range: { type: 'string', description: 'Employee count range (e.g., "100-500")' },
                    technologies: { type: 'array', items: { type: 'string' }, description: 'Technologies used' },
                    limit: { type: 'number', description: 'Max results', default: 10 },
                },
            },
        },
        {
            name: 'company_intent',
            description: 'Retrieve intent signals and buying behavior data',
            inputSchema: {
                type: 'object',
                properties: {
                    domain: { type: 'string', description: 'Company domain' },
                    topics: { type: 'array', items: { type: 'string' }, description: 'Intent topics' },
                },
                required: ['domain'],
            },
        },
        {
            name: 'list_product_categories',
            description: 'List all HG Insights product categories',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
    ];
}

function getMockedPrompts(): MCPPrompt[] {
    return [
        {
            name: 'research_rule_generator',
            description: 'Generates comprehensive research workflows for sales teams',
            arguments: [
                { name: 'objective', description: 'Research goal or question', required: true },
                { name: 'targetAudience', description: 'Who will use this research rule', required: true },
                { name: 'includeIntentSignals', description: 'Include intent data', required: false },
                { name: 'spendAnalysis', description: 'Include spending data', required: false },
                { name: 'technologyFilters', description: 'Specific technologies to focus on', required: false },
            ],
        },
    ];
}

function getMockedToolResult(name: string, args: Record<string, any>): any {
    switch (name) {
        case 'company_firmographic':
            return {
                company_name: args.company_name || 'Example Corp',
                domain: args.domain || 'example.com',
                industry: 'Technology',
                employee_count: 5000,
                revenue: '$500M - $1B',
                headquarters: 'San Francisco, CA',
                founded: 2010,
            };

        case 'company_technographic':
            return {
                domain: args.domain,
                technologies: [
                    { name: 'Salesforce', category: 'CRM', adoption_date: '2020-01' },
                    { name: 'AWS', category: 'Cloud Infrastructure', adoption_date: '2019-06' },
                    { name: 'Slack', category: 'Collaboration', adoption_date: '2021-03' },
                ],
                tech_stack_score: 85,
            };

        case 'company_search':
            return {
                results: [
                    { company_name: 'TechCorp A', domain: 'techcorpa.com', employees: 250, industry: 'SaaS' },
                    { company_name: 'TechCorp B', domain: 'techcorpb.com', employees: 450, industry: 'SaaS' },
                    { company_name: 'TechCorp C', domain: 'techcorpc.com', employees: 180, industry: 'SaaS' },
                ],
                total: 3,
            };

        case 'company_intent':
            return {
                domain: args.domain,
                intent_signals: [
                    { topic: 'CRM Migration', score: 78, trend: 'increasing', last_seen: '2026-01-15' },
                    { topic: 'Data Analytics', score: 65, trend: 'stable', last_seen: '2026-01-18' },
                ],
            };

        case 'list_product_categories':
            return {
                categories: [
                    'CRM',
                    'Marketing Automation',
                    'Cloud Infrastructure',
                    'Data Analytics',
                    'Collaboration Tools',
                    'Security',
                ],
            };

        default:
            return { message: `Mocked result for ${name}`, arguments: args };
    }
}

function getMockedPromptResult(name: string, args: Record<string, any>): any {
    if (name === 'research_rule_generator') {
        return {
            markdown: `# Research Rule: ${args.objective}

## Target Audience
${args.targetAudience}

## Workflow

### Step 1: Company Search
Use \`company_search\` to find companies matching criteria:
- Industry filter: ${args.objective}
- Employee range: 100-500 (mid-market)
${args.technologyFilters ? `- Technologies: ${Array.isArray(args.technologyFilters) ? args.technologyFilters.join(', ') : args.technologyFilters}` : ''}

### Step 2: Firmographic Analysis
For each company, call \`company_firmographic\` to get:
- Company size and revenue
- Industry and location
- Headquarters information

### Step 3: Technology Stack Analysis
Use \`company_technographic\` to analyze:
- Current technology stack
- Adoption patterns
- Tech stack maturity score

${args.includeIntentSignals ? `### Step 4: Intent Signal Analysis
Call \`company_intent\` to identify:
- Buying signals
- Intent topics
- Signal strength and trends
` : ''}

${args.spendAnalysis ? `### Step 5: Spending Analysis
Use \`company_spend\` to understand:
- Technology spending patterns
- Budget allocation
- Category investment trends
` : ''}

## Qualification Criteria
- Employee count: 100-500
- Revenue: $10M - $100M
${args.includeIntentSignals ? '- Intent score: > 60' : ''}
- Tech stack fit: > 70% match

## Output Format
For each qualified company, provide:
1. Company name and basic info
2. Technology stack summary
3. Intent signals (if applicable)
4. Recommended approach
5. Next steps

## Usage Instructions
1. Run the workflow weekly for fresh data
2. Prioritize companies with high intent scores
3. Focus on companies using complementary technologies
4. Track changes in technology adoption over time

---
*Generated by research_rule_generator*
`,
        };
    }

    return { message: `Mocked prompt result for ${name}`, arguments: args };
}
