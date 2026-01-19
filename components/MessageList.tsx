'use client';

import type { Message } from '@/lib/types';

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
                <div className="text-center text-gray-400 mt-20">
                    <div className="text-6xl mb-4">💬</div>
                    <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
                    <p className="text-sm">Ask about companies, technologies, or market research</p>
                </div>
            )}

            {messages.map((message, index) => (
                <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`max-w-3xl rounded-lg px-4 py-3 ${message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-100 border border-gray-700'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">
                                {message.role === 'user' ? '👤' : '🤖'}
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-sm mb-1">
                                    {message.role === 'user' ? 'You' : 'Assistant'}
                                </div>
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {message.content}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {isLoading && (
                <div className="flex justify-start">
                    <div className="max-w-3xl rounded-lg px-4 py-3 bg-gray-800 border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="text-2xl">🤖</div>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
