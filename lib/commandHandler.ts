// Handle special dashboard update commands
import type { SalesBriefData, DiscoveryQuestion, ObjectionHandler } from './types';

export function isDashboardCommand(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return (
        lowerMessage.includes('add') ||
        lowerMessage.includes('give me') ||
        lowerMessage.includes('create') ||
        lowerMessage.includes('generate') ||
        lowerMessage.includes('more') ||
        lowerMessage.includes('update') ||
        lowerMessage.includes('change') ||
        lowerMessage.includes('remove') ||
        lowerMessage.includes('delete')
    ) && (
        lowerMessage.includes('question') ||
        lowerMessage.includes('objection') ||
        lowerMessage.includes('opener') ||
        lowerMessage.includes('closer') ||
        lowerMessage.includes('closing') ||
        lowerMessage.includes('talking point') ||
        lowerMessage.includes('pain point') ||
        lowerMessage.includes('value prop') ||
        lowerMessage.includes('dashboard')
    );
}

export function extractDashboardUpdates(
    content: string,
    userMessage: string,
    existingData: SalesBriefData | null
): SalesBriefData {
    const newData: SalesBriefData = { ...existingData };
    const lowerMessage = userMessage.toLowerCase();
    const lowerContent = content.toLowerCase();

    console.log('📝 Extracting dashboard updates from:', content.substring(0, 200) + '...');

    // Extract discovery questions - check for question-related commands
    if (lowerMessage.includes('question') || lowerContent.includes('question')) {
        const questions = extractQuestions(content);
        console.log('📝 Found questions:', questions.length);
        if (questions.length > 0) {
            newData.discoveryQuestions = [
                ...(newData.discoveryQuestions || []),
                ...questions
            ];
        }
    }

    // Extract objection handlers
    if (lowerMessage.includes('objection') || lowerContent.includes('objection')) {
        const objections = extractObjections(content);
        console.log('📝 Found objections:', objections.length);
        if (objections.length > 0) {
            newData.objectionHandling = [
                ...(newData.objectionHandling || []),
                ...objections
            ];
        }
    }

    // Extract meeting opener
    if (lowerMessage.includes('opener') || lowerContent.includes('opener')) {
        const opener = extractOpener(content);
        console.log('📝 Found opener:', opener);
        if (opener) {
            newData.meetingOpener = opener;
        }
    }

    // Extract meeting closer(s)
    if (lowerMessage.includes('closer') || lowerMessage.includes('closing') ||
        lowerContent.includes('closer') || lowerContent.includes('close')) {
        const closers = extractClosers(content);
        console.log('📝 Found closers:', closers);
        if (closers.length > 0) {
            // Use the first one as the main closer, but could add others as talking points
            newData.meetingCloser = closers[0];
        }
    }

    // Extract pain points
    if (lowerMessage.includes('pain point') || lowerContent.includes('pain point')) {
        const painPoints = extractBulletPoints(content);
        if (painPoints.length > 0) {
            newData.painPoints = [
                ...(newData.painPoints || []),
                ...painPoints
            ];
        }
    }

    // Extract value props
    if (lowerMessage.includes('value prop') || lowerContent.includes('value prop')) {
        const valueProps = extractBulletPoints(content);
        if (valueProps.length > 0) {
            newData.valueProps = [
                ...(newData.valueProps || []),
                ...valueProps
            ];
        }
    }

    return newData;
}

