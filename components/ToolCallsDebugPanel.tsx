'use client';

import { useState } from 'react';
import type { ToolExecutionLog } from '@/lib/types';

interface ToolCallsDebugPanelProps {
    executions: ToolExecutionLog[];
}

export default function ToolCallsDebugPanel({ executions }: ToolCallsDebugPanelProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (executions.length === 0) {
        return (
            <div className="w-96 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
                <h2 className="text-lg font-semibold text-white mb-4">🔧 Tool Calls</h2>
                <p className="text-gray-400 text-sm">No tool calls yet. Ask a question to see tool executions here.</p>
            </div>
        );
    }

    return (
        <div className="w-96 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-4">🔧 Tool Calls ({executions.length})</h2>

            <div className="space-y-3">
                {executions.map((execution) => (
                    <div
                        key={execution.id}
                        className="bg-gray-900 border border-gray-700 rounded-lg p-3"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="font-mono text-sm text-blue-400 font-semibold">
                                    {execution.toolName}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {new Date(execution.timestamp).toLocaleTimeString()}
                                    {execution.duration && ` • ${execution.duration}ms`}
                                </div>
                            </div>
                            <button
                                onClick={() => setExpandedId(expandedId === execution.id ? null : execution.id)}
                                className="text-gray-400 hover:text-white text-xs"
                            >
                                {expandedId === execution.id ? '▼' : '▶'}
                            </button>
                        </div>

                        {/* Arguments Preview */}
                        <div className="text-xs text-gray-400 mb-2">
                            <div className="font-semibold mb-1">Arguments:</div>
                            <div className="bg-gray-950 rounded p-2 font-mono overflow-x-auto">
                                {JSON.stringify(execution.arguments, null, 2).substring(0, 100)}
                                {JSON.stringify(execution.arguments).length > 100 && '...'}
                            </div>
                        </div>

                        {/* Result Preview */}
                        <div className="text-xs text-gray-400">
                            <div className="font-semibold mb-1">Result:</div>
                            <div className="bg-gray-950 rounded p-2 font-mono overflow-x-auto">
                                {typeof execution.result === 'string'
                                    ? execution.result.substring(0, 150)
                                    : JSON.stringify(execution.result, null, 2).substring(0, 150)}
                                {(typeof execution.result === 'string' ? execution.result.length : JSON.stringify(execution.result).length) > 150 && '...'}
                            </div>
                        </div>

                        {/* Expanded View */}
                        {expandedId === execution.id && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                                <div className="text-xs text-gray-400">
                                    <div className="font-semibold mb-1">Full Result:</div>
                                    <pre className="bg-gray-950 rounded p-2 overflow-x-auto whitespace-pre-wrap">
                                        {typeof execution.result === 'string'
                                            ? execution.result
                                            : JSON.stringify(execution.result, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
