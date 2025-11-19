# ✅ Owner Email Updated

## Changes Made

### 1. Owner Account Updated
- **Old Email:** `sanjayk.1234@gmail.com`
- **New Email:** `sanjayk.1234it@kongu.edu`
- **Password:** `Sanjayk*1` (unchanged)
- **File:** `server/setupSampleListings.js`

### 2. All Listings Updated
- **All 10 sample listings** now have `ownerEmail: 'sanjayk.1234it@kongu.edu'`
- This ensures **ALL requests from users go to this owner**
- **File:** `server/setupSampleListings.js`

### 3. Controller Updated
- **File:** `server/controllers/propertyRequestController.js`
- Updated `getOwnerRequests` to show all requests for `sanjayk.1234it@kongu.edu`
- Updated `updateRequestStatus` to allow this owner to accept any request

## Test Credentials

### Owner Account (Receives ALL Requests):
- **Email:** `sanjayk.1234it@kongu.edu`
- **Password:** `Sanjayk*1`
- **Role:** `owner`
- **Special:** Can see and accept ALL requests from all users

### User Account (Sends Requests):
- **Email:** `sanjayk.1234it@kongu.edu` (or any other user)
- **Password:** `Sanjayk*1`
- **Role:** `user`

## How It Works

1. **User sends request** → Request is created with listing ID
2. **Owner logs in** → `sanjayk.1234it@kongu.edu` sees ALL requests
3. **Owner accepts/rejects** → Status updates immediately

## Next Steps

1. **Run seed script** to update database:
   ```bash
   cd server
   node setupSampleListings.js
   ```

2. **Test the flow:**
   - Login as user → Send request to any property
   - Login as owner (`sanjayk.1234it@kongu.edu`) → See all requests
   - Accept/Reject requests

## Important Notes

- All sample listings now belong to `sanjayk.1234it@kongu.edu`
- This owner can see and manage ALL requests (for testing)
- In production, each listing should have its actual owner

