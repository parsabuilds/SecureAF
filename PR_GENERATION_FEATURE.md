# Generate Fix PR Feature

## Overview

The "Generate Fix PR" feature enables automatic generation of pull requests that fix security vulnerabilities detected in your repositories. It combines AI-powered code analysis with GitHub's API to create production-ready security fixes.

## How It Works

### 1. AI-Powered Fix Generation

When you click "Generate Fix PR" on a security issue:

1. The system fetches the problematic file from GitHub
2. Sends the issue details and code to Claude AI (Sonnet 3.5)
3. Claude analyzes the security vulnerability using a comprehensive security checklist
4. Generates a complete, production-ready fix with explanations
5. Returns confidence score and list of changes made

### 2. Security Analysis Checklist

Claude uses the following checklist to ensure comprehensive fixes:

- ✅ **Input Validation** - Proper sanitization of user inputs
- ✅ **Authentication/Authorization** - Correct access controls
- ✅ **SQL Injection** - Parameterized statements
- ✅ **XSS Protection** - Proper output encoding
- ✅ **Secrets Management** - No hardcoded credentials
- ✅ **Dependency Security** - Known vulnerable packages
- ✅ **CORS Configuration** - Proper origin restrictions
- ✅ **Error Handling** - No sensitive data in errors
- ✅ **Cryptography** - Strong, modern algorithms
- ✅ **API Security** - Rate limiting and authentication

### 3. Pull Request Creation

After reviewing the AI-generated fix:

1. Creates a new branch with naming convention: `fix/security-{severity}-{issue-id}`
2. Commits the fixed code with descriptive message
3. Opens a pull request with:
   - Clear title indicating severity and issue
   - Detailed description of the security problem
   - Explanation of what changed
   - List of modified files
   - SecureAF branding and reminder to review carefully

## User Interface

### Top-Level "Generate Fix PR" Button

Located in the results dashboard header:
- **Enabled** when there are critical or high-severity issues with file paths
- **Disabled** when no actionable issues are found
- **Gradient blue-to-indigo** styling with sparkle icon
- Opens modal for the first critical/high issue found

### Per-Issue "Generate Fix PR" Buttons

Each critical or high-severity issue card has:
- Expandable button at the bottom of expanded issues
- Only shown for issues with file paths (where fixes can be applied)
- Same styling as top-level button

### PR Generation Modal

Multi-step modal interface:

#### Step 1: GitHub Authentication
- Explains why GitHub access is needed
- "Connect with GitHub" button
- Shows required OAuth scope (`repo`)
- Redirects to GitHub OAuth flow

#### Step 2: Generating Fix
- Loading animation
- Status: "Generating AI-Powered Fix..."
- Shows progress message

#### Step 3: Review Fix
- **Issue Details Card** - Shows severity, category, title, description
- **Explanation** - AI's detailed explanation of the fix
- **Changes Summary** - Bulleted list of specific changes
- **Code Preview** - Scrollable diff showing the fixed code
- **Confidence Score** - AI's confidence level (0-100%)
- **Action Buttons** - "Cancel" or "Create Pull Request"

#### Step 4: Creating PR
- Loading animation
- Status: "Creating Pull Request..."

#### Step 5: Success
- Success checkmark
- "Pull Request Created Successfully!" message
- **"View Pull Request"** button linking directly to GitHub PR

#### Error Step
- Error icon
- Clear error message
- "Close" button

## Architecture

### Frontend Components

```
src/
├── components/
│   ├── ResultsDashboard.tsx     # Main dashboard with PR buttons
│   └── PRGenerationModal.tsx    # Modal for PR generation flow
└── services/
    └── githubService.ts         # GitHub OAuth and API interactions
```

### Backend Edge Functions

```
supabase/functions/
├── github-oauth/
│   └── index.ts                 # Handles OAuth code exchange
├── generate-fix/
│   └── index.ts                 # AI-powered fix generation with Claude
└── create-pr/
    └── index.ts                 # Creates branch and PR on GitHub
```

### Database Schema

```sql
github_tokens          # Stores OAuth access tokens
pr_generation_jobs     # Tracks PR creation jobs
generated_fixes        # Stores AI-generated fixes
```

## Security Features

### OAuth Security
- State parameter validation (CSRF protection)
- Tokens stored in localStorage (consider upgrading to httpOnly cookies)
- Minimum required scopes requested
- Separate client IDs for dev/production

### Code Security
- All API keys stored server-side in Supabase Edge Functions
- No secrets exposed in frontend code
- RLS policies on all database tables
- Validation of GitHub responses

### AI Security
- Comprehensive security checklist in Claude prompts
- Confidence scoring for generated fixes
- Human review required before merging
- Changes clearly documented

## Configuration

