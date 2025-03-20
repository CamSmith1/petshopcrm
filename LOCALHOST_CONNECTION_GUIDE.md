# Local Development Setup Guide

## Current Issue

Your frontend is attempting to connect to a production API at `https://dog-services-backend.onrender.com/api/customers` instead of your local development backend. This is why customer data isn't being saved to your local Supabase database.

## How to Fix the Connection

1. **Ensure the backend is running locally**:
   - Make sure your local backend server is running on port 5000
   - Run `cd backend && npm start` if it's not already running

2. **Update environment variables**:
   - Verify the `.env` file in your frontend directory contains:
     ```
     REACT_APP_SKIP_MOCK=true
     REACT_APP_API_URL=http://localhost:5000/api
     ```

3. **Restart your frontend application**:
   - Stop your current frontend process
   - Run `cd frontend && npm start` to restart it
   - This is necessary for the environment variables to be reloaded

## Verifying the Connection

After restarting your frontend, you should see a log message in your browser console showing:
```
API base URL: http://localhost:5000/api
```

If you still see `https://dog-services-backend.onrender.com/api` in your logs or in the network requests, try:

1. **Hard refresh the browser**: Clear cache with Ctrl+F5 or Cmd+Shift+R 
2. **Check for hardcoded URLs**: There might be a hardcoded URL somewhere in the codebase
3. **Inspect .env loading**: Make sure your frontend is properly loading environment variables

## Testing the Customer Functionality

After ensuring the frontend connects to your local backend:

1. Add a new customer through the UI
2. Check your backend server console for logs
3. Verify data is written to your local Supabase database

## Fixing Production URLs in the Code

If your application is using hardcoded URLs instead of environment variables, you may need to:

1. Search for any instances of "render.com" in your codebase
2. Replace hardcoded URLs with environment variable references
3. Add appropriate fallbacks for local development

## Debugging Network Requests

If you're still having connection issues:

1. Open your browser's developer tools (F12)
2. Go to the Network tab
3. Try adding a customer and observe where the request is sent
4. Check for any CORS or other connection errors