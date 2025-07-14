import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to get project-specific upload directory
function getProjectUploadDir(projectId: string) {
  const uploadDir = path.join(process.cwd(), 'public', projectId, 'data', 'poi', 'attachments');
  
  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  return uploadDir;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit per file
      maxTotalFileSize: 50 * 1024 * 1024, // 50MB total limit
      filter: ({ mimetype }) => {
        return [
          'image/jpeg',
          'image/jpg', 
          'image/png',
          'image/gif',
          'application/pdf',
          'video/mp4',
          'video/webm'
        ].includes(mimetype || '');
      }
    });

    const [fields, files] = await form.parse(req);
    
    const projectId = Array.isArray(fields.projectId) ? fields.projectId[0] : fields.projectId;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    const uploadDir = getProjectUploadDir(projectId);
    
    // Handle multiple files
    const uploadedFiles = Array.isArray(files.files) ? files.files : (files.files ? [files.files] : []);
    const filenames = Array.isArray(fields.filenames) ? fields.filenames : (fields.filenames ? [fields.filenames] : []);
    
    if (uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (filenames.length !== uploadedFiles.length) {
      return res.status(400).json({ error: 'Mismatch between files and filenames count' });
    }

    const results = [];
    const errors = [];

    // Process each file
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const filename = filenames[i];
      
      try {
        // Move file to final location with the specified filename
        const finalPath = path.join(uploadDir, filename);
        
        // Check if file already exists
        if (fs.existsSync(finalPath)) {
          // Remove the temporary file
          fs.unlinkSync(file.filepath);
          errors.push({ filename, error: 'File already exists' });
          continue;
        }

        // Move the file (handle cross-drive moves)
        try {
          fs.renameSync(file.filepath, finalPath);
        } catch (renameError: any) {
          // If rename fails (e.g., cross-drive move), copy and delete
          if (renameError.code === 'EXDEV') {
            fs.copyFileSync(file.filepath, finalPath);
            fs.unlinkSync(file.filepath);
          } else {
            throw renameError;
          }
        }

        results.push({
          filename,
          size: file.size,
          mimetype: file.mimetype,
          success: true
        });
      } catch (fileError) {
        console.error(`Error processing file ${filename}:`, fileError);
        errors.push({ 
          filename, 
          error: fileError instanceof Error ? fileError.message : 'Unknown error' 
        });
        
        // Clean up temporary file if it still exists
        try {
          if (fs.existsSync(file.filepath)) {
            fs.unlinkSync(file.filepath);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up temporary file:', cleanupError);
        }
      }
    }

    // Return results
    if (results.length === 0) {
      return res.status(400).json({ 
        error: 'No files were successfully uploaded',
        errors 
      });
    }

    res.status(200).json({
      success: true,
      uploadedFiles: results,
      errors: errors.length > 0 ? errors : undefined,
      totalUploaded: results.length,
      totalErrors: errors.length
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('maxFileSize')) {
        return res.status(413).json({ error: 'One or more files are too large. Maximum size is 10MB per file.' });
      }
      if (error.message.includes('maxTotalFileSize')) {
        return res.status(413).json({ error: 'Total file size exceeds limit. Maximum total size is 50MB.' });
      }
      if (error.message.includes('filter')) {
        return res.status(415).json({ error: 'One or more files have unsupported file types. Please upload images (JPG, PNG, GIF), PDFs, or videos (MP4, WebM).' });
      }
    }
    
    // Check for formidable error codes
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 1003) {
        return res.status(415).json({ 
          error: 'Unsupported file type. Please upload images (JPG, PNG, GIF), PDFs, or videos (MP4, WebM).',
          details: 'One or more files were not recognized as valid media files.'
        });
      }
      if (error.code === 1009) {
        return res.status(413).json({ error: 'One or more files are too large. Maximum size is 10MB per file.' });
      }
    }
    
    res.status(500).json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}