/**
 * Utility functions for content type detection and icon mapping
 */

export interface ContentTypeInfo {
  icon: string;
  category: 'image' | 'video' | 'audio' | 'document' | 'web' | 'pdf' | 'unknown';
  canEmbed: boolean;
  mimeType?: string;
}

/**
 * Detect content type from URL or file extension
 */
export function detectContentType(url: string, mimeType?: string): ContentTypeInfo {
  // If we have a MIME type, use it first
  if (mimeType) {
    return getContentTypeFromMime(mimeType);
  }

  // Extract file extension from URL
  const urlWithoutQuery = url.split('?')[0];
  const extension = urlWithoutQuery.split('.').pop()?.toLowerCase();
  
  if (!extension) {
    // If no extension, assume it's a web page
    return {
      icon: '🌐',
      category: 'web',
      canEmbed: true
    };
  }

  return getContentTypeFromExtension(extension);
}

/**
 * Get content type info from MIME type
 */
export function getContentTypeFromMime(mimeType: string): ContentTypeInfo {
  const type = mimeType.toLowerCase();

  // Images
  if (type.startsWith('image/')) {
    return {
      icon: '🖼️',
      category: 'image',
      canEmbed: true,
      mimeType
    };
  }

  // Videos
  if (type.startsWith('video/')) {
    return {
      icon: '🎥',
      category: 'video',
      canEmbed: true,
      mimeType
    };
  }

  // Audio
  if (type.startsWith('audio/')) {
    return {
      icon: '🎵',
      category: 'audio',
      canEmbed: true,
      mimeType
    };
  }

  // PDF
  if (type === 'application/pdf') {
    return {
      icon: '📄',
      category: 'pdf',
      canEmbed: true,
      mimeType
    };
  }

  // Documents
  if (type.includes('word') || type.includes('document') || 
      type.includes('spreadsheet') || type.includes('presentation') ||
      type === 'text/plain' || type === 'text/html') {
    return {
      icon: '📝',
      category: 'document',
      canEmbed: type === 'text/html',
      mimeType
    };
  }

  // Default to document
  return {
    icon: '📎',
    category: 'unknown',
    canEmbed: false,
    mimeType
  };
}

/**
 * Get content type info from file extension
 */
export function getContentTypeFromExtension(extension: string): ContentTypeInfo {
  const ext = extension.toLowerCase();

  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
    return {
      icon: '🖼️',
      category: 'image',
      canEmbed: true
    };
  }

  // Videos
  if (['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'm4v'].includes(ext)) {
    return {
      icon: '🎥',
      category: 'video',
      canEmbed: true
    };
  }

  // Audio
  if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'].includes(ext)) {
    return {
      icon: '🎵',
      category: 'audio',
      canEmbed: true
    };
  }

  // PDF
  if (ext === 'pdf') {
    return {
      icon: '📄',
      category: 'pdf',
      canEmbed: true
    };
  }

  // Documents
  if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) {
    return {
      icon: '📝',
      category: 'document',
      canEmbed: false
    };
  }

  // Spreadsheets
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
    return {
      icon: '📊',
      category: 'document',
      canEmbed: false
    };
  }

  // Presentations
  if (['ppt', 'pptx', 'odp'].includes(ext)) {
    return {
      icon: '📋',
      category: 'document',
      canEmbed: false
    };
  }

  // Web files
  if (['html', 'htm'].includes(ext)) {
    return {
      icon: '🌐',
      category: 'web',
      canEmbed: true
    };
  }

  // Default
  return {
    icon: '📎',
    category: 'unknown',
    canEmbed: false
  };
}

/**
 * Check if a URL is embeddable via iframe
 */
export function isEmbeddableUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Common embeddable domains
    const embeddableDomains = [
      'youtube.com',
      'youtu.be',
      'vimeo.com',
      'docs.google.com',
      'drive.google.com',
      'onedrive.live.com',
      'sharepoint.com',
      'dropbox.com',
      'slideshare.net',
      'scribd.com',
      'issuu.com'
    ];
    
    return embeddableDomains.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

/**
 * Generate iframe sandbox attributes for security
 */
export function getIframeSandboxAttributes(): string {
  return 'allow-scripts allow-same-origin allow-popups allow-forms allow-downloads';
}

/**
 * Generate iframe src URL with proper parameters
 */
export function generateEmbedUrl(url: string, contentType: ContentTypeInfo): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // YouTube embed transformation
    if (hostname.includes('youtube.com') && urlObj.pathname === '/watch') {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // YouTube short URL transformation
    if (hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1);
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Vimeo embed transformation
    if (hostname.includes('vimeo.com')) {
      const videoId = urlObj.pathname.split('/').pop();
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }
    
    // Google Docs/Drive embed transformation
    if (hostname.includes('docs.google.com') || hostname.includes('drive.google.com')) {
      if (!url.includes('/preview') && !url.includes('/embed')) {
        return url.replace('/view', '/preview');
      }
    }
    
    return url;
  } catch {
    return url;
  }
}