# Code Quality and Maintainability Recommendations

## Overview
Based on the comprehensive analysis of the panoramic image viewer application, here are specific recommendations to enhance code quality, maintainability, and developer experience.

## 1. Architecture Improvements

### State Management Consolidation
**Current Issue**: State is scattered across multiple components with complex interdependencies.

**Recommendation**: Implement a centralized state management solution.

```typescript
// src/context/AppContext.tsx
import { createContext, useContext, useReducer } from 'react';

interface AppState {
  panoramas: PanoramaConfig | null;
  currentScene: string | null;
  isLoading: boolean;
  error: string | null;
  refreshTrigger: number;
  fileStatus: FileStatus;
}

type AppAction = 
  | { type: 'SET_PANORAMAS'; payload: PanoramaConfig }
  | { type: 'SET_CURRENT_SCENE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TRIGGER_REFRESH' }
  | { type: 'UPDATE_FILE_STATUS'; payload: FileStatus };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_PANORAMAS':
      return { ...state, panoramas: action.payload, error: null };
    case 'SET_CURRENT_SCENE':
      return { ...state, currentScene: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'TRIGGER_REFRESH':
      return { ...state, refreshTrigger: Date.now() };
    case 'UPDATE_FILE_STATUS':
      return { ...state, fileStatus: action.payload };
    default:
      return state;
  }
};
```

### Service Layer Implementation
**Current Issue**: API calls and business logic mixed with UI components.

**Recommendation**: Create dedicated service classes.

```typescript
// src/services/PanoramaService.ts
export class PanoramaService {
  private static instance: PanoramaService;
  private cache = new Map<string, any>();
  
  static getInstance(): PanoramaService {
    if (!PanoramaService.instance) {
      PanoramaService.instance = new PanoramaService();
    }
    return PanoramaService.instance;
  }
  
  async checkFiles(): Promise<FileStatus> {
    const cacheKey = 'file-status';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 5000) {
      return cached.data;
    }
    
    const response = await fetch('/api/check-files', {
      cache: 'no-cache',
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    const data = await response.json();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  }
  
  async loadConfiguration(): Promise<PanoramaConfig> {
    // Implementation with proper error handling and caching
  }
  
  clearCache(): void {
    this.cache.clear();
  }
}
```

## 2. Error Handling Enhancement

### Comprehensive Error Boundary
**Current Issue**: Limited error handling and recovery mechanisms.

**Recommendation**: Implement robust error boundaries with recovery options.

```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // Implementation for error logging service
    console.error('Error logged:', { error, errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.toString()}</pre>
            <pre>{this.state.errorInfo?.componentStack}</pre>
          </details>
          <button onClick={this.handleRetry}>Try Again</button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handling
**Recommendation**: Standardize API error responses and handling.

```typescript
// src/lib/apiClient.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || 'Request failed',
      response.status,
      errorData.code
    );
  }

  return response.json();
}
```

## 3. Performance Optimizations

### Memory Management
**Current Issue**: Potential memory leaks with scene management.

**Recommendation**: Implement proper cleanup and memory monitoring.

```typescript
// src/hooks/useMemoryMonitor.ts
import { useEffect, useRef, useState } from 'react';

interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export function useMemoryMonitor(interval = 5000) {
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if ('memory' in performance) {
      const updateMemoryStats = () => {
        const memory = (performance as any).memory;
        setMemoryStats({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        });
      };

      updateMemoryStats();
      intervalRef.current = setInterval(updateMemoryStats, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval]);

  return memoryStats;
}
```

### Image Loading Optimization
**Recommendation**: Implement progressive loading and caching.

```typescript
// src/hooks/useImagePreloader.ts
import { useCallback, useRef } from 'react';

interface PreloadOptions {
  priority?: 'high' | 'medium' | 'low';
  timeout?: number;
}

