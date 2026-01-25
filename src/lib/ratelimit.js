import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create a new ratelimiter that allows 5 requests per 30 seconds
// Safely handle missing Redis env vars for local dev
let ratelimit;
try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        ratelimit = new Ratelimit({
            redis: Redis.fromEnv(),
            limiter: Ratelimit.slidingWindow(10, '10 s'), // Increased slightly to prevent falst positives during rapid fire
            analytics: true,
            prefix: '@cinequest/ratelimit',
        })
    }
} catch (e) {
    console.warn("Rate limiting disabled: Redis not configured");
}

// Helper function to check rate limit
export async function checkRateLimit(identifier) {
    if (!ratelimit) {
        return { success: true, limit: 100, reset: 0, remaining: 100 };
    }

    try {
        const { success, limit, reset, remaining } = await ratelimit.limit(identifier)
        return {
            success,
            limit,
            reset,
            remaining,
        }
    } catch (error) {
        console.warn("Rate limit check failed:", error);
        // Fail open to avoid blocking legitimate users if Redis goes down
        return { success: true, limit: 10, reset: 0, remaining: 10 };
    }
}

export default ratelimit
