import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

const githubClientId = defineSecret('GITHUB_CLIENT_ID');
const githubClientSecret = defineSecret('GITHUB_CLIENT_SECRET');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface GitHubOAuthRequest {
  code: string;
}

export const githubOauth = onRequest(
  { secrets: [githubClientId, githubClientSecret] },
  async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.set(corsHeaders);
      res.status(200).send();
      return;
    }

    res.set(corsHeaders);

    try {
      const path = req.path;

      if (path.includes('/callback') && req.method === 'GET') {
        const code = req.query.code as string;

        if (!code) {
          res.status(400).json({ error: 'No code provided' });
          return;
        }

        const clientId = githubClientId.value();
        const clientSecret = githubClientSecret.value();

        if (!clientId || !clientSecret) {
          throw new Error('GitHub OAuth credentials not configured');
        }

        const tokenResponse = await fetch(
          'https://github.com/login/oauth/access_token',
          {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              client_id: clientId,
              client_secret: clientSecret,
              code: code,
            }),
          }
        );

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
          res.status(400).json({
            error: tokenData.error_description || tokenData.error
          });
          return;
        }

        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/json',
          },
        });

        const userData = await userResponse.json();

        res.json({
          access_token: tokenData.access_token,
          token_type: tokenData.token_type,
          scope: tokenData.scope,
          user: {
            login: userData.login,
            id: userData.id,
            avatar_url: userData.avatar_url,
            name: userData.name,
          },
        });
        return;
      }

      if (req.method === 'POST') {
        const { code } = req.body as GitHubOAuthRequest;

        if (!code) {
          res.status(400).json({ error: 'No code provided' });
          return;
        }

        const clientId = githubClientId.value();
        const clientSecret = githubClientSecret.value();

        if (!clientId || !clientSecret) {
          throw new Error('GitHub OAuth credentials not configured');
        }

        const tokenResponse = await fetch(
          'https://github.com/login/oauth/access_token',
          {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              client_id: clientId,
              client_secret: clientSecret,
              code: code,
            }),
          }
        );

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
          res.status(400).json({
            error: tokenData.error_description || tokenData.error
          });
          return;
        }

        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/json',
          },
        });

        const userData = await userResponse.json();

        res.json({
          access_token: tokenData.access_token,
          token_type: tokenData.token_type,
          scope: tokenData.scope,
          user: {
            login: userData.login,
            id: userData.id,
            avatar_url: userData.avatar_url,
            name: userData.name,
          },
        });
        return;
      }

      res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
      console.error('OAuth error:', error);
      res.status(500).json({
        error: error.message || 'Internal server error'
      });
    }
  }
);
