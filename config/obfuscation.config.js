/**
 * Obfuscation Configuration for Advanced Panorama Viewer
 * 
 * CRITICAL: This configuration is specifically designed to preserve error handling
 * functionality while providing security through obfuscation.
 * 
 * Key Safety Settings:
 * - controlFlowFlattening: false (preserves async/await and Promise chains)
 * - deadCodeInjection: false (preserves structured error objects)
 * - selfDefending: false (prevents interference with error handling)
 */

/**
 * Check if a file path should be excluded from obfuscation
 * @param {string} filePath - The file path to check
 * @returns {boolean} - True if the file should be excluded
 */
function shouldExcludeFile(filePath) {
  const excludePatterns = [
    /node_modules/,
    /\.next[\/\\]static[\/\\]chunks/,
    /\.next[\/\\]cache/,
    /dist[\/\\]node_modules/,
    /build[\/\\]node_modules/,
    /vendor/,
    /third[_-]party/,
    /external/,
    /lib[\/\\].*\.min\./,
    /\.bundle\./,
    /\.vendor\./
  ];
  
  return excludePatterns.some(pattern => pattern.test(filePath));
}

module.exports = {
  // Export the exclusion function for use by other scripts
  shouldExcludeFile,
  
  development: {
    // No obfuscation in development for easier debugging
    compact: false,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    selfDefending: false
  },
  
  production: {
    compact: true,
    
    // CRITICAL: Must be false to preserve error handling
    controlFlowFlattening: false,
    
    // CRITICAL: Must be false to preserve structured error objects
    deadCodeInjection: false,
    
    // CRITICAL: Must be false to prevent interference
    selfDefending: false,
    
    // Essential reserved names for error handling
    reservedNames: [
      'status', 'data', 'error', 'message', 'response',
      'catch', 'then', 'finally',
      'handleUploadError', 'validationErrors', 'uploadState',
      'createProject', 'projectManager'
    ],
    
    // Reduced aggressiveness settings
    optionsPreset: 'medium-obfuscation', // Not 'high-obfuscation'
    stringArrayThreshold: 0.6,           // Reduced from 0.8
    stringArrayWrappersCount: 1,         // Reduced from 2
    
    // Additional safe settings
    stringArray: true,
    rotateStringArray: true,
    shuffleStringArray: true,
    splitStrings: true,
    splitStringsChunkLength: 5,
    
    // Transform settings that are safe for error handling
    transformObjectKeys: false, // Safer setting to avoid breaking object properties
    unicodeEscapeSequence: false,
    
    // Disable potentially problematic transformations
    disableConsoleOutput: false, // Keep console for debugging
    debugProtection: false,
    debugProtectionInterval: 0,
    
    // Safe renaming settings
    renameGlobals: false,
    renameProperties: false,
    
    // Source map settings
    sourceMap: false,
    sourceMapMode: 'separate',
    
    // Exclusion patterns for node_modules and dependencies
    exclude: [
      '**/node_modules/**',
      '**/.next/static/chunks/**',
      '**/.next/cache/**',
      '**/dist/node_modules/**',
      '**/build/node_modules/**',
      '**/vendor/**',
      '**/third-party/**',
      '**/third_party/**',
      '**/external/**',
      '**/*.min.js',
      '**/*.bundle.js',
      '**/*.vendor.js'
    ]
  }
};