export function useImagePreloader() {
  const cache = useRef(new Map<string, Promise<HTMLImageElement>>());
  const loadingQueue = useRef(new Set<string>());

  const preloadImage = useCallback(
    (src: string, options: PreloadOptions = {}): Promise<HTMLImageElement> => {
      if (cache.current.has(src)) {
        return cache.current.get(src)!;
      }

      const promise = new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        const timeout = options.timeout || 10000;

        const timeoutId = setTimeout(() => {
          reject(new Error(`Image load timeout: ${src}`));
        }, timeout);

        img.onload = () => {
          clearTimeout(timeoutId);
          loadingQueue.current.delete(src);
          resolve(img);
        };

        img.onerror = () => {
          clearTimeout(timeoutId);
          loadingQueue.current.delete(src);
          cache.current.delete(src);
          reject(new Error(`Failed to load image: ${src}`));
        };

        loadingQueue.current.add(src);
        img.src = src;
      });

      cache.current.set(src, promise);
      return promise;
    },
    []
  );

  const clearCache = useCallback(() => {
    cache.current.clear();
    loadingQueue.current.clear();
  }, []);

  const getCacheStats = useCallback(() => {
    return {
      cached: cache.current.size,
      loading: loadingQueue.current.size,
    };
  }, []);

  return { preloadImage, clearCache, getCacheStats };
}
```

## 4. Testing Infrastructure

### Unit Testing Setup
**Recommendation**: Comprehensive testing with proper mocking.

```typescript
// src/components/__tests__/PanoramaViewer.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { PanoramaViewer } from '../PanoramaViewer';
import { PanoramaService } from '../../services/PanoramaService';

// Mock Marzipano
jest.mock('../../lib/marzipanoWrapper', () => ({
  createViewer: jest.fn(),
  createScene: jest.fn(),
}));

// Mock service
jest.mock('../../services/PanoramaService');
const mockPanoramaService = PanoramaService as jest.Mocked<typeof PanoramaService>;

