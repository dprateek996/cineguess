import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create a new ratelimiter that allows 5 requests per 30 seconds
export const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '30 s'),
    analytics: true,
    prefix: '@cinequest/ratelimit',
})

// Helper function to check rate limit
export async function checkRateLimit(identifier) {
    const { success, limit, reset, remaining } = await ratelimit.limit(identifier)

    return {
        success,
        limit,
        reset,
        remaining,
    }
}

export default ratelimit
