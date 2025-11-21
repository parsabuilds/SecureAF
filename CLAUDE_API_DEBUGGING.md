# Debugging Claude API "Not Found" Error

## The Problem
When clicking "Generate Fix PR", you're getting: `Claude API error: Not Found`

## Root Causes

The "Not Found" (404) error from Claude API typically means one of these issues:

### 1. **API Key Not Properly Set in Firebase (Most Likely)**

Even though you set the secret locally, it needs to be deployed to Firebase Cloud:

```bash
# Check if the secret exists in Firebase
firebase functions:secrets:access CLAUDE_API_KEY

# If it says "Secret not found" or shows nothing, set it:
firebase functions:secrets:set CLAUDE_API_KEY
# Paste your Claude API key when prompted (should start with sk-ant-api03-)
```

**Important:** After setting secrets, you MUST redeploy the functions:

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### 2. **Wrong API Key Format**

Claude API keys should look like: `sk-ant-api03-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

If your key doesn't start with `sk-ant-`, it's not valid.

### 3. **API Endpoint Issue**

The code uses: `https://api.anthropic.com/v1/messages`

This is correct for Claude API, but verify:
- You have API access enabled for your Anthropic account
- Your API key has the correct permissions
- You're not using a Console API key (use an API key from https://console.anthropic.com/settings/keys)

### 4. **Model Name Issue**

The code uses: `claude-3-5-sonnet-20241022`

This model exists, but if you have an older API key or account, you might need to:
- Verify you have access to Claude 3.5 Sonnet
- Check if your API tier supports this model

## Step-by-Step Fix

### Step 1: Verify Your Claude API Key

1. Go to https://console.anthropic.com/settings/keys
2. Create a new API key if needed
3. Copy the FULL key (starts with `sk-ant-api03-`)

### Step 2: Set the Secret in Firebase

```bash
# From your project root directory
firebase functions:secrets:set CLAUDE_API_KEY
# When prompted, paste the FULL API key

# Verify it's set
firebase functions:secrets:access CLAUDE_API_KEY
# You should see your key (partially masked)
```

### Step 3: Rebuild and Redeploy Functions

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions:generateFix
```

Wait for deployment to complete. You should see:
```
✔  functions[us-central1-generateFix(us-central1)] Successful update operation.
```

### Step 4: Test Again

1. Refresh your application page
2. Run an analysis on a repository
3. Click "Generate Fix PR" on a Critical or High severity issue
4. It should now work

## Viewing Logs for Debugging

To see what's actually happening:

```bash
# View real-time logs
firebase functions:log --only generateFix

# Or view in Firebase Console
# https://console.firebase.google.com/project/af-b76a3/functions/logs
```

Look for these log messages:
- `Calling Claude API with model: claude-3-5-sonnet-20241022`
- `API Key present: true`
- `API Key starts with: sk-ant-api...`

If you see `API Key present: false`, the secret isn't properly configured.

## Alternative: Test with a Simple Model

If you want to verify the API key works first, you can temporarily change the model to an older one:

In `functions/src/generate-fix.ts`, line 143:

```typescript
// Change from:
model: 'claude-3-5-sonnet-20241022',

// To:
model: 'claude-3-sonnet-20240229',
```

Then rebuild and redeploy. If this works, the issue is with model access.

## Still Not Working?

Check these:

1. **Billing**: Make sure your Anthropic account has billing enabled
2. **Rate Limits**: You haven't exceeded your API quota
3. **Network**: Firebase Functions can reach api.anthropic.com (shouldn't be an issue but worth checking)

## Contact Information

If none of this works:
1. Check Firebase Function logs: `firebase functions:log`
2. Check Anthropic API status: https://status.anthropic.com/
3. Verify your API key at: https://console.anthropic.com/settings/keys
