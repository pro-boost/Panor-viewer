# Authentication Troubleshooting Guide

This guide helps resolve authentication issues in the Panorama Viewer application, particularly the "internal server error" that can occur on client machines.

## Common Issues

### 1. Internal Server Error on Client Machines

**Symptoms:**

- App works fine on developer machine
- Client gets "internal server error" when trying to log in
- Fresh installations fail to authenticate

**Root Cause:**
The developer machine has persistent authentication cookies from previous logins, while the client machine starts fresh without any stored session data.

**Solutions:**

#### Option A: Clear Electron App Data (Recommended for Testing)

```bash
# Clear all authentication data only (preserves other settings)
npm run clear-electron-auth

# Or clear all app data
npm run clear-electron-data

# Or run directly
node scripts/clear-electron-data.js --auth
node scripts/clear-electron-data.js
```

#### Option B: Manual Data Clearing

**Windows:**

```
C:\Users\[USERNAME]\AppData\Roaming\Advanced Panorama Viewer
```

**macOS:**

```
~/Library/Application Support/Advanced Panorama Viewer
```

**Linux:**

```
~/.config/Advanced Panorama Viewer
```

Delete the entire folder or specific files:

- `Cookies` - Authentication cookies
- `Session Storage` - Session data
- `Local Storage` - Local storage data

### 2. Credential Server Issues

**Symptoms:**

- "Failed to fetch credentials" errors
- Connection timeouts
- Network-related authentication failures

**Solutions:**

1. **Verify Credential Server:**

   ```bash
   # Test if the credential server is accessible
   curl -s https://your-credential-server.vercel.app/api/credentials
   ```

2. **Check Network Configuration:**
   - Ensure firewall allows outbound HTTPS connections
   - Verify proxy settings if applicable
   - Check DNS resolution

3. **Review Enhanced Server Logs:**
   The app uses an Enhanced Server Manager with improved error handling. Check console output for detailed error messages.

### 3. Supabase Configuration Issues

**Symptoms:**

- "Supabase not configured" errors
- Invalid session errors
- Profile not found errors

**Solutions:**

1. **Verify Configuration:**

   ```bash
   # Check if setup endpoint is accessible
   curl -s http://localhost:3000/api/auth/setup
   ```

2. **Check credential-config.json:**
   Ensure the file exists and contains valid Supabase credentials:
   ```json
   {
     "supabaseUrl": "https://your-project.supabase.co",
     "supabaseAnonKey": "your-anon-key"
   }
   ```

## Enhanced Error Handling

The application now includes improved error handling with specific error codes:

### Authentication Error Codes

- `AUTH_FAILED` - Invalid email/password combination
- `PROFILE_NOT_FOUND` - User profile doesn't exist in database
- `ACCOUNT_PENDING_APPROVAL` - User account requires admin approval
- `INVALID_CREDENTIALS` - Malformed or missing credentials
- `EMAIL_NOT_CONFIRMED` - Email address not verified
- `RATE_LIMITED` - Too many login attempts
- `SERVICE_UNAVAILABLE` - Supabase service unavailable
- `SUPABASE_CONFIG_ERROR` - Supabase configuration issues
- `SETUP_FAILED` - Initial setup process failed
- `INTERNAL_SERVER_ERROR` - Unexpected server error

### Debugging Steps

1. **Check Browser/Electron Console:**
   - Open Developer Tools (F12)
   - Look for detailed error messages with error codes
   - Check Network tab for failed requests

2. **Review Server Logs:**
   - Authentication attempts are now logged with detailed information
   - Error messages include stack traces in development mode
   - Network errors are logged separately from authentication errors

3. **Test API Endpoints Directly:**

   ```bash
   # Test setup endpoint
   curl -X GET http://localhost:3000/api/auth/setup

   # Test status endpoint
   curl -X GET http://localhost:3000/api/auth/status

   # Test login endpoint
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

## Prevention

### For Developers

1. **Test with Fresh Environment:**

   ```bash
   # Clear your local data before testing
   npm run clear-electron-auth
   ```

2. **Verify Build Configuration:**
   - Ensure `credential-config.json` is included in builds
   - Test the built application, not just development mode
   - Verify all environment variables are properly set

3. **Add Comprehensive Error Handling:**
   - Use the enhanced error codes in your UI
   - Provide user-friendly error messages
   - Log detailed errors for debugging

### For Deployment

1. **Include Diagnostic Tools:**
   - Ship with diagnostic scripts for troubleshooting
   - Include clear documentation for common issues
   - Provide easy data clearing options

2. **Validate Configuration:**
   - Test credential server accessibility
   - Verify Supabase configuration
   - Ensure all required files are included

## Build Issues

### ENOENT Error with Darwin Packages (Windows)

If you encounter an error like:

```
ENOENT: no such file or directory, scandir 'node_modules/@next/swc-darwin-arm64'
```

This happens because Next.js references macOS packages in package-lock.json that don't exist on Windows. The build process now automatically fixes this, but if needed, you can run manually:

```bash
# Fix darwin package directories
node scripts/fix-darwin-packages.js
```

## Quick Reference

### Diagnostic Commands

```bash
# Check authentication status
curl -s http://localhost:3000/api/auth/setup

# Clear authentication data only
npm run clear-electron-auth

# Clear all Electron app data
npm run clear-electron-data

# Test credential server
node scripts/test-credentials.js

# Check Enhanced Server
node scripts/test-enhanced-server.js

# Diagnose Electron credentials
node scripts/diagnose-electron-credentials.js

# Fix darwin package build issues (Windows)
node scripts/fix-darwin-packages.js
```

## Support

If issues persist after following this guide:

1. Clear all app data and test with a fresh environment
2. Check the console for specific error codes
3. Verify network connectivity and credential server accessibility
4. Review the Enhanced Server Manager logs for detailed error information
5. Test API endpoints directly to isolate the issue

For additional support, provide:

- Operating system and version
- Error codes from console logs
- Network configuration details
- Steps to reproduce the issue
