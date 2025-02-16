import { Response, NextFunction } from 'express';
import { AuthService } from '../services/auth-service.ts';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema.ts';
import type { AuthRequest } from '../../types/index.ts';

const authService = new AuthService();
await authService.initialize();

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const payload = await authService.verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const payload = await authService.verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!payload.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const requirePasswordChanged = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const payload = await authService.verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if password change is required
    const user = await db.select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1)
      .then(rows => rows[0]);

    if (user?.requirePasswordChange) {
      return res.status(403).json({ 
        error: 'Password change required',
        requirePasswordChange: true
      });
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error('Password check middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};