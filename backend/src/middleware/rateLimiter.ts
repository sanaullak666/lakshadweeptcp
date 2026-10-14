import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Pass-through limiter for public submissions to ensure all citizens can register without IP limits
export const submissionLimiter = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many failed login attempts. Please try again after 15 minutes.'
  }
});
