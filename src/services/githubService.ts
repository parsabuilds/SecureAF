const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
}

interface GitHubAuthData {
  access_token: string;
  token_type: string;
  scope: string;
  user: GitHubUser;
}

class GitHubService {
  private accessToken: string | null = null;
  private user: GitHubUser | null = null;

  initiateOAuth(): void {
    const redirectUri = `${window.location.origin}/github/callback`;
    const scope = 'repo';
    const state = Math.random().toString(36).substring(7);

    sessionStorage.setItem('github_oauth_state', state);

    const authUrl = `https://github.com/login/oauth/authorize?` +
      `client_id=${GITHUB_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;

    window.location.href = authUrl;
  }

  async handleCallback(code: string, state: string): Promise<GitHubAuthData> {
    const savedState = sessionStorage.getItem('github_oauth_state');

    if (state !== savedState) {
      throw new Error('Invalid state parameter. Possible CSRF attack.');
    }

    sessionStorage.removeItem('github_oauth_state');

    const response = await fetch(`${SUPABASE_URL}/functions/v1/github-oauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to authenticate with GitHub');
    }

    const data: GitHubAuthData = await response.json();

    this.accessToken = data.access_token;
    this.user = data.user;

    localStorage.setItem('github_token', data.access_token);
    localStorage.setItem('github_user', JSON.stringify(data.user));

    return data;
  }

  loadFromStorage(): boolean {
    const token = localStorage.getItem('github_token');
    const userStr = localStorage.getItem('github_user');

    if (token && userStr) {
      this.accessToken = token;
      this.user = JSON.parse(userStr);
      return true;
    }

    return false;
  }

  logout(): void {
    this.accessToken = null;
    this.user = null;
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_user');
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getUser(): GitHubUser | null {
    return this.user;
  }

  async generateFix(
    issue: any,
    fileContent: string,
    repoContext?: { name: string; language: string; framework?: string }
  ): Promise<any> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-fix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        issue,
        fileContent,
        repoContext,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate fix');
    }

    return await response.json();
  }

  async createPR(
    repoOwner: string,
    repoName: string,
    issue: any,
    fix: any
  ): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with GitHub');
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-pr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        githubToken: this.accessToken,
        repoOwner,
        repoName,
        issue,
        fix,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create pull request');
    }

    return await response.json();
  }

  async fetchFileContent(
    owner: string,
    repo: string,
    path: string,
    branch: string = 'main'
  ): Promise<string> {
    try {
      const headers: any = {
        'Accept': 'application/vnd.github.v3+json',
      };

      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      let response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
        { headers }
      );

      if (!response.ok && branch === 'main') {
        response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=master`,
          { headers }
        );
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.content) {
        return atob(data.content.replace(/\n/g, ''));
      }

      throw new Error('File content not available');
    } catch (error) {
      console.error('Error fetching file content:', error);
      throw error;
    }
  }
}

export const githubService = new GitHubService();
