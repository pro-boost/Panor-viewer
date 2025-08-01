// Supabase client configuration
// This file provides the setup for integrating Supabase authentication

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

// Singleton pattern to prevent multiple instances
let supabaseInstance: SupabaseClient | null = null
let supabaseAdminInstance: SupabaseClient | null = null

// Create Supabase client with lazy singleton pattern
function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    })
  }
  return supabaseInstance
}

// Create admin client for server-side operations with elevated permissions
function getSupabaseAdminClient(): SupabaseClient {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  return supabaseAdminInstance
}

// Export the clients using lazy initialization
export const supabase = (() => {
  let instance: SupabaseClient | null = null
  return () => {
    if (!instance) {
      instance = getSupabaseClient()
    }
    return instance
  }
})()

export const supabaseAdmin = (() => {
  let instance: SupabaseClient | null = null
  return () => {
    if (!instance) {
      instance = getSupabaseAdminClient()
    }
    return instance
  }
})()

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Database types for TypeScript
export interface UserProfile {
  id: string
  email: string
  role: 'admin' | 'user'
  approved: boolean
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}

// User management functions
export const userService = {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase()
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    console.log('getUserProfile result:', { userId, data, error });
    
    if (error) return null
    return data
  },

  async createUserProfile(userId: string, email: string): Promise<boolean> {
    const { error } = await supabaseAdmin()
      .from('user_profiles')
      .insert({
        id: userId,
        email,
        role: 'user',
        approved: false
      })
    
    return !error
  },

  async createAdminProfile(userId: string, email: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin()
      .from('user_profiles')
      .insert({
        id: userId,
        email,
        role: 'admin',
        approved: true
      })
    
    if (error) {
      console.error('Error creating admin profile:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
    }
    
    return !error
  },

  async getAllUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabaseAdmin()
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    return error ? [] : data || []
  },

  async approveUser(userId: string): Promise<boolean> {
    const { error } = await supabaseAdmin()
      .from('user_profiles')
      .update({ approved: true })
      .eq('id', userId)
    
    return !error
  },

  async updateUserRole(userId: string, role: 'admin' | 'user'): Promise<boolean> {
    const updateData: any = { role };
    
    // Auto-approve admin users
    if (role === 'admin') {
      updateData.approved = true;
    }
    
    const { error } = await supabaseAdmin()
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
    
    return !error
  },

  async updateUserStatus(userId: string, approved: boolean): Promise<boolean> {
    const { error } = await supabaseAdmin()
      .from('user_profiles')
      .update({ approved })
      .eq('id', userId)
    
    return !error
  },

  async deleteUser(userId: string): Promise<boolean> {
    const { error: authError } = await supabaseAdmin().auth.admin.deleteUser(userId)
    if (authError) return false
    
    const { error: profileError } = await supabaseAdmin()
      .from('user_profiles')
      .delete()
      .eq('id', userId)
    
    return !profileError
  },

  async getPendingUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabaseAdmin()
      .from('user_profiles')
      .select('*')
      .eq('approved', false)
      .order('created_at', { ascending: false })
    
    return error ? [] : data || []
  }
}

// Real-time user changes subscription
export const subscribeToUserChanges = (callback: (payload: any) => void) => {
  return supabase()
    .channel('user_profiles_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'user_profiles'
    }, callback)
    .subscribe()
}

// Authentication helpers
export const authHelpers = {
  // Sign up new user
  async signUp(email: string, password: string) {
    const { data, error } = await supabase().auth.signUp({
      email,
      password
    })
    
    if (error) {
      throw error
    }
    
    return data
  },

  // Sign in user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase().auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      throw error
    }
    
    return data
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase().auth.signOut()
    
    if (error) {
      throw error
    }
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase().auth.getSession()
    
    if (error) {
      throw error
    }
    
    return session
  },

  async resetPassword(email: string) {
    const { error } = await supabase().auth.resetPasswordForEmail(email)
    if (error) throw error
  }
}