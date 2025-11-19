# Debug Property Requests Issue

## Problem
Requests from user `sanjayk.123@kongu.edu` are not appearing in owner dashboard.

## Debugging Steps Added

### 1. Enhanced Logging

**Server Side (`propertyRequestController.js`):**
- ✅ Logs when request is created with full details
- ✅ Logs all requests in database after creation
- ✅ Logs when owner requests are fetched
- ✅ Logs listing ownership information

**Client Side:**
- ✅ Logs when request is sent
- ✅ Logs when requests are loaded in dashboard
- ✅ Shows detailed request information

### 2. Check Server Console

When you send a request, check the server console for:
```
✅ Property request created successfully: { ... }
📊 Total requests in database: X
```

When owner loads dashboard, check for:
```
getOwnerRequests called: { ownerId: ..., ownerEmail: ... }
sanjayk.1234@gmail.com - Found all requests: X
```

### 3. Check Browser Console

When user sends request:
```
📤 Sending property request: { ... }
✅ Request sent successfully: { ... }
```

When owner loads dashboard:
```
📥 Property requests loaded: { count: X, ... }
```

## Common Issues to Check

1. **User Account Not Created:**
   - Run seed script: `cd server && node setupSampleListings.js`
   - Verify user `sanjayk.123@kongu.edu` exists

2. **Listing ID Mismatch:**
   - Check if `listingId` sent matches actual listing `_id` in database
   - Verify listing has `ownerEmail` or `owner` field set

3. **Authentication Issues:**
   - Verify user is logged in when sending request
   - Verify owner is logged in when viewing dashboard
   - Check JWT token is valid

4. **Database Connection:**
   - Verify MongoDB is connected
   - Check if PropertyRequest collection exists
   - Verify requests are being saved

## Quick Test

1. **Send Request:**
   - Login as user: `sanjayk.123@kongu.edu` / `Sanjayk*1`
   - Go to any property
   - Click "Request Property Info"
   - Send request
   - Check browser console for logs

2. **View as Owner:**
   - Login as owner: `sanjayk.1234@gmail.com` / `Sanjayk*1`
   - Go to Dashboard
   - Check "Property Inquiries" section
   - Click refresh button
   - Check browser console for logs

3. **Check Server Logs:**
   - Look for request creation logs
   - Look for owner request fetch logs
   - Verify data is in database

## Manual Database Check

If needed, you can check MongoDB directly:
```javascript
// In MongoDB shell or Compass
db.propertyrequests.find().pretty()
db.listings.find({}, {title: 1, ownerEmail: 1, owner: 1}).pretty()
```

