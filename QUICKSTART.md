# Quick Start - Deploy Firebase Functions

The error you're seeing happens because the Firebase Cloud Functions haven't been deployed yet.

## Quick Deploy Steps

### 1. Install Firebase CLI (if needed)
```bash
npm install -g firebase-cli
firebase login
```

### 2. Set Up Secrets
```bash
firebase functions:secrets:set GITHUB_CLIENT_ID
# Paste: Ov23li8fMUwzM0T8U6Xz

firebase functions:secrets:set GITHUB_CLIENT_SECRET
# Paste your GitHub OAuth client secret

firebase functions:secrets:set CLAUDE_API_KEY
# Paste your Claude API key (sk-ant-api03-...)
```

### 3. Deploy
```bash
firebase deploy --only functions
```

### 4. Test
After deployment completes, refresh your app and try "Connect GitHub" again.

---

**Note:** The functions are already built and ready to deploy. The Firebase project (af-b76a3) is already configured.

See `DEPLOY_FUNCTIONS.md` for detailed troubleshooting and testing steps.
