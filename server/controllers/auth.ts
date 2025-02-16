import type { Request, Response } from 'express';
import { AuthService } from '../services/auth-service.ts';

const authService = new AuthService();

// 🔹 Handle User Login
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  try {
    const result = await authService.authenticate(username, password);
    if (!result) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    res.json({
      token: result.token,
      requirePasswordChange: false,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// 🔹 Verify Token
export const verifyToken = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const payload = await authService.verifyToken(token);
    if (!payload) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    console.log(payload);
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
};

// 🔹 Change Password
export const changePassword = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({ error: 'Token and new password required' });
    return;
  }

  try {
    const payload = await authService.verifyToken(token);
    if (!payload) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const success = await authService.changePassword(payload.userId, newPassword);
    if (!success) {
      res.status(500).json({ error: 'Failed to change password' });
      return;
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

// 🔹 Initialize Auth Service (For Admin Setup)
export const initializeAuthService = async (password?: string) => {
  await authService.initialize();
  await authService.createInitialAdmin(password);
};
