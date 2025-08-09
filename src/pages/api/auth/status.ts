import { NextApiRequest, NextApiResponse } from 'next';
import { supabase, userService, isSupabaseConfigured } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isSupabaseConfigured()) {
    console.warn('Auth status check: Supabase not configured');
    return res.status(200).json({ 
      authenticated: false, 
      configured: false,
      requiresSetup: true,
      error: 'Authentication service not configured'
    });
  }

  try {
    const accessToken = req.cookies['supabase-access-token'];
    const refreshToken = req.cookies['supabase-refresh-token'];
    
    if (!accessToken) {
      console.log('Auth status check: No access token found');
      return res.status(200).json({ 
        authenticated: false, 
        configured: true,
        requiresSetup: false,
        reason: 'No authentication token'
      });
    }

    // Set the session in Supabase client
    const { data: { user }, error } = await supabase().auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || ''
    });

    if (error || !user) {
      console.warn('Auth status check: Session validation failed', {
        hasError: !!error,
        errorMessage: error?.message,
        hasUser: !!user
      });
      return res.status(200).json({ 
        authenticated: false, 
        configured: true,
        requiresSetup: false,
        reason: error?.message || 'Invalid session'
      });
    }

    // Get user profile from Supabase
    const profile = await userService.getUserProfile(user.id);
    
    // Check if user is approved
    if (!profile) {
      console.error('Auth status check: User profile not found', { userId: user.id, email: user.email });
      return res.status(200).json({ 
        authenticated: false, 
        configured: true,
        requiresSetup: false,
        error: 'User profile not found',
        code: 'PROFILE_NOT_FOUND'
      });
    }
    
    if (!profile.approved) {
      console.warn('Auth status check: User not approved', { userId: user.id, email: user.email, role: profile.role });
      return res.status(200).json({ 
        authenticated: false, 
        configured: true,
        requiresSetup: false,
        error: 'Account pending approval',
        code: 'ACCOUNT_PENDING_APPROVAL'
      });
    }
    
    console.log('Auth status check: User authenticated', { userId: user.id, email: user.email, role: profile.role });
    res.status(200).json({ 
      authenticated: true, 
      configured: true,
      requiresSetup: false,
      user: {
        email: user.email,
        id: user.id,
        role: profile.role
      }
    });
  } catch (error) {
    console.error('Auth status error:', {
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    // Handle specific errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return res.status(200).json({ 
        authenticated: false, 
        configured: true,
        requiresSetup: false,
        error: 'Authentication service temporarily unavailable',
        code: 'SERVICE_UNAVAILABLE'
      });
    }
    
    res.status(200).json({ 
      authenticated: false, 
      configured: true,
      requiresSetup: false,
      error: 'Authentication check failed',
      code: 'AUTH_CHECK_FAILED',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}