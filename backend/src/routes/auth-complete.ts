import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = '7d';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// POST /api/auth/register - Register new user with email verification
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const client = await pool.connect();
    try {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id, email_verified FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        if (existingUser.rows[0].email_verified) {
          return res.status(400).json({ error: 'User already exists with this email' });
        } else {
          // User exists but not verified - resend verification
          const userId = existingUser.rows[0].id;
          const verificationToken = crypto.randomBytes(32).toString('hex');
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

          await client.query(
            'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3',
            [verificationToken, expiresAt, userId]
          );

          // Send verification email
          await sendVerificationEmail(email, verificationToken, name);

          return res.json({
            message: 'Verification email resent. Please check your inbox.',
            emailSent: true
          });
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const result = await client.query(
        `INSERT INTO users (
          email, password, name, email_verified, 
          verification_token, verification_token_expires
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, name, email_verified`,
        [email.toLowerCase(), hashedPassword, name, false, verificationToken, tokenExpires]
      );

      const user = result.rows[0];

      // Create default user settings
      await client.query(
        'INSERT INTO user_settings (user_id) VALUES ($1)',
        [user.id]
      );

      // Send verification email
      await sendVerificationEmail(email, verificationToken, name);

      res.status(201).json({
        message: 'Registration successful! Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.email_verified
        },
        emailSent: true
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// GET /api/auth/verify-email/:token - Verify email address
router.get('/verify-email/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const client = await pool.connect();
    try {
      // Find user with this token
      const result = await client.query(
        `SELECT id, email, name, verification_token_expires 
         FROM users 
         WHERE verification_token = $1 AND email_verified = FALSE`,
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ 
          error: 'Invalid or expired verification token',
          verified: false 
        });
      }

      const user = result.rows[0];

      // Check if token expired
      if (new Date() > new Date(user.verification_token_expires)) {
        return res.status(400).json({ 
          error: 'Verification token has expired. Please request a new one.',
          verified: false,
          expired: true
        });
      }

      // Update user as verified
      await client.query(
        `UPDATE users 
         SET email_verified = TRUE, 
             verification_token = NULL, 
             verification_token_expires = NULL 
         WHERE id = $1`,
        [user.id]
      );

      // Generate JWT token
      const jwtToken = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        message: 'Email verified successfully! You can now sign in.',
        verified: true,
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: true
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// POST /api/auth/resend-verification - Resend verification email
router.post('/resend-verification', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, name, email_verified FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = result.rows[0];

      if (user.email_verified) {
        return res.status(400).json({ error: 'Email is already verified' });
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await client.query(
        'UPDATE users SET verification_token = $1, verification_token_expires = $2 WHERE id = $3',
        [verificationToken, tokenExpires, user.id]
      );

      // Send verification email
      await sendVerificationEmail(user.email, verificationToken, user.name);

      res.json({
        message: 'Verification email sent! Please check your inbox.',
        emailSent: true
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// POST /api/auth/signin - Sign in user
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = result.rows[0];

      // Check if email is verified
      if (!user.email_verified) {
        return res.status(403).json({ 
          error: 'Please verify your email before signing in',
          emailVerified: false,
          email: user.email
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        message: 'Sign in successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.email_verified
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: 'Sign in failed' });
  }
});

// GET /api/auth/profile - Get user profile
router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [req.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = result.rows[0];
      
      // Remove sensitive data
      delete user.password;
      delete user.verification_token;
      delete user.reset_password_token;

      res.json({ user });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PATCH /api/auth/profile - Update user profile
router.patch('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body;
    
    // Remove fields that shouldn't be updated this way
    delete updates.id;
    delete updates.email;
    delete updates.password;
    delete updates.email_verified;
    delete updates.verification_token;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const client = await pool.connect();
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      Object.entries(updates).forEach(([key, value]) => {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      });

      values.push(req.userId);

      const query = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;
      const result = await client.query(query, values);

      const user = result.rows[0];
      delete user.password;
      delete user.verification_token;
      delete user.reset_password_token;

      res.json({
        message: 'Profile updated successfully',
        user
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, name FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      // Always return success to prevent email enumeration
      if (result.rows.length === 0) {
        return res.json({
          message: 'If an account exists with this email, a password reset link has been sent.'
        });
      }

      const user = result.rows[0];

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await client.query(
        'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
        [resetToken, resetExpires, user.id]
      );

      // Send password reset email
      await sendPasswordResetEmail(user.email, resetToken, user.name);

      res.json({
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, reset_password_expires FROM users WHERE reset_password_token = $1',
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      const user = result.rows[0];

      // Check if token expired
      if (new Date() > new Date(user.reset_password_expires)) {
        return res.status(400).json({ error: 'Reset token has expired' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update password and clear reset token
      await client.query(
        `UPDATE users 
         SET password = $1, 
             reset_password_token = NULL, 
             reset_password_expires = NULL 
         WHERE id = $2`,
        [hashedPassword, user.id]
      );

      res.json({
        message: 'Password reset successful. You can now sign in with your new password.'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
