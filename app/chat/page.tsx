"use client"

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, User, Database, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import SalesBrief from "@/components/SalesBrief";
import ExportActions from "@/components/ExportActions";
import type { ToolExecutionLog, SalesBriefData, TechStackItem } from "@/lib/types";

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
    const [briefData, setBriefData] = useState<SalesBriefData | null>(null);
    const [leftPanelWidth, setLeftPanelWidth] = useState(30); // Percentage
    const [isResizing, setIsResizing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle panel resizing
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            const newWidth = (e.clientX / window.innerWidth) * 100;
            // Constrain between 20% and 50%
            const constrainedWidth = Math.min(Math.max(newWidth, 20), 50);
            setLeftPanelWidth(constrainedWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing]);

    // Extract sales brief data from tool executions
    const extractBriefData = useCallback((toolExecutions: ToolExecutionLog[]) => {
        console.log('🔍 extractBriefData called with', toolExecutions.length, 'executions');
        const newBriefData: SalesBriefData = {};

        toolExecutions.forEach(execution => {
            const { toolName, arguments: args, result } = execution;

            console.log('🔍 Tool:', toolName);
            console.log('📦 Args:', args);

            // Extract company domain from arguments
            if (args?.companyDomain) {
                const companyName = args.companyDomain
                    .split('.')[0]
                    .charAt(0)
                    .toUpperCase() +
                    args.companyDomain.split('.')[0].slice(1);

                if (!newBriefData.companyOverview) {
                    newBriefData.companyOverview = {
                        name: companyName,
                        domain: args.companyDomain,
                    };
                }
            }

            // Parse result - handle both MCP formats
            let parsedData: any = null;

            // Case 1: Real MCP API returns array: [{type: "text", text: "..."}]
            if (Array.isArray(result) && result[0]?.text) {
                try {
                    parsedData = JSON.parse(result[0].text);
                    console.log('✅ Parsed data from MCP array format');
                } catch (e) {
                    console.error('❌ Failed to parse JSON from array:', e);
                }
            }
            // Case 2: Mocked response returns single object: {type: "text", text: "..."}
            else if (result?.type === 'text' && result?.text) {
                try {
                    parsedData = JSON.parse(result.text);
                    console.log('✅ Parsed data from MCP object format');
                } catch (e) {
                    console.error('❌ Failed to parse JSON from object:', e);
                }
            }
            // Case 3: Legacy format with content array (backwards compatibility)
            else if (result?.content && Array.isArray(result.content) && result.content[0]?.text) {
                try {
                    parsedData = JSON.parse(result.content[0].text);
                    console.log('✅ Parsed data from legacy content array format');
                } catch (e) {
                    console.error('❌ Failed to parse JSON from legacy format:', e);
                }
            }

            if (!parsedData) {
                console.log('⚠️ No parsed data from result:', result);
                return;
            }

            // Extract company info
            if (parsedData.company) {
                newBriefData.companyOverview = {
                    name: parsedData.company.name || newBriefData.companyOverview?.name || 'Unknown',
                    domain: parsedData.company.website || args?.companyDomain || '',
                };
                console.log('✅ Company:', newBriefData.companyOverview.name);
            }

            // Extract tech stack from technologyServices
            if (parsedData.technologyServices && Array.isArray(parsedData.technologyServices)) {
                const techStack: TechStackItem[] = [];
                const vendorsWithSpend: Array<{ name: string; amount: number; category: string }> = [];
                let totalSpend = 0;

                parsedData.technologyServices.forEach((service: any) => {
                    const serviceName = service.serviceName || 'Other';

                    if (service.vendors && Array.isArray(service.vendors)) {
                        service.vendors.forEach((vendor: any) => {
                            // Add to tech stack (all vendors, regardless of spend data)
                            techStack.push({
                                name: vendor.vendorName || 'Unknown',
                                vendor: vendor.vendorName || 'Unknown',
                                category: serviceName,
                                intensity: vendor.firstSeen ? `Since ${vendor.firstSeen}` : '',
                            });

                            // If vendor has spend data, track it separately
                            if (vendor.estimatedMonthlySpend && vendor.estimatedMonthlySpend > 0) {
                                totalSpend += vendor.estimatedMonthlySpend;
                                vendorsWithSpend.push({
                                    name: vendor.vendorName,
                                    amount: vendor.estimatedMonthlySpend,
                                    category: serviceName
                                });
                            }
                        });
                    }
                });

                // Set tech stack
                if (techStack.length > 0) {
                    newBriefData.techStack = techStack;
                    console.log('✅ Extracted', techStack.length, 'technologies');
                }

                // Set spending data
                if (totalSpend > 0) {
                    newBriefData.spending = {
                        totalSpend: `$${totalSpend.toLocaleString()}/month`,
                    };
                    console.log('✅ Total spend:', newBriefData.spending.totalSpend);

                    // Get top 10 vendors by spend
                    vendorsWithSpend.sort((a, b) => b.amount - a.amount);
                    const topVendors = vendorsWithSpend.slice(0, 10).map(v => ({
                        name: v.name,
                        amount: `$${v.amount.toLocaleString()}/mo`
                    }));

                    newBriefData.spending.topVendors = topVendors;
                    console.log('✅ Top vendors:', topVendors.length);
                }
            }
        });

        console.log('💾 Final brief data:', newBriefData);

        // Only update if we found actual data
        if (Object.keys(newBriefData).length > 0) {
            setBriefData(newBriefData);
        } else {
            console.log('⚠️ No data extracted - dashboard will stay empty');
        }
    }, []); // useCallback dependency array

    // Trigger extraction when messages change
    useEffect(() => {
        const latestMessage = messages[messages.length - 1];
        if (latestMessage?.role === 'assistant' && latestMessage.toolExecutions) {
            console.log('✅ Found tool executions, calling extractBriefData');
            extractBriefData(latestMessage.toolExecutions);
        }
    }, [messages, extractBriefData]);

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
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* LEFT PANEL: Chat Interface */}
            <div
                className="flex flex-col border-r border-border/50 bg-background transition-all duration-150"
                style={{ width: `${leftPanelWidth}%` }}
            >
                {/* Header */}
                <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl z-10">
                    <div className="px-4 h-16 flex items-center justify-between">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Home
                            </Button>
                        </Link>

                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white overflow-hidden shadow-sm border border-border/20">
                                <img src="/hg-logo.jpg" alt="HG Insights Logo" className="h-full w-full object-cover" />
                            </div>
                            <span className="font-semibold tracking-tight text-sm">Phoenix Prep</span>
                        </div>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="px-4 py-6 space-y-6">
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3 animate-in fade-in duration-300">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white overflow-hidden shadow-md animate-pulse border border-border/20">
                                    <img src="/hg-logo.jpg" alt="HG Insights Logo" className="h-full w-full object-cover" />
                                </div>
                                <div className="card-teal rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-teal-500/20">
                                    <div className="flex gap-1.5 items-center">
                                        <div className="h-2 w-2 rounded-full bg-teal-400/50 animate-bounce" />
                                        <div className="h-2 w-2 rounded-full bg-teal-400/50 animate-bounce delay-100" />
                                        <div className="h-2 w-2 rounded-full bg-teal-400/50 animate-bounce delay-200" />
                                        <span className="text-xs text-teal-400/70 ml-2 font-medium uppercase tracking-wider">Analyzing...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input */}
                <div className="border-t border-border/50 bg-background/80 backdrop-blur-xl p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="flex items-end gap-2 bg-secondary/30 p-1.5 rounded-xl border border-border/50 shadow-inner group focus-within:border-teal-500/30 transition-colors">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about a company..."
                                className="flex-1 bg-transparent px-3 py-2 text-sm resize-none focus:outline-none min-h-[40px] max-h-32 scrollbar-none"
                                rows={1}
                            />
                            <Button
                                type="submit"
                                variant="hero"
                                size="icon"
                                className="h-9 w-9 shrink-0 rounded-lg shadow-lg hover:scale-105 transition-all active:scale-95"
                                disabled={!input.trim() || isLoading}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* RESIZABLE DIVIDER */}
            <div
                className={cn(
                    "w-1 bg-border/30 hover:bg-primary/50 cursor-col-resize transition-colors relative group",
                    isResizing && "bg-primary"
                )}
                onMouseDown={() => setIsResizing(true)}
            >
                <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-primary/10" />
            </div>

            {/* RIGHT PANEL: Sales Brief Dashboard */}
            <div
                className="flex flex-col bg-background relative transition-all duration-150"
                style={{ width: `${100 - leftPanelWidth}%` }}
            >
                <div className="flex-1 overflow-hidden">
                    <SalesBrief data={briefData} />
                </div>
                <ExportActions data={briefData} />
            </div>
        </div>
    );
}

