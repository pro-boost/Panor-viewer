# Circuit Breaker Solution for Refresh Loops

## Problem Description

The application was experiencing infinite refresh loops where:

1. File detection triggers would cause continuous refreshes
2. The `refreshTrigger` state changes would recreate the `checkForPanoramas` callback
3. This recreated callback would be added to `useEffect` dependencies, causing immediate
   re-execution
4. The cycle would repeat indefinitely, creating a refresh/loading loop

## Root Cause Analysis

### Primary Issues

1. **Stale Closure Problem**: The `checkForPanoramas` function was capturing outdated state values
2. **Dependency Loop**: `refreshTrigger` changes caused `checkForPanoramas` to recreate, which
   triggered `useEffect` again
3. **No Rate Limiting**: No mechanism to prevent rapid successive refresh attempts
4. **Missing Debouncing**: File detection could trigger multiple refreshes in quick succession

### Technical Details

```javascript
// PROBLEMATIC PATTERN:
useEffect(() => {
  checkForPanoramas(); // This function recreates on every refreshTrigger change
}, [checkForPanoramas]); // This dependency causes the loop
```

## Complete Solution Implementation

### 1. Client-Side Debouncing (index.tsx)

#### Added State Variables

```javascript
const [isRefreshing, setIsRefreshing] = useState(false);
const [lastFileCount, setLastFileCount] = useState(0);
const lastRefreshTime = useRef(0);
const [isCheckingFromVisibility, setIsCheckingFromVisibility] = useState(false);
```

#### Enhanced Refresh Logic

```javascript
const shouldRefresh =
  hasFiles &&
  !isRefreshing &&
  timeSinceLastRefresh > 2000 &&
  (isCheckingFromVisibility ||
    (hasPanoramas && currentFileCount !== lastFileCount && currentFileCount > 0));
```

#### Key Improvements

- **2-second minimum interval** between refreshes
- **File count comparison** to detect actual changes
- **Visibility-based triggers** for returning from upload page
- **Automatic refresh state reset** after 3 seconds

### 2. Component-Level Circuit Breaker (PanoramaViewer.tsx)

#### Circuit Breaker State

```javascript
const lastRefreshTrigger = useRef(0);
const refreshCount = useRef(0);
const refreshResetTimeout = useRef(null);
```

#### Protection Logic

```javascript
// Reset refresh count if enough time has passed
if (timeSinceLastRefresh > 10000) {
  refreshCount.current = 0;
}

refreshCount.current++;

// If too many refreshes in short time, ignore this trigger
if (refreshCount.current > 3) {
  console.warn('Too many refresh attempts, ignoring trigger to prevent infinite loop');
  return;
}
```

#### Features

- **Maximum 3 refreshes** in a 10-second window
- **Automatic reset** after 15 seconds of inactivity
- **Detailed logging** for debugging
- **Graceful degradation** when limits are exceeded

### 3. Server-Side Cache Prevention (check-files.ts)

#### Cache-Busting Headers

```javascript
res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
res.setHeader('Pragma', 'no-cache');
res.setHeader('Expires', '0');
```

#### Response Enhancement

```javascript
res.status(200).json({
  hasFiles,
  fileCount: totalFiles,
  hasPoses: posesExist,
  hasImages: imagesExist,
  timestamp: Date.now(), // For debugging
});
```

## Testing Scenarios

### Scenario 1: Normal File Upload

1. User uploads new images
2. Returns to main page (visibility change)
3. Single refresh triggered
4. New images displayed correctly

### Scenario 2: Rapid File Changes

1. Multiple file uploads in quick succession
2. Only first change triggers refresh
3. Subsequent changes ignored until debounce period
4. No infinite loops

### Scenario 3: System Stress Test

1. Rapid page switching
2. Multiple refresh attempts
3. Circuit breaker activates after 3 attempts
4. System remains stable

## Monitoring and Debugging

### Console Logs

- File change detection with detailed context
- Refresh trigger attempts and circuit breaker status
- Timing information for performance analysis
- Warning messages when limits are exceeded

### Debug Information

```javascript
console.log('File change detected, triggering panorama refresh...', {
  fromVisibility: isCheckingFromVisibility,
  fileCountChanged: currentFileCount !== lastFileCount,
  oldCount: lastFileCount,
  newCount: currentFileCount,
  timeSinceLastRefresh,
});
```

## Performance Impact

### Positive Effects

- **Eliminated infinite loops**: No more CPU/memory waste
- **Reduced API calls**: Debouncing prevents excessive requests
- **Better user experience**: Smooth transitions without loading flicker
- **Improved stability**: Circuit breaker prevents system overload

### Minimal Overhead

- Small memory footprint for tracking variables
- Negligible performance impact from timing checks
- Clean timeout management prevents memory leaks

## Future Considerations

### Potential Enhancements

1. **Adaptive thresholds**: Adjust limits based on system performance
2. **User feedback**: Show loading states during refresh operations
3. **Metrics collection**: Track refresh patterns for optimization
4. **Configuration options**: Allow users to adjust refresh sensitivity

### Maintenance Notes

- Monitor console logs for unusual refresh patterns
- Adjust timing thresholds based on user feedback
- Consider implementing exponential backoff for repeated failures
- Review and update circuit breaker limits as needed

## Code Quality Improvements

### Best Practices Implemented

- **Separation of concerns**: Client and component-level protection
- **Defensive programming**: Multiple layers of protection
- **Clear logging**: Comprehensive debugging information
- **Resource cleanup**: Proper timeout and reference management

### Technical Debt Reduction

- Eliminated problematic dependency patterns
- Improved state management consistency
- Enhanced error handling and recovery
- Better separation of refresh logic and UI updates

## Conclusion

This circuit breaker solution provides comprehensive protection against refresh loops while
maintaining the application's responsiveness to legitimate file changes. The multi-layered approach
ensures system stability under various usage patterns and provides clear debugging information for
future maintenance.

The implementation successfully resolves the infinite refresh loop issue while preserving all
intended functionality for detecting and displaying new panoramic images.
