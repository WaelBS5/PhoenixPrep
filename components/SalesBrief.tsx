"use client"

import React from 'react';
import { Database, TrendingUp, Building2, Package, MessageCircleQuestion, Lightbulb, Target, Handshake, Shield, AlertTriangle } from 'lucide-react';
import { SalesBriefData } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface SalesBriefProps {
    data: SalesBriefData | null;
}

export default function SalesBrief({ data }: SalesBriefProps) {
    if (!data || Object.keys(data).length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="h-full overflow-y-auto p-8 space-y-6 bg-background" id="sales-brief-content">
            {/* Header */}
            <div className="space-y-2 pb-6 border-b border-border/50">
                <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight">Data Dashboard</h1>
                </div>
                {data.companyOverview && (
                    <p className="text-sm text-muted-foreground">
                        {data.companyOverview.name} • {data.companyOverview.domain}
                    </p>
                )}
            </div>

            {/* Company Overview */}
            {data.companyOverview && (
                <Card className="p-6 bg-card border-border/30">
                    <div className="flex items-center gap-2 mb-4">
                        <Building2 className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Company Overview</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <DataField label="Domain" value={data.companyOverview.domain} />
                        {data.companyOverview.industry && (
                            <DataField label="Industry" value={data.companyOverview.industry} />
                        )}
                        {data.companyOverview.employeeCount && (
                            <DataField label="Employees" value={data.companyOverview.employeeCount.toLocaleString()} />
                        )}
                        {data.companyOverview.revenue && (
                            <DataField label="Revenue" value={data.companyOverview.revenue} />
                        )}
                        {data.companyOverview.location && (
                            <DataField label="Location" value={data.companyOverview.location} />
                        )}
                    </div>
                </Card>
            )}

            {/* Tech Stack - Visual Grid */}
            {data.techStack && data.techStack.length > 0 && (
                <Card className="p-6 bg-card border-border/30">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Technology Stack</h2>
                        </div>
                        <Badge variant="secondary">{data.techStack.length} technologies</Badge>
                    </div>

                    {/* Tech Stack Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/50">
                                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vendor</th>
                                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Intensity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.techStack.map((tech, idx) => (
                                    <tr key={idx} className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                                        <td className="py-3 px-2 text-sm font-medium">{tech.name}</td>
                                        <td className="py-3 px-2 text-sm text-muted-foreground">{tech.vendor}</td>
                                        <td className="py-3 px-2">
                                            <Badge variant="outline" className="text-xs">
                                                {tech.category}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-2">
                                            {tech.intensity && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {tech.intensity}
                                                </Badge>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Spending Analysis */}
            {data.spending && (
                <Card className="p-6 bg-card border-border/30">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Spending Analysis</h2>
                    </div>
                    <div className="space-y-4">
                        {(data.spending.totalSpend || data.spending.cloudSpend) && (
                            <div className="grid grid-cols-2 gap-4">
                                {data.spending.totalSpend && (
                                    <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
                                        <div className="text-xs text-muted-foreground mb-1">Total IT Spend</div>
                                        <div className="text-2xl font-bold text-primary">{data.spending.totalSpend}</div>
                                    </div>
                                )}
                                {data.spending.cloudSpend && (
                                    <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
                                        <div className="text-xs text-muted-foreground mb-1">Cloud Spend</div>
                                        <div className="text-2xl font-bold text-primary">{data.spending.cloudSpend}</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {data.spending.topVendors && data.spending.topVendors.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold mb-3">Top Vendors by Spend</h3>
                                <div className="space-y-2">
                                    {data.spending.topVendors.map((vendor, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-secondary/20 border border-border/20">
                                            <span className="font-medium">{vendor.name}</span>
                                            <span className="font-mono text-primary font-semibold">{vendor.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {data.spending.contracts && data.spending.contracts.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold mb-3">Active Contracts</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border/50">
                                                <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground">Vendor</th>
                                                <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground">Status</th>
                                                <th className="text-left py-2 px-2 text-xs font-semibold text-muted-foreground">Renewal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.spending.contracts.map((contract, idx) => (
                                                <tr key={idx} className="border-b border-border/20">
                                                    <td className="py-2 px-2 text-sm">{contract.vendor}</td>
                                                    <td className="py-2 px-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {contract.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-2 px-2 text-sm text-muted-foreground">
                                                        {contract.renewalDate || 'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* GitGuardian Product Recommendations */}
            {data.productRecommendations && data.productRecommendations.length > 0 && (
                <Card className="p-6 bg-card border-border/30">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">GitGuardian Product Recommendations</h2>
                    </div>
                    <div className="space-y-3">
                        {data.productRecommendations.map((rec, idx) => (
                            <div key={idx} className="p-4 rounded-lg bg-secondary/20 border border-border/20">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-base">{rec.product}</h3>
                                    <Badge
                                        variant={rec.priority === 'high' ? 'default' : rec.priority === 'medium' ? 'secondary' : 'outline'}
                                        className="text-xs"
                                    >
                                        {rec.priority} priority
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{rec.reason}</p>
                                {rec.talkingPoints && rec.talkingPoints.length > 0 && (
                                    <ul className="space-y-1 mt-3">
                                        {rec.talkingPoints.map((point, pidx) => (
                                            <li key={pidx} className="text-xs flex items-start gap-2">
                                                <span className="text-primary mt-0.5">•</span>
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Discovery Questions */}
            {data.discoveryQuestions && data.discoveryQuestions.length > 0 && (
                <Card className="p-6 bg-card border-border/30">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageCircleQuestion className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Discovery Questions</h2>
                    </div>
                    <div className="space-y-3">
                        {data.discoveryQuestions.map((q, idx) => (
                            <div key={idx} className="p-4 rounded-lg bg-secondary/20 border border-border/20">
                                <div className="flex items-start gap-3">
                                    <Badge variant="outline" className="text-xs mt-0.5 shrink-0">
                                        {q.category}
                                    </Badge>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium mb-1">{q.question}</p>
                                        {q.rationale && (
                                            <p className="text-xs text-muted-foreground italic">{q.rationale}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Pain Points */}
            {data.painPoints && data.painPoints.length > 0 && (
                <Card className="p-6 bg-card border-border/30">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Identified Pain Points</h2>
                    </div>
                    <ul className="space-y-2">
                        {data.painPoints.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-primary mt-1">•</span>
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            {/* Value Propositions */}
            {data.valueProps && data.valueProps.length > 0 && (
                <Card className="p-6 bg-card border-border/30">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Value Propositions</h2>
                    </div>
                    <ul className="space-y-2">
                        {data.valueProps.map((prop, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-primary mt-1">•</span>
                                <span>{prop}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}

            {/* Meeting Opener */}
            {data.meetingOpener && (
                <Card className="p-6 bg-card border-border/30">
                    <div className="flex items-center gap-2 mb-4">
                        <Handshake className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Meeting Opener</h2>
                    </div>
                    <p className="text-sm leading-relaxed">{data.meetingOpener}</p>
                </Card>
            )}

            {/* Meeting Closer */}
            {data.meetingCloser && (
                <Card className="p-6 bg-card border-border/30">
                    <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Meeting Closer</h2>
                    </div>
                    <p className="text-sm leading-relaxed">{data.meetingCloser}</p>
                </Card>
            )}

            {/* Talking Points */}
            {data.talkingPoints && data.talkingPoints.length > 0 && (
                <Card className="p-6 bg-card border-border/30">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Talking Points</h2>
                    </div>
                    <div className="space-y-4">
                        {data.talkingPoints.map((tp, idx) => (
                            <div key={idx}>
                                <h3 className="text-sm font-semibold mb-2">{tp.category}</h3>
                                <ul className="space-y-1">
                                    {tp.points.map((point, pidx) => (
                                        <li key={pidx} className="flex items-start gap-2 text-sm">
                                            <span className="text-primary mt-1">•</span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Objection Handling */}
            {data.objectionHandling && data.objectionHandling.length > 0 && (
                <Card className="p-6 bg-card border-border/30">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Objection Handling</h2>
                    </div>
                    <div className="space-y-4">
                        {data.objectionHandling.map((obj, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <Badge variant="outline" className="text-xs mt-0.5 shrink-0">Objection</Badge>
                                    <p className="text-sm font-medium">{obj.objection}</p>
                                </div>
                                <div className="flex items-start gap-2 pl-6">
                                    <Badge variant="default" className="text-xs mt-0.5 shrink-0">Response</Badge>
                                    <p className="text-sm text-muted-foreground">{obj.response}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Competitive Intelligence */}
            {data.competitiveIntel && (
                <Card className="p-6 bg-card border-border/30">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Competitive Intelligence</h2>
                    </div>
                    <div className="space-y-4">
                        {data.competitiveIntel.competitors && data.competitiveIntel.competitors.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Competitors</h3>
                                <div className="flex flex-wrap gap-2">
                                    {data.competitiveIntel.competitors.map((comp, idx) => (
                                        <Badge key={idx} variant="secondary">{comp}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        {data.competitiveIntel.positioning && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Positioning</h3>
                                <p className="text-sm text-muted-foreground">{data.competitiveIntel.positioning}</p>
                            </div>
                        )}
                        {data.competitiveIntel.differentiators && data.competitiveIntel.differentiators.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Differentiators</h3>
                                <ul className="space-y-1">
                                    {data.competitiveIntel.differentiators.map((diff, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm">
                                            <span className="text-primary mt-1">•</span>
                                            <span>{diff}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="h-full flex items-center justify-center p-8">
            <div className="text-center space-y-4 max-w-md">
                <div className="mx-auto w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center">
                    <Database className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Sales Battlecard Dashboard</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Start researching a company to see actionable sales intelligence here: product recommendations, discovery questions, pain points, meeting openers, and more.
                    </p>
                </div>
            </div>
        </div>
    );
}

function DataField({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
            <div className="text-sm font-semibold">{value}</div>
        </div>
    );
}
