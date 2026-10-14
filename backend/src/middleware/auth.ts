import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AdminUserPayload {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  admin?: AdminUserPayload;
}

export function authenticateAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token = '';
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.admin_token || req.query.adminToken) {
    token = (req.query.admin_token || req.query.adminToken) as string;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const secret = process.env.JWT_SECRET || 'lakshadweep_town_country_planning_secure_jwt_secret_2026_super_key';

  try {
    const decoded = jwt.verify(token, secret) as AdminUserPayload;
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}
