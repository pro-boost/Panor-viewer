const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

class LoadingManager {
  constructor() {
    this.loadingWindow = null;
    this.currentProgress = 0;
    this.isVisible = false;
  }

  /**
   * Create and show the loading window
   */
  show() {
    if (this.loadingWindow) {
      return;
    }

    console.log('[LoadingManager] Creating loading window...');

    this.loadingWindow = new BrowserWindow({
      width: 500,
      height: 350,
      frame: false,
      alwaysOnTop: true,
      center: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      skipTaskbar: true,
      show: false,
      transparent: false,
      backgroundColor: '#667eea',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: false,
        webSecurity: false
      },
      titleBarStyle: 'hidden'
    });

    // Load the loading HTML file
    const loadingPath = path.join(__dirname, 'loading.html');
    console.log('[LoadingManager] Loading HTML from:', loadingPath);
    
    this.loadingWindow.loadFile(loadingPath)
      .then(() => {
        console.log('[LoadingManager] Loading window content loaded successfully');
        this.loadingWindow.show();
        this.isVisible = true;
        
        // Send initial status
        this.updateProgress(10, 'Initializing Application', 'Setting up the environment...');
      })
      .catch((error) => {
        console.error('[LoadingManager] Failed to load loading window:', error);
      });

    // Handle window events
    this.loadingWindow.on('closed', () => {
      console.log('[LoadingManager] Loading window closed');
      this.loadingWindow = null;
      this.isVisible = false;
      this.isClosing = false;
    });

    this.loadingWindow.on('ready-to-show', () => {
      console.log('[LoadingManager] Loading window ready to show');
      if (!this.isVisible) {
        this.loadingWindow.show();
        this.isVisible = true;
      }
    });

    // Prevent the window from being closed by user
    this.loadingWindow.on('close', (event) => {
      console.log('[LoadingManager] Close event triggered, isClosing:', this.isClosing);
      // Don't prevent close if we're intentionally closing
      if (!this.isClosing) {
        console.log('[LoadingManager] Preventing user close');
        event.preventDefault();
      } else {
        console.log('[LoadingManager] Allowing programmatic close');
      }
    });
  }

  /**
   * Update the loading progress and status
   * @param {number} progress - Progress percentage (0-100)
   * @param {string} status - Main status message
   * @param {string} detail - Detailed status message
   */
  updateProgress(progress, status, detail) {
    if (!this.loadingWindow || !this.isVisible) {
      console.log('[LoadingManager] Cannot update progress - window not available');
      return;
    }

    this.currentProgress = progress;
    
    console.log(`[LoadingManager] Updating progress: ${progress}% - ${status}`);
    
    try {
      this.loadingWindow.webContents.send('loading-progress', {
        progress,
        status,
        detail
      });
    } catch (error) {
      console.error('[LoadingManager] Failed to send progress update:', error);
    }
  }

  /**
   * Update only the status message without changing progress
   * @param {string} status - Main status message
   * @param {string} detail - Detailed status message
   */
  updateStatus(status, detail) {
    this.updateProgress(this.currentProgress, status, detail);
  }

  /**
   * Set progress to a specific value with smooth animation
   * @param {number} targetProgress - Target progress percentage
   * @param {string} status - Status message
   * @param {string} detail - Detail message
   */
  setProgress(targetProgress, status, detail) {
    if (!this.loadingWindow || !this.isVisible) {
      return;
    }

    // Smooth progress animation
    const startProgress = this.currentProgress;
    const progressDiff = targetProgress - startProgress;
    const steps = 10;
    const stepSize = progressDiff / steps;
    const stepDelay = 50; // 50ms per step

    let currentStep = 0;
    const progressInterval = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(startProgress + (stepSize * currentStep), targetProgress);
      
      this.updateProgress(newProgress, status, detail);
      
      if (currentStep >= steps || newProgress >= targetProgress) {
        clearInterval(progressInterval);
        this.updateProgress(targetProgress, status, detail);
      }
    }, stepDelay);
  }

  /**
   * Close the loading window instantly for seamless transition
   */
  hide() {
    if (!this.loadingWindow) {
      console.log('[LoadingManager] Hide called but no loading window exists');
      return Promise.resolve();
    }

    if (this.isClosing) {
      console.log('[LoadingManager] Already in closing process, ignoring hide request');
      return Promise.resolve();
    }

    console.log('[LoadingManager] Starting instant hide process...');
    
    return new Promise((resolve) => {
      this.isClosing = true;
      
      try {
        // Update to final state without delay
        this.updateProgress(100, 'Ready!', 'Application loaded successfully');
        
        // Close immediately without fade-out delay
        if (this.loadingWindow && !this.loadingWindow.isDestroyed()) {
          console.log('[LoadingManager] Closing loading window instantly...');
          
          // Set up close handler before closing
          this.loadingWindow.once('closed', () => {
            console.log('[LoadingManager] Window closed successfully');
            resolve();
          });
          
          // Close the window immediately
          this.loadingWindow.close();
          
          // Safety timeout in case close event doesn't fire
          setTimeout(() => {
            if (this.loadingWindow && !this.loadingWindow.isDestroyed()) {
              console.warn('[LoadingManager] Close event timeout, force closing...');
              this.forceClose();
            }
            resolve();
          }, 100); // Very short timeout for safety
        } else {
          resolve();
        }
        
      } catch (error) {
        console.error('[LoadingManager] Error in hide process:', error);
        this.forceClose();
        resolve();
      }
    });
  }

  /**
   * Force close the loading window immediately
   */
  forceClose() {
    if (this.loadingWindow) {
      console.log('[LoadingManager] Force closing loading window...');
      this.isClosing = true;
      try {
        this.loadingWindow.destroy();
      } catch (error) {
        console.error('[LoadingManager] Error destroying window:', error);
      }
      this.loadingWindow = null;
      this.isVisible = false;
      this.isClosing = false;
    }
    return Promise.resolve();
  }

  /**
   * Check if the loading window is currently visible
   * @returns {boolean}
   */
  isShowing() {
    return this.isVisible && this.loadingWindow && !this.loadingWindow.isDestroyed();
  }

  /**
   * Get current progress value
   * @returns {number}
   */
  getCurrentProgress() {
    return this.currentProgress;
  }
}

// Export singleton instance
let loadingManagerInstance = null;

function getLoadingManager() {
  if (!loadingManagerInstance) {
    loadingManagerInstance = new LoadingManager();
  }
  return loadingManagerInstance;
}

module.exports = {
  LoadingManager,
  getLoadingManager
};