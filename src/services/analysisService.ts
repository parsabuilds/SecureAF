import type { AnalysisResult, SecurityIssue, RepoFile } from '../types';

const GITHUB_API = 'https://api.github.com';

export class AnalysisService {
  async analyzeRepository(repoUrl: string): Promise<AnalysisResult> {
    const { owner, repo } = this.parseGitHubUrl(repoUrl);

    const repoData = await this.fetchRepoMetadata(owner, repo);
    const files = await this.fetchRepoContents(owner, repo);
    const issues = await this.performSecurityAnalysis(files, owner, repo);

    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const highCount = issues.filter(i => i.severity === 'high').length;
    const mediumCount = issues.filter(i => i.severity === 'medium').length;
    const lowCount = issues.filter(i => i.severity === 'low').length;

    const securityScore = this.calculateSecurityScore(
      criticalCount,
      highCount,
      mediumCount,
      lowCount
    );

    return {
      repoName: repo,
      repoOwner: owner,
      repoUrl,
      securityScore,
      totalIssues: issues.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      issues,
      analyzedAt: new Date().toISOString(),
    };
  }

  private parseGitHubUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }
    return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
  }

  private async fetchRepoMetadata(owner: string, repo: string) {
    try {
      const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please try again in a few minutes.');
        }
        if (response.status === 404) {
          throw new Error('Repository not found. Please check the URL.');
        }
        throw new Error(`Failed to fetch repository: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  private async fetchRepoContents(owner: string, repo: string): Promise<RepoFile[]> {
    const tree = await this.fetchRepoTree(owner, repo);
    const securityRelevantFiles = tree
      .filter((file: any) => this.isSecurityRelevantFile(file.path))
      .slice(0, 25);

    const contents = await Promise.all(
      securityRelevantFiles.map(async (file: any) => {
        try {
          const response = await fetch(
            `${GITHUB_API}/repos/${owner}/${repo}/contents/${file.path}`,
            {
              headers: {
                'Accept': 'application/vnd.github.v3+json',
              },
            }
          );

          if (!response.ok) return null;

          const data = await response.json();
          if (data.content && data.size < 100000) {
            const content = atob(data.content.replace(/\n/g, ''));
            return { path: file.path, content, size: file.size };
          }
        } catch (e) {
          return null;
        }
        return null;
      })
    );

    return contents.filter((c): c is RepoFile => c !== null);
  }

  private async fetchRepoTree(owner: string, repo: string) {
    try {
      let response = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/git/trees/main?recursive=1`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        response = await fetch(
          `${GITHUB_API}/repos/${owner}/${repo}/git/trees/master?recursive=1`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 403) {
            throw new Error('GitHub API rate limit exceeded. Please try again later.');
          }
          throw new Error('Failed to fetch repository tree. The repository may be empty or private.');
        }
      }

      const data = await response.json();
      return data.tree || [];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error while fetching repository contents.');
    }
  }

  private isSecurityRelevantFile(path: string): boolean {
    const relevantPatterns = [
      /\.(js|ts|jsx|tsx|py|java|go|rb|php|env)$/,
      /package\.json$/,
      /package-lock\.json$/,
      /requirements\.txt$/,
      /Gemfile$/,
      /go\.mod$/,
      /composer\.json$/,
      /\.env/,
      /config/i,
      /auth/i,
      /api/i,
      /server/i,
      /middleware/i,
      /routes/i,
    ];

    return relevantPatterns.some(pattern => pattern.test(path));
  }

  private async performSecurityAnalysis(
    files: RepoFile[],
    owner: string,
    repo: string
  ): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    for (const file of files) {
      const fileIssues = this.scanFileForIssues(file);
      issues.push(...fileIssues);
    }

    return issues;
  }

  private scanFileForIssues(file: RepoFile): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    const content = file.content;
    const lines = content.split('\n');

    const secretPatterns = [
      {
        pattern: /(?:api[_-]?key|apikey|api_key_id)\s*[:=]\s*['"][a-zA-Z0-9_\-]{20,}['"]/gi,
        type: 'API Key',
        severity: 'critical' as const
      },
      {
        pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{6,}['"]/gi,
        type: 'Password',
        severity: 'critical' as const
      },
      {
        pattern: /(?:secret|token|auth[_-]?token)\s*[:=]\s*['"][^'"]{15,}['"]/gi,
        type: 'Secret',
        severity: 'critical' as const
      },
      {
        pattern: /sk-[a-zA-Z0-9]{20,}/g,
        type: 'API Key',
        severity: 'critical' as const
      },
      {
        pattern: /ghp_[a-zA-Z0-9]{36,}/g,
        type: 'GitHub Token',
        severity: 'critical' as const
      },
      {
        pattern: /AKIA[0-9A-Z]{16}/g,
        type: 'AWS Access Key',
        severity: 'critical' as const
      },
    ];

    secretPatterns.forEach(({ pattern, type, severity }) => {
      let match;
      const regex = new RegExp(pattern);
      let searchText = content;
      let offset = 0;

      while ((match = regex.exec(searchText)) !== null) {
        const lineNumber = content.substring(0, offset + match.index).split('\n').length;
        const line = lines[lineNumber - 1] || '';

        issues.push({
          id: `${file.path}-secret-${issues.length}`,
          severity,
          category: 'Exposed Secrets',
          title: `${type} Exposed in Code`,
          description: `Found hardcoded ${type.toLowerCase()} in ${file.path}. Exposed credentials can be discovered and exploited by malicious actors.`,
          filePath: file.path,
          lineNumber,
          codeSnippet: line.trim().substring(0, 100),
          recommendation: `Immediately move this ${type.toLowerCase()} to environment variables (.env file) and add .env to .gitignore. Rotate the exposed credential.`,
        });

        offset += match.index + match[0].length;
        searchText = content.substring(offset);
      }
    });

    const sqlInjectionPatterns = [
      {
        pattern: /(?:execute|query|run)\s*\(\s*['"`].*\$\{.*\}.*['"`]/gi,
        description: 'String interpolation in SQL query'
      },
      {
        pattern: /(?:execute|query|run)\s*\(\s*['"`].*\+.*['"`]/gi,
        description: 'String concatenation in SQL query'
      },
      {
        pattern: /['"`]\s*SELECT\s+.*FROM\s+.*WHERE\s+.*\$\{/gi,
        description: 'Template literal in SQL WHERE clause'
      },
    ];

    sqlInjectionPatterns.forEach(({ pattern, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
          issues.push({
            id: `${file.path}-sql-${issues.length}`,
            severity: 'critical',
            category: 'SQL Injection',
            title: 'Potential SQL Injection Vulnerability',
            description: `${description} detected in ${file.path}. This pattern is vulnerable to SQL injection attacks where attackers can manipulate queries.`,
            filePath: file.path,
            lineNumber,
            codeSnippet: match.substring(0, 100),
            recommendation: 'Use parameterized queries or prepared statements. Never construct SQL queries using string concatenation or template literals with user input.',
          });
        });
      }
    });

    const xssPatterns = [
      {
        pattern: /dangerouslySetInnerHTML|innerHTML\s*=/gi,
        description: 'Direct HTML injection',
        severity: 'high' as const
      },
      {
        pattern: /eval\s*\(/gi,
        description: 'Use of eval() function',
        severity: 'high' as const
      },
    ];

    xssPatterns.forEach(({ pattern, description, severity }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
          issues.push({
            id: `${file.path}-xss-${issues.length}`,
            severity,
            category: 'XSS Vulnerability',
            title: 'Potential Cross-Site Scripting (XSS) Risk',
            description: `${description} found in ${file.path}. This can allow attackers to inject malicious scripts.`,
            filePath: file.path,
            lineNumber,
            codeSnippet: match,
            recommendation: 'Sanitize all user input before rendering. Use safe rendering methods and avoid dangerouslySetInnerHTML or innerHTML with untrusted data.',
          });
        });
      }
    });

    if (/cors\s*\(\s*\{[\s\S]*origin:\s*['"]?\*['"]?/i.test(content)) {
      issues.push({
        id: `${file.path}-cors-${issues.length}`,
        severity: 'high',
        category: 'CORS Misconfiguration',
        title: 'Overly Permissive CORS Policy',
        description: `Wildcard (*) CORS origin detected in ${file.path}. This allows any website to make requests to your API.`,
        filePath: file.path,
        recommendation: 'Specify allowed origins explicitly instead of using "*". Use a whitelist of trusted domains.',
      });
    }

    if (/require\s*\(\s*['"]http['"]\s*\)/.test(content) && !/require\s*\(\s*['"]https['"]\s*\)/.test(content)) {
      issues.push({
        id: `${file.path}-http-${issues.length}`,
        severity: 'medium',
        category: 'Insecure Communication',
        title: 'Insecure HTTP Communication',
        description: `HTTP module usage without HTTPS detected in ${file.path}. Data transmitted over HTTP is not encrypted.`,
        filePath: file.path,
        recommendation: 'Use HTTPS for all network communications to encrypt data in transit. Implement TLS/SSL certificates.',
      });
    }

    if (file.path.includes('package.json')) {
      try {
        const pkg = JSON.parse(content);
        if (pkg.dependencies) {
          const oldPackages = [];
          if (pkg.dependencies['react'] && pkg.dependencies['react'].match(/^[~^]?16\./)) {
            oldPackages.push('React 16');
          }
          if (pkg.dependencies['express'] && pkg.dependencies['express'].match(/^[~^]?3\./)) {
            oldPackages.push('Express 3');
          }

          if (oldPackages.length > 0) {
            issues.push({
              id: `${file.path}-outdated-${issues.length}`,
              severity: 'medium',
              category: 'Outdated Dependencies',
              title: 'Outdated Package Versions Detected',
              description: `Old versions of ${oldPackages.join(', ')} found in ${file.path}. Outdated packages may contain known security vulnerabilities.`,
              filePath: file.path,
              recommendation: 'Update dependencies to their latest stable versions. Run npm audit to check for known vulnerabilities.',
            });
          }
        }
      } catch (e) {
      }
    }

    if (!content.includes('helmet') && (file.path.includes('server') || file.path.includes('app'))) {
      if (content.includes('express()')) {
        issues.push({
          id: `${file.path}-headers-${issues.length}`,
          severity: 'medium',
          category: 'Missing Security Headers',
          title: 'Missing Security Headers Middleware',
          description: `Express server in ${file.path} doesn't appear to use security headers middleware like Helmet.`,
          filePath: file.path,
          recommendation: 'Install and configure helmet middleware to set security headers (CSP, X-Frame-Options, etc.): npm install helmet',
        });
      }
    }

    if (/TODO|FIXME|HACK|XXX/i.test(content)) {
      const todoLines = lines
        .map((line, idx) => ({ line, idx }))
        .filter(({ line }) => /TODO|FIXME|HACK|XXX/i.test(line))
        .slice(0, 2);

      todoLines.forEach(({ line, idx }) => {
        issues.push({
          id: `${file.path}-todo-${issues.length}`,
          severity: 'low',
          category: 'Code Quality',
          title: 'Unresolved TODO/FIXME Comment',
          description: `Found unresolved comment in ${file.path} that may indicate incomplete implementation or known issues.`,
          filePath: file.path,
          lineNumber: idx + 1,
          codeSnippet: line.trim(),
          recommendation: 'Review and resolve TODO/FIXME comments before deploying to production. Ensure all code is complete and tested.',
        });
      });
    }

    return issues;
  }

  private calculateSecurityScore(
    critical: number,
    high: number,
    medium: number,
    low: number
  ): number {
    let score = 100;

    if (critical > 0) {
      score -= 25 * Math.log2(critical + 1);
    }

    if (high > 0) {
      score -= 15 * Math.log2(high + 1);
    }

    if (medium > 0) {
      const mediumPenalty = Math.min(20, 8 * Math.log2(medium + 1));
      score -= mediumPenalty;
    }

    if (low > 0) {
      const lowPenalty = Math.min(10, 4 * Math.log2(low + 1));
      score -= lowPenalty;
    }

    return Math.max(0, Math.round(score));
  }
}

export const analysisService = new AnalysisService();
