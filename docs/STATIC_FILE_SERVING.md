# Static File Serving in Packaged Electron Apps

This document explains how static files (especially images) are served in the packaged Electron
application and how to troubleshoot related issues.

## Problem Overview

When packaging an Electron app with Next.js, static files from the `public` directory need special
handling because:

1. **Development vs Production**: In development, Next.js automatically serves files from `public/`,
   but in packaged apps, this needs custom implementation
2. **File Path Resolution**: The packaged app structure differs from development, requiring absolute
   path resolution
3. **MIME Type Handling**: Static file server must set correct content types for different file
   formats

## Root Cause of 404 Errors

The 404 errors for images like `/images/00308-pano.jpg` occurred because:

- **Missing Static Handler**: The default Next.js server in packaged mode doesn't automatically
  serve static files
- **Path Resolution**: Images exist in `dist/app/public/images/` but server wasn't configured to
  serve them
- **Request Routing**: All `/images/*` requests were being handled by Next.js router instead of file
  system

## Solution Implementation

### Custom Static File Server

The fix involves modifying `electron-server.js` to intercept image requests and serve them directly
from the file system:

```javascript
// Handle static image files from the packaged location
if (pathname.startsWith('/images/')) {
  const imagePath = path.join(__dirname, 'public', pathname);

  if (fs.existsSync(imagePath)) {
    const ext = path.extname(imagePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };

    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    const stream = fs.createReadStream(imagePath);
    stream.pipe(res);
    return;
  }
}
```

### Key Features

1. **Path Interception**: Catches all requests starting with `/images/`
2. **File System Check**: Verifies file existence before serving
3. **MIME Type Detection**: Sets correct content type based on file extension
4. **Caching Headers**: Adds cache control for better performance
5. **Error Handling**: Proper 404 responses for missing files
6. **Streaming**: Uses file streams for efficient large file serving

## File Structure in Packaged App

```
dist/panoramaviewer-v20-fixed-win32-x64/
├── resources/
│   └── app/
│       ├── public/
│       │   ├── images/           # Your panorama images
│       │   │   ├── 00000-pano.jpg
│       │   │   ├── 00001-pano.jpg
│       │   │   └── ...
│       │   └── data/
│       ├── .next/                # Built Next.js app
│       ├── node_modules/         # Dependencies
│       └── electron-server.js    # Modified server
└── panoramaviewer-v20-fixed.exe
```

## Troubleshooting Steps

### 1. Verify Image Files Exist

```bash
# Check if images are in the packaged app
dir "dist\panoramaviewer-v20-fixed-win32-x64\resources\app\public\images"
```

### 2. Check Server Logs

Look for these log messages in the Electron console:

- `> Static files served from: [path]`
- `Image not found: [path]` (for missing files)
- `Error serving image: [error]` (for file system errors)

### 3. Test Image Access

Use the debug tool at `http://localhost:3000/debug-packaged-images.html` to test individual images.

### 4. Common Issues and Solutions

#### Issue: All images return 404

**Cause**: Static file handler not working **Solution**: Verify `electron-server.js` has the custom
static file handling code

#### Issue: Some images work, others don't

**Cause**: Missing image files or incorrect naming **Solution**: Check file naming consistency
(e.g., `00001-pano.jpg` vs `1-pano.jpg`)

#### Issue: Images load slowly

**Cause**: No caching or inefficient file serving **Solution**: Verify cache headers are set
correctly

#### Issue: Server won't start

**Cause**: Port conflicts or missing dependencies **Solution**: Check for existing processes on port
3000

## Performance Considerations

### Caching Strategy

- **Browser Cache**: Set `max-age=31536000` (1 year) for images
- **Memory Usage**: Use file streams instead of loading entire files into memory
- **Concurrent Requests**: Node.js handles multiple image requests efficiently

### Optimization Tips

1. **Image Compression**: Optimize images before packaging
2. **Progressive Loading**: Load lower resolution first, then enhance
3. **Preloading**: Cache frequently accessed images
4. **Lazy Loading**: Only load images when needed

## Development vs Production

### Development Mode

- Next.js automatically serves static files
- Hot reloading works for static assets
- File changes are immediately reflected

### Production Mode (Packaged)

- Custom static file server required
- Files are bundled and immutable
- Caching is more aggressive

## Security Considerations

### Path Traversal Prevention

```javascript
// Ensure requests stay within public directory
const safePath = path.normalize(path.join(__dirname, 'public', pathname));
if (!safePath.startsWith(path.join(__dirname, 'public'))) {
  res.statusCode = 403;
  res.end('Forbidden');
  return;
}
```

### File Type Validation

```javascript
// Only serve allowed file types
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
if (!allowedExtensions.includes(ext)) {
  res.statusCode = 403;
  res.end('File type not allowed');
  return;
}
```

## Testing Checklist

- [ ] Images load correctly in packaged app
- [ ] 404 errors are properly handled
- [ ] Cache headers are set
- [ ] Large images load efficiently
- [ ] Multiple concurrent requests work
- [ ] Server logs show correct paths
- [ ] Debug tool reports all images as available

## Future Improvements

1. **Image Optimization**: Automatic compression and format conversion
2. **CDN Integration**: Serve images from external CDN
3. **Progressive Enhancement**: WebP with JPEG fallback
4. **Thumbnail Generation**: Create multiple resolutions
5. **Lazy Loading**: Implement intersection observer

## Related Files

- `electron-server.js`: Main server configuration
- `public/debug-packaged-images.html`: Image testing tool
- `src/components/PanoramaViewer.tsx`: Image loading logic
- `docs/PERFORMANCE_OPTIMIZATION.md`: Performance guidelines

This solution ensures reliable static file serving in packaged Electron applications while
maintaining good performance and security practices.
