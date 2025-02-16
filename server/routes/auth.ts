import express from 'express';
import {
  login,
  verifyToken,
  changePassword,
  initializeAuthService,
} from '../controllers/auth.ts';
import rateLimit from 'express-rate-limit';

// 🔹 Rate Limiter for Login
export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
});

const router = express.Router();

// POST 🔹 User Login
router.post('/login', loginLimiter, login);
// POST 🔹 Verify Token
router.post('/verify-token', verifyToken);
// POST 🔹 Change Password
router.post('/change-password', changePassword);

export default async (password?: string) => {
  await initializeAuthService(password);
  return router;
};
