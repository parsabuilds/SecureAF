# Deploy Fixed Claude API Integration

## What Was Fixed

The Claude API call in `generateFix` function has been updated to use the correct modern API format:

### Changes Made:

1. **Removed deprecated `system` parameter** - Claude API Messages endpoint doesn't support `system` in the request body for this API version
2. **Updated model** - Changed from `claude-3-5-sonnet-20241022` to `claude-3-sonnet-20240229` (stable, widely available model)
3. **Fixed headers** - Using exact header format: `x-api-key`, `anthropic-version`, `content-type`
4. **Combined prompts** - System instructions now included in the user message content
5. **Reduced max_tokens** - Changed from 8000 to 4096 (more reasonable for most fixes)

## Deployment Steps

### 1. Ensure Claude API Key is Set

```bash
# Check if secret exists
firebase functions:secrets:access CLAUDE_API_KEY

# If not set or needs updating
firebase functions:secrets:set CLAUDE_API_KEY
# Paste your Claude API key (starts with sk-ant-api03-)
```

### 2. Deploy the Updated Function

```bash
# From project root
firebase deploy --only functions:generateFix
```

Wait for deployment to complete. You should see:
```
✔  functions[us-central1-generateFix] Successful update operation.
```

### 3. Verify Deployment

```bash
# View recent logs
firebase functions:log --only generateFix
```

### 4. Test the Fix

1. Open your application in the browser
2. Analyze a repository (e.g., `facebook/react`)
3. Click on a security issue with severity "Critical" or "High"
4. Click "Generate Fix PR"
5. Connect GitHub if not already connected
6. Watch the progress - it should now work!

## Expected Behavior

When you click "Generate Fix PR", you should see:

1. **Generating AI-Powered Fix** (loading spinner)
2. **Review Before Creating PR** (shows the AI-generated fix with explanation)
3. **Create Pull Request** button becomes available
4. After clicking it: **Pull Request Created Successfully!**

## Troubleshooting

### Still Getting "Not Found" Error?

**Check your API key format:**
```bash
firebase functions:secrets:access CLAUDE_API_KEY
```

Your key should start with: `sk-ant-api03-`

If it doesn't, get a new one from: https://console.anthropic.com/settings/keys

### Getting "Rate Limit" Error?

Your Claude API account may have reached its quota. Check:
- https://console.anthropic.com/settings/limits

### Getting "Permission Denied" Error?

Your Claude API key may not have access to Claude 3. Try:
- Creating a new API key
- Checking your account tier at https://console.anthropic.com/

### View Detailed Logs

```bash
# Real-time logs
firebase functions:log --only generateFix --tail

# Or view in Firebase Console
# https://console.firebase.google.com/project/af-b76a3/functions/logs
```

Look for these log entries:
```
Calling Claude API with model: claude-3-sonnet-20240229
API Key present: true
API Key prefix: sk-ant-api03-...
```

If you see the error, it will now include the full response from Claude API.

## What Changed in the Code

**Before (incorrect):**
```typescript
body: JSON.stringify({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 8000,
  system: systemPrompt,  // ❌ Not supported in this format
  messages: [{ role: 'user', content: userPrompt }]
})
```

**After (correct):**
```typescript
body: JSON.stringify({
  model: 'claude-3-sonnet-20240229',
  max_tokens: 4096,
  messages: [
    {
      role: 'user',
      content: fullPrompt  // ✅ System instructions included here
    }
  ]
})
```

## Need Help?

If it's still not working after these steps:

1. Share the logs from: `firebase functions:log --only generateFix`
2. Verify your API key at: https://console.anthropic.com/settings/keys
3. Check Claude API status: https://status.anthropic.com/
