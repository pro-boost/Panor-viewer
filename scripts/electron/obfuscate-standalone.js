/**
 * Standalone Obfuscation Script for Electron Resources
 * 
 * This script provides obfuscation for standalone resources in the Electron app.
 * CRITICAL: Settings must match the main obfuscation config to ensure consistency
 * and preserve error handling functionality.
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');
const { shouldExcludeFile } = require('../../config/obfuscation.config.js');

/**
 * Get obfuscation options that match the main config
 * CRITICAL: These settings must align with config/obfuscation.config.js
 */
function getObfuscationOptions() {
  return {
    compact: true,
    
    // CRITICAL: Must match main config
    controlFlowFlattening: false,
    
    // CRITICAL: Must match main config
    deadCodeInjection: false,
    
    // CRITICAL: Must match main config
    selfDefending: false,
    
    // Add same reserved names as main config
    reservedNames: [
      'status', 'data', 'error', 'message', 'response',
      'catch', 'then', 'finally',
      'handleUploadError', 'validationErrors', 'uploadState',
      'createProject', 'projectManager'
    ],
    
    // Other safe settings that match main config
    stringArray: true,
    stringArrayThreshold: 0.6,
    transformObjectKeys: false, // Safer setting
    
    // Additional safe settings
    rotateStringArray: true,
    shuffleStringArray: true,
    splitStrings: true,
    splitStringsChunkLength: 5,
    
    // Disable potentially problematic transformations
    disableConsoleOutput: false,
    debugProtection: false,
    debugProtectionInterval: 0,
    
    // Safe renaming settings
    renameGlobals: false,
    renameProperties: false,
    
    // Unicode and escape settings
    unicodeEscapeSequence: false,
    
    // Source map settings
    sourceMap: false,
    sourceMapMode: 'separate'
  };
}

/**
 * Obfuscate a single JavaScript file
 * @param {string} inputPath - Path to the input file
 * @param {string} outputPath - Path to the output file
 */
function obfuscateFile(inputPath, outputPath) {
  try {
    // Check if file should be excluded
    if (shouldExcludeFile(inputPath)) {
      console.log(`Skipping (excluded): ${inputPath}`);
      // Copy file as-is without obfuscation
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.copyFileSync(inputPath, outputPath);
      return;
    }
    
    console.log(`Obfuscating: ${inputPath}`);
    
    const sourceCode = fs.readFileSync(inputPath, 'utf8');
    const obfuscationResult = JavaScriptObfuscator.obfuscate(sourceCode, getObfuscationOptions());
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, obfuscationResult.getObfuscatedCode());
    console.log(`Obfuscated file saved: ${outputPath}`);
    
  } catch (error) {
    console.error(`Error obfuscating ${inputPath}:`, error.message);
    throw error;
  }
}

/**
 * Copy a directory recursively without any processing
 * @param {string} sourceDir - Source directory path
 * @param {string} destDir - Destination directory path
 */
function copyDirectoryRecursive(sourceDir, destDir) {
  try {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    const files = fs.readdirSync(sourceDir);
    
    files.forEach(file => {
      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(destDir, file);
      
      const stat = fs.statSync(sourcePath);
      
      if (stat.isDirectory()) {
        copyDirectoryRecursive(sourcePath, destPath);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    });
    
    console.log(`Copied directory: ${sourceDir} -> ${destDir}`);
    
  } catch (error) {
    console.error(`Error copying directory ${sourceDir}:`, error.message);
    throw error;
  }
}

/**
 * Obfuscate multiple files in a directory
 * @param {string} inputDir - Input directory path
 * @param {string} outputDir - Output directory path
 * @param {string[]} extensions - File extensions to process (default: ['.js'])
 */
function obfuscateDirectory(inputDir, outputDir, extensions = ['.js']) {
  try {
    console.log(`Obfuscating directory: ${inputDir}`);
    
    if (!fs.existsSync(inputDir)) {
      throw new Error(`Input directory does not exist: ${inputDir}`);
    }
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const files = fs.readdirSync(inputDir);
    
    files.forEach(file => {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file);
      
      const stat = fs.statSync(inputPath);
      
      if (stat.isDirectory()) {
        // Check if directory should be excluded
        if (shouldExcludeFile(inputPath)) {
          console.log(`Skipping directory (excluded): ${inputPath}`);
          // Copy entire directory as-is
          copyDirectoryRecursive(inputPath, outputPath);
          return;
        }
        // Recursively process subdirectories
        obfuscateDirectory(inputPath, outputPath, extensions);
      } else if (stat.isFile() && extensions.includes(path.extname(file))) {
        // Obfuscate JavaScript files (with exclusion check inside obfuscateFile)
        obfuscateFile(inputPath, outputPath);
      } else {
        // Copy non-JavaScript files as-is
        fs.copyFileSync(inputPath, outputPath);
      }
    });
    
    console.log(`Directory obfuscation completed: ${outputDir}`);
    
  } catch (error) {
    console.error(`Error obfuscating directory ${inputDir}:`, error.message);
    throw error;
  }
}

/**
 * Main function to run obfuscation based on command line arguments
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node obfuscate-standalone.js <input> <output> [extensions...]');
    console.log('Example: node obfuscate-standalone.js ./src ./dist .js .ts');
    process.exit(1);
  }
  
  const inputPath = args[0];
  const outputPath = args[1];
  const extensions = args.length > 2 ? args.slice(2) : ['.js'];
  
  try {
    const stat = fs.statSync(inputPath);
    
    if (stat.isDirectory()) {
      obfuscateDirectory(inputPath, outputPath, extensions);
    } else if (stat.isFile()) {
      obfuscateFile(inputPath, outputPath);
    } else {
      throw new Error(`Invalid input path: ${inputPath}`);
    }
    
    console.log('Obfuscation completed successfully!');
    
  } catch (error) {
    console.error('Obfuscation failed:', error.message);
    process.exit(1);
  }
}

// Export functions for use as a module
module.exports = {
  getObfuscationOptions,
  obfuscateFile,
  obfuscateDirectory,
  copyDirectoryRecursive
};

// Run main function if script is executed directly
if (require.main === module) {
  main();
}