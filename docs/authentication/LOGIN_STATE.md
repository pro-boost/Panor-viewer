# App Login State Explained

The panorama viewer app uses a **session-based authentication system** with Supabase as the backend. Here's how it works:

### Authentication Flow
1. **Login Process**: When you log in, the app:
   - Sends credentials to `/api/auth/login`
   - Validates against Supabase authentication
   - Checks if your account is approved by an admin
   - Sets two HTTP-only cookies: `supabase-access-token` (1 hour) and `supabase-refresh-token` (7 days)

2. **Session Validation**: Every request to protected routes goes through middleware that:
   - Checks for valid access tokens in cookies
   - Validates JWT token format and expiration
   - Automatically redirects to login if invalid

3. **State Management**: The `AuthContext` manages login state across the app and periodically checks authentication status

### What Causes Automatic Logout

You'll be logged out automatically in these scenarios:

#### Network-Related Logouts
- **WiFi disconnection**: Yes, you'll be logged out when WiFi is turned off
- **Internet connection loss**: Yes, this triggers logout
- **Network timeouts**: Yes, if authentication requests fail

#### Time-Based Logouts
- **Session timeout**: After 24 hours of inactivity (as configured)
- **Token expiration**: Access token expires after 1 hour
- **Refresh token expiration**: After 7 days

#### Security-Related Logouts
- **Invalid/corrupted tokens**: Automatic logout
- **Failed token refresh**: When refresh token can't renew access
- **Account status changes**: If admin revokes approval
- **Manual logout**: When you click logout button

#### Browser-Related Logouts
- **Clearing browser data**: Cookies are deleted
- **Private/incognito mode**: Session doesn't persist
- **Browser restart**: Session persists (cookies remain)

### Offline Capabilities

#### Current Offline Support
The app has **limited offline functionality**:

**What Works Offline**:
- **Viewing already loaded panoramas** (cached in browser)
- **Basic navigation** between cached scenes
- **POI interactions** (if data is cached)
- **Electron app functionality** (desktop version)

**What Doesn't Work Offline**:
- **Initial login** (requires internet connection)
- **Loading new projects** (needs server communication)
- **Uploading content** (requires network)
- **Admin functions** (needs real-time validation)
- **Session refresh** (authentication server required)

#### Offline Mode Configuration
The app includes an offline mode system in `data/credential-config.json`:

```json
{
  "offlineMode": {
    "enabled": true,
    "allowPlaceholders": true,
    "fallbackCredentials": {
      "supabase": {
        "url": "https://placeholder.supabase.co",
        "anonKey": "placeholder-anon-key"
      }
    }
  }
}
```

#### Working Offline After Login

**Partial offline support exists**:

1. **Desktop App (Electron)**: Better offline support as it can cache credentials and run a local server
2. **Web Version**: Limited to browser cache - once you lose connection, you'll eventually be logged out when tokens expire
3. **Cached Content**: Previously loaded panoramas and POIs remain accessible until browser cache is cleared

#### Recommendations for Better Offline Experience

To improve offline functionality after login:

1. **Use the Desktop App**: The Electron version has better offline capabilities
2. **Pre-load Content**: Load all needed panoramas while online
3. **Extend Session Duration**: The current 1-hour access token is quite short for offline use
4. **Local Storage**: Consider implementing local storage for critical data

### Summary

- **Login state** is managed through secure HTTP-only cookies with JWT tokens
- **Network disconnection (WiFi off) will cause logout** when tokens need refresh
- **Limited offline functionality** exists, mainly for viewing cached content
- **Desktop app provides better offline experience** than web version
- **Session expires after 24 hours** of inactivity or when tokens can't be refreshed