### Required Environment Variables

```bash
# Frontend (.env)
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend (Supabase Edge Functions Secrets)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
CLAUDE_API_KEY=your_claude_api_key
```

See `SETUP_GITHUB_OAUTH.md` for detailed setup instructions.

## Limitations & Considerations

### Current Limitations

1. **Single File Fixes** - Currently generates one PR per issue per file
2. **Public Repositories** - Works best with public repos (private repos require proper OAuth)
3. **File Size** - Large files (>100KB) may not be processed
4. **Language Support** - Best results with JavaScript/TypeScript (other languages supported but may vary)
5. **No Tests** - Generated fixes don't include test updates (yet)

### Best Practices

1. **Always Review PRs** - AI-generated code should be reviewed before merging
2. **Test Thoroughly** - Run your test suite against the PR
3. **Check Side Effects** - Ensure the fix doesn't break other functionality
4. **Verify Security** - Confirm the fix actually addresses the vulnerability
5. **Consider Context** - AI doesn't have full project context

### Improvement Opportunities

- [ ] Add test generation for fixes
- [ ] Support multi-file fixes in single PR
- [ ] Implement fix caching to avoid regenerating
- [ ] Add webhooks for PR status updates
- [ ] Implement token refresh for long-term usage
- [ ] Add analytics and success tracking
- [ ] Support custom Claude prompts per project
- [ ] Add fix templates for common patterns

## API Reference

### GitHub Service Methods

```typescript
// Initiate OAuth flow
githubService.initiateOAuth(): void

// Handle OAuth callback
githubService.handleCallback(code: string, state: string): Promise<GitHubAuthData>

// Check authentication status
githubService.isAuthenticated(): boolean

// Get user info
githubService.getUser(): GitHubUser | null

// Fetch file content
githubService.fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  branch?: string
): Promise<string>

// Generate AI fix
githubService.generateFix(
  issue: SecurityIssue,
  fileContent: string,
  repoContext?: RepoContext
): Promise<FixResponse>

// Create pull request
githubService.createPR(
  repoOwner: string,
  repoName: string,
  issue: SecurityIssue,
  fix: GeneratedFix
): Promise<PRResponse>
```

### Edge Function Endpoints

```
POST /functions/v1/github-oauth
  Body: { code: string }
  Returns: { access_token, token_type, scope, user }

POST /functions/v1/generate-fix
  Body: { issue, fileContent, repoContext? }
  Returns: { success, fix: { original_content, fixed_content, explanation, confidence, changes_summary } }

POST /functions/v1/create-pr
  Body: { githubToken, repoOwner, repoName, issue, fix }
  Returns: { success, pr: { url, number, branch, title } }
```

## Testing

### Manual Testing Checklist

- [ ] OAuth flow completes successfully
- [ ] Fix generation works for critical issues
- [ ] Fix generation works for high issues
- [ ] Low/medium issues don't show PR button
- [ ] Modal closes properly
- [ ] PR is created on GitHub
- [ ] PR has correct title and description
- [ ] Branch naming is correct
- [ ] File changes are applied correctly
- [ ] Error handling works for invalid repos
- [ ] Error handling works for API failures

### Test Repositories

Good repositories to test with:
1. Small repos with known vulnerabilities
2. Your own test repositories
3. Popular open-source projects (be careful not to spam)

## Troubleshooting

See `SETUP_GITHUB_OAUTH.md` for detailed troubleshooting guide.

### Common Issues

**"Not authenticated with GitHub"**
- Solution: Click "Connect with GitHub" button

**"Failed to generate fix"**
- Check Claude API key is valid
- Verify file is accessible
- Check Edge Function logs

**"Failed to create pull request"**
- Verify you have write access to repository
- Check if branch already exists
- Ensure GitHub token is valid

## Future Enhancements

### Planned Features

1. **Batch PR Generation** - Create PRs for multiple issues at once
2. **Fix Templates** - Predefined templates for common vulnerabilities
3. **Test Generation** - Auto-generate tests for fixes
4. **CI Integration** - Automatically run tests on PRs
5. **Fix History** - Track success rate of generated fixes
6. **Custom Prompts** - Allow users to customize Claude prompts
7. **Multi-language Support** - Optimized prompts per language
8. **Collaborative Review** - Team review workflow before PR creation

### Analytics Ideas

- Track fix success rate
- Measure time to merge
- Identify most common fix patterns
- Calculate confidence correlation with merge success

## Credits

- **AI Model**: Claude 3.5 Sonnet by Anthropic
- **Git Platform**: GitHub
- **Backend**: Supabase Edge Functions
- **UI Framework**: React + TypeScript + Tailwind CSS

## License

Part of SecureAF - Security analysis platform for developers.