describe('PanoramaViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    render(<PanoramaViewer refreshTrigger={0} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle configuration loading errors', async () => {
    mockPanoramaService.getInstance.mockReturnValue({
      loadConfiguration: jest.fn().mockRejectedValue(new Error('Load failed')),
    } as any);

    render(<PanoramaViewer refreshTrigger={0} />);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

### Integration Testing
**Recommendation**: End-to-end testing for critical user flows.

```typescript
// tests/e2e/panorama-viewer.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Panorama Viewer', () => {
  test('should load and display panoramic images', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initial load
    await expect(page.locator('#pano')).toBeVisible();
    
    // Test navigation
    await page.click('[data-testid="hotspot-1"]');
    await expect(page.locator('[data-testid="current-scene"]')).toContainText('Scene 2');
    
    // Test floor selector
    await page.click('[data-testid="floor-selector"]');
    await page.click('[data-testid="floor-2"]');
    
    // Verify scene change
    await expect(page.locator('[data-testid="current-floor"]')).toContainText('Floor 2');
  });

  test('should handle file upload workflow', async ({ page }) => {
    await page.goto('/upload');
    
    // Upload files
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(['test-data/test-image.jpg']);
    
    // Wait for upload completion
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible();
    
    // Navigate back and verify refresh
    await page.click('[data-testid="back-to-viewer"]');
    await expect(page.locator('#pano')).toBeVisible();
  });
});
```

## 5. Development Experience

### TypeScript Enhancements
**Recommendation**: Stricter type definitions and better type safety.

```typescript
// src/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: Record<string, any>;
  };
  timestamp: number;
}

export interface FileStatus {
  hasFiles: boolean;
  fileCount: number;
  hasPoses: boolean;
  hasImages: boolean;
  lastModified?: number;
}

export interface SceneData {
  id: string;
  name: string;
  imageUrl: string;
  floor: number;
  position: { x: number; y: number };
  rotation: number;
  northOffset?: number;
  linkHotspots: LinkHotspot[];
}

export interface LinkHotspot {
  id: string;
  target: string;
  position: { yaw: number; pitch: number };
  rotation: number;
  type: 'navigation' | 'info';
}
```

### Development Tools
**Recommendation**: Enhanced development and debugging tools.

```typescript
// src/components/DevTools.tsx (Development only)
import React, { useState } from 'react';
import { useMemoryMonitor } from '../hooks/useMemoryMonitor';

export function DevTools() {
  const [isOpen, setIsOpen] = useState(false);
  const memoryStats = useMemoryMonitor();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="dev-tools">
      <button onClick={() => setIsOpen(!isOpen)}>🔧 Dev Tools</button>
      
      {isOpen && (
        <div className="dev-panel">
          <h3>Memory Usage</h3>
          {memoryStats && (
            <div>
              <p>Used: {(memoryStats.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB</p>
              <p>Total: {(memoryStats.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB</p>
              <p>Limit: {(memoryStats.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
          
          <h3>Cache Status</h3>
          <button onClick={() => PanoramaService.getInstance().clearCache()}>
            Clear Cache
          </button>
          
          <h3>Scene Debug</h3>
          <button onClick={() => console.log('Current scenes:', window.debugScenes)}>
            Log Scenes
          </button>
        </div>
      )}
    </div>
  );
}
```

## 6. Documentation and Maintenance

### Code Documentation
**Recommendation**: Comprehensive JSDoc comments for complex functions.

```typescript
/**
 * Manages panoramic scene transitions with memory optimization
 * 
 * @param sceneId - Target scene identifier
 * @param options - Transition configuration
 * @param options.preload - Whether to preload adjacent scenes
 * @param options.disposeOld - Whether to dispose previous scene
 * @param options.transition - Transition animation settings
 * 
 * @returns Promise that resolves when scene is fully loaded
 * 
 * @throws {SceneLoadError} When scene fails to load
 * @throws {MemoryError} When memory limit is exceeded
 * 
 * @example
 * ```typescript
 * await switchScene('scene-001', {
 *   preload: true,
 *   disposeOld: true,
 *   transition: { duration: 500, easing: 'ease-in-out' }
 * });
 * ```
 */
export async function switchScene(
  sceneId: string,
  options: SceneTransitionOptions = {}
): Promise<void> {
  // Implementation
}
```

### Monitoring and Analytics
**Recommendation**: Performance monitoring and user analytics.

```typescript
// src/lib/analytics.ts
export class Analytics {
  private static instance: Analytics;
  
  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }
  
  trackSceneTransition(fromScene: string, toScene: string, duration: number) {
    this.track('scene_transition', {
      from_scene: fromScene,
      to_scene: toScene,
      duration_ms: duration,
      timestamp: Date.now()
    });
  }
  
  trackPerformance(metric: string, value: number, unit: string) {
    this.track('performance_metric', {
      metric,
      value,
      unit,
      timestamp: Date.now()
    });
  }
  
  private track(event: string, data: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Analytics: ${event}`, data);
    } else {
      // Send to analytics service
    }
  }
}
```

## Implementation Priority

### Phase 1 (High Priority)
1. ✅ Error boundary implementation
2. ✅ Service layer creation
3. ✅ Memory monitoring
4. ✅ API error standardization

### Phase 2 (Medium Priority)
1. State management consolidation
2. Comprehensive testing setup
3. Performance optimization hooks
4. Development tools

### Phase 3 (Low Priority)
1. Analytics implementation
2. Advanced caching strategies
3. Progressive loading
4. Documentation automation

## Conclusion

These recommendations focus on creating a more maintainable, testable, and performant codebase. The modular approach ensures that improvements can be implemented incrementally without disrupting existing functionality.

Key benefits:
- **Reduced technical debt**
- **Improved developer experience**
- **Better error handling and recovery**
- **Enhanced performance monitoring**
- **Easier testing and debugging**
- **More predictable behavior**