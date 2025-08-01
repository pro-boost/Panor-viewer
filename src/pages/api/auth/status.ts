import { NextApiRequest, NextApiResponse } from 'next';
import { supabase, userService, isSupabaseConfigured } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isSupabaseConfigured()) {
    return res.status(200).json({ 
      authenticated: false, 
      configured: false,
      requiresSetup: true
    });
  }

  try {
    const accessToken = req.cookies['supabase-access-token'];
    const refreshToken = req.cookies['supabase-refresh-token'];
    
    if (!accessToken) {
      return res.status(200).json({ 
        authenticated: false, 
        configured: true,
        requiresSetup: false
      });
    }

    // Set the session in Supabase client
    const { data: { user }, error } = await supabase().auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || ''
    });

    if (error || !user) {
      return res.status(200).json({ 
        authenticated: false, 
        configured: true,
        requiresSetup: false
      });
    }

    // Get user profile from Supabase
    const profile = await userService.getUserProfile(user.id);
    
    // Check if user is approved
    if (!profile || !profile.approved) {
      return res.status(200).json({ 
        authenticated: false, 
        configured: true,
        requiresSetup: false,
        error: 'Account pending approval'
      });
    }
    
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
    console.error('Auth status error:', error);
    res.status(200).json({ 
      authenticated: false, 
      configured: true,
      requiresSetup: false
    });
  }
}