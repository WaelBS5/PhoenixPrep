// Phoenix MCP Best Practices Utilities
// Implements HG Insights recommendations for rate limiting, caching, error handling, and performance

/**
 * Phoenix Error Codes (from HG Insights documentation)
 */
export enum PhoenixErrorCode {
    MISSING_INTEGRATION = 'MISSING_INTEGRATION',
    INVALID_PARAMETERS = 'INVALID_PARAMETERS',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
    COMPANY_NOT_FOUND = 'COMPANY_NOT_FOUND',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface PhoenixError extends Error {
    code: PhoenixErrorCode;
    requiredIntegrations?: string[];
    retryAfter?: number;
}

/**
 * Cache Entry with TTL
 */
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

/**
 * Client-Side Cache Implementation
 * Following HG Insights best practice: cache company data for 1 hour
 */
class PhoenixCache {
    private cache: Map<string, CacheEntry<any>> = new Map();

    // Cache TTL based on HG Insights recommendations
    private readonly TTL = {
        COMPANY_DATA: 60 * 60 * 1000,      // 1 hour
        PRODUCT_CATALOGS: 24 * 60 * 60 * 1000, // 24 hours
        SEARCH_RESULTS: 15 * 60 * 1000,    // 15 minutes
    };

    get<T>(key: string, ttl: number = this.TTL.COMPANY_DATA): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        const age = Date.now() - entry.timestamp;
        if (age > ttl) {
            this.cache.delete(key);
            return null;
        }

        console.log(`✅ Cache hit: ${key} (age: ${Math.round(age / 1000)}s)`);
        return entry.data as T;
    }

    set<T>(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }

    clear(): void {
        this.cache.clear();
    }

    size(): number {
        return this.cache.size;
    }

    getCacheKey(tool: string, params: Record<string, any>): string {
        // Create deterministic cache key from tool name and sorted params
        const sortedParams = Object.keys(params)
            .sort()
            .reduce((acc, key) => {
                acc[key] = params[key];
                return acc;
            }, {} as Record<string, any>);

        return `${tool}:${JSON.stringify(sortedParams)}`;
    }

    getTTL(toolName: string): number {
        if (toolName.includes('search')) {
            return this.TTL.SEARCH_RESULTS;
        }
        if (toolName.includes('list_product') || toolName.includes('list_vendors')) {
            return this.TTL.PRODUCT_CATALOGS;
        }
        return this.TTL.COMPANY_DATA;
    }
}

// Global cache instance
export const phoenixCache = new PhoenixCache();

/**
 * Exponential Backoff Retry with HG Insights error handling
 * Implements recommended retry strategy for rate limiting
 */
export async function callWithRetry<T>(
    fn: () => Promise<T>,
    options: {
        maxRetries?: number;
        toolName?: string;
        params?: Record<string, any>;
    } = {}
): Promise<T> {
    const { maxRetries = 3, toolName = 'unknown', params = {} } = options;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const startTime = Date.now();
            const result = await fn();
            const duration = Date.now() - startTime;

            // Performance monitoring (HG Insights best practice)
            if (duration > 5000) {
                console.warn(`⚠️ Slow call detected: ${toolName} took ${duration}ms`);
            } else {
                console.log(`⏱️ ${toolName} completed in ${duration}ms`);
            }

            return result;

        } catch (error: any) {
            const isLastAttempt = attempt === maxRetries - 1;

            // Handle Phoenix-specific errors (HG Insights documentation)
            switch (error.code) {
                case PhoenixErrorCode.RATE_LIMIT_EXCEEDED:
                    if (isLastAttempt) {
                        throw new Error(`Rate limit exceeded for ${toolName} after ${maxRetries} retries`);
                    }

                    // Exponential backoff: 1s, 2s, 4s
                    const delay = Math.pow(2, attempt) * 1000;
                    console.warn(`⏳ Rate limit hit, retrying ${toolName} in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;

                case PhoenixErrorCode.COMPANY_NOT_FOUND:
                    console.log(`ℹ️ Company not found: ${params.domain || params.companyDomain}`);
                    return { notFound: true, domain: params.domain || params.companyDomain } as T;

                case PhoenixErrorCode.MISSING_INTEGRATION:
                    throw new Error(
                        `Required integration missing for ${toolName}. Please configure: ${error.requiredIntegrations?.join(', ')}`
                    );

                case PhoenixErrorCode.INVALID_PARAMETERS:
                    console.error(`❌ Invalid parameters for ${toolName}:`, params);
                    throw new Error(`Invalid parameters for ${toolName}. Check parameter types and requirements.`);

                case PhoenixErrorCode.INTERNAL_ERROR:
                    if (isLastAttempt) {
                        throw new Error(`Internal server error for ${toolName} after ${maxRetries} retries`);
                    }

                    // Retry once for internal errors
                    console.warn(`⚠️ Internal error, retrying ${toolName}...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;

                default:
                    // Unknown error
                    console.error(`❌ Unknown error in ${toolName}:`, error);
                    throw error;
            }
        }
    }

    throw new Error(`Failed to execute ${toolName} after ${maxRetries} attempts`);
}

