"use client"

import React from 'react';
import { Database, TrendingUp, Building2, Package } from 'lucide-react';
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
                    <h3 className="text-lg font-semibold">Data Visualization Panel</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Start a conversation to see company data, tech stack, and spending analysis displayed here in a visual format.
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
