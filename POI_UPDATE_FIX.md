# POI Update Fix

## Issue
The POI update functionality was failing with a `405 Method Not Allowed` error because the client-side code was sending a POST request to the update API endpoint, but the endpoint expects a PUT request.

## Root Cause
The update API endpoint (`/api/poi/update`) expects a `PUT` method, but the POIComponent was sending a `POST` request for both save and update operations.

```typescript
// API endpoint expects PUT method
if (req.method !== 'PUT') {
  return res.status(405).json({ error: 'Method not allowed' });
}
```

## Solution
Fixed the POIComponent to use the correct HTTP method based on the operation:
- **Save (new POI)**: POST method → `/api/poi/save`
- **Update (existing POI)**: PUT method → `/api/poi/update`

### POIComponent.tsx Changes
```typescript
// Before (incorrect)
const saveResponse = await fetch(isEditing ? '/api/poi/update' : '/api/poi/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestPayload)
});

// After (correct)
const saveResponse = await fetch(isEditing ? '/api/poi/update' : '/api/poi/save', {
  method: isEditing ? 'PUT' : 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestPayload)
});
```

## Files Modified
- `/src/components/poi/POIComponent.tsx` - Fixed `savePOI` function to use correct HTTP methods

## Testing
To test the fix:
1. Create a POI in any panorama project
2. Edit the POI (change name, description, or content)
3. Save the changes
4. Verify that the update succeeds without 405 errors

## API Endpoints Reference
- `POST /api/poi/save` - Create new POI
- `PUT /api/poi/update` - Update existing POI
- `DELETE /api/poi/delete` - Delete POI (with query parameters)

## Related Fixes
This fix complements the previous POI deletion fix that corrected parameter passing for the delete endpoint.