# YouTube URL Fix for POI Preview

## Issue Fixed

Previously, YouTube URLs entered in POI iframe content were not displaying properly in the preview. This was because YouTube requires specific embed URLs rather than regular watch URLs.

## Solution Implemented

### Automatic URL Conversion

The POI preview system now automatically converts various YouTube and Vimeo URL formats to their embeddable equivalents:

#### YouTube URL Conversions

| Input Format | Converted To |
|--------------|-------------|
| `https://www.youtube.com/watch?v=VIDEO_ID` | `https://www.youtube.com/embed/VIDEO_ID` |
| `https://youtu.be/VIDEO_ID` | `https://www.youtube.com/embed/VIDEO_ID` |
| `https://www.youtube.com/watch?v=VIDEO_ID&t=30` | `https://www.youtube.com/embed/VIDEO_ID?start=30` |

#### Vimeo URL Conversions

| Input Format | Converted To |
|--------------|-------------|
| `https://vimeo.com/123456789` | `https://player.vimeo.com/video/123456789` |

### Enhanced Iframe Attributes

The iframe now includes proper attributes for video embeds:

- `allowFullScreen` - Enables fullscreen mode
- `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"` - Enables video features
- Enhanced sandbox permissions for video playback

## How to Use

### For Users

1. **Creating a POI with YouTube content:**
   - Right-click in the panorama and select "Create POI"
   - Choose "URL/Iframe" as the content type
   - Paste any YouTube URL format:
     - `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
     - `https://youtu.be/dQw4w9WgXcQ`
     - `https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30` (with timestamp)
   - The system will automatically convert it to the proper embed format

2. **Supported URL formats:**
   - YouTube watch URLs
   - YouTube short URLs (youtu.be)
   - YouTube URLs with timestamps
   - Vimeo URLs
   - Any other direct URLs
   - Iframe HTML code

### For Developers

#### Key Functions Added

```typescript
// Convert YouTube URLs to embed format
const convertYouTubeUrl = (url: string): string => {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeRegex);
  
  if (match && match[1]) {
    const videoId = match[1];
    const timeMatch = url.match(/[?&]t=([0-9]+)/);
    const startTime = timeMatch ? `?start=${timeMatch[1]}` : '';
    return `https://www.youtube.com/embed/${videoId}${startTime}`;
  }
  
  return url;
};

// Convert Vimeo URLs to embed format
const convertVimeoUrl = (url: string): string => {
  const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/([0-9]+)/;
  const match = url.match(vimeoRegex);
  
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }
  
  return url;
};
```

#### Files Modified

- `src/components/poi/POIPreview.tsx` - Added URL conversion logic
- `src/components/poi/POIModal.tsx` - Updated placeholder text and hints
- `src/components/poi/__tests__/POIPreview.test.tsx` - Added comprehensive tests

## Testing

Comprehensive tests have been added to verify:

- YouTube watch URL conversion
- YouTube short URL conversion
- Timestamp preservation
- Vimeo URL conversion
- Iframe HTML processing
- Non-video URL passthrough
- Proper iframe attributes

Run tests with:
```bash
npm test -- --testPathPattern=POIPreview.test.tsx
```

## Browser Compatibility

The fix works across all modern browsers that support:
- HTML5 video
- iframe embedding
- ES6 regular expressions

## Security Considerations

- URLs are validated before conversion
- Iframe sandbox attributes prevent malicious code execution
- Only trusted video platforms (YouTube, Vimeo) get special handling
- XSS protection through proper HTML escaping

## Future Enhancements

Potential improvements for future versions:

1. **Additional Platform Support:**
   - Dailymotion URLs
   - Twitch clips
   - Facebook videos

2. **Enhanced Features:**
   - Video thumbnail extraction
   - Automatic title/description fetching
   - Playlist support

3. **User Experience:**
   - Preview thumbnails in POI modal
   - Video duration display
   - Auto-play controls

## Troubleshooting

### Common Issues

1. **Video not loading:**
   - Ensure the YouTube video is public
   - Check if embedding is allowed for the video
   - Verify internet connection

2. **Iframe blocked:**
   - Some videos may have embedding restrictions
   - Try using the direct YouTube link instead

3. **Performance issues:**
   - Multiple video embeds may impact performance
   - Consider limiting concurrent video POIs

### Error Messages

If you encounter issues, check the browser console for error messages and ensure:
- The URL is valid
- The video exists and is accessible
- Your browser supports iframe embedding