## 📁 Complete Project Structure

```
pano-app/
├── .env.local.example              # Environment variables template
├── .github/                        # GitHub Actions and workflows
│   └── workflows/
│       └── ci.yml                  # Continuous integration configuration
├── .gitignore                      # Git ignore rules
├── .husky/                         # Git hooks configuration
│   └── _/                          # Husky internal files
├── README.md                       # This file
├── next.config.js                  # Next.js configuration (root)
├── package.json                    # Dependencies and npm scripts
├── tsconfig.json                   # TypeScript configuration (root)
│
├── config/                         # 🔧 Configuration Files
│   ├── .eslintrc.json             # ESLint configuration
│   ├── .lighthouserc.json         # Lighthouse CI performance testing configuration
│   ├── .lintstagedrc.json         # Lint-staged configuration
│   ├── .prettierignore            # Prettier ignore rules
│   ├── .prettierrc.json           # Prettier code formatting rules
│   ├── electron-builder.json      # Electron app builder configuration
│   ├── eslint.config.mjs          # Modern ESLint configuration
│   ├── jest.config.js             # Jest testing framework configuration
│   ├── next.config.js             # Next.js build and runtime configuration
│   ├── next.config.production.js  # Production-specific Next.js config
│   ├── postcss.config.mjs         # PostCSS configuration for CSS processing
│   └── tsconfig.json              # TypeScript compiler configuration
│
├── data/                           # Application data
│   └── credential-config.json     # Credential configuration
│
├── desktop/                        # Electron desktop application files
│   ├── copy-test-project-to-production.js  # Production deployment script
│   ├── file-server.js             # Local file server for desktop app
│   ├── main.js                    # Electron main process
│   ├── preload.js                 # Electron preload script
│   └── server.js                  # Desktop application server
│
├── docs/                           # 📚 Documentation
│   ├── CONFIGURATION.md           # Configuration guide and options
│   ├── INDEX.md                   # Documentation index
│   ├── README.md                  # Setup and installation instructions
│   ├── SCRIPTS_DOCUMENTATION.md   # Detailed scripts documentation
│   ├── TROUBLESHOOTING.md         # Common issues and solutions
│   ├── authentication/            # Authentication documentation
│   │   ├── AUTHENTICATION.md      # General authentication guide
│   │   └── SUPABASE_AUTH.md       # Supabase authentication setup
│   └── development/               # Development guides
│       ├── BUILD_GUIDE.md         # Build process documentation
│       ├── CENTRALIZED_CREDENTIALS_IMPLEMENTATION.md  # Credentials system
│       ├── ELECTRON_BUILD_GUIDE.md # Electron build instructions
│       └── POI_IMPLEMENTATION_GUIDE.md  # Point of Interest system guide
│
├── public/                         # Static assets
│   ├── assets/                    # Media assets
│   │   ├── images/                # Sample images
│   │   │   ├── carl-wang-lsxADNRNmc8-unsplash (2).jpg
│   │   │   ├── everaldo-coelho-2tigIl6Tt7E-unsplash.jpg
│   │   │   ├── javier-miranda-NOBHX-kLLvc-unsplash.jpg
│   │   │   └── nasa-Q1p7bh3SHj8-unsplash.jpg
│   │   └── svg/                   # SVG graphics
│   │       ├── 42488officebuilding_98969.png
│   │       ├── boomerang.svg
│   │       └── primezone-logo.svg
│   ├── icon.svg                   # Application icon
│   └── panorama-viewer-icon.png   # Panorama viewer icon
│
├── scripts/                        # 🛠️ Build and Utility Scripts
│   ├── build-electron-packager.js # Electron application packaging script
│   ├── fix-standalone-asar.js     # ASAR archive issues in standalone builds
│   ├── install-packaged-deps.js   # Install dependencies for packaged app
│   ├── install-standalone-deps.js # Install dependencies for standalone app
│   ├── node/                      # Node.js utility scripts
│   │   ├── README.md              # Node scripts documentation
│   │   ├── calculate-north-offsets.js  # Calculate panorama north offsets
│   │   ├── cleanup-temp.js        # Clean temporary files
│   │   ├── copy-public.js         # Copy public assets
│   │   ├── generate-config.js     # Generate panorama configuration
│   │   └── generate-marzipano-config.js  # Generate Marzipano-specific config
│   ├── server-production.js       # Production server script
│   ├── test-credentials.js        # Test credential configuration
│   └── verify-build-contents.js   # Verify build output contents
│
├── src/                            # Source code
│   ├── components/                # React components
│   │   ├── hotspot/               # Hotspot components
│   │   │   ├── Hotspot.module.css
│   │   │   ├── Hotspot.tsx
│   │   │   └── __tests__/
│   │   │       └── Hotspot.test.tsx
│   │   ├── poi/                   # Point of Interest system
│   │   │   ├── POIComponent.module.css
│   │   │   ├── POIComponent.tsx
│   │   │   ├── POIContextMenu.module.css
│   │   │   ├── POIContextMenu.tsx
│   │   │   ├── POIFileManager.tsx
│   │   │   ├── POIModal.module.css
│   │   │   ├── POIModal.tsx
│   │   │   ├── POIPreview.module.css
│   │   │   ├── POIPreview.tsx
│   │   │   ├── README.md
│   │   │   ├── __tests__/
│   │   │   │   └── POIComponent.test.tsx
│   │   │   └── utils.ts
│   │   ├── ui/                    # User interface components
│   │   │   ├── ConfirmationModal.module.css
│   │   │   ├── ConfirmationModal.tsx
│   │   │   ├── ControlButton.tsx
│   │   │   ├── ControlPanel.module.css
│   │   │   ├── ControlPanel.tsx
│   │   │   ├── Logo.module.css
│   │   │   ├── Logo.tsx
│   │   │   ├── LogoutButton.module.css
│   │   │   ├── LogoutButton.tsx
│   │   │   ├── README.md
│   │   │   ├── icons/
│   │   │   │   ├── ControlPanelIcons.tsx
│   │   │   │   └── index.ts
│   │   │   ├── index.ts
│   │   │   └── panels/
│   │   │       ├── FloorSelectorPanel.tsx
│   │   │       ├── POIManagementPanel.tsx
│   │   │       ├── PerformanceMonitorPanel.tsx
│   │   │       ├── ProjectsPanel.tsx
│   │   │       └── index.ts
│   │   ├── utility/               # Utility components
│   │   │   ├── LoadingScreen.module.css
│   │   │   └── LoadingScreen.tsx
│   │   └── viewer/                # Panorama viewer components
│   │       ├── ControlsHint.tsx
│   │       ├── HotspotRenderer.tsx
│   │       ├── MiniMap.module.css
│   │       ├── MiniMap.tsx
│   │       ├── PanoramaContainer.tsx
│   │       ├── PanoramaLogo.tsx
│   │       ├── PanoramaViewer.tsx
│   │       └── TapHint.tsx
│   ├── contexts/                  # React contexts
│   │   ├── AuthContext.tsx
│   │   └── PanoramaContext.tsx
│   ├── hooks/                     # Custom React hooks
│   │   ├── useFileManager.ts
│   │   ├── useFloorSelector.ts
│   │   ├── useHotspotManager.ts
│   │   ├── useNavigation.ts
│   │   ├── usePanelState.ts
│   │   ├── usePanoramaManager.ts
│   │   ├── usePanoramaViewer.ts
│   │   ├── usePerformanceManager.ts
│   │   ├── usePerformanceMonitor.ts
│   │   ├── useProjectManager.ts
│   │   ├── useProjectsManager.ts
│   │   ├── useSceneManager.ts
│   │   ├── useUploadState.ts
│   │   ├── useValidation.ts
│   │   └── useViewerEvents.ts
│   ├── lib/                       # Utility libraries
│   │   ├── __tests__/
│   │   │   └── config.test.ts
│   │   ├── config.ts
│   │   ├── marzipano.js
│   │   ├── sceneConfig.ts
│   │   └── supabase.ts
│   ├── middleware.ts              # Next.js middleware
│   ├── pages/                     # Next.js pages
│   │   ├── [projectId]/           # Dynamic project pages
│   │   │   ├── [sceneId].tsx
│   │   │   └── index.tsx
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   ├── admin/                 # Admin pages
│   │   │   └── users.tsx
│   │   ├── api/                   # API routes
│   │   │   ├── admin/
│   │   │   │   ├── config-status.ts
│   │   │   │   └── users.ts
│   │   │   ├── auth/
│   │   │   │   ├── login.ts
│   │   │   │   ├── logout.ts
│   │   │   │   ├── register.ts
│   │   │   │   ├── setup.ts
│   │   │   │   └── status.ts
│   │   │   ├── files/
│   │   │   │   └── [...path].ts
│   │   │   ├── poi/
│   │   │   │   ├── delete-files.ts
│   │   │   │   ├── delete.ts
│   │   │   │   ├── export-all.ts
│   │   │   │   ├── export-single.ts
│   │   │   │   ├── import-single.ts
│   │   │   │   ├── load-individual.ts
│   │   │   │   ├── load.ts
│   │   │   │   ├── save-individual.ts
│   │   │   │   ├── save.ts
│   │   │   │   ├── scene-counts.ts
│   │   │   │   ├── update.ts
│   │   │   │   ├── upload-multiple.ts
│   │   │   │   └── upload.ts
│   │   │   ├── projects/
│   │   │   │   └── [projectId]/
│   │   │   ├── projects.ts
│   │   │   ├── scenes/
│   │   │   └── upload/
│   │   ├── auth/                  # Authentication pages
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── setup.tsx
│   │   ├── index.tsx
│   │   ├── poi-management.tsx
│   │   └── upload.tsx
│   ├── styles/                    # CSS modules and global styles
│   │   ├── Admin.module.css
│   │   ├── Auth.module.css
│   │   ├── MiniMap.module.css
│   │   ├── POIManagement.module.css
│   │   ├── POIManagementPanel.module.css
│   │   ├── ProjectsPanel.module.css
│   │   ├── Upload.module.css
│   │   ├── Welcome.module.css
│   │   └── globals.css
│   ├── types/                     # TypeScript type definitions
│   │   ├── config.ts
│   │   ├── marzipano.d.ts
│   │   ├── poi.ts
│   │   └── scenes.ts
│   └── utils/                     # Utility functions
│       ├── fileHelpers.ts
│       ├── panoramaUtils.ts
│       └── testingUtils.ts
│
├── tests/                          # Test configuration
│   └── jest.setup.js
└── tsconfig.json                   # TypeScript configuration
```

