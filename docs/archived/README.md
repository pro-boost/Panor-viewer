# Archived Documentation

This folder contains documentation that has been archived during the documentation cleanup and reorganization.

## Files in this folder:

### CENTRALIZED_CREDENTIALS_GUIDE.md
**Reason for archiving**: This was a general implementation guide that was superseded by the more specific and complete `CENTRALIZED_CREDENTIALS_IMPLEMENTATION.md` file (now in `/development/`). The implementation file contains the actual working configuration and current status, making this general guide redundant.

**Content**: General guide for setting up credential servers, including example code and architecture diagrams.

## Cleanup Summary

During the documentation cleanup on 2025-01-28, the following actions were taken:

1. **Organized documentation into logical folders**:
   - `/authentication/` - Authentication and security-related docs
   - `/development/` - Developer-focused implementation guides
   - `/archived/` - Outdated or redundant documentation

2. **Removed outdated Python references**:
   - Updated installation instructions to remove Python dependencies
   - Removed Python troubleshooting sections
   - Updated script references to point to Node.js alternatives

3. **Consolidated redundant documentation**:
   - Moved duplicate credential guides to archived folder
   - Kept the most current and complete versions in active documentation

4. **Updated cross-references**:
   - Updated INDEX.md to reflect new organization
   - Fixed all internal links to point to new locations
   - Added navigation improvements for better user experience

The goal was to create a cleaner, more organized documentation structure that reflects the current state of the application and removes outdated information that could confuse users.