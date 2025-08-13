const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

/**
 * Standalone obfuscation utilities for extraResources
 */
const standaloneObfuscator = {
  /**
   * Get obfuscation options for standalone files
   */
  getObfuscationOptions: () => {
    return {
      compact: true,
      controlFlowFlattening: false, // Disabled to preserve error handling logic
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: false, // Disabled to prevent breaking structured error objects
      deadCodeInjectionThreshold: 0.4,
      debugProtection: true,
      debugProtectionInterval: 2000,
      disableConsoleOutput: true,
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      numbersToExpressions: true,
      renameGlobals: false,
      selfDefending: false, // Disabled to prevent interference with error handling
      simplify: true,
      splitStrings: true,
      splitStringsChunkLength: 10,
      stringArray: true,
      stringArrayCallsTransform: true,
      stringArrayCallsTransformThreshold: 0.3, // Reduced threshold
      stringArrayEncoding: ['base64'],
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 1, // Reduced from 2 to 1
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersParametersMaxCount: 2, // Reduced from 4 to 2
      stringArrayWrappersType: 'function',
      stringArrayThreshold: 0.6, // Reduced from 0.75 to 0.6
      transformObjectKeys: false, // Disabled to preserve error object properties
      unicodeEscapeSequence: false,
      // Preserve error handling properties and methods
      reservedNames: [
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
        'status',
        'data',
        'error',
        'message',
        'Upload error',
        'Project name',
        'already exists'
      ]
    };
  },

  /**
   * Check if a file should be obfuscated
   */
  shouldObfuscateFile: (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const basename = path.basename(filePath);
    
    // Only obfuscate .js files
    if (ext !== '.js') {
      return false;
    }
    
    // Skip already obfuscated files
    if (basename.includes('.obfuscated.')) {
      return false;
    }
    
    // Skip backup files
    if (basename.endsWith('.original')) {
      return false;
    }
    
    // Skip package.json and other config files
    const skipFiles = ['package.json', 'package-lock.json', '.gitignore', 'README.md'];
    if (skipFiles.includes(basename)) {
      return false;
    }
    
    return true;
  },

  /**
   * Obfuscate a single JavaScript file
   */
  obfuscateFile: async (filePath) => {
    try {
      console.log(`🔒 Obfuscating: ${filePath}`);
      
      // Read the original file
      const originalCode = fs.readFileSync(filePath, 'utf8');
      
      // Skip empty files
      if (!originalCode.trim()) {
        console.log(`⚠️  Skipping empty file: ${filePath}`);
        return;
      }
      
      // Handle shebang lines
      let shebang = '';
      let codeToObfuscate = originalCode;
      
      if (originalCode.startsWith('#!')) {
        const firstNewline = originalCode.indexOf('\n');
        if (firstNewline !== -1) {
          shebang = originalCode.substring(0, firstNewline + 1);
          codeToObfuscate = originalCode.substring(firstNewline + 1);
        }
      }
      
      // Skip if only shebang exists
      if (!codeToObfuscate.trim()) {
        console.log(`⚠️  Skipping file with only shebang: ${filePath}`);
        return;
      }
      
      // Get obfuscation options
      const options = standaloneObfuscator.getObfuscationOptions();
      
      // Obfuscate the code (without shebang)
      const obfuscationResult = JavaScriptObfuscator.obfuscate(codeToObfuscate, options);
      const obfuscatedCode = obfuscationResult.getObfuscatedCode();
      
      // Combine shebang with obfuscated code
      const finalCode = shebang + obfuscatedCode;
      
      // Write obfuscated code directly to the original file (no backup)
      fs.writeFileSync(filePath, finalCode, 'utf8');
      
      console.log(`✅ Successfully obfuscated: ${filePath}`);
      
    } catch (error) {
      console.error(`❌ Failed to obfuscate ${filePath}:`, error.message);
      throw error;
    }
  },

  /**
   * Recursively find all JavaScript files in a directory
   */
  findJavaScriptFiles: (dirPath) => {
    const jsFiles = [];
    
    if (!fs.existsSync(dirPath)) {
      console.warn(`⚠️  Directory not found: ${dirPath}`);
      return jsFiles;
    }
    
    const traverse = (currentPath) => {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules and other common directories
          if (!['node_modules', '.git', '.next', 'dist'].includes(item)) {
            traverse(itemPath);
          }
        } else if (stat.isFile() && standaloneObfuscator.shouldObfuscateFile(itemPath)) {
          jsFiles.push(itemPath);
        }
      }
    };
    
    traverse(dirPath);
    return jsFiles;
  },

  /**
   * Obfuscate all JavaScript files in a directory
   */
  obfuscateDirectory: async (dirPath) => {
    console.log(`🔍 Scanning for JavaScript files in: ${dirPath}`);
    
    const jsFiles = standaloneObfuscator.findJavaScriptFiles(dirPath);
    
    if (jsFiles.length === 0) {
      console.log(`ℹ️  No JavaScript files found to obfuscate in: ${dirPath}`);
      return;
    }
    
    console.log(`📁 Found ${jsFiles.length} JavaScript files to obfuscate`);
    
    for (const filePath of jsFiles) {
      await standaloneObfuscator.obfuscateFile(filePath);
    }
    
    console.log(`🎉 Successfully obfuscated ${jsFiles.length} files in: ${dirPath}`);
  },

  /**
   * Clean up any existing backup files
   */
  cleanupBackupFiles: (dirPath) => {
    console.log(`🧹 Cleaning up backup files in: ${dirPath}`);
    
    if (!fs.existsSync(dirPath)) {
      return;
    }
    
    const traverse = (currentPath) => {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules and other common directories
          if (!['node_modules', '.git', '.next', 'dist'].includes(item)) {
            traverse(itemPath);
          }
        } else if (stat.isFile() && item.endsWith('.original')) {
          console.log(`🗑️  Removing backup file: ${itemPath}`);
          fs.unlinkSync(itemPath);
        }
      }
    };
    
    traverse(dirPath);
  },

  /**
   * Obfuscate extraResources in standalone directories
   */
  obfuscateStandaloneResources: async (standaloneDirs) => {
    console.log('🔒 Starting standalone resources obfuscation...');
    
    for (const standaloneDir of standaloneDirs) {
      console.log(`\n📂 Processing standalone directory: ${standaloneDir}`);
      
      // Clean up any existing backup files first
      standaloneObfuscator.cleanupBackupFiles(standaloneDir);
      
      // Obfuscate scripts/node directory specifically
      const scriptsNodeDir = path.join(standaloneDir, 'scripts', 'node');
      if (fs.existsSync(scriptsNodeDir)) {
        console.log(`🎯 Obfuscating scripts/node directory: ${scriptsNodeDir}`);
        await standaloneObfuscator.obfuscateDirectory(scriptsNodeDir);
      } else {
        console.log(`⚠️  scripts/node directory not found: ${scriptsNodeDir}`);
      }
      
      // Obfuscate any other JavaScript files in the standalone directory
      const otherJsFiles = standaloneObfuscator.findJavaScriptFiles(standaloneDir)
        .filter(file => !file.includes(path.join('scripts', 'node')));
      
      if (otherJsFiles.length > 0) {
        console.log(`📄 Found ${otherJsFiles.length} additional JavaScript files to obfuscate`);
        for (const filePath of otherJsFiles) {
          await standaloneObfuscator.obfuscateFile(filePath);
        }
      }
    }
    
    console.log('✅ Standalone resources obfuscation completed!');
  }
};

module.exports = standaloneObfuscator;