const JavaScriptObfuscator = require('webpack-obfuscator');

/**
 * Obfuscation configuration for different environments
 */
const obfuscationConfig = {
  development: {
    // Minimal obfuscation for development to maintain debugging capabilities
    compact: false,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    debugProtectionInterval: 0,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: false,
    renameGlobals: false,
    selfDefending: false,
    simplify: true,
    splitStrings: false,
    stringArray: false,
    stringArrayCallsTransform: false,
    stringArrayEncoding: [],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: 'variable',
    stringArrayThreshold: 0.75,
    unicodeEscapeSequence: false
  },

  production: {
    // Enhanced obfuscation for production builds with error handling preservation
    compact: true,
    controlFlowFlattening: false, // Disabled to preserve error handling logic
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: false, // Disabled to prevent breaking structured error objects
    deadCodeInjectionThreshold: 0.4,
    debugProtection: true,
    debugProtectionInterval: 2000,
    disableConsoleOutput: true,
    domainLock: [],
    domainLockRedirectUrl: 'about:blank',
    forceTransformStrings: [],
    identifierNamesCache: null,
    identifierNamesGenerator: 'mangled-shuffled',
    identifiersDictionary: [],
    identifiersPrefix: '',
    ignoreRequireImports: false,
    inputFileName: '',
    log: false,
    numbersToExpressions: true,
    optionsPreset: 'medium-obfuscation', // Reduced from high to medium
    renameGlobals: false,
    renameProperties: false,
    renamePropertiesMode: 'safe',
    reservedNames: [
      // Preserve error handling properties and methods
      'status',
      'data',
      'error',
      'message',
      'response',
      'catch',
      'then',
      'finally',
      'handleUploadError',
      'handleUploadResponse',
      'validationErrors',
      'uploadState',
      'validation',
      'createProject',
      'projectManager'
    ],
    reservedStrings: [
      // Preserve error-related strings
      'status',
      'data',
      'error',
      'message',
      'Upload error',
      'Project name',
      'already exists'
    ],
    seed: 0,
    selfDefending: false, // Disabled to prevent interference with error handling
    simplify: true,
    sourceMap: false,
    sourceMapBaseUrl: '',
    sourceMapFileName: '',
    sourceMapMode: 'separate',
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 0.3, // Reduced threshold
    stringArrayEncoding: ['base64'],
    stringArrayIndexesType: ['hexadecimal-number'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 1, // Reduced from 2 to 1
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 2, // Reduced from 4 to 2
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.6, // Reduced from 0.8 to 0.6
    target: 'browser',
    transformObjectKeys: false,
    unicodeEscapeSequence: false
  }
};

/**
 * Get obfuscation plugin instance based on environment
 * @param {boolean} isDev - Whether this is a development build
 * @param {boolean} isServer - Whether this is server-side code
 * @returns {JavaScriptObfuscator|null} - Obfuscator plugin or null
 */
function getObfuscatorPlugin(isDev, isServer) {
  // Don't obfuscate server-side code to avoid breaking Node.js functionality
  if (isServer) {
    return null;
  }

  const config = isDev ? obfuscationConfig.development : obfuscationConfig.production;
  
  return new JavaScriptObfuscator(config, [
    // Exclude certain files from obfuscation
    'excluded_bundle_name.js',
    // Exclude vendor libraries that might break when obfuscated
    /node_modules/,
    // Exclude webpack runtime and manifest files
    /webpack-runtime/,
    /manifest/,
    // Exclude service worker files
    /sw\.js$/,
    // Exclude PDF.js worker files
    /pdf\.worker/
  ]);
}

module.exports = {
  obfuscationConfig,
  getObfuscatorPlugin
};