## 🔧 Configuration Files Detailed (`config/` folder)

The `config/` directory contains all configuration files for different tools and frameworks:

- **`.eslintrc.json`** - ESLint linting rules and configuration
- **`.lighthouserc.json`** - Lighthouse CI performance testing configuration
- **`.lintstagedrc.json`** - Lint-staged configuration for pre-commit hooks
- **`.prettierignore`** - Files and patterns to ignore during code formatting
- **`.prettierrc.json`** - Prettier code formatting rules and options
- **`electron-builder.json`** - Electron application packaging and distribution settings
- **`eslint.config.mjs`** - Modern ESLint configuration using ES modules
- **`jest.config.js`** - Jest testing framework configuration and test environment setup
- **`next.config.js`** - Next.js build configuration, webpack settings, and runtime options
- **`next.config.production.js`** - Production-specific Next.js configuration overrides
- **`postcss.config.mjs`** - PostCSS configuration for CSS processing and transformations
- **`tsconfig.json`** - TypeScript compiler options and project settings

## 🛠️ Scripts Detailed (`scripts/` folder)

The `scripts/` directory contains build tools and utility scripts:

### Main Scripts
- **`build-electron-packager.js`** - Packages the application into an Electron desktop app
- **`fix-standalone-asar.js`** - Fixes ASAR archive issues in standalone builds
- **`install-packaged-deps.js`** - Installs dependencies for packaged applications
- **`install-standalone-deps.js`** - Installs dependencies for standalone applications
- **`server-production.js`** - Production server configuration and startup
- **`test-credentials.js`** - Tests and validates credential configurations
- **`verify-build-contents.js`** - Verifies the integrity and completeness of build outputs

