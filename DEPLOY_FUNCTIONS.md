# Deploy Firebase Cloud Functions

Your Cloud Functions are ready to deploy. Follow these steps:

## Prerequisites

You need to have the Firebase CLI installed and be logged in:

```bash
npm install -g firebase-cli
firebase login
```

## Step 1: Set Up Secrets

Firebase Functions v2 uses secrets for sensitive configuration. You need to set these up:

```bash
# Set GitHub OAuth credentials
firebase functions:secrets:set GITHUB_CLIENT_ID
# When prompted, paste: Ov23li8fMUwzM0T8U6Xz

firebase functions:secrets:set GITHUB_CLIENT_SECRET
# When prompted, paste your GitHub OAuth client secret

# Set Claude API key
firebase functions:secrets:set CLAUDE_API_KEY
# When prompted, paste your Claude API key
```

## Step 2: Build Functions

```bash
cd functions
npm install
npm run build
cd ..
```

## Step 3: Deploy Functions

```bash
firebase deploy --only functions
```

This will deploy three functions:
- `githubOauth` - Handles GitHub OAuth
- `generateFix` - Generates AI-powered security fixes
- `createPr` - Creates pull requests on GitHub

## Step 4: Verify Deployment

After deployment, you'll see URLs like:
```
✔  functions[us-central1-githubOauth(us-central1)] https://us-central1-af-b76a3.cloudfunctions.net/githubOauth
✔  functions[us-central1-generateFix(us-central1)] https://us-central1-af-b76a3.cloudfunctions.net/generateFix
✔  functions[us-central1-createPr(us-central1)] https://us-central1-af-b76a3.cloudfunctions.net/createPr
```

## Step 5: Update GitHub OAuth Callback

Make sure your GitHub OAuth App has the correct callback URL:

1. Go to https://github.com/settings/developers
2. Click on your OAuth App (Client ID: Ov23li8fMUwzM0T8U6Xz)
3. Update "Authorization callback URL" to include:
   - For local dev: `http://localhost:5173/github/callback`
   - For production: `https://YOUR_DOMAIN/github/callback`

## Testing

After deployment:

1. Rebuild your frontend: `npm run build`
2. Start dev server: `npm run dev`
3. Click "Connect GitHub" button
4. You should be redirected to GitHub for authorization
5. After approving, you'll be redirected back to your app

## Troubleshooting

### View Function Logs
```bash
firebase functions:log
```

### Test Functions Locally
```bash
firebase emulators:start
```

Then update `.env`:
```bash
VITE_FIREBASE_FUNCTIONS_URL=http://localhost:5001/af-b76a3/us-central1
```

### Check Secrets
```bash
firebase functions:secrets:access GITHUB_CLIENT_ID
firebase functions:secrets:access GITHUB_CLIENT_SECRET
firebase functions:secrets:access CLAUDE_API_KEY
```

## Common Errors

**"Failed to fetch"**: Functions haven't been deployed yet or URL is wrong
**"Secret not found"**: Run the secrets:set commands above
**"CORS error"**: Functions are configured with CORS, but verify they're deployed
