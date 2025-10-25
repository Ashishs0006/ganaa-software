import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to set the Permissions-Policy header
 * -- Usages --
 * geolocation=() — Disables geolocation API.
 * camera=() — Disables camera API.
 * microphone=() — Disables microphone API.
 * fullscreen=() — Disables fullscreen API.
 * -- To Use in Specific Domain --
 * geolocation=(self "https://example.com")
 */
export const permissionsPolicy = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  next();
};
