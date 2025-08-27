import { NextApiRequest, NextApiResponse } from 'next';
import { exportAsZip, testExportWithSampleData, testExportWithRealProject } from '@/utils/exportProject';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, projectData, projectName } = req.body;

    switch (action) {
      case 'export':
        if (!projectData) {
          return res.status(400).json({ error: 'Project data is required' });
        }
        
        // Generate ZIP buffer with streaming support
        const zipBuffer = await exportAsZip(projectData);
        const filename = `${projectData.config.projectName || 'panorama-project'}-export.zip`;
        
        // Set response headers for chunked transfer
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('Cache-Control', 'no-cache');
        
        // Send ZIP in chunks to prevent memory issues
        const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
        let offset = 0;
        
        while (offset < zipBuffer.length) {
          const chunk = zipBuffer.slice(offset, Math.min(offset + CHUNK_SIZE, zipBuffer.length));
          res.write(chunk);
          offset += CHUNK_SIZE;
          
          // Small delay between chunks to prevent overwhelming
          if (offset < zipBuffer.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
        
        return res.end();
        
      case 'test-sample':
        await testExportWithSampleData();
        return res.status(200).json({ success: true, message: 'Sample export completed' });
        
      case 'test-real':
        if (!projectName) {
          return res.status(400).json({ error: 'Project name is required for real project test' });
        }
        await testExportWithRealProject(projectName);
        return res.status(200).json({ success: true, message: 'Real project export completed' });
        
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Export API error:', error);
    
    // Provide more detailed error information
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

// Increase the body size limit for large project data
export const config = {
  api: {
    bodyParser: {
      sizeLimit: false,
    },
    responseLimit: false,
    externalResolver: true,
  },
};