import { NextApiRequest, NextApiResponse } from 'next';
import { authHelpers, userService } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await authHelpers.signIn(email, password)
    const { user, session } = result;

    if (!user || !session) {
      console.error('Login failed: No user or session returned', { email, hasUser: !!user, hasSession: !!session });
      return res.status(401).json({ 
        error: 'Invalid email or password',
        code: 'AUTH_FAILED'
      });
    }

    // Check if user is approved
    const profile = await userService.getUserProfile(user.id);
    if (!profile) {
      console.error('Login failed: User profile not found', { userId: user.id, email });
      return res.status(403).json({ 
        error: 'User profile not found. Please contact an administrator.',
        code: 'PROFILE_NOT_FOUND'
      });
    }
    
    if (!profile.approved) {
      console.warn('Login blocked: User not approved', { userId: user.id, email, role: profile.role });
      return res.status(403).json({ 
        error: 'Account pending approval. Please contact an administrator.',
        code: 'ACCOUNT_PENDING_APPROVAL'
      });
    }

    // Set session cookies
    const isProduction = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', [
      `supabase-access-token=${session.access_token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict${isProduction ? '; Secure' : ''}`,
      `supabase-refresh-token=${session.refresh_token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict${isProduction ? '; Secure' : ''}`
    ]);

    console.log('Login successful', { userId: user.id, email, role: profile.role });
    res.status(200).json({ 
      user: {
        id: user.id,
        email: user.email,
        role: profile.role
      }
    });
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      code: error.code,
      status: error.status,
      email,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    // Handle specific Supabase errors
    if (error.message?.includes('Invalid login credentials')) {
      return res.status(401).json({ 
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    if (error.message?.includes('Email not confirmed')) {
      return res.status(401).json({ 
        error: 'Please confirm your email address before logging in',
        code: 'EMAIL_NOT_CONFIRMED'
      });
    }
    
    if (error.message?.includes('Too many requests')) {
      return res.status(429).json({ 
        error: 'Too many login attempts. Please try again later.',
        code: 'RATE_LIMITED'
      });
    }
    
    // Network or configuration errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return res.status(503).json({ 
        error: 'Authentication service temporarily unavailable. Please try again.',
        code: 'SERVICE_UNAVAILABLE'
      });
    }
    
    // Generic server error
    res.status(500).json({ 
      error: 'Authentication failed due to a server error. Please try again.',
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}