import type { APIRoute } from 'astro';

interface RateLimitConfig {
  maxRequests: number; // Maximum requests allowed
  windowMs: number; // Time window in milliseconds
}

export class RateLimiter {
  private cache: Map<string, { count: number; timestamp: number }>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.cache = new Map();
    this.config = config;
  }

  async isRateLimited(ip: string): Promise<boolean> {
    const now = Date.now();
    const record = this.cache.get(ip);

    if (!record) {
      this.cache.set(ip, { count: 1, timestamp: now });
      return false;
    }

    if (now - record.timestamp > this.config.windowMs) {
      // Reset if window has passed
      this.cache.set(ip, { count: 1, timestamp: now });
      return false;
    }

    if (record.count >= this.config.maxRequests) {
      return true;
    }

    record.count += 1;
    this.cache.set(ip, record);
    return false;
  }

  getRemainingRequests(ip: string): number {
    const record = this.cache.get(ip);
    if (!record) return this.config.maxRequests;
    return Math.max(0, this.config.maxRequests - record.count);
  }
}

export const rateLimiter = new RateLimiter({
  maxRequests: 50, // 10 requests
  windowMs: 60_000, // per minute
});

export function withRateLimit(handler: APIRoute): APIRoute {
  return async (context) => {
    const ip =
      context.request.headers.get('cf-connecting-ip') ||
      context.request.headers.get('x-forwarded-for') ||
      'unknown';

    const isLimited = await rateLimiter.isRateLimited(ip);
    const remaining = rateLimiter.getRemainingRequests(ip);

    if (isLimited) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(10),
            'X-RateLimit-Remaining': '0',
            'Retry-After': '60',
          },
        },
      );
    }

    const response = await handler(context);
    const headers = new Headers(response.headers);

    headers.set('X-RateLimit-Limit', String(10));
    headers.set('X-RateLimit-Remaining', String(remaining));

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}
