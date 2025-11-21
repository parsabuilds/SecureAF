# SecureAF

An AI-powered security analysis tool that scans GitHub repositories for vulnerabilities and automatically generates pull requests with fixes.

## Features

- **Automated Security Scanning** - Analyzes code for common security vulnerabilities including:
  - Hardcoded secrets and API keys
  - SQL injection vulnerabilities
  - XSS (Cross-Site Scripting) risks
  - CORS misconfigurations
  - Outdated dependencies with known CVEs
  - Missing security headers
  - Insecure authentication patterns

- **AI-Powered Fixes** - Uses Claude AI to generate production-ready security fixes
- **One-Click PR Generation** - Automatically creates pull requests with the fixes
- **GitHub Integration** - Connect your GitHub account to access private repositories
- **Real-Time Progress** - Visual feedback during repository analysis
- **Beautiful UI** - Modern, responsive design with smooth animations

## Live Demo

Try it out: [Your deployment URL here]

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- GitHub OAuth App
- Claude API key (from Anthropic)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/secureaf.git
   cd secureaf
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd functions
   npm install
   cd ..
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_FUNCTIONS_URL=https://us-central1-your_project.cloudfunctions.net

   # GitHub OAuth Configuration
   VITE_GITHUB_CLIENT_ID=your_github_oauth_client_id
   VITE_GITHUB_REDIRECT_URI=http://localhost:5173/github/callback
   ```

4. **Set up GitHub OAuth App**

   Follow the guide in [SETUP_GITHUB_OAUTH.md](./SETUP_GITHUB_OAUTH.md)

5. **Configure Firebase Functions secrets**
   ```bash
   firebase functions:secrets:set GITHUB_CLIENT_ID
   firebase functions:secrets:set GITHUB_CLIENT_SECRET
   firebase functions:secrets:set CLAUDE_API_KEY
   ```

6. **Deploy Firebase Functions**
   ```bash
   cd functions
   npm run build
   cd ..
   firebase deploy --only functions
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

   Open http://localhost:5173 in your browser

## How It Works

1. **Enter Repository** - Paste any GitHub repository URL (e.g., `facebook/react`)
2. **Analysis** - The app scans the repository for security vulnerabilities using pattern matching
3. **Review Issues** - Browse detected security issues categorized by severity
4. **Generate Fix** - Click "Generate Fix PR" on any issue to have AI create a secure fix
5. **Create PR** - Review the AI-generated fix and create a pull request with one click

## Architecture

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Firebase SDK** for authentication and functions

### Backend (Firebase Functions)
- **githubOauth** - Handles GitHub OAuth flow
- **generateFix** - Uses Claude AI to generate security fixes
- **createPr** - Creates pull requests on GitHub

### Security Analysis
- Pattern-based vulnerability detection
- No code execution required
- Scans common file types (JS, TS, Python, Go, etc.)
- Checks package.json for vulnerable dependencies

## Deployment

### Deploy to Firebase Hosting

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

### Environment Variables for Production

Update your `.env` with production URLs:
```env
VITE_GITHUB_REDIRECT_URI=https://your-domain.com/github/callback
VITE_FIREBASE_FUNCTIONS_URL=https://us-central1-your_project.cloudfunctions.net
```

## Documentation

- [Setup GitHub OAuth](./SETUP_GITHUB_OAUTH.md) - Configure GitHub OAuth App
- [Deploy Functions](./DEPLOY_FUNCTIONS.md) - Guide for deploying Firebase Functions
- [Deploy Claude Fix](./DEPLOY_CLAUDE_FIX.md) - Fix Claude API integration issues
- [PR Generation Feature](./PR_GENERATION_FEATURE.md) - How PR generation works

## Limitations

- **Public Repositories**: Can scan without authentication
- **Private Repositories**: Requires GitHub OAuth connection
- **Rate Limits**: Subject to GitHub API and Claude API rate limits
- **File Size**: Large files (>1MB) may be skipped during analysis
- **Language Support**: Best results with JavaScript, TypeScript, Python, Go, Java

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Firebase Functions (Node.js)
- **AI**: Claude 4.5 Sonnet (Anthropic)
- **APIs**: GitHub REST API, Claude Messages API
- **Hosting**: Firebase Hosting
- **Authentication**: Firebase Auth + GitHub OAuth

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Security

This tool is designed to help identify security vulnerabilities. However:

- It is not a replacement for professional security audits
- False positives may occur
- Not all vulnerability types are detected
- Always review AI-generated fixes before merging

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation in the `/docs` folder

## Acknowledgments

- Powered by [Claude AI](https://www.anthropic.com/) from Anthropic
- GitHub API for repository access
- Firebase for hosting and serverless functions
