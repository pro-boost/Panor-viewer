const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class AsarIntegrityChecker {
  constructor() {
    this.asarPath = null;
    this.expectedChecksums = new Map();
    this.criticalFiles = [
      'main.js',
      'preload.js',
      'server-manager.js'
    ];
    this.isPackaged = app.isPackaged;
  }

  /**
   * Initialize the integrity checker
   */
  async initialize() {
    if (!this.isPackaged) {
      console.log('ASAR Integrity: Skipping in development mode');
      return true;
    }

    try {
      this.asarPath = this.getAsarPath();
      if (!this.asarPath) {
        console.warn('ASAR Integrity: Could not locate ASAR archive');
        return false;
      }

      console.log('ASAR Integrity: Initializing integrity checker');
      console.log('ASAR Path:', this.asarPath);
      
      // Generate checksums for critical files
      await this.generateExpectedChecksums();
      
      return true;
    } catch (error) {
      console.error('ASAR Integrity: Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Get the path to the ASAR archive
   */
  getAsarPath() {
    try {
      const appPath = app.getAppPath();
      
      // Check if we're running from an ASAR archive
      if (appPath.includes('.asar')) {
        return appPath;
      }
      
      // Look for app.asar in the expected location
      const resourcesPath = process.resourcesPath || path.dirname(appPath);
      const asarPath = path.join(resourcesPath, 'app.asar');
      
      if (fs.existsSync(asarPath)) {
        return asarPath;
      }
      
      return null;
    } catch (error) {
      console.error('ASAR Integrity: Error getting ASAR path:', error);
      return null;
    }
  }

  /**
   * Generate checksums for critical files
   */
  async generateExpectedChecksums() {
    for (const file of this.criticalFiles) {
      try {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
          const checksum = await this.calculateFileChecksum(filePath);
          this.expectedChecksums.set(file, checksum);
          console.log(`ASAR Integrity: Generated checksum for ${file}`);
        }
      } catch (error) {
        console.error(`ASAR Integrity: Failed to generate checksum for ${file}:`, error);
      }
    }
  }

  /**
   * Calculate SHA-256 checksum of a file
   */
  async calculateFileChecksum(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', (data) => {
        hash.update(data);
      });
      
      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Calculate checksum of the entire ASAR archive
   */
  async calculateAsarChecksum() {
    if (!this.asarPath || !fs.existsSync(this.asarPath)) {
      throw new Error('ASAR archive not found');
    }

    return await this.calculateFileChecksum(this.asarPath);
  }

  /**
   * Verify the integrity of critical files
   */
  async verifyCriticalFiles() {
    if (!this.isPackaged) {
      return { success: true, message: 'Skipped in development mode' };
    }

    const results = {
      success: true,
      verifiedFiles: [],
      failedFiles: [],
      errors: []
    };

    for (const [fileName, expectedChecksum] of this.expectedChecksums) {
      try {
        const filePath = path.join(__dirname, fileName);
        if (fs.existsSync(filePath)) {
          const currentChecksum = await this.calculateFileChecksum(filePath);
          
          if (currentChecksum === expectedChecksum) {
            results.verifiedFiles.push(fileName);
          } else {
            results.failedFiles.push(fileName);
            results.success = false;
            console.error(`ASAR Integrity: Checksum mismatch for ${fileName}`);
          }
        } else {
          results.failedFiles.push(fileName);
          results.success = false;
          results.errors.push(`File not found: ${fileName}`);
        }
      } catch (error) {
        results.errors.push(`Error verifying ${fileName}: ${error.message}`);
        results.success = false;
      }
    }

    return results;
  }

  /**
   * Perform a comprehensive integrity check
   */
  async performIntegrityCheck() {
    if (!this.isPackaged) {
      return {
        success: true,
        message: 'Integrity check skipped in development mode',
        timestamp: new Date().toISOString()
      };
    }

    console.log('ASAR Integrity: Starting comprehensive integrity check');
    
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      asarPath: this.asarPath,
      checks: {
        asarExists: false,
        asarChecksum: null,
        criticalFiles: null
      },
      errors: []
    };

    try {
      // Check if ASAR exists
      result.checks.asarExists = this.asarPath && fs.existsSync(this.asarPath);
      
      if (!result.checks.asarExists) {
        result.success = false;
        result.errors.push('ASAR archive not found');
        return result;
      }

      // Calculate ASAR checksum
      try {
        result.checks.asarChecksum = await this.calculateAsarChecksum();
        console.log('ASAR Integrity: ASAR checksum calculated');
      } catch (error) {
        result.errors.push(`Failed to calculate ASAR checksum: ${error.message}`);
        result.success = false;
      }

      // Verify critical files
      try {
        result.checks.criticalFiles = await this.verifyCriticalFiles();
        if (!result.checks.criticalFiles.success) {
          result.success = false;
        }
      } catch (error) {
        result.errors.push(`Failed to verify critical files: ${error.message}`);
        result.success = false;
      }

      if (result.success) {
        console.log('ASAR Integrity: All integrity checks passed');
      } else {
        console.error('ASAR Integrity: Integrity check failed:', result.errors);
      }

      return result;
    } catch (error) {
      console.error('ASAR Integrity: Unexpected error during integrity check:', error);
      return {
        success: false,
        timestamp: new Date().toISOString(),
        errors: [`Unexpected error: ${error.message}`]
      };
    }
  }

  /**
   * Handle integrity failure
   */
  handleIntegrityFailure(result) {
    console.error('ASAR Integrity: Application integrity compromised!');
    console.error('Details:', result);
    
    // Log to a secure location if possible
    try {
      const logPath = path.join(app.getPath('userData'), 'integrity-failure.log');
      const logData = {
        timestamp: new Date().toISOString(),
        result: result,
        appVersion: app.getVersion(),
        platform: process.platform,
        arch: process.arch
      };
      
      fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
      console.log('ASAR Integrity: Failure logged to:', logPath);
    } catch (logError) {
      console.error('ASAR Integrity: Failed to log integrity failure:', logError);
    }

    // You can customize this behavior based on your security requirements
    // Options:
    // 1. Exit the application immediately
    // 2. Show a warning dialog
    // 3. Disable certain features
    // 4. Report to a remote server
    
    // For now, we'll show a warning but continue running
    console.warn('ASAR Integrity: Continuing with compromised integrity (customize this behavior)');
  }
}

module.exports = AsarIntegrityChecker;