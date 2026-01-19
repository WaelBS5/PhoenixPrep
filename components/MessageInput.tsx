'use client';

import { useState } from 'react';

interface MessageInputProps {
    onSend: (message: string) => void;
    onGenerateResearchRule: () => void;
    disabled: boolean;
}

export default function MessageInput({ onSend, onGenerateResearchRule, disabled }: MessageInputProps) {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !disabled) {
            onSend(input.trim());
            setInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="border-t border-gray-700 bg-gray-800 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex gap-2 mb-2">
                    <button
                        onClick={onGenerateResearchRule}
                        disabled={disabled}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        📋 Generate Research Rule
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about companies, technologies, or market trends..."
                        disabled={disabled}
                        rows={3}
                        className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                    />
                    <button
                        type="submit"
                        disabled={disabled || !input.trim()}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
