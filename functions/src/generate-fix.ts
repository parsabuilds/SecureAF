import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

const claudeApiKey = defineSecret('CLAUDE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface GenerateFixRequest {
  issue: {
    id: string;
    severity: string;
    category: string;
    title: string;
    description: string;
    filePath?: string;
    lineNumber?: number;
    codeSnippet?: string;
    recommendation: string;
  };
  fileContent: string;
  repoContext?: {
    name: string;
    language: string;
    framework?: string;
  };
}

interface ClaudeResponse {
  fixed_content: string;
  explanation: string;
  confidence: number;
  changes_summary: string[];
}

export const generateFix = onRequest(
  {
    secrets: [claudeApiKey],
    timeoutSeconds: 540,
    memory: '1GiB'
  },
  async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.set(corsHeaders);
      res.status(200).send();
      return;
    }

    res.set(corsHeaders);

    try {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { issue, fileContent, repoContext } = req.body as GenerateFixRequest;

      if (!issue || !fileContent) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const apiKey = claudeApiKey.value();
      if (!apiKey) {
        throw new Error('Claude API key not configured');
      }

      const systemPrompt = `You are an expert security engineer specializing in fixing security vulnerabilities in code. Your task is to analyze security issues and provide precise, production-ready fixes.

CRITICAL RULES:
1. ONLY modify code related to the security issue
2. Maintain all existing functionality
3. Preserve code style and formatting
4. DO NOT add unnecessary comments unless explaining security-critical changes
5. Ensure the fix doesn't introduce new vulnerabilities
6. Return ONLY valid, compilable code

SECURITY ANALYSIS CHECKLIST:
- Input Validation: Check if user inputs are properly sanitized
- Authentication/Authorization: Verify access controls are correct
- SQL Injection: Ensure queries use parameterized statements
- XSS Protection: Check for proper output encoding
- Secrets Management: Verify no hardcoded credentials
- Dependency Security: Check for known vulnerable packages
- CORS Configuration: Ensure proper origin restrictions
- Error Handling: No sensitive data in error messages
- Crypto: Use strong, modern algorithms
- API Security: Proper rate limiting and authentication

You must respond with a JSON object containing:
{
  "fixed_content": "The complete fixed file content",
  "explanation": "A clear explanation of what was fixed and why",
  "confidence": 0.0-1.0 (your confidence in the fix),
  "changes_summary": ["List of specific changes made"]
}`;

      const userPrompt = `
SECURITY ISSUE:
- Severity: ${issue.severity}
- Category: ${issue.category}
- Title: ${issue.title}
- Description: ${issue.description}
- Recommendation: ${issue.recommendation}
${issue.lineNumber ? `- Line Number: ${issue.lineNumber}` : ''}

${repoContext ? `
REPOSITORY CONTEXT:
- Name: ${repoContext.name}
- Language: ${repoContext.language}
${repoContext.framework ? `- Framework: ${repoContext.framework}` : ''}
` : ''}

FILE TO FIX:
${issue.filePath ? `Path: ${issue.filePath}` : ''}

\`\`\`
${fileContent}
\`\`\`

${issue.codeSnippet ? `
PROBLEMATIC CODE SNIPPET:
\`\`\`
${issue.codeSnippet}
\`\`\`
` : ''}

Please analyze this security issue and provide a complete, production-ready fix for the entire file.`;

      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 8000,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        }),
      });

      if (!claudeResponse.ok) {
        const errorData = await claudeResponse.text();
        console.error('Claude API error:', errorData);
        throw new Error(`Claude API error: ${claudeResponse.statusText}`);
      }

      const claudeData = await claudeResponse.json();
      const assistantMessage = claudeData.content[0].text;

      let fixData: ClaudeResponse;
      try {
        const jsonMatch = assistantMessage.match(/```json\n([\s\S]*?)\n```/) ||
                         assistantMessage.match(/```\n([\s\S]*?)\n```/) ||
                         assistantMessage.match(/(\{[\s\S]*\})/);

        if (jsonMatch) {
          fixData = JSON.parse(jsonMatch[1]);
        } else {
          fixData = JSON.parse(assistantMessage);
        }
      } catch (parseError) {
        console.error('Failed to parse Claude response:', assistantMessage);
        throw new Error('Failed to parse AI response. Please try again.');
      }

      if (!fixData.fixed_content || !fixData.explanation) {
        throw new Error('Invalid fix data from AI');
      }

      res.json({
        success: true,
        fix: {
          original_content: fileContent,
          fixed_content: fixData.fixed_content,
          explanation: fixData.explanation,
          confidence: fixData.confidence || 0.8,
          changes_summary: fixData.changes_summary || [],
          issue_id: issue.id,
          file_path: issue.filePath,
        },
      });
    } catch (error: any) {
      console.error('Fix generation error:', error);
      res.status(500).json({
        error: error.message || 'Failed to generate fix',
        details: error.stack
      });
    }
  }
);
