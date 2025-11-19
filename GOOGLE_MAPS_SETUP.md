# Google Maps API Setup Guide

## Issue
The application is showing "This page can't load Google Maps correctly" error. This happens when the Google Maps API key is missing, invalid, or not properly configured.

## Solution

### Step 1: Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Library**
4. Search for and enable the following APIs:
   - **Maps JavaScript API** (Required)
   - **Places API** (Required for search functionality)
   - **Geocoding API** (Optional, for server-side geocoding)

### Step 2: Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy your API key

### Step 3: Configure API Key Restrictions (Recommended)

1. Click on your API key to edit it
2. Under **Application restrictions**, select **HTTP referrers (web sites)**
3. Add the following referrers:
   ```
   http://localhost:3000/*
   http://localhost:3000
   ```
4. For production, add your domain:
   ```
   https://yourdomain.com/*
   https://yourdomain.com
   ```
5. Under **API restrictions**, select **Restrict key**
6. Select only the APIs you enabled:
   - Maps JavaScript API
   - Places API
   - Geocoding API (if enabled)
7. Click **Save**

### Step 4: Add API Key to Project

1. Create a file named `.env` in the `client` directory:
   ```bash
   cd client
   touch .env
   ```

2. Add your API key to the `.env` file:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. **Important**: Restart your development server after adding the `.env` file:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart
   npm start
   ```

### Step 5: Verify Setup

1. The map should load without errors
2. You should be able to search for locations
3. The map should display markers for properties

## Troubleshooting

### Error: "This page can't load Google Maps correctly"

**Possible causes:**
1. **API key missing**: Check that `.env` file exists and contains the key
2. **API key invalid**: Verify the key is correct in Google Cloud Console
3. **APIs not enabled**: Ensure Maps JavaScript API and Places API are enabled
4. **Restrictions too strict**: Check that `localhost:3000` is in allowed referrers
5. **Billing not enabled**: Google Maps requires billing to be enabled (free tier available)

### Error: "RefererNotAllowedMapError"

**Solution**: Add `http://localhost:3000/*` to your API key's HTTP referrer restrictions.

### Error: "ApiNotActivatedMapError"

**Solution**: Enable the Maps JavaScript API in Google Cloud Console.

### Map loads but search doesn't work

**Solution**: Enable the Places API in Google Cloud Console.

## Free Tier Limits

Google Maps offers a free tier with the following limits:
- **Maps JavaScript API**: $200 free credit per month
- **Places API**: $200 free credit per month
- This is typically enough for development and small applications

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use API key restrictions** to limit usage
3. **Rotate keys** if compromised
4. **Monitor usage** in Google Cloud Console
5. **Set up billing alerts** to avoid unexpected charges

## Production Deployment

For production:
1. Add your production domain to API key restrictions
2. Consider using environment variables in your hosting platform
3. Set up usage quotas and alerts
4. Monitor API usage regularly

## Alternative: Disable Maps (Development Only)

If you don't need maps for development, you can temporarily disable the map component by commenting it out in `ShowList99Acres.jsx`:

```jsx
{/* Temporarily disabled for development */}
{/* <EnhancedPropertySearch onResults={setListings} /> */}
```

## Need Help?

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)

