# Performance Optimization Guide

This guide explains the performance optimizations implemented for handling large panorama datasets
(100+ images) and provides best practices for optimal performance.

## 🚀 Key Optimizations Implemented

### 1. Adaptive Memory Management

The application now automatically adjusts memory usage based on dataset size:

- **Small datasets (≤100 scenes)**: Up to 25 scenes in memory
- **Medium datasets (101-200 scenes)**: Up to 15 scenes in memory
- **Large datasets (>200 scenes)**: Up to 10 scenes in memory

### 2. Intelligent Scene Disposal

- Automatically disposes of old scenes when memory limit is reached
- Uses LRU (Least Recently Used) algorithm to determine which scenes to dispose
- Preserves current scene and recently accessed scenes

### 3. Optimized Image Loading

- **Reduced geometry levels**: Lower base resolution (256px) for faster initial loading
- **Conservative max resolution**: Limited to 2048px to reduce memory usage
- **Smart preloading**: Limits preloading to 4 adjacent scenes for large datasets

### 4. Performance Monitoring

For datasets with 50+ scenes, a performance overlay displays:

- Total dataset size
- Current memory limit
- Number of scenes loaded/disposed
- Active scenes in memory

## 📊 Performance Metrics

### Before Optimization

- **360 images**: Black screens, memory exhaustion
- **Memory usage**: Unlimited scene accumulation
- **Loading strategy**: Aggressive preloading of all connected scenes

### After Optimization

- **360 images**: Smooth navigation with 10-scene memory limit
- **Memory usage**: Controlled with automatic disposal
- **Loading strategy**: Conservative preloading (max 4 scenes)

## 🛠️ Technical Implementation

### Memory Management Functions

```typescript
// Dispose old scenes to free memory
disposeScene(sceneId: string): void

// Manage scene memory with LRU algorithm
manageSceneMemory(currentSceneId: string): void

// Adaptive memory limits based on dataset size
setMaxScenesInMemory(limit: number): void
```

### Optimized Geometry Levels

```typescript
const geometry = new Marzipano.EquirectGeometry([
  { width: 256 }, // Lower base resolution
  { width: 512 },
  { width: 1024 },
  { width: 2048 }, // Reduced max resolution
]);
```

## 📈 Best Practices for Large Datasets

### 1. Image Optimization

- **Format**: Use JPEG with 80-90% quality
- **Resolution**: Recommended 2048x1024 or 4096x2048
- **Compression**: Enable progressive JPEG encoding
- **File size**: Target 500KB-2MB per image

### 2. Dataset Organization

- **Floor separation**: Organize scenes by floors for better memory management
- **Connection limits**: Limit hotspot connections to 4-6 per scene
- **Naming convention**: Use consistent, sequential naming (00001, 00002, etc.)

### 3. Hardware Recommendations

- **RAM**: Minimum 8GB, recommended 16GB for 300+ scenes
- **GPU**: Dedicated graphics card for WebGL acceleration
- **Browser**: Chrome or Firefox with hardware acceleration enabled

## 🔧 Configuration Options

### Environment Variables

```env
# Reduce connection distance for large datasets
PANORAMA_MAX_DISTANCE=8.0

# Limit connections per scene
PANORAMA_MAX_CONNECTIONS=4

# Enable performance monitoring
SHOW_PERFORMANCE_OVERLAY=true
```

### Runtime Configuration

The application automatically detects dataset size and applies appropriate optimizations:

- **Auto-detection**: No manual configuration required
- **Adaptive limits**: Memory limits adjust based on scene count
- **Performance overlay**: Automatically shown for datasets >50 scenes

## 🐛 Troubleshooting Large Datasets

### Black Screens or Missing Images

1. **Check memory overlay**: Verify active scene count stays within limits
2. **Monitor browser console**: Look for memory or loading errors
3. **Reduce image sizes**: Compress images if memory issues persist
4. **Clear browser cache**: Force reload of optimized scenes

### Slow Navigation

1. **Check preloading**: Verify only 4 scenes are preloaded for large datasets
2. **Monitor disposal**: Ensure old scenes are being disposed properly
3. **Optimize images**: Use progressive JPEG and appropriate compression
4. **Hardware acceleration**: Enable in browser settings

### Memory Warnings

1. **Reduce memory limit**: Manually set lower `maxScenesInMemory`
2. **Optimize images**: Reduce file sizes and resolution
3. **Limit connections**: Reduce hotspots per scene
4. **Browser restart**: Clear accumulated memory

## 📋 Performance Checklist

- [ ] Images optimized (JPEG, <2MB each)
- [ ] Dataset size detected automatically
- [ ] Performance overlay visible (if >50 scenes)
- [ ] Memory disposal working (check console logs)
- [ ] Navigation smooth between distant scenes
- [ ] Browser hardware acceleration enabled
- [ ] Sufficient system RAM available

## 🔍 Monitoring Performance

Watch the performance overlay for:

- **Active scenes**: Should stay near memory limit
- **Disposed count**: Should increase as you navigate
- **Memory limit**: Should match dataset size category

Console logs will show:

```
Large dataset detected (>200 scenes), using conservative memory management
Disposed scene 00045 to free memory
Preloading 4 adjacent images for scene 00123
```

## 🚀 Future Optimizations

Planned improvements:

- **WebP format support**: Better compression than JPEG
- **Progressive loading**: Load lower quality first, enhance gradually
- **Worker threads**: Offload image processing to background
- **Texture streaming**: Load only visible portions of panoramas
- **Predictive preloading**: Smart prediction of next likely scenes

This optimization system ensures smooth performance even with datasets of 500+ panorama images while
maintaining visual quality and user experience.
