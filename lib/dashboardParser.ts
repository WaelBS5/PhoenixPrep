// Parse markdown content from AI responses and extract structured dashboard data
import type { SalesBriefData, DiscoveryQuestion, ProductRecommendation } from './types';

export function parseDashboardData(content: string, existingData: SalesBriefData | null): SalesBriefData {
    const newData: SalesBriefData = { ...existingData };

    console.log('🔍 Parsing content length:', content.length);

    // Extract GitGuardian Fit Score and recommended products
    const fitScoreMatch = content.match(/##\s*\d*\)?\s*GitGuardian Fit Score[^\n]*\n([\s\S]*?)(?=##|$)/i);
    if (fitScoreMatch) {
        const section = fitScoreMatch[1];
        const productRecommendations: ProductRecommendation[] = [];

        // Look for explicit product mentions
        if (content.match(/Secrets Detection/i)) {
            productRecommendations.push({
                product: 'GitGuardian Secrets Detection',
                reason: 'Primary recommendation based on tech stack analysis - detect and prevent secrets in repos, PRs, CI/CD pipelines',
                priority: 'high',
                talkingPoints: extractBulletPoints(section).slice(0, 3)
            });
        }
        if (content.match(/Public Monitoring/i)) {
            productRecommendations.push({
                product: 'GitGuardian Public Monitoring',
                reason: 'Detect secrets leaked in public repos and external exposure',
                priority: 'medium',
                talkingPoints: []
            });
        }
        if (content.match(/NHI Governance/i)) {
            productRecommendations.push({
                product: 'GitGuardian NHI Governance',
                reason: 'Visibility and control over Non-Human Identities (tokens, service accounts, bots)',
                priority: 'medium',
                talkingPoints: []
            });
        }

        if (productRecommendations.length > 0) {
            newData.productRecommendations = productRecommendations;
            console.log('✅ Found product recommendations:', productRecommendations.length);
        }
    }

    // Extract Executive Summary as value props
    const execSummaryMatch = content.match(/##\s*\d*\)?\s*Executive Summary[^\n]*\n([\s\S]*?)(?=##|$)/i);
    if (execSummaryMatch) {
        const bullets = extractBulletPoints(execSummaryMatch[1]);
        if (bullets.length > 0 && !newData.valueProps) {
            newData.valueProps = bullets.slice(0, 5);
            console.log('✅ Found value props from exec summary:', bullets.length);
        }
    }

    // Extract Top 3 Sales Plays as pain points and value props
    const salesPlaysMatch = content.match(/##\s*\d*\)?\s*Top \d+ Sales Plays[^\n]*\n([\s\S]*?)(?=##|$)/i);
    if (salesPlaysMatch) {
        const section = salesPlaysMatch[1];
        const painPoints: string[] = [];
        const valueProps: string[] = [];

        // Extract hypotheses as pain points
        const hypothesisMatches = section.matchAll(/[-*•]\s*(?:\*\*)?Hypothesis(?:\*\*)?\s*:?\s*([^\n]+)/gi);
        for (const match of hypothesisMatches) {
            painPoints.push(match[1].trim());
        }

        // Extract talk tracks as value props
        const talkTrackMatches = section.matchAll(/[-*•]\s*(?:\*\*)?Talk\s*track(?:\*\*)?\s*:?\s*([^\n]+)/gi);
        for (const match of talkTrackMatches) {
            valueProps.push(match[1].trim());
        }

        if (painPoints.length > 0) {
            newData.painPoints = painPoints;
            console.log('✅ Found pain points:', painPoints.length);
        }
        if (valueProps.length > 0) {
            newData.valueProps = [...(newData.valueProps || []), ...valueProps];
            console.log('✅ Found value props from talk tracks:', valueProps.length);
        }
    }

    // Extract "What Their Stack Implies" as additional pain points
    const stackImpliesMatch = content.match(/##\s*\d*\)?\s*What Their Stack Implies[^\n]*\n([\s\S]*?)(?=##|$)/i);
    if (stackImpliesMatch) {
        const implications = extractBulletPoints(stackImpliesMatch[1]);
        if (implications.length > 0) {
            newData.painPoints = [...(newData.painPoints || []), ...implications].slice(0, 10);
            console.log('✅ Found stack implications:', implications.length);
        }
    }

    // Extract Discovery Questions
    const questionsMatch = content.match(/##\s*\d*\)?\s*Discovery Questions[^\n]*\n([\s\S]*?)(?=##|$)/i);
    if (questionsMatch) {
        const section = questionsMatch[1];
        const questions: DiscoveryQuestion[] = [];

        // Find all lines that look like questions
        const lines = section.split('\n');
        for (const line of lines) {
            let trimmed = line.trim();
            if (!trimmed) continue;

            // Remove markdown bold
            trimmed = trimmed.replace(/\*\*/g, '');
            // Remove bullets/numbers
            trimmed = trimmed.replace(/^(?:[-*•]|\d+[\.\):])\s*/, '');

            // Check if it's a question
            if (trimmed.endsWith('?') && trimmed.length > 10) {
                let category: 'technical' | 'business' | 'pain-point' | 'timing' | 'stakeholder' = 'technical';
                const lowerQ = trimmed.toLowerCase();

                if (lowerQ.match(/workflow|technical|stack|tool|implementation|integration|how do you|process|currently/i)) {
                    category = 'technical';
                } else if (lowerQ.match(/budget|cost|spend|roi|timeline|when|investment/i)) {
                    category = 'business';
                } else if (lowerQ.match(/pain|challenge|problem|incident|breach|risk|struggle/i)) {
                    category = 'pain-point';
                } else if (lowerQ.match(/decision|stakeholder|approval|team|who|involve/i)) {
                    category = 'stakeholder';
                } else if (lowerQ.match(/timing|deadline|priority|urgent/i)) {
                    category = 'timing';
                }

                questions.push({
                    question: trimmed,
                    category,
                });
            }
        }

        if (questions.length > 0) {
            newData.discoveryQuestions = questions;
            console.log('✅ Found discovery questions:', questions.length);
        }
    }

    // Extract Meeting Opener + Close
    const openerCloseMatch = content.match(/##\s*\d*\)?\s*Meeting Opener[^\n]*\n([\s\S]*?)(?=##|$)/i);
    if (openerCloseMatch) {
        const section = openerCloseMatch[1];

        // Try various opener patterns
        const openerPatterns = [
            /[-*•]\s*(?:\*\*)?Opener(?:\*\*)?\s*:?\s*["'""]?([^"""\n]+)["'""]?/i,
            /Opener\s*:?\s*["'""]([^"""]+)["'""]?/i,
        ];

        for (const pattern of openerPatterns) {
            const openerMatch = section.match(pattern);
            if (openerMatch) {
                newData.meetingOpener = openerMatch[1].trim().replace(/^["'""]|["'""]$/g, '');
                console.log('✅ Found meeting opener');
                break;
            }
        }

        // Try various closer patterns
        const closePatterns = [
            /[-*•]\s*(?:\*\*)?Close(?:r)?(?:\*\*)?\s*:?\s*["'""]?([^"""\n]+)["'""]?/i,
            /Close(?:r)?\s*:?\s*["'""]([^"""]+)["'""]?/i,
        ];

        for (const pattern of closePatterns) {
            const closeMatch = section.match(pattern);
            if (closeMatch) {
                newData.meetingCloser = closeMatch[1].trim().replace(/^["'""]|["'""]$/g, '');
                console.log('✅ Found meeting closer');
                break;
            }
        }
    }

    // Extract Competitive / Displacement Notes
    const competitiveMatch = content.match(/##\s*\d*\)?\s*Competitive[^\n]*\n([\s\S]*?)(?=##|$)/i);
    if (competitiveMatch) {
        const section = competitiveMatch[1];
        const competitors: string[] = [];

        // Look for mentioned competitors
        const competitorNames = ['Vault', 'HashiCorp', 'CyberArk', 'AWS Secrets Manager', 'Azure Key Vault', 'Google Secret Manager', 'Snyk', 'SonarQube', 'Checkmarx'];
        competitorNames.forEach(comp => {
            if (section.includes(comp)) {
                competitors.push(comp);
            }
        });

        const differentiators = extractBulletPoints(section);

        if (competitors.length > 0 || differentiators.length > 0) {
            newData.competitiveIntel = {
                competitors: competitors.length > 0 ? competitors : undefined,
                positioning: 'GitGuardian focuses on preventing secrets leaks in code, complementing runtime secrets management',
                differentiators: differentiators.length > 0 ? differentiators : undefined,
            };
            console.log('✅ Found competitive intel');
        }
    }

    return newData;
}

// Helper function to extract bullet points from a text section
function extractBulletPoints(text: string): string[] {
    const bullets: string[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
        let trimmed = line.trim();
        // Match lines starting with -, *, •, or number
        const bulletMatch = trimmed.match(/^(?:[-*•]|\d+[\.\):])\s+(.+)/);
        if (bulletMatch && bulletMatch[1].length > 5) {
            // Clean up markdown
            let cleanText = bulletMatch[1].trim();
            cleanText = cleanText.replace(/\*\*/g, '');
            bullets.push(cleanText);
        }
    }

    return bullets;
}
