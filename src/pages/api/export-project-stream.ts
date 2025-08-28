import { NextApiRequest, NextApiResponse } from 'next';
import { exportAsZip } from '@/utils/exportProject';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Handle SSE connection
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });
    
    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30000);
    
    req.on('close', () => {
      clearInterval(keepAlive);
    });
    
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectData } = req.body;

    if (!projectData) {
      return res.status(400).json({ error: 'Project data is required' });
    }

    // Set up Server-Sent Events (SSE)
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Progress callback function for real-time updates
    const progressCallback = (step: number, totalSteps: number, message: string, details?: any) => {
      const progressData = {
        step,
        totalSteps,
        message,
        details,
        timestamp: new Date().toISOString()
      };
      
      // Send progress update via SSE
      res.write(`data: ${JSON.stringify({ type: 'progress', data: progressData })}\n\n`);
    };

    try {
      // Start export with progress tracking
      progressCallback(0, 8, 'Starting export process...');
      
      const zipBuffer = await exportAsZip(projectData, progressCallback);
      
      // Convert buffer to base64 for transmission
      const base64Data = zipBuffer.toString('base64');
      const filename = `${projectData.config?.projectName || 'panorama-project'}-export.zip`;
      
      // Send completion event with download data
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        data: {
          filename,
          fileData: base64Data,
          size: zipBuffer.length,
          message: 'Export completed successfully!'
        }
      })}\n\n`);
      
    } catch (exportError) {
      console.error('Export error:', exportError);
      
      // Send error event
      res.write(`data: ${JSON.stringify({
        type: 'error',
        data: {
          message: exportError instanceof Error ? exportError.message : 'Export failed',
          timestamp: new Date().toISOString()
        }
      })}\n\n`);
    }
    
    // Close the connection
    res.end();
    
  } catch (error) {
    console.error('Stream export API error:', error);
    
    // If headers haven't been sent yet, send JSON error
    if (!res.headersSent) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const statusCode = errorMessage.includes('Project configuration is missing') || 
                        errorMessage.includes('Project must contain at least one scene') ? 400 : 500;
      
      return res.status(statusCode).json({ 
        error: 'Export failed', 
        details: errorMessage,
        timestamp: new Date().toISOString()
      });
    }
  }
}

// Increase the body size limit for large project data
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
    responseLimit: false,
    externalResolver: true,
  },
};