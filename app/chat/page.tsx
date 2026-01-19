"use client"

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, User, Database, ChevronDown, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ToolExecutionLog } from "@/lib/types";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    toolExecutions?: ToolExecutionLog[];
}

const initialMessages: Message[] = [
    {
        id: "1",
        role: "assistant",
        content:
            "Welcome to Phoenix Prep! 👋 I'm here to help you prepare for your next sales call. Tell me which account you're researching, and what kind of context you need — tech stack, discovery questions, competitive angles, or anything else.",
    },
];

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            // Call our real Phoenix MCP backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, content: m.content }))
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.message.content,
                toolExecutions: data.toolExecutions,
            };

            setMessages([...newMessages, assistantMessage]);
        } catch (error: any) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: `Error: ${error.message}. Please try again.`,
            };
            setMessages([...newMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            {/* Header */}
            <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl z-10 sticky top-0">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Home
                        </Button>
                    </Link>

                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white overflow-hidden p-1 shadow-sm border border-border/20">
                            <img src="/hg-logo.jpg" alt="HG Insights Logo" className="h-full w-full object-cover" />
                        </div>
                        <span className="font-semibold tracking-tight">Phoenix Prep Chat</span>
                    </div>

                    <div className="w-20" /> {/* Spacer for centering */}
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <div className="space-y-8">
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-4 animate-in fade-in duration-300">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white overflow-hidden p-1 shadow-md animate-pulse border border-border/20">
                                    <img src="/hg-logo.jpg" alt="HG Insights Logo" className="h-full w-full object-cover" />
                                </div>
                                <div className="card-teal rounded-2xl rounded-tl-md px-5 py-4 shadow-sm border border-teal-500/20">
                                    <div className="flex gap-1.5 items-center">
                                        <div className="h-2 w-2 rounded-full bg-teal-400/50 animate-bounce" />
                                        <div className="h-2 w-2 rounded-full bg-teal-400/50 animate-bounce delay-100" />
                                        <div className="h-2 w-2 rounded-full bg-teal-400/50 animate-bounce delay-200" />
                                        <span className="text-xs text-teal-400/70 ml-2 font-medium uppercase tracking-wider">Analyzing account data...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            {/* Input */}
            <div className="border-t border-border/50 bg-background/80 backdrop-blur-xl pb-safe">
                <form onSubmit={handleSubmit} className="container mx-auto px-4 py-6 max-w-4xl">
                    <div className="flex items-end gap-3 bg-secondary/30 p-1.5 rounded-2xl border border-border/50 shadow-inner group focus-within:border-teal-500/30 transition-colors">
                        <div className="flex-1 px-2">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about an account, tech stack, or get detailed technographics..."
                                className="w-full bg-transparent py-3 text-sm resize-none focus:outline-none min-h-[48px] max-h-48 scrollbar-none"
                                rows={1}
                            />
                        </div>
                        <Button
                            type="submit"
                            variant="hero"
                            size="icon"
                            className="h-11 w-11 shrink-0 rounded-xl shadow-lg hover:scale-105 transition-all active:scale-95"
                            disabled={!input.trim() || isLoading}
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.role === "user";

    return (
        <div className={cn("flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300", isUser && "flex-row-reverse")}>
            <div
                className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm",
                    isUser ? "bg-secondary border border-border/50" : "bg-white overflow-hidden p-1 border border-border/20"
                )}
            >
                {isUser ? (
                    <User className="h-5 w-5 text-muted-foreground" />
                ) : (
                    <img src="/hg-logo.jpg" alt="HG Insights Logo" className="h-full w-full object-contain" />
                )}
            </div>
            <div className={cn("flex flex-col gap-2 max-w-[85%]", isUser && "items-end")}>
                <div
                    className={cn(
                        "rounded-2xl px-5 py-4 shadow-sm",
                        isUser
                            ? "bg-cta text-cta-foreground rounded-tr-sm border border-pink-500/20"
                            : "card-teal rounded-tl-sm border border-teal-500/20"
                    )}
                >
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-inherit prose-p:text-inherit prose-strong:text-inherit">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                        </ReactMarkdown>
                    </div>
                </div>

                {!isUser && message.toolExecutions && message.toolExecutions.length > 0 && (
                    <div className="w-full mt-1">
                        <Accordion type="single" collapsible className="w-full border border-border/30 rounded-xl bg-background/40 overflow-hidden shadow-sm">
                            <AccordionItem value="tools" className="border-none">
                                <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-white/5 transition-colors text-[10px] uppercase tracking-widest text-muted-foreground group">
                                    <div className="flex items-center gap-2">
                                        <Terminal className="h-3 w-3 group-hover:text-teal-400 transition-colors" />
                                        <span>Source Data: {message.toolExecutions.length} MCP {message.toolExecutions.length === 1 ? 'Call' : 'Calls'}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-0">
                                    <ScrollArea className="h-[250px] w-full border-t border-border/30 bg-black/5">
                                        <div className="p-4 space-y-4">
                                            {message.toolExecutions.map((exec, idx) => (
                                                <div key={idx} className="space-y-2">
                                                    <div className="flex items-center justify-between text-[10px] font-mono text-teal-400/80">
                                                        <div className="flex items-center gap-1.5">
                                                            <Database className="h-3.5 w-3.5" />
                                                            <span className="font-bold tracking-tight">{exec.toolName}</span>
                                                        </div>
                                                        <span className="opacity-50 tracking-tighter">{exec.duration ? `${exec.duration}ms` : ''}</span>
                                                    </div>
                                                    <div className="bg-black/60 rounded-lg p-4 border border-white/5 shadow-inner">
                                                        <pre className="text-[11px] leading-relaxed font-mono overflow-x-auto text-teal-100/70 whitespace-pre-wrap selection:bg-teal-500/30">
                                                            {JSON.stringify(exec.result, null, 2)}
                                                        </pre>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                )}
            </div>
        </div>
    );
};