/**
 * Validate response data quality (HG Insights best practice)
 */
export function validateFirmographicData(data: any): boolean {
    const required = ['companyName', 'domain'];
    const missing = required.filter(field => !data[field]);

    if (missing.length > 0) {
        console.warn(`⚠️ Missing required fields: ${missing.join(', ')}`);
        return false;
    }

    // Validate ranges
    if (data.employeeCount !== undefined && data.employeeCount < 0) {
        console.warn('⚠️ Invalid employee count');
        return false;
    }

    return true;
}

/**
 * Safely access nested data with defaults (handles missing data gracefully)
 */
export function safelyAccessCompanyData(firmographic: any) {
    return {
        name: firmographic?.companyName || 'Unknown',
        employees: firmographic?.employeeCount || 'Not available',
        revenue: firmographic?.revenueRange || 'Not disclosed',
        industry: firmographic?.industry || 'Unknown',
        location: firmographic?.location?.city
            ? `${firmographic.location.city}, ${firmographic.location.state || ''}`
            : 'Location not available',
    };
}

/**
 * Request tracking for rate limit monitoring
 */
class RequestTracker {
    private requests: { timestamp: number; tool: string }[] = [];

    private readonly WINDOW_MS = {
        MINUTE: 60 * 1000,
        HOUR: 60 * 60 * 1000,
        DAY: 24 * 60 * 60 * 1000,
    };

    private readonly LIMITS = {
        PER_MINUTE: 100,
        PER_HOUR: 1000,
        PER_DAY: 10000,
    };

    track(tool: string): void {
        const now = Date.now();
        this.requests.push({ timestamp: now, tool });

        // Clean old requests (older than 24 hours)
        this.requests = this.requests.filter(r => now - r.timestamp < this.WINDOW_MS.DAY);

        // Log warnings if approaching limits
        this.checkLimits();
    }

    private checkLimits(): void {
        const now = Date.now();

        const lastMinute = this.requests.filter(r => now - r.timestamp < this.WINDOW_MS.MINUTE).length;
        const lastHour = this.requests.filter(r => now - r.timestamp < this.WINDOW_MS.HOUR).length;
        const lastDay = this.requests.filter(r => now - r.timestamp < this.WINDOW_MS.DAY).length;

        if (lastMinute >= this.LIMITS.PER_MINUTE * 0.8) {
            console.warn(`⚠️ Approaching rate limit: ${lastMinute}/100 requests per minute`);
        }

        if (lastHour >= this.LIMITS.PER_HOUR * 0.8) {
            console.warn(`⚠️ Approaching rate limit: ${lastHour}/1000 requests per hour`);
        }

        if (lastDay >= this.LIMITS.PER_DAY * 0.8) {
            console.warn(`⚠️ Approaching rate limit: ${lastDay}/10000 requests per day`);
        }
    }

    getStats() {
        const now = Date.now();

        return {
            lastMinute: this.requests.filter(r => now - r.timestamp < this.WINDOW_MS.MINUTE).length,
            lastHour: this.requests.filter(r => now - r.timestamp < this.WINDOW_MS.HOUR).length,
            lastDay: this.requests.filter(r => now - r.timestamp < this.WINDOW_MS.DAY).length,
            limits: this.LIMITS,
        };
    }
}

export const requestTracker = new RequestTracker();
