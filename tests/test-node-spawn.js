const { spawn } = require('child_process');
const path = require('path');

console.log('Testing Node.js spawn from current context...');
console.log('process.execPath:', process.execPath);
console.log('process.argv0:', process.argv0);
console.log('Current working directory:', process.cwd());

// Test spawning system node
const nodeProcess = spawn('node', ['--version'], {
  stdio: ['ignore', 'pipe', 'pipe']
});

nodeProcess.stdout.on('data', (data) => {
  console.log('Node version output:', data.toString().trim());
});

nodeProcess.stderr.on('data', (data) => {
  console.error('Node stderr:', data.toString());
});

nodeProcess.on('error', (error) => {
  console.error('Failed to spawn node:', error.message);
  console.error('Error code:', error.code);
});

nodeProcess.on('close', (code) => {
  console.log('Node process exited with code:', code);
});