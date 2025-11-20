# SecureCode - Security Analysis Platform for Vibe Coders

## Project Vision
A beautiful, easy-to-use security analysis platform that helps non-professional programmers identify and fix security vulnerabilities before deploying to production.

## Target Audience
- No-code/low-code developers
- Junior developers
- Indie hackers
- Anyone who codes but isn't a security expert

---

## V1 MVP Scope (Current Version)

### Core Features
1. **Public GitHub Repo Analysis**
   - User pastes public repo URL
   - System clones and analyzes repo
   - Returns comprehensive security report

2. **Security Analysis Categories** (Weighted)
   - **CRITICAL (40% weight)**
     - Exposed secrets/API keys in code
     - Known vulnerable dependencies (CVE checks)
     - SQL injection patterns
     - XSS vulnerabilities

   - **HIGH (35% weight)**
     - Authentication/Authorization flaws
     - Insecure CORS configuration
     - Missing input validation
     - Unsafe deserialization

   - **MEDIUM (20% weight)**
     - Missing security headers (CSP, X-Frame-Options, etc.)
     - Weak password policies
     - Insecure communication patterns
     - Outdated dependencies (non-critical)

   - **LOW (5% weight)**
     - Code quality issues that could lead to bugs
     - Missing environment variable usage
     - Hardcoded URLs/configurations

3. **Beautiful Dashboard**
   - Overall security score (0-100)
   - Color-coded issue categories
   - Expandable issue cards with details
   - Clear, actionable recommendations

4. **Landing Page**
   - Google Antigravity-inspired design
   - Simple, stunning, minimalist
   - Large search box for repo URL
   - Clear value proposition

### Technical Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase Edge Functions
- **Database**: Supabase (PostgreSQL)
- **AI Analysis**: Claude API (Haiku 3.5 for cost efficiency)
- **Version Control**: GitHub API

### Architecture

#### Database Schema
```
sessions
- id (uuid)
- repo_url (text)
- repo_name (text)
- analysis_status (enum: pending, analyzing, completed, failed)
- security_score (integer 0-100)
- created_at (timestamp)
- completed_at (timestamp)

issues
- id (uuid)
- session_id (uuid, foreign key)
- severity (enum: critical, high, medium, low)
- category (text)
- title (text)
- description (text)
- file_path (text)
- line_number (integer)
- code_snippet (text)
- recommendation (text)
- created_at (timestamp)

repositories (cache)
- id (uuid)
- repo_url (text)
- repo_name (text)
- last_analyzed (timestamp)
- stars (integer)
- language (text)
```

#### Edge Functions
1. **analyze-repo** - Main analysis function
   - Accepts repo URL
   - Clones repo (or fetches via GitHub API)
   - Runs security analysis via Claude API
   - Stores results in database
   - Returns analysis ID

2. **get-analysis** - Retrieve analysis results
   - Fetches session and issues from database
   - Returns formatted results

#### Analysis Engine Flow
1. Validate GitHub URL
2. Fetch repo metadata via GitHub API
3. Download repo contents (via GitHub API or clone)
4. Run parallel security checks:
   - Scan for hardcoded secrets (regex patterns + AI)
   - Check dependencies for known vulnerabilities
   - Analyze code patterns for SQL injection, XSS
   - Check authentication/authorization patterns
   - Validate security headers in web configs
   - Check CORS configurations
5. Send code samples to Claude API for contextual analysis
6. Calculate weighted security score
7. Store results in database
8. Return dashboard-ready data

### Color System
- **Critical**: Red (#EF4444) - Immediate action required
- **High**: Orange (#F97316) - Should fix before production
- **Medium**: Yellow (#EAB308) - Should address soon
- **Low**: Blue (#3B82F6) - Nice to have
- **Pass**: Green (#10B981) - All good!

### UI/UX Flow
1. **Landing Page**
   - Hero section with animated gradient background
   - Large input box: "Enter GitHub Repository URL"
   - Example repos below
   - Simple tagline: "Security analysis for everyone"

2. **Analysis Progress**
   - Beautiful loading animation
   - Stage indicators:
     - "Fetching repository..."
     - "Analyzing dependencies..."
     - "Scanning for secrets..."
     - "Checking security patterns..."
     - "Generating report..."

3. **Results Dashboard**
   - Top: Security score gauge (0-100)
   - Summary cards: Critical/High/Medium/Low counts
   - Expandable issue list grouped by category
   - Each issue shows:
     - Title
     - Description
     - File location
     - Code snippet
     - Recommendation
     - Severity badge

### Mock UI Elements (Non-Functional in V1)
- **GitHub OAuth button** (visual only)
- **"Generate Fix PR" button** (visual only, show "Coming Soon" tooltip)
- **Export Report button** (visual only)

---

## V2 Features (Future)

### GitHub Integration
- OAuth authentication for private repos
- Access user's repositories list
- Permission scoping

### Auto-Fix Implementation
- Generate fixes for common issues
- Create new branch with fixes
- Open Pull Request on GitHub
- Let user review before merging

### Enhanced Analysis
- Integration with npm audit
- Integration with Snyk API
- GitHub Security API integration
- Custom pattern matchers
- Language-specific analyzers (Python, Java, Go, etc.)

### Reporting
- PDF export
- Historical analysis tracking
- Compliance reports (OWASP Top 10, CWE)
- Team dashboards

### Additional Features
- Scheduled re-scans
- Webhook notifications
- Browser extension
- CI/CD integration
- Slack/Discord notifications

---

## Technical Notes

### Claude API Configuration
- **Current**: Use Haiku 3.5 (cheapest model for MVP)
- **Production TODO**: Switch to Sonnet 4.5 for better analysis quality
- **API Key**: Stored in environment variables (never in code!)

### GitHub API Considerations
- Rate limits: 60 req/hour (unauthenticated), 5000/hour (authenticated)
- For V1: Use unauthenticated for public repos
- For V2: Use OAuth token for higher limits

### Security Best Practices
- Never log or store user's private code
- All API keys in environment variables
- Rate limiting on analysis endpoint
- Input validation for GitHub URLs
- RLS policies on all Supabase tables

---

## Development Phases

### Phase 1: Foundation (Current)
- [ ] Database schema and migrations
- [ ] Landing page design
- [ ] GitHub repo URL input and validation
- [ ] Basic edge function for repo fetching

### Phase 2: Analysis Engine
- [ ] Claude API integration
- [ ] Security pattern detection logic
- [ ] Scoring algorithm implementation
- [ ] Issue categorization system

### Phase 3: Dashboard
- [ ] Results dashboard UI
- [ ] Issue cards and expandable details
- [ ] Security score visualization
- [ ] Progress tracking UI

### Phase 4: Polish
- [ ] Landing page animations
- [ ] Loading states and transitions
- [ ] Error handling and user feedback
- [ ] Performance optimization

---

## Success Metrics
- Analysis completion rate
- Average security score
- User engagement (return visits)
- Time to complete analysis
- User feedback on recommendations

---

## Future Considerations
- Monetization: Free tier + Pro features
- API access for developers
- White-label for enterprises
- Educational content integration
- Community-contributed rules
