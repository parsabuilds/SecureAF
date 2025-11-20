# GitHub OAuth Setup Guide

This guide will walk you through setting up GitHub OAuth for the "Generate Fix PR" feature.

## Prerequisites

- A GitHub account
- Access to create OAuth apps in your GitHub account
- Claude API key from Anthropic

## Step 1: Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" in the left sidebar
3. Click "New OAuth App" button

### Fill in the application details:

- **Application name:** SecureAF (or your preferred name)
- **Homepage URL:** `http://localhost:5173` (for development)
  - For production: Use your actual domain (e.g., `https://yourdomain.com`)
- **Application description:** Security analysis and automated PR generation
- **Authorization callback URL:** `http://localhost:5173/github/callback`
  - For production: `https://yourdomain.com/github/callback`

4. Click "Register application"

## Step 2: Get Your Credentials

After creating the app, you'll see:

1. **Client ID** - Copy this value
2. **Client Secret** - Click "Generate a new client secret" and copy it immediately (you won't be able to see it again)

## Step 3: Configure Environment Variables

Update your `.env` file with the credentials:

```bash
# GitHub OAuth Configuration (Frontend)
VITE_GITHUB_CLIENT_ID=your_actual_client_id_here

# GitHub OAuth (Backend - for Edge Functions)
GITHUB_CLIENT_ID=your_actual_client_id_here
GITHUB_CLIENT_SECRET=your_actual_client_secret_here

# Claude API Configuration
CLAUDE_API_KEY=your_claude_api_key_here
```

### Getting Claude API Key:

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to "API Keys"
4. Create a new API key
5. Copy the key to your `.env` file

## Step 4: Configure Supabase Edge Functions

The Edge Functions need access to these environment variables. You'll need to set them in your Supabase project:

### Using Supabase Dashboard:

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to "Project Settings" → "Edge Functions" → "Manage secrets"
4. Add the following secrets:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `CLAUDE_API_KEY`

## Step 5: Deploy Edge Functions

Deploy the Edge Functions to Supabase:

```bash
# If you have Supabase CLI installed
supabase functions deploy github-oauth
supabase functions deploy generate-fix
supabase functions deploy create-pr
```

**Note:** The Supabase MCP tools handle deployment automatically, but you may need to manually deploy if there are issues.

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Run an analysis on a repository
3. Click "Generate Fix PR" button
4. You should be redirected to GitHub for authorization
5. After authorizing, you'll be redirected back to your app
6. The AI will generate a fix and create a PR

## Security Best Practices

### DO:
- ✅ Keep your Client Secret secure and never commit it to git
- ✅ Use different OAuth apps for development and production
- ✅ Regularly rotate your API keys
- ✅ Only request the minimum required OAuth scopes (`repo`)
- ✅ Store tokens securely (they're stored in localStorage currently - consider upgrading to httpOnly cookies)

### DON'T:
- ❌ Never expose your Client Secret in frontend code
- ❌ Don't commit `.env` files to version control (it's in `.gitignore`)
- ❌ Don't share your API keys publicly

## Troubleshooting

### "OAuth credentials not configured" error
- Make sure all environment variables are set in your `.env` file
- Restart your development server after changing `.env`
- Verify Edge Functions have access to the secrets

### "Failed to authenticate with GitHub" error
- Check that your Client ID and Secret are correct
- Verify the callback URL matches exactly (including protocol and port)
- Make sure you're using the correct OAuth app (dev vs production)

### "Failed to generate fix" error
- Verify your Claude API key is valid and has credits
- Check the Edge Function logs in Supabase Dashboard
- Ensure the repository file is accessible

### Redirect issues
- Callback URL must match exactly in both GitHub OAuth app settings and your code
- For localhost, use `http://localhost:5173/github/callback`
- For production, use `https://yourdomain.com/github/callback`

## OAuth Flow Diagram

```
1. User clicks "Generate Fix PR"
   ↓
2. App redirects to GitHub OAuth (with client_id, redirect_uri, scope)
   ↓
3. User authorizes the app on GitHub
   ↓
4. GitHub redirects back to app with authorization code
   ↓
5. App sends code to Supabase Edge Function
   ↓
6. Edge Function exchanges code for access token
   ↓
7. Access token stored in localStorage
   ↓
8. App uses token to:
   - Fetch file content from GitHub
   - Generate AI fix via Claude
   - Create branch and PR on GitHub
```

## Required GitHub OAuth Scopes

The app requests the following scope:

- **`repo`** - Full control of private repositories
  - This is required to:
    - Read repository contents
    - Create branches
    - Create pull requests
    - Commit changes

## Next Steps

After setup is complete:

1. Test with a sample repository
2. Review generated PRs for quality
3. Adjust Claude prompts if needed (in `generate-fix` Edge Function)
4. Consider adding webhooks for PR status updates
5. Implement PR analytics and tracking

## Support

If you encounter issues:

1. Check the browser console for errors
2. Review Supabase Edge Function logs
3. Verify all environment variables are set correctly
4. Ensure your GitHub OAuth app is configured properly

## Production Deployment Checklist

Before deploying to production:

- [ ] Create a new GitHub OAuth app for production
- [ ] Update callback URL to production domain
- [ ] Set all production environment variables in Supabase
- [ ] Deploy all Edge Functions
- [ ] Test the full OAuth flow in production
- [ ] Set up monitoring and error tracking
- [ ] Consider implementing token refresh logic
- [ ] Add rate limiting on Edge Functions
- [ ] Review security policies and RLS rules
