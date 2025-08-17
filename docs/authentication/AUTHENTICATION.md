# Authentication System

This panorama viewer application now includes a comprehensive authentication system to restrict access to authorized users only.

## Features

### 🔐 Secure Authentication

- Password-based authentication with bcrypt hashing
- Session-based authentication with configurable timeout
- IP-based login attempt tracking and lockout protection
- Secure cookie-based session management

### 🛡️ Protected Routes

The following routes are protected and require authentication:

- `/` - Main panorama viewer
- `/upload` - Project upload page
- `/poi-management` - POI management page
- `/api/projects/*` - All project-related API endpoints
- `/api/poi/*` - All POI-related API endpoints

### 🔓 Public Routes

- `/auth/login` - Login page
- `/auth/setup` - Initial setup page
- `/api/auth/*` - Authentication API endpoints

## Initial Setup

1. **First Time Setup**: When you first access the application, you'll be redirected to `/auth/setup`
2. **Create Admin Account**: Set up your admin username and password
3. **Configure Settings**: The system will create default security settings

## Login Process

1. Navigate to `/auth/login`
2. Enter your username and password
3. Upon successful authentication, you'll be redirected to the main application

## Security Features

### Password Requirements

- Minimum 8 characters
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one number
- Must contain at least one special character

### Login Protection

- Maximum 5 failed login attempts per IP address
- 15-minute lockout period after exceeding attempts
- Session timeout after 24 hours of inactivity

### Data Storage

- Authentication configuration stored in `auth-config.json`
- Login attempts tracked in `login-attempts.json`
- All files stored securely in the user data directory

## User Interface

### Authentication Pages

- **Setup Page**: Clean, modern interface for initial account creation
- **Login Page**: Secure login form with validation and error handling
- **Logout Button**: Available on all protected pages in the top-right corner

### User Experience

- Loading states during authentication checks
- Clear error messages for failed attempts
- Automatic redirects for unauthenticated users
- Session persistence across browser sessions

## API Endpoints

### Authentication APIs

- `POST /api/auth/setup` - Initial setup
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/status` - Check authentication status

### Middleware Protection

All protected routes are secured using Next.js middleware that:

- Checks for valid session tokens
- Validates session expiry
- Redirects unauthenticated users to login
- Handles setup flow for new installations

## Configuration

The authentication system uses the following default settings:

- **Session Timeout**: 24 hours
- **Max Login Attempts**: 5 per IP
- **Lockout Duration**: 15 minutes
- **Cookie Security**: HttpOnly, Secure (in production)

## Files Created

### Frontend Components

- `src/contexts/AuthContext.tsx` - Authentication context provider
- `src/components/ui/LogoutButton.tsx` - Logout button component
- `src/pages/auth/login.tsx` - Login page
- `src/pages/auth/setup.tsx` - Setup page
- `src/middleware.ts` - Route protection middleware

### API Routes

- `src/pages/api/auth/login.ts` - Login endpoint
- `src/pages/api/auth/logout.ts` - Logout endpoint
- `src/pages/api/auth/setup.ts` - Setup endpoint
- `src/pages/api/auth/status.ts` - Status endpoint

### Styles

- `src/styles/Auth.module.css` - Authentication page styles
- `src/components/ui/LogoutButton.module.css` - Logout button styles

## Integration

The authentication system has been integrated into:

- Main application (`src/pages/_app.tsx`)
- Home page (`src/pages/index.tsx`)
- Upload page (`src/pages/upload.tsx`)
- POI Management page (`src/pages/poi-management.tsx`)

All pages now include:

- Authentication state checking
- Loading states
- Access denied messages
- Logout functionality

## Security Best Practices

✅ **Implemented**:

- Password hashing with bcrypt
- Session-based authentication
- CSRF protection via SameSite cookies
- Input validation and sanitization
- Rate limiting for login attempts
- Secure cookie configuration

✅ **Recommended for Production**:

- Enable HTTPS
- Configure secure cookie settings
- Regular security audits
- Monitor authentication logs
- Implement additional 2FA if needed

The authentication system provides a solid foundation for securing your panorama viewer application while maintaining a smooth user experience.
