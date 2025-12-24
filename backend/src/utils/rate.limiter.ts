import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

export default class RateLimiter {
  static login: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per window
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    message: {
      status: 'fail',
      message: 'Too many login attempts. Please try again after 15 minutes.',
    },
  });

  static general(limit = 100, windowMinutes = 15): RateLimitRequestHandler {
    return rateLimit({
      windowMs: windowMinutes * 60 * 1000,
      max: limit,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        status: 429,
        message: 'Too many requests. Please slow down.',
      },
    });
  }
}
