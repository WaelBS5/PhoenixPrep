// Dashboard Tools - AI can call these to directly manipulate the dashboard
import type { SalesBriefData, DiscoveryQuestion, ProductRecommendation, ObjectionHandler, CompetitiveIntel } from './types';

// Tool definitions in OpenAI function format
export const dashboardToolSchemas = [
    {
        type: 'function',
        function: {
            name: 'dashboard_add_question',
            description: 'Add a discovery question to the dashboard. Use this when the user asks to add questions, or when generating new questions for the sales call.',
            parameters: {
                type: 'object',
                properties: {
                    question: {
                        type: 'string',
                        description: 'The discovery question to ask during the sales call'
                    },
                    category: {
                        type: 'string',
                        enum: ['technical', 'business', 'pain-point', 'timing', 'stakeholder'],
                        description: 'Category of the question'
                    },
                    rationale: {
                        type: 'string',
                        description: 'Optional: Why this question is important'
                    }
                },
                required: ['question', 'category']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'dashboard_remove_question',
            description: 'Remove a discovery question from the dashboard by its index (0-based) or by matching text',
            parameters: {
                type: 'object',
                properties: {
                    index: {
                        type: 'number',
                        description: 'The index of the question to remove (0-based)'
                    },
                    matchText: {
                        type: 'string',
                        description: 'Text to match in the question to remove (partial match)'
                    }
                }
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'dashboard_set_opener',
            description: 'Set the meeting opener on the dashboard. This is the opening line/hook for the sales call.',
            parameters: {
                type: 'object',
                properties: {
                    opener: {
                        type: 'string',
                        description: 'The meeting opener sentence'
                    }
                },
                required: ['opener']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'dashboard_set_closer',
            description: 'Set the meeting closer on the dashboard. This is the closing line/call-to-action for the sales call.',
            parameters: {
                type: 'object',
                properties: {
                    closer: {
                        type: 'string',
                        description: 'The meeting closer sentence'
                    }
                },
                required: ['closer']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'dashboard_add_pain_point',
            description: 'Add a pain point to the dashboard',
            parameters: {
                type: 'object',
                properties: {
                    painPoint: {
                        type: 'string',
                        description: 'The pain point to add'
                    }
                },
                required: ['painPoint']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'dashboard_add_value_prop',
            description: 'Add a value proposition to the dashboard',
            parameters: {
                type: 'object',
                properties: {
                    valueProp: {
                        type: 'string',
                        description: 'The value proposition to add'
                    }
                },
                required: ['valueProp']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'dashboard_add_objection',
            description: 'Add an objection handler to the dashboard',
            parameters: {
                type: 'object',
                properties: {
                    objection: {
                        type: 'string',
                        description: 'The objection the prospect might raise'
                    },
                    response: {
                        type: 'string',
                        description: 'How to respond to this objection'
                    }
                },
                required: ['objection', 'response']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'dashboard_add_product_recommendation',
            description: 'Add a GitGuardian product recommendation to the dashboard',
            parameters: {
                type: 'object',
                properties: {
                    product: {
                        type: 'string',
                        description: 'Product name (e.g., "GitGuardian Secrets Detection", "GitGuardian Public Monitoring", "GitGuardian NHI Governance")'
                    },
                    reason: {
                        type: 'string',
                        description: 'Why this product is recommended for this prospect'
                    },
                    priority: {
                        type: 'string',
                        enum: ['high', 'medium', 'low'],
                        description: 'Priority level for this recommendation'
                    },
                    talkingPoints: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Key talking points for this product'
                    }
                },
                required: ['product', 'reason', 'priority']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'dashboard_clear_section',
            description: 'Clear/remove an entire section from the dashboard',
            parameters: {
                type: 'object',
                properties: {
                    section: {
                        type: 'string',
                        enum: ['discoveryQuestions', 'painPoints', 'valueProps', 'objectionHandling', 'productRecommendations', 'meetingOpener', 'meetingCloser', 'competitiveIntel'],
                        description: 'The section to clear from the dashboard'
                    }
                },
                required: ['section']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'dashboard_set_competitive_intel',
            description: 'Set competitive intelligence on the dashboard',
            parameters: {
                type: 'object',
                properties: {
                    competitors: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'List of competitor names'
                    },
                    positioning: {
                        type: 'string',
                        description: 'How to position GitGuardian against competitors'
                    },
                    differentiators: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Key differentiators'
                    }
                }
            }
        }
    }
];

// Check if a tool name is a dashboard tool
export function isDashboardTool(toolName: string): boolean {
    return toolName.startsWith('dashboard_');
}

// Execute a dashboard tool and return the update
export interface DashboardUpdate {
    action: 'add' | 'set' | 'remove' | 'clear';
    section: keyof SalesBriefData;
    data: any;
}

export function executeDashboardTool(
    toolName: string,
    args: Record<string, any>
): { result: string; update: DashboardUpdate } {
    switch (toolName) {
        case 'dashboard_add_question': {
            const question: DiscoveryQuestion = {
                question: args.question,
                category: args.category,
                rationale: args.rationale
            };
            return {
                result: `Added discovery question: "${args.question}"`,
                update: {
                    action: 'add',
                    section: 'discoveryQuestions',
                    data: question
                }
            };
        }

        case 'dashboard_remove_question': {
            return {
                result: args.index !== undefined
                    ? `Removed question at index ${args.index}`
                    : `Removed question matching "${args.matchText}"`,
                update: {
                    action: 'remove',
                    section: 'discoveryQuestions',
                    data: { index: args.index, matchText: args.matchText }
                }
            };
        }

        case 'dashboard_set_opener': {
            return {
                result: `Set meeting opener: "${args.opener}"`,
                update: {
                    action: 'set',
                    section: 'meetingOpener',
                    data: args.opener
                }
            };
        }

        case 'dashboard_set_closer': {
            return {
                result: `Set meeting closer: "${args.closer}"`,
                update: {
                    action: 'set',
                    section: 'meetingCloser',
                    data: args.closer
                }
            };
        }

        case 'dashboard_add_pain_point': {
            return {
                result: `Added pain point: "${args.painPoint}"`,
                update: {
                    action: 'add',
                    section: 'painPoints',
                    data: args.painPoint
                }
            };
        }

        case 'dashboard_add_value_prop': {
            return {
                result: `Added value proposition: "${args.valueProp}"`,
                update: {
                    action: 'add',
                    section: 'valueProps',
                    data: args.valueProp
                }
            };
        }

        case 'dashboard_add_objection': {
            const objection: ObjectionHandler = {
                objection: args.objection,
                response: args.response
            };
            return {
                result: `Added objection handler for: "${args.objection}"`,
                update: {
                    action: 'add',
                    section: 'objectionHandling',
                    data: objection
                }
            };
        }

        case 'dashboard_add_product_recommendation': {
            const rec: ProductRecommendation = {
                product: args.product,
                reason: args.reason,
                priority: args.priority,
                talkingPoints: args.talkingPoints
            };
            return {
                result: `Added product recommendation: "${args.product}"`,
                update: {
                    action: 'add',
                    section: 'productRecommendations',
                    data: rec
                }
            };
        }

        case 'dashboard_clear_section': {
            return {
                result: `Cleared section: ${args.section}`,
                update: {
                    action: 'clear',
                    section: args.section as keyof SalesBriefData,
                    data: null
                }
            };
        }

        case 'dashboard_set_competitive_intel': {
            const intel: CompetitiveIntel = {
                competitors: args.competitors,
                positioning: args.positioning,
                differentiators: args.differentiators
            };
            return {
                result: 'Set competitive intelligence',
                update: {
                    action: 'set',
                    section: 'competitiveIntel',
                    data: intel
                }
            };
        }

        default:
            return {
                result: `Unknown dashboard tool: ${toolName}`,
                update: {
                    action: 'set',
                    section: 'painPoints',
                    data: null
                }
            };
    }
}

// Apply dashboard updates to existing data
export function applyDashboardUpdate(
    existingData: SalesBriefData | null,
    update: DashboardUpdate
): SalesBriefData {
    const newData: SalesBriefData = { ...existingData };

    switch (update.action) {
        case 'set':
            (newData as any)[update.section] = update.data;
            break;

        case 'add':
            const existing = (newData as any)[update.section];
            if (Array.isArray(existing)) {
                (newData as any)[update.section] = [...existing, update.data];
            } else if (existing === undefined || existing === null) {
                (newData as any)[update.section] = [update.data];
            }
            break;

        case 'remove':
            if (update.section === 'discoveryQuestions' && Array.isArray(newData.discoveryQuestions)) {
                if (update.data.index !== undefined) {
                    newData.discoveryQuestions = newData.discoveryQuestions.filter(
                        (_, idx) => idx !== update.data.index
                    );
                } else if (update.data.matchText) {
                    const matchLower = update.data.matchText.toLowerCase();
                    newData.discoveryQuestions = newData.discoveryQuestions.filter(
                        q => !q.question.toLowerCase().includes(matchLower)
                    );
                }
            }
            break;

        case 'clear':
            delete (newData as any)[update.section];
            break;
    }

    return newData;
}
