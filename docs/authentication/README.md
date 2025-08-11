# Authentication Documentation

This folder contains all documentation related to authentication, security, and user management in the panorama viewer application.

## Files in this folder:

### AUTHENTICATION.md

**Purpose**: Comprehensive guide to the authentication system
**Contents**:

- Password-based authentication with bcrypt hashing
- Session-based authentication with configurable timeout
- IP-based login attempt tracking and lockout protection
- Protected and public routes
- Initial setup instructions

### SUPABASE_AUTH.md

**Purpose**: Supabase integration guide for authentication
**Contents**:

- Supabase project setup instructions
- Environment variable configuration
- User management and role-based access
- Database schema and operations
- Integration with the panorama viewer

## Quick Start

1. **First-time setup**: Start with `SUPABASE_AUTH.md` to set up your Supabase project
2. **Authentication features**: Read `AUTHENTICATION.md` to understand the security features
3. **Troubleshooting**: Check the main troubleshooting guide if you encounter issues

## Security Features

- 🔐 Secure password hashing with bcrypt
- 🛡️ Session-based authentication
- 🚫 IP-based lockout protection
- 🔒 Protected API endpoints
- 👤 User role management
- 🍪 Secure cookie-based sessions

For implementation details and code examples, refer to the individual documentation files.
