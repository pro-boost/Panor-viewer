# POI Deletion Fix

## Issue
The POI deletion functionality was failing with a `400 Bad Request` error because the client-side code was sending incorrect parameters to the delete API endpoint.

## Root Cause
The delete API endpoint (`/api/poi/delete`) expects query parameters:
- `projectId` - The project identifier
- `id` - The POI identifier  
- `useIndividual` - Boolean flag for individual file handling

However, the client-side code was sending these parameters in different ways:
1. **POIComponent.tsx**: Sending as JSON body with `DELETE` method
2. **poi-management.tsx**: Sending as JSON body with `POST` method

## Solution
Fixed both client-side implementations to send parameters as query parameters with the correct `DELETE` method:

### POIComponent.tsx Changes
```typescript
// Before (incorrect)
const response = await fetch('/api/poi/delete', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ poiId, projectId })
});

// After (correct)
const params = new URLSearchParams({
  projectId: projectId,
  id: poiId,
  useIndividual: 'false'
});
const response = await fetch(`/api/poi/delete?${params.toString()}`, {
  method: 'DELETE'
});
```

### poi-management.tsx Changes
```typescript
// Before (incorrect)
const response = await fetch('/api/poi/delete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    projectId: poiToDelete.projectId, 
    poiId: poiToDelete.poiId, 
    useIndividual: useIndividualFiles 
  })
});

// After (correct)
const params = new URLSearchParams({
  projectId: poiToDelete.projectId,
  id: poiToDelete.poiId,
  useIndividual: useIndividualFiles.toString()
});
const response = await fetch(`/api/poi/delete?${params.toString()}`, {
  method: 'DELETE'
});
```

## Files Modified
1. `/src/components/poi/POIComponent.tsx` - Fixed `handleDeletePOI` function
2. `/src/pages/poi-management.tsx` - Fixed `confirmDeletePOI` function

## Testing
To test the fix:
1. Create a POI in any panorama project
2. Try to delete it from the POI preview or POI management page
3. Verify that the deletion succeeds without 400 errors

## API Endpoint Reference
The delete endpoint expects these query parameters:
- `projectId` (required): Project identifier
- `id` (required): POI identifier
- `useIndividual` (optional): Whether to use individual POI files (default: false)

Example: `/api/poi/delete?projectId=myproject&id=poi123&useIndividual=false`