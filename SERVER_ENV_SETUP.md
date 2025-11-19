# Server .env Setup Instructions

## Required: Add Google Maps API Key to Server .env

To enable the geocoding helper on the server side, you need to add the Google Maps API key to your `server/.env` file.

### Steps:

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Open or create the `.env` file:**
   - If `.env` doesn't exist, create it
   - If it exists, open it for editing

3. **Add the following line to your `.env` file:**
   ```env
   GOOGLE_MAPS_API_KEY=AIzaSyBvg8I9zlnRVmpFK5amTfEQuK4n-BoerxI
   ```

4. **Your complete `server/.env` file should look like this:**
   ```env
   # MongoDB Configuration
   MONGODB_URI=your_mongodb_uri_here
   JWT_SECRET=your_jwt_secret_here
   PORT=5001

   # Google Maps API Key (Required for geocoding helper)
   GOOGLE_MAPS_API_KEY=AIzaSyBvg8I9zlnRVmpFK5amTfEQuK4n-BoerxI
   ```

5. **Restart your server** after adding the key:
   ```bash
   npm start
   ```

### What This Enables:

- ✅ Server-side geocoding (address → coordinates conversion)
- ✅ Reverse geocoding (coordinates → address)
- ✅ Using the `server/helpers/geocoding.js` helper function

### Note:

- The geocoding helper is optional - your app will work without it
- It's only needed if you want to convert addresses to coordinates on the server side
- The client-side Google Maps will work independently with `REACT_APP_GOOGLE_MAPS_API_KEY`

---

**After adding the key, restart your server for changes to take effect.**

