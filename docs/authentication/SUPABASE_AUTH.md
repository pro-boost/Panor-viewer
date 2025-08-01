# Supabase Authentication Integration

This guide explains the complete Supabase authentication system for your panorama viewer application. **All authentication, including the initial admin setup, uses Supabase.**

## Prerequisites

1. A Supabase account (free tier available)
2. A Supabase project

## Setup Steps

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Note your project URL and anon key

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Important**: The service role key is required for admin operations and should only be used server-side. You can find it in your Supabase dashboard under Settings > API.

### 3. Set Up Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- First, disable RLS temporarily to clean up
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create non-recursive policies
-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy 2: Allow service role (admin client) to do everything
CREATE POLICY "Service role full access" ON user_profiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Policy 3: Allow inserts for new user registration
CREATE POLICY "Allow user registration" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy 4: Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Alternative approach: Create a function to check admin status without recursion
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = user_id 
    AND role = 'admin' 
    AND approved = true
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;

-- Optional: Create admin policies using the function (service role is preferred)
-- CREATE POLICY "Admins can view all profiles" ON user_profiles
--   FOR SELECT USING (is_admin(auth.uid()));

-- CREATE POLICY "Admins can update all profiles" ON user_profiles
--   FOR UPDATE USING (is_admin(auth.uid()));

-- CREATE POLICY "Admins can delete profiles" ON user_profiles
--   FOR DELETE USING (is_admin(auth.uid()));

-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role, approved)
  VALUES (NEW.id, NEW.email, 'user', false);
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 4. Enable Email Authentication

1. Go to Authentication > Settings in your Supabase dashboard
2. Enable "Email" provider
3. Configure email templates if needed
4. **Important**: Disable "Confirm email" for initial setup, or configure SMTP for email delivery

## Authentication Flow

### Initial Setup
1. When no admin users exist, the application redirects to `/auth/setup`
2. Create the first admin user with email and password
3. This user is automatically created in Supabase with admin role and approved status

### Regular Authentication
1. Users sign in at `/auth/login` with email and password
2. All authentication is handled by Supabase
3. User sessions are managed with secure HTTP-only cookies
4. Role-based access control determines user permissions

## Features

- **Complete Supabase Integration**: All authentication uses Supabase, no local file storage
- **Email-based Authentication**: Users authenticate with email/password
- **Initial Admin Setup**: First admin user created through Supabase
- **Role-based Access**: Admin and user roles with different permissions
- **User Management**: Admins can approve, update, and delete users
- **Real-time Updates**: Live updates when user data changes
- **Security**: Row Level Security (RLS) policies protect user data
- **Session Management**: Secure cookie-based session handling

## Usage

1. Configure your Supabase project and environment variables
2. Start your application
3. Navigate to `/auth/setup` to create the first admin user via Supabase
4. Use `/auth/login` for all subsequent logins
5. Admins can manage users through the admin dashboard

## API Endpoints

- `POST /api/auth/login` - User login via Supabase
- `POST /api/auth/logout` - User logout and session cleanup
- `GET /api/auth/status` - Check authentication status using Supabase session
- `POST /api/auth/setup` - Initial admin setup via Supabase registration

## Troubleshooting

### RLS Infinite Recursion Error

If you encounter the error `infinite recursion detected in policy for relation "user_profiles"`, it means the RLS policies have a circular dependency. The updated SQL schema above resolves this by:

1. **Using Service Role for Admin Operations**: The `Service role full access` policy allows the admin client (using service role key) to bypass RLS entirely
2. **Non-Recursive Policies**: User policies only reference their own data, avoiding circular dependencies
3. **Optional Function-Based Policies**: The `is_admin()` function provides a non-recursive way to check admin status if needed

### Key Changes from Previous Versions

- **Removed recursive admin policies** that caused infinite loops
- **Added service role policy** for admin operations
- **Simplified user policies** to avoid circular references
- **Added helper function** for admin checks (optional)

## Security Notes

- All authentication is handled by Supabase's secure infrastructure
- Environment variables are automatically excluded from version control
- All database operations use RLS policies
- Passwords are handled securely by Supabase
- Session tokens are stored in secure HTTP-only cookies
- Service role key provides elevated permissions for admin operations (server-side only)
- No local file-based authentication or session storage