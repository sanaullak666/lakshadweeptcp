import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const ISLANDS = [
  'Agatti',
  'Amini',
  'Andrott',
  'Bangaram',
  'Bitra',
  'Chetlat',
  'Kadmat',
  'Kalpeni',
  'Kavaratti',
  'Kiltan',
  'Minicoy'
] as const;

export const submissionSchema = z.object({
  fullName: z.string().min(2, 'Full name is required (at least 2 characters)'),
  relationship: z.enum(['S/o', 'D/o', 'W/o'], {
    errorMap: () => ({ message: 'Please select a valid relationship (S/o, D/o, or W/o)' })
  }),
  parentSpouseName: z.string().min(2, 'Parent or Spouse name is required'),
  houseName: z.string().min(1, 'House name is required'),
  island: z.enum(ISLANDS, {
    errorMap: () => ({ message: 'Please select a valid island from the Union Territory of Lakshadweep' })
  }),
  pinCode: z.string().regex(/^\d{6}$/, 'PIN Code must be a 6-digit number (e.g. 682555)'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  place: z.string().min(1, 'Place of signing is required'),
  date: z.string().regex(/^\d{2}\.\d{2}\.\d{4}$/, 'Date must be formatted as DD.MM.YYYY'),
  signatureType: z.enum(['drawn', 'uploaded']),
  signatureData: z.string().optional(),
  idempotencyKey: z.string().optional()
});

export function validateSubmission(req: Request, res: Response, next: NextFunction) {
  try {
    // If multipart/form-data, req.body fields might be strings
    const parsed = submissionSchema.parse(req.body);
    req.body = parsed;
    next();
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    next(err);
  }
}

export const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required')
});

export function validateAdminLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = adminLoginSchema.parse(req.body);
    req.body = parsed;
    next();
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid login details',
        errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    next(err);
  }
}
