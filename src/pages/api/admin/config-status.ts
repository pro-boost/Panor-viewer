// API endpoint to check Supabase configuration status
// This is needed because environment variables are embedded at build time in Next.js
// but the desktop app sets them at runtime

import { NextApiRequest, NextApiResponse } from 'next'
import { isSupabaseConfigured } from '@/lib/supabase'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const configured = isSupabaseConfigured()
    
    res.status(200).json({
      configured,
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error checking Supabase configuration:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}