### Node.js Utilities (`scripts/node/`)
- **`README.md`** - Documentation for Node.js scripts
- **`calculate-north-offsets.js`** - Calculates north direction offsets for panorama orientation
- **`cleanup-temp.js`** - Removes temporary files and cleans up build artifacts
- **`copy-public.js`** - Copies public assets to appropriate build directories
- **`generate-config.js`** - Generates panorama configuration from CSV data
- **`generate-marzipano-config.js`** - Creates Marzipano-specific configuration files

## 📚 Documentation Detailed (`docs/` folder)

The `docs/` directory contains comprehensive project documentation:

### Main Documentation
- **`CONFIGURATION.md`** - Detailed configuration options and environment variables
- **`INDEX.md`** - Documentation index and navigation guide
- **`README.md`** - Setup and installation guide
- **`SCRIPTS_DOCUMENTATION.md`** - Comprehensive documentation of all build scripts
- **`TROUBLESHOOTING.md`** - Common issues, solutions, and debugging guides

### Authentication Documentation (`docs/authentication/`)
- **`AUTHENTICATION.md`** - General authentication system overview and implementation
- **`SUPABASE_AUTH.md`** - Supabase authentication setup and configuration guide

### Development Documentation (`docs/development/`)
- **`BUILD_GUIDE.md`** - Step-by-step build process documentation
- **`CENTRALIZED_CREDENTIALS_IMPLEMENTATION.md`** - Centralized credentials system implementation guide
- **`ELECTRON_BUILD_GUIDE.md`** - Electron desktop application build instructions
- **`POI_IMPLEMENTATION_GUIDE.md`** - Point of Interest system implementation and usage guide