const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.role === "user";

    return (
        <div className={cn("flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300", isUser && "flex-row-reverse")}>
            <div
                className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm",
                    isUser ? "bg-secondary border border-border/50" : "bg-white overflow-hidden border border-border/20"
                )}
            >
                {isUser ? (
                    <User className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <img src="/hg-logo.jpg" alt="HG Insights Logo" className="h-full w-full object-cover" />
                )}
            </div>
            <div className={cn("flex flex-col gap-2 max-w-[85%]", isUser && "items-end")}>
                <div
                    className={cn(
                        "rounded-2xl px-4 py-3 shadow-sm text-sm",
                        isUser
                            ? "bg-cta text-cta-foreground rounded-tr-sm border border-pink-500/20"
                            : "card-teal rounded-tl-sm border border-teal-500/20"
                    )}
                >
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-inherit prose-p:text-inherit prose-strong:text-inherit prose-p:my-1">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                        </ReactMarkdown>
                    </div>
                </div>

                {!isUser && message.toolExecutions && message.toolExecutions.length > 0 && (
                    <div className="w-full mt-1">
                        <Accordion type="single" collapsible className="w-full border border-border/30 rounded-lg bg-background/40 overflow-hidden shadow-sm">
                            <AccordionItem value="tools" className="border-none">
                                <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-white/5 transition-colors text-[9px] uppercase tracking-widest text-muted-foreground group">
                                    <div className="flex items-center gap-1.5">
                                        <Terminal className="h-2.5 w-2.5 group-hover:text-teal-400 transition-colors" />
                                        <span>Source: {message.toolExecutions.length} {message.toolExecutions.length === 1 ? 'Call' : 'Calls'}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-0">
                                    <ScrollArea className="h-[180px] w-full border-t border-border/30 bg-black/5">
                                        <div className="p-3 space-y-3">
                                            {message.toolExecutions.map((exec, idx) => (
                                                <div key={idx} className="space-y-1.5">
                                                    <div className="flex items-center justify-between text-[9px] font-mono text-teal-400/80">
                                                        <div className="flex items-center gap-1">
                                                            <Database className="h-2.5 w-2.5" />
                                                            <span className="font-bold tracking-tight">{exec.toolName}</span>
                                                        </div>
                                                        <span className="opacity-50 tracking-tighter">{exec.duration ? `${exec.duration}ms` : ''}</span>
                                                    </div>
                                                    <div className="bg-black/60 rounded-md p-2 border border-white/5 shadow-inner">
                                                        <pre className="text-[9px] leading-relaxed font-mono overflow-x-auto text-teal-100/70 whitespace-pre-wrap selection:bg-teal-500/30">
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