function extractQuestions(content: string): DiscoveryQuestion[] {
    const questions: DiscoveryQuestion[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines and headers
        if (!trimmed || trimmed.startsWith('#')) continue;

        // Check if this line contains a question (ends with ?)
        // Handle various formats:
        // 1. "Question text?"
        // - Question text?
        // * Question text?
        // ** "Question text?" (bold with quotes)

        let questionText = trimmed;

        // Remove markdown bold markers
        questionText = questionText.replace(/\*\*/g, '');

        // Remove leading numbering, bullets, dashes
        questionText = questionText.replace(/^(?:[-*•]|\d+[\.\):])\s*/, '');

        // Remove surrounding quotes
        questionText = questionText.replace(/^["']|["']$/g, '').trim();

        // Check if it's a question
        if (questionText.endsWith('?') && questionText.length > 10) {
            let category: 'technical' | 'business' | 'pain-point' | 'timing' | 'stakeholder' = 'technical';

            // Categorize based on keywords
            const lowerQ = questionText.toLowerCase();
            if (lowerQ.match(/workflow|technical|stack|tool|implementation|integration|how do you|currently|process/i)) {
                category = 'technical';
            } else if (lowerQ.match(/budget|cost|spend|roi|investment|price/i)) {
                category = 'business';
            } else if (lowerQ.match(/pain|challenge|problem|incident|breach|risk|struggle|difficult/i)) {
                category = 'pain-point';
            } else if (lowerQ.match(/decision|stakeholder|approval|team|who|involve/i)) {
                category = 'stakeholder';
            } else if (lowerQ.match(/timing|when|how soon|deadline|timeline|priority|urgent/i)) {
                category = 'timing';
            }

            questions.push({
                question: questionText,
                category,
            });
        }
    }

    return questions;
}

function extractObjections(content: string): ObjectionHandler[] {
    const objections: ObjectionHandler[] = [];

    // Pattern 1: "Objection:" followed by "Response:"
    const pattern1 = /(?:\*\*)?Objection(?:\*\*)?\s*:?\s*["']?([^"\n]+)["']?\n+\s*(?:\*\*)?Response(?:\*\*)?\s*:?\s*([^\n]+(?:\n(?!(?:\*\*)?Objection)[^\n]+)*)/gi;
    let match;
    while ((match = pattern1.exec(content)) !== null) {
        objections.push({
            objection: match[1].trim().replace(/[""]/g, ''),
            response: match[2].trim().replace(/\n/g, ' '),
        });
    }

    // Pattern 2: Quoted objection followed by dash response
    if (objections.length === 0) {
        const lines = content.split('\n');
        let currentObjection: string | null = null;

        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();

            // Check for quoted objection (various quote types)
            const quoteMatch = trimmed.match(/^["'""](.+?)["'""]$/);
            if (quoteMatch) {
                currentObjection = quoteMatch[1].trim();
                continue;
            }

            // Check for response line after objection
            if (currentObjection && (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*'))) {
                objections.push({
                    objection: currentObjection,
                    response: trimmed.replace(/^[-•*]\s*/, '').trim(),
                });
                currentObjection = null;
            }
        }
    }

    return objections;
}

function extractOpener(content: string): string | undefined {
    // Look for explicit opener label with various formats
    const patterns = [
        /(?:\*\*)?(?:Meeting\s+)?Opener(?:\*\*)?\s*:?\s*["'""]([^"""'\n]+)["'""]?/i,
        /(?:\*\*)?Opener(?:\*\*)?\s*:?\s*(.+?)(?:\n|$)/i,
        /[-*•]\s*(?:\*\*)?Opener(?:\*\*)?\s*:?\s*["'""]?([^"""\n]+)["'""]?/i,
    ];

    for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
            return match[1].trim().replace(/^["'""]|["'""]$/g, '');
        }
    }

    return undefined;
}

function extractClosers(content: string): string[] {
    const closers: string[] = [];
    const lines = content.split('\n');

    // Look for closers section
    let inClosersSection = false;

    for (const line of lines) {
        const trimmed = line.trim();

        // Check if we're entering a closers section
        if (trimmed.toLowerCase().includes('closer') || trimmed.toLowerCase().includes('close:')) {
            inClosersSection = true;

            // Check if the closer is on the same line
            const sameLineMatch = trimmed.match(/close(?:r)?s?\s*:?\s*["'""]([^"""']+)["'""]?/i);
            if (sameLineMatch) {
                closers.push(sameLineMatch[1].trim());
            }
            continue;
        }

        // If in closers section, extract numbered/bulleted items
        if (inClosersSection) {
            // Stop at next section header
            if (trimmed.startsWith('#') || (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.includes(':'))) {
                inClosersSection = false;
                continue;
            }

            // Extract quoted text or bulleted items
            const quotedMatch = trimmed.match(/["'""]([^"""']+)["'""](?:\?)?/);
            if (quotedMatch) {
                closers.push(quotedMatch[1].trim());
                continue;
            }

            // Extract numbered items (1. "text")
            const numberedMatch = trimmed.match(/^\d+[\.\)]\s*["'""]?([^"""'\n]+)["'""]?/);
            if (numberedMatch && numberedMatch[1].length > 15) {
                closers.push(numberedMatch[1].trim());
            }
        }
    }

    // Also try single closer pattern if no section found
    if (closers.length === 0) {
        const singlePattern = /(?:\*\*)?Close(?:r)?(?:\*\*)?\s*:?\s*["'""]([^"""'\n]+)["'""]?/i;
        const match = content.match(singlePattern);
        if (match) {
            closers.push(match[1].trim());
        }
    }

    return closers;
}

function extractBulletPoints(text: string): string[] {
    const bullets: string[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        // Match lines starting with -, *, •, or number
        const bulletMatch = trimmed.match(/^(?:[-*•]|\d+[\.\):])\s+(.+)/);
        if (bulletMatch && bulletMatch[1].length > 5) {
            // Clean up markdown and quotes
            let cleanText = bulletMatch[1].trim();
            cleanText = cleanText.replace(/\*\*/g, '').replace(/^["'""]|["'""]$/g, '');
            bullets.push(cleanText);
        }
    }

    return bullets;
}
