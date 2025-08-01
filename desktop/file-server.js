const { protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

function setupFileProtocol(userDataPath) {
  // Register custom protocol for serving project files
  protocol.registerFileProtocol('project-file', (request, callback) => {
    const url = request.url.substr(13); // Remove 'project-file://'
    const decodedUrl = decodeURIComponent(url);
    const filePath = path.join(userDataPath, 'projects', decodedUrl);
    
    callback({ path: filePath });
  });

  // Intercept file requests to handle them properly
  protocol.interceptFileProtocol('file', (request, callback) => {
    const url = request.url.substr(7);
    const decodedUrl = decodeURIComponent(url);
    
    if (decodedUrl.includes('/projects/')) {
      const projectPath = decodedUrl.split('/projects/')[1];
      const filePath = path.join(userDataPath, 'projects', projectPath);
      callback({ path: filePath });
    } else {
      callback({ path: decodedUrl });
    }
  });
}

module.exports = { setupFileProtocol };