# Development Documentation

This folder contains documentation specifically for developers working on the panorama viewer application, including implementation guides, architecture details, and development history.

## Files in this folder:

### FIXES_AND_IMPROVEMENTS.md
**Purpose**: Complete development history and changelog
**Contents**:
- Major improvements and enhancements
- Bug fixes and their solutions
- Performance optimizations
- Testing and quality improvements
- Code architecture changes
- Hook architecture and context providers

### POI_IMPLEMENTATION_GUIDE.md
**Purpose**: Point of Interest (POI) system implementation
**Contents**:
- POI system components and architecture
- Implementation details and code structure
- Usage instructions and API reference
- File structure and data formats
- Integration with the panorama viewer

### CENTRALIZED_CREDENTIALS_IMPLEMENTATION.md
**Purpose**: Centralized credentials system (COMPLETED)
**Contents**:
- Complete implementation guide
- Architecture overview and flow diagrams
- Security features and caching mechanisms
- Build and deployment instructions
- Current configuration and server details

### SECURE_DISTRIBUTION.md
**Purpose**: Secure Electron app distribution
**Contents**:
- Electron build optimization
- File inclusion/exclusion rules
- Security improvements and ASAR packaging
- Distribution best practices
- Build configuration details

## Development Workflow

1. **New features**: Check existing implementations in these guides before starting
2. **Bug fixes**: Document significant fixes in `FIXES_AND_IMPROVEMENTS.md`
3. **Architecture changes**: Update relevant implementation guides
4. **Security**: Follow patterns established in the credential and distribution guides

## Key Technologies

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Node.js, Supabase
- **Desktop**: Electron
- **3D Viewer**: Marzipano
- **Authentication**: Supabase Auth with custom session management
- **Build**: Electron Builder with custom scripts

## Code Quality Standards

- TypeScript for type safety
- Custom hooks for state management
- Context providers for global state
- Comprehensive error handling
- Performance monitoring and optimization
- Security-first approach

For specific implementation details, refer to the individual documentation files and the source code.