import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import { PasswordUtils } from '../providers/password-utils.ts';
import * as jose from 'jose';
import { db } from '../db/index.ts';

interface AuthTokenPayload {
  userId: number;
  username: string;
  isAdmin: boolean;
}

export class AuthService {
  private privateKey?: jose.KeyLike;
  private publicKey?: jose.KeyLike;

  async initialize() {
    const keyPair = await jose.generateKeyPair('ES256');
    this.privateKey = keyPair.privateKey;
    this.publicKey = keyPair.publicKey;
  }

  async createInitialAdmin(password?: string) {
    const adminExists = await db.select()
      .from(users)
      .where(eq(users.isAdmin, true))
      .limit(1);

    if (adminExists.length === 0) {
      const tempPassword = password || PasswordUtils.generateTemporaryPassword();
      const passwordHash = await PasswordUtils.hashPassword(tempPassword);

      await db.insert(users).values({
        username: 'admin',
        passwordHash,
        isAdmin: true,
        requirePasswordChange: true
      });

      console.log('Initial admin account created with temporary password:', tempPassword);
    }
  }

  async authenticate(username: string, password: string): Promise<{ token: string; requirePasswordChange: boolean } | null> {
    const user = await db.select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)
      .then(rows => rows[0]);

    if (!user) {
      return null;
    }

    const isValid = await PasswordUtils.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    // Update last login
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    const token = await this.createToken({
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    });

    return {
      token,
      requirePasswordChange: user.requirePasswordChange
    };
  }

  async changePassword(userId: number, newPassword: string): Promise<boolean> {
    try {
      const passwordHash = await PasswordUtils.hashPassword(newPassword);
      
      await db.update(users)
        .set({
          passwordHash,
          requirePasswordChange: false
        })
        .where(eq(users.id, userId));
      
      return true;
    } catch (error) {
      console.error('Failed to change password:', error);
      return false;
    }
  }

  private async createToken(payload: AuthTokenPayload): Promise<string> {
    if (!this.privateKey) {
      throw new Error('Auth service not initialized');
    }

    return await new jose.SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'ES256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(this.privateKey);
  }

  async verifyToken(token: string): Promise<AuthTokenPayload | null> {
    if (!this.publicKey) {
      throw new Error('Auth service not initialized');
    }

    try {
      const { payload } = await jose.jwtVerify(token, this.publicKey, {
        algorithms: ['ES256']
      });

      return payload as unknown as AuthTokenPayload;
    } catch {
      return null;
    }
  }
}