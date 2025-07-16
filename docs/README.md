# Panorama Viewer Documentation

This documentation provides comprehensive guides for setting up, configuring, and maintaining the panorama viewer application.

> 📋 **Navigation**: See [INDEX.md](./INDEX.md) for a complete documentation overview and quick navigation guide.

## Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.7 or higher) with numpy *(optional - Node.js scripts available)*
- **Git** (for version control)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd pano-app
   npm install
   ```

2. **Install Python dependencies** *(optional)*:
   ```bash
   pip install numpy
   ```
   *Note: Node.js scripts are available as an alternative to Python scripts*

3. **Generate panorama configuration:**
   ```bash
   npm run generate-config
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run generate-config` | Generate Marzipano configuration |
| `npm run dev:config` | Generate config and start dev server |
| `npm run test:config` | Test coordinate system configurations |
| `npm run clean` | Clean build artifacts and config |

## Project Structure

```
pano-app/
├── docs/                    # Documentation
├── public/
│   ├── assets/js/          # JavaScript assets
│   ├── data/               # Data files
│   │   └── pano-poses.csv  # Panorama position data
│   └── images/             # Panorama images
├── scripts/                # Build and utility scripts
│   └── generate_marzipano_config.py
├── src/
│   ├── components/         # React components
│   ├── lib/               # Utility libraries
│   ├── pages/             # Next.js pages
│   ├── styles/            # CSS styles
│   └── types/             # TypeScript definitions
└── .env.local             # Environment configuration
```

## Configuration

See [Configuration Guide](./CONFIGURATION.md) for detailed configuration options.

## Troubleshooting

See [Troubleshooting Guide](./TROUBLESHOOTING.md) for common issues and solutions.

## Platform-Specific Setup

### Windows
- Ensure Python is in PATH
- Use PowerShell or Command Prompt
- Scripts automatically detect Windows and use appropriate commands

### macOS/Linux
- Use `python3` command
- Ensure proper permissions for script execution
- May need to install Python via package manager

## Development Workflow

1. **Make changes to panorama data** in `public/data/pano-poses.csv`
2. **Regenerate configuration** with `npm run generate-config`
3. **Test changes** with `npm run dev`
4. **Build for production** with `npm run build`

## Contributing

1. Follow TypeScript best practices
2. Use the provided type definitions
3. Test configuration changes with `npm run test:config`
4. Update documentation when adding features

## Support

For issues and questions:
1. Check the troubleshooting guide
2. Review configuration options
3. Test with different coordinate modes
4. Check Python and Node.js versions