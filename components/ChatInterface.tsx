'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ToolCallsDebugPanel from './ToolCallsDebugPanel';
import ResearchRuleModal from './ResearchRuleModal';
import type { Message, ToolExecutionLog, ResearchRuleParams } from '@/lib/types';

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [toolExecutions, setToolExecutions] = useState<ToolExecutionLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResearchModal, setShowResearchModal] = useState(false);

    const sendMessage = async (content: string) => {
        // Add user message
        const userMessage: Message = {
            role: 'user',
            content,
            timestamp: Date.now(),
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            // Add assistant message
            setMessages([...newMessages, data.message]);

            // Add tool executions to debug panel
            if (data.toolExecutions && data.toolExecutions.length > 0) {
                setToolExecutions([...toolExecutions, ...data.toolExecutions]);
            }
        } catch (error: any) {
            console.error('Error sending message:', error);
            // Add error message
            setMessages([
                ...newMessages,
                {
                    role: 'assistant',
                    content: `Error: ${error.message}`,
                    timestamp: Date.now(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResearchRule = (params: ResearchRuleParams) => {
        const command = `Run research_rule_generator with the following parameters:
- Objective: ${params.objective}
- Target Audience: ${params.targetAudience}
- Include Intent Signals: ${params.includeIntentSignals ? 'Yes' : 'No'}
- Spend Analysis: ${params.spendAnalysis ? 'Yes' : 'No'}
${params.technologyFilters && params.technologyFilters.length > 0 ? `- Technology Filters: ${params.technologyFilters.join(', ')}` : ''}`;

        sendMessage(command);
        setShowResearchModal(false);
    };

    return (
        <div className="flex h-screen bg-gray-900">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="text-sm">Home</span>
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-white">🔥 HG Research Chat</h1>
                            <p className="text-gray-400 text-sm mt-1">Sales intelligence powered by Phoenix MCP</p>
                        </div>
                    </div>
                </div>

                <MessageList messages={messages} isLoading={isLoading} />

                <MessageInput
                    onSend={sendMessage}
                    onGenerateResearchRule={() => setShowResearchModal(true)}
                    disabled={isLoading}
                />
            </div>

            {/* Tool Calls Debug Panel */}
            <ToolCallsDebugPanel executions={toolExecutions} />

            {/* Research Rule Modal */}
            {showResearchModal && (
                <ResearchRuleModal
                    onGenerate={handleResearchRule}
                    onClose={() => setShowResearchModal(false)}
                />
            )}
        </div>
    );
}
