"use client"

import { useState } from 'react';
import { Copy, FileDown, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SalesBriefData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportActionsProps {
    data: SalesBriefData | null;
}

export default function ExportActions({ data }: ExportActionsProps) {
    const [copying, setCopying] = useState(false);
    const [copied, setCopied] = useState(false);
    const [generating, setGenerating] = useState(false);
    const { toast } = useToast();

    const handleCopyToClipboard = async () => {
        if (!data || Object.keys(data).length === 0) {
            toast({
                title: "No data to copy",
                description: "Start a conversation to generate a sales brief first.",
                variant: "destructive",
            });
            return;
        }

        setCopying(true);
        try {
            const briefText = formatBriefAsText(data);
            await navigator.clipboard.writeText(briefText);
            setCopied(true);
            toast({
                title: "Copied to clipboard!",
                description: "Sales brief has been copied as formatted text.",
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast({
                title: "Copy failed",
                description: "Unable to copy to clipboard. Please try again.",
                variant: "destructive",
            });
        } finally {
            setCopying(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!data || Object.keys(data).length === 0) {
            toast({
                title: "No data to export",
                description: "Start a conversation to generate a sales brief first.",
                variant: "destructive",
            });
            return;
        }

        setGenerating(true);
        try {
            const element = document.getElementById('sales-brief-content');
            if (!element) {
                throw new Error('Brief content not found');
            }

            // Clone the element to avoid modifying the visible DOM
            const clone = element.cloneNode(true) as HTMLElement;
            clone.style.position = 'absolute';
            clone.style.left = '-9999px';
            clone.style.top = '0';
            clone.style.width = `${element.offsetWidth}px`;
            clone.style.height = 'auto';
            clone.style.maxHeight = 'none';
            clone.style.overflow = 'visible';
            clone.style.background = '#0a0a0a';
            clone.style.padding = '32px';
            document.body.appendChild(clone);

            // Wait for clone to render
            await new Promise(resolve => setTimeout(resolve, 200));

            // Get the actual full height of the content
            const fullHeight = clone.scrollHeight;
            const fullWidth = clone.scrollWidth;

            // Capture the cloned element
            const canvas = await html2canvas(clone, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#0a0a0a',
                width: fullWidth,
                height: fullHeight,
                windowWidth: fullWidth,
                windowHeight: fullHeight,
            });

            // Remove the clone
            document.body.removeChild(clone);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = 210; // A4 width in mm
            const pdfHeight = 297; // A4 height in mm
            const margin = 10; // 10mm margin
            const contentWidth = pdfWidth - (margin * 2);

            // Calculate image dimensions to fit within margins
            const imgWidth = contentWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = margin;

            // Add first page
            pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - margin * 2);

            // Add additional pages if content extends beyond first page
            while (heightLeft > 0) {
                pdf.addPage();
                position = margin - (imgHeight - heightLeft);
                pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
                heightLeft -= (pdfHeight - margin * 2);
            }

            const fileName = data.companyOverview?.name
                ? `${data.companyOverview.name.replace(/\s+/g, '_')}_Sales_Battlecard.pdf`
                : 'Sales_Battlecard.pdf';

            pdf.save(fileName);

            toast({
                title: "PDF downloaded!",
                description: `${fileName} has been saved to your downloads.`,
            });
        } catch (error) {
            console.error('PDF generation error:', error);
            toast({
                title: "PDF generation failed",
                description: "Unable to generate PDF. Please try again.",
                variant: "destructive",
            });
        } finally {
            setGenerating(false);
        }
    };

    const isDisabled = !data || Object.keys(data).length === 0;

    return (
        <div className="sticky bottom-0 left-0 right-0 border-t border-border/50 bg-background/95 backdrop-blur-xl p-4">
            <div className="flex items-center justify-end gap-3">
                <Button
                    variant="outline"
                    size="default"
                    onClick={handleCopyToClipboard}
                    disabled={isDisabled || copying}
                    className="gap-2"
                >
                    {copying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : copied ? (
                        <Check className="h-4 w-4" />
                    ) : (
                        <Copy className="h-4 w-4" />
                    )}
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                </Button>
                <Button
                    variant="default"
                    size="default"
                    onClick={handleDownloadPDF}
                    disabled={isDisabled || generating}
                    className="gap-2"
                >
                    {generating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <FileDown className="h-4 w-4" />
                    )}
                    {generating ? 'Generating PDF...' : 'Download PDF'}
                </Button>
            </div>
        </div>
    );
}

function formatBriefAsText(data: SalesBriefData): string {
    let text = '# SALES BATTLECARD\n\n';

    // Company Overview
    if (data.companyOverview) {
        text += '## COMPANY OVERVIEW\n\n';
        text += `**Company:** ${data.companyOverview.name}\n`;
        text += `**Domain:** ${data.companyOverview.domain}\n`;
        if (data.companyOverview.industry) text += `**Industry:** ${data.companyOverview.industry}\n`;
        if (data.companyOverview.employeeCount) text += `**Employees:** ${data.companyOverview.employeeCount.toLocaleString()}\n`;
        if (data.companyOverview.revenue) text += `**Revenue:** ${data.companyOverview.revenue}\n`;
        if (data.companyOverview.location) text += `**Location:** ${data.companyOverview.location}\n`;
        if (data.companyOverview.description) text += `\n${data.companyOverview.description}\n`;
        text += '\n';
    }

    // Tech Stack
    if (data.techStack && data.techStack.length > 0) {
        text += '## TECHNOLOGY STACK\n\n';
        data.techStack.forEach(tech => {
            text += `- **${tech.name}** (${tech.vendor}) - ${tech.category}`;
            if (tech.intensity) text += ` [${tech.intensity}]`;
            text += '\n';
        });
        text += '\n';
    }

    // Spending
    if (data.spending) {
        text += '## SPENDING ANALYSIS\n\n';
        if (data.spending.totalSpend) text += `**Total IT Spend:** ${data.spending.totalSpend}\n`;
        if (data.spending.cloudSpend) text += `**Cloud Spend:** ${data.spending.cloudSpend}\n`;
        if (data.spending.topVendors && data.spending.topVendors.length > 0) {
            text += '\n**Top Vendors:**\n';
            data.spending.topVendors.forEach(v => {
                text += `- ${v.name}: ${v.amount}\n`;
            });
        }
        text += '\n';
    }

    // Product Recommendations
    if (data.productRecommendations && data.productRecommendations.length > 0) {
        text += '## GITGUARDIAN PRODUCT RECOMMENDATIONS\n\n';
        data.productRecommendations.forEach(rec => {
            text += `### ${rec.product} (${rec.priority} priority)\n`;
            text += `${rec.reason}\n`;
            if (rec.talkingPoints && rec.talkingPoints.length > 0) {
                text += '\nTalking Points:\n';
                rec.talkingPoints.forEach(tp => text += `- ${tp}\n`);
            }
            text += '\n';
        });
    }

    // Discovery Questions
    if (data.discoveryQuestions && data.discoveryQuestions.length > 0) {
        text += '## DISCOVERY QUESTIONS\n\n';
        data.discoveryQuestions.forEach((q, idx) => {
            text += `${idx + 1}. [${q.category}] ${q.question}\n`;
            if (q.rationale) text += `   _${q.rationale}_\n`;
        });
        text += '\n';
    }

    // Pain Points
    if (data.painPoints && data.painPoints.length > 0) {
        text += '## IDENTIFIED PAIN POINTS\n\n';
        data.painPoints.forEach(p => text += `- ${p}\n`);
        text += '\n';
    }

    // Value Props
    if (data.valueProps && data.valueProps.length > 0) {
        text += '## VALUE PROPOSITIONS\n\n';
        data.valueProps.forEach(v => text += `- ${v}\n`);
        text += '\n';
    }

    // Meeting Opener
    if (data.meetingOpener) {
        text += '## MEETING OPENER\n\n';
        text += `"${data.meetingOpener}"\n\n`;
    }

    // Meeting Closer
    if (data.meetingCloser) {
        text += '## MEETING CLOSER\n\n';
        text += `"${data.meetingCloser}"\n\n`;
    }

    // Objection Handling
    if (data.objectionHandling && data.objectionHandling.length > 0) {
        text += '## OBJECTION HANDLING\n\n';
        data.objectionHandling.forEach(obj => {
            text += `**Objection:** "${obj.objection}"\n`;
            text += `**Response:** ${obj.response}\n\n`;
        });
    }

    // Competitive Intelligence
    if (data.competitiveIntel) {
        text += '## COMPETITIVE INTELLIGENCE\n\n';
        if (data.competitiveIntel.competitors && data.competitiveIntel.competitors.length > 0) {
            text += `**Competitors:** ${data.competitiveIntel.competitors.join(', ')}\n\n`;
        }
        if (data.competitiveIntel.positioning) {
            text += `**Positioning:** ${data.competitiveIntel.positioning}\n\n`;
        }
        if (data.competitiveIntel.differentiators && data.competitiveIntel.differentiators.length > 0) {
            text += '**Differentiators:**\n';
            data.competitiveIntel.differentiators.forEach(d => text += `- ${d}\n`);
            text += '\n';
        }
    }

    // Talking Points
    if (data.talkingPoints && data.talkingPoints.length > 0) {
        text += '## TALKING POINTS\n\n';
        data.talkingPoints.forEach(section => {
            text += `**${section.category}:**\n`;
            section.points.forEach(p => text += `- ${p}\n`);
            text += '\n';
        });
    }

    // Sales Angle (legacy)
    if (data.angle) {
        text += '## SALES ANGLE\n\n';
        if (data.angle.competitivePosition) {
            text += `**Competitive Position:**\n${data.angle.competitivePosition}\n\n`;
        }
        if (data.angle.painPoints && data.angle.painPoints.length > 0) {
            text += '**Pain Points:**\n';
            data.angle.painPoints.forEach(p => text += `- ${p}\n`);
            text += '\n';
        }
        if (data.angle.wedges && data.angle.wedges.length > 0) {
            text += '**Wedges:**\n';
            data.angle.wedges.forEach(w => text += `- ${w}\n`);
            text += '\n';
        }
    }

    return text;
}
